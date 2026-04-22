# Module 7 "Free Preview" Reconnaissance Audit

**Purpose:** Find every location in the Healing Hearts website repo where Module 7 is marketed/offered as a free preview, every place that grants blanket access, every email or marketing copy that hooks signups on Module 7, and every portal UI element that visually badges Module 7. Do NOT make any changes — this is a read-only audit that produces a comprehensive findings report.

**Scope:** `C:\Users\chase\Documents\HealingHeartsWebsite\` (current working directory).

**Constraint:** READ-ONLY. Do not edit files. Do not run migrations. Do not commit anything. Just observe and report.

---

- [x] Grep the entire repo for Module 7 references. 148+ hits across 50+ files. Key clusters: marketing pages (CourseOverview, YourJourney, Signup), portal UI (CoursePortal, PortalDashboard, LessonView), migrations (001-006, seed), .claude plugins (marketing agents, funnel-architecture), docs/plans.

- [x] Review marketing pages in `src/pages/` for Module 7 / free preview framing. 13 HIGH hits across CourseOverview.jsx, YourJourney.jsx, Signup.jsx. 2 MEDIUM (Programs.jsx, Testimonials.jsx). 2 LOW (Tools.jsx, Frameworks.jsx). 18 pages confirmed clean. Pages to inspect: `Home.jsx`, `CourseOverview.jsx`, `Course.jsx` (if exists), `Programs.jsx`, `Tools.jsx`, `Frameworks.jsx`, `RescueKit.jsx`, `SparkChallenge.jsx`, `About.jsx`, `Resources.jsx`, `FAQ.jsx`, `YourJourney.jsx`, `ConferenceHome.jsx`, `Testimonials.jsx`, `PhysicianMarriages.jsx`, `Physicians.jsx`, `Apply.jsx`, `Team.jsx`, `Signup.jsx`, `Login.jsx`, `ForgotPassword.jsx`, `WebinarRegister.jsx`, `WebinarLive.jsx`, `WebinarReplay.jsx`, `CheckoutSuccess.jsx`, `ApplicationSuccess.jsx`. For each file, note whether Module 7 / free preview is referenced, the exact phrasing, and what replacement hook would fit the page's voice.

- [x] Review every email template in `api/_emails/` for Module 7 / free preview language. 28 files audited. Only 1 indirect hit: webinar-followup-2.js:22 ("Core Wounds" in narrative). Zero direct Module 7 or free preview mentions. Email layer is clean. Include the welcome/signup emails, all 14 spark drip templates (`day0`, `day1`, ..., `day13`), webinar confirmation + reminders + replays + follow-ups (all 5), application-received emails, purchase confirmation emails, webinar broadcast templates, and the shared unsubscribe footer. Capture exact quotes and line numbers.

- [x] Review portal UI for Module 7 visual treatment. 20+ is_preview checks across CoursePortal.jsx (4), PortalDashboard.jsx (5), LessonView.jsx (7). Cascade: if is_preview=false on all modules + no enrollment → dashboard inert, all modules locked, sidebar dead, lock wall says "free preview" that doesn't exist. Inspect: `src/CoursePortal.jsx`, `src/portal/PortalDashboard.jsx`, `src/portal/ModuleOverview.jsx`, `src/portal/LessonView.jsx`, `src/portal/Downloads.jsx`, `src/components/LessonContent.jsx`, `src/components/Layout.jsx`, `src/components/Footer.jsx`. Look for any hardcoded mention of Module 7, any "Free Preview" / "Start Here" badge logic, and any rendering that assumes Module 7 is specially accessible.

- [x] Check API routes for references in `api/`. Zero hits. API layer is fully agnostic — checkout, webhooks, spark-signup, webinar-register, application all use DB-driven logic. No hardcoded Module 7 UUIDs. useCourseData.js has 'healing-hearts-journey' default slug (informational only). Search for `Module 7`, `module 7`, `module_7`, `module-7`, `is_preview`, `healing-hearts-journey`, or any hardcoded Module 7 UUID. Inspect `api/checkout.js`, `api/webhooks/stripe.js`, `api/spark-signup.js`, `api/webinar-register.js`, `api/application.js`, `api/admin/send-broadcast.js`, `api/_emails/*.js`. Capture anything that gates or grants access based on Module 7.

- [x] Check SQL migrations in `supabase/migrations/` for Module 7 access rules. Critical: lessons_read RLS policy (001:171) uses is_preview=true to grant SELECT. modules_public_read uses USING(true) — no gate. 002 sets M7 as preview. 005 inserts 5 lessons with is_preview=true. seed.sql has 8 M7 lesson rows with is_preview=true. Flipping is_preview=false cuts DB-level access for unenrolled users. Read `001_initial_schema.sql` (for RLS policy on `modules` and `lessons` tables — look for anything that grants default SELECT to authenticated users based on `is_preview`), `002_module7_preview.sql` (the file that set Module 7 as preview originally), `014_interactive_portal.sql` (may have related policies), and any migration touching `modules`, `lessons`, `enrollments`, or `user_profiles`. Note exactly which policies allow Module 7 access and what needs to change.

- [x] Check `docs/` for Module 7 references. 23 hits: 12 REFERENCE-DOC (CHANGELOG, README), 10 INSTRUCTIONAL (CONTENT-BLOCKS, GETTING-STARTED, stripe plans/specs), 1 MARKETING (lock wall copy in stripe plan). All handoffs clean. Look in `docs/handoffs/`, `docs/superpowers/`, `docs/plans/`. These are reference documents, not runtime code, but they may contain context on the original free preview decision. Note what needs updating for consistency.

- [x] Check CLAUDE.md files + .claude/ agents/plugins. 50 hits total: 22 INSTRUCTIONAL (actively train AI behavior), 19 TEMPLATE (reproduced in outputs), 9 REFERENCE. Critical: funnel-architecture.md (10 hits, shared by all 6 marketing agents), security-auditor.md (5), code-reviewer.md (1), root CLAUDE.md (2).

- [x] Check lesson content_json for self-referential "free preview" mentions. CLEAN — zero student-facing content references preview/free. Only SQL dev comments (002:2, 002:11, 005:4, seed:430). All content_json blocks are preview-agnostic. Grep `supabase/migrations/002_module7_preview.sql`, `003_module7_full_content.sql`, `005_module7_4_intimacy.sql`, `006_module7_4_revised.sql` for any text block content that says "free preview", "this preview", "try before you buy", "sample module", or similar phrases that would read wrong once Module 7 is locked. Note the specific blocks and lesson IDs that need content updates.

- [x] Check configuration / environment / constants. CLEAN — zero hits in constants.js, courses.js, useCourseData.js, vercel.json, package.json, .env.example, tailwind.config.js, vite.config.js. Data layer is fully generic; all is_preview logic is UI-layer only. Inspect `src/lib/constants.js`, `src/lib/courses.js`, any JSON config files, `vercel.json`, `package.json`, and `.env.example` for hardcoded Module 7 references.

- [x] Write a comprehensive findings report to `.dispatch/tasks/module7-free-audit/output.md`. 10-section report with executive summary, all findings by category, cascade analysis, 5 replacement hook options, and 9 open questions for Chase. Structure the report as:
  1. **Executive summary** (count of hits by category, urgency tiers)
  2. **Marketing pages** — every file:line with the exact quote and suggested action
  3. **Email templates** — every file:line with the exact quote and suggested action
  4. **Portal UI / frontend code** — every file:line, exact quote, suggested action
  5. **API routes and backend** — every file:line
  6. **Database migrations / RLS** — exact policy names and what they grant
  7. **Content (lesson blocks)** — lesson IDs + block contents needing update
  8. **Docs / CLAUDE.md** — reference documentation that needs updating
  9. **Suggested replacement hook options** — 3-5 candidate replacement offers that could replace "Module 7 free" as the lead magnet (e.g., Spark Challenge, Rescue Kit, 90-Second Wave PDF, first lesson of Module 1). For each option, note which marketing locations it would fit naturally.
  10. **Open questions for Chase** — anything the audit couldn't definitively categorize and needs Chase's judgment.

- [x] Touch `.dispatch/tasks/module7-free-audit/ipc/.done` to mark completion.
