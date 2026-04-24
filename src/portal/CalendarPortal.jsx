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
    <div className="px-4 sm:px-8 lg:px-12 py-8 sm:py-16 max-w-[960px] mx-auto w-full">
      <h1
        className="font-drama font-bold mb-8"
        style={{ color: 'var(--pt-text-primary-hex, #1c1917)', fontSize: '2rem', lineHeight: 1.2 }}
      >
        Calendar
      </h1>

      {/* 7-day horizontal strip (2.6) */}
      <div
        className="flex gap-1 pb-6 mb-8 overflow-x-auto border-b"
        role="list"
        aria-label="Next 7 days"
        style={{ borderColor: 'var(--pt-border-subtle-hex, #d6d3d1)' }}
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
              className="flex flex-col items-center gap-1 px-3 py-2 min-w-[52px] rounded-lg"
              style={{
                backgroundColor: isSelected
                  ? 'var(--pt-elevation-1-hex, #e7e5e4)'
                  : 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <span
                className="text-xs font-outfit uppercase tracking-wide"
                style={{ color: 'var(--pt-text-muted-hex, #57534e)' }}
              >
                {DAY_ABBREV[d.getDay()]}
              </span>
              <span
                className="text-lg font-drama font-bold"
                style={{
                  color: isToday
                    ? 'var(--pt-primary-accent-hex, #B96A5F)'
                    : 'var(--pt-text-primary-hex, #1c1917)',
                }}
              >
                {d.getDate()}
              </span>
              {/* event-dot placeholder */}
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  backgroundColor: isToday
                    ? 'var(--pt-primary-accent-hex, #B96A5F)'
                    : 'transparent',
                }}
                aria-hidden="true"
              />
            </button>
          );
        })}
      </div>

      {/* Selected-day detail — no card chrome */}
      <div className="mb-8">
        <h2
          className="font-outfit font-semibold text-sm uppercase tracking-widest mb-3"
          style={{ color: 'var(--pt-text-muted-hex, #57534e)' }}
        >
          {days[selectedDay].toLocaleDateString(undefined, {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </h2>
        {/* A-11 rest-permission copy */}
        <p
          className="text-base leading-relaxed"
          style={{ color: 'var(--pt-text-muted-hex, #57534e)' }}
        >
          No sessions scheduled — no pressure.
        </p>
      </div>

      {/* Book-a-session CTA stub (Slice 6) */}
      <button
        type="button"
        onClick={() => window.alert('Session booking launches with Slice 6. Coming soon.')}
        className="font-outfit font-semibold text-sm"
        style={{
          padding: '10px 20px',
          borderRadius: 9999,
          border: 'none',
          backgroundColor: 'var(--pt-primary-accent-hex, #B96A5F)',
          color: 'var(--pt-text-inverse-hex, #fafaf9)',
          cursor: 'pointer',
        }}
      >
        Book a Session
      </button>
    </div>
  );
}
