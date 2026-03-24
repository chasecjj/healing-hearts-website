-- 007: Spark Challenge signups table for email drip tracking
CREATE TABLE spark_signups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  signed_up_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  current_day INTEGER DEFAULT 0 NOT NULL CHECK (current_day >= 0 AND current_day <= 7),
  completed BOOLEAN DEFAULT false NOT NULL,
  unsubscribed BOOLEAN DEFAULT false NOT NULL,
  last_email_sent_at TIMESTAMPTZ
);

-- Partial index for the daily cron query (only active, incomplete signups)
CREATE INDEX idx_spark_signups_active
  ON spark_signups (current_day)
  WHERE completed = false AND unsubscribed = false;

-- RLS: service-role only, no public access
ALTER TABLE spark_signups ENABLE ROW LEVEL SECURITY;
