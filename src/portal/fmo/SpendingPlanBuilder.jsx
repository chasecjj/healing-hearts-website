/**
 * SpendingPlanBuilder — FMO Module 1 / Section 1 / Step 4 (AP-2 + AP-4).
 *
 * Spec: pr-plan.md §PR 2 SpendingPlanBuilder.jsx + component-list.md C3 + C4.
 * Composes: <InlineBudgetFeedback /> (AP-8 inline callouts).
 *
 * Couples-care:
 *   - Both partners name categories together (same device, facilitated session).
 *   - No category is "owned" by one partner; naming rights are equal.
 *   - "Breathing Room" framed as "your guilt-free zone," NOT "spending cap."
 *
 * Math (client-side; stored on submit):
 *   breathingRoomCents = takeHomeCents - fixedBillsCents - savingsCents
 *
 * Persistence:
 *   - On mount: getSpendingPlan(coupleId) pre-populates if exists.
 *   - On submit: saveSpendingPlan with categories + breathingRoomCents + triggered_snippets.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { getSpendingPlan, saveSpendingPlan } from '../../lib/fmo';
import { getTypeStyle, getNumericStyle } from '../design/typography';
import InlineBudgetFeedback from './InlineBudgetFeedback';
import { computeRatios } from './utils';

const DEFAULT_CATEGORIES = [
  { name: 'Housing', amount_cents: 0, isFixed: true, ratioKey: 'housing' },
  { name: 'Utilities', amount_cents: 0, isFixed: true, ratioKey: null },
  { name: 'Groceries', amount_cents: 0, isFixed: false, ratioKey: 'food' },
  { name: 'Transportation', amount_cents: 0, isFixed: true, ratioKey: 'transportation' },
  { name: 'Dining Out / Eating Together', amount_cents: 0, isFixed: false, ratioKey: 'food' },
  { name: 'Subscriptions', amount_cents: 0, isFixed: false, ratioKey: 'subscriptions' },
  { name: 'Debt Payments', amount_cents: 0, isFixed: true, ratioKey: 'debt' },
  { name: 'Fun / Play / Adventures', amount_cents: 0, isFixed: false, ratioKey: 'discretionary' },
  { name: 'Giving / Gifts', amount_cents: 0, isFixed: false, ratioKey: null },
  { name: 'Everything Else', amount_cents: 0, isFixed: false, ratioKey: null },
];

function toCents(dollarStr) {
  const n = parseFloat(dollarStr);
  if (Number.isNaN(n) || n < 0) return 0;
  return Math.round(n * 100);
}

function toDollarStr(cents) {
  if (!cents || cents === 0) return '';
  return (cents / 100).toFixed(2);
}

// userId is accepted in the prop signature for parity with sibling components
// (W4 wires couple/user context uniformly); SpendingPlanBuilder writes via
// couple_id only (joint authorship per AP-2). Renamed underscore-prefix so the
// lint rule `^[A-Z_]/u` ignores the unused arg.
export default function SpendingPlanBuilder({ coupleId, userId: _userId, onComplete }) {
  const [takeHome, setTakeHome] = useState('');
  const [fixedBills, setFixedBills] = useState('');
  const [savingsTarget, setSavingsTarget] = useState('');
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [triggeredSnippets, setTriggeredSnippets] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  // Initial loading derived from coupleId presence — avoids set-state-in-effect.
  const [loading, setLoading] = useState(() => Boolean(coupleId));

  // Hydrate from existing plan if any.
  useEffect(() => {
    let cancelled = false;
    if (!coupleId) return;
    getSpendingPlan(coupleId)
      .then((plan) => {
        if (cancelled || !plan) {
          if (!cancelled) setLoading(false);
          return;
        }
        if (Array.isArray(plan.categories) && plan.categories.length > 0) {
          // Merge stored amounts back onto defaults so metadata (isFixed, ratioKey) persists.
          const merged = DEFAULT_CATEGORIES.map((def) => {
            const stored = plan.categories.find((c) => c.name === def.name);
            return stored ? { ...def, amount_cents: stored.amount_cents || 0 } : def;
          });
          // Append any custom (non-default) categories.
          for (const c of plan.categories) {
            if (!DEFAULT_CATEGORIES.find((d) => d.name === c.name)) {
              merged.push({ ...c, isFixed: false, ratioKey: null });
            }
          }
          setCategories(merged);
        }
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
  }, [coupleId]);

  const takeHomeCents = toCents(takeHome);
  const fixedBillsCents = toCents(fixedBills);
  const savingsCents = toCents(savingsTarget);
  const breathingRoomCents = takeHomeCents - fixedBillsCents - savingsCents;

  const ratios = computeRatios(takeHomeCents, categories);

  const handleCategoryChange = useCallback((idx, field, value) => {
    setCategories((prev) => {
      const next = [...prev];
      if (field === 'name') {
        next[idx] = { ...next[idx], name: value };
      } else if (field === 'amount') {
        next[idx] = { ...next[idx], amount_cents: toCents(value) };
      }
      return next;
    });
  }, []);

  const handleFire = useCallback((snippetId) => {
    setTriggeredSnippets((prev) => (prev.includes(snippetId) ? prev : [...prev, snippetId]));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!coupleId) return;
    try {
      // Persist categories without the metadata (isFixed / ratioKey) — only learner-visible fields.
      const persistable = categories
        .filter((c) => c.name && c.name.trim())
        .map((c) => ({ name: c.name, amount_cents: c.amount_cents || 0 }));
      await saveSpendingPlan(coupleId, persistable, breathingRoomCents, triggeredSnippets);
      setSubmitted(true);
      if (typeof onComplete === 'function') onComplete();
    } catch (e) {
      setError(e.message || 'Failed to save Spending Plan');
    }
  }, [coupleId, categories, breathingRoomCents, triggeredSnippets, onComplete]);

  if (loading) {
    return (
      <p style={{ ...getTypeStyle('body'), color: 'var(--pt-text-muted)' }}>
        Loading your Spending Plan…
      </p>
    );
  }

  return (
    <section
      aria-label="Spending Plan builder"
      style={{
        backgroundColor: 'var(--pt-elevation-1)',
        borderRadius: 24,
        padding: 24,
        border: '1px solid var(--pt-border-subtle)',
      }}
    >
      <h2 style={{ ...getTypeStyle('heading-1'), color: 'var(--pt-text-primary)', margin: 0 }}>
        Your Spending Plan
      </h2>
      <p style={{ ...getTypeStyle('body'), color: 'var(--pt-text-muted)', marginTop: 8 }}>
        Build this together. Every category is yours to name.
      </p>

      {/* Breathing-room inputs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 12,
          marginTop: 16,
        }}
      >
        <MoneyInput label="Monthly take-home" value={takeHome} onChange={setTakeHome} />
        <MoneyInput label="Fixed bills" value={fixedBills} onChange={setFixedBills} />
        <MoneyInput label="Savings target" value={savingsTarget} onChange={setSavingsTarget} />
      </div>

      {/* Categories */}
      <h3 style={{ ...getTypeStyle('heading-2'), color: 'var(--pt-text-primary)', marginTop: 24, marginBottom: 8 }}>
        Name your categories
      </h3>
      <p style={{ ...getTypeStyle('caption'), color: 'var(--pt-text-muted)', marginTop: 0 }}>
        Defaults are a starting point — rename any category so it reflects your household.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
        {categories.map((cat, idx) => (
          <div
            key={idx}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 140px',
              gap: 8,
              alignItems: 'center',
            }}
          >
            <input
              type="text"
              value={cat.name}
              onChange={(e) => handleCategoryChange(idx, 'name', e.target.value)}
              aria-label={`Category ${idx + 1} name`}
              style={{
                padding: 8,
                borderRadius: 8,
                border: '1px solid var(--pt-border-subtle)',
                backgroundColor: 'var(--pt-elevation-2)',
                ...getTypeStyle('body'),
              }}
            />
            <input
              type="number"
              min="0"
              step="0.01"
              value={toDollarStr(cat.amount_cents)}
              onChange={(e) => handleCategoryChange(idx, 'amount', e.target.value)}
              aria-label={`Category ${idx + 1} monthly amount`}
              placeholder="$"
              style={{
                padding: 8,
                borderRadius: 8,
                border: '1px solid var(--pt-border-subtle)',
                backgroundColor: 'var(--pt-elevation-2)',
                ...getTypeStyle('body'),
              }}
            />
          </div>
        ))}
      </div>

      {/* AP-8 inline feedback */}
      <InlineBudgetFeedback ratios={ratios} onFire={handleFire} />

      {/* Breathing Room display */}
      <div
        style={{
          marginTop: 24,
          padding: 16,
          borderRadius: 16,
          backgroundColor: 'var(--pt-elevation-2)',
          border: '1px solid var(--pt-border-subtle)',
        }}
      >
        <p style={{ ...getTypeStyle('caption'), color: 'var(--pt-text-muted)', margin: 0 }}>
          Your Breathing Room
        </p>
        <p
          style={{
            ...getNumericStyle('statLarge'),
            color:
              breathingRoomCents >= 0
                ? 'var(--pt-text-primary)'
                : 'var(--pt-warning)',
            margin: '4px 0',
          }}
        >
          ${(breathingRoomCents / 100).toFixed(2)} / month
        </p>
        <p style={{ ...getTypeStyle('body'), color: 'var(--pt-text-primary)', margin: 0 }}>
          This is your guilt-free zone — you set up the math together.
        </p>
      </div>

      {/* Submit */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!coupleId || submitted}
        style={{
          marginTop: 16,
          padding: '10px 20px',
          borderRadius: 12,
          backgroundColor:
            !coupleId || submitted ? 'var(--pt-border-subtle)' : 'var(--pt-primary-accent)',
          color: 'var(--pt-text-inverse)',
          border: 'none',
          cursor: !coupleId || submitted ? 'not-allowed' : 'pointer',
          ...getTypeStyle('body'),
        }}
      >
        {submitted ? 'Saved' : 'Save Spending Plan'}
      </button>

      {error && (
        <p role="alert" style={{ ...getTypeStyle('caption'), color: 'var(--pt-danger)', marginTop: 12 }}>
          {error}
        </p>
      )}
    </section>
  );
}

function MoneyInput({ label, value, onChange }) {
  return (
    <label style={{ display: 'block' }}>
      <span style={{ ...getTypeStyle('caption'), color: 'var(--pt-text-muted)', display: 'block', marginBottom: 4 }}>
        {label}
      </span>
      <input
        type="number"
        min="0"
        step="0.01"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="$"
        style={{
          width: '100%',
          padding: 8,
          borderRadius: 8,
          border: '1px solid var(--pt-border-subtle)',
          backgroundColor: 'var(--pt-elevation-2)',
          ...getTypeStyle('body'),
        }}
      />
    </label>
  );
}
