# Spark Challenge Landing Page — Content Pipeline Audit

**Date:** 2026-03-24
**Auditor:** Claude (dispatched agent)
**Scope:** READ-ONLY research — did the Spark Challenge landing page redesign run generated content through the Healing Hearts 7-agent content pipeline?

---

## Executive Summary

**No.** The generated landing page content was NOT run through the 7-agent content pipeline, nor was it expected to be. The redesign plan, spec, and brief all treat the landing page as a **Forge Lite build task** (design/layout pipeline), not a content pipeline task. The generated copy (pain validation, testimonials, objections, qualifier checklist) was produced inline during the Forge Build stage as specified in the brief's `content_sources` map. However, a separate **Email Copy Agent** pipeline was specced (2026-03-24) specifically because the current approach — writing content inline without pipeline processing — was identified as a gap.

---

## Question 1: Does the original plan/spec reference running content through the pipeline?

### Answer: No — the plans reference the Forge Lite (design) pipeline, not the 7-agent content pipeline.

**Evidence:**

1. **The locked brief** (`Mind Vault/Projects/healing-hearts/specs/2026-03-24-spark-landing-page-brief.md`):
   - References "Forge Lite pipeline" for execution (Stage 3-5: Build → Validate → Deploy)
   - Stage 3b says: "Pre-resolve content (DAYS array exists, FAQ exists, **rest is generate**)"
   - Guardrails mention "Anti-shame rules from email pipeline apply to page copy" — but this is a guardrail reference, not a pipeline processing step
   - No mention of the 7-agent content pipeline anywhere in the brief

2. **The brief JSON** (`src/pages/.briefs/spark-challenge.json`):
   - Explicitly marks content sources:
     - `hero_headline`: **"generate"**
     - `pain_validation`: **"generate"**
     - `coach_intro`: "vault:Projects/healing-hearts/pipeline/foundation/voice-profile.md" (reference only)
     - `daily_breakdown`: "existing:DAYS array in SparkChallenge.jsx"
     - `testimonials`: **"generate"**
     - `objection_cards`: **"generate"**
     - `qualifier_list`: **"generate"**
     - `faq`: "existing:FAQ_ITEMS + 4 new questions"
   - The "generate" designation means the Forge Build stage produces this content during the build — it does NOT mean "run through the 7-agent pipeline"

3. **The implementation plan** (`docs/superpowers/plans/2026-03-23-7day-challenge-launch.md`):
   - Task 4 covers landing page content updates
   - Only specifies replacing DAYS and FAQ_ITEMS arrays with Trisha's actual content
   - No task references the 7-agent pipeline for any landing page content
   - The word "pipeline" does not appear anywhere in this plan

4. **The design spec** (`docs/superpowers/specs/2026-03-23-7day-challenge-launch-design.md`):
   - Section 3 covers landing page updates — limited to replacing DAYS array and one FAQ answer
   - No mention of content pipeline processing for any landing page section

---

## Question 2: Was an updated agent pipeline referenced?

### Answer: Yes — but it's a NEW, separate pipeline for email copy, not for landing page content.

**Evidence:**

1. **Email Copy Agent spec** (`docs/superpowers/specs/2026-03-24-email-copy-agent-design.md`):
   - Specced on the same day as the redesign brief (2026-03-24)
   - Describes a **3-agent email copy pipeline**: Orchestrator → Copy Expert → Voice Writer
   - Explicitly states what it replaces: "The current Spark Challenge emails were written with Trisha's raw content pasted in — they work but lack email copywriting fundamentals (hooks, subject line strategy, CTA optimization, sequence pacing)"
   - This is for **email** content, not landing page content
   - Status: Draft — awaiting review (NOT yet implemented)

2. **Email Copy Agent plan** (`docs/superpowers/plans/2026-03-24-email-copy-agent.md`):
   - Implementation plan for the 3-agent email plugin
   - All tasks are unchecked (`[ ]`) — this has not been built yet
   - Files would go to `.claude/plugins/healing-hearts-email/`

3. **Original 7-agent content pipeline** (`Mind Vault/Projects/healing-hearts/pipeline/Healing_Hearts_7_Agent_Prompt_Library.md`):
   - This is the **course content** pipeline (Curriculum Architect → Research Miner → Lead Writer → Dev Editor → Copy Editor → Assessment Designer → Design Producer)
   - Designed for module/lesson content, not marketing page copy
   - The pipeline's foundation docs (voice-profile.md, style-guide.md, learner-personas.md) are referenced by the new Email Copy Agent spec
   - No evidence this pipeline was ever intended for landing page marketing copy

4. **Marketing Agent Team** (`Mind Vault/Projects/healing-hearts/plans/2026-03-20-marketing-agent-team-design.md`):
   - A 6-agent marketing team (Scout, Storyteller, Qualifier, Nurture Writer, Partnership Scout, Campaign Analyst)
   - Phase 1 agents are audience-building focused, not content-producing
   - The "Storyteller" agent creates social media content, not landing page copy
   - Status: Draft — not implemented

---

## Question 3: What content still needs pipeline processing before shipping?

