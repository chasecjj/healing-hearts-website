/**
 * AuthoringRoute — scaffold placeholder for /admin/authoring.
 *
 * Spec: decision-3.20 (v1.1), §4.4 Group B.route-entry motion (220ms crossfade)
 * Full authoring UI ships in Wave 6D once the backend data layer is available.
 *
 * Per decision-2.20-rev: authoring-preview is scoped to this route only.
 *   ?preview=draft:<uuid> will launch per-draft preview from here.
 *   No author-controls exist inside /portal drawer (decision-2.8-rev).
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { getTypeStyle } from '../../portal/design/typography';

// Route-entry 220ms crossfade per §4.4 Group B.route-entry
const routeFadeStyle = {
  animation: 'authoring-route-enter 220ms cubic-bezier(0,0,0.2,1) both',
};

export default function AuthoringRoute() {
  return (
    <>
      {/* Scoped keyframe — reduced-motion fallback inline per WCAG 2.1 SC 2.3.3 */}
      <style>{`
        @keyframes authoring-route-enter {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .authoring-route-root { animation: none !important; }
        }
      `}</style>

      <div
        className="authoring-route-root"
        style={{
          ...routeFadeStyle,
          padding: '2rem',
          maxWidth: 640,
        }}
      >
        {/* Admin card-chrome retained per decision-3.11 (utility-ethic carve-out) */}
        <div
          style={{
            border: '1px solid rgba(28, 25, 23, 0.12)',
            borderRadius: 12,
            padding: '1.5rem',
            backgroundColor: 'var(--pt-elevation-0-hex, #fafaf9)',
          }}
        >
          <p
            style={{
              ...getTypeStyle('meta', 'medium'),
              color: 'var(--pt-text-muted-hex, #57534e)',
              marginBottom: '0.5rem',
            }}
          >
            Admin › Authoring
          </p>

          <h1
            style={{
              ...getTypeStyle('heading'),
              color: 'var(--pt-text-primary-hex, #1c1917)',
              marginBottom: '1rem',
            }}
          >
            Authoring route scaffold — Wave 6D backend-data.
          </h1>

          <p
            style={{
              ...getTypeStyle('body'),
              color: 'var(--pt-text-muted-hex, #57534e)',
              marginBottom: '0.5rem',
            }}
          >
            Content-authoring UI, per-draft compose surfaces, and publishing
            controls ship in Wave 6D once the backend data layer is available.
          </p>

          <p
            style={{
              ...getTypeStyle('body'),
              color: 'var(--pt-text-muted-hex, #57534e)',
              marginBottom: '1.5rem',
            }}
          >
            Per-draft preview will launch via{' '}
            <code
              style={{
                fontFamily: 'monospace',
                fontSize: '0.875em',
                backgroundColor: 'rgba(28,25,23,0.06)',
                padding: '2px 5px',
                borderRadius: 4,
              }}
            >
              ?preview=draft:&lt;uuid&gt;
            </code>{' '}
            from this route (decision-2.20-rev). Distinct from per-learner
            simulate action in the Admin drawer (decision-2.21).
          </p>

          {/*
            TODO Wave 6D backend-data:
              - Draft list view (draft cards with status: draft / review / published)
              - Compose surface (title, body, attachments, module assignment)
              - Per-draft ?preview=draft:<uuid> preview action
              - Publishing controls (schedule / publish now / archive)
              - Authoring-specific motion: 180ms opacity state-switch (§4.6.E register)
          */}

          <Link
            to="/admin"
            style={{
              ...getTypeStyle('body', 'medium'),
              color: 'var(--pt-primary-accent-hex, #B96A5F)',
              textDecoration: 'none',
            }}
          >
            ← Back to Admin
          </Link>
        </div>
      </div>
    </>
  );
}
