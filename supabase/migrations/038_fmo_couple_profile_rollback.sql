-- =====================================================
-- Migration 038 ROLLBACK: FMO Couple Profile Schema
--
-- Authored: 2026-05-12
-- Purpose : Reverses 038_fmo_couple_profile.sql in full.
--
-- Forward migration: 038_fmo_couple_profile.sql
--
-- DROP order: reverse of creation order. CASCADE used to clean up:
--   - RLS policies (auto-dropped with table)
--   - FK references from lesson_progress.couple_id → couples(id)
--     (the FK is dropped when the column is dropped below)
--   - indexes (auto-dropped with table)
--
-- ALTER TABLE DROP COLUMN removes the two columns added to existing tables.
-- The CASCADE on DROP TABLE couples handles any leftover FK from
-- lesson_progress in case rollback ordering is reversed by an operator.
--
-- CHASE-GATED APPLY: do NOT execute against prod until Chase explicit ack.
-- =====================================================


-- =====================================================
-- PART 1: REVERT ALTER TABLE COLUMNS
-- (Done first so the lesson_progress.couple_id FK is gone before DROP TABLE couples;
--  CASCADE on DROP TABLE would handle it too, but explicit-first is safer.)
-- =====================================================

ALTER TABLE user_profiles
  DROP COLUMN IF EXISTS last_activity_at;

ALTER TABLE lesson_progress
  DROP COLUMN IF EXISTS metadata,
  DROP COLUMN IF EXISTS couple_id;


-- =====================================================
-- PART 2: DROP NEW TABLES (reverse dependency order)
--
-- couple_spending_plans, couple_goal_selections, couple_quiz_results all
-- reference couples(id), so they drop first. couples drops last.
-- CASCADE handles any policy/index/FK leftovers.
-- =====================================================

DROP TABLE IF EXISTS couple_spending_plans CASCADE;
DROP TABLE IF EXISTS couple_goal_selections CASCADE;
DROP TABLE IF EXISTS couple_quiz_results CASCADE;
DROP TABLE IF EXISTS couples CASCADE;


-- =====================================================
-- End of migration 038 rollback
-- =====================================================
