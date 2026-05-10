import React, { useEffect, useState } from 'react';
import { Users, Mail, Calendar, CreditCard, Flame, BarChart3, UserCheck } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

// ─── Skeleton shimmer ────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div
      className="rounded-2xl p-6 animate-pulse"
      style={{
        backgroundColor: 'var(--pt-elevation-2-hex, #ffffff)',
        border: '1px solid var(--pt-border-soft-hex, #e7e5e4)',
      }}
    >
      <div className="flex items-center gap-3 mb-5">
        <div
          className="w-9 h-9 rounded-lg"
          style={{ backgroundColor: 'var(--pt-elevation-1-hex, #e7e5e4)' }}
        />
        <div
          className="h-2.5 rounded w-28"
          style={{ backgroundColor: 'var(--pt-elevation-1-hex, #e7e5e4)' }}
        />
      </div>
      <div
        className="h-9 rounded w-20 mb-2"
        style={{ backgroundColor: 'var(--pt-elevation-1-hex, #e7e5e4)' }}
      />
      <div
        className="h-3 rounded w-36"
        style={{ backgroundColor: 'var(--pt-border-soft-hex, #e7e5e4)' }}
      />
    </div>
  );
}

// ─── Stat card ───────────────────────────────────────────────────────────────
/**
 * Editorial stat tile (Wave 7 design pass).
 * Replaces the prior `bg-primary/10` tinted card (which resolved to teal in
 * Tailwind theme) with a warm-stone surface, single accent eyebrow, and
 * Playfair display number — matching the rest of the portal aesthetic.
 */
function StatCard({ icon: Icon, title, primary, subtitle }) {
  return (
    <div
      className="rounded-2xl p-6 transition-shadow duration-200"
      style={{
        backgroundColor: 'var(--pt-elevation-2-hex, #ffffff)',
        border: '1px solid var(--pt-border-soft-hex, #e7e5e4)',
        boxShadow: '0 1px 0 rgba(28, 25, 23, 0.02)',
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.boxShadow =
          '0 1px 0 rgba(28, 25, 23, 0.02), 0 12px 32px -16px rgba(28, 25, 23, 0.10)')
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.boxShadow = '0 1px 0 rgba(28, 25, 23, 0.02)')
      }
    >
      <div className="flex items-center gap-3 mb-5">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: 'var(--pt-primary-accent-soft-hex, rgba(185,106,95,0.12))' }}
        >
          <Icon
            className="w-4.5 h-4.5"
            style={{ color: 'var(--pt-primary-accent-hex, #B96A5F)', width: 18, height: 18 }}
          />
        </div>
        <h3
          style={{
            fontFamily: '"Outfit", sans-serif',
            fontSize: 10.5,
            fontWeight: 600,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--pt-text-muted-hex, #57534e)',
            margin: 0,
          }}
        >
          {title}
        </h3>
      </div>
      <p
        style={{
          fontFamily: '"Playfair Display", Georgia, serif',
          fontWeight: 400,
          fontSize: 36,
          lineHeight: 1.05,
          letterSpacing: '-0.02em',
          color: 'var(--pt-text-primary-hex, #1c1917)',
          margin: '0 0 8px',
        }}
      >
        {primary}
      </p>
      {subtitle && (
        <div
          style={{
            fontFamily: '"Plus Jakarta Sans", sans-serif',
            fontSize: 13,
            lineHeight: 1.45,
            color: 'var(--pt-text-muted-hex, #57534e)',
          }}
        >
          {subtitle}
        </div>
      )}
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (val) => (val === null || val === undefined ? '—' : String(val));

