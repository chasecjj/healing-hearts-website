/**
 * FMO (Financial Module Overhaul) — Supabase query layer.
 *
 * Spec: pr-plan.md §PR 1 + component-list.md (Mind Vault / financial-module-overhaul-v1).
 *
 * Schema reference: supabase/migrations/038_fmo_couple_profile.sql (applied 2026-05-13).
 *   - couples, couple_quiz_results, couple_goal_selections, couple_spending_plans
 *   - lesson_progress.couple_id / .metadata, user_profiles.last_activity_at
 *
 * Couples-care invariants enforced in this lib (in addition to DB-layer RLS):
 *   - getGoalSelections returns { ownGoals, partnerGoals: null } when partner has
 *     NOT submitted. UI components MUST handle `null` as the blind waiting state.
 *   - getQuizResults returns the full row with both archetype columns OR null when
 *     incomplete (one or both archetypes still missing). UI gates joint reveal on
 *     both fields non-null.
 *
 * Style: matches lib/courses.js — `throw error` on any Supabase error; never swallow.
 */

import { supabase } from './supabase';

// ─── Constants ──────────────────────────────────────────────────

/**
 * Canonical 5-archetype set (Section 2 v2-R1-merged, ANVIL R2 PASS 2026-05-12).
 * Schema column is `text NOT NULL` to permit archetype-set evolution; app
 * layer validates against this list.
 */
export const FMO_ARCHETYPES = [
  'Guardian',
  'Nurturer',
  'Visionary',
  'Ambassador',
  'Joy-Seeker',
];

// ─── Couple Linking ─────────────────────────────────────────────

/**
 * Find-or-create the couple row for a pair of users.
 * Admin/Thursday-flow path (PR 1-A): admin INSERTs the couple directly via
 * Supabase SQL or admin tool; this function is the programmatic equivalent
 * usable from a server-role context.
 */
