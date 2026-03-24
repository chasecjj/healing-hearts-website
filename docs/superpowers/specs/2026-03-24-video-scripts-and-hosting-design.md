# Video Scripts + Video-Ready Content System — Design Spec

**Date:** 2026-03-24
**Author:** Chase + Claude
**Status:** Approved
**Project:** Healing Hearts Website

---

## Overview

Add video capability to the Healing Hearts course platform and generate teleprompter-ready scripts for all 32 lessons (8 modules x 4 lessons). Videos will be recorded by Trisha and Jeff in the future — this spec covers the content system preparation and the script generation pipeline.

---

## Part 1: Video Block Type

### What We're Building

A new `video` block type in the `BLOCK_COMPONENTS` registry (`src/components/LessonContent.jsx`) that renders the appropriate video embed based on a `provider` field, or a styled placeholder when no video is available yet.

### Block Schema

```json
{
  "type": "video",
  "provider": "youtube" | "cloudflare" | "mux" | "placeholder",
  "videoId": "abc123",
  "title": "The SPARK Method",
  "duration": "12:30"
}
```

- `provider`: Which hosting service. Defaults to `"placeholder"` if omitted.
- `videoId`: Provider-specific ID. Ignored when provider is `"placeholder"`.
- `title`: Displayed as accessible label and in placeholder state.
- `duration`: Optional estimated duration shown in placeholder.

### VideoBlock Component

```jsx
function VideoBlock({ provider = 'placeholder', videoId, title, duration }) {
  // Provider embeds
  if (provider === 'youtube' && videoId) {
    return <YouTubeEmbed videoId={videoId} title={title} />
  }
  if (provider === 'cloudflare' && videoId) {
    return <CloudflareEmbed videoId={videoId} title={title} />
  }
  if (provider === 'mux' && videoId) {
    return <MuxEmbed videoId={videoId} title={title} />
  }

  // Placeholder — shown until videos are recorded
  return <VideoPlaceholder title={title} duration={duration} />
}
```

### Placeholder Design

Warm, on-brand placeholder that communicates "video coming soon" without looking broken:
- Cream background (`#FAF4EA`) with rounded corners
- Play icon (Lucide `Play`) in teal circle, centered
- Title in serif italic below
- Optional duration estimate
- No "coming soon" text that feels like a broken promise — just a clean, intentional placeholder

### Provider Embeds (implemented when needed)

**YouTube:** `<iframe>` with `youtube-nocookie.com` domain, `loading="lazy"`, title set for a11y.

**Cloudflare Stream:** `<stream>` custom element via their embed script, or `<iframe>` to `customer-{code}.cloudflarestream.com`.

**Mux:** `<mux-player>` web component from `@mux/mux-player`.

### Constraints

- No `dangerouslySetInnerHTML` — all embeds use React components or iframes
- No autoplay with sound — users may be in vulnerable emotional states
- Lazy load all video embeds — don't fetch iframe until visible
- Accessible: `title` on all iframes, keyboard controls

---

## Part 2: Script Generation Pipeline

### Script Structure (per lesson)

| Section | Duration | Purpose |
|---------|----------|---------|
| Cold Open | 15-30 sec | Emotional hook — question or micro-story |
| Intro | 30 sec | "I'm Trisha Jamison, and today..." |
| Story | 1-3 min | Personal anecdote (mined from transcripts) |
| Teach | 2-8 min | Core concept with proprietary framework names |
| Apply | 1-3 min | Exercise or prompt for the couple |
| Bridge | 30 sec | Warm close + preview of next lesson |

### Length Tiers

| Lesson Type | Duration | Word Count | Examples |
|-------------|----------|------------|----------|
| Intro lessons (X.1) | 3-5 min | 500-800 words | Module intros, welcome, orientation |
| Standard lessons (X.2, X.3) | 8-12 min | 1200-1800 words | Teaching lessons, exercises |
| Framework lessons | 12-18 min | 1800-2500 words | SPARK Method, Critter Brain/CEO Brain, 90-Second Wave, Attachment Styles, 12 Subconscious Principles |

### Generation Method: Hybrid (Transcript-First + Curriculum-First)

