# Module 7 "Free Preview" Reconnaissance Audit — Findings Report

**Date:** 2026-04-11
**Scope:** `C:\Users\chase\Documents\HealingHeartsWebsite\` (full repo)
**Purpose:** Comprehensive inventory of every place Module 7 is marketed, gated, or referenced as a free preview, so Chase can rewrite all marketing and access rules in one pass.

---

## 1. Executive Summary

| Category | Hits | Urgency |
|----------|------|---------|
| Marketing pages (user-facing copy) | 17 | 13 HIGH, 2 MEDIUM, 2 LOW |
| Email templates | 1 | MEDIUM (indirect) |
| Portal UI / frontend gating | 20+ | 4 BREAKING, 8 VISUAL, 4 LOGIC |
| API routes / backend | 0 | Clean |
| Database (RLS + migrations) | 15+ | 1 CRITICAL (RLS policy), rest are SET/INSERT ops |
| Lesson content (content_json) | 0 | Clean — no student-facing preview copy |
| Config / constants / env | 0 | Clean |
| Docs / plans / specs | 23 | 10 INSTRUCTIONAL, 12 REFERENCE, 1 MARKETING |
| CLAUDE.md + .claude/ agents/plugins | 50 | 22 INSTRUCTIONAL, 19 TEMPLATE, 9 REFERENCE |

**Bottom line:** The free preview is deeply embedded in 3 marketing pages, 3 portal UI files, 1 RLS policy, and 10+ AI agent config files. The API layer, email templates, lesson content, and config files are clean. The single highest-leverage fix is flipping `is_preview=false` in the DB + updating `funnel-architecture.md` (propagates to all 6 marketing agents).

---

## 2. Marketing Pages

### HIGH Urgency (user-facing copy that will be wrong)

#### `src/pages/CourseOverview.jsx`

| Line | Exact Quote | Action |
|------|-------------|--------|
| 14 | `{ number: '7', title: 'Forgiveness & Letting Go', ..., isPreview: true }` | Remove `isPreview: true` from static MODULES array |
| 19 | `usePageMeta('Course Overview', '...Free preview of Module 7.')` | Rewrite meta description — remove "Free preview of Module 7" |
| 50 | `Start Free Preview <ChevronRight>` | Replace CTA text — e.g., "Explore the Program" or "Start Your Journey" |
| 60 | `Module 7 is available as a free preview. Full access coming soon.` | Rewrite — describe the full program or new lead magnet |
| 68-95 | Conditional card styling, PlayCircle icon, and `Free Preview` badge all driven by `isPreview` flag | Remove all `isPreview`-conditional rendering; all modules get same treatment |
| 105-111 | `<Link to={user ? '/portal/module-7' : '/signup'}>` | Replace with new CTA target (e.g., `/spark-challenge` or generic `/portal`) |
| 127 | `Module 7 covers core wounds, forgiveness, and reprogramming your nervous system. Three full lessons, no credit card required.` | Rewrite bottom CTA section — pitch new lead magnet or enrollment |

#### `src/pages/YourJourney.jsx`

| Line | Exact Quote | Action |
|------|-------------|--------|
| 99-104 | `{ num: 7, ..., isPreview: true }` in Phase 3 module data | Remove `isPreview: true` |
| 202 | `Preview Module 7 Free` (hero secondary CTA) | Replace CTA text and link |
| 402-409 | `{mod.isPreview && (<Link to="/course">Preview free</Link>)}` | Remove `isPreview`-gated "Preview free" link on module cards |
| 590 | `<p>Free Preview</p>` | Remove or replace ClosingCta "Free Preview" heading |
| 595 | `Module 7 -- Forgiveness & Letting Go -- is completely free. Three full lessons on core wounds, forgiveness, and belief reprogramming. No credit card. No commitment.` | Rewrite entire ClosingCta card — pitch new lead magnet |
| 599 | `Start Free Preview` (CTA button in ClosingCta) | Replace button text and link |

#### `src/pages/Signup.jsx`

| Line | Exact Quote | Action |
|------|-------------|--------|
| 102 | `Create a free account to access Module 7: Forgiveness & Letting Go -- a complete preview of the Healing Hearts experience.` | Rewrite left-panel branding copy — generic "access the portal" or pitch Spark Challenge |
| 126 | `Get free access to Module 7: Forgiveness & Letting Go -- three full lessons, no payment required.` | Rewrite form subtitle — remove Module 7 promise |

### MEDIUM Urgency

| File | Line | Quote | Action |
|------|------|-------|--------|
| `Programs.jsx` | 221 | `Subconscious Core Wounds` (in module list) | Verify this still matches Module 7 title post-rename; may be fine as-is |
| `Testimonials.jsx` | 31 | `"The Core Wounds module hit different..."` | Testimonial is authentic; review whether it implies free access |

### LOW Urgency (framework education, not preview-specific)

| File | Lines | Content | Action |
|------|-------|---------|--------|
| `Tools.jsx` | 177-200 | "The 7 Core Wounds" framework section | No action needed — framework education, not preview framing |
| `Frameworks.jsx` | 45-52 | "The 7 Core Wounds" framework data | No action needed |

---

## 3. Email Templates

**28 files audited. Effectively clean.**

| File | Line | Quote | Type | Urgency |
|------|------|-------|------|---------|
| `api/_emails/webinar-followup-2.js` | 22 | `"...they learned to identify their Core Wounds -- the deeper injuries underneath every surface-level argument."` | INDIRECT — "Core Wounds" used in a narrative transformation story | MEDIUM |

All other email templates (spark drip day0-day14, webinar confirmation/reminders/replays/follow-ups, application-received, purchase-confirmation, webinar-broadcast, spark-shared) are clean. No direct Module 7, free preview, or Forgiveness & Letting Go references.

---

## 4. Portal UI / Frontend Code

### Access Gating Logic (reads `is_preview` from DB — data-driven)

#### `src/CoursePortal.jsx`

| Line | Code | What It Does | Impact If M7 Locked |
|------|------|-------------|---------------------|
| 51 | `if (mod && !mod.is_preview && !isAdmin && !hasActiveEnrollment) denied = true` | Module-level access gate | BREAKING — locks all non-enrolled users out of M7 |
| 58 | `mod = course.modules.find((m) => m.is_preview) \|\| course.modules[0]` | Default routing fallback — prefers first preview module | LOGIC — falls back to modules[0] which is also locked; user sees lock wall |
| 65 | `if (lesson && !lesson.is_preview && !mod.is_preview && !isAdmin && !hasActiveEnrollment) denied = true` | Lesson-level access gate | BREAKING — locks all M7 lessons |
| 131 | `"Explore the free preview to experience what is inside"` | Lock wall copy | VISUAL — references "free preview" that no longer exists |

#### `src/portal/PortalDashboard.jsx`

| Line | Code | Impact |
|------|------|--------|
| 60 | `if (!mod.is_preview && !isAdmin) return false` | BREAKING — `activeModule` always undefined; hero area empty |
| 63 | `course?.modules?.find((m) => m.is_preview \|\| isAdmin)` | LOGIC — fallback fails; no active module selected |
| 74 | `(m) => (m.is_preview \|\| isAdmin) && getModuleProgress(m) === 100` | LOGIC — completed modules counter always 0 |
| 237 | `const modProgress = (mod.is_preview \|\| isAdmin) ? getModuleProgress(mod) : 0` | VISUAL — all progress bars show 0% |
| 238 | `const isLocked = !mod.is_preview && !isAdmin` | VISUAL — all modules show locked (opacity 60%, Lock icon, non-interactive) |

#### `src/portal/LessonView.jsx`

| Line | Code | Impact |
|------|------|--------|
| 77 | `if ((mod.is_preview \|\| isAdmin) && mod.lessons) { allLessons.push(...) }` | BREAKING — prev/next navigation empty |
| 211 | `const modProgress = (mod.is_preview \|\| isAdmin) ? getModuleProgress(mod) : 0` | VISUAL — sidebar progress all 0 |
| 217 | `if ((mod.is_preview \|\| isAdmin) && mod.lessons?.length) { navigateToLesson(...) }` | BREAKING — sidebar module clicks do nothing |
| 224 | Locked CSS: `text-foreground/40 opacity-60 cursor-not-allowed` | VISUAL — all modules grayed |
| 228 | `disabled={!mod.is_preview && !isAdmin}` | BREAKING — sidebar buttons disabled |
| 230 | Lock vs PlayCircle icon based on `is_preview` | VISUAL — all modules show Lock |
| 247 | Lesson list only renders if `mod.is_preview \|\| isAdmin` | BREAKING — no lesson list in sidebar |

#### Other Portal Files

| File | Status |
|------|--------|
| `src/portal/ModuleOverview.jsx` | Clean — trusts upstream gating |
| `src/portal/Downloads.jsx` | Clean — operates on orders/products, not modules |
| `src/components/LessonContent.jsx` | Clean — pure block renderer |
| `src/components/Layout.jsx` | Clean |
| `src/components/Footer.jsx` | Clean |
| `src/components/ContentBlocks/FillableFormBlock.jsx` | Line 4 comment only: "Module 7 retrofit fake-form replacements" — no runtime impact |

### Cascade Effect: `is_preview=false` on ALL Modules + No Enrollment

1. **Dashboard** renders but is entirely inert — welcome header, zeroed stats, wall of locked module cards
2. **Any `/portal/module-X` URL** hits the line 51 guard → lock wall with misleading "free preview" copy
3. **Lock wall** "Back to Dashboard" → dead dashboard; "Learn About the Program" → `/course` (still works)
4. **Sidebar** — all modules locked, all buttons disabled, no lesson lists, no navigation
5. **No crash, no blank screen** — degrades gracefully but is completely non-functional for unenrolled users

**Critical note:** The portal UI gates use `is_preview` OR `isAdmin` OR `hasActiveEnrollment`. When you add enrollment-based access (Stripe), the portal will work correctly for enrolled users WITHOUT any code changes to `is_preview` checks. The `is_preview` checks only affect unenrolled users.

---

## 5. API Routes and Backend

**Zero hits. The API layer is fully agnostic.**

All 8 API routes audited (checkout.js, webhooks/stripe.js, spark-signup.js, webinar-register.js, application.js, admin/send-broadcast.js, cron/spark-drip.js, cron/webinar-cron.js) — none reference Module 7, `is_preview`, or hardcoded module IDs.

| File | Note |
|------|------|
| `src/lib/courses.js` | Clean — generic Supabase queries, no `is_preview` filtering |
| `src/hooks/useCourseData.js` | Default slug `'healing-hearts-journey'` (informational, not a gate) |

---

## 6. Database Migrations / RLS

### The Critical RLS Policy

**`supabase/migrations/001_initial_schema.sql` lines 168-182:**

```sql
CREATE POLICY "lessons_read" ON lessons
  FOR SELECT USING (
    is_preview = true
    OR EXISTS (
      SELECT 1 FROM enrollments e
      JOIN modules m ON m.course_id = e.course_id
      WHERE m.id = lessons.module_id
        AND e.user_id = auth.uid()
        AND e.status = 'active'
    )
    OR EXISTS (
      SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

**This is the single source of truth for lesson access.** Three paths to read a lesson:
1. `is_preview = true` on the lesson row (blanket access for authenticated users)
2. Active enrollment on the course
3. Admin role

**Modules policy:** `modules_public_read` uses `USING (true)` — all module metadata is always visible. Only lesson content is gated.

**When `is_preview` is flipped to `false`:** Unenrolled users get zero rows from Supabase for those lessons. The RLS policy already supports enrollment-based access — no policy changes needed, just the data flip.

### Migrations That Set `is_preview`

| Migration | What It Does |
|-----------|-------------|
| `002_module7_preview.sql` | Sets `modules.is_preview=true` for module_number='7'; sets `lessons.is_preview=true` for all M7 lessons; also unsets Module 1 preview |
| `005_module7_4_intimacy.sql` | INSERTs 5 new lessons (7.4 parent + 4 sub-lessons) with `is_preview=true` |
| `seed.sql` | Seeds Module 7 with `is_preview=true` on module + 8 lesson rows |

### Migration 006 Hardcoded UUIDs (Module 7.4 lessons)

```
35726e17-6646-40bc-a06f-80720c8fecfb  (The Path to True Intimacy — parent)
eff7805a-53e8-4c18-97ac-d4af9399c790  (Foundations & Safety)
e915a4d3-0c0a-4039-8d8e-0dd2451e22f8  (The Connection Layers)
046a4c84-01c7-445f-b72f-f2c7a8dac58c  (Spiritual & Physical Intimacy)
e2e690a6-8604-44f7-bcbd-f15c158269de  (Sexual Connection & Action Plan)
```

These only appear in `006_module7_4_revised.sql` — content updates only, no `is_preview` changes.

### What Needs to Change (Database)

One migration:
```sql
UPDATE modules SET is_preview = false WHERE module_number = '7';
UPDATE lessons SET is_preview = false WHERE module_id = (SELECT id FROM modules WHERE module_number = '7' AND course_id = (SELECT id FROM courses WHERE slug = 'healing-hearts-journey'));
```

The RLS policy does NOT need changing — enrollment-based access already works.

---

## 7. Content (Lesson Blocks)

**Clean.** No student-facing content in `content_json` references "free preview", "this preview", "try before you buy", "sample module", or any similar language. All hits were SQL developer comments:

| File | Line | Content |
|------|------|---------|
| `002_module7_preview.sql` | 2 | `-- Migration 002: Set Module 7 as Preview Module` |
| `002_module7_preview.sql` | 11 | `-- Step 2: Set Module 7 as the preview module` |
| `005_module7_4_intimacy.sql` | 4 | `-- All is_preview = true (Module 7 is free preview)` |
| `seed.sql` | 430 | `-- PREVIEW MODULE -- free for all authenticated users` |

**Students will see no anachronistic messaging inside lessons when Module 7 is locked.**

---

## 8. Docs / CLAUDE.md / AI Agent Config

### Root Project Files

| File | Line | Quote | Type |
|------|------|-------|------|
| `README.md` | 3 | `"Marketing site + authenticated course portal with Module 7 free preview."` | REFERENCE |
| `CLAUDE.md` | 47 | `"Module 7 is the free preview (3 lessons)."` | **INSTRUCTIONAL** |
| `CLAUDE.md` | 70 | `"002_module7_preview.sql -- Module 7 preview data"` | REFERENCE |
| `CLAUDE.md` | 140 | `"Module access gated by is_preview flag (true = free, false = requires enrollment)"` | **INSTRUCTIONAL** |
| `CLAUDE.md` | 149 | `"Phase 2.5 -- Module 7 full content + sub-lessons \| Done"` | REFERENCE |

### Docs

| File | Lines | Type | Notes |
|------|-------|------|-------|
| `docs/CONTENT-BLOCKS.md` | 233 | INSTRUCTIONAL | Points devs to M7 as example |
| `docs/GETTING-STARTED.md` | 249, 522 | INSTRUCTIONAL | Route table + directory tree |
| `docs/superpowers/plans/2026-04-09-stripe-payment-portal.md` | 1166, 1174, 1204 | INSTRUCTIONAL + MARKETING | Code snippets + lock wall copy |
| `docs/superpowers/specs/2026-03-24-video-scripts-and-hosting-design.md` | 176, 283, 308 | INSTRUCTIONAL | Video testing instructions |
| `docs/superpowers/specs/2026-04-09-stripe-payment-portal-design.md` | 359, 366 | INSTRUCTIONAL | Before/after access gate code |
| `CHANGELOG.md` | 5, 8, 14, 24, 31, 37, 50, 64, 95, 100, 101 | REFERENCE | Historical release notes (11 entries) |

### .claude/ Agents and Plugins (CRITICAL — trains future AI sessions)

#### Highest Priority: Shared + Core Agent Files

| File | Hits | Type | Why Critical |
|------|------|------|-------------|
| `.claude/plugins/healing-hearts-marketing/shared/funnel-architecture.md` | 10 | **INSTRUCTIONAL** | Shared by ALL 6 marketing agents. Lines 12, 49, 79, 139, 140, 196, 214, 219 define Module 7 as the free entry point, lead scoring (+15/+20), routing rules, and segmentation tags. Fixing this one file neutralizes the largest surface area. |
| `.claude/agents/security-auditor.md` | 5 | **INSTRUCTIONAL** | Lines 48, 49, 72, 97, 138. Will cause future audits to flag removal of Module 7 preview as a security violation. |
| `.claude/agents/code-reviewer.md` | 1 | **INSTRUCTIONAL** | Line 87. Same — will flag preview removal as a bug. |
| `CLAUDE.md` (root) | 2 | **INSTRUCTIONAL** | Lines 47, 140. The top-level project instructions. |

#### Marketing Agent Files (Template + Instructional)

| File | Hits | Breakdown |
|------|------|-----------|
| `agents/jeff-storyteller.md` | 9 | 1 INSTRUCTIONAL (line 323: "always include CTA to Module 7 preview"), 8 TEMPLATE (LinkedIn, carousel, podcast, email examples) |
| `agents/trisha-qualifier.md` | 11 | 2 INSTRUCTIONAL (lines 51, 562), 9 TEMPLATE (funnel routing, nurture sequences, tagging) |
| `agents/jeff-qualifier.md` | 6 | 2 INSTRUCTIONAL (lines 50, 249), 4 TEMPLATE (lead magnet specs, segmentation) |
| `agents/trisha-storyteller.md` | 4 | 3 INSTRUCTIONAL (lines 174, 569, 592), 1 TEMPLATE (event follow-up) |
| `agents/jeff-scout.md` | 1 | REFERENCE (line 202) |

**Total AI config hits: 50 (22 INSTRUCTIONAL, 19 TEMPLATE, 9 REFERENCE)**

---

## 9. Suggested Replacement Hook Options

With Module 7 locked, you need a new free offer to drive signups and demonstrate program value. Here are 5 candidates:

### Option A: Spark Challenge (Existing — Lowest Effort)

**What:** The existing 7-Day Spark Challenge at `/spark-challenge` — a free email course with daily practices.
**Pros:** Already built, already has 14 drip emails, already has its own landing page, signup flow, and CTA buttons across the site.
**Cons:** Different medium (email) vs. portal experience. Doesn't showcase the portal UI. No "try the product" feeling.
**Fits naturally in:** CourseOverview.jsx (replace "Start Free Preview" → "Start the Spark Challenge"), YourJourney.jsx (ClosingCta card), Signup.jsx (replace Module 7 pitch → Spark Challenge pitch), all marketing agent CTAs.

### Option B: First Lesson of Module 1 (Sample Lesson)

**What:** Make Module 1, Lesson 1 ("Making Marriage Work") a standalone free sample lesson accessible to all authenticated users.
**Pros:** Showcases the actual portal experience. Demonstrates the content depth (4,000+ words). Natural "beginning" of the journey. Low DB effort (set `is_preview=true` on one lesson row).
**Cons:** Module 1 is the foundational module — giving away the first lesson may reduce perceived value. Single lesson doesn't show the full interactive feature set (journals, audio, exercises).
**Fits naturally in:** CourseOverview.jsx (replace "Module 7" → "Try Lesson 1 Free"), Signup.jsx, YourJourney.jsx hero CTA.

### Option C: 90-Second Wave PDF (Lead Magnet)

**What:** A downloadable PDF teaching the 90-Second Wave technique — one of the most-marketed frameworks.
**Pros:** Classic lead magnet format. Can be gated behind email signup (no auth required). Low friction. Sharable.
**Cons:** Doesn't showcase the portal. Static document vs. interactive experience. Needs to be created.
**Fits naturally in:** CourseOverview.jsx bottom CTA, marketing agent email CTAs, social media posts.

### Option D: Assessment Quiz → Personalized Entry

**What:** A "What's Your Relationship Pattern?" quiz that scores the user and recommends their entry point (Spark Challenge, consultation, or enrollment).
**Pros:** Captures email + segmentation data. Personalized experience. High conversion for lead magnets. Already referenced in funnel-architecture.md as a planned free entry.
**Cons:** Needs to be built. Requires quiz logic, scoring, result pages. Higher effort.
**Fits naturally in:** Home.jsx hero, CourseOverview.jsx, YourJourney.jsx ClosingCta, all marketing agent CTAs.

### Option E: Mini-Preview (First Lesson of 3 Different Modules)

**What:** Set `is_preview=true` on one lesson each from Modules 1, 4, and 7 — giving a cross-section of the program.
**Pros:** Shows breadth. Demonstrates the journey arc (Understand → Transform → Rebuild). Keeps Module 7 partially accessible.
**Cons:** More complex gating logic. Module cards would need "1 of N lessons free" badge instead of "Free Preview". Harder to market coherently.
**Fits naturally in:** CourseOverview.jsx (each module card shows its free lesson), portal dashboard (scattered access points).

### Recommendation

**Option A (Spark Challenge) for immediate launch** — zero build effort, already wired up, proven format. Replace all "Free Preview" CTAs with Spark Challenge links. Then pursue **Option D (Assessment Quiz)** as the Phase 3.5 upgrade when time permits.

---

## 10. Open Questions for Chase

1. **New lead magnet strategy:** Which replacement hook do you want? (See Section 9 above.) This determines the copy for CourseOverview, YourJourney, Signup, and all marketing agents.

2. **Portal empty state for unenrolled users:** When Module 7 is locked and a user has no enrollment, they see a wall of locked modules. Should we:
   - (a) Redirect unenrolled users from `/portal` to `/course` (the marketing page)?
   - (b) Show a custom "Start your journey" landing inside the portal with enrollment CTA?
   - (c) Keep the locked-module wall but improve the copy on the lock screen?

3. **Lock wall copy:** `CoursePortal.jsx:131` currently says "Explore the free preview to experience what is inside." What should it say post-lockdown? Suggestions:
   - "Enroll to access the full Healing Hearts program."
   - "Start with the 7-Day Spark Challenge, or enroll for full access."

4. **Signup page pitch:** `Signup.jsx` lines 102 and 126 currently pitch Module 7 as the reason to create an account. What should the new signup value prop be? Options:
   - Generic: "Create an account to access the Healing Hearts portal."
   - Spark Challenge: "Create a free account to start your 7-Day Spark Challenge."
   - Enrollment: "Create your account to begin your Healing Hearts journey."

5. **CourseOverview.jsx static data:** The `MODULES` array (line 8-17) is hardcoded static data, not from Supabase. Should it be refactored to pull from the DB so `is_preview` badges are data-driven? Or is static fine since this is a marketing page?

6. **Testimonial copy:** `Testimonials.jsx:31` has a testimonial saying "The Core Wounds module hit different." This is authentic testimonial language — does it need any caveat now that Module 7 isn't free? (Probably fine as-is — the testimonial doesn't promise free access.)

7. **AI agent update timing:** The 50 hits across `.claude/` files will cause every future AI session to re-introduce free preview framing. Should these be updated in the same PR as the code changes, or in a follow-up?

8. **Seed file:** `supabase/seed.sql` has Module 7 seeded with `is_preview=true`. Should this be updated to match production, or left as-is since seed is only used for fresh dev environments?

9. **Migration strategy:** Should the `is_preview=false` flip be a new migration (e.g., `020_lock_module7.sql`), or applied directly in Supabase dashboard? A migration is more traceable.

---

## Appendix: Complete File Inventory

### Files That MUST Change (runtime impact)

| File | Lines | Category |
|------|-------|----------|
| `src/pages/CourseOverview.jsx` | 14, 19, 50, 60, 68-95, 105-111, 127 | Marketing copy + static data |
| `src/pages/YourJourney.jsx` | 99-104, 202, 402-409, 590, 595, 599 | Marketing copy + static data |
| `src/pages/Signup.jsx` | 102, 126 | Marketing copy |
| `src/CoursePortal.jsx` | 131 | Lock wall copy ("free preview" text) |
| Supabase DB | modules + lessons rows | `is_preview = false` for Module 7 |

### Files That SHOULD Change (AI behavior / consistency)

| File | Lines | Category |
|------|-------|----------|
| `CLAUDE.md` | 47, 140 | Project instructions |
| `.claude/plugins/healing-hearts-marketing/shared/funnel-architecture.md` | 12, 49, 79, 139, 140, 196, 214, 219 | Shared marketing agent config |
| `.claude/agents/security-auditor.md` | 48, 49, 72, 97, 138 | Security audit rules |
| `.claude/agents/code-reviewer.md` | 87 | Code review rules |
| `.claude/plugins/healing-hearts-marketing/agents/jeff-storyteller.md` | 154, 177, 185, 229, 231, 277, 281, 287, 323 | Content templates |
| `.claude/plugins/healing-hearts-marketing/agents/trisha-qualifier.md` | 51, 86, 142, 326, 333, 338, 351, 402, 562 | Funnel routing |
| `.claude/plugins/healing-hearts-marketing/agents/jeff-qualifier.md` | 50, 84, 128, 138, 249 | Funnel routing |
| `.claude/plugins/healing-hearts-marketing/agents/trisha-storyteller.md` | 174, 348, 569, 592 | Content quality gates |
| `README.md` | 3 | Project description |

### Files That CAN Change (reference docs, lower priority)

| File | Category |
|------|----------|
| `CHANGELOG.md` (11 lines) | Historical — arguably leave as-is |
| `docs/CONTENT-BLOCKS.md` | Developer example reference |
| `docs/GETTING-STARTED.md` | Developer orientation |
| `docs/superpowers/plans/2026-04-09-stripe-payment-portal.md` | Plan doc (historical) |
| `docs/superpowers/specs/2026-03-24-video-scripts-and-hosting-design.md` | Spec doc (historical) |
| `docs/superpowers/specs/2026-04-09-stripe-payment-portal-design.md` | Spec doc (historical) |
| `supabase/seed.sql` | Dev environment seed |
| `.claude/plugins/healing-hearts-marketing/agents/jeff-scout.md` | Reference only |

### Files Confirmed Clean (no action needed)

Marketing pages: Home, About, Resources, FAQ, RescueKit, SparkChallenge, ConferenceHome, PhysicianMarriages, Physicians, Apply, Team, Login, ForgotPassword, WebinarRegister, WebinarLive, WebinarReplay, CheckoutSuccess, ApplicationSuccess

Email templates: All 28 files (spark drip x14, webinar x6, application x2, purchase x1, broadcast x1, spark-shared x1, spark-welcome x1, webinar-followup-2 has 1 indirect "Core Wounds" mention)

Portal: ModuleOverview, Downloads, LessonContent, Layout, Footer

API: checkout.js, webhooks/stripe.js, spark-signup.js, webinar-register.js, application.js, admin/send-broadcast.js, cron/spark-drip.js, cron/webinar-cron.js

Config: constants.js, courses.js, useCourseData.js, vercel.json, package.json, .env.example, tailwind.config.js, vite.config.js, eslint.config.js, postcss.config.js

Lesson content: All content_json blocks in migrations 002, 003, 005, 006, and seed.sql — zero student-facing preview language
