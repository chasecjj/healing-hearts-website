/**
 * Portal Motion System — Healing Hearts Portal v1
 *
 * Sources
 *   S03-P7.1  Scout-03 Pattern 7.1 — Discord border-radius morph (150ms ease)
 *   S03-P7.2  Scout-03 Pattern 7.2 — Framer Motion stagger 40-60ms
 *   S03-P7.3  Scout-03 Pattern 7.3 — prefers-reduced-motion: zero duration (WCAG 2.1 SC 2.3.3)
 *   S03-P7.4  Scout-03 Pattern 7.4 — Drawer slide-in 200-240ms ease-out
 *   D9        CEO-AGENDA §13.1 D9  — 4s linear-gradient breathing animation
 *
 * WCAG HARD CONSTRAINT (D10):
 *   useReducedMotion() hook MUST be called before every animated component renders.
 */

import { useEffect, useState } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// EASING CURVES
// ─────────────────────────────────────────────────────────────────────────────

export const easings = {
  'ease-out-emphasized': 'cubic-bezier(0, 0, 0.2, 1)',
  'ease-out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
  'ease-in-out-breathe': 'cubic-bezier(0.4, 0, 0.2, 1)',
};

// ─────────────────────────────────────────────────────────────────────────────
// DURATIONS (ms)
// ─────────────────────────────────────────────────────────────────────────────

export const durations = {
  'duration-drawer': 220,
  'duration-hover': 150,
  'duration-toolbar-reveal': 120,
  'duration-breathing-gradient': 4000,
};

// ─────────────────────────────────────────────────────────────────────────────
// STAGGER VALUES (ms)
// ─────────────────────────────────────────────────────────────────────────────

export const staggers = {
  'stagger-40': 40,
  'stagger-60': 60,
};

// ─────────────────────────────────────────────────────────────────────────────
// REDUCED MOTION HOOK
// ─────────────────────────────────────────────────────────────────────────────

export function useReducedMotion() {
  const [prefersReduced, setPrefersReduced] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e) => setPrefersReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return prefersReduced;
}

export function getMotionValue(key, prefersReduced) {
  if (prefersReduced) return 0;
  return durations[key] ?? 0;
}

export function getEasing(key, prefersReduced) {
  if (prefersReduced) return 'step-start';
  return easings[key] ?? 'ease';
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT FACTORIES (for Framer Motion when used)
// ─────────────────────────────────────────────────────────────────────────────

export function drawerContentVariants(prefersReduced) {
  const staggerMs = prefersReduced ? 0 : staggers['stagger-40'];
  const durationMs = prefersReduced ? 0 : 180;

  return {
    container: {
      hidden: {},
      visible: {
        transition: { staggerChildren: staggerMs / 1000 },
      },
    },
    item: {
      hidden: { opacity: 0, y: prefersReduced ? 0 : 8 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: durationMs / 1000,
          ease: prefersReduced ? 'linear' : [0.19, 1, 0.22, 1],
        },
      },
    },
  };
}

export function railIconHoverStyle(isHovered, prefersReduced) {
  return {
    borderRadius: isHovered ? '12px' : '16px',
    transform: isHovered && !prefersReduced ? 'translateY(-1px)' : 'none',
    transition: prefersReduced
      ? 'none'
      : `border-radius ${durations['duration-hover']}ms ${easings['ease-out-expo']}, transform ${durations['duration-hover']}ms ${easings['ease-out-expo']}`,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// CSS KEYFRAME EXPORT
// ─────────────────────────────────────────────────────────────────────────────

export const breathingGradientKeyframes = `
@keyframes rail-chip-breathe {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@media (prefers-reduced-motion: reduce) {
  .rail-icon--selected {
    animation: none !important;
    background: #B96A5F !important;
  }
}
`;
