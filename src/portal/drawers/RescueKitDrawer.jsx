/**
 * RescueKitDrawer — 3 framework tiles
 *
 * Spec: wave3-drawer-content-specs §4
 * Static content; no DB dependency for v1.
 *
 * NOTE: The full Rescue Kit page already exists at
 * src/portal/RescueKitPortal.jsx from R1. This drawer is the rail-contextual
 * entry point; clicking a tile navigates to /portal/rescue-kit[/slug].
 */

import React from 'react';
import { DrawerShell, DrawerSection } from './DrawerShell';
import { getTypeStyle } from '../design/typography';

const FRAMEWORKS = [
  {
    id: 'regulation-first',
    title: 'Regulation First',
    tagline: '[Trisha-voice placeholder: Before anything else, your nervous system.]',
    icon: '🌿',
  },
  {
    id: 'nervous-system-reset',
    title: 'Nervous System Reset',
    tagline: '[Trisha-voice placeholder: 90 seconds can change everything.]',
    icon: '🌀',
  },
  {
    id: 'rupture-repair',
    title: 'Rupture → Repair',
    tagline:
      '[Trisha-voice placeholder: Every couple ruptures. The ones who thrive learn repair.]',
    icon: '🤝',
  },
];

function FrameworkTile({ framework }) {
  return (
    <a
      href={`/portal/rescue-kit`}
      className="flex items-start gap-3 px-3 py-3 rounded-xl"
      style={{
        backgroundColor: 'var(--pt-elevation-1-hex, #e7e5e4)',
        color: 'var(--pt-text-primary-hex, #1c1917)',
        textDecoration: 'none',
        marginBottom: 8,
        transition: 'border-radius 150ms cubic-bezier(0.19,1,0.22,1)',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderRadius = '14px')}
      onMouseLeave={(e) => (e.currentTarget.style.borderRadius = '12px')}
    >
      <span aria-hidden="true" style={{ fontSize: 20, lineHeight: 1 }}>
        {framework.icon}
      </span>
      <div>
        <div style={{ ...getTypeStyle('body', 'medium') }}>{framework.title}</div>
        <div
          style={{
            ...getTypeStyle('caption'),
            color: 'var(--pt-text-muted-hex, #57534e)',
          }}
        >
          {framework.tagline}
        </div>
      </div>
    </a>
  );
}

export default function RescueKitDrawer() {
  return (
    <DrawerShell title="Rescue Kit" ariaContext="Rescue Kit">
      <div className="px-3 pb-2">
        <p
          style={{
            ...getTypeStyle('caption'),
            color: 'var(--pt-text-muted-hex, #57534e)',
            margin: 0,
          }}
        >
          [Trisha-voice placeholder: These tools work. Pick the one that fits right now.]
        </p>
      </div>

      <DrawerSection label="Frameworks">
        {FRAMEWORKS.map((f) => (
          <FrameworkTile key={f.id} framework={f} />
        ))}
      </DrawerSection>
    </DrawerShell>
  );
}
