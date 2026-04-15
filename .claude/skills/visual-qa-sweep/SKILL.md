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
   - Attempt `navigate_page` to `http://localhost:5173` using chrome-devtools-mcp.
   - If it fails with `ERR_CONNECTION_REFUSED`, `ERR_EMPTY_RESPONSE`, or any connection error, STOP and report: "Dev server not running at localhost:5173. Please run `npm run dev` in the HH website directory, then re-invoke `/visual-qa page <url>`."

2. **Screenshot directory exists:** `C:\Users\chase\Pictures\Ai Screenshot Ref`. Generate a session ID in local time as `qa-{YYYYMMDD}-{HHmmss}` (e.g., `qa-20260415-184230`). Create the subdirectory `C:\Users\chase\Pictures\Ai Screenshot Ref\{session-id}\` before Phase 1.

## Orchestration

### Phase 1 — DETECT

Dispatch the `visual-analyst` agent via the Task tool with this input:

```
URL: <user-provided URL, e.g., /about>
Viewports: mobile, tablet, laptop, desktop
Dimensions: 1, 2, 3, 4 (delegated to chrome-devtools:a11y-debugging), 5
Lighthouse: false (page mode default — set true only if user explicitly asked)
Screenshot dir: C:\Users\chase\Pictures\Ai Screenshot Ref\{session-id}\
Session ID: {session-id}
```

Parse the agent's output into `findings[]` (JSON array).

### Decision Gate

- If `findings.length === 0`:
  - Emit "No visual issues found on {url}."
  - Go to REPORT.
- If findings exist:
  - Ask user: `"Found {N} issues on {url}. Fix automatically? [Y/n]"`
  - If user responds `n` / no / skip: emit findings, go to REPORT without fixing.
  - If user responds `y` / yes / (empty input, user hit Enter): proceed to Phase 2.

### Phase 2 — FIX

Track iteration count (starts at 1).

Dispatch the `source-fixer` agent via the Task tool with this input:

```
findings: <findings array from Phase 1 OR remaining findings from the previous Verify phase>
```

Parse its output. If the build FAILED (source-fixer emits the "Build Failed — No Fixes Applied — Edits Reverted" block):
- Emit the build failure details to the user.
- Go to REPORT with verdict `NEEDS_MANUAL_REVIEW`.
- Do NOT continue to Phase 3.

If build PASSED: proceed to Phase 3.

### Phase 3 — VERIFY

Dispatch the `visual-analyst` agent again via the Task tool with:

```
URL: <same URL as Phase 1>
Viewports: <same 4 viewports>
Dimensions: <same as Phase 1>
Previous findings: <the findings array that Phase 2 just fixed>
Screenshot dir: C:\Users\chase\Pictures\Ai Screenshot Ref\{session-id}\verify-{iteration}\
Session ID: {session-id}
```

Parse its output into a verdict:

```json
{
  "resolved": ["<finding ID no longer present>", ...],
  "remaining": ["<finding ID still present>", ...],
  "regressions": [<NEW findings that were not present in original — full finding objects>]
}
```

### Loop Check

- If `remaining.length === 0 && regressions.length === 0`:
  - SUCCESS. Go to REPORT with verdict `CLEAN`.
- If iteration < 3:
  - Build next iteration's input: `findings = [...remaining findings, ...regressions]`
  - Increment iteration. Go to Phase 2.
- If iteration >= 3:
  - Emit: "Max iterations (3) reached. {remaining.length} issues remain."
  - Go to REPORT with verdict `HAS_ISSUES`.

## REPORT Format

Emit this markdown block. Note the outer fence uses QUADRUPLE backticks so the inner table and ``` fences render correctly:

`````markdown
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
- **Failed:** {N} findings (attempted but regression detected, reverted)
- **Iterations:** {iteration}/3

### Regressions Detected

{list any new issues introduced during fix iterations, or "No regressions detected."}

---

### Verdict: {CLEAN | HAS_ISSUES | NEEDS_MANUAL_REVIEW}
`````

**Verdict definitions:**
- **CLEAN:** All findings resolved, no regressions.
- **HAS_ISSUES:** Some findings remain after 3 iterations — human review needed.
- **NEEDS_MANUAL_REVIEW:** Critical findings with design-intent ambiguity, OR build failed during a Fix phase (source-fixer reverted its edits).

## Tool Usage Budget (Phase A, page mode)

| Phase | chrome-devtools calls | Grep/Read calls | Edit calls | Est. time |
|-------|----------------------|-----------------|------------|-----------|
| Detect (Phase 1) | ~15 (4 resize + 4 screenshot + 2 snapshot + 4 evaluate + 1 console) | ~12 (8 grep + 4 read) | 0 | 25-40s |
| Fix (Phase 2) | 0 | ~3 | ~3 | 15-30s |
| Verify (Phase 3) | ~15 (same as Detect) | ~8 | 0 | 25-40s |
| **Full loop (1 iter)** | ~30 | ~23 | ~3 | **1-2 min** |
| **Full loop (3 iter)** | ~75 | ~55 | ~9 | **3-5 min** |

## References

- `C:/Users/chase/Documents/HealingHeartsWebsite/.claude/skills/visual-qa-sweep/references/grep-patterns.md` — full Grep pattern library (used by visual-analyst Dimension 3)
- `C:/Users/chase/Documents/HealingHeartsWebsite/.claude/skills/visual-qa-sweep/references/evaluate-scripts.md` — `evaluate_script` snippets (used by visual-analyst Dimensions 1 & 2)

These files are created in Tasks 4 and 5 of the Phase A implementation plan. If they're missing when you dispatch visual-analyst, the analyst will bail out with a clear error.
