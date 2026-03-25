// Webinar Follow-Up 1: Same day — Replay + next step
import {
  escapeHtml, emailWrapper, heading, paragraph,
  callout, ctaButton, divider, signOff,
} from './spark-shared.js';

export function followupEmail(name, webinar) {
  const safeName = escapeHtml(name);
  const safeTitle = escapeHtml(webinar.title);
  const replayUrl = webinar.replay_url || 'https://healingheartscourse.com/webinar/replay';

  const subject = 'The replay is ready + what to do next';
  const previewText = 'Whether you were there live or not, we saved a seat for you.';

  const body = [
    heading(`Thank You, ${safeName}`),
    paragraph(`Whether you joined us live for <strong>${safeTitle}</strong> or life had other plans today -- we are glad you are here. The fact that you signed up tells us something about your heart.`),
    paragraph('If you missed it, or if you want to revisit a section that hit close to home, the full replay is ready for you:'),
    ctaButton('Watch the Replay', replayUrl),
    callout('Something Jeff often says: "Insight without action is just entertainment." If something resonated with you today -- a phrase, a framework, a moment of recognition -- that is worth paying attention to.'),
    paragraph('So here is a gentle question: what do you want to do with what you felt?'),
    paragraph('If you are curious about what the deeper work looks like -- the kind of sustained, guided transformation that turns a single workshop into lasting change -- we would love to tell you more.'),
    divider(),
    ctaButton('Apply to the Healing Hearts Program', 'https://healingheartscourse.com/apply'),
    paragraph('No commitment. No pressure. Just a chance to see if this is the right fit for where you are.'),
    signOff('Grateful you were part of this.'),
  ].join('\n');

  return { subject, html: emailWrapper(body, previewText) };
}
