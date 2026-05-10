/**
 * JournalPrompt — §3.23, §12.1 A-12
 *
 * Micro-commitment journal prompt on the Dashboard consent cluster host surface.
 * Single-line optional input: "What's one thing you'll notice today?"
 *
 * Behavior:
 *   - Typography-driven within editorial hero; no card chrome (3.7-rev)
 *   - Optional: skip without nag. No re-prompt if skipped this session.
 *   - No streak counter. Not peer-visible. Not required.
 *   - Submission persists as journal entry { type: 'daily-intention' } day-scoped.
 *
 * Therapeutic basis: IFS / motivational-interviewing session-opening intention.
 * Copy register: HH-CEO + Trisha-voice, rest-permission compatible (A-11).
 *
 * TODO Wave-6D: wire `handleSubmit` to useJournal() hook when backend journal
 * store lands. Entry schema: { type: 'daily-intention', body: string, createdAt: ISO }.
 * The entry should surface in the "Your Journey" drawer tab (decision 2.3 Sanctuary).
 */

import React, { useState } from 'react';
import { portalTokens } from '../design/tokens';
import { useReducedMotion } from '../design/motion';

export default function JournalPrompt() {
  const prefersReduced = useReducedMotion();
  const [value, setValue] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [skipped, setSkipped] = useState(false);

  // Hide after submit or skip — no nag on re-render
  if (submitted || skipped) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!value.trim()) return;
    // TODO Wave-6D: replace with useJournal() hook call
    // journalStore.add({ type: 'daily-intention', body: value.trim(), createdAt: new Date().toISOString() });
    console.log('[JournalPrompt] daily-intention entry (Wave-6D persist pending):', value.trim());
    setSubmitted(true);
  };

  return (
    <form
      onSubmit={handleSubmit}
      aria-label="Daily intention prompt"
      style={{ marginTop: 8, maxWidth: 480 }}
    >
      {/* Label: serif italic, restorative register — no card chrome (3.7-rev) */}
      <label
        htmlFor="journal-prompt-input"
        style={{
          display: 'block',
          fontFamily: '"Playfair Display", Georgia, serif',
          fontStyle: 'italic',
          fontWeight: 400,
          fontSize: 16,
          lineHeight: 1.5,
          color: `var(--pt-text-muted-hex, ${portalTokens['text-muted'].hex})`,
          marginBottom: 10,
        }}
      >
        What&rsquo;s one thing you&rsquo;ll notice today?
      </label>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Underline-only input — typography-driven, no box border */}
        <input
          id="journal-prompt-input"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Something small is enough…"
          autoComplete="off"
          maxLength={280}
          style={{
            flex: 1,
            padding: '10px 0',
            border: 'none',
            borderBottom: `1px solid var(--pt-border-subtle-hex, ${portalTokens['border-subtle'].hex})`,
            background: 'transparent',
            fontFamily: '"Playfair Display", Georgia, serif',
            fontWeight: 400,
            fontSize: 16,
            color: `var(--pt-text-primary-hex, ${portalTokens['text-primary'].hex})`,
            outline: 'none',
            // No card chrome per 3.7-rev — typography-driven only
          }}
        />

        {/* Submit appears only when user has typed something */}
        {value.trim() && (
          <button
            type="submit"
            style={{
              padding: '8px 16px',
              borderRadius: 999,
              border: 'none',
              background: `var(--pt-primary-accent-hex, ${portalTokens['primary-accent'].hex})`,
              color: '#fafaf9',
              fontFamily: '"Outfit", sans-serif',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              transition: prefersReduced ? 'none' : 'opacity 150ms ease',
              flexShrink: 0,
            }}
          >
            Note it
          </button>
        )}

        {/* Skip — always available, no guilt language */}
        <button
          type="button"
          onClick={() => setSkipped(true)}
          aria-label="Skip this prompt for today"
          style={{
            padding: '8px 0',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            fontFamily: '"Outfit", sans-serif',
            fontSize: 12,
            fontWeight: 400,
            color: `var(--pt-text-muted-hex, ${portalTokens['text-muted'].hex})`,
            opacity: 0.6,
            flexShrink: 0,
          }}
        >
          skip
        </button>
      </div>
    </form>
  );
}
