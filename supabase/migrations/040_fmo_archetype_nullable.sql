-- =====================================================
-- Migration 040: FMO Archetype Columns — Allow NULL
--
-- Authored : 2026-05-17 (Track E 6.6c remediation)
-- Amended  : 2026-05-17 per Sec-1 audit (secretary-to-hh-ceo-002).
--            Original draft ran UPDATE-to-NULL BEFORE DROP NOT NULL within
--            the same transaction. PostgreSQL enforces NOT NULL per-statement
--            at execution time and is NOT deferrable for NOT NULL — the
--            UPDATE is rejected by the still-active constraint before the
--            queued DROP NOT NULL can run. Live prod escaped this only
--            because the Short couple submitted real archetypes Thursday
--            (zero '' rows → UPDATE is a no-op → constraint check never
--            fires). Staging / admin-solo-preview / migration replay on a
--            fresh restore would all fail at the first UPDATE line.
--            Reordered: DROP NOT NULL FIRST, then UPDATE-to-NULL, then CHECK.
-- Purpose  : Replace the empty-string '' sentinel pattern for "not yet
--            submitted" quiz archetypes with clean NULL. Migration 038
--            created partner_a/b_archetype as text NOT NULL; the
--            insertion workaround in lib/fmo.js inserts '' for the
--            non-submitting partner. This migration drops NOT NULL so
--            NULL = "not yet submitted" (canonical) replaces '' = "not
--            yet submitted" (workaround).
--
-- Application layer change: lib/fmo.js saveQuizResult uses `?? null` (not
-- `|| ''`) for the non-submitting partner's archetype. Companion ships in
-- the same Vercel deploy that precedes this migration apply.
--
-- Ship sequencing: lib/fmo.js deploys to Vercel FIRST (~30s), then this
-- migration applies via Supabase MCP apply_migration. Either ordering
-- alone breaks the surface — must ship together.
--
-- Rollback: 040_fmo_archetype_nullable_rollback.sql (separate file).
-- =====================================================

-- 1. Drop NOT NULL FIRST (combined into single ALTER TABLE for cleanliness;
--    PG supports comma-separated ALTER actions in one statement).
ALTER TABLE couple_quiz_results
  ALTER COLUMN partner_a_archetype DROP NOT NULL,
  ALTER COLUMN partner_b_archetype DROP NOT NULL;

-- 2. Convert '' sentinel rows to NULL (now legal post-DROP-NOT-NULL).
UPDATE couple_quiz_results
  SET partner_a_archetype = NULL
  WHERE partner_a_archetype = '';

UPDATE couple_quiz_results
  SET partner_b_archetype = NULL
  WHERE partner_b_archetype = '';

-- 3. Add CHECK constraint disallowing '' so the sentinel can't re-enter
--    (belt-and-suspenders for the canonical NULL semantics).
ALTER TABLE couple_quiz_results
  ADD CONSTRAINT couple_quiz_results_archetype_nonempty
  CHECK (
    (partner_a_archetype IS NULL OR partner_a_archetype != '')
    AND
    (partner_b_archetype IS NULL OR partner_b_archetype != '')
  );

-- End of migration 040
