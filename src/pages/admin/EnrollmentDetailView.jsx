/**
 * EnrollmentDetailView — /admin/enrollments/:id detail view.
 *
 * Spec: portal-admin-completion-v1 wave-3.2 S2 §3.2 detail-view contract.
 * Wave 3.2 Phase 3 deliverable.
 *
 * - Header: learner email + name (via admin_resolve_user) + course title + status chip
 * - Joined data: enrollment + orders (auth_user_id linkage) + audit rows
 * - Per-row actions:
 *     Revoke enrollment (InlineConfirm-gated; admin_revoke_enrollment RPC)
 *     Grant replay     (InlineConfirm-gated; POST /api/admin/grant-replay)
 * - Audit trail panel (collapsed) — last 10 admin_action_audit rows
 * - Needs-replay informational badge (G-08) for pre-Phase-3.5 anomalies
 *   Heuristic: enrolled_at < 2026-04-15 (Phase 3.5 hardening cutoff per
 *   CLAUDE.md Phase Status table) AND no linked order with status='paid'
 *   for this user_id. Purely informational — no auto-retry.
 */

import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import usePageMeta from '../../hooks/usePageMeta';
import useEnrollmentDetail from '../../portal/admin/hooks/useEnrollmentDetail';
import InlineConfirm from '../../portal/components/InlineConfirm';
import { getTypeStyle } from '../../portal/design/typography';

// Phase 3.5 webhook hardening cutoff per HealingHeartsWebsite/CLAUDE.md.
// Enrollments created BEFORE this date are candidates for the 17 failed-
// webhook replay backlog. Surfaced as an informational badge only.
const PHASE_35_CUTOFF_ISO = '2026-04-15T00:00:00Z';

function formatDateTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  });
}

function formatAmount(cents, currency) {
  if (cents == null) return '—';
  const value = (Number(cents) / 100).toFixed(2);
  const code = (currency || 'usd').toUpperCase();
  return `${value} ${code}`;
}

function StatusChip({ status }) {
  const tone = {
    active: { bg: 'rgba(21, 128, 61, 0.10)', color: 'var(--pt-success)' },
    revoked: { bg: 'rgba(185, 28, 28, 0.10)', color: 'var(--pt-danger)' },
    expired: { bg: 'var(--pt-elevation-2)', color: 'var(--pt-text-muted)' },
    refunded: { bg: 'rgba(180, 83, 9, 0.10)', color: 'var(--pt-warning)' },
  }[status] || { bg: 'var(--pt-elevation-2)', color: 'var(--pt-text-muted)' };

  return (
    <span
      style={{
        ...getTypeStyle('meta', 'medium'),
        display: 'inline-block',
        padding: '2px 10px',
        borderRadius: '9999px',
        backgroundColor: tone.bg,
        color: tone.color,
        textTransform: 'capitalize',
      }}
    >
      {status || '—'}
    </span>
  );
}

