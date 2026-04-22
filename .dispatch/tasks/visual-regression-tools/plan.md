# Visual Regression Testing Tools — Research Plan

## Context
Solo dev building healingheartscourse.com (React 19, Vite 7, Tailwind 3, GSAP, Vercel).
Bug pattern: decorative SVG waves with z-10 overlapping testimonial cards (no z-index), visible only on desktop viewports. Also subtle background color mismatches.

## Checklist

- [x] Research Playwright visual comparison capabilities — built-in toHaveScreenshot(), disables CSS animations, needs Clock API for GSAP, Docker image for CI consistency
- [x] Research Chromatic — Storybook-required, 5k snapshots/mo free, $179/mo starter
- [x] Research Percy — 5k screenshots/mo free, $449+/mo paid, SDK integration
- [x] Research BackstopJS — OSS but effectively unmaintained (no releases in 12+ months), stuck on Node 20
- [x] Research Lost Pixel — OSS core + cloud platform, free for small projects, Playwright-based page screenshots
- [x] Evaluate each tool against HH-specific criteria — full matrix in output.md, Playwright wins on all dimensions except diff review UI (doesn't matter for solo dev)
- [x] Write verdict with recommended tool and setup sketch — Playwright toHaveScreenshot() with GSAP freeze helper + GitHub Actions CI against Vercel previews
- [x] Write output.md with full findings — complete with evaluation matrix, code examples, and upgrade path
