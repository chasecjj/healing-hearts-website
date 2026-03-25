# 7-Day Spark Challenge — Launch Design Spec

**Date:** 2026-03-23
**Author:** Chase + Claude
**Status:** Approved (2026-03-23)
**Verified Sender:** `hello@healingheartscourse.com` (Resend domain verified)
**Decision:** Email-only delivery for v1 launch (expo 2026-04-10)

---

## 1. Overview

Ship the "Ignite Your Connection: Small Sparks, Big Shifts!" 7-day challenge as a
fully functional email-based lead magnet. A visitor signs up on `/spark-challenge`,
receives a welcome email immediately, then gets one challenge email per day for
7 consecutive days via a Vercel Cron job.

**What exists today:**
- `SparkChallenge.jsx` landing page (placeholder day content, needs update)
- `api/spark-signup.js` serverless function (welcome email + team notification via Resend)
- Resend v6.9.4 installed, `RESEND_API_KEY` set in Vercel env vars
- Trisha's full content: 7 video scripts + 7 handouts in vault `.docx`

**What's missing:**
- Supabase table to persist signups and track drip progress
- Daily drip emails (Days 1-7)
- Vercel Cron job to trigger daily sends
- Landing page content update (placeholder → real titles)
- Proofread pass on Trisha's raw content

---

## 2. Supabase: `spark_signups` Table

### Schema

```sql
CREATE TABLE spark_signups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  signed_up_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  current_day INTEGER DEFAULT 0 NOT NULL CHECK (current_day >= 0 AND current_day <= 7),
  completed BOOLEAN DEFAULT false NOT NULL,
  unsubscribed BOOLEAN DEFAULT false NOT NULL,
  last_email_sent_at TIMESTAMPTZ
);

-- Index for the daily cron query
CREATE INDEX idx_spark_signups_active
  ON spark_signups (current_day)
  WHERE completed = false AND unsubscribed = false;
```

### RLS Policy

Service-role only. No public access — this table is only touched by serverless functions.

```sql
ALTER TABLE spark_signups ENABLE ROW LEVEL SECURITY;
-- No public policies. Only service_role can read/write.
```

### Migration File

Save as `supabase/migrations/007_spark_signups.sql`.

### Signup flow

`api/spark-signup.js` gets updated to INSERT into this table BEFORE sending the
welcome email. If the INSERT fails, return an error (so the user can retry).
If the email send fails afterward, the user is still in the DB and will receive
drip emails -- this is the safer ordering. If the email already exists (duplicate
signup), return success without re-inserting (idempotent).

---

## 3. Landing Page Update (`SparkChallenge.jsx`)

Replace the placeholder `DAYS` array with Trisha's actual content:

```javascript
const DAYS = [
  {
    day: 1,
    title: "The 'I Noticed' Text",
    description:
      "Send your partner a text noticing something positive -- a quiet act, a kind word, a little thing that made you smile.",
  },
  {
    day: 2,
    title: 'The Specific Spark Compliment',
    description:
      "Move beyond 'you look nice' to a detailed, heartfelt compliment that names exactly what you noticed and how it made you feel.",
  },
  {
    day: 3,
    title: 'The 2-Minute Check-In',
    description:
      "Ask 'What was the best part of your day?' and just listen. No fixing, no advising -- just two minutes of loving presence.",
  },
  {
    day: 4,
    title: 'The Pause Experiment',
    description:
      "When tension rises, try a 10-second pause before responding. Let your thoughtful CEO Brain step in before your Critter Brain reacts.",
  },
  {
    day: 5,
    title: 'The Gratitude Text',
    description:
      "Send an unexpected mid-day text starting with 'I'm grateful you...' and watch a small spark of appreciation shift your whole day.",
  },
  {
    day: 6,
    title: 'The Memory Lane Moment',
    description:
      "Share a favorite memory from early in your relationship and tell your partner why that moment still matters to you today.",
  },
  {
    day: 7,
    title: 'The Spark Conversation',
    description:
      "Sit together and take turns asking: 'What's one small thing I could do this week to make you feel loved?' Then commit to doing it.",
  },
]
```

