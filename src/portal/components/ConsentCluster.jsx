/**
 * ConsentCluster — §3.1, §12.1 A-11
 *
 * Three-button consent entry on the Dashboard editorial hero.
 * Offers agency on how the learner wants to engage today.
 *
 *   (a) "Pick up where you paused"  — primary filled CTA
 *   (b) "Start somewhere new"       — secondary outline CTA
 *   (c) "Just rest today"           — text-only tertiary; rest-permission
 *       register (A-11); clicks → 24h non-judgmental dismiss via localStorage.
 *
 * Design invariants:
 *   - No streak counter, no alert chrome, no urgency language
 *   - "Just rest today" is NEVER styled as warning/danger
 *   - 24h dismiss silently via localStorage key only; no toast/modal
 *
 * Motion: Group C (150ms ease-out-emphasized) per spec §4.5
 */

import React, { useState } from 'react';
import { portalTokens } from '../design/tokens';
import { useReducedMotion, easings, durations } from '../design/motion';

// ── localStorage dismiss helpers ─────────────────────────────────────────────
const DISMISS_KEY = 'hh-consent-cluster-rest-dismiss';
const DISMISS_DURATION_MS = 24 * 60 * 60 * 1000;

function isDismissed() {
  try {
    const ts = localStorage.getItem(DISMISS_KEY);
    if (!ts) return false;
    return Date.now() - parseInt(ts, 10) < DISMISS_DURATION_MS;
  } catch {
    return false;
  }
}

function writeDismiss() {
  try {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  } catch {
    // storage unavailable (private browsing strict mode etc.) — degrade silently
  }
}

// ── Component ────────────────────────────────────────────────────────────────
/**
 * @param {object} props
 * @param {() => void} props.onPickUp    — Navigate to next lesson / resume
 * @param {() => void} props.onStartNew  — Navigate to module library / browse
 */
export default function ConsentCluster({ onPickUp, onStartNew }) {
  const prefersReduced = useReducedMotion();
  const [dismissed, setDismissed] = useState(() => isDismissed());

  if (dismissed) return null;

  const hoverTransition = prefersReduced
    ? undefined
    : `opacity ${durations['duration-hover']}ms ${easings['ease-out-emphasized']}`;

  const handleRestToday = () => {
    writeDismiss();
    setDismissed(true);
    // Non-judgmental: no toast, no modal, no logged "failure". Quiet dismiss.
  };

  return (
    <div
      role="group"
      aria-label="How would you like to engage today?"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        maxWidth: 420,
      }}
    >
      {/* (a) Primary — Pick up where you paused */}
      <button
        type="button"
        onClick={onPickUp}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '14px 28px',
          borderRadius: 999,
          border: 'none',
          cursor: 'pointer',
          background: `var(--pt-primary-accent-hex, ${portalTokens['primary-accent'].hex})`,
          color: '#fafaf9',
          fontFamily: '"Outfit", sans-serif',
          fontWeight: 600,
          fontSize: 15,
          letterSpacing: '0.02em',
          transition: hoverTransition,
        }}
      >
        Pick up where you paused
      </button>

      {/* (b) Secondary — Start somewhere new */}
      <button
        type="button"
        onClick={onStartNew}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '14px 28px',
          borderRadius: 999,
          border: `1px solid var(--pt-border-subtle-hex, ${portalTokens['border-subtle'].hex})`,
          background: 'transparent',
          cursor: 'pointer',
          color: `var(--pt-text-primary-hex, ${portalTokens['text-primary'].hex})`,
          fontFamily: '"Outfit", sans-serif',
          fontWeight: 500,
          fontSize: 15,
          letterSpacing: '0.02em',
          transition: hoverTransition,
        }}
      >
        Start somewhere new
      </button>

      {/* (c) Text-only tertiary — A-11 rest-permission register */}
      {/* NEVER filled, NEVER bordered. Quiet permission to step back. */}
      <button
        type="button"
        onClick={handleRestToday}
        aria-label="Just rest today — you can return whenever you're ready, no pressure"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '8px 0',
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          color: `var(--pt-text-muted-hex, ${portalTokens['text-muted'].hex})`,
          fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
          fontSize: 14,
          fontWeight: 400,
          letterSpacing: '0.01em',
          transition: hoverTransition,
        }}
      >
        Just rest today
      </button>
    </div>
  );
}
