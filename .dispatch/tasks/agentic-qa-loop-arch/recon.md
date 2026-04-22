# Reconnaissance — Delta from Design Doc to Current Reality

**Date:** 2026-04-15 (3 days after `output.md` was written)
**Purpose:** Catch drift between the 2026-04-12 design and what's actually available before writing the implementation plan.

---

## TL;DR — Three material changes

1. **Browser layer: swap Playwright → chrome-devtools-mcp.** Same tool surface, faster on Windows, adds Lighthouse + performance traces the doc didn't have access to.
2. **Dimension 4 (a11y): delegate to existing skill.** `chrome-devtools:a11y-debugging` is more comprehensive than the doc's custom implementation — reinventing it is ~40 lines of wasted code.
3. **vercel:verification is NOT a replacement.** Different concern (data-flow boundaries, not visual bugs). Keep separate but tell the user about it.

---

## 1. chrome-devtools-mcp vs Playwright (installed 2026-04-14)

The doc's visual-analyst agent lists 9 Playwright tools. Every one has a chrome-devtools equivalent:

| Design doc (Playwright) | chrome-devtools-mcp | Notes |
|------------------------|---------------------|-------|
| `browser_navigate` | `navigate_page` | Same semantics |
| `browser_resize` | `resize_page` | Same semantics |
| `browser_take_screenshot` | `take_screenshot` | Same, plus `filePath` param for large captures |
| `browser_snapshot` | `take_snapshot` | Returns a11y tree as text — FASTER than screenshots for automation |
| `browser_evaluate` | `evaluate_script` | Same, runs JS in page context |
| `browser_console_messages` | `list_console_messages` | Adds `types: ["issue"]` filter for native browser a11y audits |
| `browser_wait_for` | `wait_for` | Same |
| `browser_tabs` | `list_pages` + `select_page` | Split into two tools |
| `browser_close` | `close_page` | Same |

**New capabilities chrome-devtools-mcp has that the doc didn't use:**
- `lighthouse_audit` — full Lighthouse report (perf/a11y/SEO/best-practices) in one call, returns JSON
- `performance_start_trace` + `performance_stop_trace` + `performance_analyze_insight` — real performance tracing with insights
- `take_memory_snapshot` — JS heap analysis

