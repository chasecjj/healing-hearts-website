# Document Builder Plugin — Phase 2 Design Spec

**Date:** 2026-03-26
**Status:** Approved
**Depends on:** Phase 1 (complete — plugin scaffold, agents, themes, templates, tested with copy audit)
**Location:** `~/.claude/plugins/document-builder/lib/`

## Overview

Phase 2 adds DOCX rendering and Google Drive upload to the document-builder plugin. The agent pipeline (architect → writer → reviewer) already produces high-quality structured markdown. Phase 2 bridges that markdown to branded DOCX output via python-docx, then optionally uploads to Google Drive for team distribution.

Three new Python files. Two small edits to existing files. No changes to the agent pipeline logic — only the orchestrator's rendering step.

## Decisions

- **Approach:** Standalone CLI renderer (Approach A from brainstorm). A Python script parses the writer's markdown output and calls `ThemedDocument` methods. The doc-builder agent invokes it via Bash. This keeps the intermediate markdown human-readable, re-renderable without the pipeline, and deterministic.
- **Plugin self-contained:** All Python files live in the plugin's `lib/` directory. `python-docx` 1.2.0 and `google-api-python-client` are both installed globally in Python 3.14 — no venv needed.
- **Google Drive auth:** One-time local copy of the PHEDRIS service account key. Uses Domain-Wide Delegation with user impersonation, same pattern as all PHEDRIS Google integrations.
- **Backward compatibility:** `hh_docx_style.py` becomes a thin wrapper. `build-trisha-review-doc.py` continues to work unchanged.

---

## File Layout

```
~/.claude/plugins/document-builder/
  lib/                              # NEW directory
    themed_document.py              # NEW — refactored from hh_docx_style.py
    render_docx.py                  # NEW — markdown-to-DOCX CLI renderer
    gdrive_upload.py                # NEW — DOCX-to-Google Drive CLI uploader
  agents/
    doc-builder.md                  # EDIT — Steps 7 + 8 updated for DOCX rendering
  [all other files unchanged]

~/Documents/HealingHeartsWebsite/
  scripts/
    hh_docx_style.py               # EDIT — gutted to 3-line wrapper
    build-trisha-review-doc.py      # UNCHANGED
```

---

## Component 1: ThemedDocument (`lib/themed_document.py`)

### What It Does

Refactors `hh_docx_style.py` (500 lines) into a theme-parameterized class. Every hardcoded color, font, size, and spacing constant becomes a theme JSON lookup. Same API. Same output. Just reads tokens from `themes/<name>.json` instead of module-level constants.

### Constructor

```python
class ThemedDocument:
    def __init__(self, theme="healing-hearts", margins=1.0):
        theme_path = Path(__file__).parent.parent / "themes" / f"{theme}.json"
        self.theme = json.loads(theme_path.read_text())
        self.colors = {k: self._hex_to_rgb(v) for k, v in self.theme["colors"].items()}
        self.fonts = self.theme["fonts"]
        self.sizes = self.theme["sizes"]
        self.spacing = self.theme["spacing"]
        self.decorations = self.theme["decorations"]
        # ... initialize python-docx Document with margins
```

### Mapping Table

| Old constant | New lookup |
|---|---|
| `TEAL` | `self.colors["primary"]` |
| `TEAL_LIGHT` | `self.colors["primary_light"]` |
| `CORAL` | `self.colors["secondary"]` |
| `CORAL_LIGHT` | `self.colors["secondary_light"]` |
| `CREAM` | `self.colors["background"]` |
| `DARK` | `self.colors["text"]` |
| `GRAY` | `self.colors["muted"]` |
| `GRAY_LIGHT` | `self.colors["subtle"]` |
| `WHITE` | `self.colors["white"]` |
| `FONT_DISPLAY` | `self.fonts["display"]` |
| `FONT_BODY` | `self.fonts["body"]` |
| `FONT_ACCENT` | `self.fonts["accent"]` |
| `SPACE_XS` through `SPACE_XXL` | `Pt(self.spacing["xs"])` through `Pt(self.spacing["xxl"])` |

