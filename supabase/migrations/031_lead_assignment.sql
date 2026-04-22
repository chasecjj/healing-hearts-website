-- =====================================================
-- Migration 031: Lead Assignment
--
-- Adds lead assignment capability to the CRM:
--   1. assigned_to_id column (FK to user_profiles) on applications
--   2. Best-effort backfill from assigned_to TEXT → assigned_to_id UUID
--   3. Partial index for fast lookup
--   4. Recreated crm_lead_pipeline view with assigned_to_id + assigned_to_name
--
-- NOTE: The existing assigned_to TEXT column is preserved for backward compat.
-- Do NOT drop it in this migration.
-- =====================================================

BEGIN;

-- ============================================================
-- 1. Add assigned_to_id column (FK to user_profiles)
-- ============================================================

ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS assigned_to_id UUID REFERENCES user_profiles(id);

COMMENT ON COLUMN applications.assigned_to_id IS
  'UUID FK to user_profiles. v2 assignment — preferred over the legacy '
  'assigned_to TEXT column. Both are kept in sync via double-write in the '
  'admin UI. Migration 031 adds this column; 032 may deprecate assigned_to TEXT.';

-- ============================================================
-- 2. Best-effort backfill
--    Match assigned_to text against user_profiles display_name or id::text.
--    Rows that do not match stay NULL in assigned_to_id.
-- ============================================================

UPDATE applications a
SET assigned_to_id = up.id
FROM user_profiles up
WHERE a.assigned_to IS NOT NULL
  AND a.assigned_to_id IS NULL
  AND (
    up.display_name = a.assigned_to
    OR up.id::text = a.assigned_to
  );

-- ============================================================
-- 3. Partial index for fast lookup by assignee
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_applications_assigned_to_id
  ON applications (assigned_to_id)
  WHERE assigned_to_id IS NOT NULL;

-- ============================================================
-- 4. Recreate crm_lead_pipeline view to include assignment info
--
--    Preserves ALL columns from migration 029 exactly, then appends:
--      a.assigned_to_id
--      assigned_to_name (subquery from user_profiles)
-- ============================================================

CREATE OR REPLACE VIEW crm_lead_pipeline
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
  EXISTS (SELECT 1 FROM rescue_kit_drip rkd WHERE rkd.email = a.email) AS is_rescue_kit_buyer,
  a.assigned_to_id,
  (SELECT display_name FROM user_profiles WHERE id = a.assigned_to_id) AS assigned_to_name
FROM applications a;

COMMIT;
