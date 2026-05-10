-- Migration 033: Admin auto-enrollment
--
-- Problem: admins (Jeff, Trisha, Makayla, etc.) have role = 'admin' in
-- user_profiles and the lessons_read RLS policy grants them content access,
-- but the portal dashboard (PortalDashboard.jsx) routes course-card clicks
-- based on rows in the `enrollments` table. No enrollment row → routed to
-- the marketing page (/apply, /rescue-kit) instead of /portal/module-1.
-- Looks locked, but is actually a routing bug rooted in missing data.
--
-- Fix (data side): give every admin an active enrollment row for every
-- active course, and keep it auto-synced via triggers going forward.
-- (The UI-side belt-and-suspenders fix — making the router respect isAdmin
-- directly — is a separate React change.)
--
-- Idempotent: safe to re-run.

-- ─── ensure_admin_enrollments() ──────────────────────────────────────────
-- Core reconciler. Inserts missing (user × course) enrollment rows for the
-- specified user / course — or for all admins × all active courses if
-- called with no arguments.
--
-- SECURITY DEFINER so triggers can bypass the enrollments_admin_write RLS
-- policy (trigger runs in the caller's context, caller may be the Supabase
-- Auth service creating the user_profiles row, not an admin).
CREATE OR REPLACE FUNCTION public.ensure_admin_enrollments(
  p_user_id uuid DEFAULT NULL,
  p_course_id uuid DEFAULT NULL
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  inserted_count integer := 0;
BEGIN
  INSERT INTO public.enrollments (user_id, course_id, status, enrolled_at)
  SELECT up.id, c.id, 'active', now()
  FROM public.user_profiles up
  CROSS JOIN public.courses c
  WHERE up.role = 'admin'
    AND c.is_active = true
    AND (p_user_id IS NULL OR up.id = p_user_id)
    AND (p_course_id IS NULL OR c.id = p_course_id)
    AND NOT EXISTS (
      SELECT 1 FROM public.enrollments e
      WHERE e.user_id = up.id
        AND e.course_id = c.id
        AND e.status = 'active'
    );

  GET DIAGNOSTICS inserted_count = ROW_COUNT;
  RETURN inserted_count;
END;
$$;

COMMENT ON FUNCTION public.ensure_admin_enrollments(uuid, uuid) IS
  'Inserts active enrollment rows for admin users × active courses. Idempotent. Called by triggers on role change / course activation, and can be called manually for repair: SELECT ensure_admin_enrollments();';

-- ─── Trigger: user becomes admin ─────────────────────────────────────────
-- Fires when a user_profiles row is inserted with role='admin' OR updated
-- such that role transitions to 'admin'. Demotions are ignored — once
-- enrolled, always enrolled (admins don't lose course access if their role
-- is later flipped back to student).
CREATE OR REPLACE FUNCTION public.tg_admin_promote_enroll()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.role = 'admin' AND (TG_OP = 'INSERT' OR OLD.role IS DISTINCT FROM NEW.role) THEN
    PERFORM public.ensure_admin_enrollments(NEW.id, NULL);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_admin_promote_enroll ON public.user_profiles;
CREATE TRIGGER trg_admin_promote_enroll
  AFTER INSERT OR UPDATE OF role ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.tg_admin_promote_enroll();

-- ─── Trigger: course is activated ────────────────────────────────────────
-- Fires when a course is inserted with is_active=true OR updated such that
-- is_active transitions to true. Ensures all current admins get enrolled
-- in any newly-activated course.
CREATE OR REPLACE FUNCTION public.tg_course_activate_enroll_admins()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.is_active = true AND (TG_OP = 'INSERT' OR OLD.is_active IS DISTINCT FROM NEW.is_active) THEN
    PERFORM public.ensure_admin_enrollments(NULL, NEW.id);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_course_activate_enroll_admins ON public.courses;
CREATE TRIGGER trg_course_activate_enroll_admins
  AFTER INSERT OR UPDATE OF is_active ON public.courses
  FOR EACH ROW
  EXECUTE FUNCTION public.tg_course_activate_enroll_admins();

-- ─── Backfill existing admins ────────────────────────────────────────────
-- One-time catch-up for anyone already admin before these triggers existed.
SELECT public.ensure_admin_enrollments();
