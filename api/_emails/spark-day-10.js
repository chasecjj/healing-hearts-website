// Day 10: The real reason your arguments last hours
import {
  emailWrapper, heading, paragraph, subheading,
  callout, numberedList, ctaButton, signOff,
} from './spark-shared.js';

export function dayEmail() {
  const subject = "The real reason your arguments last hours";
  const previewText = "An emotion lasts about 90 seconds. So why do your fights last all night?";

  const body = [
    heading("The Real Reason Your Arguments Last Hours"),
    paragraph("Here is something most people do not know: a single emotion &mdash; anger, hurt, fear &mdash; lasts about 90 seconds in your body. Ninety seconds. That is it. The neurochemical surge rises, peaks, and fades in under two minutes."),
    paragraph("So why do your arguments last for hours?"),
    paragraph("Because your brain has two operating systems, and the wrong one keeps taking the wheel."),
    subheading("Critter Brain vs. CEO Brain"),
    paragraph("Jeff and I teach a concept we call the Critter Brain and the CEO Brain. Your Critter Brain is the ancient, survival-driven part of you &mdash; the part that scans for threats, reacts in milliseconds, and cares about one thing: keeping you alive. It does not do nuance. It does not do empathy. It does fight, flight, freeze, and fawn."),
    paragraph("Your CEO Brain is the thoughtful, reflective part &mdash; the part that can see your partner's perspective, choose your words carefully, and remember that this person is not actually your enemy."),
    callout("Here is the problem: when your Critter Brain activates, it shuts your CEO Brain out of the room. And in most couples, when one person's Critter Brain fires, it triggers the other person's Critter Brain. Now you have two survival systems locked in combat &mdash; and neither person has access to the part of their brain that could actually resolve the conflict."),
    paragraph("That is why arguments last hours. It is not one emotion. It is a cascade of re-triggers &mdash; your Critter Brain firing, their Critter Brain firing back, over and over, each time resetting that 90-second clock."),
    subheading("Three Things to Try Tonight"),
    numberedList([
      "<strong>Name it out loud.</strong> When you feel the surge, say: \"My Critter Brain just activated.\" This sounds simple, but naming it engages your CEO Brain and gives your partner a signal that you are not attacking &mdash; you are overwhelmed.",
      "<strong>Take a 20-minute reset.</strong> When both Critter Brains are running, no amount of talking will help. Agree to pause for 20 minutes &mdash; not to avoid the conversation, but to let your nervous systems calm down so your CEO Brains can come back online.",
      "<strong>Return with curiosity.</strong> After the reset, start with a question instead of a statement. \"What were you feeling when that happened?\" is a CEO Brain move. \"You always do this\" is pure Critter.",
    ]),
    paragraph("These are not tricks. They are based on how your nervous system actually works. And when you understand the science behind your fights, everything starts to shift."),
    paragraph("This is exactly the kind of deep work we do in the Healing Hearts program &mdash; not just tips, but a real understanding of why your relationship works the way it does and how to change it at the root."),
    ctaButton('Learn More About the Full Program', 'https://healingheartscourse.com/apply'),
    signOff(
      "Try the 20-minute reset tonight. You might be surprised what happens when two CEO Brains finally get to sit down together.",
      "The question nobody asks &mdash; and the cost of not asking it.",
    ),
  ].join('\n');

  return { subject, html: emailWrapper(body, previewText) };
}
