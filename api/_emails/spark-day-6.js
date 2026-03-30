// Day 6: The Memory Lane Moment
import {
  emailWrapper, dayBadge, heading, paragraph, subheading,
  callout, numberedList, bulletList, ctaButton, signOff, unsubscribeFooter,
} from './spark-shared.js';

export function dayEmail(email) {
  const subject = "The burnt birthday dinner";
  const previewText = "We sat there for twenty minutes, just remembering.";

  const body = [
    dayBadge(6),
    heading('The Memory Lane Moment'),
    paragraph("Welcome, beautiful hearts, to Day 6! Can you believe we're almost at the end of our challenge? How did 'The Gratitude Text' feel yesterday? I just love thinking about all those little sparks of appreciation flying around. It's amazing how a simple text can shift the whole energy of a day, isn't it?"),
    paragraph("Today, we're going to take a little trip back in time, to a place where maybe things felt a bit simpler, a bit lighter, and the world felt full of possibility. Today is all about 'The Memory Lane Moment.'"),
    paragraph("You know, when life gets busy &mdash; and oh, does it get busy! &mdash; we can sometimes lose touch with the very foundation of our relationship. We get caught up in the to-do lists, the routines, the responsibilities, and we forget the magic of how it all began. We forget those early days, those inside jokes, those moments that cemented your bond."),
    paragraph("I remember a few years ago, Jeff and I were going through a really tough patch. We were both exhausted, stressed, and it felt like we were just roommates coexisting. One night, we were cleaning out a closet, and I stumbled upon a box of old photos. There was one of us, crammed into his tiny first apartment, trying to cook a gourmet meal for my birthday. It was a disaster &mdash; the smoke alarm went off, we burnt everything, and ended up ordering pizza. But in that moment, looking at that blurry photo, I remembered how much we laughed that night. How we just rolled with it, how easy and fun we were together."),
    callout("And I just turned to Jeff and said, 'Remember that night? The burnt birthday dinner?' And he smiled, a real smile, and started recounting details I'd forgotten. We sat there for a good twenty minutes, just remembering. It wasn't about fixing anything in our current situation, but it was like someone had opened a window and let fresh air into a stuffy room. It reminded us of us, before all the layers of life piled on."),
    paragraph("That's the power of today's challenge. We're not trying to recreate the past, but we're tapping into those beautiful, foundational memories that remind you why you chose each other."),
    subheading('Your Challenge for Today'),
    numberedList([
      "Choose a Favorite Memory: Think back to the early days of your relationship. What's one specific memory that stands out? It could be a first date, a funny mishap, a memorable trip. A moment you felt a deep connection or realized you were falling in love. An early challenge you faced together.",
      "Share the Story: Tell your partner about this memory. Relive the details, the emotions, and what made it special. Take turns sharing.",
      "Explain Why it Still Matters: This is the most important part! Don't just recount the event. Tell your partner: \"This memory still matters to me because...\" \"It reminds me of your...\" (patience, humor, adventurous spirit, etc.) \"It showed me that we...\" (could overcome anything, were meant to be, had so much fun together)",
    ]),
    paragraph("This isn't about comparing your past to your present. It's about drawing strength, warmth, and appreciation from your shared history. Allow yourselves to truly soak in the positive feelings these memories bring."),
    subheading('Reflection Questions'),
    bulletList([
      'What memory did you choose to share, and what did you learn or rediscover about your partner or your relationship?',
      'How did it feel to revisit that moment and hear your partner\'s perspective?',
    ]),
    ctaButton('View the Challenge', 'https://healingheartscourse.com/spark-challenge'),
    signOff(
      "Enjoy your trip down memory lane today, and let those wonderful feelings wash over you. You've built a wonderful story together!",
      "Day 7: The Spark Conversation &mdash; the most direct and loving way to keep your connection vibrant.",
    ),
    unsubscribeFooter(email, 'spark'),
  ].join('\n');

  return { subject, html: emailWrapper(body, previewText) };
}
