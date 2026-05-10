/**
 * WebinarDetailView — /admin/webinars/:id detail view.
 *
 * Spec: portal-admin-completion-v1 wave-3.1 S1 §5 detail-view contract.
 * Wave 3.2 Phase 2 deliverable.
 *
 * - Header: title + date + status + registrants count + disabled "Edit metadata"
 * - Registration sub-table (8 columns per spec §5: email/name/utm × 3/status/registered/dedupe)
 * - Per-row resend (calls /api/admin/resend-webinar-confirmation)
 * - Per-row revoke (InlineConfirm-gated; calls admin_revoke_registration RPC)
 * - Collapsed audit-trail panel (<details>) with last 10 admin_action_audit rows
 */

import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import usePageMeta from '../../hooks/usePageMeta';
import useWebinarDetail from '../../portal/admin/hooks/useWebinarDetail';
import InlineConfirm from '../../portal/components/InlineConfirm';
import { resendConfirmation } from '../../portal/admin/api/webinarsApi';
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

function deriveDisplayStatus(webinar) {
  if (!webinar) return 'unknown';
  if (webinar.status === 'cancelled') return 'cancelled';
  if (webinar.status === 'live') return 'live';
  if (webinar.starts_at) {
    const t = new Date(webinar.starts_at).getTime();
    if (Number.isFinite(t) && t < Date.now()) return 'past';
  }
  return 'upcoming';
}

function regDisplayStatus(reg) {
  // webinar_registrations has no `status` column today (spec §5 schema gap).
  // Use `unsubscribed` boolean as proxy until backfill column ships.
  if (reg.unsubscribed) return 'cancelled';
  return 'confirmed';
}

function RegistrationRow({ reg, onResend, onRevoke, resendBusy, resendNote }) {
  const [confirming, setConfirming] = useState(false);
  const status = regDisplayStatus(reg);

  return (
    <tr
      style={{
        height: 44,
        borderBottom: '1px solid var(--pt-border-subtle)',
        verticalAlign: 'middle',
      }}
    >
      <td className="px-3 py-2 text-sm" style={{ color: 'var(--pt-text-primary)' }}>
        {reg.email || '—'}
      </td>
      <td className="px-3 py-2 text-sm" style={{ color: 'var(--pt-text-primary)' }}>
        {reg.name || '—'}
      </td>
      <td className="px-3 py-2 text-sm" style={{ color: 'var(--pt-text-muted)' }}>
        {reg.utm_source || '—'}
      </td>
      <td className="px-3 py-2 text-sm" style={{ color: 'var(--pt-text-muted)' }}>
        {reg.utm_medium || '—'}
      </td>
      <td className="px-3 py-2 text-sm" style={{ color: 'var(--pt-text-muted)' }}>
        {reg.utm_campaign || '—'}
      </td>
      <td className="px-3 py-2 text-sm">
        <span
          style={{
            ...getTypeStyle('meta', 'medium'),
            display: 'inline-block',
            padding: '2px 8px',
            borderRadius: '9999px',
            backgroundColor: status === 'cancelled' ? 'var(--pt-elevation-2)' : 'rgba(21, 128, 61, 0.10)',
            color: status === 'cancelled' ? 'var(--pt-text-muted)' : 'var(--pt-success)',
            textTransform: 'capitalize',
          }}
        >
          {status}
        </span>
      </td>
      <td className="px-3 py-2 text-sm" style={{ color: 'var(--pt-text-muted)' }}>
        {formatDateTime(reg.created_at)}
      </td>
      <td className="px-3 py-2 text-sm text-center" style={{ color: 'var(--pt-text-muted)' }}>
        —
      </td>
      <td className="px-3 py-2 text-sm" style={{ textAlign: 'right', width: 260 }}>
        {confirming ? (
          <InlineConfirm
            message="Revoke this registration? The registrant will lose their confirmed spot."
            onConfirm={async () => {
              setConfirming(false);
              await onRevoke(reg.id);
            }}
            onCancel={() => setConfirming(false)}
          />
        ) : (
          <div className="inline-flex items-center gap-2">
            <button
              type="button"
              onClick={() => onResend(reg.id)}
              disabled={resendBusy || status === 'cancelled'}
              style={{
                ...getTypeStyle('meta', 'medium'),
                padding: '4px 10px',
                borderRadius: 6,
                border: '1px solid var(--pt-border-subtle)',
                backgroundColor: 'transparent',
                color: 'var(--pt-text-primary)',
                cursor: (resendBusy || status === 'cancelled') ? 'not-allowed' : 'pointer',
                opacity: (resendBusy || status === 'cancelled') ? 0.5 : 1,
              }}
            >
              Resend
            </button>
            <button
              type="button"
              onClick={() => setConfirming(true)}
              disabled={status === 'cancelled'}
              style={{
                ...getTypeStyle('meta', 'medium'),
                padding: '4px 10px',
                borderRadius: 6,
                border: '1px solid var(--pt-border-subtle)',
                backgroundColor: 'transparent',
                color: status === 'cancelled' ? 'var(--pt-text-muted)' : 'var(--pt-danger)',
                cursor: status === 'cancelled' ? 'not-allowed' : 'pointer',
                opacity: status === 'cancelled' ? 0.5 : 1,
              }}
            >
              Revoke
            </button>
            {resendNote ? (
              <span style={{ ...getTypeStyle('meta'), color: 'var(--pt-text-muted)' }}>
                {resendNote}
              </span>
            ) : null}
          </div>
        )}
      </td>
    </tr>
  );
}

