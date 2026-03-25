-- 010_webinars.sql
-- Webinar scheduling and configuration.
-- Chase (or eventually Makayla) manages these rows from Supabase dashboard.

CREATE TABLE webinars (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,

  -- Display info
  title TEXT NOT NULL DEFAULT 'Healing Hearts Live Workshop',
  description TEXT,

  -- Scheduling (all times in UTC — convert from MT before inserting)
  starts_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 90 NOT NULL,

  -- Links
  riverside_audience_url TEXT,
  replay_url TEXT,

  -- Status: scheduled → live → completed → evergreen
  status TEXT DEFAULT 'scheduled' NOT NULL
    CHECK (status IN ('scheduled', 'live', 'completed', 'evergreen')),

  -- Metadata
  registrant_count INTEGER DEFAULT 0 NOT NULL
);

-- RLS
ALTER TABLE webinars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read webinars"
  ON webinars FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage webinars"
  ON webinars FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );
