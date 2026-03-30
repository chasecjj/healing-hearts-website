// Webinar Reminder: Day Before
import {
  escapeHtml, emailWrapper, heading, paragraph,
  bulletList, callout, ctaButton, signOff, unsubscribeFooter,
} from './spark-shared.js';

export function reminderEmail(name, webinar, email) {
  const safeName = escapeHtml(name);
  const safeTitle = escapeHtml(webinar.title);

  const date = new Date(webinar.starts_at);
  const formatted = date.toLocaleString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
    hour: 'numeric', minute: '2-digit',
    timeZone: 'America/Denver', timeZoneName: 'short',
  });

  const subject = `Tomorrow: ${safeTitle}`;
  const previewText = `Your seat is saved for tomorrow &mdash; here is what to expect.`;

  const body = [
    heading(`Tomorrow Is the Day, ${safeName}`),
    paragraph(`Just a warm reminder &mdash; our live workshop, <strong>${safeTitle}</strong>, is happening tomorrow.`),
    paragraph(`<strong>When:</strong> ${escapeHtml(formatted)}`),
    paragraph(`Here is what you can expect to walk away with:`),
    bulletList([
      'How to recognize when your "Critter Brain" is running the conversation &mdash; and how to hand the keys back to your CEO Brain',
      'The 90-Second Wave technique that can change the way you respond to conflict starting tonight',
      'Why most couples get stuck in the same argument for years (and the pattern that keeps it looping)',
      'A practical framework you and your partner can use long after the workshop ends',
    ]),
    callout('If your partner is open to it, bring them along. This is the kind of experience that lands differently when you share it together.'),
    ctaButton('Get Ready', 'https://healingheartscourse.com/webinar/live'),
    paragraph('We will send you one more reminder with the join link right before we go live. For now, just mark your calendar and come with an open heart.'),
    signOff('We cannot wait to see you there.'),
    unsubscribeFooter(email, 'webinar'),
  ].join('\n');

  return { subject, html: emailWrapper(body, previewText) };
}
