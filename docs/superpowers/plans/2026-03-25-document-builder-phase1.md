# Document Builder Plugin — Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create the document-builder plugin scaffold with all 4 agents, 1 skill, 4 context files, 2 themes, and 1 test template — enough to run the full agent pipeline end-to-end (producing structured markdown, not DOCX yet).

**Architecture:** 4-agent pipeline (doc-architect → doc-writer → doc-reviewer → doc-builder orchestrator) coordinated via Agent tool dispatch. Context files provide shared domain knowledge. Theme JSONs define brand tokens (consumed by agents now, by ThemedDocument in Phase 2). One template (review-doc) enables end-to-end testing.

**Tech Stack:** Claude Code plugin system (markdown agents + YAML frontmatter), JSON theme files, `${CLAUDE_PLUGIN_ROOT}` variable expansion for context loading.

**Spec:** `docs/superpowers/specs/2026-03-25-document-builder-plugin-design.md`

---

## File Structure

```
~/.claude/plugins/document-builder/
├── .claude-plugin/
│   └── plugin.json                  # Plugin metadata
├── agents/
│   ├── doc-architect.md             # Decides structure, selects template + theme
│   ├── doc-writer.md                # Assembles content into document sections
│   ├── doc-reviewer.md              # Quality gate: brand compliance, completeness
│   └── doc-builder.md               # Orchestrator: coordinates pipeline
├── skills/
│   └── build-document/
│       └── SKILL.md                 # User-facing skill (/build-doc)
├── context/
│   ├── document-types.md            # Definitions for each document type
│   ├── quality-standards.md         # What "good" looks like per type
│   ├── formatting-rules.md          # Brand-agnostic formatting conventions
│   └── typography-guide.md          # Font pairing, sizing, spacing best practices
├── themes/
│   ├── healing-hearts.json          # Teal/coral/cream, Cormorant Garamond + Arial
│   ├── neutral.json                 # Clean professional theme (slate, system fonts)
│   └── theme-schema.md             # How to create new themes
└── templates/
    └── review-doc.md                # Review document template (Phase 1 test fixture)
```

**All files are new.** No existing files are modified in Phase 1.

---

### Task 1: Plugin Scaffold

**Files:**
- Create: `~/.claude/plugins/document-builder/.claude-plugin/plugin.json`

- [ ] **Step 1: Create directory structure**

```bash
mkdir -p ~/.claude/plugins/document-builder/.claude-plugin
mkdir -p ~/.claude/plugins/document-builder/agents
mkdir -p ~/.claude/plugins/document-builder/skills/build-document
mkdir -p ~/.claude/plugins/document-builder/context
mkdir -p ~/.claude/plugins/document-builder/themes
mkdir -p ~/.claude/plugins/document-builder/templates
```

- [ ] **Step 2: Write plugin.json**

Create `~/.claude/plugins/document-builder/.claude-plugin/plugin.json`:

```json
{
  "name": "document-builder",
  "version": "1.0.0",
  "description": "Multi-agent document generation pipeline. Produces branded, structured documents through an architect → writer → reviewer → builder pipeline with theme and template systems.",
  "author": {
    "name": "Chase Jamison"
  }
}
```

- [ ] **Step 3: Commit**

```bash
cd ~/.claude/plugins/document-builder
git init
git add .
git commit -m "feat: scaffold document-builder plugin directory structure"
```

---

### Task 2: Theme JSON Files

**Files:**
- Create: `~/.claude/plugins/document-builder/themes/healing-hearts.json`
- Create: `~/.claude/plugins/document-builder/themes/neutral.json`
- Create: `~/.claude/plugins/document-builder/themes/theme-schema.md`

The theme schema is defined in the spec. Colors for healing-hearts are sourced from Scoria design tokens (`scoria/design/tokens/colors.json`) and the existing `hh_docx_style.py` constants. Neutral theme uses slate grays with system fonts.

- [ ] **Step 1: Write healing-hearts.json**

Create `~/.claude/plugins/document-builder/themes/healing-hearts.json`:

```json
{
  "name": "healing-hearts",
  "display_name": "Healing Hearts",
  "colors": {
    "primary": "#1191B1",
    "primary_light": "#7CC7D9",
    "secondary": "#B96A5F",
    "secondary_light": "#D4A094",
    "background": "#FAF4EA",
    "text": "#171717",
    "text_secondary": "#525252",
    "muted": "#666666",
    "subtle": "#999999",
    "white": "#FFFFFF",
    "surface": "#fafafa",
    "border": "#e5e5e5",
    "success": "#22c55e",
    "error": "#ef4444",
    "warning": "#f59e0b",
    "info": "#3b82f6"
  },
  "fonts": {
    "display": "Cormorant Garamond",
    "heading": "Arial",
    "body": "Arial",
    "accent": "Arial"
  },
  "sizes": {
    "display": 36,
    "h1": 20,
    "h2": 14,
    "h3": 12,
    "body": 11,
    "small": 10,
    "caption": 9
  },
  "spacing": {
    "none": 0,
    "xs": 2,
    "sm": 4,
    "md": 8,
    "lg": 12,
    "xl": 16,
    "xxl": 24
  },
  "decorations": {
    "section_border": true,
    "section_border_color": "primary",
    "callout_border": true,
    "callout_border_color": "secondary",
    "table_header_fill": "primary",
    "table_header_text": "white",
    "table_alt_row": false
  }
}
```

- [ ] **Step 2: Write neutral.json**

Create `~/.claude/plugins/document-builder/themes/neutral.json`:

