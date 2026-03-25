# Spark Challenge Companion Video Scripts — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce 7 teleprompter-ready video scripts (90-120 seconds each) for the Spark Challenge companion videos, sourced primarily from the 34-session coaching transcript library.

**Architecture:** Transcript-first content pipeline. Mine the PHEDRIS PostgreSQL transcript database for Trisha's real stories and phrasing matching each day's theme, then assemble excerpts into the beat sheet structure (Hook → Story → Turn → Bridge → Close). Each script is a standalone markdown file with YAML frontmatter.

**Tech Stack:** PHEDRIS PostgreSQL (transcript search via `ssh_db_query` or `ssh_execute`), Mind Vault MCP (vault file ops), markdown output

**Spec:** `docs/superpowers/specs/2026-03-24-spark-challenge-video-scripts-design.md`

---

## File Structure

```
docs/video-scripts/spark-challenge/
  README.md                          # Overview + status tracker
  day-1-i-noticed-text.md            # Script: The "I Noticed" Text
  day-2-specific-spark-compliment.md  # Script: The Specific Spark Compliment
  day-3-two-minute-check-in.md       # Script: The 2-Minute Check-In
  day-4-pause-experiment.md          # Script: The Pause Experiment (Jeff cameo)
  day-5-gratitude-text.md            # Script: The Gratitude Text
  day-6-memory-lane-moment.md        # Script: The Memory Lane Moment
  day-7-spark-conversation.md        # Script: The Spark Conversation (Jeff + Trisha)
  transcript-mining/
    raw-excerpts.md                  # All search results organized by day
```

## YAML Frontmatter Template (every script file)

```yaml
---
day: N
title: "Day Title"
theme: "One-line theme"
talent: "Trisha solo" | "Trisha + Jeff"
target_duration: "90-120 seconds"
word_count: NNN
transcript_coverage: "NN%"
transcript_sources: ["session title or ID", ...]
ai_written_sections: ["list of beats that are AI-written, if any"]
status: "draft" | "trisha-review" | "approved"
---
```

## Beat Sheet Template (body of every script file)

```markdown
## HOOK (10-15s)

[opening question or moment]

## STORY (40-60s)

[leaning in]
[the personal anecdote — Trisha's words]

[beat]

[story continuation]

## THE TURN (15-20s)

[softening]
[the emotional insight]

## BRIDGE TO EMAIL (10-15s)

[warm smile]
[tease the exercise + direct to inbox]

## WARM CLOSE (5-10s)

[encouragement line]
See you tomorrow.
```

## Quality Checklist (apply to every script)

- [ ] Word count: 225-300 words
- [ ] Timing: fits 90-120 seconds at ~150 wpm natural pace
- [ ] Transcript sourced: >=80% of content from real transcripts
- [ ] Voice: sounds like Trisha talking to a friend, not reading an essay
- [ ] No clinical language (no "physiological", "activation", "protocol")
- [ ] Proprietary frameworks named correctly (Critter Brain, CEO Brain, 90-Second Wave)
- [ ] Max 12 words per sentence
- [ ] All contractions (you're, don't, isn't, here's)
- [ ] Emotion cues are brief, not over-directed
- [ ] ASCII only (no em dashes, smart quotes) — these are going through multiple systems. Verify: `grep -P '[^\x00-\x7F]' <file>` should return nothing.
- [ ] Bridge references "your inbox" / "your email" (not a URL or app)
- [ ] Day 4 only: Jeff segment is 75-110 words / 30-45 seconds, warm + accessible (not clinical), transitions in/out feel natural
- [ ] Day 7 only: includes soft course upsell in close
- [ ] If <80% transcript-sourced: flag in `ai_written_sections` frontmatter AND add a production note that Trisha should provide a real story during the teleprompter dry run to replace the AI placeholder
- [ ] Any lines not from transcripts (hooks, bridges, teases) are flagged in `ai_written_sections`

---

## Task 1: Setup — Directory + Template + Schema Discovery

