import { supabaseAdmin } from './_lib/supabase-admin.js';
import { Resend } from 'resend';
import { applicationReceivedEmail } from './emails/application-received.js';
import { applicationTeamNotifyEmail } from './emails/application-team-notify.js';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TEAM_EMAIL = 'hello@healingheartscourse.com';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
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
    } = req.body;

    const errors = [];
    if (!name || !name.trim()) errors.push('Name is required');
    if (!email || !EMAIL_REGEX.test(email.trim())) errors.push('Valid email is required');
    if (!relationship_status) errors.push('Relationship status is required');
    if (!biggest_challenge || !biggest_challenge.trim()) errors.push('Please share your biggest challenge');

    if (errors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    const { data: sparkSignup } = await supabaseAdmin
      .from('spark_signups')
      .select('id')
      .eq('email', cleanEmail)
      .single();

    const applicationData = {
      name: cleanName,
      email: cleanEmail,
      phone: phone?.trim() || null,
      relationship_status,
      years_together: years_together?.trim() || null,
      relationship_rating: relationship_rating ? parseInt(relationship_rating, 10) : null,
      biggest_challenge: biggest_challenge.trim(),
      tried_before: tried_before?.trim() || null,
      partner_aware: partner_aware ?? null,
      partner_willing: partner_willing ?? null,
      ideal_outcome: ideal_outcome?.trim() || null,
      urgency: urgency || null,
      investment_readiness: investment_readiness || null,
      faith_role: faith_role?.trim() || null,
      how_heard: how_heard?.trim() || null,
      additional_notes: additional_notes?.trim() || null,
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
      const confirmEmail = applicationReceivedEmail(cleanName);
      resend.emails.send({
        from: 'Healing Hearts <hello@healingheartscourse.com>',
        to: cleanEmail,
        subject: confirmEmail.subject,
        html: confirmEmail.html,
      }).catch(err => console.error('Applicant email failed:', err));

      const teamEmail = applicationTeamNotifyEmail(applicationData);
      resend.emails.send({
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
