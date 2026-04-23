/**
 * DrawerShell — shared shell for all 6 contextual drawers.
 *
 * Spec: wave3-drawer-content-specs §1
 * - 320px width desktop, full-width bottom sheet on mobile
 * - role="complementary", aria-label="{ariaContext} drawer"
 * - scrollable content zone by default
 * - collapsible reserved for mobile bottom-sheet behavior (not required for R2)
 * - Consumes duration-drawer (220ms) from motion.js via useReducedMotion
 *
 * Tokens consumed: --pt-drawer (bg), --pt-text-primary, --pt-text-muted,
 * --pt-border-subtle. These are set by PortalLayout.portalTokensAsCssVars().
 */

import React from 'react';
import { getTypeStyle } from '../design/typography';

export function DrawerShell({
  title,
  children,
  scrollable = true,
  collapsible = false,
  ariaContext,
}) {
  const label = `${ariaContext || title || 'Contextual'} drawer`;

  return (
    <aside
      role="complementary"
      aria-label={label}
      data-portal-drawer
      data-collapsible={collapsible ? 'true' : undefined}
      className="h-full w-full flex flex-col"
      style={{
        backgroundColor: 'var(--pt-drawer-hex, #d6d3d1)',
        color: 'var(--pt-text-primary-hex, #1c1917)',
      }}
    >
      {/* Fixed header zone */}
      {title && (
        <div
          className="px-4 pt-5 pb-3 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--pt-border-subtle-hex, #d6d3d1)' }}
        >
          <h2
            style={{
              ...getTypeStyle('meta', 'semibold'),
              textTransform: 'uppercase',
              color: 'var(--pt-text-muted-hex, #57534e)',
              margin: 0,
            }}
          >
            {title}
          </h2>
        </div>
      )}

      {/* Scrollable content zone */}
      <div
        className={`flex-1 px-2 py-3 ${scrollable ? 'overflow-y-auto' : 'overflow-hidden'}`}
      >
        {children}
      </div>
    </aside>
  );
}

/**
 * DrawerSection — collapsible labeled section (Slack pattern §2.1).
 * Uses native <details>/<summary> for zero-dependency a11y.
 */
export function DrawerSection({ label, defaultOpen = true, badge, children }) {
  return (
    <details
      open={defaultOpen}
      className="group mb-2"
      style={{
        borderBottom: '1px solid transparent',
      }}
    >
      {label ? (
        <summary
          className="flex items-center justify-between px-3 py-2 cursor-pointer list-none select-none"
          style={{
            ...getTypeStyle('meta', 'semibold'),
            color: 'var(--pt-text-muted-hex, #57534e)',
            textTransform: 'uppercase',
          }}
        >
          <span className="flex items-center gap-2">
            {label}
            {typeof badge === 'number' && badge > 0 && (
              <span
                style={{
                  ...getTypeStyle('meta'),
                  backgroundColor: 'rgba(185, 106, 95, 0.16)',
                  color: 'var(--pt-primary-accent-hex, #B96A5F)',
                  padding: '1px 6px',
                  borderRadius: '9999px',
                  lineHeight: 1,
                }}
              >
                {badge}
              </span>
            )}
          </span>
          <span
            aria-hidden="true"
            className="transition-transform group-open:rotate-180"
            style={{ color: 'var(--pt-text-muted-hex, #57534e)', fontSize: 10 }}
          >
            ▾
          </span>
        </summary>
      ) : null}
      <div className="px-1 pb-2">{children}</div>
    </details>
  );
}

/**
 * EmptyState — consistent empty-state treatment per spec §10
 */
export function EmptyState({ icon, message, sub, cta }) {
  return (
    <div className="flex flex-col items-center text-center py-6 px-4 gap-2">
      {icon && <div aria-hidden="true" style={{ fontSize: 28 }}>{icon}</div>}
      <p style={{ ...getTypeStyle('body', 'medium'), margin: 0 }}>{message}</p>
      {sub && (
        <p
          style={{
            ...getTypeStyle('caption'),
            color: 'var(--pt-text-muted-hex, #57534e)',
            margin: 0,
          }}
        >
          {sub}
        </p>
      )}
      {cta && <div className="mt-2">{cta}</div>}
    </div>
  );
}

export default DrawerShell;
