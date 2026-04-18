import { emailWrapper, escapeHtml, heading, paragraph, callout, ctaButton, signOff, unsubscribeFooter, footerNav } from './spark-shared.js';

export function applicationReceivedEmail(name, email) {
  const previewText = 'We received your Healing Hearts application';
  const safeName = escapeHtml(name);

  const body = [
    heading(`Thank You, ${safeName}`),
    paragraph(
      `We are honored that you are considering the Healing Hearts journey. Your application has been received, and our team will review it within 24-48 hours.`
    ),
    callout(
      `What happens next: One of our team members will reach out to schedule a conversation with Jeff and Trisha. This is not a sales call &mdash; it is a chance for us to hear your story and for you to experience what working with us feels like.`
    ),
    paragraph(
      `In the meantime, if you have not already, we invite you to try our free 7-Day Spark Challenge -- a week of simple, real tools you can use with your partner tonight.`
    ),
    ctaButton('Try the 7-Day Spark Challenge', 'https://healingheartscourse.com/spark-challenge'),
    signOff('We are grateful you are here.'),
    footerNav(),
    unsubscribeFooter(email, 'spark'),
  ].join('');

  return {
    subject: 'Your Healing Hearts Application Has Been Received',
    html: emailWrapper(body, previewText),
  };
}
