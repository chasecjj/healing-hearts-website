-- 008_applications.sql
-- Application form submissions for Healing Hearts program

CREATE TABLE applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,

  -- Contact info
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,

  -- Application questions
  relationship_status TEXT NOT NULL,
  years_together TEXT,
  relationship_rating INTEGER CHECK (relationship_rating >= 1 AND relationship_rating <= 10),
  biggest_challenge TEXT NOT NULL,
  tried_before TEXT,
  partner_aware BOOLEAN,
  partner_willing BOOLEAN,
  ideal_outcome TEXT,
  urgency TEXT,
  investment_readiness TEXT,
  faith_role TEXT,
  how_heard TEXT,
  additional_notes TEXT,

  -- Internal tracking
  status TEXT DEFAULT 'new' NOT NULL,
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  notes TEXT,

  -- Linking
  spark_signup_id UUID REFERENCES spark_signups(id),
  user_id UUID REFERENCES auth.users(id)
);

-- Index for team review queue
CREATE INDEX idx_applications_status ON applications (status, created_at DESC);
CREATE INDEX idx_applications_email ON applications (email);

-- RLS: Only admins can read applications
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read all applications"
  ON applications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- INSERT policy: primary path uses service role (api/application.js),
-- but this policy is a safety net for potential future client-side inserts.
CREATE POLICY "Anyone can insert applications"
  ON applications FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