export default function WebinarDetailView() {
  const { id } = useParams();
  const { user } = useAuth();
  usePageMeta('Webinar — Admin', 'Healing Hearts webinar detail.');

  const {
    webinar,
    registrations,
    auditRows,
    loading,
    error,
    revokeRegistration,
  } = useWebinarDetail(id, user?.id);

  const [resendBusyId, setResendBusyId] = useState(null);
  const [resendNotes, setResendNotes] = useState({});

  async function handleResend(regId) {
    setResendBusyId(regId);
    setResendNotes((prev) => ({ ...prev, [regId]: '' }));
    try {
      await resendConfirmation(regId);
      setResendNotes((prev) => ({ ...prev, [regId]: 'Sent.' }));
    } catch (err) {
      console.error('[WebinarDetailView] resend failed:', err.message);
      setResendNotes((prev) => ({ ...prev, [regId]: 'Failed.' }));
    } finally {
      setResendBusyId(null);
    }
  }

  return (
    <div
      className="w-full min-h-screen"
      style={{ backgroundColor: 'var(--pt-content-bg)' }}
    >
      <div className="max-w-6xl mx-auto px-6 pt-10 pb-24">
        <Link
          to="/admin/webinars"
          className="inline-flex items-center gap-2 mb-6"
          style={{
            ...getTypeStyle('meta'),
            color: 'var(--pt-text-muted)',
            textDecoration: 'none',
          }}
        >
          <ArrowLeft className="w-4 h-4" />
          Webinars
        </Link>

        {loading && (
          <p style={{ ...getTypeStyle('body'), color: 'var(--pt-text-muted)' }} role="status">
            Loading webinar…
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

        {webinar && (
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
                Admin › Webinars › Detail
              </p>
              <div className="flex flex-wrap items-baseline gap-4">
                <h1
                  style={{
                    ...getTypeStyle('heading-1'),
                    color: 'var(--pt-text-primary)',
                    margin: 0,
                  }}
                >
                  {webinar.title || '(untitled webinar)'}
                </h1>
                <span
                  style={{
                    ...getTypeStyle('meta', 'medium'),
                    display: 'inline-block',
                    padding: '2px 10px',
                    borderRadius: '9999px',
                    backgroundColor: 'var(--pt-elevation-1)',
                    color: 'var(--pt-text-muted)',
                    textTransform: 'capitalize',
                  }}
                >
                  {deriveDisplayStatus(webinar)}
                </span>
              </div>
              <p
                style={{
                  ...getTypeStyle('body'),
                  color: 'var(--pt-text-muted)',
                  marginTop: 8,
                }}
              >
                {formatDateTime(webinar.starts_at)}
                {webinar.duration_minutes ? ` · ${webinar.duration_minutes} min` : ''}
                {' · '}
                {webinar.registrant_count ?? registrations.length} registrants
              </p>
              <div className="mt-3">
                <button
                  type="button"
                  disabled
                  title="Editing available in Wave 6E."
                  style={{
                    ...getTypeStyle('meta', 'medium'),
                    padding: '4px 12px',
                    borderRadius: 6,
                    border: '1px solid var(--pt-border-subtle)',
                    backgroundColor: 'transparent',
                    color: 'var(--pt-text-muted)',
                    cursor: 'not-allowed',
                    opacity: 0.6,
                  }}
                >
                  Edit metadata
                </button>
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
                Registrations
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
                  aria-label="Webinar registrations"
                  className="w-full border-collapse text-left tabular-nums"
                >
                  <thead
                    style={{
                      backgroundColor: 'var(--pt-elevation-1)',
                      borderBottom: '1px solid var(--pt-border-subtle)',
                    }}
                  >
                    <tr style={{ height: 40 }}>
                      {['Email', 'Name', 'UTM Source', 'UTM Medium', 'UTM Campaign', 'Status', 'Registered', 'Dedupe', ''].map((label, idx) => (
                        <th
                          key={`${label}-${idx}`}
                          scope="col"
                          className="px-3 text-xs font-medium uppercase tracking-wide"
                          style={{
                            color: 'var(--pt-text-muted)',
                            borderBottom: '1px solid var(--pt-border-subtle)',
                            textAlign: idx === 7 ? 'center' : idx === 8 ? 'right' : 'left',
                          }}
                        >
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.length === 0 ? (
                      <tr>
                        <td
                          colSpan={9}
                          className="px-3 py-6 text-center"
                          style={{ color: 'var(--pt-text-muted)' }}
                        >
                          No registrations yet.
                        </td>
                      </tr>
                    ) : (
                      registrations.map((reg) => (
                        <RegistrationRow
                          key={reg.id}
                          reg={reg}
                          onResend={handleResend}
                          onRevoke={revokeRegistration}
                          resendBusy={resendBusyId === reg.id}
                          resendNote={resendNotes[reg.id]}
                        />
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
                      No audit history for this registration.
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
                              target {row.target_id}
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
