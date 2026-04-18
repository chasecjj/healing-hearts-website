-- =====================================================
-- Close out 5 stale orders from Apr 10–12, 2026.
--
-- Source: Gen D probe executed 2026-04-18.
-- Classification:
--   - 3 orders: status=failed, cs_live_* session, no auth_user_id,
--     no completed sibling → genuine_payment_failure_no_user
--   - 2 orders: status=pending, cs_test_* session, no auth_user_id,
--     no completed sibling → test_mode_session_cleanup
--
-- Schema note: no 'closed' enum value exists in order_status
-- (values: pending, completed, refunded, failed, disputed).
-- No closed_reason column exists. Closure is expressed via
-- metadata JSONB annotation: preserves existing metadata,
-- merges in closed_reason, closed_at, closed_by keys.
-- Status is NOT changed — failed rows stay failed,
-- pending rows stay pending. Chase can optionally update
-- status to 'failed' for the pending rows at apply time.
--
-- !! DO NOT APPLY until Chase reviews and approves. !!
-- !! Target apply window: post-expo (week of 2026-04-21). !!
-- =====================================================


-- =====================================================
-- PRE-FLIGHT: Verify the 5 rows still match classification
-- before any UPDATE runs. RAISE NOTICE so the output is
-- visible in the Supabase SQL editor console.
-- =====================================================

DO $$
DECLARE
  v_total        INT;
  v_failed_ct    INT;
  v_pending_ct   INT;
  v_null_user_ct INT;
  v_completed_sibling_ct INT;
  v_row          RECORD;
BEGIN
  -- Count rows we intend to update
  SELECT COUNT(*) INTO v_total
  FROM orders
  WHERE id IN (
    'ccae98aa-950e-4df8-baae-d672735505ff',  -- pending cs_test
    'b8fe25d3-5a53-4273-9993-ad0adfedc8bf',  -- pending cs_test
    '44706760-249a-4577-9be8-071884c26930',  -- failed  cs_live
    'c4049f1a-ad10-445b-b6fb-4387b874d321',  -- failed  cs_live
    'd5ff0480-442d-46dc-b438-b20d4f6eb3a0'   -- failed  cs_live
  );

  SELECT COUNT(*) INTO v_failed_ct
  FROM orders
  WHERE id IN (
    '44706760-249a-4577-9be8-071884c26930',
    'c4049f1a-ad10-445b-b6fb-4387b874d321',
    'd5ff0480-442d-46dc-b438-b20d4f6eb3a0'
  )
  AND status = 'failed';

  SELECT COUNT(*) INTO v_pending_ct
  FROM orders
  WHERE id IN (
    'ccae98aa-950e-4df8-baae-d672735505ff',
    'b8fe25d3-5a53-4273-9993-ad0adfedc8bf'
  )
  AND status = 'pending';

  SELECT COUNT(*) INTO v_null_user_ct
  FROM orders
  WHERE id IN (
    'ccae98aa-950e-4df8-baae-d672735505ff',
    'b8fe25d3-5a53-4273-9993-ad0adfedc8bf',
    '44706760-249a-4577-9be8-071884c26930',
    'c4049f1a-ad10-445b-b6fb-4387b874d321',
    'd5ff0480-442d-46dc-b438-b20d4f6eb3a0'
  )
  AND auth_user_id IS NULL;

  -- Check no completed sibling appeared since classification
  SELECT COUNT(*) INTO v_completed_sibling_ct
  FROM orders
  WHERE stripe_session_id IN (
    'cs_test_b1dSwG9vo4CJWxUD2sKFcTsVtn2BRNzJESmm3OttPa7VHfjZItbTgaXSup',
    'cs_test_b1eNebKZy9IWey90CmE2DXTB2auIeqy5amlsq8CAUufTfRBQDXuOABBAin',
    'cs_live_b17drarYeGrxowXI9zUuHDeSkvuytDL2IUI0usV1Pu4nIkVDTzZBQXoDG9',
    'cs_live_b1qQaamY8svZCfkG5ucep3otDJNnLYx2StE3szUvxuQEE163iaT73tDkX9',
    'cs_live_b1nlsBKPTJg9YmFIO2F9Wo4FJollI0S5CYHT1c5uS0S0rXCAXYkDILkRi2'
  )
  AND status = 'completed';

  RAISE NOTICE '=== PRE-FLIGHT CHECKS ===';
  RAISE NOTICE 'Rows found by UUID:         % (expect 5)', v_total;
  RAISE NOTICE 'Failed rows still failed:   % (expect 3)', v_failed_ct;
  RAISE NOTICE 'Pending rows still pending: % (expect 2)', v_pending_ct;
  RAISE NOTICE 'Rows with null auth_user:   % (expect 5)', v_null_user_ct;
  RAISE NOTICE 'Completed siblings found:   % (expect 0)', v_completed_sibling_ct;

  IF v_total <> 5 THEN
    RAISE EXCEPTION 'PRE-FLIGHT FAILED: expected 5 rows, found %. Migration aborted.', v_total;
  END IF;
  IF v_failed_ct <> 3 THEN
    RAISE EXCEPTION 'PRE-FLIGHT FAILED: expected 3 failed rows, found %. Classification drift. Migration aborted.', v_failed_ct;
  END IF;
  IF v_pending_ct <> 2 THEN
    RAISE EXCEPTION 'PRE-FLIGHT FAILED: expected 2 pending rows, found %. Classification drift. Migration aborted.', v_pending_ct;
  END IF;
  IF v_null_user_ct <> 5 THEN
    RAISE EXCEPTION 'PRE-FLIGHT FAILED: expected 5 rows with null auth_user_id, found %. One or more rows now linked to a user. Migration aborted.', v_null_user_ct;
  END IF;
  IF v_completed_sibling_ct > 0 THEN
    RAISE EXCEPTION 'PRE-FLIGHT FAILED: % completed sibling order(s) found. Classification drift — do not close. Migration aborted.', v_completed_sibling_ct;
  END IF;

  RAISE NOTICE 'PRE-FLIGHT PASSED. Proceeding with UPDATE.';
