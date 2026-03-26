import { supabaseAdmin } from './supabase-admin.js';

/**
 * Check if an email has submitted to a table too recently.
 * Returns { allowed: true } or { allowed: false, retryAfterMinutes }.
 */
export async function checkEmailRateLimit(table, email, windowMinutes = 5) {
  try {
    const cutoff = new Date(Date.now() - windowMinutes * 60 * 1000).toISOString();

    const { data, error } = await supabaseAdmin
      .from(table)
      .select('created_at')
      .eq('email', email)
      .gte('created_at', cutoff)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.warn('[rate-limit] Supabase query error (failing open):', error.message);
    }

    if (error || !data) {
      return { allowed: true };
    }

    const lastSubmission = new Date(data.created_at);
    const minutesSince = (Date.now() - lastSubmission.getTime()) / 60000;
    const retryAfterMinutes = Math.ceil(windowMinutes - minutesSince);

    return { allowed: false, retryAfterMinutes };
  } catch (err) {
    console.warn('[rate-limit] Unexpected error (failing open):', err.message);
    return { allowed: true };
  }
}
