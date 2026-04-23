// One-off: blast the April 23 Google Meet link to the 142 recipients of this
// morning's webinar broadcast. Idempotent via a new broadcast_id marker
// ('webinar-joinlink-april23') — re-running this will skip anyone already sent.
//
// Also upserts a webinar_registrations row per recipient so the post-webinar
// follow-up drip picks them up automatically.
//
// Usage: node scripts/send-webinar-april23-joinlink.mjs
//   Add --dry-run to preview recipients without sending.

import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// ── load .env.local ──────────────────────────────────────────────────────────
const envRaw = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
for (const line of envRaw.split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && !process.env[m[1]]) {
    let v = m[2];
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    process.env[m[1]] = v;
  }
}

const DRY_RUN = process.argv.includes('--dry-run');
const WEBINAR_ID = 'cf709b00-a5c8-4313-a668-0211a5775a29';
const SOURCE_BROADCAST = 'webinar-broadcast-april23';
const THIS_BROADCAST = 'webinar-joinlink-april23';
const FROM_ADDRESS = 'Healing Hearts <hello@healingheartscourse.com>';

for (const key of ['RESEND_API_KEY', 'VITE_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']) {
  if (!process.env[key]) {
    console.error(`Missing ${key} in .env.local`);
    process.exit(1);
  }
}

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);
const resend = new Resend(process.env.RESEND_API_KEY);

const { joinLinkEmail } = await import('../api/_emails/webinar-april23-join-link.js');

// ── build recipient list ─────────────────────────────────────────────────────
// All emails that received the morning broadcast…
const { data: sent, error: sentErr } = await supabase
  .from('broadcast_sends')
  .select('email')
  .eq('broadcast_id', SOURCE_BROADCAST);
if (sentErr) { console.error('broadcast_sends query:', sentErr); process.exit(1); }

// …minus anyone we've already sent this join-link email to (idempotency).
const { data: already } = await supabase
  .from('broadcast_sends')
  .select('email')
  .eq('broadcast_id', THIS_BROADCAST);
const alreadySet = new Set((already || []).map(r => r.email.toLowerCase()));

// …minus anyone unsubscribed from spark (spark list = the broadcast audience).
const { data: unsubs } = await supabase
  .from('spark_signups')
  .select('email')
  .eq('unsubscribed', true);
const unsubSet = new Set((unsubs || []).map(r => r.email.toLowerCase()));

const recipients = (sent || [])
  .map(r => r.email.toLowerCase())
  .filter(e => !alreadySet.has(e) && !unsubSet.has(e));

const uniqueRecipients = Array.from(new Set(recipients));

console.log(`Source broadcast recipients:    ${sent?.length ?? 0}`);
console.log(`Already sent join-link to:      ${alreadySet.size}`);
console.log(`Unsubscribed from spark list:   ${unsubSet.size}`);
console.log(`Final send list (unique):       ${uniqueRecipients.length}`);

if (DRY_RUN) {
  console.log('\n-- DRY RUN -- first 10 recipients:');
  uniqueRecipients.slice(0, 10).forEach(e => console.log('  ' + e));
  process.exit(0);
}

// ── send + upsert registration + record broadcast_send ───────────────────────
let sentOk = 0, failed = 0;
for (const email of uniqueRecipients) {
  try {
    const { subject, html } = joinLinkEmail(email);
    const { error: emailErr } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: email,
      subject,
      html,
    });
    if (emailErr) throw new Error(emailErr.message || String(emailErr));

    // Upsert a webinar_registration so post-webinar follow-ups include them.
    // The reminder-day-of flags get set here so the cron doesn't double-send.
    await supabase
      .from('webinar_registrations')
      .upsert({
        webinar_id: WEBINAR_ID,
        email,
        name: email.split('@')[0],
        reminder_day_before_sent: true,
        reminder_day_of_sent: true,
        last_email_sent_at: new Date().toISOString(),
      }, { onConflict: 'email,webinar_id', ignoreDuplicates: true });

    await supabase.from('broadcast_sends').insert({
      broadcast_id: THIS_BROADCAST,
      email,
    });

    sentOk++;
    process.stdout.write('.');
  } catch (err) {
    failed++;
    console.error(`\n✗ ${email}: ${err.message}`);
  }
  await new Promise(r => setTimeout(r, 600)); // stay under Resend's 2 req/s
}

console.log(`\n\nDone. Sent: ${sentOk}, Failed: ${failed}`);
if (failed > 0) process.exit(1);
