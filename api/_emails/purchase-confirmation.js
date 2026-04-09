// Purchase confirmation email — sent after successful Stripe checkout.
// Two variants: download products (Rescue Kit, Card Pack) and enrollment (Full Course).
// Voice: Trisha Jamison. Framework: AVNII (Acknowledge, Validate, Normalize, Illuminate, Invite).
import {
  emailWrapper, heading, paragraph, callout, ctaButton, signOff, unsubscribeFooter,
} from './spark-shared.js';

/**
 * Download product confirmation (Rescue Kit, Card Pack, etc.)
 * Sent when a customer buys a downloadable product.
 */
export function downloadPurchaseEmail(email, productName) {
  const subject = 'Your resource is ready';
  const previewText = `${productName} is waiting in your portal`;

  const body = [
    heading('This is yours now'),
    paragraph(
      `I want you to know something -- the fact that you just invested in yourself and your relationship? That tells me a lot about you. Most people think about making a change for months before they actually do it. You just did it.`
    ),
    paragraph(
      `Your <strong>${productName}</strong> is ready and waiting for you. Create your free account (if you have not already) and you will find it in your downloads.`
    ),
    callout(
      `A small thing I have learned from working with couples for 20 years: the tools that actually change things are the ones you use within 48 hours of getting them. Tonight, over coffee, on a walk -- pick one thing from your kit and try it. You do not have to do it perfectly. You just have to start.`
    ),
    ctaButton('Access Your Download', 'https://healingheartscourse.com/portal/downloads'),
    paragraph(
      `If you are doing this on your own right now -- without your partner knowing -- that is completely okay. Some of the most beautiful transformations I have seen started with one person quietly showing up differently. That counts. That matters.`
    ),
    signOff('I am cheering for you,'),
    unsubscribeFooter(email, 'purchase'),
  ].join('\n');

  return { subject, html: emailWrapper(body, previewText) };
}

/**
 * Full course enrollment confirmation.
 * Sent when a customer enrolls in the Healing Hearts Journey Program.
 */
export function enrollmentPurchaseEmail(email, name) {
  const subject = 'Welcome to your Healing Hearts journey';
  const previewText = 'Your portal is unlocked. Here is where we start.';
  const safeName = name || 'friend';

  const body = [
    heading(`Welcome, ${safeName}`),
    paragraph(
      `I have been thinking about this moment since you first reached out. And I just want to say -- I am so glad you are here. Not because of what you bought, but because of what it means. It means you decided that your relationship is worth fighting for. And honestly? That decision is the hardest part.`
    ),
    paragraph(
      `Your entire Healing Hearts portal is now unlocked -- all 8 modules, all 32 lessons. Jeff and I built this program from everything we have learned in 20 years of working with couples (and from everything we have lived in our own marriage). It is real, it is messy, and it works.`
    ),
    callout(
      `Here is my one ask: do not try to do everything at once. Start with Module 1. Read it together if you can, but it is just as powerful on your own. Give yourself permission to move at whatever pace feels right.`
    ),
    ctaButton('Go to Your Portal', 'https://healingheartscourse.com/portal'),
    paragraph(
      `One more thing -- you are not alone in this. If you get stuck, if something comes up that feels too big, if you just need someone to say "this makes sense" -- reach out. Jeff and I are here.`
    ),
    signOff('With so much hope for what is ahead,'),
    unsubscribeFooter(email, 'enrolled'),
  ].join('\n');

  return { subject, html: emailWrapper(body, previewText) };
}
