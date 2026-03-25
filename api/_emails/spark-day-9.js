// Day 9: They were two weeks from filing
import {
  emailWrapper, heading, paragraph, subheading,
  callout, signOff,
} from './spark-shared.js';

export function dayEmail() {
  const subject = "They were two weeks from filing";
  const previewText = "He had already talked to an attorney. She was looking at apartments.";

  const body = [
    heading("They Were Two Weeks From Filing"),
    paragraph("David had already talked to an attorney. Breanne was looking at apartments. They had not had a real conversation in months -- just logistics about the kids and cold silences in between."),
    paragraph("When they walked into their first session, David sat on the far end of the couch. Arms crossed. He looked like a man who had already made his decision."),
    paragraph("I asked him one question: \"When was the last time you felt truly safe with Breanne?\""),
    paragraph("He was quiet for a long time. Then he said, barely above a whisper:"),
    callout("\"Our honeymoon. I did not know I was allowed to be that open with someone.\""),
    paragraph("Breanne started crying. Not because she was sad -- because she had never heard him say that. In sixteen years of marriage, she had never known that their honeymoon was the last time he felt safe enough to be fully himself."),
    paragraph("That moment cracked something open."),
    subheading("What Changed"),
    paragraph("It was not instant. There were hard weeks. There were sessions where one of them wanted to quit. But they kept showing up. They learned how their nervous systems were hijacking every conversation. They learned how to actually hear each other instead of just defending themselves."),
    paragraph("Six months later, Breanne sent me a message. Just one line:"),
    callout("\"I have my husband back.\""),
    paragraph("David and Breanne are not special. They are not unusually brave or emotionally gifted. They are two ordinary people who decided to do something extraordinary -- they chose to fight for their marriage instead of against each other."),
    paragraph("This is what becomes possible when you do the deep work. Not surface-level tips. Not communication hacks. The real, honest, sometimes uncomfortable work of learning who you are together -- and who you could be."),
    signOff(
      "Their story is not unique. I have seen it happen again and again. And it starts with the same decision you already made when you signed up for the Spark Challenge -- the decision to try.",
      "The real reason your arguments last for hours (and what to do about it).",
    ),
  ].join('\n');

  return { subject, html: emailWrapper(body, previewText) };
}
