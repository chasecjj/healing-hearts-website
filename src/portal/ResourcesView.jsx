/**
 * ResourcesView — placeholder for /portal/resources (Wave 9 E1 stub).
 *
 * Renders rest-permission empty-state per spec §A-11. Replaced in a future
 * wave with downloadable PDFs, audio meditations, framework references, and
 * other unlocked resources.
 *
 * Editorial register matches PortalDashboard (no card chrome, typography-driven).
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

export default function ResourcesView() {
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
        Your resources
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
        Resources will gather here.
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
        Worksheets, audio practices, and frameworks unlock as you move through
        modules. Nothing to do yet — come back after exploring a module.
      </p>

      <div className="flex flex-wrap gap-3">
        <Link
          to="/portal/downloads"
          className="inline-flex items-center gap-2"
          style={{
            fontFamily: '"Outfit", sans-serif',
            fontSize: 13,
            fontWeight: 500,
            padding: '8px 18px',
            borderRadius: 9999,
            color: 'var(--pt-primary-accent-hex, #B96A5F)',
            border: '1px solid var(--pt-border-subtle-hex, #d6d3d1)',
            backgroundColor: 'var(--pt-elevation-2-hex, #ffffff)',
            textDecoration: 'none',
          }}
        >
          <BookOpen className="w-4 h-4" aria-hidden="true" />
          My Downloads
        </Link>
        <Link
          to="/portal"
          className="inline-flex items-center gap-2"
          style={{
            fontFamily: '"Outfit", sans-serif',
            fontSize: 13,
            fontWeight: 500,
            padding: '8px 18px',
            borderRadius: 9999,
            color: 'var(--pt-text-muted-hex, #57534e)',
            textDecoration: 'none',
          }}
        >
          Back to your sanctuary
        </Link>
      </div>
    </div>
  );
}
