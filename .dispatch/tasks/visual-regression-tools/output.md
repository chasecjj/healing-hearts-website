# Visual Regression Testing Tools — Research Output

**Date:** 2026-04-12
**Context:** Solo dev (Chase) building healingheartscourse.com — React 19, Vite 7, Tailwind 3, GSAP scroll animations, Vercel auto-deploy on push to master.

## The Bug Pattern We Need to Catch

1. **Z-index overlap:** Decorative SVG waves with `z-10` overlapping testimonial cards that lack a z-index — only visible on desktop viewports (≥1024px).
2. **Subtle background color mismatches** between adjacent sections after design token changes.

Both bugs are **pixel-level visual issues** that pass lint, build, and even basic Playwright functional tests. They require screenshot comparison at specific viewport widths.

---

## Tools Evaluated

### 1. Playwright Built-in Visual Comparisons

**What it is:** Playwright Test includes `toHaveScreenshot()` and `toMatchSnapshot()` assertions. No external service needed — screenshots are stored as files in the repo.

**How it works:**
- First run generates baseline `.png` files
- Subsequent runs compare against baselines pixel-by-pixel
- Configurable thresholds: `maxDiffPixels`, `maxDiffPixelRatio`
- Update baselines with `--update-snapshots` flag

**Strengths for HH:**
- **Already in our stack** — we have Playwright installed via the MCP plugin
- **Free, forever** — no snapshot limits, no SaaS dependency
- **Viewport control** — trivial to set `viewport: { width: 1280, height: 720 }` to catch desktop-only bugs
- **Full-page screenshots** — `fullPage: true` captures the entire scrollable page including wave/card overlap zones
- **Element-level screenshots** — can screenshot just `.testimonial-section` to isolate the exact overlap area
- **Vercel CI integration** — well-documented pattern using `deployment_status` GitHub Action trigger to test preview URLs
- **Docker image** — `mcr.microsoft.com/playwright` ensures pixel-identical rendering in CI vs. local

**Weaknesses for HH:**
- **GSAP is JavaScript-driven** — Playwright's `animations: 'disabled'` only stops CSS animations/transitions, NOT GSAP. Must use one of:
  - `page.clock` API to freeze JS time
  - Inject `gsap.globalTimeline.pause()` before screenshot
  - Wait for `gsap.globalTimeline.progress()` === 1
- **No visual diff UI** — diffs are `.png` files in test results, no web-based approval flow
- **Baseline management** — screenshots committed to repo (adds ~2-5MB), must regenerate on intentional design changes
- **Cross-platform rendering** — fonts render differently on Windows vs. Linux; must standardize on Docker/CI baselines

**Cost:** $0

**Setup complexity:** Low — 1 config file + test files. Already have Playwright.

---

### 2. Chromatic (by Storybook)

**What it is:** Cloud visual testing platform built on Storybook. Screenshots every story, compares across commits.

**How it works:**
- Requires Storybook setup (component stories)
- `npx chromatic` uploads stories to Chromatic cloud
- Cloud renders in standardized browsers, diffs against baselines
- Web UI for reviewing and approving changes

**Strengths:**
- Best-in-class diff UI with side-by-side, overlay, and spotlight modes
- Catches component-level regressions precisely
- Turbosnap: only screenshots changed components (saves quota)

**Weaknesses for HH:**
- **Requires Storybook** — HH has zero Storybook setup. Adding it means writing stories for every component, which is a large upfront investment for a solo dev
- **Component-level, not page-level** — the z-index wave/card bug is a *composition* bug between components on a page. Storybook stories render components in isolation, so this exact bug class would be missed unless you write full-page stories (defeats the purpose)
- **5,000 snapshots/mo free** — HH has 14+ pages × multiple viewports × commits ≈ could burn through this in 2-3 weeks of active development
- **$179/mo starter** — expensive for a solo dev project that isn't generating revenue yet

**Cost:** Free (5k snapshots/mo) → $179/mo starter

**Setup complexity:** High — requires Storybook setup from scratch.

**Verdict: Poor fit.** The Storybook dependency is a dealbreaker. The bug pattern (page-level composition overlap) is exactly what component-isolated testing misses.

---

### 3. Percy (BrowserStack)

**What it is:** Cloud visual testing SaaS. Takes snapshots via SDK integration with test frameworks (Playwright, Cypress, etc.), diffs in cloud.

**How it works:**
- Add `@percy/playwright` SDK to existing Playwright tests
- `await percySnapshot(page, 'Homepage Desktop')` captures and uploads
- Cloud renders in multiple browsers, generates visual diffs
- Web UI for review and approval

**Strengths:**
- **No Storybook required** — works with existing Playwright tests
- **Cross-browser rendering** — catches Chrome vs. Firefox differences
- **Good diff UI** — web-based approval flow
- **5,000 snapshots/mo free tier**

**Weaknesses for HH:**
- **Cloud dependency** — screenshots are rendered in Percy's cloud, not your own CI. Adds latency and external service dependency
- **5k free tier burns fast** — same math as Chromatic
- **$449/mo minimum paid plan** — completely out of budget for a solo dev pre-revenue project
- **GSAP same challenge** — Percy uses Playwright under the hood; same GSAP freeze issues
- **Vercel preview URLs** — supported but requires webhook configuration

