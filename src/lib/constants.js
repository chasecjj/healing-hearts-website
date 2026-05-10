/**
 * Shared constants for the Healing Hearts portal.
 * Mood values must match the CHECK constraint in Supabase
 * (daily_intentions + journal_entries tables, migration 014).
 */

// Order: lead with "Tender" so users in active grief don't scan past
// aspirational moods (Peaceful/Hopeful/Grateful) to find their true state.
// Trauma-informed register per spec §A-11 — no implicit "good moods first"
// hierarchy. Values still match Supabase mig 014 CHECK constraint.
export const MOOD_OPTIONS = [
  { value: 'tender', label: 'Tender' },
  { value: 'peaceful', label: 'Peaceful' },
  { value: 'hopeful', label: 'Hopeful' },
  { value: 'grateful', label: 'Grateful' },
  { value: 'heavy', label: 'Heavy' },
  { value: 'sad', label: 'Sad' },
  { value: 'numb', label: 'Numb' },
  { value: 'anxious', label: 'Anxious' },
  { value: 'overwhelmed', label: 'Overwhelmed' },
  { value: 'angry', label: 'Angry' },
];

export const MOOD_VALUES = MOOD_OPTIONS.map((m) => m.value);
