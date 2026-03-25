# Spark Challenge Page — Functional Audit

**Date:** 2026-03-23
**File:** `src/pages/SparkChallenge.jsx`
**Route:** `/spark-challenge` (wrapped in `Layout`, registered in `App.jsx` line 50)

---

## Summary

The page renders correctly and is fully wired into routing. The 7-day content is real (not placeholder). The GSAP animations, layout sections, and FAQ are functional. **The one broken piece is the email capture form** — `handleSubmit` calls `/api/spark-signup`, which does not exist anywhere in the codebase. The form silently eats the error with an empty `catch {}`. Users get no feedback and no lead is captured.

---

## 1. Page Structure

Five sections in sequence:

| Section | Component | Status |
|---|---|---|
| Hero — serif headline, teardrop image, CTA button | Raw JSX + `TeardropImage` | Works. Button uses `scrollToSignup()` → smooth scroll to `#signup`. |
| Daily Breakdown — 7-day grid | `DailyBreakdownGrid` (Scoria) | Works. Content is real (see below). |
| Testimonial | `TealQuoteBlock` (Scoria) | Works. Quote is populated. |
| Email Capture form | Raw form + `Input`/`Button` from `@scoria/ui` | **Broken** — API handler missing. |
| FAQ accordion | `FAQAccordion` (Scoria) | Works. 4 questions populated. |

---

## 2. Email Signup Form — What's Broken

### The handler call

```js
// SparkChallenge.jsx lines 149–163
const handleSubmit = async (e) => {
  e.preventDefault()
  const formData = new FormData(e.target)
  const email = formData.get('email')

  try {
    await fetch('/api/spark-signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
  } catch {
    // Handler not built yet   ← literally the comment in the source
  }
}
```

**Four problems:**

1. `/api/spark-signup` does not exist. There is no `api/spark-signup.js` file. The `api/` directory contains only `api/contact.js`.
2. The `catch {}` swallows the error silently. The user sees nothing — no success state, no error state. The form just sits there after submission.
3. The response is never checked. Even if the endpoint existed, the code doesn't branch on `res.ok` or show a success message.
4. The form also has `action="/api/spark-signup" method="POST"` as HTML attributes (line 320–322). Since `handleSubmit` calls `e.preventDefault()`, this native fallback never fires, but it's misleading markup.

### No email service is wired up

`package.json` has zero email-related dependencies: no `resend`, no `@sendgrid/mail`, no `mailchimp-api-v3`, no `convertkit` SDK. The only email reference in the codebase is a commented-out `Resend` stub inside `api/contact.js` (lines 42–49 of that file), which itself is also not fully wired — it logs to console but sends nothing.

---

## 3. All Buttons and Links — Status

| Element | Target | Status |
|---|---|---|
| "Start the Challenge" (hero CTA) | `scrollToSignup()` → `#signup` | Works. Smooth scrolls to the form. |
| "Begin the Challenge" (form submit button) | `handleSubmit` → `/api/spark-signup` | **Broken** — API missing, no feedback. |
| No other links or navigation elements on the page. | — | — |

No `<Link>` components, no `href` attributes pointing to external URLs. No broken internal routes.

---

## 4. 7-Day Content — Real or Placeholder?

**Real content, not placeholder.** All 7 days have substantive titles and descriptions:

| Day | Title | Description |
|---|---|---|
| 1 | The Pause | 5-second pause that transforms reactive arguments |
| 2 | Curiosity Over Criticism | Replace "you always..." with one powerful question |
| 3 | The 10-Minute Check-In | Daily ritual that rebuilds emotional safety |
| 4 | Naming Your Needs | Move from hints and resentment to clear, kind requests |
| 5 | Repair Attempts | What to do in the first 60 seconds after things go wrong |
| 6 | Appreciation Flooding | Science behind why gratitude rewires your relationship |
| 7 | Your Connection Blueprint | Build a personalized plan to keep the spark alive |

The hero image uses a `picsum.photos` placeholder (`seed/spark-hero-couple/800/600`) — this will need replacing with a real photo from Trisha once available.

---

## 5. `/api/spark-signup` Handler — Does it Exist?

**No.** Confirmed by:
- `api/` directory contains only `contact.js`
- No file matching `spark-signup` anywhere in the repo
- No Vercel serverless function, no edge function, no Supabase edge function
- `vercel.json` has the correct rewrite rule to pass `/api/*` through to serverless functions, so the infrastructure is set up — the file just doesn't exist yet