export default function EnrollmentDetailView() {
  const { id } = useParams();
  const { user } = useAuth();
  usePageMeta('Enrollment — Admin', 'Healing Hearts enrollment detail.');

  const {
    enrollment,
    learner,
    orders,
    auditRows,
    loading,
    error,
    actionState,
    revokeEnrollment,
    grantReplay,
  } = useEnrollmentDetail(id, user?.id);

  const [confirming, setConfirming] = useState(null); // 'revoke' | 'replay' | null
  const [actionNote, setActionNote] = useState('');

  // Needs-replay heuristic (G-08 surface; informational only):
  // enrolled before Phase 3.5 cutoff AND no orders with status='paid' for the user.
  const needsReplay = useMemo(() => {
    if (!enrollment?.enrolled_at) return false;
    const enrolledTs = new Date(enrollment.enrolled_at).getTime();
    const cutoffTs = new Date(PHASE_35_CUTOFF_ISO).getTime();
    if (!Number.isFinite(enrolledTs) || enrolledTs >= cutoffTs) return false;
    const hasPaidOrder = (orders || []).some((o) => o?.status === 'paid');
    return !hasPaidOrder;
  }, [enrollment, orders]);

  async function handleRevoke() {
    setActionNote('');
    const result = await revokeEnrollment();
    if (result.status === 'ok') {
      setActionNote('Enrollment revoked.');
    } else {
      setActionNote(`Revoke failed: ${result.error || 'unknown'}`);
    }
  }

  async function handleReplay() {
    setActionNote('');
    const result = await grantReplay();
    if (result.status === 'ok') {
      const affected = result?.payload?.enrollments_affected;
      const status = result?.payload?.status;
      if (status === 'already_active') {
        setActionNote('Already active — no audit row written.');
      } else {
        setActionNote(`Grant replayed${typeof affected === 'number' ? ` (${affected} row${affected === 1 ? '' : 's'})` : ''}.`);
      }
    } else {
      setActionNote(`Replay failed: ${result.error || 'unknown'}`);
    }
  }

  const learnerEmail = learner?.email || (enrollment?.user_id ? `${String(enrollment.user_id).slice(0, 8)}…` : '—');
  const learnerName = learner?.display_name && learner.display_name !== learner?.email ? learner.display_name : null;

  return (
    <div
      className="w-full min-h-screen"
      style={{ backgroundColor: 'var(--pt-content-bg)' }}
    >
      <div className="max-w-6xl mx-auto px-6 pt-10 pb-24">
        <Link
          to="/admin/enrollments"
          className="inline-flex items-center gap-2 mb-6"
          style={{
            ...getTypeStyle('meta'),
            color: 'var(--pt-text-muted)',
            textDecoration: 'none',
          }}
        >
          <ArrowLeft className="w-4 h-4" />
          Enrollments
        </Link>

        {loading && (
          <p style={{ ...getTypeStyle('body'), color: 'var(--pt-text-muted)' }} role="status">
            Loading enrollment…
          </p>
        )}

        {error && (
          <div
            role="alert"
            className="rounded-lg p-4 mb-4"
            style={{
              border: '1px solid var(--pt-border-subtle)',
              backgroundColor: 'var(--pt-elevation-1)',
              color: 'var(--pt-danger)',
            }}
          >
            {error}
          </div>
        )}

        {enrollment && (
          <>
            <header className="mb-6">
              <p
                style={{
                  ...getTypeStyle('meta', 'semibold'),
                  textTransform: 'uppercase',
                  letterSpacing: '0.18em',
                  color: 'var(--pt-text-muted)',
                  marginBottom: 6,
                }}
              >
                Admin › Enrollments › Detail
              </p>
              <div className="flex flex-wrap items-baseline gap-4">
                <h1
                  style={{
                    ...getTypeStyle('heading-1'),
                    color: 'var(--pt-text-primary)',
                    margin: 0,
                  }}
                >
                  {learnerEmail}
                </h1>
                <StatusChip status={enrollment.status} />
                {needsReplay ? (
                  <span
                    title="Pre-Phase-3.5 enrollment with no paid order on file — candidate for the 17 failed-webhook replay backlog. Informational only."
                    style={{
                      ...getTypeStyle('meta', 'medium'),
                      display: 'inline-block',
                      padding: '2px 10px',
                      borderRadius: '9999px',
                      backgroundColor: 'rgba(180, 83, 9, 0.10)',
                      color: 'var(--pt-warning)',
                    }}
                  >
                    needs-replay candidate
                  </span>
                ) : null}
              </div>
              <p
                style={{
                  ...getTypeStyle('body'),
                  color: 'var(--pt-text-muted)',
                  marginTop: 8,
                }}
              >
                {enrollment.courses?.title || '(no course)'}
                {learnerName ? ` · ${learnerName}` : ''}
                {' · enrolled '}{formatDateTime(enrollment.enrolled_at)}
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                {confirming === 'revoke' ? (
                  <InlineConfirm
                    message="Revoke this enrollment? The learner will lose course access."
                    onConfirm={async () => {
                      setConfirming(null);
                      await handleRevoke();
                    }}
                    onCancel={() => setConfirming(null)}
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirming('revoke')}
                    disabled={enrollment.status === 'revoked' || actionState.revoke === 'pending'}
                    style={{
                      ...getTypeStyle('meta', 'medium'),
                      padding: '4px 12px',
                      borderRadius: 6,
                      border: '1px solid var(--pt-border-subtle)',
                      backgroundColor: 'transparent',
                      color: enrollment.status === 'revoked' ? 'var(--pt-text-muted)' : 'var(--pt-danger)',
                      cursor: enrollment.status === 'revoked' ? 'not-allowed' : 'pointer',
                      opacity: enrollment.status === 'revoked' ? 0.5 : 1,
                    }}
                  >
                    Revoke enrollment
                  </button>
                )}
                {confirming === 'replay' ? (
                  <InlineConfirm
                    message="Re-grant this enrollment? Replays the original product access-grants for this user + course."
                    onConfirm={async () => {
                      setConfirming(null);
                      await handleReplay();
                    }}
                    onCancel={() => setConfirming(null)}
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirming('replay')}
                    disabled={actionState.replay === 'pending'}
                    style={{
                      ...getTypeStyle('meta', 'medium'),
                      padding: '4px 12px',
                      borderRadius: 6,
                      border: '1px solid var(--pt-border-subtle)',
                      backgroundColor: 'transparent',
                      color: 'var(--pt-text-primary)',
                      cursor: actionState.replay === 'pending' ? 'not-allowed' : 'pointer',
                      opacity: actionState.replay === 'pending' ? 0.5 : 1,
                    }}
                  >
                    Grant replay
                  </button>
                )}
                {actionNote ? (
                  <span style={{ ...getTypeStyle('meta'), color: 'var(--pt-text-muted)', alignSelf: 'center' }}>
                    {actionNote}
                  </span>
                ) : null}
              </div>
            </header>

            <section className="mb-6">
              <h2
                style={{
                  ...getTypeStyle('heading-2'),
                  color: 'var(--pt-text-primary)',
                  marginBottom: 10,
                }}
              >
                Orders
              </h2>
              <div
                className="overflow-x-auto rounded-lg"
                style={{
                  border: '1px solid var(--pt-border-subtle)',
                  backgroundColor: 'var(--pt-elevation-1)',
                }}
              >
                <table
                  role="table"
                  aria-label="Orders for this learner"
                  className="w-full border-collapse text-left tabular-nums"
                >
                  <thead
                    style={{
                      backgroundColor: 'var(--pt-elevation-1)',
                      borderBottom: '1px solid var(--pt-border-subtle)',
                    }}
                  >
                    <tr style={{ height: 40 }}>
                      {['Product', 'Amount', 'Status', 'UTM source', 'Stripe session', 'Created'].map((label) => (
                        <th
                          key={label}
                          scope="col"
                          className="px-3 text-xs font-medium uppercase tracking-wide"
                          style={{
                            color: 'var(--pt-text-muted)',
                            borderBottom: '1px solid var(--pt-border-subtle)',
                            textAlign: 'left',
                          }}
                        >
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-3 py-6 text-center"
                          style={{ color: 'var(--pt-text-muted)' }}
                        >
                          No linked orders. Likely admin-grant or coupon enrollment.
                        </td>
                      </tr>
                    ) : (
                      orders.map((order) => (
                        <tr
                          key={order.id}
                          style={{
                            height: 44,
                            borderBottom: '1px solid var(--pt-border-subtle)',
                            verticalAlign: 'middle',
                          }}
                        >
                          <td className="px-3 py-2 text-sm" style={{ color: 'var(--pt-text-primary)' }}>
                            {order.product_slug || '—'}
                          </td>
                          <td className="px-3 py-2 text-sm" style={{ color: 'var(--pt-text-primary)' }}>
                            {formatAmount(order.amount_cents, order.currency)}
                          </td>
                          <td className="px-3 py-2 text-sm" style={{ color: 'var(--pt-text-muted)', textTransform: 'capitalize' }}>
                            {order.status || '—'}
                          </td>
                          <td className="px-3 py-2 text-sm" style={{ color: 'var(--pt-text-muted)' }}>
                            {order?.metadata?.utm_source || '—'}
                          </td>
                          <td className="px-3 py-2 text-sm" style={{ color: 'var(--pt-text-muted)' }}>
                            {order.stripe_session_id ? `${String(order.stripe_session_id).slice(0, 14)}…` : '—'}
                          </td>
                          <td className="px-3 py-2 text-sm" style={{ color: 'var(--pt-text-muted)' }}>
                            {formatDateTime(order.created_at)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <details
                style={{
                  border: '1px solid var(--pt-border-subtle)',
                  borderRadius: 8,
                  backgroundColor: 'var(--pt-elevation-1)',
                  padding: '10px 14px',
                }}
              >
                <summary
                  style={{
                    ...getTypeStyle('body', 'medium'),
                    color: 'var(--pt-text-primary)',
                    cursor: 'pointer',
                  }}
                >
                  Audit trail ({auditRows.length})
                </summary>
                <div className="mt-3">
                  {auditRows.length === 0 ? (
                    <p style={{ ...getTypeStyle('body'), color: 'var(--pt-text-muted)', margin: 0 }}>
                      No audit history for this enrollment.
                    </p>
                  ) : (
                    <ul className="m-0 p-0" style={{ listStyle: 'none' }}>
                      {auditRows.map((row) => (
                        <li
                          key={row.id}
                          style={{
                            borderBottom: '1px solid var(--pt-border-subtle)',
                            padding: '8px 0',
                          }}
                        >
                          <div className="flex flex-wrap items-baseline gap-3">
                            <span
                              style={{
                                ...getTypeStyle('meta', 'medium'),
                                color: 'var(--pt-text-primary)',
                              }}
                            >
                              {row.action_type}
                            </span>
                            <span style={{ ...getTypeStyle('meta'), color: 'var(--pt-text-muted)' }}>
                              {formatDateTime(row.created_at)}
                            </span>
                            <span style={{ ...getTypeStyle('meta'), color: 'var(--pt-text-muted)' }}>
                              actor {row.actor_id ? `${String(row.actor_id).slice(0, 8)}…` : '—'}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </details>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
