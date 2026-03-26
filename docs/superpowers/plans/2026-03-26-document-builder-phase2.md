# Document Builder Phase 2 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add DOCX rendering and Google Drive upload to the document-builder plugin, bridging the agent pipeline's markdown output to branded documents.

**Architecture:** Three new Python files in `~/.claude/plugins/document-builder/lib/`: ThemedDocument (theme-parameterized python-docx class refactored from hh_docx_style.py), render_docx.py (CLI that parses writer markdown and calls ThemedDocument methods), gdrive_upload.py (CLI that uploads DOCX to Google Drive via DWD service account). The doc-builder agent's Step 7 is updated to call these scripts via Bash.

**Tech Stack:** Python 3.14, python-docx 1.2.0, google-api-python-client, google-auth (all globally installed). Claude Code plugin system (markdown agents).

**Spec:** `docs/superpowers/specs/2026-03-26-document-builder-phase2-design.md`

**Test fixture:** `docs/copy-audit-review.md` — the Phase 1 pipeline output we'll render as DOCX.

---

## File Structure

```
~/.claude/plugins/document-builder/
  lib/                              # NEW directory
    themed_document.py              # NEW — Task 1 (refactor from hh_docx_style.py)
    render_docx.py                  # NEW — Task 3 (markdown → DOCX CLI)
    gdrive_upload.py                # NEW — Task 4 (DOCX → Google Drive CLI)
  agents/
    doc-builder.md                  # EDIT — Task 5 (Steps 7 + 8)

~/Documents/HealingHeartsWebsite/
  scripts/
    hh_docx_style.py               # EDIT — Task 2 (gut to wrapper)
```

---

### Task 1: ThemedDocument class

**Files:**
- Read: `C:\Users\chase\Documents\HealingHeartsWebsite\scripts\hh_docx_style.py` (source to refactor)
- Read: `C:\Users\chase\.claude\plugins\document-builder\themes\healing-hearts.json` (theme tokens)
- Create: `C:\Users\chase\.claude\plugins\document-builder\lib\themed_document.py`

- [ ] **Step 1: Create the lib directory**

```bash
mkdir -p ~/.claude/plugins/document-builder/lib
```

- [ ] **Step 2: Write themed_document.py**

Create `~/.claude/plugins/document-builder/lib/themed_document.py`.

This is a refactor of `hh_docx_style.py` with these specific changes:

1. Remove all module-level constants (`TEAL`, `CORAL`, `FONT_DISPLAY`, `SPACE_XS`, etc.)
2. Add `__init__` that loads a theme JSON file and builds lookup dicts
3. Replace every constant reference in every method with the corresponding `self.*` lookup

The full mapping:

```python
"""
Themed Document Builder
=======================
Theme-parameterized DOCX document builder. Reads colors, fonts, sizes,
spacing, and decorations from a JSON theme file.

Refactored from hh_docx_style.py. Same API, same output, parameterized.

Usage:
    from themed_document import ThemedDocument

    doc = ThemedDocument(theme="healing-hearts")
    doc.title_page("Title", "Subtitle")
    doc.section("1. Section")
    doc.body("Paragraph text")
    doc.save("output.docx")
"""

import json
from docx import Document
from docx.shared import Pt, Inches, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
from pathlib import Path


class ThemedDocument:
    """Theme-parameterized document builder using python-docx."""

    def __init__(self, theme="healing-hearts", margins=1.0):
        theme_path = Path(__file__).parent.parent / "themes" / f"{theme}.json"
        if not theme_path.exists():
            raise FileNotFoundError(f"Theme not found: {theme_path}")
        raw = json.loads(theme_path.read_text(encoding="utf-8"))

        # Build color lookup: {"primary": RGBColor(...), ...}
        self.colors = {k: self._hex_to_rgb(v) for k, v in raw["colors"].items()}
        self.fonts = raw["fonts"]
        self.sizes = raw["sizes"]
        self.spacing = raw["spacing"]
        self.decorations = raw["decorations"]

        # Store raw hex colors for XML operations (borders, shading)
        self._hex = raw["colors"]

        self.doc = Document()
        for section in self.doc.sections:
            section.top_margin = Inches(margins)
            section.bottom_margin = Inches(margins)
            section.left_margin = Inches(margins)
            section.right_margin = Inches(margins)

    @staticmethod
    def _hex_to_rgb(hex_str):
        """Convert '#1191B1' to RGBColor(0x11, 0x91, 0xB1)."""
        h = hex_str.lstrip("#")
        return RGBColor(int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16))

    @staticmethod
    def _hex_strip(hex_str):
        """Convert '#1191B1' to '1191B1' for XML attributes."""
        return hex_str.lstrip("#")
```

