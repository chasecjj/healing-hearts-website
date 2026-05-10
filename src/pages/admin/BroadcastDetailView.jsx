/**
 * BroadcastDetailView — /admin/broadcasts/:broadcast_id detail view.
 *
 * Spec: portal-admin-completion-v1 wave-3.2 S3 §3.3 detail-view contract.
 * Wave 3.2 Phase 4 deliverable (final Tier 1 slice).
 *
 * - Header: broadcast_id + status chip + recipients count + first_sent + last_sent
 * - Recipients sub-table (3 cols): email / status / sent_at — each row = one
 *   broadcast_sends row, fetched via /api/admin/list-broadcasts mode=recipients
 *   (broadcast_sends RLS = service_role-only for SELECT today; direct client
 *   query would return [], so the backend route is the only viable read path)
 * - Actions:
 *     Cancel broadcast (InlineConfirm-gated; admin_cancel_broadcast RPC)
 *     Send from template (DISABLED stub per G-04 readiness gate)
 *       The backend send-broadcast endpoint is dryRun=true by default.
 *       This UI does NOT call it; button is disabled with title-tooltip
 *       explaining the gate. No feature flag, no environment toggle.
 * - Audit trail panel (collapsed) — last 10 admin_action_audit rows
 *   (filtered by payload->>'broadcast_id' = current broadcast_id; admin
 *   SELECT policy on admin_action_audit allows direct client query)
 *
 * Note: route param `:broadcast_id` is text (broadcast_sends.broadcast_id is
 * text, NOT uuid). useParams() returns the URL-decoded text directly.
 */

import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import usePageMeta from '../../hooks/usePageMeta';
import useBroadcastDetail from '../../portal/admin/hooks/useBroadcastDetail';
import InlineConfirm from '../../portal/components/InlineConfirm';
import { getTypeStyle } from '../../portal/design/typography';

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

