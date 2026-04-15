# Healing Hearts Website — Agent Instructions

> **Full project context:** Read [CLAUDE.md](./CLAUDE.md) first. It contains the complete stack, architecture, auth flow, portal data model, content format, deployment, and phase status.

## Quick Reference

- **Stack:** React 19 + Vite 7 + Tailwind 3 + Supabase (auth + Postgres + RLS)
- **Design system:** Scoria (`@scoria/ui` 23 components via `vendor/` tarballs)
- **Deploy:** Push to `master` → Vercel auto-deploys. Live at healingheartscourse.com
- **Dev:** `npm run dev` → localhost:5173
- **Lint:** `npm run lint`
- **Build:** `npm run build`

## Agent Guidelines

### Before Making Changes
- Read `CLAUDE.md` for full architecture details — especially the auth flow, portal data model, and content format sections.
- Read `design/DESIGN.md` in the Scoria repo (`C:\Users\chase\Documents\scoria\design\DESIGN.md`) before touching any UI components.
- Check existing Scoria components in `vendor/` before creating new UI elements.

### New Pages or Major Redesigns
Use the Forge Lite pipeline from Scoria. Read `C:\Users\chase\Documents\scoria\skills\scoria-build\SKILL.md` for the full build process. Do NOT use Forge Lite for small copy changes or bug fixes.

### Content
- Lesson content is JSONB blocks in Supabase (`content_json` column). Render via `LessonContent.jsx` block registry.
- NEVER use `dangerouslySetInnerHTML`. All content renders as React components.
- The `is_preview` flag is `false` on all modules — do not set it to `true` without explicit direction.

### Database
- Supabase project: `qleojrlqnbiutyhfnqgb`
- RLS enforced on all tables. Module access gated by enrollment.
- Env vars: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env`

### Current Phase
Phase 3 (Stripe payments) shipped LIVE 2026-04-15 (Session 105). Phase 3.5 webhook hardening also shipped (commit `2dc1549`, `STRIPE_WEBHOOK_SECRET` set in Vercel Production, RLS CRITICAL cleared). 17 failed webhook events from pre-hardening window need replay — outstanding task. Phase 4 (React Native mobile app) is planned, not started.

## Hub Skill
For full domain context, workstream status, and SOPs, the `/healing-hearts` hub skill is available.