### Content that was generated inline during the Forge Build:

| Section | Data Constant | Lines | Source per Brief | Pipeline Processed? |
|---------|---------------|-------|------------------|-------------------|
| Pain validation | `PAIN_POINTS` | 122-128 | "generate" | No |
| Testimonials | `TESTIMONIALS` | 130-149 | "generate" | No |
| Objection handler | `OBJECTIONS` | 151-167 | "generate" | No |
| Qualifier checklist | `QUALIFIERS` | 169-175 | "generate" | No |
| Hero headline | (inline JSX) | ~440-460 | "generate" | No |
| Coach intro | (inline JSX) | ~510-570 | vault voice-profile ref | No (referenced, not processed) |
| 4 new FAQ items | `FAQ_ITEMS[4-7]` | 100-119 | "existing + 4 new" | No |

### Content that was sourced from existing/approved sources:

| Section | Data Constant | Source | Status |
|---------|---------------|--------|--------|
| Daily breakdown | `DAYS` | Trisha's verbatim content via spec | OK — from Trisha's .docx |
| Original 4 FAQ items | `FAQ_ITEMS[0-3]` | Existing + updated per spec | OK — pre-existing |

### Assessment: What needs review before shipping?

**The generated content is marketing copy, not course content.** The 7-agent pipeline was designed for educational curriculum, not landing page conversion copy. Running this content through Curriculum Architect → Research Miner → Lead Writer would be a category mismatch.

**What SHOULD happen before shipping:**

1. **Anti-shame audit** — The brief's guardrails require "Anti-shame rules from email pipeline apply to page copy." The `PAIN_POINTS` array is the highest-risk section. Current copy should be reviewed against `pipeline/foundation/style-guide.md` anti-shame rules. Specific concern: "You feel more like roommates" appears in both `PAIN_POINTS[4]` and `QUALIFIERS[0]` — this repetition is intentional (validation → qualifier mirror) but should be verified.

2. **Voice profile alignment** — The `coach_intro` section references the voice profile. The generated coach intro text should be compared against `pipeline/foundation/voice-profile.md` to ensure Trisha's voice dimensions are represented (warmth, directness, personal analogy).

3. **Testimonial authenticity** — `TESTIMONIALS` contains 3 quotes attributed to specific names (Amanda L., David R., Jessica & Tom). These appear to be **generated/fictional** — they don't reference real clients. If these ship as-is, they should either be:
   - Replaced with real testimonials from Trisha's coaching practice
   - Clearly marked as illustrative/composite (legal/ethical concern)
   - Flagged for Trisha to provide real ones

4. **Shared-device safety check** — The brief requires "shared-device safe (no crisis language in page title/meta)." The current `PAIN_POINTS` copy is emotional but not crisis-level — this appears compliant.

5. **Email Copy Agent (when built)** — The email copy agent pipeline will apply to the 7 drip emails (already written in `api/emails/spark-day-*.js`), NOT to the landing page. Those emails used Trisha's verbatim .docx content and were proofread (see `content/formatted/spark-challenge-proofread-log.md`), but the Email Copy Agent spec acknowledges they "lack email copywriting fundamentals."

---

## Files Examined

| File | Location | Key Finding |
|------|----------|-------------|
| Locked brief | `Mind Vault/Projects/healing-hearts/specs/2026-03-24-spark-landing-page-brief.md` | Forge Lite pipeline, no 7-agent reference |
| Brief JSON | `src/pages/.briefs/spark-challenge.json` | `content_sources` marks 5 sections as "generate" |
| Implementation plan | `docs/superpowers/plans/2026-03-23-7day-challenge-launch.md` | No pipeline reference for landing page |
| Design spec | `docs/superpowers/specs/2026-03-23-7day-challenge-launch-design.md` | Landing page updates limited to DAYS + FAQ |
| Email Copy Agent spec | `docs/superpowers/specs/2026-03-24-email-copy-agent-design.md` | NEW 3-agent email pipeline (not yet built) |
| Email Copy Agent plan | `docs/superpowers/plans/2026-03-24-email-copy-agent.md` | All tasks unchecked |
| 7-Agent Prompt Library | `Mind Vault/Projects/healing-hearts/pipeline/Healing_Hearts_7_Agent_Prompt_Library.md` | Course content pipeline — not for marketing copy |
| Marketing Agent Team | `Mind Vault/Projects/healing-hearts/plans/2026-03-20-marketing-agent-team-design.md` | 6-agent marketing team — Draft, not implemented |
| Voice Profile | `Mind Vault/Projects/healing-hearts/pipeline/foundation/voice-profile.md` | Trisha's voice calibration standard |
| SparkChallenge.jsx | `src/pages/SparkChallenge.jsx` | Contains all generated content inline |
| Proofread log | `Mind Vault/Projects/healing-hearts/content/formatted/spark-challenge-proofread-log.md` | Email templates proofread, not landing page |
| Review flags | `Mind Vault/Projects/healing-hearts/content/formatted/spark-challenge-review-flags.md` | 5 flags for Trisha review (emails only) |
