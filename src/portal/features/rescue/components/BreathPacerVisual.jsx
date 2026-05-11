import React, { useEffect, useRef, useState } from 'react';

/**
 * BreathPacerVisual — radial luminance bloom breath-pacer (Rescue Kit Tier 1).
 *
 * Wave 3.2 Phase 1 Lane A. Implements wave-3.1-visual-spec.md §1-§5.
 *
 * Visual rhythm
 *   - 320x320 viewport at 1x, responsive up to 480x480 on >=480px viewports.
 *   - radial-gradient bloom from --pt-stone-100 (center, lighter) to --pt-stone-95
 *     (edge, slightly darker). Luminance delta capped at <=3% per design-ambition §9
 *     and scout-06 §6 adopt 9c (Oak ethos, NOT Calm shape-morph).
 *   - 4s symmetric cycle (cycleMs default = 4000): inhale 0..0.5, exhale 0.5..1.0.
 *     Phase = (performance.now() - sessionStart) % cycleMs / cycleMs.
 *   - sineInOut easing for breath-like accel/decel; NO shape-morph, NO hue shift,
 *     NO width/height animation. The gradient radius percentage is the only
 *     animated dimension.
 *
 * Reduced motion (constraint)
 *   - When reducedMotion=true, no rAF loop is scheduled. Component renders a
 *     static stone-95 background per spec §5 default-fallback.
 *
 * ARIA
 *   - role="img" + aria-label="Breath pacer".
 *   - Visually-hidden aria-live="polite" region announces "Inhale" / "Exhale"
 *     once per half-cycle transition (debounced; no boundary thrash).
 *
 * Props
 *   active        boolean   — session running. When false, rAF loop stops.
 *   reducedMotion boolean   — caller-resolved (OS pref OR G9 sensory-reduce).
 *   cycleMs       number?   — full inhale+exhale cycle in ms, default 4000.
 *
 * TODO(tokens): The spec names --pt-stone-100 (center) and --pt-stone-95 (edge)
 *   but tokens.js v1.0 has neither. We consume --pt-content-bg (Stone-100 alias,
 *   present in tokens.js) for the center, and an inline OKLCH literal
 *   `oklch(98.0% 0.001 106)` for the edge — interpolated between Stone-50 and
 *   Stone-100, ~<=3% luminance delta from --pt-content-bg. Replace with explicit
 *   --pt-stone-95 token when design-system ratifies it (Wave 3.2 follow-up per
 *   visual-spec §4).
 *
 * TODO(tokens): --pt-rescue-luminance-amplitude is a proposed semantic token
 *   for the 3% delta cap. Currently enforced architecturally via the OKLCH
 *   values of CENTER_VAR / EDGE_VAR below. Add token when design-system
 *   confirms shape (numeric vs. paired luminance pair).
 */

// Token interim values per JSDoc above. NO inline hex literals (per code-style
// constraint). OKLCH only; consumed by inline style on rAF tick.
const CENTER_VAR = 'var(--pt-content-bg, oklch(97.0% 0.001 106))';
const EDGE_VAR = 'oklch(98.0% 0.001 106)';

const MIN_RADIUS_PCT = 35;
const MAX_RADIUS_PCT = 65;

function sineInOut(t) {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}

/**
 * Radial gradient radius percentage for a given phase in [0, 1].
 * Inhale (0..0.5) expands; exhale (0.5..1.0) contracts. Symmetric easing.
 */
function bloomRadius(phase) {
  const isInhale = phase <= 0.5;
  const t = isInhale ? phase * 2 : (phase - 0.5) * 2;
  const easedT = sineInOut(isInhale ? t : 1 - t);
  return MIN_RADIUS_PCT + easedT * (MAX_RADIUS_PCT - MIN_RADIUS_PCT);
}

function gradientFor(radiusPct) {
  return `radial-gradient(circle ${radiusPct}% at 50% 50%, ${CENTER_VAR} 0%, ${EDGE_VAR} 100%)`;
}

export default function BreathPacerVisual({
  active,
  reducedMotion,
  cycleMs = 4000,
}) {
  const elRef = useRef(null);
  const startRef = useRef(null);
  const rafRef = useRef(null);
  const lastHalfRef = useRef(null);
  const [ariaPhase, setAriaPhase] = useState('Inhale');

  useEffect(() => {
    // Reduced-motion: static stone-95, no rAF scheduling.
    // Inactive: pause rAF; freeze at last-rendered radius (no jarring reset).
    if (!active || reducedMotion) {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return undefined;
    }

    startRef.current = performance.now();
    lastHalfRef.current = null;

    const tick = () => {
      const elapsed = performance.now() - startRef.current;
      const phase = (elapsed % cycleMs) / cycleMs;
      const r = bloomRadius(phase);

      if (elRef.current) {
        elRef.current.style.background = gradientFor(r);
      }

      // Half-cycle ARIA announcement at phase transitions.
      // Debounced via lastHalfRef so floating-point boundary chatter doesn't
      // re-fire setState. Once per inhale/exhale boundary at most.
      const half = phase < 0.5 ? 'inhale' : 'exhale';
      if (half !== lastHalfRef.current) {
        lastHalfRef.current = half;
        setAriaPhase(half === 'inhale' ? 'Inhale' : 'Exhale');
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [active, reducedMotion, cycleMs]);

  // Reduced-motion fallback: static stone-95 background; no rAF, no announcements.
  if (reducedMotion) {
    return (
      <div
        role="img"
        aria-label="Breath pacer (reduced motion)"
        className="rounded-full w-80 h-80 max-w-[480px] max-h-[480px]"
        style={{ background: EDGE_VAR }}
      >
        <span className="sr-only">Breath pacer — reduced motion active</span>
      </div>
    );
  }

  // Active rAF render. Initial background is the mid-cycle radius so the first
  // frame matches what tick() will paint moments later — no flash-of-empty.
  return (
    <div
      ref={elRef}
      role="img"
      aria-label="Breath pacer"
      className="rounded-full w-80 h-80 max-w-[480px] max-h-[480px]"
      style={{ background: gradientFor(MIN_RADIUS_PCT) }}
    >
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        {ariaPhase}
      </span>
    </div>
  );
}
