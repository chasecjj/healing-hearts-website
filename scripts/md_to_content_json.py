#!/usr/bin/env python3
"""
md_to_content_json.py — Convert Healing Hearts v2 lesson markdown to content_json JSONB format.

Each markdown file contains one parent lesson with multiple sub-lessons (H2 boundaries).
Output: one JSON file per sub-lesson, named {lesson_id}.json (e.g., 1.1.1.json).

Usage:
    python md_to_content_json.py [input_dirs...] [--output OUTPUT_DIR]
"""

import json
import os
import re
import sys
from pathlib import Path

# ─── Defaults ───────────────────────────────────────────────────────
DEFAULT_INPUT_DIRS = [
    r"C:\Users\chase\Documents\Mind Vault\Projects\healing-hearts\modules\v2\module-1",
    r"C:\Users\chase\Documents\Mind Vault\Projects\healing-hearts\modules\v2\module-2",
]
DEFAULT_OUTPUT_DIR = r"C:\Users\chase\Documents\Mind Vault\Projects\healing-hearts\modules\v2\conversion\content-json-output"


# ─── Text Processing ───────────────────────────────────────────────


def standardize_dashes(text: str) -> str:
    """Convert -- to em dash in prose text. Handles spaced and unspaced variants."""
    # " -- " → " — "
    text = text.replace(" -- ", " — ")
    # "-- " at line start → "— "
    if text.startswith("-- "):
        text = "— " + text[3:]
    # Handle remaining standalone -- that are likely em dashes
    # Match -- that aren't part of longer sequences (---) and aren't in code
    text = re.sub(r"(?<!-)--(?!-)", "—", text)
    return text


def strip_inline_md(text: str) -> str:
    """Strip bold (**) and italic (*) markers from text."""
    # Bold: **text** → text
    text = re.sub(r"\*\*(.+?)\*\*", r"\1", text)
    # Italic: *text* → text
    text = re.sub(r"(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)", r"\1", text)
    return text


def clean(text: str) -> str:
    """Standardize dashes and strip inline markdown."""
    return strip_inline_md(standardize_dashes(text)).strip()


def clean_keep_md(text: str) -> str:
    """Standardize dashes but keep formatting markers."""
    return standardize_dashes(text).strip()


def escape_sql_string(s: str) -> str:
    """Escape single quotes for SQL string literals."""
    return s.replace("'", "''")


# ─── Frontmatter Parsing ───────────────────────────────────────────


def parse_frontmatter(content: str):
    """Extract simple YAML frontmatter. Returns (metadata_dict, body_text)."""
    if not content.startswith("---"):
        return {}, content
    end_idx = content.index("---", 3)
    fm_text = content[3:end_idx].strip()
    body = content[end_idx + 3 :].strip()

    metadata = {}
    for line in fm_text.split("\n"):
        line = line.strip()
        if ":" in line and not line.startswith("#"):
            key, _, val = line.partition(":")
            key = key.strip()
            val = val.strip().strip('"').strip("'")
            # Handle list values like [1, 2]
            if val.startswith("[") and val.endswith("]"):
                metadata[key] = val
                continue
            try:
                val = int(val)
            except (ValueError, TypeError):
                pass
            metadata[key] = val
    return metadata, body


# ─── Sub-lesson Splitting ──────────────────────────────────────────


def split_sublessons(body: str):
    """Split body at H2 boundaries. Returns list of (id, title, lines)."""
    lines = body.split("\n")
    sublessons = []
    cur_id = None
    cur_title = None
    cur_lines = []

    # Patterns for H2 sub-lesson headers
    # ## 1.1.1 — Title
    # ## Sub-Lesson 1.2.1 — "Title"
    # ## 2.2.1 -- "Title"
    h2_re = re.compile(
        r'^##\s+(?:Sub-Lesson\s+)?(\d+\.\d+\.\d+)\s*[—–\-]+\s*["""]?(.+?)["""]?\s*$'
    )

    for line in lines:
        m = h2_re.match(line)
        if m:
            if cur_id is not None:
                sublessons.append((cur_id, cur_title, cur_lines))
            cur_id = m.group(1)
            cur_title = standardize_dashes(
                m.group(2).strip().strip('"').strip("\u201c").strip("\u201d")
            )
            cur_lines = []
        elif line.startswith("# "):
            # H1 — parent lesson title, skip
            continue
        else:
            if cur_id is not None:
                cur_lines.append(line)

    if cur_id is not None:
        sublessons.append((cur_id, cur_title, cur_lines))

    return sublessons


