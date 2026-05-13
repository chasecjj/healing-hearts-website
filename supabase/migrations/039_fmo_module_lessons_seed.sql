-- Migration 039: FMO Module + Lessons Seed + Shorts Enrollments
-- Authored: 2026-05-13
-- Applied to prod: 2026-05-13 02:02 UTC via Supabase MCP apply_migration
-- Purpose: seed the Financial Unity System course with 1 module + 5 lessons
--          so FMO Module 1 has real lesson UUIDs that lesson_progress
--          rows can FK-reference. Also enrolls Dave + Breanne Short.

-- Module
INSERT INTO modules (id, course_id, module_number, title, description, sort_order, is_preview, created_at)
VALUES (
  'aaaaaaaa-0000-4001-8000-000000000001',
  '1093e865-a392-4a02-a572-ca31a2305068',
  'M1',
  'Module 1 — Spending Personality + Plan',
  'Discover your spending archetype, build your spending plan, align your wishlist with your partner.',
  1,
  false,
  now()
);

-- 5 lessons (sort_order matches FMOModule1 STEPS sequence)
INSERT INTO lessons (id, module_id, title, sort_order, content_json, has_workbook, is_preview, created_at) VALUES
  ('aaaaaaaa-0000-4001-8000-000000000010', 'aaaaaaaa-0000-4001-8000-000000000001', 'Solve Before Explain — Opener',     1, '{}'::jsonb, false, false, now()),
  ('aaaaaaaa-0000-4001-8000-000000000020', 'aaaaaaaa-0000-4001-8000-000000000001', 'Spending Personality Quiz',          2, '{}'::jsonb, false, false, now()),
  ('aaaaaaaa-0000-4001-8000-000000000030', 'aaaaaaaa-0000-4001-8000-000000000001', 'Spending Plan Builder',              3, '{}'::jsonb, false, false, now()),
  ('aaaaaaaa-0000-4001-8000-000000000040', 'aaaaaaaa-0000-4001-8000-000000000001', 'Wishlist Vote',                      4, '{}'::jsonb, false, false, now()),
  ('aaaaaaaa-0000-4001-8000-000000000050', 'aaaaaaaa-0000-4001-8000-000000000001', 'Money Date Kit',                     5, '{}'::jsonb, false, false, now());

-- Shorts enrollments
INSERT INTO enrollments (user_id, course_id, status, enrolled_at) VALUES
  ('dfe708e4-9cab-462e-9efc-c5d9839c7468', '1093e865-a392-4a02-a572-ca31a2305068', 'active', now()),
  ('315e11aa-e41b-4a21-8815-269ae16308f9', '1093e865-a392-4a02-a572-ca31a2305068', 'active', now());
