// Vercel Cron Function: GET /api/cron/webinar-cron
// Runs daily at 5 PM MT (23:00 UTC during MDT).
// Handles three jobs: day-before reminders, day-of reminders, post-webinar follow-up.

import { Resend } from 'resend';
import { supabaseAdmin } from '../_lib/supabase-admin.js';
import { paginatedQuery } from '../_lib/paginated-query.js';

const FROM_ADDRESS = 'Healing Hearts <hello@healingheartscourse.com>';

// Dynamic imports for reminder templates
const reminderTemplates = {
  day_before: () => import('../_emails/webinar-reminder-day-before.js'),
  day_of: () => import('../_emails/webinar-reminder-day-of.js'),
};

// Dynamic imports for follow-up templates
const followupTemplates = {
  1: () => import('../_emails/webinar-followup-1.js'),
  2: () => import('../_emails/webinar-followup-2.js'),
  3: () => import('../_emails/webinar-followup-3.js'),
  4: () => import('../_emails/webinar-followup-4.js'),
  5: () => import('../_emails/webinar-followup-5.js'),
};

// ─── Reminder Job Config ────────────────────────────────────────
// Jobs 1 & 2 are structurally identical — only the time window and
// sent-flag column differ. This config drives a single function.
const REMINDER_JOBS = [
  {
    name: 'dayBeforeReminders',
    windowStartHours: 20,
    windowEndHours: 26,
    sentFlag: 'reminder_day_before_sent',
    templateKey: 'day_before',
  },
  {
    name: 'dayOfReminders',
    windowStartHours: 0,
    windowEndHours: 4,
    sentFlag: 'reminder_day_of_sent',
    templateKey: 'day_of',
  },
];

// Follow-up schedule: afterDays since webinar, which template to send,
// what followup_day the registrant should be at
const FOLLOWUP_SCHEDULE = [
  { afterDays: 0, template: 1, atDay: 0 },
  { afterDays: 1, template: 2, atDay: 1 },
  { afterDays: 3, template: 3, atDay: 2 },
  { afterDays: 5, template: 4, atDay: 3 },
  { afterDays: 7, template: 5, atDay: 4 },
];

// ─── Helpers ────────────────────────────────────────────────────

/** Send one email and update the registrant record. */
async function sendAndUpdate(resend, reg, subject, html, updateFields, results) {
  try {
    await resend.emails.send({ from: FROM_ADDRESS, to: reg.email, subject, html });

    await supabaseAdmin
      .from('webinar_registrations')
      .update({ ...updateFields, last_email_sent_at: new Date().toISOString() })
      .eq('id', reg.id);

    results.sent++;
  } catch (err) {
    console.error(`[webinar-cron] Send failed for ${reg.email}:`, err);
    results.errors.push({ email: reg.email, error: err.message });
  }
}

// ─── Job: Reminders (day-before / day-of) ───────────────────────

async function runReminderJob(job, resend, now) {
  const results = { sent: 0, errors: [] };
  const windowStart = new Date(now + job.windowStartHours * 60 * 60 * 1000).toISOString();
  const windowEnd = new Date(now + job.windowEndHours * 60 * 60 * 1000).toISOString();

  const { data: webinars, error: webinarErr } = await supabaseAdmin
    .from('webinars')
    .select('id, title, starts_at, duration_minutes, status, meeting_url, riverside_audience_url')
    .in('status', ['scheduled', 'live'])
    .gte('starts_at', windowStart)
    .lte('starts_at', windowEnd);

  if (webinarErr) {
    console.error(`[webinar-cron] ${job.name} webinar query failed:`, webinarErr);
    return results;
  }

  if (!webinars || webinars.length === 0) return results;

  for (const webinar of webinars) {
    try {
      const templateModule = await reminderTemplates[job.templateKey]();

      for await (const registrants of paginatedQuery(() =>
        supabaseAdmin
          .from('webinar_registrations')
          .select(`id, email, name, ${job.sentFlag}, unsubscribed`)
          .eq('webinar_id', webinar.id)
          .eq(job.sentFlag, false)
          .eq('unsubscribed', false)
      )) {
        for (const reg of registrants) {
          const { subject, html } = templateModule.reminderEmail(reg.name, webinar, reg.email);
          await sendAndUpdate(resend, reg, subject, html, { [job.sentFlag]: true }, results);
        }
      }
    } catch (err) {
      console.error(`[webinar-cron] ${job.name} failed for webinar ${webinar.id}:`, err);
    }
  }

  return results;
}

