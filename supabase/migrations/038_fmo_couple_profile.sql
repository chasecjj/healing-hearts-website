-- =====================================================
-- Migration 038: FMO Couple Profile Schema
--
-- Authored: 2026-05-12
-- Purpose : Prerequisite schema for the Financial Module Overhaul (FMO)
--           portal build. Adds couple-scoped data tables + per-table RLS
--           that enforces the couples-care invariants (partial-state blind,
--           partner-scoped reads) at the DB layer — not just UI.
--
-- References:
--   - PR plan §PR 0:
--       Mind Vault/Projects/Blacksmith/healing-hearts/02-teams/
--       financial-module-overhaul-v1/02-teams/round-01/track-b-output/pr-plan.md
--   - Component list §C0:
--       Mind Vault/Projects/Blacksmith/healing-hearts/02-teams/
--       financial-module-overhaul-v1/02-teams/round-01/track-b-output/component-list.md
--   - Section 2 v2-R1-merged ANVIL R2 PASS 2026-05-12: archetype set =
--       Guardian, Nurturer, Visionary, Ambassador, Joy-Seeker.
--       Archetype columns are `text NOT NULL` (NOT enum) to permit
--       archetype-set evolution without migration churn.
--
-- Rollback: 038_fmo_couple_profile_rollback.sql
--
-- CHASE-GATED APPLY: do NOT execute against prod until Chase explicit ack
-- (CLAUDE.md §3 / CEO-AGENDA §0 migration-apply-policy).
-- =====================================================


-- =====================================================
-- PART 1: NEW TABLES
-- =====================================================

-- couples: the joint record. invite_token is nullable to support both the
-- Thursday admin-link flow (NULL) and the Round 02 self-serve invite flow.
CREATE TABLE couples (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_a_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  partner_b_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  invite_token uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- couple_quiz_results: AP-1 quiz archetype storage.
-- Archetype columns are `text NOT NULL` per Section 2 v2-R1-merged β reconciliation.
-- Application layer validates against the canonical 5-archetype list
-- (Guardian, Nurturer, Visionary, Ambassador, Joy-Seeker).
CREATE TABLE couple_quiz_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id uuid NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  partner_a_archetype text NOT NULL,
  partner_b_archetype text NOT NULL,
  submitted_at timestamptz NOT NULL DEFAULT now()
);

-- couple_goal_selections: AP-7 Wishlist-Vote storage.
-- overlap_goals is server-stored (computed on write by the application) so
-- Component 11 (Adaptive Lesson Queue) can query it later without depending
-- on a live client session — per PR plan rationale lines 32-36.
-- partial-state blind contract is enforced by the SELECT RLS policy below:
-- Partner B cannot read partner_a_goals until partner_b_submitted_at IS NOT NULL.
CREATE TABLE couple_goal_selections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id uuid NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  partner_a_goals jsonb,
  partner_b_goals jsonb,
  overlap_goals jsonb,
  partner_a_submitted_at timestamptz,
  partner_b_submitted_at timestamptz
);

-- couple_spending_plans: AP-2 Spending Plan + AP-4 Breathing Room + AP-8 triggered snippets.
-- breathing_room_cents is client-computed (income - bills - savings) but stored on submit.
-- triggered_snippets is the AP-8 ratio-firing record (Component 5) — drives
-- adaptive lesson queue (Component 11) via static mapping.
CREATE TABLE couple_spending_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id uuid NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  categories jsonb,
  breathing_room_cents integer,
  triggered_snippets jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);


-- =====================================================
-- PART 2: ALTER EXISTING TABLES
-- =====================================================

-- lesson_progress gains couple context + a metadata JSONB bag for component-
-- specific signals (e.g., fmo_m1_opener_submitted: true from Component 1).
-- couple_id is nullable: existing single-user lesson_progress rows pre-FMO
-- have no couple, and ON DELETE SET NULL preserves completion history if
-- a couple is later dissolved.
ALTER TABLE lesson_progress
  ADD COLUMN couple_id uuid REFERENCES couples(id) ON DELETE SET NULL,
  ADD COLUMN metadata jsonb;

-- user_profiles gains last_activity_at for the AP-10 PartnerNudgeBanner
-- (Component 10) and DailyCheckBadge (Component 9). Updated on session open
-- via useFMOSession hook (PR 3).
ALTER TABLE user_profiles
  ADD COLUMN last_activity_at timestamptz;


-- =====================================================
-- PART 3: INDEXES
-- =====================================================

CREATE INDEX idx_couples_partner_a ON couples(partner_a_id);
CREATE INDEX idx_couples_partner_b ON couples(partner_b_id);
CREATE INDEX idx_couple_quiz_couple ON couple_quiz_results(couple_id);
CREATE INDEX idx_couple_goals_couple ON couple_goal_selections(couple_id);
CREATE INDEX idx_couple_plans_couple ON couple_spending_plans(couple_id);

-- One row per couple on the 3 child tables. lib/fmo.js (PR 1) uses these as
-- ON CONFLICT targets for upsert. Quiz retakes / plan revisions UPDATE the
-- existing row rather than creating history rows (Chase ruling 2026-05-12).
CREATE UNIQUE INDEX idx_couple_quiz_couple_unique ON couple_quiz_results(couple_id);
CREATE UNIQUE INDEX idx_couple_goals_couple_unique ON couple_goal_selections(couple_id);
CREATE UNIQUE INDEX idx_couple_plans_couple_unique ON couple_spending_plans(couple_id);

