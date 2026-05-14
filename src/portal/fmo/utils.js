/**
 * FMO utility functions extracted from component files so the react-refresh
 * Fast-Refresh constraint is satisfied (JSX files export only components).
 */

import archetypesConfig from './config/archetypes.json';
import thresholdsConfig from './config/thresholds.json';

/**
 * Score the quiz responses and return the nearest archetype id.
 * Implements quiz-scoring-rubric.md v2-R1-merged: 2D centroid, Euclidean distance,
 * tiebreaker chain (Q1 outcome → Guardian default).
 *
 * @param {Object<string, string>} responses — { Q1: 'A', Q2: 'B', ... }
 * @returns {string} archetype id
 */
export function scoreQuiz(responses) {
  const questions = archetypesConfig.questions;
  let tSum = 0;
  let dSum = 0;
  let answered = 0;
  for (const q of questions) {
    const pickedId = responses[q.id];
    if (!pickedId) continue;
    const opt = q.options.find((o) => o.id === pickedId);
    if (!opt) continue;
    tSum += opt.t;
    dSum += opt.d;
    answered++;
  }
  if (answered === 0) return 'Guardian';
  const tAvg = tSum / answered;
  const dAvg = dSum / answered;

  const distances = archetypesConfig.archetypes.map((a) => {
    const dt = tAvg - a.centroid.t;
    const dd = dAvg - a.centroid.d;
    return { id: a.id, dist: Math.sqrt(dt * dt + dd * dd) };
  });
  distances.sort((a, b) => a.dist - b.dist);

  const eps = 1e-6;
  if (distances.length > 1 && Math.abs(distances[0].dist - distances[1].dist) < eps) {
    const q1Pick = responses.Q1;
    if (q1Pick) {
      const q1 = archetypesConfig.questions.find((q) => q.id === 'Q1');
      const opt = q1?.options.find((o) => o.id === q1Pick);
      if (opt) {
        const q1Distances = archetypesConfig.archetypes.map((a) => {
          const dt = opt.t - a.centroid.t;
          const dd = opt.d - a.centroid.d;
          return { id: a.id, dist: Math.sqrt(dt * dt + dd * dd) };
        });
        q1Distances.sort((a, b) => a.dist - b.dist);
        return q1Distances[0].id;
      }
    }
    return 'Guardian';
  }
  return distances[0].id;
}

/**
 * Evaluate ratios against thresholds and return the firing snippet (if any).
 * Highest-priority threshold wins (lowest priority number).
 */
export function pickFiringSnippet(ratios) {
  if (!ratios || typeof ratios !== 'object') return null;
  const fired = thresholdsConfig.thresholds
    .filter((t) => {
      const v = ratios[t.ratioKey];
      if (typeof v !== 'number' || Number.isNaN(v)) return false;
      if (t.op === 'gt') return v > t.value;
      if (t.op === 'lt') return v < t.value;
      if (t.op === 'gte') return v >= t.value;
      if (t.op === 'lte') return v <= t.value;
      return false;
    })
    .sort((a, b) => a.priority - b.priority);
  return fired[0] || null;
}

/**
 * Compute category ratios for AP-8 inline feedback.
 * @param {number} takeHomeCents
 * @param {Array<{name: string, amount_cents: number, isFixed?: boolean, ratioKey?: string|null}>} categories
 * @param {number} [savingsCents=0] — top-level savings target (lives outside the
 *   categories array in SpendingPlanBuilder's form state). Required to populate
 *   `ratios.savings` for the Snippet 4 (Savings Rate) threshold; without it the
 *   `savings < 0.10` threshold can never fire.
 */
export function computeRatios(takeHomeCents, categories, savingsCents = 0) {
  if (!takeHomeCents || takeHomeCents <= 0) return {};
  const sumByKey = {};
  let fixedTotal = 0;
  for (const c of categories) {
    if (c.ratioKey) {
      sumByKey[c.ratioKey] = (sumByKey[c.ratioKey] || 0) + (c.amount_cents || 0);
    }
    if (c.isFixed) fixedTotal += c.amount_cents || 0;
  }
  const ratios = {};
  for (const [k, v] of Object.entries(sumByKey)) {
    ratios[k] = v / takeHomeCents;
  }
  ratios.fixedTotal = fixedTotal / takeHomeCents;
  ratios.savings = (savingsCents || 0) / takeHomeCents;
  return ratios;
}