export async function getOrCreateCouple(userIdA, userIdB) {
  // Look for an existing couple where (a,b) match in either order.
  const { data: existing, error: lookupErr } = await supabase
    .from('couples')
    .select('*')
    .or(
      `and(partner_a_id.eq.${userIdA},partner_b_id.eq.${userIdB}),` +
        `and(partner_a_id.eq.${userIdB},partner_b_id.eq.${userIdA})`
    )
    .maybeSingle();
  if (lookupErr) throw lookupErr;
  if (existing) return existing;

  const { data, error } = await supabase
    .from('couples')
    .insert({ partner_a_id: userIdA, partner_b_id: userIdB })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Resolve the couple row for the calling user (RLS filters to their couple only).
 * Returns null if user is not yet part of a couple.
 */
export async function getCoupleForUser(userId) {
  const { data, error } = await supabase
    .from('couples')
    .select('*')
    .or(`partner_a_id.eq.${userId},partner_b_id.eq.${userId}`)
    .maybeSingle();
  if (error) throw error;
  return data || null;
}

/**
 * Fetch the *other* partner's user_profiles row for nudge-banner / last-activity use.
 * Returns null when the couple has only partner_a (invite-token flow pre-redemption).
 */
export async function getPartnerProfile(coupleId, userId) {
  const { data: couple, error: coupleErr } = await supabase
    .from('couples')
    .select('partner_a_id, partner_b_id')
    .eq('id', coupleId)
    .single();
  if (coupleErr) throw coupleErr;

  const partnerId =
    couple.partner_a_id === userId ? couple.partner_b_id : couple.partner_a_id;
  if (!partnerId) return null;

  const { data, error } = await supabase
    .from('user_profiles')
    .select('id, display_name, avatar_url, last_activity_at')
    .eq('id', partnerId)
    .maybeSingle();
  if (error) throw error;
  return data || null;
}

// ─── Helper — partner slot resolution ───────────────────────────

/**
 * Resolve "partner_a" vs "partner_b" for the calling user given a couple row.
 * Returns 'a' or 'b'; throws if user is not in the couple.
 */
function resolvePartnerSlot(couple, userId) {
  if (couple.partner_a_id === userId) return 'a';
  if (couple.partner_b_id === userId) return 'b';
  throw new Error('[fmo] user is not a member of this couple');
}

// ─── Quiz Results (AP-1) ────────────────────────────────────────

/**
 * Save the calling partner's archetype to couple_quiz_results.
 * Upsert keyed on couple_id (UNIQUE INDEX from migration 038).
 *
 * @param {string} coupleId
 * @param {'a'|'b'} partnerSlot — which partner slot to write
 * @param {string} archetype   — one of FMO_ARCHETYPES
 */
export async function saveQuizResult(coupleId, partnerSlot, archetype) {
  if (!FMO_ARCHETYPES.includes(archetype)) {
    throw new Error(
      `[fmo] invalid archetype "${archetype}"; expected one of ${FMO_ARCHETYPES.join(', ')}`
    );
  }
  if (partnerSlot !== 'a' && partnerSlot !== 'b') {
    throw new Error(`[fmo] invalid partnerSlot "${partnerSlot}"; expected 'a' or 'b'`);
  }

  // Schema requires BOTH archetype columns NOT NULL on row create. To support
  // partial-submission state, we fetch the existing row (if any) and merge.
  const { data: existing, error: lookupErr } = await supabase
    .from('couple_quiz_results')
    .select('*')
    .eq('couple_id', coupleId)
    .maybeSingle();
  if (lookupErr) throw lookupErr;

  const payload = {
    couple_id: coupleId,
    partner_a_archetype:
      partnerSlot === 'a' ? archetype : existing?.partner_a_archetype || '',
    partner_b_archetype:
      partnerSlot === 'b' ? archetype : existing?.partner_b_archetype || '',
    submitted_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('couple_quiz_results')
    .upsert(payload, { onConflict: 'couple_id' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Fetch quiz results for a couple.
 * Returns:
 *   - { partnerA, partnerB } if both archetype columns populated (joint reveal ready)
 *   - { partnerA, partnerB: null } if only A submitted
 *   - { partnerA: null, partnerB } if only B submitted
 *   - null if no row exists
 *
 * UI joint-reveal gate: only render reveal when BOTH partnerA and partnerB non-null.
 */
export async function getQuizResults(coupleId) {
  const { data, error } = await supabase
    .from('couple_quiz_results')
    .select('partner_a_archetype, partner_b_archetype, submitted_at')
    .eq('couple_id', coupleId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    partnerA: data.partner_a_archetype || null,
    partnerB: data.partner_b_archetype || null,
    submittedAt: data.submitted_at,
  };
}

// ─── Goal Selections (AP-7) ─────────────────────────────────────

/**
 * Save the calling partner's top-3 goal selections.
 * Upsert keyed on couple_id; merges with existing row to preserve partner data.
 *
 * @param {string}   coupleId
 * @param {'a'|'b'}  partnerSlot
 * @param {string[]} goals — array of goal-id strings (length 3 expected)
 */
export async function saveGoalSelections(coupleId, partnerSlot, goals) {
  if (partnerSlot !== 'a' && partnerSlot !== 'b') {
    throw new Error(`[fmo] invalid partnerSlot "${partnerSlot}"; expected 'a' or 'b'`);
  }
  if (!Array.isArray(goals)) {
    throw new Error('[fmo] goals must be an array');
  }

  const { data: existing, error: lookupErr } = await supabase
    .from('couple_goal_selections')
    .select('*')
    .eq('couple_id', coupleId)
    .maybeSingle();
  if (lookupErr) throw lookupErr;

  const nowIso = new Date().toISOString();
  const payload = {
    couple_id: coupleId,
    partner_a_goals: partnerSlot === 'a' ? goals : existing?.partner_a_goals ?? null,
    partner_b_goals: partnerSlot === 'b' ? goals : existing?.partner_b_goals ?? null,
    partner_a_submitted_at:
      partnerSlot === 'a' ? nowIso : existing?.partner_a_submitted_at ?? null,
    partner_b_submitted_at:
      partnerSlot === 'b' ? nowIso : existing?.partner_b_submitted_at ?? null,
  };

  // Compute overlap when both submitted, so adaptive-queue can read overlap_goals
  // without an active client session (Component 11 use case).
  const aGoals = payload.partner_a_goals;
  const bGoals = payload.partner_b_goals;
  if (Array.isArray(aGoals) && Array.isArray(bGoals)) {
    const bSet = new Set(bGoals);
    payload.overlap_goals = aGoals.filter((g) => bSet.has(g));
  }

  const { data, error } = await supabase
    .from('couple_goal_selections')
    .upsert(payload, { onConflict: 'couple_id' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Fetch goal selections from the calling user's perspective.
 *
 * COUPLES-CARE CONTRACT (CRITICAL):
 *   Returns { ownGoals, partnerGoals: null } when partner has NOT submitted.
 *   UI components MUST render the blind waiting state when partnerGoals === null,
 *   never "no goals selected yet" (which leaks partial-state).
 *
 * When both partners have submitted, returns both arrays + overlap_goals.
 */
export async function getGoalSelections(coupleId, requestingUserId) {
  const { data: couple, error: coupleErr } = await supabase
    .from('couples')
    .select('partner_a_id, partner_b_id')
    .eq('id', coupleId)
    .single();
  if (coupleErr) throw coupleErr;

  const slot = resolvePartnerSlot(couple, requestingUserId);

  const { data, error } = await supabase
    .from('couple_goal_selections')
    .select('*')
    .eq('couple_id', coupleId)
    .maybeSingle();
  if (error) throw error;

  if (!data) {
    return {
      ownGoals: null,
      partnerGoals: null,
      ownSubmittedAt: null,
      partnerSubmittedAt: null,
      overlapGoals: null,
    };
  }

  const ownGoals = slot === 'a' ? data.partner_a_goals : data.partner_b_goals;
  const ownSubmittedAt =
    slot === 'a' ? data.partner_a_submitted_at : data.partner_b_submitted_at;
  const partnerSubmittedAt =
    slot === 'a' ? data.partner_b_submitted_at : data.partner_a_submitted_at;
  // Partner-goals BLIND until partner has submitted (couples-care invariant).
  const partnerGoals = partnerSubmittedAt
    ? slot === 'a'
      ? data.partner_b_goals
      : data.partner_a_goals
    : null;

  return {
    ownGoals: ownGoals || null,
    partnerGoals,
    ownSubmittedAt: ownSubmittedAt || null,
    partnerSubmittedAt: partnerSubmittedAt || null,
    overlapGoals: partnerGoals ? data.overlap_goals || [] : null,
  };
}

// ─── Spending Plan (AP-2 + AP-4) ────────────────────────────────

/**
 * Save the joint Spending Plan + Breathing Room number.
 *
 * @param {string}  coupleId
 * @param {Array<{name: string, amount_cents: number}>} categories
 * @param {number}  breathingRoomCents — client-computed (income - bills - savings)
 * @param {Array<string>} [triggeredSnippets] — AP-8 snippet keys that fired during entry
 */
export async function saveSpendingPlan(
  coupleId,
  categories,
  breathingRoomCents,
  triggeredSnippets = []
) {
  if (!Array.isArray(categories)) {
    throw new Error('[fmo] categories must be an array');
  }
  const payload = {
    couple_id: coupleId,
    categories,
    breathing_room_cents: breathingRoomCents,
    triggered_snippets: triggeredSnippets,
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await supabase
    .from('couple_spending_plans')
    .upsert(payload, { onConflict: 'couple_id' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Fetch the couple's Spending Plan (or null if not yet created).
 */
export async function getSpendingPlan(coupleId) {
  const { data, error } = await supabase
    .from('couple_spending_plans')
    .select('*')
    .eq('couple_id', coupleId)
    .maybeSingle();
  if (error) throw error;
  return data || null;
}

// ─── User activity (AP-10 surfaces) ─────────────────────────────

/**
 * Update the calling user's last_activity_at to now().
 * Called from useFMOSession on mount (PR 3 hook); also safe to call from any
 * FMO surface on session open.
 */
export async function updateLastActivity(userId) {
  const { error } = await supabase
    .from('user_profiles')
    .update({ last_activity_at: new Date().toISOString() })
    .eq('id', userId);
  if (error) throw error;
}

/**
 * Get the partner's last_activity_at timestamp (for PartnerNudgeBanner).
 * Returns null if partner not yet linked or has no recorded activity.
 */
export async function getPartnerLastActivity(coupleId, userId) {
  const partner = await getPartnerProfile(coupleId, userId);
  return partner?.last_activity_at || null;
}
