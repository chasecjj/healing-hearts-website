// Webinar Reminder: Day Of (2 hours before)
import {
  escapeHtml, emailWrapper, heading, paragraph,
  ctaButton, signOff,
} from './spark-shared.js';

export function reminderEmail(name, webinar) {
  const safeName = escapeHtml(name);
  const safeTitle = escapeHtml(webinar.title);

  const date = new Date(webinar.starts_at);
  const formatted = date.toLocaleString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
    hour: 'numeric', minute: '2-digit',
    timeZone: 'America/Denver', timeZoneName: 'short',
  });

  const subject = `Starting in 2 hours: ${safeTitle}`;
  const previewText = `We are going live soon -- click below to join when it is time.`;

  const body = [
    heading(`We Are Almost Live, ${safeName}`),
    paragraph(`<strong>${safeTitle}</strong> starts in about two hours -- <strong>${escapeHtml(formatted)}</strong>.`),
    paragraph('Find a comfortable spot, grab something warm to drink, and click below to join when it is time. If your partner is with you, even better.'),
    ctaButton('Join the Workshop', webinar.riverside_audience_url),
    paragraph(`If the button above does not work, you can also join from our <a href="https://healingheartscourse.com/webinar/live" style="color:#1191B1; text-decoration:underline;">webinar page</a>.`),
    paragraph('We will be there right when it starts. See you soon.'),
    signOff('Here we go.'),
  ].join('\n');

  return { subject, html: emailWrapper(body, previewText) };
}
