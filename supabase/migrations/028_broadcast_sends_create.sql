-- =====================================================
-- Migration 028: Defensive CREATE for broadcast_sends
--
-- The broadcast_sends table was originally created via the Supabase
-- Dashboard SQL editor and never committed to this repo's migration
-- history. Migration 025 added RLS policies to the live table but
-- intentionally did NOT recreate the table structure.
--
-- This migration closes the env-parity gap: if anyone ever provisions
-- a new Supabase project, runs `supabase db reset`, or replays the
-- migration history from scratch, broadcast_sends will be absent and
-- the `/api/admin/send-broadcast` endpoint will 500 on the very
-- first call (including dry-run, which also touches the table).
--
-- Behavior by environment:
--   - Production (qleojrlqnbiutyhfnqgb): table already exists with
--     identical schema -- every statement is a no-op under IF NOT
--     EXISTS guards. Zero effect.
--   - Dev / staging / fresh env: creates table, PK, unique, and index
--     so downstream migration 025 policies apply to a real table.
--
-- Live schema (production, verified 2026-04-20 via MCP):
--   id           uuid          NOT NULL DEFAULT gen_random_uuid()  PK
--   broadcast_id text          NOT NULL
--   email        text          NOT NULL
--   sent_at      timestamptz   NOT NULL DEFAULT now()
--   UNIQUE (broadcast_id, email)
--   INDEX idx_broadcast_sends_broadcast_id ON (broadcast_id)
--   RLS: ENABLED (policies added by 025)
--
-- ASCII only. Straight quotes. Fully idempotent.
-- =====================================================

BEGIN;

CREATE TABLE IF NOT EXISTS public.broadcast_sends (
  id           uuid        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  broadcast_id text        NOT NULL,
  email        text        NOT NULL,
  sent_at      timestamptz NOT NULL DEFAULT now()
);

-- Unique constraint on (broadcast_id, email) -- matches upsert conflict
-- target in api/admin/send-broadcast.js. Adding via ALTER + IF NOT
-- EXISTS on a named index so re-runs are safe on prod (where the
-- constraint `broadcast_sends_broadcast_id_email_key` already exists
-- via live schema) and on fresh envs (where it must be created).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.broadcast_sends'::regclass
      AND conname  = 'broadcast_sends_broadcast_id_email_key'
  ) THEN
    ALTER TABLE public.broadcast_sends
      ADD CONSTRAINT broadcast_sends_broadcast_id_email_key
      UNIQUE (broadcast_id, email);
  END IF;
END;
$$;

-- Btree index on broadcast_id alone -- supports the .eq('broadcast_id', ...)
-- SELECT filter before each batch upsert.
CREATE INDEX IF NOT EXISTS idx_broadcast_sends_broadcast_id
  ON public.broadcast_sends (broadcast_id);

-- Enable RLS so migration 025's policies have something to apply to
-- when running against a fresh env. No-op on prod (already enabled).
ALTER TABLE public.broadcast_sends ENABLE ROW LEVEL SECURITY;

COMMIT;
