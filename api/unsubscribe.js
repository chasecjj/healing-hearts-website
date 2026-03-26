/* global process */
import { supabaseAdmin } from './_lib/supabase-admin.js';
import crypto from 'crypto';

const UNSUB_SECRET = process.env.CRON_SECRET || 'healing-hearts-unsub';

function signEmail(email, list) {
  return crypto.createHmac('sha256', UNSUB_SECRET).update(`${email}:${list}`).digest('hex').slice(0, 16);
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const email = (req.query.email || '').trim().toLowerCase();
  const list = req.query.list || '';

  if (!email) {
    return res.status(400).send(unsubscribePage('Missing email address.', false));
  }

  const VALID_LISTS = ['spark', 'webinar', ''];
  if (!VALID_LISTS.includes(list)) {
    return res.status(400).send(unsubscribePage('Invalid unsubscribe link.', false));
  }

  const sig = req.query.sig || '';
  const expectedSig = signEmail(email, list);

  if (sig !== expectedSig) {
    return res.status(403).send(unsubscribePage('Invalid unsubscribe link. Please use the link from your email.', false));
  }

  try {
    const tables = [];
    if (list === 'spark' || !list) tables.push('spark_signups');
    if (list === 'webinar' || !list) tables.push('webinar_registrations');

    for (const table of tables) {
      await supabaseAdmin
        .from(table)
        .update({ unsubscribed: true })
        .eq('email', email);
    }

    console.log(`[unsubscribe] ${email} unsubscribed from: ${tables.join(', ')}`);
    return res.status(200).send(unsubscribePage('You have been unsubscribed.', true));
  } catch (err) {
    console.error('[unsubscribe] Error:', err);
    return res.status(500).send(unsubscribePage('Something went wrong. Please email hello@healingheartscourse.com to unsubscribe.', false));
  }
}

function unsubscribePage(message, success) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Unsubscribe - Healing Hearts</title>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background: #faf9f6; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
    .card { background: #fff; border-radius: 16px; padding: 48px 40px; max-width: 480px; text-align: center; box-shadow: 0 4px 24px rgba(17,145,177,0.06); }
    h1 { color: #2D2D2D; font-size: 24px; margin: 0 0 16px; }
    p { color: #555; font-size: 16px; line-height: 1.7; margin: 0 0 24px; }
    a { color: #1191B1; text-decoration: none; }
    .bar { height: 3px; background: linear-gradient(90deg, #1191B1, #B96A5F, #1191B1); border-radius: 2px; margin-bottom: 28px; }
    .icon { font-size: 48px; margin-bottom: 16px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="bar"></div>
    <div class="icon">${success ? '&#10003;' : '&#9888;'}</div>
    <h1>${success ? 'Unsubscribed' : 'Oops'}</h1>
    <p>${message}</p>
    ${success ? '<p>We respect your choice. If you ever want to reconnect, we will be here.</p>' : ''}
    <a href="https://healingheartscourse.com">Return to Healing Hearts</a>
  </div>
</body>
</html>`;
}