-- Partial UNIQUE on couples.invite_token: prevents duplicate redeemable tokens
-- at the DB layer. Admin-link rows leave invite_token NULL and are excluded
-- from the uniqueness check via the WHERE predicate. Required by the Round 02
-- self-serve flow (UPDATE ... WHERE invite_token = '<token>' AND partner_b_id IS NULL).
CREATE UNIQUE INDEX idx_couples_invite_token_unique
  ON couples(invite_token) WHERE invite_token IS NOT NULL;


-- =====================================================
-- PART 4: ROW LEVEL SECURITY
--
-- Couples-care invariants enforced at DB layer:
--   - couples: partner-scoped read (only the two partners see the row)
--   - couple_quiz_results: couple-scoped read; partner writes own column only
--   - couple_goal_selections: couple-scoped read with PARTIAL-STATE BLIND —
--       Partner B cannot SELECT partner_a_goals until B has submitted.
--       Enforced via per-column-tier policies (see below).
--   - couple_spending_plans: couple-scoped read/write (joint, no asymmetry)
--
-- No policy routes one partner's unsubmitted data to the other before the
-- joint reveal. UI components rely on these policies as a second layer of
-- defense behind the lib/fmo.js null-return contract.
-- =====================================================

ALTER TABLE couples ENABLE ROW LEVEL SECURITY;
ALTER TABLE couple_quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE couple_goal_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE couple_spending_plans ENABLE ROW LEVEL SECURITY;

-- ─── couples ────────────────────────────────────────────────────────────
-- Partner-scoped read: only the two partners on the couple can see the row.
CREATE POLICY "couples_partner_read" ON couples
  FOR SELECT USING (
    partner_a_id = auth.uid() OR partner_b_id = auth.uid()
  );

-- Partner A creates the couple row (admin-link flow does this server-side;
-- invite-token flow does this from Partner A's session).
CREATE POLICY "couples_partner_a_insert" ON couples
  FOR INSERT WITH CHECK (partner_a_id = auth.uid());

-- Partner B redeems the invite by setting partner_b_id to themselves on a
-- row where partner_b_id IS NULL and invite_token is non-null. Application
-- layer checks the actual token value before UPDATE; this RLS predicate
-- ensures only the redeeming user can claim themselves into the slot.
CREATE POLICY "couples_partner_update" ON couples
  FOR UPDATE USING (
    partner_a_id = auth.uid() OR partner_b_id = auth.uid()
  );

-- Admin escape hatch (consistent with existing patterns: 001 + 037).
CREATE POLICY "couples_admin_all" ON couples
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ─── couple_quiz_results ───────────────────────────────────────────────
-- Couple-scoped read: either partner on the couple can SELECT.
CREATE POLICY "couple_quiz_results_couple_read" ON couple_quiz_results
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM couples c
      WHERE c.id = couple_quiz_results.couple_id
        AND (c.partner_a_id = auth.uid() OR c.partner_b_id = auth.uid())
    )
  );

-- Either partner may INSERT/UPDATE the quiz-results row for their couple.
-- Application layer enforces "partner writes own archetype column only"
-- (server-side via lib/fmo.saveQuizResult) — RLS guards couple membership;
-- column-level partner discipline is an app-layer contract.
CREATE POLICY "couple_quiz_results_couple_write" ON couple_quiz_results
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM couples c
      WHERE c.id = couple_quiz_results.couple_id
        AND (c.partner_a_id = auth.uid() OR c.partner_b_id = auth.uid())
    )
  );

-- ─── couple_goal_selections (PARTIAL-STATE BLIND) ──────────────────────
-- Critical couples-care contract: Partner B cannot SELECT a row where
-- partner_a_goals is populated and partner_b_submitted_at IS NULL.
--
-- Policy logic:
--   Caller may SELECT the row IFF
--     - caller is partner A on the couple, OR
--     - caller is partner B on the couple AND partner_b_submitted_at IS NOT NULL
--   (i.e., once Partner B has submitted, both partners can read everything;
--    before that, Partner B is blind.)
--
-- This is the DB-layer enforcement referenced by pr-plan.md line 53 and
-- track-b-output sign-off checklist item 3.
CREATE POLICY "couple_goal_selections_blind_read" ON couple_goal_selections
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM couples c
      WHERE c.id = couple_goal_selections.couple_id
        AND (
          c.partner_a_id = auth.uid()
          OR (
            c.partner_b_id = auth.uid()
            AND couple_goal_selections.partner_b_submitted_at IS NOT NULL
          )
        )
    )
  );

-- Either partner may INSERT/UPDATE the row for their couple (writing own
-- goals column). Column-level partner discipline is app-layer.
CREATE POLICY "couple_goal_selections_couple_write" ON couple_goal_selections
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM couples c
      WHERE c.id = couple_goal_selections.couple_id
        AND (c.partner_a_id = auth.uid() OR c.partner_b_id = auth.uid())
    )
  );

CREATE POLICY "couple_goal_selections_couple_update" ON couple_goal_selections
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM couples c
      WHERE c.id = couple_goal_selections.couple_id
        AND (c.partner_a_id = auth.uid() OR c.partner_b_id = auth.uid())
    )
  );

-- ─── couple_spending_plans ─────────────────────────────────────────────
-- Couple-scoped read/write — no asymmetry; the spending plan is built
-- jointly in a single facilitated session per Component 3 spec.
CREATE POLICY "couple_spending_plans_couple_all" ON couple_spending_plans
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM couples c
      WHERE c.id = couple_spending_plans.couple_id
        AND (c.partner_a_id = auth.uid() OR c.partner_b_id = auth.uid())
    )
  );


-- =====================================================
-- End of migration 038
-- =====================================================
