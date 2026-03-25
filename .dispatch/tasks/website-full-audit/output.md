# Healing Hearts Website — Full Audit Report
**Date:** 2026-03-23
**Auditor:** Claude Opus 4.6 (dispatched agent)
**Codebase:** React 19 + Vite 7 + Tailwind 3 + Supabase + Vercel
**Live URL:** https://healingheartscourse.com

---

## Executive Summary

| Category | Score | Key Finding |
|----------|-------|-------------|
| Build & Infra | **B+** | Builds clean but 857KB single-chunk bundle needs code-splitting |
| Code Quality | **B** | 17 lint errors (all fixable), 9 dead code files (46.8KB waste) |
| Buttons & Links | **B+** | Most previous broken CTAs fixed via /coming-soon. Resources.jsx still has 11 inert buttons |
| Forms | **A** | All forms work with proper loading/success/error states. Spark + Contact APIs functional |
| Content | **A-** | 4 banned terms remain ("exercise" x3, "triggered" x1). 2 placeholder images. Email domain consistent |
| Assets | **A** | All image paths valid. All alt text present. 4 unused files in public/ |
| SEO | **D** | Only 1/20 pages has custom meta. No robots.txt, no sitemap, no JSON-LD |
| Security | **B-** | Auth + RLS solid. Missing: security headers, rate limiting, key rotation |
| Portal | **A-** | 2 placeholder buttons (PDF download, audio play). Everything else is production-ready |
| Performance | **C+** | No code splitting, no React.memo. GSAP cleanup is excellent |

**Overall Grade: B**
The site is functionally solid and visually polished. The biggest gaps are SEO (critical for discoverability), bundle performance (857KB initial load), and a handful of remaining broken CTAs on the Resources page.

---

## Critical Issues (Fix Before Expo — April 10)

### 1. SEO — 19 Pages Have No Custom Meta Tags
**Impact:** Search engines see identical title/description for every page. Massive SEO penalty.
**Details:** Only SparkChallenge.jsx sets `document.title` + meta description. All other pages inherit the index.html defaults.
**Fix:** Add a `usePageMeta(title, description)` hook and call it from every page component. Create `robots.txt` and `sitemap.xml` in `public/`.

### 2. Resources Page — 11 Broken CTAs
**Impact:** 4 download buttons, 6 article cards, and "Load More Articles" all do nothing when clicked.
**Details:** Buttons have no `onClick` handlers. Article cards have `cursor-pointer` styling but no navigation.
**Fix:** Either wire up real functionality or redirect to `/coming-soon` (consistent with how other placeholder CTAs were fixed).

### 3. Banned Terminology — 4 Instances
**Impact:** Brand voice inconsistency. "Exercise" and "triggered" are banned per HH guidelines.
**Files & fixes:**
- `SparkChallenge.jsx:76` — "our exercises" → "our practices"
- `SparkChallenge.jsx:81` — "Each exercise takes" → "Each practice takes"
- `Team.jsx:276` — "One exercise per day" → "One practice per day"
- `About.jsx:166` — "triggered Jeff's impulse" → "activated Jeff's impulse"

### 4. Placeholder Images — 2 picsum.photos URLs
**Impact:** External placeholder service images on production pages.
**Files:**
- `SparkChallenge.jsx:237` — Hero couple image (picsum.photos/seed/spark-hero-couple)
- `About.jsx:134` — Jeff & Trisha portrait (picsum.photos/seed/jeff-trisha-portrait)
**Fix:** Replace with real photography from `/public/images/`.

---

## High Priority (Fix Soon)

### 5. Bundle Size — 857KB Single Chunk
**Impact:** Slow initial page load, especially on mobile.
**Root cause:** All 43 route components statically imported. No `React.lazy()` or dynamic imports.
**Fix:** Implement route-based code splitting in App.jsx. Expected improvement: initial load → ~400KB, remainder loaded on navigation.

### 6. Security Headers Missing
**Impact:** Vulnerable to clickjacking, MIME sniffing, protocol downgrade attacks.
**Missing from vercel.json:** Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, Strict-Transport-Security, Referrer-Policy.
**Fix:** Add headers block to vercel.json.

### 7. No Rate Limiting on API Endpoints
**Impact:** `/api/spark-signup` and `/api/contact` are unprotected against abuse.
**Fix:** Add rate limiting via Vercel Edge Middleware or Upstash Ratelimit.

### 8. Contact Page — Missing Anchor ID
**Impact:** `<a href="#contact-form">` link doesn't scroll to form section (no matching `id` attribute).
**Fix:** Add `id="contact-form"` to the ContactForm section wrapper in Contact.jsx.

### 9. 17 ESLint Errors
**Impact:** Code quality, CI/CD noise.
**Breakdown:**
- 4x unused forEach index parameter (Contact, PhysicianMarriages, Resources, Tools)
- 1x unused `navigate` import (Signup.jsx)
- 1x unused `id` param (Team.jsx)
- 1x unused `course` prop (ModuleOverview.jsx)
- 1x unused `totalModules` var (PortalDashboard.jsx)
- 1x unused `Icon` destructure (PortalDashboard.jsx)
- 1x react-refresh/only-export-components (AuthContext.jsx)
**Fix:** All are safe 1-line fixes (remove unused vars or prefix with `_`).

---

## Medium Priority

### 10. Dead Code — 9 Unused Files (46.8KB)
**Files safe to delete:**
- `src/components/Navbar.jsx` (2.6KB) — standalone, unused (real navbar is in Layout.jsx)
- `src/components/Hero.jsx` (3.0KB)
- `src/components/Features.jsx` (8.6KB)
- `src/components/Philosophy.jsx` (3.0KB)
- `src/components/Pricing.jsx` (2.5KB)
- `src/components/Protocol.jsx` (5.6KB)
- `src/components/AdminRoute.jsx` (806B) — ProtectedRoute.jsx is the one actually used
- `src/LandingPage.jsx` (19KB) — old landing page, not mounted in App.jsx
- `src/components/PillarsRedesign.jsx` (9.1KB) — only imported by dead LandingPage

