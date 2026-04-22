-- =====================================================
-- Migration 029: CRM primitive
--
-- Implements crm-primitive-v2.1 spec (ANVIL R1 PASS 8.7/10,
-- MED patches M1/M2/M3 applied in-line).
--
-- Adds:
--   1. application_status ENUM type
--   2. applications.status → ENUM + next_action/next_action_due/assigned_to/board_thread_ref columns
--   3. RLS admin-only SELECT/UPDATE policies on applications (user_profiles.id = auth.uid() verified)
--   4. Views: crm_lead_pipeline, crm_overdue, crm_contact_360, crm_webinar_hot_leads, crm_board_rollup
--   5. Email indexes on 4 tables joined by crm_contact_360
--   6. append_application_note(uuid, text) atomic note-append function
--
-- Pre-flight verified 2026-04-21:
--   - user_profiles.id column exists (NOT user_id) — RLS predicates correct as written
--   - applications.status values = {'new': 5} — ENUM cast safe
--   - No prior migration 029
-- =====================================================

BEGIN;

-- ============================================================
-- 1. Status enum type
-- ============================================================

DO $$ BEGIN
  CREATE TYPE application_status AS ENUM (
    'new',           -- submitted, not yet reviewed
    'reviewing',     -- admin opened, triaging
    'contacted',     -- admin has replied, awaiting their response
    'responded',     -- they replied, ball in our court
    'converted',     -- enrolled / bought rescue kit / customer
    'archived'       -- declined, ghosted >60d, test, or spam
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- 2. Alter applications table
-- ============================================================
-- NOTE: the existing DEFAULT 'new'::text cannot auto-cast to the new
-- ENUM type, so the default must be dropped before ALTER COLUMN TYPE
-- and re-set after. (Caught on first apply 2026-04-21.)

ALTER TABLE applications ALTER COLUMN status DROP DEFAULT;

ALTER TABLE applications
  ALTER COLUMN status TYPE application_status
  USING status::application_status;

ALTER TABLE applications
  ALTER COLUMN status SET DEFAULT 'new'::application_status;

ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS next_action TEXT,
  ADD COLUMN IF NOT EXISTS next_action_due DATE,
  ADD COLUMN IF NOT EXISTS assigned_to TEXT DEFAULT 'chase';

COMMENT ON COLUMN applications.next_action IS 'Freetext description of what needs to happen next, e.g., "Reply re: 3-month timeline"';
COMMENT ON COLUMN applications.next_action_due IS 'Date by which next_action should be completed. Overdue if < CURRENT_DATE and status in triage lanes.';
COMMENT ON COLUMN applications.assigned_to IS 'Single-owner assignment. v1 = text (chase/trisha/makayla). v2 = FK to user_profiles.';

-- ============================================================
-- 3. RLS policies — admin-only SELECT/UPDATE
-- ============================================================

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "applications_admin_select" ON applications;
DROP POLICY IF EXISTS "applications_admin_update" ON applications;

CREATE POLICY "applications_admin_select"
  ON applications
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "applications_admin_update"
  ON applications
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.role = 'admin'
    )
  );

