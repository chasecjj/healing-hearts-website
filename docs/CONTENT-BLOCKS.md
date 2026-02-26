# Content Block Reference — Healing Hearts

How lesson content works in the Healing Hearts course portal. This is the authoritative reference for anyone creating or converting course content.

## How It Works

Each lesson in Supabase has a `content_json` column (JSONB) containing:

```json
{
  "estimated_minutes": 15,
  "blocks": [
    { "type": "heading", "content": "Section Title" },
    { "type": "text", "content": "Paragraph of text..." },
    ...
  ]
}
```

- `estimated_minutes` (optional) — shown in the lesson header as read time
- `blocks` (required) — ordered array of content blocks, rendered top-to-bottom
- Every block MUST have a `type` field
- All content is rendered as pure React components — **no HTML, no markdown, no dangerouslySetInnerHTML**

## Block Types

### `heading`
Section-level heading. Large serif italic text.

```json
{ "type": "heading", "content": "Identifying Core Wounds" }
```

**Fields:** `content` (string, required)
**Use for:** Major section breaks. Usually 2-4 per lesson.

---

### `subheading`
Sub-section heading. Bold sans-serif.

```json
{ "type": "subheading", "content": "The 4 Attachment Styles" }
```

**Fields:** `content` (string, required)
**Use for:** Breaking sections into topics. As many as needed.

---

### `text`
Standard paragraph. Light-weight, high readability.

```json
{ "type": "text", "content": "Your paragraph here..." }
```

**Fields:** `content` (string, required)
**Use for:** Body text. The workhorse block.

---

### `bold_text`
Emphasized paragraph. Semibold weight.

```json
{ "type": "bold_text", "content": "Understanding the BTEA Cycle: Beliefs → Thoughts → Emotions → Actions" }
```

**Fields:** `content` (string, required)
**Use for:** Key statements, framework names, important callouts that aren't in a box.

---

### `callout`
Highlighted info box with icon. Teal background with left border.

```json
{ "type": "callout", "icon": "heart", "content": "Core wounds are not character flaws..." }
```

**Fields:**
- `content` (string, required)
- `icon` (string, optional) — one of: `heart`, `lightbulb`, `alert`, `book`. Defaults to `lightbulb`.

**Use for:** Key insights, important notes, "remember this" moments. 2-5 per lesson.

---

### `exercise`
Interactive exercise with numbered steps. Salmon accent border.

```json
{
  "type": "exercise",
  "title": "Exercise 1: What Beliefs Shape My Life?",
  "prompt": "Bring conscious awareness to the limiting beliefs...",
  "steps": [
    "Ask yourself: What would I want to create if...",
    "Keep your statements simple and positive...",
    "If you get stuck, start with: I am free to…"
  ]
}
```

**Fields:**
- `title` (string, required) — exercise name, shown with BookOpen icon
- `prompt` (string, optional) — introductory paragraph explaining the exercise
- `steps` (string array, optional) — numbered steps shown as an ordered list

**Use for:** Journaling prompts, reflection activities, partner exercises. Usually 1-3 per lesson.

---

### `quote`
Styled blockquote with optional attribution.

```json
{
  "type": "quote",
  "content": "Your feelings reveal your internal programming...",
  "attribution": "Trisha Jamison"
}
```

