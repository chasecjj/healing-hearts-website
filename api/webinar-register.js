// Vercel Serverless Function: POST /api/webinar-register
// Registers a user for the next upcoming webinar, sends confirmation + team notification.

import { Resend } from 'resend';
import { supabaseAdmin } from './_lib/supabase-admin.js';
import { webinarConfirmationEmail } from './_emails/webinar-confirmation.js';
import { checkEmailRateLimit } from './_lib/rate-limit.js';

function sanitizeSubject(str) {
  return String(str).replace(/[\r\n\0]/g, '');
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TEAM_EMAIL = 'hello@healingheartscourse.com';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email } = req.body || {};

    // --- Validation ---
    const errors = [];
    if (!name || typeof name !== 'string' || !name.trim()) errors.push('Name is required');
    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) errors.push('Valid email is required');

    if (errors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    const rateCheck = await checkEmailRateLimit('webinar_registrations', cleanEmail, 5);
    if (!rateCheck.allowed) {
      return res.status(200).json({ success: true, message: "You're registered!" });
    }

    // --- Find next scheduled or live webinar ---
    const { data: webinar, error: webinarError } = await supabaseAdmin
      .from('webinars')
      .select('id, title, starts_at, duration_minutes')
      .in('status', ['scheduled', 'live'])
      .or(`status.eq.live,starts_at.gte.${new Date().toISOString()}`)
      .order('starts_at', { ascending: true })
      .limit(1)
      .single();

    if (webinarError || !webinar) {
      console.error('[webinar-register] No upcoming webinar found:', webinarError);
      return res.status(404).json({
        error: 'No upcoming webinar is currently scheduled. Please check back soon!',
      });
    }

    // --- Cross-link: look up existing spark_signup and application ---
    const [sparkResult, appResult] = await Promise.all([
      supabaseAdmin.from('spark_signups').select('id').eq('email', cleanEmail).single(),
      supabaseAdmin.from('applications').select('id').eq('email', cleanEmail).order('created_at', { ascending: false }).limit(1).single(),
    ]);

    const sparkSignupId = sparkResult.data?.id || null;
    const applicationId = appResult.data?.id || null;

    // --- Upsert registration ---
    const { error: insertError } = await supabaseAdmin
      .from('webinar_registrations')
      .upsert(
        {
          webinar_id: webinar.id,
          email: cleanEmail,
          name: cleanName,
          spark_signup_id: sparkSignupId,
          application_id: applicationId,
        },
        { onConflict: 'email,webinar_id', ignoreDuplicates: true }
      );

    if (insertError) {
      console.error('[webinar-register] DB insert error:', insertError);
      return res.status(500).json({ error: 'Registration failed. Please try again.' });
    }

    // --- Increment registrant count (non-blocking) ---
    supabaseAdmin
      .rpc('increment_webinar_registrants', { webinar_row_id: webinar.id })
      .then(({ error }) => {
        if (error) console.error('[webinar-register] RPC increment failed:', error);
      })
      .catch((err) => console.error('[webinar-register] RPC error:', err));

    // --- Send confirmation email (non-blocking) ---
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);

      const confirmation = webinarConfirmationEmail(cleanName, webinar, cleanEmail);
      await resend.emails
        .send({
          from: 'Healing Hearts <hello@healingheartscourse.com>',
          to: cleanEmail,
          subject: confirmation.subject,
          html: confirmation.html,
        })
        .catch((err) => console.error('[webinar-register] Confirmation email failed:', err));

      // --- Team notification ---
      await resend.emails
        .send({
          from: 'Healing Hearts <hello@healingheartscourse.com>',
          to: TEAM_EMAIL,
          subject: sanitizeSubject(`New webinar registration: ${cleanName} (${cleanEmail})`),
          text: [
            `New webinar registration!`,
            ``,
            `Name: ${cleanName}`,
            `Email: ${cleanEmail}`,
            `Webinar: ${webinar.title}`,
            `Scheduled: ${webinar.starts_at}`,
            `Time: ${new Date().toISOString()}`,
            sparkSignupId ? `Spark Challenge: Yes (linked)` : `Spark Challenge: No`,
            applicationId ? `Application: Yes (linked)` : `Application: No`,
          ].join('\n'),
        })
        .catch((err) => console.error('[webinar-register] Team notification failed:', err));
    } else {
      console.warn('[webinar-register] RESEND_API_KEY not set -- skipping emails');
    }

    console.log('[webinar-register] New registration:', cleanEmail, webinar.title, new Date().toISOString());

    return res.status(200).json({
      success: true,
      message: "You're registered! Check your inbox for a confirmation with all the details.",
      webinar: {
        title: webinar.title,
        starts_at: webinar.starts_at,
      },
    });
  } catch (err) {
    console.error('[webinar-register] Unexpected error:', err);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}