Then copy every method from `hh_docx_style.py` (`_para`, `_add_run`, `_set_cell_shading`, `_add_bottom_border`, `_add_left_border`, `title_page`, `intro_letter`, `section`, `subsection`, `subsubsection`, `body`, `labeled`, `bullet_list`, `numbered_list`, `callout`, `divider`, `script_section`, `script_line`, `stage_direction`, `production_note`, `speaker_label`, `review_prompt`, `table`, `metadata`, `page_break`, `closing`, `closing_with_steps`, `save`) and apply these substitutions throughout:

| In hh_docx_style.py | Replace with |
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
| `color_hex="1191B1"` | `color_hex=self._hex_strip(self._hex["primary"])` |
| `color_hex="B96A5F"` | `color_hex=self._hex_strip(self._hex["secondary"])` |
| `color_hex="7CC7D9"` | `color_hex=self._hex_strip(self._hex["primary_light"])` |
| `self._set_cell_shading(cell, "1191B1")` | `self._set_cell_shading(cell, self._hex_strip(self._hex["primary"]))` |
| Hardcoded size numbers (e.g., `size=36`) | `size=self.sizes["display"]` (etc., matching the sizes mapping) |

The `_para` method's default `size=11` becomes `size=None` with a fallback:

```python
def _para(self, text="", font=None, size=None, color=None, bold=False,
          italic=False, align=None, space_before=0, space_after=6, left_indent=None):
    font = font or self.fonts["body"]
    size = size or self.sizes["body"]
    color = color or self.colors["text"]
    # ... rest unchanged
```

Similarly, `_add_run` defaults become `None` with fallbacks to theme values.

**Key detail for `_add_bottom_border` and `_add_left_border`:** These methods accept `color_hex` as a string (e.g., `"1191B1"`). Callers must now pass the hex-stripped value. Update every call site:

In `title_page`:
```python
self._add_bottom_border(p, color_hex=self._hex_strip(self._hex["secondary"]), size="4", space="8")
```

In `section`:
```python
self._add_bottom_border(p, color_hex=self._hex_strip(self._hex["primary"]), size="4", space="4")
```

In `callout`:
```python
self._add_left_border(p, color_hex=self._hex_strip(self._hex["secondary"]), size="18", space="10")
```

In `divider`:
```python
self._add_bottom_border(p, color_hex=self._hex_strip(self._hex["primary_light"]), size="2", space="0")
```

- [ ] **Step 3: Verify ThemedDocument loads and renders**

```bash
cd ~/.claude/plugins/document-builder
python -c "
import sys
sys.path.insert(0, 'lib')
from themed_document import ThemedDocument
doc = ThemedDocument(theme='healing-hearts')
doc.title_page('Test Document', 'Verification', prepared_for='Test')
doc.section('Section 1')
doc.body('This is a test paragraph.')
doc.labeled('Key point:', 'This tests the labeled method.')
doc.bullet_list(['Item one', 'Item two', 'Item three'])
doc.callout('This is a callout box.')
doc.table(['Col A', 'Col B'], [['Row 1A', 'Row 1B'], ['Row 2A', 'Row 2B']])
doc.save('/tmp/theme-test.docx')
print('SUCCESS: /tmp/theme-test.docx created')
"
```

Expected: `SUCCESS: /tmp/theme-test.docx created`. Open the DOCX and verify teal headings, coral callout borders, branded table.

- [ ] **Step 4: Verify neutral theme produces different output**

