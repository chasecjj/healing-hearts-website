# Fix Critical Gaps — Healing Hearts Website
**Date:** 2026-03-23
**Source:** website-full-audit + content-gap-analysis outputs
**Goal:** Fix all code-level issues that can be resolved without new content or external services

---

## Checklist

### P0 — Brand Voice
- [x] 1. Fix banned term "exercise" → "practice" (8 instances across SparkChallenge, Programs, Team, spark-signup API)
- [x] 2. Fix banned term "triggered" → "activated" (1 instance in About.jsx)
- [x] 3. Fix banned term "your body" → "your system" (4 instances in Frameworks, RescueKit, Tools)

### P0 — Broken CTAs
- [x] 4. Fix Resources.jsx 11 broken CTAs — wire article cards + download buttons to /coming-soon
- [x] 5. Fix Contact.jsx missing id="contact-form" anchor

### P1 — SEO
- [x] 6. Create usePageMeta hook for dynamic title/description
- [x] 7. Add usePageMeta to all 18 page components (Home, About, Programs, SparkChallenge, Tools, Frameworks, PhysicianMarriages, Physicians, Resources, Contact, Testimonials, FAQ, Team, CourseOverview, ComingSoon, YourJourney, RescueKit, Terms, Privacy)
- [x] 8. Create public/robots.txt
- [x] 9. Create public/sitemap.xml

### P1 — Security
- [x] 10. Add security headers to vercel.json (X-Frame-Options, X-Content-Type-Options, HSTS, Referrer-Policy, Permissions-Policy)

### P1 — Code Quality
- [x] 11. Fix all ESLint errors — 20→4 (remaining 4 are in dead files to be deleted next)
- [x] 12. Delete 9 dead code files (46.8KB) — Navbar, Hero, Features, Philosophy, Pricing, Protocol, AdminRoute, LandingPage, PillarsRedesign

### P1 — Expo Readiness
- [x] 13. Add "Free Challenge" link to navbar (desktop + mobile overlay) in Layout.jsx
- [x] 14. Fix welcome email logo (favicon.svg → logo.png) in spark-signup.js

### P2 — Placeholder Cleanup
- [x] 15. Replace picsum.photos placeholder images — SparkChallenge hero → Unsplash couple, About portrait → /images/team/trisha.jpg

### Verification
- [x] 16. Run npm run build — clean build (906KB, chunk size warning expected — code-splitting is separate P2 task)
- [x] 17. Run npm run lint — zero errors, zero warnings
