// Webinar Follow-Up 3: Day +3 — Bonus teaching (Zones of Resilience)
import {
  escapeHtml, emailWrapper, heading, paragraph, subheading,
  callout, bulletList, ctaButton, divider, signOff,
} from './spark-shared.js';

export function followupEmail(name, webinar) {
  const safeName = escapeHtml(name);

  const subject = "The framework Jeff didn't have time to finish";
  const previewText = 'A gift from the workshop &mdash; the Zones of Resilience explained.';

  const body = [
    heading('The Framework Jeff Ran Out of Time For'),
    paragraph(`${safeName}, during the workshop Jeff mentioned something called the Zones of Resilience but did not have time to go deep. A few of you wrote in asking about it, so consider this a gift from the workshop &mdash; just for you.`),
    paragraph('This is one of the most practical tools we teach inside Healing Hearts, and once you see it, you will start noticing it everywhere in your relationship.'),
    subheading('The Four Zones'),
    paragraph('<strong style="color:#4ade80;">Green Zone &mdash; Connected and Calm</strong>'),
    paragraph('This is where you want to be. You feel safe. You can listen without defending. You can disagree without it feeling like a threat. Conversations are productive. Repair happens naturally.'),
    paragraph('<strong style="color:#facc15;">Yellow Zone &mdash; Activated but Aware</strong>'),
    paragraph('Your heart rate is rising. You notice tension in your chest or jaw. You can still think clearly, but you are starting to feel reactive. This is the critical moment &mdash; because what you do here determines everything.'),
    paragraph('<strong style="color:#f87171;">Red Zone &mdash; Flooded</strong>'),
    paragraph('Your Critter Brain has taken over. You are in fight-or-flight. Anything your partner says feels like an attack. You say things you do not mean. You slam doors, raise your voice, or go completely cold. Productive conversation is biologically impossible here &mdash; your prefrontal cortex has gone offline.'),
    paragraph('<strong style="color:#60a5fa;">Blue Zone &mdash; Shutdown</strong>'),
    paragraph('This is the freeze response. You go numb. You stonewall. You leave the room &mdash; not to cool down, but to disappear. Your partner feels abandoned. You feel nothing, which is its own kind of pain.'),
    divider(),
    subheading('Try This Tonight'),
    paragraph('Here is something you can practice right now, even without the full program:'),
    bulletList([
      '<strong>Name your zone.</strong> Next time you feel a conversation heating up, pause and silently ask yourself: "What zone am I in right now?"',
      '<strong>Catch the Yellow.</strong> Yellow is your window. If you can recognize it before you hit Red, you can choose a different response. Take a breath. Say "I need a minute" &mdash; not to escape, but to stay present.',
      '<strong>Share the language.</strong> Tell your partner about the zones. When you both have the same map, you can navigate together instead of against each other.',
    ]),
    callout('The SPARK Method builds on this foundation. Once you understand your zones, you can learn to co-regulate &mdash; to help each other come back to Green instead of pushing each other further into Red.'),
    paragraph('This is just one piece of what we cover inside Healing Hearts. If you want the full framework &mdash; with guided practice, live coaching, and the support of other couples doing the same work &mdash; we would love to have you.'),
    ctaButton('Apply to Healing Hearts', 'https://healingheartscourse.com/apply'),
    signOff('Use this tonight. See what happens.'),
  ].join('\n');

  return { subject, html: emailWrapper(body, previewText) };
}
