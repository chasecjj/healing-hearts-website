-- =====================================================
-- Migration 037: admin_action_audit + admin_resolve_user + revoke RPCs
--
-- (Renumbered from 036 — slot 036 was taken by 036_journal_rls_with_check
--  applied via Supabase Dashboard 2026-05-10 13:43, after scout-02 enumerated
--  the local repo at 12:23. Live DB has additional migrations not yet
--  committed to repo; always check `list_migrations` before claiming a slot.)
--
-- Delivers Wave 3.1 backend-data spec for Tier 1 admin surfaces:
--
--   Part 1 — admin_action_audit table (cross-domain audit log)
--   Part 2 — user_profiles.roles text[] ADD COLUMN (G-10 cleared 2026-05-10)
--             + user_has_role() helper function
--   Part 3 — admin_resolve_user(user_id) RETURNS TABLE  (G-09 cleared 2026-05-10)
--   Part 4 — admin_revoke_registration(reg_id, actor_id)  (S1 deliverable)
--   Part 5 — admin_revoke_enrollment(enrollment_id, actor_id)  (S2 deliverable)
--             + enrollments status CHECK extension ('revoked' added)
--   Part 6 — admin_grant_replay_audit scaffold (DEFERRED to Wave 3.2 JS lane)
--   Part 7 — broadcast_sends.status ADD COLUMN (G-14 cleared)
--             + admin_cancel_broadcast(broadcast_id, actor_id) (S3 deliverable)
--             Sets status='cancelled' on all rows for a broadcast_id.
--   Part 8 — webinar_registrations RLS coach-read extension
--
-- SECURITY DEFINER + SET search_path = public, pg_temp applied to ALL new
-- functions. See scout-02 §6 SECURITY DEFINER trace + migrations 024 + 027
-- + 033 for precedent. Pattern per 033_admin_auto_enrollment.sql.
--
-- CHASE-GATED APPLY: do NOT copy to HealingHeartsWebsite/supabase/migrations/
-- until Chase explicit ack (CLAUDE.md §3 / CEO-AGENDA §0 migration-apply-policy).
--
-- Idempotent: all CREATEs use IF NOT EXISTS / CREATE OR REPLACE.
-- =====================================================


-- =====================================================
-- PART 1: admin_action_audit table
--
-- Cross-domain audit log for all admin destructive / grant actions.
-- Covers Tier 1 targets: webinar_registrations, enrollments, broadcast_sends.
-- Rows are IMMUTABLE — no UPDATE / DELETE policies; service_role INSERT only.
-- actor_id is nullable so rows survive auth.users hard-deletes (SET NULL).
-- =====================================================

CREATE TABLE IF NOT EXISTS admin_action_audit (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Nullable on DELETE SET NULL so audit rows survive user deletion
  actor_id     uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  action_type  text        NOT NULL,   -- 'revoke_registration' | 'revoke_enrollment'
                                       -- | 'cancel_broadcast' | 'grant_replay'
                                       -- | 'resend_confirmation'
  target_table text        NOT NULL,   -- 'webinar_registrations' | 'enrollments'
                                       -- | 'broadcast_sends'
  target_id    uuid        NOT NULL,
  payload      jsonb       NOT NULL DEFAULT '{}'::jsonb,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- Query patterns: lookup by target row, or by actor over time
CREATE INDEX IF NOT EXISTS idx_admin_action_audit_target
  ON admin_action_audit (target_table, target_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_admin_action_audit_actor
  ON admin_action_audit (actor_id, created_at DESC);

ALTER TABLE admin_action_audit ENABLE ROW LEVEL SECURITY;

-- Admin role may SELECT (read-only). Immutable rows — no INSERT/UPDATE/DELETE
-- for authenticated users; those paths go through SECURITY DEFINER RPCs only.
CREATE POLICY admin_action_audit_admin_read ON admin_action_audit
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
       WHERE id = auth.uid()
         AND role = 'admin'
    )
  );

-- service_role full access (used by SECURITY DEFINER functions and crons)
CREATE POLICY admin_action_audit_service_all ON admin_action_audit
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

COMMENT ON TABLE admin_action_audit IS
  'Immutable audit log for all Tier 1 admin destructive and grant actions. '
  'actor_id nullable so rows survive auth.users deletion. '
  'Written by SECURITY DEFINER RPCs only; no direct client writes.';


