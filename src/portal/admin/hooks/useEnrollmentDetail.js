/**
 * useEnrollmentDetail — fetch hook for /admin/enrollments/:id detail view.
 *
 * Spec: portal-admin-completion-v1 wave-3.2 S2 spec §3.2.
 * Pattern: matches useWebinarDetail — internal state, parallel fetch on mount,
 * optimistic destructive actions with revert.
 *
 * Loads:
 *   - enrollment row + course join
 *   - learner identity via admin_resolve_user RPC
 *   - orders for the same auth user (stripe_payment_id linkage)
 *   - admin_action_audit rows scoped to enrollment_id
 *
 * Mutations:
 *   - revoke: optimistic status='revoked', revert on failure
 *   - grantReplay: server roundtrip; re-fetches audit + orders after success
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getEnrollment,
  resolveLearner,
  listOrdersForUser,
  listAuditRows,
  revokeEnrollment as apiRevokeEnrollment,
  grantReplay as apiGrantReplay,
} from '../api/enrollmentsApi';

export default function useEnrollmentDetail(id, actorId) {
  const [enrollment, setEnrollment] = useState(null);
  const [learner, setLearner] = useState(null);
  const [orders, setOrders] = useState([]);
  const [auditRows, setAuditRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionState, setActionState] = useState({ revoke: 'idle', replay: 'idle' });

  const loadAll = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const enrollmentData = await getEnrollment(id);
      setEnrollment(enrollmentData);

      const userId = enrollmentData?.user_id;

      // Parallel fetch of secondary data
      const [learnerData, orderRows, audit] = await Promise.all([
        userId
          ? resolveLearner(userId).catch((err) => {
              console.error('[useEnrollmentDetail] resolveLearner failed:', err.message);
              return null;
            })
          : Promise.resolve(null),
        userId
          ? listOrdersForUser(userId).catch((err) => {
              console.error('[useEnrollmentDetail] orders fetch failed:', err.message);
              return [];
            })
          : Promise.resolve([]),
        listAuditRows('enrollments', [id]).catch((err) => {
          console.error('[useEnrollmentDetail] audit fetch failed:', err.message);
          return [];
        }),
      ]);

      setLearner(learnerData);
      setOrders(orderRows);
      setAuditRows(audit);
      setError(null);
    } catch (err) {
      console.error('[useEnrollmentDetail] failed to load:', err.message);
      setError(err.message || 'Failed to load enrollment detail');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadAll().catch(() => { /* error already captured */ });
  }, [loadAll]);

  const revokeEnrollment = useCallback(async () => {
    if (!enrollment) return { status: 'error', error: 'no_enrollment' };
    const prev = enrollment;
    setActionState((s) => ({ ...s, revoke: 'pending' }));
    // Optimistic: flip status to 'revoked'
    setEnrollment({ ...enrollment, status: 'revoked' });
    try {
      await apiRevokeEnrollment(enrollment.id, actorId);
      // Refresh audit to capture the new row
      try {
        const audit = await listAuditRows('enrollments', [enrollment.id]);
        setAuditRows(audit);
      } catch (auditErr) {
        console.error('[useEnrollmentDetail] audit refresh failed:', auditErr.message);
      }
      setActionState((s) => ({ ...s, revoke: 'done' }));
      return { status: 'ok' };
    } catch (err) {
      console.error('[useEnrollmentDetail] revoke failed; reverting:', err.message);
      setEnrollment(prev);
      setError(err.message || 'Revoke failed');
      setActionState((s) => ({ ...s, revoke: 'error' }));
      return { status: 'error', error: err.message };
    }
  }, [enrollment, actorId]);

  const grantReplay = useCallback(async () => {
    if (!enrollment) return { status: 'error', error: 'no_enrollment' };
    setActionState((s) => ({ ...s, replay: 'pending' }));
    try {
      const result = await apiGrantReplay(enrollment.user_id, enrollment.course_id);
      // Refresh audit + the enrollment row itself in case status changed
      try {
        const [audit, refreshed] = await Promise.all([
          listAuditRows('enrollments', [enrollment.id]),
          getEnrollment(enrollment.id).catch(() => null),
        ]);
        setAuditRows(audit);
        if (refreshed) setEnrollment(refreshed);
      } catch (refreshErr) {
        console.error('[useEnrollmentDetail] post-replay refresh failed:', refreshErr.message);
      }
      setActionState((s) => ({ ...s, replay: 'done' }));
      return { status: 'ok', payload: result };
    } catch (err) {
      console.error('[useEnrollmentDetail] grant-replay failed:', err.message);
      setError(err.message || 'Grant replay failed');
      setActionState((s) => ({ ...s, replay: 'error' }));
      return { status: 'error', error: err.message };
    }
  }, [enrollment]);

  return {
    enrollment,
    learner,
    orders,
    auditRows,
    loading,
    error,
    actionState,
    revokeEnrollment,
    grantReplay,
    refetch: loadAll,
  };
}
