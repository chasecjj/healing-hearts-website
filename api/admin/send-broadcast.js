// POST /api/admin/send-broadcast
// One-time broadcast send endpoint. Auth via Bearer CRON_SECRET.
// Body: { template: "webinar-broadcast-april23", audience: "spark", dryRun: true }
//
// Idempotent: uses broadcast_sends table to skip already-sent emails.

import { Resend } from 'resend';
import { supabaseAdmin } from '../_lib/supabase-admin.js';
import { paginatedQuery } from '../_lib/paginated-query.js';
import { sendBatch } from '../_lib/send-emails.js';

const FROM_ADDRESS = 'Healing Hearts <hello@healingheartscourse.com>';

const TEMPLATES = {
  'webinar-broadcast-april23': () => import('../_emails/webinar-broadcast-april23.js'),
  // [CHASE_REVIEW_PENDING] Confirm audience for apr30 broadcast: 'spark' (all signups),
  // 'webinar_apr23' (Apr 23 registrants), or both via two separate sends.
  'webinar-broadcast-april30': () => import('../_emails/webinar-broadcast-april30.js'),
};

const AUDIENCES = {
  spark: {
    table: 'spark_signups',
    emailCol: 'email',
    filters: (query) => query.eq('unsubscribed', false),
  },
  // [CHASE_REVIEW_PENDING] webinar_apr23 audience targets people who registered for the
  // April 23 session. Requires the webinar row to exist in the 'webinars' table with
  // status 'completed'. Replace WEBINAR_APR23_ID below with the actual UUID before sending.
  // To find it: SELECT id, title, starts_at FROM webinars WHERE starts_at LIKE '2026-04-23%';
  webinar_apr23: {
    table: 'webinar_registrations',
    emailCol: 'email',
    filters: (query) =>
      query
        .eq('webinar_id', process.env.WEBINAR_APR23_ID || '')
        .eq('unsubscribed', false),
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!process.env.RESEND_API_KEY) {
    return res.status(500).json({ error: 'RESEND_API_KEY not configured' });
  }

  const { template, audience = 'spark', dryRun = true } = req.body || {};

  if (!template || !TEMPLATES[template]) {
    return res.status(400).json({
      error: `Unknown template. Available: ${Object.keys(TEMPLATES).join(', ')}`,
    });
  }

  if (!AUDIENCES[audience]) {
    return res.status(400).json({
      error: `Unknown audience. Available: ${Object.keys(AUDIENCES).join(', ')}`,
    });
  }

  const broadcastId = template;
  const audienceCfg = AUDIENCES[audience];

  // Collect all recipient emails (paginated)
  const allEmails = [];
  try {
    for await (const rows of paginatedQuery(() =>
      audienceCfg.filters(
        supabaseAdmin.from(audienceCfg.table).select('id, email')
      )
    )) {
      for (const row of rows) {
        allEmails.push(row.email);
      }
    }
  } catch (err) {
    console.error('[send-broadcast] Query failed:', err);
    return res.status(500).json({ error: 'Failed to query recipients' });
  }

  // Filter out already-sent emails
  const { data: alreadySent, error: sentError } = await supabaseAdmin
    .from('broadcast_sends')
    .select('email')
    .eq('broadcast_id', broadcastId);

  if (sentError) {
    console.error('[send-broadcast] Failed to check sent status:', sentError);
    return res.status(500).json({ error: 'Failed to check sent status' });
  }

  const sentSet = new Set((alreadySent || []).map((r) => r.email));
  const recipients = allEmails.filter((e) => !sentSet.has(e));

  console.log(`[send-broadcast] ${broadcastId}: ${allEmails.length} total, ${sentSet.size} already sent, ${recipients.length} remaining`);

  // Dry run: return counts only
  if (dryRun) {
    return res.status(200).json({
      dryRun: true,
      template,
      audience,
      totalSubscribers: allEmails.length,
      alreadySent: sentSet.size,
      recipientCount: recipients.length,
    });
  }

  // Load template and build per-recipient payloads
  const templateModule = await TEMPLATES[template]();
  const emailPayloads = [];
  const payloadErrors = [];

  for (const email of recipients) {
    try {
      const { subject, html } = templateModule.broadcastEmail(email);
      emailPayloads.push({ from: FROM_ADDRESS, to: email, subject, html });
    } catch (err) {
      console.error(`[send-broadcast] Template render failed for ${email}:`, err);
      payloadErrors.push({ email, error: err.message });
    }
  }

  // Send batch and record successful sends
  const batchResult = await sendBatch(new Resend(process.env.RESEND_API_KEY), emailPayloads, {
    onChunkSent: async (startIdx, count) => {
      const sentAt = new Date().toISOString();
      const sendRecords = emailPayloads
        .slice(startIdx, startIdx + count)
        .map((p) => ({ broadcast_id: broadcastId, email: p.to, sent_at: sentAt }));

      const { error: insertError } = await supabaseAdmin
        .from('broadcast_sends')
        .insert(sendRecords);

      if (insertError) {
        console.error('[send-broadcast] Failed to record sends:', insertError);
        // Sends still went through -- log but don't fail
      }
    },
  });

  const results = {
    sent: batchResult.sent,
    skipped: sentSet.size,
    errors: [...payloadErrors, ...batchResult.errors],
  };

  console.log(`[send-broadcast] ${broadcastId} complete: sent=${results.sent}, skipped=${results.skipped}, errors=${results.errors.length}`);
  return res.status(200).json(results);
}
