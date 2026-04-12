-- =====================================================
-- Migration 021: Lock Module 7 behind enrollment
-- =====================================================
-- Module 7 was previously exposed to all authenticated users as the
-- "free preview" module via `is_preview=true` on both the module row
-- and every lesson row. Migration 002 set this flag originally; this
-- migration reverses it now that the free lead magnet is shifting to
-- the 7-Day Spark Challenge at /spark-challenge.
--
-- After this runs, the `lessons_read` RLS policy will only grant
-- Module 7 access to (a) users with an active enrollment in the
-- healing-hearts-journey course, or (b) admins. No policy changes
-- are needed — the RLS already supports enrollment-based access.
--
-- Scope: Module 7 only. Module 1-6 and 8 were already `is_preview=false`.
-- =====================================================

BEGIN;

-- 1. Flip the module-level preview flag
UPDATE modules
SET is_preview = false
WHERE module_number = '7'
  AND course_id = (SELECT id FROM courses WHERE slug = 'healing-hearts-journey');

-- 2. Flip every lesson under Module 7 (includes the 10 sub-lessons
--    inserted by the Session 96 retrofit + 4 original 7.4 children +
--    the 4 top-level parents = 18 total rows).
UPDATE lessons
SET is_preview = false
WHERE module_id = (
  SELECT m.id FROM modules m
  JOIN courses c ON c.id = m.course_id
  WHERE m.module_number = '7'
    AND c.slug = 'healing-hearts-journey'
);

-- 3. Sanity check — should return zero rows still marked preview for Module 7.
--    If any row comes back, the retrofit or a later migration reintroduced a
--    preview flag somewhere unexpected.
DO $$
DECLARE
  remaining integer;
BEGIN
  SELECT count(*) INTO remaining
  FROM lessons l
  JOIN modules m ON m.id = l.module_id
  JOIN courses c ON c.id = m.course_id
  WHERE m.module_number = '7'
    AND c.slug = 'healing-hearts-journey'
    AND (l.is_preview = true OR m.is_preview = true);

  IF remaining > 0 THEN
    RAISE EXCEPTION 'Migration 021 failed: % Module 7 rows still marked is_preview=true', remaining;
  END IF;
END $$;

COMMIT;