```bash
cd ~/.claude/plugins/document-builder
python -c "
import sys
sys.path.insert(0, 'lib')
from themed_document import ThemedDocument
doc = ThemedDocument(theme='neutral')
doc.title_page('Test Document', 'Neutral Theme', prepared_for='Test')
doc.section('Section 1')
doc.body('This is a test paragraph.')
doc.callout('This is a callout box.')
doc.table(['Col A', 'Col B'], [['Row 1A', 'Row 1B'], ['Row 2A', 'Row 2B']])
doc.save('/tmp/neutral-test.docx')
print('SUCCESS: /tmp/neutral-test.docx created')
"
```

Expected: `SUCCESS`. Open and verify: slate colors, Times New Roman display font, alternating table rows.

- [ ] **Step 5: Commit**

```bash
cd ~/.claude/plugins/document-builder
git add lib/themed_document.py
git commit -m "feat: add ThemedDocument class — theme-parameterized python-docx builder"
```

---

### Task 2: Backward-compatible HHDocument wrapper

**Files:**
- Modify: `C:\Users\chase\Documents\HealingHeartsWebsite\scripts\hh_docx_style.py`

- [ ] **Step 1: Replace hh_docx_style.py with wrapper**

Replace the entire contents of `C:\Users\chase\Documents\HealingHeartsWebsite\scripts\hh_docx_style.py` with:

```python
"""
Healing Hearts DOCX Style Module — Backward-Compatible Wrapper
===============================================================
Delegates to ThemedDocument with the healing-hearts theme.
All existing scripts (build-trisha-review-doc.py, etc.) continue to work.

Usage unchanged:
    from hh_docx_style import HHDocument
    doc = HHDocument()
    doc.title_page("Title", "Subtitle")
    doc.save("output.docx")
"""

import sys
from pathlib import Path

# Add the document-builder plugin's lib to the path
_plugin_lib = Path.home() / ".claude" / "plugins" / "document-builder" / "lib"
if str(_plugin_lib) not in sys.path:
    sys.path.insert(0, str(_plugin_lib))

from themed_document import ThemedDocument


class HHDocument(ThemedDocument):
    """Healing Hearts branded document — delegates to ThemedDocument."""

    def __init__(self, margins=1.0):
        super().__init__(theme="healing-hearts", margins=margins)
```

- [ ] **Step 2: Verify build-trisha-review-doc.py still works**

```bash
cd "C:\Users\chase\Documents\HealingHeartsWebsite\scripts"
python -c "
from hh_docx_style import HHDocument
doc = HHDocument()
doc.title_page('Backward Compat Test', 'Wrapper Verification', prepared_for='Test')
doc.section('Test Section')
doc.body('If you can read this, the wrapper works.')
doc.save('/tmp/wrapper-test.docx')
print('SUCCESS: wrapper works')
"
```

Expected: `SUCCESS: wrapper works`. The import path, class name, and method API all work identically to the old module.

- [ ] **Step 3: Commit**

```bash
cd "C:\Users\chase\Documents\HealingHeartsWebsite"
git add scripts/hh_docx_style.py
git commit -m "refactor: replace hh_docx_style.py with thin wrapper over ThemedDocument"
```

---

### Task 3: Markdown-to-DOCX renderer

**Files:**
- Create: `C:\Users\chase\.claude\plugins\document-builder\lib\render_docx.py`

- [ ] **Step 1: Write render_docx.py**

Create `~/.claude/plugins/document-builder/lib/render_docx.py`:

