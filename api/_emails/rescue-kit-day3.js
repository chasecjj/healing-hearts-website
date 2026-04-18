// [TRISHA_VOICE_REVIEW_PENDING] — voice-sensitive template; edits require Trisha sign-off
// Rescue Kit — Day 3 check-in email
// Triggered by: api/cron/spark-drip.js when current_day < 3 and 3+ days since purchased_at
// Voice: Trisha Jamison. Tone: warm, curious, non-judgmental.

import { Resend } from 'resend';
import {
  emailWrapper, heading, paragraph, callout, ctaButton, signOff, unsubscribeFooter,
} from './spark-shared.js';

const FROM_ADDRESS = 'Healing Hearts <hello@healingheartscourse.com>';

/**
 * Generate the rescue-kit Day 3 check-in email content.
 *
 * @param {string} email - Recipient email
 * @param {string} [name] - Recipient first name (optional)
 * @returns {{ subject: string, html: string, text: string }}
 */
export function rescueKitDay3Email(email, name) {
  const subject = 'How is it going? (checking in on day 3)';
  const previewText = 'No pressure. No grades. Just genuinely curious.';
  const safeName = name || 'friend';

  const body = [
    heading(`Three days in, ${safeName}`),
    paragraph(
      `I have been thinking about you. It has been a few days since you got your Conflict Rescue Kit, and I just wanted to check in.`
    ),
    paragraph(
      `Not to quiz you. Not to see how many frameworks you have memorized. Just to say: however far you have gotten is exactly where you are supposed to be.`
    ),
    paragraph(
      `Some people open everything in the first 48 hours and start using the SPARK Method the same day they read it. Some people sit with it for a week before touching it. Both are completely normal. The only thing that does not work is not starting at all — and you already started by buying it.`
    ),
    callout(
      `If you have not tried the SPARK Method yet, here is the smallest possible version: the next time a conversation starts to heat up, just pause. Take one breath before you respond. That is it. That pause is the "S" in SPARK — "See it." You do not have to do the whole method. Just see it.`
    ),
    paragraph(
      `And if you have already been using it? I would genuinely love to hear how it is going. Just hit reply and tell me. I read every response.`
    ),
    ctaButton('Go to Your Conflict Rescue Kit', 'https://healingheartscourse.com/portal/downloads'),
    signOff('Still cheering for you,'),
    unsubscribeFooter(email, ''),
  ].join('\n');

  const html = emailWrapper(body, previewText);

  const text = `Three days in, ${safeName}.

I have been thinking about you. Not to quiz you — just to check in.

However far you have gotten is exactly where you are supposed to be.

If you have not tried the SPARK Method yet: the next time a conversation starts to heat up, just pause. Take one breath before you respond. That is the "S" in SPARK — "See it."

Visit your kit: https://healingheartscourse.com/portal/downloads

Hit reply if you want to share how it is going. I read every response.

Still cheering for you,
Trisha Jamison
Founder, Healing Hearts

To unsubscribe, visit: https://healingheartscourse.com/api/unsubscribe`;

  return { subject, html, text };
}

/**
 * Send the rescue-kit Day 3 email via Resend.
 * Guards: returns { sent: false, reason } if RESEND_API_KEY is not set.
 *
 * @param {string} email - Recipient email
 * @param {string} [name] - Recipient first name
 * @returns {Promise<{ sent: boolean, id?: string, reason?: string }>}
 */
export async function sendRescueKitDay3(email, name) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[rescue-kit-day3] RESEND_API_KEY not configured — skipping email');
    return { sent: false, reason: 'resend-not-configured' };
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const emailData = rescueKitDay3Email(email, name);

  try {
    const result = await resend.emails.send({
      from: FROM_ADDRESS,
      to: email,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text,
    });
    return { sent: true, id: result.id };
  } catch (err) {
    console.error('[rescue-kit-day3] Send failed:', err.message);
    return { sent: false, reason: err.message };
  }
}
