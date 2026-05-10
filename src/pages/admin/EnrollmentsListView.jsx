/**
 * EnrollmentsListView — /admin/enrollments list view.
 *
 * Spec: portal-admin-completion-v1 wave-3.2 S2 §3.2 list-view contract.
 * Replaces AdminComingSoon for /admin/enrollments. Wave 3.2 Phase 3 deliverable.
 *
 * - AdminDataTable + AdminFilterBar primitives
 * - 6-column table per spec §3.2 (learner / course / status / grant-source / utm / enrolled_at)
 * - URL-persisted filters via useSearchParams (handled by AdminFilterBar)
 * - Pre-pinned utm_source=qr_card chip per CEO-AGENDA §11 #4 (Trifold-1 ROI)
 *   The actual production utm value is `qr_card` (scout-05 #4); NOT qr-trisha / qr-jeff.
 * - Row click navigates to /admin/enrollments/:id
 * - Empty state → Supabase Dashboard link
 */

import React, { useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import usePageMeta from '../../hooks/usePageMeta';
import useEnrollmentsList from '../../portal/admin/hooks/useEnrollmentsList';
import AdminDataTable from '../../portal/admin/primitives/AdminDataTable';
import AdminFilterBar from '../../portal/admin/primitives/AdminFilterBar';
import { getTypeStyle } from '../../portal/design/typography';

const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'revoked', label: 'Revoked' },
  { value: 'expired', label: 'Expired' },
  { value: 'refunded', label: 'Refunded' },
];

const GRANT_SOURCE_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'stripe', label: 'Stripe' },
  { value: 'admin-grant', label: 'Admin grant' },
];

// Trifold-1 ROI: production utm_source value is `qr_card` per scout-05 #4.
// Surfaced as a pre-pinned chip so Chase can see scan attribution at a glance.
const UTM_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'qr_card', label: 'qr_card (Trifold-1)' },
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
  });
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

export default function EnrollmentsListView() {
  usePageMeta('Enrollments — Admin', 'Healing Hearts enrollments administration.');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const courseFilter = searchParams.get('course') || null;
  const statusFilter = searchParams.get('status') || 'all';
  const grantSourceParam = searchParams.get('grant-source') || 'all';
  const utmParam = searchParams.get('utm') || null;

  // 'all' on grant-source / utm collapses to null/'all' downstream
  const grantSourceFilter = grantSourceParam === 'all' ? 'all' : grantSourceParam;
  const utmFilter = !utmParam || utmParam === 'all' ? null : utmParam;

  const { enrollments, courses, loading, error } = useEnrollmentsList({
    courseFilter,
    statusFilter,
    grantSourceFilter,
    utmFilter,
  });

  const columns = useMemo(() => [
    {
      key: 'learner',
      label: 'Learner',
      render: (row) => {
        const email = row.learner?.email || null;
        const name = row.learner?.display_name || null;
        const fallback = row.user_id ? `${String(row.user_id).slice(0, 8)}…` : '—';
        return (
          <div className="flex flex-col gap-0.5">
            <span style={{ ...getTypeStyle('body', 'medium'), color: 'var(--pt-text-primary)' }}>
              {email || fallback}
            </span>
            {name && name !== email ? (
              <span style={{ ...getTypeStyle('meta'), color: 'var(--pt-text-muted)' }}>
                {name}
              </span>
            ) : null}
          </div>
        );
      },
    },
    {
      key: 'course',
      label: 'Course',
      render: (row) => (
        <span style={{ ...getTypeStyle('body'), color: 'var(--pt-text-primary)' }}>
          {row.courses?.title || '—'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusChip status={row.status} />,
    },
    {
      key: 'grant_source',
      label: 'Grant source',
      render: (row) => (
        <span
          style={{
            ...getTypeStyle('meta', 'medium'),
            color: 'var(--pt-text-muted)',
            textTransform: 'capitalize',
          }}
        >
          {row.grant_source === 'admin-grant' ? 'Admin grant' : 'Stripe'}
        </span>
      ),
    },
    {
      key: 'utm_source',
      label: 'UTM source',
      render: (row) => (
        <span style={{ ...getTypeStyle('meta'), color: 'var(--pt-text-muted)' }}>
          {row.utm_source || '—'}
        </span>
      ),
    },
    {
      key: 'enrolled_at',
      label: 'Enrolled',
      render: (row) => (
        <span style={{ ...getTypeStyle('meta'), color: 'var(--pt-text-muted)' }}>
          {formatDateTime(row.enrolled_at)}
        </span>
      ),
    },
  ], []);

  const emptyState = (
    <div className="flex flex-col items-center gap-2 py-4">
      <p style={{ ...getTypeStyle('body'), color: 'var(--pt-text-primary)' }}>
        No enrollments yet.
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

  const courseOptions = useMemo(
    () => (courses || []).map((c) => ({ value: c.id, label: c.title })),
    [courses]
  );

  const filterDefs = useMemo(() => [
    // utm chip is pinned + first per CEO-AGENDA §11 #4 (Trifold-1 ROI prominence)
    {
      key: 'utm',
      label: 'UTM',
      type: 'select',
      pinned: true,
      defaultValue: 'all',
      options: UTM_FILTERS,
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      pinned: true,
      defaultValue: 'all',
      options: STATUS_FILTERS,
    },
    {
      key: 'grant-source',
      label: 'Grant',
      type: 'select',
      defaultValue: 'all',
      options: GRANT_SOURCE_FILTERS,
    },
    {
      key: 'course',
      label: 'Course',
      type: 'multi-select',
      options: courseOptions,
    },
  ], [courseOptions]);

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
            Admin › Enrollments
          </p>
          <h1
            style={{
              ...getTypeStyle('heading-1'),
              color: 'var(--pt-text-primary)',
              margin: 0,
            }}
          >
            Enrollments
          </h1>
          <p
            style={{
              ...getTypeStyle('body'),
              color: 'var(--pt-text-muted)',
              marginTop: 6,
            }}
          >
            {enrollments.length} {enrollments.length === 1 ? 'enrollment' : 'enrollments'}
            {statusFilter !== 'all' ? ` · ${statusFilter}` : ''}
            {utmFilter ? ` · utm=${utmFilter}` : ''}
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
            Failed to load enrollments: {error}
          </div>
        ) : null}

        <AdminDataTable
          columns={columns}
          rows={enrollments}
          rowKey={(row) => row.id}
          onRowClick={(row) => navigate(`/admin/enrollments/${row.id}`)}
          loading={loading}
          emptyState={emptyState}
        />
      </div>
    </div>
  );
}
