/**
 * KillSwitchButton — synchronous stop-all for active somatic session.
 *
 * Spec: portal-rescue-kit-v1 wave-3.1 primitives-spec §2.
 * Gates: G3 (crisis escape-hatch ≤50ms), G8 (stopAll total teardown ≤50ms).
 *
 * Behavioral contract (spec §2.2):
 *   1. onActivate() fires SYNCHRONOUSLY — never awaited.
 *   2. rescueTelemetry.emit('session.stopAll') fires immediately after
 *      (fire-and-forget; does NOT block G8 path).
 *   3. No state transitions that defer teardown.
 *
 * Reduced-motion (spec §2.4): no entrance animation, no scale-pop, no bounce.
 * Always-visible during active session.
 *
 * Token gaps documented in @todo blocks below — closest-available tokens used
 * in the interim (do NOT hardcode hex; do NOT add new tokens without Chase).
 */

import React from 'react';
import { rescueTelemetry } from '../lib/rescueTelemetry';

/**
 * @todo Token gap: --pt-rescue-terracotta-thread (tokens-gap-001)
 *   Spec §2.3 names this token for the button border (design-ambition §9
 *   "terracotta-thread continuity"). Not present in tokens.js as of 2026-05-10.
 *   INTERIM: consume --pt-primary-accent (warm terracotta) — closest
 *   available; chroma 0.098 matches the §9 register.
 *
 * @todo Token gap: --pt-stone-95 (tokens-gap-002)
 *   Spec §2.3 names this for the button background (muted-stone fill).
 *   INTERIM: consume --pt-elevation-1 (TW4 Stone-200) — closest stone-scale
 *   value; preserves the warm-stone palette directive.
 */

/**
 * @param {object}   props
 * @param {Function} props.onActivate — useSomaticSession.stopAll(); MUST be
 *                                       synchronous; never awaited inside this
 *                                       component (G8 ≤50ms contract).
 * @param {string}   props.ariaLabel  — REQUIRED; descriptive label for AT users
 *                                       (e.g., "Stop all sound and vibration").
 */
export default function KillSwitchButton({ onActivate, ariaLabel }) {
  // DEV-only assertion: ariaLabel is mandatory per spec §2.3.
  if (
    typeof import.meta !== 'undefined' &&
    import.meta.env?.DEV &&
    (!ariaLabel || typeof ariaLabel !== 'string')
  ) {
    // eslint-disable-next-line no-console
    console.warn(
      '[KillSwitchButton] `ariaLabel` is required (spec §2.3). Crisis-path AT users depend on it.'
    );
  }

  const handleClick = () => {
    // G8: synchronous teardown — call onActivate first, no await, no async wrap.
    if (typeof onActivate === 'function') onActivate();
    // Fire-and-forget telemetry; emit is synchronous + non-blocking (rescueTelemetry.js).
    rescueTelemetry.emit('session.stopAll', { source: 'killswitch' });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={ariaLabel}
      className="fixed bottom-24 right-4 flex h-16 w-16 items-center justify-center rounded-full focus:outline-none"
      style={{
        // Muted-stone bg per §2.3 — see token gap @todo above.
        backgroundColor: 'var(--pt-elevation-1)',
        // Terracotta-thread border per §2.3 — see token gap @todo above.
        border: '2px solid var(--pt-primary-accent)',
        color: 'var(--pt-text-primary)',
        cursor: 'pointer',
        outlineOffset: 3,
        // No transition — spec §2.4 reduced-motion + always-visible posture.
      }}
      onFocus={(e) => {
        e.currentTarget.style.outline = '2px solid var(--pt-focus-ring)';
      }}
      onBlur={(e) => {
        e.currentTarget.style.outline = 'none';
      }}
    >
      {/* Stop glyph — solid square (accessible icon; aria-hidden because button carries aria-label) */}
      <svg
        aria-hidden="true"
        focusable="false"
        width="22"
        height="22"
        viewBox="0 0 22 22"
        fill="currentColor"
      >
        <rect x="4" y="4" width="14" height="14" rx="2" />
      </svg>
    </button>
  );
}
