// Vercel Cron Function: GET /api/cron/spark-drip
// Runs daily at 7 AM MT (13:00 UTC during MDT).
// Queries pending spark_signups and sends the next day's email.
// Also handles rescue_kit_drip: Day 3 check-in and Day 7 progress + upsell emails.

import { Resend } from 'resend';
import { supabaseAdmin } from '../_lib/supabase-admin.js';
import { paginatedQuery } from '../_lib/paginated-query.js';
import { sendBatch } from '../_lib/send-emails.js';
import { rescueKitDay3Email } from '../_emails/rescue-kit-day3.js';
import { rescueKitDay7Email } from '../_emails/rescue-kit-day7.js';

const FROM_ADDRESS = 'Healing Hearts <hello@healingheartscourse.com>';

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
  const now = Date.now();
  const sixHoursAgo = new Date(now - 6 * 60 * 60 * 1000).toISOString();
  const twentyHoursAgo = new Date(now - 20 * 60 * 60 * 1000).toISOString();
  const results = { sent: 0, errors: [] };

  try {
    for await (const signups of paginatedQuery(() =>
      supabaseAdmin
        .from('spark_signups')
        .select('id, email, current_day, completed, unsubscribed, signed_up_at, last_email_sent_at')
        .eq('completed', false)
        .eq('unsubscribed', false)
        .lt('current_day', 14)
        .lt('signed_up_at', sixHoursAgo)
        .or(`last_email_sent_at.is.null,last_email_sent_at.lt.${twentyHoursAgo}`)
    )) {
      // Build email payloads for this page
      const emailPayloads = [];
      const payloadSignups = [];

      for (const signup of signups) {
        const nextDay = signup.current_day + 1;
        if (nextDay > 14) {
          console.warn('[spark-drip] Signup past day 14 without completion, marking completed:', signup.email, 'current_day:', signup.current_day);
          await supabaseAdmin
            .from('spark_signups')
            .update({ completed: true })
            .eq('id', signup.id);
          continue;
        }
        try {
          const templateModule = await dayTemplates[nextDay]();
          const { subject, html } = templateModule.dayEmail(signup.email);
          emailPayloads.push({ from: FROM_ADDRESS, to: signup.email, subject, html });
          payloadSignups.push({ signup, nextDay });
        } catch (err) {
          console.error(`[spark-drip] Template load failed for ${signup.email} (day ${nextDay}):`, err);
          results.errors.push({ email: signup.email, day: nextDay, error: err.message });
        }
      }

      // Send batch and update records for each successful chunk
      const batchResult = await sendBatch(resend, emailPayloads, {
        onChunkSent: async (startIdx, count) => {
          const sentAt = new Date().toISOString();
          for (const { signup, nextDay } of payloadSignups.slice(startIdx, startIdx + count)) {
            try {
              await supabaseAdmin
                .from('spark_signups')
                .update({
                  current_day: nextDay,
                  last_email_sent_at: sentAt,
                  completed: nextDay === 14,
                })
                .eq('id', signup.id);
            } catch (updateErr) {
              console.error(`[spark-drip] Supabase update failed for ${signup.email}:`, updateErr);
              results.errors.push({ email: signup.email, day: nextDay, error: updateErr.message });
            }
          }
        },
      });

      results.sent += batchResult.sent;
      for (const e of batchResult.errors) {
        results.errors.push(e);
      }
    }
  } catch (err) {
    console.error('[spark-drip] Query failed:', err);
    return res.status(500).json({ error: 'Failed to query signups' });
  }

  console.log(`[spark-drip] Sent: ${results.sent}, Errors: ${results.errors.length}`);

  // ─── Rescue Kit drip scan ─────────────────────────────────────────────────
  // Reuses this cron (no new cron job allowed). Scans rescue_kit_drip rows:
  //   Day 3 email: current_day < 3 AND purchased_at was 3+ days ago
  //   Day 7 email: current_day >= 3 AND current_day < 7 AND purchased_at was 7+ days ago
  const rkResults = { sent: 0, errors: [] };
  const threeDaysAgo = new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString();
  const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();

  // Resend instance (may already be initialized above if RESEND_API_KEY is set)
  const rkResend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

  if (rkResend) {
    // --- Day 3 candidates ---
    try {
      for await (const rows of paginatedQuery(() =>
        supabaseAdmin
          .from('rescue_kit_drip')
          .select('id, email, name, current_day, purchased_at')
          .eq('unsubscribed', false)
          .lt('current_day', 3)
          .lt('purchased_at', threeDaysAgo)
      )) {
        const payloads = [];
        const rowMap = [];

        for (const row of rows) {
          const emailData = rescueKitDay3Email(row.email, row.name);
          payloads.push({ from: FROM_ADDRESS, to: row.email, subject: emailData.subject, html: emailData.html });
          rowMap.push(row);
        }

        const batchResult = await sendBatch(rkResend, payloads, {
          onChunkSent: async (startIdx, count) => {
            const sentAt = new Date().toISOString();
            for (const row of rowMap.slice(startIdx, startIdx + count)) {
              try {
                await supabaseAdmin
                  .from('rescue_kit_drip')
                  .update({ current_day: 3 })
                  .eq('id', row.id);
              } catch (updateErr) {
                console.error(`[spark-drip] rescue-kit day3 update failed for ${row.email}:`, updateErr);
                rkResults.errors.push({ email: row.email, day: 3, error: updateErr.message });
              }
            }
          },
        });

        rkResults.sent += batchResult.sent;
        for (const e of batchResult.errors) rkResults.errors.push(e);
      }
    } catch (err) {
      console.error('[spark-drip] rescue-kit day3 query failed:', err);
      rkResults.errors.push({ day: 3, error: err.message });
    }

    // --- Day 7 candidates ---
    try {
      for await (const rows of paginatedQuery(() =>
        supabaseAdmin
          .from('rescue_kit_drip')
          .select('id, email, name, current_day, purchased_at')
          .eq('unsubscribed', false)
          .gte('current_day', 3)
          .lt('current_day', 7)
          .lt('purchased_at', sevenDaysAgo)
      )) {
        const payloads = [];
        const rowMap = [];

        for (const row of rows) {
          const emailData = rescueKitDay7Email(row.email, row.name);
          payloads.push({ from: FROM_ADDRESS, to: row.email, subject: emailData.subject, html: emailData.html });
          rowMap.push(row);
        }

        const batchResult = await sendBatch(rkResend, payloads, {
          onChunkSent: async (startIdx, count) => {
            for (const row of rowMap.slice(startIdx, startIdx + count)) {
              try {
                await supabaseAdmin
                  .from('rescue_kit_drip')
                  .update({ current_day: 7 })
                  .eq('id', row.id);
              } catch (updateErr) {
                console.error(`[spark-drip] rescue-kit day7 update failed for ${row.email}:`, updateErr);
                rkResults.errors.push({ email: row.email, day: 7, error: updateErr.message });
              }
            }
          },
        });

        rkResults.sent += batchResult.sent;
        for (const e of batchResult.errors) rkResults.errors.push(e);
      }
    } catch (err) {
      console.error('[spark-drip] rescue-kit day7 query failed:', err);
      rkResults.errors.push({ day: 7, error: err.message });
    }
  } else {
    console.warn('[spark-drip] Skipping rescue-kit drip: RESEND_API_KEY not configured');
  }

  console.log(`[spark-drip] rescue-kit: Sent: ${rkResults.sent}, Errors: ${rkResults.errors.length}`);
  return res.status(200).json({
    spark: results,
    rescue_kit: rkResults,
  });
}
