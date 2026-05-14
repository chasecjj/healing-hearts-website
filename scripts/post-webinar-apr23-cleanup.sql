-- Post-webinar cleanup: Apr 23 2026 — Spark Challenge Live Q&A with Trisha
-- Generated 2026-04-25. Run via Supabase MCP (local tooling only — no CLI access at generation time).
-- Webinar ID: cf709b00-a5c8-4313-a668-0211a5775a29

-- ============================================================
-- STEP 1: Flip webinar status to completed
-- Unblocks the follow-up drip (cron only fires for 'completed'/'evergreen').
-- Templates 1 (afterDays=0) and 2 (afterDays=1) should have already fired
-- if status was correct; template 3 (afterDays=3) fires tonight ~5 PM MT.
-- ============================================================
UPDATE public.webinars
SET status = 'completed'
WHERE id = 'cf709b00-a5c8-4313-a668-0211a5775a29';

-- Verify the update landed:
SELECT id, title, status, scheduled_at, replay_url
FROM public.webinars
WHERE id = 'cf709b00-a5c8-4313-a668-0211a5775a29';

-- ============================================================
-- STEP 2: Report follow-up drip state for this webinar
-- Expect most rows at followup_day = 2 (template 2 fired ~Apr 24).
-- followup_day = 0 or 1 with followup_completed = false = drip was BLOCKED.
-- ============================================================
SELECT followup_day, followup_completed, COUNT(*) AS n
FROM public.webinar_registrations
WHERE webinar_id = 'cf709b00-a5c8-4313-a668-0211a5775a29'
GROUP BY followup_day, followup_completed
ORDER BY followup_day;

-- ============================================================
-- STEP 3: ORPHAN CLEANUP — REVIEW BEFORE RUNNING
-- 35 rows in webinar_registrations reference deleted webinar IDs:
--   c7724cc2-502f-48e1-b828-58c239061a45  (31 rows, registered Apr 17-18)
--   93a564a5-4c73-4d8a-91ad-8a017ea1442e  (4 rows, registered Mar 25-26)
-- These have been stranded for months. Chase decides: delete or migrate.
--
-- OPTION A — DELETE (recommended; contacts are stranded, drip never fired):
--   DELETE FROM public.webinar_registrations
--   WHERE webinar_id NOT IN (SELECT id FROM public.webinars);
--
-- OPTION B — MIGRATE (attach to Apr 23 webinar so they receive template 3+):
--   UPDATE public.webinar_registrations
--   SET webinar_id = 'cf709b00-a5c8-4313-a668-0211a5775a29',
--       followup_day = 0,
--       followup_completed = false
--   WHERE webinar_id NOT IN (SELECT id FROM public.webinars);
--
-- Verify orphan count before acting:
SELECT webinar_id, COUNT(*) AS orphan_count
FROM public.webinar_registrations
WHERE webinar_id NOT IN (SELECT id FROM public.webinars)
GROUP BY webinar_id;
-- ============================================================
