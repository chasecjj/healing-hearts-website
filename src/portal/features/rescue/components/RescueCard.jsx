/**
 * RescueCard — shared card chrome for Rescue surface framework cards + content
 * sections.
 *
 * Spec: portal-rescue-kit-v1 wave-3.1 primitives-spec §6.
 *
 * Visual (spec §6.2):
 *   - Padding: 24px all sides.
 *   - Border-radius: rounded-2xl (var(--pt-radius-2xl) or 24px equivalent).
 *   - Background: var(--pt-elevation-1) (warm-stone elevation; NOT white).
 *   - Hover: transform translateY(-2px) over 200ms ease-out.
 *   - Reduced-motion: NO transform; subtle opacity feedback allowed.
 *   - Focus ring: 2px var(--pt-focus-ring) at outline-offset 4px.
 *
 * Carve-out (spec §6.3):
 *   Rescue gets its own surface; no admin row-chrome / left-accent strip.
 *   Tier 1 (Emergency Mini-Kit) → tier="emergency" → --pt-elevation-2 warmth.
 *   Tier 2 (Education) default → --pt-elevation-1.
 *
 * Accessibility (spec §6.4):
 *   - ariaLabel REQUIRED (dev warning if missing).
 *   - Renders as <button> when onClick provided.
 *   - Icon aria-hidden; semantic weight carried by ariaLabel.
 *
 * @todo Token gap: --pt-radius-2xl not in tokens.js — using literal 24px which
 *   maps to Tailwind's rounded-2xl. Document as type-gap-002.
 */

import React, { useState } from 'react';
import { useReducedMotion } from '../../../design/motion';
import { getTypeStyle } from '../../../design/typography';

/**
 * @param {object}        props
 * @param {string}        props.title       — Anchor copy (heading-style).
 * @param {string}        [props.subtitle]  — Muted body copy.
 * @param {React.Component} [props.icon]    — Lucide-style icon component (28×28).
 * @param {Function}      [props.onClick]   — When provided, renders as button.
 * @param {'standard'|'emergency'} [props.tier='standard']
 *   — 'emergency' uses --pt-elevation-2 (slightly warmer per §6.3).
 * @param {string}        props.ariaLabel   — REQUIRED.
 * @param {React.ReactNode} [props.children] — Optional body content below subtitle.
 */
export default function RescueCard({
  title,
  subtitle,
  icon: Icon,
  onClick,
  tier = 'standard',
  ariaLabel,
  children,
}) {
  const prefersReduced = useReducedMotion();
  const [hovered, setHovered] = useState(false);

  // DEV warning per spec §6.4 — ariaLabel is required.
  if (
    typeof import.meta !== 'undefined' &&
    import.meta.env?.DEV &&
    (!ariaLabel || typeof ariaLabel !== 'string')
  ) {
    // eslint-disable-next-line no-console
    console.warn('[RescueCard] `ariaLabel` is required (spec §6.4).');
  }

  const bgVar =
    tier === 'emergency' ? 'var(--pt-elevation-2)' : 'var(--pt-elevation-1)';

  // Hover treatment:
  //  - Default: translateY(-2px) over 200ms ease-out.
  //  - Reduced-motion: no transform; subtle opacity feedback (0.96 → 1.00 on
  //    hover via slight bg shift — kept here as static; opacity bump only).
  const transform = !prefersReduced && hovered ? 'translateY(-2px)' : 'translateY(0)';
  const transition = prefersReduced
    ? 'none'
    : 'transform 200ms cubic-bezier(0, 0, 0.2, 1), opacity 200ms cubic-bezier(0, 0, 0.2, 1)';
  const opacity = prefersReduced && hovered ? 0.96 : 1;

  const sharedStyle = {
    backgroundColor: bgVar,
    borderRadius: 24, // rounded-2xl equivalent — see @todo header
    padding: 24,
    transform,
    transition,
    opacity,
    display: 'block',
    textAlign: 'left',
    width: '100%',
    border: '1px solid var(--pt-border-subtle)',
    cursor: onClick ? 'pointer' : 'default',
    outlineOffset: 4,
  };

  const inner = (
    <>
      {Icon && (
        <div
          aria-hidden="true"
          style={{
            color: 'var(--pt-text-muted)',
            marginBottom: 12,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Icon size={28} />
        </div>
      )}
      <h3
        style={{
          ...getTypeStyle('heading-2'),
          color: 'var(--pt-text-primary)',
          margin: 0,
          marginBottom: subtitle ? 6 : 0,
        }}
      >
        {title}
      </h3>
      {subtitle && (
        <p
          style={{
            ...getTypeStyle('caption'),
            color: 'var(--pt-text-muted)',
            margin: 0,
          }}
        >
          {subtitle}
        </p>
      )}
      {children}
    </>
  );

  if (typeof onClick === 'function') {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={ariaLabel}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={(e) => {
          setHovered(true);
          e.currentTarget.style.outline = '2px solid var(--pt-focus-ring)';
        }}
        onBlur={(e) => {
          setHovered(false);
          e.currentTarget.style.outline = 'none';
        }}
        style={sharedStyle}
      >
        {inner}
      </button>
    );
  }

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={sharedStyle}
    >
      {inner}
    </div>
  );
}
