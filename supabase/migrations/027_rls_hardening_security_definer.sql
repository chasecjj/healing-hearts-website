-- =====================================================
-- Migration 027: RLS hardening + SECURITY DEFINER search_path fix
--
-- Closes three overly-permissive RLS policies that allow any
-- authenticated user to read/mutate rows that should only be
-- accessible by the service_role (webhooks, crons, Edge Functions).
--
-- Also fixes handle_new_user() SECURITY DEFINER mutable search_path
-- vulnerability -- same bug class as migration 024 fixed for
-- link_purchases_on_signup().
--
-- DO NOT RUN without reviewing §5 risk register in executor report.
-- Chase must verify signup flow (create test user -> user_profiles
-- row appears) after deploy. See executor-rls-hardening.md.
-- =====================================================

-- =====================================================
-- H1a: DROP overly-permissive crm_contacts_service policy
--
-- Before: FOR ALL USING (true) WITH CHECK (true)
--         Any authenticated user could read, insert, update, delete
--         every CRM contact row.
-- After:  Policy removed. service_role bypasses RLS natively;
--         admin and own-read policies (012) remain in place.
-- =====================================================
DROP POLICY IF EXISTS "crm_contacts_service" ON crm_contacts;

-- =====================================================
-- H1b: DROP overly-permissive rescue_kit_drip_service policy
--
-- Before: FOR ALL USING (true) WITH CHECK (true)
--         Any authenticated user could read/mutate drip rows.
-- After:  Policy removed. service_role (cron) bypasses RLS natively.
--         Table is service-role-only; no authenticated-user policies
--         are needed or remain.
-- =====================================================
DROP POLICY IF EXISTS "rescue_kit_drip_service" ON rescue_kit_drip;

-- =====================================================
-- H3: DROP overly-permissive orders_service_update policy
--
-- Before: FOR UPDATE USING (true)
--         Any authenticated user could UPDATE any order row.
-- After:  Policy removed. Orders UPDATE path is:
--           - service_role (Stripe webhooks): bypasses RLS natively
--           - admin: covered by orders_admin policy (012)
--           - regular users: should NOT update orders at all
-- =====================================================
DROP POLICY IF EXISTS "orders_service_update" ON orders;

-- =====================================================
-- H2: spark_signups -- add explicit deny-all-to-authenticated policy
--
-- RLS was enabled in 007 with a comment "service-role only" but no
-- policy was ever written. The implicit behavior (RLS on, no policy
-- = deny all non-service-role) is correct, but the intent is
-- invisible. Adding an explicit DENY makes it auditable and prevents
-- accidental policy additions from opening unintended access.
--
-- service_role continues to bypass RLS natively and is unaffected.
-- =====================================================
CREATE POLICY "spark_signups_deny_public"
  ON spark_signups
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (false);

-- =====================================================
-- MED: Fix handle_new_user() SECURITY DEFINER mutable search_path
--
-- handle_new_user() fires AFTER INSERT ON auth.users.
-- Supabase auth context triggers with a restricted search_path that
-- does not include public. Without a pinned search_path the INSERT
-- into public.user_profiles may raise "relation does not exist",
-- silently swallowed if an EXCEPTION handler is present, or causing
-- a hard error that blocks signup.
--
-- Pattern mirrors migration 024 (link_purchases_on_signup fix).
-- =====================================================
ALTER FUNCTION public.handle_new_user()
  SET search_path = public, pg_temp;
