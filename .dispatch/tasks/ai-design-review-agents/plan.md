# AI-Powered Design Review Agents — Research

**Purpose:** Research whether LLMs can review screenshots and catch design quality issues that a developer without design training would miss. Find real implementations, not theory. The goal is a repeatable agentic QA loop for the Healing Hearts site using the existing Scoria design system.

**Context:** Healing Hearts uses Scoria design system with specific rules (no Inter font, no centered heroes on landing pages, no 3-col equal grids, no pure black, teal=#1191B1). The user has Claude Code with Playwright MCP and Windows MCP for browser interaction. They want to know: can this be a real, repeatable workflow?

**Scope:** Research task — READ-ONLY on the codebase. Output is a findings report.

---

- [x] Understand the Scoria design system rules and taste-skill constraints that a reviewer would need to check. Read `C:/Users/chase/Documents/scoria/design/DESIGN.md` and `C:/Users/chase/Documents/scoria/design/taste/` to catalog the concrete, checkable rules. **Done — 40+ concrete rules cataloged across color, typography, layout, motion, content, and forbidden patterns.**

- [x] Search for real-world implementations of LLM-based visual/design review. **Done — 22+ tools cataloged across 7 tiers: full pipeline tools (Glance, claude-code-frontend-dev, QA-GPT, Flawless.is), MCP servers (Screenshot Analysis, mcp-screenshot-website-fast), commercial platforms (Applitools, Percy, Chromatic, Meticulous, Momentic, Octomind, Autonoma), accessibility agents, Figma plugins, and academic research (UICrit, Baymard).**

- [x] Investigate Claude's vision capabilities for design review. **Done — Vision models are RELIABLE for layout/composition (grid patterns, hero alignment, hierarchy) and UNRELIABLE for exact colors (#000 vs #171717), similar-category fonts (Inter vs Outfit), pixel measurements, and WCAG ratios. Two-layer approach needed: DOM inspection for tokens, vision for holistic taste.**

- [x] Research the Playwright + screenshot → LLM review pipeline pattern. **Done — Pattern is well-established. Key implementations: Glance (MCP browser for Claude), claude-code-frontend-dev (closed-loop auto-fix), QA-GPT (Vimium + GPT-4V). The user already has Playwright MCP which provides this capability natively.**

- [x] Map out what the Scoria taste-skill rules look like as LLM-checkable assertions. **Done — Detailed mapping created: 6 rules need DOM/CSS inspection (pure black, Inter font, exact teal, touch targets, contrast, h-screen), 4 rules work well with vision (3-col grids, centered heroes, visual hierarchy, overall aesthetic), 2 need static analysis (arbitrary spacing, hardcoded colors in source).**

- [x] Research existing "design lint" tools that could complement LLM review. **Done — Key tools: eslint-plugin-tailwindcss (arbitrary values), @axe-core/playwright (WCAG), css-audit (compiled CSS analysis), Playwright computed styles (rendered page inspection). Recommended 3-tier approach: static analysis → rendered page checks → vision review.**

- [x] Design a concrete agentic QA loop architecture for Healing Hearts. **Done — 3-layer architecture (static analysis → rendered page inspection → vision review) with full prompt template, 4 integration options (skill, hook, dispatch, cron), and phased rollout plan.**

- [x] Write the findings report to `.dispatch/tasks/ai-design-review-agents/output.md`. **Done — 8-section report: executive summary, 22+ tools cataloged, vision capability matrix, rule-by-rule assessment, architecture diagram, prompt template, limitations, and phased next steps.**

- [x] Touch `.dispatch/tasks/ai-design-review-agents/ipc/.done` to mark completion.
