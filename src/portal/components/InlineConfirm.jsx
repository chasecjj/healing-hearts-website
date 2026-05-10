/**
 * InlineConfirm — inline sentence-confirmation for destructive row-actions.
 *
 * Spec: §12.1 A-02 (P0 security), §4.6.G motion treatment (A-08)
 *
 * Motion:
 *   Entrance — 180ms ease-out-emphasized, opacity 0→1 + translateY(4px→0)
 *   Dismiss  — 120ms opacity-only (no Y reverse — avoids bounce-read)
 *   Reduced-motion fallback — instant appearance + dismissal per D10 / WCAG 2.1 SC 2.3.3
 *
 * Design constraint (§4.6.G explicit):
 *   Must NOT read as alert/urgent. No red fills. No alarm icons. No shake/flash.
 *   Non-urgent cadence preserves drawer's sanctuary register while forcing deliberation.
 *   Zero new design tokens (consumes existing motion.js easings only).
 */

import React, { useState, useEffect } from 'react';
import { useReducedMotion, easings } from '../design/motion';
import { getTypeStyle } from '../design/typography';

/**
 * @param {object}   props
 * @param {string}   [props.message]        — Confirmation sentence, e.g. "Confirm delete?"
 * @param {Function} [props.onConfirm]      — Called after dismiss animation completes
 * @param {Function} [props.onCancel]       — Called after dismiss animation completes
 * @param {string}   [props.requiredPhrase] — Optional. When provided, renders a typed-
 *                                            confirmation input below {message}. The
 *                                            "Yes, proceed" button is disabled until
 *                                            input matches requiredPhrase exactly
 *                                            (case-sensitive). Used for bulk destructive
 *                                            operations per wave-3.1 spec §4.
 */
export default function InlineConfirm({
  message = 'Are you sure you want to proceed?',
  onConfirm,
  onCancel,
  requiredPhrase,
}) {
  const prefersReduced = useReducedMotion();

  // Typed-confirmation state (only used when requiredPhrase is provided)
  const [phraseInput, setPhraseInput] = useState('');
  const phraseRequired = typeof requiredPhrase === 'string' && requiredPhrase.length > 0;
  const phraseMatches = phraseRequired ? phraseInput === requiredPhrase : true;

  // 'entering' | 'visible' | 'leaving'
  // Lazy initializer: skip the entering→visible transition when reduced-motion is
  // already active on mount (avoids synchronous setState in effect body).
  const [phase, setPhase] = useState(() => (prefersReduced ? 'visible' : 'entering'));

  // Trigger entrance transition after first paint (rAF → next frame).
  // Skipped when prefersReduced — initial state is already 'visible'.
  useEffect(() => {
    if (prefersReduced) return;
    const raf = requestAnimationFrame(() => setPhase('visible'));
    return () => cancelAnimationFrame(raf);
  }, [prefersReduced]);

  const easeOutEmphasized = easings['ease-out-emphasized']; // cubic-bezier(0,0,0.2,1)

  // Compute inline style per phase
  const isVisible = phase === 'visible';
  const isLeaving = phase === 'leaving';

  let motionStyle;
  if (prefersReduced) {
    motionStyle = {}; // instant; no transition
  } else if (isLeaving) {
    // Dismiss: 120ms opacity-only
    motionStyle = {
      opacity: 0,
      transform: 'translateY(0)', // no Y reverse
      transition: `opacity 120ms linear`,
    };
  } else {
    // Entrance: 180ms ease-out-emphasized opacity + Y
    motionStyle = {
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0)' : 'translateY(4px)',
      transition: isVisible
        ? `opacity 180ms ${easeOutEmphasized}, transform 180ms ${easeOutEmphasized}`
        : 'none',
    };
  }

  const dismiss = (callback, { resetPhrase = false } = {}) => {
    if (resetPhrase) setPhraseInput('');
    if (prefersReduced) {
      callback?.();
      return;
    }
    setPhase('leaving');
    // Wait for 120ms dismiss animation before firing callback
    setTimeout(() => callback?.(), 120);
  };

  return (
    <div
      role="group"
      aria-label="Confirmation required"
      style={{
        ...motionStyle,
        backgroundColor: 'var(--pt-elevation-1-hex, #e7e5e4)',
        border: '1px solid rgba(28, 25, 23, 0.12)',
        borderRadius: 8,
        padding: '10px 12px',
        marginTop: 6,
        // Non-urgent: stone palette, no red, no alarm
      }}
    >
      <p
        style={{
          ...getTypeStyle('body'),
          margin: '0 0 8px 0',
          color: 'var(--pt-text-primary-hex, #1c1917)',
        }}
      >
        {message}
      </p>

      {phraseRequired && (
        <input
          type="text"
          value={phraseInput}
          onChange={(e) => setPhraseInput(e.target.value)}
          aria-label="Type phrase to confirm action"
          placeholder={`Type "${requiredPhrase}" to confirm`}
          style={{
            ...getTypeStyle('body'),
            display: 'block',
            width: '100%',
            padding: '4px 8px',
            marginBottom: 8,
            borderRadius: 6,
            border: '1px solid var(--pt-border-strong)',
            backgroundColor: 'transparent',
            color: 'var(--pt-text-primary)',
            lineHeight: 'inherit',
          }}
        />
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={() => dismiss(onConfirm, { resetPhrase: true })}
          disabled={!phraseMatches}
          style={{
            ...getTypeStyle('body', 'medium'),
            padding: '4px 12px',
            borderRadius: 6,
            border: '1px solid rgba(28, 25, 23, 0.30)',
            backgroundColor: 'transparent',
            color: 'var(--pt-text-primary-hex, #1c1917)',
            cursor: phraseMatches ? 'pointer' : 'not-allowed',
            opacity: phraseMatches ? 1 : 0.4,
            lineHeight: 'inherit',
          }}
        >
          Yes, proceed
        </button>

        <button
          onClick={() => dismiss(onCancel, { resetPhrase: true })}
          style={{
            ...getTypeStyle('body'),
            padding: '4px 12px',
            borderRadius: 6,
            border: 'none',
            backgroundColor: 'transparent',
            color: 'var(--pt-text-muted-hex, #57534e)',
            cursor: 'pointer',
            lineHeight: 'inherit',
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
