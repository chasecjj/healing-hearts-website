import React from 'react';
import { Link } from 'react-router-dom';
import { Users, CheckSquare } from 'lucide-react';
import usePageMeta from '../hooks/usePageMeta';
import KpiCards from '../components/admin/KpiCards';

/**
 * AdminPanel — operational admin dashboard.
 *
 * Wave 7 design pass: rewritten to use portal-warm-stone token system
 * (var(--pt-*)) instead of Tailwind `primary` (which resolves to teal — the
 * marketing-site brand color, NOT the portal palette). Admin surfaces now
 * match the rest of the authenticated portal aesthetic.
 *
 * Aesthetic direction: editorial-quiet. Eyebrow / Playfair italic title /
 * Outfit subtitle. Stat board uses warm cream surface, no chromatic gradient.
 */
export default function AdminPanel() {
  usePageMeta('Admin Panel', 'Healing Hearts administration dashboard.');

  const linkBase = {
    fontFamily: '"Outfit", sans-serif',
    fontSize: 13,
    fontWeight: 500,
    letterSpacing: '0.01em',
  };

  return (
    <div
      className="w-full min-h-screen"
      style={{ backgroundColor: 'var(--pt-content-bg-hex)' }}
    >
      <div className="max-w-5xl mx-auto px-6 pt-12 md:pt-20 pb-24">
        {/* ── Editorial header ─────────────────────────────────────── */}
        <header className="mb-14 max-w-2xl">
          <p
            style={{
              fontFamily: '"Outfit", sans-serif',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.24em',
              textTransform: 'uppercase',
              color: 'var(--pt-text-muted-hex)',
              margin: '0 0 18px',
            }}
          >
            Operational Admin
          </p>
          <h1
            style={{
              fontFamily: '"Playfair Display", Georgia, serif',
              fontWeight: 300,
              fontSize: 'clamp(36px, 4.5vw, 54px)',
              lineHeight: 1.08,
              letterSpacing: '-0.02em',
              color: 'var(--pt-text-primary-hex)',
              margin: '0 0 16px',
            }}
          >
            Live state across the{' '}
            <span style={{ fontStyle: 'italic', color: 'var(--pt-primary-accent-hex)' }}>
              Healing Hearts
            </span>{' '}
            funnel.
          </h1>
          <p
            style={{
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              fontSize: 16,
              lineHeight: 1.6,
              color: 'var(--pt-text-muted-hex)',
              margin: 0,
              fontWeight: 400,
            }}
          >
            Pipeline, applications, enrollments, and broadcasts &mdash; updated as queries return.
          </p>
        </header>

        {/* ── KPI board (warm cream surface, no chromatic gradient) ─ */}
        <section className="mb-16" aria-labelledby="kpi-heading">
          <div
            className="relative rounded-3xl overflow-hidden p-6 sm:p-10"
            style={{
              backgroundColor: 'var(--pt-elevation-warm-hex)',
              border: '1px solid var(--pt-border-soft-hex)',
              boxShadow: '0 1px 0 rgba(28, 25, 23, 0.02), 0 24px 48px -32px rgba(28, 25, 23, 0.08)',
            }}
          >
            {/* Decorative accent corner — soft, not dominant */}
            <div
              aria-hidden="true"
              className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none"
              style={{
                background:
                  'radial-gradient(circle at 70% 30%, var(--pt-primary-accent-soft-hex), transparent 60%)',
                transform: 'translate(40%, -30%)',
              }}
            />
            <div className="relative z-10">
              <h2
                id="kpi-heading"
                style={{
                  fontFamily: '"Outfit", sans-serif',
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color: 'var(--pt-text-muted-hex)',
                  margin: '0 0 28px',
                }}
              >
                Live Dashboard
              </h2>
              <KpiCards />
            </div>
          </div>
        </section>

        {/* ── Quick links — single visual register, no chromatic chaos ─ */}
        <nav aria-label="Admin quick links" className="flex flex-wrap items-center gap-3">
          <Link
            to="/admin/crm"
            style={{
              ...linkBase,
              color: 'var(--pt-elevation-2-hex)',
              backgroundColor: 'var(--pt-primary-accent-hex)',
              padding: '11px 22px',
              borderRadius: 999,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              transition: 'transform 150ms ease, opacity 150ms ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.92')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            <Users className="w-4 h-4" />
            CRM &mdash; Leads
          </Link>
          <Link
            to="/admin/tasks"
            style={{
              ...linkBase,
              color: 'var(--pt-text-primary-hex)',
              backgroundColor: 'var(--pt-elevation-2-hex)',
              border: '1px solid var(--pt-border-subtle-hex)',
              padding: '11px 22px',
              borderRadius: 999,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              transition: 'background-color 150ms ease',
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = 'var(--pt-elevation-warm-hex)')
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = 'var(--pt-elevation-2-hex)')
            }
          >
            <CheckSquare className="w-4 h-4" />
            Team Tasks
          </Link>
          <QuietLink to="/portal" label="Course Portal (Full Access)" />
          <QuietLink
            href="https://supabase.com/dashboard/project/qleojrlqnbiutyhfnqgb"
            label="Supabase Dashboard"
            external
          />
          <QuietLink href="https://resend.com" label="Resend (Email)" external />
        </nav>
      </div>
    </div>
  );
}

/**
 * QuietLink — secondary admin nav link in the muted register.
 * No chromatic fill, just a thin border that warms on hover.
 */
function QuietLink({ to, href, label, external }) {
  const baseStyle = {
    fontFamily: '"Outfit", sans-serif',
    fontSize: 13,
    fontWeight: 500,
    letterSpacing: '0.01em',
    color: 'var(--pt-text-muted-hex)',
    backgroundColor: 'transparent',
    border: '1px solid var(--pt-border-subtle-hex)',
    padding: '11px 22px',
    borderRadius: 999,
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    transition: 'color 150ms ease, border-color 150ms ease',
  };
  const handlers = {
    onMouseEnter: (e) => {
      e.currentTarget.style.color = 'var(--pt-text-primary-hex)';
      e.currentTarget.style.borderColor = 'var(--pt-text-primary-hex)';
    },
    onMouseLeave: (e) => {
      e.currentTarget.style.color = 'var(--pt-text-muted-hex)';
      e.currentTarget.style.borderColor = 'var(--pt-border-subtle-hex)';
    },
  };
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" style={baseStyle} {...handlers}>
        {label}
      </a>
    );
  }
  return (
    <Link to={to} style={baseStyle} {...handlers}>
      {label}
    </Link>
  );
}
