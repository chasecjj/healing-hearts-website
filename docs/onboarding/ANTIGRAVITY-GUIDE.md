# Antigravity IDE — Beginner's Guide for Desirae

> Everything you need to set up Antigravity, run the Healing Hearts website on your computer, and start making edits with Gemini's help.

---

## Table of Contents

- [Part 1 — One-Time Setup](#part-1--one-time-setup)
- [Part 2 — The Antigravity Interface](#part-2--the-antigravity-interface)
- [Part 3 — Running the Website Locally](#part-3--running-the-website-locally)
- [Part 4 — Meet Gemini](#part-4--meet-gemini)
- [Part 5 — Your First Edit](#part-5--your-first-edit)
- [Part 6 — Saving Your Work with Git](#part-6--saving-your-work-with-git)
- [Part 7 — Safe Zone Reference](#part-7--safe-zone-reference)
- [Part 8 — Daily Workflow Checklist](#part-8--daily-workflow-checklist)
- [Appendix — Quick Reference Table](#appendix--quick-reference-table)

---

## Part 1 — One-Time Setup

You only need to do these steps once.

### Step 1: Download Antigravity IDE

Antigravity is Google's free code editor with a built-in AI assistant called Gemini.

1. Go to **https://idx.google.com/antigravity** (or search "Google Antigravity IDE download")
2. Click **Download** for Windows
3. Run the installer — click **Next** through all the screens and accept the defaults
4. When it finishes, open Antigravity from your Start menu

> **What if it doesn't install?** Make sure you're running Windows 10 or later. If you get a security warning, click "More info" then "Run anyway" — the software is safe, Windows just doesn't recognize new apps.

### Step 2: Install Node.js

Node.js is the engine that runs the website on your computer during development. Think of it like the electricity that powers the lights — you need it running, but you don't interact with it directly.

> See [GETTING-STARTED.md, Part 1 Step 1](../GETTING-STARTED.md#1-install-nodejs) for detailed install instructions with screenshots.

**Quick version:**
1. Go to **https://nodejs.org**
2. Click the **LTS** button (the stable version)
3. Run the installer with all defaults

**Verify it worked:** Open any terminal and type `node --version`. You should see a number like `v22.x.x`.

### Step 3: Install Git

Git is the tool that tracks your changes and lets you share your work with Chase. Think of it like a "save history" that remembers every version of every file.

> See [GETTING-STARTED.md, Part 1 Step 2](../GETTING-STARTED.md#2-install-git) for detailed install instructions.

**Quick version:**
1. Go to **https://git-scm.com**
2. Download and run the installer with all defaults

**Verify it worked:** Open any terminal and type `git --version`. You should see something like `git version 2.x.x`.

### Step 4: Clone the Project

"Cloning" means downloading a copy of the project to your computer.

1. Open Antigravity
2. Open the terminal (the command area at the bottom of the screen — see Part 2 if you can't find it)
3. Type these commands one at a time, pressing **Enter** after each:
   ```
   cd ~/Documents
   git clone https://github.com/chasecjj/healing-hearts-website.git
   ```
4. Open the project: Go to **File > Open Folder**, then navigate to `Documents > healing-hearts-website` and click **Open**

> **What if it says "permission denied"?** Your GitHub account needs access. Tell Chase your GitHub username and he'll add you.

### Step 5: Set Up Your Environment File

The site needs to know how to connect to the database. This is stored in a secret file called `.env`.

1. In Antigravity's file explorer (the panel on the left), find the file called `.env.example`
2. Right-click it and select **Copy**
3. Right-click in the same folder area and select **Paste**
4. Rename the copy from `.env.example copy` to `.env` (remove "example" and the word "copy")
5. Open the new `.env` file and replace the placeholder text with the real values — **ask Chase for these**

> **Important:** Never share the `.env` file with anyone or upload it to GitHub. It contains private database credentials.

> **What if you can't see `.env.example`?** Some file explorers hide files that start with a dot. Look for a setting like "Show Hidden Files" in the file explorer menu.

---

## Part 2 — The Antigravity Interface

Antigravity has four main areas. Here's what each one does:

### The File Explorer (left side)
This shows all the project files and folders, like a file cabinet. Click any file to open it in the editor. Important folders:
- **`src/pages/`** — Each page of the website is a separate file here
- **`src/components/`** — Shared pieces used across multiple pages
- **`public/`** — Where images and other static files go
- **`docs/`** — Documentation (like this guide!)

### The Editor (center)
This is where you view and edit files. It works like a text editor:
- **Ctrl + S** — Save the file
- **Ctrl + F** — Find text in the current file
- **Ctrl + Z** — Undo your last change

You can have multiple files open in tabs across the top.

### The Terminal (bottom)
This is the command line — where you type commands to run the website, save your work, etc. If you don't see it:
- Look for a **Terminal** menu at the top and select **New Terminal**
- Or try the keyboard shortcut (often **Ctrl + `** — that's the backtick key, above Tab)

### The Built-in Browser (right side or separate panel)
Antigravity can show a mini browser inside the editor so you can see your changes without switching windows. When the dev server is running, it will show your website right inside Antigravity.

> **Tip:** You can drag the borders between these panels to make any area bigger or smaller.

---

## Part 3 — Running the Website Locally

"Running locally" means the website is live on your computer so you can see your changes in real time. It's like a private preview — only you can see it.

### First time only: Install dependencies

Dependencies are the building blocks the project needs (like React, Tailwind, etc.). You download them once.

1. Open the terminal in Antigravity
2. Type and press **Enter**:
   ```
   npm install
   ```
3. Wait for it to finish (you'll see a lot of text scrolling — that's normal)

> **What if it shows errors?** Try closing Antigravity, reopening it, and running `npm install` again. If it still fails, ask Chase.

### Start the website

1. In the terminal, type:
   ```
   npm run dev
   ```
2. You'll see output like:
   ```
   VITE v7.3.1  ready in 300 ms
   ➜  Local:   http://localhost:5173/
   ```
3. Click the link or open **http://localhost:5173** in your browser (or Antigravity's built-in browser)

**The website is now running!**

### Hot Reload — See Changes Instantly

While the dev server is running, every time you save a file (**Ctrl + S**), the browser automatically refreshes to show your changes. You don't need to restart anything or click refresh.

### Stop the website

When you're done for the day, press **Ctrl + C** in the terminal. This stops the server.

> **What if the page looks broken?** Check the terminal for red error text — the first line usually tells you which file has the problem and the line number. If you're stuck, undo your last change (**Ctrl + Z**) and save again.

---

## Part 4 — Meet Gemini

Gemini is an AI assistant built right into Antigravity. Think of it like having a knowledgeable helper sitting next to you who can answer questions, explain code, and even make changes for you.

### Starting Gemini

Look for a Gemini icon or chat panel in Antigravity. It might be:
- A chat icon in the sidebar
- A panel that opens at the bottom or right side
- Accessible through a menu item like **View > Gemini** or **AI > Assistant**

> **Note:** Antigravity is still in preview, so the exact location may change. Look for anything labeled "Gemini," "AI," or "Assistant."

### What Gemini Can Do

- **Answer questions** about the code ("What does this file do?")
- **Make changes** for you ("Change the tagline on the homepage to...")
- **Explain errors** when something goes wrong
- **Help with Git** ("How do I save my changes?")
- **Find things** ("Where is the FAQ page?")

### GEMINI.md — Your Context File

In the project root, there's a file called `GEMINI.md`. This is like a cheat sheet that Gemini reads automatically. It tells Gemini:

- That you're a beginner and it should use simple language
- Which files are safe for you to edit
- Which files you should not touch
- The project's colors, fonts, and patterns
- Common things you might want to do

**You don't need to do anything with this file** — it works automatically in the background.

### Execution Policy

When Gemini suggests a code change, it may ask you to confirm before applying it. **Always read what it's proposing before accepting.** If you're not sure, ask Gemini: "Is this a safe change?" or check the Safe Zone reference in Part 7.

### Sample Prompts

See the **[Gemini Prompts Guide](GEMINI-PROMPTS.md)** for a full list of copy-paste prompts organized by task. Here are a few to get started:

- "What is this project?"
- "Show me the homepage file"
- "Change the word 'broken' to 'hurting' on the homepage"
- "Is it safe for me to edit this file?"

> **What if Gemini gives a confusing answer?** Try rephrasing your question in simpler terms. You can also say "Explain that like I'm a complete beginner." If Gemini suggests editing a file in the yellow-light zone, say "I need to check with Chase first."

---

## Part 5 — Your First Edit

Let's walk through three simple changes so you can see how the whole process works.

### Exercise 1: Change text on a page

Let's change the tagline on the homepage.

1. In the file explorer, open **`src/pages/Home.jsx`**
2. Press **Ctrl + F** and search for: `buried`
3. You'll find text like: `Your marriage isn't broken. It's buried.`
4. Change the text to whatever you'd like (keep it inside the quotes or JSX tags)
5. Press **Ctrl + S** to save

**Look at your browser** — the page updates automatically with your new text!

> **What if nothing changed?** Make sure the dev server is running (`npm run dev`). Try a hard refresh: **Ctrl + Shift + R**.

### Exercise 2: Change a color

Let's change the accent color (the salmon/pink highlights).

1. In the file explorer, open **`tailwind.config.js`** (it's in the project root, not inside `src/`)
2. Find the line that says `accent: "#B96A5F"`
3. Change `#B96A5F` to a different color — try `#8B5CF6` for purple, or pick one at [htmlcolorcodes.com](https://htmlcolorcodes.com)
4. Press **Ctrl + S** to save

Every element using the accent color across the entire site updates automatically!

> **Want to undo?** Press **Ctrl + Z** to reverse the change, then save again.

### Exercise 3: Ask Gemini to make a change

Let's let the AI assistant do the work.

1. Open the Gemini chat panel
2. Type: `Change the footer email address to info@healinghearts.com`
3. Gemini will show you the change it wants to make — read it to make sure it looks right
4. Accept the change
5. Check the browser to see the update

> **What if Gemini edits the wrong file?** Press **Ctrl + Z** to undo, then be more specific: "In the file src/components/Footer.jsx, change the email address to info@healinghearts.com"

---

## Part 6 — Saving Your Work with Git

Git tracks every change you make and uploads it to GitHub, where Chase can see it. When you push to GitHub, the live website automatically updates in about 60 seconds.

### The 3-Step Save

After you've made changes you're happy with, open the terminal and type these three commands:

**Step 1 — Stage your changes** (tell Git "these are the changes I want to save"):
```
git add .
```

**Step 2 — Commit** (create a save point with a description):
```
git commit -m "Updated the homepage tagline"
```
Replace the text in quotes with a short description of what you changed.

**Step 3 — Push** (upload to GitHub, which triggers the live site to update):
```
git push
```

That's it! Your changes are saved and the live site will update in about a minute.

### Pull Before You Start

Every time you sit down to work, run this first:
```
git pull
```
This downloads any changes Chase has made since your last session. **Always do this before making edits** to avoid conflicts.

### Check What You've Changed

Before saving, you can see what files you've changed:
```
git status
```
- **Red files** = changed but not staged yet
- **Green files** = staged and ready to commit

### Troubleshooting Git

| Problem | What to Do |
|---------|-----------|
| `git push` says "permission denied" | Ask Chase to add your GitHub account as a collaborator |
| `git push` says "rejected" | Run `git pull` first, then try `git push` again |
| `git pull` shows "merge conflict" | Don't panic! Ask Chase to help resolve it — this happens when two people edit the same line |
| You committed something by mistake | Ask Chase — he can help undo it safely |
| Everything looks weird after `git pull` | Run `npm install` (someone may have added new dependencies), then `npm run dev` |

> **Golden rule:** When in doubt, run `git status` to see what's going on. It never changes anything — it just shows you the current state.

---

## Part 7 — Safe Zone Reference

### Green Light — Safe to Edit

These are content and styling files. Changing text, images, or colors here won't break anything:

| What to Change | Where to Find It |
|----------------|-----------------|
| Any page's text | `src/pages/` — one file per page |
| Images | In the page files, or add new images to `public/` |
| Colors | `tailwind.config.js` — the `colors` section |
| Navigation links | `src/components/Layout.jsx` |
| Footer content | `src/components/Footer.jsx` |
| FAQ questions | `src/pages/FAQ.jsx` |
| Testimonials | `src/pages/Testimonials.jsx` |
| Contact info | `src/pages/Contact.jsx` |
| Legal text | `src/pages/Terms.jsx` and `src/pages/Privacy.jsx` |
| Hero section | `src/components/Hero.jsx` |
| Pricing cards | `src/components/Pricing.jsx` |

### Yellow Light — Ask Chase First

These files control how the site works. Editing them incorrectly can break login, the course portal, or the database connection:

| File / Folder | What It Controls |
|---------------|-----------------|
| `src/contexts/` | Login and authentication |
| `src/lib/` | Database connections |
| `src/hooks/` | Data loading logic |
| `src/components/LessonContent.jsx` | Course content display |
| `src/components/ProtectedRoute.jsx` | Course access security |
| `src/CoursePortal.jsx` | Course portal |
| `supabase/` folder | Database structure |
| `.env` | Database credentials |
| `vite.config.js`, `vercel.json` | Build and deployment settings |
| `package.json` | Project dependencies |

**The simple rule:** If the file is in `src/pages/` or you're changing text/images in `src/components/`, go for it. If you're not sure, ask Chase or ask Gemini: "Is this file safe for me to edit?"

> See [GETTING-STARTED.md, Part 5](../GETTING-STARTED.md#part-5--what-you-can-edit-vs-ask-chase-first) for the full safe/ask-first reference with more details.

---

## Part 8 — Daily Workflow Checklist

Follow this every time you sit down to work:

### Starting Up
- [ ] Open Antigravity
- [ ] Open the `healing-hearts-website` folder (**File > Open Folder**)
- [ ] Open the terminal
- [ ] Run `git pull` to get the latest changes
- [ ] Run `npm run dev` to start the website
- [ ] Open **http://localhost:5173** in your browser (or Antigravity's built-in browser)
- [ ] Check [Vikunja](http://10.0.0.100:3456) for any tasks assigned to you

### While Working
- [ ] Edit files in the green-light zone
- [ ] Save with **Ctrl + S** and check the browser for each change
- [ ] Ask Gemini if you need help or get confused
- [ ] If something breaks, press **Ctrl + Z** to undo, then save again

### Wrapping Up
- [ ] Review your changes: `git status`
- [ ] Save to GitHub: `git add .` then `git commit -m "description"` then `git push`
- [ ] Mark completed tasks as done in Vikunja
- [ ] Stop the server: **Ctrl + C** in the terminal

---

## Appendix — Quick Reference Table

| Action | How |
|--------|-----|
| **Start the website** | `npm run dev` |
| **Stop the website** | `Ctrl + C` in the terminal |
| **Save a file** | `Ctrl + S` |
| **Undo a change** | `Ctrl + Z` |
| **Find text in a file** | `Ctrl + F` |
| **Save to GitHub** | `git add .` then `git commit -m "message"` then `git push` |
| **Get latest changes** | `git pull` |
| **See what you changed** | `git status` |
| **Open Gemini** | Look for the Gemini/AI icon in the sidebar or menu |
| **Ask if a file is safe** | Ask Gemini: "Is this file safe for me to edit?" |
| **Hard refresh browser** | `Ctrl + Shift + R` |
| **Open Vikunja** | http://10.0.0.100:3456 in your browser |

---

> **Remember:** You can't break anything permanently. Git remembers every version of every file, and Chase can always help you undo a mistake. The best way to learn is to try things!
