import React from 'react';
import { MOOD_OPTIONS } from '../lib/constants';

/**
 * MoodSelector — grid of mood pill buttons.
 * Matches Supabase CHECK constraint values exactly.
 * No emojis — text labels only (grief-informed design).
 */
export default function MoodSelector({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Select your mood">
      {MOOD_OPTIONS.map((mood) => {
        const isSelected = value === mood.value;
        return (
          <button
            key={mood.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(isSelected ? null : mood.value)}
            className={`
              px-4 py-2 rounded-full text-sm font-outfit font-medium
              transition-all duration-200 border
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2
              ${
                isSelected
                  ? 'bg-primary/10 border-primary text-primary shadow-sm'
                  : 'bg-neutral-50 border-neutral-200 text-foreground/60 hover:border-primary/30 hover:text-foreground/80'
              }
            `}
          >
            {mood.label}
          </button>
        );
      })}
    </div>
  );
}
