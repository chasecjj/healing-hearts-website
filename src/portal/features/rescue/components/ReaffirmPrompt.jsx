/**
 * ReaffirmPrompt — 3-minute re-affirm modal for active somatic sessions.
 *
 * Spec: portal-rescue-kit-v1 wave-3.1 primitives-spec §5.
 * Source of truth: HIGH-3 resolution 2026-05-10 (Spec Amendment).
 *
 * Copy (verbatim per HIGH-3):
 *   Title:  "Still here with you."
 *   Body:   "You've been breathing with us for 3 minutes. Want to keep going?"
 *   Primary action:   [Keep going]
 *   Secondary action: [I'm done — go to home]
 *   Timeout state (30s no-response): "Tap anywhere to resume"
 *
 * Behavioral contract (spec §5.4):
 *   - On `visible` true: 30s setTimeout begins.
 *   - On timeout: onTimeout() fires — the coordinator handles audio fade
 *     (linearRampToValueAtTime 1500ms), visual pause, haptic stop. This
 *     component switches into "tap-to-resume" display mode.
 *   - clearTimeout fires on unmount, on onKeepGoing, on onImDone.
 *
 * Modal behavior (spec §5.5):
 *   role="dialog", aria-modal="true". NOT navigation-blocking (G6).
 *   ESC does NOT dismiss (would bypass re-affirm).
 *
 * Reduced-motion (spec §5.6):
 *   Entrance is fade-only (220ms opacity 0→1). No translateY, no scale.
 *   Reduced-motion: instant opacity=1.
 *
 * Reuse pattern (spec §5.7): Option A — own component, no InlineConfirm import.
 *   Shared utility imports (useReducedMotion, getTypeStyle) only.
 */

import React, { useEffect, useRef, useState, useId } from 'react';
import { useReducedMotion } from '../../../design/motion';
import { getTypeStyle } from '../../../design/typography';
import { rescueTelemetry } from '../lib/rescueTelemetry';

const REAFFIRM_TIMEOUT_MS = 30000;

/**
 * @param {object}   props
 * @param {boolean}  props.visible      — drives mount + 30s timer; from useSomaticSession.
 * @param {Function} props.onKeepGoing  — primary action → coordinator.continueSession().
 * @param {Function} props.onImDone     — secondary action → coordinator.stopAndExit().
 * @param {Function} props.onTimeout    — 30s no-response → coordinator.pauseAndAwaitTap().
 */
