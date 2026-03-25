# 7-Day Spark Challenge Launch — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the "Ignite Your Connection" 7-day email drip challenge as a fully functional lead magnet before the April 10 expo.

**Architecture:** Visitor signs up on `/spark-challenge` → serverless function inserts into Supabase `spark_signups` table and sends welcome email via Resend → Vercel Cron fires daily at 7 AM MT → queries pending signups → sends the appropriate day's email → increments progress. All 7 emails use Trisha's verbatim content in a shared HTML template.

**Tech Stack:** React 19, Vite 7, Vercel Serverless Functions (ESM), Supabase (PostgreSQL + RLS), Resend v6.9.4, Vercel Cron

**Spec:** `docs/superpowers/specs/2026-03-23-7day-challenge-launch-design.md`

**Raw content:** Trisha's `.docx` extracted to tool output — all 7 video scripts + 7 handouts. Encoding artifacts (`\x92` = apostrophe, `\x96` = dash) need fixing.

---

## File Map

```
Files to CREATE:
  supabase/migrations/007_spark_signups.sql   — Table + RLS + index
  api/_lib/supabase-admin.js                  — Shared service-role Supabase client
  api/emails/spark-shared.js                  — Reusable email HTML chrome
  api/emails/spark-day-1.js                   — Day 1 email template
  api/emails/spark-day-2.js                   — Day 2 email template
  api/emails/spark-day-3.js                   — Day 3 email template
  api/emails/spark-day-4.js                   — Day 4 email template
  api/emails/spark-day-5.js                   — Day 5 email template
  api/emails/spark-day-6.js                   — Day 6 email template
  api/emails/spark-day-7.js                   — Day 7 email template
  api/cron/spark-drip.js                      — Daily cron handler

Files to MODIFY:
  api/spark-signup.js                         — Add Supabase INSERT before email
  src/pages/SparkChallenge.jsx:24-89          — Replace DAYS + FAQ_ITEMS arrays
  vercel.json                                 — Add crons config key
```

---

### Task 1: Supabase Migration — `spark_signups` Table

**Files:**
- Create: `supabase/migrations/007_spark_signups.sql`

- [ ] **Step 1: Create migration directory if needed**

Run: `ls supabase/migrations/ 2>/dev/null || mkdir -p supabase/migrations`

- [ ] **Step 2: Write the migration SQL**

Create `supabase/migrations/007_spark_signups.sql`:

```sql
-- 007: Spark Challenge signups table for email drip tracking
CREATE TABLE spark_signups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  signed_up_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  current_day INTEGER DEFAULT 0 NOT NULL CHECK (current_day >= 0 AND current_day <= 7),
  completed BOOLEAN DEFAULT false NOT NULL,
  unsubscribed BOOLEAN DEFAULT false NOT NULL,
  last_email_sent_at TIMESTAMPTZ
);

-- Partial index for the daily cron query (only active, incomplete signups)
CREATE INDEX idx_spark_signups_active
  ON spark_signups (current_day)
  WHERE completed = false AND unsubscribed = false;

-- RLS: service-role only, no public access
ALTER TABLE spark_signups ENABLE ROW LEVEL SECURITY;
```

- [ ] **Step 3: Run migration in Supabase SQL Editor**

