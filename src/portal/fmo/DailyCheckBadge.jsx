/**
 * DailyCheckBadge — FMO Component 9 (AP-10 derived).
 *
 * Spec: pr-plan.md §PR 3 + component-list.md C9 + portal-wireframes.md Flow 6.
 *
 * Behavior (session-open query only — NO push notification):
 *   State A — Module 1 NOT yet complete         → render null (clean dashboard)
 *   State B — Module 1 complete + no daily check → render badge "Ready for today's check-in?"
 *   State C — Both Module 1 done + daily check  → render null (clean dashboard)
 *
 * Couples-care invariants (CRITICAL):
 *   - NO partner comparison ("your partner hasn't checked in" is FORBIDDEN).
 *   - NO shame language for non-completion.
 *   - NO push notification integration anywhere in this file.
 *   - Renders null gracefully if no coupleId (non-FMO users see nothing).
 *
 * Query strategy:
 *   1. lesson_progress rows where user_id = userId AND lesson_id IN
 *      (5 FMO M1 lesson UUIDs from migration 039) with completed_at IS NOT NULL
 *      — Module 1 completion gate.
 *   2. daily_intentions for today (intention_date = today) — daily-check gate.
 *
 *   Both reads degrade silently to null on error (badge is non-essential UX).
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { getTypeStyle } from '../design/typography';
import lessonsConfig from './config/lessons.json';

// FMO Module 1 lesson UUIDs — real ids seeded by migration 039
// (applied to prod 2026-05-13 02:02 UTC). Replaces the prior
// `fmo-m1-<step>` slug prefix; lesson_progress.lesson_id FK-references
// lessons(id) (uuid). Source of truth: ./config/lessons.json.
const FMO_M1_LESSON_IDS = lessonsConfig.lessonIds;

export default function DailyCheckBadge({ coupleId, userId }) {
  const [moduleComplete, setModuleComplete] = useState(null);
  const [dailyCheckDone, setDailyCheckDone] = useState(null);

  useEffect(() => {
    let cancelled = false;
    if (!userId) return;

    async function run() {
      // 1. FMO Module 1 lesson_progress — completed_at IS NOT NULL for all M1 lessons.
      //    We treat ">= 1 completed row" as the floor for Thursday's launch state
      //    (lesson count is not yet stable in prod content). Couples-care intent
      //    is "Module 1 done"; we approximate that as "at least one FMO-M1 lesson
      //    has a completed_at" until lesson-count is locked.
      let completed = null;
      try {
        const { data, error } = await supabase
          .from('lesson_progress')
          .select('lesson_id, completed_at')
          .eq('user_id', userId)
          .in('lesson_id', FMO_M1_LESSON_IDS)
          .not('completed_at', 'is', null);
        if (!error && Array.isArray(data)) {
          completed = data.length > 0;
        }
      } catch {
        // Silent fail — non-essential UX.
      }

      // 2. daily_intentions today-row existence.
      let checked = null;
      try {
        const today = new Date().toISOString().split('T')[0];
        const { data, error } = await supabase
          .from('daily_intentions')
          .select('id')
          .eq('user_id', userId)
          .eq('intention_date', today)
          .maybeSingle();
        if (!error) {
          checked = Boolean(data);
        }
      } catch {
        // Silent fail.
      }

      if (cancelled) return;
      setModuleComplete(completed);
      setDailyCheckDone(checked);
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  // Non-FMO users (no couple) — render nothing (graceful degrade).
  if (!coupleId) return null;

  // Still loading either signal — render nothing (no flash-of-badge).
  if (moduleComplete === null || dailyCheckDone === null) return null;

  // State A: Module 1 not yet complete → hidden (clean dashboard).
  if (!moduleComplete) return null;

  // State C: Both done → hidden (clean dashboard).
  if (dailyCheckDone) return null;

  // State B: Module 1 complete + daily check not yet done → render badge.
  return (
    <Link
      to="/portal/fmo/module-1"
      aria-label="Ready for today's check-in"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 16px',
        borderRadius: 9999,
        backgroundColor: 'var(--pt-elevation-2)',
        border: '1px solid var(--pt-primary-accent)',
        color: 'var(--pt-primary-accent)',
        textDecoration: 'none',
        ...getTypeStyle('caption'),
        fontWeight: 600,
      }}
    >
      Ready for today&rsquo;s check-in? <span aria-hidden="true">→</span>
    </Link>
  );
}