Descriptions are condensed from Trisha's scripts -- her words, not paraphrased,
just shortened for card format. Full teaching content lives in the emails.

Also update `FAQ_ITEMS` answer for "What happens after the 7 days?" to reference
the Spark Conversation outcome (personalized commitment) rather than "Connection
Blueprint" which was the placeholder concept.

---

## 4. Drip Email System

### 4a. Email Template Structure

All 7 emails follow the same HTML template structure as the existing welcome email
(`api/spark-signup.js` `welcomeEmail()` function):

- Cream background (`#faf9f6`)
- White card with rounded corners, subtle teal shadow
- Teal/salmon gradient accent bar at top
- Georgia serif italic headline
- Helvetica Neue body text
- Teal CTA button
- Warm sign-off from Trisha

Each day's email contains:

| Section | Content |
|---------|---------|
| Subject line | "Day N: [Title] -- Spark Challenge" |
| Greeting | "Hey there, beautiful hearts!" (varies per day) |
| Trisha's story | The personal Jeff + Trisha anecdote from the video script |
| Today's challenge | The core activity instructions from the handout |
| Reflection questions | 1-2 questions from the handout |
| Sign-off | Warm Trisha sign-off + preview of tomorrow |
| CTA button | "View the Full Handout" (links to /spark-challenge for now) |

**Day 7 special addition:** After the sign-off, include a soft upsell section:

> "You've completed the 7-Day Spark Challenge! These 7 tools are yours to keep.
> If you're ready to go deeper, our full Healing Hearts program takes these
> foundations and builds something extraordinary. No pressure -- just an
> invitation when you're ready."
>
> [Explore the Full Program] → /programs

### 4b. Content Source

Trisha's exact words from the `.docx` are used verbatim. The only changes allowed
in the proofread pass are:

- Fix encoding artifacts (smart quotes → straight quotes, em dashes → `--`)
- Fix typos and grammar errors
- Remove video stage directions ("(Video with Trisha)", "(Trisha waves goodbye)")
- Adapt "watch the video" references to "read below" since videos aren't recorded yet
- Add "[Video coming soon!]" placeholder where video would embed

Content is NOT paraphrased, NOT rewritten, NOT made more "professional."

### 4c. Email File Organization

```
api/
  spark-signup.js          (existing — update to INSERT into Supabase)
  cron/
    spark-drip.js          (new — daily cron handler)
  emails/
    spark-day-1.js         (new — Day 1 email template)
    spark-day-2.js         (new — Day 2 email template)
    spark-day-3.js         (new — Day 3 email template)
    spark-day-4.js         (new — Day 4 email template)
    spark-day-5.js         (new — Day 5 email template)
    spark-day-6.js         (new — Day 6 email template)
    spark-day-7.js         (new — Day 7 email template)
    spark-shared.js        (new — shared HTML wrapper, header, footer)
```

Each `spark-day-N.js` exports a function that returns `{ subject, html }`.
`spark-shared.js` exports the reusable email chrome (header, footer, CTA builder)
so day templates only define their unique content.

---

## 5. Vercel Cron (`api/cron/spark-drip.js`)

### Schedule

Runs daily at **7:00 AM Mountain Time** via `vercel.json` cron config.

**DST note:** April 10 (expo) is during MDT (UTC-6), so 7 AM MDT = 13:00 UTC.
During MST (winter, UTC-7), 7 AM MST = 14:00 UTC. Use `0 13 * * *` for the
April launch. Adjust to `0 14 * * *` after DST ends in November, or accept
the 1-hour seasonal drift.

Add the `crons` key to the **existing** `vercel.json` (merge, don't replace):

```json
{
  "crons": [
    {
      "path": "/api/cron/spark-drip",
      "schedule": "0 13 * * *"
    }
  ]
}
```

### Logic

```
0. Auth check:
   if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`)
     return 401 Unauthorized

