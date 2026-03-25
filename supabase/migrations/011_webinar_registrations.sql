-- 011_webinar_registrations.sql
-- Tracks who registered for which webinar, reminder/follow-up progress.

CREATE TABLE webinar_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,

  -- Who
  name TEXT NOT NULL,
  email TEXT NOT NULL,

  -- Which webinar
  webinar_id UUID NOT NULL REFERENCES webinars(id) ON DELETE CASCADE,

  -- Reminder tracking
  reminder_day_before_sent BOOLEAN DEFAULT false NOT NULL,
  reminder_day_of_sent BOOLEAN DEFAULT false NOT NULL,

  -- Post-webinar follow-up (0 = none sent, 1-5 = follow-ups completed)
  followup_day INTEGER DEFAULT 0 NOT NULL CHECK (followup_day >= 0 AND followup_day <= 5),
  followup_completed BOOLEAN DEFAULT false NOT NULL,
  last_email_sent_at TIMESTAMPTZ,
  unsubscribed BOOLEAN DEFAULT false NOT NULL,

  -- Linking to other tables
  spark_signup_id UUID REFERENCES spark_signups(id),
  application_id UUID REFERENCES applications(id),

  -- Prevent duplicate registrations for same webinar
  UNIQUE (email, webinar_id)
);

-- Index for cron queries
CREATE INDEX idx_webinar_reg_active
  ON webinar_registrations (webinar_id, followup_completed)
  WHERE followup_completed = false;

CREATE INDEX idx_webinar_reg_email ON webinar_registrations (email);

-- RLS
ALTER TABLE webinar_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read all registrations"
  ON webinar_registrations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "Anyone can insert registrations"
  ON webinar_registrations FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
