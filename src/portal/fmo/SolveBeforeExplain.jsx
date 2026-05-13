/**
 * SolveBeforeExplain — FMO Module 1 / Section 1 / Step 1 opener (AP-5).
 *
 * Spec: pr-plan.md §PR 2 SolveBeforeExplain.jsx + component-list.md C1.
 * Content: track-a-output/section-1-hidden-costs.md Step 1.
 *
 * Pattern (AP-5):
 *   - Both partners submit independently before reveal fires.
 *   - Reveal card uses "you both" framing — never names one answer as wrong.
 *   - Inline reveal in the same view; no page redirect.
 *
 * Couples-care invariants:
 *   - Reveal card only renders when `showReveal === true`.
 *   - No partner answer shown before reveal.
 *   - "The real question isn't which you picked. It's whether you and your partner
 *     picked the same thing" — single source of truth in the reveal copy.
 *
 * Storage: `lesson_progress` row keyed (user_id, lesson_id); the opener-submitted
 *   flag is stored in `metadata.fmo_m1_opener_submitted: true` and the picked
 *   option in `metadata.fmo_m1_opener_choice` (one of 'A'|'B'|'C'|'D').
 *   Partner-submission is detected by polling the other partner's lesson_progress
 *   row for the same `lesson_id` + `couple_id`. PR 4 may swap polling for
 *   Supabase Realtime; v1 ships polling on a 6s cadence.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { getCoupleForUser } from '../../lib/fmo';
import { getTypeStyle } from '../design/typography';

const OPTIONS = [
  { id: 'A', label: 'Pay the $200 toward credit card debt first' },
  { id: 'B', label: 'Put the $200 into savings first' },
  { id: 'C', label: 'Cover the anniversary dinner first — the other two can shift' },
  { id: 'D', label: 'Split the $400 evenly: $100 to debt, $100 to savings, and adjust the dinner budget' },
];

const REVEAL_BY_OPTION = {
  A: "High-interest credit card debt costs money every month you carry it. Prioritizing it is mathematically sound — every dollar toward a 20%+ APR card is a guaranteed 20% return. This is a solid instinct. The risk is treating every dollar as debt-fighting fuel and crowding out the things that make the plan feel worth keeping.",
  B: "The emergency fund instinct. Before goals, before debt paydown beyond minimums, having a cushion means the next $800 car repair doesn't become an $800 credit card charge. This logic is also sound — and it's how savings behavior compounds over time. The risk is letting savings feel abstract when a meaningful shared moment (your anniversary) is right in front of you.",
  C: "Spending on connection and celebration is not waste — it's investment in the relationship that makes everything else sustainable. YNAB's research consistently shows that households with room for joy in their plan are more likely to stick to it. The risk: making this call without a plan means future months absorb the pressure.",
  D: "Flexibility is a real financial skill. Distributing the impact across all three priorities is reasonable and shows both partners' concerns were heard. This is often what a well-constructed Spending Plan makes automatic.",
};

const POLL_INTERVAL_MS = 6000;

export default function SolveBeforeExplain({ lessonId, userId, coupleId, onComplete }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [partnerSubmitted, setPartnerSubmitted] = useState(false);
  const [partnerId, setPartnerId] = useState(null);
  const [error, setError] = useState(null);

  // Resolve the other partner's user id once.
  useEffect(() => {
    let cancelled = false;
    if (!coupleId || !userId) return;
    getCoupleForUser(userId)
      .then((couple) => {
        if (cancelled || !couple) return;
        const other = couple.partner_a_id === userId ? couple.partner_b_id : couple.partner_a_id;
        setPartnerId(other || null);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message || 'Failed to resolve partner');
      });
    return () => {
      cancelled = true;
    };
  }, [coupleId, userId]);

  // Poll for partner submission once both userId + partnerId + own submission are present.
  useEffect(() => {
    if (!submitted || !partnerId || partnerSubmitted) return;

    let cancelled = false;
    const check = async () => {
      const { data, error: pollErr } = await supabase
        .from('lesson_progress')
        .select('metadata')
        .eq('user_id', partnerId)
        .eq('lesson_id', lessonId)
        .maybeSingle();
      if (cancelled) return;
      if (pollErr) {
        setError(pollErr.message);
        return;
      }
      if (data?.metadata?.fmo_m1_opener_submitted) {
        setPartnerSubmitted(true);
      }
    };
    check();
    const interval = setInterval(check, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [submitted, partnerId, partnerSubmitted, lessonId]);

  // Fire onComplete when both partners have submitted (single transition).
  useEffect(() => {
    if (submitted && partnerSubmitted && typeof onComplete === 'function') {
      onComplete();
    }
  }, [submitted, partnerSubmitted, onComplete]);

  const handleSubmit = useCallback(async () => {
    if (!selectedOption || !lessonId || !userId) return;
    try {
      const { error: writeErr } = await supabase
        .from('lesson_progress')
        .upsert(
          {
            user_id: userId,
            lesson_id: lessonId,
            couple_id: coupleId || null,
            metadata: {
              fmo_m1_opener_submitted: true,
              fmo_m1_opener_choice: selectedOption,
              fmo_m1_opener_submitted_at: new Date().toISOString(),
            },
          },
          { onConflict: 'user_id,lesson_id' }
        );
      if (writeErr) throw writeErr;
      setSubmitted(true);
    } catch (e) {
      setError(e.message || 'Failed to save your selection');
    }
  }, [selectedOption, lessonId, userId, coupleId]);

  const showReveal = submitted && partnerSubmitted;

  return (
    <section
      aria-label="Solve before explain opener"
      style={{
        backgroundColor: 'var(--pt-elevation-1)',
        borderRadius: 24,
        padding: 24,
        border: '1px solid var(--pt-border-subtle)',
      }}
    >
      <h2 style={{ ...getTypeStyle('heading-1'), color: 'var(--pt-text-primary)', margin: 0 }}>
        Step 1 — What do you prioritize?
      </h2>
      <p
        style={{
          ...getTypeStyle('body'),
          color: 'var(--pt-text-muted)',
          marginTop: 12,
          marginBottom: 12,
        }}
      >
        Both partners answer this independently before comparing. Do not share your answer until after you both submit.
      </p>
      <p style={{ ...getTypeStyle('body'), color: 'var(--pt-text-primary)', marginTop: 0, marginBottom: 16 }}>
        You have <strong>$3,400 left</strong> after bills this month. You want to pay $200 in credit card debt, put $200 into savings, and cover your anniversary dinner. You cannot do all three in full. What do you prioritize first?
      </p>

      {!submitted && (
        <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
          <legend style={{ ...getTypeStyle('caption'), color: 'var(--pt-text-muted)', marginBottom: 12 }}>
            Select one:
          </legend>
          {OPTIONS.map((opt) => (
            <label
              key={opt.id}
              style={{
                display: 'block',
                padding: 12,
                marginBottom: 8,
                borderRadius: 12,
                border: '1px solid var(--pt-border-subtle)',
                cursor: 'pointer',
                backgroundColor:
                  selectedOption === opt.id ? 'var(--pt-elevation-2)' : 'transparent',
              }}
            >
              <input
                type="radio"
                name="solve-before-explain"
                value={opt.id}
                checked={selectedOption === opt.id}
                onChange={() => setSelectedOption(opt.id)}
                style={{ marginRight: 12 }}
              />
              <span style={{ ...getTypeStyle('body'), color: 'var(--pt-text-primary)' }}>
                {opt.id} — {opt.label}
              </span>
            </label>
          ))}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!selectedOption}
            style={{
              marginTop: 12,
              padding: '10px 20px',
              borderRadius: 12,
              backgroundColor: selectedOption ? 'var(--pt-primary-accent)' : 'var(--pt-border-subtle)',
              color: 'var(--pt-text-inverse)',
              border: 'none',
              cursor: selectedOption ? 'pointer' : 'not-allowed',
              ...getTypeStyle('body'),
            }}
          >
            Submit
          </button>
        </fieldset>
      )}

      {submitted && !showReveal && (
        <div
          role="status"
          aria-live="polite"
          style={{
            marginTop: 16,
            padding: 16,
            borderRadius: 12,
            backgroundColor: 'var(--pt-elevation-2)',
            border: '1px solid var(--pt-border-subtle)',
          }}
        >
          <p style={{ ...getTypeStyle('body'), color: 'var(--pt-text-primary)', margin: 0 }}>
            Your answer is in. Hang tight — the reveal unlocks when your partner submits too.
          </p>
        </div>
      )}

      {showReveal && (
        <div
          role="region"
          aria-label="Reveal card"
          style={{
            marginTop: 16,
            padding: 16,
            borderRadius: 12,
            backgroundColor: 'var(--pt-elevation-2)',
            border: '1px solid var(--pt-border-subtle)',
          }}
        >
          <h3 style={{ ...getTypeStyle('heading-2'), color: 'var(--pt-text-primary)', margin: 0 }}>
            There's no single right answer here.
          </h3>
          <p style={{ ...getTypeStyle('body'), color: 'var(--pt-text-primary)', marginTop: 8 }}>
            What matters is the reasoning, and whether your household's reasoning is the same.
          </p>
          <p style={{ ...getTypeStyle('body'), color: 'var(--pt-text-primary)', marginTop: 12 }}>
            <strong>You chose option {selectedOption}.</strong> {REVEAL_BY_OPTION[selectedOption]}
          </p>
          <p
            style={{
              ...getTypeStyle('body'),
              color: 'var(--pt-text-primary)',
              marginTop: 12,
              fontStyle: 'italic',
            }}
          >
            The real question isn't which you picked. It's whether you and your partner picked the same thing — and if not, what that tells you about the stories each of you is carrying.
          </p>
        </div>
      )}

      {error && (
        <p
          role="alert"
          style={{ ...getTypeStyle('caption'), color: 'var(--pt-danger)', marginTop: 12 }}
        >
          {error}
        </p>
      )}
    </section>
  );
}
