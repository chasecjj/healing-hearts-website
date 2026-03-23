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
  - Block types: `heading`, `subheading`, `text`, `bold_text`, `callout`, `exercise`, `quote`, `list`, `divider`
  - Rendered by `src/components/LessonContent.jsx` using a BLOCK_COMPONENTS registry pattern
- **Access control:** `is_preview` flag on modules gates access at both RLS policy and UI layers. Module 7 is the free preview (3 lessons).
- **Progress:** `user_progress` table tracks lesson completion per user. Optimistic toggle with server sync.

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

## Deployment

- **Vercel auto-deploy:** Push to `master` triggers build + deploy
- **Live URL:** https://healingheartscourse.com (Cloudflare → Vercel, also https://healing-hearts-olive.vercel.app)
- **Build:** `npm run build` produces static files in `dist/`
- **Routing:** `vercel.json` has rewrites for SPA client-side routing

## Database

- 9 tables: users (Supabase auth), courses, modules, lessons, enrollments, user_progress, payments, coupons, coupon_usage
- Row Level Security on all tables
- Module access gated by `is_preview` flag (true = free, false = requires enrollment)

## Phase Status

| Phase | Status |
|-------|--------|
| Phase 0 — Vercel marketing site | Done |
| Phase 1 — Supabase auth | Done |
| Phase 2 — Course portal + real content | Done |
| Phase 2.5 — Module 7 full content + sub-lessons | Done |
| Phase 2.6 — Organic Flow redesign (Scoria + Forge Lite) | Done (Session 60) |
| Phase 3 — Stripe payments | Next |
| Phase 4 — React Native mobile app | Planned |