Go to Supabase Dashboard → SQL Editor → paste and run the migration.
Verify: Run `SELECT count(*) FROM spark_signups;` — should return 0.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/007_spark_signups.sql
git commit -m "feat: add spark_signups table for 7-day challenge drip tracking"
```

---

### Task 2: Shared Supabase Admin Client

**Files:**
- Create: `api/_lib/supabase-admin.js`

**Context:** The existing `src/lib/supabase.js` uses `import.meta.env.VITE_*` (Vite client-side). Serverless functions must use `process.env`. The `_lib` prefix is a Vercel convention — files in `api/_lib/` are NOT exposed as API endpoints.

- [ ] **Step 1: Create the `_lib` directory**

Run: `mkdir -p api/_lib`

- [ ] **Step 2: Write the admin client**

Create `api/_lib/supabase-admin.js`:

```javascript
/* global process */
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('[supabase-admin] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

export const supabaseAdmin = createClient(url || '', key || '');
```

- [ ] **Step 3: Set Vercel env vars**

Run these (or set in Vercel Dashboard → Settings → Environment Variables):

```bash
vercel env add SUPABASE_URL        # Paste: https://qleojrlqnbiutyhfnqgb.supabase.co
vercel env add SUPABASE_SERVICE_ROLE_KEY  # Paste: service_role key from Supabase dashboard
```

Both should be set for Production, Preview, and Development.

- [ ] **Step 4: Commit**

```bash
git add api/_lib/supabase-admin.js
git commit -m "feat: add shared Supabase admin client for serverless functions"
```

---

### Task 3: Update `spark-signup.js` — Add DB Persistence

**Files:**
- Modify: `api/spark-signup.js`

**Key change:** INSERT into `spark_signups` BEFORE sending the welcome email. If the INSERT fails, return 500 (user retries). If email fails, user is still in DB and will get drip emails.

- [ ] **Step 1: Update spark-signup.js**

Replace the full contents of `api/spark-signup.js` with:

```javascript
/* global process */
// Vercel Serverless Function: POST /api/spark-signup
// Persists signup to Supabase, then sends welcome email via Resend.

import { Resend } from 'resend';
import { supabaseAdmin } from './_lib/supabase-admin.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body || {};

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    return res.status(400).json({ error: 'A valid email address is required.' });
  }

  const cleanEmail = email.trim().toLowerCase();

  // Step 1: Persist to Supabase BEFORE sending email
  try {
    const { error } = await supabaseAdmin
      .from('spark_signups')
      .upsert({ email: cleanEmail }, { onConflict: 'email', ignoreDuplicates: true });

    if (error) {
      console.error('[spark-signup] Supabase insert failed:', error);
      return res.status(500).json({ error: 'Signup failed. Please try again.' });
    }
  } catch (err) {
    console.error('[spark-signup] Supabase error:', err);
    return res.status(500).json({ error: 'Signup failed. Please try again.' });
  }

  // Step 2: Send welcome email via Resend (non-blocking on failure)
  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: 'Healing Hearts <hello@healingheartscourse.com>',
        to: cleanEmail,
        subject: "You're in! Your 7-Day Spark Challenge starts tomorrow",
        html: welcomeEmail(),
      });

      // Notify the team
      await resend.emails.send({
        from: 'Healing Hearts <noreply@healingheartscourse.com>',
        to: 'hello@healingheartscourse.com',
        subject: `New Spark Challenge signup: ${cleanEmail}`,
        text: `New signup for the 7-Day Spark Challenge!\n\nEmail: ${cleanEmail}\nTime: ${new Date().toISOString()}\n\nThis person will receive Day 1 tomorrow morning.`,
      });
    } catch (err) {
      console.error('[spark-signup] Email send failed:', err);
      // Don't fail the request — user is already in DB and will get drip emails
    }
  } else {
    console.warn('[spark-signup] RESEND_API_KEY not set — skipping email');
  }

  console.log('[spark-signup] New signup:', cleanEmail, new Date().toISOString());

  return res.status(200).json({
    success: true,
    message: "You're in! Check your inbox for a welcome message.",
  });
}