**Fields:**
- `content` (string, required) — the quote text (without quotation marks — they're added by the renderer)
- `attribution` (string, optional) — who said it, shown as "— Name"

**Use for:** Trisha/Jeff quotes, external citations, powerful one-liners. 1-3 per lesson.

---

### `list`
Bulleted or numbered list.

```json
{
  "type": "list",
  "ordered": false,
  "items": [
    "Fear or anxiety floods you with adrenaline...",
    "Sadness or grief lowers serotonin...",
    "Joy or connection releases oxytocin..."
  ]
}
```

**Fields:**
- `items` (string array, required) — list items
- `ordered` (boolean, optional) — `true` for numbered, `false`/omitted for bullets

**Use for:** Enumerating concepts, step sequences, characteristics.

---

### `divider`
Horizontal rule. Visual separator between sections.

```json
{ "type": "divider" }
```

**Fields:** None.
**Use for:** Between major sections. Pair with `heading` or `subheading` blocks.

## Limits & Constraints

| Constraint | Detail |
|-----------|--------|
| Max block types | 9 (the types listed above). Unknown types render as plain text fallback. |
| Text formatting | **Plain text only.** No bold/italic within a text block. Use `bold_text` for emphasis or `callout` for highlighting. |
| Inline links | Not supported. Content is plain strings. If you need to reference a URL, write it as text. |
| Images | Not supported in blocks. If a lesson needs images, a new `image` block type must be added to `LessonContent.jsx`. |
| Video embeds | Not supported. Same as images — needs a new block type. |
| Nested content | Not supported. Blocks are flat. No blocks inside blocks. |
| HTML | **Never.** All rendering is React components. HTML in content strings will display as literal text. |
| Markdown | **Not parsed.** `*bold*` or `# heading` in a text block will show as-is. Use the correct block type instead. |
| String escaping | In SQL, use `''` for apostrophes (double single-quote). In JSON directly, use standard escaping. |
| Max content size | Supabase JSONB has no practical limit, but keep lessons under ~50 blocks for readability. |

## Content Conversion Workflow (SOP)

### Step 1: Receive Raw Content
Trisha or Desirae provides lesson content as a text document, Google Doc, or Word file.

### Step 2: Identify Block Boundaries
Read through and mark where blocks begin/end:
- Each paragraph → `text` block
- Section headers → `heading` or `subheading`
- Key insights or "remember this" → `callout`
- Quoted speech → `quote`
- Activities/prompts → `exercise`
- Bulleted/numbered items → `list`
- Section breaks → `divider`

### Step 3: Structure as JSON
Build the `content_json` object:

```json
{
  "estimated_minutes": <rough reading time>,
  "blocks": [
    // blocks in reading order
  ]
}
```

**Estimating read time:** Average adult reads ~200 words/minute. Count words in all text content, divide by 200, round up. Add 2-3 minutes for exercises.

### Step 4: Validate
Check every block has a `type` field. Check exercises have `title`. Check callouts have valid `icon` values. No HTML tags in any content string.

### Step 5: Insert/Update in Supabase
Run the SQL in Supabase SQL Editor:

```sql
UPDATE lessons SET content_json = '<your JSON here>'
WHERE module_id = (SELECT id FROM modules WHERE module_number = '<N>')
AND sort_order = <lesson_number>;
```

### Step 6: Verify
Load the lesson in the portal (`/portal/module-N/lesson-N`) and confirm:
- All blocks render correctly
- No missing content
- Callout icons are correct
- Exercises show steps properly
- Quotes have attribution

## Example: Full Lesson JSON

See Module 7, Lesson 3 in `supabase/migrations/002_module7_preview.sql` for the most complete example — it uses all 9 block types.

## Future Block Types (Not Yet Built)

These would require adding a new component to `src/components/LessonContent.jsx` and registering it in the `BLOCK_COMPONENTS` map:

| Type | Purpose | Complexity |
|------|---------|------------|
| `image` | Inline images with caption | Low — needs URL + alt text fields |
| `video` | Embedded video player | Medium — needs hosting decision (YouTube, Vimeo, self-hosted) |
| `accordion` | Expandable content sections | Low — title + hidden content |
| `two_column` | Side-by-side content | Medium — needs child blocks |
| `assessment` | Interactive quiz/assessment | High — needs state management + scoring |
| `audio` | Audio player for guided exercises | Medium — needs hosting |

To add a new type: create a React component, add it to `BLOCK_COMPONENTS` in `LessonContent.jsx`, update this doc, and update `CLAUDE.md`.
