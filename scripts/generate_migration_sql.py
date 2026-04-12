#!/usr/bin/env python3
"""
generate_migration_sql.py — Generate the 022_module_1_2_redesign.sql migration.

Reads the converted JSON files from the content-json-output directory and produces
a complete Supabase migration that:
  1. Deletes old Module 1 and 2 lessons
  2. Updates module titles and descriptions
  3. Inserts parent lessons (parent_lesson_id = NULL)
  4. Inserts sub-lessons pointing to their parents

Output: supabase/migrations/022_module_1_2_redesign.sql
"""

import json
import os
import re
from pathlib import Path

JSON_DIR = Path(
    r"C:\Users\chase\Documents\Mind Vault\Projects\healing-hearts\modules\v2\conversion\content-json-output"
)
OUTPUT_PATH = Path(
    r"C:\Users\chase\Documents\HealingHeartsWebsite\supabase\migrations\022_module_1_2_redesign.sql"
)

# ─── Lesson Metadata ───────────────────────────────────────────────
# Parent lessons: title, module, sort_order, estimated_minutes (for parent overview)
PARENTS = {
    "1.1": {
        "title": "The Seven Devils",
        "module": "1",
        "sort_order": 1,
        "estimated_minutes": 42,
        "description": "Name the seven patterns that quietly dismantle relationships.",
    },
    "1.2": {
        "title": "Your Critter Brain and Your CEO Brain",
        "module": "1",
        "sort_order": 2,
        "estimated_minutes": 48,
        "description": "The nervous system foundation. Why the Seven Devils have so much power over your body.",
    },
    "1.3": {
        "title": "The SPARK Method",
        "module": "1",
        "sort_order": 3,
        "estimated_minutes": 48,
        "description": "A five-step method for interrupting the pattern and choosing connection.",
    },
    "1.4": {
        "title": "Your First Week of Practice",
        "module": "1",
        "sort_order": 4,
        "estimated_minutes": 38,
        "description": "Seven days of practice to move from knowing these tools to using them.",
    },
    "2.1": {
        "title": "The Words That Wound",
        "module": "2",
        "sort_order": 1,
        "estimated_minutes": 37,
        "description": "Criticism and Contempt — the attack patterns that corrode trust.",
    },
    "2.2": {
        "title": "The Wall and the Door",
        "module": "2",
        "sort_order": 2,
        "estimated_minutes": 37,
        "description": "Defensiveness and Stonewalling — the shield and the wall.",
    },
    "2.3": {
        "title": "The Great Escape",
        "module": "2",
        "sort_order": 3,
        "estimated_minutes": 37,
        "description": "Avoidance and Unhealthy Coping — the escape patterns.",
    },
    "2.4": {
        "title": "The Path Back",
        "module": "2",
        "sort_order": 4,
        "estimated_minutes": 35,
        "description": "Integration, the Devil Audit, and building your Module 2 practice.",
    },
}

# Sub-lesson titles (from the converter manifest)
# We'll load these from the manifest file

# Module metadata for the UPDATE
MODULES = {
    "1": {
        "title": "The Seven Devils",
        "description": "Name the patterns that run your relationship. Understand why your body hijacks conversations. Learn the SPARK Method. Build your first week of practice.",
    },
    "2": {
        "title": "The Devils Up Close",
        "description": "Face each Devil honestly. Criticism and Contempt. Defensiveness and Stonewalling. Avoidance and Unhealthy Coping. Build your Devil Audit and practice plan.",
    },
}


def escape_sql(s: str) -> str:
    """Escape single quotes for PostgreSQL string literals."""
    return s.replace("'", "''")


def json_to_sql_literal(obj: dict) -> str:
    """Convert a Python dict to a PostgreSQL JSONB literal string."""
    # Dump to compact JSON, then escape single quotes for SQL
    raw = json.dumps(obj, ensure_ascii=False, separators=(",", ":"))
    return escape_sql(raw)


def load_manifest():
    """Load the converter manifest to get sub-lesson titles."""
    manifest_path = JSON_DIR / "_manifest.json"
    with open(manifest_path, "r", encoding="utf-8") as f:
        return json.load(f)


