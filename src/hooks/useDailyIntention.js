import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  getTodayIntention,
  saveDailyIntention,
  getRecentIntentions,
  calculateStreak,
} from '../lib/intentions';

/**
 * Hook for the Daily Intention widget.
 * Fetches today's intention on mount, provides save with optimistic update.
 * Matches useCourseData pattern: internal useAuth(), error state, hasFetched guard.
 */
export function useDailyIntention() {
  const { user } = useAuth();
  const [intention, setIntention] = useState(null);
  const [recentIntentions, setRecentIntentions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const hasFetched = useRef(false);

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const [todayData, recentData] = await Promise.all([
        getTodayIntention(user.id),
        getRecentIntentions(user.id, 7),
      ]);
      setIntention(todayData);
      setRecentIntentions(recentData);
    } catch (err) {
      console.error('Failed to load daily intention:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    loadData();
  }, [loadData]);

  const saveIntention = useCallback(
    async ({ intentionText, mood }) => {
      if (!user) return;

      const previousIntention = intention;
      setSaving(true);
      setError(null);

      // Optimistic update
      const optimistic = {
        ...(intention || {}),
        intention_text: intentionText,
        mood,
        intention_date: new Date().toISOString().split('T')[0],
        user_id: user.id,
      };
      setIntention(optimistic);

      try {
        const saved = await saveDailyIntention(user.id, { intentionText, mood });
        setIntention(saved);

        // Refresh recent intentions for streak update
        const recentData = await getRecentIntentions(user.id, 7);
        setRecentIntentions(recentData);
      } catch (err) {
        console.error('Failed to save intention, reverting:', err);
        setIntention(previousIntention);
        setError(err.message);
      } finally {
        setSaving(false);
      }
    },
    [user, intention]
  );

  const streak = useMemo(() => calculateStreak(recentIntentions), [recentIntentions]);

  return {
    intention,
    mood: intention?.mood || null,
    loading,
    saving,
    error,
    saveIntention,
    recentIntentions,
    streak,
  };
}
