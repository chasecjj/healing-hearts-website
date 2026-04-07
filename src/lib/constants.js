/**
 * Shared constants for the Healing Hearts portal.
 * Mood values must match the CHECK constraint in Supabase
 * (daily_intentions + journal_entries tables, migration 014).
 */

export const MOOD_OPTIONS = [
  { value: 'peaceful', label: 'Peaceful' },
  { value: 'hopeful', label: 'Hopeful' },
  { value: 'grateful', label: 'Grateful' },
  { value: 'heavy', label: 'Heavy' },
  { value: 'anxious', label: 'Anxious' },
  { value: 'sad', label: 'Sad' },
  { value: 'angry', label: 'Angry' },
  { value: 'numb', label: 'Numb' },
  { value: 'overwhelmed', label: 'Overwhelmed' },
  { value: 'tender', label: 'Tender' },
];

export const MOOD_VALUES = MOOD_OPTIONS.map((m) => m.value);