```json
{
  "name": "neutral",
  "display_name": "Professional Neutral",
  "colors": {
    "primary": "#334155",
    "primary_light": "#64748b",
    "secondary": "#475569",
    "secondary_light": "#94a3b8",
    "background": "#ffffff",
    "text": "#1e293b",
    "text_secondary": "#475569",
    "muted": "#64748b",
    "subtle": "#94a3b8",
    "white": "#FFFFFF",
    "surface": "#f8fafc",
    "border": "#e2e8f0",
    "success": "#22c55e",
    "error": "#ef4444",
    "warning": "#f59e0b",
    "info": "#3b82f6"
  },
  "fonts": {
    "display": "Times New Roman",
    "heading": "Arial",
    "body": "Arial",
    "accent": "Arial"
  },
  "sizes": {
    "display": 36,
    "h1": 20,
    "h2": 14,
    "h3": 12,
    "body": 11,
    "small": 10,
    "caption": 9
  },
  "spacing": {
    "none": 0,
    "xs": 2,
    "sm": 4,
    "md": 8,
    "lg": 12,
    "xl": 16,
    "xxl": 24
  },
  "decorations": {
    "section_border": true,
    "section_border_color": "primary",
    "callout_border": true,
    "callout_border_color": "secondary",
    "table_header_fill": "primary",
    "table_header_text": "white",
    "table_alt_row": true
  }
}
```

- [ ] **Step 3: Write theme-schema.md**

Create `~/.claude/plugins/document-builder/themes/theme-schema.md`:

```markdown
# Theme Schema

Themes are JSON files that define brand-specific rendering tokens. Every document produced by the pipeline is rendered using a theme.

## Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Kebab-case identifier (used in file name and API) |
| `display_name` | string | Human-readable name shown to users |
| `colors` | object | Color palette — all values are hex strings |
| `fonts` | object | Font family names — must exist in Google Fonts for DOCX→Google Docs conversion |
| `sizes` | object | Font sizes in points (integer) |
| `spacing` | object | Spacing values in points (integer) |
| `decorations` | object | Visual decoration toggles and color references |

## Colors Object

| Key | Purpose | Example |
|-----|---------|---------|
| `primary` | Headings, links, accent elements | `"#1191B1"` |
| `primary_light` | Borders, dividers, table headers | `"#7CC7D9"` |
| `secondary` | Subheadings, highlights, callout borders | `"#B96A5F"` |
| `secondary_light` | Light fills, subtle accents | `"#D4A094"` |
| `background` | Page background (callout fills) | `"#FAF4EA"` |
| `text` | Primary body text | `"#171717"` |
| `text_secondary` | Secondary body text | `"#525252"` |
| `muted` | Metadata, captions | `"#666666"` |
| `subtle` | Dates, attribution | `"#999999"` |
| `white` | Text on dark backgrounds | `"#FFFFFF"` |
| `surface` | Card/surface backgrounds | `"#fafafa"` |
| `border` | Default borders | `"#e5e5e5"` |
| `success` / `error` / `warning` / `info` | Semantic status colors | Standard values |

## Fonts Object

| Key | Purpose | Constraint |
|-----|---------|------------|
| `display` | Title page, hero headlines | Must be in Google Fonts |
| `heading` | Section headings (H1-H3) | Must be in Google Fonts |
| `body` | Body text, lists, tables | Must be in Google Fonts |
| `accent` | Labels, callouts, metadata | Must be in Google Fonts |

**Safe fonts verified in Google Fonts:** Cormorant Garamond, Outfit, Plus Jakarta Sans, IBM Plex Mono, Inter, Roboto, Open Sans, Lato, Montserrat, Merriweather, Playfair Display, Poppins. System fonts (Arial, Times New Roman) are always available.

## Decorations Object

| Key | Type | Description |
|-----|------|-------------|
| `section_border` | boolean | Add bottom border to H1 headings |
| `section_border_color` | string | Color key from `colors` (e.g., `"primary"`) |
| `callout_border` | boolean | Add left border to callout blocks |
| `callout_border_color` | string | Color key from `colors` (e.g., `"secondary"`) |
| `table_header_fill` | string | Color key for table header background |
| `table_header_text` | string | Color key for table header text |
| `table_alt_row` | boolean | Alternate row shading in tables |

## Creating a New Theme

1. Copy `healing-hearts.json` or `neutral.json` as a starting point
2. Replace all color values with your brand palette
3. Update font families (verify they exist in Google Fonts)
4. Save as `themes/<your-theme-name>.json`
5. The architect agent will automatically discover it
```

- [ ] **Step 4: Commit**

```bash
cd ~/.claude/plugins/document-builder
git add themes/
git commit -m "feat: add healing-hearts and neutral theme JSON files + schema docs"
```

---

### Task 3: Context Files

**Files:**
- Create: `~/.claude/plugins/document-builder/context/document-types.md`
- Create: `~/.claude/plugins/document-builder/context/quality-standards.md`
- Create: `~/.claude/plugins/document-builder/context/formatting-rules.md`
- Create: `~/.claude/plugins/document-builder/context/typography-guide.md`

These files are loaded by agents at runtime via `${CLAUDE_PLUGIN_ROOT}/context/`. They contain domain knowledge shared across the pipeline.

- [ ] **Step 1: Write document-types.md**

Create `~/.claude/plugins/document-builder/context/document-types.md`:

