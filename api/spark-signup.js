/* global process */
// Vercel Serverless Function: POST /api/spark-signup
// Persists signup to Supabase, then sends welcome email via Resend.

import { Resend } from 'resend';
import { supabaseAdmin } from './_lib/supabase-admin.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body || {};

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    return res.status(400).json({ error: 'A valid email address is required.' });
  }

  const cleanEmail = email.trim().toLowerCase();

  // Step 1: Persist to Supabase BEFORE sending email
  try {
    const { error } = await supabaseAdmin
      .from('spark_signups')
      .upsert({ email: cleanEmail }, { onConflict: 'email', ignoreDuplicates: true });

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
      await resend.emails.send({
        from: 'Healing Hearts <hello@healingheartscourse.com>',
        to: cleanEmail,
        subject: "You're in! Your 7-Day Spark Challenge starts tomorrow",
        html: welcomeEmail(),
      });

      // Notify the team
      await resend.emails.send({
        from: 'Healing Hearts <noreply@healingheartscourse.com>',
        to: 'hello@healingheartscourse.com',
        subject: `New Spark Challenge signup: ${cleanEmail}`,
        text: `New signup for the 7-Day Spark Challenge!\n\nEmail: ${cleanEmail}\nTime: ${new Date().toISOString()}\n\nThis person will receive Day 1 tomorrow morning.`,
      });
    } catch (err) {
      console.error('[spark-signup] Email send failed:', err);
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

function welcomeEmail() {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to the Spark Challenge</title>
</head>
<body style="margin:0; padding:0; background-color:#faf9f6; font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#faf9f6;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <img src="https://healingheartscourse.com/logo.png" alt="Healing Hearts" width="48" height="48" style="display:block;">
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background-color:#ffffff; border-radius:16px; padding:48px 40px; box-shadow:0 4px 24px rgba(17,145,177,0.06);">

              <!-- Accent bar -->
              <div style="height:3px; background:linear-gradient(90deg, #1191B1, #B96A5F, #1191B1); border-radius:2px; margin-bottom:32px;"></div>

              <h1 style="margin:0 0 16px; font-size:28px; color:#2D2D2D; font-weight:400; font-style:italic; font-family:Georgia,'Times New Roman',serif;">
                Welcome to the Spark Challenge
              </h1>

              <p style="margin:0 0 24px; font-size:16px; line-height:1.7; color:#555555;">
                Hi there! I'm Trisha, and I'm so glad you're here.
              </p>

              <p style="margin:0 0 24px; font-size:16px; line-height:1.7; color:#555555;">
                Over the next seven days, you and your partner are going to reconnect in ways that might surprise you. These aren't big, dramatic gestures -- they're small, intentional moments that remind you both why you chose each other.
              </p>

              <p style="margin:0 0 24px; font-size:16px; line-height:1.7; color:#555555;">
                <strong>Day 1 arrives tomorrow morning.</strong> Each day you'll get a short lesson and one simple practice to do together. Some will make you laugh. Some might make you think. All of them work.
              </p>

              <p style="margin:0 0 32px; font-size:16px; line-height:1.7; color:#555555;">
                One thing I've learned from 20 years of coaching couples: change doesn't have to be hard. Sometimes it just starts with showing up -- and you already did that by signing up today.
              </p>

              <!-- CTA -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 32px;">
                <tr>
                  <td align="center" style="background-color:#1191B1; border-radius:50px; padding:14px 32px;">
                    <a href="https://healingheartscourse.com/spark-challenge" style="color:#ffffff; text-decoration:none; font-size:16px; font-weight:600; display:inline-block;">
                      Preview the Challenge
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <div style="height:1px; background-color:#e5e5e5; margin:24px 0;"></div>

              <!-- Warm sign-off -->
              <p style="margin:0 0 4px; font-size:16px; line-height:1.7; color:#555555;">
                Cheering for you both,
              </p>
              <p style="margin:0 0 4px; font-size:18px; color:#2D2D2D; font-style:italic; font-family:Georgia,'Times New Roman',serif;">
                Trisha Jamison
              </p>
              <p style="margin:0; font-size:13px; color:#a3a3a3;">
                Founder, Healing Hearts
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:32px 20px 0;">
              <p style="margin:0 0 8px; font-size:13px; color:#a3a3a3;">
                Healing Hearts &middot; healingheartscourse.com
              </p>
              <p style="margin:0; font-size:12px; color:#d4d4d4;">
                Every marriage has a story worth fighting for.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