function welcomeEmail() {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to the Spark Challenge</title>
</head>
<body style="margin:0; padding:0; background-color:#faf9f6; font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#faf9f6;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <img src="https://healingheartscourse.com/logo.png" alt="Healing Hearts" width="48" height="48" style="display:block;">
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background-color:#ffffff; border-radius:16px; padding:48px 40px; box-shadow:0 4px 24px rgba(17,145,177,0.06);">

              <!-- Accent bar -->
              <div style="height:3px; background:linear-gradient(90deg, #1191B1, #B96A5F, #1191B1); border-radius:2px; margin-bottom:32px;"></div>

              <h1 style="margin:0 0 16px; font-size:28px; color:#2D2D2D; font-weight:400; font-style:italic; font-family:Georgia,'Times New Roman',serif;">
                Welcome to the Spark Challenge
              </h1>

              <p style="margin:0 0 24px; font-size:16px; line-height:1.7; color:#555555;">
                Hi there! I'm Trisha, and I'm so glad you're here.
              </p>

              <p style="margin:0 0 24px; font-size:16px; line-height:1.7; color:#555555;">
                Over the next seven days, you and your partner are going to reconnect in ways that might surprise you. These aren't big, dramatic gestures -- they're small, intentional moments that remind you both why you chose each other.
              </p>

              <p style="margin:0 0 24px; font-size:16px; line-height:1.7; color:#555555;">
                <strong>Day 1 arrives tomorrow morning.</strong> Each day you'll get a short lesson and one simple practice to do together. Some will make you laugh. Some might make you think. All of them work.
              </p>

              <p style="margin:0 0 32px; font-size:16px; line-height:1.7; color:#555555;">
                One thing I've learned from 20 years of coaching couples: change doesn't have to be hard. Sometimes it just starts with showing up -- and you already did that by signing up today.
              </p>

              <!-- CTA -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 32px;">
                <tr>
                  <td align="center" style="background-color:#1191B1; border-radius:50px; padding:14px 32px;">
                    <a href="https://healingheartscourse.com/spark-challenge" style="color:#ffffff; text-decoration:none; font-size:16px; font-weight:600; display:inline-block;">
                      Preview the Challenge
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <div style="height:1px; background-color:#e5e5e5; margin:24px 0;"></div>

              <!-- Warm sign-off -->
              <p style="margin:0 0 4px; font-size:16px; line-height:1.7; color:#555555;">
                Cheering for you both,
              </p>
              <p style="margin:0 0 4px; font-size:18px; color:#2D2D2D; font-style:italic; font-family:Georgia,'Times New Roman',serif;">
                Trisha Jamison
              </p>
              <p style="margin:0; font-size:13px; color:#a3a3a3;">
                Founder, Healing Hearts
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:32px 20px 0;">
              <p style="margin:0 0 8px; font-size:13px; color:#a3a3a3;">
                Healing Hearts &middot; healingheartscourse.com
              </p>
              <p style="margin:0; font-size:12px; color:#d4d4d4;">
                Every marriage has a story worth fighting for.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
```

- [ ] **Step 2: Verify build**

Run: `cd C:/Users/chase/Documents/HealingHeartsWebsite && npm run build`
Expected: Build succeeds (serverless functions in `api/` are not part of the Vite build, but this verifies no client-side breakage).

- [ ] **Step 3: Commit**

```bash
git add api/spark-signup.js
git commit -m "feat: persist spark signups to Supabase before sending welcome email"
```

---

### Task 4: Update Landing Page Content

**Files:**
- Modify: `src/pages/SparkChallenge.jsx:24-89`

- [ ] **Step 1: Replace DAYS array (lines 24-66)**

Replace the `DAYS` constant with Trisha's actual titles and descriptions from the spec (Section 3). The exact array is in the spec — copy it verbatim.

- [ ] **Step 2: Update FAQ_ITEMS (lines 68-89)**

Replace the "What happens after the 7 days?" answer:

Old:
```
"You'll have a personalized Connection Blueprint and an invitation to explore our full Healing Hearts program — but there's zero pressure."
```

New:
```
"You'll have practiced 7 powerful connection tools and had the Spark Conversation with your partner -- a direct, loving exchange about what makes each of you feel truly loved. From there, you're welcome to explore our full Healing Hearts program, but there's zero pressure."
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 4: Verify dev server**

Run: `npm run dev` — open http://localhost:5173/spark-challenge
Expected: See updated day titles: "The 'I Noticed' Text", "The Specific Spark Compliment", etc.

- [ ] **Step 5: Commit**

```bash
git add src/pages/SparkChallenge.jsx
git commit -m "feat: update Spark Challenge page with Trisha's actual 7-day content"
```

---

### Task 5: Shared Email Template Chrome

**Files:**
- Create: `api/emails/spark-shared.js`

**Context:** This module exports reusable HTML wrappers used by all 7 day email templates. Matches the visual style of the existing `welcomeEmail()` in `spark-signup.js`: cream background, white card, teal/salmon gradient accent bar, Georgia serif headlines.

- [ ] **Step 1: Create emails directory**

Run: `mkdir -p api/emails`

- [ ] **Step 2: Write spark-shared.js**

Create `api/emails/spark-shared.js`:

```javascript
// Shared email HTML chrome for Spark Challenge drip emails.
// All day templates import these helpers to maintain consistent styling.

export function emailWrapper(bodyContent) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:0; background-color:#faf9f6; font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#faf9f6;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%;">
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <img src="https://healingheartscourse.com/logo.png" alt="Healing Hearts" width="48" height="48" style="display:block;">
            </td>
          </tr>
          <tr>
            <td style="background-color:#ffffff; border-radius:16px; padding:48px 40px; box-shadow:0 4px 24px rgba(17,145,177,0.06);">
              <div style="height:3px; background:linear-gradient(90deg, #1191B1, #B96A5F, #1191B1); border-radius:2px; margin-bottom:32px;"></div>
              ${bodyContent}
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:32px 20px 0;">
              <p style="margin:0 0 8px; font-size:13px; color:#a3a3a3;">
                Healing Hearts &middot; healingheartscourse.com
              </p>
              <p style="margin:0; font-size:12px; color:#d4d4d4;">
                Every marriage has a story worth fighting for.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function heading(text) {
  return `<h1 style="margin:0 0 16px; font-size:28px; color:#2D2D2D; font-weight:400; font-style:italic; font-family:Georgia,'Times New Roman',serif;">${text}</h1>`;
}

export function subheading(text) {
  return `<h2 style="margin:32px 0 12px; font-size:22px; color:#2D2D2D; font-weight:400; font-style:italic; font-family:Georgia,'Times New Roman',serif;">${text}</h2>`;
}

export function paragraph(text) {
  return `<p style="margin:0 0 20px; font-size:16px; line-height:1.7; color:#555555;">${text}</p>`;
}

export function callout(text) {
  return `<div style="background-color:#faf9f6; border-left:4px solid #1191B1; padding:16px 20px; margin:24px 0; border-radius:0 8px 8px 0;">
  <p style="margin:0; font-size:16px; line-height:1.7; color:#555555; font-style:italic;">${text}</p>
</div>`;
}

export function bulletList(items) {
  const listItems = items.map(item => `<li style="margin-bottom:8px; font-size:16px; line-height:1.6; color:#555555;">${item}</li>`).join('');
  return `<ul style="margin:16px 0 24px; padding-left:24px;">${listItems}</ul>`;
}

export function numberedList(items) {
  const listItems = items.map(item => `<li style="margin-bottom:8px; font-size:16px; line-height:1.6; color:#555555;">${item}</li>`).join('');
  return `<ol style="margin:16px 0 24px; padding-left:24px;">${listItems}</ol>`;
}

export function ctaButton(text, url) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:32px auto;">
  <tr>
    <td align="center" style="background-color:#1191B1; border-radius:50px; padding:14px 32px;">
      <a href="${url}" style="color:#ffffff; text-decoration:none; font-size:16px; font-weight:600; display:inline-block;">${text}</a>
    </td>
  </tr>
</table>`;
}

