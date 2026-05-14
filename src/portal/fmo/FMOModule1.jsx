/**
 * FMOModule1 — Module 1 orchestrator (W4 / PR 4).
 *
 * Spec: pr-plan.md §PR 4 FMOModule1.jsx + component-list.md C1-C8.
 *
 * Sequences the 5-step Module 1 journey:
 *   1. SolveBeforeExplain  (AP-5)   — opener prioritization scenario.
 *   2. SpendingQuiz        (AP-1)   — archetype quiz + joint reveal.
 *   3. SpendingPlanBuilder (AP-2+4) — categories + breathing room (composes AP-8).
 *   4. WishlistVote        (AP-7)   — top-3 goals + joint overlap reveal.
 *   5. MoneyDateKitButton  (AP-6)   — section-close PDF download CTA.
 *
 * Step state is local. Each child reports completion via `onComplete()`;
 * orchestrator advances to the next step on that signal. A "Continue"
 * button between steps lets the user pace progression once the previous
 * step has unlocked (joint reveal seen, plan submitted, etc.).
 *
 * Couples-care: ALL partner-comparison gating is owned by the child
 * components themselves (BLIND waiting states, joint reveals). The
 * orchestrator never inspects partner state directly.
 *
 * Auth + couple gating:
 *   - Hosted under <ProtectedRoute> (signed-in users only).
 *   - useFMOSession resolves couple_id. Users without a couple see a soft
 *     message explaining FMO is a joint-track module — never blocked at
 *     the route level (Chase ruling: avoid hard gating in stub phase).
 *   - Admins without a couple get a full 5-step solo preview: each step's
 *     `soloPreview` prop bypasses couple-resolution, partner polling, and
 *     DB writes; reveal/own-state renders immediately on submit. An "Admin
 *     preview" banner surfaces at the top of the orchestrator.
 */

import React, { useCallback, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useFMOSession } from '../../hooks/useFMOSession';
import { getTypeStyle } from '../design/typography';

import SolveBeforeExplain from './SolveBeforeExplain';
import SpendingQuiz from './SpendingQuiz';
import SpendingPlanBuilder from './SpendingPlanBuilder';
import WishlistVote from './WishlistVote';
import MoneyDateKitButton from './MoneyDateKitButton';
import lessonsConfig from './config/lessons.json';

// FMO Module 1 lesson ids — real UUIDs from migration 039 (applied to prod
// 2026-05-13 02:02 UTC). These populate lesson_progress rows on completion;
// the lesson_id column FK-references lessons(id) (uuid), so string slugs are
// no longer acceptable. Source of truth: ./config/lessons.json.
const LESSON_ID_OPENER = lessonsConfig.lessons.opener;

const STEPS = [
  { id: 'opener', label: 'Step 1 — Solve before explain' },
  { id: 'quiz', label: 'Step 2 — Spending personality' },
  { id: 'plan', label: 'Step 3 — Build your Spending Plan' },
  { id: 'wishlist', label: 'Step 4 — Vote on your top goals' },
  { id: 'kit', label: 'Step 5 — Money Date Kit' },
];

