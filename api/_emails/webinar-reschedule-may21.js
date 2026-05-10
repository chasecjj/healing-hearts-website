// One-time broadcast: Reschedule notice for The Patterns Running Your Marriage
// Sent to all active Spark Challenge subscribers ahead of the May 21, 2026 workshop.
// Voice: Trisha. Routed through nurture-writer + trisha-storyteller in
// .claude/plugins/healing-hearts-marketing.
// AVNII: Acknowledge (new date) → Validate (your time is real) → Normalize
//        (life happens) → Illuminate (what we'll teach) → Invite (live = Kit).
import {
  emailWrapper, heading, paragraph,
  bulletList, callout, ctaButton, signOff, unsubscribeFooter,
} from './spark-shared.js';

export function broadcastEmail(email) {
  const subject = "Our workshop has a new date — May 21";
  const previewText = "A short, honest note — and a thank-you for showing up live with us.";

  const body = [
    heading("A New Date For Our Time Together"),
    paragraph("Hey there — a quick, honest note before anything else. The live workshop I invited you to has moved. Our new date is <strong>Thursday, May 21, 2026 at 7:00 PM MT</strong>, and I wanted to tell you myself instead of letting it land as a surprise."),
    paragraph("I know your evenings aren’t free real estate. You said yes once, and now I’m asking you to say yes again. That’s not nothing, and I don’t want to pretend it is."),
    paragraph("Here’s what hasn’t changed: the workshop itself. Same title — <strong>The Patterns Running Your Marriage</strong> — same heart behind it, same hour of real teaching before we ever mention what comes next."),
    paragraph("Here’s what we’ll walk through together that night:"),
    bulletList([
      'How to recognize when your <strong>Critter Brain</strong> is running the conversation — and how to hand the keys back to your <strong>CEO Brain</strong>',
      'The <strong>90-Second Wave</strong> — why the actual emotion is done in about ninety seconds, and what you’re fueling after that',
      'Why most couples get stuck in the same argument for years (and the pattern that keeps it looping)',
      'The <strong>SPARK Method</strong> — a repair tool you and your partner can use long after the workshop ends',
    ]),
    callout("As a thank-you for rolling with the new date: anyone who registers and joins us live on May 21 will receive the <strong>Conflict Rescue Kit</strong> (normally $39) — free. We’ll send your access within 24 hours of the workshop. The Kit is reserved for the people who carve out the evening and show up live, so we can honor the time you gave us."),
    paragraph("If your partner is open to it, bring them along. This is the kind of conversation that lands differently when you share it together — and if they’re not, that’s okay too. A lot of the most meaningful changes in a marriage start with one person deciding to show up differently."),
    ctaButton('Save Your Spot', 'https://healingheartscourse.com/webinar'),
    paragraph("Thank you for your patience with the change. I’m looking forward to that Thursday evening with you."),
    signOff(
      "This makes sense — schedules shift, life happens, and the work is still here whenever you’re ready for it. I’d love to see you on the 21st.",
    ),
    unsubscribeFooter(email, 'spark'),
  ].join('\n');

  return { subject, html: emailWrapper(body, previewText) };
}
