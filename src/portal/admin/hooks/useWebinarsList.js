/**
 * useWebinarsList — one-time fetch hook for /admin/webinars list view.
 *
 * Spec: portal-admin-completion-v1 wave-3.1 S1 spec §7.
 * Pattern: useCourseData-style internal state + fetch on filter change.
 *
 * `statusFilter` is applied client-side because the DB `status` column
 * (scheduled/live/completed/evergreen) doesn't map 1:1 to the UI chip
 * vocabulary (upcoming/past). The partition by `starts_at` vs Date.now()
 * is the canonical UI semantic per spec §4 column 3.
 */

import { useState, useEffect, useMemo } from 'react';
import { listWebinars } from '../api/webinarsApi';

export default function useWebinarsList({ statusFilter = 'all', dateRange = null } = {}) {
  const [allWebinars, setAllWebinars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Serialize dateRange so useEffect deps work cleanly
  const dateRangeKey = dateRange ? `${dateRange.from || ''}::${dateRange.to || ''}` : '';

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const rows = await listWebinars({ statusFilter: 'all', dateRange });
        if (cancelled) return;
        setAllWebinars(rows);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        console.error('[useWebinarsList] failed to load:', err.message);
        setError(err.message || 'Failed to load webinars');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRangeKey]);

  const webinars = useMemo(() => {
    if (statusFilter === 'all') return allWebinars;
    const now = Date.now();
    if (statusFilter === 'upcoming') {
      return allWebinars.filter((w) => {
        const t = w.starts_at ? new Date(w.starts_at).getTime() : 0;
        return t >= now && w.status !== 'cancelled';
      });
    }
    if (statusFilter === 'past') {
      return allWebinars.filter((w) => {
        const t = w.starts_at ? new Date(w.starts_at).getTime() : 0;
        return t < now;
      });
    }
    return allWebinars;
  }, [allWebinars, statusFilter]);

  return { webinars, loading, error };
}
