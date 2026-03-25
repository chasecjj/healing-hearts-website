// Webinar Follow-Up 2: Day +1 — Transformation story
import {
  escapeHtml, emailWrapper, heading, paragraph, subheading,
  callout, ctaButton, signOff,
} from './spark-shared.js';

export function followupEmail(name, webinar) {
  const safeName = escapeHtml(name);

  const subject = 'What happened after they said yes';
  const previewText = 'They almost did not come. She had to convince him in the parking lot.';

  const body = [
    heading('What Happened After They Said Yes'),
    paragraph(`${safeName}, I want to tell you about a couple I will call Marcus and Eliana.`),
    paragraph('They signed up for a workshop a lot like the one you just attended. Eliana registered. Marcus agreed to come, but only because she asked three times. He sat in the back row with his arms crossed and spent the first twenty minutes checking his phone.'),
    paragraph('But somewhere around the halfway point, something shifted. Jeff was explaining how the Critter Brain works &mdash; how it hijacks a conversation and turns your partner into a threat instead of a teammate. Marcus put his phone down. He looked at Eliana for the first time all evening.'),
    callout('"That is exactly what I do," he said afterward in the car. "I shut down because it feels like I am being attacked. But she is not attacking me. She is trying to reach me."'),
    paragraph('That car ride conversation lasted two hours. They sat in their driveway and talked in a way they had not talked in years.'),
    subheading('The Decision'),
    paragraph('A week later, they applied to the Healing Hearts program. Not because the workshop fixed everything &mdash; it did not. But because it showed them what was possible. It gave them a shared language for the patterns they had been stuck in.'),
    paragraph('Over the next eight weeks, they learned to identify their Core Wounds &mdash; the deeper injuries underneath every surface-level argument. They practiced the 90-Second Wave when things got heated. They started having conversations that actually went somewhere instead of looping back to the same hurt.'),
    subheading('Six Months Later'),
    paragraph('Eliana told me something I will never forget:'),
    callout('"I used to dread coming home. Now I look forward to it. Not because everything is perfect &mdash; but because I finally feel like we are on the same team."'),
    paragraph('Marcus and Eliana are not extraordinary people. They are a regular couple who made one decision &mdash; to stop waiting for things to get better on their own and start doing the work together.'),
    paragraph('That decision is available to you too.'),
    ctaButton('See If Healing Hearts Is Right for You', 'https://healingheartscourse.com/apply'),
    signOff('Every story of transformation starts with a single step.'),
  ].join('\n');

  return { subject, html: emailWrapper(body, previewText) };
}
