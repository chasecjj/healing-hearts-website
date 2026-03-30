/* global process */
// POST /api/admin/send-broadcast
// One-time broadcast send endpoint. Auth via Bearer CRON_SECRET.
// Body: { template: "webinar-broadcast-april22", audience: "spark", dryRun: true }
//
// Idempotent: uses broadcast_sends table to skip already-sent emails.

import { Resend } from 'resend';
import { supabaseAdmin } from '../_lib/supabase-admin.js';

const TEMPLATES = {
  'webinar-broadcast-april22': () => import('../_emails/webinar-broadcast-april22.js'),
};

const AUDIENCES = {
  spark: {
    table: 'spark_signups',
    emailCol: 'email',
    filters: (query) => query.eq('unsubscribed', false),
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
  const BATCH_SIZE = 50;
  const allEmails = [];
  let lastId = null;
  let hasMore = true;

  while (hasMore) {
    let query = supabaseAdmin
      .from(audienceCfg.table)
      .select('id, email')
      .order('id', { ascending: true })
      .limit(BATCH_SIZE);

    query = audienceCfg.filters(query);

    if (lastId) {
      query = query.gt('id', lastId);
    }

    const { data: rows, error: queryError } = await query;

    if (queryError) {
      console.error('[send-broadcast] Query failed:', queryError);
      return res.status(500).json({ error: 'Failed to query recipients' });
    }

    if (!rows || rows.length === 0) {
      hasMore = false;
      break;
    }

    lastId = rows[rows.length - 1].id;
    hasMore = rows.length === BATCH_SIZE;

    for (const row of rows) {
      allEmails.push(row.email);
    }
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

  // Load template
  const templateModule = await TEMPLATES[template]();
  const resend = new Resend(process.env.RESEND_API_KEY);
  const results = { sent: 0, skipped: sentSet.size, errors: [] };

  // Build per-recipient payloads (each gets a personalized unsubscribe link)
  const emailPayloads = [];
  for (const email of recipients) {
    try {
      const { subject, html } = templateModule.broadcastEmail(email);
      emailPayloads.push({
        from: 'Healing Hearts <hello@healingheartscourse.com>',
        to: email,
        subject,
        html,
      });
    } catch (err) {
      console.error(`[send-broadcast] Template render failed for ${email}:`, err);
      results.errors.push({ email, error: err.message });
    }
  }

  // Send in chunks of 100 (Resend batch limit)
  const RESEND_CHUNK_SIZE = 100;
  for (let i = 0; i < emailPayloads.length; i += RESEND_CHUNK_SIZE) {
    const chunk = emailPayloads.slice(i, i + RESEND_CHUNK_SIZE);
    const chunkEmails = recipients.slice(i, i + RESEND_CHUNK_SIZE);

    try {
      const { error: batchError } = await resend.batch.send(chunk);

      if (batchError) {
        console.error('[send-broadcast] Batch send error:', batchError);
        for (const email of chunkEmails) {
          results.errors.push({ email, error: batchError.message });
        }
        continue;
      }

      // Record successful sends
      const now = new Date().toISOString();
      const sendRecords = chunkEmails.map((email) => ({
        broadcast_id: broadcastId,
        email,
        sent_at: now,
      }));

      const { error: insertError } = await supabaseAdmin
        .from('broadcast_sends')
        .insert(sendRecords);

      if (insertError) {
        console.error('[send-broadcast] Failed to record sends:', insertError);
        // Sends still went through — log but don't fail
      }

      results.sent += chunkEmails.length;
    } catch (err) {
      console.error('[send-broadcast] Batch send threw:', err);
      for (const email of chunkEmails) {
        results.errors.push({ email, error: err.message });
      }
    }
  }

  console.log(`[send-broadcast] ${broadcastId} complete: sent=${results.sent}, skipped=${results.skipped}, errors=${results.errors.length}`);
  return res.status(200).json(results);
}
