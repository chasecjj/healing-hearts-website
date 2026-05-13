/**
 * AdaptiveLessonQueueConfig — FMO Component 11 (AP-8 scaffold).
 *
 * Spec: pr-plan.md §PR 3 + component-list.md C11.
 *
 * Static mapping table: snippet-key → next-module-id.
 *
 * What ships Thursday: this config file (no UI). Portal dashboard reads
 * `couple_spending_plans.triggered_snippets` (JSONB array of snippet keys
 * that fired during Spending Plan entry) and resolves the FIRST matching
 * key here to surface a "Continue with [module]" CTA next session.
 *
 * What fires next week: dashboard wiring picks the first matching snippet
 * and surfaces the mapped module CTA. v1 is read-only mapping; no ML.
 *
 * Key namespace matches Track A `inline-lesson-snippets.md` snippet identifiers
 * and the AP-8 ratio keys consumed by `utils.computeRatios` / `pickFiringSnippet`.
 */

/**
 * @type {Record<string, string>} snippet-key → module-id
 *
 * Module ids match the `module_number`-based slug pattern used by CoursePortal
 * routing (`/portal/module-<n>` for the flagship course). Module 1 (FMO) is
 * intentionally NOT a fallback target since users who triggered any snippet
 * have already completed M1 by definition.
 */
export const SNIPPET_TO_NEXT_MODULE = Object.freeze({
  // High-housing ratio → module on housing-cost reframing.
  housing: 'module-2',
  // Food/dining over-allocation → reframing module on shared-table rituals.
  food: 'module-2',
  // Transportation creep → next-module covers commute + lifestyle tradeoffs.
  transportation: 'module-3',
  // Subscription bleed → module on consumption awareness.
  subscriptions: 'module-3',
  // Debt-load > threshold → debt-strategy + breathing-room module.
  debt: 'module-4',
  // Low savings rate → savings + emergency-fund module.
  savings: 'module-4',
  // High discretionary → joy + sustainable spending module.
  discretionary: 'module-5',
  // Total-fixed > comfort floor → fixed-cost audit module.
  fixed_total: 'module-5',
});

/**
 * Resolve the next-module CTA target given a list of triggered snippet keys.
 *
 * Returns the first matching mapping (FIFO order in the array), or null if
 * none of the keys resolve. Callers should treat null as "no adaptive nudge —
 * surface default next-module CTA from the course catalog."
 *
 * @param {string[]} triggeredSnippets
 * @returns {string|null}
 */
export function resolveNextModule(triggeredSnippets) {
  if (!Array.isArray(triggeredSnippets) || triggeredSnippets.length === 0) {
    return null;
  }
  for (const key of triggeredSnippets) {
    if (key && Object.prototype.hasOwnProperty.call(SNIPPET_TO_NEXT_MODULE, key)) {
      return SNIPPET_TO_NEXT_MODULE[key];
    }
  }
  return null;
}

export default SNIPPET_TO_NEXT_MODULE;
