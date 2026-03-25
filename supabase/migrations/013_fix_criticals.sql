-- 013_fix_criticals.sql
-- Fix critical issues found in Session 73 code review.

-- 1. Create the missing increment_webinar_registrants RPC function.
--    webinar-register.js calls this on every registration but it never existed.
CREATE OR REPLACE FUNCTION increment_webinar_registrants(webinar_row_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE webinars SET registrant_count = registrant_count + 1 WHERE id = webinar_row_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Change partner_willing from BOOLEAN to TEXT to preserve the actual answer.
--    The form offers Yes / Not yet / Not sure, but BOOLEAN drops "Not sure" (null)
--    and conflates "Not yet" with "No" (false). Store the raw string instead.
ALTER TABLE applications ALTER COLUMN partner_willing TYPE TEXT USING
  CASE
    WHEN partner_willing = true THEN 'Yes'
    WHEN partner_willing = false THEN 'No'
    ELSE NULL
  END;

-- Also fix partner_aware for consistency (form offers Yes/No, but storing as TEXT
-- is safer and more readable in the dashboard).
ALTER TABLE applications ALTER COLUMN partner_aware TYPE TEXT USING
  CASE
    WHEN partner_aware = true THEN 'Yes'
    WHEN partner_aware = false THEN 'No'
    ELSE NULL
  END;
