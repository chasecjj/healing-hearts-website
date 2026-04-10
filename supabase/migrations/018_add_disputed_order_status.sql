-- =====================================================
-- Add 'disputed' state to order_status enum.
--
-- When a customer files a chargeback with their bank,
-- Stripe fires charge.dispute.created. We mark the order
-- as 'disputed' (NOT 'refunded') because the outcome
-- is not yet known:
--   - If we win the dispute, access stays active
--   - If we lose, handle as refund (revoke access)
-- =====================================================

ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'disputed';