---

## 6. Vercel Configuration

`vercel.json`:
```json
{
  "rewrites": [
    { "source": "/((?!api/).*)", "destination": "/index.html" }
  ]
}
```

The negative lookahead correctly excludes `/api/` from the SPA rewrite, so any file placed at `api/spark-signup.js` will be automatically treated as a Vercel serverless function. **No config changes needed** — just create the file.

---

## 7. Email Service — What's Available / Configured

- **Resend** is the chosen service (confirmed by the stub in `api/contact.js` lines 42–49). Not installed, not configured.
- **No `RESEND_API_KEY`** in `.env` or `.env.example`. The `.env` file contains only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- **Supabase** is available and already integrated. There is no `spark_leads` or `email_list` table in the schema (migrations 001–006 checked). The schema has: `courses`, `modules`, `lessons`, `enrollments`, `user_progress`, `payments`, `coupons`, `coupon_usage`, `user_profiles`.
- **No ConvertKit, Mailchimp, or SendGrid** anywhere in the codebase.

---

## 8. What Needs to Be Built

To make this a functional lead capture page, three things are needed:

### A. Create `api/spark-signup.js` (Vercel serverless function)

Minimum viable version using Resend:

```js
// api/spark-signup.js
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body || {};

  if (!email || !EMAIL_REGEX.test(email.trim())) {
    return res.status(400).json({ error: 'A valid email address is required.' });
  }

  const sanitizedEmail = email.trim().toLowerCase();

  try {
    // Option A: Send Day 1 email immediately
    await resend.emails.send({
      from: 'Healing Hearts <hello@healingheartscourse.com>',
      to: sanitizedEmail,
      subject: 'Your Spark Challenge starts tomorrow',
      text: `Day 1 is coming tomorrow morning — watch your inbox for "The Pause".\n\nWe're glad you're here.\n— Trisha`,
    });

    // Option B (preferred): Add to audience/list for drip sequence
    // await resend.contacts.create({ email: sanitizedEmail, audienceId: process.env.RESEND_AUDIENCE_ID });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('[spark-signup] Error:', err);
    return res.status(500).json({ error: 'Failed to sign up. Please try again.' });
  }
}
```

Also add `resend` to `package.json` dependencies: `npm install resend`

Add to Vercel environment variables: `RESEND_API_KEY`

### B. Fix `handleSubmit` to show user feedback

The current handler swallows all outcomes. It needs:
- A loading state while the request is in flight
- A success state showing "Check your inbox!"
- An error state showing "Something went wrong, please try again"

```js
const [submitState, setSubmitState] = useState('idle') // idle | loading | success | error

const handleSubmit = async (e) => {
  e.preventDefault()
  setSubmitState('loading')
  const email = new FormData(e.target).get('email')

  try {
    const res = await fetch('/api/spark-signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    setSubmitState(res.ok ? 'success' : 'error')
  } catch {
    setSubmitState('error')
  }
}
```

Then conditionally render the form or a success/error message in JSX.

### C. Decide on lead storage strategy

Two options (not mutually exclusive):

**Option 1 — Supabase table (recommended, already have the client)**
Add a `spark_leads` table via migration:
```sql
CREATE TABLE spark_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE spark_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role only" ON spark_leads FOR ALL USING (false);
```
Then insert from the serverless function using the Supabase service role key. This gives a persistent lead list you can query.

**Option 2 — Resend Audiences**
Use `resend.contacts.create()` to add signups directly to a Resend Audience, which enables Resend's built-in drip broadcast feature. Simplest path to a 7-day email sequence.

**Recommended:** Do both — Supabase for your own record, Resend Audiences for the drip sequence automation.

---

## What Works Today (No Changes Needed)

- Page routing — `/spark-challenge` is registered and live
- All GSAP scroll animations
- Hero CTA scrolls to signup form
- 7-day content grid (real content)
- Testimonial quote
- FAQ accordion (4 answered questions)
- Page title and meta description set dynamically
- Overall visual design — Organic Flow, correct Scoria components
- `vercel.json` rewrite rule for `/api/` pass-through

## What Is Broken

- `handleSubmit` calls `/api/spark-signup` which does not exist → 404 on submit
- No user feedback on form submission (no loading, no success, no error state)
- No lead is captured anywhere
- `resend` package not installed
- No `RESEND_API_KEY` environment variable
- Hero image is a `picsum.photos` placeholder