**Files:**
- Create: `docs/video-scripts/spark-challenge/README.md`
- Create: `docs/video-scripts/spark-challenge/transcript-mining/raw-excerpts.md`

- [ ] **Step 1: Create output directory structure**

```bash
cd C:/Users/chase/Documents/HealingHeartsWebsite
mkdir -p docs/video-scripts/spark-challenge/transcript-mining
```

- [ ] **Step 2: Create README tracker**

Write `docs/video-scripts/spark-challenge/README.md`:

```markdown
# Spark Challenge Companion Video Scripts

7 short companion videos (90-120s) for the 7-Day Spark Challenge.
Spec: `docs/superpowers/specs/2026-03-24-spark-challenge-video-scripts-design.md`

## Status

| Day | Title | Talent | Word Count | Transcript % | Status |
|-----|-------|--------|------------|--------------|--------|
| 1 | The "I Noticed" Text | Trisha | - | - | pending |
| 2 | The Specific Spark Compliment | Trisha | - | - | pending |
| 3 | The 2-Minute Check-In | Trisha | - | - | pending |
| 4 | The Pause Experiment | Trisha + Jeff | - | - | pending |
| 5 | The Gratitude Text | Trisha | - | - | pending |
| 6 | The Memory Lane Moment | Trisha | - | - | pending |
| 7 | The Spark Conversation | Trisha + Jeff | - | - | pending |
```

- [ ] **Step 3: Discover transcript table schema**

Run via SSH to confirm column names before mining:

```
ssh_db_query(server="phedris", database="phedris", query="SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'transcripts' ORDER BY ordinal_position;")
```

Or fallback:

```
ssh_execute(server="phedris", command="sudo -u postgres psql -d phedris -t -A -c \"\\d transcripts\"")
```

Record the column names — the mining queries in Task 2 depend on knowing the exact schema. Expected columns: `id`, `title`, `full_text`, `speaker`, `type`, `date`, `search_vector` (tsvector).

- [ ] **Step 4: Confirm transcript count**

```
ssh_db_query(server="phedris", database="phedris", query="SELECT COUNT(*), SUM(LENGTH(full_text)) FROM transcripts;")
```

Expected: ~34 rows, ~312K total characters.

- [ ] **Step 5: Commit setup**

```bash
cd C:/Users/chase/Documents/HealingHeartsWebsite
git add docs/video-scripts/
git commit -m "scaffold: spark challenge video scripts directory"
```

---

## Task 2: Transcript Mining — All 7 Days

**Files:**
- Create: `docs/video-scripts/spark-challenge/transcript-mining/raw-excerpts.md`

**Purpose:** Run all transcript searches for all 7 days in one batch. Save the raw excerpts organized by day. This is the source material for Tasks 3-9.

**Important:** The search uses `websearch_to_tsquery` with a 20-result limit per query. Run each search term as a SEPARATE query. De-duplicate results across queries for the same day.

- [ ] **Step 1: Run Day 1 searches (notice / seen / small things)**

Run each of these as separate queries. Adjust column names based on schema from Task 1:

```sql
SELECT id, title, ts_headline('english', full_text, websearch_to_tsquery('english', 'notice seen'), 'MaxWords=80,MinWords=30') as excerpt
FROM transcripts
WHERE search_vector @@ websearch_to_tsquery('english', 'notice seen')
ORDER BY ts_rank(search_vector, websearch_to_tsquery('english', 'notice seen')) DESC
LIMIT 20;
```

Repeat for: `small things service`, `invisible taken for granted`, `Jeff quiet`.

Save all results under `## Day 1 — Notice / Seen` in raw-excerpts.md.

- [ ] **Step 2: Run Day 2 searches (compliment / specific / appreciate)**

Search terms (separate queries each):
- `compliment specific`
- `appreciate paying attention`
- `noticed that you`
- `generic praise`

Save under `## Day 2 — Specific Compliment`.