```python
"""
Markdown-to-DOCX Renderer
==========================
CLI tool that reads the doc-writer agent's structured markdown output
and renders it as a branded DOCX using ThemedDocument.

Usage:
    python render_docx.py input.md --theme healing-hearts --output output.docx

The markdown must use <!-- SECTION: name --> markers as produced by the
doc-writer agent. See the spec for the full markdown contract.
"""

import argparse
import re
import sys
from pathlib import Path

# Ensure themed_document is importable from same directory
sys.path.insert(0, str(Path(__file__).parent))
from themed_document import ThemedDocument


def parse_sections(text):
    """Split markdown text on <!-- SECTION: name --> markers.

    Returns list of (section_name, content) tuples.
    """
    pattern = r'<!--\s*SECTION:\s*(\w+)\s*-->'
    parts = re.split(pattern, text)

    # parts[0] is text before first marker (usually empty), then alternating name, content
    sections = []
    i = 1  # skip pre-marker text
    while i < len(parts) - 1:
        name = parts[i].strip()
        content = parts[i + 1].strip()
        sections.append((name, content))
        i += 2
    return sections


def parse_title_page(content, doc):
    """Parse title page fields and call doc.title_page()."""
    title = None
    subtitle = None
    prepared_for = None
    prepared_by = None
    date_line = None

    for line in content.split("\n"):
        line = line.strip()
        if not line:
            continue
        if line.startswith("# "):
            title = line[2:].strip()
        elif re.match(r'\*\*Prepared for:\*\*\s*(.+)', line):
            prepared_for = re.match(r'\*\*Prepared for:\*\*\s*(.+)', line).group(1)
        elif re.match(r'\*\*Prepared by:\*\*\s*(.+)', line):
            prepared_by = re.match(r'\*\*Prepared by:\*\*\s*(.+)', line).group(1)
        elif re.match(r'\*\*(.+?)\*\*$', line) and subtitle is None:
            # Bold text without colon = subtitle (document type label)
            subtitle = re.match(r'\*\*(.+?)\*\*$', line).group(1)
        elif re.match(r'^[A-Z][a-z]+ \d{1,2}, \d{4}$', line):
            date_line = line
        elif line == "---":
            continue

    # Build attribution line
    attribution_parts = []
    if prepared_by:
        attribution_parts.append(f"Prepared by {prepared_by}")
    if date_line:
        attribution_parts.append(date_line)
    attribution = "  |  ".join(attribution_parts) if attribution_parts else None

    doc.title_page(
        title=title or "Untitled Document",
        subtitle=subtitle or "Document",
        prepared_for=attribution or prepared_for,
    )


def parse_intro_letter(content, doc):
    """Parse intro letter and call doc.intro_letter()."""
    lines = content.split("\n")

    greeting = None
    body_paragraphs = []
    signoff_lines = []

    # Find the heading (used as greeting context)
    body_started = False
    current_para = []
    in_signoff = False

    for line in lines:
        stripped = line.strip()

        if stripped.startswith("# "):
            # Use heading to derive a greeting
            heading_text = stripped[2:].strip()
            if "Trisha" in heading_text:
                greeting = "Dear Trisha,"
            elif "Chase" in heading_text:
                greeting = "Dear Chase,"
            else:
                greeting = f"Dear {heading_text.replace('A Note to ', '')},"
            continue

        if not stripped:
            # Blank line — flush current paragraph
            if current_para:
                text = " ".join(current_para)
                if not in_signoff:
                    body_paragraphs.append(text)
                else:
                    signoff_lines.append(text)
                current_para = []
            # Check if remaining content is short (sign-off detection)
            continue

        current_para.append(stripped)

    # Flush remaining
    if current_para:
        text = " ".join(current_para)
        body_paragraphs.append(text)

    # Detect sign-off: last 1-2 short items (under 60 chars) are likely sign-off
    signoff = "-- The Team"
    if body_paragraphs:
        # Check if last paragraph is short (sign-off)
        if len(body_paragraphs[-1]) < 60:
            candidate = body_paragraphs.pop()
            # Check if second-to-last is also short (two-line sign-off)
            if body_paragraphs and len(body_paragraphs[-1]) < 60:
                signoff = body_paragraphs.pop() + "\n" + candidate
            else:
                signoff = candidate

    doc.intro_letter(
        greeting=greeting or "Dear Reader,",
        paragraphs=body_paragraphs,
        signoff=signoff,
    )


def flush_accumulator(doc, acc_type, acc_items):
    """Flush accumulated multi-line items to the document."""
    if not acc_items:
        return
    if acc_type == "bullet":
        doc.bullet_list(acc_items)
    elif acc_type == "numbered":
        doc.numbered_list(acc_items)
    elif acc_type == "table":
        # First row = headers, skip separator rows, rest = data
        headers = []
        rows = []
        for i, row in enumerate(acc_items):
            cells = [c.strip() for c in row.strip("|").split("|")]
            if i == 0:
                headers = cells
            elif all(re.match(r'^-+$', c.strip()) for c in cells):
                continue  # separator row
            else:
                rows.append(cells)
        if headers:
            doc.table(headers, rows)


def process_body_section(content, doc):
    """Process a generic content section line-by-line."""
    lines = content.split("\n")

    acc_type = None  # "bullet", "numbered", "table"
    acc_items = []

    i = 0
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        # Skip empty lines (flush accumulator first)
        if not stripped:
            flush_accumulator(doc, acc_type, acc_items)
            acc_type = None
            acc_items = []
            i += 1
            continue

        # H1 heading
        if re.match(r'^# .+', stripped):
            flush_accumulator(doc, acc_type, acc_items)
            acc_type = None
            acc_items = []
            doc.section(stripped[2:].strip())
            i += 1
            continue

        # H2 heading
        if re.match(r'^## .+', stripped):
            flush_accumulator(doc, acc_type, acc_items)
            acc_type = None
            acc_items = []
            doc.subsection(stripped[3:].strip())
            i += 1
            continue

        # H3 heading
        if re.match(r'^### .+', stripped):
            flush_accumulator(doc, acc_type, acc_items)
            acc_type = None
            acc_items = []
            doc.subsubsection(stripped[4:].strip())
            i += 1
            continue

        # Divider
        if re.match(r'^---+$', stripped):
            flush_accumulator(doc, acc_type, acc_items)
            acc_type = None
            acc_items = []
            doc.divider()
            i += 1
            continue

        # Table row
        if stripped.startswith("|") and stripped.endswith("|"):
            if acc_type != "table":
                flush_accumulator(doc, acc_type, acc_items)
                acc_type = "table"
                acc_items = []
            acc_items.append(stripped)
            i += 1
            continue

        # Bullet list item
        if re.match(r'^- .+', stripped):
            if acc_type != "bullet":
                flush_accumulator(doc, acc_type, acc_items)
                acc_type = "bullet"
                acc_items = []
            acc_items.append(stripped[2:].strip())
            i += 1
            continue

        # Numbered list item
        if re.match(r'^\d+\.\s+', stripped):
            if acc_type != "numbered":
                flush_accumulator(doc, acc_type, acc_items)
                acc_type = "numbered"
                acc_items = []
            acc_items.append(re.sub(r'^\d+\.\s+', '', stripped))
            i += 1
            continue

        # Blockquote → callout
        if stripped.startswith("> "):
            flush_accumulator(doc, acc_type, acc_items)
            acc_type = None
            acc_items = []
            doc.callout(stripped[2:].strip())
            i += 1
            continue

        # Labeled paragraph: **Label:** rest of text
        labeled_match = re.match(r'^\*\*(.+?):\*\*\s*(.+)', stripped)
        if labeled_match:
            flush_accumulator(doc, acc_type, acc_items)
            acc_type = None
            acc_items = []
            label = labeled_match.group(1) + ":"
            text = labeled_match.group(2)
            doc.labeled(label, text)
            i += 1
            continue

        # Bold-only line (standalone bold text, not a label)
        bold_match = re.match(r'^\*\*(.+?)\*\*$', stripped)
        if bold_match:
            flush_accumulator(doc, acc_type, acc_items)
            acc_type = None
            acc_items = []
            # Render as a bold body paragraph
            doc.body(bold_match.group(1))
            i += 1
            continue

        # Plain paragraph (default)
        flush_accumulator(doc, acc_type, acc_items)
        acc_type = None
        acc_items = []
        doc.body(stripped)
        i += 1

    # Flush any remaining accumulator
    flush_accumulator(doc, acc_type, acc_items)


def render(input_path, theme, output_path):
    """Main render pipeline: markdown → ThemedDocument → DOCX."""
    text = Path(input_path).read_text(encoding="utf-8")
    sections = parse_sections(text)

    if not sections:
        print("Warning: no <!-- SECTION: --> markers found. Rendering as single body section.",
              file=sys.stderr)
        sections = [("body", text)]

    doc = ThemedDocument(theme=theme)

    for i, (name, content) in enumerate(sections):
        if name == "title_page":
            parse_title_page(content, doc)
        elif name == "intro_letter":
            parse_intro_letter(content, doc)
        else:
            # Page break between major sections (not before first body section)
            if i > 0 and name != "title_page":
                doc.page_break()
            process_body_section(content, doc)

    doc.save(output_path)
    return output_path


def main():
    parser = argparse.ArgumentParser(description="Render markdown to branded DOCX")
    parser.add_argument("input", help="Path to markdown file")
    parser.add_argument("--theme", required=True, help="Theme name (e.g., healing-hearts)")
    parser.add_argument("--output", required=True, help="Output DOCX path")
    args = parser.parse_args()

    if not Path(args.input).exists():
        print(f"Error: input file not found: {args.input}", file=sys.stderr)
        sys.exit(1)

    try:
        result = render(args.input, args.theme, args.output)
        print(f"Rendered: {result}")
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Test renderer on the copy audit review markdown**

```bash
cd ~/.claude/plugins/document-builder
python lib/render_docx.py \
  "C:\Users\chase\Documents\HealingHeartsWebsite\docs\copy-audit-review.md" \
  --theme healing-hearts \
  --output /tmp/copy-audit-review.docx
