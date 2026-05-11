/**
 * RescueHeader — composition primitive for the Rescue surface title bar.
 *
 * Spec: portal-rescue-kit-v1 wave-3.1 primitives-spec §7.
 *
 * Composition (spec §7.2):
 *   RescueHeader
 *     ├── [conditional] <BreathPacerVisual /> — Lane A; rendered when isActive
 *     └── <Hotline988Link />                   — always visible (Tony Q-B)
 *
 * Anti-patterns (design-ambition §9 verbatim):
 *   "Persistent during scroll; no other navigation chrome (anti-pattern:
 *    marketing chrome)." No logo. No progress bar. No back button. No session
 *    timer.
 *
 * Positioning (spec §7.3):
 *   position: sticky; top: 0; — self-compensating, simpler than fixed.
 *
 * @todo Token gap: --pt-z-rescue-header not in tokens.js. INTERIM: use z-index 40
 *   (above content, below modal overlay z-90 used by ReaffirmPrompt).
 *   Track as: tokens-gap-004 (z-rescue-header).
 *
 * @todo Lane A dependency: <BreathPacerVisual /> is authored under the
 *   somatic-visual-spec (separate lane). If Lane A has not committed by the
 *   time this header builds, the import will fail. Per Lane DS brief, fallback
 *   strategy is a defensive try/catch on the dynamic import — header renders
 *   without the pacer rather than crashing the surface.
 */

import React, { Suspense } from 'react';
import Hotline988Link from './Hotline988Link';

// Lazy import — keeps build green if Lane A hasn't landed BreathPacerVisual yet.
// Defensive .catch() returns a no-op component so failure doesn't crash Rescue.
const BreathPacerVisual = React.lazy(() =>
  import('./BreathPacerVisual')
    .then((mod) => ({ default: mod.default || mod.BreathPacerVisual }))
    .catch(() => ({
      // eslint-disable-next-line react/display-name
      default: () => null,
    }))
);

/**
 * @param {object}  props
 * @param {boolean} [props.showBreathPacer=false] — render BreathPacerVisual when true (session active).
 * @param {boolean} [props.showHotline=true]      — always-on safety valve (spec §7.4).
 */
export default function RescueHeader({ showBreathPacer = false, showHotline = true }) {
  return (
    <header
      role="banner"
      aria-label="Rescue session header"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40, // see @todo for token gap
        backgroundColor: 'var(--pt-content-bg)',
        borderBottom: '1px solid var(--pt-border-subtle)',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
      }}
    >
      <div style={{ flex: '1 1 auto', minWidth: 0 }}>
        {showBreathPacer && (
          <Suspense fallback={null}>
            <BreathPacerVisual />
          </Suspense>
        )}
      </div>
      {showHotline && (
        <div style={{ flex: '0 0 auto' }}>
          <Hotline988Link />
        </div>
      )}
    </header>
  );
}