**Transcript-first** (when transcript coverage is high):
1. Search the 34 coaching sessions (312K words) for Trisha's real explanations of the topic
2. Extract her actual stories, analogies, vocabulary, and emotional rhythm
3. Structure extracted content into the script template
4. AI provides transitions and structure; Trisha's words fill the substance

**Curriculum-first** (when transcript coverage is thin):
1. Start from the existing module content blocks in Supabase + the Blueprint PDF
2. Write in Trisha's voice using the voice profile (`pipeline/foundation/voice-profile.md`)
3. Cross-reference transcripts to inject any available real stories or phrasing
4. Flag sections that are AI-written vs transcript-sourced

### Voice Rules

- Trisha's teaching rhythm: story -> concept -> application -> encouragement
- Use proprietary framework names exactly (SPARK, Zones of Resilience, Critter Brain/CEO Brain, 90-Second Wave, etc.)
- No clinical/academic tone — "When that tight feeling shows up in your chest" not "During periods of heightened emotional activation"
- Preserve Trisha's actual phrasing from transcripts verbatim — do not smooth or professionalize
- Jeff sections (Module 8.2 Internalizer/Externalizer, medical context) should be flagged for his voice

### Output Format

One markdown file per lesson:

```
Projects/healing-hearts/video-scripts/
  module-1/
    lesson-1-1-script.md
    lesson-1-2-script.md
    lesson-1-3-script.md
    lesson-1-4-script.md
  module-2/
    ...
```

Each file has YAML frontmatter:

```yaml
---
module: 1
lesson: 1
title: "Welcome to Healing Hearts"
tier: intro | standard | framework
estimated_duration: "4:30"
generation_method: transcript-first | curriculum-first
transcript_coverage: high | medium | low
transcript_sources: ["Session 12 (2025-08-14)", "Session 23 (2025-11-02)"]
status: draft | trisha-review | approved
jeff_sections: false
---
```

### Quality Gates

- Every script must be flagged `status: draft` until Trisha reviews
- Scripts with `generation_method: curriculum-first` get an extra review flag
- Jeff sections (`jeff_sections: true`) require Jeff's approval separately
- No script ships to recording without `status: approved`
- Framework introductions (SPARK, Critter Brain, etc.) require Trisha sign-off on the exact explanation

---

## Part 3: Phasing

### Phase A — Video Block Type + Placeholder (ship this week)

- Add `VideoBlock` to `BLOCK_COMPONENTS` registry
- Implement placeholder state only (no real embeds yet)
- Optionally insert `video` placeholder blocks into Module 7 content to test rendering
- ~1 hour of work, ~30 lines of code

### Phase B — Script Generation (2-3 sessions)

- Dispatch parallel workers per module (4 scripts per worker)
- Each worker: reads transcript library, reads module content blocks, generates scripts
- Output to vault `Projects/healing-hearts/video-scripts/`
- Scripts enter Trisha review queue
- Estimated: 2-3 sessions of dispatching + review cycles

### Phase C — Video Hosting + Real Embeds (when videos are recorded)

- Pick hosting provider (see Getting Started guide below)
- Implement real embed components (YouTube/Cloudflare/Mux)
- Upload videos, get IDs
- Update `content_json` in Supabase: swap `"provider": "placeholder"` for real provider + videoId
- Zero code changes needed — just Supabase data updates

---

## Getting Started with Video Hosting — Future Reference Guide

When Trisha and Jeff have recorded videos and you're ready to add real playback, follow this guide.

### Step 1: Choose a Hosting Provider

| Provider | Cost | Pros | Cons | Best For |
|----------|------|------|------|----------|
| **YouTube (unlisted)** | Free | Battle-tested CDN, adaptive bitrate, captions, analytics | YouTube branding in player, potential ad injection, less control | Budget-conscious, don't mind YouTube UI |
| **Cloudflare Stream** | $1/1K min stored + $1/1K min watched | Already have Cloudflare, no branding, good API, adaptive bitrate | Less mature player UI, fewer analytics | Already in Cloudflare ecosystem (you are) |
| **Mux** | ~$0.007/min watched + $0.007/min stored | Best developer experience, `<mux-player>` web component, detailed analytics, HLS/DASH | Higher cost at scale, another vendor | Premium course experience, detailed engagement analytics |
| **Supabase Storage** | Included in plan (up to limits) | No new vendor, direct integration | No adaptive bitrate, no CDN optimization, bandwidth limits | Very small number of short videos |

