// Day 14: Is this the year your marriage changes?
import {
  emailWrapper, heading, paragraph,
  callout, ctaButton, divider, signOff,
} from './spark-shared.js';

export function dayEmail() {
  const subject = "Is this the year your marriage changes?";
  const previewText = "There is no expiration date on healing.";

  const body = [
    heading("Is This the Year Your Marriage Changes?"),
    paragraph("This is our last email together -- at least for now -- and I want to be real with you."),
    paragraph("I do not know your story. I do not know what brought you to the Spark Challenge, what keeps you up at night, or what you are hoping for. But I know you are here, and that tells me something."),
    paragraph("It tells me you have not given up."),
    paragraph("Maybe you are in crisis and looking for a lifeline. Maybe you are in that quiet \"fine\" zone and wondering if this is really all there is. Maybe your marriage is actually pretty good and you want it to be great. Wherever you are, the fact that you spent two weeks reading these emails means something."),
    callout("There is no expiration date on healing. There is no deadline after which your marriage cannot change. I have seen couples come back from places that felt impossible -- and I have seen them do it at every age, every stage, and after every kind of hurt."),
    paragraph("So here is what I want you to know:"),
    paragraph("The door is always open. If right now is the time, we are here. If you need six more months, we will still be here. If you never join our program but something in these emails shifted the way you see your partner -- that is enough. That matters."),
    paragraph("But if you are feeling that pull -- that quiet voice saying \"maybe this is the year\" -- I want to encourage you to listen to it. Not because I want your business, but because I have watched too many couples wait until the pain got unbearable before they asked for help. And every single one of them said the same thing: \"I wish we had started sooner.\""),
    ctaButton('Apply to the Healing Hearts Program', 'https://healingheartscourse.com/apply'),
    paragraph('Or if you would rather start with a conversation, you can <a href="https://healingheartscourse.com/book" style="color:#1191B1; text-decoration:underline;">schedule a free call with our team</a>. No pressure, no obligations -- just a chance to talk about where you are and where you want to be.'),
    divider(),
    paragraph("Whatever you decide, Jeff and I are grateful you spent these two weeks with us. Your marriage has a story worth fighting for, and we believe that with our whole hearts."),
    signOff(
      "With love and hope for your journey,",
    ),
  ].join('\n');

  return { subject, html: emailWrapper(body, previewText) };
}