- [ ] **Step 3: Run Day 3 searches (listen / check in / present)**

Search terms:
- `listen check in`
- `how was your day`
- `distracted phone present`
- `active listening`

Save under `## Day 3 — Listening`.

- [ ] **Step 4: Run Day 4 searches (critter brain / pause / regulate)**

Search terms:
- `critter brain CEO brain`
- `90 second wave`
- `flood pause react`
- `fight or flight regulate`
- `tension escalated`

Save under `## Day 4 — Pause / Critter Brain`. Flag any Jeff-specific segments (speaker = Jeff).

- [ ] **Step 5: Run Day 5 searches (grateful / appreciate / surprise)**

Search terms:
- `grateful thankful`
- `appreciate take for granted`
- `surprise text`
- `gratitude practice`

Save under `## Day 5 — Gratitude`.

- [ ] **Step 6: Run Day 6 searches (memory / early relationship / beginning)**

Search terms:
- `remember when first`
- `early relationship beginning`
- `how we met`
- `fell in love moment`
- `chose this`

Save under `## Day 6 — Memory Lane`.

- [ ] **Step 7: Run Day 7 searches (need from me / vulnerable ask / love)**

Search terms:
- `what do you need`
- `feel loved`
- `vulnerable ask`
- `one small thing`
- `direct communication`

Save under `## Day 7 — Spark Conversation`.

- [ ] **Step 8: Assess coverage**

For each day, note:
- **Rich** (5+ usable excerpts with clear stories): ready for assembly
- **Adequate** (2-4 usable excerpts): may need creative bridging
- **Thin** (<2 usable excerpts): flag for Trisha to provide a real story verbally

Record coverage assessment at the top of raw-excerpts.md.

- [ ] **Step 8b: Expand searches for Thin-rated days**

For any day rated **Thin** (<2 usable excerpts):
- Try related/broader terms (e.g., for Day 6: try `relationship story`, `when we started`, `our beginning`)
- Search by speaker filter: add `Trisha` + topic keyword to find her specifically
- Broaden to adjacent themes (e.g., Day 6 "memory" → try `shared meaning`, `connection`, `history together`)
- Update raw-excerpts.md with expanded results and re-assess coverage

If still Thin after expansion, mark it in the coverage assessment. The assembly task for that day will write an AI placeholder and flag it for Trisha's verbal replacement during dry run.

- [ ] **Step 9: Commit mining results**

```bash
git add docs/video-scripts/spark-challenge/transcript-mining/
git commit -m "content: transcript mining for 7 spark challenge video scripts"
```

---

## Task 3: Assemble Day 1 Script — "The 'I Noticed' Text"

**Files:**
- Create: `docs/video-scripts/spark-challenge/day-1-i-noticed-text.md`
- Update: `docs/video-scripts/spark-challenge/README.md` (status row)

**Dependencies:** Task 2 (raw excerpts)

- [ ] **Step 1: Review Day 1 excerpts**

Read `docs/video-scripts/spark-challenge/transcript-mining/raw-excerpts.md`, section `## Day 1`. Identify:
- The strongest personal story (Jeff/Trisha or client) about noticing
- Trisha's exact phrasing for the emotional turn
- Any metaphors or signature phrases

- [ ] **Step 2: Assemble script**

Write `day-1-i-noticed-text.md` using the YAML frontmatter template and beat sheet structure. Rules:
- Hook: "When was the last time you told your partner you noticed something -- not because they asked, but just because you saw it?"
- Story: Use the strongest transcript excerpt. Preserve Trisha's exact words. Fit into 40-60 seconds (~100-150 words).
- Turn: Being noticed = being loved. Use Trisha's phrasing if available, or write a minimal bridge.
- Bridge: "Your inbox has today's exercise -- it takes 30 seconds and it might surprise both of you."
- Close: "I'll see you tomorrow."
- If transcript coverage is thin, write the story section in Trisha's voice profile and set `ai_written_sections: ["story"]` in frontmatter.

- [ ] **Step 3: Quality check**

