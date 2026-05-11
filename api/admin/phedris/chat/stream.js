/**
 * POST /api/admin/phedris/chat/stream
 *
 * SSE streaming proxy. Pipes the text/event-stream response from Phedris
 * back to the browser via Node.js write() + for-await loop.
 *
 * Set maxDuration = 120 for Vercel Pro plan (§A3).
 * On Hobby plan the 30-second limit applies; Gemini calls are 2–8s normally.
 *
 * Auth: Bearer token (admin role required).
 *
 * Locked-contract ref: §4 Function 4
 */

export const config = {
  runtime: 'nodejs',
  maxDuration: 120, // Pro plan only; ignored on Hobby (30s cap applies)
};

import {
  extractBearerToken,
  getUserFromBearer,
  userHasAnyRole,
} from '../../../_lib/admin-helpers.js';

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
    console.error('[phedris/chat/stream] PHEDRIS_API_URL not set');
    return res.status(500).json({ error: 'internal_error', reason: 'missing_env' });
  }

  const upstreamBody = {
    message,
    ...(body.session_id ? { session_id: body.session_id } : {}),
    ...(body.hub_id ? { hub_id: body.hub_id } : {}),
  };

  // ─── Initiate upstream SSE ───────────────────────────────────────────────
  let upstreamRes;
  try {
    upstreamRes = await fetch(`${phedrisBase}/api/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.PHEDRIS_SERVICE_KEY || '',
        'X-Phedris-On-Behalf-Of': user.email,
      },
      body: JSON.stringify(upstreamBody),
    });
  } catch (err) {
    console.error('[phedris/chat/stream] upstream fetch error:', err.message);
    return res.status(502).json({ error: 'upstream_error' });
  }

  if (!upstreamRes.ok) {
    const errBody = await upstreamRes.text().catch(() => '');
    console.error(`[phedris/chat/stream] upstream ${upstreamRes.status}: ${errBody}`);

    if (upstreamRes.status === 503) {
      return res.status(503).json({ error: 'thinking_lock_held' });
    }
    if (upstreamRes.status === 504 || upstreamRes.status === 408) {
      return res.status(504).json({ error: 'upstream_timeout' });
    }
    return res.status(502).json({ error: 'upstream_error', status: upstreamRes.status });
  }

  // ─── Pipe SSE stream to browser ─────────────────────────────────────────
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering if behind a proxy

  try {
    for await (const chunk of upstreamRes.body) {
      if (res.writableEnded) break;
      res.write(chunk);
    }
  } catch (err) {
    // Client disconnected or upstream error mid-stream — log and end gracefully
    console.error('[phedris/chat/stream] pipe error:', err.message);
  } finally {
    if (!res.writableEnded) res.end();
  }
}