# ─── Fillable Form Detection ──────────────────────────────────────


def detect_fillable_fields(lines, start_idx):
    """Detect fill-in-the-blank patterns and return (fields, end_idx).

    Patterns:
      **Label:** ___________
      *Label:* ___________
      Label: ___________
      `___________`
    """
    fields = []
    i = start_idx
    field_counter = 0

    while i < len(lines):
        s = lines[i].strip()
        if not s:
            i += 1
            continue

        # Check for labeled field: **Label:** ___ or *Label:* ___
        field_match = re.match(
            r"^(?:\*\*(.+?)\*\*|\*(.+?)\*|(.+?)):\s*[`]?[_]{3,}[`]?\s*$", s
        )
        if field_match:
            label = (
                field_match.group(1) or field_match.group(2) or field_match.group(3)
            ).strip()
            field_counter += 1
            fields.append(
                {
                    "id": f"field_{field_counter}",
                    "label": clean(label),
                    "type": "textarea",
                    "rows": 2,
                    "placeholder": "",
                }
            )
            i += 1
            continue

        # Check for standalone blank line: _______________ (just underscores)
        if re.match(r"^[_]{5,}\s*$", s):
            field_counter += 1
            fields.append(
                {
                    "id": f"field_{field_counter}",
                    "label": "",
                    "type": "textarea",
                    "rows": 3,
                    "placeholder": "",
                }
            )
            i += 1
            continue

        # Check for backtick-wrapped blank: `___________`
        if re.match(r"^`[_]{3,}`\s*$", s):
            field_counter += 1
            fields.append(
                {
                    "id": f"field_{field_counter}",
                    "label": "",
                    "type": "textarea",
                    "rows": 2,
                    "placeholder": "",
                }
            )
            i += 1
            continue

        # Not a fillable field pattern — stop
        break

    return fields, i


# ─── Block Parsing ─────────────────────────────────────────────────


def is_self_review_section(lines, idx):
    """Check if we're in a self-review checklist (internal notes to remove)."""
    s = lines[idx].strip() if idx < len(lines) else ""
    return "self-review checklist" in s.lower() or "self review checklist" in s.lower()


