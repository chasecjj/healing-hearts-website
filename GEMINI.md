# Healing Hearts Website — GEMINI.md

## About the User

You are helping **Desirae**, a beginner who is learning to edit this website. She is not a programmer.

**Rules for helping Desirae:**
- Use simple, plain language. Define any technical term the first time you use it.
- Give short, numbered steps. Never more than 3 steps before she should see a result.
- Always confirm which file to edit before making changes.
- If she asks about a file in the "Do Not Edit" list below, explain why and suggest she ask Chase instead.
- Be encouraging. If something goes wrong, reassure her it's fixable.
- When showing code, highlight only the part she needs to change — don't dump entire files.
- Before making any change, briefly explain what the change will do in plain English.

---

## Stack

- **React 19** — the framework that builds the pages (files end in `.jsx`)
- **Vite 7** — the tool that runs the website on her computer during development
- **Tailwind CSS 3** — the system that controls colors, spacing, and fonts using class names
- **GSAP** — handles scroll animations
- **Supabase** — the database and login system (cloud-hosted, don't touch)
- **Vercel** — automatically publishes the site when code is pushed to GitHub
- **Lucide React** — the icon library
- **react-router-dom v7** — handles page navigation

---

## Commands

| Command | What It Does |
|---------|-------------|
| `npm install` | Downloads project dependencies (first time only, or after updates) |
| `npm run dev` | Starts the website at http://localhost:5173 |
| `npm run build` | Creates the production version (~686KB) |
| `npm run preview` | Previews the production build locally |
| `Ctrl + C` | Stops the running server |

---

## Project Structure

```
healing-hearts-website/
├── GEMINI.md              <-- You're reading this (your context file)
├── CLAUDE.md              <-- Context file for a different AI tool
├── .env                   <-- Database credentials (NEVER share or edit)
├── tailwind.config.js     <-- Brand colors and fonts
├── src/
│   ├── pages/             <-- One file per page (SAFE TO EDIT)
│   ├── components/        <-- Shared building blocks (some safe, some not)
│   ├── contexts/          <-- Auth system (DO NOT EDIT)
│   ├── hooks/             <-- Data loading (DO NOT EDIT)
│   └── lib/               <-- Database connections (DO NOT EDIT)
├── public/                <-- Static images go here
├── supabase/              <-- Database setup (DO NOT EDIT)
└── docs/                  <-- Documentation
```

---

## Safe to Edit (Green Light)

These files contain text, images, and styling that Desirae can freely change:

| File | What's There |
|------|-------------|
| `src/pages/Home.jsx` | Homepage — hero text, tagline, sections |
| `src/pages/About.jsx` | About page — story, founder info |
| `src/pages/Programs.jsx` | Coaching packages |
| `src/pages/Tools.jsx` | Frameworks and methods overview |
| `src/pages/Frameworks.jsx` | Detailed framework breakdown |
| `src/pages/PhysicianMarriages.jsx` | Physician couples program |
| `src/pages/Physicians.jsx` | Physician-focused landing page |
| `src/pages/Resources.jsx` | Articles and downloads |
| `src/pages/Contact.jsx` | Contact info and form |
| `src/pages/Testimonials.jsx` | Client testimonials |
| `src/pages/FAQ.jsx` | Frequently asked questions |
| `src/pages/Terms.jsx` | Terms and Conditions |
| `src/pages/Privacy.jsx` | Privacy Policy |
| `src/pages/CourseOverview.jsx` | Course landing page |
| `src/components/Footer.jsx` | Bottom footer — links, contact info |
| `src/components/Navbar.jsx` | Top navigation bar |
| `src/components/Layout.jsx` | Navigation links and page wrapper |
| `src/components/Hero.jsx` | Landing page hero section |
| `src/components/Features.jsx` | Feature highlight cards |
| `src/components/Philosophy.jsx` | Philosophy section |
| `src/components/Pricing.jsx` | Membership pricing cards |
| `src/components/Protocol.jsx` | Framework display |
| `tailwind.config.js` | Brand colors and fonts |
| `public/` | Static images (add new images here) |

## Do Not Edit (Yellow Light)

If Desirae asks about these, tell her to ask Chase:

| File / Folder | Why |
|---------------|-----|
| `src/contexts/AuthContext.jsx` | Controls login — breaking it locks everyone out |
| `src/components/ProtectedRoute.jsx` | Security gate for the course portal |
| `src/components/AdminRoute.jsx` | Admin access control |
| `src/components/LessonContent.jsx` | Renders course content from database |
| `src/lib/supabase.js` | Database connection |
| `src/lib/courses.js` | Course data queries |
| `src/hooks/useCourseData.js` | Course data loading |
| `src/CoursePortal.jsx` | Course portal logic |
| `src/main.jsx` | App entry point |
| `supabase/` folder | Database schema and migrations |
| `.env` | Database credentials |
| `vite.config.js` | Build tool configuration |
| `vercel.json` | Deployment routing |
| `package.json` | Project dependencies |

---

## Brand Colors

| Name | Hex Code | Tailwind Class | Used For |
|------|----------|----------------|----------|
| Primary (Teal) | `#1191B1` | `text-primary`, `bg-primary` | Headings, buttons, links, footer |
| Accent (Salmon) | `#B96A5F` | `text-accent`, `bg-accent` | Hover states, highlights, decorations |
| Background (White) | `#FFFFFF` | `bg-background` | Page backgrounds |
| Foreground (Charcoal) | `#2D2D2D` | `text-foreground` | Body text, dark sections |

These are defined in `tailwind.config.js`.

## Brand Fonts

| CSS Class | Font | Style | Used For |
|-----------|------|-------|----------|
| `font-sans` | Plus Jakarta Sans | Modern, rounded | Body text, paragraphs |
| `font-outfit` | Outfit | Geometric, bold | Section headings |
| `font-drama` | Cormorant Garamond | Serif, italic | Large dramatic headlines |
| `font-mono` | IBM Plex Mono | Monospace | Labels, small caps |

---

## Common Edit Patterns

### Change text on a page
Find the text between quotes or JSX tags and edit it:
```jsx
// Before
<h1>Your marriage isn't broken. It's buried.</h1>

// After
<h1>Your relationship deserves to thrive.</h1>
```

### Change an image
Find the image URL (search for `unsplash.com` or `src=`) and replace it:
```jsx
// Replace the URL inside the quotes
<img src="https://new-image-url.com/photo.jpg" />
```
For local images, put the file in `public/` and reference as `/filename.jpg`.

### Change a color
Edit the hex code in `tailwind.config.js`:
```js
primary: "#1191B1",  // Change this hex code to a new color
```

### Add a FAQ question
In `src/pages/FAQ.jsx`, find the existing questions and add a new one following the same pattern.

### Add a testimonial
In `src/pages/Testimonials.jsx`, find the existing testimonials and add a new one following the same pattern.

---

## Git Workflow (The 3-Step Save)

```bash
git add .                              # Stage all changes
git commit -m "Describe what changed"  # Save a snapshot
git push                               # Upload to GitHub (triggers auto-deploy)
```

Before starting work each day: `git pull` (downloads the latest changes).

---

## Deployment

- **Live URL:** https://healing-hearts-olive.vercel.app
- Pushing to the `master` branch automatically deploys via Vercel (~60 seconds)
- No manual deploy steps needed

---

## Important Reminders

- **Hot reload:** When the dev server is running, saving a file automatically refreshes the browser.
- **`.env` file:** Never share it, never commit it, never edit it without asking Chase.
- Content in the database (course lessons) is managed through Supabase, not through these files.
- If you see red error text in the terminal, read the first line — it usually says which file and line number has the problem.
