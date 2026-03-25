// Day 11: The question nobody asks
import {
  emailWrapper, heading, paragraph, subheading,
  callout, ctaButton, signOff,
} from './spark-shared.js';

export function dayEmail() {
  const subject = "The question nobody asks";
  const previewText = "What is staying stuck actually costing you?";

  const body = [
    heading("The Question Nobody Asks"),
    paragraph("Most couples I work with have thought about what it would cost to get help. The time. The vulnerability. The risk of digging into things that feel safer left buried."),
    paragraph("But almost nobody asks the other question:"),
    callout("What is staying stuck actually costing you?"),
    paragraph("Not in dollars. In the things that matter."),
    subheading("The Cost You Are Already Paying"),
    paragraph("It is the bedtime conversations that stopped. You used to talk about everything -- your fears, your dreams, the weird thought you had in the shower. Now the last thing you say before sleep is \"goodnight.\" Or nothing at all."),
    paragraph("It is your kids watching. They do not miss as much as you think. They see the way you avoid each other in the kitchen. They notice when one of you leaves the room as soon as the other walks in. They are learning right now what love looks like -- and what it does not."),
    paragraph("It is the dreams you stopped mentioning. The trip you wanted to take together. The business you wanted to start. The version of your marriage you imagined on your wedding day. At some point, you stopped bringing those things up -- not because you stopped wanting them, but because it hurt too much to want something that felt impossible."),
    paragraph("It is the slow, quiet erosion of hope. Not a dramatic breaking point -- just a gradual settling into \"this is just how it is.\""),
    callout("\"The couples who wait for the perfect time are the same couples who eventually run out of time.\" -- Jeff Jamison, DO"),
    paragraph("I am not saying this to create urgency or pressure. I am saying it because I have sat across from hundreds of couples, and the ones who wish they had started sooner always outnumber the ones who wish they had waited."),
    paragraph("The investment in your marriage is not really about the program or the course or the sessions. It is about deciding that the life you are living right now is not the life you are willing to settle for."),
    ctaButton('Learn More About Healing Hearts', 'https://healingheartscourse.com/apply'),
    signOff(
      "We are here whenever you are ready. No expiration date, no countdown. Just an open door.",
      "Jeff and Trisha are going live -- and you are invited.",
    ),
  ].join('\n');

  return { subject, html: emailWrapper(body, previewText) };
}