export default function ReaffirmPrompt({
  visible,
  onKeepGoing,
  onImDone,
  onTimeout,
}) {
  const prefersReduced = useReducedMotion();
  const titleId = useId();
  const bodyId = useId();
  const timeoutRef = useRef(null);
  const dialogRef = useRef(null);

  // 'awaiting' → buttons visible; 'paused' → "tap to resume" shown.
  const [phase, setPhase] = useState('awaiting');
  // 'entering' → opacity 0; 'visible' → opacity 1.
  const [motionPhase, setMotionPhase] = useState(() =>
    prefersReduced ? 'visible' : 'entering'
  );

  // Telemetry: emit show event on visible transition.
  useEffect(() => {
    if (visible) {
      rescueTelemetry.emit('session.reaffirmPromptShown', { ts: Date.now() });
      setPhase('awaiting');
      // Start the 30s timeout.
      timeoutRef.current = setTimeout(() => {
        rescueTelemetry.emit('session.reaffirmTimeout', { ts: Date.now() });
        setPhase('paused');
        if (typeof onTimeout === 'function') onTimeout();
      }, REAFFIRM_TIMEOUT_MS);
    }
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [visible, onTimeout]);

  // Entrance fade — single rAF tick.
  useEffect(() => {
    if (!visible) return;
    if (prefersReduced) {
      setMotionPhase('visible');
      return;
    }
    const raf = requestAnimationFrame(() => setMotionPhase('visible'));
    return () => cancelAnimationFrame(raf);
  }, [visible, prefersReduced]);

  // Initial focus management — focus the dialog when visible (focus trap is
  // minimal here; primary action receives focus first for keyboard users).
  const primaryBtnRef = useRef(null);
  useEffect(() => {
    if (visible && phase === 'awaiting' && primaryBtnRef.current) {
      primaryBtnRef.current.focus();
    }
  }, [visible, phase]);

  // Tap-anywhere-to-resume handler (paused phase).
  const handleResumeTap = () => {
    // When paused, ANY tap resumes — but the actual resume action is delegated.
    // The coordinator wired through onKeepGoing handles the resume restart.
    if (typeof onKeepGoing === 'function') {
      rescueTelemetry.emit('session.reaffirmContinue', { fromPause: true });
      onKeepGoing();
    }
  };

  const handleKeepGoing = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    rescueTelemetry.emit('session.reaffirmContinue', { fromPause: false });
    if (typeof onKeepGoing === 'function') onKeepGoing();
  };

  const handleImDone = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    rescueTelemetry.emit('session.reaffirmEnd', {});
    if (typeof onImDone === 'function') onImDone();
  };

  if (!visible) return null;

  // Overlay — translucent stone wash. rgba is permitted for translucent overlays
  // per Lane DS hard constraint ("rgba OK for translucent overlays").
  const overlayStyle = {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(28, 25, 23, 0.55)', // text-primary @ 55% — warm wash, not pure black
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    zIndex: 90,
    opacity: motionPhase === 'visible' ? 1 : 0,
    transition: prefersReduced ? 'none' : 'opacity 220ms cubic-bezier(0, 0, 0.2, 1)',
  };

  const dialogStyle = {
    backgroundColor: 'var(--pt-elevation-1)',
    borderRadius: 24,
    padding: 28,
    maxWidth: 420,
    width: '100%',
    border: '1px solid var(--pt-border-subtle)',
    boxShadow: '0 12px 32px rgba(28, 25, 23, 0.18)',
  };

  return (
    <div
      style={overlayStyle}
      // Paused phase: tap anywhere on overlay (excluding hotline if present)
      // resumes the session.
      onClick={phase === 'paused' ? handleResumeTap : undefined}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={bodyId}
        style={dialogStyle}
        onClick={(e) => {
          // Don't swallow clicks bubbling up to overlay when in paused phase —
          // tapping the dialog itself should also resume.
          if (phase !== 'paused') e.stopPropagation();
        }}
      >
        <h2
          id={titleId}
          data-copy-pending="trisha-voice"
          style={{
            ...getTypeStyle('heading-1'),
            color: 'var(--pt-text-primary)',
            margin: 0,
            marginBottom: 12,
          }}
        >
          Still here with you.
        </h2>
        <p
          id={bodyId}
          data-copy-pending="trisha-voice"
          style={{
            ...getTypeStyle('body'),
            color: 'var(--pt-text-primary)',
            margin: 0,
            marginBottom: 20,
          }}
        >
          You've been breathing with us for 3 minutes. Want to keep going?
        </p>

        {phase === 'awaiting' ? (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              ref={primaryBtnRef}
              type="button"
              onClick={handleKeepGoing}
              style={{
                ...getTypeStyle('body', 'medium'),
                backgroundColor: 'var(--pt-primary-accent)',
                color: 'var(--pt-text-inverse)',
                border: 'none',
                borderRadius: 12,
                padding: '10px 18px',
                cursor: 'pointer',
                outlineOffset: 3,
              }}
              onFocus={(e) => {
                e.currentTarget.style.outline = '2px solid var(--pt-focus-ring)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.outline = 'none';
              }}
            >
              Keep going
            </button>
            <button
              type="button"
              onClick={handleImDone}
              style={{
                ...getTypeStyle('body'),
                backgroundColor: 'transparent',
                color: 'var(--pt-text-primary)',
                border: '1px solid var(--pt-border-strong)',
                borderRadius: 12,
                padding: '10px 18px',
                cursor: 'pointer',
                outlineOffset: 3,
              }}
              onFocus={(e) => {
                e.currentTarget.style.outline = '2px solid var(--pt-focus-ring)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.outline = 'none';
              }}
            >
              I'm done — go to home
            </button>
          </div>
        ) : (
          <p
            style={{
              ...getTypeStyle('body'),
              color: 'var(--pt-text-muted)',
              margin: 0,
              fontStyle: 'italic',
            }}
          >
            Tap anywhere to resume
          </p>
        )}
      </div>
    </div>
  );
}
