/**
 * PATCH  /api/admin/phedris/sessions/[id]  — rename session (sets title)
 * DELETE /api/admin/phedris/sessions/[id]  — hard-delete session + cascade messages
 *
 * Both methods require admin role. Mutation methods write HH-side audit rows.
 *
 * Locked-contract ref: §4 Function 5 (PATCH) + Function 7 (DELETE)
 */

import { supabaseAdmin } from '../../../_lib/supabase-admin.js';
import {
  extractBearerToken,
  getUserFromBearer,
  userHasAnyRole,
} from '../../../_lib/admin-helpers.js';

export default async function handler(req, res) {
  if (req.method !== 'PATCH' && req.method !== 'DELETE') {
    res.setHeader('Allow', 'PATCH, DELETE');
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
    console.error('[phedris/sessions/[id]] PHEDRIS_API_URL not set');
    return res.status(500).json({ error: 'internal_error', reason: 'missing_env' });
  }

  const phedrisHeaders = {
    'Content-Type': 'application/json',
    'X-API-Key': process.env.PHEDRIS_SERVICE_KEY || '',
    'X-Phedris-On-Behalf-Of': user.email,
  };

  // ─── PATCH — rename ──────────────────────────────────────────────────────
  if (req.method === 'PATCH') {
    const body = req.body || {};
    const title = typeof body.title === 'string' ? body.title : null;

    try {
      const upstream = await fetch(`${phedrisBase}/api/sessions/${id}`, {
        method: 'PATCH',
        headers: phedrisHeaders,
        body: JSON.stringify({ title }),
      });

      if (!upstream.ok) {
        const errBody = await upstream.text().catch(() => '');
        console.error(`[phedris/sessions/[id]] PATCH upstream ${upstream.status}: ${errBody}`);
        if (upstream.status === 404) {
          return res.status(404).json({ error: 'not_found' });
        }
        return res.status(502).json({ error: 'upstream_error', status: upstream.status });
      }

      const data = await upstream.json();

      // HH-side audit row
      await supabaseAdmin.from('admin_action_audit').insert({
        actor_id: user.id,
        action_type: 'phedris_rename_session',
        target_table: 'phedris_conversations',
        target_id: id,
        payload: { title },
      });

      return res.status(200).json(data);
    } catch (err) {
      console.error('[phedris/sessions/[id]] PATCH error:', err.message);
      return res.status(500).json({ error: 'internal_error' });
    }
  }

  // ─── DELETE — hard-delete ────────────────────────────────────────────────
  if (req.method === 'DELETE') {
    try {
      const upstream = await fetch(`${phedrisBase}/api/sessions/${id}`, {
        method: 'DELETE',
        headers: phedrisHeaders,
      });

      if (!upstream.ok && upstream.status !== 404) {
        const errBody = await upstream.text().catch(() => '');
        console.error(`[phedris/sessions/[id]] DELETE upstream ${upstream.status}: ${errBody}`);
        return res.status(502).json({ error: 'upstream_error', status: upstream.status });
      }

      // HH-side audit row
      await supabaseAdmin.from('admin_action_audit').insert({
        actor_id: user.id,
        action_type: 'phedris_delete_session',
        target_table: 'phedris_conversations',
        target_id: id,
        payload: null,
      });

      return res.status(204).end();
    } catch (err) {
      console.error('[phedris/sessions/[id]] DELETE error:', err.message);
      return res.status(500).json({ error: 'internal_error' });
    }
  }
}
