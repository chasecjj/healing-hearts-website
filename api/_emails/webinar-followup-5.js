// Webinar Follow-Up 5: Day +7 — Warm close, no pressure
import {
  escapeHtml, emailWrapper, heading, paragraph,
  callout, ctaButton, divider, signOff, unsubscribeFooter,
} from './spark-shared.js';

export function followupEmail(name, webinar, email) {
  const safeName = escapeHtml(name);

  const subject = 'Is this the year?';
  const previewText = 'There is no expiration date on healing.';

  const body = [
    heading('Is This the Year?'),
    paragraph(`${safeName}, this is the last email in this series &mdash; and I want to be honest with you.`),
    paragraph('I do not know your full story. I do not know what brought you to the workshop, what keeps you up at 2 AM, or what you are hoping for. But I know you showed up. You gave us your time and your attention, and that tells me something important about you.'),
    paragraph('It tells me you have not given up.'),
    paragraph('Maybe your marriage is in crisis and you are looking for a lifeline. Maybe you are in that quiet "fine" zone &mdash; not terrible, but not what you dreamed of either. Maybe things are actually pretty good and you want them to be great. Wherever you are, the fact that you have been reading these emails means something.'),
    callout('There is no expiration date on healing. There is no deadline after which your marriage cannot change. We have seen couples come back from places that felt impossible &mdash; and they have done it at every age, every stage, and after every kind of hurt.'),
    paragraph('So here is what I want you to know:'),
    paragraph('The door is always open. If right now is the time, we are here. If you need six more months, we will still be here. If you never join our program but something from the workshop or these emails shifted the way you see your partner &mdash; that is enough. That matters.'),
    paragraph('But if you are feeling that pull &mdash; that quiet voice saying "maybe this is the year" &mdash; I want to encourage you to listen to it. Not because we want your business, but because we have watched too many couples wait until the pain got unbearable before they asked for help. And every single one of them said the same thing:'),
    callout('"We wish we had started sooner."'),
    ctaButton('Apply to the Healing Hearts Program', 'https://healingheartscourse.com/apply'),
    paragraph('Or if you would rather start with a conversation, you can <a href="https://healingheartscourse.com/book" style="color:#1191B1; text-decoration:underline;">schedule a free call with our team</a>. No pressure, no obligations &mdash; just a chance to talk about where you are and where you want to be.'),
    divider(),
    paragraph('Whatever you decide, Jeff and I are grateful you spent this time with us. Your marriage has a story worth fighting for, and we believe that with our whole hearts.'),
    signOff('With love and hope for your journey,'),
    unsubscribeFooter(email, 'webinar'),
  ].join('\n');

  return { subject, html: emailWrapper(body, previewText) };
}
