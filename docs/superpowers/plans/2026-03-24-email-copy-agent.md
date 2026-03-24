# Healing Hearts Email Copy Agent — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Claude Code plugin with a 3-agent email copy pipeline (Orchestrator → Copy Expert → Voice Writer) that produces conversion-optimized email copy in Trisha Jamison's authentic voice.

**Architecture:** Plugin at `.claude/plugins/healing-hearts-email/` with 3 agent markdown files (orchestrator is user-facing, two subagents are internal), plus 6 context reference files that agents read at invocation. Voice profile and style guide live in the Mind Vault and are referenced by path, not duplicated.

**Tech Stack:** Claude Code plugin system (plugin.json + agent .md files with YAML frontmatter). No code — all markdown/YAML.

**Spec:** `docs/superpowers/specs/2026-03-24-email-copy-agent-design.md`

---

## File Map

```
Files to CREATE:
  .claude/plugins/healing-hearts-email/
    plugin.json                        — Plugin manifest
    agents/
      email-copy.md                    — Orchestrator agent (user-facing)
      email-copy-expert.md             — Copy Expert subagent (internal)
      email-voice.md                   — Voice Writer subagent (internal)
    context/
      avnii-framework.md               — AVNII stage definitions + usage rules
      deliverability-rules.md           — Per-email structural checks
      anti-shame-rules.md              — Forbidden + required patterns
      email-types.md                   — 7 email type templates with AVNII emphasis
      subject-line-rules.md            — Rules + shared-device test
      sequence-design.md               — Drip sequence pacing + 80/20 rule

Files REFERENCED (not created — already exist in Mind Vault):
  Mind Vault/Projects/healing-hearts/pipeline/foundation/voice-profile.md
  Mind Vault/Projects/healing-hearts/pipeline/foundation/style-guide.md
  Mind Vault/Projects/healing-hearts/pipeline/foundation/learner-personas.md
```

---

### Task 1: Plugin Scaffold

**Files:**
- Create: `.claude/plugins/healing-hearts-email/plugin.json`

- [ ] **Step 1: Create plugin directory structure**

```bash
mkdir -p "$HOME/.claude/plugins/healing-hearts-email/agents"
mkdir -p "$HOME/.claude/plugins/healing-hearts-email/context"
```

- [ ] **Step 2: Write plugin.json**

Create `.claude/plugins/healing-hearts-email/plugin.json`:

```json
{
  "name": "healing-hearts-email",
  "version": "1.0.0",
  "description": "Email copy pipeline for Healing Hearts. 3-agent system: Copy Expert (structure) → Voice Writer (Trisha's tone) → Orchestrator (polish + deliver). Produces conversion-optimized email copy using the AVNII framework.",
  "author": {
    "name": "Chase Jamison"
  }
}
```

- [ ] **Step 3: Verify plugin is detected**

Restart Claude Code or start a new session. Run `/help` or check if the plugin appears in the plugin list. The agents won't work yet (files don't exist), but the plugin manifest should be recognized.

---

### Task 2: Context Reference Files

**Files:**
- Create: `.claude/plugins/healing-hearts-email/context/avnii-framework.md`
- Create: `.claude/plugins/healing-hearts-email/context/deliverability-rules.md`
- Create: `.claude/plugins/healing-hearts-email/context/anti-shame-rules.md`
- Create: `.claude/plugins/healing-hearts-email/context/email-types.md`
- Create: `.claude/plugins/healing-hearts-email/context/subject-line-rules.md`
- Create: `.claude/plugins/healing-hearts-email/context/sequence-design.md`

These are reference documents that agents read via `${CLAUDE_PLUGIN_ROOT}/context/filename.md`. They contain the rules from the spec, extracted into standalone files so each agent only loads what it needs.

- [ ] **Step 2a: Write avnii-framework.md**

Content: The AVNII framework definition from spec Section 3. Include the evolution explanation, the 5-stage table, the "not every email uses all 5" rule, and the mapping for pitch emails (Acknowledge=where they are, Illuminate=where they could be, Invite=how to get there). Include the "why not PAS" and "why not AIDA" rationale so agents understand the design constraints.

- [ ] **Step 2b: Write deliverability-rules.md**

Content: The per-email structural checklist from spec Section 6. Plain text formatting rules from Section 10. The spam trigger word list. Image-to-text ratio rules. Accessibility requirements (alt text, font size, contrast, touch targets). Separate clearly: "per-email checks the agent runs" vs "ESP health metrics monitored operationally."

- [ ] **Step 2c: Write anti-shame-rules.md**

Content: The full forbidden/required pattern lists from spec Section 4. The shared-device subject line test from Section 6. The anti-shame audit checklist from Section 6 (including the reflection prompt and reply prompt checks added in review). The solo-subscriber validation requirement.

