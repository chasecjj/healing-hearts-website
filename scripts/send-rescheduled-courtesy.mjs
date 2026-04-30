// One-off: courtesy email for people who registered for the original Apr 30, 2026
// webinar before it was rescheduled to May 21, 2026 at 7:00 PM MT.
//
// Tone is Trisha-voiced + personal: apology for the date change + a thank-you
// (Conflict Rescue Kit access, granted in the next few days, NOT attendance-
// contingent for these names).
//
// Idempotent via broadcast_id 'webinar-reschedule-courtesy-may21'. Re-running
// will skip anyone already sent.
//
// IMPORTANT: by default the script sends ONLY to non-internal addresses
// (filters out @healingheartscourse.com). HH team members already know about
// the reschedule. Pass --include-team to send to everyone on the registration list.
//
// Usage:
//   node scripts/send-rescheduled-courtesy.mjs --dry-run   # preview only
//   node scripts/send-rescheduled-courtesy.mjs             # actually send
//   node scripts/send-rescheduled-courtesy.mjs --include-team
//
// Requires .env.local with RESEND_API_KEY, VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.

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
const INCLUDE_TEAM = process.argv.includes('--include-team');
const WEBINAR_ID = '93a564a5-4c73-4d8a-91ad-8a017ea1442e';
const THIS_BROADCAST = 'webinar-reschedule-courtesy-may21';
const FROM_ADDRESS = 'Trisha Jamison <hello@healingheartscourse.com>';
const REPLY_TO = 'trishajamison@healingheartscourse.com';

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

const { webinarRescheduledExistingRegistrantEmail } = await import(
  '../api/_emails/webinar-rescheduled-existing-registrants.js'
);

// ── build recipient list ─────────────────────────────────────────────────────
const { data: regs, error: regErr } = await supabase
  .from('webinar_registrations')
  .select('email, name, created_at, unsubscribed')
  .eq('webinar_id', WEBINAR_ID)
  .order('created_at', { ascending: true });

if (regErr) {
  console.error('webinar_registrations query:', regErr);
  process.exit(1);
}

const { data: already } = await supabase
  .from('broadcast_sends')
  .select('email')
  .eq('broadcast_id', THIS_BROADCAST);
const alreadySet = new Set((already || []).map((r) => r.email.toLowerCase()));

const filtered = (regs || []).filter((r) => {
  if (r.unsubscribed) return false;
  if (alreadySet.has(r.email.toLowerCase())) return false;
  if (!INCLUDE_TEAM && r.email.toLowerCase().endsWith('@healingheartscourse.com')) return false;
  return true;
});

console.log(`Webinar registrations on file:    ${regs?.length ?? 0}`);
console.log(`Already sent courtesy email to:   ${alreadySet.size}`);
console.log(`Filtered (team excluded=${!INCLUDE_TEAM}): ${filtered.length}`);

if (filtered.length === 0) {
  console.log('Nothing to send.');
  process.exit(0);
}

if (DRY_RUN) {
  console.log('\n-- DRY RUN -- recipients:');
  filtered.forEach((r) => console.log(`  ${r.name || '(no name)'} <${r.email}>`));
  process.exit(0);
}

// ── send + record broadcast_send ─────────────────────────────────────────────
let sentOk = 0;
let failed = 0;
for (const r of filtered) {
  try {
    const firstName = (r.name || '').trim().split(/\s+/)[0] || 'friend';
    const { subject, html } = webinarRescheduledExistingRegistrantEmail(firstName, r.email);

    const { error: emailErr } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: r.email,
      replyTo: REPLY_TO,
      subject,
      html,
    });
    if (emailErr) throw new Error(emailErr.message || String(emailErr));

    await supabase.from('broadcast_sends').insert({
      broadcast_id: THIS_BROADCAST,
      email: r.email,
    });

    sentOk++;
    process.stdout.write('.');
  } catch (err) {
    failed++;
    console.error(`\nFAILED ${r.email}: ${err.message}`);
  }
  await new Promise((res) => setTimeout(res, 600)); // stay under Resend 2 req/s
}

console.log(`\n\nDone. Sent: ${sentOk}, Failed: ${failed}`);
if (failed > 0) process.exit(1);
