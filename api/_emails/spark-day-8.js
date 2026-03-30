// Day 8: The spark was just the beginning
import {
  emailWrapper, heading, paragraph,
  callout, signOff, unsubscribeFooter,
} from './spark-shared.js';

export function dayEmail(email) {
  const subject = "The spark was just the beginning";
  const previewText = "A 7-day challenge can light a match. It cannot rebuild a house.";

  const body = [
    heading("The Spark Was Just the Beginning"),
    paragraph("Hey there &mdash; congratulations. You just finished seven days of intentional connection. That is not a small thing. Most people never even try. You showed up, day after day, and that says something real about your heart."),
    paragraph("So let me be honest with you for a moment."),
    paragraph("A 7-day challenge can light a match. It cannot rebuild a house."),
    paragraph("The patterns running your relationship &mdash; the way you argue, the way you shut down, the way you avoid the hard conversations &mdash; those have been building for years. Sometimes decades. They did not form in a week, and they will not unravel in one either."),
    callout("The spark you felt this week? That is real. But it needs somewhere to go. Without deeper work, most couples feel that initial glow fade within a few weeks &mdash; and then they assume nothing can change."),
    paragraph("That is not true. Something can change. Something already did &mdash; you proved that this week."),
    paragraph("The question is: what comes next?"),
    paragraph("Over the next seven days, I want to share some things with you &mdash; stories, tools, and honest conversations about what it looks like to do the deeper work. No pressure. No sales countdown timers. Just the truth about what becomes possible when two people decide their marriage is worth fighting for."),
    signOff(
      "I am so glad you are here. Truly.",
      "A couple who was two weeks from filing &mdash; and what happened next.",
    ),
    unsubscribeFooter(email, 'spark'),
  ].join('\n');

  return { subject, html: emailWrapper(body, previewText) };
}