export function divider() {
  return `<div style="height:1px; background-color:#e5e5e5; margin:24px 0;"></div>`;
}

export function signOff(message, previewNext) {
  let html = `${divider()}
${paragraph(message)}
<p style="margin:0 0 4px; font-size:18px; color:#2D2D2D; font-style:italic; font-family:Georgia,'Times New Roman',serif;">Trisha Jamison</p>
<p style="margin:0; font-size:13px; color:#a3a3a3;">Founder, Healing Hearts</p>`;

  if (previewNext) {
    html += `<div style="margin-top:24px; padding:16px 20px; background-color:#f0fafb; border-radius:8px;">
  <p style="margin:0; font-size:14px; color:#1191B1; font-weight:600;">Coming tomorrow:</p>
  <p style="margin:4px 0 0; font-size:14px; color:#555555;">${previewNext}</p>
</div>`;
  }

  return html;
}

export function dayBadge(dayNumber) {
  return `<div style="display:inline-block; background-color:#1191B1; color:#ffffff; font-size:13px; font-weight:700; padding:6px 14px; border-radius:50px; margin-bottom:16px;">Day ${dayNumber} of 7</div>`;
}
```

- [ ] **Step 3: Commit**

```bash
git add api/emails/spark-shared.js
git commit -m "feat: add shared email template chrome for Spark Challenge drip"
```

---

### Task 6: Write Day 1-3 Email Templates

**Files:**
- Create: `api/emails/spark-day-1.js`
- Create: `api/emails/spark-day-2.js`
- Create: `api/emails/spark-day-3.js`

**Context:** Each file exports a function `dayEmail()` that returns `{ subject, html }`. Content is from Trisha's `.docx` — preserve her exact words. Apply proofread fixes inline as you write templates: fix encoding (`\x92` → `'`, `\x96` → `--`), fix typos, remove stage directions, adapt "watch the video" → "read on below." The formal proofread doc in Task 9 records what was changed.

