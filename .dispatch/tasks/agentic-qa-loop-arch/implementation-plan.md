# Visual QA Loop — Phase A Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a working 3-phase (detect → fix → verify) visual QA loop on the HH website, invocable via `/visual-qa page <url>`, and prove it end-to-end by reproducing + auto-fixing the testimonial clipping bug from commit `3acb62b`.

**Architecture:** One orchestrator skill (`visual-qa-sweep`) dispatches two agents. `visual-analyst` (read-only; chrome-devtools-mcp + Grep; delegates a11y to `chrome-devtools:a11y-debugging`) detects bugs. `source-fixer` (Edit + Bash build-check only) applies minimal fixes. Orchestrator loops up to 3 iterations max. Phase A supports `page` mode only (single URL); `sweep` and `watch` modes are deferred to Phase B.

**Tech Stack:** Claude Code agents + skills (markdown + YAML frontmatter); `chrome-devtools-mcp` for browser automation; Vite 7 dev server at `localhost:5173`; React 19 + Tailwind 3 (HH website stack); screenshots stored at `C:\Users\chase\Pictures\Ai Screenshot Ref\{session-id}\`.

**Scope boundaries:**
- **IN:** visual-analyst agent, source-fixer agent, visual-qa-sweep skill (page mode only), 2 reference files, end-to-end smoke test on commit `3acb62b`.
- **OUT (Phase B):** sweep mode, `/loop` integration, `visual-qa-notify` hook, Forge Lite wiring.
- **OUT (Phase C):** screenshot diffing, cumulative report, portal auth sweep.

**Tasks 1-5 are independent and can run in parallel via subagent-driven-development.** Tasks 6-8 are a sequential smoke test that a human drives.

---

## Branch strategy

Tasks 1-5 execute **on `master`** (`.claude/` artifacts don't affect the Vercel-deployed bundle, so direct-to-master is safe). Task 6 creates a short-lived `test/visual-qa-smoke` branch ONLY for the temporary revert of `3acb62b`. Task 8 returns to master, cherry-picks only the smoke-test transcript commit, and deletes the test branch.

## File Structure

| File | Responsibility |
|------|---------------|
| `.claude/agents/source-fixer.md` | Remediation agent — receives findings, applies minimal Edit fixes, runs `npm run build` |
| `.claude/agents/visual-analyst.md` | Detection agent — runs chrome-devtools-mcp screenshots + evaluates + delegates a11y to `chrome-devtools:a11y-debugging` skill, emits structured findings[] |
| `.claude/skills/visual-qa-sweep/SKILL.md` | Orchestrator — 3-phase loop, max 3 iterations, page mode only |
| `.claude/skills/visual-qa-sweep/references/grep-patterns.md` | Grep pattern library for Dimension 3 (token compliance) |
| `.claude/skills/visual-qa-sweep/references/evaluate-scripts.md` | JS snippets for `evaluate_script` (overflow, z-index, clipping, tap targets) |

---

### Task 1: Create source-fixer agent

**Files:**
- Create: `.claude/agents/source-fixer.md`

- [ ] **Step 1: Write the agent file**

Write exactly this content to `.claude/agents/source-fixer.md`:

````markdown
---
name: source-fixer
description: >
  Use this agent to fix visual bugs identified by the visual-analyst agent.
  Receives structured findings with file paths, line numbers, and likely causes.
  Reads source code, applies minimal targeted fixes, and verifies the build compiles.
  Only modifies files specified in findings — does not refactor surrounding code.
model: opus
allowedTools:
  - Read
  - Edit
  - Glob
  - Grep
  - Bash
---

You fix visual bugs in the HH website source based on structured findings from the visual-analyst agent.

## Input Contract

You receive a `findings[]` array. Each finding has:

```typescript
{
  id: string;                                                  // "F-001"
  severity: "critical" | "high" | "medium" | "low";
  dimension: "layout" | "responsive" | "tokens" | "a11y" | "runtime" | "lighthouse";
  url: string;                                                 // "/about"
  viewport: "mobile" | "tablet" | "laptop" | "desktop" | "all";
  file: string;                                                // "src/pages/About.jsx"
  line: number | null;
  symptom: string;
  likely_cause: string;
  suggested_fix: string;
  screenshot_ref: string | null;
  grep_match: string | null;
}
```

## Fix Strategy (ordered by preference)

1. **Tailwind class fix** — Change/add/remove Tailwind utility classes. ~70% of visual bugs.
2. **JSX structure fix** — Wrap elements, reorder children, add attributes. ~20%.
3. **CSS/style fix** — Inline styles or GSAP animation parameter tweaks. ~10%.

## Rules

| Rule | Why |
|------|-----|
| Only modify files listed in findings | Analyst identified targets; no scope creep |
| One finding = one minimal `Edit` | Atomic changes that can be verified individually |
| Run `npm run build` after all fixes complete | Catch compilation errors before verification phase |
| Never add new dependencies | Use existing Tailwind utilities and @scoria/ui only |
| Never refactor surrounding code | Fix the symptom, not nearby code cleanliness |
| Prefer @scoria/ui components when `suggested_fix` recommends it | Validated components over custom UI |
| Preserve GSAP animation structure | Fix only the specific property causing the issue |

## Bash Usage (strictly limited)

Permitted commands only:

```bash
npm run build 2>&1 | tail -30
```

NOT permitted: dev server, lint, git operations, any other bash. If you need any other command, abort and report.

## Output Format

Emit this markdown block after applying all fixes:

```markdown
## Fixes Applied

