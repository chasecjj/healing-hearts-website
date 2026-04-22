# AI-Powered Design Review Agents — Research Findings

**Date:** 2026-04-12
**Researcher:** Claude (dispatch agent)
**Purpose:** Can an LLM review screenshots and catch design quality issues that a developer without design training would miss? Find real implementations. Design a repeatable agentic QA loop for Healing Hearts.

---

## Executive Summary

**Yes, this is viable — but the answer is a two-layer system, not pure screenshot review.**

Vision models (Claude, GPT-4V) are strong at holistic design judgment — layout composition, visual hierarchy, "does this feel right?" — but unreliable at exact token compliance (specific hex colors, font families within a category, pixel-level spacing). The practical architecture is:

1. **Deterministic layer** — Playwright computed-style extraction + static analysis catches exact rule violations (pure black, Inter font, touch targets, contrast ratios) with 100% accuracy
2. **Vision layer** — Claude screenshot review catches subjective taste issues (centered heroes, equal grids, overall aesthetic, AI-tell patterns) that no rule engine can express

This combination covers ~95% of the Scoria/taste-skill rules. The remaining 5% (motion/animation quality) requires multi-frame capture or manual review.

**Key finding:** You already have the tools. The Playwright MCP plugin provides browser navigation + screenshots. The Windows MCP provides desktop-level capture. Claude Code's vision is available natively. What's missing is the orchestration — the skill/hook that ties them together into a repeatable loop.

---

## 1. Real Tools & Implementations Found

### Tier 1: Full Pipeline Tools (Most Relevant)

| Tool | What It Does | Status | URL |
|------|-------------|--------|-----|
| **Glance (DebugBase)** | MCP server giving Claude a real Chromium browser. 30 tools including navigation, screenshots, assertions. 97% pass rate across 300+ test steps. | Active, MIT, npm | github.com/DebugBase/glance |
| **claude-code-frontend-dev** | Claude Code plugin implementing a closed loop: write code → screenshot → vision review → auto-fix → repeat. Uses `/frontend-dev` command. | Active (2026) | github.com/hemangjoshi37a/claude-code-frontend-dev |
| **Flawless.is** | Commercial SaaS. URL → full-page screenshot → GPT-4V → structured UX/conversion audit with pinpointed issues. ~12 issues per page. | Active commercial | flawless.is |
| **QA-GPT** | Python tool: Vimium browser navigation → screenshots → GPT-4V analysis → action loop. | Proof of concept | github.com/Nikhil-Kulkarni/qa-gpt |

### Tier 2: Screenshot MCP Servers

| Tool | What It Does | Status |
|------|-------------|--------|
| **Screenshot Analysis MCP (Apify)** | MCP server for layout quality, visual diffs, accessibility, OCR. Native Claude Desktop connection. | Active |
| **mcp-screenshot-website-fast** | Captures + auto-resizes screenshots optimized for LLM vision token limits. | Active |
| **ScreenshotMCP** | Full-page, element-level, multi-device screenshots via MCP. | Active |

### Tier 3: Commercial Visual Testing Platforms

| Tool | Relevance |
|------|-----------|
| **Applitools Eyes** | Industry leader. Visual AI trained on human perception. Now integrating LLMs for test authoring. |
| **Percy (BrowserStack)** | Visual Review Agent (Oct 2025): AI bounding boxes, natural-language summaries, 40% fewer false positives. |
| **Chromatic** | By Storybook team. Screenshot every component story, diff against baselines. |
| **Meticulous.ai** | Records real sessions → replays against PRs → visual diffs as PR comments. Zero test authoring. |
| **Momentic** | AI-native: natural language test definitions, AI element resolution, self-healing tests. $19.2M raised. |
| **Octomind** | AI creates/runs/fixes Playwright tests. MCP integration available. |
| **Autonoma** | Semantic regression: understands code intent, distinguishes intentional changes from regressions. |

### Tier 4: Academic Research

| Source | Key Finding |
|--------|------------|
| **UICrit (Google, UIST 2024)** | 11,344 human design critiques with bounding boxes. Few-shot prompting with similar UIs → 55% improvement in LLM feedback quality. |
| **Baymard Institute GPT-4 UX Audit** | Rigorous evaluation: **80% error rate, 14-26% issue discoverability.** Critical calibration data — LLMs miss most issues when used alone. |

### Tier 5: Accessibility Agents (Claude Code Plugins)