```markdown
# Document Types

Each document type defines the expected structure, audience, tone, and typical length. The architect agent selects a type based on the user's request.

## Review Document
- **Template:** `review-doc.md`
- **Audience:** Team lead, stakeholder, subject matter expert
- **Tone:** Analytical, direct, supportive where content involves personal topics
- **Typical length:** 4-8 pages
- **Sections:** Title page, optional intro letter, executive summary, findings (numbered), recommendations (prioritized), next steps
- **When to use:** Reviewing someone's work, auditing a system, evaluating content, providing structured feedback

## Analysis Report
- **Template:** `analysis-report.md`
- **Audience:** Decision-maker, executive
- **Tone:** Data-driven, measured, objective
- **Typical length:** 6-12 pages
- **Sections:** Title page, context/background, methodology, findings, implications, recommendations
- **When to use:** Market research, competitive analysis, technology evaluation, feasibility study

## Meeting Agenda
- **Template:** `meeting-agenda.md`
- **Audience:** Meeting attendees
- **Tone:** Concise, action-oriented
- **Typical length:** 1-2 pages
- **Sections:** Meeting info (date, time, attendees), objectives, topics with time boxes, decisions needed, pre-read materials
- **When to use:** Structuring a meeting, preparing attendees, ensuring productive discussion

## Team Briefing
- **Template:** `team-briefing.md`
- **Audience:** Team members, collaborators
- **Tone:** Clear, informative, motivating
- **Typical length:** 2-4 pages
- **Sections:** Situation summary, key updates, action items with owners, timeline, resources
- **When to use:** Onboarding someone to a project status, weekly updates, sprint kickoffs

## Status Report
- **Template:** `status-report.md`
- **Audience:** Manager, stakeholder, sponsor
- **Tone:** Factual, progress-focused, transparent
- **Typical length:** 2-3 pages
- **Sections:** Summary, completed items, in progress, blocked/risks, metrics/KPIs, next period plan
- **When to use:** Weekly/monthly progress reports, sprint reviews, project health checks

## Onboarding Guide
- **Template:** `onboarding-guide.md`
- **Audience:** New team member, new collaborator
- **Tone:** Warm, helpful, encouraging
- **Typical length:** 4-6 pages
- **Sections:** Welcome, environment setup, key resources, first-week plan, contacts, FAQ
- **When to use:** New team member joins, new tool adoption, new collaborator onboarding

## Marketing One-Pager
- **Template:** `marketing-one-pager.md`
- **Audience:** Prospect, partner, investor
- **Tone:** Persuasive, professional, benefit-focused
- **Typical length:** 1 page (strict)
- **Sections:** Hook/headline, problem, solution, proof (testimonials/metrics), CTA
- **When to use:** Sales collateral, partnership proposals, event handouts, elevator-pitch documents
```

- [ ] **Step 2: Write quality-standards.md**

Create `~/.claude/plugins/document-builder/context/quality-standards.md`:

```markdown
# Quality Standards

These standards are enforced by the doc-reviewer agent. Every document must pass before rendering.

## Universal Checklist (All Document Types)

### Structural Completeness
- [ ] All sections from the selected template are present (or explicitly marked optional in the template)
- [ ] No `[NEEDS INPUT]` placeholders remaining in the final document
- [ ] Document opens with context before diving into details (no cold starts)
- [ ] Closing section has concrete, actionable next steps

### Tone & Voice
- [ ] Tone matches the audience profile from the document type definition
- [ ] No jargon for non-technical readers (unless the audience is explicitly technical)
- [ ] Consistent voice throughout — no shifts between formal and casual mid-document
- [ ] For Healing Hearts content: anti-shame rules apply — no guilt framing, no countdown urgency, validation before reframing

### Content Quality
- [ ] No repeated phrases across sections (copy-paste artifacts)
- [ ] Each section adds unique value — no filler paragraphs restating previous sections
- [ ] Specific over vague: names, dates, numbers, examples instead of "various," "several," "significant"
- [ ] Active voice preferred over passive

### Formatting
- [ ] Callouts and highlights used for key takeaways (not buried in body text)
- [ ] Tables have branded header rows (not plain text)
- [ ] Bullet lists have max 7 items before breaking into sub-groups
- [ ] No orphaned headings (heading at bottom of page, content on next page)

### Length
- [ ] Word counts within 20% of per-section targets (if specified in template)
- [ ] Overall length within the typical range for the document type
- [ ] No section exceeds 3x its target length

## Per-Type Additions

### Review Documents
- Each finding must have: label, explanation, supporting evidence
- Recommendations must be: specific, actionable, assigned to a person or team
- Priority indicators required when more than 5 recommendations

### Analysis Reports
- Methodology section must be present and specific
- Findings must reference data or evidence
- Implications must connect findings to business impact

### Meeting Agendas
- Every topic must have a time box
- Total time boxes must not exceed meeting duration
- At least one "decisions needed" item

### Marketing One-Pagers
- Must fit on exactly one page
- CTA must be specific and singular (not "learn more or contact us or visit our website")
- Proof section must include at least one concrete metric or testimonial
```

- [ ] **Step 3: Write formatting-rules.md**

Create `~/.claude/plugins/document-builder/context/formatting-rules.md`:

```markdown
# Formatting Rules

These rules apply to all documents regardless of theme. They ensure consistent, readable output.

## Heading Hierarchy

Documents use a strict 3-level hierarchy:
- **H1 (Section):** Major divisions of the document. Typically 3-7 per document.
- **H2 (Subsection):** Subdivisions within a section. Use when a section has 2+ distinct topics.
- **H3 (Sub-subsection):** Rare. Only when a subsection genuinely has sub-parts. If you're going deeper than H3, restructure instead.

Never skip levels (no H1 → H3 without H2).

## Text Formatting

- **Bold labels:** Use for key terms that introduce a concept. The reader's eye catches the bold label before reading the explanation. Format: `**Label:** explanation text`
- **Italic:** Reserved for emphasis, titles of works, and stage directions. Never italic for body text.
- **ALL CAPS:** Only for script section headers. Never for emphasis.

## Lists

- **Bullet lists:** Use for unordered items where sequence doesn't matter. Max 7 items before breaking into sub-groups.
- **Numbered lists:** Use when order matters (steps, priorities, rankings).
- **Nested lists:** Maximum 2 levels deep. If you need 3 levels, restructure as sections.

## Tables

- Use tables for comparative data (side-by-side comparison of 3+ items).
- Do not use tables for single-column lists (use bullet lists instead).
- Header row is always styled with the theme's table header colors.
- Keep tables under 7 columns. More than 7 suggests the data should be restructured.

## Callouts

- Use for any insight the reader must not miss.
- Keep callout text to 1-3 sentences. A callout that's a full paragraph loses its impact.
- Maximum 2 callouts per page. More dilutes their emphasis.

## Dividers

- Use between major sections (before H1 headings) for visual separation.
- Never between subsections — the heading hierarchy handles that.

## Page Structure

- **Title page:** Always present. Contains title, subtitle, optional tagline, optional "prepared for."
- **Intro letter:** Optional. Use when the document is addressed to a specific person and benefits from a personal touch.
- **Body sections:** Follow the template's section order exactly.
- **Closing:** Always present. Contains next steps and sign-off.

## Forbidden Patterns

- No pure black (`#000000`) — use the theme's `text` color
- No placeholder text (`[TODO]`, `[TBD]`, `Lorem ipsum`)
- No orphaned headings (heading at bottom of page, content on next page)
- No empty sections (if a section has no content, remove it or mark `[NEEDS INPUT]`)
```

- [ ] **Step 4: Write typography-guide.md**

Create `~/.claude/plugins/document-builder/context/typography-guide.md`:

```markdown
# Typography & Readability Guide

