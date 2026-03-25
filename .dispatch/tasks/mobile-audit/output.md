# Mobile Responsiveness Audit
**Date:** 2026-03-23
**Viewport target:** 390px (iPhone 15 Pro)
**Files audited:** `src/components/Layout.jsx` (Navbar + Footer inline) + all 23 pages in `src/pages/`

---

## Summary

| Severity | Count |
|----------|-------|
| Critical (overflow or broken layout) | 6 |
| High (too large / too tight on mobile) | 12 |
| Medium (minor sizing or missing guard) | 9 |
| Low (style only) | 4 |

---

## LAYOUT.JSX — Navbar

### ISSUE 1 — Hamburger is present but the overlay has a CSS logic bug (Critical)

**File:** `src/components/Layout.jsx` — lines 144–145

The overlay `div` has conflicting visibility logic:
```jsx
className={`menu-overlay fixed inset-0 ... \${menuOpen ? 'block' : 'hidden md:flex'}`}
style={{ display: menuOpen ? 'flex' : 'none' }}
```
The `className` tries to use `hidden`/`block` but the inline `style` always wins. When `menuOpen` is false the GSAP `transform: translate(-100%)` keeps it off screen anyway, but when `menuOpen` becomes true the GSAP animation sets `y: 0%` on `.menu-overlay` but the element was already `display: none` via the inline style — GSAP does not automatically set `display: flex` before animating. This means on first tap the overlay may flash or not appear at all until GSAP finishes.

**Fix:** Remove the inline `style` entirely. Let GSAP control visibility entirely through the transform. If you need a pre-hidden state, initialise GSAP with `display: 'flex'` in the `to()` call:

```jsx
// Remove line 145 entirely (the style prop).
// In toggleMenu → open branch, prefix with:
gsap.set('.menu-overlay', { display: 'flex' });
// In toggleMenu → close branch onComplete:
gsap.set('.menu-overlay', { display: 'none' });
```

---

### ISSUE 2 — Nav pill width `w-[95%]` + `px-6` can produce 12px side gutters on 390px (Medium)

**File:** `src/components/Layout.jsx` — line 94

`w-[95%]` of 390px = ~370px. With `px-6` (24px each side) the inner content area is 322px. The logo + hamburger button fit, but on narrower phones (320px) this gets very tight. No issue on 390px but worth noting.

**Fix:** No change needed for 390px. For safety add `min-w-0` on the nav's inner flex children.

---

### ISSUE 3 — Overlay menu: `text-4xl` nav links on 390px + `px-8` + `gap-4` = ArrowRight icons can escape the viewport (High)

**File:** `src/components/Layout.jsx` — lines 149–172

Nav links use `text-4xl md:text-7xl`. On mobile `text-4xl` (36px) is fine for individual words. However "Tools & Frameworks" and "Physician Marriages" are long strings at `text-4xl`. With `px-8` (32px each side) leaving 326px usable width, "Physician Marriages" at 36px/line height will be ~290px wide — it just barely fits but the trailing `ArrowRight` icon uses `gap-4` and `group-hover:translate-x-4`, which on the tightest phones will push outside viewport.

**Fix:** Add `flex-wrap` or cap the arrow transform on small screens:
```jsx
// On each menu-link line, change ArrowRight:
<ArrowRight className="w-6 h-6 md:w-8 md:h-8 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 md:group-hover:translate-x-4 transition-all flex-shrink-0" />
```

---

### ISSUE 4 — Overlay `pt-24` on mobile may not clear the navbar pill (Medium)

**File:** `src/components/Layout.jsx` — line 144

The overlay starts at `pt-24` (96px) on mobile. The navbar pill sits at `top-4` with `py-4` and `h-8` logo = ~72px total occupied space. 96px clears it. OK on 390px.

No fix needed.

---

## LAYOUT.JSX — Footer (inline in Layout.jsx)

### ISSUE 5 — Footer columns use `flex-wrap gap-12` which collapses correctly, but `gap-12` (48px) is very large on mobile (Medium)

**File:** `src/components/Layout.jsx` — line 228

