/**
 * FMO barrel export — Financial Module Overhaul (Module 1, Section 1).
 *
 * Spec: pr-plan.md §PR 2 + §PR 3 + §PR 4.
 *
 * Components exported here are the MVP set (PR 1 + PR 2) plus PR 3 scaffolded
 * components (DailyCheckBadge, PartnerNudgeBanner, AdaptiveLessonQueueConfig,
 * SurpriseCommitStub) and PR 4 orchestrator (FMOModule1).
 */

export { default as SolveBeforeExplain } from './SolveBeforeExplain';
export { default as SpendingQuiz } from './SpendingQuiz';
export { default as SpendingPlanBuilder } from './SpendingPlanBuilder';
export { default as InlineBudgetFeedback } from './InlineBudgetFeedback';
export { default as WishlistVote } from './WishlistVote';
export { default as MoneyDateKitButton } from './MoneyDateKitButton';

// PR 3 scaffolded components.
export { default as DailyCheckBadge } from './DailyCheckBadge';
export { default as PartnerNudgeBanner } from './PartnerNudgeBanner';
export { default as SurpriseCommitStub } from './SurpriseCommitStub';
export {
  SNIPPET_TO_NEXT_MODULE,
  resolveNextModule,
} from './AdaptiveLessonQueueConfig';

// PR 4 orchestrator.
export { default as FMOModule1 } from './FMOModule1';

// Pure utilities (extracted from .jsx files for react-refresh compliance).
export { scoreQuiz, pickFiringSnippet, computeRatios } from './utils';

export { default as archetypesConfig } from './config/archetypes.json';
export { default as goalLabelsConfig } from './config/goalLabels.json';
export { default as thresholdsConfig } from './config/thresholds.json';
export { default as snippetsConfig } from './config/snippets.json';
