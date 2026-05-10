// One-off: "we're live right now" last-call email for the April 23 webinar.
// Sent at ~7:15 PM MT (event started at 7:00) to catch anyone who lost track.
// Copy leans on AVNII — acknowledge busyness, normalize showing up mid-way,
// lean on the Meet link + recording promise so the ask feels low-stakes.
import {
  emailWrapper, heading, paragraph, callout,
  ctaButton, signOff, unsubscribeFooter,
} from './spark-shared.js';

export function liveNowEmail(email) {
  const subject = "We're live right now — hop in for even a few minutes";
  const previewText = "The Q&A is happening. Pop in when you can — the recording goes to everyone.";

  const body = [
    heading("We Know Life Gets Busy"),
    paragraph(
      "Just a quick one &mdash; Trisha is live right now. If your evening ran away from you (it happens to us too), here's a soft landing:"
    ),
    callout(
      "<strong>Hop on for even a few minutes.</strong> You don't have to catch the whole thing. Drop in, get one nugget you can use tonight, leave whenever you need to. Camera optional, no one's keeping score."
    ),
    ctaButton('Join on Google Meet', 'https://meet.google.com/cam-fqwt-jdn'),
    paragraph(
      "<strong>Can't make it at all?</strong> That's okay too. We're recording the full session, and the replay will land in your inbox in the next day or two so you don't miss anything."
    ),
    paragraph(
      "If the button above doesn't work, the Meet link is: " +
      "<a href=\"https://meet.google.com/cam-fqwt-jdn\" style=\"color:#1191B1;\">https://meet.google.com/cam-fqwt-jdn</a>"
    ),
    paragraph(
      "Phone-only option: (US) +1 405-825-1098, PIN 339 860 218#"
    ),
    signOff("Hoping to see you in there,"),
    unsubscribeFooter(email, 'spark'),
  ].join('\n');

  return { subject, html: emailWrapper(body, previewText) };
}
