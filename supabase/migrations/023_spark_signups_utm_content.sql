-- =====================================================
-- Migration 023: Add utm_content to spark_signups
-- =====================================================
-- The /api/spark-signup route has accepted utm_source, utm_medium, and
-- utm_campaign since inception but never utm_content. The Be Healthy
-- Utah expo (Apr 17-18, 2026) has two printed banner QR codes — table
-- banner and retractable banner — and post-event attribution requires
-- distinguishing which banner sourced each signup.
--
-- This migration adds a nullable utm_content column so the banner
-- source can be tracked via the `?src=table|retractable` URL param
-- mapped to utm_content by the CaptureForm. Existing rows are left
-- null (pre-expo signups had no banner distinction).
--
-- Scope: schema only. Additive, nullable, zero-risk.
-- =====================================================

BEGIN;

ALTER TABLE spark_signups
  ADD COLUMN IF NOT EXISTS utm_content text;

COMMIT;