**Cost:** Free (5k/mo) → $449/mo (10k/mo)

**Setup complexity:** Medium — add SDK + Percy token, minimal code changes.

**Verdict: Overkill and expensive.** The free tier might work initially, but the price cliff when you outgrow it is steep. The cloud rendering is a feature for teams, but adds unnecessary complexity for a solo dev.

---

### 4. BackstopJS

**What it is:** Open-source visual regression testing using Chrome-headless. JSON config defines scenarios (URL + selector + viewport), generates comparison reports.

**How it works:**
- `backstop.json` config defines URLs, selectors, viewports
- `backstop reference` captures baselines
- `backstop test` compares current state
- HTML report with side-by-side diffs

**Strengths:**
- Fully open source, no cloud dependency
- Simple JSON config — no code required for basic scenarios
- Multi-viewport support built-in
- Nice HTML diff report

**Weaknesses for HH:**
- **Effectively unmaintained** — no npm releases in 12+ months, open issues getting no responses, last meaningful release was Node 20 support
- **No Playwright engine option that's current** — uses older Puppeteer or its own Chrome-headless; Playwright scripting support exists but is secondhand
- **GSAP same challenge** — needs custom scripts to handle JS animations
- **No CI-native integration** — must wire up yourself with scripts
- **Dependency risk** — using an unmaintained tool for CI means you'll hit Node/Chromium compatibility issues that nobody upstream will fix

**Cost:** $0

**Setup complexity:** Low config, but high maintenance risk.

**Verdict: Skip.** The unmaintained status is disqualifying. You'd be building on an abandoned foundation and will eventually need to migrate off it.

---

### 5. Lost Pixel

**What it is:** Modern open-source visual regression tool. OSS engine for local/CI use, optional cloud platform for review UI. Positions itself as the open-source alternative to Percy/Chromatic.

**How it works:**
- Can test Storybook stories, Ladle stories, OR plain page URLs
- Uses Playwright under the hood for rendering
- `lost-pixel` CLI runs tests, generates diffs
- Optional Lost Pixel Platform for cloud-based review UI

**Strengths for HH:**
- **Page-level screenshots without Storybook** — can point at URLs directly, which catches the composition-level z-index bugs
- **Multi-viewport support** — configure multiple device widths
- **OSS core is free** — no snapshot limits when self-hosted
- **GitHub Actions integration** — first-class `lost-pixel/lost-pixel` action
- **Active maintenance** — regular releases, responsive maintainers
- **Playwright-based** — same rendering engine, familiar scripting

**Weaknesses for HH:**
- **Less mature than Playwright built-in** — adds a dependency on top of Playwright rather than using what's already there
- **GSAP same challenge** — Playwright under the hood, same animation freeze needs
- **Cloud platform pricing unclear** — free for small/open-source, but paid tiers not well-documented
- **Smaller community** — fewer Stack Overflow answers, blog posts, and troubleshooting resources vs. raw Playwright

**Cost:** $0 (OSS) → unclear paid tiers

**Setup complexity:** Low-Medium — config file + GitHub Action.

**Verdict: Good but unnecessary.** It's essentially a wrapper around Playwright's screenshot capabilities with a nicer review UI. For a solo dev, the raw Playwright approach gives you the same capabilities without the extra dependency.

---

## Evaluation Matrix

| Criteria | Playwright | Chromatic | Percy | BackstopJS | Lost Pixel |
|----------|-----------|-----------|-------|------------|------------|
| **Z-index overlap detection** | ✅ Full-page + element screenshots at exact viewport | ❌ Component isolation misses composition bugs | ✅ Page-level snapshots | ✅ URL + selector based | ✅ Page-level URLs |
| **Viewport-specific bugs** | ✅ `viewport` config per test | ⚠️ Limited viewports in stories | ✅ Multi-viewport | ✅ JSON viewport config | ✅ Multi-device widths |
| **GSAP animation handling** | ⚠️ Needs `gsap.globalTimeline.pause()` injection | ⚠️ Same issue in stories | ⚠️ Same issue | ⚠️ Custom scripts | ⚠️ Same issue (Playwright under hood) |
| **Solo-dev cost** | ✅ $0 forever | ❌ Free tier burns fast, $179/mo | ❌ Free tier burns fast, $449/mo | ✅ $0 | ✅ $0 (OSS) |
| **Setup complexity** | ✅ Low (already have Playwright) | ❌ High (needs Storybook) | ⚠️ Medium | ⚠️ Low but risky | ⚠️ Low-medium |
| **Vercel CI integration** | ✅ Well-documented | ⚠️ Possible | ⚠️ Webhook config | ❌ Manual | ✅ GitHub Action |
| **Maintenance/longevity** | ✅ Microsoft-backed, very active | ✅ Active | ✅ BrowserStack-backed | ❌ Unmaintained | ⚠️ Smaller community |
| **Diff review experience** | ⚠️ PNG files, no UI | ✅ Best-in-class | ✅ Good | ✅ HTML report | ✅ OSS report + cloud UI |

