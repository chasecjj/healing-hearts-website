# Agentic Visual QA Loop — Architecture Document

**Date:** 2026-04-12
**Author:** Claude (dispatched architecture task)
**Status:** Design complete — ready for implementation

---

## Executive Summary

This document defines a practical agentic QA pipeline for Claude Code that automatically detects visual bugs, cross-references source code, applies fixes, and verifies the results. It uses Playwright MCP for full-resolution screenshots and DOM access, source code Grep for root-cause analysis, and a structured detect-fix-verify loop with a maximum of 3 iterations.

**Key design decisions (from today's session):**
- Playwright full-res screenshots + source code Grep is the most effective approach
- Windows MCP is too low-resolution for web content — excluded from the pipeline
- Split "what's wrong visually" (visual-analyst) from "what code causes it" (source-fixer) into separate agents
- Integrate with existing Scoria validation (taste-skill, design tokens, a11y) rather than duplicating

---

## 1. System Overview

```
User invokes:  /visual-qa sweep          (full site)
               /visual-qa page /about    (single page)
               /loop 3m /visual-qa page /about  (watch mode)

                          │
                          ▼
          ┌───────────────────────────────┐
          │   visual-qa-sweep (skill)     │
          │   Orchestrator                │
          │   • Determines scope (URLs)   │
          │   • Manages iteration loop    │
          │   • Consolidates reports      │
          └──────────┬────────────────────┘
                     │
        ┌────────────┼──────────────┐
        ▼            │              │
   Phase 1:      Phase 2:      Phase 3:
   DETECT        FIX           VERIFY
   (visual-      (source-      (visual-
    analyst)      fixer)        analyst)
        │            │              │
        └────────────┼──────────────┘
                     │
              findings[]  ──→  fixes[]  ──→  verdict
                     │
              Max 3 iterations
              then final report
```

---

## 2. Viewport Matrix

| Name | Width | Height | Tailwind Breakpoint | Rationale |
|------|-------|--------|-------------------|-----------|
| mobile | 375 | 812 | Below `sm` (640) | iPhone SE — most common mobile. Catches text overflow, horizontal scroll, hidden elements |
| tablet | 768 | 1024 | `md` | iPad portrait — layout shift breakpoint. Catches sidebar collapse, grid reflow |
| laptop | 1024 | 768 | `lg` | Small laptop / iPad landscape. Catches the lg: breakpoint where most HH layouts switch from stack to side-by-side |
| desktop | 1280 | 800 | `xl` | Standard laptop. Catches max-width container issues, wide-screen spacing |

**Matches:** Forge Lite's existing viewport set (375, 768, 1024, 1280) and Tailwind's default breakpoints.

**Screenshot strategy per viewport:**
1. `browser_resize` to viewport dimensions
2. `browser_navigate` to target URL
3. `browser_wait_for` — wait for page load (text or time-based)
4. `browser_take_screenshot` with `fullPage: true` — captures entire scrollable page
5. `browser_snapshot` (mobile + desktop only) — captures a11y tree for structural analysis
6. `browser_evaluate` — run computed style checks (z-index stacking, overflow clipping, element overlap)
7. `browser_console_messages` — capture runtime errors/warnings

---

## 3. Component Definitions

### 3.1 visual-qa-sweep (Skill — Orchestrator)

```yaml
---
name: visual-qa-sweep
description: >
  Trigger when the user says "visual QA", "check for visual bugs", "screenshot sweep",
  "responsive check", "/visual-qa", or "check how it looks". Also trigger after any
  Forge Lite build completes. Runs Playwright-based visual analysis at 4 viewports,
  detects bugs, cross-references source code, and optionally applies fixes.
---
```

**Three modes of operation:**

| Mode | Invocation | Behavior |
|------|-----------|----------|
| `sweep` | `/visual-qa sweep` | Full site — iterates all marketing pages + portal shell |
| `page` | `/visual-qa page /about` | Single page — fastest, used during development |
| `watch` | `/loop 3m /visual-qa page /about` | Continuous — re-checks after each interval |

**URL inventory for `sweep` mode:**

```
Marketing (14 pages):
  /, /about, /programs, /spark-challenge, /team, /contact,
  /resources, /tools, /faq, /privacy, /terms,
  /physician-marriages, /course-overview, /coming-soon

Auth (4 pages — screenshot only, no interaction):
  /login, /signup, /forgot-password, /reset-password

Portal (3 routes — requires auth, skip in unauthenticated sweep):
  /portal, /portal/:moduleSlug, /portal/:moduleSlug/:lessonSlug
```

**Orchestration logic:**

```
1. DETERMINE SCOPE
   - Parse mode from user input (sweep | page <url> | watch)
   - If sweep: build URL list from App.jsx routes
   - If page: use provided URL
   - Ensure dev server is running (check localhost:5173, start if needed)

2. PHASE 1 — DETECT
   Dispatch visual-analyst agent with:
   - URLs to check
   - Viewport matrix (all 4)
   - Detection dimensions (all 5)
   Output: findings[] array

3. DECISION GATE
   - If findings is empty → report "No visual issues found" → DONE
   - If findings exist → ask user: "Found N issues. Fix automatically? [Y/n]"
   - If user declines → report findings → DONE
   - If user approves (or in auto-fix mode) → Phase 2

4. PHASE 2 — FIX (max 3 iterations)
   Dispatch source-fixer agent with:
   - findings[] from Phase 1 (or remaining from prior iteration)
   - File paths from findings
   Output: fixes[] array

5. PHASE 3 — VERIFY
   Dispatch visual-analyst agent with:
   - Same URLs as Phase 1
   - Same viewports
   - Previous findings to compare against
   Output: verdict { resolved[], remaining[], regressions[] }

6. LOOP CHECK
   - If remaining is empty AND regressions is empty → SUCCESS
   - If iteration < 3 AND (remaining or regressions exist) → Phase 2 again
   - If iteration >= 3 → report remaining issues as manual-fix-needed → DONE

7. REPORT
   Produce consolidated report (format in Section 6)
```

**Auto-fix mode:** When invoked from Forge Lite's validate stage or from `/loop`, auto-fix mode is ON — no user confirmation needed for fixes. When invoked manually, confirmation is required.

---

### 3.2 visual-analyst (Agent — Detection)

```yaml
---
name: visual-analyst
description: >
  Use this agent to perform visual QA analysis on web pages using Playwright screenshots
  and source code analysis. Read-only — does not modify files. Takes screenshots at
  multiple viewports, analyzes for visual bugs, cross-references source code patterns,
  and outputs structured findings. Invoke for visual bug detection, responsive testing,
  design token compliance checking, or accessibility structure audits.
model: opus
allowedTools:
  - Read
  - Glob
  - Grep
  - mcp__plugin_playwright_playwright__browser_navigate
  - mcp__plugin_playwright_playwright__browser_resize
  - mcp__plugin_playwright_playwright__browser_take_screenshot
  - mcp__plugin_playwright_playwright__browser_snapshot
  - mcp__plugin_playwright_playwright__browser_evaluate
  - mcp__plugin_playwright_playwright__browser_console_messages
  - mcp__plugin_playwright_playwright__browser_wait_for
  - mcp__plugin_playwright_playwright__browser_tabs
  - mcp__plugin_playwright_playwright__browser_close
---
```

**5 Detection Dimensions:**

#### Dimension 1 — Layout & Clipping

Visual analysis of screenshots for:
- **Element clipping:** Content cut off by `overflow: hidden` on parent containers (e.g., testimonial cards clipped by decorative wave — the bug fixed in commit 3acb62b)
- **Z-index stacking:** Elements overlapping incorrectly (modals behind content, dropdowns under siblings)
- **Whitespace gaps:** Unintended gaps between sections, misaligned columns
- **Text overflow:** Text breaking out of containers, ellipsis where content should be visible

**Detection method:** Screenshot analysis (vision) + `browser_evaluate` to check computed `overflow`, `z-index`, and `clip-path` values on flagged elements.

#### Dimension 2 — Responsive Breaks

Compare screenshots across the 4 viewports for:
- **Horizontal scrolling on mobile:** Content wider than viewport (the #1 mobile bug)
- **Layout collapse:** Elements that stack incorrectly when viewport narrows
- **Hidden content:** Elements with `hidden lg:block` that hide important content on mobile
- **Touch target size:** Interactive elements smaller than 44x44px on mobile

**Detection method:** Screenshot comparison across viewports + `browser_evaluate` to check `document.documentElement.scrollWidth > window.innerWidth` and element bounding boxes.

#### Dimension 3 — Design Token Compliance

Source code analysis (Grep) for taste-skill and design-system-guard violations:

```bash
# Hardcoded hex colors in JSX
grep -nE '#[0-9a-fA-F]{3,8}' src/pages/{PageName}.jsx

# Arbitrary Tailwind color classes
grep -nE '(text|bg|border|ring|fill|stroke|from|to|via|divide|outline|decoration|shadow|accent|caret|placeholder)-\[#' src/pages/{PageName}.jsx

# Inter font (banned)
grep -niE "(Inter|font-inter|'Inter'|\"Inter\")" src/

# Pure black (banned)
grep -niE '#000000|#000[^0-9a-fA-F]|bg-black[^/]' src/pages/{PageName}.jsx

# AI purple/neon glow (banned)
grep -niE '(purple|violet|indigo).*glow|(box-shadow.*purple|box-shadow.*violet)' src/

# Oversized gradient text (flagged)
grep -niE 'bg-gradient.*text-transparent.*bg-clip-text' src/pages/{PageName}.jsx

# h-screen (banned — use min-h-[100dvh])
grep -nE 'h-screen' src/pages/{PageName}.jsx

# 3-column equal grid (banned when DESIGN_VARIANCE > 4)
grep -nE 'grid-cols-3\b' src/pages/{PageName}.jsx
```

#### Dimension 4 — Accessibility Structure

From `browser_snapshot` (a11y tree) analysis:
- **Heading hierarchy:** No level skips (h1→h3 without h2 is a violation)
- **Image alt text:** Every `<img>` must have `alt` (meaningful or empty for decorative)
- **Button accessible names:** Icon-only buttons must have `aria-label`
- **Form labels:** Every input needs a label (not just placeholder)
- **Click handlers on divs:** Non-interactive elements with onClick need `role`, `tabIndex`, `onKeyDown`

**Detection method:** Parse `browser_snapshot` output for heading structure, missing labels, unlabeled interactive elements.

#### Dimension 5 — Runtime Errors

From `browser_console_messages` and `browser_evaluate`:
- **Console errors:** Any error-level console messages during page load
- **Failed network requests:** 404s for images, scripts, API calls
- **React hydration warnings:** Client/server mismatch (less relevant for SPA, but catches dev-mode warnings)
- **GSAP animation errors:** Missing ScrollTrigger targets, animation on unmounted elements

**Detection method:** `browser_console_messages` with `level: "error"` after page load + screenshot.

**Output format:** Structured findings array (see Section 4).

---

### 3.3 source-fixer (Agent — Remediation)

```yaml
---
name: source-fixer
description: >
  Use this agent to fix visual bugs identified by the visual-analyst agent.
  Receives structured findings with file paths, line numbers, and likely causes.
  Reads source code, applies minimal targeted fixes, and verifies the build compiles.
  Only modifies files specified in findings — does not refactor or improve surrounding code.
model: opus
allowedTools:
  - Read
  - Edit
  - Glob
  - Grep
  - Bash
---
```

**Fix strategy (ordered by preference):**

1. **Tailwind class fix:** Change/add/remove Tailwind classes (most common — 70% of visual bugs)
2. **JSX structure fix:** Wrap elements, reorder children, add missing attributes (20%)
3. **CSS/style fix:** Modify inline styles or GSAP animation parameters (10%)

**Rules:**

| Rule | Why |
|------|-----|
| Only modify files listed in findings | Prevents scope creep — analyst identified the targets |
| One finding = one minimal Edit | Atomic changes that can be individually verified |
| Run `npm run build` after all fixes | Catch compilation errors before verification |
| Never add new dependencies | Fixes use existing Tailwind classes and Scoria components |
| Never refactor surrounding code | A fix for clipped text doesn't need adjacent code cleaned up |
| Use Scoria component when available | If a finding suggests replacing custom UI, prefer @scoria/ui component |
| Preserve GSAP animation structure | Don't remove/restructure GSAP code — fix only the specific property causing the issue |

**Bash usage (strictly limited):**

```bash
npm run build 2>&1 | tail -20    # Verify compilation after fixes
```

No other Bash usage permitted. No dev server, no lint, no git operations.

**Output format:**

```markdown
## Fixes Applied

| Finding ID | File | Change | Build Status |
|-----------|------|--------|-------------|
| F-001 | src/pages/About.jsx:42 | Added `overflow-visible` to testimonial wrapper | OK |
| F-002 | src/pages/Home.jsx:118 | Changed `h-screen` to `min-h-[100dvh]` | OK |
| ... | ... | ... | ... |

**Build result:** PASS / FAIL (if FAIL: error details)
```

---

## 4. Findings Schema

Each finding is a structured object that flows from visual-analyst to source-fixer:

```typescript
interface Finding {
  // Identity
  id: string;                    // "F-001", "F-002", etc.
  severity: "critical" | "high" | "medium" | "low";
  dimension: "layout" | "responsive" | "tokens" | "a11y" | "runtime";

  // Location
  url: string;                   // "/about", "/spark-challenge"
  viewport: string;              // "mobile" | "tablet" | "laptop" | "desktop" | "all"
  file: string;                  // "src/pages/About.jsx"
  line: number | null;           // Line number if identified, null if vision-only

  // Description
  symptom: string;               // What's visually wrong (human-readable)
  likely_cause: string;          // What code pattern likely causes it
  suggested_fix: string;         // Specific fix suggestion

  // Evidence
  screenshot_ref: string | null; // Filename of screenshot showing the bug
  grep_match: string | null;     // The grep result that flagged this
}
```

**Severity definitions (aligned with existing code-reviewer scale):**

| Level | Visual QA Meaning |
|-------|------------------|
| **Critical** | Content completely invisible, page broken, horizontal scroll on mobile, runtime crash |
| **High** | Content partially clipped, significant layout misalignment, wrong colors breaking brand |
| **Medium** | Spacing inconsistency, minor alignment issue, non-critical token violation |
| **Low** | Subtle whitespace gap, could-be-better responsive behavior, style preference |

---

## 5. Integration Points

### 5.1 Forge Lite Integration

The visual-qa-sweep **replaces** Forge Lite's Category B "Responsive viewports" soft flag, which currently only takes screenshots without analyzing them. Integration point:

**In Forge Lite's Validate stage (Category B):**
```
# BEFORE (current):
# Take Playwright screenshots at 375, 768, 1024, 1280 — manual review

# AFTER (with visual-qa-sweep):
Invoke visual-qa-sweep in page mode:
  /visual-qa page {page_url}
  --auto-fix        (no user confirmation)
  --skip-sweep      (single page, not full site)

Report findings as Category B soft flags.
If critical findings exist, escalate to hard gate.
```

The visual-qa-sweep subsumes the Forge Lite responsive check and adds: analysis, source cross-reference, and optional auto-fix. Forge Lite's other Category B checks (taste-skill patterns, bundle size, content quality) remain separate.

### 5.2 /loop Integration

Two /loop patterns:

**Pattern A — Fixed interval watch (during active development):**
```
/loop 3m /visual-qa page /about
```
- Checks `/about` every 3 minutes
- Good for: watching a page while making changes in another terminal
- Auto-fix OFF (reports only — user decides what to fix)

**Pattern B — Self-pacing sweep (background QA):**
```
/loop /visual-qa sweep
```
- Self-pacing via `ScheduleWakeup`:
  - 270s delay if fixes were applied (stay in cache, verify quickly)
  - 1200s delay if no issues found (idle monitoring)
  - Stops when 2 consecutive clean sweeps
- Auto-fix ON (applies fixes between iterations)

### 5.3 Hook Integration

**New hook: visual-qa-notify (advisory)**

```yaml
---
name: visual-qa-notify
event: PostToolUse
matcher: Edit|Write
language: prompt
mode: advisory
---
```

**Purpose:** When the visual-qa-sweep skill is actively running (in /loop mode), this hook notes which JSX files were modified so the next sweep iteration can prioritize those pages. It does NOT block edits — it's purely informational.

**Logic:**
1. Check if a `.visual-qa-active` marker file exists (created by the skill at start, deleted at end)
2. If active: append the modified file path to `.visual-qa-queue`
3. The next sweep iteration reads `.visual-qa-queue` and prioritizes those URLs
4. If not active: no-op

This hook is intentionally lightweight — the design-system-guard hook already catches token violations at write time (hardcoded hex, arbitrary spacing, wrong fonts). The visual-qa-notify hook complements it by triggering visual re-validation of the rendered output.

### 5.4 Existing Hook Compatibility

The visual-qa-sweep skill works alongside existing hooks:

| Hook | Relationship |
|------|-------------|
| `pre-deploy-gate.sh` | Unchanged — blocks `git push` unless `/deploy-check` ran. Visual QA is a separate concern. |
| `design-system-guard` (Scoria) | Complementary — guard catches token violations at write-time; visual-qa catches rendered visual bugs. No overlap, no conflict. |
| `a11y-check` (Scoria) | Partially overlapping — visual-analyst's Dimension 4 (a11y structure) covers similar ground. When both are active, visual-analyst defers to a11y-check for write-time validation and focuses on render-time a11y (actual DOM tree from `browser_snapshot`). |

### 5.5 Existing Agent Compatibility

The visual-qa agents work alongside the review pipeline:

| Agent | Relationship |
|-------|-------------|
| `code-reviewer` | No overlap — code-reviewer examines code logic/patterns; visual-analyst examines rendered output. They find different classes of bugs. |
| `security-auditor` | No overlap — security focuses on auth, injection, credentials; visual-qa focuses on layout, responsiveness, tokens. |
| `quality-gate` | Partial overlap on build check — source-fixer runs `npm run build` to verify fixes; quality-gate runs it as Check 2. When deploying, quality-gate is authoritative. |

---

## 6. Output Format

The visual-qa-sweep skill produces this consolidated report:

```markdown
## Visual QA Report: [scope description]

**Pages scanned:** N
**Viewports checked:** mobile (375), tablet (768), laptop (1024), desktop (1280)
**Dimensions checked:** Layout/Clipping, Responsive Breaks, Design Tokens, A11y Structure, Runtime Errors

---

### Findings

| ID | Severity | Dimension | Page | Viewport | Symptom | File:Line | Status |
|----|----------|-----------|------|----------|---------|-----------|--------|
| F-001 | High | Layout | /about | desktop | Testimonial cards clipped by wave | src/pages/About.jsx:142 | Fixed |
| F-002 | Medium | Tokens | /home | all | Hardcoded #1191B1 instead of primary token | src/pages/Home.jsx:87 | Fixed |
| F-003 | Low | Responsive | /contact | mobile | Form button slightly narrow at 375px | src/pages/Contact.jsx:63 | Deferred |

### Fix Summary

- **Fixed:** N findings (auto-applied and verified)
- **Deferred:** N findings (low severity, listed for manual review)
- **Failed:** N findings (attempted fix but regression detected — reverted)
- **Iterations:** N/3

### Regressions Detected

*(List any new issues introduced by fixes — if none: "No regressions detected.")*

---

### Verdict: CLEAN | HAS_ISSUES | NEEDS_MANUAL_REVIEW

- **CLEAN:** All findings resolved, no regressions.
- **HAS_ISSUES:** Some findings remain after 3 iterations — manual attention needed.
- **NEEDS_MANUAL_REVIEW:** Critical findings that require human judgment (e.g., design intent ambiguity).
```

---

## 7. Implementation Roadmap

### Phase A — Core (implement first)

1. **Create `visual-analyst` agent** at `.claude/agents/visual-analyst.md`
   - The detection engine — read-only, Playwright + Grep
   - Test against 2-3 known bug patterns from recent git history

2. **Create `source-fixer` agent** at `.claude/agents/source-fixer.md`
   - The remediation engine — receives findings, applies fixes
   - Test with a deliberate bug (e.g., revert commit 3acb62b, run fixer)

3. **Create `visual-qa-sweep` skill** at `.claude/skills/visual-qa-sweep.md`
   - The orchestrator — `page` mode first, `sweep` later
   - Wire up the 3-phase loop with max 3 iterations

### Phase B — Integration (implement after core works)

4. **Add `/loop` support** in the skill
   - `ScheduleWakeup` with 270s/1200s pacing logic
   - `.visual-qa-active` marker file for hook coordination

5. **Create `visual-qa-notify` hook**
   - PostToolUse advisory on Edit/Write to *.jsx
   - Queue file for priority re-scan

6. **Wire into Forge Lite validate stage**
   - Replace Category B "Responsive viewports" with `/visual-qa page` invocation
   - Map findings to soft flags (critical → hard gate escalation)

### Phase C — Polish (after integration works)

7. **Screenshot diffing** — save before/after screenshots and produce visual diff
8. **Cumulative report** — `/visual-qa report` outputs a markdown summary of all findings across sessions
9. **Portal auth sweep** — authenticated sweep of portal routes with test user credentials

---

## 8. Constraints & Risks

| Constraint | Mitigation |
|-----------|-----------|
| **Screenshot analysis is non-deterministic** — Claude may miss subtle bugs or flag false positives | Max 3 fix iterations prevents infinite loops. User confirmation gate (when not in auto-fix mode) catches false positives. |
| **Dev server must be running** — Playwright navigates to localhost:5173 | Skill checks port availability and starts `npm run dev` if needed (background process). |
| **Playwright MCP has no native visual diff** — can't do pixel-level before/after comparison | Use Claude vision to compare screenshots instead. Save screenshots with consistent naming for manual comparison. |
| **Full site sweep is slow** — 14+ pages × 4 viewports × screenshot + analysis | Sweep mode prioritizes: (1) recently modified pages, (2) pages with prior findings, (3) remaining pages. Use `page` mode for fast iteration. |
| **Source-fixer could introduce regressions** — fixing one bug may break another area | Verify phase re-screenshots the same URLs. Build check catches compilation errors. Max 3 iterations limits cascade. |
| **Token compliance Grep has false positives** — hex colors in comments, SVG attributes, etc. | Visual-analyst reads surrounding context (Read tool) to verify grep matches are in executable code, not comments/SVGs. |

---

## 9. Tool Usage Budget

Estimated tool calls per mode:

| Mode | Playwright Calls | Grep/Read Calls | Edit Calls | Total | Est. Time |
|------|-----------------|-----------------|------------|-------|-----------|
| `page` (1 URL, detect only) | ~10 (4 resize + 4 screenshot + 1 snapshot + 1 evaluate) | ~12 (8 grep patterns + 4 file reads) | 0 | ~22 | 30-60s |
| `page` (1 URL, detect + fix + verify) | ~20 | ~20 | ~5 | ~45 | 2-3 min |
| `sweep` (14 URLs, detect only) | ~140 | ~100 | 0 | ~240 | 10-15 min |
| `sweep` (14 URLs, detect + fix + verify) | ~280 | ~200 | ~30 | ~510 | 20-30 min |

**Context window budget:** Each screenshot consumes significant vision tokens. At 4 viewports × 14 pages = 56 screenshots, this would exceed context limits. The visual-analyst agent processes pages in batches of 3-4, summarizing findings and discarding screenshots between batches. Only screenshots with findings are retained for the source-fixer.

---

## 10. Example Session

```
User: /visual-qa page /about

Skill (visual-qa-sweep):
  "Running visual QA on /about at 4 viewports..."

  → Dispatches visual-analyst agent
    Agent navigates to localhost:5173/about
    Resizes to 375×812, takes fullPage screenshot
    Resizes to 768×1024, takes fullPage screenshot
    Resizes to 1024×768, takes fullPage screenshot
    Resizes to 1280×800, takes fullPage screenshot
    Takes a11y snapshot at 375 and 1280
    Runs browser_evaluate for overflow/z-index checks
    Greps About.jsx for token violations
    Returns findings:
      F-001: High/Layout — wave SVG clips testimonial cards at 1280px
        file: src/pages/About.jsx:142
        cause: parent div has overflow-hidden, wave extends beyond
        fix: change overflow-hidden to overflow-visible on line 142

Skill:
  "Found 1 issue on /about. Fix automatically? [Y/n]"

User: y

Skill:
  → Dispatches source-fixer agent with F-001
    Agent reads About.jsx, confirms overflow-hidden on line 142
    Applies Edit: overflow-hidden → overflow-visible
    Runs npm run build — PASS
    Returns: F-001 fixed, build OK

  → Dispatches visual-analyst for verification
    Re-screenshots /about at 1280px
    Confirms: testimonial cards no longer clipped
    No regressions detected

Skill:
  "## Visual QA Report: /about
   Findings: 1 (1 fixed, 0 deferred, 0 failed)
   Verdict: CLEAN"
```

---

## Appendix A: Full Grep Pattern Library

These patterns are used by the visual-analyst agent's Dimension 3 (Design Token Compliance):

```bash
# === TASTE-SKILL FORBIDDEN PATTERNS ===

# Inter font (banned entirely)
grep -niE "(Inter|font-inter|'Inter'|\"Inter\")" {file}

# Pure black (use off-black/zinc-950/charcoal instead)
grep -niE '#000000|#000[^0-9a-fA-F]|bg-black[^/]' {file}

# AI purple/neon glow
grep -niE '(purple|violet|indigo).*glow|(box-shadow.*purple|box-shadow.*violet)' {file}

# Oversized gradient text
grep -niE 'bg-gradient.*text-transparent.*bg-clip-text' {file}

# h-screen (use min-h-[100dvh] instead)
grep -nE 'h-screen' {file}

# 3-column equal grid (banned when DESIGN_VARIANCE > 4)
grep -nE 'grid-cols-3\b' {file}

# === DESIGN-SYSTEM-GUARD TOKEN VIOLATIONS ===

# Hardcoded hex in JSX
grep -nE '#[0-9a-fA-F]{3,8}' {file}

# Arbitrary Tailwind color classes
grep -nE '(text|bg|border|ring|fill|stroke|from|to|via|divide|outline|decoration|shadow|accent|caret|placeholder)-\[#' {file}

# Arbitrary spacing classes
grep -nE '(p|m|gap|w|h|top|bottom|left|right|inset)-\[[0-9]+px\]' {file}

# Arbitrary font family
grep -nE "font-\['" {file}

# === A11Y PATTERNS ===

# Missing alt on images
grep -nE '<img[^>]*(?!alt=)' {file}

# onClick on non-interactive elements (div, span) without role
grep -nE '<(div|span)[^>]*onClick' {file}
```

## Appendix B: Browser Evaluate Scripts

These JavaScript snippets are run via `browser_evaluate` for computed style analysis:

```javascript
// Check for horizontal overflow (mobile responsive breaks)
() => ({
  hasHorizontalScroll: document.documentElement.scrollWidth > window.innerWidth,
  scrollWidth: document.documentElement.scrollWidth,
  viewportWidth: window.innerWidth,
  overflow: document.documentElement.scrollWidth - window.innerWidth
})

// Check z-index stacking on fixed/absolute elements
() => {
  const positioned = document.querySelectorAll('[style*="position"], .fixed, .absolute, .sticky, .relative');
  return Array.from(positioned).map(el => ({
    tag: el.tagName,
    class: el.className.toString().slice(0, 80),
    zIndex: getComputedStyle(el).zIndex,
    position: getComputedStyle(el).position,
    rect: el.getBoundingClientRect()
  })).filter(el => el.zIndex !== 'auto');
}

// Check for clipped content (overflow:hidden with children extending beyond)
() => {
  const hidden = document.querySelectorAll('[class*="overflow-hidden"]');
  return Array.from(hidden).map(parent => {
    const pRect = parent.getBoundingClientRect();
    const clipped = Array.from(parent.children).filter(child => {
      const cRect = child.getBoundingClientRect();
      return cRect.bottom > pRect.bottom || cRect.right > pRect.right ||
             cRect.top < pRect.top || cRect.left < pRect.left;
    });
    return clipped.length > 0 ? {
      parent: { tag: parent.tagName, class: parent.className.toString().slice(0, 80) },
      clippedChildren: clipped.length,
      parentRect: pRect,
      firstClipped: clipped[0]?.className.toString().slice(0, 80)
    } : null;
  }).filter(Boolean);
}

// Check touch target sizes on mobile (< 44x44px)
() => {
  const interactive = document.querySelectorAll('a, button, [role="button"], input, select, textarea, [onclick]');
  return Array.from(interactive).map(el => {
    const rect = el.getBoundingClientRect();
    return {
      tag: el.tagName,
      text: el.textContent?.trim().slice(0, 40),
      width: rect.width,
      height: rect.height,
      tooSmall: rect.width < 44 || rect.height < 44
    };
  }).filter(el => el.tooSmall);
}
```
