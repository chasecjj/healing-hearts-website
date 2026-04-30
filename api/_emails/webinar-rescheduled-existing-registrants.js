import { emailWrapper, escapeHtml, heading, paragraph, callout, divider, signOff, unsubscribeFooter } from './spark-shared.js';

/**
 * Courtesy email for the small handful of people who registered for the
 * April 30, 2026 webinar before it was rescheduled to May 21, 2026.
 *
 * Tone: Trisha, personal. They've already committed; this is apology + thank-you,
 * not a sales touch. The Conflict Rescue Kit gift below is granted unconditionally
 * for this list (NOT attendance-contingent like the broader Spark broadcast).
 *
 * @param {string} firstName - Registrant's first name (escaped before render).
 * @param {string} email     - Registrant email address (used for the footer).
 * @returns {{ subject: string, html: string }}
 */
export function webinarRescheduledExistingRegistrantEmail(firstName, email) {
  const safeName = escapeHtml(firstName || 'friend');

  const previewText =
    "A small change to our workshop date — and something extra to thank you for rolling with it.";

  const body = [
    heading(`A small change, ${safeName} — and a thank-you`),

    paragraph(
      `I want to start by saying I'm sorry. You raised your hand for our workshop on April 30, and we've had to move the date. The new evening is <strong>Thursday, May 21, 2026 at 7:00 PM Mountain Time</strong>, and your spot is reserved automatically — you don't have to do anything, no re-registration, no new link to track down. We'll send the join details closer to the night.`
    ),

    callout(
      `<strong>New date:</strong> Thursday, May 21, 2026<br>` +
      `<strong>Time:</strong> 7:00 PM Mountain Time<br>` +
      `<strong>Your spot:</strong> already saved`
    ),

    paragraph(
      `Because you committed before we knew the date had to move, I want to do something extra. In the next few days, we're granting you free access to our <strong>Conflict Rescue Kit</strong> ($39 value) — the in-the-moment toolkit Jeff and I built for couples in the middle of a hard conversation. I want to be really clear: this is yours either way. Not "if you show up." Not "if you watch the replay." Just a thank-you for trusting us with your time, even when our calendar got messy. You'll get a separate email when access is live.`
    ),

    paragraph(
      `When May 21 rolls around, here's what we'll be walking through together: the difference between your <em>Critter Brain</em> (the protective wiring that fires before you can think) and your <em>CEO Brain</em> (the part that wants to choose your response), the <em>90-Second Wave</em> that most couples never learn to ride, and the four moves of the <em>SPARK Method</em> that help you find your way back to each other when you've drifted. None of it is theory. It's the stuff Jeff and I actually use in our own marriage on the hard nights.`
    ),

    divider(),

    paragraph(
      `If you have any questions before May 21 — or just want to tell me what's going on in your relationship that brought you here — hit reply. This email reaches me. I read every one.`
    ),

    signOff('With real gratitude,'),
    unsubscribeFooter(email, 'webinar'),
  ].join('');

  return {
    subject: 'A small change — and a thank-you',
    html: emailWrapper(body, previewText),
  };
}