```

Expected: `Rendered: /tmp/copy-audit-review.docx`. Open the DOCX and verify:
- Title page with Cormorant Garamond title in teal, coral subtitle
- Intro letter addressed to Trisha with sign-off
- Executive summary as body text (no bullets)
- 8 findings with labeled Severity/Observation/Impact fields
- Recommendations table with teal header row
- Next steps as numbered list

- [ ] **Step 3: Test renderer with neutral theme**

```bash
cd ~/.claude/plugins/document-builder
python lib/render_docx.py \
  "C:\Users\chase\Documents\HealingHeartsWebsite\docs\copy-audit-review.md" \
  --theme neutral \
  --output /tmp/copy-audit-review-neutral.docx
```

Expected: `Rendered: /tmp/copy-audit-review-neutral.docx`. Open and verify slate colors, Times New Roman display font.

- [ ] **Step 4: Test error handling — missing file**

```bash
cd ~/.claude/plugins/document-builder
python lib/render_docx.py /tmp/nonexistent.md --theme healing-hearts --output /tmp/out.docx
echo "Exit code: $?"
```

Expected: `Error: input file not found: /tmp/nonexistent.md` and exit code 1.

- [ ] **Step 5: Commit**

```bash
cd ~/.claude/plugins/document-builder
git add lib/render_docx.py
git commit -m "feat: add markdown-to-DOCX renderer CLI"
```

---

### Task 4: Google Drive upload CLI

**Files:**
- Create: `C:\Users\chase\.claude\plugins\document-builder\lib\gdrive_upload.py`

- [ ] **Step 1: Write gdrive_upload.py**

Create `~/.claude/plugins/document-builder/lib/gdrive_upload.py`:

```python
"""
Google Drive Upload Helper
===========================
CLI tool that uploads a DOCX file to Google Drive with MIME type conversion,
producing a native Google Doc. Returns the Google Doc URL as JSON.

Usage:
    python gdrive_upload.py output.docx --name "Document Title" [--folder FOLDER_ID]

Requires GOOGLE_SERVICE_ACCOUNT_KEY env var pointing to a service account JSON file.
Uses Domain-Wide Delegation to impersonate chasejamison@healingheartscourse.com.

Setup:
    ssh chase@10.0.0.100 "sudo cat /opt/phedris/credentials/service-account.json" > ~/.config/phedris-service-account.json
    export GOOGLE_SERVICE_ACCOUNT_KEY="$HOME/.config/phedris-service-account.json"
"""

