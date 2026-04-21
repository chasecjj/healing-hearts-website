-- =====================================================
-- Migration 026: Retroactive UTM tracking columns
--   for spark_signups (documentation + idempotency)
-- =====================================================
-- BACKGROUND
-- ----------
-- The /api/spark-signup handler has written source, utm_source, utm_medium,
-- and utm_campaign to spark_signups since initial deployment. Those four
-- columns were added to prod via a Supabase Dashboard migration named
-- "add_utm_tracking_to_spark_signups" (version 20260330181529) on
-- 2026-03-30, but that migration was never committed to this repo.
-- Migration 023 (2026-04-15) added utm_content, which IS in the repo.
--
-- Result: migrations 007-022 in the local filesystem show spark_signups
-- with no UTM columns, creating a false impression of schema drift.
-- This file closes the documentation gap.
--
-- LIVE SCHEMA VERIFIED 2026-04-20
-- --------------------------------
-- SELECT column_name FROM information_schema.columns
--   WHERE table_schema = 'public' AND table_name = 'spark_signups';
-- Confirmed present: source, utm_source, utm_medium, utm_campaign, utm_content
-- All nullable TEXT. No data loss -- columns exist, all 144 rows intact.
--
-- DATA COUNTS AS OF 2026-04-20
-- ------------------------------
-- total_signups: 144  earliest: 2026-03-24  latest: 2026-04-20
-- has_source: 2  has_utm_source: 2  has_utm_medium: 2
-- has_utm_campaign: 2  has_utm_content: 1
--
-- SCOPE
-- -----
-- Additive, nullable, IF NOT EXISTS everywhere -- fully idempotent.
-- applications and webinar_registrations do NOT have UTM columns and
-- their handlers do not write UTM fields (verified 2026-04-20).
-- Only spark_signups is affected.
-- =====================================================

BEGIN;

ALTER TABLE spark_signups
  ADD COLUMN IF NOT EXISTS source       TEXT,
  ADD COLUMN IF NOT EXISTS utm_source   TEXT,
  ADD COLUMN IF NOT EXISTS utm_medium   TEXT,
  ADD COLUMN IF NOT EXISTS utm_campaign TEXT;

-- NOTE: utm_content was added by migration 023_spark_signups_utm_content.sql
-- (version 20260415135219). It is intentionally omitted here to avoid
-- conflict. If 023 has not run, uncomment the line below:
-- ADD COLUMN IF NOT EXISTS utm_content TEXT;

COMMIT;
