/* global process */
// Vercel Cron Function: GET /api/cron/spark-drip
// Runs daily at 7 AM MT (13:00 UTC during MDT).
// Queries pending spark_signups and sends the next day's email.

import { Resend } from 'resend';
import { supabaseAdmin } from '../_lib/supabase-admin.js';

// Dynamic imports for day templates
const dayTemplates = {
  1: () => import('../_emails/spark-day-1.js'),
  2: () => import('../_emails/spark-day-2.js'),
  3: () => import('../_emails/spark-day-3.js'),
  4: () => import('../_emails/spark-day-4.js'),
  5: () => import('../_emails/spark-day-5.js'),
  6: () => import('../_emails/spark-day-6.js'),
  7: () => import('../_emails/spark-day-7.js'),
  8: () => import('../_emails/spark-day-8.js'),
  9: () => import('../_emails/spark-day-9.js'),
  10: () => import('../_emails/spark-day-10.js'),
  11: () => import('../_emails/spark-day-11.js'),
  12: () => import('../_emails/spark-day-12.js'),
  13: () => import('../_emails/spark-day-13.js'),
  14: () => import('../_emails/spark-day-14.js'),
};

export default async function handler(req, res) {
  // Auth: Vercel sends CRON_SECRET header for cron invocations
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!process.env.RESEND_API_KEY) {
    return res.status(500).json({ error: 'RESEND_API_KEY not configured' });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  const BATCH_SIZE = 50;
  const results = { sent: 0, errors: [] };
  let hasMore = true;
  let lastId = null;

  while (hasMore) {
    let query = supabaseAdmin
      .from('spark_signups')
      .select('id, email, current_day, completed, unsubscribed, signed_up_at, last_email_sent_at')
      .eq('completed', false)
      .eq('unsubscribed', false)
      .lt('current_day', 14)
      .lt('signed_up_at', new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString())
      .or(`last_email_sent_at.is.null,last_email_sent_at.lt.${new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString()}`)
      .order('id', { ascending: true })
      .limit(BATCH_SIZE);

    if (lastId) {
      query = query.gt('id', lastId);
    }

    const { data: signups, error: queryError } = await query;

    if (queryError) {
      console.error('[spark-drip] Query failed:', queryError);
      return res.status(500).json({ error: 'Failed to query signups' });
    }

    if (!signups || signups.length === 0) {
      hasMore = false;
      break;
    }

    lastId = signups[signups.length - 1].id;
    hasMore = signups.length === BATCH_SIZE;

    for (const signup of signups) {
      const nextDay = signup.current_day + 1;

      try {
        const templateModule = await dayTemplates[nextDay]();
        const { subject, html } = templateModule.dayEmail();

        await resend.emails.send({
          from: 'Healing Hearts <hello@healingheartscourse.com>',
          to: signup.email,
          subject,
          html,
        });

        await supabaseAdmin
          .from('spark_signups')
          .update({
            current_day: nextDay,
            last_email_sent_at: new Date().toISOString(),
            completed: nextDay === 14,
          })
          .eq('id', signup.id);

        results.sent++;
      } catch (err) {
        console.error(`[spark-drip] Failed for ${signup.email} (day ${nextDay}):`, err);
        results.errors.push({ email: signup.email, day: nextDay, error: err.message });
      }
    }
  }

  console.log(`[spark-drip] Sent: ${results.sent}, Errors: ${results.errors.length}`);
  return res.status(200).json(results);
}
