/**
 * ModuleHero — Wave 5 Screen 2 hero-state mockup.
 *
 * Genre: Domestika × MasterClass (scout-wave5-B-lms-sanctuary §2,6).
 * Reverent, instructor-first, numbered learning journey. NO progress ring.
 *
 * Layout:
 *   1. Breadcrumb (← Return to Dashboard)
 *   2. Module heading: MODULE 2 eyebrow + large serif title +
 *      descriptive paragraph + warm hero imagery placeholder
 *   3. Learning Journey — numbered vertical list with state pills
 *   4. Module Resources — 2 tiles (Reflection Journal, Grounding Meditation)
 *
 * No 0% progress ring (scout-B finding: quantified progress creates anxiety).
 * Replaced with quiet "3 of 7 lessons complete" text line.
 */

import React from 'react';
import { ArrowLeft, ArrowRight, Check, FileText, Headphones, Play } from 'lucide-react';
import { MOCK_MODULE } from './mockData';

/* ── Atmospheric warm gradient backdrop ────────────────────────────── */
function AmbientBackdrop() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        background:
          'radial-gradient(ellipse 60% 40% at 80% 0%, rgba(185, 106, 95, 0.12), transparent 65%),' +
          'radial-gradient(ellipse 80% 50% at 10% 30%, rgba(184, 145, 119, 0.16), transparent 70%)',
      }}
    />
  );
}

/* ── Module cover — warm terracotta-to-dusk gradient + grain ──────── */
function ModuleCover() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        background:
          'linear-gradient(135deg, #B96A5F 0%, #8F5248 45%, #3A2E27 100%)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 70% 50% at 25% 30%, rgba(255,232,200,0.22), transparent 65%)',
        }}
      />
      <svg
        width="100%"
        height="100%"
        style={{ position: 'absolute', inset: 0, opacity: 0.16, mixBlendMode: 'overlay' }}
      >
        <filter id="mod-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7" />
          <feColorMatrix values="0 0 0 0 0.3  0 0 0 0 0.2  0 0 0 0 0.15  0 0 0 0.8 0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#mod-grain)" />
      </svg>
    </div>
  );
}

/* ── State pill for lesson row ────────────────────────────────────── */
function StatePill({ state }) {
  const variants = {
    Complete: {
      bg: 'transparent',
      border: 'var(--pt-border-subtle-hex, #d6d3d1)',
      color: 'var(--pt-text-muted-hex, #57534e)',
    },
    'In Progress': {
      bg: 'rgba(185, 106, 95, 0.08)',
      border: 'var(--pt-primary-accent-hex, #B96A5F)',
      color: 'var(--pt-primary-accent-hex, #B96A5F)',
    },
    Upcoming: {
      bg: 'transparent',
      border: 'transparent',
      color: 'rgba(87, 83, 78, 0.55)',
    },
  };
  const v = variants[state] ?? variants.Upcoming;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '5px 12px',
        borderRadius: 999,
        border: `1px solid ${v.border}`,
        background: v.bg,
        color: v.color,
        fontFamily: '"Outfit", sans-serif',
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
      }}
    >
      {state}
    </span>
  );
}

