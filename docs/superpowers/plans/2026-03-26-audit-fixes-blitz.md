# Healing Hearts Audit Fixes Blitz — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resolve all 8 copy-audit findings and all code-review security findings from Session 73, organized into parallel agent batches for maximum throughput.

**Architecture:** Vercel serverless functions (no shared middleware — each endpoint is independent). React 19 + Vite frontend. Supabase PostgreSQL with RLS. Email via Resend using shared helpers from `api/_emails/spark-shared.js`.

**Tech Stack:** React 19, Vite 7, Vercel Serverless, Supabase (PostgreSQL + RLS), Resend email, GSAP animations

**Verification command:** `npm run build` (must pass before any commit — Vercel auto-deploys on push to master)

---

## File Map

### Files Created
- `api/unsubscribe.js` — CAN-SPAM unsubscribe endpoint
- `api/_lib/escape-html.js` — Shared HTML escaper for API handlers
- `api/_lib/rate-limit.js` — Email-based submission rate limiter
- `supabase/migrations/014_audit_fixes.sql` — Webinar column scoping + unsubscribe support

### Files Modified
- `src/pages/Apply.jsx` — Warm error messages + framework language in headings
- `src/pages/WebinarRegister.jsx` — Warm error messages + State 3 expansion + scoped select + name field
- `src/pages/ComingSoon.jsx` — Add testimonial + framework reference
- `api/contact.js` — XSS escaping on team notification
- `api/application.js` — Rate limiting + duplicate prevention
- `api/webinar-register.js` — Rate limiting + live webinar filter fix
- `api/spark-signup.js` — Rate limiting + from address standardization
- `api/cron/spark-drip.js` — Pagination (remove 50-row cap)
- `api/cron/webinar-cron.js` — Pagination + scoped selects + missed-job tolerance
- `api/_emails/spark-shared.js` — Add unsubscribe footer helper
- `api/_emails/application-received.js` — Fix /resources CTA
- `api/_emails/webinar-followup-2.js` — Deduplicate subject line
- `vercel.json` — Add unsubscribe route

---

## Agent A: Email & Copy Quality

### Task 1: Warm Error Messages on Apply Page

**Files:**
- Modify: `src/pages/Apply.jsx:103-119` (validateStep function)
- Modify: `src/pages/Apply.jsx:148-153` (catch block)

**Context:** The Apply page validation errors use cold system defaults ("Name is required.") while field placeholders are warm ("Be as open as you're comfortable being..."). A prospect sharing relationship struggles hits a jarring tone shift at their most vulnerable moment.

- [ ] **Step 1: Replace validation error messages with warm copy**

In `src/pages/Apply.jsx`, replace the `validateStep` function (lines 103-119):

```jsx
  const validateStep = () => {
    const errs = [];
    if (step === 1) {
      if (!data.name.trim()) errs.push("We'd love to know your name so we can greet you properly.");
      if (!data.email.trim()) errs.push("We need your email so we can follow up with you personally.");
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errs.push("That email doesn't look quite right. Could you double-check it?");
    }
    if (step === 2) {
      if (!data.relationship_status) errs.push('Let us know where your relationship is right now so we can understand your starting point.');
    }
    if (step === 3) {
      if (!data.biggest_challenge.trim()) errs.push("Share whatever feels safe. Even a sentence helps us understand what you're facing.");
    }
    setErrors(errs);
    return errs.length === 0;
  };
```

- [ ] **Step 2: Replace catch-block error messages**

In `src/pages/Apply.jsx`, replace the error strings in the submit function (lines 148 and 152):

Change line 148:
```jsx
        setErrors(result.details || ["We weren't able to submit your application. Please try once more, or reach out to us directly."]);
```

Change line 152:
```jsx
      setErrors(["We're having trouble connecting right now. Please try again in a moment, or email us at hello@healingheartscourse.com"]);
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: Build succeeds with no errors

- [ ] **Step 4: Commit**

```bash
git add src/pages/Apply.jsx
git commit -m "copy: warm error messages on Apply page

Replace cold system defaults with brand-voice validation messages.
Copy audit Finding 3."
```

---

### Task 2: Warm Error Messages on WebinarRegister Page

**Files:**
- Modify: `src/pages/WebinarRegister.jsx:218-220` (registration validation)
- Modify: `src/pages/WebinarRegister.jsx:240-244` (registration catch)
- Modify: `src/pages/WebinarRegister.jsx:275-278,289-290` (waitlist errors)
- Modify: `src/pages/WebinarRegister.jsx:294` (waitlist catch)

**Context:** Same issue as Apply — error messages break brand voice. The webinar page has two forms (registration + waitlist) that both need warm copy.

- [ ] **Step 1: Replace registration form error messages**

In `src/pages/WebinarRegister.jsx`, update the `handleSubmit` function:

Line 218-219, change:
```jsx
      setErrorMessage('Please enter a valid email address.');
```
to:
```jsx
      setErrorMessage("That email doesn't look quite right. Could you double-check it?");
```

Line 240, change:
```jsx
        setErrorMessage(result.error || 'Something went wrong. Please try again.');
```
to:
```jsx
        setErrorMessage(result.error || "We weren't able to register you. Please try once more.");
```

Line 244, change:
```jsx
      setErrorMessage('Unable to register. Please try again or email us at hello@healingheartscourse.com');
```
to:
```jsx
      setErrorMessage("We're having trouble connecting right now. Please try again, or email us at hello@healingheartscourse.com");
