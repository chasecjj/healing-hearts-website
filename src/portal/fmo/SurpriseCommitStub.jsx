/**
 * SurpriseCommitStub — FMO Component 12 (AP-3 scaffold).
 *
 * Spec: pr-plan.md §PR 3 + component-list.md C12.
 *
 * Behavior (Thursday-stub):
 *   - Component renders correctly via direct URL `/portal/fmo/surprise-commit`.
 *   - NOT linked from dashboard nav (verified by absence of nav reference).
 *   - Guess fields per-partner; reveal is simultaneous (both submit → both see).
 *   - Auto-queue into daily-check Thursday-cadence: NOT wired yet (Week 2 work).
 *
 * Couples-care invariants:
 *   - "Shared data moment" framing — actual number is joint, not one partner's audit.
 *   - Partner's guess never shown before both submit.
 *   - Commitment is joint authorship (either partner can author; couple-scoped store).
 *
 * Persistence (stub-level):
 *   - Guesses + actual + commitment stored in lesson_progress.metadata under
 *     a stub-scoped key so the data round-trips without a new table. Production
 *     wiring (Week 2) may migrate to a dedicated couple_surprise_commits table;
 *     this stub avoids that until usage telemetry justifies it.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { getCoupleForUser } from '../../lib/fmo';
import { getTypeStyle } from '../design/typography';

// Single category for the v1 stub — dining-out. Production may iterate.
const STUB_LESSON_ID = 'fmo-m1-surprise-commit';
const STUB_CATEGORY_LABEL = 'dining out';

function parseDollars(str) {
  const n = parseFloat(str);
  if (Number.isNaN(n) || n < 0) return null;
  return Math.round(n * 100) / 100;
}

export default function SurpriseCommitStub({ coupleId, userId }) {
  const [ownGuess, setOwnGuess] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [partnerSubmitted, setPartnerSubmitted] = useState(false);
  const [partnerGuess, setPartnerGuess] = useState(null);
  const [actualAmount, setActualAmount] = useState('');
  const [commitment, setCommitment] = useState('');
  const [partnerId, setPartnerId] = useState(null);
  const [error, setError] = useState(null);

  // Resolve partner id.
  useEffect(() => {
    let cancelled = false;
    if (!coupleId || !userId) return;
    getCoupleForUser(userId)
      .then((couple) => {
        if (cancelled || !couple) return;
        const other =
          couple.partner_a_id === userId ? couple.partner_b_id : couple.partner_a_id;
        setPartnerId(other || null);
      })
      .catch((e) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, [coupleId, userId]);

  // Poll partner submission after own submit.
  useEffect(() => {
    if (!submitted || !partnerId || partnerSubmitted) return;
    let cancelled = false;
    const check = async () => {
      const { data } = await supabase
        .from('lesson_progress')
        .select('metadata')
        .eq('user_id', partnerId)
        .eq('lesson_id', STUB_LESSON_ID)
        .maybeSingle();
      if (cancelled) return;
      const guess = data?.metadata?.fmo_surprise_guess;
      if (guess !== undefined && guess !== null) {
        setPartnerSubmitted(true);
        setPartnerGuess(guess);
      }
    };
    check();
    const interval = setInterval(check, 6000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [submitted, partnerId, partnerSubmitted]);

  const handleSubmitGuess = useCallback(async () => {
    const parsed = parseDollars(ownGuess);
    if (parsed === null || !userId) {
      setError('Enter a number (e.g., 120 or 120.50)');
      return;
    }
    try {
      const { error: writeErr } = await supabase
        .from('lesson_progress')
        .upsert(
          {
            user_id: userId,
            lesson_id: STUB_LESSON_ID,
            couple_id: coupleId || null,
            metadata: {
              fmo_surprise_guess: parsed,
              fmo_surprise_submitted_at: new Date().toISOString(),
            },
          },
          { onConflict: 'user_id,lesson_id' }
        );
      if (writeErr) throw writeErr;
      setSubmitted(true);
      setError(null);
    } catch (e) {
      setError(e.message || 'Failed to save your guess');
    }
  }, [ownGuess, userId, coupleId]);

  const handleSubmitCommitment = useCallback(async () => {
    if (!commitment.trim() || !userId) return;
    try {
      const { error: writeErr } = await supabase
        .from('lesson_progress')
        .upsert(
          {
            user_id: userId,
            lesson_id: STUB_LESSON_ID,
            couple_id: coupleId || null,
            metadata: {
              fmo_surprise_guess: parseDollars(ownGuess),
              fmo_surprise_commitment: commitment.trim(),
              fmo_surprise_actual: parseDollars(actualAmount),
              fmo_surprise_committed_at: new Date().toISOString(),
            },
          },
          { onConflict: 'user_id,lesson_id' }
        );
      if (writeErr) throw writeErr;
    } catch (e) {
      setError(e.message || 'Failed to save commitment');
    }
  }, [commitment, ownGuess, actualAmount, userId, coupleId]);

  const showReveal = submitted && partnerSubmitted;

  return (
    <section
      aria-label="Surprise-and-commit"
      style={{
        backgroundColor: 'var(--pt-elevation-1)',
        borderRadius: 24,
        padding: 24,
        border: '1px solid var(--pt-border-subtle)',
        maxWidth: 640,
      }}
    >
      <h2 style={{ ...getTypeStyle('heading-1'), color: 'var(--pt-text-primary)', margin: 0 }}>
        Surprise &amp; commit
      </h2>
      <p style={{ ...getTypeStyle('body'), color: 'var(--pt-text-muted)', marginTop: 8 }}>
        How much did you spend on {STUB_CATEGORY_LABEL} last month? Each partner guesses
        independently. We&apos;ll reveal the numbers together — and then you decide one
        rule for this month.
      </p>

      {!submitted && (
        <div style={{ marginTop: 16 }}>
          <label
            style={{
              ...getTypeStyle('caption'),
              color: 'var(--pt-text-muted)',
              display: 'block',
              marginBottom: 6,
            }}
          >
            Your guess ($)
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={ownGuess}
            onChange={(e) => setOwnGuess(e.target.value)}
            placeholder="e.g. 240"
            style={{
              padding: '10px 12px',
              borderRadius: 12,
              border: '1px solid var(--pt-border-subtle)',
              backgroundColor: 'var(--pt-elevation-2)',
              color: 'var(--pt-text-primary)',
              width: 200,
              ...getTypeStyle('body'),
            }}
          />
          <div style={{ marginTop: 12 }}>
            <button
              type="button"
              onClick={handleSubmitGuess}
              disabled={!ownGuess}
              style={{
                padding: '10px 20px',
                borderRadius: 12,
                backgroundColor: ownGuess
                  ? 'var(--pt-primary-accent)'
                  : 'var(--pt-border-subtle)',
                color: 'var(--pt-text-inverse)',
                border: 'none',
                cursor: ownGuess ? 'pointer' : 'not-allowed',
                ...getTypeStyle('body'),
              }}
            >
              Submit guess
            </button>
          </div>
        </div>
      )}

      {submitted && !showReveal && (
        <p style={{ ...getTypeStyle('body'), color: 'var(--pt-text-primary)', marginTop: 16 }}>
          Your guess is in. We&rsquo;ll show both numbers when your partner finishes too.
        </p>
      )}

      {showReveal && (
        <div style={{ marginTop: 16 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: 12,
              marginBottom: 16,
            }}
          >
            <RevealCell label="Your guess" value={`$${parseDollars(ownGuess)}`} />
            <RevealCell label="Partner&rsquo;s guess" value={`$${partnerGuess}`} />
          </div>

          <label
            style={{
              ...getTypeStyle('caption'),
              color: 'var(--pt-text-muted)',
              display: 'block',
              marginBottom: 6,
            }}
          >
            Actual amount ($) — pull from last month&rsquo;s statement
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={actualAmount}
            onChange={(e) => setActualAmount(e.target.value)}
            placeholder="e.g. 312.40"
            style={{
              padding: '10px 12px',
              borderRadius: 12,
              border: '1px solid var(--pt-border-subtle)',
              backgroundColor: 'var(--pt-elevation-2)',
              color: 'var(--pt-text-primary)',
              width: 200,
              ...getTypeStyle('body'),
            }}
          />

          <label
            style={{
              ...getTypeStyle('caption'),
              color: 'var(--pt-text-muted)',
              display: 'block',
              marginTop: 16,
              marginBottom: 6,
            }}
          >
            One {STUB_CATEGORY_LABEL} rule for this month — what do you both commit to?
          </label>
          <textarea
            value={commitment}
            onChange={(e) => setCommitment(e.target.value)}
            placeholder="e.g. Two dining-out nights a week, max $80 per night"
            rows={3}
            style={{
              padding: '10px 12px',
              borderRadius: 12,
              border: '1px solid var(--pt-border-subtle)',
              backgroundColor: 'var(--pt-elevation-2)',
              color: 'var(--pt-text-primary)',
              width: '100%',
              ...getTypeStyle('body'),
              resize: 'vertical',
            }}
          />
          <div style={{ marginTop: 12 }}>
            <button
              type="button"
              onClick={handleSubmitCommitment}
              disabled={!commitment.trim()}
              style={{
                padding: '10px 20px',
                borderRadius: 12,
                backgroundColor: commitment.trim()
                  ? 'var(--pt-primary-accent)'
                  : 'var(--pt-border-subtle)',
                color: 'var(--pt-text-inverse)',
                border: 'none',
                cursor: commitment.trim() ? 'pointer' : 'not-allowed',
                ...getTypeStyle('body'),
              }}
            >
              Save our commitment
            </button>
          </div>
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

function RevealCell({ label, value }) {
  return (
    <div
      style={{
        backgroundColor: 'var(--pt-elevation-2)',
        borderRadius: 12,
        padding: 12,
        border: '1px solid var(--pt-border-subtle)',
      }}
    >
      <p style={{ ...getTypeStyle('caption'), color: 'var(--pt-text-muted)', margin: 0 }}>
        {label}
      </p>
      <p
        style={{
          ...getTypeStyle('heading-2'),
          color: 'var(--pt-text-primary)',
          margin: 0,
          marginTop: 4,
        }}
      >
        {value}
      </p>
    </div>
  );
}
