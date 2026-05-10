/**
 * useBroadcastDetail — fetch hook for /admin/broadcasts/:broadcast_id detail view.
 *
 * Spec: portal-admin-completion-v1 wave-3.2 S3 spec §3.3.
 * Pattern: matches useWebinarDetail / useEnrollmentDetail — internal state,
 * parallel fetch on mount, optimistic cancel with revert on failure.
 *
 * Loads:
 *   - aggregated broadcast row via /api/admin/list-broadcasts (single)
 *   - recipient rows via /api/admin/list-broadcasts (mode=recipients)
 *   - admin_action_audit rows scoped by payload->>'broadcast_id'
 *
 * Mutations:
 *   - cancelBroadcast: optimistic status='cancelled' + flips recipient rows;
 *     reverts both on failure.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getBroadcast,
  listBroadcastRecipients,
  listAuditRows,
  cancelBroadcast as apiCancelBroadcast,
} from '../api/broadcastsApi';

export default function useBroadcastDetail(broadcast_id, actorId) {
  const [broadcast, setBroadcast] = useState(null);
  const [recipients, setRecipients] = useState([]);
  const [auditRows, setAuditRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionState, setActionState] = useState({ cancel: 'idle' });

  const loadAll = useCallback(async () => {
    if (!broadcast_id) return;
    setLoading(true);
    try {
      const [bcast, recs, audit] = await Promise.all([
        getBroadcast(broadcast_id),
        listBroadcastRecipients(broadcast_id),
        listAuditRows(broadcast_id).catch((err) => {
          console.error('[useBroadcastDetail] audit fetch failed:', err.message);
          return [];
        }),
      ]);

      setBroadcast(bcast);
      setRecipients(recs);
      setAuditRows(audit);
      setError(null);
    } catch (err) {
      console.error('[useBroadcastDetail] failed to load:', err.message);
      setError(err.message || 'Failed to load broadcast detail');
    } finally {
      setLoading(false);
    }
  }, [broadcast_id]);

  useEffect(() => {
    loadAll().catch(() => { /* error already captured */ });
  }, [loadAll]);

  const cancelBroadcast = useCallback(async () => {
    if (!broadcast || !broadcast_id) return { status: 'error', error: 'no_broadcast' };
    const prevBroadcast = broadcast;
    const prevRecipients = recipients;
    setActionState((s) => ({ ...s, cancel: 'pending' }));
    // Optimistic: flip aggregate status + flip every non-cancelled recipient row.
    setBroadcast({ ...broadcast, status: 'cancelled' });
    setRecipients((rows) =>
      rows.map((r) => (r.status === 'cancelled' ? r : { ...r, status: 'cancelled' }))
    );
    try {
      await apiCancelBroadcast(broadcast_id, actorId);
      // Refresh audit + recipients to capture canonical state
      try {
        const [audit, recs] = await Promise.all([
          listAuditRows(broadcast_id),
          listBroadcastRecipients(broadcast_id).catch(() => prevRecipients),
        ]);
        setAuditRows(audit);
        setRecipients(recs);
      } catch (refreshErr) {
        console.error('[useBroadcastDetail] post-cancel refresh failed:', refreshErr.message);
      }
      setActionState((s) => ({ ...s, cancel: 'done' }));
      return { status: 'ok' };
    } catch (err) {
      console.error('[useBroadcastDetail] cancel failed; reverting:', err.message);
      setBroadcast(prevBroadcast);
      setRecipients(prevRecipients);
      setError(err.message || 'Cancel failed');
      setActionState((s) => ({ ...s, cancel: 'error' }));
      return { status: 'error', error: err.message };
    }
  }, [broadcast, broadcast_id, recipients, actorId]);

  return {
    broadcast,
    recipients,
    auditRows,
    loading,
    error,
    actionState,
    cancelBroadcast,
    refetch: loadAll,
  };
}
