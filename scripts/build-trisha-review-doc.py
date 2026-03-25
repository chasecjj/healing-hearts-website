"""
Build a warm, Trisha-friendly review document for the 7 Spark Challenge video scripts.
Written as PHEDRIS would write to Trisha -- no code, no file paths, no jargon.

Uses the HH DOCX style module for consistent branding.
"""

import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from hh_docx_style import HHDocument

SCRIPTS_DIR = Path(
    r"C:\Users\chase\Documents\HealingHeartsWebsite\docs\video-scripts\spark-challenge"
)
OUTPUT = Path(
    r"C:\Users\chase\Documents\Healing Hearts\Spark Challenge Video Scripts - Trisha Review.docx"
)


def strip_frontmatter(text):
    if text.startswith("---"):
        end = text.find("---", 3)
        if end != -1:
            return text[end + 3 :].strip()
    return text.strip()


def parse_frontmatter(text):
    fm = {}
    if text.startswith("---"):
        fm_text = text[3 : text.find("---", 3)]
        for line in fm_text.strip().split("\n"):
            if ":" in line and not line.startswith("  -"):
                key, val = line.split(":", 1)
                fm[key.strip()] = val.strip().strip('"')
    return fm


def parse_sections(body):
    body = re.sub(r"^# Day \d+ -- .+$", "", body, flags=re.MULTILINE)
    body = re.sub(r"^## Beat Sheet.*$", "", body, flags=re.MULTILINE)
    body = re.sub(r"^---+\s*$", "", body, flags=re.MULTILINE)
    body = re.sub(r"## Teleprompter Notes.*", "", body, flags=re.DOTALL)

    sections = []
    current_section = None
    current_lines = []

    for line in body.split("\n"):
        header_match = re.match(r"^#{2,3}\s+(.+?)(?:\s*\(.*\))?\s*(?:--\s*.*)?$", line)
        if header_match:
            if current_section:
                sections.append((current_section, "\n".join(current_lines).strip()))
            current_section = header_match.group(1).strip()
            current_section = re.sub(r"\s*--\s*.*$", "", current_section)
            current_lines = []
        else:
            current_lines.append(line)

    if current_section:
        sections.append((current_section, "\n".join(current_lines).strip()))

    return sections


DAY_TITLES = {
    1: 'The "I Noticed" Text',
    2: "The Specific Spark Compliment",
    3: "The 2-Minute Check-In",
    4: "The Pause Experiment",
    5: "The Gratitude Text",
    6: "The Memory Lane Moment",
    7: "The Spark Conversation",
}

DAY_REVIEW_PROMPTS = {
    1: "Does the Jeff lunch story feel right? Is that how you'd tell it? And the client gratitude letter -- is that a moment you remember well enough to own on camera?",
    2: 'The "checking a box" client story -- does that land for you? And the cooking detail at the end -- would you keep that or swap in something stronger?',
    3: "The smartphone story is the heart of this one. You've told it before in sessions -- does this version feel natural? Would you tell it differently?",
    4: "This is the one where Jeff steps in. Does the handoff feel smooth? And Jeff's section -- is the vagus nerve / \"reset switch\" language something he'd be comfortable saying on camera?",
    5: "Two stories here -- your lunch surprise for Jeff, and David's flowers. Do both feel authentic? Is there a gratitude moment you'd rather use?",
    6: 'This is the script I\'m least sure about. I couldn\'t find your early love story in the transcripts, so I used the coaching exercise and the "old people on the couch" line. During the dry run, would you just tell your real "moment I knew" story? Whatever you say will replace what\'s here.',
    7: "Your setup and closing are scripted. The middle -- asking Jeff the question -- is real. No rehearsal. Are you comfortable with that? And does the course mention at the end feel warm enough, or too salesy?",
}

DAY_SUMMARIES = [
    (
        "Day 1",
        'The "I Noticed" Text',
        "You solo",
        "Jeff's lunch visits + client gratitude letter",
    ),
    (
        "Day 2",
        "The Specific Spark Compliment",
        "You solo",
        '"Checking a box" client story + specific praise',
    ),
    ("Day 3", "The 2-Minute Check-In", "You solo", "The smartphone boy story"),
    (
        "Day 4",
        "The Pause Experiment",
        "You + Jeff",
        "Critter Brain / CEO Brain -- Jeff explains the science",
    ),
    (
        "Day 5",
        "The Gratitude Text",
        "You solo",
        "Jeff lunch surprise + David's flowers",
    ),
    (
        "Day 6",
        "The Memory Lane Moment",
        "You solo",
        'Coaching memory exercise + "old people on the couch"',
    ),
    (
        "Day 7",
        "The Spark Conversation",
        "You + Jeff",
        "You ask Jeff the question live -- unscripted",
    ),
]


