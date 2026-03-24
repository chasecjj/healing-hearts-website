// Day 4: The Pause Experiment
import {
  emailWrapper, dayBadge, heading, paragraph, subheading,
  callout, numberedList, bulletList, ctaButton, signOff,
} from './spark-shared.js';

export function dayEmail() {
  const subject = "Ten seconds changed everything";
  const previewText = "The space between the trigger and your response.";

  const body = [
    dayBadge(4),
    heading('The Pause Experiment'),
    paragraph("Welcome back, beautiful souls, to Day 4 of our 7-Day Challenge! How was your 2-Minute Check-In yesterday? I hope you experienced the quiet power of simply listening, and being listened to. It's amazing what two minutes of presence can do for connection, isn't it?"),
    paragraph("Today, we're diving into a tool that I truly believe is a game-changer for navigating those tricky moments in any relationship: The Pause Experiment."),
    paragraph("You know that feeling, right? That little spark of annoyance, or frustration, or even defensiveness that just flares up. Maybe your partner says something that rubs you the wrong way, or they do that one thing that just pushes your buttons. And before you even realize it, you've reacted. You've snapped, you've withdrawn, or you've launched into a familiar argument that goes nowhere."),
    paragraph("I remember this happening with Jeff all the time, especially when our kids were little and life felt like pure chaos. He'd make a comment about the overflowing sink, and before I could even think, my Critter Brain would take over. It would scream, 'He's attacking me! He thinks I'm not doing enough!' And my mouth would just open and something sharp would come out. It was like I was hijacked, and the connection between us would just... fray."),
    callout("That's our primitive Critter Brain at work. It's designed to protect us, but in a relationship, it often leads to impulsive reactions, defensiveness, and that spiral we all dread. But what if, in that tiny sliver of a second, you could interrupt that automatic reaction? What if you could create just enough space for your more thoughtful, intentional CEO Brain to step in? That's what The Pause Experiment is all about."),
    paragraph("It's a simple, yet incredibly powerful way to choose your response, instead of just reacting."),
    subheading('Your Challenge for Today'),
    numberedList([
      'Identify the Trigger: Pay attention. That little knot in your stomach, that tightening in your jaw, that quickening of your breath. That\'s your signal. It could be a comment, an action, or even just an internal thought.',
      'Initiate the Pause -- and I mean a full 10 seconds! STOP: Physically, mentally, emotionally. Just freeze for a second. BREATHE: Take a slow, deep breath. Feel the air come in, feel it go out. NOTICE: What\'s happening in your body? No judgment, just observation. Is your heart racing? Shoulders up to your ears? DO NOT RESPOND IMMEDIATELY: Give yourself the full 10 seconds before you speak or act. Just let the impulse pass.',
      'Choose Your Response: After that 10-second pause, you might be amazed. The intensity often lessens. You might have a clearer idea of what you actually want to say. You might find a softer tone, or different words. Or you might simply be able to name your feeling -- "I\'m feeling a little frustrated right now" -- instead of making an accusation.',
    ]),
    paragraph("This isn't about ignoring the issue, or stuffing down your feelings. Not at all. It's about giving yourself the power to choose how you show up in that moment, rather than being swept away by an automatic, unhelpful reaction. It's about bringing your CEO Brain online to lead, instead of letting your Critter Brain run wild."),
    subheading('Reflection Questions'),
    bulletList([
      'What did you notice in your body during the 10-second pause?',
      'How did taking that pause impact your response and the outcome of the interaction?',
    ]),
    ctaButton('View the Challenge', 'https://healingheartscourse.com/spark-challenge'),
    signOff(
      "So today, embrace the power of the pause. It's a small shift that can prevent big arguments and create a much more peaceful, intentional connection. I can't wait to hear how this feels for you.",
      "Day 5: The Gratitude Text -- unexpected appreciation that shifts your whole day.",
    ),
  ].join('\n');

  return { subject, html: emailWrapper(body, previewText) };
}
