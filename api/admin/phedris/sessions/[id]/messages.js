/**
 * GET /api/admin/phedris/sessions/[id]/messages
 *
 * Returns message history for a single Phedris conversation session.
 * Wraps Phedris GET /api/sessions/{id}/messages in { messages: [...] }.
 *
 * Auth: Bearer token (admin role required).
 *
 * Locked-contract ref: §4 Function 2
 */

import {
  extractBearerToken,
  getUserFromBearer,
  userHasAnyRole,
} from '../../../../_lib/admin-helpers.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
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
    console.error('[phedris/sessions/[id]/messages] PHEDRIS_API_URL not set');
    return res.status(500).json({ error: 'internal_error', reason: 'missing_env' });
  }

  try {
    const upstream = await fetch(
      `${phedrisBase}/api/sessions/${id}/messages`,
      {
        method: 'GET',
        headers: {
          'X-API-Key': process.env.PHEDRIS_SERVICE_KEY || '',
          'X-Phedris-On-Behalf-Of': user.email,
        },
      }
    );

    if (!upstream.ok) {
      const errBody = await upstream.text().catch(() => '');
      console.error(`[phedris/sessions/[id]/messages] upstream ${upstream.status}: ${errBody}`);
      if (upstream.status === 404) {
        return res.status(404).json({ error: 'not_found' });
      }
      return res.status(502).json({ error: 'upstream_error', status: upstream.status });
    }

    const data = await upstream.json();
    // Phedris may return array directly or { messages: [...] }
    const messages = Array.isArray(data) ? data : (data.messages ?? []);
    return res.status(200).json({ messages });
  } catch (err) {
    console.error('[phedris/sessions/[id]/messages] unexpected error:', err.message);
    return res.status(500).json({ error: 'internal_error' });
  }
}
