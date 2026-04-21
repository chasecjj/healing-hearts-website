-- Migration 025: Add RLS policies to broadcast_sends
--
-- The broadcast_sends table was created directly in the Supabase dashboard
-- (no migration file existed). RLS is already enabled but zero policies
-- were set, making the table inaccessible to any non-service caller.
--
-- This migration ONLY adds policies. It does NOT recreate the table.
-- Safe to re-run: DO blocks check for existence before creating.
--
-- Live schema confirmed 2026-04-20:
--   id           uuid          NOT NULL DEFAULT gen_random_uuid() PK
--   broadcast_id text          NOT NULL
--   email        text          NOT NULL
--   sent_at      timestamptz   NOT NULL DEFAULT now()
--   UNIQUE (broadcast_id, email)
--   INDEX idx_broadcast_sends_broadcast_id ON (broadcast_id)

-- Policy 1: service_role full access (SELECT)
-- The send-broadcast endpoint reads already-sent emails to skip duplicates.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy
    WHERE polrelid = 'public.broadcast_sends'::regclass
      AND polname = 'service_role_select_broadcast_sends'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY service_role_select_broadcast_sends
        ON public.broadcast_sends
        FOR SELECT
        TO service_role
        USING (true)
    $policy$;
  END IF;
END;
$$;

-- Policy 2: service_role full access (INSERT / UPSERT)
-- The onChunkSent callback upserts send records after each batch.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy
    WHERE polrelid = 'public.broadcast_sends'::regclass
      AND polname = 'service_role_insert_broadcast_sends'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY service_role_insert_broadcast_sends
        ON public.broadcast_sends
        FOR INSERT
        TO service_role
        WITH CHECK (true)
    $policy$;
  END IF;
END;
$$;

-- Policy 3: service_role UPDATE (defensive -- upsert may issue UPDATE internally)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy
    WHERE polrelid = 'public.broadcast_sends'::regclass
      AND polname = 'service_role_update_broadcast_sends'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY service_role_update_broadcast_sends
        ON public.broadcast_sends
        FOR UPDATE
        TO service_role
        USING (true)
        WITH CHECK (true)
    $policy$;
  END IF;
END;
$$;

-- No anon / authenticated policies: this table must never be accessible
-- to public clients. All reads and writes go through supabaseAdmin
-- (service_role key), never through the browser client.
