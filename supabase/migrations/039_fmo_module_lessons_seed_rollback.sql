-- =====================================================
-- Migration 039 ROLLBACK: FMO Module + Lessons Seed + Shorts Enrollments
--
-- Authored: 2026-05-13
-- Purpose : Reverses 039_fmo_module_lessons_seed.sql in full.
--
-- Forward migration: 039_fmo_module_lessons_seed.sql
--
-- DELETE order (reverse of insert order):
--   1. enrollments     — leaf rows, no FKs pointing in
--   2. lessons         — child of modules
--   3. modules         — parent
--
-- Targeted by id / FK columns so unrelated rows are NOT affected.
--
-- CHASE-GATED APPLY: do NOT execute against prod until Chase explicit ack.
-- =====================================================

-- 1. Shorts enrollments
DELETE FROM enrollments
  WHERE user_id IN ('dfe708e4-9cab-462e-9efc-c5d9839c7468','315e11aa-e41b-4a21-8815-269ae16308f9')
    AND course_id = '1093e865-a392-4a02-a572-ca31a2305068';

-- 2. Lessons (FK module_id) — narrower than a global delete; matches the 5 seeded lessons by parent.
DELETE FROM lessons WHERE module_id = 'aaaaaaaa-0000-4001-8000-000000000001';

-- 3. Module
DELETE FROM modules WHERE id = 'aaaaaaaa-0000-4001-8000-000000000001';

-- =====================================================
-- End of migration 039 rollback
-- =====================================================
