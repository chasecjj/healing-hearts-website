import React, { useState } from 'react';
import { Textarea } from '@scoria/ui';
import { PenLine, Check, Flame } from 'lucide-react';
import { useDailyIntention } from '../hooks/useDailyIntention';
import MoodSelector from './MoodSelector';

/**
 * DailyIntentionWidget — self-contained daily intention + mood check-in.
 * Two states: input mode (set/edit) and display mode (saved intention).
 * Calls useAuth() internally via useDailyIntention hook.
 */

// Curated fallback quotes when no intention is set
const FALLBACK_QUOTES = [
  'Today, I will practice patience with my own healing pace. I am exactly where I need to be.',
  'I choose to be gentle with myself as I grow through this season.',
  'My healing is not a race. Each step forward matters.',
  'I am worthy of the love and peace I am working to create.',
  'Today I will notice one moment of connection and hold it close.',
];

function getFallbackQuote() {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000
  );
  return FALLBACK_QUOTES[dayOfYear % FALLBACK_QUOTES.length];
}

export default function DailyIntentionWidget() {
  const {
    intention,
    loading,
    saving,
    error,
    saveIntention,
    streak,
  } = useDailyIntention();

  const [editing, setEditing] = useState(false);
  const [draftText, setDraftText] = useState('');
  const [draftMood, setDraftMood] = useState(null);

  const hasIntention = intention?.intention_text;
  const showInput = editing || !hasIntention;

  function handleEdit() {
    setDraftText(intention?.intention_text || '');
    setDraftMood(intention?.mood || null);
    setEditing(true);
  }

  async function handleSave() {
    if (!draftText.trim()) return;
    await saveIntention({ intentionText: draftText.trim(), mood: draftMood });
    setEditing(false);
  }

  if (loading) {
    return (
      <div
        className="rounded-2xl p-8 h-full animate-pulse"
        style={{
          backgroundColor: 'var(--pt-elevation-1-hex, #e7e5e4)',
          borderLeft: '4px solid var(--pt-primary-accent-hex, #B96A5F)',
        }}
      >
        <div className="h-6 bg-neutral-200 rounded w-1/3 mb-6" />
        <div className="h-4 bg-neutral-200 rounded w-2/3 mb-3" />
        <div className="h-4 bg-neutral-200 rounded w-1/2" />
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl p-8 h-full"
      style={{
        backgroundColor: 'var(--pt-elevation-1-hex, #e7e5e4)',
        borderLeft: '4px solid var(--pt-primary-accent-hex, #B96A5F)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-drama text-xl flex items-center gap-2 text-foreground">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ color: 'var(--pt-primary-accent-hex, #B96A5F)' }}
            aria-hidden="true"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
          Daily Intention
        </h3>

        {streak > 0 && (
          <span
            className="flex items-center gap-1.5 text-xs font-outfit font-semibold"
            style={{ color: 'var(--pt-primary-accent-hex, #B96A5F)' }}
          >
            <Flame className="w-3.5 h-3.5" />
            {streak} day{streak !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Display mode: show saved intention */}
      {!showInput && (
        <div className="space-y-4">
          <p className="text-foreground/60 leading-relaxed italic font-drama text-base">
            &ldquo;{intention.intention_text}&rdquo;
          </p>
          {intention.mood && (
            <span className="inline-flex items-center rounded-full bg-neutral-200 px-3 py-1 text-xs font-outfit font-semibold text-foreground/80">
              {intention.mood}
            </span>
          )}
          <div className="pt-4 border-t border-neutral-200">
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 text-sm text-foreground/60 hover:text-foreground transition-colors font-outfit"
            >
              <PenLine className="w-4 h-4" />
              Update intention
            </button>
          </div>
        </div>
      )}

      {/* Input mode: set or edit intention */}
      {showInput && (
        <div className="space-y-5">
          {!hasIntention && !editing && (
            <p className="text-foreground/40 leading-relaxed italic font-drama text-sm">
              &ldquo;{getFallbackQuote()}&rdquo;
            </p>
          )}

          <div>
            <label className="block text-xs font-outfit uppercase tracking-widest text-foreground/50 mb-3">
              How are you feeling?
            </label>
            <MoodSelector value={draftMood} onChange={setDraftMood} />
          </div>

          <div>
            <label
              htmlFor="intention-text"
              className="block text-xs font-outfit uppercase tracking-widest text-foreground/50 mb-3"
            >
              Set your intention
            </label>
            <Textarea
              id="intention-text"
              value={draftText}
              onChange={(e) => setDraftText(e.target.value)}
              placeholder="Today, I will..."
              className="min-h-[72px] bg-white"
              maxLength={500}
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 font-sans">{error}</p>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving || !draftText.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-outfit font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              style={{ backgroundColor: 'var(--pt-primary-accent-hex, #B96A5F)' }}
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              {saving ? 'Saving...' : 'Set Intention'}
            </button>

            {editing && (
              <button
                onClick={() => setEditing(false)}
                className="text-sm text-foreground/50 hover:text-foreground/70 font-outfit transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