Run the quality checklist against the script:
- Count words (target 225-300)
- Calculate timing at 150 wpm (target 90-120s)
- Verify >=80% transcript-sourced
- Read aloud mentally — does it sound natural?
- Check: all contractions, max 12 words/sentence, ASCII only

- [ ] **Step 4: Update README tracker**

Update the Day 1 row with word count, transcript %, and status = "draft".

- [ ] **Step 5: Commit**

```bash
git add docs/video-scripts/spark-challenge/day-1-i-noticed-text.md docs/video-scripts/spark-challenge/README.md
git commit -m "content: day 1 video script — the I noticed text"
```

---

## Task 4: Assemble Day 2 Script — "The Specific Spark Compliment"

**Files:**
- Create: `docs/video-scripts/spark-challenge/day-2-specific-spark-compliment.md`
- Update: `docs/video-scripts/spark-challenge/README.md`

**Dependencies:** Task 2

- [ ] **Step 1: Review Day 2 excerpts**

Read raw-excerpts.md `## Day 2`. Find: a story about the difference between generic and specific compliments, Trisha's phrasing on "paying attention."

- [ ] **Step 2: Assemble script**

- Hook: "We say 'you look nice' like it's a reflex. What happens when you get specific?"
- Story: Transcript-sourced moment about specific appreciation landing differently
- Turn: "Specific means 'I was paying attention.' That's what your partner actually hears."
- Bridge: "Check your email -- I'll show you exactly how to do this."
- Close: "See you tomorrow."

- [ ] **Step 3: Quality check** (same checklist as Task 3)

- [ ] **Step 4: Update README + commit**

```bash
git add docs/video-scripts/spark-challenge/day-2-specific-spark-compliment.md docs/video-scripts/spark-challenge/README.md
git commit -m "content: day 2 video script — the specific spark compliment"
```

---

## Task 5: Assemble Day 3 Script — "The 2-Minute Check-In"

**Files:**
- Create: `docs/video-scripts/spark-challenge/day-3-two-minute-check-in.md`
- Update: `docs/video-scripts/spark-challenge/README.md`

**Dependencies:** Task 2

- [ ] **Step 1: Review Day 3 excerpts**

Find: stories about distracted listening vs. real presence, the "how was your day" question. This maps to Module 4 (Active Listening) — search results may include rich content.

- [ ] **Step 2: Assemble script**

- Hook: "How often do you ask about their day and actually listen to the answer?"
- Story: Transcript-sourced moment about distracted listening or the transformation when someone really listens
- Turn: "Two minutes of real listening does more than an hour of half-attention."
- Bridge: "Today's email has the exact question and how to hold space for the answer."
- Close: "See you tomorrow."

- [ ] **Step 3: Quality check**

- [ ] **Step 4: Update README + commit**

```bash
git add docs/video-scripts/spark-challenge/day-3-two-minute-check-in.md docs/video-scripts/spark-challenge/README.md
git commit -m "content: day 3 video script — the 2-minute check-in"
```

---

## Task 6: Assemble Day 4 Script — "The Pause Experiment" (Jeff Cameo)

**Files:**
- Create: `docs/video-scripts/spark-challenge/day-4-pause-experiment.md`
- Update: `docs/video-scripts/spark-challenge/README.md`

**Dependencies:** Task 2

**Special:** This script has TWO speakers. Mark Jeff's section with `[JEFF ENTERS]` and `[JEFF EXITS]` stage directions. Jeff's segment is 30-45 seconds (~75-110 words).

- [ ] **Step 1: Review Day 4 excerpts**

Find: Critter Brain / CEO Brain explanations, 90-Second Wave mentions, stories about tension escalating. Flag any excerpts where Jeff is the speaker — those go in his segment.

- [ ] **Step 2: Assemble script — Trisha sections**