export default function FMOModule1() {
  const { user, isAdmin } = useAuth();
  const { coupleId, loading, error } = useFMOSession();
  const [stepIdx, setStepIdx] = useState(0);
  const [stepUnlocked, setStepUnlocked] = useState(false);

  const userId = user?.id;

  const handleStepComplete = useCallback(() => {
    setStepUnlocked(true);
  }, []);

  const handleContinue = useCallback(() => {
    setStepUnlocked(false);
    setStepIdx((i) => Math.min(STEPS.length - 1, i + 1));
  }, []);

  if (loading) {
    return (
      <div
        style={{
          minHeight: '40vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--pt-text-muted)',
        }}
      >
        <p style={getTypeStyle('body')}>Loading your Module 1 session&hellip;</p>
      </div>
    );
  }

  // Non-admin without a couple — surface the soft "reach out to facilitator" message.
  // Admins without a couple fall through to the full orchestrator in soloPreview mode
  // (each step renders standalone, no DB writes).
  if (!coupleId && !isAdmin) {
    return (
      <main
        className="max-w-3xl mx-auto px-4 sm:px-6 py-10"
        style={{ backgroundColor: 'var(--pt-content-bg)' }}
      >
        <h1
          style={{
            ...getTypeStyle('heading-1'),
            color: 'var(--pt-text-primary)',
            margin: 0,
            marginBottom: 16,
          }}
        >
          Module 1 — The Financial Module Overhaul
        </h1>
        <p style={{ ...getTypeStyle('body'), color: 'var(--pt-text-primary)' }}>
          This module is built for couples — you and your partner walk it together
          on the same device or separately, and the portal joins your answers when
          both of you have submitted.
        </p>
        <p style={{ ...getTypeStyle('body'), color: 'var(--pt-text-muted)', marginTop: 12 }}>
          Your account isn&apos;t linked to a partner yet. Reach out to your facilitator
          to get your couple profile created, and your Module 1 surface will unlock
          here automatically.
        </p>
      </main>
    );
  }

  const soloPreview = !coupleId && isAdmin;
  const currentStep = STEPS[stepIdx];

  return (
    <main
      className="max-w-3xl mx-auto px-4 sm:px-6 py-10 flex flex-col gap-6"
      style={{ backgroundColor: 'var(--pt-content-bg)' }}
      aria-label="FMO Module 1"
    >
      <header>
        {soloPreview && (
          <p
            style={{
              ...getTypeStyle('caption'),
              color: 'var(--pt-warning)',
              textTransform: 'uppercase',
              letterSpacing: '0.18em',
              margin: 0,
              marginBottom: 6,
              fontWeight: 600,
            }}
          >
            Admin preview · Solo mode · Results not persisted
          </p>
        )}
        <p
          style={{
            ...getTypeStyle('caption'),
            color: 'var(--pt-text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.18em',
            margin: 0,
          }}
        >
          Module 1 · The Financial Module Overhaul
        </p>
        <h1
          style={{
            ...getTypeStyle('heading-1'),
            color: 'var(--pt-text-primary)',
            margin: 0,
            marginTop: 6,
          }}
        >
          {currentStep.label}
        </h1>
        <p
          style={{
            ...getTypeStyle('caption'),
            color: 'var(--pt-text-muted)',
            marginTop: 8,
          }}
        >
          Step {stepIdx + 1} of {STEPS.length}
        </p>
      </header>

      {error && (
        <p
          role="alert"
          style={{
            ...getTypeStyle('caption'),
            color: 'var(--pt-danger)',
          }}
        >
          {error}
        </p>
      )}

      {/* ── Step render — only the active step's component is mounted. ── */}
      {currentStep.id === 'opener' && (
        <SolveBeforeExplain
          lessonId={LESSON_ID_OPENER}
          userId={userId}
          coupleId={coupleId}
          onComplete={handleStepComplete}
          soloPreview={soloPreview}
        />
      )}
      {currentStep.id === 'quiz' && (
        <SpendingQuiz
          coupleId={coupleId}
          userId={userId}
          onComplete={handleStepComplete}
          soloPreview={soloPreview}
        />
      )}
      {currentStep.id === 'plan' && (
        <SpendingPlanBuilder
          coupleId={coupleId}
          userId={userId}
          onComplete={handleStepComplete}
          soloPreview={soloPreview}
        />
      )}
      {currentStep.id === 'wishlist' && (
        <WishlistVote
          coupleId={coupleId}
          userId={userId}
          onComplete={handleStepComplete}
          soloPreview={soloPreview}
        />
      )}
      {currentStep.id === 'kit' && (
        <section
          aria-label="Money Date Kit close"
          style={{
            backgroundColor: 'var(--pt-elevation-1)',
            borderRadius: 24,
            padding: 24,
            border: '1px solid var(--pt-border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <h2
            style={{
              ...getTypeStyle('heading-2'),
              color: 'var(--pt-text-primary)',
              margin: 0,
            }}
          >
            Your Money Date Kit
          </h2>
          <p style={{ ...getTypeStyle('body'), color: 'var(--pt-text-primary)', margin: 0 }}>
            You&rsquo;ve named your archetypes, built your Spending Plan, and voted on the
            goals that matter most. This PDF is the joint ritual artifact — print it,
            run a Money Date together, and bring what you learn back here next week.
          </p>
          <MoneyDateKitButton />
        </section>
      )}

      {/* ── Continue / closing footer ─── */}
      {stepIdx < STEPS.length - 1 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={handleContinue}
            disabled={!stepUnlocked}
            style={{
              padding: '10px 20px',
              borderRadius: 12,
              backgroundColor: stepUnlocked
                ? 'var(--pt-primary-accent)'
                : 'var(--pt-border-subtle)',
              color: 'var(--pt-text-inverse)',
              border: 'none',
              cursor: stepUnlocked ? 'pointer' : 'not-allowed',
              ...getTypeStyle('body'),
              fontWeight: 600,
            }}
            aria-label="Continue to the next step"
          >
            Continue →
          </button>
        </div>
      )}
    </main>
  );
}
