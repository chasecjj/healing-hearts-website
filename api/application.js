/* global process */
import { supabaseAdmin } from './_lib/supabase-admin.js';
import { Resend } from 'resend';
import { applicationReceivedEmail } from './_emails/application-received.js';
import { applicationTeamNotifyEmail } from './_emails/application-team-notify.js';
import { checkEmailRateLimit } from './_lib/rate-limit.js';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TEAM_EMAIL = 'hello@healingheartscourse.com';

function toTextChoice(val) {
  if (typeof val === 'string' && val.trim()) return val.trim();
  if (val === true) return 'Yes';
  if (val === false) return 'No';
  return null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      name, email, phone,
      relationship_status, years_together, relationship_rating,
      biggest_challenge, tried_before,
      partner_aware, partner_willing,
      ideal_outcome, urgency, investment_readiness,
      faith_role, how_heard, additional_notes,
    } = req.body || {};

    const errors = [];
    if (!name || typeof name !== 'string' || !name.trim()) errors.push('Name is required');
    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) errors.push('Valid email is required');
    if (!relationship_status || typeof relationship_status !== 'string') errors.push('Relationship status is required');
    if (!biggest_challenge || typeof biggest_challenge !== 'string' || !biggest_challenge.trim()) errors.push('Please share your biggest challenge');

    if (errors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    const rateCheck = await checkEmailRateLimit('applications', cleanEmail, 10);
    if (!rateCheck.allowed) {
      return res.status(429).json({
        error: 'You have already submitted an application recently. Please wait a few minutes before trying again.',
      });
    }

    const { data: existing } = await supabaseAdmin
      .from('applications')
      .select('id')
      .eq('email', cleanEmail)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .limit(1)
      .single();

    if (existing) {
      return res.status(200).json({ success: true, message: 'Application received!' });
    }

    const { data: sparkSignup } = await supabaseAdmin
      .from('spark_signups')
      .select('id')
      .eq('email', cleanEmail)
      .single();

    const applicationData = {
      name: cleanName,
      email: cleanEmail,
      phone: typeof phone === 'string' ? phone.trim() || null : null,
      relationship_status,
      years_together: typeof years_together === 'string' ? years_together.trim() || null : null,
      relationship_rating: relationship_rating ? parseInt(relationship_rating, 10) : null,
      biggest_challenge: biggest_challenge.trim(),
      tried_before: typeof tried_before === 'string' ? tried_before.trim() || null : null,
      partner_aware: toTextChoice(partner_aware),
      partner_willing: toTextChoice(partner_willing),
      ideal_outcome: typeof ideal_outcome === 'string' ? ideal_outcome.trim() || null : null,
      urgency: typeof urgency === 'string' ? urgency || null : null,
      investment_readiness: typeof investment_readiness === 'string' ? investment_readiness || null : null,
      faith_role: typeof faith_role === 'string' ? faith_role.trim() || null : null,
      how_heard: typeof how_heard === 'string' ? how_heard.trim() || null : null,
      additional_notes: typeof additional_notes === 'string' ? additional_notes.trim() || null : null,
      spark_signup_id: sparkSignup?.id || null,
      status: 'new',
    };

    const { error: dbError } = await supabaseAdmin
      .from('applications')
      .insert(applicationData);

    if (dbError) {
      console.error('DB insert error:', dbError);
      return res.status(500).json({ error: 'Failed to save application' });
    }

    if (resend) {
      const confirmEmail = applicationReceivedEmail(cleanName, cleanEmail);
      await resend.emails.send({
        from: 'Healing Hearts <hello@healingheartscourse.com>',
        to: cleanEmail,
        subject: confirmEmail.subject,
        html: confirmEmail.html,
      }).catch(err => console.error('Applicant email failed:', err));

      const teamEmail = applicationTeamNotifyEmail(applicationData);
      await resend.emails.send({
        from: 'Healing Hearts Applications <hello@healingheartscourse.com>',
        to: TEAM_EMAIL,
        subject: teamEmail.subject,
        html: teamEmail.html,
      }).catch(err => console.error('Team notification failed:', err));
    }

    return res.status(200).json({
      success: true,
      message: 'Application received. We will be in touch within 24-48 hours.',
    });
  } catch (err) {
    console.error('Application error:', err);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}
