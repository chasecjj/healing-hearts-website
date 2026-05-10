/**
 * BroadcastsListView — /admin/broadcasts list view.
 *
 * Spec: portal-admin-completion-v1 wave-3.2 S3 §3.3 list-view contract.
 * Replaces AdminComingSoon for /admin/broadcasts. Wave 3.2 Phase 4 deliverable
 * (final Tier 1 slice).
 *
 * - AdminDataTable + AdminFilterBar primitives
 * - 5-column table per spec §3.3 (broadcast_id / status / recipients / first_sent / last_sent)
 * - URL-persisted status filter + search via useSearchParams (handled by AdminFilterBar)
 * - Default sort first_sent DESC; scheduled rows (no first_sent) sort to top
 *   (sort handled server-side in api/admin/list-broadcasts.js)
 * - Row click navigates to /admin/broadcasts/:broadcast_id
 * - Empty state → Supabase Dashboard link
 *
 * Service-role read note: broadcast_sends RLS today is service_role-only for
 * SELECT (migration 025). Migration 037 did NOT add an admin SELECT policy.
 * Direct client supabase.from('broadcast_sends').select() returns []. The
 * /api/admin/list-broadcasts route uses service-role to fan out the read +
 * aggregate broadcast_sends rows by broadcast_id.
 */

import React, { useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import usePageMeta from '../../hooks/usePageMeta';
import useBroadcastsList from '../../portal/admin/hooks/useBroadcastsList';
import AdminDataTable from '../../portal/admin/primitives/AdminDataTable';
import AdminFilterBar from '../../portal/admin/primitives/AdminFilterBar';
import { getTypeStyle } from '../../portal/design/typography';

const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'sent', label: 'Sent' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'failed', label: 'Failed' },
];

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
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

export default function BroadcastsListView() {
  usePageMeta('Broadcasts — Admin', 'Healing Hearts broadcasts administration.');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const statusFilter = searchParams.get('status') || 'all';
  const searchQuery = searchParams.get('search') || '';

  const { broadcasts, loading, error } = useBroadcastsList({ statusFilter, searchQuery });

  const columns = useMemo(() => [
    {
      key: 'broadcast_id',
      label: 'Broadcast',
      render: (row) => (
        <span style={{ ...getTypeStyle('body', 'medium'), color: 'var(--pt-text-primary)' }}>
          {row.broadcast_id}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusChip status={row.status} />,
    },
    {
      key: 'recipients',
      label: 'Recipients',
      align: 'right',
      render: (row) => (
        <span style={{ ...getTypeStyle('body'), color: 'var(--pt-text-primary)' }}>
          {Number.isFinite(row.recipients) ? row.recipients : 0}
        </span>
      ),
    },
    {
      key: 'first_sent',
      label: 'First sent',
      render: (row) => (
        <span style={{ ...getTypeStyle('meta'), color: 'var(--pt-text-muted)' }}>
          {formatDate(row.first_sent)}
        </span>
      ),
    },
    {
      key: 'last_sent',
      label: 'Last sent',
      render: (row) => (
        <span style={{ ...getTypeStyle('meta'), color: 'var(--pt-text-muted)' }}>
          {formatDate(row.last_sent)}
        </span>
      ),
    },
  ], []);

  const emptyState = (
    <div className="flex flex-col items-center gap-2 py-4">
      <p style={{ ...getTypeStyle('body'), color: 'var(--pt-text-primary)' }}>
        No broadcasts logged yet.
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
        Inspect via Supabase Dashboard →
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
    {
      key: 'search',
      label: 'Search',
      type: 'search',
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
            Admin › Broadcasts
          </p>
          <h1
            style={{
              ...getTypeStyle('heading-1'),
              color: 'var(--pt-text-primary)',
              margin: 0,
            }}
          >
            Broadcasts
          </h1>
          <p
            style={{
              ...getTypeStyle('body'),
              color: 'var(--pt-text-muted)',
              marginTop: 6,
            }}
          >
            {broadcasts.length} {broadcasts.length === 1 ? 'broadcast' : 'broadcasts'}
            {statusFilter !== 'all' ? ` · ${statusFilter}` : ''}
            {searchQuery ? ` · "${searchQuery}"` : ''}
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
            Failed to load broadcasts: {error}
          </div>
        ) : null}

        <AdminDataTable
          columns={columns}
          rows={broadcasts}
          rowKey={(row) => row.broadcast_id}
          onRowClick={(row) => navigate(`/admin/broadcasts/${encodeURIComponent(row.broadcast_id)}`)}
          loading={loading}
          emptyState={emptyState}
        />
      </div>
    </div>
  );
}
