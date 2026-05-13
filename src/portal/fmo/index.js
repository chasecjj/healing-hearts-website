/**
 * FMO barrel export — Financial Module Overhaul (Module 1, Section 1).
 *
 * Spec: pr-plan.md §PR 2.
 *
 * Components exported here are the MVP set (PR 1 + PR 2). PR 3 adds:
 *   DailyCheckBadge, PartnerNudgeBanner, AdaptiveLessonQueueConfig, SurpriseCommitStub.
 * PR 4 wires the route + dashboard surfaces (W4 territory).
 */

export { default as SolveBeforeExplain } from './SolveBeforeExplain';
export { default as SpendingQuiz } from './SpendingQuiz';
export { default as SpendingPlanBuilder } from './SpendingPlanBuilder';
export { default as InlineBudgetFeedback } from './InlineBudgetFeedback';
export { default as WishlistVote } from './WishlistVote';
export { default as MoneyDateKitButton } from './MoneyDateKitButton';

// Pure utilities (extracted from .jsx files for react-refresh compliance).
export { scoreQuiz, pickFiringSnippet, computeRatios } from './utils';

export { default as archetypesConfig } from './config/archetypes.json';
export { default as goalLabelsConfig } from './config/goalLabels.json';
export { default as thresholdsConfig } from './config/thresholds.json';
export { default as snippetsConfig } from './config/snippets.json';
