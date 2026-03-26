/* global process */
// Vercel Serverless Function: POST /api/contact
// Receives contact form submissions and sends notification + confirmation emails via Resend.

import { Resend } from 'resend';
import { escapeHtml } from './_lib/escape-html.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, message, phone, interest } = req.body || {};

  // Validate required fields
  const errors = [];
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push('Name is required.');
  }
  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    errors.push('A valid email address is required.');
  }
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    errors.push('Message is required.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }

  // Sanitize inputs
  const sanitized = {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    message: message.trim(),
    phone: phone ? String(phone).trim() : null,
    interest: interest ? String(interest).trim() : null,
    receivedAt: new Date().toISOString(),
  };

  // Send emails via Resend
  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);

      // Notify the team
      await resend.emails.send({
        from: 'Healing Hearts <hello@healingheartscourse.com>',
        to: 'hello@healingheartscourse.com',
        replyTo: sanitized.email,
        subject: `New Contact: ${sanitized.name} — ${sanitized.interest || 'General'}`,
        html: teamNotificationEmail(sanitized),
      });

      // Send confirmation to the person who reached out
      await resend.emails.send({
        from: 'Healing Hearts <hello@healingheartscourse.com>',
        to: sanitized.email,
        subject: "We got your message — we'll be in touch soon",
        html: confirmationEmail(sanitized.name),
      });
    } catch (err) {
      console.error('[contact-form] Email send failed:', err);
      // Don't fail the request — the submission is still logged
    }
  } else {
    console.warn('[contact-form] RESEND_API_KEY not set — skipping email');
  }

  console.log('[contact-form] Submission received:', sanitized);

  return res.status(200).json({
    success: true,
    message: 'Your message has been received. We will be in touch within 24 hours.',
  });
}

function teamNotificationEmail({ name, email, phone, interest, message, receivedAt }) {
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safePhone = escapeHtml(phone);
  const safeInterest = escapeHtml(interest);
  const safeMessage = escapeHtml(message);
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Contact Form Submission</title>
</head>
<body style="margin:0; padding:0; background-color:#faf9f6; font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#faf9f6;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%;">
          <tr>
            <td style="background-color:#ffffff; border-radius:16px; padding:40px 36px; box-shadow:0 4px 24px rgba(17,145,177,0.06);">
              <div style="height:3px; background:linear-gradient(90deg, #1191B1, #B96A5F, #1191B1); border-radius:2px; margin-bottom:28px;"></div>

              <h1 style="margin:0 0 24px; font-size:22px; color:#2D2D2D; font-weight:600;">
                New Contact Form Submission
              </h1>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td style="padding:8px 0; font-size:14px; color:#a3a3a3; width:100px; vertical-align:top;">Name</td>
                  <td style="padding:8px 0; font-size:16px; color:#2D2D2D;">${safeName}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0; font-size:14px; color:#a3a3a3; vertical-align:top;">Email</td>
                  <td style="padding:8px 0; font-size:16px; color:#2D2D2D;"><a href="mailto:${safeEmail}" style="color:#1191B1; text-decoration:none;">${safeEmail}</a></td>
                </tr>
                <tr>
                  <td style="padding:8px 0; font-size:14px; color:#a3a3a3; vertical-align:top;">Phone</td>
                  <td style="padding:8px 0; font-size:16px; color:#2D2D2D;">${safePhone || 'Not provided'}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0; font-size:14px; color:#a3a3a3; vertical-align:top;">Interest</td>
                  <td style="padding:8px 0; font-size:16px; color:#2D2D2D;">${safeInterest || 'Not specified'}</td>
                </tr>
              </table>

              <div style="height:1px; background-color:#e5e5e5; margin:16px 0;"></div>

              <p style="margin:16px 0 8px; font-size:14px; color:#a3a3a3;">Message</p>
              <p style="margin:0; font-size:16px; line-height:1.7; color:#555555; white-space:pre-wrap;">${safeMessage}</p>

              <div style="height:1px; background-color:#e5e5e5; margin:24px 0 16px;"></div>

              <p style="margin:0; font-size:12px; color:#d4d4d4;">
                Received at ${receivedAt} via healingheartscourse.com contact form
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

function confirmationEmail(name) {
  const firstName = escapeHtml(name.split(' ')[0]) || 'there';
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>We got your message</title>
</head>
<body style="margin:0; padding:0; background-color:#faf9f6; font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#faf9f6;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <img src="https://healingheartscourse.com/favicon.svg" alt="Healing Hearts" width="48" height="48" style="display:block;">
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background-color:#ffffff; border-radius:16px; padding:48px 40px; box-shadow:0 4px 24px rgba(17,145,177,0.06);">
              <div style="height:3px; background:linear-gradient(90deg, #1191B1, #B96A5F, #1191B1); border-radius:2px; margin-bottom:32px;"></div>

              <h1 style="margin:0 0 16px; font-size:28px; color:#2D2D2D; font-weight:400; font-style:italic; font-family:Georgia,'Times New Roman',serif;">
                We got your message
              </h1>

              <p style="margin:0 0 24px; font-size:16px; line-height:1.7; color:#555555;">
                Hi ${firstName} — thank you for reaching out. It takes courage to take that first step, and we want you to know that your message matters to us.
              </p>

              <p style="margin:0 0 24px; font-size:16px; line-height:1.7; color:#555555;">
                Someone from our team will be in touch within 24 hours. In the meantime, if you'd like to explore a bit, our free 7-Day Spark Challenge is a great place to start.
              </p>

              <!-- CTA -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 32px;">
                <tr>
                  <td align="center" style="background-color:#1191B1; border-radius:50px; padding:14px 32px;">
                    <a href="https://healingheartscourse.com/spark-challenge" style="color:#ffffff; text-decoration:none; font-size:16px; font-weight:600; display:inline-block;">
                      Try the Spark Challenge
                    </a>
                  </td>
                </tr>
              </table>

              <div style="height:1px; background-color:#e5e5e5; margin:24px 0;"></div>

              <p style="margin:0 0 4px; font-size:16px; line-height:1.7; color:#555555;">
                Warmly,
              </p>
              <p style="margin:0 0 4px; font-size:18px; color:#2D2D2D; font-style:italic; font-family:Georgia,'Times New Roman',serif;">
                The Healing Hearts Team
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
