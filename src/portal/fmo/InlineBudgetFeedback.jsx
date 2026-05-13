/**
 * InlineBudgetFeedback — FMO Module 1 / Section 1 / Step 4 inline callout (AP-8).
 *
 * Spec: pr-plan.md §PR 2 InlineBudgetFeedback.jsx + component-list.md C5.
 * Content: track-a-output/inline-lesson-snippets.md (8 snippets, AP-9 compliant).
 *
 * Pattern (AP-8):
 *   - Pure render based on `ratios` prop; no state, no Supabase call.
 *   - 0 or 1 callout per render (highest-priority threshold wins if multiple fire).
 *   - Progress-forward language; never "you overspent."
 *
 * @param {{ ratios: Object<string, number> }} props
 *   ratios is { housing: 0.32, food: 0.10, ... } — values are 0..1 (NOT percentages).
 *   onFire callback is invoked with the firing snippetId when a callout renders,
 *   so the parent can record `triggered_snippets` on save (Component 11 input).
 */

import React, { useEffect, useMemo } from 'react';
import { getTypeStyle } from '../design/typography';
import { pickFiringSnippet } from './utils';
import snippetsConfig from './config/snippets.json';

function formatRatio(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) return '0%';
  return `${Math.round(value * 100)}%`;
}

export default function InlineBudgetFeedback({ ratios, onFire }) {
  const firing = useMemo(() => pickFiringSnippet(ratios), [ratios]);

  // Surface fire event so parent can store triggered_snippets on save.
  useEffect(() => {
    if (firing && typeof onFire === 'function') {
      onFire(firing.snippetId);
    }
  }, [firing, onFire]);

  if (!firing) return null;
  const snippet = snippetsConfig.snippets[firing.snippetId];
  if (!snippet) return null;

  const ratioPct = formatRatio(ratios[firing.ratioKey]);
  const interpolate = (s) => s.replaceAll('{ratio}', ratioPct);

  return (
    <aside
      role="note"
      aria-label={`Inline lesson: ${firing.category}`}
      style={{
        backgroundColor: 'var(--pt-elevation-2)',
        borderRadius: 16,
        padding: 16,
        border: '1px solid var(--pt-border-subtle)',
        marginTop: 12,
      }}
    >
      <h4
        style={{
          ...getTypeStyle('heading-2'),
          color: 'var(--pt-text-primary)',
          margin: 0,
          marginBottom: 8,
        }}
      >
        {interpolate(snippet.headline)}
      </h4>
      <p style={{ ...getTypeStyle('body'), color: 'var(--pt-text-primary)', margin: 0 }}>
        {interpolate(snippet.body)}
      </p>
      <p
        style={{
          ...getTypeStyle('body'),
          color: 'var(--pt-text-primary)',
          marginTop: 12,
          marginBottom: 0,
          fontWeight: 600,
        }}
      >
        Next step: {snippet.action}
      </p>
    </aside>
  );
}