function StatusChip({ status }) {
  const tone = {
    sent: { bg: 'rgba(21, 128, 61, 0.10)', color: 'var(--pt-success)' },
    scheduled: { bg: 'rgba(180, 83, 9, 0.10)', color: 'var(--pt-warning)' },
    cancelled: { bg: 'var(--pt-elevation-2)', color: 'var(--pt-text-muted)' },
    failed: { bg: 'rgba(185, 28, 28, 0.10)', color: 'var(--pt-danger)' },
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

export default function BroadcastDetailView() {
  const { broadcast_id: rawBroadcastId } = useParams();
  // useParams URL-decodes for us, but encodeURIComponent on the list-side
  // means a round-trip is safe. Trim defensively in case of stray whitespace.
  const broadcastId = typeof rawBroadcastId === 'string' ? rawBroadcastId.trim() : '';
  const { user } = useAuth();
  usePageMeta('Broadcast — Admin', 'Healing Hearts broadcast detail.');

  const {
    broadcast,
    recipients,
    auditRows,
    loading,
    error,
    actionState,
    cancelBroadcast,
  } = useBroadcastDetail(broadcastId, user?.id);

  const [confirming, setConfirming] = useState(false);
  const [actionNote, setActionNote] = useState('');

  async function handleCancel() {
    setActionNote('');
    const result = await cancelBroadcast();
    if (result.status === 'ok') {
      setActionNote('Broadcast cancelled.');
    } else {
      setActionNote(`Cancel failed: ${result.error || 'unknown'}`);
    }
  }

  const isCancelled = broadcast?.status === 'cancelled';

  return (
    <div
      className="w-full min-h-screen"
      style={{ backgroundColor: 'var(--pt-content-bg)' }}
    >
      <div className="max-w-6xl mx-auto px-6 pt-10 pb-24">
        <Link
          to="/admin/broadcasts"
          className="inline-flex items-center gap-2 mb-6"
          style={{
            ...getTypeStyle('meta'),
            color: 'var(--pt-text-muted)',
            textDecoration: 'none',
          }}
        >
          <ArrowLeft className="w-4 h-4" />
          Broadcasts
        </Link>

        {loading && (
          <p style={{ ...getTypeStyle('body'), color: 'var(--pt-text-muted)' }} role="status">
            Loading broadcast…
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

        {!loading && !error && !broadcast && (
          <p style={{ ...getTypeStyle('body'), color: 'var(--pt-text-muted)' }}>
            Broadcast not found: {broadcastId}
          </p>
        )}

        {broadcast && (
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
                Admin › Broadcasts › Detail
              </p>
              <div className="flex flex-wrap items-baseline gap-4">
                <h1
                  style={{
                    ...getTypeStyle('heading-1'),
                    color: 'var(--pt-text-primary)',
                    margin: 0,
                    wordBreak: 'break-all',
                  }}
                >
                  {broadcast.broadcast_id}
                </h1>
                <StatusChip status={broadcast.status} />
              </div>
              <p
                style={{
                  ...getTypeStyle('body'),
                  color: 'var(--pt-text-muted)',
                  marginTop: 8,
                }}
              >
                {broadcast.recipients} {broadcast.recipients === 1 ? 'recipient' : 'recipients'}
                {' · first sent '}{formatDateTime(broadcast.first_sent)}
                {' · last sent '}{formatDateTime(broadcast.last_sent)}
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                {confirming ? (
                  <InlineConfirm
                    message="Cancel this broadcast? All sends for this broadcast_id will be marked cancelled."
                    onConfirm={async () => {
                      setConfirming(false);
                      await handleCancel();
                    }}
                    onCancel={() => setConfirming(false)}
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirming(true)}
                    disabled={isCancelled || actionState.cancel === 'pending'}
                    style={{
                      ...getTypeStyle('meta', 'medium'),
                      padding: '4px 12px',
                      borderRadius: 6,
                      border: '1px solid var(--pt-border-subtle)',
                      backgroundColor: 'transparent',
                      color: isCancelled ? 'var(--pt-text-muted)' : 'var(--pt-danger)',
                      cursor: isCancelled ? 'not-allowed' : 'pointer',
                      opacity: isCancelled ? 0.5 : 1,
                    }}
                  >
                    Cancel broadcast
                  </button>
                )}
                {/*
                  Send-from-template stub — DISABLED per G-04 readiness gate.
                  The /api/admin/send-broadcast endpoint exists and supports
                  dryRun=true by default; this UI intentionally does NOT call it
                  pending Chase ack. Button is rendered for IA continuity only.
                */}
                <button
                  type="button"
                  disabled
                  aria-disabled="true"
                  title="Chase-gate G-04 readiness gate; backend supports dryRun by default"
                  style={{
                    ...getTypeStyle('meta', 'medium'),
                    padding: '4px 12px',
                    borderRadius: 6,
                    border: '1px solid var(--pt-border-subtle)',
                    backgroundColor: 'transparent',
                    color: 'var(--pt-text-muted)',
                    cursor: 'not-allowed',
                    opacity: 0.5,
                  }}
                >
                  Send from template
                </button>
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
                Recipients
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
                  aria-label="Broadcast recipients"
                  className="w-full border-collapse text-left tabular-nums"
                >
                  <thead
                    style={{
                      backgroundColor: 'var(--pt-elevation-1)',
                      borderBottom: '1px solid var(--pt-border-subtle)',
                    }}
                  >
                    <tr style={{ height: 40 }}>
                      {['Email', 'Status', 'Sent at'].map((label) => (
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
                    {recipients.length === 0 ? (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-3 py-6 text-center"
                          style={{ color: 'var(--pt-text-muted)' }}
                        >
                          No recipients on file.
                        </td>
                      </tr>
                    ) : (
                      recipients.map((rec) => (
                        <tr
                          key={rec.id}
                          style={{
                            height: 44,
                            borderBottom: '1px solid var(--pt-border-subtle)',
                            verticalAlign: 'middle',
                          }}
                        >
                          <td className="px-3 py-2 text-sm" style={{ color: 'var(--pt-text-primary)' }}>
                            {rec.email || '—'}
                          </td>
                          <td className="px-3 py-2 text-sm">
                            <StatusChip status={rec.status} />
                          </td>
                          <td className="px-3 py-2 text-sm" style={{ color: 'var(--pt-text-muted)' }}>
                            {formatDateTime(rec.sent_at)}
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
                      No audit history for this broadcast.
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
