# Healing Hearts Website — CLAUDE.md

## Stack

- React 19 + Vite 7 + Tailwind CSS 3 + GSAP (scroll animations)
- Supabase: auth (email + magic link + password reset) + PostgreSQL + Row Level Security
- Vercel: auto-deploy on push to master
- Icons: Lucide React
- Routing: react-router-dom v7 (BrowserRouter)
- Design system: Scoria (`@scoria/ui` 23 components, `@scoria/config`) via npm tarballs in `vendor/`
- Design direction: Organic Flow — teardrop image masks, organic wave dividers, teal quote sections, Cormorant Garamond serif italic headlines

## Commands

```bash
npm install        # Install dependencies
npm run dev        # Dev server at http://localhost:5173
npm run build      # Production build (~686KB)
npm run preview    # Preview production build
npm run lint       # ESLint
```

## Environment Variables

```
VITE_SUPABASE_URL=https://qleojrlqnbiutyhfnqgb.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key from Supabase dashboard>
```

Supabase project ID: `qleojrlqnbiutyhfnqgb`

## Architecture

### Auth Flow
1. `src/contexts/AuthContext.jsx` — React context wrapping Supabase auth, provides `user`, `signIn`, `signUp`, `signOut`, `resetPassword`
2. `src/components/ProtectedRoute.jsx` — Redirects unauthenticated users to `/login`
3. `src/lib/supabase.js` — Supabase client singleton
4. Auth pages: Login, Signup, ForgotPassword, ResetPassword (standalone, no Layout wrapper)

### Course Portal (Phase 2)
- **URL-driven state:** Routes are `/portal`, `/portal/:moduleSlug`, `/portal/:moduleSlug/:lessonSlug` — all use `useParams()` for navigation
- **Data layer:** `src/lib/courses.js` queries Supabase for course content + user progress
- **React hook:** `src/hooks/useCourseData.js` — one-time fetch with cache, optimistic progress updates (revert on failure)
- **Content format:** Lessons store content as `content_json` JSONB column with typed block arrays:
  - Block types: `heading`, `subheading`, `text`, `bold_text`, `callout`, `exercise`, `quote`, `list`, `divider`, `reflection`, `video`, `audio`
  - Rendered by `src/components/LessonContent.jsx` using a BLOCK_COMPONENTS registry pattern
- **Access control:** Module access is enrollment-gated via the `lessons_read` RLS policy (active enrollment OR admin role). The `is_preview` flag exists in the schema but is currently set to `false` on all modules — do not reintroduce `is_preview=true` without an explicit product decision. The free lead magnet is the 7-Day Spark Challenge email course at `/spark-challenge`, not an in-portal preview.
- **Progress:** `lesson_progress` table tracks lesson completion per user. Optimistic toggle with server sync.

### Marketing Site
- 14+ marketing pages wrapped in `Layout` (Navbar + Footer) — includes Spark Challenge
- 4 auth pages (standalone, no Layout)
- 3 portal routes (protected)
- Fallback: all unknown routes → `/`

## Key Files

### Auth (Phase 1)
- `src/contexts/AuthContext.jsx` — Auth provider
- `src/lib/supabase.js` — Supabase client
- `src/components/ProtectedRoute.jsx` — Route guard
- `supabase/migrations/001_initial_schema.sql` — DB schema (9 tables + RLS)

### Portal (Phase 2)
- `src/CoursePortal.jsx` — Portal shell (sidebar + lesson viewer)
- `src/lib/courses.js` — Supabase query functions
- `src/hooks/useCourseData.js` — Data hook with caching
- `src/components/LessonContent.jsx` — Block renderer (9 types)
- `src/pages/CourseOverview.jsx` — Public course landing page
- `supabase/migrations/002_module7_preview.sql` — Module 7 preview data
- `supabase/seed.sql` — Full seed data (all modules + lessons)

### Marketing
- `src/App.jsx` — Router with all routes
- `src/components/Layout.jsx` — Navbar + Footer wrapper
- `src/pages/*.jsx` — 13 marketing pages
- `tailwind.config.js` — Brand colors + typography tokens

## Content Format

Lesson content is stored as JSONB in the `content_json` column of the `lessons` table:

```json
[
  { "type": "heading", "text": "Section Title" },
  { "type": "text", "text": "Paragraph content..." },
  { "type": "callout", "text": "Important note", "style": "info" },
  { "type": "exercise", "title": "Try This", "text": "Instructions..." },
  { "type": "list", "items": ["Item 1", "Item 2"], "ordered": false }
]
```

