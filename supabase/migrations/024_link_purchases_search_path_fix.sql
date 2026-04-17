-- =====================================================
-- Fix: link_purchases_on_signup() silently failing because
-- the function has no pinned search_path.
--
-- Background: the trigger is SECURITY DEFINER on auth.users
-- insert. Supabase's auth context runs triggers with a
-- restricted search_path that does not include `public`, so
-- `SELECT * FROM crm_contacts ...` raises
-- `relation "crm_contacts" does not exist`, which the
-- EXCEPTION WHEN OTHERS handler catches and logs as a
-- WARNING. Signups appear to succeed but no linking, no
-- enrollment, and no auth_user_id on the order.
--
-- Discovered 2026-04-17 during expo-day end-to-end test —
-- a real rescue-kit buyer signed up, got the welcome email,
-- but the portal showed "not enrolled yet" because the
-- enrollment row was never created.
--
-- Fix: pin search_path so the function sees the public schema
-- regardless of caller context.
-- =====================================================

ALTER FUNCTION public.link_purchases_on_signup()
  SET search_path = public, pg_temp;