1. Query Supabase: SELECT * FROM spark_signups
     WHERE completed = false
       AND unsubscribed = false
       AND current_day < 7
       AND signed_up_at < now() - interval '6 hours'
       AND (last_email_sent_at IS NULL
            OR last_email_sent_at < now() - interval '20 hours')
   ORDER BY signed_up_at ASC
   LIMIT 50

2. For each signup:
   a. next_day = current_day + 1
   b. Load email template for that day
   c. Send via Resend
   d. UPDATE spark_signups SET
        current_day = next_day,
        last_email_sent_at = now(),
        completed = (next_day = 7)
      WHERE id = signup.id

3. Return summary: { sent: N, errors: [...] }
```

### Safety

- **Auth:** The endpoint checks `req.headers.authorization` against
  `Bearer ${process.env.CRON_SECRET}`. Vercel auto-sends this for cron invocations.
  Requests without it get 401.
- **Double-send guard:** `last_email_sent_at < now() - interval '20 hours'` prevents
  re-sending if the cron fires twice (Vercel cron is at-least-once, not exactly-once).
- **Signup cooldown:** `signed_up_at < now() - interval '6 hours'` ensures users who
  sign up shortly before the cron window don't get welcome + Day 1 back-to-back.
- **Batch limit:** `LIMIT 50` prevents exceeding Vercel's function timeout. At
  ~200-300ms per Resend API call, 50 sends takes ~10-15 seconds, within the default
  timeout. If more than 50 are pending, remaining users get their email the next day.
  Scale note: if sustained signups exceed 50/day, increase the limit and set a longer
  function timeout (up to 60s on Pro plan), or run the cron more frequently.
- **Error isolation:** Errors on individual sends don't block the batch -- log and
  continue.

### Day 0 → Day 1 timing

A user who signs up at any time gets the welcome email immediately. The cron runs
at 7 AM MT the next morning. The 6-hour cooldown guard ensures anyone who signed
up within 6 hours of the cron window is skipped until the next day's run. This
guarantees a meaningful gap between the welcome email and Day 1.

---

## 6. Update `spark-signup.js`

### Supabase Client for Serverless

The existing `src/lib/supabase.js` uses `import.meta.env.VITE_SUPABASE_URL` (Vite
client-side). Serverless functions need `process.env` instead. Create a shared
admin client:

```
api/_lib/supabase-admin.js
```

```javascript
import { createClient } from '@supabase/supabase-js'

export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)
```

Both `spark-signup.js` and `cron/spark-drip.js` import from this shared module.
The `_lib` prefix is a Vercel convention -- files in `api/_lib/` are not exposed
as endpoints.

### Changes to spark-signup.js

1. Import `supabaseAdmin` from `./_lib/supabase-admin.js`
2. **BEFORE** sending the welcome email, INSERT into `spark_signups`:
   ```sql
   INSERT INTO spark_signups (email) VALUES ($1)
   ON CONFLICT (email) DO NOTHING
   ```
3. If the INSERT fails (network error, Supabase down), return a 500 error to the
   user so they know to retry. The welcome email is NOT sent if the DB insert fails.
4. If the INSERT succeeds (new row or duplicate), proceed to send welcome email.
   Email send failure is non-blocking (already the existing pattern).

### New env vars needed

- `SUPABASE_URL` — the Supabase project URL (same value as `VITE_SUPABASE_URL`,
  but without the VITE prefix for server-side use)
- `SUPABASE_SERVICE_ROLE_KEY` — set in Vercel env vars (get from Supabase dashboard
  → Settings → API → service_role key). This is NOT the anon key.

---

## 7. Proofread Pass

### Scope

All 7 video scripts and 7 handouts from Trisha's `.docx` file.

### Rules

- Fix encoding: `I\x92m` → `I'm`, `\x96` → `--`, smart quotes → straight quotes
- Fix typos and grammatical errors only
- Remove stage directions: `(Video with Trisha)`, `(Trisha waves goodbye)`, etc.
- Replace "watch the video" → "read on" or similar (videos not yet recorded)
- Add `[Video coming soon!]` note at top of each day's email
- Do NOT change Trisha's phrasing, word choice, sentence structure, or tone
- Do NOT add content, remove content, or restructure sections
- Flag anything ambiguous in a separate review notes file for Trisha

