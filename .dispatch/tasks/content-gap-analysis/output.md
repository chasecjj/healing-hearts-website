# Content Gap Analysis — Healing Hearts Website
**Date:** 2026-03-23
**Scope:** Marketing site, course portal, vault curriculum, customer funnel, expo readiness

---

## Executive Summary

The Healing Hearts website has a polished marketing presence with real, emotionally compelling content across 14+ pages. However, **the course portal is almost entirely hollow** — 7 of 8 modules contain single-sentence stub lessons, 5 standalone packages have zero lesson content, and the customer funnel has multiple dead-ends that lose high-intent buyers. Meanwhile, **~120KB+ of real curriculum content exists in the vault** but has not been deployed. The team has 18 days until the Be Healthy Expo and needs targeted fixes to avoid losing expo leads.

### By the Numbers

| Metric | Value |
|--------|-------|
| Marketing pages with real content | 14 |
| Course lessons with real content | 8 (all in Module 7) |
| Course lessons that are stubs | 21 |
| Vault modules ready but not deployed | 12+ |
| Standalone packages with zero lessons | 5 of 5 |
| Funnel dead-end pages (no CTA) | 5 |
| Voice/terminology issues | 28 |
| Days until Be Healthy Expo | 18 |

---

## Part 1: Critical Gaps (Revenue & Trust Blockers)

### C1. 7 of 8 Modules Are Hollow
**Severity: CRITICAL**

Modules 1-6 and 8 ("Legacy Building") contain only single-sentence placeholder lessons. Example: Module 5, Lesson 1 ("The 90-Second Wave") contains only: *"Understanding the neurochemistry of emotional flooding and how to ride the wave."*

Only Module 7 has real content — 3 core lessons + 4 sub-lessons with exercises, callouts, quotes, and structured learning.

If Stripe payments were enabled today, a customer paying for the full program would access 7 empty modules.

**Impact:** Cannot launch paid access until content is populated.

### C2. Spark Challenge 7-Day Emails Don't Exist
**Severity: CRITICAL**

The welcome email says "Day 1 arrives tomorrow morning." There is no Day 1 email. There is no drip sequence infrastructure. No email automation platform (Mailchimp, ConvertKit, etc.) is integrated. Every Spark Challenge signup receives one email and then silence.

**Impact:** Every lead captured (including expo leads) will have a broken promise experience.

### C3. Spark Signups Not Persisted to Database
**Severity: CRITICAL**

The `/api/spark-signup.js` endpoint sends emails but does NOT write to Supabase. There is no `spark_signups` table. If the team notification email is missed, the lead is gone forever. There is no way to query who has signed up.

**Impact:** Lead list is ephemeral. Cannot retarget, cannot measure conversion, cannot follow up.

### C4. No Purchase Path — All Buy Buttons Dead-End
**Severity: CRITICAL**

Every "Enroll" and "View Details" button navigates to `/coming-soon`. The Coming Soon page offers only "Try the Free Challenge" — sending a ready-to-buy visitor backward in the funnel to a free signup. No waitlist capture, no "notify me" mechanism.

**Impact:** Zero revenue capture. High-intent buyers lost with no follow-up path.

### C5. No Upsell at Module 7 Completion
**Severity: HIGH**

When a user finishes the free preview (Module 7), the only indication is a "Module Complete" badge. No CTA to purchase, no invitation to explore enrollment, no celebration. Locked modules show no tooltip or upgrade prompt. The portal access-denied page only says "Back to Dashboard."

**Impact:** The single most important conversion moment in the funnel is completely wasted.

---

## Part 2: Vault-to-Website Content Gap

### ~120KB+ of Vault Content Not Deployed

The vault contains substantial, written curriculum content that has never been converted to `content_json` and seeded into the database.

| Vault File | Size | Maps to Module | Seed Status |
|------------|------|----------------|-------------|
| Module 7_1.md (12 Subconscious Principles) | 18KB | 7.1 | Misplaced as "Identifying Core Wounds" stub |
| Module 7_2 (Forgiveness) | 23KB | 7.2 | Moderate seed (3 blocks vs 23KB vault) |
| Intimacy.md (6 Levels) | 27KB | 7.4 / 1.3 | Stub sub-lessons in seed |
| Module 6_4 (Green Zone Shrinks) | 25KB | 6.4 | Not in seed |
| Module 6.3 (6 Pillars) | 16KB | 6.3 | Not in seed |
| Modules 6.2+6.3 (handouts) | 16KB | 6.2 | Not in seed |
| Module F.1 (Financial Nervous System) | 10KB | 8.3 / F.1 | Not in seed |
| Module F.2 (Safety Net) | 7KB | 8.3 / F.2 | Not in seed |
| Module F.3 (Oak Tree) | 7KB | 8.3 / F.3 | Not in seed |
| Module F.4 (Decision Toolbox) | 7KB | 8.3 / F.4 | Not in seed |
| Module B.1 (Architecture of Exhaustion) | 8KB | 8.1 | Not in seed |
| Module 8.2 (pipeline revised) | 220 lines | 8.2 | Not in seed |

