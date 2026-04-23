import React from 'react';
import { Calendar } from 'lucide-react';
import { getTypeStyle } from './design/typography';

/**
 * CalendarPortal — placeholder for /portal/calendar
 * Round 2 will replace this with session scheduling and milestone tracking.
 */
export default function CalendarPortal() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-6 py-16">
      <h1 className="sr-only" style={getTypeStyle('heading-1')}>Calendar</h1>
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{ backgroundColor: 'var(--pt-elevation-1-hex, #e7e5e4)' }}
      >
        <Calendar
          className="w-8 h-8"
          style={{ color: 'var(--pt-primary-accent-hex, #B96A5F)', opacity: 0.6 }}
        />
      </div>
      <div className="text-center max-w-sm">
        <h2 className="font-outfit font-semibold text-foreground text-xl mb-2">
          Calendar
        </h2>
        <p className="text-foreground/55 text-sm leading-relaxed">
          Session scheduling and milestone tracking are coming. We're working on it.
        </p>
      </div>
      <span
        className="inline-block px-4 py-1.5 rounded-full text-xs font-outfit font-semibold uppercase tracking-wider"
        style={{
          backgroundColor: 'var(--pt-elevation-1-hex, #e7e5e4)',
          color: 'var(--pt-primary-accent-hex, #B96A5F)',
        }}
      >
        Coming Soon
      </span>
    </div>
  );
}