Decoration lookups (e.g., `self.decorations["section_border_color"]`) resolve through the colors dict: `self.colors[self.decorations["section_border_color"]]`.

### Method API

Unchanged from `HHDocument`. Every public method keeps its signature:

- `title_page(title, subtitle, tagline=None, prepared_for=None)`
- `intro_letter(greeting, paragraphs, signoff="-- PHEDRIS")`
- `section(title, intro=None)`
- `subsection(title)`
- `subsubsection(title)`
- `body(text, space_after=10)`
- `labeled(label, text)`
- `bullet_list(items, indent=0.4)`
- `numbered_list(items, indent=0.4)`
- `callout(text, label=None)`
- `divider()`
- `table(headers, rows, col_widths=None)`
- `metadata(text)`
- `review_prompt(text)`
- `script_section(section_name)`
- `script_line(text)`
- `stage_direction(text)`
- `production_note(text)`
- `speaker_label(name)`
- `closing(text, signoff="-- PHEDRIS")`
- `closing_with_steps(steps, final_note=None, signoff="-- PHEDRIS")`
- `page_break()`
- `save(path)`

### Helper: `_hex_to_rgb`

```python
@staticmethod
def _hex_to_rgb(hex_str):
    """Convert '#1191B1' to RGBColor(0x11, 0x91, 0xB1)."""
    h = hex_str.lstrip("#")
    return RGBColor(int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16))
```

### Backward Compatibility

`hh_docx_style.py` becomes:

```python
import sys
from pathlib import Path
sys.path.insert(0, str(Path.home() / ".claude" / "plugins" / "document-builder" / "lib"))
from themed_document import ThemedDocument

class HHDocument(ThemedDocument):
    def __init__(self, margins=1.0):
        super().__init__(theme="healing-hearts", margins=margins)
```

`build-trisha-review-doc.py` imports `HHDocument` from `hh_docx_style` — continues to work.

---

## Component 2: Markdown Renderer (`lib/render_docx.py`)

### What It Does

CLI script that reads the writer's structured markdown output and translates it into `ThemedDocument` method calls. This is the bridge between the agent pipeline and DOCX rendering.

### CLI Interface

```bash
python render_docx.py input.md --theme healing-hearts --output output.docx
```

All three arguments required. No defaults.

Exit codes: 0 = success, 1 = error. Errors printed to stderr.

### The Markdown Contract

The writer's output follows a bounded set of patterns defined by the doc-writer agent. The renderer handles exactly these:

| Markdown Pattern | ThemedDocument Call |
|---|---|
| `<!-- SECTION: title_page -->` | Parse `**Field:** value` lines, call `doc.title_page()` |
| `<!-- SECTION: intro_letter -->` | Parse greeting + body + sign-off, call `doc.intro_letter()` |
| `<!-- SECTION: next_steps -->` | Parsed as content section (same as findings, recommendations) |
| `<!-- SECTION: * -->` (any other) | `doc.page_break()` + process contents as body sections |
| `# H1 Heading` | `doc.section(title)` |
| `## H2 Heading` | `doc.subsection(title)` |
| `### H3 Heading` | `doc.subsubsection(title)` |
| Plain paragraph | `doc.body(text)` |
| `**Label:** rest of text` | `doc.labeled("Label:", rest)` |
| `- Bullet item` | Collect consecutive items, `doc.bullet_list([...])` |
| `1. Numbered item` | Collect consecutive items, `doc.numbered_list([...])` |
| `\| Header \| Header \|` | Parse markdown table, `doc.table(headers, rows)` |
| `> Blockquote text` | `doc.callout(text)` |
| `---` | `doc.divider()` |

### Processing Logic

A line-by-line state machine with accumulator patterns for multi-line constructs:

