// Vercel Serverless Function: POST /api/spark-signup
// Persists signup to Supabase, then sends welcome email via Resend.

import { Resend } from 'resend';
import { supabaseAdmin } from './_lib/supabase-admin.js';
import { checkEmailRateLimit } from './_lib/rate-limit.js';
import { welcomeEmail as buildWelcomeEmail } from './_emails/spark-welcome.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, source, utm_source, utm_medium, utm_campaign, utm_content } = req.body || {};

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    return res.status(400).json({ error: 'A valid email address is required.' });
  }

  const cleanEmail = email.trim().toLowerCase();

  const rateCheck = await checkEmailRateLimit('spark_signups', cleanEmail, 5);
  if (!rateCheck.allowed) {
    return res.status(200).json({ success: true, message: "You're in!" });
  }

  // Step 1: Persist to Supabase BEFORE sending email
  try {
    const row = { email: cleanEmail };
    if (source) row.source = String(source).slice(0, 100);
    if (utm_source) row.utm_source = String(utm_source).slice(0, 100);
    if (utm_medium) row.utm_medium = String(utm_medium).slice(0, 100);
    if (utm_campaign) row.utm_campaign = String(utm_campaign).slice(0, 100);
    if (utm_content) row.utm_content = String(utm_content).slice(0, 100);

    const { error } = await supabaseAdmin
      .from('spark_signups')
      .upsert(row, { onConflict: 'email', ignoreDuplicates: true });

    if (error) {
      console.error('[spark-signup] Supabase insert failed:', error);
      return res.status(500).json({ error: 'Signup failed. Please try again.' });
    }
  } catch (err) {
    console.error('[spark-signup] Supabase error:', err);
    return res.status(500).json({ error: 'Signup failed. Please try again.' });
  }

  // Step 2: Send welcome email via Resend (non-blocking on failure)
  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const welcome = buildWelcomeEmail(cleanEmail);
      await resend.emails.send({
        from: 'Healing Hearts <hello@healingheartscourse.com>',
        to: cleanEmail,
        subject: welcome.subject,
        html: welcome.html,
      });

    } catch (err) {
      console.error('[spark-signup] Welcome email send failed for:', cleanEmail, 'template: welcome, error:', err?.message || err);
      // Don't fail the request — user is already in DB and will get drip emails
    }
  } else {
    console.warn('[spark-signup] RESEND_API_KEY not set — skipping email');
  }

  console.log('[spark-signup] New signup:', cleanEmail, new Date().toISOString());

  return res.status(200).json({
    success: true,
    message: "You're in! Check your inbox for a welcome message.",
  });
}

