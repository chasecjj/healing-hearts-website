-- Migration 034: Add ON DELETE CASCADE to webinar_registrations → webinars FK
--
-- Background: 35 webinar_registrations rows were left stranded when two webinar
-- rows were hard-deleted (webinar_ids c7724cc2 and 93a564a5). Without CASCADE,
-- deleting a webinar silently orphans its registrations, breaking drip logic
-- and producing phantom rows with no parent. This migration makes deletions safe.

ALTER TABLE public.webinar_registrations
  DROP CONSTRAINT IF EXISTS webinar_registrations_webinar_id_fkey;

ALTER TABLE public.webinar_registrations
  ADD CONSTRAINT webinar_registrations_webinar_id_fkey
  FOREIGN KEY (webinar_id)
  REFERENCES public.webinars(id)
  ON DELETE CASCADE;
