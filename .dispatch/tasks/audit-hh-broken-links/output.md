# Healing Hearts Website — Broken Functionality Audit
Date: 2026-03-23

---

## Summary

| Severity | Count |
|----------|-------|
| BROKEN | 14 |
| PLACEHOLDER | 9 |
| MISSING | 3 |

---

## Full Findings Table

| Page | Element | Issue | Severity |
|------|---------|-------|----------|
| **Navbar (Layout.jsx)** | `Link to="/admin"` | `/admin` route does not exist in App.jsx. Clicking "Admin" for admin users navigates to a non-existent route, which falls through to the `*` catch-all and redirects to `/`. | BROKEN |
| **Navbar (Layout.jsx)** | `href="mailto:hello@healingheartscoaching.com"` | Uses `@healingheartscoaching.com` domain. Check: is the real email `@healingheartscoaching.com` or `@healingheartscoating.com`? Inconsistent across pages (see Contact). | PLACEHOLDER |
| **LandingPage.jsx (unused)** | "Start Healing" `MagneticButton` | No `onClick`, no Link wrapper. Clicking does nothing. This entire file appears to be the old landing page — not mounted in App.jsx. | BROKEN |
| **LandingPage.jsx (unused)** | "Watch Our Free Masterclass" `MagneticButton` | No `onClick`, no Link. Dead button. | BROKEN |
| **LandingPage.jsx (unused)** | "Member Login" button calls `onLogin` | `onLogin` prop is undefined — LandingPage is not rendered anywhere in App.jsx routes. File is dead code. | MISSING |
| **LandingPage.jsx (unused)** | Footer `href="#"` links (Programs, About, Physician Marriages, Privacy Policy, Terms of Service) | All 5 footer links are `href="#"` — they scroll to the top and go nowhere. | BROKEN |
| **Home.jsx — ProgramsTeaser** | "Get the Rescue Kit" `MagneticButton` | `MagneticButton` has no `onClick` and is not wrapped in a `Link`. Clicking does nothing. No route or purchase flow attached. | BROKEN |
| **Home.jsx — ProgramsTeaser** | "Apply for the Journey" `MagneticButton` | Same issue — no `onClick`, no Link. Dead CTA on the most prominent card. | BROKEN |
| **Programs.jsx — FlagshipProgram** | "Enroll in the Full Program" `MagneticButton` | `onClick={() => {}}` — explicitly empty handler. Stripe Phase 3 not built. Clicking does nothing. | BROKEN |
| **Programs.jsx — StandalonePackages** | "View Details" `<button>` (on each of 5 package cards) | `onClick={() => {}}` — empty handler on all 5 cards. No destination, no modal, no route. | BROKEN |
| **Programs.jsx — ClosingCta** | "Enroll in the Full Program" `MagneticButton` | `onClick={() => {}}` — empty handler. | BROKEN |
| **Programs.jsx — ClosingCta** | "Talk to Us First" `<button>` | `onClick={() => {}}` — empty handler. Should logically link to `/contact` but doesn't. | BROKEN |
| **PhysicianMarriages.jsx** | "Learn About the Physician Track" `MagneticButton` | No `onClick`, no Link wrapper. Dead CTA. | BROKEN |
| **Resources.jsx — Downloads** | Download button (4 items: 90-Second Wave, Connection Map, Know Your Blueprint, SPARK Pact) | `<button>` with no `onClick`. No file download URL attached. None of the 4 downloadable resources actually download anything. | PLACEHOLDER |
| **Resources.jsx — Articles** | Article cards (6 items) — "Read Article" | Cards are `cursor-pointer` and styled as links, but have no `onClick`, no `Link`, no `href`. Clicking an article does nothing. | PLACEHOLDER |
| **Resources.jsx — "Load More Articles"** | `MagneticButton` | No `onClick`. Dead button — there is no pagination or additional content. | PLACEHOLDER |
| **SparkChallenge.jsx — Email form** | `handleSubmit` POSTs to `/api/spark-signup` | The catch block has a comment: `// Handler not built yet`. Form submits silently on success AND on failure — user gets no confirmation message either way. The form action attribute (`action="/api/spark-signup"`) is redundant when `onSubmit` calls `e.preventDefault()`. | BROKEN |
| **Contact.jsx — ContactForm** | `MagneticButton` (Send Message) | The submit button is a `MagneticButton` inside the `<form>`, but `MagneticButton` renders a `<button>` without `type="submit"`. The form's `onSubmit` handler IS wired correctly, but if the button doesn't have `type="submit"` explicitly, behavior depends on browser defaults. Technically works in most browsers but is fragile. | PLACEHOLDER |
| **Contact.jsx — "Get a Free Download"** | `<a href="#contact-form">` | The Contact page has no element with `id="contact-form"`. The section anchor is around the `<ContactForm />` but there's no matching `id`. Clicking scrolls to top rather than the form section. | BROKEN |
| **Portal — ModuleOverview.jsx** | "Download PDF" button (Reflection Journal) | `<button>` with no `onClick` and no download URL. Decorative placeholder. | PLACEHOLDER |
| **Portal — ModuleOverview.jsx** | "Play Audio" button (Grounding Meditation) | `<button>` with no `onClick` and no audio source. Decorative placeholder. | PLACEHOLDER |
| **Portal — PortalDashboard.jsx** | "Update your focus / How do you feel?" input area | Styled as a clickable input (`cursor-pointer`) but has no `onClick` handler. Clicking does nothing. Placeholder UI with no backend. | PLACEHOLDER |
| **Team.jsx** | Team photos: `/images/team/trisha.jpg` and `/images/team/chase.jpg` | These local image paths don't exist in the `public/` directory (no `images/team/` folder). Both will render broken images. Makayla has `photo={null}` which correctly shows a placeholder icon. | BROKEN |
| **CourseOverview.jsx** | "Full access coming soon" note | Copy says "Full access coming soon" for non-preview modules. Acceptable UX note but is a PLACEHOLDER for gated modules 1–6 and the final module. | PLACEHOLDER |