| Tool | What It Does |
|------|-------------|
| **Community-Access/accessibility-agents** | 79 specialized agents, 8 teams, WCAG 2.2 AA. Playwright behavioral scans + screenshot analysis. |
| **CogappLabs accessibility-pro** | Claude Code plugin: axe-core + screenshots → structured JSON findings (critical/serious/moderate). |

---

## 2. Vision Model Capability Assessment

### What Vision Models CAN Reliably Detect

| Category | Reliability | Examples |
|----------|------------|---------|
| **Layout composition** | HIGH | 3-col equal grid vs. bento, centered vs. asymmetric hero, sidebar presence |
| **Visual hierarchy** | HIGH | Heading prominence, CTA visibility, section ordering |
| **Obvious visual problems** | HIGH | Broken images, layout collapse, clipped content, overflow |
| **Content quality** | HIGH | Placeholder text, AI cliches, copy issues |
| **Font category** | HIGH | Serif vs. sans-serif vs. monospace |
| **Color category** | MODERATE | "This is teal" vs. "this is blue" — reliable. Exact shade — not reliable. |
| **Relative spacing** | MODERATE | "This section has more padding than that one" — generally reliable |
| **Font weight/style** | MODERATE | Bold vs. regular, italic vs. upright |

### What Vision Models CANNOT Reliably Detect

| Category | Reliability | Why |
|----------|------------|-----|
| **Exact hex colors** | FAILURE | Cannot distinguish #000000 from #171717 — below perceptual threshold in compressed screenshots |
| **Similar-category fonts** | FAILURE | Cannot distinguish Inter from Outfit from DM Sans — all geometric sans-serifs |
| **Pixel measurements** | FAILURE | Cannot determine 24px vs 32px margin, or 44px vs 40px button height |
| **WCAG contrast ratios** | FAILURE | Cannot compute 4.5:1 ratio from pixels |
| **CSS implementation** | NOT VISIBLE | Flexbox vs grid, animation configs, z-index values |
| **Font fallback detection** | UNRELIABLE | Unless serif → sans-serif fallback (dramatic change) |

### Baymard Study Warning

The Baymard Institute found GPT-4 has an **80% error rate** and **14-26% discoverability rate** for UX issues when reviewing screenshots alone. This means:
- LLMs hallucinate issues that don't exist (false positives)
- LLMs miss most real issues (low recall)
- **LLMs should NOT be the sole reviewer** — they are a complement to deterministic checks, not a replacement

---

## 3. Scoria Rule-by-Rule Assessment

### Rules That Need DOM/CSS Inspection (Deterministic)

