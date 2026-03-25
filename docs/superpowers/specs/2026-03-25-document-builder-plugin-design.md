# Document Builder Plugin — Design Spec

**Date:** 2026-03-25
**Status:** Approved
**Location:** `~/.claude/plugins/document-builder/`
**Type:** Standalone Claude Code plugin (works across all hubs/projects)

## Overview

A plugin that reliably generates beautiful, consistent, human-optimized documents. It produces DOCX files via python-docx, with optional Google Drive upload to create Google Docs. The plugin uses a theme system (JSON) so any project can define its own brand, and a template system (markdown) so document types are extensible.

## Output Pipeline

```
User request → doc-architect (structure) → doc-writer (content) → doc-reviewer (quality gate) → render DOCX → upload to Google Drive → return Google Doc link
```

The pipeline is coordinated by a `doc-builder` orchestrator agent.

## Decisions

- **Output format:** Generate DOCX with python-docx, then upload to Google Drive with `mimeType: application/vnd.google-apps.document` for conversion. This preserves fonts, colors, borders, tables, and spacing. The pure Docs API is too verbose for complex branded documents.
- **Font constraint:** All theme fonts must exist in Google Fonts. Unrecognized fonts silently fall back to Arial in Google Docs. Safe defaults: Cormorant Garamond, Arial, Outfit, Plus Jakarta Sans.
- **Theme source:** The Healing Hearts theme is derived from `design/tokens/colors.json` and `design/DESIGN.md` in the Scoria repo. The plugin carries its own copy as `themes/healing-hearts.json`.
- **Extensibility:** New document types are added by creating a markdown template in `templates/`. The architect agent presents available types; if none match, it asks the user to pick the closest or define a new one.
- **Backward compatibility:** The existing `hh_docx_style.py` continues to work. Phase 2 refactors it to use the theme system.

---

## Plugin Structure

```
document-builder/
  plugin.json
  agents/
    doc-architect.md          # Decides structure, selects template + theme
    doc-writer.md             # Assembles content into document sections
    doc-reviewer.md           # Quality gate: brand compliance, formatting, completeness
    doc-builder.md            # Orchestrator: coordinates pipeline, renders output
  skills/
    build-document.md         # User-facing skill (triggers on "build a document", etc.)
  context/
    document-types.md         # Definitions for each document type
    quality-standards.md      # What "good" looks like per type
    formatting-rules.md       # Brand-agnostic formatting conventions
    typography-guide.md       # Font pairing, sizing, spacing best practices
  themes/
    healing-hearts.json       # Teal/coral/cream, Cormorant Garamond + Arial
    neutral.json              # Clean professional theme (slate, system fonts)
    theme-schema.md           # How to create new themes
  templates/
    review-doc.md             # Title page, exec summary, findings, recommendations
    analysis-report.md        # Context, methodology, findings, implications
    meeting-agenda.md         # Objectives, topics (time-boxed), decisions needed
    team-briefing.md          # Situation, key updates, action items, timeline
    status-report.md          # Summary, completed, in progress, blocked, metrics
    onboarding-guide.md       # Welcome, setup, resources, first-week plan
    marketing-one-pager.md    # Hook, problem, solution, proof, CTA
  lib/
    themed_document.py        # ThemedDocument class (reads theme JSON, renders DOCX)
    gdrive_upload.py          # Google Drive upload helper (DOCX -> Google Doc)
```

---

## Agent Definitions

### Agent 1: doc-architect (Sonnet)

**Role:** Decides document structure and routing. Does NOT write content.

**Input:** User's request — what they want documented, who it's for, context.

**Output:** A structured brief containing:
- Document type (selected from `context/document-types.md`)
- Template (selected from `templates/`)
- Theme (selected from `themes/`)
- Section outline with per-section guidance
- Tone/voice directives based on audience
- Length targets per section

**Scope constraints:**
- Never writes prose — outputs structural briefs only
- Always selects from existing templates; if none match, presents available types and asks the user: "None of these are an exact match. Which is closest, or would you like to define a new type?"
- When a new type is requested, the architect drafts a template and saves it to `templates/` for future use

**Why separate:** The email plugin proved that separating "what to build" from "building it" prevents the writer from making structural decisions mid-stream — the #1 cause of inconsistent documents.

