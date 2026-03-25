# Build Journey Program Page

**Goal:** Create a `/journey` page — an immersive, narrative-driven landing page that walks prospective clients through the full 8-module Healing Hearts transformation arc. This replaces the basic `/course` module list with a story-first experience designed to convert visitors into enrollees.

**Why:** The existing `/programs` page is a catalog (list of offerings). The `/course` page is a bare module list. Neither tells the *story* of transformation — what happens inside you across 32 weeks, why each phase matters, what it *feels like* to move through the program. The journey page fills this gap as the primary conversion page.

## Checklist

- [x] 1. Create `src/pages/YourJourney.jsx` — full page with Hero, 3-Phase Journey Arc, What's Included, Testimonial/Quote, and Closing CTA sections (6 sections, 3-phase narrative, dual CTA)
- [x] 2. Register `/journey` route in `App.jsx` (inside Layout) and add nav link (desktop nav + overlay menu)
- [x] 3. Update cross-links: Programs page CTA → `/journey`, Home page → per-card hrefs, Footer → journey link
- [x] 4. Verify build passes (`npm run build`) and no lint errors (build clean, all 19 lint errors pre-existing)
- [x] 5. Write `output.md` with summary of what was built
