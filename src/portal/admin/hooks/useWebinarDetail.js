/**
 * useWebinarDetail — fetch hook for /admin/webinars/:id detail view.
 *
 * Spec: portal-admin-completion-v1 wave-3.1 S1 spec §7.
 * Pattern: useCourseData-style internal state. Parallel fetch of webinar +
 * registrations + audit rows on mount. Optimistic revoke with revert.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getWebinar,
  listWebinarRegistrations,
  listAuditRows,
  revokeRegistration as apiRevokeRegistration,
} from '../api/webinarsApi';

export default function useWebinarDetail(id, actorId) {
  const [webinar, setWebinar] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [auditRows, setAuditRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAll = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [webinarData, regsData] = await Promise.all([
        getWebinar(id),
        listWebinarRegistrations(id),
      ]);

      setWebinar(webinarData);
      setRegistrations(regsData);

      // Audit rows scoped to the registrations of this webinar
      const regIds = (regsData || []).map((r) => r.id);
      if (regIds.length > 0) {
        try {
          const audit = await listAuditRows('webinar_registrations', regIds);
          setAuditRows(audit);
        } catch (auditErr) {
          // Non-fatal: detail view still works without audit
          console.error('[useWebinarDetail] audit fetch failed:', auditErr.message);
          setAuditRows([]);
        }
      } else {
        setAuditRows([]);
      }

      setError(null);
    } catch (err) {
      console.error('[useWebinarDetail] failed to load:', err.message);
      setError(err.message || 'Failed to load webinar detail');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    loadAll().catch(() => { /* error already captured */ });
    return () => { cancelled = true; };
  }, [loadAll]);

  const revokeRegistration = useCallback(
    async (regId) => {
      const prev = registrations;
      // Optimistic: drop the row immediately
      setRegistrations((rows) => rows.filter((r) => r.id !== regId));
      try {
        await apiRevokeRegistration(regId, actorId);
        // Refresh audit trail to capture the new row
        try {
          const remainingIds = prev.map((r) => r.id);
          if (remainingIds.length > 0) {
            const audit = await listAuditRows('webinar_registrations', remainingIds);
            setAuditRows(audit);
          }
        } catch (auditErr) {
          console.error('[useWebinarDetail] audit refresh failed:', auditErr.message);
        }
        return { status: 'ok' };
      } catch (err) {
        // Revert on failure
        console.error('[useWebinarDetail] revoke failed; reverting:', err.message);
        setRegistrations(prev);
        setError(err.message || 'Revoke failed');
        return { status: 'error', error: err.message };
      }
    },
    [registrations, actorId]
  );

  return {
    webinar,
    registrations,
    auditRows,
    loading,
    error,
    revokeRegistration,
    refetch: loadAll,
  };
}
