import { supabase } from './supabase';

/**
 * Get today's intention for the current user.
 * Returns null if no intention set today.
 */
export async function getTodayIntention(userId) {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('daily_intentions')
    .select('*')
    .eq('user_id', userId)
    .eq('intention_date', today)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/**
 * Create or update today's intention.
 * Uses UPSERT on (user_id, intention_date) unique constraint.
 */
export async function saveDailyIntention(userId, { intentionText, mood }) {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('daily_intentions')
    .upsert(
      {
        user_id: userId,
        intention_text: intentionText,
        mood: mood || null,
        intention_date: today,
      },
      { onConflict: 'user_id,intention_date' }
    )
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Get recent intentions for streak display.
 * Returns most recent N intentions ordered by date descending.
 */
export async function getRecentIntentions(userId, limit = 7) {
  const { data, error } = await supabase
    .from('daily_intentions')
    .select('*')
    .eq('user_id', userId)
    .order('intention_date', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

/**
 * Calculate streak: consecutive calendar days with an intention,
 * ending at today (or yesterday if today has no intention yet).
 */
export function calculateStreak(recentIntentions) {
  if (!recentIntentions || recentIntentions.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dates = recentIntentions.map((i) => {
    const d = new Date(i.intention_date);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  });

  let streak = 0;
  let checkDate = today.getTime();

  // If no intention today, start checking from yesterday
  if (!dates.includes(checkDate)) {
    checkDate -= 86400000;
  }

  for (let i = 0; i < dates.length; i++) {
    if (dates.includes(checkDate)) {
      streak++;
      checkDate -= 86400000;
    } else {
      break;
    }
  }

  return streak;
}