```

- [ ] **Step 2: Replace waitlist form error messages**

In `handleWaitlistSubmit`:

Line 253-254, change:
```jsx
      setErrorMessage('Please enter a valid email address.');
```
to:
```jsx
      setErrorMessage("That email doesn't look quite right. Could you double-check it?");
```

Line 276, change:
```jsx
          setErrorMessage(result.error || 'Something went wrong. Please try again.');
```
to:
```jsx
          setErrorMessage(result.error || "We weren't able to add you to the waitlist. Please try once more.");
```

Line 290, change:
```jsx
          setErrorMessage('Something went wrong. Please try again.');
```
to:
```jsx
          setErrorMessage("We weren't able to add you to the waitlist. Please try once more.");
```

Line 294, change:
```jsx
      setErrorMessage('Unable to submit. Please try again or email us at hello@healingheartscourse.com');
```
to:
```jsx
      setErrorMessage("We're having trouble connecting right now. Please try again, or email us at hello@healingheartscourse.com");
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: Build succeeds with no errors

- [ ] **Step 4: Commit**

```bash
git add src/pages/WebinarRegister.jsx
git commit -m "copy: warm error messages on Webinar registration page

Replace generic validation errors with brand-voice messages.
Copy audit Finding 3."
```

---

### Task 3: Fix /resources CTA in Application-Received Email

**Files:**
- Modify: `api/_emails/application-received.js:18`

**Context:** The application-received email links to `/resources`. The page exists (`src/pages/Resources.jsx`) but all its content links route to `/coming-soon` — it's a placeholder. The CTA should point to the Spark Challenge instead, which is a real, functional free resource.

- [ ] **Step 1: Update the CTA**

In `api/_emails/application-received.js`, replace line 18:

```javascript
    ctaButton('Explore Free Resources', 'https://healingheartscourse.com/resources'),
```
with:
```javascript
    ctaButton('Try the 7-Day Spark Challenge', 'https://healingheartscourse.com/spark-challenge'),
```

Also update line 16 to match:
```javascript
      `In the meantime, if you have not already, we invite you to try our free 7-Day Spark Challenge -- a week of simple, real tools you can use with your partner tonight.`
```

- [ ] **Step 2: Verify no syntax errors**

Run: `node -e "import('./api/_emails/application-received.js')" --input-type=module`
Expected: No errors (or "Cannot find module" for spark-shared, which is expected in isolation)

- [ ] **Step 3: Commit**

```bash
git add api/_emails/application-received.js
git commit -m "fix: point application-received CTA to Spark Challenge

/resources page is placeholder content. Spark Challenge is a real,
functional free resource. Copy audit Finding 7."
```

---

### Task 4: Deduplicate Subject Line

**Files:**
- Modify: `api/_emails/webinar-followup-2.js:10`

**Context:** Bridge Day 13 and Webinar Follow-Up 2 both use "What happened after they said yes." Engaged prospects on both lists see the duplicate. Change the follow-up version since bridge emails are the established sequence.

- [ ] **Step 1: Change the subject line**

In `api/_emails/webinar-followup-2.js`, line 10, change:

```javascript
  const subject = 'What happened after they said yes';
```
to:
```javascript
  const subject = 'The moment everything shifted for them';
```

- [ ] **Step 2: Commit**

```bash
git add api/_emails/webinar-followup-2.js
git commit -m "fix: deduplicate subject line between bridge Day 13 and webinar follow-up 2

Bridge Day 13 keeps 'What happened after they said yes'.
Webinar Follow-Up 2 now uses 'The moment everything shifted for them'.
Copy audit Finding 8."
```

---

### Task 5: Add CAN-SPAM Unsubscribe Links

**Files:**
- Create: `api/unsubscribe.js`
- Modify: `api/_emails/spark-shared.js` (add unsubscribe footer helper)
- Modify: `vercel.json` (add route)

**Context:** Marketing emails (Spark drip, webinar follow-up) lack CAN-SPAM compliant unsubscribe links. The `unsubscribed` column already exists on `spark_signups` and `webinar_registrations`.

- [ ] **Step 1: Create the unsubscribe API endpoint**

Create `api/unsubscribe.js`:

```javascript
/* global process */
// Vercel Serverless Function: GET /api/unsubscribe
// One-click unsubscribe handler for CAN-SPAM compliance.

import { supabaseAdmin } from './_lib/supabase-admin.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const email = (req.query.email || '').trim().toLowerCase();
  const list = req.query.list || '';

  if (!email) {
    return res.status(400).send(unsubscribePage('Missing email address.', false));
  }

  try {
    const tables = [];
    if (list === 'spark' || !list) tables.push('spark_signups');
    if (list === 'webinar' || !list) tables.push('webinar_registrations');

    for (const table of tables) {
      await supabaseAdmin
        .from(table)
        .update({ unsubscribed: true })
        .eq('email', email);
    }

    console.log(`[unsubscribe] ${email} unsubscribed from: ${tables.join(', ')}`);
    return res.status(200).send(unsubscribePage('You have been unsubscribed.', true));
  } catch (err) {
    console.error('[unsubscribe] Error:', err);
    return res.status(500).send(unsubscribePage('Something went wrong. Please email hello@healingheartscourse.com to unsubscribe.', false));
  }
}

function unsubscribePage(message, success) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Unsubscribe - Healing Hearts</title>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background: #faf9f6; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
    .card { background: #fff; border-radius: 16px; padding: 48px 40px; max-width: 480px; text-align: center; box-shadow: 0 4px 24px rgba(17,145,177,0.06); }
    h1 { color: #2D2D2D; font-size: 24px; margin: 0 0 16px; }
    p { color: #555; font-size: 16px; line-height: 1.7; margin: 0 0 24px; }
    a { color: #1191B1; text-decoration: none; }
    .bar { height: 3px; background: linear-gradient(90deg, #1191B1, #B96A5F, #1191B1); border-radius: 2px; margin-bottom: 28px; }
    .icon { font-size: 48px; margin-bottom: 16px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="bar"></div>
    <div class="icon">${success ? '&#10003;' : '&#9888;'}</div>
    <h1>${success ? 'Unsubscribed' : 'Oops'}</h1>
    <p>${message}</p>
    ${success ? '<p>We respect your choice. If you ever want to reconnect, we will be here.</p>' : ''}
    <a href="https://healingheartscourse.com">Return to Healing Hearts</a>
  </div>
</body>
</html>`;
}
```

- [ ] **Step 2: Add unsubscribe footer helper to spark-shared.js**

In `api/_emails/spark-shared.js`, add this function before the closing of the file (after the `dayBadge` export):

```javascript
export function unsubscribeFooter(email, list) {
  const url = `https://healingheartscourse.com/api/unsubscribe?email=${encodeURIComponent(email)}&list=${list}`;
  return `<div style="text-align:center; margin-top:32px; padding-top:16px; border-top:1px solid #e5e5e5;">
  <p style="margin:0; font-size:12px; color:#d4d4d4;">
    <a href="${url}" style="color:#a3a3a3; text-decoration:underline;">Unsubscribe</a> &middot;
    Healing Hearts &middot; healingheartscourse.com
  </p>
</div>`;
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: Build succeeds (spark-shared changes don't affect frontend build, but verify no import issues)

- [ ] **Step 4: Commit**

```bash
git add api/unsubscribe.js api/_emails/spark-shared.js
git commit -m "feat: add CAN-SPAM unsubscribe endpoint and email footer helper

GET /api/unsubscribe?email=X&list=spark|webinar sets unsubscribed=true.
Renders a branded confirmation page. Footer helper for email templates.
Code review: CAN-SPAM compliance."
```

**Note to agent:** Wiring the `unsubscribeFooter()` into every email template is a follow-up task. The helper and endpoint are the infrastructure. Drip and follow-up templates should call `unsubscribeFooter(signup.email, 'spark')` or `unsubscribeFooter(reg.email, 'webinar')` in their return HTML. This can be done in a single pass across templates after this task.

---

### Task 6: Standardize From Addresses

**Files:**
- Modify: `api/contact.js:51`
- Modify: `api/spark-signup.js:52`

**Context:** Most emails use `hello@healingheartscourse.com`. Two team notifications use `noreply@...` (contact.js line 51, spark-signup.js line 52). Team notifications should also use `hello@` for consistent reply-ability. The display name on `application.js` line 94 uses "Healing Hearts Applications" which is fine for internal routing.

- [ ] **Step 1: Fix contact.js team notification from address**

In `api/contact.js`, line 51, change:
```javascript
        from: 'Healing Hearts <noreply@healingheartscourse.com>',
```
to:
```javascript
        from: 'Healing Hearts <hello@healingheartscourse.com>',
```

- [ ] **Step 2: Fix spark-signup.js team notification from address**

In `api/spark-signup.js`, line 52, change:
```javascript
        from: 'Healing Hearts <noreply@healingheartscourse.com>',
```
to:
```javascript
        from: 'Healing Hearts <hello@healingheartscourse.com>',
```

- [ ] **Step 3: Commit**

```bash
git add api/contact.js api/spark-signup.js
git commit -m "fix: standardize from addresses to hello@ across all emails

Team notifications were using noreply@, now consistent with all other
emails. Code review: from address standardization."
```

---

## Agent B: Security & Data Integrity

### Task 7: Fix Contact Form XSS in Team Notification

**Files:**
- Create: `api/_lib/escape-html.js`
- Modify: `api/contact.js:81-139` (teamNotificationEmail function)

**Context:** The `teamNotificationEmail()` function in `contact.js` interpolates `${name}`, `${email}`, `${phone}`, `${interest}`, and `${message}` directly into HTML template literals without escaping. A malicious name like `<img src=x onerror=alert(1)>` would execute in the team's email client. The `escapeHtml()` function exists in `spark-shared.js` but `contact.js` doesn't use it. We'll create a shared lib version so API handlers can use it without importing email template helpers.

- [ ] **Step 1: Create shared escape-html utility**

Create `api/_lib/escape-html.js`:

```javascript
/**
 * Escape HTML special characters to prevent XSS in email templates.
 * Shared across API handlers that render user input in HTML.
 */
export function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
```

- [ ] **Step 2: Import and apply escaping in contact.js**

In `api/contact.js`, add the import at the top (after the Resend import):

```javascript
import { escapeHtml } from './_lib/escape-html.js';
```

Replace the `teamNotificationEmail` function signature (line 81) to escape all user inputs:

```javascript
function teamNotificationEmail({ name, email, phone, interest, message, receivedAt }) {
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safePhone = escapeHtml(phone);
  const safeInterest = escapeHtml(interest);
  const safeMessage = escapeHtml(message);
```

Then replace all template interpolations in that function:
- `${name}` -> `${safeName}` (lines 106, 54)
- `${email}` -> `${safeEmail}` (lines 110 x2)
- `${phone || 'Not provided'}` -> `${safePhone || 'Not provided'}` (line 114)
- `${interest || 'Not specified'}` -> `${safeInterest || 'Not specified'}` (line 118)
- `${message}` -> `${safeMessage}` (line 125)

Also escape the subject line on line 54:
```javascript
        subject: `New Contact: ${escapeHtml(sanitized.name)} — ${escapeHtml(sanitized.interest) || 'General'}`,
```

Wait — the subject is plain text, not HTML. Resend handles subject encoding. Leave the subject as-is, but do escape the `confirmationEmail` function's `firstName` (line 143):

```javascript
function confirmationEmail(name) {
  const firstName = escapeHtml(name.split(' ')[0]) || 'there';
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add api/_lib/escape-html.js api/contact.js
git commit -m "fix: escape HTML in contact form team notification email

User-provided name, email, phone, interest, and message were interpolated
directly into HTML template. Now escaped via shared escape-html utility.
Code review: XSS vulnerability."
```

---

### Task 8: Scope Webinar SELECT Queries

**Files:**
- Modify: `src/pages/WebinarRegister.jsx:144-159` (client-side select)
- Modify: `api/cron/webinar-cron.js:59,125,188` (server-side selects)

**Context:** Client-side code uses `.select('*')` on the `webinars` table via the anon key, which returns ALL columns including `riverside_audience_url` (the private host URL for Riverside.fm). The cron job also uses `SELECT *` on server side (less critical since it uses service role, but still wasteful). Scope both to only the columns they need.

- [ ] **Step 1: Scope client-side webinar queries**

In `src/pages/WebinarRegister.jsx`, replace lines 144-159:

```jsx
        const [upcomingRes, replayRes] = await Promise.all([
          supabase
            .from('webinars')
            .select('id, title, starts_at, duration_minutes, status')
            .in('status', ['scheduled', 'live'])
            .order('starts_at', { ascending: true })
            .limit(1)
            .single(),
          supabase
            .from('webinars')
            .select('id, title, starts_at, duration_minutes, status, replay_url')
            .in('status', ['completed', 'evergreen'])
            .not('replay_url', 'is', null)
            .order('starts_at', { ascending: false })
            .limit(1)
            .single(),
        ]);
```

- [ ] **Step 2: Scope cron webinar queries**

In `api/cron/webinar-cron.js`:

Line 59, change `.select('*')` to:
```javascript
      .select('id, title, starts_at, duration_minutes, status')
```

Line 125, change `.select('*')` to:
```javascript
      .select('id, title, starts_at, duration_minutes, status')
```

Line 188, change `.select('*')` to:
```javascript
      .select('id, title, starts_at, duration_minutes, status')
```

- [ ] **Step 3: Scope cron registrant queries**

In `api/cron/webinar-cron.js`, the registrant queries also use `.select('*')`. Scope them:

Lines 69-70 (day-before reminders), change `.select('*')` to:
```javascript
          .select('id, email, name, reminder_day_before_sent, unsubscribed')
```

Lines 135-136 (day-of reminders), change `.select('*')` to:
```javascript
          .select('id, email, name, reminder_day_of_sent, unsubscribed')
```

Lines 204-205 (follow-ups), change `.select('*')` to:
```javascript
          .select('id, email, name, followup_day, followup_completed, unsubscribed, last_email_sent_at')
```

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 5: Commit**

```bash
git add src/pages/WebinarRegister.jsx api/cron/webinar-cron.js
git commit -m "fix: scope webinar SELECT queries to prevent data leaks

Client-side was using SELECT * which exposed riverside_audience_url
via anon key. Scoped to needed columns on both client and server.
Code review: data leak prevention."
```

---

### Task 9: Add Email-Based Rate Limiting

**Files:**
- Create: `api/_lib/rate-limit.js`
- Modify: `api/application.js`
- Modify: `api/contact.js`
- Modify: `api/spark-signup.js`
- Modify: `api/webinar-register.js`

**Context:** No rate limiting exists on any endpoint. Vercel serverless has no persistent memory, so IP-based rate limiting needs external state. For now, use email-based submission frequency checks via Supabase — this prevents form spam (the main attack vector) without adding infrastructure dependencies. IP-based rate limiting via Upstash Redis is a potential future upgrade.

- [ ] **Step 1: Create rate limit utility**

Create `api/_lib/rate-limit.js`:

```javascript
import { supabaseAdmin } from './supabase-admin.js';

/**
 * Check if an email has submitted to a table too recently.
 * Returns { allowed: true } or { allowed: false, retryAfterMinutes }.
 *
 * @param {string} table - Supabase table name
 * @param {string} email - Email to check
 * @param {number} windowMinutes - Minimum minutes between submissions (default: 5)
 */
export async function checkEmailRateLimit(table, email, windowMinutes = 5) {
  try {
    const cutoff = new Date(Date.now() - windowMinutes * 60 * 1000).toISOString();

    const { data, error } = await supabaseAdmin
      .from(table)
      .select('created_at')
      .eq('email', email)
      .gte('created_at', cutoff)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      // No recent submission or query error — allow
      return { allowed: true };
    }

    const lastSubmission = new Date(data.created_at);
    const minutesSince = (Date.now() - lastSubmission.getTime()) / 60000;
    const retryAfterMinutes = Math.ceil(windowMinutes - minutesSince);

    return { allowed: false, retryAfterMinutes };
  } catch {
    // On any error, allow the request (fail open)
    return { allowed: true };
  }
}
```

- [ ] **Step 2: Add rate limiting to application.js**

In `api/application.js`, add the import at the top:

```javascript
import { checkEmailRateLimit } from './_lib/rate-limit.js';
```

After validation passes and before the Supabase insert, add:

```javascript
    // Rate limit: 1 application per email per 10 minutes
    const rateCheck = await checkEmailRateLimit('applications', cleanEmail, 10);
    if (!rateCheck.allowed) {
      return res.status(429).json({
        error: 'You have already submitted an application recently. Please wait a few minutes before trying again.',
      });
    }
```

(Place this after the `cleanEmail` variable is defined but before the spark_signups lookup.)

- [ ] **Step 3: Add rate limiting to contact.js**

In `api/contact.js`, add the import at the top:

```javascript
import { checkEmailRateLimit } from './_lib/rate-limit.js';
```

This endpoint doesn't write to a database table, so we can't check a table. Instead, add a simple in-request check. Actually, since there's no `contacts` table, skip rate limiting here — the contact form only sends emails and doesn't store data. The XSS fix (Task 7) is sufficient protection.

**Remove this step — contact.js has no DB table to check against. Skip.**

- [ ] **Step 4: Add rate limiting to spark-signup.js**

In `api/spark-signup.js`, add the import:

```javascript
import { checkEmailRateLimit } from './_lib/rate-limit.js';
```

After email validation, before the upsert, add:

```javascript
    // Rate limit: 1 signup per email per 5 minutes
    const rateCheck = await checkEmailRateLimit('spark_signups', cleanEmail, 5);
    if (!rateCheck.allowed) {
      // Silently succeed — don't reveal rate limiting to avoid enumeration
      return res.status(200).json({ success: true, message: "You're in!" });
    }
```

(This uses a silent success to prevent email enumeration attacks.)

- [ ] **Step 5: Add rate limiting to webinar-register.js**

In `api/webinar-register.js`, add the import:

```javascript
import { checkEmailRateLimit } from './_lib/rate-limit.js';
```

After email validation, before the webinar lookup, add:

```javascript
    // Rate limit: 1 registration per email per 5 minutes
    const rateCheck = await checkEmailRateLimit('webinar_registrations', cleanEmail, 5);
    if (!rateCheck.allowed) {
      return res.status(200).json({ success: true, message: "You're registered!" });
    }
```

- [ ] **Step 6: Verify build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 7: Commit**

```bash
git add api/_lib/rate-limit.js api/application.js api/spark-signup.js api/webinar-register.js
git commit -m "feat: add email-based rate limiting to form endpoints

Checks Supabase for recent submissions by same email. Application: 10 min
window. Spark/Webinar: 5 min window with silent success to prevent
enumeration. Code review: rate limiting."
```

---

### Task 10: Add Supabase Admin Error Logging

**Files:**
- Modify: `api/_lib/supabase-admin.js`

**Context:** The admin client silently creates with empty strings if env vars are missing. The console.error fires once at import time, but subsequent queries fail silently. Improve by throwing on missing config in production.

- [ ] **Step 1: Improve supabase-admin.js error handling**

Replace the contents of `api/_lib/supabase-admin.js`:

```javascript
/* global process */
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  const missing = [!url && 'SUPABASE_URL', !key && 'SUPABASE_SERVICE_ROLE_KEY'].filter(Boolean).join(', ');
  console.error(`[supabase-admin] FATAL: Missing environment variables: ${missing}`);

  if (process.env.VERCEL_ENV === 'production') {
    throw new Error(`[supabase-admin] Cannot start in production without: ${missing}`);
  }
}

export const supabaseAdmin = createClient(url || '', key || '');
```

- [ ] **Step 2: Commit**

```bash
git add api/_lib/supabase-admin.js
git commit -m "fix: throw on missing Supabase env vars in production

Silent failures in production are dangerous. Now throws if
SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing in prod.
Code review: supabase-admin error handling."
```

---

### Task 11: Duplicate Application Prevention

**Files:**
- Modify: `api/application.js`

**Context:** The application endpoint does a plain INSERT. If the same person submits twice (double-click, browser back), two rows are created and two notification emails fire. Add an email-based dedup check.

- [ ] **Step 1: Add duplicate check before insert**

In `api/application.js`, after the rate limit check (added in Task 9), add:

```javascript
    // Duplicate check: if an application from this email exists in last 24 hours, return success silently
    const { data: existing } = await supabaseAdmin
      .from('applications')
      .select('id')
      .eq('email', cleanEmail)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .limit(1)
      .single();

    if (existing) {
      return res.status(200).json({ success: true, message: 'Application received!' });
    }
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add api/application.js
git commit -m "fix: prevent duplicate applications within 24-hour window

Silently returns success if same email submitted in last 24 hours.
Prevents double-click and back-button duplicates.
Code review: duplicate application prevention."
```

---

## Agent C: Cron & Query Fixes

### Task 12: Fix Live Webinar Registration Filter

**Files:**
- Modify: `api/webinar-register.js:34-41`

**Context:** The query uses `.gte('starts_at', new Date().toISOString())` which excludes webinars that have already started (status='live' but starts_at is in the past). A webinar that started 30 minutes ago and is currently live cannot receive new registrations. Fix by separating the scheduled and live queries.

- [ ] **Step 1: Fix the webinar lookup query**

In `api/webinar-register.js`, replace lines 34-41:

```javascript
    // Find next webinar: scheduled (future) OR currently live
    const { data: webinar, error: webinarError } = await supabaseAdmin
      .from('webinars')
      .select('id, title, starts_at, duration_minutes')
      .in('status', ['scheduled', 'live'])
      .or(`status.eq.live,starts_at.gte.${new Date().toISOString()}`)
      .order('starts_at', { ascending: true })
      .limit(1)
      .single();
```

This uses `.or()` to match either `status=live` (regardless of starts_at) or `starts_at >= now` (for scheduled webinars).

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add api/webinar-register.js
git commit -m "fix: allow registration for currently-live webinars

The .gte(starts_at, now) filter excluded webinars that had already
started. Now uses .or() to include live webinars regardless of start time.
Code review: .gte filter fix."
```

---

### Task 13: Add Cron Pagination (Remove 50-Row Cap)

**Files:**
- Modify: `api/cron/spark-drip.js:40-49`
- Modify: `api/cron/webinar-cron.js:68-75,134-141,203-212`

**Context:** Both cron jobs use `.limit(50)`. If there are 60 subscribers ready, 10 get skipped until the next day's run — they may never catch up if volume stays high. Replace with a pagination loop.

- [ ] **Step 1: Add pagination to spark-drip.js**

Replace the query + loop section of `api/cron/spark-drip.js` (lines 39-94) with:

```javascript
  const BATCH_SIZE = 50;
  const results = { sent: 0, errors: [] };
  let hasMore = true;
  let lastId = null;

  while (hasMore) {
    let query = supabaseAdmin
      .from('spark_signups')
      .select('*')
      .eq('completed', false)
      .eq('unsubscribed', false)
      .lt('current_day', 14)
      .lt('signed_up_at', new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString())
      .or(`last_email_sent_at.is.null,last_email_sent_at.lt.${new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString()}`)
      .order('id', { ascending: true })
      .limit(BATCH_SIZE);

    if (lastId) {
      query = query.gt('id', lastId);
    }

    const { data: signups, error: queryError } = await query;

    if (queryError) {
      console.error('[spark-drip] Query failed:', queryError);
      return res.status(500).json({ error: 'Failed to query signups' });
    }

    if (!signups || signups.length === 0) {
      hasMore = false;
      break;
    }

    lastId = signups[signups.length - 1].id;
    hasMore = signups.length === BATCH_SIZE;

    for (const signup of signups) {
      const nextDay = signup.current_day + 1;

      try {
        const templateModule = await dayTemplates[nextDay]();
        const { subject, html } = templateModule.dayEmail();

        await resend.emails.send({
          from: 'Healing Hearts <hello@healingheartscourse.com>',
          to: signup.email,
          subject,
          html,
        });

        await supabaseAdmin
          .from('spark_signups')
          .update({
            current_day: nextDay,
            last_email_sent_at: new Date().toISOString(),
            completed: nextDay === 14,
          })
          .eq('id', signup.id);

        results.sent++;
      } catch (err) {
        console.error(`[spark-drip] Failed for ${signup.email} (day ${nextDay}):`, err);
        results.errors.push({ email: signup.email, day: nextDay, error: err.message });
      }
    }
  }

  console.log(`[spark-drip] Sent: ${results.sent}, Errors: ${results.errors.length}`);
  return res.status(200).json(results);
```

Remove the old `if (!signups || signups.length === 0)` early return that was between the query and loop.

- [ ] **Step 2: Add pagination to webinar-cron.js registrant queries**

For each of the three jobs in `api/cron/webinar-cron.js`, wrap the registrant query + send loop in a pagination loop. The pattern is the same for all three.

For Job 1 (day-before reminders), replace lines 68-111 with:

```javascript
        let hasMoreRegs = true;
        let lastRegId = null;

        while (hasMoreRegs) {
          let regQuery = supabaseAdmin
            .from('webinar_registrations')
            .select('id, email, name, reminder_day_before_sent, unsubscribed')
            .eq('webinar_id', webinar.id)
            .eq('reminder_day_before_sent', false)
            .eq('unsubscribed', false)
            .order('id', { ascending: true })
            .limit(50);

          if (lastRegId) regQuery = regQuery.gt('id', lastRegId);

          const { data: registrants, error: regErr } = await regQuery;

          if (regErr) {
            console.error(`[webinar-cron] Day-before registrant query failed for webinar ${webinar.id}:`, regErr);
            break;
          }

          if (!registrants || registrants.length === 0) {
            hasMoreRegs = false;
            break;
          }

          lastRegId = registrants[registrants.length - 1].id;
          hasMoreRegs = registrants.length === 50;

          const templateModule = await reminderTemplates.day_before();

          for (const reg of registrants) {
            try {
              const { subject, html } = templateModule.reminderEmail(reg.name, webinar);
              await resend.emails.send({
                from: 'Healing Hearts <hello@healingheartscourse.com>',
                to: reg.email,
                subject,
                html,
              });
              await supabaseAdmin
                .from('webinar_registrations')
                .update({ reminder_day_before_sent: true, last_email_sent_at: new Date().toISOString() })
                .eq('id', reg.id);
              results.dayBeforeReminders.sent++;
            } catch (err) {
              console.error(`[webinar-cron] Day-before failed for ${reg.email}:`, err);
              results.dayBeforeReminders.errors.push({ email: reg.email, error: err.message });
            }
          }
        }
```

Apply the same pagination pattern to Job 2 (day-of reminders) and Job 3 (follow-ups). The only differences are:
- Job 2: column is `reminder_day_of_sent`, template is `reminderTemplates.day_of()`
- Job 3: select columns include `followup_day, followup_completed, last_email_sent_at`, uses `followupTemplates[step.template]()`

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add api/cron/spark-drip.js api/cron/webinar-cron.js
git commit -m "fix: add pagination to cron jobs (remove 50-row cap)

Both cron jobs used .limit(50) which silently dropped overflow rows.
Now paginate using cursor-based id ordering until all rows processed.
Code review: cron pagination."
```

---

### Task 14: Handle Missed Cron Runs Gracefully

**Files:**
- Modify: `api/cron/webinar-cron.js:200-201`

**Context:** The follow-up schedule uses exact day matching: `FOLLOWUP_SCHEDULE.find(s => s.afterDays === daysSinceWebinar)`. If a cron run is missed (Vercel outage), the step for that day is skipped permanently. For example, if the cron misses day 1, the day-1 follow-up (template 2) is never sent because day 2 has no matching schedule entry.

Fix: Instead of exact match, find the latest applicable step that the registrant hasn't received yet.

- [ ] **Step 1: Replace exact-match with range-based step finding**

In `api/cron/webinar-cron.js`, replace lines 199-201:

```javascript
        // Find the latest applicable follow-up step (handles missed cron runs)
        const applicableSteps = FOLLOWUP_SCHEDULE.filter((s) => s.afterDays <= daysSinceWebinar);
        if (applicableSteps.length === 0) continue;
```

Then update the registrant query (lines 203-212) to find registrants whose `followup_day` is less than the latest applicable step's `atDay + 1`:

```javascript
        // For each applicable step, find registrants at that step
        for (const step of applicableSteps) {
          // (pagination loop wraps around the existing registrant query + send logic)
```

Actually, the simpler and safer fix is to change the step finder to use `<=` and pick the LAST match:

Replace lines 199-201 with:

```javascript
        // Find the latest follow-up step that should have been sent by now
        // (handles missed cron runs — if day 1 was missed, day 3 run catches day-1 registrants)
        const applicableSteps = FOLLOWUP_SCHEDULE.filter((s) => s.afterDays <= daysSinceWebinar);
        if (applicableSteps.length === 0) continue;

        // Process each applicable step — registrants still at that step get their email
        for (const step of applicableSteps) {
```

Then the existing registrant query (`.eq('followup_day', step.atDay)`) already correctly targets registrants who are "stuck" at a given step. Wrap the existing registrant-query-and-send block inside this `for (const step of applicableSteps)` loop.

The key change: instead of finding ONE step for today and processing it, we iterate ALL steps up to today. Registrants stuck at step 0 (missed day-0 send) will get caught when we check `step.atDay === 0` even if today is day 3.

Close the for-loop after the send block.

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add api/cron/webinar-cron.js
git commit -m "fix: handle missed cron runs in webinar follow-up sequence

Changed from exact-day matching to range-based step finding.
If a cron run is missed, the next run catches up all pending steps.
Code review: cron missed-job handling."
```

---

## Content Upgrades (Sequential — Chase reviews copy)

### Task 15: Apply Page Framework Language (Copy Audit Finding 2)

**Files:**
- Modify: `src/pages/Apply.jsx` (step headings and placeholders at Steps 2, 3, 4)

**Context:** Prospects arrive at the Apply page after reading bridge emails that teach SPARK Method, Zones of Resilience, Critter Brain, CEO Brain. The Apply page uses none of this vocabulary. The copy audit recommends inserting framework references at Steps 2-4 headings.

**Note:** Ideal flow is Trisha drafts copy, Chase implements. If proceeding without Trisha's draft, use the framework names as subtle anchors, not full explanations.

- [ ] **Step 1: Update Step 2 heading and context**

In `src/pages/Apply.jsx`, in the `renderRelationship` function, replace:

```jsx
        Tell us about your relationship.
```
with:
```jsx
        Where is your relationship right now?
```

And add a subtitle after the `<p>` with "Step 2 of 5":

```jsx
      <p className="step-reveal font-sans text-foreground/40 font-light text-sm mb-8">
        Think about your Zones of Resilience -- where do you and your partner spend most of your time together?
      </p>
```

- [ ] **Step 2: Update Step 3 heading and placeholder**

In `renderChallenge`, replace:

```jsx
        What are you facing?
```
with:
```jsx
        What keeps coming up between you?
```

Update the `biggest_challenge` textarea placeholder:

```jsx
            placeholder="Maybe it's the same argument on repeat, or a distance that crept in quietly..."
```

- [ ] **Step 3: Update Step 4 heading**

In `renderReadiness`, replace:

```jsx
        Where do you want to go?
```
with:
```jsx
        Imagine your relationship six months from now.
```

Update the `ideal_outcome` textarea placeholder:

```jsx
            placeholder="What would it feel like to truly be seen and heard by your partner?"
```

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 5: Commit**

```bash
git add src/pages/Apply.jsx
git commit -m "copy: add framework language to Apply page Steps 2-4

Inserts Zones of Resilience anchor at Step 2, warmer language at Steps 3-4.
Bridges narrative continuity from email sequence to application.
Copy audit Finding 2. Flag for Trisha review."
```

---

### Task 16: Expand Webinar State 3 + Add Name Field (Copy Audit Finding 4)

**Files:**
- Modify: `src/pages/WebinarRegister.jsx:637-739` (State 3 section)

**Context:** State 3 (no webinar at all) is the most common between-cohort state. It has thin copy ("Jeff and Trisha are preparing something special") and the waitlist form lacks a name field, preventing personalization in future outreach.

- [ ] **Step 1: Expand State 3 hero copy**

In `src/pages/WebinarRegister.jsx`, replace lines 648-650:

```jsx
          <p className="webinar-reveal font-sans text-foreground/70 text-xl font-light max-w-xl mx-auto mb-4">
            Jeff and Trisha are preparing something special. Be the first to know when our next live workshop is announced.
          </p>
```
with:
```jsx
          <p className="webinar-reveal font-sans text-foreground/70 text-xl font-light max-w-xl mx-auto mb-4">
            Jeff and Trisha host live workshops where couples learn the frameworks behind lasting change -- the same tools used in the Healing Hearts program. No fluff. Real, clinically-informed content you can use that night.
          </p>
          <p className="webinar-reveal font-sans text-foreground/50 text-base max-w-md mx-auto mb-4">
            Past workshops have covered the nervous system patterns that hijack conversations, the SPARK Method for reconnection, and the difference between Critter Brain reactions and CEO Brain responses.
          </p>
```

- [ ] **Step 2: Add name field to State 3 waitlist form**

In the State 3 form (around line 700), add a name field before the email field:

```jsx
                <form onSubmit={handleWaitlistSubmit} className="space-y-5">
                  <div>
                    <label className="block font-outfit font-bold text-sm text-primary mb-2">
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      className={INPUT_CLASS}
                      placeholder="Your name"
                      disabled={formStatus === 'loading'}
                    />
                  </div>
                  <div>
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add src/pages/WebinarRegister.jsx
git commit -m "copy: expand Webinar State 3 with framework references + add name field

State 3 is the most common between-cohort state. Added workshop context
with framework names and a name field for personalized follow-up.
Copy audit Finding 4. Flag for Trisha review."
```

---

### Task 17: Upgrade Your Next Step Page (Copy Audit Finding 6)

**Files:**
- Modify: `src/pages/ComingSoon.jsx`

**Context:** The Your Next Step page is just routing buttons — no social proof, no framework language. It sits at a decision point in the funnel. Adding one testimonial and one framework reference would meaningfully increase engagement.

- [ ] **Step 1: Add a testimonial and framework reference**

In `src/pages/ComingSoon.jsx`, add imports at the top:

```jsx
import { ArrowRight, Sparkles, Heart, Quote } from 'lucide-react';
```

After the existing two `<p>` paragraphs (lines 62-69) and before the CTA buttons, add:

```jsx
        {/* Testimonial */}
        <div className="cs-reveal max-w-md mx-auto mb-10 bg-white/60 backdrop-blur rounded-2xl p-6 border border-primary/5">
          <Quote className="w-6 h-6 text-primary/20 mb-3" />
          <p className="font-drama italic text-lg text-foreground/70 leading-relaxed mb-3">
            "Learning about the Zones of Resilience changed everything. We finally had language for what was happening between us."
          </p>
          <p className="font-sans text-sm text-foreground/40">
            -- Healing Hearts participant
          </p>
        </div>

        <p className="cs-reveal text-sm text-foreground/40 max-w-sm mx-auto leading-relaxed mb-10">
          Our program uses frameworks like the SPARK Method and Zones of Resilience to help couples move from stuck to connected -- at their own pace.
        </p>
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/pages/ComingSoon.jsx
git commit -m "copy: add testimonial and framework reference to Your Next Step page

Adds social proof and SPARK/Zones language at the funnel decision point.
Copy audit Finding 6. Testimonial is placeholder -- replace with real
quote from Trisha when available."
```

---

## Out of Scope (Separate Efforts)

### Conference Landing Page (Copy Audit Finding 1)
This is a full Forge Lite build (`/scoria-build --explore "conference landing page for Be Healthy Utah"`). Requires:
- Trisha's copy input or a detailed brief
- Stitch design variants
- Full 5-stage pipeline
- QR code generation for printed materials

**Must be complete before April 10.** Do not bundle with this audit fix blitz — it's a standalone page build.

### Day 7 Close Protocol (Copy Audit Finding 5)
This is a process document, not code. Needs a working session between Makayla and Trisha to define:
- What format does Trisha's brief to Makayla take?
- When is it delivered relative to Day 7 send?
- What happens if the brief is late?

Chase writes the SOP doc after they align.

---

## Verification Checklist

After all tasks are complete:

- [ ] Run `npm run build` — must pass
- [ ] Run `npm run lint` — should pass with no new warnings
- [ ] Verify no `SELECT *` remains in `api/cron/webinar-cron.js`
- [ ] Verify no unescaped user input in `api/contact.js`
- [ ] Verify `api/unsubscribe.js` exists and is accessible
- [ ] Grep for `noreply@` — should only appear in legacy/non-team contexts
- [ ] Review all commits — should be 14 clean, focused commits