- Hook (Trisha): "Today might be the most important day of this challenge."
- Story (Trisha): A real moment where tension escalated before anyone could think — from transcripts
- Turn (Trisha, after Jeff's segment): "Knowing the science is one thing. Practicing the pause is everything."
- Bridge: "Your email walks you through how to try this the next time tension shows up."
- Close: "See you tomorrow."

- [ ] **Step 3: Assemble script — Jeff segment**

Insert between Story and Turn:

```
[JEFF ENTERS]

[warm, conversational]
Here's what's actually happening in your body when that tension hits.
[Jeff explains the 90-Second Wave in accessible language -- 30-45 seconds]
[Uses "your brain's alarm system" not "amygdala"]

[JEFF EXITS]
```

Jeff's guidelines:
- Physician AND husband, not lecturer
- Accessible language: "your brain's alarm system" not "amygdala hijack"
- 30-45 seconds max (75-110 words)
- Use transcript excerpts where Jeff explains this concept, if available

- [ ] **Step 4: Quality check**

Same checklist, plus:
- Jeff's segment is 30-45 seconds / 75-110 words
- Jeff's language is warm and accessible, not clinical
- Transition in/out of Jeff's segment feels natural

- [ ] **Step 5: Update README + commit**

```bash
git add docs/video-scripts/spark-challenge/day-4-pause-experiment.md docs/video-scripts/spark-challenge/README.md
git commit -m "content: day 4 video script — the pause experiment (Jeff cameo)"
```

---

## Task 7: Assemble Day 5 Script — "The Gratitude Text"

**Files:**
- Create: `docs/video-scripts/spark-challenge/day-5-gratitude-text.md`
- Update: `docs/video-scripts/spark-challenge/README.md`

**Dependencies:** Task 2

- [ ] **Step 1: Review Day 5 excerpts**

Find: stories about gratitude as a practice (not a Hallmark moment), surprise appreciation, mid-day texts.

- [ ] **Step 2: Assemble script**

- Hook: "When did you last tell your partner you're grateful for them -- on a random Tuesday?"
- Story: Transcript-sourced moment about gratitude interrupting autopilot
- Turn: "Gratitude isn't an event. It's a Tuesday afternoon interruption that changes the whole day."
- Bridge: "Your inbox has today's exercise -- it takes less than a minute."
- Close: "See you tomorrow."

- [ ] **Step 3: Quality check**

- [ ] **Step 4: Update README + commit**

```bash
git add docs/video-scripts/spark-challenge/day-5-gratitude-text.md docs/video-scripts/spark-challenge/README.md
git commit -m "content: day 5 video script — the gratitude text"
```

---

## Task 8: Assemble Day 6 Script — "The Memory Lane Moment"

**Files:**
- Create: `docs/video-scripts/spark-challenge/day-6-memory-lane-moment.md`
- Update: `docs/video-scripts/spark-challenge/README.md`

**Dependencies:** Task 2

**Note:** This day is most likely to have THIN transcript coverage (early relationship stories are personal and may not appear in coaching sessions). If <80% transcript-sourced, flag `ai_written_sections` and note that Trisha should provide her real story during the teleprompter dry run.

- [ ] **Step 1: Review Day 6 excerpts**

Find: any mentions of early relationship memories, "the moment I knew", shared history as connection. If thin, broaden to: stories about nostalgia, remembering, or shared meaning.

- [ ] **Step 2: Assemble script**

- Hook: "Do you remember the moment you knew?"
- Story: If transcript material exists, use it. If thin, write a placeholder in Trisha's voice profile and flag it. The story must feel personal -- this is the one day where Trisha's own love story is the centerpiece.
- Turn: "Sharing that memory isn't nostalgia. It's reminding both of you why you chose this."
- Bridge: "Today's email helps you find your moment and share it with your partner."
- Close: "See you tomorrow -- it's our last day together, and it's a special one." (Note: this tease line is AI-written — flag in `ai_written_sections` unless a transcript-sourced equivalent is found.)

- [ ] **Step 3: Quality check**

- [ ] **Step 4: Update README + commit**

```bash
git add docs/video-scripts/spark-challenge/day-6-memory-lane-moment.md docs/video-scripts/spark-challenge/README.md
git commit -m "content: day 6 video script — the memory lane moment"
```

---

## Task 9: Assemble Day 7 Script — "The Spark Conversation" (Jeff + Trisha Together)

**Files:**
- Create: `docs/video-scripts/spark-challenge/day-7-spark-conversation.md`
- Update: `docs/video-scripts/spark-challenge/README.md`

**Dependencies:** Task 2

**Special:** This is the ONLY partially unscripted video. The teleprompter has Trisha's setup and closing. The middle (Jeff's answer) is authentic and unscripted. The script must include production scaffolding for the unscripted segment.