```jsx
<div className="md:w-1/2 flex flex-wrap gap-12 justify-center md:justify-end">
```

On mobile (single-column mode) the two footer link columns ("Explore" and "Legal") wrap into two side-by-side columns because neither has a `w-full` force. With `gap-12` between them there's ~48px gap. On 390px: each column gets ~(390 - 48 - 24padding)/2 ≈ 159px. This is fine, they do render side by side.

However `mb-16` (64px) between the brand and columns and the `mb-16 gap-12` combo means the footer is very tall on mobile (the footer takes ~400px on 390px). Not broken, just could be tightened.

**Fix (optional):** Reduce mobile gaps:
```jsx
<div className="md:w-1/2 flex flex-wrap gap-8 md:gap-12 justify-center md:justify-end">
```

---

### ISSUE 6 — Separate `Footer.jsx` component (used nowhere currently?) has a `gap-16` grid that collapses to single column correctly (Low)

**File:** `src/components/Footer.jsx` — line 9

`grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16` — gap-16 (64px) between grid rows on mobile is large but fine because it's single-column. The `col-span-1 md:col-span-2` brand section is fine. No overflow risk.

No fix required (assuming this Footer component is not the active one — Layout.jsx has its own inline footer).

---

## HOME.JSX

### ISSUE 7 — Hero CTA button `px-10 py-4` is fine, but the inline link "Explore Our Philosophy" has no min-height tap target (Low)

**File:** `src/pages/Home.jsx` — line 78

```jsx
<Link to="/about" className="group inline-flex items-center gap-2 text-primary font-medium border-b-2 border-primary/20 hover:border-primary pb-1 transition-colors self-center">
```

No `min-h` set. The tap target is only ~24px tall (line height). WCAG minimum is 44px.

**Fix:** Add `py-2` to the link:
```jsx
className="... py-2 self-center"
```

---

### ISSUE 8 — Philosophy section: floating pull-quote `absolute -bottom-8 -right-4` card (High)

**File:** `src/pages/Home.jsx` — line 199

```jsx
<div className="absolute -bottom-8 -right-4 md:-right-8 bg-white p-6 rounded-[2rem] shadow-xl border border-primary/5 max-w-xs z-20">
```

This pull-quote is absolutely positioned with `-right-4` and `max-w-xs` (320px). On mobile the image section uses `order-last md:order-first` so the image renders below the text. The parent container is `relative w-full max-w-md`. On 390px with `px-6` (24px) the content area is 342px, and `max-w-md` = 448px so it resolves to 342px. The card at `max-w-xs` (320px) with `-right-4` would push 320 + 4 = 324px from the left edge — within bounds. However the card renders over the bottom of the image and extends 8px below the parent div. The parent section has `overflow-hidden` class from `sm:px-12`, and the section itself is `overflow-hidden` — this will clip the card.

**Fix:** The parent image container at line 186 doesn't have `overflow-hidden`; only the `w-full h-full` inner div does. However the section has `overflow-hidden` — the pull-quote at `-bottom-8` is inside the section's overflow:hidden boundary and will be clipped on small screens. Since the image is hidden on mobile (`hidden lg:flex` — see Home.jsx line 86), this pull-quote is also hidden. No real issue.