### Registry Is Stale

5 sub-modules marked MISSING in the curriculum registry actually have vault content: 6.4, 7.4, 8.1, 8.2, 8.3 (F.1-F.4). The registry needs updating.

### Seed.sql Has Structural Misalignment

The seed lesson titles don't match the registry's 32 sub-module structure:
- SPARK Method is placed in Module 4 (should be Module 1.4)
- Critter Brain is in Module 6 (should be Module 5.1-5.2)
- Module 1 lessons are generic ("Welcome to the Journey") instead of matching registry topics
- Module 3 lessons ("Your Childhood Blueprint") don't align with 3.1-3.4 topics

### Truly Missing Content (No Source Anywhere)

Only 3 sub-modules have no content in any location:
1. **3.3** — The Art of Healthy Connection
2. **3.4** — Anxiety and Fear of Abandonment
3. **8.4** — Future-Proofing

---

## Part 3: Customer Journey Dead-Ends

### 5 Pages With Zero Outbound CTAs

| Page | Route | Why It Matters |
|------|-------|----------------|
| **Testimonials** | `/testimonials` | Visitors at peak emotional state — no "Start Now" |
| **FAQ** | `/faq` | Questions answered, zero next step |
| **Tools** | `/tools` | Educational content, no path forward |
| **Frameworks** | `/frameworks` | Framework education, no path forward |
| **Resources** | `/resources` | Downloads + articles that don't work, no CTA |

### Backward Funnel Flows

1. Programs "Talk to Us First" → `/coming-soon` (should be `/contact`)
2. ComingSoon → `/spark-challenge` (buyer sent back to free tier)
3. Rescue Kit purchase button → `/coming-soon` → `/spark-challenge` (3 clicks from purchase intent to free signup)
4. Portal locked module → "Back to Dashboard" (no upgrade path)

### Missing Trust Elements

- **Signup page**: No testimonials or social proof
- **Your Journey page** (primary sales page): Zero testimonials
- **Course Overview**: No social proof about Module 7 specifically
- **Portal access-denied**: No value proposition for upgrading

---

## Part 4: Standalone Package Readiness

| Priority | Package | Price | Readiness | Effort | Key Blocker |
|----------|---------|-------|-----------|--------|-------------|
| 1 | Communication Mastery | $39 | ~90% | Small | Standardization + packaging |
| 2 | Conflict Rescue Kit | $39 | ~80% | Small | Printable PDF creation |
| 3 | Toxic Pattern Breaker | $39 | ~85% | Small-Medium | Action plan deliverable |
| 4 | Financial Unity | $39 | ~60% | Medium | Registry update + pipeline pass |
| 5 | Spark & Intimacy | $49 | ~40-50% | Medium-Large | Module 3.3 missing + assessment + 30-day plan |

**Cross-cutting blocker:** Zero bundle lessons exist in the database. All 5 packages have course rows but no modules or lessons. Before any package can be sold, either bundle-specific seed data or a content-sharing mechanism is needed.

**Registry surprise:** Financial Unity is listed at 0% in the registry but vault has all 4 modules (F.1-F.4, totaling ~31KB). The registry is out of date.

---

## Part 5: Voice & Terminology Issues

28 findings across the codebase. The site is clean on journal prompts, lizard brain, calm state, clinical language, and generic AI phrases.

### Issues Found

| Category | Count | Pages Affected |
|----------|-------|---------------|
| "exercise" → should be "practice" | 8 | Programs, SparkChallenge, Team, seed.sql |
| "triggered" → should be "activation" | 5 | About, Frameworks, Tools, seed.sql (7.3) |
| "your body" → should be "your system" | 6 | Tools, About, Frameworks, seed.sql |
| SPARK naming inconsistency | 9 | Various (SPARK Method™ vs SPARK Method vs SPARK vs "SPARK tool" vs "SPARK repair process") |

### Recommended Standard

- **Term:** "SPARK Method" (with ™ on first use per page, plain on subsequent)
- **Term:** "practice" (never "exercise" in user-facing content)
- **Term:** "activation" / "activated" (never "triggered")
- **Term:** "your system" (never "your body" when referring to nervous system)