- [ ] **Step 1: Review Day 7 excerpts**

Find: any moments of direct vulnerability between partners, "what do you need from me", asking for needs. Also search for: Trisha reflecting on vulnerability, the power of direct asks.

- [ ] **Step 2: Assemble script — scripted sections**

```markdown
## HOOK (10-15s)

[looking at camera, warm but serious]
This is the last day.
And it's the one that can change everything.

## SETUP (15s)

[turning slightly toward Jeff]
There's a question I'm going to ask Jeff right now.
It's simple.
But it takes courage.
"What's one small thing I could do this week to make you feel loved?"

## LIVE DEMO — UNSCRIPTED (30-45s)

[PRODUCTION NOTE: Trisha turns to Jeff and asks the question. Jeff answers honestly. This is NOT telepromptered. Plan for 2-3 takes. If Jeff's answer is brief, Trisha has a bridge line ready: "I love that -- and that's exactly what this is about." If it runs long, Trisha reaches for his hand and says "That's beautiful" to signal transition.]

## THE TURN (15-20s)

[turning back to camera, softening]
[Trisha reflects on what she just heard -- this section is lightly scripted but she should riff naturally based on Jeff's actual answer. Suggested framing:]
Did you hear that?
That's what happens when you ask.
Not assume. Not guess. Ask.

## BRIDGE + SOFT UPSELL (15-20s)

[warm smile]
Your email has this question and some tips for creating the space for it.

[beat]

And if this week meant something to you --
the full Healing Hearts course goes deeper into every single thing we practiced.
I'd love to keep walking with you.

## CLOSE (5-10s)

[genuine warmth]
Thank you for showing up this week.
I'm proud of you.
```

- [ ] **Step 3: Quality check**

Same checklist, plus:
- Scripted sections fit ~60-75 seconds (leaving 30-45s for unscripted)
- Production notes are clear enough for someone running the shoot
- Soft upsell is warm, not pushy (conversion intensity <=5/10)
- Bridge line for short Jeff answer is included

- [ ] **Step 4: Update README + commit**

```bash
git add docs/video-scripts/spark-challenge/day-7-spark-conversation.md docs/video-scripts/spark-challenge/README.md
git commit -m "content: day 7 video script — the spark conversation (Jeff + Trisha)"
```

---

## Task 10: Cross-Script Consistency Review

**Files:**
- Modify: all 7 script files (if needed)
- Update: `docs/video-scripts/spark-challenge/README.md`

**Dependencies:** Tasks 3-9

- [ ] **Step 1: Read all 7 scripts sequentially**

Read all scripts in order (Day 1 through Day 7) as a viewer would experience them. Check for:

- **Arc:** Does the week build? Days 1-2 (observation) → Day 3 (listening) → Day 4 (self-regulation) → Day 5 (gratitude) → Day 6 (shared history) → Day 7 (direct ask). Each day should feel like a natural next step.
- **Voice consistency:** Does Trisha sound like the same person across all 7? No sudden tone shifts.
- **No repeated phrases:** If two scripts use the same hook structure or metaphor, vary one.
- **Bridge variety:** Each "check your email" bridge should feel fresh, not copy-pasted.
- **Close variety:** "See you tomorrow" can be the anchor, but vary the encouragement line before it.

