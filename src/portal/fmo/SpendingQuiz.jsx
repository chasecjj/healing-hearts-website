/**
 * SpendingQuiz — FMO Module 1 / Section 1 / Step 2 (AP-1).
 *
 * Spec: pr-plan.md §PR 2 SpendingQuiz.jsx + component-list.md C2.
 * Content: track-a-output/section-1-hidden-costs.md Step 2 + quiz-scoring-rubric.md
 *          + quiz-shareText.md (all v2-R1-merged, ANVIL R2 PASS 2026-05-12).
 *
 * Pattern (AP-1):
 *   - 5 questions × 4 options each (radio); BuzzFeed speed — one per screen.
 *   - 2-axis centroid classification (Time Horizon + Direction of Care).
 *   - Joint reveal: both partners' archetype cards side-by-side.
 *
 * Couples-care invariants:
 *   - showJointReveal only true when BOTH partner archetypes non-null.
 *   - Partner's archetype never displayed before joint reveal.
 *   - "There are no wrong archetypes. Your household needs both of yours." — Joint reveal copy.
 *
 * Solo preview mode (`soloPreview` prop):
 *   - Bypasses couple-resolution + DB writes + partner polling.
 *   - On submit, scores quiz locally and reveals the user's own archetype card.
 *   - Used by admin-without-couple preview path; see FMOModule1.jsx.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getQuizResults,
  saveQuizResult,
  getCoupleForUser,
  FMO_ARCHETYPES,
} from '../../lib/fmo';
import { getTypeStyle } from '../design/typography';
import { scoreQuiz } from './utils';
import archetypesConfig from './config/archetypes.json';

const POLL_INTERVAL_MS = 6000;

// ─── Component ──────────────────────────────────────────────────

export default function SpendingQuiz({ coupleId, userId, onComplete, soloPreview = false }) {
  const [responses, setResponses] = useState({});
  const [questionIdx, setQuestionIdx] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [ownArchetype, setOwnArchetype] = useState(null);
  const [partnerArchetype, setPartnerArchetype] = useState(null);
  const [partnerSlot, setPartnerSlot] = useState(null); // 'a' | 'b'
  const [error, setError] = useState(null);

  const questions = archetypesConfig.questions;
  const currentQuestion = questions[questionIdx];

  // Resolve partner slot on mount.
  useEffect(() => {
    if (soloPreview) return;
    let cancelled = false;
    if (!coupleId || !userId) return;
    getCoupleForUser(userId)
      .then((couple) => {
        if (cancelled || !couple) return;
        setPartnerSlot(couple.partner_a_id === userId ? 'a' : 'b');
      })
      .catch((e) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, [coupleId, userId, soloPreview]);

  // On mount: load any existing result so the partner archetype shows on reveal.
  useEffect(() => {
    if (soloPreview) return;
    let cancelled = false;
    if (!coupleId || !partnerSlot) return;
    getQuizResults(coupleId)
      .then((res) => {
        if (cancelled || !res) return;
        const own = partnerSlot === 'a' ? res.partnerA : res.partnerB;
        const partner = partnerSlot === 'a' ? res.partnerB : res.partnerA;
        if (own && FMO_ARCHETYPES.includes(own)) {
          setOwnArchetype(own);
          setSubmitted(true);
        }
        if (partner && FMO_ARCHETYPES.includes(partner)) {
          setPartnerArchetype(partner);
        }
      })
      .catch((e) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, [coupleId, partnerSlot, soloPreview]);

  // Poll for partner's archetype after own submission, until joint reveal possible.
  useEffect(() => {
    if (soloPreview) return;
    if (!submitted || partnerArchetype || !coupleId || !partnerSlot) return;
    let cancelled = false;
    const check = async () => {
      try {
        const res = await getQuizResults(coupleId);
        if (cancelled || !res) return;
        const partner = partnerSlot === 'a' ? res.partnerB : res.partnerA;
        if (partner && FMO_ARCHETYPES.includes(partner)) setPartnerArchetype(partner);
      } catch (e) {
        if (!cancelled) setError(e.message);
      }
    };
    check();
    const interval = setInterval(check, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [submitted, partnerArchetype, coupleId, partnerSlot, soloPreview]);

  const showJointReveal = !soloPreview && Boolean(ownArchetype && partnerArchetype);
  const showSoloReveal = soloPreview && Boolean(ownArchetype);

  // Fire onComplete when reveal possible (joint OR solo).
  useEffect(() => {
    if ((showJointReveal || showSoloReveal) && typeof onComplete === 'function') onComplete();
  }, [showJointReveal, showSoloReveal, onComplete]);

  const handleSelect = useCallback((qid, optId) => {
    setResponses((prev) => ({ ...prev, [qid]: optId }));
  }, []);

  const allAnswered = useMemo(
    () => questions.every((q) => responses[q.id]),
    [questions, responses]
  );

  const handleSubmit = useCallback(async () => {
    if (!allAnswered) return;
    const archetype = scoreQuiz(responses);
    if (soloPreview) {
      setOwnArchetype(archetype);
      setSubmitted(true);
      return;
    }
    if (!coupleId || !partnerSlot) return;
    try {
      await saveQuizResult(coupleId, partnerSlot, archetype);
      setOwnArchetype(archetype);
      setSubmitted(true);
    } catch (e) {
      setError(e.message || 'Failed to save quiz result');
    }
  }, [allAnswered, responses, coupleId, partnerSlot, soloPreview]);

  const ownArchetypeData = ownArchetype
    ? archetypesConfig.archetypes.find((a) => a.id === ownArchetype)
    : null;
  const partnerArchetypeData = partnerArchetype
    ? archetypesConfig.archetypes.find((a) => a.id === partnerArchetype)
    : null;

  // ─── Render branches ─────────────────────────────────────────

  if (showJointReveal) {
    return (
      <section
        aria-label="Spending personality joint reveal"
        style={{
          backgroundColor: 'var(--pt-elevation-1)',
          borderRadius: 24,
          padding: 24,
          border: '1px solid var(--pt-border-subtle)',
        }}
      >
        <h2 style={{ ...getTypeStyle('heading-1'), color: 'var(--pt-text-primary)', margin: 0 }}>
          Your Spending Personalities
        </h2>
        <p style={{ ...getTypeStyle('body'), color: 'var(--pt-text-muted)', marginTop: 8 }}>
          There are no wrong archetypes. Your household needs both of yours.
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 16,
            marginTop: 16,
          }}
        >
          {[ownArchetypeData, partnerArchetypeData].map((a, idx) => (
            <ArchetypeCard
              key={a.id}
              archetype={a}
              who={idx === 0 ? 'You' : 'Your partner'}
            />
          ))}
        </div>
        <p
          style={{
            ...getTypeStyle('body'),
            color: 'var(--pt-text-primary)',
            marginTop: 16,
            fontStyle: 'italic',
          }}
        >
          You've just named something most couples never name out loud. Your archetypes aren't opposites — they're the two halves of how your household actually works. Every Spending Plan you build from here is for both of you. The next step is naming what that plan is for.
        </p>
      </section>
    );
  }

  if (showSoloReveal) {
    return (
      <section
        aria-label="Spending personality solo preview"
        style={{
          backgroundColor: 'var(--pt-elevation-1)',
          borderRadius: 24,
          padding: 24,
          border: '1px solid var(--pt-border-subtle)',
        }}
      >
        <h2 style={{ ...getTypeStyle('heading-1'), color: 'var(--pt-text-primary)', margin: 0 }}>
          Your Spending Personality
        </h2>
        <p style={{ ...getTypeStyle('body'), color: 'var(--pt-text-muted)', marginTop: 8 }}>
          Admin solo preview — your archetype only. Joint reveal is shown when both partners submit.
        </p>
        <div style={{ marginTop: 16 }}>
          <ArchetypeCard archetype={ownArchetypeData} who="You" />
        </div>
      </section>
    );
  }

  if (submitted) {
    return (
      <section
        aria-label="Spending personality waiting"
        style={{
          backgroundColor: 'var(--pt-elevation-1)',
          borderRadius: 24,
          padding: 24,
          border: '1px solid var(--pt-border-subtle)',
        }}
      >
        <h2 style={{ ...getTypeStyle('heading-1'), color: 'var(--pt-text-primary)', margin: 0 }}>
          Your results are in.
        </h2>
        <p style={{ ...getTypeStyle('body'), color: 'var(--pt-text-primary)', marginTop: 8 }}>
          Hang tight — your results unlock together when your partner finishes too. There are five personalities, and we want both of yours in front of you at the same time.
        </p>
      </section>
    );
  }

  // Quiz-in-progress: render current question
  return (
    <section
      aria-label="Spending personality quiz"
      style={{
        backgroundColor: 'var(--pt-elevation-1)',
        borderRadius: 24,
        padding: 24,
        border: '1px solid var(--pt-border-subtle)',
      }}
    >
      <h2 style={{ ...getTypeStyle('heading-1'), color: 'var(--pt-text-primary)', margin: 0 }}>
        Your Spending Personality
      </h2>
      <p style={{ ...getTypeStyle('body'), color: 'var(--pt-text-muted)', marginTop: 8 }}>
        Question {questionIdx + 1} of {questions.length}. Each partner answers independently. Results are revealed together after both partners submit.
      </p>
      <fieldset style={{ border: 'none', padding: 0, marginTop: 16 }}>
        <legend
          style={{
            ...getTypeStyle('body'),
            color: 'var(--pt-text-primary)',
            marginBottom: 12,
            fontWeight: 600,
          }}
        >
          {currentQuestion.prompt}
        </legend>
        {currentQuestion.options.map((opt) => (
          <label
            key={opt.id}
            style={{
              display: 'block',
              padding: 12,
              marginBottom: 8,
              borderRadius: 12,
              border: '1px solid var(--pt-border-subtle)',
              backgroundColor:
                responses[currentQuestion.id] === opt.id
                  ? 'var(--pt-elevation-2)'
                  : 'transparent',
              cursor: 'pointer',
            }}
          >
            <input
              type="radio"
              name={currentQuestion.id}
              value={opt.id}
              checked={responses[currentQuestion.id] === opt.id}
              onChange={() => handleSelect(currentQuestion.id, opt.id)}
              style={{ marginRight: 12 }}
            />
            <span style={{ ...getTypeStyle('body'), color: 'var(--pt-text-primary)' }}>
              {opt.text}
            </span>
          </label>
        ))}
      </fieldset>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, gap: 8 }}>
        <button
          type="button"
          onClick={() => setQuestionIdx((i) => Math.max(0, i - 1))}
          disabled={questionIdx === 0}
          style={{
            padding: '10px 20px',
            borderRadius: 12,
            backgroundColor: 'transparent',
            color: 'var(--pt-text-primary)',
            border: '1px solid var(--pt-border-subtle)',
            cursor: questionIdx === 0 ? 'not-allowed' : 'pointer',
            ...getTypeStyle('body'),
          }}
        >
          Back
        </button>
        {questionIdx < questions.length - 1 ? (
          <button
            type="button"
            onClick={() => setQuestionIdx((i) => i + 1)}
            disabled={!responses[currentQuestion.id]}
            style={{
              padding: '10px 20px',
              borderRadius: 12,
              backgroundColor: responses[currentQuestion.id]
                ? 'var(--pt-primary-accent)'
                : 'var(--pt-border-subtle)',
              color: 'var(--pt-text-inverse)',
              border: 'none',
              cursor: responses[currentQuestion.id] ? 'pointer' : 'not-allowed',
              ...getTypeStyle('body'),
            }}
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!allAnswered}
            style={{
              padding: '10px 20px',
              borderRadius: 12,
              backgroundColor: allAnswered ? 'var(--pt-primary-accent)' : 'var(--pt-border-subtle)',
              color: 'var(--pt-text-inverse)',
              border: 'none',
              cursor: allAnswered ? 'pointer' : 'not-allowed',
              ...getTypeStyle('body'),
            }}
          >
            See my result
          </button>
        )}
      </div>
      {error && (
        <p role="alert" style={{ ...getTypeStyle('caption'), color: 'var(--pt-danger)', marginTop: 12 }}>
          {error}
        </p>
      )}
    </section>
  );
}

// ─── Archetype Card ─────────────────────────────────────────────

function ArchetypeCard({ archetype, who }) {
  const [copied, setCopied] = useState(false);
  if (!archetype) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(archetype.shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard restricted — silent fail (button stays "Copy").
    }
  };

  return (
    <article
      aria-label={`${who}: ${archetype.id}`}
      style={{
        backgroundColor: 'var(--pt-elevation-2)',
        borderRadius: 16,
        padding: 16,
        border: '1px solid var(--pt-border-subtle)',
      }}
    >
      <p style={{ ...getTypeStyle('caption'), color: 'var(--pt-text-muted)', margin: 0 }}>
        {who}
      </p>
      <h3 style={{ ...getTypeStyle('heading-2'), color: 'var(--pt-text-primary)', margin: '4px 0' }}>
        The {archetype.id.replace('-', ' ')}
      </h3>
      <p style={{ ...getTypeStyle('caption'), color: 'var(--pt-text-muted)', margin: 0, fontStyle: 'italic' }}>
        {archetype.subtype}
      </p>
      <p style={{ ...getTypeStyle('body'), color: 'var(--pt-text-primary)', marginTop: 12 }}>
        {archetype.recognition}
      </p>
      <p style={{ ...getTypeStyle('body'), color: 'var(--pt-text-primary)', marginTop: 12 }}>
        {archetype.clinical}
      </p>
      <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={handleCopy}
          style={{
            padding: '6px 12px',
            borderRadius: 8,
            backgroundColor: 'var(--pt-primary-accent)',
            color: 'var(--pt-text-inverse)',
            border: 'none',
            cursor: 'pointer',
            ...getTypeStyle('caption'),
          }}
        >
          {copied ? 'Copied!' : 'Copy share text'}
        </button>
        <span style={{ ...getTypeStyle('caption'), color: 'var(--pt-text-muted)' }}>
          Tap to copy your result to share — or just keep it for yourself.
        </span>
      </div>
    </article>
  );
}
