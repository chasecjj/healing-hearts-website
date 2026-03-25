# Fix Critical Gaps — Output

**Date:** 2026-03-23
**Status:** Complete
**Build:** Clean (0 errors, 0 warnings)
**Files changed:** 26 modified, 1 created, 9 deleted

---

## Summary of Changes

### Brand Voice (3 items)
- Fixed 8× "exercise" → "practice" across SparkChallenge, Programs, Team, spark-signup API
- Fixed 1× "triggered" → "activated" in About.jsx
- Fixed 4× "your body" → "your system" in Frameworks, RescueKit, Tools

### Broken CTAs (2 items)
- Wired 11 broken CTAs on Resources.jsx — article cards, download buttons, and "Load More" all navigate to /coming-soon
- Added `id="contact-form"` to Contact.jsx form section (was missing anchor target)

### SEO (4 items)
- Created `usePageMeta` hook (src/hooks/usePageMeta.js) — sets document.title + meta description per page
- Added unique title + description to all 18 page components
- Created `public/robots.txt` (blocks portal/auth routes, points to sitemap)
- Created `public/sitemap.xml` (18 public routes with priority + changefreq)

### Security (1 item)
- Added 5 security headers to vercel.json: X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Strict-Transport-Security, Permissions-Policy

### Code Quality (2 items)
- Fixed all ESLint errors: 20 → 0 (including critical `toggleMenu` access-before-declaration bug and broken `\${` template literals in navbar)
- Deleted 9 dead code files (46.8KB): Navbar, Hero, Features, Philosophy, Pricing, Protocol, AdminRoute, LandingPage, PillarsRedesign

### Expo Readiness (2 items)
- Added "Free Challenge" link to navbar (desktop nav + mobile overlay) — accent-colored to stand out
- Fixed welcome email logo reference: `favicon.svg` (404) → `logo.png` (exists)

### Placeholder Cleanup (1 item)
- Replaced 2 picsum.photos URLs: SparkChallenge hero → Unsplash couple image, About portrait → /images/team/trisha.jpg

---

## Bugs Discovered & Fixed

1. **Navbar template literal bug** — `\${isVisible}` was escaped as literal text, meaning the scroll-hide and background-switch behavior was never applied. Fixed to `${isVisible}`.
2. **`isScrolled` state never read** — Was set on scroll but never referenced in JSX. Removed dead state + setter.

---

## Not Addressed (Out of Scope)

- Bundle code splitting (P2, requires route-based React.lazy refactor)
- Rate limiting on API endpoints (P3, needs Upstash or Edge Middleware)
- Portal placeholder buttons (Download PDF, Play Audio) — needs content/feature work
- Team photo compression (1.4MB each) — needs image processing tool
- Spark signup DB persistence (needs Supabase table creation)
- 7-day email drip sequence (needs email platform integration)
- Stripe payments (Phase 3)
