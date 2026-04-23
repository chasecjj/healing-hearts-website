// One-time broadcast: Live workshop invite for Wednesday Apr 30, 7 PM MT
// Audience: spark_signups who did not register for Apr 23, OR webinar_registrations from Apr 23
// who missed that session. See send-broadcast.js TEMPLATES for registration key.
// [CHASE_REVIEW_PENDING] Confirm audience: spark_signups only, or also Apr 23 attendees?
import {
  emailWrapper, heading, paragraph, subheading,
  callout, bulletList, ctaButton, signOff, unsubscribeFooter,
} from './spark-shared.js';

export function broadcastEmail(email) {
  const subject = "One more chance -- live workshop Wednesday at 7 PM";
  const previewText = "If April 23 did not work, this is for you.";

  const body = [
    heading("A Second Chance to Come Together"),
    paragraph("Last week a lot of you told us you wanted to come to the workshop but Wednesday night just did not work. Life does that."),
    paragraph("So we are doing it again."),
    paragraph("<strong>Wednesday, April 30 at 7:00 PM Mountain Time -- another free live workshop with Jeff and Trisha.</strong> Same depth, same real teaching, same open Q&A. No recording sold afterward. Just one live hour where we show up for you."),
    callout("We teach for over an hour before we ever mention our program. If we cannot help you in sixty minutes, we have not earned the right to ask for more of your time."),
    subheading("What We Will Cover"),
    bulletList([
      "<strong>How the Critter Brain hijacks the conversation</strong> -- what is happening in your nervous system before you even know you are activated, and how to hand the keys back to your CEO Brain",
      "<strong>The 90-Second Wave</strong> -- the technique couples use to move through an activation instead of getting swept under by it",
      "<strong>The Zones of Resilience</strong> -- which zone you and your partner are operating from right now, and what that tells you about where to focus first",
      "<strong>The SPARK Method in practice</strong> -- the framework that turns awareness into a real skill your relationship can use every day",
      "<strong>Live Q&A with Jeff and Trisha</strong> -- bring the question you have been sitting with. Nothing is off limits.",
    ]),
    paragraph("This is for you whether you have been in the Spark Challenge, whether someone forwarded you this email, or whether you just know your marriage deserves more attention than it is getting right now."),
    paragraph("Wednesday, April 30 at 7:00 PM Mountain Time. Free. Live. No replay pressure."),
    ctaButton('Save Your Spot for Apr 30', 'https://healingheartscourse.com/webinar'),
    signOff(
      "We do not do this because it is easy to carve out a weeknight. We do it because we have seen what one honest hour can unlock in a marriage that felt stuck. We hope you will be there.",
    ),
    unsubscribeFooter(email, 'spark'),
  ].join('\n');

  return { subject, html: emailWrapper(body, previewText) };
}
