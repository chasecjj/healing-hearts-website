// One-off: send the "we're live right now" last-call email to the April 23
// audience. Targets everyone on webinar_registrations for the event who
// hasn't unsubscribed. Idempotent via a new broadcast_id marker.
//
// Usage: node scripts/send-webinar-april23-livenow.mjs
//   Add --dry-run to preview the audience.

import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

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
const THIS_BROADCAST = 'webinar-livenow-april23';
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
const { liveNowEmail } = await import('../api/_emails/webinar-april23-were-live.js');

// Audience = everyone registered for this webinar, minus unsubs, minus
// anyone we've already sent the live-now email to (dedup safety).
const { data: regs, error: regsErr } = await supabase
  .from('webinar_registrations')
  .select('email')
  .eq('webinar_id', WEBINAR_ID)
  .eq('unsubscribed', false);
if (regsErr) { console.error('webinar_registrations query:', regsErr); process.exit(1); }

const { data: already } = await supabase
  .from('broadcast_sends')
  .select('email')
  .eq('broadcast_id', THIS_BROADCAST);
const alreadySet = new Set((already || []).map(r => r.email.toLowerCase()));

const recipients = Array.from(new Set(
  (regs || []).map(r => r.email.toLowerCase()).filter(e => !alreadySet.has(e))
));

console.log(`Registered + active:         ${regs?.length ?? 0}`);
console.log(`Already got live-now email:  ${alreadySet.size}`);
console.log(`Final send list:             ${recipients.length}`);

if (DRY_RUN) {
  console.log('\n-- DRY RUN -- first 5 recipients:');
  recipients.slice(0, 5).forEach(e => console.log('  ' + e));
  process.exit(0);
}

let sentOk = 0, failed = 0;
for (const email of recipients) {
  try {
    const { subject, html } = liveNowEmail(email);
    const { error: emailErr } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: email,
      subject,
      html,
    });
    if (emailErr) throw new Error(emailErr.message || String(emailErr));

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
  // Tighter gap for time-critical send: 400ms = 2.5 req/s, just above
  // Resend's 2 req/s default. If 429s appear, the script will report
  // them per-email and continue.
  await new Promise(r => setTimeout(r, 400));
}

console.log(`\n\nDone. Sent: ${sentOk}, Failed: ${failed}`);
if (failed > 0) process.exit(1);
