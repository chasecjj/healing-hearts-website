-- =====================================================
-- Rollback for Migration 022: Module 1-2 Redesign
-- =====================================================
-- Removes all v2 lessons (sub-lessons first, then parents) and restores
-- the original module titles. Does NOT re-insert the old lesson content
-- (the seed.sql or a database backup is needed for that).
--
-- Run this ONLY if you need to undo migration 022.
-- =====================================================

BEGIN;

-- Step 1: Delete sub-lessons (children) first to avoid FK violations
DELETE FROM lessons
WHERE parent_lesson_id IS NOT NULL
  AND module_id IN (
    SELECT m.id FROM modules m
    JOIN courses c ON c.id = m.course_id
    WHERE m.module_number IN ('1', '2')
      AND c.slug = 'healing-hearts-journey'
  );

-- Step 2: Delete parent lessons
DELETE FROM lessons
WHERE module_id IN (
  SELECT m.id FROM modules m
  JOIN courses c ON c.id = m.course_id
  WHERE m.module_number IN ('1', '2')
    AND c.slug = 'healing-hearts-journey'
);

-- Step 3: Restore original module titles and descriptions
UPDATE modules
SET title = 'Love''s Foundation',
    description = 'Understanding your unique design — personality blueprint, attachment style, and the SPARK of Safety.'
WHERE module_number = '1'
  AND course_id = (SELECT id FROM courses WHERE slug = 'healing-hearts-journey');

UPDATE modules
SET title = 'Invisible Chains',
    description = 'Recognize toxic patterns hiding in plain sight — gaslighting, manipulation, projection, and emotional immaturity.'
WHERE module_number = '2'
  AND course_id = (SELECT id FROM courses WHERE slug = 'healing-hearts-journey');

-- Verification: should be 0 lessons in modules 1 and 2
DO $$
DECLARE
  remaining integer;
BEGIN
  SELECT count(*) INTO remaining
  FROM lessons l
  JOIN modules m ON m.id = l.module_id
  JOIN courses c ON c.id = m.course_id
  WHERE m.module_number IN ('1', '2')
    AND c.slug = 'healing-hearts-journey';

  IF remaining != 0 THEN
    RAISE EXCEPTION 'Rollback failed: % lessons still remain in modules 1-2', remaining;
  END IF;

  RAISE NOTICE 'Rollback complete: modules 1-2 cleared, titles restored.';
  RAISE NOTICE 'To restore original lessons, re-run the relevant portion of seed.sql.';
END $$;

COMMIT;
