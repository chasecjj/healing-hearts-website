// One-time broadcast: Live Q&A invite for Spark Challenge participants
// Sent April 23, 2026 to all active Spark Challenge subscribers
// AVNII: Acknowledge → Validate → Normalize → Illuminate → Invite
import {
  emailWrapper, heading, paragraph,
  callout, ctaButton, signOff, unsubscribeFooter,
} from './spark-shared.js';

export function broadcastEmail(email) {
  const subject = "Trisha is live tonight \u2014 bring your questions";
  const previewText = "The questions you\u2019ve been sitting with deserve a real conversation.";

  const body = [
    heading("When a Spark Starts a Fire"),
    paragraph("Hey there \u2014 you\u2019ve been doing the work this week. Maybe the \u201cI Noticed\u201d text landed differently than you expected. Maybe the practice from Day 3 brought up something you weren\u2019t quite ready for."),
    paragraph("That\u2019s not a problem. That\u2019s the spark doing what it\u2019s supposed to do."),
    paragraph("Here\u2019s what I\u2019ve learned after 20 years of working with couples: the moment things start to stir is exactly the moment most people pull back. It makes sense \u2014 when your system starts feeling something new, the Critter Brain reads that as danger and hits the brakes."),
    paragraph("But what if you didn\u2019t have to figure out what to do with it alone?"),
    paragraph("I\u2019m hosting a <strong>live Q&amp;A tonight \u2014 Thursday, April 23 at 7:00 PM MT</strong> \u2014 and it\u2019s specifically for people like you who are in the middle of the challenge and want to go deeper."),
    callout("Other couples in the challenge are feeling exactly what you\u2019re feeling right now. This is your chance to ask the questions you\u2019ve been sitting with \u2014 and hear that you\u2019re not the only one asking them."),
    paragraph("No prep required. No pressure. Just show up as you are."),
    ctaButton('Save Your Spot', 'https://healingheartscourse.com/webinar'),
    paragraph("And if tonight doesn’t work — that’s okay. Save your spot anyway, and I’ll send the recording the next morning so you can sit with it when the timing is actually yours."),
    paragraph("<em>Or if the registration page gives you any trouble, you can slip in directly at <a href=\"https://meet.google.com/cam-fqwt-jdn\" style=\"color:#1191B1; text-decoration:underline;\">meet.google.com/cam-fqwt-jdn</a>.</em>"),
    signOff(
      "Some of the most meaningful next steps I\u2019ve seen couples take started with one honest question in a room like this. I\u2019d love to see you there tonight.",
    ),
    unsubscribeFooter(email, 'spark'),
  ].join('\n');

  return { subject, html: emailWrapper(body, previewText) };
}
