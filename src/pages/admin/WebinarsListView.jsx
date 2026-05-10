/**
 * WebinarsListView — /admin/webinars list view.
 *
 * Spec: portal-admin-completion-v1 wave-3.1 S1 §4 list-view contract.
 * Replaces AdminComingSoon for /admin/webinars. Wave 3.2 Phase 2 deliverable.
 *
 * - AdminDataTable + AdminFilterBar primitives
 * - 5-column table per spec §4 (title / date-time / status / registrants / actions)
 * - URL-persisted status filter (all/upcoming/past) via useSearchParams (handled by AdminFilterBar)
 * - May 21 webinar gets reminder badge inline in title cell (S1-03)
 * - Row click navigates to /admin/webinars/:id
 * - Empty state → Supabase Dashboard link
 */

import React, { useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import usePageMeta from '../../hooks/usePageMeta';
import useWebinarsList from '../../portal/admin/hooks/useWebinarsList';
import AdminDataTable from '../../portal/admin/primitives/AdminDataTable';
import AdminFilterBar from '../../portal/admin/primitives/AdminFilterBar';
import { getTypeStyle } from '../../portal/design/typography';

const MAY_21_ID_PREFIX = '93a564a5';

const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'past', label: 'Past' },
];

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

function StatusChip({ status }) {
  const tone = {
    upcoming: { bg: 'rgba(180, 83, 9, 0.10)', color: 'var(--pt-warning)' },
    live: { bg: 'rgba(185, 28, 28, 0.10)', color: 'var(--pt-danger)' },
    past: { bg: 'var(--pt-elevation-2)', color: 'var(--pt-text-muted)' },
    cancelled: { bg: 'var(--pt-elevation-2)', color: 'var(--pt-text-muted)' },
    unknown: { bg: 'var(--pt-elevation-2)', color: 'var(--pt-text-muted)' },
  }[status];

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
      {status}
    </span>
  );
}

export default function WebinarsListView() {
  usePageMeta('Webinars — Admin', 'Healing Hearts webinars administration.');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const statusFilter = searchParams.get('status') || 'all';

  const { webinars, loading, error } = useWebinarsList({ statusFilter });

  const columns = useMemo(() => [
    {
      key: 'title',
      label: 'Title',
      render: (row) => {
        const isMay21 = typeof row.id === 'string' && row.id.startsWith(MAY_21_ID_PREFIX);
        return (
          <div className="flex flex-col gap-1">
            <span style={{ ...getTypeStyle('body', 'medium'), color: 'var(--pt-text-primary)' }}>
              {row.title || '(untitled)'}
            </span>
            {isMay21 && (
              <span
                style={{
                  ...getTypeStyle('meta'),
                  color: 'var(--pt-warning)',
                }}
              >
                138 registrations — reminder fires May 20 5 PM MT
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'starts_at',
      label: 'Date / Time',
      render: (row) => (
        <span title={row.duration_minutes ? `${row.duration_minutes} min` : undefined}>
          {formatDateTime(row.starts_at)}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusChip status={deriveDisplayStatus(row)} />,
    },
    {
      key: 'registrant_count',
      label: 'Registrants',
      align: 'right',
      render: (row) => (
        <span style={{ ...getTypeStyle('body'), color: 'var(--pt-text-primary)' }}>
          {Number.isFinite(row.registrant_count) ? row.registrant_count : 0}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: () => (
        <span
          aria-hidden="true"
          style={{ ...getTypeStyle('meta'), color: 'var(--pt-text-muted)' }}
        >
          View →
        </span>
      ),
    },
  ], []);

  const emptyState = (
    <div className="flex flex-col items-center gap-2 py-4">
      <p style={{ ...getTypeStyle('body'), color: 'var(--pt-text-primary)' }}>
        No webinars yet.
      </p>
      <a
        href="https://supabase.com/dashboard/project/qleojrlqnbiutyhfnqgb/editor"
        target="_blank"
        rel="noreferrer"
        style={{
          ...getTypeStyle('body', 'medium'),
          color: 'var(--pt-primary-accent)',
          textDecoration: 'none',
        }}
      >
        Add via Supabase Dashboard →
      </a>
    </div>
  );

  const filterDefs = useMemo(() => [
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      pinned: true,
      defaultValue: 'all',
      options: STATUS_FILTERS,
    },
  ], []);

  return (
    <div
      className="w-full min-h-screen"
      style={{ backgroundColor: 'var(--pt-content-bg)' }}
    >
      <div className="max-w-6xl mx-auto px-6 pt-10 pb-24">
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 mb-6"
          style={{
            ...getTypeStyle('meta'),
            color: 'var(--pt-text-muted)',
            textDecoration: 'none',
          }}
        >
          <ArrowLeft className="w-4 h-4" />
          Admin
        </Link>

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
            Admin › Webinars
          </p>
          <h1
            style={{
              ...getTypeStyle('heading-1'),
              color: 'var(--pt-text-primary)',
              margin: 0,
            }}
          >
            Webinars
          </h1>
          <p
            style={{
              ...getTypeStyle('body'),
              color: 'var(--pt-text-muted)',
              marginTop: 6,
            }}
          >
            {webinars.length} {webinars.length === 1 ? 'webinar' : 'webinars'} {statusFilter !== 'all' ? `(${statusFilter})` : ''}
          </p>
        </header>

        <div className="mb-4">
          <AdminFilterBar filters={filterDefs} />
        </div>

        {error ? (
          <div
            role="alert"
            className="rounded-lg p-4 mb-4"
            style={{
              border: '1px solid var(--pt-border-subtle)',
              backgroundColor: 'var(--pt-elevation-1)',
              color: 'var(--pt-danger)',
            }}
          >
            Failed to load webinars: {error}
          </div>
        ) : null}

        <AdminDataTable
          columns={columns}
          rows={webinars}
          rowKey={(row) => row.id}
          onRowClick={(row) => navigate(`/admin/webinars/${row.id}`)}
          loading={loading}
          emptyState={emptyState}
        />
      </div>
    </div>
  );
}
