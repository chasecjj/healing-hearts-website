-- =====================================================
-- Notes & Highlights — portal-product-v1
-- Migration: 014_notes_highlights.sql
-- Source: scout-05 (2026-04-22) §Supabase schema + §RLS policies + §Migration plan
-- =====================================================

-- User-organized notebook folders for the Bookmarks rail
CREATE TABLE notebook_folders (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name         text NOT NULL,
  color        text,                       -- color token: 'rose','sage','sky','amber'
  sort_order   integer NOT NULL DEFAULT 0,
  created_at   timestamptz DEFAULT now()
);

-- Text highlights anchored to a block position within a lesson
CREATE TABLE highlights (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id     uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  block_index   integer NOT NULL,          -- position in content_json.blocks[]
  block_id      text,                      -- future: stable block id in content_json
  anchor_text   text NOT NULL,             -- the literal highlighted string (drift guard)
  anchor_start  integer NOT NULL,          -- char offset start within block text
  anchor_end    integer NOT NULL,          -- char offset end within block text
  color         text NOT NULL DEFAULT 'yellow'
                  CHECK (color IN ('yellow','rose','sage','sky')),
  folder_id     uuid REFERENCES notebook_folders(id) ON DELETE SET NULL,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

-- Notes anchored to a highlight, a block, or the lesson
CREATE TABLE notes (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id     uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  highlight_id  uuid REFERENCES highlights(id) ON DELETE CASCADE,
  block_index   integer,                   -- null -> lesson-level note
  block_id      text,
  body_text     text NOT NULL,
  note_type     text NOT NULL
                  CHECK (note_type IN ('highlight','block','lesson')),
  folder_id     uuid REFERENCES notebook_folders(id) ON DELETE SET NULL,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now(),

  -- Referential integrity by note_type
  CONSTRAINT note_highlight_ref CHECK (
    note_type <> 'highlight' OR highlight_id IS NOT NULL
  ),
  CONSTRAINT note_block_ref CHECK (
    note_type <> 'block' OR (block_index IS NOT NULL AND highlight_id IS NULL)
  ),
  CONSTRAINT note_lesson_ref CHECK (
    note_type <> 'lesson' OR (block_index IS NULL AND highlight_id IS NULL)
  )
);

-- ─── Indexes ──────────────────────────────────────────────────

CREATE INDEX idx_highlights_user         ON highlights(user_id);
CREATE INDEX idx_highlights_lesson       ON highlights(lesson_id);
CREATE INDEX idx_highlights_user_lesson  ON highlights(user_id, lesson_id);
CREATE INDEX idx_highlights_folder       ON highlights(folder_id) WHERE folder_id IS NOT NULL;

CREATE INDEX idx_notes_user              ON notes(user_id);
CREATE INDEX idx_notes_lesson            ON notes(lesson_id);
CREATE INDEX idx_notes_user_lesson       ON notes(user_id, lesson_id);
CREATE INDEX idx_notes_highlight         ON notes(highlight_id) WHERE highlight_id IS NOT NULL;
CREATE INDEX idx_notes_folder            ON notes(folder_id) WHERE folder_id IS NOT NULL;

CREATE INDEX idx_notebook_folders_user   ON notebook_folders(user_id);

-- Partial unique indexes enforcing one-note-per-anchor rules
CREATE UNIQUE INDEX uq_note_highlight
  ON notes(user_id, highlight_id)
  WHERE highlight_id IS NOT NULL;

CREATE UNIQUE INDEX uq_note_block
  ON notes(user_id, lesson_id, block_index)
  WHERE highlight_id IS NULL AND block_index IS NOT NULL;

CREATE UNIQUE INDEX uq_note_lesson
  ON notes(user_id, lesson_id)
  WHERE highlight_id IS NULL AND block_index IS NULL;

-- ─── RLS ─────────────────────────────────────────────────────

ALTER TABLE notebook_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE highlights       ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes            ENABLE ROW LEVEL SECURITY;

-- notebook_folders
CREATE POLICY "notebook_folders_own"
  ON notebook_folders FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "notebook_folders_admin_read"
  ON notebook_folders FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- highlights
CREATE POLICY "highlights_own_read"
  ON highlights FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "highlights_own_write"
  ON highlights FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "highlights_own_update"
  ON highlights FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "highlights_own_delete"
  ON highlights FOR DELETE
  USING (user_id = auth.uid());

CREATE POLICY "highlights_admin_read"
  ON highlights FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- notes
CREATE POLICY "notes_own_read"
  ON notes FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "notes_own_write"
  ON notes FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "notes_own_update"
  ON notes FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "notes_own_delete"
  ON notes FOR DELETE
  USING (user_id = auth.uid());

CREATE POLICY "notes_admin_read"
  ON notes FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ─── Realtime ────────────────────────────────────────────────
-- REPLICA IDENTITY FULL ensures UPDATE/DELETE Realtime events carry
-- the full old row (required for useHighlights/useNotes reconciliation).
ALTER TABLE highlights REPLICA IDENTITY FULL;
ALTER TABLE notes REPLICA IDENTITY FULL;