### Output

Proofread content saved to vault at:
`Projects/healing-hearts/content/formatted/spark-challenge-proofread.md`

Review flags saved to:
`Projects/healing-hearts/content/formatted/spark-challenge-review-flags.md`

---

## 8. Environment Variables Summary

| Variable | Where | Purpose |
|----------|-------|---------|
| `RESEND_API_KEY` | Vercel env | Already set. Resend API authentication. |
| `SUPABASE_URL` | Vercel env | NEW. Same value as VITE_SUPABASE_URL, for server-side use. |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel env | NEW. Server-side Supabase access for spark_signups table. |
| `CRON_SECRET` | Vercel env | Auto-managed by Vercel for cron endpoint auth. |
| `VITE_SUPABASE_URL` | Vercel env | Already set. Client-side Supabase project URL. |

---

## 9. What's NOT in Scope

| Item | Reason |
|------|--------|
| Web portal challenge pages (`/challenge/day-1`) | Deferred post-launch. Task created in vault. |
| Video embedding | Videos not yet recorded (Trisha). |
| Canva handout PDFs | Desirae's task. Email contains handout content inline. |
| Unsubscribe page | Resend handles this automatically via email footer. |
| Analytics dashboard | Nice-to-have. Can query `spark_signups` directly for now. |
| Supabase Auth integration | Signups are email-only, no account creation. |

---

## 10. Tradeoffs and Risks

### Tradeoffs

1. **Email-only vs web portal:** Faster to ship, but no engagement tracking beyond
   email opens (Resend provides this). We lose the ability to show progress, embed
   video, or create a rich interactive experience. Acceptable for launch; revisit
   after expo.

2. **Inline handout content vs PDF attachment:** Simpler (no file hosting needed),
   but less polished than a designed Canva PDF. When Desirae finishes the PDFs,
   we add download links to the emails.

3. **Service role key in serverless functions:** Required since the table has no
   public RLS. This is standard practice for Vercel serverless → Supabase, but
   the key must never be exposed client-side. All access is server-side only.

4. **Single cron job at fixed time:** All users get emails at 7 AM MT regardless
   of timezone. This is simpler than per-user timezone scheduling and acceptable
   for a US-focused launch. Could cause non-US users to receive emails at odd
   hours.

### Risks

1. **Resend free tier limit (100/day):** At ~10-12 sustained signups/day for a
   full week, daily sends hit the limit. Math: 12 signups/day x 7 days = 84 drip
   sends + 12 x 2 welcome/notification emails = 108 total. Mitigation: upgrade
   to Pro ($20/mo, 5,000/mo) if signups exceed ~10/day. Monitor via Resend dashboard.

2. **Vercel cron reliability:** Vercel crons are at-least-once, not exactly-once.
   The `last_email_sent_at` guard handles double-fires, but a missed cron would
   delay emails by 24 hours. No mitigation needed for launch — this is rare.

3. **No unsubscribe tracking in our DB:** Resend handles unsubscribes at the email
   level, but our `spark_signups.unsubscribed` flag won't auto-update. We'd need
   a Resend webhook to sync this. For launch, worst case is we attempt to send to
   an unsubscribed address and Resend silently drops it.

4. **Videos not ready at launch:** Emails reference video content that won't exist
   yet. Mitigation: adapt "watch the video" language and add "[Video coming soon]"
   placeholder. This is explicitly acknowledged in the content.
