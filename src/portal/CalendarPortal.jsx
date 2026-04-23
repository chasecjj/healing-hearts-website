import React from 'react';
import { Calendar } from 'lucide-react';

/**
 * CalendarPortal — placeholder for /portal/calendar
 * Round 2 will replace this with session scheduling and milestone tracking.
 */
export default function CalendarPortal() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-6 py-16">
      <div className="w-16 h-16 rounded-2xl bg-elevation-1 flex items-center justify-center">
        <Calendar className="w-8 h-8 text-primary/60" />
      </div>
      <div className="text-center max-w-sm">
        <h2 className="font-outfit font-semibold text-foreground text-xl mb-2">
          Calendar
        </h2>
        <p className="text-foreground/55 text-sm leading-relaxed">
          Session scheduling and milestone tracking are coming. We're working on it.
        </p>
      </div>
      <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-outfit font-semibold uppercase tracking-wider">
        Coming Soon
      </span>
    </div>
  );
}
