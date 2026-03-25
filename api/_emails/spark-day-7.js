// Day 7: The Spark Conversation
import {
  emailWrapper, dayBadge, heading, paragraph, subheading,
  callout, numberedList, bulletList, ctaButton, signOff,
} from './spark-shared.js';

export function dayEmail() {
  const subject = "One question, fifteen minutes";
  const previewText = "The prompt that changed how we showed up for each other.";

  const body = [
    dayBadge(7),
    heading('The Spark Conversation'),
    paragraph("Welcome, welcome, beautiful hearts, to our final day of the 7-Day Challenge! Can you believe we've made it to Day 7? How did your 'Memory Lane Moment' feel yesterday? I hope you loved revisiting those beautiful beginnings and remembering the deep roots of your connection. It's such a powerful way to bring warmth back into the present, isn't it?"),
    paragraph("Today, we're bringing it all together with a challenge that I believe is one of the most direct and loving ways to keep your connection vibrant: 'The Spark Conversation.'"),
    paragraph("Throughout this challenge, we've focused on small, intentional acts &mdash; noticing, listening, pausing, appreciating, remembering. These are all incredible ways to nurture your relationship. But sometimes, even with the best intentions, we can still be guessing. We think we know what our partner needs, or what would make them feel loved, but we don't always ask directly."),
    paragraph("I remember early in our marriage, Jeff and I would often try to 'mind read' each other. I'd leave him little notes, thinking that was his love language, and he'd try to fix all my problems, thinking that was what I wanted. We were both trying, so hard, but sometimes we were missing the mark because we hadn't actually asked the question."),
    callout("Then, during a coaching retreat, we were given this simple prompt: 'What's one thing your partner could do this week that would make you feel loved?' And it was revolutionary! I remember Jeff saying, 'Honestly, if you just asked me about my day and really listened, without trying to solve anything, that would mean the world.' And for me, I shared, 'If you could just take the initiative on one dinner this week, even ordering takeout, it would make me feel so cared for.' It was so simple, so clear, and so immediately actionable. No guessing, no mind-reading, just pure, loving clarity."),
    paragraph("And when we started doing those small, requested things for each other, it wasn't just about the act itself. It was about the feeling of being truly seen, truly heard, and truly understood. It created this incredible ripple effect of warmth and connection."),
    paragraph("That's the magic of today's challenge. We're not waiting for grand gestures. We're getting crystal clear on the small, specific actions that truly fill each other's love tanks."),
    subheading('Your Challenge for Today'),
    numberedList([
      'Ask the Question: Find a dedicated 15 minutes with your partner today &mdash; turn off distractions, silence phones, and give each other your full presence. Take turns asking each other: "What\'s one small thing I could do this week that would make you feel loved?"',
      'Listen Deeply (No Interruptions!): When your partner shares their "one thing," listen with an open heart and mind. Do not interrupt, explain, defend, or problem-solve. Your only job is to hear and understand their request. It should be a small, specific, and actionable request &mdash; not "be more affectionate" but "give me a hug when I get home." Not "help more" but "take out the trash on Tuesdays."',
      'Write it Down: Each of you should write down your partner\'s request. This isn\'t just for memory; it\'s a symbolic commitment to honor their need.',
      'Commit to Action: You each now have one clear, loving action to take for your partner this week. Commit to fulfilling your partner\'s request within the next seven days. This is your tangible act of love.',
    ]),
    paragraph("This isn't about solving all your problems. It's about a clear, tangible way to show up for each other, to speak each other's love language directly, and to create a fresh spark of intentional connection."),
    subheading('Reflection Questions'),
    bulletList([
      "What was your partner's \"one thing,\" and how did it feel to hear their specific request?",
      "What was your \"one thing,\" and what feelings did you have in asking for it?",
    ]),
    ctaButton('View the Challenge', 'https://healingheartscourse.com/spark-challenge'),
    signOff(
      "You've completed this challenge, and I am so incredibly proud of you both for showing up for your relationship this week. Remember, these aren't just 7 days; they're 7 tools, 7 habits you can carry forward. Keep sparking those connections, beautiful hearts. I'm cheering you on every single step of the way!",
    ),
    paragraph('<strong>You did it!</strong> You\'ve completed the 7-Day Spark Challenge. These 7 tools are yours to keep &mdash; use them anytime your connection needs a little boost.'),
    callout("If you're ready to go deeper, our full Healing Hearts program takes these foundations and builds something extraordinary. No pressure &mdash; just an invitation when you're ready."),
    ctaButton('Explore the Full Program', 'https://healingheartscourse.com/programs'),
  ].join('\n');

  return { subject, html: emailWrapper(body, previewText) };
}