These rules are derived from readability research and applied by both the writer (during content creation) and reviewer (during quality gate).

## Font Pairing Principles

- **Display headlines (title page):** Serif font — editorial warmth, authority
- **Body text:** Sans-serif — clean readability at small sizes
- **Never mix more than 2 font families** in a single document (plus monospace for code)
- All fonts must exist in Google Fonts for reliable DOCX-to-Google-Docs conversion

## Sizing Hierarchy

The theme JSON defines exact sizes. Agents should reference sizes by role, not by point value:

| Role | Theme Key | Typical Size | Usage |
|------|-----------|-------------|-------|
| Display | `sizes.display` | 36pt | Title page main title |
| H1 | `sizes.h1` | 20pt | Section headings (with bottom border) |
| H2 | `sizes.h2` | 14pt | Subsection headings |
| H3 | `sizes.h3` | 12pt | Sub-subsection headings |
| Body | `sizes.body` | 11pt | Paragraphs, list items, table body |
| Small | `sizes.small` | 10pt | Metadata, captions, footnotes |
| Caption | `sizes.caption` | 9pt | Attribution lines |

**Agents must never hardcode point sizes.** Always reference the theme key.

## Spacing

- Body paragraphs: `spacing.md` (8pt) after
- Before H1: `spacing.xl` (16pt) — creates clear section breaks
- Before H2: `spacing.lg` (12pt) — visible but less dramatic than H1
- Before H3: `spacing.md` (8pt) — subtle separation
- Line spacing: 1.15x (tighter than default 1.5x, more readable than single)

## Readability Rules

### Sentence Length
- Target: max 20 words per sentence for body text
- Callouts and key points: max 15 words
- Headers: max 8 words

### Paragraph Structure
- 3-5 sentences max per paragraph
- One idea per paragraph
- Break long blocks — if a paragraph exceeds 5 sentences, split it

### Voice
- Active voice preferred: "The review found three issues" not "Three issues were found"
- Concrete nouns over abstract: "authentication tokens" not "security elements"
- Specific over vague: "3 of 7 endpoints" not "several endpoints"

## Document Scanning Patterns

Readers scan documents in predictable patterns. Structure content to match:

### F-Pattern
- Place key information in the first 2 lines of each section (where eyes scan first)
- Front-load important words in headings and bullet points
- Don't bury critical information in the middle of a paragraph

### Inverted Pyramid
- Most important information first in every section
- Supporting details follow
- Background/context last

### Progressive Disclosure
- Executive summary → section summaries → details
- A busy reader should be able to stop at any level and have a complete (if less detailed) understanding
- Each section's opening sentence should summarize the section's conclusion

## Forbidden Typography Patterns

- No Inter font (AI design tell — immediately signals machine-generated)
- No 3-column equal card layouts
- No pure black text (`#000000`)
- No font sizes below 9pt (unreadable in print and Google Docs)
- No more than 3 font weights per document (e.g., regular, bold, italic)
```

- [ ] **Step 5: Commit**

```bash
cd ~/.claude/plugins/document-builder
git add context/
git commit -m "feat: add context files — document types, quality standards, formatting rules, typography guide"
```

---

### Task 4: Review Document Template

**Files:**
- Create: `~/.claude/plugins/document-builder/templates/review-doc.md`

This is the one template included in Phase 1 as a test fixture. The remaining 6 templates are built in Phase 3.

- [ ] **Step 1: Write review-doc.md**

Create `~/.claude/plugins/document-builder/templates/review-doc.md`:

```markdown
---
type: review-doc
name: Review Document
description: Structured review with findings and recommendations
default_theme: healing-hearts
sections:
  - id: title_page
    required: true
  - id: intro_letter
    required: false
  - id: executive_summary
    required: true
    length: 150-250 words
  - id: findings
    required: true
    structure: numbered_subsections
  - id: recommendations
    required: true
    structure: priority_table
  - id: next_steps
    required: true
    length: 100-200 words
---

## TITLE_PAGE
- title: Required. The document's main title.
- subtitle: Required. What this review covers.
- tagline: Optional. One-line framing statement.
- prepared_for: Required. Who commissioned or will receive this review.

## INTRO_LETTER
- Optional. Include when the document is addressed to a specific person.
- Greeting: "Hi [Name]," — warm but professional.
- Body: 2-3 short paragraphs explaining what the reviewer did, what they found, and how to use this document.
- Sign-off: "-- [Author]"

## EXECUTIVE_SUMMARY
- Length: 150-250 words
- Purpose: The entire document in 2-3 paragraphs. A busy reader should be able to stop here and know the key findings.
- Must include: top 2-3 findings, overall assessment (positive/mixed/concerning), the single most critical recommendation.
- Tone: Direct but not alarming. Lead with what's working before what needs fixing.

## FINDINGS
- Structure: Numbered sections (1.1, 1.2, ...), each with a subsection heading.
- Each finding has: a bold label summarizing the finding in 3-5 words, followed by an explanation paragraph with supporting evidence.
- Use callouts for critical or high-priority findings.
- Use tables when comparing multiple items (e.g., "current state vs. recommended state").
- Order: Most important findings first.

## RECOMMENDATIONS
- Structure: Numbered list with priority indicators.
- Priority levels: **Critical** (must fix), **High** (should fix soon), **Medium** (improve when possible), **Low** (nice to have).
- Each recommendation: specific, actionable, assigned to a person or team if known.
- Include a priority summary table if more than 5 recommendations:
  | # | Recommendation | Priority | Owner |
  |---|---------------|----------|-------|
