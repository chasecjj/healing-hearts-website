# Getting Started with the Healing Hearts Website

> A step-by-step guide for beginners. No coding experience required.

---

## Table of Contents

- [Part 1 — One-Time Setup](#part-1--one-time-setup)
- [Part 2 — Running the Site Locally](#part-2--running-the-site-locally)
- [Part 3 — Project Structure Cheat Sheet](#part-3--project-structure-cheat-sheet)
- [Part 4 — Common Tasks](#part-4--common-tasks)
- [Part 5 — What You Can Edit vs. Ask Chase First](#part-5--what-you-can-edit-vs-ask-chase-first)
- [Part 6 — Saving Your Work (Git Basics)](#part-6--saving-your-work-git-basics)
- [Part 7 — Deploying to Production](#part-7--deploying-to-production)
- [Appendix](#appendix)

---

## Part 1 — One-Time Setup

You only need to do these steps once on your computer.

### 1. Install Node.js

Node.js is the engine that runs the website on your computer during development.

1. Go to **https://nodejs.org**
2. Click the **LTS** (Long Term Support) button — this is the stable version
3. Run the installer, click Next through all the defaults
4. To verify it worked, open a terminal and type:
   ```
   node --version
   ```
   You should see something like `v22.x.x`. Any version 18 or higher is fine.

### 2. Install Git

Git is a tool that tracks changes to the code and lets us share work.

1. Go to **https://git-scm.com**
2. Download the installer for your operating system
3. Run it — the default settings are fine for everything
4. To verify it worked, open a terminal and type:
   ```
   git --version
   ```
   You should see something like `git version 2.x.x`.

### 3. Create a GitHub Account

GitHub is where the project code lives online.

1. Go to **https://github.com** and click **Sign up**
2. Pick a username, enter your email, create a password
3. **Tell Chase your GitHub username** so he can add you as a collaborator on the project

### 4. Install VS Code (Code Editor)

VS Code is the program you'll use to view and edit the code. Think of it like Microsoft Word, but for code.

1. Go to **https://code.visualstudio.com**
2. Click the big blue **Download** button
3. Run the installer — check "Add to PATH" if it asks
4. Open VS Code after installing

**Helpful VS Code extensions** (optional but recommended):
- **ES7+ React/Redux/React-Native snippets** — shortcuts for React code
- **Tailwind CSS IntelliSense** — autocomplete for CSS classes
- **Prettier** — automatic code formatting

To install extensions: click the Extensions icon in the left sidebar (it looks like 4 squares), search for the name, and click Install.

### 5. Clone the Project

"Cloning" means downloading a copy of the project to your computer.

1. Open VS Code
2. Open the built-in terminal by pressing **Ctrl + `** (the backtick key, above Tab)
3. Navigate to where you want the project folder. For example:
   ```
   cd ~/Documents
   ```
4. Clone the repository:
   ```
   git clone https://github.com/chasecjj/healing-hearts-website.git
   ```
5. Open the project folder in VS Code: **File > Open Folder** > select the `healing-hearts-website` folder

### 6. Set Up Environment Variables

The site connects to a database called Supabase. You need to tell your local copy where to find it.

1. In the project root, you'll see a file called `.env.example`
2. Make a copy of it and name it `.env`:
   ```
   cp .env.example .env
   ```
3. Open the new `.env` file and replace the placeholder values with the real ones. **Ask Chase for the actual values** — they look like this:
   ```
   VITE_SUPABASE_URL=https://something.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbG...a-long-string...
   ```
4. Save the file. **Never share the `.env` file or commit it to GitHub** — it's already in `.gitignore`.

You're all set!

---

## Part 2 — Running the Site Locally

### First time only: install dependencies

Open the terminal in VS Code (`Ctrl + ``) and run:

```
npm install
```

This downloads all the libraries the project needs. You only have to do this once (or after someone adds a new library).

### Start the development server

```
npm run dev
```

You'll see output like:

```
  VITE v7.3.1  ready in 300 ms

  ➜  Local:   http://localhost:5173/
```

Open that URL in your browser. **The site is now running on your computer.**

### Hot reload

While the dev server is running, every time you save a file, the browser automatically refreshes to show your changes. You don't need to restart anything.

### Stop the server

Press **Ctrl + C** in the terminal when you're done.

---

## Part 3 — Project Structure Cheat Sheet

Here's where everything lives:

```
healing-hearts-website/
├── .env.example            ← Template for environment variables
├── index.html              ← The HTML shell (you rarely touch this)
├── tailwind.config.js      ← Colors, fonts, and design tokens
├── package.json            ← Project dependencies and scripts
├── vite.config.js          ← Build tool config (don't touch)
├── vercel.json             ← Deployment routing config (don't touch)
│
├── public/                 ← Static files (images you add go here)
│
├── supabase/               ← Database setup
│   ├── migrations/         ← Schema changes (don't touch)
│   └── seed.sql            ← Sample data (don't touch)
│
├── src/
│   ├── main.jsx            ← App entry point (don't touch)
│   ├── App.jsx             ← All page routes are defined here
│   ├── CoursePortal.jsx    ← Course portal shell (sidebar + lessons)
│   ├── LandingPage.jsx     ← Alternate landing page layout
│   ├── index.css           ← Global CSS & Tailwind imports
│   │
│   ├── contexts/
│   │   └── AuthContext.jsx ← Authentication state (don't touch)
│   │
│   ├── lib/
│   │   ├── supabase.js     ← Database connection (don't touch)
│   │   └── courses.js      ← Course data queries (don't touch)
│   │
│   ├── hooks/
│   │   └── useCourseData.js ← Course data loading (don't touch)
│   │
│   ├── components/         ← Shared building blocks
│   │   ├── Layout.jsx      ← Navbar + Footer wrapper
│   │   ├── Navbar.jsx      ← Top navigation bar
│   │   ├── Footer.jsx      ← Bottom footer
│   │   ├── Hero.jsx        ← Landing page hero section
│   │   ├── Features.jsx    ← Feature highlight cards
│   │   ├── Philosophy.jsx  ← Philosophy section
│   │   ├── Pricing.jsx     ← Membership pricing cards
│   │   ├── Protocol.jsx    ← Framework display
│   │   ├── LessonContent.jsx ← Course lesson renderer (don't touch)
│   │   ├── ProtectedRoute.jsx ← Auth route guard (don't touch)
│   │   └── AdminRoute.jsx  ← Admin route guard (don't touch)
│   │
│   └── pages/              ← One file per page
│       ├── Home.jsx
│       ├── About.jsx
│       ├── Programs.jsx
│       ├── Tools.jsx
│       ├── Frameworks.jsx
│       ├── PhysicianMarriages.jsx
│       ├── Physicians.jsx
│       ├── Resources.jsx
│       ├── Contact.jsx
│       ├── Testimonials.jsx
│       ├── FAQ.jsx
│       ├── Terms.jsx
│       ├── Privacy.jsx
│       ├── CourseOverview.jsx
│       ├── Login.jsx
│       ├── Signup.jsx
│       ├── ForgotPassword.jsx
│       └── ResetPassword.jsx
│
└── docs/                   ← Documentation (you're reading this!)
```

### Page file quick reference

| File | URL Path | What It Is |
|------|----------|------------|
| `Home.jsx` | `/` | Landing page with hero image and tagline |
| `About.jsx` | `/about` | Jeff & Trisha's story, philosophy |
| `Programs.jsx` | `/programs` | 3 standalone coaching packages |
| `Tools.jsx` | `/tools` | Overview of frameworks and methods |
| `Frameworks.jsx` | `/frameworks` | Detailed breakdown of the 5 core frameworks |
| `PhysicianMarriages.jsx` | `/physician` | Specialized program for physician couples |
| `Physicians.jsx` | `/physicians` | Physician-focused landing page |
| `Resources.jsx` | `/resources` | Articles and downloadable resources |
| `Contact.jsx` | `/contact` | Contact form and info |
| `Testimonials.jsx` | `/testimonials` | Client testimonials |
| `FAQ.jsx` | `/faq` | Frequently asked questions |
| `Terms.jsx` | `/terms` | Terms & Conditions |
| `Privacy.jsx` | `/privacy` | Privacy Policy |
| `CourseOverview.jsx` | `/course` | Course landing page (Module 7 preview) |
| `Login.jsx` | `/login` | Sign in page |
| `Signup.jsx` | `/signup` | Create account page |
| `ForgotPassword.jsx` | `/forgot-password` | Password reset request |
| `ResetPassword.jsx` | `/reset-password` | Set new password |

The **Course Portal** lives at `/portal` and is only accessible after signing in.

---

## Part 4 — Common Tasks

### Changing text on a page

1. Figure out which page the text is on (see the table above)
2. Open the file in `src/pages/` — for example, `src/pages/About.jsx`
3. Find the text you want to change (use **Ctrl + F** to search)
4. Edit the text between the quotes or inside the JSX tags
5. Save the file (**Ctrl + S**) — the browser updates automatically

**Example:** To change the homepage tagline, open `src/pages/Home.jsx` and find:
```jsx
Your marriage isn't broken. It's buried.
```
Change it to whatever you want, save, done.

### Changing images

The site currently uses placeholder images from Unsplash. Here's where each one is:

| Image | File | What It Shows |
|-------|------|---------------|
| Homepage hero background | `src/pages/Home.jsx` | Couple silhouette |
| Homepage featured photo | `src/pages/Home.jsx` | Couple together |
| About page background | `src/pages/About.jsx` | Subtle overlay (15% opacity) |
| About page featured photo | `src/pages/About.jsx` | Founder portrait |
| Contact page photo | `src/pages/Contact.jsx` | Professional headshot |
| Landing hero background | `src/LandingPage.jsx` | Same as Homepage hero |
| Hero component background | `src/components/Hero.jsx` | Dark interior |
| Philosophy section | `src/components/Philosophy.jsx` | Relationship theme |
| Physicians page | `src/pages/Physicians.jsx` | Medical/professional |
| Social sharing preview | `index.html` | Couple photo (Open Graph) |

**To replace an image:**

1. Open the file listed above
2. Search for `unsplash.com` — you'll find a URL like:
   ```
   https://images.unsplash.com/photo-1511265691771-defa26cce81e?q=80&w=2600&auto=format&fit=crop
   ```
3. Replace the entire URL with your new image URL
4. Save the file

**Tip:** You can find free images at [unsplash.com](https://unsplash.com) or [pexels.com](https://pexels.com). Right-click an image, copy the image URL, and paste it in.

**For local images:** Put the image file in the `public/` folder, then reference it as `/filename.jpg` in the code.

### Changing colors

Open `tailwind.config.js` in the project root. You'll see:

```js
colors: {
  primary: "#1191B1",     // Teal — main brand color
  accent: "#B96A5F",      // Salmon — accent/highlight color
  background: "#FFFFFF",  // White — page backgrounds
  foreground: "#2D2D2D",  // Dark charcoal — text color
},
```

Change any hex code to a new color. Use a color picker like [htmlcolorcodes.com](https://htmlcolorcodes.com) to find hex codes.

After saving, every element using that color name updates across the entire site automatically.

### Adding a new page

This takes 3 steps:

**Step 1:** Create the page file — `src/pages/MyNewPage.jsx`
```jsx
import React from 'react';

export default function MyNewPage() {
  return (
    <section className="min-h-screen px-6 py-32 max-w-4xl mx-auto">
      <h1 className="font-drama italic text-5xl md:text-7xl text-primary mb-8">
        Page Title
      </h1>
      <p className="font-sans text-lg text-foreground/70">
        Your content here.
      </p>
    </section>
  );
}
```

**Step 2:** Add a route in `src/App.jsx`
```jsx
// Add this import at the top with the other imports:
import MyNewPage from './pages/MyNewPage';

// Add this line inside the <Route element={<Layout />}> group:
<Route path="/my-new-page" element={<MyNewPage />} />
```

**Step 3:** Add a navigation link in `src/components/Layout.jsx`

Find the list of nav links and add yours. Search for `navLinks` or the existing link text like "About" to find the right spot.

---

## Part 5 — What You Can Edit vs. Ask Chase First

### Safe to edit on your own

These are content and styling changes that won't break anything:

| What | Where | Notes |
|------|-------|-------|
| Page text and copy | `src/pages/*.jsx` | Change text between quotes |
| Images | `src/pages/*.jsx`, `src/components/*.jsx` | Replace image URLs |
| Colors | `tailwind.config.js` | Change hex codes |
| Navigation links | `src/components/Layout.jsx` | Add/reorder menu items |
| Footer content | `src/components/Footer.jsx` | Update contact info, links |
| FAQ questions | `src/pages/FAQ.jsx` | Add, edit, or remove Q&As |
| Testimonials | `src/pages/Testimonials.jsx` | Update client quotes |
| Contact info | `src/pages/Contact.jsx` | Phone, email, address |
| Terms/Privacy text | `src/pages/Terms.jsx`, `Privacy.jsx` | Update legal copy |

### Ask Chase first

These changes can break the site or affect the database:

| What | Why |
|------|-----|
| Anything in `supabase/` | Database changes require migration scripts |
| Anything in `src/lib/` or `src/hooks/` | These talk to the database |
| `src/contexts/AuthContext.jsx` | Authentication logic |
| `src/components/ProtectedRoute.jsx` | Security gate for the course |
| `src/components/LessonContent.jsx` | Course content renderer |
| `src/CoursePortal.jsx` | Course portal logic |
| `src/App.jsx` route structure | Adding/removing routes is fine, but changing the portal routes can break things |
| `.env` file contents | Database credentials |
| `package.json` dependencies | Adding libraries can introduce conflicts |
| `vite.config.js`, `vercel.json` | Build and deploy configuration |

**Rule of thumb:** If the file is in `src/pages/` or `src/components/` and you're just changing text or images, go for it. If you're not sure, ask Chase.

---

## Part 6 — Saving Your Work (Git Basics)

Git keeps a history of every change. Think of it like "Save As" with version tracking and the ability to share.

### The 3-step save process

```
git add .
git commit -m "Describe what you changed"
git push
```

Here's what each step does:

| Command | Plain English |
|---------|---------------|
| `git add .` | "I want to include all my changes in the next save" |
| `git commit -m "..."` | "Save a snapshot with this description" |
| `git push` | "Upload my saved snapshot to GitHub so others can see it" |

### Example workflow

You changed the About page text and replaced an image:

```
git add .
git commit -m "Updated About page text and replaced founder photo"
git push
```

### Useful commands

| Command | What It Does |
|---------|-------------|
| `git status` | Shows which files you've changed (red = changed, green = ready to save) |
| `git diff` | Shows the actual line-by-line changes you've made |
| `git log --oneline` | Shows the history of all saves (most recent first) |
| `git pull` | Download the latest changes from GitHub (do this before starting work) |

### Daily workflow

1. **Before you start:** `git pull` (get the latest changes)
2. **Make your edits** and check them in the browser
3. **When you're happy:** `git add .` > `git commit -m "message"` > `git push`

---

## Part 7 — Deploying to Production

The live site is at: **https://healing-hearts-olive.vercel.app**

### Automatic deploys (recommended)

Once Vercel is connected to the GitHub repo, every time you `git push` to the `master` branch, Vercel automatically rebuilds and deploys the site. You just push and wait about 60 seconds.

### Manual deploy

If you need to deploy without pushing to GitHub:

```
npx vercel --prod
```

Follow the prompts if it's your first time. Chase can set this up for you.

### Checking your deploy

After pushing, go to [vercel.com/dashboard](https://vercel.com/dashboard) to see the build status. Green checkmark = live.

---

## Appendix

### Color Palette Reference

| Name | Hex Code | Where It's Used |
|------|----------|-----------------|
| Primary (Teal) | `#1191B1` | Headings, buttons, links, footer background |
| Accent (Salmon) | `#B96A5F` | Hover states, highlights, decorative elements |
| Background (White) | `#FFFFFF` | Page backgrounds |
| Foreground (Charcoal) | `#2D2D2D` | Body text, dark sections |

These are defined in `tailwind.config.js` and used throughout the code as `text-primary`, `bg-accent`, etc.

### Font Reference

| CSS Class | Font Name | Style | Where It's Used |
|-----------|-----------|-------|-----------------|
| `font-sans` | Plus Jakarta Sans | Modern, rounded | Default body text, paragraphs |
| `font-outfit` | Outfit | Geometric, bold | Section headings, bold titles |
| `font-drama` | Cormorant Garamond | Serif, italic | Large dramatic headlines |
| `font-mono` | IBM Plex Mono | Monospace | Labels, meta text, small caps |

**Common pattern for big headlines:**
```jsx
<h1 className="font-drama italic text-5xl md:text-7xl">
```

**Common pattern for section labels:**
```jsx
<span className="font-mono text-xs uppercase tracking-widest">
```

### Full File Tree

```
healing-hearts-website/
├── .env.example
├── .gitignore
├── CLAUDE.md
├── README.md
├── docs/
│   └── GETTING-STARTED.md
├── public/
│   └── vite.svg
├── supabase/
│   ├── migrations/
│   │   ├── 001_initial_schema.sql
│   │   └── 002_module7_preview.sql
│   └── seed.sql
├── src/
│   ├── assets/
│   │   └── react.svg
│   ├── components/
│   │   ├── AdminRoute.jsx
│   │   ├── Features.jsx
│   │   ├── Footer.jsx
│   │   ├── Hero.jsx
│   │   ├── Layout.jsx
│   │   ├── LessonContent.jsx
│   │   ├── Navbar.jsx
│   │   ├── Philosophy.jsx
│   │   ├── Pricing.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── Protocol.jsx
│   ├── contexts/
│   │   └── AuthContext.jsx
│   ├── hooks/
│   │   └── useCourseData.js
│   ├── lib/
│   │   ├── courses.js
│   │   └── supabase.js
│   ├── pages/
│   │   ├── About.jsx
│   │   ├── Contact.jsx
│   │   ├── CourseOverview.jsx
│   │   ├── FAQ.jsx
│   │   ├── ForgotPassword.jsx
│   │   ├── Frameworks.jsx
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── PhysicianMarriages.jsx
│   │   ├── Physicians.jsx
│   │   ├── Privacy.jsx
│   │   ├── Programs.jsx
│   │   ├── ResetPassword.jsx
│   │   ├── Resources.jsx
│   │   ├── Signup.jsx
│   │   ├── Terms.jsx
│   │   ├── Testimonials.jsx
│   │   └── Tools.jsx
│   ├── App.css
│   ├── App.jsx
│   ├── CoursePortal.jsx
│   ├── LandingPage.jsx
│   ├── index.css
│   └── main.jsx
├── eslint.config.js
├── index.html
├── package-lock.json
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── vercel.json
└── vite.config.js
```

### Troubleshooting

| Problem | Solution |
|---------|----------|
| `npm install` says "command not found" | Node.js isn't installed. Go back to Part 1, Step 1. |
| `git` says "command not found" | Git isn't installed. Go back to Part 1, Step 2. |
| `npm run dev` shows errors | Try deleting `node_modules/` and running `npm install` again. |
| The page looks broken or won't load | Make sure you saved your file. Check the terminal for red error text — it usually tells you the line number. |
| `git push` says "permission denied" | Your GitHub account doesn't have access. Ask Chase to add you as a collaborator. |
| `git push` says "rejected" | Someone else pushed changes. Run `git pull` first, then try `git push` again. |
| Port 5173 is already in use | Another dev server is running. Close it first, or the terminal will offer a different port. |
| Changes don't show in the browser | Make sure the dev server is running (`npm run dev`). Check you're editing the right file. Try a hard refresh: **Ctrl + Shift + R**. |
| "Module not found" error | A file import path is wrong. Check that the filename and path match exactly (capitalization matters). |
| Site loads but shows no course content | Check your `.env` file has the correct Supabase credentials. The dev server needs to be restarted after changing `.env`. |
| Login/signup doesn't work | Make sure the Supabase URL and anon key in `.env` are correct. Check the browser console (F12) for errors. |
