// Rescue Kit — Welcome email (Day 0, sent immediately after purchase)
// Triggered by: api/webhooks/stripe.js on checkout.session.completed
// Voice: Trisha Jamison. Tone: warm, celebratory, grounding.

import { Resend } from 'resend';
import {
  emailWrapper, heading, paragraph, callout, ctaButton, signOff, unsubscribeFooter,
} from './spark-shared.js';

const FROM_ADDRESS = 'Healing Hearts <hello@healingheartscourse.com>';

/**
 * Generate the rescue-kit welcome email content.
 *
 * @param {string} email - Recipient email
 * @param {string} [name] - Recipient first name (optional)
 * @returns {{ subject: string, html: string, text: string }}
 */
export function rescueKitWelcomeEmail(email, name) {
  const subject = 'Your Conflict Rescue Kit is ready';
  const previewText = 'You just made one of the most courageous decisions of your relationship.';
  const safeName = name || 'friend';

  const body = [
    heading(`${safeName}, you just did something brave`),
    paragraph(
      `Most people think about changing how they fight for months before they ever do anything. You did it. That tells me everything I need to know about who you are and how much your relationship means to you.`
    ),
    paragraph(
      `Your <strong>Conflict Rescue Kit</strong> is waiting in your portal right now. Inside, you will find the four frameworks we have seen change the most stuck couples — the SPARK Method, the Critter Brain vs. CEO Brain guide, Zones of Resilience, and the 90-Second Wave.`
    ),
    callout(
      `One thing I always tell people: the tools that actually stick are the ones you try within 48 hours of reading about them. Tonight, even if you are tired, pick up your kit and read through the SPARK Method. You do not have to use it tonight. Just let it land.`
    ),
    ctaButton('Access Your Conflict Rescue Kit', 'https://healingheartscourse.com/portal/downloads'),
    paragraph(
      `Day 1 starts tomorrow. I am going to check in with you in a few days — not to grade you, but because I genuinely want to know how it is going.`
    ),
    paragraph(
      `If you have a question before then, just reply to this email. It goes directly to me.`
    ),
    signOff('With so much hope for you,'),
    unsubscribeFooter(email, 'rescue-kit'),
  ].join('\n');

  const html = emailWrapper(body, previewText);

  const text = `${safeName}, you just did something brave.

Your Conflict Rescue Kit is ready at: https://healingheartscourse.com/portal/downloads

Inside: the SPARK Method, Critter Brain vs. CEO Brain, Zones of Resilience, and the 90-Second Wave.

Day 1 starts tomorrow. I will check in with you in a few days.

If you have questions, just reply to this email.

With so much hope for you,
Trisha Jamison
Founder, Healing Hearts

To unsubscribe, visit: https://healingheartscourse.com/api/unsubscribe`;

  return { subject, html, text };
}

/**
 * Send the rescue-kit welcome email via Resend.
 * Guards: returns { sent: false, reason } if RESEND_API_KEY is not set.
 *
 * @param {string} email - Recipient email
 * @param {string} [name] - Recipient first name
 * @returns {Promise<{ sent: boolean, id?: string, reason?: string }>}
 */
export async function sendRescueKitWelcome(email, name) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[rescue-kit-welcome] RESEND_API_KEY not configured — skipping email');
    return { sent: false, reason: 'resend-not-configured' };
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const emailData = rescueKitWelcomeEmail(email, name);

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
    console.error('[rescue-kit-welcome] Send failed:', err.message);
    return { sent: false, reason: err.message };
  }
}