The raw content is in the vault at `Projects/healing-hearts/content/7-Day Challenge -- Ignite Your Connection.docx`. To extract the text, run:
```bash
python -c "
from docx import Document
doc = Document(r'C:\Users\chase\Documents\Mind Vault\Projects\healing-hearts\content\7-Day Challenge — Ignite Your Connection.docx')
for p in doc.paragraphs:
    print(p.text)
"
```

**Email content structure for each day:**
1. Day badge ("Day N of 7")
2. Heading (day title)
3. Trisha's story from the video script (the Jeff + Trisha anecdote)
4. Subheading: "Your Challenge for Today"
5. Challenge instructions from the handout (numbered steps)
6. Subheading: "Reflection Questions"
7. Reflection questions from the handout
8. CTA button: "View the Challenge" → https://healingheartscourse.com/spark-challenge (MUST use absolute URL — email clients require it)
9. Sign-off with preview of tomorrow's topic

**NOTE:** All CTA button URLs MUST be absolute (`https://healingheartscourse.com/...`), never relative. Email clients cannot resolve relative paths.

- [ ] **Step 1: Write spark-day-1.js (REFERENCE IMPLEMENTATION)**

Create `api/emails/spark-day-1.js`. This is the reference template — Days 2-7 follow this exact pattern:

```javascript
// Day 1: The "I Noticed" Text
import {
  emailWrapper, dayBadge, heading, paragraph, subheading,
  callout, numberedList, bulletList, ctaButton, signOff,
} from './spark-shared.js';

export function dayEmail() {
  const subject = "Day 1: The 'I Noticed' Text -- Spark Challenge";

  const body = [
    dayBadge(1),
    heading("The 'I Noticed' Text"),

    paragraph("Hey there, beautiful people! I'm Trisha Jamison and I am so thrilled you're here for Day 1 of our 'Ignite Your Connection: Small Sparks, Big Shifts!' challenge! This week is all about bringing a little extra joy, fun, and deep connection back into your relationship, one tiny, powerful step at a time. No pressure, just play!"),

    paragraph("You know, it's so easy in the hustle and bustle of life -- the school runs, the deadlines, the dinner dilemmas -- to start seeing our partners through a bit of a blurry lens. We see the 'to-do list' version of them, or maybe the 'habit' version. And sometimes, we just forget to really look."),

    paragraph("I remember one time, I was getting ready to head out of town for a few days, and my head was just spinning with last-minute preparations. Normally, I'd have my car all washed and gassed up the night before, but this time, I just completely ran out of hours. I went to bed feeling a little stressed, thinking about everything I still needed to do in the morning before hitting the road."),

    paragraph("Well, the next morning, I woke up, still feeling a bit rushed, and went out to the driveway. And there it was -- my car, sparkling clean, fully packed with my bags, and the gas tank was completely full! Jeff had gotten up extra early, quietly taken care of everything. He had washed the car, filled the tank, helped me pack it, and made sure everything was in perfect working order, all before I even woke up."),

    paragraph("It was such a quiet, thoughtful act of service. He didn't say anything, didn't ask for praise; he just did it because he knew I needed it. And in that moment, seeing that clean, packed, gassed-up car, I just felt so incredibly seen, loved, and supported. It wasn't just about the car; it was about him noticing my stress and silently stepping in to carry the load. It was a huge spark of connection for me right when I needed it most."),

    callout("Today's challenge is all about The 'I Noticed' Text. It's about intentionally looking for the good, the sweet, the funny, the thoughtful -- those little things that often go unseen."),

    subheading("Your Challenge for Today"),

    numberedList([
      "Set a few reminders on your phone throughout the day (maybe one for morning, one for afternoon, and one for evening). These are your gentle nudges to pause!",
      "When a reminder goes off, PAUSE for a moment. Take a deep breath. Now, intentionally NOTICE one specific, positive thing about your partner.",
      "Send them a quick text! Keep it simple, genuine, and positive: 'Hey, I just noticed [the specific thing] and it made me [feel X / I loved that].'"
    ]),

    paragraph("It could be something they did ('I noticed you took out the trash without me asking!'), something they said ('I noticed how patient you were with the kids this morning'), or just something you appreciate about them in that moment ('I noticed your smile today, it just brightened my whole afternoon')."),

    subheading("Reflection Questions"),

    bulletList([
      "How did it feel to intentionally look for the good in your partner today?",
      "How did your partner respond to your 'I Noticed' text?"
    ]),

    ctaButton('View the Challenge', 'https://healingheartscourse.com/spark-challenge'),

    signOff(
      "So, go out there today, be a connection detective, and sprinkle some 'I noticed' magic! I can't wait to hear what you discover.",
      "Day 2: The Specific Spark Compliment -- moving beyond 'you look nice' to compliments that truly land."
    ),
  ].join('\n');

  return { subject, html: emailWrapper(body) };
}
```

