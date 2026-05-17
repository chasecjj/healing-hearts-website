-- Rollback for migration 040
-- Restores pre-040 schema state:
--   1. Drop the CHECK constraint disallowing ''
--   2. Convert NULL rows back to '' (pre-040 sentinel pattern)
--   3. Re-impose NOT NULL on both archetype columns
--
-- Order is intentional and safe: each step's precondition is satisfied by
-- the prior step (CHECK drop precedes UPDATE-to-'' to avoid '' violating
-- the still-active CHECK; UPDATE precedes SET NOT NULL so no rows are NULL
-- when the constraint re-imposes).
--
-- Warning: if any '' sentinel rows were originally converted to NULL by
-- non-040 paths, this rollback will restore them as '' — pre-040 workaround
-- state. The lib/fmo.js companion (`?? null` semantics) must be reverted to
-- `|| ''` semantics in lockstep, else saveQuizResult will attempt to write
-- NULL into newly-NOT-NULL columns and fail.

ALTER TABLE couple_quiz_results
  DROP CONSTRAINT IF EXISTS couple_quiz_results_archetype_nonempty;

UPDATE couple_quiz_results
  SET partner_a_archetype = ''
  WHERE partner_a_archetype IS NULL;

UPDATE couple_quiz_results
  SET partner_b_archetype = ''
  WHERE partner_b_archetype IS NULL;

ALTER TABLE couple_quiz_results
  ALTER COLUMN partner_a_archetype SET NOT NULL,
  ALTER COLUMN partner_b_archetype SET NOT NULL;
