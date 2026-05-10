/**
 * JourneyView — placeholder for /portal/journey (Wave 9 E1 stub).
 *
 * Renders rest-permission empty-state per spec §A-11. Replaced in a future
 * wave with progress timeline / module path / completed-lessons surfaces.
 *
 * Editorial register matches PortalDashboard (no card chrome, typography-driven).
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export default function JourneyView() {
  return (
    <div className="pb-24 px-4 sm:px-8 max-w-3xl mx-auto pt-12">
      <p
        style={{
          fontFamily: '"Outfit", sans-serif',
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: 'var(--pt-text-muted-hex, #57534e)',
          margin: '0 0 18px',
        }}
      >
        Your journey
      </p>
      <h1
        style={{
          fontFamily: '"Playfair Display", Georgia, serif',
          fontWeight: 300,
          fontSize: 'clamp(36px, 4.5vw, 52px)',
          lineHeight: 1.1,
          letterSpacing: '-0.02em',
          color: 'var(--pt-text-primary-hex, #1c1917)',
          margin: '0 0 18px',
        }}
      >
        Your path will unfold here.
      </h1>
      <p
        style={{
          fontFamily: '"Playfair Display", Georgia, serif',
          fontStyle: 'italic',
          fontWeight: 300,
          fontSize: 18,
          lineHeight: 1.55,
          color: 'var(--pt-text-muted-hex, #57534e)',
          margin: '0 0 28px',
          maxWidth: 560,
        }}
      >
        No pressure to start. Once you begin a module, your progress and the
        threads you&rsquo;ve picked up will live here — quietly, in your time.
      </p>

      <Link
        to="/portal"
        className="inline-flex items-center gap-2"
        style={{
          fontFamily: '"Outfit", sans-serif',
          fontSize: 13,
          fontWeight: 500,
          color: 'var(--pt-primary-accent-hex, #B96A5F)',
          textDecoration: 'none',
        }}
      >
        <Compass className="w-4 h-4" aria-hidden="true" />
        Back to your sanctuary
      </Link>
    </div>
  );
}
