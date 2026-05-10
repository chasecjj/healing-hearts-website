// POST /api/admin/list-broadcasts
//
// Wave 3.2 Phase 4 (S3) backend-data route. Service-role-backed aggregation
// query over broadcast_sends. The table's RLS today is service_role-only for
// SELECT (migration 025); admin SELECT policy was NOT added in migration 037.
// As a result, a client-side admin/sales-cs query would return zero rows.
//
// This route fans out the read via supabaseAdmin and returns:
//   - a list of grouped broadcasts (default: aggregated rows)
//   - a single grouped broadcast (when broadcast_id is supplied)
//   - the raw recipient rows for one broadcast (when mode='recipients')
//
// Auth: Bearer token of a signed-in admin OR sales-cs user (per RBAC §8 +
// roleSectionAccess.js). Service-role direct invocation is NOT supported —
// the read identity is not part of an audit row but the route still requires
// a real authenticated caller (defense-in-depth + Bearer-only convention).
//
// Aggregation strategy: in-memory grouping after a single SELECT * (broadcast_sends
// is small + indexed on broadcast_id; per-row grouping in JS is simpler than
// PostgREST hacks for GROUP BY without an SQL view). Status is derived via
// MIN() so cancelled < failed < scheduled < sent (lexicographic) — any
// cancelled row promotes the whole broadcast to "cancelled".

import { supabaseAdmin } from '../_lib/supabase-admin.js';
import {
  extractBearerToken,
  getUserFromBearer,
  userHasAnyRole,
} from '../_lib/admin-helpers.js';

function groupBroadcasts(rows) {
  // Build a map: broadcast_id → { status, recipients, first_sent, last_sent }
  const byId = new Map();
  for (const row of rows || []) {
    const bid = row.broadcast_id;
    if (!bid) continue;
    const sentAt = row.sent_at || null;
    const status = row.status || 'sent';

    let agg = byId.get(bid);
    if (!agg) {
      agg = {
        broadcast_id: bid,
        status,
        recipients: 0,
        first_sent: sentAt,
        last_sent: sentAt,
      };
      byId.set(bid, agg);
    }
    agg.recipients += 1;
    // MIN(status) lexicographically: cancelled < failed < scheduled < sent
    if (status < agg.status) agg.status = status;
    // first_sent = MIN(sent_at), last_sent = MAX(sent_at), with nulls allowed.
    if (sentAt) {
      if (!agg.first_sent || sentAt < agg.first_sent) agg.first_sent = sentAt;
      if (!agg.last_sent || sentAt > agg.last_sent) agg.last_sent = sentAt;
    }
  }

  // Sort: scheduled (no first_sent or first_sent in future) to top, then DESC by first_sent.
  // Practical rule: rows with first_sent === null bubble to top, others sort DESC by first_sent.
  const grouped = Array.from(byId.values());
  grouped.sort((a, b) => {
    if (!a.first_sent && b.first_sent) return -1;
    if (a.first_sent && !b.first_sent) return 1;
    if (!a.first_sent && !b.first_sent) {
      return a.broadcast_id.localeCompare(b.broadcast_id);
    }
    return b.first_sent.localeCompare(a.first_sent);
  });
  return grouped;
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

  const isAuthorized = await userHasAnyRole(user.id, ['admin', 'sales-cs']);
  if (!isAuthorized) {
    return res.status(403).json({ error: 'forbidden', reason: 'requires_admin_or_sales_cs' });
  }

  // ─── 2. Parse body ──────────────────────────────────────────────────────
  const body = req.body || {};
  const mode = typeof body.mode === 'string' ? body.mode : 'list';
  const broadcastId = typeof body.broadcast_id === 'string' ? body.broadcast_id.trim() : null;
  const statusFilter = typeof body.statusFilter === 'string' ? body.statusFilter : 'all';
  const searchQuery = typeof body.searchQuery === 'string' ? body.searchQuery.trim() : '';

  try {
    // ─── 3. Recipients mode — return raw rows for a single broadcast ──────
    if (mode === 'recipients') {
      if (!broadcastId) {
        return res.status(400).json({ error: 'bad_request', field: 'broadcast_id' });
      }
      const { data, error } = await supabaseAdmin
        .from('broadcast_sends')
        .select('id, broadcast_id, email, sent_at, status')
        .eq('broadcast_id', broadcastId)
        .order('sent_at', { ascending: false });
      if (error) {
        console.error('[list-broadcasts] recipients query failed:', error.message);
        return res.status(500).json({ error: 'internal_error', stage: 'recipients_query' });
      }
      return res.status(200).json({ recipients: data || [] });
    }

    // ─── 4. Default list mode (or single-broadcast detail mode) ───────────
    let query = supabaseAdmin
      .from('broadcast_sends')
      .select('id, broadcast_id, email, sent_at, status');

    if (broadcastId) {
      query = query.eq('broadcast_id', broadcastId);
    }
    if (searchQuery) {
      // ilike substring match on broadcast_id; bounded by service-role read.
      query = query.ilike('broadcast_id', `%${searchQuery}%`);
    }

    const { data: rows, error } = await query;
    if (error) {
      console.error('[list-broadcasts] aggregate query failed:', error.message);
      return res.status(500).json({ error: 'internal_error', stage: 'aggregate_query' });
    }

    let grouped = groupBroadcasts(rows);

    if (statusFilter && statusFilter !== 'all') {
      grouped = grouped.filter((g) => g.status === statusFilter);
    }

    if (broadcastId) {
      const single = grouped[0] || null;
      return res.status(200).json({ broadcast: single });
    }

    return res.status(200).json({ broadcasts: grouped });
  } catch (err) {
    console.error('[list-broadcasts] unexpected error:', err.message);
    return res.status(500).json({ error: 'internal_error' });
  }
}
