-- Phase 2.8: Video Integration — add meditation fields to modules
ALTER TABLE modules ADD COLUMN IF NOT EXISTS meditation_mux_playback_id text;
ALTER TABLE modules ADD COLUMN IF NOT EXISTS meditation_duration_seconds integer;
