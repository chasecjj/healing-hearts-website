import { emailWrapper, escapeHtml, heading, paragraph, callout, ctaButton, divider, signOff, unsubscribeFooter } from './spark-shared.js';

/**
 * Format a TIMESTAMPTZ / ISO date string for display in Mountain Time.
 * Returns e.g. "Saturday, April 12, 2026 at 7:00 PM MDT"
 */
function formatMountainTime(isoString) {
  const date = new Date(isoString);
  return date.toLocaleString('en-US', {
    timeZone: 'America/Denver',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  });
}

/**
 * Build the webinar registration confirmation email.
 *
 * @param {string} name - Registrant's name (user-supplied, will be escaped)
 * @param {{ title: string, starts_at: string, duration_minutes: number }} webinar
 * @returns {{ subject: string, html: string }}
 */
export function webinarConfirmationEmail(name, webinar, email) {
  const safeName = escapeHtml(name);
  const safeTitle = escapeHtml(webinar.title);
  const formattedDate = formatMountainTime(webinar.starts_at);
  const duration = webinar.duration_minutes;

  const previewText = `You're registered for ${safeTitle} &mdash; we can't wait to see you there!`;

  const body = [
    heading(`You're In, ${safeName}!`),
    paragraph(
      `Thank you so much for registering! We are truly excited to have you join us for <strong>${safeTitle}</strong>.`
    ),
    callout(
      `<strong>When:</strong> ${formattedDate}<br><strong>Duration:</strong> ${duration} minutes`
    ),
    paragraph(
      `This is going to be a real, honest conversation about what it takes to rebuild connection in your marriage &mdash; no fluff, no sales pitch, just the stuff that actually works. Jeff and I have been in the trenches ourselves, and we are sharing what we have learned the hard way so you don't have to figure it out alone.`
    ),
    paragraph(
      `Mark your calendar and show up ready. Even if your partner can't make it, <em>you</em> being here matters more than you know.`
    ),
    ctaButton('View Webinar Details', 'https://healingheartscourse.com/webinar'),
    divider(),
    paragraph(
      `<strong>A quick tip:</strong> Add this event to your calendar right now so it does not slip away. Life gets busy &mdash; we get it. But this hour could change everything.`
    ),
    signOff('Cheering for you and your marriage,'),
    unsubscribeFooter(email, 'webinar'),
  ].join('');

  return {
    subject: `You're registered: ${safeTitle}`,
    html: emailWrapper(body, previewText),
  };
}