| Rule | Why Vision Fails | Playwright Approach |
|------|-----------------|-------------------|
| No pure black (#000000) | Imperceptible difference from #171717 | `getComputedStyle(el).color === 'rgb(0, 0, 0)'` on all elements |
| No Inter font | Indistinguishable from Outfit in rendered text | `getComputedStyle(el).fontFamily.includes('Inter')` |
| Primary teal = #1191B1 | Can't verify exact hex from pixels | Check computed color on primary buttons/links |
| Min 44px touch targets | Can't measure pixel dimensions from screenshot | `el.getBoundingClientRect()` on interactive elements |
| WCAG AA contrast | Can't compute contrast ratios from pixels | Extract text + bg colors, compute ratio |
| No h-screen | CSS property, not visible | Static grep for `h-screen` in source JSX |
| Proper spacing scale | Can't measure exact px values | Grep for arbitrary Tailwind values in source |
| No hardcoded colors | Source code concern | Grep for raw hex values in JSX files |

### Rules Where Vision Excels (Subjective/Holistic)

| Rule | Why Vision Works | What to Prompt |
|------|-----------------|---------------|
| No centered heroes on landing pages | Layout composition is clearly visible | "Is this hero section centered or asymmetric? Is this a landing/conversion page or a sanctuary page?" |
| No 3-column equal grids | Grid structure is obvious visually | "Does this section use 3 equal-width columns? Or is it asymmetric/bento/zig-zag?" |
| Overall "taste" quality | Holistic judgment is vision's strength | "Rate the design sophistication. Does it look like a premium healing brand or a generic template?" |
| Visual hierarchy | Emphasis and flow are perceptual | "What draws the eye first? Is the CTA prominent? Does the heading hierarchy feel natural?" |
| No AI-tell patterns | Pattern recognition at composition level | "Does this look like a generic AI-generated page? Check for: neon glows, oversaturated accents, gradient text headers, generic card layouts" |
| Organic Flow aesthetic | Brand-specific visual style | "Does this page feel warm and organic? Are teardrop image masks and wave dividers present? Does it feel like a healing sanctuary?" |
| Content sensitivity | Copy and tone evaluation | "Check for urgency mechanics, scarcity language, aggressive CTAs. Does the tone feel gentle and warm?" |
| Whitespace management | Spatial feel is perceptual | "Does any section feel empty or cramped? Is the vertical rhythm consistent?" |

### Rules That Need Hybrid Approach

| Rule | DOM Check | Vision Check |
|------|-----------|-------------|
| No AI copywriting cliches | Grep for banned words in source | Vision reads rendered text for tone/voice |
| Section color alternation | Check bg colors of section elements | Vision confirms visual rhythm feels right |
| Warm tinted shadows | Extract box-shadow computed values | Vision judges whether shadows feel warm |

---

## 4. Proposed Architecture: Healing Hearts Design QA Loop

### Overview

```
Trigger (hook/command/dispatch)
        │
        ▼
┌─────────────────────────────────────────────┐
│  LAYER 1: Static Analysis (< 5 seconds)     │
│  ─────────────────────────────────────────── │
│  ESLint + Tailwind plugin on source files    │
│  Grep for banned patterns (h-screen, Inter,  │
│  raw hex, AI cliches, #000)                  │
│  PostCSS audit of compiled CSS (dist/)       │
│                                              │
│  Output: deterministic pass/fail per rule    │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  LAYER 2: Rendered Page Inspection (30-60s)  │
│  ─────────────────────────────────────────── │
│  Playwright navigates to each page           │
│  page.evaluate() extracts:                   │
│    - All computed colors → flag rgb(0,0,0)   │
│    - All computed fontFamily → flag Inter     │
│    - Grid column patterns → flag 1fr 1fr 1fr │
│    - Interactive element sizes → flag < 44px  │
│    - Text + bg colors → compute contrast     │
│  axe-core runs on each page for WCAG         │
│                                              │
│  Output: JSON violations with element refs   │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  LAYER 3: Vision Review (60-120s)            │
│  ─────────────────────────────────────────── │
│  Playwright captures full-page screenshots   │
│  at 1280px (desktop) and 375px (mobile)      │
│                                              │
│  Claude vision reviews each screenshot for:  │
│    - Hero alignment (asymmetric vs centered) │
│    - Grid patterns (bento vs equal columns)  │
│    - Overall aesthetic quality (taste score)  │
│    - AI-tell patterns (neon, gradients, etc.) │
│    - Brand feel (warm? healing? sanctuary?)   │
│    - Content sensitivity (urgency? scarcity?) │
│    - Visual hierarchy and CTA prominence     │
│    - Whitespace and section rhythm            │
│                                              │
│  Output: structured JSON with findings,      │
│  severity, and specific recommendations      │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  REPORT: Unified Findings                    │
│  ─────────────────────────────────────────── │
│  Merge all three layers into one report      │
│  Group by page → by severity → by rule       │
│  Deterministic violations = hard failures    │
│  Vision findings = advisory with confidence  │
│  Save to .dispatch/tasks/ or output.md       │
└─────────────────────────────────────────────┘
```

### Implementation as a Claude Code Skill

The natural home for this is a Scoria skill (or Claude Code plugin command) that can be invoked as `/design-review` or dispatched as a background agent.

```
# Skill: design-review
# Trigger: /design-review, "review design", "check design quality"

## Workflow

1. Start dev server (npm run dev) if not running
2. Get page list from src/App.jsx router config
3. For each page:
   a. Playwright navigate to http://localhost:5173{route}
   b. Run Layer 2 checks via page.evaluate()
   c. Run axe-core via @axe-core/playwright
   d. Capture full-page screenshot (desktop + mobile)
   e. Send screenshot to Claude vision with taste-skill prompt
4. Aggregate findings
5. Write report
```

### Vision Review Prompt Template

The prompt sent with each screenshot should be specific and structured:

```
You are a senior UI/UX design reviewer for Healing Hearts, a grief and relationship 
healing brand. Review this screenshot against the following design system rules.

BRAND CONTEXT:
- This is a healing/grief brand. The feel should be: warm, safe, hopeful sanctuary.
- Color palette: Teal primary (#1191B1), Salmon accent (#B96A5F), warm neutrals.
- Fonts: Outfit (headings), Plus Jakarta Sans (body), Playfair Display (accent/hero).
- Design direction: Organic Flow — teardrop image masks, organic wave dividers.

CHECK EACH OF THESE (report PASS, FAIL, or UNCERTAIN with explanation):

1. HERO LAYOUT: Is the hero section centered or asymmetric?
   - FAIL if centered on a landing/conversion page
   - PASS if centered on a sanctuary page (About, Course Overview)
   - PASS if asymmetric (split, left-aligned, offset)

2. GRID PATTERNS: Are there any 3-column equal-width card rows?
   - FAIL if 3 identical cards in a row at equal width
   - PASS if bento, 2+1, zig-zag, or varied-width layout

3. OVERALL AESTHETIC: Rate 1-10 on design sophistication.
   - Flag if it looks like a generic template or default AI output
   - Note any AI-tell patterns: neon glows, gradient text, oversaturated colors

4. BRAND FEEL: Does this feel like a healing sanctuary?
   - Check for warm, organic visual language
   - Flag any clinical, corporate, or tech-startup aesthetics
   - Flag any urgency mechanics, countdown timers, scarcity language

5. VISUAL HIERARCHY: Is the page's information architecture clear?
   - Can you tell what the primary action is?
   - Does the heading hierarchy feel natural?
   - Is there a clear reading flow?

6. WHITESPACE: Is the vertical rhythm consistent?
   - Flag sections that feel empty or cramped
   - Check for consistent section padding

7. CONTENT TONE: Read any visible text.
   - Flag AI cliches: "Elevate", "Seamless", "Unleash", "Next-Gen", "Revolutionary"
   - Flag aggressive language: "Don't miss out", "Act now", "Limited time"
   - Check that copy feels warm and direct, not clinical or condescending

8. MOBILE QUALITY (if mobile screenshot): 
   - Does the layout collapse cleanly to single column?
   - Are elements readable without zooming?
   - Is there any horizontal overflow?

Return findings as structured JSON:
{
  "page": "<page name>",
  "viewport": "<desktop|mobile>",
  "overall_score": <1-10>,
  "findings": [
    {
      "rule": "<rule name>",
      "status": "PASS|FAIL|UNCERTAIN",
      "severity": "critical|warning|info",
      "description": "<what was found>",
      "recommendation": "<specific fix>"
    }
  ]
}
```

### Integration Points

**Option A: Claude Code Skill (Recommended)**
- Create a `/design-review` skill in Scoria or as a standalone plugin
- Invoke manually after building a page or before deploy
- Uses Playwright MCP tools already installed

**Option B: Claude Code Hook (Pre-commit/Pre-deploy)**
- PostToolUse hook on `Bash` that detects `git push` or `npm run build`
- Automatically triggers a lightweight review (Layer 1 + Layer 2 only, skip vision for speed)
- Vision review runs as a separate dispatched agent

**Option C: Dispatch Agent (Background)**
- Dispatch a background agent for full 3-layer review
- Runs in parallel while the developer continues working
- Results written to `.dispatch/tasks/design-review-{date}/output.md`

**Option D: Scheduled/Cron Review**
- Weekly cron that reviews all pages
- Catches drift over time (e.g., someone adds Inter via a dependency update)

### What You Already Have

You don't need to install anything new. Your current setup provides:

| Capability | Tool Already Available |
|-----------|----------------------|
| Browser navigation | Playwright MCP (`browser_navigate`) |
| Screenshot capture | Playwright MCP (`browser_take_screenshot`) |
| DOM inspection | Playwright MCP (`browser_evaluate`, `browser_snapshot`) |
| Vision analysis | Claude's native multimodal vision |
| Desktop capture | Windows MCP (`Snapshot`) |
| Background execution | Dispatch system (`.dispatch/tasks/`) |
| WCAG checking | Can be added via page.evaluate() with axe-core |

---

## 5. Limitations and Risks

### Vision Layer Limitations

1. **80% error rate on standalone UX audits** (Baymard). Vision review MUST be combined with deterministic checks, never used alone.
2. **Cannot verify exact token values.** Any rule about specific hex colors, font names, or pixel measurements needs DOM inspection.
3. **Single-frame limitation.** Cannot evaluate animation quality, transition smoothness, or motion intensity from a static screenshot.
4. **Compressed screenshots lose detail.** Subtle differences in color, shadow quality, and fine typography are lost in JPEG/PNG compression.
5. **Hallucination risk.** LLMs may report issues that don't exist (false positives). All vision findings should be treated as advisory, not definitive.

### Deterministic Layer Limitations

1. **Computed styles require a running browser.** Can't check rendered output from source alone (CSS cascading, Tailwind compilation, inherited styles).
2. **Static analysis misses runtime state.** Hover states, active states, modals, dynamic content won't be checked unless explicitly triggered.
3. **axe-core catches ~30-40% of WCAG issues.** Manual accessibility testing is still needed for complex interactions.

### Workflow Risks

1. **Speed vs. thoroughness.** Full 3-layer review of 14+ pages takes 3-5 minutes. This is fine for pre-deploy but too slow for pre-commit.
2. **LLM cost.** Vision analysis of full-page screenshots at 1280px is ~1000-3000 tokens per image. 14 pages x 2 viewports = 28 screenshots = moderate token usage.
3. **Prompt drift.** The vision review prompt must stay in sync with DESIGN.md. If design rules change, the prompt must be updated.

---

## 6. Recommended Next Steps

### Phase 1: Quick Wins (1-2 hours)

1. **Create a Playwright design-lint script** that visits each page and checks:
   - All computed colors for `rgb(0, 0, 0)` (pure black)
   - All computed fontFamily for "Inter"
   - All grid elements for `1fr 1fr 1fr` patterns
   - All interactive elements for < 44px dimensions
   - Run axe-core for WCAG violations
   
   This alone would catch the majority of deterministic rule violations.

2. **Add static grep checks** to the existing lint/build process:
   - `h-screen` in JSX className strings
   - Raw hex values in component files
   - Banned words in copy (AI cliches, urgency language)

### Phase 2: Vision Review Skill (2-4 hours)

3. **Build a `/design-review` skill** that:
   - Starts dev server
   - Runs the deterministic script from Phase 1
   - Captures desktop + mobile screenshots of each page
   - Sends to Claude vision with the structured prompt template
   - Writes a unified report

4. **Integrate with the dispatch system** so it can run in background.

### Phase 3: Continuous Integration (2-4 hours)

5. **Create a pre-deploy hook** that runs Layer 1 + Layer 2 (fast, deterministic checks) on every build.

6. **Create a weekly cron** that runs the full 3-layer review and reports drift.

### Phase 4: Refinement (Ongoing)

7. **Calibrate the vision prompt** based on real results. Tune severity thresholds, add/remove checks based on false positive rates.

8. **Build a baseline** — run the full review on the current site to establish what "passing" looks like, then use that as a regression baseline.

---

## 7. Tools Worth Investigating Further

| Tool | Why | Effort |
|------|-----|--------|
| **claude-code-frontend-dev** | Already implements the closed code→screenshot→fix loop. May be usable as-is or forkable. | Low — try it |
| **Community-Access/accessibility-agents** | 79 specialized a11y agents. Could complement design review with thorough WCAG coverage. | Low — install plugin |
| **UICrit dataset** | Academic foundation for design critique prompting. Few-shot examples improve quality 55%. | Medium — study for prompt engineering |
| **Autonoma** | Semantic visual regression: understands code intent vs. visual output. Novel approach. | Medium — evaluate |
| **eslint-plugin-tailwindcss** | Catches arbitrary values in source. Zero-cost CI integration. | Low — add to ESLint config |

---

## 8. Bottom Line

**Can an LLM review screenshots and catch design quality issues?** Yes, but with significant caveats:

- **Vision alone is insufficient.** It catches ~40% of design system rules and has an 80% error rate on detailed UX audits.
- **Vision + DOM inspection is powerful.** The combination covers ~95% of rules with high confidence.
- **The UICrit research shows that structured prompting with design system context dramatically improves LLM review quality** — a generic "review this design" prompt performs poorly, but a prompt loaded with Scoria's specific rules and brand context performs well on holistic judgments.
- **You already have the infrastructure.** Playwright MCP + Claude vision + dispatch = everything needed for a repeatable loop. The missing piece is the orchestration skill.

**Recommended first action:** Build the Playwright computed-style checker. It's fast, deterministic, catches the highest-impact violations (pure black, wrong fonts, small touch targets), and requires no LLM. Layer the vision review on top for the subjective taste checks.