def load_sublesson_json(sl_id: str) -> dict:
    """Load a sub-lesson's content_json from file."""
    path = JSON_DIR / f"{sl_id}.json"
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def build_sublesson_map(manifest):
    """Build a map of sub-lesson ID -> {title, parent_id, sort_order, content_json}."""
    sl_map = {}
    for file_result in manifest:
        for sl in file_result["sublessons"]:
            sl_id = sl["id"]  # e.g. "1.1.1"
            parts = sl_id.split(".")
            parent_id = f"{parts[0]}.{parts[1]}"  # e.g. "1.1"
            sub_num = int(parts[2])  # e.g. 1

            # Sort order: parent's sort_order * 100 + sub_num
            # This keeps sub-lessons ordered after their parent
            parent_sort = PARENTS[parent_id]["sort_order"]
            sort_order = parent_sort * 100 + sub_num

            content_json = load_sublesson_json(sl_id)

            sl_map[sl_id] = {
                "title": sl["title"],
                "parent_id": parent_id,
                "module": PARENTS[parent_id]["module"],
                "sort_order": sort_order,
                "content_json": content_json,
            }
    return sl_map


def generate_sql():
    """Generate the full migration SQL."""
    manifest = load_manifest()
    sl_map = build_sublesson_map(manifest)

    lines = []
    lines.append("-- =====================================================")
    lines.append("-- Migration 022: Module 1-2 Redesign (v2 Curriculum)")
    lines.append("-- =====================================================")
    lines.append("-- Replaces the old Module 1 (Love's Foundation) and Module 2")
    lines.append("-- (Invisible Chains) with the redesigned v2 curriculum:")
    lines.append("--   Module 1: The Seven Devils (4 parent lessons, 24 sub-lessons)")
    lines.append(
        "--   Module 2: The Devils Up Close (4 parent lessons, 20 sub-lessons)"
    )
    lines.append("--")
    lines.append(
        "-- Structure follows the Module 7 parent/child pattern from seed.sql."
    )
    lines.append("-- Each parent lesson has parent_lesson_id = NULL.")
    lines.append("-- Each sub-lesson points to its parent via parent_lesson_id.")
    lines.append("--")
    lines.append(
        "-- Source: Mind Vault v2 markdown, converted via md_to_content_json.py"
    )
    lines.append("-- =====================================================")
    lines.append("")
    lines.append("BEGIN;")
    lines.append("")

    # ── Step 1: Delete old lessons ──
    lines.append("-- =====================================================")
    lines.append("-- STEP 1: Delete old Module 1 and 2 lessons")
    lines.append("-- =====================================================")
    lines.append("-- Sub-lessons first (foreign key), then parents.")
    lines.append("-- Modules 1 and 2 rows are preserved and updated.")
    lines.append("")
    for mod_num in ["1", "2"]:
        lines.append(f"-- Delete all lessons under Module {mod_num}")
        lines.append(f"DELETE FROM lessons")
        lines.append(f"WHERE module_id = (")
        lines.append(f"  SELECT m.id FROM modules m")
        lines.append(f"  JOIN courses c ON c.id = m.course_id")
        lines.append(f"  WHERE m.module_number = '{mod_num}'")
        lines.append(f"    AND c.slug = 'healing-hearts-journey'")
        lines.append(f");")
        lines.append("")

    # ── Step 2: Update module titles/descriptions ──
    lines.append("-- =====================================================")
    lines.append("-- STEP 2: Update module titles and descriptions")
    lines.append("-- =====================================================")
    lines.append("")
    for mod_num, mod_info in MODULES.items():
        lines.append(f"UPDATE modules")
        lines.append(f"SET title = '{escape_sql(mod_info['title'])}',")
        lines.append(f"    description = '{escape_sql(mod_info['description'])}'")
        lines.append(f"WHERE module_number = '{mod_num}'")
        lines.append(
            f"  AND course_id = (SELECT id FROM courses WHERE slug = 'healing-hearts-journey');"
        )
        lines.append("")

    # ── Step 3: Insert parent + sub-lessons ──
    lines.append("-- =====================================================")
    lines.append("-- STEP 3: Insert parent lessons and sub-lessons")
    lines.append("-- =====================================================")
    lines.append("")
    lines.append("DO $$")
    lines.append("DECLARE")
    lines.append("  mod1_id uuid;")
    lines.append("  mod2_id uuid;")
    lines.append("  parent_id uuid;")
    lines.append("BEGIN")
    lines.append("  -- Get module IDs")
    lines.append("  SELECT m.id INTO mod1_id FROM modules m")
    lines.append("  JOIN courses c ON c.id = m.course_id")
    lines.append("  WHERE m.module_number = '1' AND c.slug = 'healing-hearts-journey';")
    lines.append("")
    lines.append("  SELECT m.id INTO mod2_id FROM modules m")
    lines.append("  JOIN courses c ON c.id = m.course_id")
    lines.append("  WHERE m.module_number = '2' AND c.slug = 'healing-hearts-journey';")
    lines.append("")

    # Insert parents and their children
    for parent_key in sorted(PARENTS.keys()):
        p = PARENTS[parent_key]
        mod_var = f"mod{p['module']}_id"

        # Parent content_json: just a heading + description
        parent_content = {
            "estimated_minutes": p["estimated_minutes"],
            "blocks": [
                {"type": "heading", "content": p["title"]},
                {"type": "text", "content": p["description"]},
            ],
        }

        lines.append(f"  -- ─── Lesson {parent_key}: {p['title']} ───")
        lines.append(
            f"  INSERT INTO lessons (module_id, title, sort_order, content_json)"
        )
        lines.append(f"  VALUES (")
        lines.append(f"    {mod_var},")
        lines.append(f"    '{escape_sql(p['title'])}',")
        lines.append(f"    {p['sort_order']},")
        lines.append(f"    '{json_to_sql_literal(parent_content)}'::jsonb")
        lines.append(f"  ) RETURNING id INTO parent_id;")
        lines.append("")

        # Find sub-lessons for this parent
        sub_keys = sorted(
            [k for k in sl_map if sl_map[k]["parent_id"] == parent_key],
            key=lambda k: int(k.split(".")[2]),
        )

        if sub_keys:
            lines.append(
                f"  INSERT INTO lessons (module_id, parent_lesson_id, title, sort_order, content_json) VALUES"
            )
            sub_values = []
            for j, sk in enumerate(sub_keys):
                sl = sl_map[sk]
                sub_num = int(sk.split(".")[2])
                # Sort order: parent_sort_order * 100 + sub_number
                sort_ord = p["sort_order"] * 100 + sub_num
                comma = "," if j < len(sub_keys) - 1 else ";"
                sub_values.append(
                    f"    ({mod_var}, parent_id, '{escape_sql(sl['title'])}', {sort_ord}, "
                    f"'{json_to_sql_literal(sl['content_json'])}'::jsonb){comma}"
                )
            lines.extend(sub_values)
            lines.append("")

    lines.append("END $$;")
    lines.append("")

    # ── Step 4: Verification ──
    lines.append("-- =====================================================")
    lines.append("-- STEP 4: Verification")
    lines.append("-- =====================================================")
    lines.append("")
    lines.append("-- Count check: expect 8 parents + 44 sub-lessons = 52 total")
    lines.append("DO $$")
    lines.append("DECLARE")
    lines.append("  total_count integer;")
    lines.append("  parent_count integer;")
    lines.append("  child_count integer;")
    lines.append("BEGIN")
    lines.append("  SELECT count(*) INTO total_count")
    lines.append("  FROM lessons l")
    lines.append("  JOIN modules m ON m.id = l.module_id")
    lines.append("  JOIN courses c ON c.id = m.course_id")
    lines.append("  WHERE m.module_number IN ('1', '2')")
    lines.append("    AND c.slug = 'healing-hearts-journey';")
    lines.append("")
    lines.append("  SELECT count(*) INTO parent_count")
    lines.append("  FROM lessons l")
    lines.append("  JOIN modules m ON m.id = l.module_id")
    lines.append("  JOIN courses c ON c.id = m.course_id")
    lines.append("  WHERE m.module_number IN ('1', '2')")
    lines.append("    AND c.slug = 'healing-hearts-journey'")
    lines.append("    AND l.parent_lesson_id IS NULL;")
    lines.append("")
    lines.append("  child_count := total_count - parent_count;")
    lines.append("")
    lines.append("  IF total_count != 52 THEN")
    lines.append("    RAISE EXCEPTION 'Expected 52 lessons, got %', total_count;")
    lines.append("  END IF;")
    lines.append("  IF parent_count != 8 THEN")
    lines.append(
        "    RAISE EXCEPTION 'Expected 8 parent lessons, got %', parent_count;"
    )
    lines.append("  END IF;")
    lines.append("  IF child_count != 44 THEN")
    lines.append("    RAISE EXCEPTION 'Expected 44 sub-lessons, got %', child_count;")
    lines.append("  END IF;")
    lines.append("")
    lines.append(
        "  RAISE NOTICE 'Migration 022 verified: % total (% parents, % children)',"
    )
    lines.append("    total_count, parent_count, child_count;")
    lines.append("END $$;")
    lines.append("")
    lines.append("COMMIT;")

    return "\n".join(lines)


def main():
    sql = generate_sql()
    os.makedirs(OUTPUT_PATH.parent, exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        f.write(sql)
    print(f"Migration written to: {OUTPUT_PATH}")
    print(f"Size: {len(sql):,} bytes")
    print(f"Lines: {sql.count(chr(10)):,}")


if __name__ == "__main__":
    main()
