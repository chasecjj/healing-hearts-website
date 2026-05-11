/**
 * RescuePage — top-level Rescue surface.
 *
 * Spec: portal-rescue-kit-v1 wave-3.1-frameworks-spec §7 + primitives-spec.
 *
 * Composition:
 *   <RescueHeader showBreathPacer={isActive} />
 *   <TierToggle /> + <FrameworkCardGrid />
 *   <KillSwitchButton />  (fixed bottom-right; always-visible per G3)
 *   <SensoryReduceToggle />
 *   <ReaffirmPrompt />    (modal; mounts on coordinator's reaffirmPromptVisible)
 *
 * Wave 3.2 Phase 1B scope:
 *   - Shell + frameworks library + kill-switch + sensory-reduce wired.
 *   - Somatic stack (Lane C haptic + Lane D audio + Lane I interactive)
 *     not yet wired; Phase 2 lane work. Coordinator is in place; visual
 *     pacer renders when `isActive`. Tony can dogfood the shell as-is.
 *
 * Coordinator API divergence note:
 *   useSomaticSession exposes `sensoryReduce` (read) but NOT a `setSensoryReduce`
 *   setter — its 13-key public API only surfaces session-control actions. The
 *   sensory-reduce write happens inside SensoryReduceToggle (synchronous
 *   localStorage write per primitives-spec §4.2.1). To make the coordinator
 *   observe the same-tab flip (cross-tab works via native storage event),
 *   we dispatch a synthetic storage event from the page's onChange handler.
 *   This is the only divergence from the Lane-FW brief, which assumed a
 *   coordinator setter that doesn't exist.
 *
 * Re-affirm "Keep going" wiring:
 *   Coordinator does NOT expose `continueSession()`. Spec §5.4 says coordinator
 *   "handles audio fade … visual pause, haptic stop" on the keep-going path,
 *   but the actual mechanism is `startSession({ resetClock: true })` — the
 *   coordinator's idempotent restart with elapsed-clock reset. We pass that
 *   as the onKeepGoing handler.
 */

import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useSomaticSession } from './hooks/useSomaticSession';

import RescueHeader from './components/RescueHeader';
import KillSwitchButton from './components/KillSwitchButton';
import SensoryReduceToggle from './components/SensoryReduceToggle';
import ReaffirmPrompt from './components/ReaffirmPrompt';
import TierToggle from './components/TierToggle';
import FrameworkCardGrid from './components/FrameworkCardGrid';

import { TIER_1_FRAMEWORKS, TIER_2_FRAMEWORKS } from './data/frameworks';
import { getTypeStyle } from '../../design/typography';

// ── useTierState — internal hook (spec §7.useTierState) ────────────────────
function useTierState(userId) {
  const key = `rescue-tier-${userId || 'anonymous'}`;
  const [tier, setTierState] = useState(() => {
    if (typeof window === 'undefined') return 'right-now';
    try {
      const stored = window.localStorage.getItem(key);
      return stored === 'right-now' || stored === 'learn' ? stored : 'right-now';
    } catch {
      return 'right-now';
    }
  });

  const setTier = useCallback(
    (next) => {
      setTierState(next);
      if (typeof window === 'undefined') return;
      try {
        window.localStorage.setItem(key, next);
      } catch {
        // Quota / private-mode — silent
      }
    },
    [key]
  );

  // Note: no re-hydrate effect on userId change. RescuePage sits behind
  // ProtectedRoute, so `user` is always present at mount; transitioning
  // from 'anonymous' → real userId mid-mount is not a real path. The lazy
  // initializer above is sufficient for first-visit hydration.

  return [tier, setTier];
}

export default function RescuePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const userId = user?.id ?? 'anonymous';
  const [tier, setTier] = useTierState(userId);

  const {
    isActive,
    sensoryReduce,
    reaffirmPromptVisible,
    startSession,
    stopAll,
    pauseAndAwaitTap,
  } = useSomaticSession();

  const frameworks = tier === 'right-now' ? TIER_1_FRAMEWORKS : TIER_2_FRAMEWORKS;

  // SensoryReduce toggle handler — see file-header note for the synthetic
  // storage-event dispatch rationale.
  const handleSensoryReduceChange = useCallback((next) => {
    if (typeof window === 'undefined') return;
    // SensoryReduceToggle already wrote localStorage; we just nudge the
    // coordinator's same-tab observer.
    try {
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'hh-sensory-reduce',
          newValue: next ? 'true' : 'false',
          storageArea: window.localStorage,
        })
      );
    } catch {
      // Some browsers restrict StorageEvent constructor; fall through —
      // coordinator's prev-state effect picks it up on next render via
      // useSomaticPreference's internal listener if available.
    }
  }, []);

  // Re-affirm prompt: "Keep going" maps to startSession({resetClock: true});
  // "I'm done" maps to stopAll + navigate home; timeout maps to pauseAndAwaitTap.
  const handleReaffirmKeepGoing = useCallback(() => {
    startSession({ resetClock: true });
  }, [startSession]);

  const handleReaffirmImDone = useCallback(() => {
    stopAll('user-imDone');
    navigate('/portal');
  }, [stopAll, navigate]);

  const handleReaffirmTimeout = useCallback(() => {
    pauseAndAwaitTap();
  }, [pauseAndAwaitTap]);

  return (
    <div
      className="min-h-screen w-full flex flex-col"
      style={{ backgroundColor: 'var(--pt-content-bg)' }}
    >
      <RescueHeader showBreathPacer={isActive} showHotline={true} />

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col gap-8">
        <header className="flex flex-col gap-2">
          <h1
            style={{
              ...getTypeStyle('heading-1'),
              color: 'var(--pt-text-primary)',
              margin: 0,
            }}
          >
            Rescue Kit
          </h1>
          <p
            style={{
              ...getTypeStyle('body'),
              color: 'var(--pt-text-muted)',
              margin: 0,
            }}
          >
            Tools for the moments you can&apos;t think clearly. Pick one. We&apos;ll be here.
          </p>
        </header>

        <div className="flex justify-start sm:justify-center">
          <TierToggle
            value={tier}
            onChange={setTier}
            ariaLabel="Switch between emergency tools and learning"
          />
        </div>

        <FrameworkCardGrid frameworks={frameworks} />

        <section
          aria-label="Sensory controls"
          className="mt-4 pt-6"
          style={{
            borderTop: '1px solid var(--pt-border-subtle)',
          }}
        >
          <SensoryReduceToggle
            value={sensoryReduce}
            onChange={handleSensoryReduceChange}
          />
        </section>
      </main>

      {/* G3 — always-visible crisis escape. */}
      <KillSwitchButton
        onActivate={() => stopAll('killswitch')}
        ariaLabel="Stop all sound and vibration"
      />

      {/* 3-min re-affirm modal — only mounts when coordinator says visible. */}
      <ReaffirmPrompt
        visible={reaffirmPromptVisible}
        onKeepGoing={handleReaffirmKeepGoing}
        onImDone={handleReaffirmImDone}
        onTimeout={handleReaffirmTimeout}
      />
    </div>
  );
}