/* ── Lesson row ─────────────────────────────────────────────────────── */
function LessonRow({ lesson, index }) {
  const isComplete = lesson.state === 'Complete';
  const isActive = lesson.state === 'In Progress';
  const isUpcoming = lesson.state === 'Upcoming';

  return (
    <li
      style={{
        display: 'grid',
        gridTemplateColumns: '48px 1fr auto',
        alignItems: 'center',
        gap: 20,
        padding: '20px 24px',
        borderRadius: 14,
        background: isActive
          ? 'var(--pt-elevation-2-hex, #ffffff)'
          : 'transparent',
        boxShadow: isActive ? '0 6px 18px -12px rgba(28,25,23,0.2)' : 'none',
        cursor: isUpcoming ? 'default' : 'pointer',
        transition: 'background 150ms',
      }}
    >
      {/* Numbered indicator */}
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: isComplete
            ? 'var(--pt-elevation-1-hex, #e7e5e4)'
            : isActive
            ? 'var(--pt-primary-accent-hex, #B96A5F)'
            : 'transparent',
          border: isUpcoming
            ? '1px dashed var(--pt-border-subtle-hex, #d6d3d1)'
            : 'none',
          color: isActive
            ? '#fafaf9'
            : isComplete
            ? 'var(--pt-text-muted-hex, #57534e)'
            : 'rgba(87, 83, 78, 0.55)',
          fontFamily: '"Outfit", sans-serif',
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: '0.03em',
        }}
      >
        {isComplete ? <Check size={16} strokeWidth={2.25} /> : lesson.num}
      </div>

      {/* Title + meta */}
      <div style={{ minWidth: 0 }}>
        <p
          style={{
            fontFamily: '"Outfit", sans-serif',
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--pt-text-muted-hex, #57534e)',
            margin: 0,
            marginBottom: 4,
          }}
        >
          Lesson {lesson.num}
        </p>
        <h5
          style={{
            fontFamily: '"Playfair Display", Georgia, serif',
            fontSize: 19,
            fontWeight: 400,
            letterSpacing: '-0.005em',
            color: isUpcoming
              ? 'rgba(28, 25, 23, 0.45)'
              : 'var(--pt-text-primary-hex, #1c1917)',
            margin: 0,
            lineHeight: 1.25,
          }}
        >
          {lesson.title}
        </h5>
      </div>

      {/* State pill */}
      <StatePill state={lesson.state} />
    </li>
  );
}