- Follow with detail paragraphs for Critical and High items.

## NEXT_STEPS
- Length: 100-200 words
- 3-5 concrete next steps as a numbered list.
- Each step: what to do, who does it, when (if known).
- Close with encouragement or positive framing: acknowledge the work already done and express confidence in the path forward.
```

- [ ] **Step 2: Commit**

```bash
cd ~/.claude/plugins/document-builder
git add templates/
git commit -m "feat: add review-doc template (Phase 1 test fixture)"
```

---

### Task 5: doc-architect Agent

**Files:**
- Create: `~/.claude/plugins/document-builder/agents/doc-architect.md`

The architect decides document structure and routing. It does NOT write content — it outputs a structural brief that the writer consumes.

- [ ] **Step 1: Write doc-architect.md**

Create `~/.claude/plugins/document-builder/agents/doc-architect.md`:

```markdown
---
name: doc-architect
description: >
  Internal subagent. Analyzes the user's document request and produces a structural brief —
  selecting document type, template, theme, and section outline with per-section guidance.
  Dispatched by the doc-builder orchestrator. Never writes prose content.
model: sonnet
---

# Doc Architect

You are the structural architect for the document-builder pipeline. Your job is to analyze a document request and produce a **structural brief** — the blueprint that the doc-writer will follow to create the actual content.

**You never write prose.** You produce structure, selections, and guidance only.

## Context Loading

At the start of every invocation, read the following files:

- `${CLAUDE_PLUGIN_ROOT}/context/document-types.md` — definitions of each document type
- `${CLAUDE_PLUGIN_ROOT}/context/formatting-rules.md` — structural rules
- `${CLAUDE_PLUGIN_ROOT}/context/typography-guide.md` — sizing and readability conventions

Then scan available templates:

- List files in `${CLAUDE_PLUGIN_ROOT}/templates/` to see which templates exist

And scan available themes:

- List files in `${CLAUDE_PLUGIN_ROOT}/themes/*.json` to see which themes exist

## Input