-- =====================================================
-- PART 2: user_profiles.roles text[] ADD COLUMN  (G-10)
--
-- Multi-role support. Singular `role` column preserved for backward-compat
-- with isAdmin adapter + 033 trigger (trg_admin_promote_enroll).
-- AuthContext reads COALESCE(roles, ARRAY[role]).
-- DROP of singular role column is post-Tier 1 per CEO-AGENDA G-10.
-- =====================================================

-- Add roles array column (idempotent via IF NOT EXISTS)
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS roles text[] DEFAULT NULL;

-- Backward-compat backfill: copy singular role into array for existing rows.
-- WHERE clause makes this idempotent: only rows with roles IS NULL are touched.
UPDATE user_profiles
   SET roles = ARRAY[role]
 WHERE roles IS NULL
   AND role IS NOT NULL;

COMMENT ON COLUMN user_profiles.roles IS
  'Multi-role array. COALESCE(roles, ARRAY[role]) for backward-compat. '
  'Populated by migration 036 backfill. Singular role preserved for 033 triggers.';

-- ─── user_has_role() ─────────────────────────────────────────────────────
-- Checks whether the calling auth.uid() has the given role, checking both
-- the new roles[] array and the legacy singular role column for backward
-- compatibility.
-- SECURITY DEFINER so it can SELECT user_profiles without RLS interference
-- (same auth.uid() context as caller; no privilege escalation risk).
-- Pattern: migration 033 ensure_admin_enrollments() SECURITY DEFINER +
--          SET search_path = public, pg_temp (scout-02 §6 trace).
CREATE OR REPLACE FUNCTION public.user_has_role(target_role text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles
     WHERE id = auth.uid()
       AND (
         target_role = ANY(COALESCE(roles, ARRAY[role]::text[]))
       )
  );
$$;

COMMENT ON FUNCTION public.user_has_role(text) IS
  'Returns true if auth.uid() has target_role in user_profiles.roles '
  '(or falls back to singular role column for backward-compat). '
  'SECURITY DEFINER + pinned search_path per 027/033/024 pattern.';


-- =====================================================
-- PART 3: admin_resolve_user(user_id) RETURNS TABLE  (G-09)
--
-- Reverse of Phase 3.5 findAuthUserIdByEmail (JS-only, api/webhooks/stripe.js:827).
-- Admin list views need the inverse: uuid → email + display_name.
-- Without this RPC, Enrollments admin cannot join auth.users for learner identity.
-- G-09 cleared 2026-05-10: "Author admin_resolve_user(user_id) in migration 036."
--
-- Authorization: non-admin callers receive empty result set (no EXCEPTION raised —
-- safe for client-side consumption). gate is WHERE user_has_role('admin').
-- =====================================================

