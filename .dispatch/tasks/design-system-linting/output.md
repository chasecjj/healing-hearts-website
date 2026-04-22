# Design System Linting & Token Compliance — Research Output

**Date:** 2026-04-12
**Stack:** Tailwind CSS 3, React 19, Vite 7, GSAP/ScrollTrigger, Scoria design system
**Target bugs:** z-index stacking collisions, overflow:hidden clipping, SVG wave overlap, hardcoded colors

---

## Current State Audit

- **ESLint:** Minimal — JS recommended + React hooks/refresh only. Zero CSS or Tailwind rules.
- **Stylelint:** Not installed.
- **Prettier:** Not configured. No class-ordering conflicts to worry about.
- **CSS files:** Only 2 (index.css, App.css) — nearly all styling via Tailwind utility classes in JSX.
- **Hardcoded colors:** **58 arbitrary hex values** (`bg-[#F9F8F5]`, `text-[#xxx]`, etc.) across 18 files.
- **Inline styles:** **163 `style={{}}` objects** across 22 files.
- **GSAP usage:** **107 gsap/ScrollTrigger calls** across 26 files.
- **overflow-hidden:** **89 occurrences** across 29 files.

---

## Tool Landscape

### 1. eslint-plugin-tailwindcss (francoismassart) — RECOMMENDED

**What:** ESLint plugin with 8 rules for linting Tailwind utility classes in JSX `className` strings.
**Tailwind v3 support:** Full. v4 support in beta channel.
**Install:** `npm i -D eslint-plugin-tailwindcss`

**Relevant rules for HH bug patterns:**

| Rule | What it catches | HH relevance |
|------|----------------|---------------|
| `no-contradicting-classname` | `p-2 p-3` — same property targeted twice | High — prevents accidental overrides |
| `no-custom-classname` | Classes not in TW config or whitelist | Medium — enforces design system |
| `no-unnecessary-arbitrary-value` | `m-[1.25rem]` when `m-5` exists | Medium — catches lazy arbitrary values |
| `enforces-shorthand` | `mx-5 my-5` → `m-5` | Low — cleanup, not bug prevention |
| `classnames-order` | Inconsistent class ordering | Low — readability, not bugs |
| `no-arbitrary-value` | Bans ALL arbitrary values | Too aggressive for HH (58 legitimate uses) |

**Verdict:** Tier 1 adoption. Install and enable 5 recommended rules immediately. Takes <30 min.

### 2. eslint-plugin-better-tailwindcss (schoero) — SUPPLEMENTARY

**What:** 13 rules (10 stylistic + 3 correctness). Supports TW v3 and v4.
**Key unique rule:** `no-restricted-classes` — ban specific class patterns via regex.

**Use case for HH:** Configure `no-restricted-classes` to ban arbitrary hex colors:
```json
"better-tailwindcss/no-restricted-classes": ["error", {
  "patterns": ["\\[#[0-9a-fA-F]{3,8}\\]"]
}]
```

This would flag all 58 hardcoded hex values. Would need to first add missing colors (like `#F9F8F5`) to tailwind.config.js as named tokens.

**Verdict:** Tier 2. Install after adding missing tokens to config. Requires token audit first (~2hr).

### 3. oxlint-tailwindcss — NOT YET VIABLE

**What:** Native oxlint plugin with 22 rules including `no-hardcoded-colors`.
**Problem:** Tailwind v4 only. HH is on v3. Not compatible.
**Watch:** If/when HH migrates to TW v4, this becomes the best option for color enforcement.

### 4. Stylelint — LOW VALUE FOR HH

**What:** CSS file linter with 100+ rules.
**Problem:** HH writes almost no raw CSS (2 files, ~24 lines total). Stylelint can't lint JSX className strings.
**Useful plugins:** `stylelint-z-index-value-constraint` for constraining z-index ranges — but only in CSS files.
**Verdict:** Skip. The linting surface is JSX, not CSS files.

### 5. @eslint/css (official ESLint CSS plugin) — WATCH