You receive from the orchestrator:
- The user's request (what they want documented)
- Any additional context (who it's for, source material references, constraints)

## Process

1. **Identify the document type.** Match the user's request to a type from `document-types.md`. If no type matches:
   - Present the available types and ask: "None of these are an exact match. Which is closest, or would you like to define a new type?"
   - If the user wants a new type, draft a template following the format of existing templates in `${CLAUDE_PLUGIN_ROOT}/templates/`, save it, and use it.

2. **Select the template.** Use the template associated with the matched document type. Verify the template file exists.

3. **Select the theme.** Default to the template's `default_theme`. Override if:
   - The user specifies a theme ("use the neutral theme")
   - The content context suggests a different theme (e.g., non-HH content → neutral)

4. **Build the section outline.** For each section in the template:
   - Confirm it applies to this specific document (skip optional sections that don't fit)
   - Write per-section guidance: what content should go here based on the user's request
   - Set length targets based on the template's ranges and the overall document scope
   - Note any source material that should be referenced in each section

5. **Set tone and voice directives.** Based on the document type's audience profile:
   - Primary tone (analytical, warm, concise, etc.)
   - Voice constraints (active voice, no jargon, etc.)
   - Any audience-specific considerations

## Output Format

Return a structured brief in this exact format:

```
## Document Brief

**Type:** [document type name]
**Template:** [template filename]
**Theme:** [theme name]
**Audience:** [who will read this]
**Primary Tone:** [tone descriptor]

### Section Outline

#### [SECTION_ID] — [Section Name]
- **Include:** yes/no
- **Length target:** [word range]
- **Guidance:** [2-3 sentences on what content goes here, specific to this request]
- **Source material:** [what raw input to draw from, if any]
- **Key points to cover:** [bullet list of specific points]

[repeat for each section in the template]

### Voice Directives
- [directive 1]
- [directive 2]
- [directive 3]

### Special Instructions
- [any request-specific notes that don't fit above]
```

## Scope Constraints

- **Never write prose.** Your output is a structural brief, not document content.
- **Always select from existing templates.** If none match, present options and ask — don't silently pick the closest.
- **Never skip required sections.** If a section is marked `required: true` in the template, it must appear in the brief.
- **Be specific in guidance.** "Write about the findings" is useless. "Cover the 3 auth vulnerabilities found in the security audit, prioritized by severity" is helpful.
```

- [ ] **Step 2: Commit**

```bash
cd ~/.claude/plugins/document-builder
git add agents/doc-architect.md
git commit -m "feat: add doc-architect agent — structural brief generation"
```

---

### Task 6: doc-writer Agent

**Files:**
- Create: `~/.claude/plugins/document-builder/agents/doc-writer.md`

The writer translates the architect's brief into actual document content. It follows the brief's structure exactly and never restructures.

- [ ] **Step 1: Write doc-writer.md**

Create `~/.claude/plugins/document-builder/agents/doc-writer.md`:

```markdown
---
name: doc-writer
description: >
  Internal subagent. Translates the architect's structural brief into complete document content,
  organized by section as structured markdown. Follows the brief exactly — never restructures.
  Dispatched by the doc-builder orchestrator.
model: sonnet
---

# Doc Writer

You are the content writer for the document-builder pipeline. You receive a structural brief from the doc-architect and produce the complete document content as structured markdown.

**You follow the architect's structure exactly.** You never add, remove, or reorder sections. If you disagree with the structure, flag it with a note — don't change it.

## Context Loading

At the start of every invocation, read:

- `${CLAUDE_PLUGIN_ROOT}/context/formatting-rules.md` — structural formatting conventions
- `${CLAUDE_PLUGIN_ROOT}/context/typography-guide.md` — readability rules and scanning patterns
- The theme file specified in the brief (e.g., `${CLAUDE_PLUGIN_ROOT}/themes/healing-hearts.json`) — for understanding the visual language, not for rendering

## Input

You receive from the orchestrator:
- The architect's structural brief (document type, template, theme, section outline with guidance)
- Any raw source material (meeting notes, data, research, transcript excerpts, prior documents)

## Process

For each section in the brief's outline (in order):

1. **Read the section guidance** — what the architect says should go here.
2. **Review source material** — find relevant raw input for this section.
3. **Write the content** following:
   - The tone and voice directives from the brief
   - The readability rules from `typography-guide.md` (max 20 words/sentence, 3-5 sentences/paragraph, active voice)
   - The formatting conventions from `formatting-rules.md` (heading hierarchy, list rules, callout usage)
4. **Apply formatting markers** — use the section markers described in Output Format below.
5. **Check length** — ensure you're within the brief's per-section word target (±20%).

If source material is insufficient for a section, mark it: `[NEEDS INPUT: description of what's missing]`

## Output Format

Return the document content with section markers that the orchestrator and renderer can parse:

```markdown
<!-- SECTION: title_page -->
- title: Document Title Here
- subtitle: What This Document Covers
- tagline: Optional one-liner
- prepared_for: Recipient Name / Team

<!-- SECTION: intro_letter -->
Hi [Name],

[Letter paragraphs...]

-- [Author]

<!-- SECTION: executive_summary -->
[Executive summary paragraphs...]

<!-- SECTION: findings -->
### 1.1 Finding Title

**Key insight:** Explanation of the finding.

Supporting evidence and detail...

> **Callout:** Critical finding that the reader must not miss.

[Continue with subsequent findings...]

<!-- SECTION: recommendations -->
| # | Recommendation | Priority | Owner |
|---|---------------|----------|-------|
| 1 | Specific action | Critical | Team/Person |
| 2 | Specific action | High | Team/Person |

**1. Recommendation detail...**

**2. Recommendation detail...**

<!-- SECTION: next_steps -->
1. **First step** — who does it, by when
2. **Second step** — who does it, by when
3. **Third step** — who does it, by when

[Closing encouragement]
```

## Scope Constraints

- **Follow the brief's section order exactly.** Never restructure, reorder, or merge sections.
- **Never make structural decisions.** If a section feels wrong, write a note: `[NOTE TO ORCHESTRATOR: This section may not be needed because...]` — but still write the content.
- **Mark insufficient source material.** Use `[NEEDS INPUT: ...]` rather than inventing content.
- **Apply readability rules rigorously:**
  - Sentences max 20 words
  - Paragraphs max 5 sentences
  - Active voice preferred
  - Concrete nouns over abstract
  - One idea per paragraph
- **Use formatting elements from formatting-rules.md:**
  - Bold labels for key terms
  - Callouts for critical insights (max 2 per page equivalent)
  - Tables for comparative data
  - Numbered lists for ordered items, bullets for unordered
```

- [ ] **Step 2: Commit**

```bash
cd ~/.claude/plugins/document-builder
git add agents/doc-writer.md
git commit -m "feat: add doc-writer agent — content generation from structural briefs"
```

---

### Task 7: doc-reviewer Agent

**Files:**
- Create: `~/.claude/plugins/document-builder/agents/doc-reviewer.md`

The reviewer is a read-only quality gate. It checks the document against standards and produces a structured review — it never fixes issues itself.

- [ ] **Step 1: Write doc-reviewer.md**

Create `~/.claude/plugins/document-builder/agents/doc-reviewer.md`:

```markdown
---
name: doc-reviewer
description: >
  Internal subagent. Quality gate that checks assembled documents against the architect's brief
  and quality standards. Read-only — flags issues but never fixes them. Dispatched by doc-builder.
model: sonnet
---

# Doc Reviewer

You are the quality gate for the document-builder pipeline. You receive a completed document from the doc-writer, the architect's original brief, and quality standards. You produce a structured review.

**You never fix issues.** You flag them with specific, actionable descriptions. The orchestrator decides whether to fix inline or re-dispatch the writer.

## Context Loading

At the start of every invocation, read:

- `${CLAUDE_PLUGIN_ROOT}/context/quality-standards.md` — the checklist you enforce
- `${CLAUDE_PLUGIN_ROOT}/context/formatting-rules.md` — formatting conventions to verify
- `${CLAUDE_PLUGIN_ROOT}/context/typography-guide.md` — readability rules to check
- The theme file specified in the brief — for verifying brand compliance

## Input

You receive from the orchestrator:
- The writer's complete document content (structured markdown with section markers)
- The architect's structural brief (for checking compliance)
- The quality standards (loaded from context)

## Review Process

Work through the quality checklist systematically. For each check:

1. **Evaluate** — does the document pass this check?
2. **Cite evidence** — quote the specific passage that passes or fails
3. **Score** — PASS, MINOR (cosmetic/style issue), or FAIL (must fix before rendering)

### Checks to Perform

**Structural Completeness:**
- All required sections from the brief are present
- No `[NEEDS INPUT]` placeholders remaining
- Document opens with context (no cold start)
- Closing has concrete next steps

**Brief Compliance:**
- Each section covers the points the architect specified
- Tone matches the brief's voice directives
- Length is within ±20% of the brief's per-section targets

**Readability:**
- Sentences average ≤20 words (sample 10 sentences from body sections)
- Paragraphs are ≤5 sentences
- Active voice used predominantly
- No jargon mismatches with audience

**Formatting:**
- Heading hierarchy is correct (H1 → H2 → H3, no skipping)
- Callouts used for key insights (not buried in body)
- Tables have header rows
- Lists are ≤7 items per group
- No orphaned headings

**Brand Compliance:**
- No forbidden patterns (pure black, placeholder text, Inter font references)
- Theme-appropriate language (e.g., anti-shame rules for Healing Hearts content)
- No repeated phrases across sections

## Output Format

Return a structured review:

```markdown
## Document Review

**Overall:** PASS / PASS WITH NOTES / NEEDS REVISION

**Summary:** [1-2 sentence overall assessment]

### Section Reviews

#### [SECTION_ID] — [Section Name]
- **Status:** PASS / MINOR / FAIL
- **Brief compliance:** [Does it cover what the architect specified?]
- **Length:** [actual] / [target] — OK / Over / Under
- **Issues:** [numbered list of specific issues, or "None"]

[repeat for each section]

### Quality Checklist

| Check | Status | Notes |
|-------|--------|-------|
| All required sections present | PASS/FAIL | |
| No placeholders remaining | PASS/FAIL | |
| Opens with context | PASS/FAIL | |
| Closing has next steps | PASS/FAIL | |
| Tone matches brief | PASS/FAIL | |
| Lengths within targets | PASS/FAIL | |
| Readability rules met | PASS/MINOR/FAIL | |
| Formatting correct | PASS/MINOR/FAIL | |
| Brand compliant | PASS/FAIL | |
| No repeated phrases | PASS/FAIL | |

### Fix List

**Must Fix (FAIL):**
1. [Specific issue, location, what's wrong, what it should be]

**Should Fix (MINOR):**
1. [Specific issue, location, suggestion]

### Recommendation
[APPROVE for rendering / REVISE specific sections / RESTRUCTURE (escalate to architect)]
```

## Scope Constraints

- **Read-only.** Never modify the document. Only produce the review.
- **Be specific.** "Tone is off" is useless. "Section 1.2 uses clinical language ('intervention protocol') but the audience is non-technical — rephrase to plain English" is actionable.
- **Cite locations.** Reference section IDs and quote the problematic text.
- **Don't over-flag.** Minor style preferences that don't affect readability or brand compliance are not issues. Focus on what matters.
- **Trust the architect's brief.** If the structure seems wrong, that's the architect's domain — only flag content and quality issues.
```

- [ ] **Step 2: Commit**

```bash
cd ~/.claude/plugins/document-builder
git add agents/doc-reviewer.md
git commit -m "feat: add doc-reviewer agent — read-only quality gate"
```

---

### Task 8: doc-builder Orchestrator Agent

**Files:**
- Create: `~/.claude/plugins/document-builder/agents/doc-builder.md`

The orchestrator coordinates the full pipeline. It's the only agent the user interacts with (via the skill). It dispatches the other three agents in sequence and handles the rendering step.

- [ ] **Step 1: Write doc-builder.md**

Create `~/.claude/plugins/document-builder/agents/doc-builder.md`:

```markdown
---
name: doc-builder
description: >
  Orchestrator agent for document generation. Coordinates the doc-architect → doc-writer →
  doc-reviewer pipeline, handles quality trade-offs, and manages rendering. The only agent
  the user interacts with. Use when building any structured document.
model: opus
---

# Doc Builder — Pipeline Orchestrator

You coordinate the document-builder pipeline. You are the only agent the user interacts with — all other agents (architect, writer, reviewer) are dispatched by you as subagents.

**You never write document content yourself.** You parse requests, dispatch specialists, resolve conflicts, and manage the output.

## Pipeline

```
User request
  → 1. Load context
  → 2. Dispatch doc-architect → structural brief
  → 3. [Optional] Confirm brief with user
  → 4. Dispatch doc-writer with brief + source material → content
  → 5. Dispatch doc-reviewer → quality report
  → 6. If issues: fix inline (minor) or re-dispatch writer (major)
  → 7. Render output (Phase 2: DOCX + Google Drive; Phase 1: structured markdown)
  → 8. Return result to user
```

## Step-by-Step Execution

### Step 1: Parse & Load Context

Read the user's request. Identify:
- What document they want (type, topic, purpose)
- Who it's for (audience)
- What source material is available (files, notes, data)
- Any constraints (theme preference, length, deadline)

Load shared context:
- `${CLAUDE_PLUGIN_ROOT}/context/document-types.md`
- `${CLAUDE_PLUGIN_ROOT}/context/quality-standards.md`

### Step 2: Dispatch Architect

Dispatch the `doc-architect` subagent using the Agent tool. Pass:
- The user's request (verbatim)
- Any additional context you've identified
- The path to the plugin root: `${CLAUDE_PLUGIN_ROOT}`

The architect returns a structural brief.

### Step 3: Brief Confirmation (Optional)

For complex or high-stakes documents, present the brief to the user:
- Show the selected type, template, theme
- Show the section outline with guidance
- Ask: "Does this structure look right? Any sections to add/remove/change?"

Skip confirmation for routine documents (status reports, agendas) unless the user has indicated they want to review.

### Step 4: Dispatch Writer

Dispatch the `doc-writer` subagent. Pass:
- The architect's structural brief
- All source material (read relevant files and pass their content)
- The path to the plugin root: `${CLAUDE_PLUGIN_ROOT}`

The writer returns complete document content as structured markdown.

### Step 5: Dispatch Reviewer

Dispatch the `doc-reviewer` subagent. Pass:
- The writer's document content
- The architect's structural brief
- The path to the plugin root: `${CLAUDE_PLUGIN_ROOT}`

The reviewer returns a quality report.

### Step 6: Handle Review Results

Based on the reviewer's recommendation:

- **APPROVE:** Proceed to rendering.
- **REVISE (minor issues):** Fix issues inline yourself. Minor issues include: typos, slight length adjustments, formatting fixes, small tone tweaks.
- **REVISE (major issues):** Re-dispatch the doc-writer with the reviewer's fix list appended to the brief. Only one re-dispatch — if the second pass still has issues, fix remaining issues inline and note them to the user.
- **RESTRUCTURE:** Escalate to the user. The architect's brief may need changes. Present the reviewer's feedback and ask for guidance.

### Step 7: Render Output

**Phase 1 (current):** Save the final structured markdown to a file. Report the file path to the user.

**Phase 2 (future):** Render DOCX via `lib/themed_document.py`, upload to Google Drive via `lib/gdrive_upload.py`. This step is a no-op in Phase 1.

The output file should be saved to the current working directory as:
`<document-title-kebab-case>.md`

### Step 8: Return Result

Report to the user:
- File path of the generated document
- Quality summary (from reviewer): overall status + any notes
- Any `[NEEDS INPUT]` items that remain (if source material was insufficient)

## Conflict Resolution

When agents disagree:
- **Writer flags a structural concern:** Read the note. If it's valid, ask the user. If it's a style preference, keep the architect's structure.
- **Reviewer flags issues the writer intentionally chose:** Check the writer's `[NOTE TO ORCHESTRATOR]` markers. If the writer had a reason, use your judgment.
- **Multiple revision cycles:** Maximum 2 writer dispatches. After 2 passes, fix remaining issues inline.

## Scope Constraints

- **Never write document content yourself.** Always dispatch the doc-writer.
- **Never skip the reviewer** for documents longer than 2 pages (roughly 500+ words).
- **For short documents** (under 500 words): you may skip the reviewer if the writer's output is clearly clean.
- **Always report quality.** Even if the document passes review, include the summary.
- **Respect the pipeline order.** Architect → Writer → Reviewer. No shortcuts.
```

- [ ] **Step 2: Commit**

```bash
cd ~/.claude/plugins/document-builder
git add agents/doc-builder.md
git commit -m "feat: add doc-builder orchestrator agent — pipeline coordination"
```

---

### Task 9: build-document Skill

**Files:**
- Create: `~/.claude/plugins/document-builder/skills/build-document/SKILL.md`

The skill is the user-facing entry point. It triggers the doc-builder orchestrator.

- [ ] **Step 1: Write SKILL.md**

Create `~/.claude/plugins/document-builder/skills/build-document/SKILL.md`:

```markdown
---
name: build-document
description: >
  Generate branded, structured documents through the doc-builder pipeline. Supports review docs,
  analysis reports, meeting agendas, team briefings, status reports, onboarding guides, and
  marketing one-pagers. Triggers on document creation requests.
---

# Build Document

You've been asked to create a document. Dispatch the `doc-builder` orchestrator agent to handle the full pipeline.

## Trigger Phrases

This skill activates on: "build a document", "create a report", "write a review doc", "generate a briefing", "make an agenda", "status report", "onboarding guide", "one-pager", "compile a document", "/build-doc"

## Behavior

1. **If the document type is clear from context** — dispatch the `doc-builder` agent immediately with the user's full request.

2. **If the document type is ambiguous** — ask: "What kind of document? Available types: review, analysis, agenda, briefing, status report, onboarding guide, one-pager — or describe something else."

3. **Pass the full user request** to the `doc-builder` agent, including:
   - What they want documented
   - Who it's for (if mentioned)
   - Any source material references
   - Theme preference (if mentioned, otherwise let the architect decide)

4. **When the orchestrator completes**, relay its output to the user:
   - File path of the generated document
   - Quality summary
   - Any remaining `[NEEDS INPUT]` items

## Example Invocations

- "Build a review doc for the Spark Challenge video scripts"
- "Create a status report for this week's Healing Hearts progress"
- "Write an onboarding guide for Desirae joining the web project"
- "Generate a one-pager for the Healing Hearts course"
- "/build-doc meeting agenda for Thursday's planning session"
```

- [ ] **Step 2: Commit**

```bash
cd ~/.claude/plugins/document-builder
git add skills/
git commit -m "feat: add build-document skill — user-facing entry point"
```

---

### Task 10: Enable Plugin & End-to-End Pipeline Test

**Files:**
- Modify: `~/.claude/settings.json` (add plugin to enabledPlugins)
- No other file changes

- [ ] **Step 1: Enable the plugin in Claude Code settings**

Add `"document-builder": true` to the `enabledPlugins` section of `~/.claude/settings.json`. Read the file first, then add the entry alongside the existing plugins.

- [ ] **Step 2: Verify plugin is recognized**

Restart Claude Code or run `/mcp` to verify the plugin loads. Check that:
- The `doc-builder`, `doc-architect`, `doc-writer`, and `doc-reviewer` agents are discoverable
- The `build-document` skill appears in the skill list

- [ ] **Step 3: Run end-to-end pipeline test**

Test the pipeline by invoking the skill with a concrete request:

```
/build-doc Create a review document for the Healing Hearts 7-Day Spark Challenge email sequence.
The review should evaluate the 7 daily emails for tone consistency, AVNII framework compliance,
and CTA effectiveness. Prepared for Trisha. Use the healing-hearts theme.
```

**Expected behavior:**
1. Skill triggers → dispatches `doc-builder` orchestrator
2. Orchestrator dispatches `doc-architect` → returns structural brief with review-doc template, healing-hearts theme, section outline
3. Orchestrator dispatches `doc-writer` with brief → returns structured markdown content
4. Orchestrator dispatches `doc-reviewer` → returns quality report
5. Orchestrator saves final markdown to current directory
6. User receives: file path + quality summary

**What to verify:**
- All 4 agents execute in the correct order
- The architect selects `review-doc` template and `healing-hearts` theme
- The writer produces content with `<!-- SECTION: ... -->` markers
- The reviewer produces a structured review with the quality checklist
- The final output file is saved and readable
- No agent oversteps its role (architect doesn't write prose, writer doesn't restructure, reviewer doesn't fix)

- [ ] **Step 4: Document any issues**

If the pipeline test reveals issues (agent confusion, missing context, wrong dispatch), note them in `docs/superpowers/plans/2026-03-25-document-builder-phase1-issues.md` for Phase 2 calibration.

- [ ] **Step 5: Commit any test-driven adjustments**

```bash
cd ~/.claude/plugins/document-builder
git add -A
git commit -m "fix: adjust agent prompts based on pipeline test feedback"
```

---

## Phase 1 Complete Checklist

When all tasks are done, verify:

- [ ] Plugin directory exists at `~/.claude/plugins/document-builder/`
- [ ] `plugin.json` has correct metadata
- [ ] 4 agent files in `agents/` with correct frontmatter (name, description, model)
- [ ] 1 skill in `skills/build-document/SKILL.md`
- [ ] 4 context files in `context/`
- [ ] 2 theme JSON files + schema doc in `themes/`
- [ ] 1 template in `templates/`
- [ ] Plugin enabled in `settings.json`
- [ ] End-to-end pipeline test completed
- [ ] All files committed

**Next:** Phase 2 (ThemedDocument + Google Drive upload) — refactors `hh_docx_style.py` into `lib/themed_document.py` that reads theme JSON.
