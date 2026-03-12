-- =====================================================
-- Migration 004: Add parent_lesson_id for sub-lessons
-- Enables nested lesson structure (parent -> children)
-- NULL = top-level lesson, set = child of that parent
-- Run this in Supabase SQL Editor.
-- =====================================================

ALTER TABLE lessons
ADD COLUMN parent_lesson_id uuid REFERENCES lessons(id) ON DELETE CASCADE;

CREATE INDEX idx_lessons_parent ON lessons(parent_lesson_id);
