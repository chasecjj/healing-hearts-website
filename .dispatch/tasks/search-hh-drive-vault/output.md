# Search Results: Healing Hearts Downloadable Resources

**Date:** 2026-03-25
**Searched:** Mind Vault (MCP), Google Drive (PHEDRIS API), PHEDRIS PostgreSQL transcripts (34 sessions / 312K words), HH website codebase, team meeting notes

---

## Summary

All 4 resources are referenced on the Resources page (`src/pages/Resources.jsx:71-76`) as "Free Downloads" but every download button routes to `/coming-soon`. No actual PDF files exist in the website repo. Two of the four have existing source material on Google Drive that could be adapted into standalone lead magnets; two need to be created from scratch.

---

## Resource 1: The 90-Second Wave Guide

**Status: NEEDS TO BE CREATED FROM SCRATCH**

- **No file found** anywhere — not on Drive, not in vault, not in any Canva exports
- **Content exists** in the curriculum: Module 5.3 teaches the 90-Second Wave concept extensively. The concept is based on Jill Bolte Taylor's neuroscience research (emotions peak/pass in ~90 seconds if not re-triggered)
- **Trisha teaches it verbally** in coaching sessions (confirmed in 3 transcripts: Oct 28, Nov 4, Dec 30 2025) — she explains the concept naturally and could script it
- **What it should be:** A one-page printable reference card explaining: (1) What the 90-Second Wave is, (2) Why pausing works (Critter Brain / CEO Brain), (3) 3-4 concrete things to do during the 90 seconds (breathe, move, cold water, don't attach a story), (4) Visual timeline
- **Source material:** Module 5.3 content in vault (`Projects/healing-hearts/modules/`), transcript excerpts from coaching sessions
- **Design owner:** Desirae (Canva)

---

## Resource 2: The SPARK Pact

**Status: NEEDS TO BE CREATED AS STANDALONE — source content exists in Module 1.4**

- **No standalone file found** on Drive or vault
- **Full Module 1.4 PDF exists** on Drive: "Module 1.4 - The SPARK of Safety.pdf" — but the Pact is embedded as a fill-in exercise within the 25+ page module
- **The SPARK Pact exercise** is defined in `Projects/healing-hearts/modules/Module 1_4.md` and the rebuild version at `Projects/healing-hearts/modules/rebuild/Module 1.4 — The SPARK of Safety.md`:
  ```
  Our Pause Number: ___ (scale of 1–10, e.g., 6)
  Our Pause Cue: ___ (hand signal, word, or phrase)
  My Reset Move: ___ (breathing, walking, cold water)
  My Partner's Reset Move: ___
  Our SPARK Ritual: ___ (what does coming back together look like for us?)
  ```
- **What it should be:** A designed one-page printable with the fill-in fields above, plus a brief reminder of what SPARK stands for (See → Pause & Probe → Acknowledge → Reconnect → Kindle) and the Pause Number rules
- **Design note:** Should feel like something you'd tape to the fridge — warm, not clinical. Match HH brand (cream background, copper accents, Cormorant Garamond headers)
- **Design owner:** Desirae (Canva)

---

## Resource 3: The Connection Map

**Status: EXISTS ON GOOGLE DRIVE — needs extraction/adaptation as standalone lead magnet**

- **Found on Drive:** `Module 6.1 - Healing Hearts Connection Map Worksheet.pdf` (2 copies)
  - Link: https://drive.google.com/file/d/1pxSSVO4cExXhurAcm1GGAHwleYlFatdK/view?usp=drivesdk
  - Link: https://drive.google.com/file/d/1H1-rsqk6oJXgwHsis3itiwxegBCzTbis/view?usp=drivesdk
- **Curriculum definition:** Module 6.1 — "A self-assessment tool that maps where a person is spending their emotional energy across key relationship domains. Used to identify areas of depletion and areas of investment." Prerequisites: Zones of Resilience (Module 5.4)
- **As described on website:** "Identify which Zone you and your partner default to under stress" — references Red/Yellow/Green/Blue Zones
- **Action needed:** Download the existing PDF and evaluate whether it works as a standalone lead magnet WITHOUT requiring Module 5.4 context (Zones of Resilience). If it references Zone terminology without explanation, add a brief "How to Read This" section that defines the 4 zones
- **Design owner:** May already be Desirae-designed. Verify formatting meets current brand standards.

---

## Resource 4: Know Your Blueprint

**Status: PARTIAL — source worksheets exist on Google Drive, needs adaptation as standalone**

- **Found on Drive:**
  - `Module 1.2 - Personality & Love Language Worksheet - Copyright.pdf` (course module worksheet)
    - Link: https://drive.google.com/file/d/1-gItsYFHFoHEkS0SYvZ90Tamerphtj4j/view?usp=drivesdk
  - `Your Guide to a Deeper Connection: Understanding the Blueprints of Love` (Google Doc)
    - Link: https://docs.google.com/document/d/1CLzFGmIA1OfQ25pC14YrsBxRRB0b3TH4Lp8OxULRwOY/edit?usp=drivesdk
  - Also exists as Google Doc at: https://docs.google.com/document/d/1q6EMq5XO0diaeDW7ZfksqSRrRE6JbNz0oQ0bFjSu8ME/edit?usp=drivesdk
- **Curriculum basis:** Module 1.2 — Personality Blueprint (Hartman Color Code) + Love Languages (Five Love Languages by Gary Chapman)
- **As described on website:** "A personality + attachment discovery worksheet for couples"
- **"Blueprints of Love" Google Doc** — This is the most promising match. Title directly aligns with "Know Your Blueprint." Needs review to determine if it's a standalone guide or course-embedded content.
- **Action needed:** (1) Review both Drive files. (2) If "Blueprints of Love" doc is already standalone-formatted, adapt it as the lead magnet. (3) If it's a raw course module, extract a self-contained worksheet that couples can use without the full program context. Should include: Hartman Color Code overview + pointer to online assessment, Love Languages brief quiz or pointer, a "Your Couple Profile" fill-in section.
- **Design owner:** Desirae (Canva)

---

## Important Context

### Team Position on Downloadable PDFs
In the March 5, 2026 team meeting, Chase argued against downloadable PDFs on the website due to content theft risk (easy to forward/share). However, that concern was about **paid course content** — these 4 resources are **free lead magnets** designed to capture email addresses. Free lead magnets are intentionally distributed, so the content theft concern doesn't apply.

### Email Capture Gap
Currently, the download buttons go to `/coming-soon`. The customer journey spec (Gap 5) notes that each free download should have a 3-5 email nurture sequence. Infrastructure needed:
1. Email capture modal/form for each download
2. Supabase table for download leads
3. Resend email sequence per resource (3-5 emails each)
4. Actual PDF hosted somewhere (Supabase Storage, Vercel, or Drive public link)

### Design Pipeline
The HH content pipeline has a 7-agent process ending with a Design Producer spec for Canva. For these simpler one-page resources, Desirae could likely design them directly in Canva from the content specs above without the full pipeline.

---

## Action Matrix

| Resource | Exists? | Source Material | Effort to Ship |
|----------|---------|----------------|----------------|
| 90-Second Wave Guide | No | Module 5.3 content + coaching transcripts | **High** — write from scratch, design, build email capture |
| SPARK Pact | Partial (embedded in Module 1.4) | Module 1.4 exercise fields | **Medium** — extract exercise, design one-pager |
| Connection Map | Yes (PDF on Drive) | Module 6.1 worksheet PDF | **Low** — evaluate existing PDF, add Zone context if needed |
| Know Your Blueprint | Partial (related docs on Drive) | Module 1.2 worksheet + "Blueprints of Love" doc | **Medium** — review existing docs, adapt as standalone |
