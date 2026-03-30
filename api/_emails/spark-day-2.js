// Day 2: The Specific Spark Compliment
import {
  emailWrapper, dayBadge, heading, paragraph, subheading,
  callout, numberedList, bulletList, ctaButton, signOff, unsubscribeFooter,
} from './spark-shared.js';

export function dayEmail(email) {
  const subject = 'Beyond "you look nice"';
  const previewText = "The compliment that landed differently than all the others.";

  const body = [
    dayBadge(2),
    heading('The Specific Spark Compliment'),
    paragraph("Welcome back, connection detectives! Trisha Jamison here, and I am so excited to see you for Day 2 of our 'Ignite Your Connection: Small Sparks, Big Shifts!' challenge. How did those 'I Noticed' texts land yesterday? I bet you felt a little ripple of warmth, right? That's what we're building on!"),
    paragraph("Yesterday was about seeing the small, wonderful things. Today, we're taking it a step further: we're going to say those wonderful things, but with a twist!"),
    paragraph("You know, we often give compliments, right? 'You look nice,' or 'Good job.' And those are good! They're kind. But sometimes, they can feel a little... general. Like a warm, fuzzy blanket that's nice, but doesn't quite hug you tight in all the right places."),
    paragraph("I remember early in our marriage, Jeff would often tell me, 'You're a great mom.' And of course, that felt good to hear! Any mom loves to hear that. But one day, after a particularly crazy morning with the kids &mdash; I mean, spilled cereal, forgotten shoes, a full-on tantrum &mdash; I finally got them out the door, feeling completely frazzled. When I walked back inside, Jeff was there, and he looked at me and said, 'Hey, I just watched you handle that entire morning chaos, and you were so incredibly patient and calm even when everything was going sideways. That's amazing.'"),
    callout("And wow. That landed differently. It wasn't just 'You're a great mom.' It was 'I saw you in that specific moment, I saw the effort you put in, and I appreciate that specific thing about you.' It felt like he had peered right into my heart and acknowledged the exact struggle and triumph of that moment. It wasn't a general compliment; it was a specific spark that ignited a deep feeling of being truly understood and valued."),
    paragraph("And if you're doing this challenge on your own, without your partner knowing &mdash; that's more than okay. Some of the most meaningful shifts I've seen in couples started with one person quietly deciding to show up differently. You don't need permission to begin."),
    paragraph("That's the magic we're bringing into your relationship today! Today's challenge is all about The Specific Spark Compliment. It's about giving a genuine, detailed compliment that goes beyond the surface and truly lands in your partner's heart."),
    subheading('Your Challenge for Today'),
    numberedList([
      'Notice Something Real: Throughout your day, pay attention to something your partner does, says, or is that you appreciate. Maybe it\'s how they handled a tricky situation. Maybe it\'s a small act of service they performed. Maybe it\'s a quality you admire about them (their patience, their humor, their resilience).',
      'Get Specific with Your Words: Instead of a general "Thanks," "You\'re great," or "You look nice," try to articulate exactly what you noticed and how it made you feel. Use this formula: "I noticed you [specific action/quality] today, and it made me feel [specific feeling: loved, appreciated, proud, safe, seen, happy, grateful, etc.]."',
      'Deliver with Sincerity: Look your partner in the eye, or send a thoughtful text if you\'re apart. The feeling behind the words is just as important as the words themselves. A specific compliment delivered face-to-face carries an extra spark.',
    ]),
    paragraph('<strong>Examples:</strong>'),
    bulletList([
      '"I noticed you took the time to listen to our son\'s long story tonight, even though you were tired, and it made me feel so proud of the dad you are."',
      '"When you remembered to pick up my favorite coffee this morning, it made me feel really loved and cared for."',
      '"I saw how patiently you explained that concept to your colleague on the phone, and it reminded me how much I admire your steady kindness."',
      '"Your laugh when we were watching that show just now made me feel so happy and connected to you."',
    ]),
    paragraph("That's it! One specific compliment today. It's incredible how much a few genuine, detailed words can strengthen your connection and make your partner feel truly cherished."),
    subheading('Reflection Questions'),
    bulletList([
      'How did it feel to give this specific compliment?',
      'How did your partner respond? (Even a small nod or smile counts!)',
    ]),
    ctaButton('View the Challenge', 'https://healingheartscourse.com/spark-challenge'),
    signOff(
      "So go out there, notice those specific sparks, and let your partner know how much you truly appreciate them! I can't wait to hear about the warmth you create.",
      'Day 3: The 2-Minute Check-In &mdash; the gift of pure, undivided listening.',
    ),
    unsubscribeFooter(email, 'spark'),
  ].join('\n');

  return { subject, html: emailWrapper(body, previewText) };
}
