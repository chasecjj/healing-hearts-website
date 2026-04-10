-- =====================================================
-- Phase 3 dual-mode: support both Stripe test and live
-- price IDs per product.
--
-- Code selects the right column based on which secret key
-- is loaded (sk_test_* uses stripe_price_id_test,
-- sk_live_* uses stripe_price_id).
--
-- This lets preview deployments run test-mode Stripe
-- checkout while production runs live-mode, with a single
-- shared products table.
-- =====================================================

ALTER TABLE products
  ADD COLUMN stripe_price_id_test text;

-- Backfill: the existing stripe_price_id column held TEST IDs during
-- the initial sandbox setup. Copy them to the new test column before
-- updating stripe_price_id to the live IDs.
UPDATE products
SET stripe_price_id_test = stripe_price_id;

COMMENT ON COLUMN products.stripe_price_id IS 'Stripe LIVE mode price ID (used when sk_live_* key is loaded)';
COMMENT ON COLUMN products.stripe_price_id_test IS 'Stripe TEST mode price ID (used when sk_test_* key is loaded)';

-- Note: The live stripe_price_id values are not hardcoded in this migration
-- because they are created via Stripe API during deployment. See
-- docs/handoffs/ for the deployment runbook.
