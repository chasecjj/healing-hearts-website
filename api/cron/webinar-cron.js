/* global process */
// Vercel Cron Function: GET /api/cron/webinar-cron
// Runs daily at 5 PM MT (23:00 UTC during MDT).
// Handles three jobs: day-before reminders, day-of reminders, post-webinar follow-up.

import { Resend } from 'resend';
import { supabaseAdmin } from '../_lib/supabase-admin.js';

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

// Follow-up schedule: afterDays since webinar, which template to send, what followup_day the registrant should be at
const FOLLOWUP_SCHEDULE = [
  { afterDays: 0, template: 1, atDay: 0 },
  { afterDays: 1, template: 2, atDay: 1 },
  { afterDays: 3, template: 3, atDay: 2 },
  { afterDays: 5, template: 4, atDay: 3 },
  { afterDays: 7, template: 5, atDay: 4 },
];

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
  const results = {
    dayBeforeReminders: { sent: 0, errors: [] },
    dayOfReminders: { sent: 0, errors: [] },
    followups: { sent: 0, errors: [] },
  };

  // ─── Job 1: Day-Before Reminders ───────────────────────────────────
  // Find webinars starting 20-26 hours from now
  try {
    const windowStart = new Date(now + 20 * 60 * 60 * 1000).toISOString();
    const windowEnd = new Date(now + 26 * 60 * 60 * 1000).toISOString();

    const { data: webinars, error: webinarErr } = await supabaseAdmin
      .from('webinars')
      .select('*')
      .in('status', ['scheduled', 'live'])
      .gte('starts_at', windowStart)
      .lte('starts_at', windowEnd);

    if (webinarErr) {
      console.error('[webinar-cron] Day-before webinar query failed:', webinarErr);
    } else if (webinars && webinars.length > 0) {
      for (const webinar of webinars) {
        const templateModule = await reminderTemplates.day_before();
        let hasMoreRegs = true;
        let lastRegId = null;

        while (hasMoreRegs) {
          let regQuery = supabaseAdmin
            .from('webinar_registrations')
            .select('*')
            .eq('webinar_id', webinar.id)
            .eq('reminder_day_before_sent', false)
            .eq('unsubscribed', false)
            .order('id', { ascending: true })
            .limit(50);

          if (lastRegId) {
            regQuery = regQuery.gt('id', lastRegId);
          }

          const { data: registrants, error: regErr } = await regQuery;

          if (regErr) {
            console.error(`[webinar-cron] Day-before registrant query failed for webinar ${webinar.id}:`, regErr);
            break;
          }

          if (!registrants || registrants.length === 0) {
            hasMoreRegs = false;
            break;
          }

          lastRegId = registrants[registrants.length - 1].id;
          hasMoreRegs = registrants.length === 50;

          for (const reg of registrants) {
            try {
              const { subject, html } = templateModule.reminderEmail(reg.name, webinar);

              await resend.emails.send({
                from: 'Healing Hearts <hello@healingheartscourse.com>',
                to: reg.email,
                subject,
                html,
              });

              await supabaseAdmin
                .from('webinar_registrations')
                .update({
                  reminder_day_before_sent: true,
                  last_email_sent_at: new Date().toISOString(),
                })
                .eq('id', reg.id);

              results.dayBeforeReminders.sent++;
            } catch (err) {
              console.error(`[webinar-cron] Day-before failed for ${reg.email}:`, err);
              results.dayBeforeReminders.errors.push({ email: reg.email, error: err.message });
            }
          }
        }
      }
    }
  } catch (err) {
    console.error('[webinar-cron] Day-before job error:', err);
  }

  // ─── Job 2: Day-Of Reminders ───────────────────────────────────────
  // Find webinars starting 0-4 hours from now
  try {
    const windowStart = new Date(now).toISOString();
    const windowEnd = new Date(now + 4 * 60 * 60 * 1000).toISOString();

    const { data: webinars, error: webinarErr } = await supabaseAdmin
      .from('webinars')
      .select('*')
      .in('status', ['scheduled', 'live'])
      .gte('starts_at', windowStart)
      .lte('starts_at', windowEnd);

    if (webinarErr) {
      console.error('[webinar-cron] Day-of webinar query failed:', webinarErr);
    } else if (webinars && webinars.length > 0) {
      for (const webinar of webinars) {
        const templateModule = await reminderTemplates.day_of();
        let hasMoreRegs = true;
        let lastRegId = null;

        while (hasMoreRegs) {
          let regQuery = supabaseAdmin
            .from('webinar_registrations')
            .select('*')
            .eq('webinar_id', webinar.id)
            .eq('reminder_day_of_sent', false)
            .eq('unsubscribed', false)
            .order('id', { ascending: true })
            .limit(50);

          if (lastRegId) {
            regQuery = regQuery.gt('id', lastRegId);
          }

          const { data: registrants, error: regErr } = await regQuery;

          if (regErr) {
            console.error(`[webinar-cron] Day-of registrant query failed for webinar ${webinar.id}:`, regErr);
            break;
          }

          if (!registrants || registrants.length === 0) {
            hasMoreRegs = false;
            break;
          }

          lastRegId = registrants[registrants.length - 1].id;
          hasMoreRegs = registrants.length === 50;

          for (const reg of registrants) {
            try {
              const { subject, html } = templateModule.reminderEmail(reg.name, webinar);

              await resend.emails.send({
                from: 'Healing Hearts <hello@healingheartscourse.com>',
                to: reg.email,
                subject,
                html,
              });

              await supabaseAdmin
                .from('webinar_registrations')
                .update({
                  reminder_day_of_sent: true,
                  last_email_sent_at: new Date().toISOString(),
                })
                .eq('id', reg.id);

              results.dayOfReminders.sent++;
            } catch (err) {
              console.error(`[webinar-cron] Day-of failed for ${reg.email}:`, err);
              results.dayOfReminders.errors.push({ email: reg.email, error: err.message });
            }
          }
        }
      }
    }
  } catch (err) {
    console.error('[webinar-cron] Day-of job error:', err);
  }

  // ─── Job 3: Post-Webinar Follow-Up ────────────────────────────────
  // Find completed/evergreen webinars and send follow-up sequence
  try {
    const { data: webinars, error: webinarErr } = await supabaseAdmin
      .from('webinars')
      .select('*')
      .in('status', ['completed', 'evergreen']);

    if (webinarErr) {
      console.error('[webinar-cron] Follow-up webinar query failed:', webinarErr);
    } else if (webinars && webinars.length > 0) {
      for (const webinar of webinars) {
        const daysSinceWebinar = Math.floor(
          (now - new Date(webinar.starts_at).getTime()) / (24 * 60 * 60 * 1000)
        );

        // Find which step in the follow-up schedule applies today
        const step = FOLLOWUP_SCHEDULE.find((s) => s.afterDays === daysSinceWebinar);
        if (!step) continue;

        const templateModule = await followupTemplates[step.template]();
        let hasMoreRegs = true;
        let lastRegId = null;

        while (hasMoreRegs) {
          let regQuery = supabaseAdmin
            .from('webinar_registrations')
            .select('*')
            .eq('webinar_id', webinar.id)
            .eq('followup_day', step.atDay)
            .eq('followup_completed', false)
            .eq('unsubscribed', false)
            .or(`last_email_sent_at.is.null,last_email_sent_at.lt.${new Date(now - 20 * 60 * 60 * 1000).toISOString()}`)
            .order('id', { ascending: true })
            .limit(50);

          if (lastRegId) {
            regQuery = regQuery.gt('id', lastRegId);
          }

          const { data: registrants, error: regErr } = await regQuery;

          if (regErr) {
            console.error(`[webinar-cron] Follow-up registrant query failed for webinar ${webinar.id}:`, regErr);
            break;
          }

          if (!registrants || registrants.length === 0) {
            hasMoreRegs = false;
            break;
          }

          lastRegId = registrants[registrants.length - 1].id;
          hasMoreRegs = registrants.length === 50;

          for (const reg of registrants) {
            try {
              const { subject, html } = templateModule.followupEmail(reg.name, webinar);

              await resend.emails.send({
                from: 'Healing Hearts <hello@healingheartscourse.com>',
                to: reg.email,
                subject,
                html,
              });

              const newFollowupDay = step.atDay + 1;
              await supabaseAdmin
                .from('webinar_registrations')
                .update({
                  followup_day: newFollowupDay,
                  followup_completed: newFollowupDay >= 5,
                  last_email_sent_at: new Date().toISOString(),
                })
                .eq('id', reg.id);

              results.followups.sent++;
            } catch (err) {
              console.error(`[webinar-cron] Follow-up failed for ${reg.email} (template ${step.template}):`, err);
              results.followups.errors.push({ email: reg.email, template: step.template, error: err.message });
            }
          }
        }
      }
    }
  } catch (err) {
    console.error('[webinar-cron] Follow-up job error:', err);
  }

  const totalSent = results.dayBeforeReminders.sent + results.dayOfReminders.sent + results.followups.sent;
  const totalErrors = results.dayBeforeReminders.errors.length + results.dayOfReminders.errors.length + results.followups.errors.length;
  console.log(`[webinar-cron] Total sent: ${totalSent}, Total errors: ${totalErrors}`);

  return res.status(200).json(results);
}