**Why swap:**
- Native Chromium on Windows — no WebKit driver layer (Playwright's Windows bugs are in that layer)
- Lighthouse audit replaces ~20 lines of custom Grep checks with one tool call
- Chrome DevTools team maintains it → lockstep with Chrome updates

**Migration cost:** Mechanical. Change the `allowedTools` block in `visual-analyst.md` — 9 tool name swaps. No logic changes.

---

## 2. Dimension 4 (A11y) — delegate, don't rebuild

The design doc's Dimension 4 covers:
- Heading hierarchy (no level skips)
- Image alt text
- Button accessible names
- Form labels
- Click handlers on divs

The installed `chrome-devtools:a11y-debugging` skill covers **all of the above PLUS**:
- Lighthouse automated audit (comprehensive baseline)
- Native browser issues via `list_console_messages({ types: ["issue"] })` — catches low-contrast, invalid ARIA
- Tap target sizes (48×48px per web.dev)
- Color contrast (native audit + scripted snippets in `references/a11y-snippets.md`)
- Focus/keyboard traps (Tab/Shift+Tab walking)
- Orphaned form inputs (scripted snippet)
- Global page checks (document-level)

**Recommendation:** visual-analyst's Dimension 4 becomes: _"Invoke the `chrome-devtools:a11y-debugging` skill with the target URL. Parse its structured report into findings[]."_ Saves ~40 lines of custom a11y logic. If the skill's output format doesn't map cleanly to our `Finding` schema, write a thin adapter.

---

## 3. Propose adding Dimension 6 — Lighthouse Audit

`lighthouse_audit` in chrome-devtools-mcp returns a full JSON report covering:
- Performance (LCP, CLS, TBT, FCP, Speed Index)
- Accessibility (redundant with Dimension 4 but authoritative)
- SEO (meta tags, canonical URLs, robots)
- Best practices (HTTPS, deprecated APIs, console errors)

**Cost per run:** 1 tool call, ~15-30s per page. Returns JSON we can filter with `jq`-style scripting.

**Fit with the doc's philosophy:** The doc's 5 dimensions are all bespoke checks. Lighthouse is bulk — we'd filter its output for bugs that map to findings (e.g., `audits.failed` items become findings).

**Recommendation:** Add as Dimension 6 (optional, off by default on `page` mode, on by default on `sweep` mode). Lighthouse is slow enough that running it on every page during active development would be annoying.

---

## 4. vercel:verification — COMPLEMENTARY, not a replacement

Read the skill's SKILL.md. Different scope:

| Aspect | visual-qa-sweep (ours) | vercel:verification |
|--------|------------------------|---------------------|
| Triggers | `/visual-qa page /about`, Forge Lite, /loop | Dev server start, "why isn't this working", "does it actually work" |
| Concern | Visual bugs: layout, responsive, tokens, a11y, runtime errors | Data flow: UI → API → DB → response boundaries |
| Scope | Any route, unauthenticated by default | Currently-being-built feature, end-to-end |
| Output | Findings with severity + file:line | Verification Report with ✅/❌ per boundary |
| Fix capability | Yes (source-fixer phase) | No (read-only, reports only) |

**Recommendation:** Do NOT merge. Keep visual-qa-sweep for visual bugs; let vercel:verification handle data-flow verification. They're orthogonal — running both in sequence gives full coverage.

---

## 5. Current HH `.claude/` state (clean slate for new artifacts)

```
.claude/
├── agents/
│   ├── code-reviewer.md       # existing, unrelated
│   ├── quality-gate.md        # existing, unrelated
│   └── security-auditor.md    # existing, unrelated
├── skills/
│   └── review-pipeline.md     # existing, unrelated
└── hooks/
    └── pre-deploy-gate.sh     # existing, unrelated
```

No `visual-analyst.md`, no `source-fixer.md`, no `visual-qa-sweep/`. Safe to create fresh.

**Historical note:** `.dispatch/tasks/agentic-qa-loop-arch/plan.md` is the DESIGN task's checklist (all items `[x]`), NOT an implementation plan. Recommend renaming to `design-checklist.md` and creating a new `implementation-plan.md` in Step 2 to avoid confusion.

---

## 6. Tool budget re-estimate with chrome-devtools-mcp

Design doc's Section 9 estimate assumed Playwright + Grep-heavy detection:

| Mode | Doc estimate | Revised estimate (chrome-devtools) |
|------|--------------|-----------------------------------|
| page detect-only | ~22 calls, 30-60s | **~15 calls, 25-40s** (snapshot + 4 screenshots + lighthouse + console filter) |
| page detect+fix+verify | ~45 calls, 2-3 min | **~30 calls, 90s-2min** (less Grep work, Lighthouse replaces custom checks) |
| sweep detect-only | ~240 calls, 10-15 min | **~180 calls, 8-12 min** (Lighthouse batchable) |
| sweep detect+fix+verify | ~510 calls, 20-30 min | **~380 calls, 15-22 min** |

Net ~25-30% reduction in tool calls and wall time. Big win for /loop mode where speed matters.

---

## 7. What changes in the implementation plan (Step 2 preview)

Based on recon:

1. **visual-analyst.md:**
   - Swap `allowedTools` from `mcp__plugin_playwright_playwright__browser_*` to `mcp__plugin_chrome-devtools-mcp_chrome-devtools__*` (9 tool names)
   - Dimension 4: replace 40 lines of custom a11y with "invoke chrome-devtools:a11y-debugging skill, parse output"
   - Add Dimension 6: Lighthouse audit (optional, config flag)
   - Keep all 5 original dimensions otherwise unchanged

2. **source-fixer.md:**
   - No changes. Agent doesn't touch the browser layer.

3. **visual-qa-sweep/SKILL.md:**
   - No architectural changes. Orchestrator logic identical.
   - Tool call budgets drop ~30% (update Section 9 numbers)
   - Add one config flag: `lighthouse: auto | on | off` (default `auto` = on for sweep, off for page)

4. **Hook (visual-qa-notify):**
   - No changes.

5. **Forge Lite integration:**
   - No changes to integration logic.
   - Note for future: chrome-devtools `lighthouse_audit` could replace Forge Lite's separate Lighthouse check, but that's a separate cleanup task.

---

## 8. Open questions for Step 2 (writing-plans)

1. **Lighthouse default: `auto` vs `on` vs `off`?** I propose `auto` (off for `page` mode, on for `sweep` mode) but user may want different tradeoff.
2. **Rename existing plan.md → design-checklist.md?** Y/N before writing-plans produces the new plan.
3. **Screenshot storage location?** The doc references `screenshot_ref` in findings. Store under `.dispatch/tasks/agentic-qa-loop-arch/screenshots/{session-id}/` or `/tmp/visual-qa/`? I lean toward `.dispatch/.../screenshots/` for traceability; user preference matters.
4. **Test target for Step 4 smoke test:** The doc suggests reverting commit `3acb62b` (testimonial wave clipping fix). Confirm that commit still exists on master and is a suitable reproducer. If not, pick a different known-bug commit.

---

## Verdict

**Proceed to Step 2 (writing-plans) with the 3 material changes above baked in.** The design is sound; the only adjustments are tool-layer and delegation-to-existing-skills. Architecture, agent boundaries, orchestration logic, and findings schema all stand.
