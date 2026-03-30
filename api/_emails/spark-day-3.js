// Day 3: The 2-Minute Check-In
import {
  emailWrapper, dayBadge, heading, paragraph, subheading,
  callout, numberedList, bulletList, ctaButton, signOff, unsubscribeFooter,
} from './spark-shared.js';

export function dayEmail(email) {
  const subject = "What if you just listened?";
  const previewText = "Two minutes. No fixing. Just presence.";

  const body = [
    dayBadge(3),
    heading('The 2-Minute Check-In'),
    paragraph("Welcome back, beautiful people, to Day 3 of our 'Small Sparks, Big Shifts' challenge! How did those specific compliments land yesterday? I hope you felt that little flutter of connection, both in giving and receiving. It's amazing what happens when we truly see each other."),
    paragraph("Today, we're going to build on that by creating a tiny, sacred space in your day for pure connection, without any pressure to do anything. We're calling it The 2-Minute Check-In."),
    paragraph("Now, if you're like most couples I talk to, you probably catch up at the end of the day. You might ask, 'How was your day?' and get a 'Fine,' or 'Busy,' and then you're off to the next thing. Or, if you do get into a deeper conversation, it can quickly turn into problem-solving, right? One person shares a challenge, and the other immediately jumps in with solutions, trying to fix it. We mean well, but sometimes, what our partner really needs isn't a solution; it's just to be heard."),
    paragraph("I remember when I first started practicing this with Jeff. I'd come home buzzing with ideas, or sometimes just exhausted from a tough coaching session. And bless his heart, Jeff, being the brilliant problem-solver he is, would immediately start strategizing with me, or trying to find a logical way through whatever I was feeling. And I'd just think, 'Oh, I just want you to listen!' It took us a while to figure out that sometimes, the greatest gift we can give each other is simply our undivided, quiet presence."),
    callout("That's what the 2-Minute Check-In is all about. Tonight, before bed, or whenever you both have a quiet moment, I want you to ask your partner just one question: 'What was the best part of your day?' And here's the crucial part: Just listen. For two minutes. Set a timer if you need to. Your job is not to fix, not to advise, not to interrupt. It's simply to be a loving, open ear."),
    paragraph("You might be surprised at what you learn, and how deeply connected you feel just by offering that simple gift of presence. This isn't about solving world problems; it's about staying connected in the small moments. It's about building a bridge of understanding, one quiet conversation at a time."),
    subheading('Your Challenge for Today'),
    numberedList([
      "Set the Stage: Find a calm moment when you both can sit together, free from distractions (phones away!).",
      "Ask the Question: One of you asks: \"What was the best part of your day?\" (Optional: If \"best part\" feels too big, you can also try \"What was one small good thing that happened today?\")",
      "The Listener's Role (Crucial!): Just Listen &mdash; your only job is to listen intently. No Fixing &mdash; resist the urge to offer advice, solutions, or problem-solve. No Interrupting &mdash; let your partner speak for the full two minutes, or until they naturally finish. Be Present &mdash; offer eye contact, a nod, or a gentle touch to show you're engaged, but keep your words to a minimum.",
      "Switch Roles: After the first person has shared and been listened to, switch roles. The other person asks: \"What was the best part of your day?\" and receives the same gift of listening.",
    ]),
    paragraph("<strong>Remember the Golden Rule:</strong> This isn't a therapy session or a complaint forum. It's a brief, positive connection point. The focus is on sharing a \"best part\" (even a small one!) and simply being heard."),
    subheading('Reflection Questions'),
    bulletList([
      'How did it feel to be listened to without interruption or advice?',
      'How did it feel to offer that kind of pure listening to your partner?',
    ]),
    ctaButton('View the Challenge', 'https://healingheartscourse.com/spark-challenge'),
    signOff(
      "This simple, consistent practice can transform your daily connection. You've got this. I can't wait to hear about the peace you find in these two minutes.",
      'Day 4: The Pause Experiment &mdash; introducing the 10-second pause that changes everything.',
    ),
    unsubscribeFooter(email, 'spark'),
  ].join('\n');

  return { subject, html: emailWrapper(body, previewText) };
}
