-- Migration 014: Interactive Portal
-- Adds daily_intentions and journal_entries tables for Phase 2.7
-- RLS pattern: own data (auth.uid()) + admin read

-- ═══════════════════════════════════════════════════════════════
-- daily_intentions — one per user per day
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE daily_intentions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  intention_text text NOT NULL,
  mood text CHECK (mood IN (
    'peaceful','hopeful','grateful','heavy','anxious',
    'sad','angry','numb','overwhelmed','tender'
  )),
  intention_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, intention_date)
);

CREATE INDEX idx_intentions_user_date ON daily_intentions(user_id, intention_date DESC);

ALTER TABLE daily_intentions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "intentions_own" ON daily_intentions
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "intentions_admin_read" ON daily_intentions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ═══════════════════════════════════════════════════════════════
-- journal_entries — prompted reflections tied to lessons/modules
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id uuid REFERENCES lessons(id) ON DELETE SET NULL,
  module_id uuid REFERENCES modules(id) ON DELETE SET NULL,
  prompt_text text,
  entry_text text NOT NULL,
  mood text CHECK (mood IN (
    'peaceful','hopeful','grateful','heavy','anxious',
    'sad','angry','numb','overwhelmed','tender'
  )),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_journal_user ON journal_entries(user_id);
CREATE INDEX idx_journal_lesson ON journal_entries(lesson_id);

ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "journal_own" ON journal_entries
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "journal_admin_read" ON journal_entries
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ═══════════════════════════════════════════════════════════════
-- Auto-update trigger for journal_entries.updated_at
-- ═══════════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS moddatetime;

CREATE TRIGGER set_journal_updated_at
  BEFORE UPDATE ON journal_entries
  FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);
