/**
 * useBroadcastsList — one-time fetch hook for /admin/broadcasts list view.
 *
 * Spec: portal-admin-completion-v1 wave-3.2 S3 spec §3.3.
 * Pattern: matches useWebinarsList — internal state + fetch on filter change.
 *
 * Status filter and search are passed to the backend route (server-side
 * filter on status post-aggregation; ilike on broadcast_id for search). This
 * keeps payload sizes bounded as broadcast_sends grows.
 */

import { useState, useEffect } from 'react';
import { listBroadcasts } from '../api/broadcastsApi';

export default function useBroadcastsList({ statusFilter = 'all', searchQuery = '' } = {}) {
  const [broadcasts, setBroadcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const rows = await listBroadcasts({ statusFilter, searchQuery });
        if (cancelled) return;
        setBroadcasts(rows);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        console.error('[useBroadcastsList] failed to load:', err.message);
        setError(err.message || 'Failed to load broadcasts');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [statusFilter, searchQuery]);

  return { broadcasts, loading, error };
}
