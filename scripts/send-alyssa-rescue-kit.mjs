// One-off: send Alyssa the rescue-kit-welcome email so she can sign up
// and trigger link_purchases_on_signup against her pre-staged comp order.
//
// Idempotent via broadcast_sends.broadcast_id = 'rescue-kit-welcome-alyssa-comp'.

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

const TO = 'smithaly4579@gmail.com';
const NAME = 'Alyssa';
const BROADCAST_ID = 'rescue-kit-welcome-alyssa-comp';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);
const resend = new Resend(process.env.RESEND_API_KEY);

const { data: prior } = await supabase
  .from('broadcast_sends')
  .select('email')
  .eq('broadcast_id', BROADCAST_ID)
  .eq('email', TO);
if (prior && prior.length > 0) {
  console.log('Already sent — skipping.');
  process.exit(0);
}

const { rescueKitWelcomeEmail } = await import('../api/_emails/rescue-kit-welcome.js');
const { subject, html } = rescueKitWelcomeEmail(TO, NAME);

const { error } = await resend.emails.send({
  from: 'Healing Hearts <hello@healingheartscourse.com>',
  to: TO,
  replyTo: 'trishajamison@healingheartscourse.com',
  subject,
  html,
});
if (error) {
  console.error('Send failed:', error);
  process.exit(1);
}

await supabase.from('broadcast_sends').insert({
  broadcast_id: BROADCAST_ID,
  email: TO,
});

console.log(`Sent: ${subject} → ${TO}`);