| Finding ID | File | Change | Build Status |
|-----------|------|--------|-------------|
| F-001 | src/pages/About.jsx:142 | Changed `overflow-hidden` → `overflow-visible` on testimonial wrapper | OK |
| F-002 | src/pages/Home.jsx:87 | Replaced hardcoded `#1191B1` with Tailwind `text-primary` | OK |

**Build result:** PASS

**Unmodified findings:** [List any findings you did NOT fix, with reason]
```

If build FAILS after all fixes, emit this instead:

```markdown
## Build Failed — No Fixes Committed

**Error:**
```
<npm run build stderr tail>
```

**Attempted fixes (now reverted via your last Edit being reconsidered — do NOT commit):**
<list of attempted Edits>
```

Then stop. Do not attempt further fixes.
````

- [ ] **Step 2: Verify frontmatter parses**

Run:
```bash
head -15 .claude/agents/source-fixer.md
```

Expected: YAML frontmatter visible with `name: source-fixer`, `model: opus`, `allowedTools:` list of 5 items (Read, Edit, Glob, Grep, Bash).

- [ ] **Step 3: Commit**

```bash
git add .claude/agents/source-fixer.md
git commit -m "feat(qa): add source-fixer agent for visual bug remediation"
```

---

### Task 2: Create visual-analyst agent

**Files:**
- Create: `.claude/agents/visual-analyst.md`

- [ ] **Step 1: Write the agent file**

Write exactly this content to `.claude/agents/visual-analyst.md`:

````markdown
---
name: visual-analyst
description: >
  Use this agent to perform visual QA analysis on HH website pages using chrome-devtools-mcp
  screenshots and source code analysis. Read-only — does not modify files. Takes screenshots
  at multiple viewports, analyzes for visual bugs, cross-references source code patterns,
  delegates accessibility checks to the chrome-devtools:a11y-debugging skill, and outputs
  structured findings. Invoke for visual bug detection, responsive testing, design token
  compliance checking, or Lighthouse auditing.
model: opus
allowedTools:
  - Read
  - Glob
  - Grep
  - Skill
  - mcp__plugin_chrome-devtools-mcp_chrome-devtools__navigate_page
  - mcp__plugin_chrome-devtools-mcp_chrome-devtools__resize_page
  - mcp__plugin_chrome-devtools-mcp_chrome-devtools__take_screenshot
  - mcp__plugin_chrome-devtools-mcp_chrome-devtools__take_snapshot
  - mcp__plugin_chrome-devtools-mcp_chrome-devtools__evaluate_script
  - mcp__plugin_chrome-devtools-mcp_chrome-devtools__list_console_messages
  - mcp__plugin_chrome-devtools-mcp_chrome-devtools__wait_for
  - mcp__plugin_chrome-devtools-mcp_chrome-devtools__lighthouse_audit
  - mcp__plugin_chrome-devtools-mcp_chrome-devtools__new_page
  - mcp__plugin_chrome-devtools-mcp_chrome-devtools__close_page
  - mcp__plugin_chrome-devtools-mcp_chrome-devtools__list_pages
  - mcp__plugin_chrome-devtools-mcp_chrome-devtools__select_page
---

You analyze rendered HH website pages for visual bugs across 6 detection dimensions.

## Viewport Matrix

| Name | Width | Height | Tailwind Breakpoint |
|------|-------|--------|---------------------|
| mobile | 375 | 812 | below `sm` |
| tablet | 768 | 1024 | `md` |
| laptop | 1024 | 768 | `lg` |
| desktop | 1280 | 800 | `xl` |

## Per-Viewport Workflow

For each viewport:
1. `resize_page` to the dimensions above
2. `navigate_page` to the target URL
3. `wait_for` page load (text-based wait preferred over time-based)
4. `take_screenshot` with `filePath: "C:/Users/chase/Pictures/Ai Screenshot Ref/{session-id}/{viewport}-{url-slug}.png"` and `fullPage: true`
5. `take_snapshot` (a11y tree, text — cheaper than screenshot for structural checks) — mobile + desktop only
6. `evaluate_script` for computed-style checks (use snippets from `references/evaluate-scripts.md`)
7. `list_console_messages` with `types: ["error", "issue"]` for runtime + native browser a11y issues

## 6 Detection Dimensions

### Dimension 1 — Layout & Clipping

Visual analysis of screenshots for:
- **Element clipping:** content cut by `overflow: hidden` on parents (e.g., testimonial cards clipped by decorative wave — the bug fixed in `3acb62b`)
- **Z-index stacking:** modals behind content, dropdowns under siblings
- **Whitespace gaps:** unintended gaps, misaligned columns
- **Text overflow:** text breaking out of containers

**Method:** Screenshot vision analysis + `evaluate_script` "Check for clipped content" snippet from `references/evaluate-scripts.md`.

### Dimension 2 — Responsive Breaks

Compare screenshots across 4 viewports for:
- **Horizontal scroll on mobile** (the #1 mobile bug)
- **Layout collapse** — elements that stack incorrectly at narrow widths
- **Hidden important content** — `hidden lg:block` hiding things on mobile
- **Touch target size** — interactive elements < 44×44px on mobile (delegated to a11y-debugging in D4)

**Method:** Cross-viewport screenshot comparison + `evaluate_script` horizontal-overflow snippet from references.

### Dimension 3 — Design Token Compliance

Grep source code for taste-skill and design-system-guard violations. See `references/grep-patterns.md` for full pattern library. Patterns cover:
- Hardcoded hex colors in JSX
- Arbitrary Tailwind color classes (`bg-[#xxx]`)
- Inter font (banned)
- Pure black (`#000000`, `bg-black`)
- AI purple/neon glow
- `h-screen` (must be `min-h-[100dvh]`)
- 3-column equal grid
- Arbitrary spacing classes

**Method:** Run all patterns in `references/grep-patterns.md` against the JSX file for the URL (e.g., `/about` → `src/pages/About.jsx`). Read surrounding context (via Read tool) to filter false positives in comments/SVG attributes.

### Dimension 4 — Accessibility (DELEGATED)

**Delegate to the `chrome-devtools:a11y-debugging` skill.** Invoke it via the Skill tool with the target URL. It runs Lighthouse a11y audit + tap target measurement + color contrast + orphaned form inputs + focus/keyboard traps + global page checks. Parse its structured report into findings[] using dimension `"a11y"`.

Do NOT reimplement these checks — the skill is comprehensive and tested.

### Dimension 5 — Runtime Errors

From `list_console_messages({ types: ["error"] })`:
- Any error-level console messages during page load
- Failed network requests (404s for images, scripts, API calls)
- GSAP errors (missing ScrollTrigger targets, animation on unmounted elements)

Report each as a finding with dimension `"runtime"`.

### Dimension 6 — Lighthouse Audit (conditional)

**Condition:** Run only when the orchestrator passes `lighthouse: true` in the input. Default behavior:
- `page` mode → `lighthouse: false` (fast dev iteration)
- `sweep` mode → `lighthouse: true` (comprehensive batch — Phase B)

**Method:** Call `lighthouse_audit({ mode: "navigation" })` once per URL. Filter `audits` for entries with `score !== null && score < 1`. Map each failed audit to a finding:
- `dimension: "lighthouse"`
- `severity`: map Lighthouse category weight to critical/high/medium/low
- `symptom`: audit `title`
- `likely_cause`: first item's `snippet` or `selector`

## Findings Schema

Emit findings as a JSON array. Each entry:

```json
{
  "id": "F-001",
  "severity": "high",
  "dimension": "layout",
  "url": "/about",
  "viewport": "desktop",
  "file": "src/pages/About.jsx",
  "line": 142,
  "symptom": "Testimonial cards clipped by decorative wave on desktop",
  "likely_cause": "Parent div has `overflow-hidden` at line 142; wave SVG extends beyond",
  "suggested_fix": "Change `overflow-hidden` to `overflow-visible` on the wrapper div",
  "screenshot_ref": "C:/Users/chase/Pictures/Ai Screenshot Ref/{session-id}/desktop-about.png",
  "grep_match": null
}
```

## Severity Definitions

| Level | Meaning |
|-------|---------|
| critical | Content invisible, page broken, horizontal scroll on mobile, runtime crash, Lighthouse score < 0.5 |
| high | Content partially clipped, significant misalignment, wrong brand colors |
| medium | Spacing inconsistency, minor alignment, non-critical token violation |
| low | Subtle whitespace, preference-level responsive behavior |

## Output Format

```markdown
## Visual Analysis: {url}

**Viewports analyzed:** mobile, tablet, laptop, desktop
**Dimensions run:** 1, 2, 3, 4 (delegated), 5, 6 (if enabled)
**Screenshots:** C:/Users/chase/Pictures/Ai Screenshot Ref/{session-id}/

### Findings

```json
[
  { "id": "F-001", ... },
  { "id": "F-002", ... }
]
```

### Summary

- Total findings: N
- By severity: critical=N high=N medium=N low=N
- By dimension: layout=N responsive=N tokens=N a11y=N runtime=N lighthouse=N
```

If no findings: emit the header block with empty `findings: []` and `Total findings: 0`.
````

- [ ] **Step 2: Verify allowedTools list**

Run:
```bash
grep -c "chrome-devtools-mcp" .claude/agents/visual-analyst.md
```

Expected: 12 (one per chrome-devtools MCP tool).

- [ ] **Step 3: Commit**

```bash
git add .claude/agents/visual-analyst.md
git commit -m "feat(qa): add visual-analyst agent using chrome-devtools-mcp"
```

---

### Task 3: Create visual-qa-sweep skill (orchestrator)

**Files:**
- Create: `.claude/skills/visual-qa-sweep/SKILL.md`

- [ ] **Step 1: Create directory and write SKILL.md**

Write exactly this content to `.claude/skills/visual-qa-sweep/SKILL.md`:

````markdown
---
name: visual-qa-sweep
description: >
  Trigger when the user says "visual QA", "check for visual bugs", "screenshot sweep",
  "responsive check", "/visual-qa", "how does this look", or after any Forge Lite build
  completes. Runs chrome-devtools-mcp-based visual analysis at 4 viewports, detects bugs,
  cross-references source code, optionally applies fixes, and verifies results.
  Phase A supports `page` mode only.
---

You orchestrate a 3-phase visual QA loop for the HH website using two subagents.

## Modes (Phase A)

| Mode | Invocation | Behavior |
|------|-----------|----------|
| `page` | `/visual-qa page /about` | Single URL — detect → fix → verify loop, max 3 iterations |

Phase B will add `sweep` and `watch` modes — not in this phase.

## Prerequisites

1. **Dev server must be running at `http://localhost:5173`.** Before Phase 1, verify:
   - Use `evaluate_script` via chrome-devtools-mcp on `http://localhost:5173` to check status.
   - If not running, STOP and report: "Dev server not running. Please start `npm run dev` in the HH website directory, then re-invoke."

2. **Screenshot directory exists:** `C:\Users\chase\Pictures\Ai Screenshot Ref`. Generate a session ID (`{YYYYMMDD-HHmmss}`) and create `C:\Users\chase\Pictures\Ai Screenshot Ref\{session-id}\`.

## Orchestration

### Phase 1 — DETECT

Dispatch the `visual-analyst` agent via Task tool with:

```
URL: <user-provided URL, e.g., /about>
Viewports: mobile, tablet, laptop, desktop
Dimensions: 1, 2, 3, 4 (delegated), 5
Lighthouse: false (page mode default)
Screenshot dir: C:\Users\chase\Pictures\Ai Screenshot Ref\{session-id}\
```

Parse the agent's output into `findings[]`.

### Decision Gate

- If `findings.length === 0`:
  - Emit "No visual issues found on {url}."
  - Go to REPORT.
- If findings exist:
  - Ask user: `"Found {N} issues on {url}. Fix automatically? [Y/n]"`
  - If user responds `n` / no / skip: emit findings, go to REPORT without fixing.
  - If user responds `y` / yes / (empty): proceed to Phase 2.

### Phase 2 — FIX

Track iteration count (starts at 1).

Dispatch the `source-fixer` agent via Task tool with:

```
findings: <findings array from Phase 1 OR remaining array from previous Verify>
```

Parse its output. If build FAILED: emit the build failure, go to REPORT with verdict `NEEDS_MANUAL_REVIEW`. Do NOT continue.

If build PASSED: proceed to Phase 3.

### Phase 3 — VERIFY

Dispatch the `visual-analyst` agent again with:

```
URL: <same URL>
Viewports: <same 4 viewports>
Dimensions: <same as Phase 1>
Previous findings: <the findings array that Phase 2 just fixed>
Screenshot dir: C:\Users\chase\Pictures\Ai Screenshot Ref\{session-id}\verify-{iteration}\
```

Parse its output into a verdict:

```json
{
  "resolved": [<finding IDs no longer present>],
  "remaining": [<finding IDs still present>],
  "regressions": [<NEW findings that were not present in original>]
}
```

### Loop Check

- If `remaining.length === 0 && regressions.length === 0`:
  - SUCCESS. Go to REPORT with verdict `CLEAN`.
- If iteration < 3:
  - Build next iteration's input: `findings = [...remaining, ...regressions]`
  - Increment iteration. Go to Phase 2.
- If iteration >= 3:
  - Emit: "Max iterations (3) reached. {remaining.length} issues remain."
  - Go to REPORT with verdict `HAS_ISSUES`.

## REPORT Format

Emit this exact markdown block:

```markdown
## Visual QA Report: {url}

**Session ID:** {session-id}
**Screenshots:** C:\Users\chase\Pictures\Ai Screenshot Ref\{session-id}\
**Iterations:** {iteration}/3

### Findings

| ID | Severity | Dimension | Viewport | Symptom | File:Line | Status |
|----|----------|-----------|----------|---------|-----------|--------|
| F-001 | high | layout | desktop | Testimonial cards clipped by wave | src/pages/About.jsx:142 | Fixed |

### Fix Summary

- **Fixed:** {N} findings (auto-applied and verified)
- **Deferred:** {N} findings (user declined or skipped)
- **Failed:** {N} findings (attempted but regression detected)
- **Iterations:** {iteration}/3

### Regressions Detected

{list any new issues introduced during fix iterations, or "No regressions detected."}

---

### Verdict: {CLEAN | HAS_ISSUES | NEEDS_MANUAL_REVIEW}
```

**Verdict definitions:**
- **CLEAN:** All findings resolved, no regressions.
- **HAS_ISSUES:** Some findings remain after 3 iterations — human review needed.
- **NEEDS_MANUAL_REVIEW:** Critical findings with design-intent ambiguity, OR build failed during a Fix phase.

## Tool Usage Budget (Phase A, page mode)

| Phase | chrome-devtools calls | Grep/Read calls | Edit calls | Est. time |
|-------|----------------------|-----------------|------------|-----------|
| Detect (Phase 1) | ~15 (4 resize + 4 screenshot + 2 snapshot + 4 evaluate + 1 console) | ~12 (8 grep + 4 read) | 0 | 25-40s |
| Fix (Phase 2) | 0 | ~3 | ~3 | 15-30s |
| Verify (Phase 3) | ~15 (same as Detect) | ~8 | 0 | 25-40s |
| **Full loop (1 iter)** | ~30 | ~23 | ~3 | **1-2 min** |
| **Full loop (3 iter)** | ~75 | ~55 | ~9 | **3-5 min** |

## References

- `references/grep-patterns.md` — full Grep pattern library for Dimension 3
- `references/evaluate-scripts.md` — `evaluate_script` snippets for overflow/z-index/clipping/tap-targets
````

- [ ] **Step 2: Verify skill structure**

Run:
```bash
ls .claude/skills/visual-qa-sweep/
```

Expected: `SKILL.md` listed. `references/` directory will be created in Tasks 4 and 5.

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/visual-qa-sweep/SKILL.md
git commit -m "feat(qa): add visual-qa-sweep orchestrator skill (page mode)"
```

---

### Task 4: Create grep-patterns reference

**Files:**
- Create: `.claude/skills/visual-qa-sweep/references/grep-patterns.md`

- [ ] **Step 1: Write the reference file**

Write exactly this content:

````markdown
# Grep Pattern Library — Dimension 3 (Design Token Compliance)

Used by the `visual-analyst` agent. Run each pattern against the JSX file for the URL being analyzed (e.g., `/about` → `src/pages/About.jsx`). For each match, read surrounding context with the Read tool to filter false positives (comments, SVG path attributes, etc.).

## Taste-Skill Forbidden Patterns (hard violations)

```bash
# Inter font (banned entirely — HH uses Cormorant Garamond + system stack)
grep -niE "(Inter|font-inter|'Inter'|\"Inter\")" {file}

# Pure black (use off-black/zinc-950/charcoal)
grep -niE '#000000|#000[^0-9a-fA-F]|bg-black[^/]' {file}

# AI purple/neon glow (banned brand deviation)
grep -niE '(purple|violet|indigo).*glow|(box-shadow.*purple|box-shadow.*violet)' {file}

# Oversized gradient text (flagged for review)
grep -niE 'bg-gradient.*text-transparent.*bg-clip-text' {file}

# h-screen (use min-h-[100dvh] — mobile viewport edge case)
grep -nE 'h-screen' {file}

# 3-column equal grid (banned when DESIGN_VARIANCE > 4 — HH default is 7)
grep -nE 'grid-cols-3\b' {file}
```

## Design-System-Guard Token Violations

```bash
# Hardcoded hex in JSX (use Tailwind tokens instead)
grep -nE '#[0-9a-fA-F]{3,8}' {file}

# Arbitrary Tailwind color classes
grep -nE '(text|bg|border|ring|fill|stroke|from|to|via|divide|outline|decoration|shadow|accent|caret|placeholder)-\[#' {file}

# Arbitrary spacing classes (use Tailwind scale)
grep -nE '(p|m|gap|w|h|top|bottom|left|right|inset)-\[[0-9]+px\]' {file}

# Arbitrary font family (use Tailwind font tokens)
grep -nE "font-\['" {file}
```

## A11y Patterns (supplementary — main a11y handled by chrome-devtools:a11y-debugging)

```bash
# Missing alt on images
grep -nE '<img[^>]*(?!alt=)' {file}

# onClick on non-interactive elements (div, span) without role
grep -nE '<(div|span)[^>]*onClick' {file}
```

## False-Positive Filters

After a raw grep match, Read 3 lines of surrounding context. Skip the match if:

- Inside a JS comment (`//` or `/* */`)
- Inside an SVG `path` or `d=` attribute (hex for color, not CSS)
- Inside a string literal that's a data prop (not applied as a class)
- Inside `tailwind.config.js` or any file ending in `.config.js/.ts` (config is allowed)
- Inside `vendor/` (third-party code — not HH source)
````

- [ ] **Step 2: Verify file written**

Run:
```bash
wc -l .claude/skills/visual-qa-sweep/references/grep-patterns.md
```

Expected: 40-50 lines.

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/visual-qa-sweep/references/grep-patterns.md
git commit -m "feat(qa): add grep pattern library for token compliance"
```

---

### Task 5: Create evaluate-scripts reference

**Files:**
- Create: `.claude/skills/visual-qa-sweep/references/evaluate-scripts.md`

- [ ] **Step 1: Write the reference file**

Write exactly this content:

````markdown
# Browser Evaluate Scripts — `chrome-devtools-mcp__evaluate_script` Snippets

Used by `visual-analyst` for computed-style analysis. Each snippet is a self-contained JS function to pass as the `function` parameter.

## Check Horizontal Overflow (Dimension 2 — Responsive)

```javascript
() => ({
  hasHorizontalScroll: document.documentElement.scrollWidth > window.innerWidth,
  scrollWidth: document.documentElement.scrollWidth,
  viewportWidth: window.innerWidth,
  overflow: document.documentElement.scrollWidth - window.innerWidth
})
```

Run at every viewport. If `hasHorizontalScroll === true` on mobile (375px), emit a finding with severity `critical`.

## Check Z-Index Stacking (Dimension 1 — Layout)

```javascript
() => {
  const positioned = document.querySelectorAll(
    '[style*="position"], .fixed, .absolute, .sticky, .relative'
  );
  return Array.from(positioned).map(el => ({
    tag: el.tagName,
    class: el.className.toString().slice(0, 80),
    zIndex: getComputedStyle(el).zIndex,
    position: getComputedStyle(el).position,
    rect: el.getBoundingClientRect()
  })).filter(el => el.zIndex !== 'auto');
}
```

Look for z-index collisions (same value, overlapping rects) or unexpectedly high values (>9999 often indicates panic stacking).

## Check Clipped Content (Dimension 1 — Layout)

```javascript
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
      firstClippedClass: clipped[0]?.className.toString().slice(0, 80)
    } : null;
  }).filter(Boolean);
}
```

This is the key snippet for detecting the testimonial clipping bug in `3acb62b`. Look for `overflow-hidden` parents with children whose bounding rects extend beyond the parent's rect.

## Check Touch Target Sizes (Dimension 2 — Responsive, mobile only)

```javascript
() => {
  const interactive = document.querySelectorAll(
    'a, button, [role="button"], input, select, textarea, [onclick]'
  );
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

Run only at 375×812 (mobile). `chrome-devtools:a11y-debugging` has a more thorough tap-target check — this is a lightweight preflight.
````

- [ ] **Step 2: Verify file written**

Run:
```bash
wc -l .claude/skills/visual-qa-sweep/references/evaluate-scripts.md
```

Expected: 70-90 lines.

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/visual-qa-sweep/references/evaluate-scripts.md
git commit -m "feat(qa): add evaluate_script snippet library for computed-style analysis"
```

---

### Task 6: Prepare smoke test — reproduce the 3acb62b bug

**Files:**
- Modify: `src/pages/About.jsx` (temporarily, on a test branch)

- [ ] **Step 1: Create test branch**

```bash
git checkout -b test/visual-qa-smoke
```

Expected: `Switched to a new branch 'test/visual-qa-smoke'`.

- [ ] **Step 2: Reproduce the bug by reverting 3acb62b's change on this branch only**

```bash
git show 3acb62b -- src/pages/About.jsx
```

This prints the diff that fixed the bug. Read the diff to identify which line(s) changed `overflow-hidden` → `overflow-visible` (or similar). Record the line number(s) and exact class changes.

Then revert that single commit on the branch:

```bash
git revert 3acb62b --no-edit
```

Expected: Revert commit created. `src/pages/About.jsx` now has `overflow-hidden` (or whatever the pre-fix state was) reintroduced.

- [ ] **Step 3: Verify dev server still builds**

```bash
npm run build 2>&1 | tail -10
```

Expected: Build succeeds (the bug is visual, not a compile error).

- [ ] **Step 4: Confirm bug visually**

Human check: open `http://localhost:5173/about` in a browser at 1280px width. Scroll to the testimonials section. Expected: testimonial cards clipped by the decorative wave (the bug visibly reproduces).

If bug does NOT visibly reproduce, `3acb62b` may have been part of a broader fix — check other files the commit touched with `git show --stat 3acb62b` and extend the revert accordingly.

- [ ] **Step 5: (No commit yet — stay on test branch with the revert uncommitted... wait, revert already committed in Step 2. That's fine. Just stay on the branch.)**

No-op. The revert commit from Step 2 stands as the reproducer.

---

### Task 7: Smoke test — run /visual-qa page /about end-to-end

**Files:**
- Captures output to: `.dispatch/tasks/agentic-qa-loop-arch/smoke-test-results.md`

- [ ] **Step 1: Invoke the skill**

In a Claude Code session at the HH website repo root (still on `test/visual-qa-smoke` branch with the bug reproduced):

```
/visual-qa page /about
```

- [ ] **Step 2: Observe Phase 1 (Detect)**

Expected behavior:
- Skill confirms dev server running at localhost:5173
- Creates `C:\Users\chase\Pictures\Ai Screenshot Ref\{session-id}\`
- Dispatches `visual-analyst` agent
- Agent takes 4 screenshots (mobile, tablet, laptop, desktop)
- Agent runs Dimension 1-5 checks
- Agent emits findings[] including F-001 for the testimonial clipping at desktop viewport

**Acceptance criterion:** At least one finding with `dimension: "layout"`, `viewport: "desktop"`, `file: "src/pages/About.jsx"`, and symptom mentioning "clip" or "overflow".

If Phase 1 fails or misses the bug: abort, diagnose, patch the visual-analyst agent, repeat.

- [ ] **Step 3: Observe Decision Gate**

Skill prompts: `"Found N issues on /about. Fix automatically? [Y/n]"`

Respond: `y`

- [ ] **Step 4: Observe Phase 2 (Fix)**

Expected behavior:
- Skill dispatches `source-fixer` agent with findings
- Agent reads `src/pages/About.jsx`
- Agent applies Edit to flip the clipping class back (e.g., `overflow-hidden` → `overflow-visible`)
- Agent runs `npm run build 2>&1 | tail -30`
- Build succeeds

**Acceptance criterion:** `source-fixer` output shows the Edit applied + `Build result: PASS`.

If build FAILS: skill should abort with `NEEDS_MANUAL_REVIEW` verdict — this is correct behavior, but indicates a plan-level issue with the suggested_fix.

- [ ] **Step 5: Observe Phase 3 (Verify)**

Expected behavior:
- Skill dispatches `visual-analyst` again with the same viewports + dimensions
- Agent re-screenshots to `...\{session-id}\verify-1\`
- Agent emits verdict with `resolved: [F-001]`, `remaining: []`, `regressions: []`

**Acceptance criterion:** Verdict shows F-001 in `resolved` and `remaining` is empty.

- [ ] **Step 6: Observe REPORT**

Expected final markdown block with:
- Verdict: `CLEAN`
- Iterations: 1/3
- Fix Summary: 1 fixed

Save the full transcript to `.dispatch/tasks/agentic-qa-loop-arch/smoke-test-results.md`.

- [ ] **Step 7: Commit smoke test results**

```bash
git add .dispatch/tasks/agentic-qa-loop-arch/smoke-test-results.md
git commit -m "test(qa): smoke test passed — visual-qa detect-fix-verify on 3acb62b"
```

---

### Task 8: Cleanup — return to master, cherry-pick smoke-test log, delete test branch

**Files:**
- Cherry-pick: `smoke-test-results.md` commit from test branch to master
- Delete: `test/visual-qa-smoke` branch

Artifacts from Tasks 1-5 are already on master (they were committed there before Task 6 created the test branch). The only thing on the test branch worth keeping is the `smoke-test-results.md` transcript from Task 7.

- [ ] **Step 1: Return to master**

```bash
git checkout master
```

Expected: `Switched to branch 'master'`.

- [ ] **Step 2: Verify master already has the 5 artifact commits**

```bash
git log --oneline -10 | head -10
```

Expected to see (top to bottom, most recent first):
- `feat(qa): add evaluate_script snippet library for computed-style analysis` (Task 5)
- `feat(qa): add grep pattern library for token compliance` (Task 4)
- `feat(qa): add visual-qa-sweep orchestrator skill (page mode)` (Task 3)
- `feat(qa): add visual-analyst agent using chrome-devtools-mcp` (Task 2)
- `feat(qa): add source-fixer agent for visual bug remediation` (Task 1)
- (older commits)

If any are missing: STOP. Tasks 1-5 weren't committed on master as intended. Do NOT proceed — diagnose which branch they landed on.

- [ ] **Step 3: Cherry-pick only the smoke-test-results commit**

Find the commit SHA:

```bash
git log test/visual-qa-smoke --oneline --grep="smoke test passed" -1
```

Cherry-pick it:

```bash
git cherry-pick <sha-of-smoke-test-commit>
```

Expected: `smoke-test-results.md` lands on master.

- [ ] **Step 4: Verify master state**

```bash
ls .claude/agents/ | grep -E "(visual-analyst|source-fixer)"
ls .claude/skills/visual-qa-sweep/
ls .claude/skills/visual-qa-sweep/references/
ls .dispatch/tasks/agentic-qa-loop-arch/ | grep smoke
```

Expected:
- `.claude/agents/` lists `visual-analyst.md` and `source-fixer.md`
- `.claude/skills/visual-qa-sweep/` lists `SKILL.md` and `references/`
- `references/` lists `grep-patterns.md` and `evaluate-scripts.md`
- `.dispatch/tasks/agentic-qa-loop-arch/` lists `smoke-test-results.md`

- [ ] **Step 5: Delete test branch**

```bash
git branch -D test/visual-qa-smoke
```

Expected: `Deleted branch test/visual-qa-smoke`. The `About.jsx` revert dies with the branch — master's About.jsx retains the original `3acb62b` fix.

- [ ] **Step 6: Confirm About.jsx is back to master state**

```bash
git show 3acb62b -- src/pages/About.jsx | head -20
```

Compare to current:

```bash
git log -1 --format="%H" -- src/pages/About.jsx
```

The most recent commit touching About.jsx should be `3acb62b` or later (NOT the revert). If the revert shows up, something leaked from the test branch — stop and diagnose.

- [ ] **Step 7: Do NOT push to origin yet**

Phase A is complete locally. Chase reviews the work visually before pushing. (Pushing to `master` triggers Vercel auto-deploy; `.claude/` files are not in the deployed bundle but Chase should confirm before surfacing publicly.)

---

## Acceptance Criteria (Phase A Done)

- [ ] `.claude/agents/visual-analyst.md` exists on master with chrome-devtools-mcp tools
- [ ] `.claude/agents/source-fixer.md` exists on master
- [ ] `.claude/skills/visual-qa-sweep/SKILL.md` exists on master with `page` mode orchestration
- [ ] `.claude/skills/visual-qa-sweep/references/grep-patterns.md` exists on master
- [ ] `.claude/skills/visual-qa-sweep/references/evaluate-scripts.md` exists on master
- [ ] Smoke test on commit `3acb62b` ran end-to-end with verdict `CLEAN` in ≤ 1 iteration
- [ ] `smoke-test-results.md` captures the transcript for future reference
- [ ] Screenshots archived at `C:\Users\chase\Pictures\Ai Screenshot Ref\{session-id}\`
- [ ] `test/visual-qa-smoke` branch deleted
- [ ] Master has 6 new commits, no pushes yet

---

## After Phase A

If all green, open Phase B scope with Chase:
- `visual-qa-notify` hook (PostToolUse on Edit/Write *.jsx)
- `/loop` integration (ScheduleWakeup 270s/1200s pacing)
- `sweep` mode (iterate all 14 marketing pages)
- Forge Lite Category B wiring

If Phase A has issues, iterate on the artifacts before expanding scope.