import argparse
import json
import os
import sys
from pathlib import Path

SCOPES = ["https://www.googleapis.com/auth/drive"]
IMPERSONATE_USER = "chasejamison@healingheartscourse.com"
DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
GDOC_MIME = "application/vnd.google-apps.document"


def get_credentials(key_path):
    """Load service account credentials with DWD impersonation."""
    from google.oauth2 import service_account
    creds = service_account.Credentials.from_service_account_file(
        key_path, scopes=SCOPES
    )
    return creds.with_subject(IMPERSONATE_USER)


def upload(docx_path, doc_name, folder_id=None):
    """Upload DOCX to Google Drive as a Google Doc. Returns {id, url}."""
    key_path = os.environ.get("GOOGLE_SERVICE_ACCOUNT_KEY")
    if not key_path or not Path(key_path).exists():
        print(
            "Google Drive credentials not configured. "
            "Set GOOGLE_SERVICE_ACCOUNT_KEY to the path of your service account JSON. "
            "DOCX saved locally.",
            file=sys.stderr,
        )
        sys.exit(2)

    from googleapiclient.discovery import build
    from googleapiclient.http import MediaFileUpload

    creds = get_credentials(key_path)
    drive = build("drive", "v3", credentials=creds)

    file_metadata = {
        "name": doc_name,
        "mimeType": GDOC_MIME,
    }
    if folder_id:
        file_metadata["parents"] = [folder_id]

    media = MediaFileUpload(docx_path, mimetype=DOCX_MIME)
    file = drive.files().create(
        body=file_metadata, media_body=media, fields="id"
    ).execute()

    file_id = file["id"]
    url = f"https://docs.google.com/document/d/{file_id}/edit"

    return {"id": file_id, "url": url}