### 11. Portal Placeholder Buttons
**Impact:** Users see non-functional "Download PDF" and "Play Audio" buttons in ModuleOverview.
**Fix:** Either implement functionality or hide with `display: none` / conditional rendering.

### 12. Orphan Routes — No Inbound Links
**Routes with no navigation links pointing to them:** `/frameworks`, `/testimonials`, `/faq`
**Fix:** Add to navbar, footer, or contextual links on relevant pages.

### 13. Navbar Scroll Performance
**Impact:** `setIsScrolled` and `setIsVisible` called on every scroll event (~60/sec).
**Fix:** Throttle the scroll handler to fire at most every 100ms using requestAnimationFrame or a throttle utility.

### 14. Inline Data Arrays in Render
**Impact:** Arrays in Home.jsx, Programs.jsx, Team.jsx recreated every render, causing unnecessary child re-renders.
**Fix:** Move static data arrays outside component functions or wrap in `useMemo`.

### 15. Unused Public Assets
**Files in public/ not referenced by any JSX:**
- `ai-hub-avatar.png`
- `phedris-avatar-256.png`
- `phedris-avatar.png`
- `vite.svg`
**Fix:** Remove or document their purpose.

---

## Low Priority / Nice to Have

### 16. OG Image Uses External Placeholder
The `og:image` in index.html uses an Unsplash placeholder URL. Should be replaced with a branded image hosted on the domain.

### 17. No Structured Data (JSON-LD)
Missing schema markup for: Organization, Course, FAQPage, BreadcrumbList. Especially valuable for SEO given the course/coaching nature of the business.

### 18. Supabase Anon Key in Git History
The `.env` file is properly gitignored, but the anon key may exist in earlier commits. Consider rotating the key in the Supabase dashboard. The anon key is designed for client-side use with RLS, so exposure risk is low — but rotating is best practice.

### 19. Migrate GSAP to @gsap/react useGSAP Hook
Current manual `gsap.context()` + `ctx.revert()` pattern works perfectly and has no memory leaks. The `useGSAP` hook is a cleaner API but functionally equivalent.

### 20. No React.memo Anywhere
No components use `React.memo`. Portal components (useCourseData, LessonView) already use `useMemo`/`useCallback` well. Marketing pages would benefit from `React.memo` on expensive sub-components.

---

## What's Working Well

- **Auth flow** — Login (password + magic link), signup, forgot/reset password all complete with proper error handling
- **Course portal** — All 9 block types render, optimistic progress updates, sub-lesson hierarchy, responsive sidebar
- **GSAP animations** — Proper cleanup on every component, reduced motion respected, ScrollTrigger integration solid
- **Email forms** — Both Spark signup and Contact form have working API endpoints with Resend, proper validation, and graceful fallbacks
- **Content quality** — Module 7 preview has rich, real content (not placeholder). 8 modules fully seeded
- **Design system** — Scoria components (TeardropImage, MagneticButton, TealQuoteBlock, DailyBreakdownGrid) used consistently
- **RLS policies** — Defense in depth: access gated at both database (RLS) and UI (is_preview flag) layers
- **Email consistency** — All references use `hello@healingheartscourse.com`
- **Image alt text** — 100% coverage with meaningful descriptions
- **Routing** — All 27 routes valid. Previously broken /admin now → ComingSoon. SPA rewrites correct

---

## Fix Priority for Be Healthy Expo (April 10)

| Priority | Item | Effort | Impact |
|----------|------|--------|--------|
| **P0** | Fix 4 banned terms | 10 min | Brand voice |
| **P0** | Replace 2 placeholder images | 30 min | Visual credibility |
| **P0** | Fix Resources.jsx 11 broken CTAs | 30 min | User trust |
| **P1** | Add page-specific meta tags | 2 hr | SEO |
| **P1** | Fix 17 lint errors | 30 min | Code quality |
| **P1** | Add robots.txt + sitemap.xml | 30 min | SEO |
| **P1** | Add security headers to vercel.json | 30 min | Security |
| **P2** | Implement code splitting | 2-3 hr | Performance |
| **P2** | Delete 9 dead code files | 10 min | Cleanliness |
| **P2** | Add #contact-form id | 5 min | UX |
| **P3** | Rate limiting on APIs | 1-2 hr | Security |
| **P3** | Hide/implement portal placeholder buttons | 30 min | UX |
| **P3** | Throttle navbar scroll handler | 30 min | Performance |

---

## Files Audited

**Pages (21):** Home, About, Programs, Tools, Frameworks, PhysicianMarriages, Physicians, Resources, Contact, Testimonials, FAQ, Team, SparkChallenge, CourseOverview, ComingSoon, Login, Signup, ForgotPassword, ResetPassword, Terms, Privacy

**Components (11):** Layout, Navbar (dead), Hero (dead), Features (dead), Philosophy (dead), Pricing (dead), Protocol (dead), AdminRoute (dead), PillarsRedesign (dead), ProtectedRoute, LessonContent

**Portal (4):** CoursePortal, ModuleOverview, PortalDashboard, LessonView

**Data/Context (4):** AuthContext, supabase.js, courses.js, useCourseData.js

**API (2):** api/spark-signup.js, api/contact.js

**Config (4):** App.jsx, vercel.json, package.json, index.html

**Migrations (6):** 001-006 + seed.sql

**Total: 52 files audited across 28 checklist items**