**Recommendation when the time comes:** Start with **Cloudflare Stream** since you already have Cloudflare infrastructure. If you need richer analytics (completion rates per lesson, drop-off points), upgrade to **Mux**.

### Step 2: Upload Videos

**Cloudflare Stream:**
```bash
# Upload via API
curl -X POST "https://api.cloudflare.com/client/v4/accounts/{account_id}/stream" \
  -H "Authorization: Bearer {api_token}" \
  -F "file=@module-1-lesson-1.mp4"

# Returns a videoId like: "ea95132c15732412d22c1476fa83f27a"
```

**YouTube (unlisted):**
- Upload via YouTube Studio, set to "Unlisted"
- Video ID is in the URL: `youtube.com/watch?v={videoId}`

**Mux:**
```bash
# Create asset via API
curl -X POST "https://api.mux.com/video/v1/assets" \
  -H "Authorization: Basic {base64(token_id:token_secret)}" \
  -d '{"input": "https://your-server.com/module-1-lesson-1.mp4", "playback_policy": ["signed"]}'

# Returns a playbackId
```

### Step 3: Implement the Embed Component

The `VideoBlock` component already exists with the provider switch. You just need to implement the real embed for your chosen provider.

**Example — Cloudflare Stream:**
```jsx
function CloudflareEmbed({ videoId, title }) {
  return (
    <div className="aspect-video rounded-2xl overflow-hidden my-6 shadow-lg">
      <iframe
        src={`https://customer-{code}.cloudflarestream.com/${videoId}/iframe`}
        title={title}
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
        loading="lazy"
        className="w-full h-full border-0"
      />
    </div>
  )
}
```

**Example — YouTube:**
```jsx
function YouTubeEmbed({ videoId, title }) {
  return (
    <div className="aspect-video rounded-2xl overflow-hidden my-6 shadow-lg">
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
        className="w-full h-full border-0"
      />
    </div>
  )
}
```

### Step 4: Update Content in Supabase

For each lesson that has a recorded video, update the `content_json` to insert a video block. You can place it at the top of the blocks array (video first, then text content) or after the heading.

```sql
-- Example: Add video to Module 7, Lesson 1
UPDATE lessons
SET content_json = jsonb_set(
  content_json,
  '{blocks}',
  (
    SELECT jsonb_insert(
      content_json->'blocks',
      '{1}',  -- insert after the first block (heading)
      '{"type": "video", "provider": "cloudflare", "videoId": "ea95132c15732412d22c1476fa83f27a", "title": "The 12 Subconscious Principles", "duration": "14:20"}'::jsonb
    )
    FROM lessons WHERE slug = 'the-12-subconscious-principles'
  )
)
WHERE slug = 'the-12-subconscious-principles';
```

Or use the Supabase dashboard SQL editor for a simpler workflow.

### Step 5: Test

1. Verify video plays on desktop and mobile
2. Check lazy loading — video iframe should not load until scrolled into view
3. Verify no autoplay with sound
4. Test keyboard navigation (tab to player, space to play/pause)
5. Confirm `is_preview` gating still works — non-Module 7 videos should be locked for non-enrolled users

### Accessibility Checklist

- [ ] All `<iframe>` elements have descriptive `title` attributes
- [ ] Captions/subtitles uploaded to hosting provider (YouTube auto-generates, Cloudflare/Mux require upload)
- [ ] Player is keyboard-navigable
- [ ] No autoplay with sound
- [ ] Color contrast on any custom controls meets WCAG AA

---

## Files Changed (Phase A only)

| File | Change |
|------|--------|
| `src/components/LessonContent.jsx` | Add `VideoBlock` + `VideoPlaceholder` components, register in `BLOCK_COMPONENTS` |

No database migrations needed — `content_json` is schemaless JSONB.
