// Day 12: Free live workshop invite -- Wednesday Apr 23, 7 PM MT
// [CHASE_REVIEW_PENDING] Date is hardcoded Apr 23. Update if webinar #1 date shifts.
import {
  emailWrapper, heading, paragraph, subheading,
  callout, bulletList, ctaButton, signOff, unsubscribeFooter,
} from './spark-shared.js';

export function dayEmail(email) {
  const subject = "You've done the hard part -- now come hear the rest";
  const previewText = "11 days of real practice. A free live workshop is the next step.";

  const body = [
    heading("You Have Done Something Most Couples Never Do"),
    paragraph("Eleven days ago you signed up for a 7-day challenge. Most people stop somewhere in the middle. You didn't. You showed up for the 'I Noticed' text on Day 1. You practiced the 2-Minute Check-In. You sat with the cost of staying stuck on Day 11. That took courage, and I want you to know I do not take it lightly."),
    paragraph("Now I want to invite you somewhere."),
    paragraph("<strong>Jeff and I are hosting a free live workshop this Wednesday, April 23 at 7:00 PM Mountain Time.</strong> It is an hour-plus of real teaching before we ever mention our program. We believe that if we cannot help you in sixty minutes, we have not earned the right to ask for more of your time."),
    callout("This is not a pitch disguised as a workshop. We teach first. Every time."),
    subheading("Here Is What We Will Cover"),
    bulletList([
      "<strong>The nervous system patterns running your marriage</strong> -- why your Critter Brain reacts before your CEO Brain catches up, and how to interrupt the cycle using the 90-Second Wave",
      "<strong>The Zones of Resilience</strong> -- what your Zone tells you about why you and your partner keep getting stuck in the same place, and what to do the moment you notice it",
      "<strong>The one question that reveals the real issue</strong> -- most couples fight about the wrong thing for years. We will show you how to find what is actually underneath using the SPARK Method",
      "<strong>Live Q&A with Jeff and Trisha</strong> -- bring your real questions. Nothing is off limits.",
    ]),
    paragraph("What you have been practicing this month is the foundation. The workshop is where it starts to make sense as a whole picture."),
    paragraph("Seats are limited because we keep these small enough for real conversation. Wednesday, April 23 at 7:00 PM Mountain Time -- one hour, free, no pressure."),
    ctaButton('Save Your Spot', 'https://healingheartscourse.com/webinar'),
    signOff(
      "Come as you are. No prep required. Just bring the same heart you have been bringing to this challenge all month -- that is more than enough.",
      "What happened after they said yes -- a real story from a couple who almost didn't.",
    ),
    unsubscribeFooter(email, 'spark'),
  ].join('\n');

  return { subject, html: emailWrapper(body, previewText) };
}