**What:** ESLint's official CSS language support (Feb 2025). Rules: `no-invalid-properties`, `no-invalid-at-rules`, `require-baseline`.
**Status:** Early stage, no layout-specific rules yet (no z-index, overflow, or positioning rules).
**Verdict:** Monitor. Could be useful later but doesn't address current bug patterns.

### 6. Playwright Visual Regression Testing — RECOMMENDED

**What:** Built-in `toHaveScreenshot()` API for pixel-diff visual comparisons.
**Install:** Already available (Playwright MCP plugin present in dev environment).

**What it catches:**
- SVG wave elements bleeding into adjacent sections (full-page screenshot diffs)
- z-index collisions causing wrong stacking order (visual diffs)
- overflow:hidden clipping content that should be visible (visual diffs)
- Responsive layout breakages across viewport sizes

**Recommended test structure:**
```javascript
// tests/visual/layout.spec.js
test('Home page — no section overlap at desktop', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  // Disable GSAP animations for deterministic screenshots
  await page.addStyleTag({ content: '*, *::before, *::after { animation-duration: 0s !important; transition-duration: 0s !important; }' });
  await expect(page).toHaveScreenshot('home-desktop.png', { fullPage: true });
});

// Custom assertion: verify no child overflows its parent
test('Testimonial cards not clipped by wave divider', async ({ page }) => {
  await page.goto('/');
  const cards = page.locator('.testimonial-card');
  const wave = page.locator('.organic-divider');
  // Check bounding boxes don't overlap
  const cardBox = await cards.first().boundingBox();
  const waveBox = await wave.boundingBox();
  expect(cardBox.y + cardBox.height).toBeLessThanOrEqual(waveBox.y);
});
```

