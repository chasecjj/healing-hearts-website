// Day 5: The Gratitude Text
import {
  emailWrapper, dayBadge, heading, paragraph, subheading,
  callout, numberedList, bulletList, ctaButton, signOff,
} from './spark-shared.js';

export function dayEmail() {
  const subject = "What I almost forgot to say";
  const previewText = "He'd been handling dinner all week and I almost missed it.";

  const body = [
    dayBadge(5),
    heading('The Gratitude Text'),
    paragraph("Welcome to Day 5, beautiful hearts! How are you feeling after practicing 'The Pause Experiment' yesterday? I hope you're noticing those tiny moments where you can choose connection over reaction. It's a powerful shift, isn't it?"),
    paragraph("Today, we're going to lean into something that can instantly brighten your partner's day, and yours: The Gratitude Text."),
    paragraph("You know how sometimes we save our biggest 'thank yous' for grand gestures or special occasions? But the truth is, the everyday moments, the small, consistent acts of love and partnership, are the glue that holds everything together. And often, those are the things that go unsaid."),
    paragraph("I remember one particularly chaotic week. I was juggling client calls, school pickups, and trying to get a new module drafted. Jeff, without a word, just took over dinner every single night. He didn't ask for praise, he just did it. And honestly, by Thursday, I was so swamped, I almost just took it for granted. But then, it hit me: this wasn't just 'dinner.' This was him showing up, him seeing my overwhelm, him carrying the load."),
    callout("Instead of waiting until the weekend, or saying it vaguely at the end of the day, I just grabbed my phone during a quick break and sent him a text that said, 'I'm grateful you've been handling dinner all week. It's taken such a huge weight off my shoulders and I feel so supported.' And you know what? His response was immediate: 'Glad I could help. You're crushing it.' It was simple, but it created this beautiful little micro-moment of connection in the middle of a crazy day."),
    paragraph("That's the magic of today's challenge. We're not waiting for a big moment. We're finding an ordinary moment to express extraordinary gratitude."),
    subheading('Your Challenge for Today'),
    numberedList([
      "Look for the Everyday: Think about something your partner did recently, something they consistently do, or a quality they possess that you genuinely appreciate. Maybe they handled a chore you usually do. Maybe they offered a kind word or support. Maybe you admire their patience, humor, or work ethic. It doesn't have to be a grand gesture; the small things count most here!",
      'Craft Your Text: Start your text with "I\'m grateful you..." and then follow it with specific details about what you\'re grateful for and, if you like, how it makes you feel.',
      "Send it Mid-Day: The power of this challenge is in the unexpected nature. Send it when they're at work, running errands, or just in the middle of their day. It's a little \"hello, I see you\" that can totally shift their mood.",
    ]),
    paragraph('<strong>Examples:</strong>'),
    bulletList([
      '"I\'m grateful you always remember to take out the trash. It\'s a small thing, but it makes our home feel so much more peaceful."',
      '"Just thinking about how you handled that tricky situation at work this morning. I\'m grateful for your calm wisdom."',
      '"I\'m grateful you make me laugh so easily. My day is always better with you in it."',
      '"I\'m grateful you picked up the kids from school today. It really helped me focus on my deadline."',
    ]),
    paragraph("This isn't about getting a response or expecting anything back. It's a pure act of giving and acknowledging. The simple act of sending it, and knowing you've brightened their day, is the reward."),
    subheading('Reflection Questions'),
    bulletList([
      'What specific act or quality of your partner did you choose to express gratitude for?',
      'How did it feel to send that unexpected text, and what was your partner\'s reaction (if any)?',
    ]),
    ctaButton('View the Challenge', 'https://healingheartscourse.com/spark-challenge'),
    signOff(
      "Let's make today a day filled with unexpected sparks of appreciation! I can't wait to hear about the little smiles these texts create.",
      "Day 6: The Memory Lane Moment -- reconnecting with the story that started it all.",
    ),
  ].join('\n');

  return { subject, html: emailWrapper(body, previewText) };
}
