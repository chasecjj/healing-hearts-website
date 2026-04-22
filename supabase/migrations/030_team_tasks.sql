-- 030: Team Tasks — task management for admin panel
-- Ported from PHEDRIS dashboard (Vikunja → Supabase)

BEGIN;

CREATE TABLE IF NOT EXISTS team_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'todo'
    CHECK (status IN ('todo', 'in_progress', 'in_review', 'done')),
  priority TEXT NOT NULL DEFAULT 'normal'
    CHECK (priority IN ('urgent', 'high', 'normal', 'low')),
  project_name TEXT DEFAULT 'General',
  project_color TEXT DEFAULT '#58a6ff',
  assignee_id UUID REFERENCES auth.users(id),
  assignee_name TEXT,
  assignee_email TEXT,
  due_date DATE,
  labels JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE team_tasks ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "team_tasks_admin_all" ON team_tasks
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Updated-at trigger
CREATE OR REPLACE FUNCTION update_team_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER team_tasks_updated_at
  BEFORE UPDATE ON team_tasks
  FOR EACH ROW EXECUTE FUNCTION update_team_tasks_updated_at();

COMMENT ON TABLE team_tasks IS 'Team task management — ported from PHEDRIS. Admin-only CRUD via RLS.';

COMMIT;
