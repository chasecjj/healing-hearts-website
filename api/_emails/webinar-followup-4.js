// Webinar Follow-Up 4: Day +5 — Warm urgency
import {
  escapeHtml, emailWrapper, heading, paragraph,
  callout, ctaButton, signOff,
} from './spark-shared.js';

export function followupEmail(name, webinar) {
  const safeName = escapeHtml(name);

  const subject = 'Applications close this week';
  const previewText = 'We keep our program intentionally small &mdash; and we have a few spots left.';

  const body = [
    heading('A Quick Update on Enrollment'),
    paragraph(`${safeName}, I wanted to let you know where things stand.`),
    paragraph('Applications for the next Healing Hearts cohort close at the end of this week. We keep our groups intentionally small &mdash; usually eight to ten couples &mdash; because the kind of work we do requires real attention. Not a lecture hall. Not a passive webinar. Actual, hands-on guidance with Jeff and our team walking alongside you.'),
    paragraph('That means space is limited, and it fills up. Not because of artificial scarcity &mdash; because we genuinely cannot support more couples than that and do it well.'),
    callout('We have room for a few more couples in this cohort. If you have been thinking about it, this is a good time to take the next step.'),
    paragraph('Here is what the application process looks like:'),
    paragraph('You fill out a short form &mdash; it takes about five minutes. We review it and reach out to schedule a brief conversation. That call is not a sales pitch. It is a chance for us to learn about your situation and for you to ask us anything. If it is a good fit, we will invite you to join. If it is not, we will tell you honestly and point you toward something that might be better.'),
    paragraph('That is it. No hidden steps. No high-pressure closing.'),
    ctaButton('Submit Your Application', 'https://healingheartscourse.com/apply'),
    paragraph('If the timing is not right, that is completely okay. We run new cohorts regularly, and you are always welcome to apply when you are ready. But if that quiet voice has been nudging you &mdash; this is worth listening to.'),
    signOff('We are here either way.'),
  ].join('\n');

  return { subject, html: emailWrapper(body, previewText) };
}
