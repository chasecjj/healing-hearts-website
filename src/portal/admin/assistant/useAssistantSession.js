/**
 * useAssistantSession — single-session message state + send/stream actions
 *
 * Fetches GET /api/admin/phedris/sessions/{id}/messages on sessionId change.
 * Provides sendMessage (sync POST) + sendStream (SSE path with sync fallback).
 *
 * SSE fallback: if stream endpoint returns non-2xx, falls back to sendMessage.
 * On double failure, surfaces error message to user.
 *
 * Auth: Bearer token from supabase.auth.getSession().
 *
 * Locked-contract ref: §5.3 useAssistantSession()
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../../lib/supabase';

async function getAccessToken() {
  const { data } = await supabase.auth.getSession();
  return data?.session?.access_token ?? null;
}

export function useAssistantSession(sessionId, onNewSessionCreated) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [rateLimitError, setRateLimitError] = useState(false);
  const abortRef = useRef(null);

  // Fetch message history when sessionId changes
  useEffect(() => {
    if (!sessionId) {
      setMessages([]);
      return;
    }
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = await getAccessToken();
        const res = await fetch(
          `/api/admin/phedris/sessions/${sessionId}/messages`,
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || `HTTP ${res.status}`);
        }
        const data = await res.json();
        if (!cancelled) {
          setMessages(data.messages || []);
        }
      } catch (err) {
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  /**
   * sendMessage — synchronous POST fallback
   * @param {string} text
   * @param {string|undefined} sid — session_id to use (may differ from sessionId on new chat)
   * @returns {Promise<{session_id: string}|null>}
   */
  const sendMessage = useCallback(async (text, sid) => {
    setSending(true);
    setError(null);
    setRateLimitError(false);
    // Optimistic user message
    const optimisticUser = { role: 'user', content: text, timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, optimisticUser]);
    try {
      const token = await getAccessToken();
      const res = await fetch('/api/admin/phedris/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message: text, session_id: sid ?? sessionId ?? undefined }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        if (res.status === 503) {
          setRateLimitError(true);
          // Remove optimistic user message on rate limit
          setMessages((prev) => prev.filter((m) => m !== optimisticUser));
          return null;
        }
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      const assistantMsg = {
        role: 'assistant',
        content: data.message,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      return { session_id: data.session_id };
    } catch (err) {
      setError(err);
      setMessages((prev) => prev.filter((m) => m !== optimisticUser));
      return null;
    } finally {
      setSending(false);
    }
  }, [sessionId]);

  /**
   * sendStream — SSE path; falls back to sendMessage on non-2xx stream response.
   * @param {string} text
   */
  const sendStream = useCallback(async (text) => {
    if (streaming || sending) return;
    setStreaming(true);
    setStreamingText('');
    setError(null);
    setRateLimitError(false);

    // Abort previous stream if any
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    // Optimistic user message
    const optimisticUser = { role: 'user', content: text, timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, optimisticUser]);

    try {
      const token = await getAccessToken();
      const res = await fetch('/api/admin/phedris/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message: text, session_id: sessionId ?? undefined }),
        signal: controller.signal,
      });

      if (!res.ok) {
        // SSE endpoint returned error — fall back to sync POST
        setStreaming(false);
        setStreamingText('');
        if (res.status === 503) {
          setRateLimitError(true);
          setMessages((prev) => prev.filter((m) => m !== optimisticUser));
          return;
        }
        // Fallback: try sync POST (§5.3 fallback logic)
        const syncResult = await sendMessage(text, sessionId);
        if (syncResult?.session_id && syncResult.session_id !== sessionId) {
          onNewSessionCreated?.(syncResult.session_id);
        }
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop(); // keep incomplete line in buffer

        for (const line of lines) {
          if (!line.startsWith('data:')) continue;
          const payload = line.slice(5).trim();
          if (payload === '[DONE]') break;
          try {
            const parsed = JSON.parse(payload);
            if (parsed.type === 'token') {
              accumulated += parsed.text;
              setStreamingText(accumulated);
            } else if (parsed.type === 'done') {
              const fullText = parsed.full_text ?? accumulated;
              const assistantMsg = {
                role: 'assistant',
                content: fullText,
                timestamp: new Date().toISOString(),
              };
              setMessages((prev) => [...prev, assistantMsg]);
              setStreamingText('');
              setStreaming(false);
              // If a new session was created (no sessionId before), notify parent
              if (parsed.session_id && parsed.session_id !== sessionId) {
                sessionStorage.setItem('assistant_session_id', parsed.session_id);
                onNewSessionCreated?.(parsed.session_id);
              }
              return;
            }
          } catch {
            // Ignore malformed SSE lines
          }
        }
      }

      // Stream ended without done event — treat accumulated as final
      if (accumulated) {
        const assistantMsg = {
          role: 'assistant',
          content: accumulated,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        // Intentional abort, no error
      } else {
        // Stream failed — try sync POST fallback
        setStreaming(false);
        setStreamingText('');
        setMessages((prev) => prev.filter((m) => m !== optimisticUser));
        const syncResult = await sendMessage(text, sessionId);
        if (syncResult?.session_id && syncResult.session_id !== sessionId) {
          onNewSessionCreated?.(syncResult.session_id);
        }
        return;
      }
    } finally {
      setStreaming(false);
      setStreamingText('');
    }
  }, [sessionId, streaming, sending, sendMessage, onNewSessionCreated]);

  return {
    messages,
    loading,
    error,
    sending,
    streaming,
    streamingText,
    rateLimitError,
    sendMessage,
    sendStream,
  };
}
