/**
 * SensoryReduceToggle — G9 hard-override switch for somatic-layer sensory input.
 *
 * Spec: portal-rescue-kit-v1 wave-3.1 primitives-spec §4.
 * Gate: G9 (sensory-reduce hard override, cross-tab + persisted).
 *
 * Contract (spec §4.2):
 *   1. Writes localStorage('hh-sensory-reduce', 'true'|'false') SYNCHRONOUSLY
 *      on change.
 *   2. Native `storage` events propagate cross-tab without manual dispatch —
 *      writes from this tab are received as storage events by other tabs on
 *      the same origin. The coordinator (useSomaticSession) listens for that
 *      event and calls stopAll() when value transitions to 'true'.
 *   3. This toggle does NOT call stopAll() — coordinator is responsible.
 *
 * UI (spec §4.3):
 *   role="switch", aria-checked={value}. Visible label "Reduce sensory input"
 *   with help text describing scope. No transition on track indicator —
 *   reduced-motion compliant by default (swap is instant).
 *
 * Persistence (spec §4.4):
 *   - The `value` / `onChange` props are owned by useSomaticPreference hook
 *     upstream. This component manages the synchronous localStorage write
 *     so the storage event fires before onChange completes.
 *   - Supabase async backup is fire-and-forget in useSomaticPreference;
 *     out of scope here.
 */

import React, { useId } from 'react';
import { rescueTelemetry } from '../lib/rescueTelemetry';
import { getTypeStyle } from '../../../design/typography';

/**
 * @param {object}   props
 * @param {boolean}  props.value     — current sensory-reduce state (from useSomaticPreference)
 * @param {Function} props.onChange  — receives the new bool; persistence handled here
 *                                      first (localStorage), then onChange notified.
 */
export default function SensoryReduceToggle({ value, onChange }) {
  const labelId = useId();
  const helpId = useId();

  const handleClick = () => {
    const next = !value;
    // 1. Synchronous localStorage write — fires native `storage` event in other tabs.
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem('hh-sensory-reduce', next ? 'true' : 'false');
      } catch {
        // Quota / private-mode failure — fall through; onChange still propagates.
      }
    }
    // 2. Telemetry — only emit when activating (spec event name is
    //    `sensoryReduce.activated`; emitted on the off→on transition).
    if (next) {
      rescueTelemetry.emit('sensoryReduce.activated', { source: 'toggle' });
    }
    // 3. Notify upstream hook.
    if (typeof onChange === 'function') onChange(next);
  };

  // Switch track — stone palette, no motion. Width 40px, height 22px.
  const trackStyle = {
    width: 40,
    height: 22,
    borderRadius: 11,
    backgroundColor: value ? 'var(--pt-primary-accent)' : 'var(--pt-border-strong)',
    border: '1px solid var(--pt-border-subtle)',
    position: 'relative',
    flexShrink: 0,
    cursor: 'pointer',
    // No transition — spec §4.3 reduced-motion: swap is instant.
  };

  const thumbStyle = {
    position: 'absolute',
    top: 2,
    left: value ? 20 : 2,
    width: 16,
    height: 16,
    borderRadius: '50%',
    backgroundColor: 'var(--pt-elevation-2)',
    // No transition — instant swap per §4.3.
  };

  return (
    <div className="flex items-start gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={value}
        aria-labelledby={labelId}
        aria-describedby={helpId}
        onClick={handleClick}
        style={{ ...trackStyle, padding: 0, outlineOffset: 3 }}
        onFocus={(e) => {
          e.currentTarget.style.outline = '2px solid var(--pt-focus-ring)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.outline = 'none';
        }}
      >
        <span style={thumbStyle} aria-hidden="true" />
      </button>
      <div className="flex flex-col gap-0.5">
        <label
          id={labelId}
          htmlFor={undefined}
          style={{
            ...getTypeStyle('body', 'medium'),
            color: 'var(--pt-text-primary)',
            cursor: 'pointer',
          }}
          onClick={handleClick}
        >
          Reduce sensory input
        </label>
        <p
          id={helpId}
          style={{
            ...getTypeStyle('caption'),
            color: 'var(--pt-text-muted)',
            margin: 0,
          }}
        >
          Disables breath visual, audio, and haptic across all sessions.
        </p>
      </div>
    </div>
  );
}