END $$;


-- =====================================================
-- UPDATE GROUP 1: 2 pending test-mode orders
-- Reason: test_mode_session_cleanup
-- stripe_session_id prefix: cs_test_*
-- =====================================================

UPDATE orders
SET
  metadata   = metadata || jsonb_build_object(
    'closed_reason', 'test_mode_session_cleanup',
    'closed_at',     '2026-04-18T00:00:00Z',
    'closed_by',     'manual_cleanup_2026_04_18'
  ),
  updated_at = NOW()
WHERE id IN (
  'ccae98aa-950e-4df8-baae-d672735505ff',
  'b8fe25d3-5a53-4273-9993-ad0adfedc8bf'
)
AND status = 'pending'
AND auth_user_id IS NULL;


-- =====================================================
-- UPDATE GROUP 2: 3 failed live-mode orders
-- Reason: genuine_payment_failure_no_user
-- stripe_session_id prefix: cs_live_*
-- =====================================================

UPDATE orders
SET
  metadata   = metadata || jsonb_build_object(
    'closed_reason', 'genuine_payment_failure_no_user',
    'closed_at',     '2026-04-18T00:00:00Z',
    'closed_by',     'manual_cleanup_2026_04_18'
  ),
  updated_at = NOW()
WHERE id IN (
  '44706760-249a-4577-9be8-071884c26930',
  'c4049f1a-ad10-445b-b6fb-4387b874d321',
  'd5ff0480-442d-46dc-b438-b20d4f6eb3a0'
)
AND status = 'failed'
AND auth_user_id IS NULL;


-- =====================================================
-- POST-FLIGHT: Verify all 5 rows carry the expected metadata
-- =====================================================

DO $$
DECLARE
  v_annotated_ct INT;
  v_row          RECORD;
BEGIN
  SELECT COUNT(*) INTO v_annotated_ct
  FROM orders
  WHERE id IN (
    'ccae98aa-950e-4df8-baae-d672735505ff',
    'b8fe25d3-5a53-4273-9993-ad0adfedc8bf',
    '44706760-249a-4577-9be8-071884c26930',
    'c4049f1a-ad10-445b-b6fb-4387b874d321',
    'd5ff0480-442d-46dc-b438-b20d4f6eb3a0'
  )
  AND metadata ? 'closed_reason'
  AND metadata ? 'closed_at'
  AND metadata ? 'closed_by';

  RAISE NOTICE '=== POST-FLIGHT CHECKS ===';
  RAISE NOTICE 'Rows with full closure annotation: % (expect 5)', v_annotated_ct;

  FOR v_row IN
    SELECT id, status, metadata->>'closed_reason' AS reason, metadata->>'closed_at' AS closed_at
    FROM orders
    WHERE id IN (
      'ccae98aa-950e-4df8-baae-d672735505ff',
      'b8fe25d3-5a53-4273-9993-ad0adfedc8bf',
      '44706760-249a-4577-9be8-071884c26930',
      'c4049f1a-ad10-445b-b6fb-4387b874d321',
      'd5ff0480-442d-46dc-b438-b20d4f6eb3a0'
    )
    ORDER BY id
  LOOP
    RAISE NOTICE 'id=% status=% reason=% closed_at=%',
      v_row.id, v_row.status, v_row.reason, v_row.closed_at;
  END LOOP;

  IF v_annotated_ct <> 5 THEN
    RAISE EXCEPTION 'POST-FLIGHT FAILED: expected 5 annotated rows, found %. Check UPDATE guards.', v_annotated_ct;
  END IF;

  RAISE NOTICE 'POST-FLIGHT PASSED. Migration complete.';
END $$;


-- =====================================================
-- ROLLBACK SCRIPT (do not run unless reversing this migration)
-- Copy-paste the block below into the Supabase SQL editor
-- to strip the closure annotation from all 5 rows.
--
-- UPDATE orders
-- SET
--   metadata   = metadata
--                  - 'closed_reason'
--                  - 'closed_at'
--                  - 'closed_by',
--   updated_at = NOW()
-- WHERE id IN (
--   'ccae98aa-950e-4df8-baae-d672735505ff',
--   'b8fe25d3-5a53-4273-9993-ad0adfedc8bf',
--   '44706760-249a-4577-9be8-071884c26930',
--   'c4049f1a-ad10-445b-b6fb-4387b874d321',
--   'd5ff0480-442d-46dc-b438-b20d4f6eb3a0'
-- );
-- =====================================================
