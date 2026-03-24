// Day 1: The 'I Noticed' Text
import {
  emailWrapper, dayBadge, heading, paragraph, subheading,
  callout, numberedList, bulletList, ctaButton, signOff,
} from './spark-shared.js';

export function dayEmail() {
  const subject = "Day 1: The 'I Noticed' Text -- Spark Challenge";

  const body = [
    dayBadge(1),
    heading("The 'I Noticed' Text"),
    paragraph("Hey there, beautiful people! I'm Trisha Jamison and I am so thrilled you're joining our 'Ignite Your Connection: Small Sparks, Big Shifts!' 7-day challenge! This week is all about bringing a little extra joy, fun, and deep connection back into your relationship, one tiny, powerful step at a time. No pressure, just play!"),
    paragraph("You know, it's so easy in the hustle and bustle of life -- the school runs, the deadlines, the dinner dilemmas -- to start seeing our partners through a bit of a blurry lens. We see the 'to-do list' version of them, or maybe the 'habit' version. And sometimes, we just forget to really look."),
    paragraph("I remember one time, I was getting ready to head out of town for a few days, and my head was just spinning with last-minute preparations. Normally, I'd have my car all washed and gassed up the night before, but this time, I just completely ran out of hours. I went to bed feeling a little stressed, thinking about everything I still needed to do in the morning before hitting the road."),
    paragraph("Well, the next morning, I woke up, still feeling a bit rushed, and went out to the driveway. And there it was -- my car, sparkling clean, fully packed with my bags, and the gas tank was completely full! Jeff had gotten up extra early, quietly taken care of everything. He had washed the car, filled the tank, helped me pack it, and made sure everything was in perfect working order, all before I even woke up."),
    paragraph("It was such a quiet, thoughtful act of service. He didn't say anything, didn't ask for praise; he just did it because he knew I needed it. And in that moment, seeing that clean, packed, gassed-up car, I just felt so incredibly seen, loved, and supported. It wasn't just about the car; it was about him noticing my stress and silently stepping in to carry the load. It was a huge spark of connection for me right when I needed it most."),
    callout("And that's the magic of what we're doing today! Today's challenge is all about The 'I Noticed' Text. It's about intentionally looking for the good, the sweet, the funny, the thoughtful -- those little things that often go unseen."),
    paragraph("No long paragraphs, no deep conversations required. Just a little spark of, 'Hey, I see you, and I appreciate this little piece of you.' It's incredible how much connection can blossom from such a small, intentional act of noticing."),
    subheading('Your Challenge for Today'),
    numberedList([
      'Set a few reminders on your phone throughout the day (maybe one for morning, one for afternoon, and one for evening). These are your gentle nudges to pause!',
      'When a reminder goes off, PAUSE for a moment. Take a deep breath. Now, intentionally NOTICE one specific, positive thing about your partner. It could be something they did (e.g., "I noticed you took out the trash without me asking!"). Something they said (e.g., "I noticed how patient you were with the kids this morning."). Or even just something you appreciate about them in that moment (e.g., "I noticed your smile today, it just brightened my whole afternoon."). Think about the small gestures, the quiet contributions, or even just a personality quirk you adore.',
      'Send them a quick text! Keep it simple, genuine, and positive: "Hey, I just noticed [the specific thing] and it made me [feel X / I loved that]."',
    ]),
    paragraph('<strong>Examples:</strong>'),
    bulletList([
      '"I just noticed you hummed that song while doing dishes, and it made me smile."',
      '"I noticed how you helped our neighbor with their groceries, and it reminded me how kind you are."',
    ]),
    paragraph("These small, intentional acts of noticing and acknowledging can create powerful sparks of connection. It tells your partner, 'I see you, I appreciate you, and you matter to me.' It's incredible how much closer you can feel when you truly feel seen for who you are and for all the little things you do. Remember, the simpler and more authentic, the better! Just let that little moment of appreciation flow."),
    subheading('Reflection Questions'),
    bulletList([
      'How did it feel to intentionally pause and notice your partner today?',
      'How did your partner respond to your text?',
    ]),
    ctaButton('View the Challenge', 'https://healingheartscourse.com/spark-challenge'),
    signOff(
      "So, go out there today, be a connection detective, and sprinkle some 'I noticed' magic! I can't wait to hear what you discover.",
      "Day 2: The Specific Spark Compliment -- moving beyond 'you look nice' to compliments that truly land.",
    ),
  ].join('\n');

  return { subject, html: emailWrapper(body) };
}