def parse_blocks(lines):
    """Parse content lines into blocks. Returns (blocks, estimated_minutes)."""
    blocks = []
    estimated_minutes = None
    i = 0
    in_self_review = False

    while i < len(lines):
        s = lines[i].strip()

        # Skip empty lines
        if not s:
            i += 1
            continue

        # Skip self-review checklist sections (internal notes)
        if is_self_review_section(lines, i):
            in_self_review = True
            i += 1
            continue
        if in_self_review:
            i += 1
            continue

        # ── Estimated time ──
        time_match = re.match(
            r"^\*Estimated time:?\s*([\d]+(?:\s*[-–]\s*\d+)?)\s*(?:minutes?|min)\*$", s
        )
        if time_match:
            nums = re.findall(r"\d+", time_match.group(1))
            estimated_minutes = int(nums[-1])  # Upper bound
            i += 1
            continue

        # ── Divider (---) ──
        if re.match(r"^-{3,}\s*$", s):
            blocks.append({"type": "divider"})
            i += 1
            continue

        # ── H3 heading ──
        if s.startswith("### "):
            heading_text = s[4:].strip()

            # Special: Reflection heading
            if heading_text.lower().startswith("reflection"):
                i += 1
                ref_content = _collect_reflection_body(lines, i)
                if ref_content["text"]:
                    blocks.append(
                        {"type": "reflection", "content": ref_content["text"]}
                    )
                i = ref_content["end_idx"]
                continue

            # Special: Fillable Form heading (detect by looking ahead for ___ patterns)
            if _has_fillable_ahead(lines, i + 1):
                form_result = _collect_fillable_section(lines, i)
                blocks.append(form_result["block"])
                i = form_result["end_idx"]
                continue

            blocks.append({"type": "heading", "content": clean(heading_text)})
            i += 1
            continue

        # ── H4 subheading ──
        if s.startswith("#### "):
            blocks.append({"type": "subheading", "content": clean(s[5:].strip())})
            i += 1
            continue

        # ── Audio marker ──
        audio_match = re.match(r"^\[AUDIO:\s*(.+)\]$", s)
        if audio_match:
            blocks.append(
                {
                    "type": "audio",
                    "title": standardize_dashes(audio_match.group(1).strip()),
                }
            )
            i += 1
            continue

        # ── Table ──
        if s.startswith("|") and "|" in s[1:]:
            tbl_result = _parse_table(lines, i)
            blocks.extend(tbl_result["blocks"])
            i = tbl_result["end_idx"]
            continue

        # ── Checkbox list ──
        if s.startswith("- [ ]") or s.startswith("- [x]"):
            items = []
            while i < len(lines) and (
                lines[i].strip().startswith("- [ ]")
                or lines[i].strip().startswith("- [x]")
            ):
                item = re.sub(r"^- \[[ x]\]\s*", "", lines[i].strip())
                items.append(clean(item))
                i += 1
            blocks.append({"type": "list", "items": items, "ordered": False})
            continue

        # ── Ordered list ──
        if re.match(r"^\d+\.\s", s):
            items = []
            while i < len(lines) and re.match(r"^\d+\.\s", lines[i].strip()):
                item = re.sub(r"^\d+\.\s*", "", lines[i].strip())
                items.append(clean(item))
                i += 1
            blocks.append({"type": "list", "items": items, "ordered": True})
            continue

        # ── Unordered list ──
        if s.startswith("- ") and not s.startswith("- [ ]"):
            items = []
            while (
                i < len(lines)
                and lines[i].strip().startswith("- ")
                and not lines[i].strip().startswith("- [ ]")
            ):
                item = lines[i].strip()[2:]
                items.append(clean(item))
                i += 1
            blocks.append({"type": "list", "items": items, "ordered": False})
            continue

        # ── Blockquote ──
        if s.startswith("> "):
            quote_lines = []
            while i < len(lines) and lines[i].strip().startswith("> "):
                quote_lines.append(lines[i].strip()[2:])
                i += 1
            content = clean(" ".join(quote_lines))
            blocks.append({"type": "quote", "content": content})
            continue

        # ── Reflection marker (bold prefix) ──
        if s.startswith("**Reflection"):
            ref_text = re.sub(r"^\*\*Reflection:?\*\*\s*", "", s)
            i += 1
            # Collect continuation lines
            while (
                i < len(lines)
                and lines[i].strip()
                and not lines[i].strip().startswith("#")
                and not re.match(r"^-{3,}", lines[i].strip())
            ):
                ref_text += " " + lines[i].strip()
                i += 1
            ref_text = clean(ref_text.strip())
            # Skip "None" reflections
            if ref_text and not re.match(r"^none\.?\s", ref_text, re.IGNORECASE):
                if ref_text.lower().startswith("a gratitude and a takeaway"):
                    # This is a closing reflection — include it
                    blocks.append({"type": "reflection", "content": ref_text})
                else:
                    blocks.append({"type": "reflection", "content": ref_text})
            continue

        # ── Paragraph ──
        para_lines = []
        while (
            i < len(lines)
            and lines[i].strip()
            and not lines[i].strip().startswith("#")
            and not re.match(r"^-{3,}", lines[i].strip())
            and not lines[i].strip().startswith("|")
            and not lines[i].strip().startswith("- ")
            and not re.match(r"^\d+\.\s", lines[i].strip())
            and not lines[i].strip().startswith("> ")
            and not lines[i].strip().startswith("[AUDIO:")
            and not lines[i].strip().startswith("**Reflection")
        ):
            para_lines.append(lines[i].strip())
            i += 1

        if para_lines:
            para = standardize_dashes(" ".join(para_lines))

            # Fully bold paragraph?
            if para.startswith("**") and para.endswith("**") and para.count("**") == 2:
                blocks.append({"type": "bold_text", "content": para[2:-2].strip()})
            # Italic paragraph (single * wrapped)?
            elif (
                para.startswith("*")
                and para.endswith("*")
                and not para.startswith("**")
            ):
                inner = para[1:-1].strip()
                blocks.append({"type": "text", "content": standardize_dashes(inner)})
            else:
                blocks.append({"type": "text", "content": strip_inline_md(para)})
        else:
            i += 1  # Safety: advance past unhandled line

    return blocks, estimated_minutes


