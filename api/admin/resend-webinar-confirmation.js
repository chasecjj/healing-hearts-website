// POST /api/admin/resend-webinar-confirmation
//
// Wave 3.2 Phase 1 backend-data route. Re-sends the webinar confirmation
// email for a registration and writes an admin audit row.
//
// Auth: admin OR coach. Coach is allowed because migration 037 Part 8 grants
// coach SELECT on webinar_registrations and the broader RBAC matrix allows
// coach involvement in webinar follow-ups.
//
// NOT idempotent by design — every call sends an email. Each call writes a
// distinct admin_action_audit row so the audit log captures rate-limit signal.
//
// Reuses the existing webinarConfirmationEmail template at
// api/_emails/webinar-confirmation.js (same template used by the initial
// signup path; no duplicate "reminder" body required).

import { Resend } from 'resend';
import { supabaseAdmin } from '../_lib/supabase-admin.js';
import {
  extractBearerToken,
  getUserFromBearer,
  userHasAnyRole,
} from '../_lib/admin-helpers.js';
import { webinarConfirmationEmail } from '../_emails/webinar-confirmation.js';

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

  const allowed = await userHasAnyRole(user.id, ['admin', 'coach']);
  if (!allowed) {
    return res.status(403).json({ error: 'forbidden', reason: 'requires_admin_or_coach' });
  }

  // ─── 2. Validate body ───────────────────────────────────────────────────
  const body = req.body || {};
  const { reg_id } = body;

  if (!isUuid(reg_id)) {
    return res.status(400).json({ error: 'bad_request', field: 'reg_id' });
  }

  // ─── 3. Resend SDK availability ─────────────────────────────────────────
  // Fail loud (per CLAUDE.md no-silent-fail policy) when the SDK isn't
  // configured — sending an email is the entire purpose of this endpoint.
  if (!process.env.RESEND_API_KEY) {
    console.error('[resend-webinar-confirmation] RESEND_API_KEY not configured');
    return res.status(500).json({ error: 'email_not_configured' });
  }

  const actorId = user.id;

  try {
    // ─── 4. Fetch registration + joined webinar row ───────────────────────
    // Service-role bypasses RLS. Migration 037 Part 8 also enables coach
    // SELECT under regular RLS, so the data path here matches the auth gate.
    const { data: reg, error: regErr } = await supabaseAdmin
      .from('webinar_registrations')
      .select('id, name, email, webinar_id, unsubscribed')
      .eq('id', reg_id)
      .maybeSingle();

    if (regErr) {
      console.error('[resend-webinar-confirmation] registration lookup failed:', regErr.message);
      return res.status(500).json({ error: 'internal_error', stage: 'registration_lookup' });
    }

    if (!reg) {
      return res.status(400).json({ error: 'bad_request', reason: 'registration_not_found' });
    }

    if (reg.unsubscribed) {
      // Do not email an unsubscribed contact under any circumstance.
      return res.status(400).json({ error: 'bad_request', reason: 'unsubscribed' });
    }

    const { data: webinar, error: webinarErr } = await supabaseAdmin
      .from('webinars')
      .select('id, title, starts_at, duration_minutes, riverside_audience_url')
      .eq('id', reg.webinar_id)
      .maybeSingle();

    if (webinarErr) {
      console.error('[resend-webinar-confirmation] webinar lookup failed:', webinarErr.message);
      return res.status(500).json({ error: 'internal_error', stage: 'webinar_lookup' });
    }

    if (!webinar) {
      return res.status(500).json({ error: 'internal_error', reason: 'webinar_missing' });
    }

    // ─── 5. Render + send email via Resend ────────────────────────────────
    const { subject, html } = webinarConfirmationEmail(reg.name, webinar, reg.email);

    const resend = new Resend(process.env.RESEND_API_KEY);
    const sendResult = await resend.emails.send({
      from: 'Healing Hearts <hello@healingheartscourse.com>',
      to: reg.email,
      subject,
      html,
    });

    // Resend SDK returns { data, error } — error shape is preserved here.
    if (sendResult?.error) {
      console.error('[resend-webinar-confirmation] Resend send failed:', sendResult.error);
      return res.status(500).json({ error: 'email_send_failed' });
    }

    // ─── 6. Audit row (direct INSERT via service-role) ────────────────────
    // No SECURITY DEFINER RPC for resend_confirmation in migration 037 — write
    // straight into admin_action_audit (service-role bypasses RLS).
    const { data: auditRow, error: auditErr } = await supabaseAdmin
      .from('admin_action_audit')
      .insert({
        actor_id: actorId,
        action_type: 'resend_confirmation',
        target_table: 'webinar_registrations',
        target_id: reg_id,
        payload: {
          email: reg.email,
          webinar_id: reg.webinar_id,
          webinar_title: webinar.title,
          resend_message_id: sendResult?.data?.id || null,
        },
      })
      .select('id')
      .single();

    if (auditErr) {
      // Email already sent — log loud but report 500 so caller knows the
      // audit trail is incomplete. Per no-silent-fail policy.
      console.error('[resend-webinar-confirmation] CRITICAL: audit insert failed after email send:', auditErr.message);
      return res.status(500).json({
        error: 'audit_write_failed',
        email_sent: true,
      });
    }

    return res.status(200).json({
      status: 'sent',
      audit_id: auditRow.id,
      email: reg.email,
    });
  } catch (err) {
    console.error('[resend-webinar-confirmation] unexpected error:', err.message);
    return res.status(500).json({ error: 'internal_error' });
  }
}
