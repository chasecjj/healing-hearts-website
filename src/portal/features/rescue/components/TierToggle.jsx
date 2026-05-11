/**
 * TierToggle — segmented control between Tier 1 (Right now) and Tier 2 (Learn).
 *
 * Spec: portal-rescue-kit-v1 wave-3.1-frameworks-spec §3.
 *
 * Behavioral contract (spec §3):
 *   - aria-pressed on each segment; role="group" + aria-label on container
 *   - ArrowLeft/ArrowRight cycle focus + activate adjacent segment
 *   - Default tier first-visit: 'right-now' (handled upstream by useTierState)
 *   - Min touch target 44×44 per WCAG 2.5.5
 *   - Transition 200ms ease-out; reduced-motion → none
 *
 * Persistence: localStorage `rescue-tier-{userId}` — handled in RescuePage's
 * useTierState hook (not in this component). This is a controlled component:
 * `value` + `onChange` drive everything.
 */

import React, { useRef } from 'react';
import { getTypeStyle } from '../../../design/typography';

const TIERS = [
  { value: 'right-now', label: 'Right now' },
  { value: 'learn', label: 'Learn the science' },
];

/**
 * @param {object}   props
 * @param {'right-now'|'learn'} props.value
 * @param {Function} props.onChange    — receives next tier value
 * @param {string}   [props.ariaLabel] — container aria-label
 */
export default function TierToggle({
  value,
  onChange,
  ariaLabel = 'Switch between emergency tools and learning',
}) {
  const refs = useRef([]);

  const handleKeyDown = (e, index) => {
    if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      const prev = TIERS[index - 1];
      refs.current[index - 1]?.focus();
      onChange(prev.value);
    } else if (e.key === 'ArrowRight' && index < TIERS.length - 1) {
      e.preventDefault();
      const next = TIERS[index + 1];
      refs.current[index + 1]?.focus();
      onChange(next.value);
    }
  };

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="inline-flex w-full sm:w-auto rounded-full p-1 gap-1"
      style={{
        backgroundColor: 'var(--pt-elevation-1)',
        border: '1px solid var(--pt-border-subtle)',
      }}
    >
      {TIERS.map((tier, i) => {
        const active = value === tier.value;
        return (
          <button
            key={tier.value}
            ref={(el) => (refs.current[i] = el)}
            type="button"
            role="button"
            aria-pressed={active}
            onClick={() => onChange(tier.value)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            onFocus={(e) => {
              e.currentTarget.style.outline = '2px solid var(--pt-focus-ring)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.outline = 'none';
            }}
            className="flex-1 sm:flex-initial rounded-full"
            style={{
              ...getTypeStyle('body', 'medium'),
              minHeight: 44,
              minWidth: 44,
              padding: '10px 20px',
              backgroundColor: active ? 'var(--pt-primary-accent)' : 'transparent',
              color: active ? 'var(--pt-text-inverse)' : 'var(--pt-text-muted)',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 200ms ease-out, color 200ms ease-out',
              outlineOffset: 2,
            }}
          >
            {tier.label}
          </button>
        );
      })}
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          [role="group"][aria-label="${ariaLabel}"] button {
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
}