export default function ModuleHero() {
  const mod = MOCK_MODULE;

  return (
    <div
      className="relative min-h-screen"
      style={{ backgroundColor: 'var(--pt-content-bg-hex, #f5f5f4)' }}
    >
      <AmbientBackdrop />

      <div
        className="relative"
        style={{
          maxWidth: 1180,
          margin: '0 auto',
          padding: '48px 48px 96px',
        }}
      >
        {/* ── 1. Breadcrumb ───────────────────────────────────── */}
        <button
          type="button"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '6px 0',
            fontFamily: '"Outfit", sans-serif',
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--pt-text-muted-hex, #57534e)',
            marginBottom: 40,
          }}
        >
          <ArrowLeft size={14} strokeWidth={1.75} />
          Return to Dashboard
        </button>

        {/* ── 2. Module heading + hero imagery ────────────────── */}
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: '1.15fr 1fr',
            gap: 48,
            alignItems: 'stretch',
            marginBottom: 80,
          }}
        >
          <div
            style={{
              paddingTop: 12,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <p
              style={{
                fontFamily: '"Outfit", sans-serif',
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                color: 'var(--pt-primary-accent-hex, #B96A5F)',
                margin: 0,
                marginBottom: 16,
              }}
            >
              {mod.eyebrow}
            </p>
            <h1
              style={{
                fontFamily: '"Playfair Display", Georgia, serif',
                fontSize: 'clamp(44px, 4.8vw, 60px)',
                fontWeight: 400,
                fontStyle: 'italic',
                letterSpacing: '-0.02em',
                lineHeight: 1.05,
                color: 'var(--pt-text-primary-hex, #1c1917)',
                margin: 0,
                marginBottom: 24,
              }}
            >
              {mod.title}
            </h1>
            <p
              style={{
                fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
                fontSize: 17,
                lineHeight: 1.6,
                color: 'var(--pt-text-muted-hex, #57534e)',
                margin: 0,
                maxWidth: 480,
              }}
            >
              {mod.description}
            </p>

            {/* Quiet progress line (replaces 0% ring per scout-B) */}
            <p
              style={{
                fontFamily: '"Outfit", sans-serif',
                fontSize: 13,
                fontWeight: 500,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--pt-text-muted-hex, #57534e)',
                margin: '32px 0 0',
              }}
            >
              {mod.lessonsCompleteText}
            </p>
          </div>

          <div
            style={{
              position: 'relative',
              minHeight: 360,
              borderRadius: 24,
              overflow: 'hidden',
              boxShadow:
                '0 24px 48px -24px rgba(28,25,23,0.25), 0 8px 18px -12px rgba(28,25,23,0.12)',
            }}
          >
            <ModuleCover />
            {/* Overlay decoration — the number '02' in a tall serif */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                bottom: 24,
                right: 32,
                fontFamily: '"Playfair Display", Georgia, serif',
                fontSize: 180,
                fontWeight: 400,
                fontStyle: 'italic',
                lineHeight: 0.85,
                color: 'rgba(250, 232, 212, 0.22)',
                letterSpacing: '-0.04em',
                pointerEvents: 'none',
              }}
            >
              02
            </div>
          </div>
        </section>

        {/* ── 3. Learning Journey ─────────────────────────────── */}
        <section style={{ marginBottom: 80 }}>
          <header
            style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              marginBottom: 24,
              paddingBottom: 16,
              borderBottom: '1px solid var(--pt-border-subtle-hex, #d6d3d1)',
            }}
          >
            <h2
              style={{
                fontFamily: '"Playfair Display", Georgia, serif',
                fontSize: 28,
                fontWeight: 400,
                letterSpacing: '-0.01em',
                color: 'var(--pt-text-primary-hex, #1c1917)',
                margin: 0,
              }}
            >
              Learning Journey
            </h2>
            <span
              style={{
                fontFamily: '"Outfit", sans-serif',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: 'var(--pt-text-muted-hex, #57534e)',
              }}
            >
              {mod.lessons.length} lessons
            </span>
          </header>

          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            {mod.lessons.map((lesson, i) => (
              <LessonRow key={lesson.num} lesson={lesson} index={i} />
            ))}
          </ul>
        </section>

        {/* ── 4. Module Resources ─────────────────────────────── */}
        <section>
          <h2
            style={{
              fontFamily: '"Playfair Display", Georgia, serif',
              fontSize: 28,
              fontWeight: 400,
              letterSpacing: '-0.01em',
              color: 'var(--pt-text-primary-hex, #1c1917)',
              margin: 0,
              marginBottom: 24,
              paddingBottom: 16,
              borderBottom: '1px solid var(--pt-border-subtle-hex, #d6d3d1)',
            }}
          >
            Module Resources
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 20,
            }}
          >
            {mod.resources.map((r, i) => (
              <article
                key={r.title}
                style={{
                  padding: '32px 32px 28px',
                  borderRadius: 18,
                  background: 'var(--pt-elevation-2-hex, #ffffff)',
                  border: '1px solid var(--pt-border-subtle-hex, #d6d3d1)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: 'var(--pt-elevation-1-hex, #e7e5e4)',
                    color: 'var(--pt-primary-accent-hex, #B96A5F)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {i === 0 ? (
                    <FileText size={20} strokeWidth={1.75} />
                  ) : (
                    <Headphones size={20} strokeWidth={1.75} />
                  )}
                </div>

                <div>
                  <p
                    style={{
                      fontFamily: '"Outfit", sans-serif',
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: '0.2em',
                      textTransform: 'uppercase',
                      color: 'var(--pt-text-muted-hex, #57534e)',
                      margin: '0 0 6px',
                    }}
                  >
                    {r.kind}
                  </p>
                  <h4
                    style={{
                      fontFamily: '"Playfair Display", Georgia, serif',
                      fontSize: 22,
                      fontWeight: 400,
                      letterSpacing: '-0.005em',
                      color: 'var(--pt-text-primary-hex, #1c1917)',
                      margin: '0 0 8px',
                      lineHeight: 1.2,
                    }}
                  >
                    {r.title}
                  </h4>
                  <p
                    style={{
                      fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
                      fontSize: 14,
                      lineHeight: 1.55,
                      color: 'var(--pt-text-muted-hex, #57534e)',
                      margin: 0,
                    }}
                  >
                    {r.copy}
                  </p>
                </div>

                <button
                  type="button"
                  style={{
                    alignSelf: 'flex-start',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 18px',
                    borderRadius: 999,
                    border: '1px solid var(--pt-border-strong-hex, #78716c)',
                    background: 'transparent',
                    color: 'var(--pt-text-primary-hex, #1c1917)',
                    cursor: 'pointer',
                    fontFamily: '"Outfit", sans-serif',
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    marginTop: 4,
                  }}
                >
                  {i === 0 ? 'Open journal' : 'Listen'}
                  {i === 0 ? (
                    <ArrowRight size={14} strokeWidth={1.75} />
                  ) : (
                    <Play size={12} strokeWidth={2} fill="currentColor" />
                  )}
                </button>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
