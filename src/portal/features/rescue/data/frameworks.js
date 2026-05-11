/**
 * Frameworks library — Option C 2-tier hybrid taxonomy.
 *
 * Spec: portal-rescue-kit-v1 wave-3.1-frameworks-spec §4.
 *   Tier 1 (Emergency Mini-Kit, "right-now") — 4 cards backed by PDF v2.
 *   Tier 2 (Education, "Learn the science") — 4 cards backed by CUT chapters
 *     (Wave 4 content-port lane fills the destination pages).
 *
 * Content provenance: scout-04-pdf-content-inventory.md §1.
 * Adopted recommendation: scout-01-framework-taxonomy.md §9 (Option C).
 *
 * Route contract: each card's `route` is the stable URL target Wave 4 workers
 * will register a destination page against. Routes are NOT live in Wave 3.2.
 *
 * Icon imports: lucide-react v0.x — tree-shakeable; already used in the portal.
 */

import { Clock, Zap, Activity, FileText, Brain, Waves, Map, Star } from 'lucide-react';

export const TIER_1_FRAMEWORKS = [
  {
    id: 'thirty-second-reset',
    title: 'The 30-Second Reset',
    subtitle: 'Drop into your body before you speak.',
    icon: Clock,
    route: '/portal/rescue-kit/30-second-reset',
    tier: 1,
    contentStatus: 'available', // PDF v2 Emergency Mini-Kit p.5
    traumaFlag: 'HIGH',         // somatic; consent gate required (G1)
  },
  {
    id: 'spark-quickref',
    title: 'SPARK — Quick Reference',
    subtitle: 'The wallet-card form, for mid-conflict.',
    icon: Zap,
    route: '/portal/rescue-kit/spark-quickref',
    tier: 1,
    contentStatus: 'available', // PDF v2 p.8
    traumaFlag: 'LOW',
  },
  {
    id: 'zones-self-assessment',
    title: 'Where Do You Live Right Now?',
    subtitle: 'A 5-question check on your nervous system.',
    icon: Activity,
    route: '/portal/rescue-kit/zones',
    tier: 1,
    contentStatus: 'available', // PDF v2 p.9 printable
    traumaFlag: 'MAYBE',        // self-appraisal guardrail needed
  },
  {
    id: 'conflict-recovery-plan',
    title: 'Conflict Recovery Plan',
    subtitle: 'Printable repair roadmap for tonight.',
    icon: FileText,
    route: '/portal/rescue-kit/recovery-plan',
    tier: 1,
    contentStatus: 'available', // PDF v2 p.11 printable
    traumaFlag: 'HIGH',         // shame + blame spiral markers
  },
];

export const TIER_2_FRAMEWORKS = [
  {
    id: 'critter-ceo',
    title: 'Critter Brain vs CEO Brain',
    subtitle: 'The two minds running your arguments.',
    icon: Brain,
    route: '/portal/rescue-kit/critter-ceo',
    tier: 2,
    contentStatus: 'w4-pending', // CUT Ch2
    traumaFlag: 'MEDIUM',        // dissociation-spectrum risk (scout-01 §7 Q-5)
  },
  {
    id: 'ninety-second-wave',
    title: 'The 90-Second Wave',
    subtitle: 'Riding emotional surges without adding fuel.',
    icon: Waves,
    route: '/portal/rescue-kit/wave',
    tier: 2,
    contentStatus: 'w4-pending', // CUT Ch3
    traumaFlag: 'LOW',
  },
  {
    id: 'zones-full',
    title: 'The Zones of Resilience',
    subtitle: "A shared language for what's happening inside.",
    icon: Map,
    route: '/portal/rescue-kit/zones-full',
    tier: 2,
    contentStatus: 'w4-pending', // CUT Ch4
    traumaFlag: 'LOW',
  },
  {
    id: 'spark-method-full',
    title: 'The SPARK Method™',
    subtitle: 'Full 5-step conflict interruption framework.',
    icon: Star,
    route: '/portal/rescue-kit/spark-method',
    tier: 2,
    contentStatus: 'w4-pending', // CUT Ch5
    traumaFlag: 'LOW',
  },
];

export const ALL_FRAMEWORKS = [...TIER_1_FRAMEWORKS, ...TIER_2_FRAMEWORKS];
