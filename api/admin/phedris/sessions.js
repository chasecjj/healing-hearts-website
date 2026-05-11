/**
 * GET /api/admin/phedris/sessions
 *
 * Lists Phedris conversation sessions for the authenticated admin user.
 * Wraps the Phedris GET /api/sessions response in { sessions: [...] }.
 *
 * Auth: Bearer token (admin role required).
 * Forwards: X-API-Key + X-Phedris-On-Behalf-Of headers to Phedris.
 *
 * Locked-contract ref: §4 Function 1
 */

import {
  extractBearerToken,
  getUserFromBearer,
  userHasAnyRole,
} from '../../_lib/admin-helpers.js';

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

  // ─── Forward to Phedris ──────────────────────────────────────────────────
  const phedrisBase = process.env.PHEDRIS_API_URL;
  if (!phedrisBase) {
    console.error('[phedris/sessions] PHEDRIS_API_URL not set');
    return res.status(500).json({ error: 'internal_error', reason: 'missing_env' });
  }

  const limit = Math.min(
    Math.max(1, parseInt(req.query?.limit ?? '20', 10) || 20),
    100
  );

  try {
    const upstream = await fetch(
      `${phedrisBase}/api/sessions?limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'X-API-Key': process.env.PHEDRIS_SERVICE_KEY || '',
          'X-Phedris-On-Behalf-Of': user.email,
        },
      }
    );

    if (!upstream.ok) {
      const body = await upstream.text().catch(() => '');
      console.error(`[phedris/sessions] upstream ${upstream.status}: ${body}`);
      return res.status(502).json({
        error: 'upstream_error',
        status: upstream.status,
      });
    }

    const data = await upstream.json();
    // Phedris returns array directly; wrap in { sessions: [...] }
    const sessions = Array.isArray(data) ? data : (data.sessions ?? []);
    return res.status(200).json({ sessions });
  } catch (err) {
    console.error('[phedris/sessions] unexpected error:', err.message);
    return res.status(500).json({ error: 'internal_error' });
  }
}
