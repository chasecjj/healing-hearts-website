/**
 * DashboardHero — Wave 5 Screen 1 hero-state mockup.
 *
 * Genre: Calm × Headspace × MasterClass (scout-wave5-B-lms-sanctuary §1,6).
 * Emotional-first, not metric-dense. Warm sanctuary landing.
 *
 * Layout (top→bottom):
 *   1. Greeting with name (large warm serif, 48-64px)
 *   2. ONE hero card — today's next lesson, warm imagery placeholder,
 *      "Continue where you left off" framing, single primary CTA
 *   3. Horizontal "Continue Watching" rail — 3-4 MasterClass-style tiles
 *   4. Compact journey stats strip (demoted below-fold)
 *   5. Secondary "My Courses" grid at bottom
 *
 * Design tokens only — no inline hex. Desktop-only (~1440px).
 */

import React from 'react';
import { ArrowRight, Clock } from 'lucide-react';
import {
  MOCK_USER,
  MOCK_HERO_LESSON,
  MOCK_CONTINUE_RAIL,
  MOCK_JOURNEY_STATS,
  MOCK_COURSES,
} from './mockData';

/* ── Atmospheric warm gradient backdrop (D10-safe, chroma < 0.12) ─────── */
function AmbientBackdrop() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        // Triple radial wash — dawn sky feel. All chroma < 0.08, within D10.
        background:
          'radial-gradient(ellipse 70% 50% at 20% 0%, rgba(184, 145, 119, 0.22), transparent 60%),' +
          'radial-gradient(ellipse 50% 40% at 85% 10%, rgba(185, 106, 95, 0.14), transparent 65%),' +
          'radial-gradient(ellipse 120% 60% at 50% 100%, rgba(198, 138, 78, 0.10), transparent 70%)',
      }}
    />
  );
}

/* ── Hero lesson cover — warm tinted placeholder + subtle grain ──────── */
function HeroCover({ tint }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        background:
          `linear-gradient(135deg, ${tint} 0%, #8F6A54 55%, #3A2E27 100%)`,
      }}
    >
      {/* Soft vignette for depth */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 80% 60% at 30% 30%, rgba(255,240,220,0.25), transparent 65%)',
        }}
      />
      {/* Slow-motion grain using tiny SVG noise */}
      <svg
        width="100%"
        height="100%"
        style={{ position: 'absolute', inset: 0, opacity: 0.18, mixBlendMode: 'overlay' }}
      >
        <filter id="mockup-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" />
          <feColorMatrix values="0 0 0 0 0.3  0 0 0 0 0.2  0 0 0 0 0.15  0 0 0 0.8 0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#mockup-grain)" />
      </svg>
    </div>
  );
}

/* ── Small cover for rail tiles ──────────────────────────────────────── */
function TileCover({ tint }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        background: `linear-gradient(160deg, ${tint} 0%, #2E2620 100%)`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 60% 50% at 40% 25%, rgba(255,240,220,0.18), transparent 60%)',
        }}
      />
    </div>
  );
}

