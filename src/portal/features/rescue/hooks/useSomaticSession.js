/**
 * useSomaticSession — Rescue-surface coordinator hook.
 *
 * Spec: portal-rescue-kit-v1 wave-3.1-coordinator-spec
 *   §2  API contract (exactly 13 public keys)
 *   §3  Lifecycle listeners (useEffect cleanup + visibilitychange + pagehide)
 *   §4  stopAll() ≤50ms synchronous crisis teardown (G3 + G8)
 *   §5  Re-affirm prompt (HIGH-3; 3-min cap + 30s timeout)
 *   §6  Sensory-reduce hard override (G9)
 *   §7  5 persistence keys
 *   §8  14 telemetry events
 *
 * Resolutions:
 *   - HIGH-3 (re-affirm prompt copy + 30s timeout → pauseAndAwaitTap)
 *   - HIGH-4 (no beforeNavigate API; useEffect cleanup + visibilitychange
 *     + pagehide for the 3 lifecycle paths)
 *
 * Ownership:
 *   The coordinator EXCLUSIVELY owns the 3 lifecycle listeners. useHapticPacer
 *   and useRescueAudio (separate lanes) consume `isActive`, `*Enabled`,
 *   `audioVolume`, `hapticPattern`, `sensoryReduce`, and `stopAll` but MUST
 *   NOT register their own lifecycle listeners.
 *
 *   The coordinator does NOT call `navigator.vibrate` or instantiate an
 *   AudioContext itself — those belong to the haptic/audio lanes. The
 *   coordinator owns LIFECYCLE: session clock, sensory-reduce flag,
 *   stopAll synchronous teardown of session state, and telemetry.
 *
 * Re-affirm prompt:
 *   At 180000ms elapsed, `reaffirmPromptVisible` flips to true. UI component
 *   (design-system lane) renders the modal. After 30s no-response, the
 *   coordinator calls `pauseAndAwaitTap()` — session remains active; UI
 *   shows "tap to resume" affordance.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { useSomaticPreference } from './useSomaticPreference';
import { rescueTelemetry } from '../lib/rescueTelemetry';

const REAFFIRM_CAP_MS = 180000; // 3 minutes (HIGH-3)
const REAFFIRM_TIMEOUT_MS = 30000; // 30 seconds no-response → pauseAndAwaitTap
const ELAPSED_TICK_MS = 1000;

/**
 * @returns {{
 *   isActive: boolean,
 *   hapticEnabled: boolean,
 *   audioEnabled: boolean,
 *   audioVolume: number,
 *   hapticPattern: 'gentle'|'presence',
 *   sensoryReduce: boolean,
 *   sessionElapsedMs: number,
 *   reaffirmPromptVisible: boolean,
 *   startSession: (opts?: { resetClock?: boolean }) => void,
 *   stopAll: (reason?: string) => void,
 *   pauseAndAwaitTap: () => void,
 *   setHapticEnabled: (v: boolean) => void,
 *   setAudioEnabled: (v: boolean) => void,
 *   setAudioVolume: (v: number) => void,
 *   setHapticPattern: (v: 'gentle'|'presence') => void,
 * }}
 */