# ─── Helper: Reflection Body Collection ────────────────────────────


def _collect_reflection_body(lines, start_idx):
    """Collect reflection content after a ### Reflection heading."""
    parts = []
    i = start_idx
    while i < len(lines):
        s = lines[i].strip()
        if not s:
            i += 1
            continue
        # Stop at next heading or divider
        if s.startswith("#") or re.match(r"^-{3,}", s):
            break
        parts.append(s)
        i += 1
    text = clean(" ".join(parts))
    return {"text": text, "end_idx": i}


# ─── Helper: Fillable Form Detection ──────────────────────────────


def _has_fillable_ahead(lines, start_idx, lookahead=15):
    """Check if fillable-form patterns exist within the next N lines."""
    for j in range(start_idx, min(start_idx + lookahead, len(lines))):
        s = lines[j].strip()
        if re.search(r"[_]{5,}", s):
            return True
    return False


def _collect_fillable_section(lines, heading_idx):
    """Collect a fillable form section starting from an H3 heading."""
    heading = lines[heading_idx].strip()[4:].strip()  # Remove '### '
    form_id = re.sub(r"[^a-z0-9]+", "-", heading.lower()).strip("-")

    i = heading_idx + 1
    intro_parts = []
    fields = []
    field_counter = 0

    while i < len(lines):
        s = lines[i].strip()
        if not s:
            i += 1
            continue
        # Stop at next heading or divider
        if s.startswith("#") or re.match(r"^-{3,}", s):
            break

        # Labeled field: **Label:** ___
        field_match = re.match(
            r"^(?:\*\*(.+?)\*\*|\*(.+?)\*)\s*(?:\((.+?)\))?\s*:?\s*[`]?[_]{3,}[`]?\s*$",
            s,
        )
        if field_match:
            label = (field_match.group(1) or field_match.group(2) or "").strip()
            hint = field_match.group(3) or ""
            field_counter += 1
            fields.append(
                {
                    "id": f"field_{field_counter}",
                    "label": clean(label),
                    "type": "textarea",
                    "rows": 2,
                    "placeholder": clean(hint) if hint else "",
                }
            )
            i += 1
            continue

        # Standalone blank: _______________
        if re.match(r"^[`]?[_]{5,}[`]?\s*$", s):
            field_counter += 1
            fields.append(
                {
                    "id": f"field_{field_counter}",
                    "label": "",
                    "type": "textarea",
                    "rows": 3,
                    "placeholder": "",
                }
            )
            i += 1
            continue

        # Sentence with trailing blank: "The one Devil I want..." ___
        inline_blank = re.match(r"^(.+?)\s+[_]{3,}\s*\.?\s*$", s)
        if inline_blank:
            label = clean(inline_blank.group(1))
            field_counter += 1
            fields.append(
                {
                    "id": f"field_{field_counter}",
                    "label": label,
                    "type": "text",
                    "placeholder": "",
                }
            )
            i += 1
            continue

        # Otherwise, it's intro or body text
        if not fields:
            intro_parts.append(s)
        i += 1

    block = {
        "type": "fillable_form",
        "form_id": form_id,
        "title": clean(heading),
        "fields": fields,
    }
    if intro_parts:
        block["intro"] = clean(" ".join(intro_parts))

    return {"block": block, "end_idx": i}


# ─── Helper: Table Parsing ─────────────────────────────────────────


