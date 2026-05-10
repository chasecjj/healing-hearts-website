import React, { useState } from 'react';

/**
 * CalendarPortal — session scheduling + milestone tracker.
 *
 * 2.6: 7-day horizontal strip.
 * 3.7-rev: no card chrome on learner content zones.
 * 3.18: inline-start/inline-end logical properties throughout.
 * A-11: rest-permission empty-state copy.
 *
 * Live Cal.com wiring deferred to Slice 6.
 */

const DAY_ABBREV = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarPortal() {
  const [selectedDay, setSelectedDay] = useState(0);

  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });

  return (
    <div className="px-4 sm:px-8 lg:px-12 py-10 sm:py-16 max-w-[960px] mx-auto w-full">
      {/* Wave 7: editorial header — eyebrow + Playfair italic title */}
      <header className="mb-12 max-w-2xl">
        <p
          style={{
            fontFamily: '"Outfit", sans-serif',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.24em',
            textTransform: 'uppercase',
            color: 'var(--pt-text-muted-hex, #57534e)',
            margin: '0 0 14px',
          }}
        >
          Your week
        </p>
        <h1
          style={{
            fontFamily: '"Playfair Display", Georgia, serif',
            fontWeight: 300,
            fontSize: 'clamp(34px, 4.5vw, 48px)',
            lineHeight: 1.08,
            letterSpacing: '-0.02em',
            color: 'var(--pt-text-primary-hex, #1c1917)',
            margin: '0 0 12px',
          }}
        >
          Calendar
        </h1>
        <p
          style={{
            fontFamily: '"Playfair Display", Georgia, serif',
            fontStyle: 'italic',
            fontWeight: 300,
            fontSize: 17,
            lineHeight: 1.55,
            color: 'var(--pt-text-muted-hex, #57534e)',
            margin: 0,
          }}
        >
          Seven days at a glance. Sessions appear here when scheduled.
        </p>
      </header>

      {/* 7-day horizontal strip (2.6) — Wave 7 refined day-button states */}
      <div
        className="flex gap-2 pb-6 mb-10 overflow-x-auto"
        role="list"
        aria-label="Next 7 days"
        style={{ borderBottom: '1px solid var(--pt-border-soft-hex, #e7e5e4)' }}
      >
        {days.map((d, i) => {
          const isToday = i === 0;
          const isSelected = selectedDay === i;
          return (
            <button
              key={d.toISOString()}
              role="listitem"
              type="button"
              onClick={() => setSelectedDay(i)}
              aria-pressed={isSelected}
              aria-label={`${DAY_ABBREV[d.getDay()]} ${d.getDate()}${isToday ? ', today' : ''}`}
              className="flex flex-col items-center gap-1.5 px-4 py-3 min-w-[60px] rounded-xl transition-all duration-150"
              style={{
                backgroundColor: isSelected
                  ? 'var(--pt-text-primary-hex, #1c1917)'
                  : 'transparent',
                border: '1px solid',
                // MED-08 fix: today (when not selected) gets a soft accent ring
                // so the breath-pulse on the numeral has visual chrome to read
                // against. Selected wins over today (heavier dark fill).
                borderColor: isSelected
                  ? 'var(--pt-text-primary-hex, #1c1917)'
                  : isToday
                  ? 'var(--pt-primary-accent-soft-hex, rgba(185,106,95,0.35))'
                  : 'transparent',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.backgroundColor =
                    'var(--pt-elevation-warm-hex, #faf7f2)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <span
                style={{
                  fontFamily: '"Outfit", sans-serif',
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: isSelected
                    ? 'rgba(255, 255, 255, 0.65)'
                    : 'var(--pt-text-muted-hex, #57534e)',
                }}
              >
                {DAY_ABBREV[d.getDay()]}
              </span>
              <span
                // MED-08 fix: apply pt-today-pulse breath animation to the
                // numeral when today and not selected. The keyframe lives in
                // src/index.css (4s ease-in-out, opacity 1 → 0.55 → 1) and
                // honors prefers-reduced-motion (animation: none under reduce).
                className={isToday && !isSelected ? 'pt-today-pulse' : ''}
                style={{
                  fontFamily: '"Playfair Display", Georgia, serif',
                  fontWeight: 400,
                  fontSize: 22,
                  lineHeight: 1,
                  letterSpacing: '-0.01em',
                  color: isSelected
                    ? '#ffffff'
                    : isToday
                    ? 'var(--pt-primary-accent-hex, #B96A5F)'
                    : 'var(--pt-text-primary-hex, #1c1917)',
                }}
              >
                {d.getDate()}
              </span>
              {/* event-dot placeholder — today gets soft pulse */}
              <span
                className={isToday && !isSelected ? 'pt-today-pulse' : ''}
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: 9999,
                  backgroundColor: isToday
                    ? isSelected
                      ? '#ffffff'
                      : 'var(--pt-primary-accent-hex, #B96A5F)'
                    : 'transparent',
                }}
                aria-hidden="true"
              />
            </button>
          );
        })}
      </div>

      {/* Selected-day detail — no card chrome */}
      <div className="mb-10">
        <p
          style={{
            fontFamily: '"Outfit", sans-serif',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--pt-text-muted-hex, #57534e)',
            margin: '0 0 10px',
          }}
        >
          {days[selectedDay].toLocaleDateString(undefined, {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </p>
        {/* A-11 rest-permission copy */}
        <p
          style={{
            fontFamily: '"Playfair Display", Georgia, serif',
            fontStyle: 'italic',
            fontWeight: 300,
            fontSize: 19,
            lineHeight: 1.5,
            color: 'var(--pt-text-muted-hex, #57534e)',
            margin: 0,
            maxWidth: 520,
          }}
        >
          No sessions scheduled &mdash; no pressure.
        </p>
      </div>

      {/* Book-a-session CTA stub (Slice 6) */}
      <button
        type="button"
        onClick={() => window.alert('Session booking launches with Slice 6. Coming soon.')}
        style={{
          fontFamily: '"Outfit", sans-serif',
          fontSize: 13,
          fontWeight: 500,
          letterSpacing: '0.01em',
          padding: '12px 24px',
          borderRadius: 9999,
          border: 'none',
          backgroundColor: 'var(--pt-primary-accent-hex, #B96A5F)',
          color: '#ffffff',
          cursor: 'pointer',
          transition: 'opacity 150ms ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.92')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
      >
        Book a Session
      </button>
    </div>
  );
}
