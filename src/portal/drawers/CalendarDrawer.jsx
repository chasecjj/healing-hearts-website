/**
 * CalendarDrawer — 7-day strip + Book a Session stub + Upcoming events.
 *
 * Spec: 2.6 (week-at-glance: 7-day horizontal strip + expandable detail).
 * Cal.com POPUP (not iframe); v1 uses a STUB button per brief (Slice 6 wires live).
 * 3.18: inline-start/inline-end logical properties.
 */

import React, { useState } from 'react';
import { DrawerShell, DrawerSection, EmptyState } from './DrawerShell';
import { getTypeStyle } from '../design/typography';

const DAY_ABBREV = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarDrawer() {
  const [expandedDay, setExpandedDay] = useState(null);

  // 7-day strip — stub data, live wiring deferred to Slice 6
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });

  const handleBook = () => {
    // eslint-disable-next-line no-alert
    window.alert('Session booking launches with Slice 6. Coming soon.');
  };

  return (
    <DrawerShell title="Calendar" ariaContext="Calendar">
      {/* 7-day horizontal strip header (2.6) */}
      <div
        className="flex gap-1 px-2 py-3 overflow-x-auto border-b"
        role="list"
        aria-label="Next 7 days"
        style={{ borderColor: 'var(--pt-border-subtle-hex, #d6d3d1)' }}
      >
        {days.map((d, i) => {
          const isToday = i === 0;
          const isExpanded = expandedDay === i;
          return (
            <button
              key={d.toISOString()}
              role="listitem"
              type="button"
              onClick={() => setExpandedDay(isExpanded ? null : i)}
              aria-expanded={isExpanded}
              aria-label={`${DAY_ABBREV[d.getDay()]} ${d.getDate()}${isToday ? ', today' : ''}`}
              className="flex flex-col items-center gap-1 px-2 py-2 min-w-[40px] rounded-lg"
              style={{
                backgroundColor:
                  isExpanded || isToday
                    ? 'var(--pt-elevation-1-hex, #e7e5e4)'
                    : 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <span
                style={{
                  ...getTypeStyle('caption'),
                  color: 'var(--pt-text-muted-hex, #57534e)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {DAY_ABBREV[d.getDay()]}
              </span>
              <span
                style={{
                  ...getTypeStyle('body'),
                  fontWeight: 700,
                  color: isToday
                    ? 'var(--pt-primary-accent-hex, #B96A5F)'
                    : 'var(--pt-text-primary-hex, #1c1917)',
                }}
              >
                {d.getDate()}
              </span>
              {/* event-dot placeholder */}
              <span
                className="w-1 h-1 rounded-full"
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

      {/* Expandable day detail (2.6) */}
      {expandedDay !== null && (
        <div
          className="px-3 py-3 border-b"
          style={{ borderColor: 'var(--pt-border-subtle-hex, #d6d3d1)' }}
        >
          <p
            style={{
              ...getTypeStyle('caption'),
              color: 'var(--pt-text-muted-hex, #57534e)',
            }}
          >
            {days[expandedDay].toLocaleDateString(undefined, {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
            {' — '}No events scheduled.
          </p>
        </div>
      )}

      <div className="px-3 py-3">
        <button
          type="button"
          onClick={handleBook}
          style={{
            ...getTypeStyle('body', 'semibold'),
            width: '100%',
            padding: '10px 14px',
            borderRadius: 12,
            border: 'none',
            backgroundColor: 'var(--pt-primary-accent-hex, #B96A5F)',
            color: 'var(--pt-text-inverse-hex, #fafaf9)',
            cursor: 'pointer',
          }}
        >
          Book a Session
        </button>
        <p
          style={{
            ...getTypeStyle('meta'),
            color: 'var(--pt-text-muted-hex, #57534e)',
            marginTop: 6,
          }}
        >
          Cal.com popup launches Slice 6 — stub active.
        </p>
      </div>

      <DrawerSection label="Upcoming">
        <EmptyState
          icon="📅"
          message="No upcoming sessions"
          sub="[Trisha-voice placeholder: Extra time with your guide can change the whole trajectory.]"
        />
      </DrawerSection>
    </DrawerShell>
  );
}