---

### Agent 2: doc-writer (Sonnet)

**Role:** Translates the architect's brief into actual document content.

**Input:** The architect's brief + any raw source material (meeting notes, data, research, transcript excerpts).

**Output:** Complete document content organized by section, formatted as structured markdown with section markers.

**Scope constraints:**
- Follows the architect's section order exactly — never restructures
- Writes in the tone/voice specified by the brief
- Marks any section where source material is insufficient: `[NEEDS INPUT: description]`
- Never makes structural decisions (adding/removing/reordering sections)

**Typography awareness:** The writer applies formatting conventions from `context/typography-guide.md`:
- Sentences max 20 words for body text (readability)
- Active voice preferred
- Concrete nouns over abstract
- One idea per paragraph

---

### Agent 3: doc-reviewer (Sonnet)

**Role:** Quality gate. Checks the assembled document against standards. Read-only.

**Input:** The writer's output + the architect's brief + quality standards.

**Output:** Structured review:
- Per-section pass/fail against the brief
- Tone consistency check
- Completeness check (all sections present, no `[NEEDS INPUT]` remaining)
- Length check (within targets)
- Brand compliance (theme-specific rules)
- Actionable fix list (if issues found)

**Scope constraints:**
- Read-only — flags issues but does not fix them
- Uses `allowedTools: [Read, Grep, Glob]` — cannot modify files
- The orchestrator decides whether to fix inline or re-dispatch the writer

**Quality checklist (applied to every document):**
- [ ] All sections from the template are present (or explicitly marked optional)
- [ ] No `[NEEDS INPUT]` placeholders remaining
- [ ] Tone matches the audience profile (no jargon for non-technical readers)
- [ ] Word counts within 20% of per-section targets
- [ ] No repeated phrases across sections (copy-paste artifacts)
- [ ] Callouts and highlights are used for key takeaways (not buried in body text)
- [ ] Tables have branded header rows (not plain text)
- [ ] Document opens with context before diving into details (no cold starts)
- [ ] Closing section has concrete, actionable next steps

---

### Agent 4: doc-builder (Opus) — Orchestrator

**Role:** Coordinates the pipeline. The only agent the user interacts with.

**Pipeline:**
1. Parse user request
2. Load context files (document-types, quality-standards, formatting-rules)
3. Dispatch doc-architect → receive structural brief
4. Confirm brief with user (optional — skip for routine docs)
5. Dispatch doc-writer with brief + source material → receive content
6. Dispatch doc-reviewer → receive quality report
7. If issues found: fix inline (minor) or re-dispatch writer (major)
8. Render final DOCX via `lib/themed_document.py`
9. Upload to Google Drive via `lib/gdrive_upload.py` (if credentials available)
10. Return file path + Google Doc link + quality summary

**Scope constraints:**
- Never writes document content itself — always dispatches specialists
- Handles conflict resolution (architect vs. writer disagreements)
- Makes the final call on quality trade-offs
- Responsible for rendering the DOCX and uploading

**Why Opus:** The orchestrator needs judgment for conflict resolution, quality trade-offs, and deciding when "good enough" is reached.

---

## Skill Definition

### `/build-doc` (User-facing)

**Triggers on:** "build a document", "create a report", "write a review doc", "generate a briefing", "make an agenda", "status report", "onboarding guide", "one-pager", "compile a document"

**Behavior:**
1. If document type is clear from context, proceed directly
2. If ambiguous, ask: "What kind of document? (review, analysis, agenda, briefing, status report, onboarding guide, one-pager, or something else?)"
3. Dispatch the `doc-builder` orchestrator agent
4. Return: file path, Google Doc link (if uploaded), quality summary

---

## Theme System

Themes are JSON files defining brand-specific rendering tokens. The `ThemedDocument` class reads a theme file and applies it to all document elements.

### Theme Schema

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

### Font Safety

All theme fonts MUST exist in Google Fonts for reliable DOCX-to-Google-Docs conversion. Unrecognized fonts silently fall back to Arial.

**Safe fonts verified in Google Fonts:**
- Cormorant Garamond, Outfit, Plus Jakarta Sans, IBM Plex Mono
- Inter, Roboto, Open Sans, Lato, Montserrat, Merriweather, Playfair Display, Poppins
- Arial, Times New Roman (system fonts, always available)