-- ============================================================
-- 4. Views — security_invoker = on (honor caller's RLS)
-- ============================================================

-- 4a. crm_lead_pipeline
DROP VIEW IF EXISTS crm_lead_pipeline;
CREATE VIEW crm_lead_pipeline
  WITH (security_invoker = on)
AS
SELECT
  a.id,
  a.created_at,
  a.name,
  a.email,
  a.phone,
  a.status,
  a.urgency,
  a.relationship_rating,
  a.biggest_challenge,
  a.how_heard,
  a.assigned_to,
  a.next_action,
  a.next_action_due,
  (a.next_action_due IS NOT NULL
     AND a.next_action_due < CURRENT_DATE
     AND a.status IN ('reviewing', 'contacted', 'responded')) AS is_overdue,
  a.reviewed_at,
  a.reviewed_by,
  a.notes,
  a.spark_signup_id,
  EXISTS (SELECT 1 FROM webinar_registrations wr WHERE wr.email = a.email) AS is_webinar_registered,
  EXISTS (SELECT 1 FROM rescue_kit_drip rkd WHERE rkd.email = a.email) AS is_rescue_kit_buyer
FROM applications a;

-- 4b. crm_overdue
DROP VIEW IF EXISTS crm_overdue;
CREATE VIEW crm_overdue
  WITH (security_invoker = on)
AS
SELECT *
FROM crm_lead_pipeline
WHERE is_overdue = true
ORDER BY next_action_due ASC;

-- 4c. crm_contact_360
DROP VIEW IF EXISTS crm_contact_360;
CREATE VIEW crm_contact_360
  WITH (security_invoker = on)
AS
WITH all_emails AS (
  SELECT email FROM applications
  UNION
  SELECT email FROM spark_signups
  UNION
  SELECT email FROM webinar_registrations
  UNION
  SELECT email FROM rescue_kit_drip
)
SELECT
  e.email,
  (SELECT json_build_object(
     'id', a.id, 'name', a.name, 'status', a.status,
     'urgency', a.urgency, 'created_at', a.created_at,
     'next_action', a.next_action, 'next_action_due', a.next_action_due
   ) FROM applications a WHERE a.email = e.email LIMIT 1) AS application,
  (SELECT json_build_object(
     'id', s.id, 'current_day', s.current_day,
     'last_email_sent_at', s.last_email_sent_at,
     'unsubscribed', s.unsubscribed, 'source', s.source
   ) FROM spark_signups s WHERE s.email = e.email LIMIT 1) AS spark_signup,
  (SELECT json_build_object(
     'id', w.id,
     'reminder_day_before_sent', w.reminder_day_before_sent,
     'reminder_day_of_sent', w.reminder_day_of_sent,
     'unsubscribed', w.unsubscribed
   ) FROM webinar_registrations w WHERE w.email = e.email LIMIT 1) AS webinar_registration,
  (SELECT json_build_object(
     'id', r.id, 'current_day', r.current_day,
     'unsubscribed', r.unsubscribed
   ) FROM rescue_kit_drip r WHERE r.email = e.email LIMIT 1) AS rescue_kit_drip,
  (SELECT COUNT(*) FROM applications a WHERE a.email = e.email) > 0 AS has_application,
  (SELECT COUNT(*) FROM spark_signups s WHERE s.email = e.email) > 0 AS has_spark_signup,
  (SELECT COUNT(*) FROM webinar_registrations w WHERE w.email = e.email) > 0 AS has_webinar_registration,
  (SELECT COUNT(*) FROM rescue_kit_drip r WHERE r.email = e.email) > 0 AS has_rescue_kit
FROM all_emails e;

-- 4d. crm_webinar_hot_leads
DROP VIEW IF EXISTS crm_webinar_hot_leads;
CREATE VIEW crm_webinar_hot_leads
  WITH (security_invoker = on)
AS
SELECT
  a.id AS application_id,
  a.email,
  a.name,
  a.status,
  a.urgency,
  a.next_action,
  a.next_action_due,
  w.id AS registration_id,
  w.created_at AS registered_at,
  (SELECT s.id FROM spark_signups s WHERE s.email = a.email LIMIT 1) AS spark_signup_id
FROM applications a
JOIN webinar_registrations w ON w.email = a.email
WHERE a.status NOT IN ('converted', 'archived');

-- ============================================================
-- 5. board_thread_ref — loose Board integration annotation (v2 §4.1)
-- ============================================================

ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS board_thread_ref TEXT DEFAULT NULL;

COMMENT ON COLUMN applications.board_thread_ref IS
  'Optional reference to a Board of Directors task-thread ID (format: TTH-YYYYMMDD-slug-NNN). '
  'Nullable TEXT, not a FK — Board thread register is markdown-based, not a Postgres table. '
  'v3 decision: promote to FK if Board v2 ships a live threads table.';

CREATE INDEX IF NOT EXISTS idx_applications_board_thread_ref
  ON applications (board_thread_ref)
  WHERE board_thread_ref IS NOT NULL;

-- ============================================================
-- 6. Email indexes for crm_contact_360 scale (v2 §4.2)
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_applications_email
  ON applications (email);

CREATE INDEX IF NOT EXISTS idx_spark_signups_email
  ON spark_signups (email);

CREATE INDEX IF NOT EXISTS idx_webinar_registrations_email
  ON webinar_registrations (email);

CREATE INDEX IF NOT EXISTS idx_rescue_kit_drip_email
  ON rescue_kit_drip (email);

-- ============================================================
-- 7. append_application_note — atomic note append function (v2 §4.3)
-- ============================================================

CREATE OR REPLACE FUNCTION append_application_note(
  p_app_id uuid,
  p_entry  text
)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE applications
  SET notes = CASE
    WHEN notes IS NULL OR notes = '' THEN p_entry
    ELSE notes || E'\n' || p_entry
  END
  WHERE id = p_app_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'application not found: %', p_app_id;
  END IF;
END;
$$;

COMMENT ON FUNCTION append_application_note(uuid, text) IS
  'Atomically appends a timestamped entry to applications.notes. '
  'Caller is responsible for prefixing entry with [YYYY-MM-DD] (actor) convention. '
  'SECURITY INVOKER — RLS on applications table still applies; only admin callers '
  'can reach this function in practice.';

-- Defense-in-depth: only authenticated users should call this; RLS provides the admin gate. [M2 patch — ANVIL R1]
REVOKE EXECUTE ON FUNCTION append_application_note(uuid, text) FROM anon;
REVOKE EXECUTE ON FUNCTION append_application_note(uuid, text) FROM public;
GRANT EXECUTE ON FUNCTION append_application_note(uuid, text) TO authenticated;

-- ============================================================
-- 8. crm_board_rollup — Board INGEST digest helper (v2 §4.4)
-- ============================================================

DROP VIEW IF EXISTS crm_board_rollup;
CREATE VIEW crm_board_rollup
  WITH (security_invoker = on)
AS
SELECT
  status,
  COUNT(*) AS count,
  SUM(CASE WHEN is_overdue THEN 1 ELSE 0 END) AS overdue_count
FROM crm_lead_pipeline
GROUP BY status;

COMMIT;