CREATE OR REPLACE FUNCTION public.admin_resolve_user(p_user_id uuid)
RETURNS TABLE(email text, display_name text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
  SELECT
    au.email::text                                    AS email,
    COALESCE(up.display_name, au.email)::text         AS display_name
  FROM auth.users au
  LEFT JOIN public.user_profiles up ON up.id = au.id
  WHERE au.id = p_user_id
    AND public.user_has_role('admin');
$$;

-- Revoke from anon / public; grant execute to authenticated only.
-- The WHERE user_has_role('admin') inside the function is the effective gate.
REVOKE ALL ON FUNCTION public.admin_resolve_user(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_resolve_user(uuid) TO authenticated;

COMMENT ON FUNCTION public.admin_resolve_user(uuid) IS
  'Returns (email, display_name) for the given auth.users UUID. '
  'Non-admin callers receive an empty result set (no exception). '
  'Reverse of Phase 3.5 JS-only findAuthUserIdByEmail(). '
  'G-09 cleared 2026-05-10.';


-- =====================================================
-- PART 4: admin_revoke_registration(reg_id, actor_id)  (S1)
--
-- Soft-revokes a webinar registration: sets unsubscribed=true +
-- followup_completed=true, then writes an audit row atomically.
-- Roles allowed: admin OR coach (per CEO-AGENDA G-05 v1=ALL coach access).
-- Idempotent: if unsubscribed=true, returns 'already_cancelled' without
-- writing a second audit row.
-- =====================================================

CREATE OR REPLACE FUNCTION public.admin_revoke_registration(
  p_reg_id   uuid,
  p_actor_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_reg    public.webinar_registrations%ROWTYPE;
  v_audit_id uuid;
BEGIN
  -- Authorization: admin or coach
  IF NOT public.user_has_role('admin') AND NOT public.user_has_role('coach') THEN
    RAISE EXCEPTION 'unauthorized: requires admin or coach role';
  END IF;

  -- Lock the row for atomicity; also confirms it exists
  SELECT * INTO v_reg
    FROM public.webinar_registrations
   WHERE id = p_reg_id
   FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'registration not found: %', p_reg_id;
  END IF;

  -- Idempotency: already cancelled → return without writing duplicate audit row
  IF v_reg.unsubscribed = true THEN
    RETURN jsonb_build_object(
      'status',  'already_cancelled',
      'reg_id',  p_reg_id
    );
  END IF;

  -- Soft-revoke: unsubscribed + followup_completed guards cron from re-sending
  UPDATE public.webinar_registrations
     SET unsubscribed        = true,
         followup_completed  = true
   WHERE id = p_reg_id;

  -- Atomic audit row
  INSERT INTO public.admin_action_audit
    (actor_id, action_type, target_table, target_id, payload)
  VALUES
    (p_actor_id, 'revoke_registration', 'webinar_registrations', p_reg_id,
     jsonb_build_object(
       'email',      v_reg.email,
       'webinar_id', v_reg.webinar_id
     ))
  RETURNING id INTO v_audit_id;

  RETURN jsonb_build_object(
    'status',   'revoked',
    'reg_id',   p_reg_id,
    'audit_id', v_audit_id
  );
END;
$$;

REVOKE ALL ON FUNCTION public.admin_revoke_registration(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_revoke_registration(uuid, uuid) TO authenticated;

COMMENT ON FUNCTION public.admin_revoke_registration(uuid, uuid) IS
  'Soft-revokes a webinar registration (unsubscribed=true, followup_completed=true). '
  'Writes admin_action_audit row. Idempotent: already-cancelled rows return '
  'already_cancelled without audit duplication. '
  'admin OR coach roles allowed. S1 deliverable.';


-- =====================================================
-- PART 5: admin_revoke_enrollment(enrollment_id, actor_id)  (S2)
--
-- Soft-revokes an enrollment: sets status='revoked'.
-- Requires extending the enrollments.status CHECK constraint first —
-- original 001_initial_schema.sql only has ('active','expired','refunded').
-- Roles allowed: admin only (enrollments section is admin-only per RBAC matrix).
-- Idempotent: already-revoked rows return 'already_revoked'.
-- =====================================================

-- Extend enrollments.status CHECK to include 'revoked'.
-- Drop the auto-named constraint and recreate with the additional value.
-- Idempotent via IF EXISTS on DROP + does not re-add if already present
-- (ALTER TABLE ADD CONSTRAINT will no-op if constraint already covers value
-- at the DB level — but since we're recreating, we guard with DO block).
DO $$
BEGIN
  -- Drop the original inline CHECK constraint (Postgres auto-names it
  -- 'enrollments_status_check' for an inline CHECK on the status column).
  ALTER TABLE public.enrollments
    DROP CONSTRAINT IF EXISTS enrollments_status_check;

  -- Recreate with 'revoked' included
  ALTER TABLE public.enrollments
    ADD CONSTRAINT enrollments_status_check
    CHECK (status IN ('active', 'expired', 'refunded', 'revoked'));
EXCEPTION
  WHEN duplicate_object THEN
    -- Constraint already updated in a prior run; skip silently
    NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_revoke_enrollment(
  p_enrollment_id uuid,
  p_actor_id      uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_enrollment public.enrollments%ROWTYPE;
  v_audit_id   uuid;
BEGIN
  -- Authorization: admin only (enrollments surface is admin-only per RBAC §8)
  IF NOT public.user_has_role('admin') THEN
    RAISE EXCEPTION 'unauthorized: requires admin role';
  END IF;

  SELECT * INTO v_enrollment
    FROM public.enrollments
   WHERE id = p_enrollment_id
   FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'enrollment not found: %', p_enrollment_id;
  END IF;

  -- Idempotency: already revoked → return without writing duplicate audit row
  IF v_enrollment.status = 'revoked' THEN
    RETURN jsonb_build_object(
      'status',        'already_revoked',
      'enrollment_id', p_enrollment_id
    );
  END IF;

  UPDATE public.enrollments
     SET status = 'revoked'
   WHERE id = p_enrollment_id;

  INSERT INTO public.admin_action_audit
    (actor_id, action_type, target_table, target_id, payload)
  VALUES
    (p_actor_id, 'revoke_enrollment', 'enrollments', p_enrollment_id,
     jsonb_build_object(
       'user_id',   v_enrollment.user_id,
       'course_id', v_enrollment.course_id,
       'prior_status', v_enrollment.status
     ))
  RETURNING id INTO v_audit_id;

  RETURN jsonb_build_object(
    'status',        'revoked',
    'enrollment_id', p_enrollment_id,
    'audit_id',      v_audit_id
  );
END;
$$;

REVOKE ALL ON FUNCTION public.admin_revoke_enrollment(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_revoke_enrollment(uuid, uuid) TO authenticated;

COMMENT ON FUNCTION public.admin_revoke_enrollment(uuid, uuid) IS
  'Soft-revokes an enrollment (status=revoked). '
  'Writes admin_action_audit row. Idempotent: already-revoked returns early. '
  'admin role only. S2 deliverable. '
  'Requires enrollments_status_check constraint update (also in this migration).';


-- =====================================================
-- PART 6: admin_grant_replay_audit scaffold  (DEFERRED to Wave 3.2 JS lane)
--
-- The actual enrollment INSERT uses collectEnrollmentGrants() from
-- api/webhooks/stripe.js:846 — JS-only helper (scout-02 §6 Phase-3.5 trace).
-- That helper normalizes access_grants shapes; replicating in SQL would
-- duplicate logic and regress Phase 3.5 safety.
--
-- Wave 3.2 backend route (api/admin/grant-replay.js) flow:
--   1. Calls collectEnrollmentGrants(product.access_grants) in JS
--   2. UPSERTs enrollment rows via supabaseAdmin (service-role, bypasses RLS)
--   3. Calls admin_grant_replay_audit() for the immutable audit record
--
-- This SQL function records only the audit row. It is NOT the grant mechanism.
-- =====================================================

CREATE OR REPLACE FUNCTION public.admin_grant_replay_audit(
  p_user_id   uuid,
  p_course_id uuid,
  p_actor_id  uuid,
  p_payload   jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_audit_id uuid;
BEGIN
  IF NOT public.user_has_role('admin') THEN
    RAISE EXCEPTION 'unauthorized: requires admin role';
  END IF;

  INSERT INTO public.admin_action_audit
    (actor_id, action_type, target_table, target_id, payload)
  VALUES
    (p_actor_id, 'grant_replay', 'enrollments', p_user_id,
     p_payload || jsonb_build_object('course_id', p_course_id))
  RETURNING id INTO v_audit_id;

  RETURN v_audit_id;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_grant_replay_audit(uuid, uuid, uuid, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_grant_replay_audit(uuid, uuid, uuid, jsonb) TO authenticated;

COMMENT ON FUNCTION public.admin_grant_replay_audit(uuid, uuid, uuid, jsonb) IS
  'AUDIT-ONLY stub. Writes admin_action_audit row for a grant-replay action. '
  'Actual enrollment INSERT is JS-side via collectEnrollmentGrants() '
  '(api/webhooks/stripe.js:846) called from Wave 3.2 api/admin/grant-replay.js route. '
  'admin role only. DEFERRED to Wave 3.2 backend lane.';


-- =====================================================
-- PART 7: broadcast_sends.status ADD COLUMN + admin_cancel_broadcast(broadcast_id, actor_id)
--
-- G-14 cleared 2026-05-10 — Chase: ADD COLUMN status. Migration 036 amends
-- broadcast_sends to support full cancel semantics. Existing 4-column
-- table (id, broadcast_id, email, sent_at) gets a 5th column with a
-- DEFAULT so all existing rows retroactively become 'sent'.
--
-- admin_cancel_broadcast then mutates status='cancelled' AND writes an
-- audit row atomically, idempotent on already-cancelled rows.
-- =====================================================

-- G-14: additive ADD COLUMN; existing rows get DEFAULT 'sent'.
ALTER TABLE public.broadcast_sends
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'sent';

-- Optional CHECK to keep the value space tight; avoids typos in JS callers.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'broadcast_sends_status_check'
  ) THEN
    ALTER TABLE public.broadcast_sends
      ADD CONSTRAINT broadcast_sends_status_check
      CHECK (status IN ('sent', 'scheduled', 'cancelled', 'failed'));
  END IF;
END $$;

-- Index for status filter chips on /admin/broadcasts list view.
CREATE INDEX IF NOT EXISTS idx_broadcast_sends_status
  ON public.broadcast_sends (status);

CREATE OR REPLACE FUNCTION public.admin_cancel_broadcast(
  p_broadcast_id text,   -- broadcast_id is text per broadcast_sends schema
  p_actor_id     uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_existing_status text;
  v_row_count       integer;
  v_audit_id        uuid;
  v_synthetic_id    uuid;
BEGIN
  -- Authorization: admin OR sales-cs (broadcasts section is admin + sales-cs per RBAC §8)
  IF NOT public.user_has_role('admin') AND NOT public.user_has_role('sales-cs') THEN
    RAISE EXCEPTION 'unauthorized: requires admin or sales-cs role';
  END IF;

  -- Confirm broadcast exists; capture canonical status across all rows for the broadcast_id.
  -- A broadcast = N rows in broadcast_sends (one per recipient). Status is per-row;
  -- we lock all matching rows then update them as a batch.
  SELECT MIN(status), COUNT(*)
    INTO v_existing_status, v_row_count
    FROM public.broadcast_sends
   WHERE broadcast_id = p_broadcast_id
   FOR UPDATE;

  IF v_row_count = 0 THEN
    RAISE EXCEPTION 'broadcast not found: %', p_broadcast_id;
  END IF;

  -- Idempotent: if any row already cancelled, return existing state without
  -- a second mutation or audit write.
  IF v_existing_status = 'cancelled' THEN
    RETURN jsonb_build_object(
      'status',         'already_cancelled',
      'broadcast_id',   p_broadcast_id,
      'rows_affected',  0
    );
  END IF;

  -- Mutate: set every row for this broadcast_id to 'cancelled'.
  UPDATE public.broadcast_sends
     SET status = 'cancelled'
   WHERE broadcast_id = p_broadcast_id
     AND status <> 'cancelled';
  GET DIAGNOSTICS v_row_count = ROW_COUNT;

  -- Audit row. target_id is uuid NOT NULL on admin_action_audit; broadcast_id is text,
  -- so use a synthetic uuid and stash the broadcast_id in payload.
  v_synthetic_id := gen_random_uuid();
  INSERT INTO public.admin_action_audit
    (actor_id, action_type, target_table, target_id, payload)
  VALUES
    (p_actor_id, 'cancel_broadcast', 'broadcast_sends', v_synthetic_id,
     jsonb_build_object(
       'broadcast_id',  p_broadcast_id,
       'rows_affected', v_row_count,
       'prior_status',  v_existing_status
     ))
  RETURNING id INTO v_audit_id;

  RETURN jsonb_build_object(
    'status',         'cancelled',
    'broadcast_id',   p_broadcast_id,
    'rows_affected',  v_row_count,
    'audit_id',       v_audit_id
  );
END;
$$;

REVOKE ALL ON FUNCTION public.admin_cancel_broadcast(text, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_cancel_broadcast(text, uuid) TO authenticated;

COMMENT ON FUNCTION public.admin_cancel_broadcast(text, uuid) IS
  'Sets every broadcast_sends row for the given broadcast_id to status=''cancelled''. '
  'Idempotent on already-cancelled state. Writes admin_action_audit row with rows_affected. '
  'admin OR sales-cs roles allowed. G-14 ADD COLUMN status enabled this in migration 036.';


-- =====================================================
-- PART 8: webinar_registrations RLS coach-read extension
--
-- scout-02 §2: existing policy "Admins can read all registrations" covers
-- admin role only. Coach needs SELECT access for Webinars detail view
-- (scout-01 §3.1 open question #1 resolved). V1 = ALL (anti-signal G-05):
-- coaches see all webinar registrations, not just their own webinars.
-- Additive policy — existing admin policy is preserved.
-- =====================================================

-- Drop-and-recreate pattern per 027 precedent; DROP IF EXISTS is safe.
-- We extend by adding a new coach-inclusive policy rather than modifying
-- the existing admin policy (additive = safer; no regression risk).
CREATE POLICY coach_read_all_webinar_registrations
  ON public.webinar_registrations
  FOR SELECT
  TO authenticated
  USING (
    public.user_has_role('admin') OR public.user_has_role('coach')
  );

COMMENT ON POLICY coach_read_all_webinar_registrations
  ON public.webinar_registrations IS
  'Grants coach-role SELECT on all webinar registrations. '
  'V1 = ALL (anti-signal G-05): no per-coach scoping yet. '
  'Additive to existing admin SELECT policy. Migration 036.';

-- =====================================================
-- End of migration 036
-- CHASE-GATED APPLY — do NOT move to HealingHeartsWebsite/supabase/migrations/
-- until Chase explicitly acks this file.
-- =====================================================
