-- 009_extend_spark_drip.sql
-- Extend spark_signups to support 14-day drip (7-day challenge + 7-day bridge)
ALTER TABLE spark_signups DROP CONSTRAINT IF EXISTS spark_signups_current_day_check;
ALTER TABLE spark_signups ADD CONSTRAINT spark_signups_current_day_check CHECK (current_day >= 0 AND current_day <= 14);
