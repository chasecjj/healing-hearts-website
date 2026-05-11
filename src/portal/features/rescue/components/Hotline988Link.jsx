/**
 * Hotline988Link — persistent 988 crisis-line affordance for the Rescue surface.
 *
 * Spec: portal-rescue-kit-v1 wave-3.1 primitives-spec §3.
 * Gates: G3 (crisis escape-hatch), G6 (no navigation blocking, ≤150ms).
 *
 * Behavioral contract (spec §3.2):
 *   1. onClick SYNCHRONOUSLY emits a `rescue:crisis-link-activated` CustomEvent
 *      on window BEFORE navigation completes. The coordinator's stopAll listener
 *      registers via this event.
 *   2. Also fires rescueTelemetry.emit('crisis.linkActivated') (fire-and-forget).
 *   3. Navigation completes via tel: href — browser-native, ≤150ms (G6).
 *
 * G6 enforcement (spec §3.2):
 *   NO confirmation modal. NO async handler. NO preventDefault. The href
 *   navigates natively; click handler only fires-and-forgets telemetry/event.
 *
 * Tony Q-B default (user brief): always-visible (pre-session AND in-session).
 * Anti-patterns (design-ambition §9): NO red, NO urgent animation, NO alarm-chrome.
 */

import React from 'react';
import { rescueTelemetry } from '../lib/rescueTelemetry';
import { getTypeStyle } from '../../../design/typography';

/**
 * @param {object}  props
 * @param {string}  [props.target='_blank'] — Tony G3-Q1 dogfood-pending; default
 *                                            preserves session context.
 * @param {boolean} [props.showNDVH=false]  — Tony G3-Q2 dogfood-pending; default
 *                                            opt-in for National Domestic Violence Hotline.
 */
export default function Hotline988Link({ target = '_blank', showNDVH = false }) {
  // Synchronous click handler — emits BEFORE the browser begins tel: navigation.
  // No await, no preventDefault, no return false.
  const handleClick = () => {
    // 1. Window CustomEvent — coordinator subscribes here for stopAll().
    if (typeof window !== 'undefined' && typeof CustomEvent !== 'undefined') {
      try {
        window.dispatchEvent(new CustomEvent('rescue:crisis-link-activated', {
          detail: { source: '988', ts: Date.now() },
        }));
      } catch {
        // CustomEvent unsupported — silent; do NOT block navigation.
      }
    }
    // 2. Canonical telemetry (rescueTelemetry whitelist event).
    rescueTelemetry.emit('crisis.linkActivated', { source: '988' });
    // 3. Native navigation proceeds via href; nothing else here.
  };

  const handleNDVHClick = () => {
    if (typeof window !== 'undefined' && typeof CustomEvent !== 'undefined') {
      try {
        window.dispatchEvent(new CustomEvent('rescue:crisis-link-activated', {
          detail: { source: 'ndvh', ts: Date.now() },
        }));
      } catch {
        // silent
      }
    }
    rescueTelemetry.emit('crisis.linkActivated', { source: 'ndvh' });
  };

  /**
   * @todo Typography gap: spec §3.3 calls for `body-small`. The current scale
   *   has `body` (15px) and `caption` (13px); using `caption` here as closest
   *   approximation to "readable but not alarm-weight". Track as type-gap-001.
   */
  const copyStyle = {
    ...getTypeStyle('caption'),
    color: 'var(--pt-text-muted)',
    textDecoration: 'underline',
    textUnderlineOffset: 2,
  };

  return (
    <div className="flex flex-col gap-1" aria-label="Crisis support phone lines">
      <a
        href="tel:988"
        target={target}
        rel={target === '_blank' ? 'noopener noreferrer' : undefined}
        onClick={handleClick}
        style={copyStyle}
      >
        If you're in crisis, call or text 988
      </a>
      {showNDVH && (
        <a
          href="tel:18007997233"
          target={target}
          rel={target === '_blank' ? 'noopener noreferrer' : undefined}
          onClick={handleNDVHClick}
          style={copyStyle}
        >
          Domestic violence: 1-800-799-7233
        </a>
      )}
    </div>
  );
}
