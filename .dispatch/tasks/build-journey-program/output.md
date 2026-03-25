# Build Journey Program Page — Output

**Date:** 2026-03-23
**Agent:** build-journey-program (dispatch)
**Status:** Complete

---

## Summary

Built `/journey` — an immersive, narrative-driven landing page for the full 8-module Healing Hearts program. This replaces the flat module-list approach of `/course` with a story-first experience designed to convert visitors into enrollees.

---

## What Was Built

### New File: `src/pages/YourJourney.jsx`

**Route:** `/journey` (wrapped in Layout, registered in App.jsx)

6 scroll-animated sections in sequence:

| Section | Purpose |
|---|---|
| **Hero** | Emotional hook — "Your path back to each other." Serif italic headline, watercolor background, dual CTAs (enroll + free preview). |
| **The Problem** | Two-column editorial — validates pain ("You've tried to fix this before"), then pivots to HH's different approach with a 4-point checklist card. |
| **3-Phase Journey Arc** | The heart of the page. 8 modules organized into 3 narrative phases: Understand (M1-3), Transform (M4-6), Rebuild (M7-F). Each phase has a numbered header, tagline, description, and module cards with icons. Module 7 has a "Preview free" link. |
| **Teal Quote** | Full-width emotional beat — Trisha quote: "This isn't a weekend workshop. It's a transformation." |
| **What's Included** | 2x2 card grid: 8 Deep-Dive Modules, Weekly Coaching with Trisha, Private Community, Proprietary Frameworks. |
| **Closing CTA** | Side-by-side cards: Free Preview (Module 7) vs. Full Program enrollment. Plus "Talk to us first" contact link. |

Organic wave dividers (`OrganicDivider` from `@scoria/ui`) between sections. GSAP ScrollTrigger animations on every section with reduced-motion support.

### Navigation Changes

- **Desktop nav:** Added "Your Journey" link between Programs and Tools
- **Overlay menu:** Added "Your Journey" entry between Programs and Tools & Frameworks
- **Footer:** Added "Your Journey" link under Explore column

### Cross-Link Updates

| File | Change |
|---|---|
| `Programs.jsx` | Flagship CTA → `/journey` ("Explore the Full Journey") |
| `Programs.jsx` | Closing CTA → `/journey` |
| `Home.jsx` | ProgramsTeaser cards now use per-card `href` — Journey card → `/journey`, Rescue Kit → `/rescue-kit` |
| `Layout.jsx` | Footer Explore column → added `/journey` |

---

## Files Modified

| File | Change Type |
|---|---|
| `src/pages/YourJourney.jsx` | **Created** — 460 lines |
| `src/App.jsx` | Route registration + import |
| `src/components/Layout.jsx` | Nav link (desktop + overlay + footer) |
| `src/pages/Programs.jsx` | 2 CTA links updated |
| `src/pages/Home.jsx` | Per-card hrefs in ProgramsTeaser |

---

## Build Status

- `npm run build` — **Pass** (902KB bundle, pre-existing chunk size warning)
- `npm run lint` — **No new errors** (19 pre-existing errors across other files, 0 from YourJourney.jsx)

---

## Design Decisions

1. **3-phase narrative arc** over flat module list — visitors see a transformation story, not a syllabus
2. **Dual CTA strategy** (free preview vs. full program) — reduces decision friction by giving two clear paths based on readiness
3. **Module 7 "Preview free" link** — leverages existing free preview as a low-commitment entry point
4. **Terminology compliance** — uses "practices" not "exercises", "reflection prompts" not "journal prompts", references HH frameworks (SPARK, Critter Brain/CEO Brain, Zones of Resilience, 90-Second Wave, Core Wounds) naturally
5. **Voice** — written in Trisha's warm, conversational style throughout

## What's Not Included (By Design)

- No pricing — enrollment links go to `/coming-soon` pending Stripe integration (Phase 3)
- No video embeds — waiting on Trisha's intro videos (due ~2026-03-27)
- No real photos — uses no images (text-only layout) since picsum placeholders would look worse than a clean editorial design