No fix needed (it's hidden on mobile already).

---

### ISSUE 9 — FinalCta padding `p-12 md:p-20` — `p-12` = 48px on all sides on mobile (High)

**File:** `src/pages/Home.jsx` — line 596

```jsx
<div className="... p-12 md:p-20 rounded-3xl">
```

`p-12` (48px) on 390px means the inner content area is 390 - 24(outer px-6) - 48 - 48 = 270px. The headline `text-4xl md:text-5xl` at ~36px fits easily in 270px. However the CTA button `px-12 py-5` (48px horizontal padding) would be 96px + button text (~220px) = ~316px wide — this exceeds the 270px inner area.

**Fix:** Scale down button padding and card padding on mobile:
```jsx
// Card:
className="... p-8 sm:p-12 md:p-20 rounded-3xl"
// Button:
className="bg-accent text-white px-8 sm:px-12 py-5 rounded-full ..."
```

This same `p-12 md:p-20` + `px-12` button pattern recurs in **About.jsx WorkWithUsCta**, **Team.jsx BottomCTA**, and **YourJourney.jsx ClosingCta** — all have the same issue.

---

### ISSUE 10 — ProgramsTeaser: popular card uses `lg:scale-105` and `py-12 lg:py-16` — scale on mobile (Medium)

**File:** `src/pages/Home.jsx` — line 507–510

```jsx
className={`... scale-100 lg:scale-105 z-10 py-12 lg:py-16`}
```

`scale-100` on mobile is fine. `py-12` (48px top/bottom) combined with the card having `p-10` = actually the outer class overrides... wait: the card has `p-10` as base but the popular card replaces it with `py-12 lg:py-16`. `py-12` = 48px vertical padding is OK on mobile, it's the inner card padding. No overflow risk.

No fix needed.

---

## ABOUT.JSX

### ISSUE 11 — Hero: `text-5xl md:text-7xl lg:text-8xl` — text-5xl (48px) on 390px (Medium)

**File:** `src/pages/About.jsx` — line 63

```jsx
<h1 className="about-reveal font-drama italic text-5xl md:text-7xl lg:text-8xl text-primary leading-tight mb-8">
  We're not experts who studied marriage.
</h1>
```

`text-5xl` = 48px. This is a long string (~40 chars). At 48px with the font, this will wrap to 3+ lines on 390px (content area = ~342px). Not an overflow risk (it wraps), but the visual weight is heavy. The audit asked specifically about text > `text-5xl` without responsive prefix — this uses `text-5xl` as the mobile base, which is the threshold. Fine.

No fix required — `text-5xl` is the limit asked (not over it).

---

### ISSUE 12 — HonestVersion: floating label box with `absolute -right-6 lg:-right-12` (Medium)

**File:** `src/pages/About.jsx` — line 140

```jsx
<div className="absolute -bottom-6 -right-6 lg:-right-12 bg-white p-6 rounded-[2rem] shadow-lg border border-primary/5 z-20 hidden md:block max-w-[250px]">
```

`hidden md:block` — correctly hidden on mobile. No issue.

---

### ISSUE 13 — About CTA `p-12 md:p-20` + `px-12 py-5` button — same issue as Home FinalCta (High)

**File:** `src/pages/About.jsx` — line 435

Same pattern as Issue 9. Button "Work With Us" at `px-12 py-5` inside a `p-12` card on 390px will overflow the inner container.

**Fix:** Same as Issue 9 — use `p-8 sm:p-12 md:p-20` on the card and `px-8 sm:px-12` on the button.

---

## PROGRAMS.JSX

### ISSUE 14 — FlagshipProgram inner card: `p-10 md:p-16 lg:p-20` (Medium)

**File:** `src/pages/Programs.jsx` — line 166

`p-10` (40px) on 390px — outer section has `px-6`, card gets 390 - 24 - 40 - 40 = 286px inner width. The two-column grid inside switches to single column on mobile. The module list has `p-10 md:p-14` on a nested card inside the already-padded outer card: 286 - 40 - 40 = 206px. This is very tight for the module text.

**Fix:** Scale the nested module list card padding:
```jsx
// Line 205:
className="flagship-reveal bg-white/10 p-6 md:p-10 lg:p-14 rounded-3xl border border-white/20"
```

---

### ISSUE 15 — StandalonePackages bento: `lg:col-span-2` and `lg:col-span-3` spans ignored on mobile (informational, not a bug)

**File:** `src/pages/Programs.jsx` — lines 41–76 (data), line 288 (grid)

The grid is `grid-cols-1 lg:grid-cols-3`. On mobile all cards render as full-width single column — the `lg:col-span-2/3` spans are irrelevant. This is correct behavior.

No fix needed.

---

### ISSUE 16 — Programs ClosingCta `p-12 md:p-20` + button pattern (High)

**File:** `src/pages/Programs.jsx` — line 379

Same as Issues 9/13. Button `px-10 py-4` inside `p-12` card = fine (px-10 = 40px each side + text ~180px = 260px < 286px inner). This one is actually OK — `px-10` not `px-12`.

No fix needed.

---

## TEAM.JSX

### ISSUE 17 — TeamPhoto offset gradient layers: `translate(22px, 24px)` — does this cause overflow? (High — the specific question asked)

**File:** `src/pages/Team.jsx` — line 170

```jsx
<div className="absolute inset-0 rounded-3xl" style={{ background: gradients[accentColor], opacity: 0.4, transform: 'translate(22px, 24px) rotate(4deg)' }} aria-hidden="true" />
```

The `TeamPhoto` wrapper is `relative w-56 md:w-64 lg:w-72 flex-shrink-0`. On mobile `w-56` = 224px.

The `absolute inset-0` gradient div is 224px wide. `translate(22px, 24px)` shifts it 22px right and 24px down from its position. Since it's `inset-0` relative to the 224px container, it starts at x=0 and moves to x=22 — its right edge reaches x = 224 + 22 = **246px**, which is 22px wider than the `w-56` container.

The `TeamMember` card wrapping the photo has `overflow-hidden` at line 222? Let's check:

```jsx
<div className="bg-white/70 backdrop-blur-sm rounded-3xl border border-neutral-200/60 overflow-hidden ...">
```

Yes — `overflow-hidden` is present on the card. This clips the gradient. But there is one layer of nesting between: `TeamPhoto` is inside the flex div at line 224. The immediate `overflow-hidden` parent is the card div. So the gradient shadow extending 22px to the right will be clipped by the card's `overflow-hidden`. No visible overflow on screen.

However, the card uses `p-8 md:p-12 lg:p-16` padding — on mobile `p-8` = 32px. The `TeamPhoto` div (`w-56` = 224px) + 32px card padding = 256px of the flex row's start. On 390px the flex container stacks to column (`flex-col ... md:flex-row`) so this is fine — the photo takes full width of the card.

**Conclusion:** The translate offsets do NOT cause overflow on mobile because:
1. The card has `overflow-hidden`
2. The layout is single-column (`flex-col`) on mobile

No fix needed.

---

### ISSUE 18 — TeamMember card: `p-8 md:p-12 lg:p-16` — on mobile combined with `gap-10` (Medium)

**File:** `src/pages/Team.jsx` — line 224

Single column on mobile (`flex-col`). The `gap-10` (40px) between photo and text + `p-8` card padding means: 390 - 24(mx-4) - 32 - 32 = 302px inner. Fine for text.

No fix needed.

---

### ISSUE 19 — BottomCTA: same `p-12 md:p-20` + `px-8 py-4` button pattern (High)

**File:** `src/pages/Team.jsx` — line 272

Button `px-8 py-4` (32px each side + text ~240px = ~304px) inside a `p-12` card (286px inner) — **the button would overflow by ~18px on 390px**.

**Fix:**
```jsx
// Card:
className="... p-8 sm:p-12 md:p-20 rounded-3xl"
// Button: keep px-8 but add w-full on mobile:
<MagneticButton className="bg-primary text-white px-8 py-4 rounded-full text-lg font-medium ... w-full sm:w-auto inline-flex items-center gap-2">
```

---

## YOURJOURNEY.JSX

### ISSUE 20 — ClosingCta: `p-10 md:p-12` on side-by-side cards — on mobile single column, OK (Low)

**File:** `src/pages/YourJourney.jsx` — lines 586, 605

`p-10` (40px) on 390px → inner width 390 - 24 - 40 - 40 = 286px. The buttons are `w-full py-4` so they stretch to fill — fine.

No fix needed.

---

## SPARKCALLENGE.JSX

### ISSUE 21 — Hero CTA button `px-10 py-4` with no width constraint at mobile (Low)

**File:** `src/pages/SparkChallenge.jsx` — line 221

`px-10 py-4` (40px padding + ~180px text = ~260px). On 390px with `px-6` outer, inner = 342px. 260px < 342px. Fine.

No fix needed.

---

### ISSUE 22 — Email capture form: `flex-col sm:flex-row` — wraps on mobile correctly. But button `px-8 py-3 whitespace-nowrap` (High)

**File:** `src/pages/SparkChallenge.jsx` — lines 344–362

```jsx
<form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
  <Input ... className="flex-1" />
  <button className="... px-8 py-3 rounded-full ... whitespace-nowrap">
    Begin the Challenge
  </button>
</form>
```

On mobile (column layout), the button becomes `width: auto` with `px-8` each side + "Begin the Challenge" (~145px) = ~225px. This should fit in a 390px container. Fine. The `whitespace-nowrap` is on the stacked (column) button so it doesn't cause issues.

The outer card has `p-10 sm:p-14` — `p-10` on 390px = 390 - 24 - 40 - 40 = 286px inner. Button 225px < 286px. Fine.

No fix needed.

---

## CONTACT.JSX

### ISSUE 23 — Contact header section: `rounded-[3.5rem] overflow-hidden` with `px-6` — the section has no `mx` guard at mobile (Critical)

**File:** `src/pages/Contact.jsx` — line 216

```jsx
<section className="relative w-full max-w-6xl mx-auto mb-32 rounded-[3.5rem] overflow-hidden">
```

`w-full max-w-6xl mx-auto` — on mobile this spans full viewport width with `rounded-[3.5rem]` (56px border radius). The image inside is `h-[500px]` with no responsive height:

```jsx
<img ... className="w-full h-[500px] object-cover opacity-20" />
```

A fixed `h-[500px]` is fine for decoration. But the hero text has `py-24 md:py-32` inside, so the section height is content-driven. No overflow issue here.

However `mb-32` (128px) is a very large margin below on all screen sizes.

**Fix (optional):** `mb-16 md:mb-32`

---

### ISSUE 24 — Contact "3 Ways to Begin" section: `mx-4 md:mx-6` (Medium)

**File:** `src/pages/Contact.jsx` — line 238

```jsx
<section className="bg-[#F7F6F2] py-24 rounded-[4rem] mb-32 mx-4 md:mx-6">
```

`mx-4` (16px each side) is appropriate on mobile. The `rounded-[4rem]` (64px) on a 390 - 32 = 358px wide card looks fine.

However `py-24` (96px) top+bottom padding and `mb-32` (128px margin) make the section very large on mobile. Not a bug but heavy.

---

### ISSUE 25 — Contact form: `bg-white rounded-[3rem] p-8 md:p-12` — `p-8` fine (Low)

**File:** `src/pages/Contact.jsx` — line 83

`p-8` (32px) on 390px → inner 390 - 24 - 32 - 32 = 302px. The two-column form grid collapses to single column. The submit button row uses `flex-col sm:flex-row items-center justify-between gap-4` — on mobile this stacks the disclaimer and button. The `MagneticButton px-10 py-4` is 80px padding + ~120px text = 200px — fits in 302px fine.

No fix needed.

---

### ISSUE 26 — Contact FAQ email link: `text-3xl md:text-5xl` — `text-3xl` (30px) on mobile fine (Low)

**File:** `src/pages/Contact.jsx` — line 303

`text-3xl md:text-5xl` — 30px mobile, the email address "hello@healingheartscourse.com" is 33 chars. At 30px this will wrap. That's fine and intentional.

No fix needed.

---

## FAQ.JSX

### ISSUE 27 — FAQ header: `text-5xl md:text-7xl` — `text-5xl` mobile base (Medium)

**File:** `src/pages/FAQ.jsx` — line 71

```jsx
<h1 className="faq-header font-sans font-bold text-5xl md:text-7xl tracking-tighter text-primary leading-none mb-6">
  Frequently Asked <span ...>Questions</span>
</h1>
```

`text-5xl` (48px) + `tracking-tighter` + "Frequently Asked" (~17 chars) will wrap. Fine.

---

### ISSUE 28 — FAQ items: `p-8` on mobile with `flex items-center justify-between gap-6` — icon shrink needed (High)

**File:** `src/pages/FAQ.jsx` — line 86

```jsx
<div className="p-8 flex items-center justify-between gap-6">
  <h3 className="font-sans font-bold text-xl md:text-2xl leading-tight ...">
    {faq.q}
  </h3>
  <div className="w-10 h-10 rounded-full ... flex-shrink-0">
```

On 390px: `p-8` = 32px each side → inner 390 - 24 - 32 - 32 = 302px. Flex row: `gap-6` (24px) + icon `w-10` (40px) = 64px overhead. Text gets 302 - 64 = 238px. The longest question "What's the difference between the full program and standalone packages?" at `text-xl` (20px) will wrap significantly — which is fine for a question.

However `gap-6` on mobile with the icon is a bit tight. Consider reducing to `gap-3 md:gap-6`.

**Fix:**
```jsx
<div className="p-6 md:p-8 flex items-center justify-between gap-3 md:gap-6">
```

---

## TESTIMONIALS.JSX

### ISSUE 29 — `pt-40 px-6 md:px-16` main + `columns-1 md:columns-2` — correct mobile behavior (Low)

**File:** `src/pages/Testimonials.jsx` — lines 67, 80

`columns-1` on mobile (single column) is correct. Cards use `p-10 md:p-14` — `p-10` (40px) on 390px → inner 302px. Text `text-xl md:text-2xl` = 20px, fine.

No fix needed.

---

## PHYSICIANMARRIAGES.JSX

### ISSUE 30 — Pressure cards: `p-10 rounded-[2.5rem]` — `p-10` on 390px (Medium)

**File:** `src/pages/PhysicianMarriages.jsx` — lines 80, 88, 96, 104

`p-10` (40px) on 390px with `px-6` outer → inner 302px. The `font-drama italic text-3xl text-primary mb-4` heading: 30px italic serif — "Clinical dissociation doesn't have an off switch." at 30px wraps correctly.

No fix needed.

---

### ISSUE 31 — Hero rounded bottom: `rounded-b-[4rem]` clips hero image on mobile (Low)

**File:** `src/pages/PhysicianMarriages.jsx` — line 44

`rounded-b-[4rem]` (64px) is purely decorative and handled by the browser. Not a layout issue.

---

## RESOURCES.JSX

### ISSUE 32 — Free Downloads card: `p-10 md:p-16` with inner `flex-col sm:flex-row items-start sm:items-center` download rows (High)

**File:** `src/pages/Resources.jsx` — line 105

```jsx
<div className="... p-6 rounded-3xl border ... flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 ...">
  <div>...</div>
  <button className="flex-shrink-0 w-12 h-12 rounded-full ...">
```

On mobile: `flex-col` means button stacks below text. The `w-12 h-12` button renders left-aligned by default under the text. This looks a bit orphaned.

**Fix:** Center the button on mobile:
```jsx
className="... flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6"
// On the button:
className="flex-shrink-0 w-12 h-12 rounded-full ... self-start sm:self-center"
```

---

## FRAMEWORKS.JSX

### ISSUE 33 — Framework cards: `p-10 md:p-16` + internal `flex-col md:flex-row` with `md:pl-16 md:border-l` (High)

**File:** `src/pages/Frameworks.jsx` — line 102

```jsx
<div className="fw-item bg-white border border-black/5 rounded-[3rem] p-10 md:p-16 shadow-xl flex flex-col md:flex-row gap-10 md:gap-16 items-start">
  <div className="md:w-1/3">...</div>
  <div className="md:w-2/3 space-y-6 pt-4 md:pt-24 md:border-l border-black/10 md:pl-16">
```

On mobile: `p-10` (40px) inner width = 302px. `flex-col` stacks correctly. `border-black/10` is only applied at `md:` so no border on mobile. `md:pl-16` is only at `md:` so no extra padding on mobile. Fine.

However `text-3xl md:text-4xl` h3 inside `md:w-1/3` — on mobile this column is `w-full`. "The 90-Second Wave" at 30px wraps fine in 302px.

No fix needed.

---

### ISSUE 34 — Header: `text-5xl md:text-7xl lg:text-8xl tracking-tighter` (Medium)

**File:** `src/pages/Frameworks.jsx` — line 90

"Proprietary methods you won't find" at `text-5xl` (48px) with `tracking-tighter` = very large on mobile. The `<br className="hidden md:block"/>` inside means on mobile the h1 reads as one continuous string. At 48px "Proprietary methods you won't find anywhere else." will wrap across 4+ lines. This is heavy but intentional for editorial feel.

No overflow risk, just heavy visual weight.

---

## RESCUEKIT.JSX

### ISSUE 35 — PricingCta button `px-12 py-4` inside `p-10 md:p-16` card (Critical)

**File:** `src/pages/RescueKit.jsx` — line 475–480

```jsx
<div className="rk-pricing-reveal bg-[#F9F8F5] rounded-3xl p-10 md:p-16 ...">
  ...
  <MagneticButton className="bg-accent text-white px-12 py-4 rounded-full text-base font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 w-full md:w-auto">
    Get the Conflict Rescue Kit
  </MagneticButton>
```

The button has `w-full md:w-auto` — on mobile it's `w-full` so it stretches to the inner container width. Fine.

No fix needed (the `w-full` guard is already there).

---

### ISSUE 36 — SPARK Method grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-5` — stacks to 1 on mobile (Low)

**File:** `src/pages/RescueKit.jsx` — line 307

Single column on 390px. Cards use `p-6 rounded-3xl` — fine at 302px inner width.

No fix needed.

---

### ISSUE 37 — ClosingCta `p-12 md:p-20` + `px-12 py-4` button (High)

**File:** `src/pages/RescueKit.jsx` — line 567

```jsx
<div className="... p-12 md:p-20 rounded-3xl">
  ...
  <MagneticButton className="bg-accent text-white px-12 py-4 rounded-full ...">
    Get the Conflict Rescue Kit — $39
```

`p-12` card → 286px inner. Button `px-12 py-4` + "Get the Conflict Rescue Kit — $39" (~220px text) + 96px padding = **~316px — overflows 286px inner by ~30px**.

**Fix:**
```jsx
// Card:
className="... p-8 sm:p-12 md:p-20 rounded-3xl"
// Button: add w-full on mobile
className="bg-accent text-white px-8 sm:px-12 py-4 rounded-full text-base font-medium ... w-full sm:w-auto"
```

---

## LOGIN.JSX + SIGNUP.JSX

### ISSUE 38 — Auth pages: left branding panel `hidden lg:flex p-16` — fine, hidden on mobile. Right form `flex-1 flex items-center justify-center px-6 py-12` — fine on 390px (Low)

**Files:** `src/pages/Login.jsx` line 102, `src/pages/Signup.jsx` line 89

On mobile the left panel is hidden (`hidden lg:flex`). The right panel is full-width with `px-6`. The `max-w-md w-full` form container at 390px → 390 - 48 = 342px > 448px → resolves to 342px. All form inputs are `w-full`. Fine.

No fix needed.

---

## COMINGSOON.JSX

### ISSUE 39 — CTA buttons `flex-col sm:flex-row` with `px-8 py-4` (Low)

**File:** `src/pages/ComingSoon.jsx` — line 70

`flex-col sm:flex-row` stacks correctly on mobile. Button `px-8 py-4` (64px padding + ~170px text = 234px) < 342px inner. Fine.

No fix needed.

---

## PRIVACY.JSX + TERMS.JSX

### ISSUE 40 — Legal pages: `p-8 md:p-12 lg:p-16` card on mobile — inner `list-disc pl-6` (Low)

**File:** `src/pages/Privacy.jsx` — line 13

`p-8` (32px) → 302px inner. `pl-6` (24px) inside lists = 302 - 24 = 278px for list text. Fine.

No fix needed.

---

## CONSOLIDATED FIX LIST

The following is ordered by priority.

### P1 — Critical

| # | File | Line | Issue | Fix |
|---|------|------|-------|-----|
| 1 | `Layout.jsx` | 144–145 | Overlay `style={{ display }}` conflicts with GSAP; overlay may not appear | Remove inline style; add `gsap.set('.menu-overlay', { display: 'flex' })` before open animation and `display: 'none'` in close `onComplete` |

### P2 — High

| # | File | Line | Issue | Fix |
|---|------|------|-------|-----|
| 2 | `Home.jsx` | 596 | CTA card `p-12` + `px-12` button overflows 286px inner on 390px | `p-8 sm:p-12 md:p-20` on card; `px-8 sm:px-12` on button |
| 3 | `About.jsx` | 435 | Same `p-12 md:p-20` + `px-12 py-5` pattern | Same fix as above |
| 4 | `Team.jsx` | 272 | BottomCTA `p-12 md:p-20` + `px-8 py-4` button overflows | Add `w-full sm:w-auto` to button; `p-8 sm:p-12 md:p-20` on card |
| 5 | `RescueKit.jsx` | 567 | ClosingCta `p-12 md:p-20` + `px-12 py-4` button overflows | `p-8 sm:p-12 md:p-20`; `px-8 sm:px-12`; add `w-full sm:w-auto` |
| 6 | `FAQ.jsx` | 86 | FAQ item `p-8 gap-6` cramped on 390px | `p-6 md:p-8 gap-3 md:gap-6` |
| 7 | `Layout.jsx` | 149–172 | ArrowRight icon `group-hover:translate-x-4` may escape viewport on 320px devices | `group-hover:translate-x-2 md:group-hover:translate-x-4` on ArrowRight |
| 8 | `Programs.jsx` | 205 | Nested module card `p-10 md:p-14` inside already-padded flagship card → ~206px inner on mobile | `p-6 md:p-10 lg:p-14` |
| 9 | `Resources.jsx` | 105 | Download row button orphaned left-aligned on mobile in column layout | `self-start sm:self-center` on button |

### P3 — Medium

| # | File | Line | Issue | Fix |
|---|------|------|-------|-----|
| 10 | `Home.jsx` | 78 | "Explore Our Philosophy" link tap target too small (~24px) | Add `py-2` |
| 11 | `Layout.jsx` | 228 | Footer column gap-12 very large on mobile | `gap-8 md:gap-12` |
| 12 | `Contact.jsx` | 216 | `mb-32` on hero section excessive on mobile | `mb-16 md:mb-32` |
| 13 | `Contact.jsx` | 238 | `py-24` + `mb-32` very tall on mobile | `py-16 md:py-24 mb-16 md:mb-32` |

### P4 — Low (style only)

| # | File | Line | Issue | Fix |
|---|------|------|-------|-----|
| 14 | Multiple | — | `text-5xl` (48px) as mobile base is at the audit threshold; acceptable but heavy | Consider `text-4xl md:text-5xl` for multi-line hero strings where wrapping is heavy |
| 15 | `Frameworks.jsx` | 90 | Long h1 at `text-5xl tracking-tighter` wraps to 4+ lines on mobile | Consider `text-4xl md:text-5xl md:text-7xl lg:text-8xl` |

---

## SPECIFIC QUESTIONS ANSWERED

### Q: Team.jsx gradient card offsets `translate(22px, 24px)` — overflow?
No. The immediate card parent has `overflow-hidden` on line 222. The offsets are visible on desktop where they peek outside the photo frame (by design) but are clipped by the card on mobile. No fix needed.

### Q: Navbar hamburger — working?
Functionally yes. The hamburger button is always visible (not hidden behind `hidden md:flex`). However there is a **CSS/GSAP conflict** (Issue 1 above) where the inline `style={{ display }}` on the overlay can prevent the GSAP animation from showing the overlay on first tap. This is the most important fix.

### Q: Overlay — covers full screen?
Yes. The overlay uses `fixed inset-0` so when rendered it covers the full viewport. The `overflow-y-auto` allows scrolling if the menu is taller than the screen (relevant on very short viewports or when keyboard is open).

### Q: Footer — columns stack on mobile?
Yes. Layout.jsx footer: `flex flex-col md:flex-row` — stacks correctly. The two link column groups inside use `flex-wrap gap-12` which keeps them side-by-side even on mobile (each ~159px wide). This is fine and intentional.

Footer.jsx (standalone component): `grid-cols-1 md:grid-cols-2 lg:grid-cols-4` — stacks to single column correctly.