def _parse_table(lines, start_idx):
    """Parse a markdown table into list blocks."""
    rows = []
    i = start_idx
    while i < len(lines) and lines[i].strip().startswith("|"):
        row = lines[i].strip()
        # Skip separator rows (|---|---|)
        if re.match(r"^\|[\s\-:|]+\|$", row):
            i += 1
            continue
        cells = [c.strip() for c in row.split("|")[1:-1]]
        rows.append(cells)
        i += 1

    if len(rows) >= 2:
        headers = rows[0]
        items = []
        for row in rows[1:]:
            parts = []
            for h, v in zip(headers, row):
                if v:
                    parts.append(f"{clean(h)}: {clean(v)}")
            if parts:
                items.append(" | ".join(parts))
        return {
            "blocks": [{"type": "list", "items": items, "ordered": False}],
            "end_idx": i,
        }
    elif rows:
        # Single-row table or header-only — just text
        items = [clean(" | ".join(r)) for r in rows]
        return {
            "blocks": [{"type": "text", "content": " | ".join(items)}],
            "end_idx": i,
        }

    return {"blocks": [], "end_idx": i}


# ─── Main Conversion ──────────────────────────────────────────────


def convert_file(filepath, output_dir):
    """Convert a single markdown lesson file to per-sub-lesson JSON files."""
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    metadata, body = parse_frontmatter(content)
    sublessons = split_sublessons(body)

    # Compute fallback minutes from frontmatter total / sub-lesson count
    total_min = metadata.get("estimated_minutes_total", 0)
    sub_count = len(sublessons) or 1
    fallback_min = max(5, round(total_min / sub_count)) if total_min else 10

    results = []
    for sl_id, sl_title, sl_lines in sublessons:
        blocks, est_min = parse_blocks(sl_lines)

        # Strip leading dividers (artifact of trailing --- between sub-lessons)
        while blocks and blocks[0].get("type") == "divider":
            blocks.pop(0)
        # Strip trailing dividers
        while blocks and blocks[-1].get("type") == "divider":
            blocks.pop()
        # Collapse consecutive dividers
        deduped = []
        for b in blocks:
            if (
                b.get("type") == "divider"
                and deduped
                and deduped[-1].get("type") == "divider"
            ):
                continue
            deduped.append(b)
        blocks = deduped

        content_json = {"estimated_minutes": est_min or fallback_min, "blocks": blocks}

        out_path = Path(output_dir) / f"{sl_id}.json"
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(content_json, f, indent=2, ensure_ascii=False)

        results.append(
            {
                "id": sl_id,
                "title": sl_title,
                "blocks": len(blocks),
                "minutes": est_min,
                "path": str(out_path),
            }
        )

    return {
        "file": str(filepath),
        "metadata": metadata,
        "sublessons": results,
    }


def main():
    input_dirs = DEFAULT_INPUT_DIRS
    output_dir = DEFAULT_OUTPUT_DIR

    # Simple arg parsing
    if "--output" in sys.argv:
        idx = sys.argv.index("--output")
        output_dir = sys.argv[idx + 1]
        args = [a for j, a in enumerate(sys.argv[1:]) if j not in (idx - 1, idx)]
    else:
        args = sys.argv[1:]

    if args:
        input_dirs = args

    os.makedirs(output_dir, exist_ok=True)

    all_results = []
    total_sublessons = 0
    total_blocks = 0

    for input_dir in input_dirs:
        md_files = sorted(Path(input_dir).glob("*.md"))
        for md_file in md_files:
            print(f"\n{'=' * 60}")
            print(f"Processing: {md_file.name}")
            print(f"{'=' * 60}")

            result = convert_file(md_file, output_dir)
            all_results.append(result)

            for sl in result["sublessons"]:
                total_sublessons += 1
                total_blocks += sl["blocks"]
                print(
                    f"  {sl['id']:8s} | {sl['title'][:45]:45s} | {sl['blocks']:3d} blocks | {sl['minutes'] or '?':>3} min"
                )

    print(f"\n{'=' * 60}")
    print(f"SUMMARY: {total_sublessons} sub-lessons, {total_blocks} total blocks")
    print(f"Output: {output_dir}")
    print(f"{'=' * 60}")

    # Write manifest
    manifest_path = Path(output_dir) / "_manifest.json"
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(all_results, f, indent=2, ensure_ascii=False)
    print(f"Manifest: {manifest_path}")


if __name__ == "__main__":
    main()
