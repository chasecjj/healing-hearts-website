# Changelog

All notable changes to the Healing Hearts Website are documented here.

## [2026-03-12] Sub-Lesson Feature + Module 7.4 Content

### Added
- **Sub-lesson navigation** -- lessons can now have child sections that nest under a parent in the sidebar
  - Parent lessons show an expand/collapse chevron
  - Child lessons render indented with a vertical connector line
  - Auto-expands when navigating to a child lesson
- **Module 7.4: The Path to True Intimacy** -- full curriculum from Jeff & Trisha (374 content blocks)
  - Parent hub lesson with learning objectives and section overview (~8 min)
  - Child 1: Foundations & Safety -- trust, commitment, SPARK tool, sliding door moments, healing betrayal trauma (~35 min, 118 blocks)
  - Child 2: The Connection Layers -- verbal, emotional, and intellectual intimacy, Costco story (~25 min, 66 blocks)
  - Child 3: Spiritual & Physical Intimacy -- scripture, co-regulation, Morning Anchor, dual control model (~25 min, 82 blocks)
  - Child 4: Sexual Connection & Action Plan -- altruistic pleasure, pornography discussion, weekly maintenance, appendix worksheets (~25 min, 93 blocks)
- **Breadcrumb header** for sub-lessons showing parent lesson context (e.g., `Module 7 · 7.4 The Path to True Intimacy · Foundations & Safety`)
- Migration 004: `parent_lesson_id` column on `lessons` table (self-referencing FK)
- Migration 005: 5 lesson INSERTs with full content_json
- Seed data updated with 7.4 placeholder entries

### Technical Notes
- No changes needed to `courses.js`, `useCourseData.js`, `LessonContent.jsx`, or `App.jsx`
- Prev/Next navigation works automatically (flat `allLessons` array sorted by `sort_order`)
- Progress tracking works automatically (each lesson is independently completable)
- Build size: ~692KB (minimal increase from UI changes; content lives in DB)

---

## [2026-03-09] Module 7.3 Full Content + Trisha's Revisions

### Added
- Full 7.3 curriculum: "From Letting Go to Living Free" (130 blocks, ~40 min)
- Trisha's revisions integrated (BTEA cycle, attachment styles, RAS, emotional processing exercises)

### Fixed
- "Return to Site" button now navigates correctly from portal

---

## [2026-03-08] Portal UI Polish

### Added
- Module numbers displayed in sidebar lesson list (e.g., "7.1 -- Identifying Core Wounds")

### Fixed
- Lesson navigation between modules
- Mobile black square artifact on homepage navbar
- Menu overflow on mobile viewports

---

## [2026-03-07] Email Verification UX

### Fixed
- Improved email verification flow for signup and login
- Better error messaging for unverified accounts

---

## [2026-03-06] Desirae Onboarding Package

### Added
- `docs/onboarding/ANTIGRAVITY-GUIDE.md` -- Antigravity IDE setup guide
- `docs/onboarding/GEMINI-PROMPTS.md` -- ~25 prompts for Gemini assistant
- `docs/onboarding/VIKUNJA-QUICKSTART.md` -- Task management quickstart
- `GEMINI.md` -- Project context file for Antigravity's Gemini assistant

---

## [2026-03-04] Course Portal (Phase 2)

### Added
- Course portal with URL-driven state (`/portal/:moduleSlug/:lessonSlug`)
- Module 7 free preview with 3 lessons (placeholder content)
- Content rendering engine with 9 block types (heading, subheading, text, bold_text, callout, exercise, quote, list, divider)
- User progress tracking with optimistic updates
- Sidebar navigation with module progress bars
- Prev/Next lesson navigation
- Migration 002: Module 7 preview data
- Migration 003: Full Module 7 content (7.1, 7.2, 7.3)

---

## [2026-03-01] Authentication (Phase 1)

### Added
- Supabase authentication (email + magic link + password reset)
- Login, Signup, ForgotPassword, ResetPassword pages
- Protected routes with `ProtectedRoute` component
- Auth context provider wrapping Supabase auth
- Migration 001: Initial schema (9 tables + RLS)
- `.env.example` and `CLAUDE.md` project docs

---

## [2026-02-28] Initial Launch (Phase 0)

### Added
- 13 marketing pages (Home, About, Programs, Testimonials, FAQ, Contact, etc.)
- Terms & Conditions and Privacy Policy pages
- Responsive design with Tailwind CSS
- GSAP scroll animations
- Vercel deployment with SPA routing