export function useSomaticSession() {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  // ── Preference layer ────────────────────────────────────────────────────
  // Cross-tab sensory-reduce flip handler installed via preference hook so
  // it stays single-owner per spec §3.5.
  const handleSensoryReduceCrossTabRef = useRef(() => {});
  const onSensoryReduceCrossTab = useCallback(() => {
    handleSensoryReduceCrossTabRef.current?.();
  }, []);

  const pref = useSomaticPreference(userId, { onSensoryReduceCrossTab });

  // ── Session state ───────────────────────────────────────────────────────
  const [isActive, setIsActive] = useState(false);
  const [sessionElapsedMs, setSessionElapsedMs] = useState(0);
  const [reaffirmPromptVisible, setReaffirmPromptVisible] = useState(false);

  // ── Refs for crisis-path values (avoid stale closures) ──────────────────
  const isActiveRef = useRef(false);
  const sessionStartRef = useRef(0);
  const sessionElapsedMsRef = useRef(0);
  const reaffirmShownAtRef = useRef(0);
  const reaffirmTimeoutHandleRef = useRef(null);
  const elapsedIntervalHandleRef = useRef(null);
  const isPausedRef = useRef(false);
  const userIdRef = useRef(userId);

  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);

  // ── Internal: clear timers ──────────────────────────────────────────────
  const clearElapsedInterval = useCallback(() => {
    if (elapsedIntervalHandleRef.current != null) {
      clearInterval(elapsedIntervalHandleRef.current);
      elapsedIntervalHandleRef.current = null;
    }
  }, []);

  const clearReaffirmTimeout = useCallback(() => {
    if (reaffirmTimeoutHandleRef.current != null) {
      clearTimeout(reaffirmTimeoutHandleRef.current);
      reaffirmTimeoutHandleRef.current = null;
    }
  }, []);

  // ── stopAll — SYNCHRONOUS crisis path (G3 + G8 ≤50ms) ───────────────────
  // No `await`. No network calls. No AudioContext / navigator.vibrate here
  // (those belong to lane C/D consumer hooks, which respond to isActive=false).
  const stopAll = useCallback(
    (reason = 'user') => {
      // 1. Flip active state — consumer hooks (haptic / audio) observe and
      //    zero their own outputs synchronously.
      const wasActive = isActiveRef.current;
      isActiveRef.current = false;
      isPausedRef.current = false;
      setIsActive(false);

      // 2. Clear re-affirm prompt state
      setReaffirmPromptVisible(false);
      clearReaffirmTimeout();

      // 3. Stop the elapsed clock
      clearElapsedInterval();

      // 4. Telemetry — synchronous enqueue only; no network in crisis path
      if (wasActive) {
        rescueTelemetry.emit('session.stopAll', {
          userId: userIdRef.current,
          reason,
          elapsedMs: sessionElapsedMsRef.current,
          ts: Date.now(),
        });
      }
    },
    [clearElapsedInterval, clearReaffirmTimeout]
  );

  // ── Wire cross-tab sensory-reduce handler now that stopAll exists ───────
  useEffect(() => {
    handleSensoryReduceCrossTabRef.current = () => {
      rescueTelemetry.emit('sensoryReduce.activated', {
        userId: userIdRef.current,
        source: 'cross-tab',
        ts: Date.now(),
      });
      stopAll('sensory-reduce');
    };
  }, [stopAll]);

  // ── pauseAndAwaitTap — G5 monotonic fade (consumer hooks own actual
  //    ramp). Coordinator marks session paused; isActive flips false so
  //    haptic chain halts; reaffirmPromptVisible stays as-is so UI can swap
  //    in "tap to resume". Session is NOT ended.
  const pauseAndAwaitTap = useCallback(() => {
    isPausedRef.current = true;
    isActiveRef.current = false;
    setIsActive(false);
    clearReaffirmTimeout();
    rescueTelemetry.emit('session.pause', {
      userId: userIdRef.current,
      elapsedMs: sessionElapsedMsRef.current,
      ts: Date.now(),
    });
  }, [clearReaffirmTimeout]);

  // ── startSession — consent-gated; no-op when sensoryReduce=true ─────────
  const startSession = useCallback(
    (opts = {}) => {
      const { resetClock = true } = opts;

      // G9 hard override
      if (pref.sensoryReduce) {
        return;
      }

      // Idempotent: ignore if already running (unless resetClock requested,
      // e.g. re-affirm "Keep going" path)
      if (isActiveRef.current && !resetClock) {
        return;
      }

      const now = Date.now();
      if (resetClock) {
        sessionStartRef.current = now;
        sessionElapsedMsRef.current = 0;
        setSessionElapsedMs(0);
      }
      isActiveRef.current = true;
      isPausedRef.current = false;
      setIsActive(true);
      setReaffirmPromptVisible(false);
      clearReaffirmTimeout();

      // Start / restart the elapsed clock (wall-clock per §12)
      clearElapsedInterval();
      elapsedIntervalHandleRef.current = setInterval(() => {
        const elapsed = Date.now() - sessionStartRef.current;
        sessionElapsedMsRef.current = elapsed;
        setSessionElapsedMs(elapsed);

        if (elapsed >= REAFFIRM_CAP_MS && !reaffirmShownAtRef.current) {
          reaffirmShownAtRef.current = Date.now();
          setReaffirmPromptVisible(true);
          rescueTelemetry.emit('session.reaffirmPromptShown', {
            userId: userIdRef.current,
            elapsedMs: elapsed,
            ts: Date.now(),
          });

          // 30s no-response → pauseAndAwaitTap (HIGH-3)
          clearReaffirmTimeout();
          reaffirmTimeoutHandleRef.current = setTimeout(() => {
            rescueTelemetry.emit('session.reaffirmTimeout', {
              userId: userIdRef.current,
              elapsedMs: sessionElapsedMsRef.current,
              ts: Date.now(),
            });
            pauseAndAwaitTap();
          }, REAFFIRM_TIMEOUT_MS);
        }
      }, ELAPSED_TICK_MS);

      reaffirmShownAtRef.current = 0;

      rescueTelemetry.emit('session.start', {
        userId: userIdRef.current,
        hapticEnabled: pref.hapticEnabled,
        audioEnabled: pref.audioEnabled,
        audioVolume: pref.audioVolume,
        hapticPattern: pref.hapticPattern,
        sensoryReduce: pref.sensoryReduce,
        ts: Date.now(),
      });
    },
    [
      pref.sensoryReduce,
      pref.hapticEnabled,
      pref.audioEnabled,
      pref.audioVolume,
      pref.hapticPattern,
      clearElapsedInterval,
      clearReaffirmTimeout,
      pauseAndAwaitTap,
    ]
  );

  // ── Lifecycle listeners (HIGH-4 resolution: useEffect cleanup +
  //    visibilitychange + pagehide). Coordinator-exclusive ownership.
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        stopAll('visibility');
      }
    };
    const handlePageHide = () => stopAll('pagehide');

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);
    return () => {
      stopAll('unmount'); // route change cleanup
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, [stopAll]);

  // ── Crisis-link bridge (G3): subscribe to rescue:crisis-link-activated ──
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const handler = () => {
      rescueTelemetry.emit('crisis.linkActivated', {
        userId: userIdRef.current,
        elapsedMs: sessionElapsedMsRef.current,
        ts: Date.now(),
      });
      stopAll('crisis');
    };
    window.addEventListener('rescue:crisis-link-activated', handler);
    return () =>
      window.removeEventListener('rescue:crisis-link-activated', handler);
  }, [stopAll]);

  // ── React to in-process sensory-reduce flip (Settings toggle in same
  //    tab). Distinct from cross-tab handler above which is wired through
  //    the preference hook's storage listener.
  //
  //    stopAll() is deferred via queueMicrotask so we don't call setState
  //    synchronously inside an effect body (cascading-renders lint rule).
  //    The flip-detect itself is the external signal; the teardown is the
  //    response — both can land in the same microtask, before paint.
  const prevSensoryReduceRef = useRef(pref.sensoryReduce);
  useEffect(() => {
    const prev = prevSensoryReduceRef.current;
    prevSensoryReduceRef.current = pref.sensoryReduce;
    if (!pref.sensoryReduce || prev) return undefined;

    rescueTelemetry.emit('sensoryReduce.activated', {
      userId: userIdRef.current,
      source: isActiveRef.current ? 'in-session' : 'mount',
      ts: Date.now(),
    });
    if (!isActiveRef.current) return undefined;

    const handle = queueMicrotask
      ? queueMicrotask(() => stopAll('sensory-reduce'))
      : Promise.resolve().then(() => stopAll('sensory-reduce'));
    return () => {
      // queueMicrotask cannot be cancelled; handle is undefined. The
      // microtask is a no-op if stopAll has already fired or session has
      // ended (idempotent via wasActive guard inside stopAll).
      void handle;
    };
  }, [pref.sensoryReduce, stopAll]);

  // ── Opt-in setters wrap preference setters + telemetry ──────────────────
  const setHapticEnabled = useCallback(
    (value) => {
      const next = Boolean(value);
      const prev = pref.hapticEnabled;
      pref.setHapticEnabled(next);
      if (next && !prev) {
        rescueTelemetry.emit('haptic.optIn', {
          userId: userIdRef.current,
          pattern: pref.hapticPattern,
          ts: Date.now(),
        });
      } else if (!next && prev && isActiveRef.current) {
        rescueTelemetry.emit('haptic.optOut', {
          userId: userIdRef.current,
          elapsedMs: sessionElapsedMsRef.current,
          ts: Date.now(),
        });
      }
    },
    [pref]
  );

  const setAudioEnabled = useCallback(
    (value) => {
      const next = Boolean(value);
      const prev = pref.audioEnabled;
      pref.setAudioEnabled(next);
      if (next && !prev) {
        rescueTelemetry.emit('audio.optIn', {
          userId: userIdRef.current,
          volume: pref.audioVolume,
          ts: Date.now(),
        });
      } else if (!next && prev && isActiveRef.current) {
        rescueTelemetry.emit('audio.optOut', {
          userId: userIdRef.current,
          elapsedMs: sessionElapsedMsRef.current,
          ts: Date.now(),
        });
      }
    },
    [pref]
  );

  const setAudioVolume = useCallback(
    (value) => pref.setAudioVolume(value),
    [pref]
  );
  const setHapticPattern = useCallback(
    (value) => pref.setHapticPattern(value),
    [pref]
  );

  // ── Public API (exactly 13 keys per spec §2 / C-01) ─────────────────────
  return useMemo(
    () => ({
      // state (7)
      isActive,
      hapticEnabled: pref.hapticEnabled,
      audioEnabled: pref.audioEnabled,
      audioVolume: pref.audioVolume,
      hapticPattern: pref.hapticPattern,
      sensoryReduce: pref.sensoryReduce,
      sessionElapsedMs,
      // actions (6) + reaffirmPromptVisible state flag
      reaffirmPromptVisible,
      startSession,
      stopAll,
      pauseAndAwaitTap,
      setHapticEnabled,
      setAudioEnabled,
      setAudioVolume,
      setHapticPattern,
    }),
    [
      isActive,
      pref.hapticEnabled,
      pref.audioEnabled,
      pref.audioVolume,
      pref.hapticPattern,
      pref.sensoryReduce,
      sessionElapsedMs,
      reaffirmPromptVisible,
      startSession,
      stopAll,
      pauseAndAwaitTap,
      setHapticEnabled,
      setAudioEnabled,
      setAudioVolume,
      setHapticPattern,
    ]
  );
}

export default useSomaticSession;