---

## Verdict: Use Playwright Built-in `toHaveScreenshot()`

**Why:** It's already in the stack, it's free, it directly addresses the bug pattern, and it has zero vendor lock-in. The only meaningful tradeoff — no web-based diff review UI — doesn't matter for a solo developer who can look at PNG diffs in VS Code or the Playwright HTML report.

### Recommended Setup Sketch

```
tests/
  visual/
    homepage.visual.spec.ts
    testimonials.visual.spec.ts    ← catches z-index wave overlap
    about.visual.spec.ts
    spark-challenge.visual.spec.ts
  visual.config.ts                 ← shared viewport + GSAP freeze helpers
```

**Key test for the wave/card bug:**

```ts
// tests/visual/testimonials.visual.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Testimonial section — desktop', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('no wave overlap on testimonial cards', async ({ page }) => {
    await page.goto('/');

    // Freeze GSAP animations to deterministic end state
    await page.evaluate(() => {
      if (window.gsap) {
        window.gsap.globalTimeline.progress(1);
      }
    });

    // Screenshot the testimonial section specifically
    const section = page.locator('.testimonials-section');
    await expect(section).toHaveScreenshot('testimonials-desktop.png', {
      maxDiffPixelRatio: 0.01,  // 1% tolerance for antialiasing
    });
  });
});

test.describe('Testimonial section — mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('testimonials render correctly on mobile', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      if (window.gsap) window.gsap.globalTimeline.progress(1);
    });

    const section = page.locator('.testimonials-section');
    await expect(section).toHaveScreenshot('testimonials-mobile.png', {
      maxDiffPixelRatio: 0.01,
    });
  });
});
```

**GSAP freeze helper (reusable):**

```ts
// tests/visual/visual.config.ts
export async function freezeGSAP(page: Page) {
  await page.evaluate(() => {
    if (window.gsap) {
      window.gsap.globalTimeline.progress(1);  // fast-forward to end
    }
  });
  // Wait one frame for final paint
  await page.waitForTimeout(100);
}
```

**GitHub Actions CI (runs against Vercel preview):**

```yaml
name: Visual Regression
on:
  deployment_status:

jobs:
  visual-test:
    if: github.event.deployment_status.state == 'success'
    runs-on: ubuntu-latest
    container:
      image: mcr.microsoft.com/playwright:v1.50.0-noble
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npx playwright test tests/visual/
        env:
          BASE_URL: ${{ github.event.deployment_status.target_url }}
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: visual-diffs
          path: test-results/
```

### What This Catches

| Bug Pattern | How It's Caught |
|------------|----------------|
| SVG wave overlapping testimonial cards | Desktop viewport screenshot — wave covering card text shows as pixel diff |
| Background color mismatch between sections | Full-page screenshot — color shift between adjacent sections appears as diff region |
| Font rendering changes | Any screenshot — text reflow or weight change shows as diff |
| Spacing/padding regressions | Element or page screenshot — layout shifts show as pixel differences |
| GSAP animation breaking layout | `gsap.globalTimeline.progress(1)` freezes at end state — broken final positions show as diff |

### Cost to Maintain

- ~10 test files for key pages, ~30 minutes to write initially
- Baselines regenerated with `npx playwright test --update-snapshots` when design intentionally changes
- ~2-5MB of PNG baselines in the repo (can .gitignore and regenerate in CI if desired)
- CI runs add ~1-2 minutes to the deploy pipeline
- No ongoing subscription cost

### When to Upgrade

If HH grows to a team (multiple devs reviewing each other's visual changes), **then** consider Lost Pixel Platform or Percy for the collaborative review UI. Until then, Playwright built-in is the right tool.

---

## Sources

- [Playwright Visual Comparisons docs](https://playwright.dev/docs/test-snapshots)
- [Playwright Visual Testing Guide (2026)](https://oneuptime.com/blog/post/2026-01-27-playwright-visual-testing/view)
- [Playwright CI docs](https://playwright.dev/docs/ci)
- [Chromatic Pricing](https://www.chromatic.com/pricing)
- [Percy Pricing](https://percy.io/pricing)
- [BackstopJS GitHub](https://github.com/garris/BackstopJS)
- [Lost Pixel GitHub](https://github.com/lost-pixel/lost-pixel)
- [Lost Pixel docs](https://docs.lost-pixel.com/user-docs)
- [Vercel + Playwright E2E guide](https://vercel.com/kb/guide/how-can-i-run-end-to-end-tests-after-my-vercel-preview-deployment)
- [Fixing flaky Playwright visual regression tests](https://www.houseful.blog/posts/2023/fix-flaky-playwright-visual-regression-tests/)
- [Visual Regression Testing Tools 2026 roundup](https://bug0.com/knowledge-base/visual-regression-testing-tools)
- [Autonoma: Regression Testing Vercel Previews](https://www.getautonoma.com/blog/regression-testing-vercel-preview-deployments)
