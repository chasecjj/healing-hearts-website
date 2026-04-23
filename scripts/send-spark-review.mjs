// One-off: send the 7-Day Spark Challenge emails (welcome + days 1-7) to
// review recipients in order. Authenticates via RESEND_API_KEY from .env.local.
//
// Usage: node scripts/send-spark-review.mjs
//
// Recipients hardcoded by design — this is a content-review send for Trisha
// and Jeff, not a generic broadcast tool. Delete this file after use or keep
// for future reviewer sends.

import { readFileSync } from 'node:fs';
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

if (!process.env.RESEND_API_KEY) {
  console.error('RESEND_API_KEY missing from .env.local');
  process.exit(1);
}

// ── template imports ─────────────────────────────────────────────────────────
const { welcomeEmail } = await import('../api/_emails/spark-welcome.js');
const days = [];
for (let i = 1; i <= 7; i++) {
  const mod = await import(`../api/_emails/spark-day-${i}.js`);
  days.push({ day: i, render: mod.dayEmail });
}

// ── config ───────────────────────────────────────────────────────────────────
const FROM_ADDRESS = 'Healing Hearts <hello@healingheartscourse.com>';
const RECIPIENTS = [
  'trishajamison@healingheartscourse.com',
  'jeffjamison@healingheartscourse.com',
];

const resend = new Resend(process.env.RESEND_API_KEY);

// ── send sequence ────────────────────────────────────────────────────────────
const sequence = [
  { label: 'welcome', render: welcomeEmail },
  ...days.map(d => ({ label: `day-${d.day}`, render: d.render })),
];

const results = [];
for (const recipient of RECIPIENTS) {
  for (const step of sequence) {
    const { subject, html } = step.render(recipient);
    try {
      const { data, error } = await resend.emails.send({
        from: FROM_ADDRESS,
        to: recipient,
        subject,
        html,
      });
      if (error) {
        console.error(`✗ ${recipient} ${step.label}:`, error.message || error);
        results.push({ recipient, step: step.label, ok: false, error: error.message || String(error) });
      } else {
        console.log(`✓ ${recipient} ${step.label} → ${data?.id ?? 'sent'}`);
        results.push({ recipient, step: step.label, ok: true, id: data?.id });
      }
    } catch (err) {
      console.error(`✗ ${recipient} ${step.label} threw:`, err.message);
      results.push({ recipient, step: step.label, ok: false, error: err.message });
    }
    // Small gap to stay well under Resend's 2 req/sec default rate limit.
    await new Promise(r => setTimeout(r, 600));
  }
}

const sent = results.filter(r => r.ok).length;
const failed = results.filter(r => !r.ok).length;
console.log(`\nDone. Sent: ${sent}, Failed: ${failed}`);
if (failed > 0) process.exit(1);