---

## Part 6: Be Healthy Expo Readiness (April 10)

### What Works
- Lead capture path: Home → Spark Challenge → email signup (2 taps)
- Content quality on Home, About, Team pages is excellent
- Site is generally mobile-responsive (Tailwind breakpoints)
- Team photos exist (`public/images/team/`)

### Critical Fixes Before April 10

| # | Fix | Effort | Why |
|---|-----|--------|-----|
| 1 | **Compress team photos** (chase.jpg and makayla.jpg are 1.4MB each) | 15 min | 3.1MB total photo payload kills mobile load time |
| 2 | **Add `spark_signups` table + DB insert to API** | 30 min | Every expo lead is currently lost after server log rotates |
| 3 | **Add "Free Challenge" CTA to navbar** | 15 min | Spark Challenge is absent from ALL navigation menus |
| 4 | **Fix welcome email logo** (references non-existent `favicon.svg`) | 5 min | Broken image in first email expo visitors receive |
| 5 | **Show hero image on mobile** (currently `hidden lg:flex`) | 30 min | Mobile visitors see text-only hero — no visual warmth |

### Nice-to-Haves for Expo

| # | Enhancement | Effort |
|---|-------------|--------|
| 1 | Create `/expo` landing page or `?ref=expo` tracking | 30 min |
| 2 | Generate QR code for booth materials | 10 min |
| 3 | Replace About page picsum placeholder with real photo | 10 min |
| 4 | Add Calendly or booking link to Contact page | 15 min |

---

## Part 7: Prioritized Action Plan

### Tier 1: Before Expo (by April 10)

These directly affect whether expo leads convert or are lost:

1. Create `spark_signups` Supabase table + add insert to `/api/spark-signup.js`
2. Compress team photos to <400KB each
3. Add "Free Challenge" button to navbar
4. Fix welcome email logo reference
5. Build or integrate a 7-day email drip (even if manual via Resend Audiences)

### Tier 2: Revenue Enablement (Weeks 1-4)

These are required before any money can be collected:

6. Convert vault content to `content_json` and seed Modules 1-6 and 8 (prioritize modules with PUBLISHED/REVIEW vault content: 5.x, 4.x, 2.x, 1.4)
7. Realign seed.sql module/lesson structure to match curriculum registry
8. Build Stripe integration (Phase 3) for at least the flagship program
9. Add upsell CTA at Module 7 completion
10. Add CTAs to dead-end pages (Testimonials, FAQ, Tools, Frameworks, Resources)

### Tier 3: Package Launch (Weeks 4-8)

11. Package Communication Mastery Toolkit as first standalone bundle (~90% ready)
12. Package Conflict Rescue Kit as second bundle (~80% ready)
13. Create bundle-specific seed data or content-sharing mechanism
14. Design printable PDFs (SPARK Pact, 90-Second Wave Guide, Connection Map, Conflict Recovery Plan)
15. Update curriculum registry to reflect actual vault content status

### Tier 4: Polish (Ongoing)

16. Fix 28 voice/terminology issues across marketing pages and seed.sql
17. Write 6 blog articles (article titles already exist on Resources page)
18. Create 4 downloadable resources (PDFs promised on Resources page)
19. Build "Programs: Talk to Us First" → `/contact` (currently → `/coming-soon`)
20. Add social proof to Journey page, Signup page, and portal access-denied screen

---

## Appendix: File References

| Category | Key Files |
|----------|-----------|
| Marketing pages | `src/pages/Home.jsx`, `Programs.jsx`, `CourseOverview.jsx`, `SparkChallenge.jsx`, `About.jsx`, `Team.jsx`, `Testimonials.jsx`, `FAQ.jsx`, `Tools.jsx`, `Frameworks.jsx`, `Resources.jsx` |
| Portal | `src/CoursePortal.jsx`, `src/components/LessonContent.jsx`, `src/hooks/useCourseData.js` |
| Auth | `src/contexts/AuthContext.jsx`, `src/pages/Login.jsx`, `src/pages/Signup.jsx` |
| API | `api/spark-signup.js`, `api/contact.js` |
| Database | `supabase/seed.sql`, `supabase/migrations/001-006` |
| Vault curriculum | `Mind Vault/Projects/healing-hearts/pipeline/foundation/curriculum-registry.md` |
| Vault modules | `Mind Vault/Projects/healing-hearts/modules/*.md` |
| Vault voice profile | `Mind Vault/Projects/healing-hearts/pipeline/foundation/voice-profile.md` |
| Routing | `src/App.jsx`, `vercel.json` |
