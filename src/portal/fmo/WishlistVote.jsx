/**
 * WishlistVote — FMO Module 1 / Section 1 / Step 5 (AP-7).
 *
 * Spec: pr-plan.md §PR 2 WishlistVote.jsx + component-list.md C6 + C7.
 * Content: track-c-output/wishlist-vote-goals-list.md (final 6 goals).
 *
 * Three states (per component-list.md):
 *   State 1 — Voting form (max 3 selections; checkboxes disable after 3).
 *   State 2 — Waiting (own submitted, partner has not) — BLIND lock screen.
 *   State 3 — Joint reveal (both submitted) — overlap + divergence cards.
 *   Zero-overlap variant of State 3 — conversation card, NOT alarm.
 *
 * Couples-care invariants (CRITICAL):
 *   - partnerGoals === null → BLIND waiting state; never "no goals selected yet".
 *   - Partner choices never shown before reveal.
 *   - Zero-overlap branch renders conversation card, never conflict/alarm UI.
 *   - "Different paths" framing on divergence; never "mismatch."
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getCoupleForUser,
  getGoalSelections,
  saveGoalSelections,
} from '../../lib/fmo';
import { getTypeStyle } from '../design/typography';
import goalLabelsConfig from './config/goalLabels.json';

const MAX_SELECTIONS = goalLabelsConfig._meta?.['max-selections'] || 3;
const POLL_INTERVAL_MS = 6000;
const GOALS = goalLabelsConfig.goals;
const GOAL_BY_ID = Object.fromEntries(GOALS.map((g) => [g.id, g]));

export default function WishlistVote({ coupleId, userId, onComplete }) {
  const [ownSelections, setOwnSelections] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [partnerGoals, setPartnerGoals] = useState(null); // null = BLIND (couples-care contract)
  const [overlapGoals, setOverlapGoals] = useState(null);
  const [partnerSlot, setPartnerSlot] = useState(null);
  // Initial loading derived from required props — avoids set-state-in-effect.
  const [loading, setLoading] = useState(() => Boolean(coupleId && userId));
  const [error, setError] = useState(null);

  // Resolve partner slot.
  useEffect(() => {
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
  }, [coupleId, userId]);

  // Hydrate from storage.
  useEffect(() => {
    let cancelled = false;
    if (!coupleId || !userId) return;
    getGoalSelections(coupleId, userId)
      .then((res) => {
        if (cancelled) return;
        if (res?.ownGoals && Array.isArray(res.ownGoals)) {
          setOwnSelections(res.ownGoals);
          if (res.ownSubmittedAt) setSubmitted(true);
        }
        // Couples-care: partnerGoals stays null until partner has submitted.
        setPartnerGoals(res?.partnerGoals ?? null);
        setOverlapGoals(res?.overlapGoals ?? null);
        setLoading(false);
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e.message);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [coupleId, userId]);

  // Poll for partner submission once own submitted.
  useEffect(() => {
    if (!submitted || partnerGoals !== null || !coupleId || !userId) return;
    let cancelled = false;
    const check = async () => {
      try {
        const res = await getGoalSelections(coupleId, userId);
        if (cancelled) return;
        if (res?.partnerGoals) {
          setPartnerGoals(res.partnerGoals);
          setOverlapGoals(res.overlapGoals || []);
        }
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
  }, [submitted, partnerGoals, coupleId, userId]);

  // Fire onComplete when reveal reached (single transition).
  useEffect(() => {
    if (submitted && partnerGoals !== null && typeof onComplete === 'function') {
      onComplete();
    }
  }, [submitted, partnerGoals, onComplete]);

  const toggleGoal = useCallback(
    (goalId) => {
      setOwnSelections((prev) => {
        if (prev.includes(goalId)) return prev.filter((g) => g !== goalId);
        if (prev.length >= MAX_SELECTIONS) return prev; // Cap at 3
        return [...prev, goalId];
      });
    },
    []
  );

  const handleSubmit = useCallback(async () => {
    if (ownSelections.length !== MAX_SELECTIONS || !coupleId || !partnerSlot) return;
    try {
      const res = await saveGoalSelections(coupleId, partnerSlot, ownSelections);
      setSubmitted(true);
      // If partner already submitted, the upsert returns both arrays — surface immediately.
      const partnerArr = partnerSlot === 'a' ? res.partner_b_goals : res.partner_a_goals;
      const partnerSubmittedAt =
        partnerSlot === 'a' ? res.partner_b_submitted_at : res.partner_a_submitted_at;
      if (Array.isArray(partnerArr) && partnerSubmittedAt) {
        setPartnerGoals(partnerArr);
        setOverlapGoals(res.overlap_goals || []);
      }
    } catch (e) {
      setError(e.message || 'Failed to save your goals');
    }
  }, [ownSelections, coupleId, partnerSlot]);

  const computedOverlap = useMemo(() => {
    // Prefer server-stored overlap when both arrays present; client-compute as fallback.
    if (Array.isArray(overlapGoals)) return overlapGoals;
    if (Array.isArray(partnerGoals) && Array.isArray(ownSelections)) {
      const partnerSet = new Set(partnerGoals);
      return ownSelections.filter((g) => partnerSet.has(g));
    }
    return [];
  }, [overlapGoals, partnerGoals, ownSelections]);

  const partnerOnly = useMemo(() => {
    if (!Array.isArray(partnerGoals)) return [];
    const ownSet = new Set(ownSelections);
    return partnerGoals.filter((g) => !ownSet.has(g));
  }, [partnerGoals, ownSelections]);

  if (loading) {
    return (
      <p style={{ ...getTypeStyle('body'), color: 'var(--pt-text-muted)' }}>
        Loading your Shared Goals…
      </p>
    );
  }

  // ─── State 3: Joint Reveal (both submitted) ──────────────────
  if (submitted && partnerGoals !== null) {
    const zeroOverlap = computedOverlap.length === 0;
    return (
      <section
        aria-label="Shared goals reveal"
        style={{
          backgroundColor: 'var(--pt-elevation-1)',
          borderRadius: 24,
          padding: 24,
          border: '1px solid var(--pt-border-subtle)',
        }}
      >
        <h2 style={{ ...getTypeStyle('heading-1'), color: 'var(--pt-text-primary)', margin: 0 }}>
          Your Shared Goals
        </h2>

        {!zeroOverlap && (
          <>
            <p style={{ ...getTypeStyle('body'), color: 'var(--pt-text-primary)', marginTop: 12, fontWeight: 600 }}>
              You both chose these — your Spending Plan will fund these first.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
              {computedOverlap.map((gid) => (
                <GoalBadge key={gid} goal={GOAL_BY_ID[gid]} variant="overlap" />
              ))}
            </div>
          </>
        )}

        {partnerOnly.length > 0 && !zeroOverlap && (
          <>
            <p style={{ ...getTypeStyle('body'), color: 'var(--pt-text-primary)', marginTop: 16 }}>
              Your partner also chose:
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
              {partnerOnly.map((gid) => (
                <GoalBadge key={gid} goal={GOAL_BY_ID[gid]} variant="divergence" />
              ))}
            </div>
            <p style={{ ...getTypeStyle('body'), color: 'var(--pt-text-primary)', marginTop: 12, fontStyle: 'italic' }}>
              Different priorities — here's a 5-minute conversation to find where they meet.
            </p>
          </>
        )}

        {zeroOverlap && (
          <div
            role="region"
            aria-label="Conversation prompt"
            style={{
              marginTop: 16,
              padding: 16,
              borderRadius: 16,
              backgroundColor: 'var(--pt-elevation-2)',
              border: '1px solid var(--pt-border-subtle)',
            }}
          >
            <h3 style={{ ...getTypeStyle('heading-2'), color: 'var(--pt-text-primary)', margin: 0 }}>
              You chose different paths.
            </h3>
            <p style={{ ...getTypeStyle('body'), color: 'var(--pt-text-primary)', marginTop: 8 }}>
              Here's a 5-minute conversation to find where they meet. Take turns: each partner names what drew them to one of their picks. Listen for the shared value underneath the different label.
            </p>
            <p style={{ ...getTypeStyle('caption'), color: 'var(--pt-text-muted)', marginTop: 8 }}>
              Your selections: {ownSelections.map((g) => GOAL_BY_ID[g]?.label).filter(Boolean).join(', ')}.
              Your partner's: {partnerGoals.map((g) => GOAL_BY_ID[g]?.label).filter(Boolean).join(', ')}.
            </p>
          </div>
        )}
      </section>
    );
  }

  // ─── State 2: Waiting (own submitted, partner has not) — BLIND ────
  if (submitted && partnerGoals === null) {
    return (
      <section
        aria-label="Waiting for partner"
        style={{
          backgroundColor: 'var(--pt-elevation-1)',
          borderRadius: 24,
          padding: 24,
          border: '1px solid var(--pt-border-subtle)',
          textAlign: 'center',
        }}
      >
        <h2 style={{ ...getTypeStyle('heading-1'), color: 'var(--pt-text-primary)', margin: 0 }}>
          Your selections are in.
        </h2>
        <p
          aria-hidden="true"
          style={{ fontSize: 32, marginTop: 16, color: 'var(--pt-text-muted)' }}
        >
          🔒
        </p>
        <p style={{ ...getTypeStyle('body'), color: 'var(--pt-text-primary)', marginTop: 8 }}>
          Waiting for your partner. We'll surface both of your picks together when they finish.
        </p>
      </section>
    );
  }

  // ─── State 1: Voting form ────────────────────────────────────
  const remaining = MAX_SELECTIONS - ownSelections.length;
  return (
    <section
      aria-label="Wishlist vote"
      style={{
        backgroundColor: 'var(--pt-elevation-1)',
        borderRadius: 24,
        padding: 24,
        border: '1px solid var(--pt-border-subtle)',
      }}
    >
      <h2 style={{ ...getTypeStyle('heading-1'), color: 'var(--pt-text-primary)', margin: 0 }}>
        Your Shared Goals
      </h2>
      <p style={{ ...getTypeStyle('body'), color: 'var(--pt-text-muted)', marginTop: 8 }}>
        Each partner completes this independently before the reveal. Pick your top {MAX_SELECTIONS} — the ones that matter most to you, right now. Your partner is doing the same thing, separately.
      </p>
      <p style={{ ...getTypeStyle('caption'), color: 'var(--pt-text-muted)', marginTop: 8 }}>
        {remaining > 0
          ? `Pick ${remaining} more — checkboxes will disable after ${MAX_SELECTIONS}.`
          : `${MAX_SELECTIONS} selected. Uncheck one to swap.`}
      </p>
      <fieldset style={{ border: 'none', padding: 0, marginTop: 16 }}>
        {GOALS.map((g) => {
          const checked = ownSelections.includes(g.id);
          const disabled = !checked && ownSelections.length >= MAX_SELECTIONS;
          return (
            <label
              key={g.id}
              style={{
                display: 'block',
                padding: 12,
                marginBottom: 8,
                borderRadius: 12,
                border: '1px solid var(--pt-border-subtle)',
                backgroundColor: checked ? 'var(--pt-elevation-2)' : 'transparent',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.5 : 1,
              }}
            >
              <input
                type="checkbox"
                checked={checked}
                disabled={disabled}
                onChange={() => toggleGoal(g.id)}
                style={{ marginRight: 12 }}
              />
              <span style={{ ...getTypeStyle('body'), color: 'var(--pt-text-primary)', fontWeight: 600 }}>
                {g.label}
              </span>
              <p
                style={{
                  ...getTypeStyle('caption'),
                  color: 'var(--pt-text-muted)',
                  margin: '4px 0 0 24px',
                }}
              >
                {g.description}
              </p>
            </label>
          );
        })}
      </fieldset>
      <button
        type="button"
        onClick={handleSubmit}
        disabled={ownSelections.length !== MAX_SELECTIONS}
        style={{
          marginTop: 16,
          padding: '10px 20px',
          borderRadius: 12,
          backgroundColor:
            ownSelections.length === MAX_SELECTIONS
              ? 'var(--pt-primary-accent)'
              : 'var(--pt-border-subtle)',
          color: 'var(--pt-text-inverse)',
          border: 'none',
          cursor: ownSelections.length === MAX_SELECTIONS ? 'pointer' : 'not-allowed',
          ...getTypeStyle('body'),
        }}
      >
        Submit my top {MAX_SELECTIONS}
      </button>
      {error && (
        <p role="alert" style={{ ...getTypeStyle('caption'), color: 'var(--pt-danger)', marginTop: 12 }}>
          {error}
        </p>
      )}
    </section>
  );
}

function GoalBadge({ goal, variant }) {
  if (!goal) return null;
  const isOverlap = variant === 'overlap';
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '6px 12px',
        borderRadius: 999,
        backgroundColor: isOverlap ? 'var(--pt-primary-accent)' : 'var(--pt-elevation-2)',
        color: isOverlap ? 'var(--pt-text-inverse)' : 'var(--pt-text-primary)',
        border: isOverlap ? 'none' : '1px solid var(--pt-border-subtle)',
        ...getTypeStyle('caption'),
        fontWeight: 600,
      }}
    >
      {goal.label}
    </span>
  );
}
