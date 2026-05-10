// POST /api/admin/grant-replay
//
// Wave 3.2 Phase 1 backend-data route. Re-grants an enrollment for a
// (user_id, course_id) pair and writes an immutable admin audit row.
//
// Auth: Bearer token of a signed-in admin user. user_profiles.role='admin'
// (or 'admin' in user_profiles.roles[]) is required. Service-role direct
// invocation is NOT supported on this route — admin identity is part of the
// audit row, so the actor MUST be a real authenticated user.
//
// Reuses Phase 3.5 enrollment-grant normalization via the
// collectEnrollmentGrants() shim in api/_lib/admin-helpers.js (which
// mirrors api/webhooks/stripe.js:846).
//
// Idempotency: if an enrollment already exists with status='active' for
// the (user_id, course_id) pair, returns 'already_active' WITHOUT writing
// an audit row (prevents audit-log spam from accidental UI double-clicks).

import { supabaseAdmin } from '../_lib/supabase-admin.js';
import {
  collectEnrollmentGrants,
  extractBearerToken,
  getUserFromBearer,
  userHasAnyRole,
} from '../_lib/admin-helpers.js';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(s) {
  return typeof s === 'string' && UUID_RE.test(s);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  // ─── 1. Auth ────────────────────────────────────────────────────────────
  const token = extractBearerToken(req);
  if (!token) {
    return res.status(401).json({ error: 'unauthorized', reason: 'missing_bearer' });
  }

  const user = await getUserFromBearer(token);
  if (!user) {
    return res.status(401).json({ error: 'unauthorized', reason: 'invalid_token' });
  }

  const isAdmin = await userHasAnyRole(user.id, ['admin']);
  if (!isAdmin) {
    return res.status(403).json({ error: 'forbidden', reason: 'requires_admin' });
  }

  // ─── 2. Validate body ───────────────────────────────────────────────────
  const body = req.body || {};
  const { user_id, course_id } = body;

  if (!isUuid(user_id)) {
    return res.status(400).json({ error: 'bad_request', field: 'user_id' });
  }
  if (!isUuid(course_id)) {
    return res.status(400).json({ error: 'bad_request', field: 'course_id' });
  }

  const actorId = user.id;

  try {
    // ─── 3. Idempotency check — already-active enrollment? ────────────────
    const { data: existing, error: existingErr } = await supabaseAdmin
      .from('enrollments')
      .select('id, status')
      .eq('user_id', user_id)
      .eq('course_id', course_id)
      .maybeSingle();

    if (existingErr) {
      console.error('[grant-replay] enrollment lookup failed:', existingErr.message);
      return res.status(500).json({ error: 'internal_error', stage: 'lookup' });
    }

    if (existing && existing.status === 'active') {
      // Skip audit row — Wave 3.2 spec ("return 'already_active' without writing audit row").
      return res.status(200).json({
        status: 'already_active',
        enrollments_affected: 0,
        audit_id: null,
      });
    }

    // ─── 4. Resolve product/access_grants for this course ─────────────────
    // Strategy: find an active product whose access_grants reference course_id.
    // Single-grant shape:  access_grants->>'course_id' = $1
    // Multi-grant shape:   access_grants->'grants' contains [{course_id: $1}]
    //
    // If no product matches (orphan course / coupon-only / legacy grant),
    // fall back to a direct single-row grant so admins are never blocked.
    const { data: products, error: productsErr } = await supabaseAdmin
      .from('products')
      .select('slug, access_grants')
      .eq('is_active', true);

    if (productsErr) {
      console.error('[grant-replay] products lookup failed:', productsErr.message);
      return res.status(500).json({ error: 'internal_error', stage: 'products_lookup' });
    }

    let matchedProductSlug = null;
    let grants = [];
    for (const p of products || []) {
      const candidate = collectEnrollmentGrants(p.access_grants);
      if (candidate.some((g) => g.course_id === course_id)) {
        matchedProductSlug = p.slug;
        grants = candidate;
        break;
      }
    }

    // Fallback when no product matches: single direct grant.
    if (grants.length === 0) {
      grants = [{ course_id }];
    }

    // ─── 5. UPSERT enrollment rows via service-role (bypasses RLS) ───────
    // Pattern mirrors api/webhooks/stripe.js:248-259 (Phase 3.5 enrollment grant).
    const upsertRows = grants.map((g) => ({
      user_id,
      course_id: g.course_id,
      status: 'active',
      // No stripe_payment_id — this is an admin manual replay, not a Stripe event.
    }));

    const { data: upserted, error: upsertErr } = await supabaseAdmin
      .from('enrollments')
      .upsert(upsertRows, { onConflict: 'user_id,course_id' })
      .select('id, course_id');

    if (upsertErr) {
      console.error('[grant-replay] enrollment upsert failed:', upsertErr.message);
      return res.status(500).json({ error: 'internal_error', stage: 'enrollment_upsert' });
    }

    // ─── 6. Audit row via SECURITY DEFINER RPC ────────────────────────────
    const auditPayload = {
      requested_course_id: course_id,
      matched_product_slug: matchedProductSlug,
      grants: grants.map((g) => g.course_id),
      enrollments_affected: (upserted || []).length,
      fallback: matchedProductSlug === null,
    };

    const { data: auditId, error: auditErr } = await supabaseAdmin.rpc(
      'admin_grant_replay_audit',
      {
        p_user_id: user_id,
        p_course_id: course_id,
        p_actor_id: actorId,
        p_payload: auditPayload,
      }
    );

    if (auditErr) {
      // Audit write failed AFTER enrollment was granted — log loud but DO NOT
      // roll back the enrollment (it's the user-facing primary effect). Caller
      // gets 500 so they can re-investigate, but the grant stands.
      console.error('[grant-replay] CRITICAL: audit RPC failed after enrollment grant:', auditErr.message);
      return res.status(500).json({
        error: 'audit_write_failed',
        enrollments_affected: (upserted || []).length,
      });
    }

    return res.status(200).json({
      status: 'replayed',
      enrollments_affected: (upserted || []).length,
      audit_id: auditId,
      matched_product_slug: matchedProductSlug,
    });
  } catch (err) {
    console.error('[grant-replay] unexpected error:', err.message);
    return res.status(500).json({ error: 'internal_error' });
  }
}