```
1. Read entire file as text
2. Split on <!-- SECTION: xxx --> markers into named sections
3. For each section:
   a. title_page → extract **Field:** values, call doc.title_page()
   b. intro_letter → extract first line as greeting,
      collect body paragraphs, detect sign-off line, call doc.intro_letter()
   c. All other sections → doc.page_break(), then process line-by-line:
      - Track current accumulator state (bullet_list, numbered_list, table)
      - When a line doesn't match the current accumulator, flush it
        (e.g., bullet items collected → doc.bullet_list(items) → reset)
      - Then process the new line per the pattern table above
4. Flush any remaining accumulator
5. doc.save(output_path)
```

### Accumulator Pattern

Three multi-line constructs need accumulation before flushing:

- **Bullet list:** Lines starting with `- `. Accumulate until a non-bullet line. Then `doc.bullet_list(items)`.
- **Numbered list:** Lines starting with `N. `. Accumulate until a non-numbered line. Then `doc.numbered_list(items)`.
- **Table:** Lines starting with `|`. Accumulate all rows. First row = headers. Skip separator row (`|---|`). Remaining rows = data. Then `doc.table(headers, rows)`.

### Error Handling

- Unrecognized line patterns fall back to `doc.body(line)`. Content is never dropped.
- A warning is printed to stderr for any fallback: `Warning: unrecognized pattern at line N, rendering as body text`.
- Missing `<!-- SECTION: -->` markers → treat the entire file as a single body section.
- Empty sections are skipped silently.

### Title Page Parsing

The title page section has a specific structure:

```markdown
<!-- SECTION: title_page -->

# Document Title Here

**Review Document**

March 26, 2026

**Prepared for:** Team Name
**Prepared by:** Author Name
```

Parser extracts:
- First `# ` line → `title`
- First `**bold text**` without a colon → `subtitle` (the document type label)
- First bare date-like line → part of `prepared_for` display
- `**Prepared for:**` → `prepared_for`
- `**Prepared by:**` → combined with date into the attribution line

### Intro Letter Parsing

```markdown
<!-- SECTION: intro_letter -->

# A Note to Trisha

[body paragraphs...]

With respect for the work already done,

The Healing Hearts Website Project
```

Parser extracts:
- `# ` line → used as greeting context (salutation derived from it)
- Consecutive paragraphs → body
- Last 1-2 short lines (after a blank line gap) → sign-off

---

## Component 3: Google Drive Upload (`lib/gdrive_upload.py`)

### What It Does

CLI script that uploads a DOCX file to Google Drive with MIME type conversion, producing a native Google Doc. Returns the Google Doc URL.

### CLI Interface

```bash
python gdrive_upload.py output.docx --name "HH Copy Audit - Review" [--folder FOLDER_ID]
```

Prints JSON to stdout: `{"id": "abc123", "url": "https://docs.google.com/document/d/abc123/edit"}`

Exit codes: 0 = success (uploaded), 2 = skipped (no credentials), 1 = error.

### Authentication

Uses the PHEDRIS service account with Domain-Wide Delegation, same pattern as all PHEDRIS Google integrations:

```python
from google.oauth2 import service_account
from googleapiclient.discovery import build

creds = service_account.Credentials.from_service_account_file(
    key_path,
    scopes=["https://www.googleapis.com/auth/drive"]
)
creds = creds.with_subject("chasejamison@healingheartscourse.com")
drive = build("drive", "v3", credentials=creds)
```

### Credential Discovery

1. `GOOGLE_SERVICE_ACCOUNT_KEY` environment variable → path to local copy of service account JSON
2. Not found → exit code 2, print to stderr: `"Google Drive credentials not configured. Set GOOGLE_SERVICE_ACCOUNT_KEY to the path of your service account JSON. DOCX saved locally."`

### One-Time Setup (not code)

The service account JSON lives on the PHEDRIS server. Copy it locally once:

```bash
ssh chase@10.0.0.100 "sudo cat /opt/phedris/credentials/service-account.json" > ~/.config/phedris-service-account.json
```

Then add to shell profile (`~/.bashrc` or equivalent):

```bash
export GOOGLE_SERVICE_ACCOUNT_KEY="$HOME/.config/phedris-service-account.json"
```

