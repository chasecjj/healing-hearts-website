-- =====================================================
-- Migration 029 ROLLBACK: revert CRM primitive
--
-- Runs the compensating DDL for 029_crm_primitive.sql.
-- WARNING: destructive — drops columns and views.
--
-- Invoke only if a post-apply defect requires full revert.
-- Per crm-primitive-v2.1 §4.5 (M3 patch — ANVIL R1).
-- =====================================================

BEGIN;

DROP VIEW IF EXISTS crm_board_rollup;
DROP VIEW IF EXISTS crm_webinar_hot_leads;
DROP VIEW IF EXISTS crm_contact_360;
DROP VIEW IF EXISTS crm_overdue;
DROP VIEW IF EXISTS crm_lead_pipeline;

DROP FUNCTION IF EXISTS append_application_note(uuid, text);

DROP INDEX IF EXISTS idx_applications_board_thread_ref;
DROP INDEX IF EXISTS idx_applications_email;
DROP INDEX IF EXISTS idx_spark_signups_email;
DROP INDEX IF EXISTS idx_webinar_registrations_email;
DROP INDEX IF EXISTS idx_rescue_kit_drip_email;

ALTER TABLE applications DROP COLUMN IF EXISTS board_thread_ref;
ALTER TABLE applications DROP COLUMN IF EXISTS assigned_to;
ALTER TABLE applications DROP COLUMN IF EXISTS next_action_due;
ALTER TABLE applications DROP COLUMN IF EXISTS next_action;

ALTER TABLE applications ALTER COLUMN status TYPE TEXT USING status::TEXT;
ALTER TABLE applications ALTER COLUMN status SET DEFAULT 'new';

DROP TYPE IF EXISTS application_status;

DROP POLICY IF EXISTS "applications_admin_select" ON applications;
DROP POLICY IF EXISTS "applications_admin_update" ON applications;

COMMIT;