**Limitations:**
- Known Playwright bug (#33489): elements inside `height:0 + overflow:hidden` are treated as "visible"
- GSAP animations must be disabled/completed before capture for deterministic results
- Need to mask dynamic content (dates, user data)

**Verdict:** Tier 3. Most effective tool for the specific HH bug patterns (wave clipping, z-index collisions) but highest setup cost (~4-8hr for initial baseline across key pages).

### 7. Custom Layout Assertion Script — SUPPLEMENTARY

For detecting the exact bugs in the HH codebase at dev time, a custom script that runs in the browser (or via Playwright) could:

```javascript
// Detect elements that overflow their parent's visible area
document.querySelectorAll('[class*="overflow-hidden"]').forEach(parent => {
  const parentRect = parent.getBoundingClientRect();
  parent.querySelectorAll('*').forEach(child => {
    const childRect = child.getBoundingClientRect();
    if (childRect.bottom > parentRect.bottom || childRect.right > parentRect.right) {
      console.warn(`Clipped content: ${child.className} overflows ${parent.className}`);
    }
  });
});
```

**Verdict:** Useful as a dev-time debugging tool, not a CI gate.

---

## GSAP-Specific Considerations

**No static linting tools exist for GSAP.** The fundamental issue is that GSAP applies transforms at runtime, and those transforms create new stacking contexts that interact with CSS z-index and overflow properties. This is inherently a runtime problem.

**Key GSAP + CSS conflicts in HH:**
1. **Transforms create stacking contexts** — any element with a GSAP transform gets its own stacking context, changing z-index behavior relative to siblings
2. **ScrollTrigger pin:true** creates wrapper `div.pin-spacer` elements that can conflict with `overflow:hidden` on parent containers
3. **translateY on decorative SVG waves** — if the translated position extends into an adjacent section's `overflow:hidden` zone, the wave gets clipped

**Mitigation approach (not a lint rule but a code convention):**
- Document a z-index scale in the design system (e.g., content: 10, decorative: 5, overlays: 50)
- Use Tailwind's z-index classes (`z-10`, `z-20`) instead of arbitrary `z-[999]` values
- Ensure sections with absolute-positioned decorative elements use `overflow-visible` (not `overflow-hidden`) on the container that holds them

---

## Prioritized Adoption Plan

### Tier 1 — Immediate (< 1 hour, zero risk)

**Install eslint-plugin-tailwindcss** with 5 recommended rules:

```bash
npm i -D eslint-plugin-tailwindcss
```

Add to `eslint.config.js`:
```javascript
import tailwindcss from 'eslint-plugin-tailwindcss';

// In the config array, add:
...tailwindcss.configs['flat/recommended'],
```

This enables: `classnames-order`, `enforces-negative-arbitrary-values`, `enforces-shorthand`, `no-contradicting-classname`, `no-custom-classname`, `no-unnecessary-arbitrary-value`.

**Expected impact:** Catches contradicting classes (the "p-2 p-3" family of bugs) and unnecessary arbitrary values. Won't catch layout/z-index bugs but prevents a class of Tailwind misuse.

### Tier 2 — Short-term (2-4 hours)

1. **Audit the 58 hardcoded hex colors** and add recurring ones to `tailwind.config.js` as named tokens:
   - `#F9F8F5` → `surface` or `cream` (appears 20+ times across multiple pages)
   - Any other repeating hex values

2. **Install eslint-plugin-better-tailwindcss** and configure `no-restricted-classes` to ban arbitrary hex patterns:
   ```bash
   npm i -D eslint-plugin-better-tailwindcss
   ```

3. **Establish a z-index scale** in tailwind.config.js:
   ```javascript
   zIndex: {
     behind: '-1',
     base: '0',
     decorative: '5',
     content: '10',
     sticky: '20',
     overlay: '30',
     modal: '40',
     toast: '50',
   }
   ```

**Expected impact:** Eliminates future design token drift. Forces all colors through the design system.

### Tier 3 — Medium-term (4-8 hours)

1. **Set up Playwright visual regression tests** for the 5 most bug-prone pages:
   - Home (7 hardcoded colors, 9 GSAP calls, 8 overflow-hidden)
   - RescueKit (8 hardcoded colors, 11 GSAP calls, 10 overflow-hidden)
   - YourJourney (5 hardcoded colors, 9 GSAP calls, 9 overflow-hidden)
   - Team (4 hardcoded colors, 11 GSAP calls, 7 overflow-hidden)
   - About (6 hardcoded colors, 9 GSAP calls, 5 overflow-hidden)

2. **Add custom bounding-box assertions** to catch overflow clipping and section overlap.

3. **Run visual tests at 3 breakpoints:** 375px (mobile), 768px (tablet), 1440px (desktop).

**Expected impact:** Catches the exact class of bugs described (wave clipping, z-index collisions, content clipped by overflow:hidden) — the bugs that static analysis cannot detect.

---

## Tools NOT Recommended

| Tool | Why not |
|------|---------|
| Stylelint | HH has ~24 lines of raw CSS. All styling is in JSX. |
| oxlint-tailwindcss | Tailwind v4 only; HH is on v3 |
| BackstopJS | Adds complexity over Playwright for marginal visual diff UI improvement |
| @eslint/css | Too early stage, no layout rules yet |
| prettier-plugin-tailwindcss | Would conflict with eslint-plugin-tailwindcss classnames-order (pick one) |

---

## Summary

The HH codebase has **two distinct problem categories** that require different tools:

1. **Design token drift** (58 hardcoded colors, arbitrary values) → **Static analysis** via eslint-plugin-tailwindcss + eslint-plugin-better-tailwindcss. Cheap, fast, catches future violations in CI.

2. **Layout/stacking bugs** (z-index collisions, overflow clipping, wave overlap) → **Visual regression testing** via Playwright. More expensive to set up but is the *only* approach that catches these runtime CSS interaction bugs. No static tool can detect when a GSAP-animated SVG wave with `translate-y` overlaps a `overflow:hidden` sibling section.

Both categories should be addressed. Tier 1 is a no-brainer immediate win. Tier 2 closes the token enforcement gap. Tier 3 prevents the specific recurring bug pattern that prompted this research.
