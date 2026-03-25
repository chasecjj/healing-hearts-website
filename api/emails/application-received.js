import { emailWrapper, escapeHtml, heading, paragraph, callout, ctaButton, signOff } from './spark-shared.js';

export function applicationReceivedEmail(name) {
  const previewText = 'We received your Healing Hearts application';
  const safeName = escapeHtml(name);

  const body = [
    heading(`Thank You, ${safeName}`),
    paragraph(
      `We are honored that you are considering the Healing Hearts journey. Your application has been received, and our team will review it within 24-48 hours.`
    ),
    callout(
      `What happens next: One of our team members will reach out to schedule a conversation with Jeff and Trisha. This is not a sales call -- it is a chance for us to hear your story and for you to experience what working with us feels like.`
    ),
    paragraph(
      `In the meantime, if you have not already, we invite you to explore our free resources and the 7-Day Spark Challenge.`
    ),
    ctaButton('Explore Free Resources', 'https://healingheartscourse.com/resources'),
    signOff('We are grateful you are here.'),
  ].join('');

  return {
    subject: 'Your Healing Hearts Application Has Been Received',
    html: emailWrapper(body, previewText),
  };
}