---

## Template System

Templates define document structure as markdown with section markers, guidance, and length targets.

### Template Format

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
- tagline: Optional. One-line framing.
- prepared_for: Required. Who commissioned this.

## EXECUTIVE_SUMMARY
- Length: 150-250 words
- Purpose: The entire document in 2-3 paragraphs. A busy reader should be able to stop here and know the key findings.
- Include: top 2-3 findings, overall assessment, critical recommendation

## FINDINGS
- Structure: Numbered sections (1.1, 1.2, ...), each with a subsection heading
- Each finding: labeled paragraph (label + explanation), then supporting evidence
- Use callouts for critical findings
- Use tables for comparative data

## RECOMMENDATIONS
- Structure: Numbered list with priority indicators (Critical / High / Medium / Low)
- Each recommendation: specific, actionable, assigned to a person or team
- Include a priority table if more than 5 recommendations

## NEXT_STEPS
- 3-5 concrete next steps with owners
- Use numbered_list format
- Close with encouragement or framing
```

### Document Types

| Type | Template | Audience | Tone | Typical Length |
|------|----------|----------|------|---------------|
| Review Doc | `review-doc.md` | Team lead / stakeholder | Analytical, direct | 4-8 pages |
| Analysis Report | `analysis-report.md` | Decision-maker | Data-driven, measured | 6-12 pages |
| Meeting Agenda | `meeting-agenda.md` | Meeting attendees | Concise, action-oriented | 1-2 pages |
| Team Briefing | `team-briefing.md` | Team members | Clear, informative | 2-4 pages |
| Status Report | `status-report.md` | Manager / stakeholder | Factual, progress-focused | 2-3 pages |
| Onboarding Guide | `onboarding-guide.md` | New team member | Warm, helpful | 4-6 pages |
| Marketing One-Pager | `marketing-one-pager.md` | Prospect / partner | Persuasive, professional | 1 page |

### Adding New Types

When a request doesn't match any existing type:
1. The architect agent presents the available types and asks which is closest
2. If the user says "none — this is something new," the architect drafts a new template
3. The new template is saved to `templates/` and becomes available for future use
4. The orchestrator logs the addition so the user knows a new type was created

---

## ThemedDocument Class

Refactored from `hh_docx_style.py`. The key change: colors, fonts, sizes, and decorations are loaded from a theme JSON file instead of hardcoded constants.

### API (unchanged from HHDocument)

```python
from document_builder.lib.themed_document import ThemedDocument

doc = ThemedDocument(theme="healing-hearts")  # loads themes/healing-hearts.json

# Same methods as HHDocument
doc.title_page("Title", "Subtitle", tagline="...", prepared_for="...")
doc.intro_letter("Hi Trisha,", ["para 1", "para 2"])
doc.section("1. Major Section")
doc.subsection("1.1  Subsection")
doc.body("Regular text.")
doc.labeled("Key insight:", "Explanation")
doc.callout("Important note", label="Note:")
doc.bullet_list(["Item 1", "Item 2"])
doc.numbered_list(["Step 1", "Step 2"])
doc.table(headers, rows)
doc.divider()
doc.metadata("Small gray italic text")
doc.review_prompt("Review guidance text")
doc.script_section("HOOK")
doc.script_line("Spoken text")
doc.stage_direction("[leaning in]")
doc.production_note("Film note")
doc.speaker_label("TRISHA")
doc.closing_with_steps([...], signoff="-- PHEDRIS")
doc.save("output.docx")
```

### Backward Compatibility

```python
# Old code continues to work
from hh_docx_style import HHDocument  # thin wrapper around ThemedDocument("healing-hearts")
```

---

## Google Drive Upload

A small helper module that uploads a DOCX file to Google Drive with conversion.

### Prerequisites

- Google Cloud service account with Drive API enabled
- Service account JSON key file (path stored in environment variable or PHEDRIS config)
- Target folder ID in Google Drive (optional — defaults to root)

### API

```python
from document_builder.lib.gdrive_upload import upload_to_gdrive

