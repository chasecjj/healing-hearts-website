// Day 13: What happened after they said yes
import {
  emailWrapper, heading, paragraph, subheading,
  callout, ctaButton, signOff,
} from './spark-shared.js';

export function dayEmail() {
  const subject = "What happened after they said yes";
  const previewText = "She thought they were fine. Turns out fine was code for numb.";

  const body = [
    heading("What Happened After They Said Yes"),
    paragraph("Michelle thought their marriage was fine. Not great, not terrible -- just fine. They did not fight much. They co-parented well. They were polite."),
    paragraph("It was her sister who said it first: \"You two are like really good roommates.\""),
    paragraph("That line sat in her chest for weeks."),
    paragraph("When Michelle brought it up to Ryan, he shrugged. \"I thought we were doing okay.\" But the more they talked -- really talked, for the first time in a long time -- the more they realized that \"okay\" had become code for numb."),
    callout("He did not know he was in what we call the Blue Zone every night -- emotionally checked out, running on autopilot, not because he did not care but because somewhere along the way he had decided that shutting down was safer than reaching out."),
    paragraph("She did not know that her constant cheerfulness was actually a fawn response -- performing happiness to keep the peace, while underneath she was lonely in her own home."),
    subheading("The Slow Drift"),
    paragraph("This is the pattern nobody warns you about. It is not the explosive fights or the dramatic betrayals. It is the slow drift -- two good people gradually becoming strangers while sharing a bed."),
    paragraph("Michelle and Ryan started the program not because their marriage was in crisis, but because they realized that \"fine\" was not the life they had promised each other."),
    paragraph("Four months in, Michelle sent me a voice message. She was laughing. She said:"),
    callout("\"We had a fight last Tuesday. And for the first time in maybe ever, we repaired it the same night. We actually talked about what was really going on. And then we laughed about it. I did not know that was possible for us.\""),
    paragraph("That is not a small thing. That is everything. The ability to fight, repair, and reconnect -- in the same night -- is what a healthy marriage looks like. Not the absence of conflict, but the confidence that conflict will not destroy you."),
    paragraph("If their story sounds like yours -- if \"fine\" is the word you keep using and it does not feel like enough anymore -- you are not alone. And there is a way forward."),
    ctaButton('Learn More About the Program', 'https://healingheartscourse.com/apply'),
    signOff(
      "Whether it is the workshop, the program, or just these emails -- we are glad you are here.",
      "Tomorrow is our last email together. I want to leave you with something important.",
    ),
  ].join('\n');

  return { subject, html: emailWrapper(body, previewText) };
}