def main():
    parser = argparse.ArgumentParser(description="Upload DOCX to Google Drive")
    parser.add_argument("docx", help="Path to DOCX file")
    parser.add_argument("--name", required=True, help="Document name in Google Drive")
    parser.add_argument("--folder", default=None, help="Google Drive folder ID (optional)")
    args = parser.parse_args()

    if not Path(args.docx).exists():
        print(f"Error: DOCX file not found: {args.docx}", file=sys.stderr)
        sys.exit(1)

    try:
        result = upload(args.docx, args.name, args.folder)
        print(json.dumps(result))
    except Exception as e:
        print(f"Error uploading to Google Drive: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Test credential-not-found path**

```bash
cd ~/.claude/plugins/document-builder
unset GOOGLE_SERVICE_ACCOUNT_KEY
python lib/gdrive_upload.py /tmp/copy-audit-review.docx --name "Test"
echo "Exit code: $?"
```

Expected: stderr message about missing credentials, exit code 2.

- [ ] **Step 3: Commit**

```bash
cd ~/.claude/plugins/document-builder
git add lib/gdrive_upload.py
git commit -m "feat: add Google Drive upload CLI with DWD auth"
```

- [ ] **Step 4: (Deferred) Test live upload after one-time credential setup**

This step runs after Chase copies the service account key locally:

```bash
ssh chase@10.0.0.100 "sudo cat /opt/phedris/credentials/service-account.json" > ~/.config/phedris-service-account.json
export GOOGLE_SERVICE_ACCOUNT_KEY="$HOME/.config/phedris-service-account.json"

cd ~/.claude/plugins/document-builder
python lib/gdrive_upload.py /tmp/copy-audit-review.docx --name "HH Copy Audit - Test Upload"
```

Expected: JSON output with `id` and `url`. Open the URL and verify the Google Doc has correct formatting.

---

### Task 5: Update doc-builder agent

**Files:**
- Modify: `C:\Users\chase\.claude\plugins\document-builder\agents\doc-builder.md`

- [ ] **Step 1: Read the current doc-builder.md**

Read `~/.claude/plugins/document-builder/agents/doc-builder.md` to locate the exact text of Steps 7 and 8.

- [ ] **Step 2: Replace Step 7**

Find the current Step 7 block (starts with `### Step 7: Render Output`) and replace it with:

```markdown
### Step 7: Render Output

Render the document in two formats: markdown (human-readable) and DOCX (branded).

**7a. Save markdown:**

Save the writer's complete output as a markdown file in the current working directory.

Filename format: `[document-type]-[slug]-[YYYY-MM-DD].md`
- `document-type`: the template name (e.g., `review-doc`, `status-report`)
- `slug`: a 2-4 word kebab-case summary of the document title
- `YYYY-MM-DD`: today's date

Write the file using the Write tool.

**7b. Render DOCX:**

Run the markdown-to-DOCX renderer via Bash:

```
python ${CLAUDE_PLUGIN_ROOT}/lib/render_docx.py <markdown_path> --theme <theme_name_from_brief> --output <docx_path>
```

The DOCX filename uses the same name as the markdown file, with `.docx` extension.

If the renderer exits with an error, report the error to the user and include the markdown file path as the fallback deliverable.

**7c. Upload to Google Drive (optional):**

If the DOCX rendered successfully, attempt upload via Bash:

```
python ${CLAUDE_PLUGIN_ROOT}/lib/gdrive_upload.py <docx_path> --name "<document_title_from_brief>"
```

If the upload script exits with code 2 (no credentials configured), note this in the result. Do not treat it as an error — the DOCX is still the deliverable.

If a Google Drive folder ID is specified in the user's request, pass `--folder <id>`.
```

- [ ] **Step 3: Replace Step 8**

Find the current Step 8 block (starts with `### Step 8: Return Result`) and replace it with:

```markdown
### Step 8: Return Result

Report back to the user with:

1. **Markdown file path** — the human-readable intermediate document
2. **DOCX file path** — the branded rendered document (if rendering succeeded)
3. **Google Doc URL** — if upload succeeded; or "DOCX saved locally (Google Drive not configured)" if credentials not found; or omit if DOCX rendering failed
4. **Quality summary** — one of:
   - "APPROVED — passed all quality checks"
   - "APPROVED WITH NOTES — [list any MINOR items that were not fixed]"
   - "APPROVED AFTER REVISION — [brief note on what was corrected]"
5. **NEEDS INPUT items** — if any `[NEEDS INPUT: ...]` markers remain, list them clearly
6. **Pipeline notes** — any NOTE TO ORCHESTRATOR items the user should be aware of

Keep the return message concise. The user can open the files to read the full document.
```

- [ ] **Step 4: Verify the agent file is valid**

Read the full `doc-builder.md` to confirm Steps 7 and 8 are correctly placed and no content was accidentally deleted.

- [ ] **Step 5: Commit**

```bash
cd ~/.claude/plugins/document-builder
git add agents/doc-builder.md
git commit -m "feat: update doc-builder Steps 7+8 for DOCX rendering and Drive upload"
```

---

### Task 6: End-to-end verification

**Files:** None (testing only)

- [ ] **Step 1: Render the copy audit review as DOCX**

```bash
cd ~/.claude/plugins/document-builder
python lib/render_docx.py \
  "C:\Users\chase\Documents\HealingHeartsWebsite\docs\copy-audit-review.md" \
  --theme healing-hearts \
  --output "C:\Users\chase\Documents\HealingHeartsWebsite\docs\copy-audit-review.docx"
```

Expected: `Rendered: C:\Users\chase\Documents\HealingHeartsWebsite\docs\copy-audit-review.docx`

- [ ] **Step 2: Open and visually inspect the DOCX**

Open the file and check:
- [ ] Title page: Cormorant Garamond title in teal, coral italic subtitle, centered
- [ ] Intro letter: greeting, 4 body paragraphs, sign-off
- [ ] Executive summary: prose paragraphs, no bullets
- [ ] Findings: H2 headings in coral, labeled Severity/Observation/Impact in teal bold
- [ ] Recommendations: table with teal header row, white text
- [ ] Next steps: numbered list with teal numbers

- [ ] **Step 3: Verify backward compatibility**

```bash
cd "C:\Users\chase\Documents\HealingHeartsWebsite\scripts"
python build-trisha-review-doc.py
```

Expected: The Trisha review doc builds successfully at `C:\Users\chase\Documents\Healing Hearts\Spark Challenge Video Scripts - Trisha Review.docx` (or fails gracefully if the source markdown files aren't present — the point is that the import and class work).
