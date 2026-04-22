# Agentic QA Loop Architecture — Design Document
**Date:** 2026-04-12
**Goal:** Design a practical agentic QA pipeline for Claude Code that uses Playwright screenshots + source code analysis to find and fix visual bugs automatically.

---

## Checklist

### Research & Foundations
- [x] 1. Catalog available Playwright MCP tools and their parameters — 20 tools cataloged, key ones: take_screenshot (viewport/fullPage/element), snapshot (a11y tree), resize (viewport control), evaluate (computed styles/JS), console_messages, run_code
- [x] 2. Document the viewport matrix and screenshot strategy — 4 viewports (375/768/1024/1280), fullPage screenshots + a11y snapshots at extremes + JS evaluate for computed styles + console errors
- [x] 3. Map existing validation patterns — Forge Lite (5 hard gates + 4 soft flags), taste-skill (7 visual bans + 3 typography bans + 3 layout bans), design-system-guard (hex/spacing/font token compliance), a11y-check (6 WCAG 2.1 AA blocking rules)

### Architecture Design
- [x] 4. Design the core loop architecture — 3-phase detect→fix→verify loop, skill orchestrator dispatches visual-analyst (Playwright + Grep) then source-fixer (Read + Edit), max 3 iterations
- [x] 5. Define the visual-qa-sweep skill — orchestrator with 3 modes: sweep (full site), page (single URL), watch (/loop integration). Manages detect→fix→verify cycle with max 3 iterations
- [x] 6. Define the visual-analyst agent — read-only opus agent with Playwright MCP + Grep + Read. 5 detection dimensions: Layout/Clipping, Responsive Breaks, Design Token Compliance, A11y Structure, Console Errors
- [x] 7. Define the source-fixer agent — write-capable opus agent with Read + Edit + Grep + Bash(build-only). Receives structured findings, cross-references source, applies minimal targeted fixes, reports what changed
- [x] 8. Design the findings schema — structured finding objects with: id, severity, dimension, viewport, url, symptom, likely_cause (file:line + explanation), suggested_fix, screenshot_ref. Severity: critical/high/medium/low matching existing code-reviewer scale

### Integration Points
- [x] 9. Design /loop integration — two modes: `/loop 3m /visual-qa page /about` (fixed interval, single page watch during development) and `/loop /visual-qa sweep` (self-pacing via ScheduleWakeup, 270s warm cache for active fixes, 1200s idle between sweeps)
- [x] 10. Design hook integration — PostToolUse advisory hook on Edit/Write to *.jsx files. Hook checks if visual-qa-sweep is active; if so, queues re-validation of the modified page. Does NOT block edits (advisory mode). Complements design-system-guard which catches token violations at write time
- [x] 11. Map Forge Lite integration — visual-qa-sweep replaces Forge Lite's Category B "Responsive viewports" soft flag (currently screenshots-only, no analysis). The QA loop's visual-analyst is a superset: it screenshots + analyzes + cross-references. Forge Lite can invoke `/visual-qa page {url}` during its Validate stage instead of raw Playwright screenshots

### Output
- [x] 12. Write the complete architecture document to output.md — 10 sections + 2 appendices covering system overview, viewport matrix, all 3 components (skill + 2 agents), findings schema, 5 integration points, output format, implementation roadmap (3 phases), constraints/risks, tool budget, and example session
- [x] 13. Write completion marker
