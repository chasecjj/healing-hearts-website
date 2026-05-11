/**
 * useAssistantSessions — session list state + optimistic mutations
 *
 * Fetches GET /api/admin/phedris/sessions on mount.
 * Provides optimistic rename / archive / delete with revert-on-error.
 *
 * Auth: Bearer token from supabase.auth.getSession().
 *
 * Locked-contract ref: §5.3 useAssistantSessions()
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../../lib/supabase';

async function getAccessToken() {
  const { data } = await supabase.auth.getSession();
  return data?.session?.access_token ?? null;
}

export function useAssistantSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Keep a ref to latest sessions for revert purposes
  const sessionsRef = useRef(sessions);
  sessionsRef.current = sessions;

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getAccessToken();
      const res = await fetch('/api/admin/phedris/sessions?limit=100', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      // Filter archived sessions out by default
      const active = (data.sessions || []).filter((s) => !s.archived_at);
      setSessions(active);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  /**
   * renameSession — optimistic PATCH; reverts on server error.
   * @param {string} id
   * @param {string} title
   */
  const renameSession = useCallback(async (id, title) => {
    const prior = sessionsRef.current;
    setSessions((prev) =>
      prev.map((s) => (s.session_id === id ? { ...s, title } : s))
    );
    try {
      const token = await getAccessToken();
      const res = await fetch(`/api/admin/phedris/sessions/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }
    } catch (err) {
      setSessions(prior);
      setError(err);
    }
  }, []);

  /**
   * archiveSession — optimistic remove from list; reverts on server error.
   * @param {string} id
   */
  const archiveSession = useCallback(async (id) => {
    const prior = sessionsRef.current;
    setSessions((prev) => prev.filter((s) => s.session_id !== id));
    try {
      const token = await getAccessToken();
      const res = await fetch(`/api/admin/phedris/sessions/${id}/archive`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok && res.status !== 404) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }
    } catch (err) {
      setSessions(prior);
      setError(err);
    }
  }, []);

  /**
   * deleteSession — optimistic remove from list; reverts on server error.
   * @param {string} id
   */
  const deleteSession = useCallback(async (id) => {
    const prior = sessionsRef.current;
    setSessions((prev) => prev.filter((s) => s.session_id !== id));
    try {
      const token = await getAccessToken();
      const res = await fetch(`/api/admin/phedris/sessions/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok && res.status !== 404) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }
    } catch (err) {
      setSessions(prior);
      setError(err);
    }
  }, []);

  return {
    sessions,
    loading,
    error,
    refresh: fetchSessions,
    renameSession,
    archiveSession,
    deleteSession,
  };
}
