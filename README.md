# Healing Hearts Website

Relationship and marriage education platform by Jeff & Trisha Jamison. Marketing site + authenticated course portal. Free lead magnet is the 7-Day Spark Challenge email course; full program access is enrollment-gated.

## Stack

- **Frontend:** React 19, Vite 7, Tailwind CSS 3, GSAP animations
- **Backend:** Supabase (auth + PostgreSQL + RLS)
- **Hosting:** Vercel (auto-deploy on push to master)
- **Icons:** Lucide React

## Quick Start

```bash
git clone https://github.com/chasecjj/healing-hearts-website.git
cd healing-hearts-website
cp .env.example .env       # Add your Supabase credentials
npm install
npm run dev                # http://localhost:5173
```

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Production build (~686KB) |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

## Phase Status

| Phase | Status |
|-------|--------|
| Phase 0 — Marketing site on Vercel | Done |
| Phase 1 — Auth (Supabase) | Done |
| Phase 2 — Course portal with real content | Done |
| Phase 3 — Stripe payments | Next |
| Phase 4 — React Native mobile app | Planned |

## Live URL

https://healing-hearts-olive.vercel.app

## Documentation

- **[Getting Started Guide](docs/GETTING-STARTED.md)** — Beginner-friendly setup & editing guide (for Desirae)
- **[CLAUDE.md](CLAUDE.md)** — Architecture reference for AI-assisted development
