/**
 * useEnrollmentsList — one-time fetch hook for /admin/enrollments list view.
 *
 * Spec: portal-admin-completion-v1 wave-3.2 S2 spec §3.2.
 * Pattern: matches useWebinarsList — internal state + fetch on filter change,
 * client-side derivation for utm filter (utm lives on orders.metadata, not
 * enrollments, so server-side filtering would require a multi-table join).
 *
 * Learner email/name resolution: lazy + batched per UID via admin_resolve_user
 * RPC. Rows display a placeholder until the resolver returns; failures fall
 * back to the raw uuid prefix.
 */

import { useState, useEffect, useMemo } from 'react';
import {
  listEnrollments,
  listCourses,
  resolveLearner,
  listOrdersForUser,
} from '../api/enrollmentsApi';

export default function useEnrollmentsList({
  courseFilter = null,
  statusFilter = 'all',
  grantSourceFilter = 'all',
  utmFilter = null,
} = {}) {
  const [rawRows, setRawRows] = useState([]);
  const [courses, setCourses] = useState([]);
  const [learners, setLearners] = useState({}); // user_id → { email, display_name }
  const [orderUtmByUser, setOrderUtmByUser] = useState({}); // user_id → utm_source (most recent order)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Serialize filter inputs for useEffect deps
  const courseFilterKey = courseFilter || '';
  const grantSourceKey = grantSourceFilter || 'all';
  const statusKey = statusFilter || 'all';

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const [rows, courseRows] = await Promise.all([
          listEnrollments({
            courseFilter,
            statusFilter,
            grantSourceFilter,
          }),
          listCourses(),
        ]);
        if (cancelled) return;
        setRawRows(rows);
        setCourses(courseRows);
        setError(null);

        // Resolve unique learner UIDs in parallel. Failures fall back to null
        // so the UI can show the uuid prefix.
        const uniqueUserIds = Array.from(
          new Set((rows || []).map((r) => r.user_id).filter(Boolean))
        );

        if (uniqueUserIds.length > 0) {
          const resolutions = await Promise.all(
            uniqueUserIds.map(async (uid) => {
              try {
                const r = await resolveLearner(uid);
                return [uid, r];
              } catch (err) {
                console.error('[useEnrollmentsList] resolve failed:', uid, err.message);
                return [uid, null];
              }
            })
          );
          if (cancelled) return;
          const learnerMap = {};
          resolutions.forEach(([uid, r]) => {
            if (r) learnerMap[uid] = r;
          });
          setLearners(learnerMap);

          // Pull orders for each user to derive utm_source. Limit fan-out by
          // fetching only when the utm filter is active OR when count is small;
          // we always fetch here for column display, but it's bounded by the
          // unique-user-id count which equals the table-row count at most.
          const orderResolutions = await Promise.all(
            uniqueUserIds.map(async (uid) => {
              try {
                const orders = await listOrdersForUser(uid);
                // pick most recent order's utm_source (orders are sorted DESC).
                const utm = orders.find((o) => o?.metadata?.utm_source)?.metadata?.utm_source || null;
                return [uid, utm];
              } catch (err) {
                console.error('[useEnrollmentsList] orders fetch failed:', uid, err.message);
                return [uid, null];
              }
            })
          );
          if (cancelled) return;
          const utmMap = {};
          orderResolutions.forEach(([uid, utm]) => {
            utmMap[uid] = utm;
          });
          setOrderUtmByUser(utmMap);
        } else {
          setLearners({});
          setOrderUtmByUser({});
        }
      } catch (err) {
        if (cancelled) return;
        console.error('[useEnrollmentsList] failed to load:', err.message);
        setError(err.message || 'Failed to load enrollments');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseFilterKey, statusKey, grantSourceKey]);

  // Client-side enrichment + utm filter
  const enrollments = useMemo(() => {
    const enriched = (rawRows || []).map((row) => {
      const learner = learners[row.user_id] || null;
      const utm_source = orderUtmByUser[row.user_id] || null;
      const grant_source = row.stripe_payment_id ? 'stripe' : 'admin-grant';
      return { ...row, learner, utm_source, grant_source };
    });

    if (utmFilter) {
      return enriched.filter((r) => r.utm_source === utmFilter);
    }
    return enriched;
  }, [rawRows, learners, orderUtmByUser, utmFilter]);

  return { enrollments, courses, loading, error };
}