export default function DashboardHero() {
  const { firstName } = MOCK_USER;

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
          padding: '64px 48px 96px',
        }}
      >
        {/* ── 1. Greeting ─────────────────────────────────────── */}
        <section style={{ marginBottom: 48 }}>
          <p
            style={{
              fontFamily: '"Outfit", sans-serif',
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'var(--pt-text-muted-hex, #57534e)',
              margin: 0,
              marginBottom: 18,
            }}
          >
            Thursday · Quiet morning
          </p>
          <h1
            style={{
              fontFamily: '"Playfair Display", Georgia, serif',
              fontWeight: 400,
              fontSize: 'clamp(48px, 5vw, 64px)',
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
              color: 'var(--pt-text-primary-hex, #1c1917)',
              margin: 0,
              maxWidth: 820,
            }}
          >
            Welcome back,{' '}
            <span
              style={{
                fontStyle: 'italic',
                color: 'var(--pt-primary-accent-hex, #B96A5F)',
              }}
            >
              {firstName}
            </span>
            .
          </h1>
          <p
            style={{
              fontFamily: '"Playfair Display", Georgia, serif',
              fontStyle: 'italic',
              fontSize: 20,
              lineHeight: 1.5,
              color: 'var(--pt-text-muted-hex, #57534e)',
              margin: '14px 0 0',
              maxWidth: 580,
            }}
          >
            Take a breath. You've picked this up again, and that's the whole practice.
          </p>
        </section>

        {/* ── 2. Hero card — today's next lesson ──────────────── */}
        <section style={{ marginBottom: 56 }}>
          <article
            style={{
              position: 'relative',
              borderRadius: 28,
              overflow: 'hidden',
              minHeight: 380,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              boxShadow:
                '0 30px 60px -30px rgba(28,25,23,0.25), 0 8px 20px -10px rgba(28,25,23,0.12)',
            }}
          >
            <HeroCover tint={MOCK_HERO_LESSON.coverTint} />

            {/* Content — light-on-dark over cover */}
            <div
              style={{
                position: 'relative',
                padding: '48px 52px 44px',
                maxWidth: 640,
                color: '#fafaf9',
              }}
            >
              <span
                style={{
                  fontFamily: '"Outfit", sans-serif',
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.28em',
                  textTransform: 'uppercase',
                  color: 'rgba(250,250,249,0.78)',
                  display: 'block',
                  marginBottom: 14,
                }}
              >
                Continue where you left off
              </span>
              <p
                style={{
                  fontFamily: '"Outfit", sans-serif',
                  fontSize: 12,
                  fontWeight: 500,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'rgba(250,250,249,0.65)',
                  margin: '0 0 8px',
                }}
              >
                Module {MOCK_HERO_LESSON.moduleNumber} · Lesson {MOCK_HERO_LESSON.lessonNumber}
              </p>
              <h2
                style={{
                  fontFamily: '"Playfair Display", Georgia, serif',
                  fontSize: 42,
                  lineHeight: 1.1,
                  fontWeight: 400,
                  letterSpacing: '-0.015em',
                  margin: '0 0 24px',
                  color: '#fafaf9',
                }}
              >
                {MOCK_HERO_LESSON.lessonTitle}
              </h2>

              {/* Resume meta + CTA row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 24,
                  marginTop: 32,
                }}
              >
                <button
                  type="button"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '14px 26px',
                    borderRadius: 999,
                    border: 'none',
                    cursor: 'pointer',
                    background: 'var(--pt-primary-accent-hex, #B96A5F)',
                    color: '#fafaf9',
                    fontFamily: '"Outfit", sans-serif',
                    fontWeight: 600,
                    fontSize: 14,
                    letterSpacing: '0.04em',
                    boxShadow: '0 10px 24px -8px rgba(185,106,95,0.55)',
                    transition: 'transform 150ms cubic-bezier(0.19,1,0.22,1)',
                  }}
                >
                  Continue lesson
                  <ArrowRight size={16} strokeWidth={2} />
                </button>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    color: 'rgba(250,250,249,0.70)',
                    fontFamily: '"Outfit", sans-serif',
                    fontSize: 13,
                  }}
                >
                  <Clock size={14} strokeWidth={1.75} />
                  <span>{MOCK_HERO_LESSON.duration} min remaining</span>
                </div>
              </div>

              {/* Tiny resume progress stroke — not a metric, just a ghost */}
              <div
                aria-hidden="true"
                style={{
                  marginTop: 28,
                  width: 200,
                  height: 2,
                  background: 'rgba(250,250,249,0.18)',
                  borderRadius: 2,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${MOCK_HERO_LESSON.resumeFraction * 100}%`,
                    height: '100%',
                    background: 'rgba(250,250,249,0.65)',
                  }}
                />
              </div>
            </div>
          </article>
        </section>

        {/* ── 3. Continue Watching rail ──────────────────────── */}
        <section style={{ marginBottom: 64 }}>
          <header
            style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              marginBottom: 20,
            }}
          >
            <h3
              style={{
                fontFamily: '"Playfair Display", Georgia, serif',
                fontSize: 24,
                fontWeight: 400,
                letterSpacing: '-0.01em',
                color: 'var(--pt-text-primary-hex, #1c1917)',
                margin: 0,
              }}
            >
              Pick up where you wandered off
            </h3>
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
              Recent
            </span>
          </header>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 20,
            }}
          >
            {MOCK_CONTINUE_RAIL.map((item) => (
              <article
                key={item.id}
                style={{
                  borderRadius: 20,
                  overflow: 'hidden',
                  background: 'var(--pt-elevation-2-hex, #ffffff)',
                  boxShadow: '0 12px 28px -18px rgba(28,25,23,0.18)',
                  cursor: 'pointer',
                  transition: 'transform 200ms cubic-bezier(0.19,1,0.22,1)',
                }}
              >
                <div style={{ position: 'relative', aspectRatio: '4 / 3' }}>
                  <TileCover tint={item.tint} />
                </div>
                <div style={{ padding: '16px 18px 18px' }}>
                  <p
                    style={{
                      fontFamily: '"Outfit", sans-serif',
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      color: 'var(--pt-text-muted-hex, #57534e)',
                      margin: '0 0 6px',
                    }}
                  >
                    {item.module}
                  </p>
                  <h4
                    style={{
                      fontFamily: '"Playfair Display", Georgia, serif',
                      fontSize: 18,
                      fontWeight: 400,
                      letterSpacing: '-0.005em',
                      color: 'var(--pt-text-primary-hex, #1c1917)',
                      margin: 0,
                      lineHeight: 1.25,
                    }}
                  >
                    {item.title}
                  </h4>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ── 4. Journey stats — compact strip (demoted) ──────── */}
        <section
          style={{
            padding: '28px 32px',
            borderRadius: 18,
            background: 'var(--pt-elevation-1-hex, #e7e5e4)',
            border: '1px solid var(--pt-border-subtle-hex, #d6d3d1)',
            display: 'flex',
            alignItems: 'center',
            gap: 48,
            marginBottom: 64,
          }}
        >
          <div>
            <p
              style={{
                fontFamily: '"Outfit", sans-serif',
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: 'var(--pt-text-muted-hex, #57534e)',
                margin: 0,
                marginBottom: 4,
              }}
            >
              Your quiet progress
            </p>
            <p
              style={{
                fontFamily: '"Playfair Display", Georgia, serif',
                fontStyle: 'italic',
                fontSize: 15,
                color: 'var(--pt-text-muted-hex, #57534e)',
                margin: 0,
              }}
            >
              No leaderboards. No streaks. Just steps.
            </p>
          </div>

          <div
            style={{
              flex: 1,
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 24,
            }}
          >
            {[
              { label: 'Lessons', value: MOCK_JOURNEY_STATS.lessonsCompleted },
              { label: 'Now on', value: MOCK_JOURNEY_STATS.moduleInProgress, small: true },
              { label: 'Total', value: MOCK_JOURNEY_STATS.totalLessons },
              { label: 'Overall', value: `${MOCK_JOURNEY_STATS.overallProgressPct}%` },
            ].map((stat) => (
              <div key={stat.label}>
                <div
                  style={{
                    fontFamily: '"Outfit", sans-serif',
                    fontWeight: 600,
                    fontSize: stat.small ? 16 : 22,
                    letterSpacing: '-0.01em',
                    color: 'var(--pt-text-primary-hex, #1c1917)',
                    lineHeight: 1.1,
                  }}
                >
                  {stat.value}
                </div>
                <div
                  style={{
                    fontFamily: '"Outfit", sans-serif',
                    fontSize: 11,
                    fontWeight: 500,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: 'var(--pt-text-muted-hex, #57534e)',
                    marginTop: 4,
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 5. My Courses grid (secondary, bottom) ──────────── */}
        <section>
          <header
            style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              marginBottom: 20,
            }}
          >
            <h3
              style={{
                fontFamily: '"Playfair Display", Georgia, serif',
                fontSize: 24,
                fontWeight: 400,
                letterSpacing: '-0.01em',
                color: 'var(--pt-text-primary-hex, #1c1917)',
                margin: 0,
              }}
            >
              My Courses
            </h3>
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
              {MOCK_COURSES.length} enrolled
            </span>
          </header>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 20,
            }}
          >
            {MOCK_COURSES.map((course) => (
              <article
                key={course.id}
                style={{
                  padding: '28px 26px',
                  borderRadius: 18,
                  background: 'var(--pt-elevation-2-hex, #ffffff)',
                  border: '1px solid var(--pt-border-subtle-hex, #d6d3d1)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Subtle per-course flavor stripe (directive #5 option b) */}
                <div
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 3,
                    background: course.tint,
                  }}
                />
                <p
                  style={{
                    fontFamily: '"Outfit", sans-serif',
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color: course.tint,
                    margin: '0 0 14px',
                  }}
                >
                  {course.badge}
                </p>
                <h4
                  style={{
                    fontFamily: '"Playfair Display", Georgia, serif',
                    fontSize: 22,
                    fontWeight: 400,
                    letterSpacing: '-0.01em',
                    color: 'var(--pt-text-primary-hex, #1c1917)',
                    margin: '0 0 8px',
                    lineHeight: 1.2,
                  }}
                >
                  {course.title}
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
                  {course.subtitle}
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