result = upload_to_gdrive(
    docx_path="output.docx",
    doc_name="Spark Challenge Video Scripts - Trisha Review",
    folder_id="optional-google-drive-folder-id",
)
# result = {"id": "...", "url": "https://docs.google.com/document/d/.../edit"}
```

### Credential Discovery

The upload helper looks for credentials in this order:
1. `GOOGLE_SERVICE_ACCOUNT_KEY` environment variable (path to JSON key file)
2. `~/.config/gcloud/application_default_credentials.json`
3. If neither found, skip upload and return the local DOCX path with a message: "Google Drive credentials not configured. DOCX saved locally."

---

## Typography & Readability Rules (from research)

These rules are codified in `context/typography-guide.md` and enforced by the reviewer agent.

### Font Pairing
- **Display headlines:** Serif (Cormorant Garamond) — editorial warmth, authority
- **Body text:** Sans-serif (Arial) — clean readability at small sizes
- **Never mix more than 2 font families** in a single document (plus monospace for code)

### Sizing Hierarchy
- Display (title page): 36pt
- H1 (section headings): 20pt with bottom border
- H2 (subsections): 14pt
- H3 (sub-subsections): 12pt
- Body: 11pt
- Metadata/captions: 10pt
- All sizes defined in theme JSON — agents never hardcode sizes

### Spacing
- Body paragraphs: 10pt after (consistent, not variable)
- Before H1: 16pt (creates clear section breaks)
- Before H2: 14pt
- Before H3: 10pt
- Line spacing: 1.15x (tighter than default 1.5x, more readable than single)

### Readability Rules
- Max line length: ~80 characters (achieved via 1-inch margins on letter paper)
- Paragraphs: 3-5 sentences max. Break long blocks.
- Callouts: Use for any insight the reader must not miss. Coral left border makes them scannable.
- Tables: Teal header row with white text. No alternating row colors by default (add via theme if needed).
- Bullet lists: Max 7 items before breaking into sub-groups. Teal bullets.
- Bold labels: Use `labeled()` for key terms — reader's eye catches the teal bold label before reading the explanation.

### Document Scanning Patterns
- **F-pattern:** Place key information in the first 2 lines of each section (where eyes scan)
- **Inverted pyramid:** Most important information first in every section
- **Progressive disclosure:** Executive summary → section summaries → details. A busy reader can stop at any level.

---

## Forbidden Patterns

### In Documents
- No pure black (`#000000`) — use `neutral-900` (`#171717`)
- No Inter font (AI design tell)
- No 3-column equal card layouts
- No countdown timers or urgency language in healing/grief content
- No placeholder text (`[TODO]`, `[TBD]`, `Lorem ipsum`)
- No orphaned headings (heading at bottom of page, content on next page)

### In the Pipeline
- Orchestrator never writes document content — always dispatches specialists
- Writer never restructures — follows architect's brief exactly
- Reviewer never fixes — flags issues for the orchestrator to decide
- No skipping the reviewer for documents > 2 pages

---

## Phase Plan

### Phase 1 — Plugin Scaffold + Agents
Create the plugin directory, all 4 agent definitions, the skill, context files, and the 2 theme JSON files. No code changes to `hh_docx_style.py`. Test by generating a document manually through the agent pipeline.

### Phase 2 — ThemedDocument + Google Drive Upload
Refactor `hh_docx_style.py` into `ThemedDocument` that reads theme JSON. Create the Google Drive upload helper. `HHDocument` becomes a backward-compatible wrapper.

### Phase 3 — Template Library
Write structure templates for all 7 document types. Test end-to-end: user request → architect → writer → reviewer → DOCX → Google Doc.

### Phase 4 — Quality Calibration
Run the pipeline on 2-3 real documents. Calibrate the reviewer's quality gates based on actual output quality. Adjust tone directives, length targets, and formatting rules.

---

## Success Criteria

- [ ] Plugin generates a branded DOCX that matches the quality of the Trisha review doc
- [ ] Theme swap (healing-hearts → neutral) produces a visually distinct but equally polished document
- [ ] All 7 document types produce well-structured output from a single-sentence request
- [ ] Unknown document types prompt the user and create a new template for future use
- [ ] Google Drive upload produces a Google Doc with formatting intact (fonts, colors, borders, tables)
- [ ] The reviewer catches at least: missing sections, placeholder text, tone mismatches, and length violations
- [ ] End-to-end pipeline completes in under 3 minutes for a typical document
