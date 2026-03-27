# HH Dev Team Plugin — Build Plan

Copy PHEDRIS dev team skeleton → HH-specific agents, commands, skill, hook.

## Checklist

- [x] 1. Read PHEDRIS templates (all 8 files) — read all 3 agents, 2 commands, 1 skill, 1 hook, 1 settings.json
- [x] 2. Create `code-reviewer.md` agent — 6 dimensions: Correctness, React Patterns, Error Handling, Code Quality, HH-Specific Rules, Performance (11.5KB)
- [x] 3. Create `security-auditor.md` agent — 5 dimensions: Injection/XSS, Auth, Credentials, Content Access Control, Data Integrity (9.2KB)
- [x] 4. Create `quality-gate.md` agent — 7 checks: Lint, Build, Bundle Size, Supabase Safety, Secrets, Migration, CLAUDE.md Compliance (6.9KB)
- [x] 5. Create `review.md` command — triggers review-pipeline skill
- [x] 6. Create `deploy-check.md` command — triggers quality-gate agent
- [x] 7. Create `review-pipeline.md` skill — orchestrator with scope detection, deploy mode, parallel dispatch, consolidated report (5.5KB)
- [x] 8. Create `pre-deploy-gate.sh` hook — blocks git push and vercel deploy commands
- [x] 9. Create `.claude/settings.json` — PreToolUse hook registered for Bash matcher
- [x] 10. Final validation — all 8 files verified: frontmatter valid, cross-references correct, HH-specific patterns confirmed
