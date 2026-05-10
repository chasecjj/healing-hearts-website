// One-off: direct join-link email for the April 23 webinar.
//
// Backfills for this morning's broadcast where /webinar showed a "Coming Soon"
// state (webinar row wasn't seeded yet). Recipients have already been told the
// event is tonight at 7 PM MT — this email supplies the Meet link directly so
// they can join without needing to come back to the site.
import {
  emailWrapper, heading, paragraph, callout,
  ctaButton, signOff, unsubscribeFooter,
} from './spark-shared.js';

export function joinLinkEmail(email) {
  const subject = "Your Google Meet link for tonight's Q&A";
  const previewText = "Save this link — tonight at 7 PM MT, Trisha goes live.";

  const body = [
    heading("Here's Where to Join Tonight"),
    paragraph(
      "Quick one &mdash; we wanted to make sure you have the direct Google Meet link for tonight's live Q&amp;A so you can jump right in."
    ),
    callout(
      "<strong>When:</strong> Tonight, Thursday April 23 at 7:00 PM MT<br>" +
      "<strong>Where:</strong> Google Meet &mdash; click the button below<br>" +
      "<strong>How long:</strong> About an hour"
    ),
    ctaButton('Join on Google Meet', 'https://meet.google.com/cam-fqwt-jdn'),
    paragraph(
      "If the button doesn't work, copy and paste this link into your browser: " +
      "<a href=\"https://meet.google.com/cam-fqwt-jdn\" style=\"color:#1191B1;\">https://meet.google.com/cam-fqwt-jdn</a>"
    ),
    paragraph(
      "<strong>Phone-only option:</strong> (US) +1 405-825-1098, PIN 339 860 218#"
    ),
    paragraph(
      "A couple minutes before 7 PM MT, click the link, let Meet ask for camera/mic permission, and you'll be in. You can join with camera off if you'd rather just listen &mdash; no pressure."
    ),
    paragraph(
      "Bring your questions. The ones you're sitting with are exactly the ones other people are, too."
    ),
    signOff("See you tonight,"),
    unsubscribeFooter(email, 'spark'),
  ].join('\n');

  return { subject, html: emailWrapper(body, previewText) };
}