// ─── Job: Post-Webinar Follow-Up ────────────────────────────────

async function runFollowupJob(resend, now) {
  const results = { sent: 0, errors: [] };

  const { data: webinars, error: webinarErr } = await supabaseAdmin
    .from('webinars')
    .select('id, title, starts_at, duration_minutes, status')
    .in('status', ['completed', 'evergreen']);

  if (webinarErr) {
    console.error('[webinar-cron] Follow-up webinar query failed:', webinarErr);
    return results;
  }

  if (!webinars || webinars.length === 0) return results;

  for (const webinar of webinars) {
    try {
      const daysSinceWebinar = Math.floor(
        (now - new Date(webinar.starts_at).getTime()) / (24 * 60 * 60 * 1000)
      );

      const applicableSteps = FOLLOWUP_SCHEDULE.filter((s) => s.afterDays <= daysSinceWebinar);
      if (applicableSteps.length === 0) continue;

      // Track registrants already processed this run to avoid double-sends
      // when multiple steps are applicable (handles missed cron runs)
      const processedInThisRun = new Set();

      for (const step of applicableSteps) {
        const templateModule = await followupTemplates[step.template]();
        const cooldownCutoff = new Date(now - 20 * 60 * 60 * 1000).toISOString();

        for await (const registrants of paginatedQuery(() =>
          supabaseAdmin
            .from('webinar_registrations')
            .select('id, email, name, followup_day, followup_completed, unsubscribed, last_email_sent_at')
            .eq('webinar_id', webinar.id)
            .eq('followup_day', step.atDay)
            .eq('followup_completed', false)
            .eq('unsubscribed', false)
            .or(`last_email_sent_at.is.null,last_email_sent_at.lt.${cooldownCutoff}`)
        )) {
          for (const reg of registrants) {
            if (processedInThisRun.has(reg.id)) continue;
            processedInThisRun.add(reg.id);

            const { subject, html } = templateModule.followupEmail(reg.name, webinar, reg.email);
            const newFollowupDay = step.atDay + 1;

            await sendAndUpdate(resend, reg, subject, html, {
              followup_day: newFollowupDay,
              followup_completed: newFollowupDay >= 5,
            }, results);
          }
        }
      }
    } catch (err) {
      console.error(`[webinar-cron] Follow-up failed for webinar ${webinar.id}:`, err);
    }
  }

  return results;
}

// ─── Main Handler ───────────────────────────────────────────────

export default async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!process.env.RESEND_API_KEY) {
    return res.status(500).json({ error: 'RESEND_API_KEY not configured' });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const now = Date.now();
  const results = {};

  // Run reminder jobs (day-before, day-of)
  for (const job of REMINDER_JOBS) {
    try {
      results[job.name] = await runReminderJob(job, resend, now);
    } catch (err) {
      console.error(`[webinar-cron] ${job.name} job error:`, err);
      results[job.name] = { sent: 0, errors: [{ error: err.message }] };
    }
  }

  // Run follow-up job
  try {
    results.followups = await runFollowupJob(resend, now);
  } catch (err) {
    console.error('[webinar-cron] Follow-up job error:', err);
    results.followups = { sent: 0, errors: [{ error: err.message }] };
  }

  const totalSent = Object.values(results).reduce((sum, r) => sum + r.sent, 0);
  const totalErrors = Object.values(results).reduce((sum, r) => sum + r.errors.length, 0);
  console.log(`[webinar-cron] Total sent: ${totalSent}, Total errors: ${totalErrors}`);

  return res.status(200).json(results);
}
