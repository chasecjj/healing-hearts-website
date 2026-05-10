/**
 * CalendarDrawer — pure sub-tab navigation (Wave 9 architectural pivot).
 *
 * Wave 9 E4: 7-day strip with expandable per-day detail + booking button stub
 * REMOVED. Drawer is now an Upcoming-events list with Link-routed items.
 * Booking + day-detail UI lives on the main /portal/calendar page.
 *
 * Spec amendment: see ./reports/wave-9-spec-amendment.md
 *
 * 3.18: inline-start/inline-end logical properties.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { DrawerShell, DrawerSection, EmptyState } from './DrawerShell';
import { getTypeStyle } from '../design/typography';

const DAY_ABBREV = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function UpcomingDayRow({ date, isToday }) {
  const iso = date.toISOString().slice(0, 10);
  const dayLabel = `${DAY_ABBREV[date.getDay()]} ${date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })}`;
  return (
    <Link
      to={{
        pathname: '/portal/calendar',
        search: `?date=${encodeURIComponent(iso)}`,
      }}
      className="flex items-center gap-3 w-full px-3 py-1.5 rounded-lg"
      style={{
        ...getTypeStyle('body'),
        color: 'var(--pt-text-primary-hex, #1c1917)',
        backgroundColor: 'transparent',
        textDecoration: 'none',
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.backgroundColor = 'var(--pt-drawer-hover-hex, #a8a29e)')
      }
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
    >
      <span
        aria-hidden="true"
        style={{
          ...getTypeStyle('caption'),
          color: isToday
            ? 'var(--pt-primary-accent-hex, #B96A5F)'
            : 'var(--pt-text-muted-hex, #57534e)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          minWidth: 56,
        }}
      >
        {isToday ? 'Today' : dayLabel}
      </span>
      <span
        className="flex-1"
        style={{
          ...getTypeStyle('caption'),
          color: 'var(--pt-text-muted-hex, #57534e)',
        }}
      >
        No events
      </span>
    </Link>
  );
}

export default function CalendarDrawer() {
  // 7-day strip — stub data; live wiring deferred. Click navigates to
  // /portal/calendar?date=<iso> for detail + booking on the main page.
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });

  const hasEvents = false; // stub: future hook supplies real events

  return (
    <DrawerShell title="Calendar" ariaContext="Calendar" drawerId="calendar">
      <DrawerSection label="Upcoming">
        {hasEvents ? (
          <div>
            {days.map((d, i) => (
              <UpcomingDayRow
                key={d.toISOString()}
                date={d}
                isToday={i === 0}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon="📅"
            message="No upcoming sessions"
            sub="Open the calendar to book time with your guide."
            cta={
              <Link
                to="/portal/calendar"
                style={{
                  ...getTypeStyle('caption', 'medium'),
                  padding: '6px 14px',
                  borderRadius: 999,
                  backgroundColor: 'var(--pt-primary-accent-hex, #B96A5F)',
                  color: 'var(--pt-text-inverse-hex, #fafaf9)',
                  textDecoration: 'none',
                }}
              >
                Open Calendar
              </Link>
            }
          />
        )}
      </DrawerSection>
    </DrawerShell>
  );
}
