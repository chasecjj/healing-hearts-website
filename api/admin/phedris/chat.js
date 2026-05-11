/**
 * POST /api/admin/phedris/chat
 *
 * Synchronous chat proxy. Forwards message to Phedris POST /api/chat
 * and returns the assistant response.
 *
 * user_id is NOT forwarded from the browser — Phedris derives identity
 * from X-Phedris-On-Behalf-Of header (§A5 resolution).
 *
 * Auth: Bearer token (admin role required).
 *
 * Locked-contract ref: §4 Function 3
 */

import {
  extractBearerToken,
  getUserFromBearer,
  userHasAnyRole,
} from '../../_lib/admin-helpers.js';

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

  // ─── Validate body ───────────────────────────────────────────────────────
  const body = req.body || {};
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  if (!message || message.length > 5000) {
    return res.status(400).json({
      error: 'bad_request',
      reason: 'message must be 1–5000 chars',
    });
  }

  const phedrisBase = process.env.PHEDRIS_API_URL;
  if (!phedrisBase) {
    console.error('[phedris/chat] PHEDRIS_API_URL not set');
    return res.status(500).json({ error: 'internal_error', reason: 'missing_env' });
  }

  // Build upstream body — omit user_id per §A5; Phedris shim resolves from header
  const upstreamBody = {
    message,
    ...(body.session_id ? { session_id: body.session_id } : {}),
    ...(body.hub_id ? { hub_id: body.hub_id } : {}),
  };

  try {
    const upstream = await fetch(`${phedrisBase}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.PHEDRIS_SERVICE_KEY || '',
        'X-Phedris-On-Behalf-Of': user.email,
      },
      body: JSON.stringify(upstreamBody),
    });

    if (!upstream.ok) {
      const errBody = await upstream.text().catch(() => '');
      console.error(`[phedris/chat] upstream ${upstream.status}: ${errBody}`);

      if (upstream.status === 503) {
        return res.status(503).json({ error: 'thinking_lock_held' });
      }
      if (upstream.status === 504 || upstream.status === 408) {
        return res.status(504).json({ error: 'upstream_timeout' });
      }
      return res.status(502).json({ error: 'upstream_error', status: upstream.status });
    }

    const data = await upstream.json();
    return res.status(200).json({
      session_id: data.session_id ?? null,
      message: data.message ?? data.response ?? '',
      hub_id: data.hub_id ?? null,
      tool_calls: data.tool_calls ?? [],
    });
  } catch (err) {
    console.error('[phedris/chat] unexpected error:', err.message);
    return res.status(500).json({ error: 'internal_error' });
  }
}