- [ ] **Step 2: Write spark-day-2.js**

Follow the Day 1 pattern exactly. Create `api/emails/spark-day-2.js` using Trisha's Day 2 content ("The Specific Spark Compliment"). Include the "You're a great mom" → specific morning chaos story, the compliment formula (`"I noticed you [specific action/quality] and it made me feel [specific feeling]"`), and examples. Preview tomorrow: "Day 3: The 2-Minute Check-In".

- [ ] **Step 3: Write spark-day-3.js**

Follow the Day 1 pattern. Create `api/emails/spark-day-3.js` using Trisha's Day 3 content ("The 2-Minute Check-In"). Include the Jeff problem-solving story, the listener's role instructions (4 steps: Set the Stage, Ask the Question, Listener's Role, Switch Roles), and the "Golden Rule" callout. Preview tomorrow: "Day 4: The Pause Experiment". **NOTE:** Day 3 handout in the docx has a duplicate section (handout text appears twice). Use only one copy.

- [ ] **Step 4: Verify imports work**

Run: `node -e "import('./api/emails/spark-day-1.js').then(m => { const e = m.dayEmail(); console.log('Subject:', e.subject); console.log('HTML length:', e.html.length); })"`
Expected: Subject line prints, HTML length is > 3000 characters.

- [ ] **Step 5: Commit**

```bash
git add api/emails/spark-day-1.js api/emails/spark-day-2.js api/emails/spark-day-3.js
git commit -m "feat: add Day 1-3 Spark Challenge email templates"
```

---

### Task 7: Write Day 4-7 Email Templates

**Files:**
- Create: `api/emails/spark-day-4.js`
- Create: `api/emails/spark-day-5.js`
- Create: `api/emails/spark-day-6.js`
- Create: `api/emails/spark-day-7.js`

Same pattern as Task 6 (follow the Day 1 reference implementation). All CTA buttons use absolute URLs. Day 7 has a special addition: after the sign-off, include the soft upsell section with a CTA to `https://healingheartscourse.com/programs`.

- [ ] **Step 1: Write spark-day-4.js**

Day 4: "The Pause Experiment". Critter Brain / CEO Brain language. Jeff's comment about the sink. 10-second STOP-BREATHE-NOTICE-DON'T RESPOND sequence.

- [ ] **Step 2: Write spark-day-5.js**

Day 5: "The Gratitude Text". Jeff handling dinner all week. "I'm grateful you..." formula. Mid-day send timing.

- [ ] **Step 3: Write spark-day-6.js**

Day 6: "The Memory Lane Moment". Old photos, burnt birthday dinner, pizza. Share + explain why it still matters.

- [ ] **Step 4: Write spark-day-7.js**

Day 7: "The Spark Conversation". Mind-reading → direct question. 15-minute distraction-free session. Write down + commit to action. **Add upsell section after sign-off:**

```
"You've completed the 7-Day Spark Challenge! These 7 tools are yours to keep.
If you're ready to go deeper, our full Healing Hearts program takes these
foundations and builds something extraordinary. No pressure -- just an
invitation when you're ready."

[Explore the Full Program] → https://healingheartscourse.com/programs
```

No "Coming tomorrow" preview on Day 7 (it's the last day).

- [ ] **Step 5: Verify all templates**

Run:
```bash
for i in 1 2 3 4 5 6 7; do
  node -e "import('./api/emails/spark-day-$i.js').then(m => { const e = m.dayEmail(); console.log('Day $i:', e.subject, '| HTML:', e.html.length, 'chars'); })"
done
```
Expected: All 7 print subject + HTML length.

- [ ] **Step 6: Commit**

```bash
git add api/emails/spark-day-4.js api/emails/spark-day-5.js api/emails/spark-day-6.js api/emails/spark-day-7.js
git commit -m "feat: add Day 4-7 Spark Challenge email templates with Day 7 upsell"
```

---

### Task 8: Vercel Cron Drip Function

**Files:**
- Create: `api/cron/spark-drip.js`
- Modify: `vercel.json`

- [ ] **Step 1: Create cron directory**

Run: `mkdir -p api/cron`

- [ ] **Step 2: Write spark-drip.js**

Create `api/cron/spark-drip.js`:

```javascript
/* global process */
// Vercel Cron Function: GET /api/cron/spark-drip
// Runs daily at 7 AM MT (13:00 UTC during MDT).
// Queries pending spark_signups and sends the next day's email.

import { Resend } from 'resend';
import { supabaseAdmin } from '../_lib/supabase-admin.js';

// Dynamic imports for day templates
const dayTemplates = {
  1: () => import('../emails/spark-day-1.js'),
  2: () => import('../emails/spark-day-2.js'),
  3: () => import('../emails/spark-day-3.js'),
  4: () => import('../emails/spark-day-4.js'),
  5: () => import('../emails/spark-day-5.js'),
  6: () => import('../emails/spark-day-6.js'),
  7: () => import('../emails/spark-day-7.js'),
};

export default async function handler(req, res) {
  // Auth: Vercel sends CRON_SECRET header for cron invocations
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!process.env.RESEND_API_KEY) {
    return res.status(500).json({ error: 'RESEND_API_KEY not configured' });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  // Query signups ready for their next email
  const { data: signups, error: queryError } = await supabaseAdmin
    .from('spark_signups')
    .select('*')
    .eq('completed', false)
    .eq('unsubscribed', false)
    .lt('current_day', 7)
    .lt('signed_up_at', new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString())
    .or(`last_email_sent_at.is.null,last_email_sent_at.lt.${new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString()}`)
    .order('signed_up_at', { ascending: true })
    .limit(50);

  if (queryError) {
    console.error('[spark-drip] Query failed:', queryError);
    return res.status(500).json({ error: 'Failed to query signups' });
  }

  if (!signups || signups.length === 0) {
    return res.status(200).json({ sent: 0, message: 'No pending emails' });
  }

  const results = { sent: 0, errors: [] };

  for (const signup of signups) {
    const nextDay = signup.current_day + 1;

    try {
      // Load the day's email template
      const templateModule = await dayTemplates[nextDay]();
      const { subject, html } = templateModule.dayEmail();

      // Send via Resend
      await resend.emails.send({
        from: 'Healing Hearts <hello@healingheartscourse.com>',
        to: signup.email,
        subject,
        html,
      });

      // Update progress
      await supabaseAdmin
        .from('spark_signups')
        .update({
          current_day: nextDay,
          last_email_sent_at: new Date().toISOString(),
          completed: nextDay === 7,
        })
        .eq('id', signup.id);

      results.sent++;
    } catch (err) {
      console.error(`[spark-drip] Failed for ${signup.email} (day ${nextDay}):`, err);
      results.errors.push({ email: signup.email, day: nextDay, error: err.message });
      // Continue to next signup — don't block the batch
    }
  }

  console.log(`[spark-drip] Sent: ${results.sent}, Errors: ${results.errors.length}`);
  return res.status(200).json(results);
}
```

- [ ] **Step 3: Add crons to vercel.json**

Add the `crons` key to the existing `vercel.json` (merge with existing config):

```json
"crons": [
  {
    "path": "/api/cron/spark-drip",
    "schedule": "0 13 * * *"
  }
]
```

The final `vercel.json` should have: `buildCommand`, `outputDirectory`, `framework`, `rewrites`, `headers`, AND `crons`.

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 5: Commit**

```bash
git add api/cron/spark-drip.js vercel.json
git commit -m "feat: add Vercel Cron drip function for daily Spark Challenge emails"
```

---

### Task 9: Proofread Content + Save to Vault

**Files:**
- Create (vault): `Projects/healing-hearts/content/formatted/spark-challenge-proofread.md`
- Create (vault): `Projects/healing-hearts/content/formatted/spark-challenge-review-flags.md`

**Context:** Run a proofread pass on all 7 video scripts and 7 handouts from Trisha's `.docx`. Rules from spec Section 7: fix encoding only, fix typos, remove stage directions, adapt video references, preserve Trisha's voice verbatim.

- [ ] **Step 1: Proofread all 7 days**

Read the extracted content (full `.docx` text). For each day:
- Fix `\x92` → `'`, `\x96` → `--`, smart quotes → straight quotes
- Fix typos (e.g., "or or unsaid" → "or unsaid" in Day 5)
- Remove `(Video with Trisha)`, `(Trisha waves goodbye)`, `(Trisha ends with a gentle, reassuring smile)`
- Replace "First watch the video." → "Read on below for today's challenge."
- Note: Day 3 handout has a duplicate section (lines 165-186 repeat 171-186). Remove the duplicate.

- [ ] **Step 2: Save proofread content to vault**

Save to `Projects/healing-hearts/content/formatted/spark-challenge-proofread.md` with YAML frontmatter:

```yaml
---
date: 2026-03-23
type: reference
project: healing-hearts
tags: [7-day-challenge, proofread, content, trisha]
status: proofread -- awaiting Trisha review
---
```

- [ ] **Step 3: Save review flags**

Save to `Projects/healing-hearts/content/formatted/spark-challenge-review-flags.md`:
- Flag any ambiguous phrasing
- Flag the Day 3 duplicate section removal
- Flag the Day 5 "or or" typo fix
- Flag any "watch the video" → "read on" adaptations
- Note that video embed placeholders were added

- [ ] **Step 4: Commit email templates (if any proofread changes affected them)**

Verify the email template content matches the proofread output. Update any templates if needed.

---

### Task 10: End-to-End Smoke Test

**Files:** None (testing only)

- [ ] **Step 1: Verify Supabase table**

In Supabase SQL Editor, run:
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'spark_signups'
ORDER BY ordinal_position;
```
Expected: 7 columns (id, email, signed_up_at, current_day, completed, unsubscribed, last_email_sent_at).

- [ ] **Step 2: Verify env vars**

Run: `vercel env ls`
Expected: See RESEND_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.

- [ ] **Step 3: Test signup flow on preview deploy**

Note: Vite dev server (`npm run dev`) does NOT serve the `api/` serverless functions. Use `vercel dev` for local testing, or deploy to a preview URL first (`vercel`), then test there.

Submit the signup form with a test email on the preview URL.
Check Vercel function logs (Dashboard → Deployments → Logs): should see Supabase insert + Resend send.
Check Supabase: `SELECT * FROM spark_signups;` — should see the test row with `current_day = 0`.
Check email: welcome email should arrive.

- [ ] **Step 4: Test cron locally (manual invoke)**

The cron can't be tested locally via Vercel's cron scheduler, but the function can be invoked directly. After signup, manually update the test row to simulate readiness:

```sql
UPDATE spark_signups SET signed_up_at = now() - interval '12 hours' WHERE email = 'test@example.com';
```

Then invoke the cron endpoint with curl (requires deploying first, or testing in preview).

- [ ] **Step 5: Deploy to preview**

Run: `vercel` (deploys to preview URL).
Test signup on preview URL. Verify welcome email arrives.

- [ ] **Step 6: Build passes**

Run: `npm run build`
Expected: Clean build, no errors.

- [ ] **Step 7: Deploy to production**

Run: `git push origin master` (triggers Vercel auto-deploy).
Or: `vercel --prod`.

Verify: https://healingheartscourse.com/spark-challenge loads with updated content.
