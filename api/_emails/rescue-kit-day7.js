// Rescue Kit — Day 7 progress + upsell email
// Triggered by: api/cron/spark-drip.js when current_day < 7 and 7+ days since purchased_at
// Voice: Trisha Jamison. Tone: proud, inviting, honest about the deeper journey.

import { Resend } from 'resend';
import {
  emailWrapper, heading, paragraph, callout, ctaButton, divider, signOff, unsubscribeFooter,
} from './spark-shared.js';

const FROM_ADDRESS = 'Healing Hearts <hello@healingheartscourse.com>';

/**
 * Generate the rescue-kit Day 7 email content.
 * Includes a genuine upsell to the full Journey Program.
 *
 * @param {string} email - Recipient email
 * @param {string} [name] - Recipient first name (optional)
 * @returns {{ subject: string, html: string, text: string }}
 */
export function rescueKitDay7Email(email, name) {
  const subject = 'One week in — and what comes next';
  const previewText = 'You have had the Rescue Kit for a week. Here is what the couples who go deepest do next.';
  const safeName = name || 'friend';

  const body = [
    heading(`One week, ${safeName}`),
    paragraph(
      `It has been a week since you picked up the Conflict Rescue Kit. I hope you have had at least one moment this week where a conversation went differently than it would have before. Even a small one. Even an almost.`
    ),
    paragraph(
      `Those almosts matter. They are proof that something is shifting — even if the shift is small and imperfect and you had to try three times before it worked.`
    ),
    callout(
      `Here is what I have noticed after 20 years of working with couples: the ones who see the most change are not the ones who read the most or have the most resources. They are the ones who stay curious. Who keep showing up. Who ask "what just happened?" instead of walking away.`
    ),
    paragraph(
      `You are doing that. The fact that you are still here tells me that.`
    ),
    divider(),
    heading('What comes next, if you want it'),
    paragraph(
      `The Conflict Rescue Kit is first aid. It stops the bleeding. But if you want to understand <em>why</em> the same fight keeps happening — if you want to work on the attachment patterns underneath the arguments, the nervous system wiring that lights you up before you even know it is happening — that is what the full <strong>Healing Hearts Journey Program</strong> is for.`
    ),
    paragraph(
      `It is 8 modules. Jeff and I built it from everything we have learned in our own marriage and in two decades of working with couples. Your Rescue Kit content is included in it — so nothing you have done is lost.`
    ),
    paragraph(
      `I am not asking you to decide today. I am just saying: if you have been wondering what comes after first aid, that is the answer.`
    ),
    ctaButton('Learn About the Journey Program', 'https://healingheartscourse.com/journey'),
    divider(),
    paragraph(
      `Whatever you decide, I am glad you took this first step. Keep going. Your relationship is worth the work.`
    ),
    signOff('With all the hope in the world,'),
    unsubscribeFooter(email, ''),
  ].join('\n');

  const html = emailWrapper(body, previewText);

  const text = `One week, ${safeName}.

It has been a week since you picked up the Conflict Rescue Kit. I hope something shifted this week — even a small moment, even an almost.

Those almosts matter.

What comes next:

The Rescue Kit is first aid. If you want to understand why the same fight keeps happening — the attachment patterns, the nervous system wiring — that is what the full Healing Hearts Journey Program is for. 8 modules. Your Rescue Kit content is included.

Learn more: https://healingheartscourse.com/journey

Whatever you decide, keep going. Your relationship is worth the work.

With all the hope in the world,
Trisha Jamison
Founder, Healing Hearts

To unsubscribe, visit: https://healingheartscourse.com/api/unsubscribe`;

  return { subject, html, text };
}

/**
 * Send the rescue-kit Day 7 email via Resend.
 * Guards: returns { sent: false, reason } if RESEND_API_KEY is not set.
 *
 * @param {string} email - Recipient email
 * @param {string} [name] - Recipient first name
 * @returns {Promise<{ sent: boolean, id?: string, reason?: string }>}
 */
export async function sendRescueKitDay7(email, name) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[rescue-kit-day7] RESEND_API_KEY not configured — skipping email');
    return { sent: false, reason: 'resend-not-configured' };
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const emailData = rescueKitDay7Email(email, name);

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
    console.error('[rescue-kit-day7] Send failed:', err.message);
    return { sent: false, reason: err.message };
  }
}