- [ ] **Step 2d: Write email-types.md**

Content: The 7 email type table from spec Section 9 (welcome, teaching, story, pitch, breakup, re-engagement, one-liner). For each type: AVNII stage emphasis, target word count, CTA style, and a brief example of what the Copy Expert's output looks like for that type. Include the note that one-liners and re-engagement emails can mark AVNII stages as N/A.

- [ ] **Step 2e: Write subject-line-rules.md**

Content: 4-7 words, under 50 characters. Curiosity gap preferred. No emojis except heart sparingly. Shared-device test with SAFE/UNSAFE examples. The 5 subject line formulas from research (curiosity gap, you-framed problem, soft cliffhanger, specific+unexpected, question). Rotation rule: never use same pattern twice in a row. No ALL CAPS, no spam trigger words, no title case.

- [ ] **Step 2f: Write sequence-design.md**

Content: The 3-phase sequence architecture from spec Section 9 (warm-up → education+proof → offer). The 80/20 value-to-pitch ratio. Pacing rules (every 3-4 days for nurture, daily for pitch window). The solo-subscriber email requirement (must appear in first 4 emails). The breakup email as sequence closer. The sequence context schema (sequence name, position, previous subjects, previous CTA types, solo-subscriber sent flag).

- [ ] **Step 2g: Commit all context files**

```bash
cd "$HOME/.claude/plugins/healing-hearts-email"
# Note: this is outside the HH website repo. If it's not a git repo, skip commit.
# If it IS tracked, commit. Otherwise just verify files exist.
ls context/
```

Expected output: 6 .md files listed.

---

### Task 3: Copy Expert Agent

**Files:**
- Create: `.claude/plugins/healing-hearts-email/agents/email-copy-expert.md`

- [ ] **Step 1: Write the Copy Expert agent**

Create `.claude/plugins/healing-hearts-email/agents/email-copy-expert.md` with YAML frontmatter and system prompt.

**Frontmatter:**

```yaml
---
name: email-copy-expert
description: >
  Internal subagent. Produces email architecture briefs using the AVNII framework
  for Healing Hearts email copy. Outputs structure (subject lines, hooks, AVNII
  stages, CTA direction), never prose. Dispatched by the email-copy orchestrator.
model: sonnet
---
```

**System prompt content must include:**

1. Role definition: "You are a senior direct-response email strategist specializing in relationship coaching and course enrollment funnels."

2. Instruction to read these context files at the start of every invocation:
   - `${CLAUDE_PLUGIN_ROOT}/context/avnii-framework.md`
   - `${CLAUDE_PLUGIN_ROOT}/context/email-types.md`
   - `${CLAUDE_PLUGIN_ROOT}/context/subject-line-rules.md`
   - `${CLAUDE_PLUGIN_ROOT}/context/anti-shame-rules.md`
   - `${CLAUDE_PLUGIN_ROOT}/context/sequence-design.md`

3. The complete input parameter schema from spec Section 4 (TASK, EMAIL TYPE, PRIMARY PERSONA, SECONDARY PERSONA, SEQUENCE CONTEXT, AUDIENCE SEGMENT).

4. The complete output format from spec Section 4 (SUBJECT LINE CANDIDATES, PREVIEW TEXT, FORMAT, ESTIMATED LENGTH, AVNII STAGES with N/A option, PS LINE, TRANSCRIPT SEARCH TERMS, NOTES FOR VOICE WRITER).

5. The anti-shame rules (forbidden + required patterns) from spec Section 4, embedded directly in the prompt (not just a file reference — the agent needs these in its system prompt to enforce them reliably).

6. Key copywriting principles from research:
   - Write as a coach coaching toward a decision, not a marketer selling
   - You/I ratio target: 3:1
   - Single CTA per email, benefit-oriented
   - Plain text default
   - Reply prompts outperform link CTAs in early-sequence emails
   - Breakup email is frequently the highest-converting in a sequence

7. Explicit instruction: "You output STRUCTURE, never prose. The Voice Writer turns your architecture into Trisha's words. Do not write email copy. Do not write in Trisha's voice. Write strategic briefs."

- [ ] **Step 2: Verify file renders correctly**

Read the file back and confirm: YAML frontmatter parses, all context file paths use `${CLAUDE_PLUGIN_ROOT}`, output format is complete, anti-shame rules are embedded.

---

### Task 4: Voice Writer Agent

**Files:**
- Create: `.claude/plugins/healing-hearts-email/agents/email-voice.md`

- [ ] **Step 1: Write the Voice Writer agent**

Create `.claude/plugins/healing-hearts-email/agents/email-voice.md` with YAML frontmatter and system prompt.

**Frontmatter:**