---

## Route Validity Check

All routes defined in App.jsx:

| Route | Component | Status |
|-------|-----------|--------|
| `/` | Home | OK |
| `/about` | About | OK |
| `/programs` | Programs | OK |
| `/tools` | Tools | OK |
| `/frameworks` | Frameworks | OK |
| `/physician` | PhysicianMarriages | OK |
| `/physicians` | Physicians | OK |
| `/resources` | Resources | OK |
| `/contact` | Contact | OK |
| `/testimonials` | Testimonials | OK |
| `/faq` | FAQ | OK |
| `/terms` | Terms | OK |
| `/privacy` | Privacy | OK |
| `/course` | CourseOverview | OK |
| `/spark-challenge` | SparkChallenge | OK |
| `/team` | Team | OK |
| `/login` | Login | OK |
| `/signup` | Signup | OK |
| `/forgot-password` | ForgotPassword | OK |
| `/reset-password` | ResetPassword | OK |
| `/portal` | CoursePortal (protected) | OK |
| `/portal/:moduleSlug` | CoursePortal (protected) | OK |
| `/portal/:moduleSlug/:lessonSlug` | CoursePortal (protected) | OK |
| `/admin` | **NOT DEFINED** | BROKEN — linked from Navbar for admin users |

---

## Navbar Coverage Check

The main Navbar (in Layout.jsx) links to: `/`, `/about`, `/programs`, `/tools`, `/physician`, `/resources`, `/contact`, `/portal`, `/login`

The hamburger overlay also links to `/admin` (for admins).

**Missing from Navbar:** `/frameworks`, `/physicians`, `/testimonials`, `/team`, `/spark-challenge`, `/faq`, `/course`

Note: There is also a second unused `Navbar.jsx` component (not the one in Layout.jsx) that links to `/about`, `/programs`, `/frameworks`, `/physicians`, `/testimonials`, and has a "Get Started" button that goes to `/contact`. This component is imported nowhere in App.jsx and is dead code.

---

## Email Address Inconsistency

The contact email is referenced in multiple places:
- **Navbar (Layout.jsx):** `hello@healingheartscoaching.com`
- **Contact.jsx:** `hello@healingheartscoaching.com`
- **Privacy.jsx:** `hello@healingheartscoaching.com`

All references are consistent using `hello@healingheartscoaching.com`. No mismatches found, but the domain `healingheartscoaching.com` should be verified — the website's live domain is `healingheartscourse.com`.

---

## Priority Fix List (Ranked by User Impact)

1. **`/admin` route** — Admin users get silently redirected to `/`. Either add an AdminRoute component and page, or remove the admin links from the Navbar.
2. **Programs page CTAs** — 4 dead buttons ("Enroll in Full Program" x2, "View Details" x5, "Talk to Us First"). These are the highest-traffic conversion points. At minimum, route to `/contact`.
3. **Spark Challenge email form** — Silent on success and failure. No confirmation state shown to the user. Needs either a working API or a visible fallback mailto.
4. **Home page ProgramsTeaser CTAs** — "Get the Rescue Kit" and "Apply for the Journey" do nothing. Should link to `/programs` or `/contact`.
5. **PhysicianMarriages.jsx CTA** — "Learn About the Physician Track" does nothing. Should link to `/contact`.
6. **Team photos** — `/images/team/trisha.jpg` and `/images/team/chase.jpg` are 404s.
7. **Contact page anchor** — `#contact-form` anchor link goes nowhere; no matching `id` exists.
8. **Resources downloads + articles** — 4 download buttons and 6 article cards are all inert. Expected: download links or modal with PDF, and article detail pages or external links.
9. **Portal resources** — "Download PDF" and "Play Audio" are decorative buttons with no files attached.
10. **LandingPage.jsx** — Entire file is dead code (not mounted in App.jsx). Should be either deleted or integrated.