def render_script_line(doc, line):
    line = line.strip()
    if not line:
        return

    if line.startswith(">"):
        text = line.lstrip("> ").strip()
        doc.production_note(text)
        return

    if line.startswith("[") and line.endswith("]"):
        doc.stage_direction(line)
        return

    if re.match(r"^(TRISHA|JEFF|TRISHA \+ JEFF|TRISHA AND JEFF)\s*:", line):
        name = line.split(":")[0].strip()
        doc.speaker_label(name)
        return

    doc.script_line(line)


def build():
    doc = HHDocument()

    # Title page
    doc.title_page(
        "Spark Challenge",
        "Companion Video Scripts",
        tagline="For Trisha's Review",
        prepared_for="Prepared by PHEDRIS  |  March 2026",
    )

    # Intro letter
    doc.intro_letter(
        "Hi Trisha,",
        [
            "These are the companion video scripts for the 7-Day Spark Challenge. Each one is designed to be about 90 seconds to 2 minutes -- short enough to hold attention, long enough to land emotionally.",
            'Your job in these videos is simple: look at the camera, tell the story, and make people feel something. The daily emails handle the exercise instructions. These videos are the emotional anchor -- the moment where someone watching thinks, "She gets it. She gets me."',
            "I pulled as much as I could from your real coaching sessions -- the stories you've told, the phrases you actually use, the way you teach. Some scripts are heavily sourced from your sessions (80%+), and a few needed more creative bridging where the transcripts were thin. I've flagged those honestly.",
            "Here's what I need from you:",
        ],
    )

    # Review checklist (on its own page after intro letter page break)
    doc.section("How to Review")
    doc.bullet_list(
        [
            "Read each script out loud. Does it sound like you? If a phrase feels off, cross it out and write what you'd actually say.",
            "The stories -- are these the right ones? If you have a better story for any day, swap it in. Your real stories will always beat anything I assembled.",
            'Day 6 especially -- I couldn\'t find your "moment I knew" story about Jeff in the transcripts. I used your coaching exercise and the "old people on the couch" line instead. During the dry run, I\'d love for you to just tell that story in your own words and we\'ll use that.',
            "Day 7 is partially unscripted -- you'll ask Jeff the question live on camera. His answer is real, not rehearsed. Your setup and closing are on the teleprompter. The middle is just... you two being you.",
            "Mark anything that needs Jeff's input -- especially Day 4 where he explains the Critter Brain science.",
        ]
    )
    doc.callout(
        "Take your time with these. Cross things out, write in the margins, circle what you love. Nothing is final until you say it is."
    )

    doc.page_break()

    # Quick reference table
    doc.section("Quick Reference")
    doc.table(
        ["Day", "Title", "Who's On Camera", "Key Story"],
        DAY_SUMMARIES,
        col_widths=[0.6, 1.8, 1.2, 3.0],
    )

    doc.page_break()

    # Individual scripts
    script_files = sorted(SCRIPTS_DIR.glob("day-*.md"))

    for filepath in script_files:
        raw = filepath.read_text(encoding="utf-8")
        fm = parse_frontmatter(raw)
        body = strip_frontmatter(raw)
        sections = parse_sections(body)

        day_num = int(fm.get("day", "0"))
        title = DAY_TITLES.get(day_num, fm.get("title", ""))
        talent = fm.get("talent", "")
        word_count = fm.get("word_count", "")
        coverage = fm.get("transcript_coverage", "")

        # Day header
        doc.section(f"Day {day_num}")
        doc.subsection(title)
        doc.metadata(
            f"{talent}  |  ~{word_count} words  |  {coverage} from your real sessions"
        )

        # Review prompt
        if day_num in DAY_REVIEW_PROMPTS:
            doc.review_prompt(DAY_REVIEW_PROMPTS[day_num])

        # Script sections
        for section_name, section_text in sections:
            doc.script_section(section_name)
            for line in section_text.split("\n"):
                render_script_line(doc, line)

        doc.divider()

        if day_num < 7:
            doc.page_break()

    # Closing
    doc.closing_with_steps(
        [
            "You review these scripts -- mark up anything that doesn't sound like you.",
            "We do a teleprompter dry run with Day 1 to set your scroll speed and catch anything that feels awkward when spoken.",
            'Day 6: you tell your real "moment I knew" story on the spot. We\'ll use your words.',
            "Filming session 1: Days 1, 2, 3, 5, 6 -- just you and the camera.",
            "Filming session 2: Days 4 and 7 -- Jeff joins you.",
            "Videos go up before the expo on April 10.",
        ],
        final_note="Nothing in this document is final until you say it is. These are your words, your stories, your course. I just helped organize them.\n\nYou're going to be great on camera, Trisha.",
        signoff="-- PHEDRIS",
    )

    doc.save(str(OUTPUT))
    print(f"Saved to: {OUTPUT}")


if __name__ == "__main__":
    build()