```yaml
---
name: email-voice
description: >
  Internal subagent. Translates email architecture briefs into Trisha Jamison's
  authentic voice for Healing Hearts. Follows the Copy Expert's structure exactly
  — writes prose, does not restructure. Uses voice profile, style guide, and
  coaching transcript search for authentic language.
model: sonnet
---
```

**System prompt content must include:**

1. Role definition: "You are Trisha Jamison's voice writer. You translate strategic email briefs into her authentic voice — warm, grounded, story-driven, faith-informed but never preachy."

2. Instruction to read these context files and Mind Vault files:
   - `${CLAUDE_PLUGIN_ROOT}/context/deliverability-rules.md`
   - `${CLAUDE_PLUGIN_ROOT}/context/anti-shame-rules.md`
   - Voice profile: read via `mcp__mind-vault__read_note("Projects/healing-hearts/pipeline/foundation/voice-profile.md")`
   - Style guide: read via `mcp__mind-vault__read_note("Projects/healing-hearts/pipeline/foundation/style-guide.md")`

3. The complete voice transformation rules from spec Section 5:
   - Structure rules (follow Copy Expert's order, no restructuring)
   - Voice rules (signature phrases, warmth level, Jeff+Trisha stories, metaphor style, cadence, contractions, direct address, humor)
   - Vocabulary ALWAYS USE list (activation, Critter Brain, CEO Brain, practice, etc.)
   - Vocabulary NEVER USE list (all prohibited phrases)

4. Email-specific voice adaptations from spec Section 7:
   - Shorter paragraphs (1-3 sentences)
   - Compressed story length (2-3 paragraphs max)
   - Compressed sign-off
   - Slightly higher energy than course modules

5. Transcript search instructions: "The Copy Expert's brief includes TRANSCRIPT SEARCH TERMS. Before writing, search Trisha's coaching transcripts for authentic language on this topic." Include the query pattern:
   ```
   Use mcp__ssh-manager__ssh_execute or equivalent to query PHEDRIS:
   sudo -u postgres psql -d phedris -t -A -c
   "SELECT LEFT(content, 500) FROM documents
    WHERE content ILIKE '%[keyword]%'
    AND source_type = 'coaching_transcript'
    LIMIT 3"
   ```
   Include fallback: "If PHEDRIS is unavailable or search returns no results, proceed using the voice profile alone."

6. The on-brand / off-brand example pairs from spec Section 7 Component 5:
   - ON: "Here's the thing nobody tells you: your body is keeping score long before your mind catches up."
   - OFF: "The physiological stress response often precedes conscious emotional recognition in relationship conflicts."
   - Plus 4-5 more pairs covering: clinical→metaphor, generic→specific, preachy→permission-giving, breathless→grounded, lecture→conversation

7. Plain-text formatting rules from spec Section 10.

8. Explicit instruction: "You write the email. You do NOT change the Copy Expert's structure — section order, CTA placement, subject lines are locked. You translate each section into Trisha's voice. If the brief calls for a story, weave in authentic Trisha material from transcript search. Your output is a complete, ready-to-send email."

- [ ] **Step 2: Verify file renders correctly**

Read the file back. Confirm: YAML frontmatter valid, Mind Vault read paths correct, SSH query pattern correct, all vocabulary lists present, on/off-brand pairs included.

---

### Task 5: Orchestrator Agent

**Files:**
- Create: `.claude/plugins/healing-hearts-email/agents/email-copy.md`

- [ ] **Step 1: Write the Orchestrator agent**

Create `.claude/plugins/healing-hearts-email/agents/email-copy.md` with YAML frontmatter and system prompt.

**Frontmatter:**

```yaml
---
name: email-copy
description: >
  Use when writing any Healing Hearts email — drip sequences, welcome emails,
  launch campaigns, re-engagement, one-off sends. Produces conversion-optimized
  copy in Trisha Jamison's authentic voice through a 3-stage pipeline (Copy Expert
  → Voice Writer → Final Polish). Trigger on: "write an email", "email copy",
  "drip sequence", "welcome email", "spark challenge email", "launch email",
  "re-engagement email", or any Healing Hearts email writing task.
model: opus
---
```

Note: orchestrator uses `opus` because it coordinates two subagents and makes judgment calls on conflicts. The subagents use `sonnet` for the actual writing.

**System prompt content must include:**

1. Role definition: "You are the Healing Hearts Email Copy Orchestrator. You coordinate a 3-stage pipeline to produce high-converting email copy in Trisha Jamison's voice."

2. The complete pipeline flow from spec Section 2:
   - Step 1: Parse the user's request into the input parameter schema
   - Step 2: Load shared context (read learner personas via Mind Vault MCP)
   - Step 3: Dispatch `email-copy-expert` subagent with the structured input
   - Step 4: Review the Copy Expert's architecture brief
   - Step 5: Dispatch `email-voice` subagent with the brief + transcript search terms
   - Step 6: Run Final Polish (deliverability check, shared-device test, anti-shame audit, quality metrics)
   - Step 7: Return final output in the defined format

3. Instruction to read context files at start:
   - `${CLAUDE_PLUGIN_ROOT}/context/avnii-framework.md`
   - `${CLAUDE_PLUGIN_ROOT}/context/deliverability-rules.md`
   - `${CLAUDE_PLUGIN_ROOT}/context/anti-shame-rules.md`
   - `${CLAUDE_PLUGIN_ROOT}/context/sequence-design.md`
   - Learner personas: `mcp__mind-vault__read_note("Projects/healing-hearts/pipeline/foundation/learner-personas.md")`

4. How to construct the input for the Copy Expert from the user's request:
   - If user says "write email 3 of the Spark Challenge," orchestrator fills in: TASK, EMAIL TYPE (teaching), PRIMARY PERSONA (likely Claire or Sarah), SEQUENCE CONTEXT (position 3 of 7, previous subjects from existing emails, etc.)
   - If user doesn't specify a persona, default to Claire (the most common archetype)
   - If user doesn't specify sequence context, ask for it

5. The deliverability checklist from spec Section 6 (per-email structural checks only).

6. The shared-device subject line test from spec Section 6 with examples.

7. The anti-shame audit checklist from spec Section 6 (including reflection prompt checks).

8. The quality metrics from spec Section 6 (you/I ratio, reading level, word count, CTA count).

9. The conflict resolution rules from spec Section 6:
   - Structure changes → revert to Copy Expert
   - Softened hook → merge (Voice Writer tone + Copy Expert specificity)
   - Weakened CTA → Copy Expert wins for pitch, Voice Writer wins for nurture
   - Added content → keep if structural, cut if filler

10. The final output format from spec Section 6 (SUBJECT LINE, PREVIEW TEXT, FORMAT, EMAIL BODY, PLAIN-TEXT VERSION, QUALITY METRICS, FLAGS).

11. Explicit instructions for dispatching subagents:
    ```
    To dispatch the Copy Expert:
    Use the Agent tool with subagent_type="healing-hearts-email:email-copy-expert"
    Provide the full input parameter block as the prompt.

    To dispatch the Voice Writer:
    Use the Agent tool with subagent_type="healing-hearts-email:email-voice"
    Provide the Copy Expert's output brief + transcript search terms as the prompt.
    ```

- [ ] **Step 2: Verify file renders correctly**

Read the file back. Confirm: YAML frontmatter valid, model is `opus`, description includes trigger phrases, pipeline flow is complete, conflict resolution rules present, subagent dispatch instructions correct.

---

### Task 6: Smoke Test — Write a Sample Email

**Files:** None created (testing only)

- [ ] **Step 1: Restart Claude Code to load the plugin**

Start a new Claude Code session in the HealingHeartsWebsite directory. Verify the `healing-hearts-email` plugin is loaded (check via `/help` or agent list).

- [ ] **Step 2: Test the orchestrator trigger**

Ask: "Write the welcome email for the Spark Challenge drip sequence"

Expected behavior:
1. The `email-copy` orchestrator agent activates
2. It reads context files and learner personas
3. It dispatches the `email-copy-expert` subagent
4. Copy Expert returns a structured brief (subject lines, AVNII stages, CTA direction)
5. Orchestrator dispatches `email-voice` subagent with the brief
6. Voice Writer returns a complete email draft in Trisha's voice
7. Orchestrator runs final polish (deliverability, anti-shame, quality metrics)
8. Final output is returned with subject line, body, metrics, and any flags

- [ ] **Step 3: Evaluate output quality**

Check:
- Does the subject line pass the shared-device test?
- Is the email in plain-text format (default)?
- Does it sound like Trisha (warm, story-driven, specific)?
- Are there any anti-shame violations?
- Is the CTA singular and benefit-oriented?
- Is the You/I ratio approximately 3:1?
- Is the reading level Grade 6-8?

- [ ] **Step 4: Test with a different email type**

Ask: "Write a re-engagement email for someone who signed up for the Spark Challenge but stopped opening after Day 3"

This tests: the one-liner/re-engagement path, different AVNII stage emphasis, pattern-interrupt format.

- [ ] **Step 5: Fix any issues found**

If the pipeline breaks, agents don't trigger, or output quality is poor — diagnose and fix. Common issues:
- Agent frontmatter `name` doesn't match dispatch `subagent_type` — fix the name
- Context file paths wrong — fix `${CLAUDE_PLUGIN_ROOT}` references
- Mind Vault MCP read fails — check path spelling
- Subagent output format doesn't match what orchestrator expects — align formats
