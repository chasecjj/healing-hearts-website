// Day 12: Jeff and Trisha are going live (Thursday, May 21, 2026 at 7:00 PM MT)
import {
  emailWrapper, heading, paragraph,
  callout, bulletList, ctaButton, signOff, unsubscribeFooter,
} from './spark-shared.js';

export function dayEmail(email) {
  const subject = "Jeff and Trisha are going live Thursday, May 21";
  const previewText = "A live workshop on Thursday, May 21 — the nervous system patterns running your marriage.";

  const body = [
    heading("Jeff and Trisha Are Going Live"),
    paragraph("We are hosting a live workshop on <strong>Thursday, May 21, 2026 at 7:00 PM MT</strong>, and we would love for you to be there."),
    paragraph("This is not a quick webinar with ten minutes of content and forty minutes of selling. Jeff and I teach for over an hour before we ever mention our program. We believe that if we cannot help you in sixty minutes, we have not earned the right to ask for more of your time."),
    paragraph("Here is what we will cover:"),
    bulletList([
      "<strong>The nervous system patterns running your marriage</strong> &mdash; why your body reacts before your brain catches up, and how to interrupt the cycle",
      "<strong>The one question that reveals the real issue</strong> &mdash; most couples fight about the wrong thing for years. We will show you how to find what is actually underneath.",
      "<strong>What 8 months of deep work looks like</strong> &mdash; a transparent walkthrough of the Healing Hearts journey, from the first module to the transformation on the other side",
      "<strong>Live Q&A with Jeff and Trisha</strong> &mdash; bring your real questions. Nothing is off limits.",
    ]),
    callout("\"This is not a pitch disguised as a workshop. We teach for over an hour before we ever mention our program.\" &mdash; Trisha"),
    paragraph("Whether you are on the fence about getting help, curious about what the Healing Hearts program actually involves, or just want to learn something new about how your relationship works &mdash; this workshop is for you."),
    paragraph("Seats are limited because we keep these small enough for real conversation."),
    ctaButton('Save Your Spot', 'https://healingheartscourse.com/webinar'),
    signOff(
      "We would love to see you there. Come as you are &mdash; no prep required, no pressure to do anything but learn.",
    ),
    unsubscribeFooter(email, 'spark'),
  ].join('\n');

  return { subject, html: emailWrapper(body, previewText) };
}