Server path: `/opt/phedris/credentials/service-account.json`
SSH user: `chase@10.0.0.100`
Sudo required: yes (file is in `/opt/phedris/` which is owned by root)

### Upload Mechanics

```python
file_metadata = {
    "name": doc_name,
    "mimeType": "application/vnd.google-apps.document",  # triggers conversion
}
if folder_id:
    file_metadata["parents"] = [folder_id]

media = MediaFileUpload(docx_path, mimetype="application/vnd.openxmlformats-officedocument.wordprocessingml.document")
file = drive.files().create(body=file_metadata, media_body=media, fields="id").execute()
url = f"https://docs.google.com/document/d/{file['id']}/edit"
```

### Font Survival

Theme fonts are constrained to Google Fonts (enforced by theme-schema.md). Cormorant Garamond and Arial both survive DOCX → Google Docs conversion. No extra handling needed.

---

## Component 4: Doc-Builder Agent Update

### Changes to `agents/doc-builder.md`

Only Steps 7 and 8 change. The pipeline logic (Steps 1-6) is unchanged.

### Step 7 (updated): Render Output

```
Phase 2 (current):

1. Save the writer's output as markdown in the current working directory.
   Filename: [document-type]-[slug]-[YYYY-MM-DD].md

2. Render DOCX via Bash:
   python ${CLAUDE_PLUGIN_ROOT}/lib/render_docx.py \
     <markdown_path> \
     --theme <theme_name_from_brief> \
     --output <docx_path>

   DOCX filename: same as markdown, with .docx extension.

3. If the DOCX rendered successfully, attempt Google Drive upload via Bash:
   python ${CLAUDE_PLUGIN_ROOT}/lib/gdrive_upload.py \
     <docx_path> \
     --name "<document_title_from_brief>"

   If the upload script exits with code 2 (no credentials), note this in
   the result — do not treat it as an error.

   If a folder_id is specified in the user's request, pass --folder <id>.
```

### Step 8 (updated): Return Result

Report back to the user with:

1. **Markdown file path** — the human-readable intermediate document
2. **DOCX file path** — the branded rendered document
3. **Google Doc URL** — if upload succeeded; or "DOCX saved locally (Google Drive not configured)" if credentials not found
4. **Quality summary** — unchanged from Phase 1
5. **NEEDS INPUT items** — unchanged from Phase 1

---

## Testing Plan

### Test 1: ThemedDocument renders identically to HHDocument

Run the existing `build-trisha-review-doc.py` with the old `HHDocument` and the new wrapper. Compare the two DOCX files visually — fonts, colors, borders, tables, spacing should be identical.

### Test 2: Theme swap produces a different document

Render the copy audit review with `--theme neutral`. Verify: slate colors instead of teal/coral, Times New Roman display font instead of Cormorant Garamond, alternating table rows enabled.

### Test 3: Renderer handles the copy audit markdown

Run `render_docx.py` on `docs/copy-audit-review.md` (the Phase 1 test output). Verify all sections render: title page, intro letter, executive summary, 8 findings with labeled severity/observation/impact, recommendations table, next steps list.

### Test 4: Google Drive upload produces a readable Google Doc

Upload the rendered DOCX. Open the Google Doc. Verify: Cormorant Garamond title, teal section borders, coral callout borders, table headers with white text on teal background.

### Test 5: Full pipeline end-to-end

Request a new document through the agent pipeline. Verify the doc-builder agent produces: markdown + DOCX + Google Doc link in a single run.

---

## Success Criteria

- [ ] `ThemedDocument("healing-hearts")` produces output identical to the old `HHDocument`
- [ ] `ThemedDocument("neutral")` produces a visually distinct, equally polished document
- [ ] `render_docx.py` converts the copy audit review markdown to a properly branded DOCX
- [ ] `gdrive_upload.py` uploads and returns a working Google Doc URL
- [ ] `build-trisha-review-doc.py` continues to work via the wrapper with zero changes
- [ ] Full pipeline (agents → markdown → DOCX → Google Doc) completes in a single run
- [ ] No warnings from the renderer on well-formed writer output