// ─── Main component ───────────────────────────────────────────────────────────
export default function KpiCards() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      const results = {};

      // 1. Pipeline Status
      try {
        const { data: rows, error } = await supabase.from('crm_board_rollup').select('*');
        if (error) throw error;
        results.pipeline = rows;
      } catch {
        results.pipeline = null;
      }

      // 2. Active Leads
      try {
        const { count, error } = await supabase
          .from('crm_lead_pipeline')
          .select('id', { count: 'exact', head: true })
          .not('status', 'in', '("converted","archived")');
        if (error) throw error;
        results.activeLeads = count;
      } catch {
        results.activeLeads = null;
      }

      // 3. Spark Subscribers
      try {
        const { count, error } = await supabase
          .from('spark_signups')
          .select('id', { count: 'exact', head: true })
          .eq('unsubscribed', false);
        if (error) throw error;
        results.sparkSubscribers = count;
      } catch {
        results.sparkSubscribers = null;
      }

      // 4. Webinar Registrations
      try {
        const { count, error } = await supabase
          .from('webinar_registrations')
          .select('id', { count: 'exact', head: true });
        if (error) throw error;
        results.webinarRegistrations = count;
      } catch {
        results.webinarRegistrations = null;
      }

      // 5. Orders
      try {
        const { data: orders, error } = await supabase
          .from('orders')
          .select('id, amount_cents');
        if (error) throw error;
        results.orders = orders;
      } catch {
        results.orders = null;
      }

      // 6. Hot Leads
      try {
        const { count, error } = await supabase
          .from('crm_webinar_hot_leads')
          .select('application_id', { count: 'exact', head: true });
        if (error) throw error;
        results.hotLeads = count;
      } catch {
        results.hotLeads = null;
      }

      // 7. My Leads
      try {
        if (user?.id) {
          const { count, error } = await supabase
            .from('crm_lead_pipeline')
            .select('id', { count: 'exact', head: true })
            .eq('assigned_to_id', user.id)
            .not('status', 'in', '("converted","archived")');
          if (error) throw error;
          results.myLeads = count;
        } else {
          results.myLeads = 0;
        }
      } catch {
        results.myLeads = null;
      }

      setData(results);
      setLoading(false);
    }

    fetchAll();
  }, [user]);

  // ── Loading state ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 7 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  // ── Derived values ───────────────────────────────────────────────────────

  // Pipeline: supports two view shapes:
  //   A) Row-per-status: [{ status: 'new', count: 3 }, { status: 'overdue', count: 1 }, ...]
  //   B) Single flat row: { new: 3, reviewing: 2, contacted: 1, responded: 0, overdue: 1 }
  const pipelineRows = data.pipeline;
  let pipelineTotal = null;
  let overdueCount = 0;
  let pipelineSubtitle = 'No pipeline data';

  if (Array.isArray(pipelineRows) && pipelineRows.length > 0) {
    const firstRow = pipelineRows[0];
    const STATUS_COLS = ['new', 'reviewing', 'contacted', 'responded'];

    if ('status' in firstRow && ('count' in firstRow || 'total' in firstRow)) {
      // Shape A: row per status
      const countKey = 'count' in firstRow ? 'count' : 'total';
      pipelineTotal = 0;
      pipelineRows.forEach((row) => {
        const n = Number(row[countKey]) || 0;
        if (row.status === 'overdue') {
          overdueCount = n;
        } else {
          pipelineTotal += n;
        }
      });
      const badges = pipelineRows
        .filter((r) => r.status !== 'overdue')
        .map((r) => `${r[countKey] ?? 0} ${r.status}`)
        .join(' · ');
      pipelineSubtitle = badges || 'No active pipeline';
    } else {
      // Shape B: single flat row with named columns
      pipelineTotal = STATUS_COLS.reduce((sum, s) => sum + (Number(firstRow[s]) || 0), 0);
      overdueCount = Number(firstRow.overdue) || 0;
      pipelineSubtitle = STATUS_COLS.map((s) => `${firstRow[s] ?? 0} ${s}`).join(' · ');
    }
  }

  const pipelineSubtitleEl =
    pipelineRows === null ? (
      <span title="Stripe data unavailable — check service status">—</span>
    ) : overdueCount > 0 ? (
      <span>
        <span style={{ color: 'var(--pt-status-overdue-hex, #b45309)', fontWeight: 600 }}>
          {overdueCount} overdue
        </span>
        {' · '}
        {pipelineSubtitle}
      </span>
    ) : (
      pipelineSubtitle
    );

  // Orders
  const ordersRows = Array.isArray(data.orders) ? data.orders : [];
  const orderCount = ordersRows.length;
  const revenueCents = ordersRows.reduce((sum, o) => sum + (Number(o.amount_cents) || 0), 0);
  const revenueDisplay = (revenueCents / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });

  // ── Render cards ─────────────────────────────────────────────────────────
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
      <StatCard
        icon={BarChart3}
        title="Pipeline Status"
        primary={pipelineRows === null ? '—' : fmt(pipelineTotal)}
        subtitle={pipelineSubtitleEl}
      />

      <StatCard
        icon={Users}
        title="Active Leads"
        primary={fmt(data.activeLeads)}
        subtitle="Non-converted, non-archived"
      />

      <StatCard
        icon={Mail}
        title="Spark Signups"
        primary={fmt(data.sparkSubscribers)}
        subtitle="Active email subscribers"
      />

      <StatCard
        icon={Calendar}
        title="Webinar Regs"
        primary={fmt(data.webinarRegistrations)}
        subtitle="Total registrants"
      />

      <StatCard
        icon={CreditCard}
        title="Orders & Revenue"
        primary={data.orders === null ? '—' : revenueDisplay}
        subtitle={
          data.orders === null
            ? <span title="Stripe data unavailable — check service status">—</span>
            : `${orderCount} order${orderCount !== 1 ? 's' : ''}`
        }
      />

      <StatCard
        icon={Flame}
        title="Hot Leads"
        primary={fmt(data.hotLeads)}
        subtitle="Webinar-registered applicants"
      />

      <StatCard
        icon={UserCheck}
        title="My Leads"
        primary={fmt(data.myLeads)}
        subtitle="Assigned to you, active"
      />
    </div>
  );
}
