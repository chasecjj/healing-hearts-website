# Healing Hearts Email Copy Agent — Design Spec

**Date:** 2026-03-24
**Author:** Chase + Claude
**Status:** Draft — awaiting review
**Research:** `Projects/healing-hearts/research/2026-03-24-email-copy-agent-research.md`

---

## 1. Overview

A Claude Code plugin agent that produces high-converting email copy in Trisha
Jamison's authentic voice for all Healing Hearts email needs: drip sequences,
welcome emails, launch sequences, re-engagement, and one-off campaigns.

Three-agent pipeline: **Orchestrator** dispatches a **Copy Expert** (structure)
and a **Voice Writer** (Trisha's tone), then does a final polish pass with
tiebreaker authority on disagreements.

### What this replaces

Manual email writing by Chase or generic AI output that doesn't match Trisha's
voice. The current Spark Challenge emails were written with Trisha's raw content
pasted in — they work but lack email copywriting fundamentals (hooks, subject
line strategy, CTA optimization, sequence pacing).

---

## 2. Architecture

```
User: "Write the welcome email for the Spark Challenge"
  |
  v
ORCHESTRATOR (email-copy agent)
  |
  |-- Loads shared context:
  |     - Style guide (pipeline/foundation/style-guide.md)
  |     - Learner personas (pipeline/foundation/learner-personas.md)
  |     - Email type + sequence position + audience segment
  |
  |-- Dispatches COPY EXPERT subagent
  |     Input: task brief + audience + sequence context
  |     Output: email architecture (NOT prose)
  |       - Subject line candidates (3)
  |       - Preview text
  |       - Hook type + opening line direction
  |       - Section flow (AVNII framework stages)
  |       - CTA copy + placement
  |       - PS line recommendation
  |       - Format recommendation (plain text vs HTML)
  |
  |-- Reviews architecture, adjusts if needed
  |
  |-- Dispatches VOICE WRITER subagent
  |     Input: Copy Expert architecture + voice profile + transcript excerpts
  |     Output: complete email draft in Trisha's voice
  |       - Locked to Copy Expert's structure (no reordering)
  |       - Trisha's vocabulary, cadence, emotional signature
  |       - Personal story woven in (from transcripts if available)
  |
  |-- FINAL POLISH (orchestrator itself)
  |     - Deliverability check (spam triggers, link count, formatting)
  |     - Shared-device subject line test
  |     - Anti-shame audit
  |     - You/I ratio check (target: 3:1)
  |     - Reading level check (Grade 6-8)
  |     - Resolves any Copy Expert vs Voice Writer conflicts
  |     - Picks best subject line from candidates
  |
  v
Final email copy returned to user
```

---

## 3. The AVNII Framework

### Evolution from research

The research identified three candidate frameworks:
- **SEIA** (Story -> Empathy -> Insight -> Action) — our initial 4-stage design
  that mirrors Trisha's natural teaching rhythm
- **PAV** (Problem -> Acknowledge -> Vision) — the niche-specific replacement for
  PAS that swaps "Agitate" for "Acknowledge"
- **BAB** (Before -> After -> Bridge) — research-validated for warm coaching audiences

AVNII synthesizes all three into a 5-stage framework. The key addition over SEIA
is splitting "Empathy" into two distinct stages: **Validate** (personal — "you're
not broken") and **Normalize** (universal — "this is common"). Research on
sensitive-topic copywriting found that validation without normalization feels like
pity, while normalization without validation feels dismissive. Both are needed,
in that order.

### The 5 stages

| Stage | Purpose | What the Copy Expert specifies |
|-------|---------|-------------------------------|
| **Acknowledge** | Name the reader's situation specifically | Opening hook direction — a scene, a feeling, a moment they'll recognize |
| **Validate** | "You're not broken for feeling this" | Personal validation — what makes THEIR experience legitimate |
| **Normalize** | "This is more common than you think" | Universal frame — data point, "we hear this all the time," broader pattern |
| **Illuminate** | The teaching moment / reframe | Core insight that shifts their perspective — the value of the email |
| **Invite** | One clear, soft next step | CTA type, copy direction, placement |

**Not every email uses all 5 stages.** The Copy Expert selects which stages to
emphasize based on email type (see Section 9). One-liners use only Acknowledge.
Teaching emails lean on Illuminate. Pitch emails use full AVNII with the Invite
stage carrying offer details (this replaces the BAB reference — Before maps to
Acknowledge, After maps to Illuminate, Bridge maps to Invite).

**Why not PAS:** The "Agitate" step exploits pain. Research shows this is the #1
unsubscribe trigger in relationship coaching. Shame-driven copy converts short-term
but destroys trust and causes refunds.

**Why not AIDA:** "Attention" via clickbait or shock works for cold audiences but
breaks the personal, safe-space tone that relationship coaching requires. AVNII
earns attention through recognition ("that's exactly how I feel") instead of
manufactured urgency.

---

## 4. Copy Expert Subagent

### Role
Strategic email architect. Outputs structure and copy direction, never prose.
Thinks like a senior direct-response strategist handing a brief to a voice writer.

### System prompt context (loaded every invocation)
- AVNII framework definition and stage-by-stage rules
- Email type templates (welcome, teaching, story, pitch, breakup, re-engagement)
- Subject line rules (4-7 words, curiosity gap, shared-device safe)
- CTA rules (single CTA, benefit-oriented, text link for plain text)
- Sequence position awareness (what came before, what comes next)
- Anti-shame rules (explicit list of forbidden patterns)
- Format selection logic (plain text default; HTML only for branded announcements)

### Input parameters (provided by orchestrator)

```
TASK: [what this email needs to accomplish]
EMAIL TYPE: welcome | teaching | story | pitch | breakup | re-engagement | one-liner
PRIMARY PERSONA: [Claire | Marcus | Sarah | David+Linda] — target reader profile
SECONDARY PERSONA: [optional — if email should resonate with a second profile]
SEQUENCE CONTEXT:
  - Sequence name: [e.g., "Spark Challenge Drip"]
  - Position: [N of M]
  - Previous subjects: [list of subject lines already sent]
  - Previous CTA types: [reply prompt | link | purchase | none]
  - Solo-subscriber email sent: [yes | no — if no and position >= 3, flag for inclusion]
AUDIENCE SEGMENT: [warm lead | cold lead | enrolled | re-engagement]
```

### Output format (structured brief)

```
SUBJECT LINE CANDIDATES:
1. [candidate] — [rationale]
2. [candidate] — [rationale]
3. [candidate] — [rationale]

PREVIEW TEXT: [complement to subject, not repeat]

FORMAT: plain-text | html
ESTIMATED LENGTH: [word count target]
EMAIL TYPE: [selected type]
PRIMARY PERSONA: [name] — [how this affects the tone]

AVNII STAGES (mark N/A for stages not used in this email type):
- ACKNOWLEDGE: [hook direction — scene/feeling/moment to open with]
- VALIDATE: [personal validation angle] or N/A
- NORMALIZE: [data point or "we hear this" frame] or N/A
- ILLUMINATE: [core insight / reframe / teaching point]
- INVITE: [CTA type + copy direction]

PS LINE: [recommendation or "none"]

TRANSCRIPT SEARCH TERMS: [2-3 keywords for Voice Writer to search coaching transcripts]

NOTES FOR VOICE WRITER:
- [any specific tone guidance for this email]
- [story angle if applicable]
- [words/phrases to use or avoid for this topic]
- [persona-specific adjustments: e.g., "Marcus needs zero blame language"]
```

### Anti-shame rules (embedded in Copy Expert prompt)

```
FORBIDDEN — these patterns cause unsubscribes in this audience:
- "If you keep doing nothing, your marriage will..." (threat framing)
- Stacking 3+ pain points in one paragraph (agitation spiral)
- "You need to..." / "You should..." (unsolicited advice framing)
- "Your marriage is failing/broken/dying" (crisis labeling)
- "Don't you want to save your relationship?" (guilt question)
- Comparing the reader unfavorably to other couples
- Implying their faith should have prevented this
- Subject lines with crisis/shame language visible in notifications

REQUIRED — these patterns build trust:
- Acknowledge before teaching (never lead with advice)
- Validate before reframing (never skip straight to "here's what to do")
- One specific, ordinary-language scene per email (not abstract concepts)
- Hope-forward closing (what could be, not what will be lost)
- Permission language ("It's okay to..." / "A lot of couples...")
```

---

## 5. Voice Writer Subagent

### Role
Translates the Copy Expert's structural brief into Trisha Jamison's authentic
voice. Does NOT restructure — only writes prose within the locked architecture.

### System prompt context (loaded every invocation)
- Full 5-component voice profile (see Section 7)
- Style guide terminology rules (Critter Brain, CEO Brain, etc.)
- Transcript search results for the email's topic (when PHEDRIS available)
- The Copy Expert's structural brief (the architecture to fill)

### Voice transformation rules

```
STRUCTURE RULES:
- Follow the Copy Expert's section order exactly — do not reorder
- Do not remove or add sections — translate what's there
- If the Copy Expert specified a PS line, write it
- If the Copy Expert specified plain-text format, do not add HTML formatting

VOICE RULES:
- Use Trisha's signature phrases naturally: "This makes sense," "That's huge,"
  "I want to go back to..."
- Open with warmth but not breathlessness — grounded, not manic energy
- Include one personal Jeff + Trisha moment when the Copy Expert's brief
  calls for a story (search transcripts for authentic material first)
- Convert any clinical language from the brief into Trisha's metaphor style
  (smoke alarms, invisible backpacks, Coca-Cola bottles, ancient protective wiring)
- Match Trisha's cadence: mix of short declarative sentences and longer
  empathetic ones. Never all short. Never all long.
- Contractions always (I'm, you're, we've, it's — never "I am," "you are")
- Direct address: "you" not "couples" or "partners"
- Humor: light, warm, occasional (max 1 per email), self-aware, never sarcastic

VOCABULARY — ALWAYS USE:
- activation (not "triggered")
- Critter Brain / CEO Brain (not lizard brain, rational brain)
- practice (not "exercise")
- ancient protective wiring (not "primitive instincts")
- SPARK Method, Zones of Resilience (proper capitalization)

VOCABULARY — NEVER USE:
- "In today's fast-paced world..."
- "It's important to note that..."
- "Additionally / Furthermore"
- "on your healing journey"
- "Transformative tools and resources..."
- "leverage," "optimize," "seamless," "unlock"
- "triggered" (use "activated")
- "dysfunctional," "primitive"
```

### Transcript search (when PHEDRIS available)

Before writing, the Voice Writer queries PHEDRIS for Trisha's actual language
on the email's topic:

```
Query: ssh_execute on phedris server
  sudo -u postgres psql -d phedris -t -A -c
  "SELECT content FROM documents
   WHERE content ILIKE '%[topic keyword]%'
   AND source_type = 'coaching_transcript'
   LIMIT 5"
```

This surfaces real phrases, real stories, real metaphors Trisha has used in
coaching sessions. The Voice Writer weaves these in — not copy-pasted, but
used as authentic source material for the voice.

**Fallback:** If PHEDRIS is unavailable, the Voice Writer works from the voice
profile alone. The email will still be good; it just won't have transcript-sourced
authenticity.

---

## 6. Orchestrator — Final Polish

The orchestrator performs the final pass after receiving the Voice Writer's draft.
This is where disagreements between Copy Expert structure and Voice Writer
execution get resolved.

### Deliverability checklist (mechanical — run on every email)

**Per-email structural checks (agent runs these):**
```
[ ] No ALL CAPS words
[ ] Max 1 exclamation point per paragraph
[ ] No consecutive exclamation points (!!)
[ ] No shortened URLs (bit.ly, tinyurl)
[ ] Max 3 hyperlinks total
[ ] No spam trigger words in subject line (free, urgent, act now, limited time,
    guaranteed, risk-free, last chance)
[ ] Body is 200+ words
[ ] Color contrast >= 4.5:1 for body text, >= 3:1 for 18px+ text (HTML only)
[ ] Plain-text version generated alongside HTML (if HTML format)
[ ] Every <img> has alt attribute; decorative images use alt="" (HTML only)
[ ] Font size >= 14px, recommended 16px body (HTML only)
[ ] Line height >= 1.5x font size (HTML only)
[ ] CTA button >= 44x44px (HTML only)
[ ] <html lang="en"> set (HTML only)
[ ] Layout tables have role="presentation" (HTML only)
```

**ESP health metrics (monitored operationally, not per-email):**
These cannot be checked by the agent but should be noted in documentation:
- Spam complaint rate: keep under 0.08% (Gmail threshold 0.10%)
- Hard bounce rate: keep under 2% (Resend enforces 4% cap)
- Domain warmup: never increase volume by more than 2x/day

### Shared-device subject line test

```
For each subject line candidate, answer:
- If this appeared as a phone notification while the reader's partner
  was sitting next to them, would it cause embarrassment or reveal
  that the reader signed up for a relationship course?
- If YES → reject the subject line
- If MAYBE → rewrite to be more ambiguous

SAFE examples: "Something I re-read this morning," "One shift"
UNSAFE examples: "Your marriage needs this," "Are you growing apart?"
```

### Anti-shame audit

```
Scan the full email for:
- Any sentence that implies the reader is at fault for their situation
- Any sentence that stacks pain without immediate validation
- Any "if you don't act" threat framing
- Any comparison to other couples ("most happy couples do X")
- Any assumption that both partners are engaged and enrolled
- Any faith-shame triggers ("you took vows," "God's plan for marriage")
- Any reply prompts that imply a "correct" response ("tell me what you'll
  do differently" implies they should be doing something differently —
  rewrite as open-ended: "tell me what resonated")
- Any reflection questions with embedded judgment ("why haven't you tried
  this before?" — rewrite as curious: "what comes up for you when you
  read this?")

If found: rewrite the offending passage using Acknowledge -> Validate framing
```

### Quality metrics

```
- You/I ratio: target 3:1 (count occurrences of "you/your" vs "I/me/my")
- Reading level: Grade 6-8 (Flesch-Kincaid)
- Word count: within Copy Expert's target +/- 20%
- Single CTA: exactly one primary call-to-action
- Subject line: 4-7 words, under 50 characters
```

### Final output format (returned to user)

```
SUBJECT LINE: [chosen subject line]
PREVIEW TEXT: [chosen preview text]
FORMAT: plain-text | html

--- EMAIL BODY ---
[the complete email copy, ready to send]
--- END ---

PLAIN-TEXT VERSION:
[if HTML format: the text/plain multipart alternative]

QUALITY METRICS:
- You/I ratio: [X:Y]
- Reading level: Grade [N]
- Word count: [N]
- CTA count: [N]
- Link count: [N]

FLAGS (if any):
- [any items requiring human review before sending]
```

### Conflict resolution

When the Voice Writer's draft diverges from the Copy Expert's architecture:

- **Structure changes** (reordered sections, removed CTA, added sections):
  Revert to Copy Expert's structure. Voice Writer doesn't restructure.
- **Softened hook** (Voice Writer made the opening less specific/punchy):
  Use Voice Writer's tone but Copy Expert's specificity. Merge.
- **Weakened CTA** (Voice Writer made "Join now" into "whenever you're ready"):
  For pitch emails: use Copy Expert's CTA strength. For nurture: Voice Writer wins.
- **Added content** (Voice Writer added a story or metaphor not in the brief):
  Keep if it serves a structural purpose. Cut if it's filler or extends word count
  beyond target.

---

## 7. Voice Profile: 5-Component System

The Voice Writer agent needs Trisha's actual voice profile built from her
312K words of coaching transcripts. The existing `voice-profile.md` was
designed for course module content (2,000+ word lessons). Email voice
differs in key ways:

**Email vs course voice adaptations:**
- Shorter paragraphs (1-3 sentences vs 3-5 in modules)
- Opener variety matters more (each email competes for attention independently)
- Closing warmth is compressed (sign-off replaces gradual lesson wind-down)
- Story length is 2-3 paragraphs max (vs full-page narratives in modules)
- Energy is slightly higher (modules can be measured; emails need to pull you in)

**For v1:** The existing voice-profile.md + style-guide.md provide sufficient
grounding. The Voice Writer's email-specific rules (Section 5) handle the
format adaptation. A full 5-component extraction from transcripts would
improve quality significantly and should happen before the agent is used
for launch-critical emails (enrollment sequence, pitch window).

### Component 1: Vocabulary rules
- **Source:** Style guide + transcript frequency analysis
- **Format:** Two lists — "always use" and "never use" with specific word pairs
- **Already documented:** style-guide.md has terminology table
- **Needs extraction:** Trisha's most-used transition phrases, pet phrases,
  filler words to preserve or remove

### Component 2: Cadence rules
- **Source:** Transcript analysis
- **Format:** Average sentence length, paragraph length patterns, opener variety
- **Needs extraction:** Does Trisha lead with questions? Actions? "You know" openers?
  What's her ratio of short to long sentences?

### Component 3: Structural patterns
- **Source:** Transcript analysis + existing course content
- **Format:** Punctuation preferences, list style, section transitions
- **Already documented:** voice-profile.md has some of this
- **Needs extraction:** Em-dash frequency, parenthetical frequency, numbered vs
  bulleted list preference

### Component 4: Emotional signature
- **Source:** Voice profile + transcript analysis
- **Format:** One sentence that captures the FEELING, not the adjectives
- **Current approximation:** "Like a friend who's been through it and doesn't
  pretend it was easy, but genuinely believes you can get through it too"
- **Needs validation:** Against actual transcript excerpts

### Component 5: On-brand vs off-brand pairs
- **Source:** Must be manually curated
- **Format:** 5-10 pairs showing the same idea expressed correctly vs incorrectly
- **Highest leverage component per research** — showing the AI the boundary
  matters more than showing it the center
- **Example pair:**
  - ON: "Here's the thing nobody tells you: your body is keeping score long
    before your mind catches up."
  - OFF: "The physiological stress response often precedes conscious emotional
    recognition in relationship conflicts."

---

## 8. Plugin Structure

```
.claude/plugins/healing-hearts-email/
  plugin.json                    — Plugin manifest
  agents/
    email-copy.md                — Orchestrator (user-facing)
    email-copy-expert.md         — Copy Expert subagent
    email-voice.md               — Voice Writer subagent
  context/
    avnii-framework.md           — Framework reference
    deliverability-rules.md      — Spam/accessibility checklist
    anti-shame-rules.md          — Forbidden patterns + required patterns
    email-types.md               — Templates per email type
    subject-line-rules.md        — Rules + shared-device test
    sequence-design.md           — Drip sequence pacing + 80/20 rule
```

### Agent descriptions (for triggering)

**email-copy** (orchestrator):
> "Use when writing any Healing Hearts email — drip sequences, welcome emails,
> launch campaigns, re-engagement. Produces conversion-optimized copy in Trisha's
> authentic voice through a 3-stage pipeline."

**email-copy-expert** (subagent — not user-facing):
> Internal. Produces email architecture briefs using the AVNII framework.

**email-voice** (subagent — not user-facing):
> Internal. Translates structural briefs into Trisha Jamison's voice using
> voice profile and coaching transcript search.

---

## 9. Email Type Templates

The Copy Expert selects a template based on the email's purpose. Each template
modifies which AVNII stages get emphasis.

| Type | AVNII emphasis | Length | CTA style |
|------|---------------|--------|-----------|
| **Welcome** | Heavy Acknowledge + Validate | 150-250 words | Reply prompt, no link |
| **Teaching** | Heavy Illuminate | 200-400 words | Content link or reply |
| **Story** | Heavy Acknowledge (all narrative) | 300-500 words | Soft link at end |
| **Pitch** | Full AVNII + offer details | 300-600 words | Single purchase CTA |
| **Breakup** | Acknowledge + direct Invite | 150-250 words | Last-chance CTA |
| **Re-engagement** | Pattern interrupt + Validate | 50-150 words | Reply prompt |
| **One-liner** | Pure Acknowledge | 1-2 sentences | Reply or curiosity click |

### Sequence pacing rules

- Email 1 (welcome): Deliver promised value. No pitch. End with reply prompt.
- Emails 2-4 (nurture): Teaching + story. 80% value.
- Email 3 or 4: Include the "solo subscriber" validation message.
- Emails 5-6 (proof): Transformation stories + objection handling.
- Email 7+ (pitch window): Full AVNII with heavy Invite stage (Acknowledge=where
  they are now, Illuminate=where they could be, Invite=how to get there). Daily
  cadence acceptable.
- Final email: Breakup format. Frequently highest-converting email (2-3x earlier pitches).

### The solo-subscriber email (required in every sequence)

One email in the first 4 must include language like:
> "You might be reading this without your partner knowing. That's okay. A lot of
> the most meaningful changes in relationships start with one person deciding to
> show up differently."

This email typically gets the highest reply rate in relationship sequences.

---

## 10. Format Rules

### Default: Plain text
- Research: 21-42% more clicks than HTML
- Coaching audience in private pain = personal, safe, human tone
- Gmail rewards "looks like a message people send each other"
- Use for: all drip sequences, welcome, teaching, story, pitch, re-engagement

### Exception: HTML
- Use for: branded newsletters, product announcements, event invitations
- When HTML: follow all accessibility rules (Section 6 checklist)
- Minimal design — cream background, white card, single column
- Match the existing spark-shared.js template style

### Plain-text formatting rules
- Short paragraphs (1-3 sentences, separated by blank line)
- No markdown formatting (no **, no ##) — just natural text
- Links as full URLs on their own line, or naturally hyperlinked phrases
- Signature block: name, title, one-line tagline
- PS line on its own, preceded by blank line

---

## 11. Tradeoffs and Risks

### Tradeoffs

1. **3 agents vs 1 agent:** More token cost per invocation (~3x). But genuine
   separation of concerns prevents the "warm but structurally weak" or
   "well-structured but cold" failure modes that single-agent approaches produce.
   For 10-20 emails total, the cost is negligible.

2. **Plain text default vs HTML:** Loses visual branding. But gains deliverability,
   engagement, and the "real person" signal that this audience needs. The brand
   lives in the voice, not the template.

3. **Voice profile prerequisite:** The agent works with current voice docs, but
   a proper 5-component profile extraction from transcripts would make it
   significantly better. This is a one-time investment that improves every
   future email.

4. **Transcript search dependency:** PHEDRIS must be available for the Voice
   Writer to search coaching transcripts. Graceful fallback exists, but
   transcript-sourced emails are measurably more authentic.

### Risks

1. **Voice drift over time.** Without periodic re-grounding against transcripts,
   the Voice Writer may drift toward generic "warm coach" voice. Mitigation:
   re-run transcript search for every email, not just the first.

2. **Over-softened CTAs.** The anti-shame rules and soft-CTA defaults could
   make pitch emails too passive. Mitigation: the orchestrator's conflict
   resolution rules explicitly let the Copy Expert win on CTA strength for
   pitch emails.

3. **Subject line conservatism.** The shared-device test could filter out
   subject lines that are specific and effective. Mitigation: the test
   filters for shame/crisis language, not specificity. "The night we
   almost gave up" passes (personal, story-like). "YOUR MARRIAGE IS
   IN TROUBLE" does not.
