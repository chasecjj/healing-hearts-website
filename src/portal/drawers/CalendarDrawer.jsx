/**
 * CalendarDrawer — Book a Session + Upcoming + Timeline Challenges stub
 *
 * Spec: wave3-drawer-content-specs §6
 * - Cal.com POPUP (not iframe); v1 uses a STUB button per brief (Slice 6 wires live)
 * - No live Cal.com embed in this slice (hard constraint from dispatch brief)
 */

import React from 'react';
import { DrawerShell, DrawerSection, EmptyState } from './DrawerShell';
import { getTypeStyle } from '../design/typography';

export default function CalendarDrawer() {
  // Coming-soon stub CTA per brief: "CalendarDrawer uses a stub 'Coming soon'
  // for the CTA until Slice 6 is explicitly dispatched."
  const handleBook = () => {
    // eslint-disable-next-line no-alert
    window.alert('Session booking launches with Slice 6. Coming soon.');
  };

  return (
    <DrawerShell title="Calendar" ariaContext="Calendar">
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

      <DrawerSection label="Coming Soon" defaultOpen={false}>
        <div
          className="px-3 py-2"
          style={{
            ...getTypeStyle('caption'),
            color: 'var(--pt-text-muted-hex, #57534e)',
          }}
        >
          🏆 Timeline Challenges — 90-day rebuild, 14-day spark, and more.
        </div>
      </DrawerSection>
    </DrawerShell>
  );
}
