-- 034_module_workbook_path.sql
-- Restore the workbook_storage_path column on public.modules.
--
-- Migration 001 originally declared this column, but it does not exist in
-- the production schema (drift — likely a later migration dropped or never
-- created it on prod). src/portal/ModuleOverview.jsx already reads
-- currentModule.workbook_storage_path and signs URLs against the
-- 'workbooks' Storage bucket — so the UI is dormant pending this column.
--
-- Also seeds the path for the three Rescue Kit modules so the entire kit
-- (the printable booklet PDF) is downloadable from any module entry.

ALTER TABLE public.modules
  ADD COLUMN IF NOT EXISTS workbook_storage_path text;

-- Rescue Kit course id: 62cf1f40-9d60-4ea5-ae65-b63faf22f13e
-- Three modules: Part I, Part II (the book), Afterword.
-- All three point at the single booklet PDF so the user can grab it
-- from wherever they are in the course.
UPDATE public.modules
SET workbook_storage_path = 'rescue-kit/booklet.pdf'
WHERE course_id = '62cf1f40-9d60-4ea5-ae65-b63faf22f13e';