Do NOT use `dangerouslySetInnerHTML`. All content is rendered as pure React components.

## Build Pipeline

New pages and major redesigns use the **Forge Lite pipeline** from Scoria.

### Scoria Design System
- **Components:** @scoria/ui (23 components) installed via vendor tarballs in `vendor/`
- **Design tokens:** `C:/Users/chase/Documents/scoria/design/DESIGN.md` (single source of truth)
- **Available components:** HeroSection, TeardropImage, OrganicDivider, TealQuoteBlock, DailyBreakdownGrid, FAQAccordion, TestimonialCard, PricingCard, ModuleCard, Input, Button, Card + more

### Forge Lite (Page Building)
- **Location:** `C:/Users/chase/Documents/scoria/skills/scoria-build/SKILL.md`
- **Use for:** Any new page or major page redesign
- **NOT for:** Small copy changes, bug fixes, minor style tweaks
- **Pipeline:** Intent → Explore (Stitch variants) → Build → Validate → Deploy
- **Validation gates:** Lighthouse (Perf ≥70, A11y ≥90, SEO ≥80), axe-core, token compliance

### Taste-Skill (Design Quality)
- **Location:** `C:/Users/chase/Documents/scoria/design/taste/`
- **Loaded by:** Forge Build-Execute stage automatically
- **HH defaults:** DESIGN_VARIANCE=7, MOTION_INTENSITY=5, VISUAL_DENSITY=4
- **Key rules:** No Inter font, no centered heroes on landing pages, no 3-col equal grids, no pure black, no AI copywriting cliches

### Invocation
```
# New page
Invoke Forge Lite pipeline with page description

# Redesign existing page
Read scoria/skills/scoria-build/SKILL.md for --iterate and --modify flags

# Validate existing page
Read scoria/skills/scoria-build/SKILL.md for --validate-only flag
```

## Deployment

- **Vercel auto-deploy:** Push to `master` triggers build + deploy
- **Live URL:** https://healingheartscourse.com (Cloudflare → Vercel, also https://healing-hearts-olive.vercel.app)
- **Build:** `npm run build` produces static files in `dist/`
- **Routing:** `vercel.json` has rewrites for SPA client-side routing

## Database

- 9 tables: users (Supabase auth), courses, modules, lessons, enrollments, user_progress, payments, coupons, coupon_usage
- Row Level Security on all tables
- Module access gated by enrollment (active row in `enrollments` table for the course) or admin role, enforced via RLS on the `lessons` table. The `is_preview` flag exists but is `false` on all modules — legacy of the former Module 7 free preview; see migration 021.

## Phase Status

| Phase | Status |
|-------|--------|
| Phase 0 — Vercel marketing site | Done |
| Phase 1 — Supabase auth | Done |
| Phase 2 — Course portal + real content | Done |
| Phase 2.5 — Module 7 full content + sub-lessons | Done |
| Phase 2.6 — Organic Flow redesign (Scoria + Forge Lite) | Done (Session 60) |
| Phase 2.7 — Interactive Portal (intentions, notes, journal, audio) | Done |
| Phase 2.8 — Video Integration (Mux player, video-first layout) | Done |
| Phase 3 — Stripe payments (dual-mode test/live, Checkout Sessions + webhooks) | **Done (LIVE, Session 105, 2026-04-15)** |
| Phase 3.5 — Webhook hardening (secret fallback, `findAuthUserIdByEmail()`, `collectEnrollmentGrants()` multi-grant) | **Done (commit `2dc1549`, deploy `dpl_5MQx8UcqMaR8PP5MJsZkeADfe6v1`)** |
| Phase 4 — React Native mobile app | Planned |

### Stripe Webhook Notes (Phase 3.5)

- `STRIPE_WEBHOOK_SECRET` is set in Vercel Production. Missing secret returns 200 (graceful) rather than 500 so Stripe doesn't retry-storm.
- `findAuthUserIdByEmail()` replaced broken `auth.users` PostgREST lookup. Uses service-role RPC.
- `collectEnrollmentGrants()` normalizes the single/multi-grant shape so Rescue Kit + Course purchases both resolve.
- Supabase RLS CRITICAL cleared via migration `enable_rls_on_lessons_backup_module7` (ERROR → INFO advisor).
- 17 failed webhook events from pre-hardening window need replay — outstanding task as of 2026-04-15.