- [ ] **Step 2: Timing check**

For each script, count words and calculate timing:
- Target: 225-300 words = 90-120 seconds at 150 wpm
- If any script is over 300 words, trim the story section first
- If any script is under 225 words, the story may need more texture

- [ ] **Step 3: Transcript coverage audit**

Check each script's `transcript_coverage` value. Summarize:
- How many scripts are >=80% transcript-sourced?
- Which scripts (if any) are below threshold?
- For below-threshold scripts: is the AI-written content flagged in frontmatter?

- [ ] **Step 4: Fix any issues found**

Make edits directly in the script files. Keep changes minimal — don't rewrite scripts that are working.

- [ ] **Step 5: Update README with final stats + commit**

Update all rows in README tracker with final word counts, transcript %, and status = "draft".

```bash
git add docs/video-scripts/spark-challenge/
git commit -m "content: cross-script consistency review — all 7 spark challenge videos"
```

---

## Task 11: Teleprompter Formatting + Final Handoff

**Files:**
- Create: `docs/video-scripts/spark-challenge/teleprompter/` (7 .txt files)

**File naming convention:**
- `day-1.txt`, `day-2.txt`, `day-3.txt`, `day-4.txt`, `day-5.txt`, `day-6.txt`, `day-7.txt`
- Simple numbering for teleprompter app compatibility (no special characters or long names)

**Dependencies:** Task 10

- [ ] **Step 1: Create teleprompter directory**

```bash
mkdir -p docs/video-scripts/spark-challenge/teleprompter
```

- [ ] **Step 2: Convert each script to teleprompter format**

For each of the 7 scripts, create a `.txt` file that strips YAML frontmatter and section headers, keeping only:
- The spoken text (one sentence per line)
- Emotion cues in brackets
- Stage directions for Jeff segments
- Blank lines between beats for visual pacing

Example output (`teleprompter/day-1.txt`):

```
When was the last time you told your partner
you noticed something --
not because they asked,
but just because you saw it?

[leaning in]

[Story content here, one sentence per line...]

[beat]

[softening]
[Turn content...]

[warm smile]
Your inbox has today's exercise --
it takes 30 seconds
and it might surprise both of you.

I'll see you tomorrow.
```

- [ ] **Step 3: Final word count verification**

Count words in each .txt file (excluding stage directions in brackets). All should be 225-300.

- [ ] **Step 4: Commit teleprompter files**

```bash
git add docs/video-scripts/spark-challenge/teleprompter/
git commit -m "content: teleprompter-formatted scripts for all 7 spark challenge videos"
```

- [ ] **Step 5: Update all script statuses to "trisha-review"**

Update the `status` field in each script's YAML frontmatter from `draft` to `trisha-review`. Update README tracker.

```bash
git add docs/video-scripts/spark-challenge/
git commit -m "content: mark all spark challenge scripts ready for Trisha review"
```

---

## Parallelization Guide

For subagent-driven execution:

- **Task 1** must run first (setup + schema discovery)
- **Task 2** must run second (transcript mining — all subsequent tasks depend on it)
- **Tasks 3-9** can ALL run in parallel (each day is independent)
- **Task 10** must run after Tasks 3-9 complete (cross-script review)
- **Task 11** must run after Task 10 (teleprompter formatting)

**Recommended dispatch:** Tasks 1-2 sequential, then dispatch Tasks 3-9 as 7 parallel subagents, then Tasks 10-11 sequential.

---

## After This Plan

1. **Trisha reviews** all 7 scripts + teleprompter files
2. **Teleprompter dry run** (Trisha reads Day 1 aloud to calibrate scroll speed)
3. **Filming session 1:** Days 1, 2, 3, 5, 6 (Trisha solo)
4. **Filming session 2:** Days 4, 7 (Jeff segments)
5. **Upload to YouTube Unlisted** and add links to Spark Challenge email templates
6. **Email rewrite** through AVNII pipeline using the same transcript-sourced stories
