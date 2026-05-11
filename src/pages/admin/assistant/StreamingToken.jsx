/**
 * StreamingToken — logic-only component for SSE event handling.
 *
 * When `active` becomes true, opens a fetch POST with ReadableStream reader
 * (NOT EventSource — because EventSource only supports GET).
 * Parses `data: {...}` SSE lines and calls onToken / onDone / onError.
 *
 * Returns null from render (no DOM output).
 *
 * Auth: Bearer token from supabase.auth.getSession().
 *
 * Locked-contract ref: §5.2 <StreamingToken>
 */

import { useEffect, useRef } from 'react';
import { supabase } from '../../../lib/supabase';

async function getAccessToken() {
  const { data } = await supabase.auth.getSession();
  return data?.session?.access_token ?? null;
}

export default function StreamingToken({ url, body, onToken, onDone, onError, active }) {
  const abortRef = useRef(null);

  useEffect(() => {
    if (!active) return;

    let cancelled = false;
    const controller = new AbortController();
    abortRef.current = controller;

    (async () => {
      try {
        const token = await getAccessToken();
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        if (!res.ok) {
          if (!cancelled) onError?.(new Error(`HTTP ${res.status}`));
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = '';
        let buf = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          const lines = buf.split('\n');
          buf = lines.pop();

          for (const line of lines) {
            if (!line.startsWith('data:')) continue;
            const payload = line.slice(5).trim();
            if (payload === '[DONE]') break;
            try {
              const parsed = JSON.parse(payload);
              if (cancelled) return;
              if (parsed.type === 'token') {
                accumulated += parsed.text;
                onToken?.(parsed.text, accumulated);
              } else if (parsed.type === 'done') {
                onDone?.(parsed);
                return;
              }
            } catch {
              // Ignore malformed SSE lines
            }
          }
        }

        // Stream closed without done event
        if (!cancelled && accumulated) {
          onDone?.({ full_text: accumulated, session_id: body.session_id, hub_id: null, tool_calls: [] });
        }
      } catch (err) {
        if (err.name === 'AbortError') return;
        if (!cancelled) onError?.(err);
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return null;
}
