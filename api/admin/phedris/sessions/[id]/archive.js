/**
 * POST /api/admin/phedris/sessions/[id]/archive
 *
 * Sets archived_at on the Phedris conversation. Returns 204.
 * Idempotent: 404 from Phedris is treated as success (already gone).
 * Writes HH-side audit row.
 *
 * Auth: Bearer token (admin role required).
 *
 * Locked-contract ref: §4 Function 6
 */

import { supabaseAdmin } from '../../../../_lib/supabase-admin.js';
import {
  extractBearerToken,
  getUserFromBearer,
  userHasAnyRole,
} from '../../../../_lib/admin-helpers.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  // ─── Auth ────────────────────────────────────────────────────────────────
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

  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: 'bad_request', reason: 'missing_id' });
  }

  const phedrisBase = process.env.PHEDRIS_API_URL;
  if (!phedrisBase) {
    console.error('[phedris/sessions/[id]/archive] PHEDRIS_API_URL not set');
    return res.status(500).json({ error: 'internal_error', reason: 'missing_env' });
  }

  try {
    const upstream = await fetch(
      `${phedrisBase}/api/sessions/${id}/archive`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': process.env.PHEDRIS_SERVICE_KEY || '',
          'X-Phedris-On-Behalf-Of': user.email,
        },
      }
    );

    // 204 = success, 404 = already gone → treat as idempotent success
    if (!upstream.ok && upstream.status !== 404) {
      const errBody = await upstream.text().catch(() => '');
      console.error(`[phedris/sessions/[id]/archive] upstream ${upstream.status}: ${errBody}`);
      return res.status(502).json({ error: 'upstream_error', status: upstream.status });
    }

    // HH-side audit row
    await supabaseAdmin.from('admin_action_audit').insert({
      actor_id: user.id,
      action_type: 'phedris_archive_session',
      target_table: 'phedris_conversations',
      target_id: id,
      payload: null,
    });

    return res.status(204).end();
  } catch (err) {
    console.error('[phedris/sessions/[id]/archive] unexpected error:', err.message);
    return res.status(500).json({ error: 'internal_error' });
  }
}
