-- 025_increment_webinar_registrants.sql
-- Ensure increment_webinar_registrants RPC exists and has correct grants.
--
-- The function body was first added in 013_fix_criticals.sql but never had
-- explicit GRANT EXECUTE, so only the owner (postgres) could call it.
-- webinar-register.js calls this via the anon/authenticated Supabase client,
-- so both roles need EXECUTE.
--
-- Using CREATE OR REPLACE so this is idempotent if replayed.
-- DO NOT APPLY to production while expo booth is live (2026-04-18).

CREATE OR REPLACE FUNCTION public.increment_webinar_registrants(webinar_row_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE webinars
  SET registrant_count = registrant_count + 1
  WHERE id = webinar_row_id;
END;
$$;

-- Grant execute to both roles used by the Supabase JS client.
GRANT EXECUTE ON FUNCTION public.increment_webinar_registrants(UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.increment_webinar_registrants(UUID) TO authenticated;
