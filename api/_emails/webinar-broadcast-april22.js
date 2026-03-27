// One-time broadcast: Live Q&A invite for Spark Challenge participants
// Sent April 22, 2026 to all active Spark Challenge subscribers
import {
  emailWrapper, heading, paragraph,
  callout, ctaButton, signOff,
} from './spark-shared.js';

export function broadcastEmail() {
  const subject = "Trisha is live tonight — bring your questions";
  const previewText = "A live Q&A just for Spark Challenge participants. Tonight at 7 PM MT.";

  const body = [
    heading("You Have Questions. Let\u2019s Talk."),
    paragraph("Hey there \u2014 I know you\u2019re right in the middle of the Spark Challenge, and if you\u2019re anything like most couples who reach this point, things are starting to stir. Maybe something clicked. Maybe something felt harder than you expected. Maybe you\u2019re not sure what to do with what you\u2019re noticing."),
    paragraph("That\u2019s exactly why I\u2019m going live tonight."),
    paragraph("I\u2019m hosting a <strong>live Q&amp;A session tonight, Tuesday, April 22 at 7:00 PM MT</strong> \u2014 and it\u2019s specifically for people like you who are working through the challenge and want to go a little deeper."),
    callout("This isn\u2019t a sales pitch or a scripted presentation. It\u2019s me, a cup of tea, and your real questions. If something from the challenge confused you, surprised you, or stirred up a conversation you weren\u2019t expecting \u2014 bring it."),
    paragraph("I\u2019ve been doing this work long enough to know that the most powerful breakthroughs happen when someone finally says the thing out loud. This is your space to do that."),
    paragraph("No prep required. No pressure. Just show up as you are."),
    ctaButton('Save Your Spot', 'https://healingheartscourse.com/webinar'),
    signOff(
      "I\u2019d love to see you there tonight. These conversations are honestly my favorite part of what I do.",
    ),
  ].join('\n');

  return { subject, html: emailWrapper(body, previewText) };
}
