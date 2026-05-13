/**
 * useFMOSession — FMO session-context hook (W4 / PR 3).
 *
 * Spec: pr-plan.md §PR 3 useFMOSession.js + component-list.md C9/C10.
 *
 * Responsibilities (single-mount-per-portal-session):
 *   1. Fire-and-forget `fmo.updateLastActivity(userId)` so partner's
 *      PartnerNudgeBanner can pick up "your partner was here recently."
 *   2. Resolve the couple via fmo.getCoupleForUser.
 *   3. Resolve the partner profile (display_name, last_activity_at) — passed
 *      to DailyCheckBadge + PartnerNudgeBanner via props.
 *   4. Surface a `dailyCheckComplete` flag for callers that want to gate UI
 *      on "today's daily intention written." (Today-date row in daily_intentions.)
 *
 * Returns:
 *   { coupleId, partnerProfile, dailyCheckComplete, loading, error }
 *
 * Couples-care invariant:
 *   - Returns coupleId = null + partnerProfile = null for non-FMO users
 *     (graceful degrade — never throws on missing couple).
 */

import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
  getCoupleForUser,
  getPartnerProfile,
  updateLastActivity,
} from '../lib/fmo';

export function useFMOSession() {
  const { user } = useAuth();
  const [coupleId, setCoupleId] = useState(null);
  const [partnerProfile, setPartnerProfile] = useState(null);
  const [dailyCheckComplete, setDailyCheckComplete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    if (!user?.id) {
      setLoading(false);
      return;
    }

    // Fire-and-forget activity ping. Do NOT block render on this write —
    // banner consumers tolerate eventual consistency on last_activity_at.
    updateLastActivity(user.id).catch(() => {
      // Silent fail — non-essential UX.
    });

    async function resolve() {
      try {
        const couple = await getCoupleForUser(user.id);
        if (cancelled) return;
        if (!couple) {
          // Non-FMO user — graceful degrade.
          setCoupleId(null);
          setPartnerProfile(null);
        } else {
          setCoupleId(couple.id);
          const partner = await getPartnerProfile(couple.id, user.id);
          if (!cancelled) setPartnerProfile(partner);
        }

        // Daily-check signal: today-row in daily_intentions.
        const today = new Date().toISOString().split('T')[0];
        const { data, error: diErr } = await supabase
          .from('daily_intentions')
          .select('id')
          .eq('user_id', user.id)
          .eq('intention_date', today)
          .maybeSingle();
        if (!cancelled && !diErr) {
          setDailyCheckComplete(Boolean(data));
        }
      } catch (e) {
        if (!cancelled) setError(e.message || 'Failed to resolve FMO session');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    resolve();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  return {
    coupleId,
    partnerProfile,
    dailyCheckComplete,
    loading,
    error,
  };
}

export default useFMOSession;
