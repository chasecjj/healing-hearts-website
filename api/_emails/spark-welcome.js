// Spark Challenge welcome email — sent immediately on signup
import {
  emailWrapper, heading, paragraph, ctaButton, signOff, unsubscribeFooter,
} from './spark-shared.js';

export function welcomeEmail(email) {
  const subject = "You're in! Your 7-Day Spark Challenge starts tomorrow";
  const previewText = 'Day 1 arrives tomorrow morning. Get ready for small sparks, big shifts!';

  const body = [
    heading('Welcome to the Spark Challenge'),
    paragraph(
      "Hey there! I'm Trisha Jamison, and I am so thrilled you've decided to join us for the Spark Challenge!"
    ),
    paragraph(
      "Over the next seven days, you and your partner are going to reconnect in ways that might surprise you. No big, dramatic gestures -- just small, intentional moments that remind you both why you chose each other. No pressure, just play!"
    ),
    paragraph(
      "<strong>Day 1 arrives tomorrow morning.</strong> Each day, I'll send you a short story from my own marriage (Jeff and I have been through it all!), plus one simple practice for you and your partner to try together. Some will make you laugh. Some might make you think. All of them work."
    ),
    paragraph(
      "Here's what I've learned from 20 years of coaching couples: change doesn't have to be hard. Sometimes it just starts with showing up -- and you already did that by signing up today. I'm so proud of you for taking this step!"
    ),
    ctaButton('Preview the Challenge', 'https://healingheartscourse.com/spark-challenge'),
    signOff('Cheering for you both,'),
    unsubscribeFooter(email, 'spark'),
  ].join('\n');

  return { subject, html: emailWrapper(body, previewText) };
}
