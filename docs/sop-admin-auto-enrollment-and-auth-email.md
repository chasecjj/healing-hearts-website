# SOP: Admin Auto-Enrollment + Supabase Auth Email Deliverability

Last updated: 2026-04-23.

This SOP covers two ops flows that have tripped people up repeatedly:

1. **Giving admins access to course content** — why it needs attention and how the automation works now.
2. **Making Supabase auth emails (password reset, signup confirmation, magic link) deliverable** — why they land in spam and how to fix it once and for all.

---

## 1. Admin auto-enrollment

### What it solves

Before migration `033_admin_auto_enrollment`, promoting a user to `role = 'admin'` in `user_profiles` gave them admin-panel access and content-read via RLS, but the portal dashboard (`PortalDashboard.jsx`) routes course-card clicks based on rows in the `enrollments` table. No enrollment row → admin gets routed to the marketing page (`/apply`, `/rescue-kit`) instead of `/portal/module-1`. Looked like a lockout; was actually a missing-data bug.

### How it works now (migration 033)

Three pieces cooperate:

- **`public.ensure_admin_enrollments(p_user_id uuid, p_course_id uuid)`** — idempotent reconciler. No args = enroll every admin in every active course. Called by triggers + usable for manual repair.
- **Trigger `trg_admin_promote_enroll`** on `user_profiles` — fires when a row is inserted with `role = 'admin'` or updated such that `role` transitions to `'admin'`. Demotions are ignored (enrolled stays enrolled).
- **Trigger `trg_course_activate_enroll_admins`** on `courses` — fires when a course is inserted with `is_active = true` or updated such that `is_active` flips to `true`. Enrolls all current admins in the new/activated course.

Plus a belt-and-suspenders UI change in `PortalDashboard.jsx`: `isEnrolled = isAdmin || enrolledCourseIds.has(c.id)`. If a trigger hasn't run yet for any reason, admins still route into the portal, not to a marketing page.

### Daily ops: how to add a new admin

Run in Supabase SQL editor (or via MCP):

```sql
UPDATE public.user_profiles
SET role = 'admin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'newperson@healingheartscourse.com');
```

The `trg_admin_promote_enroll` trigger fires automatically — they'll have active enrollments in every `is_active = true` course by the time the transaction commits. No other action needed.

### Daily ops: how to add a new course

Just `INSERT INTO courses (..., is_active) VALUES (..., true)` or flip an existing `is_active` to `true`. The `trg_course_activate_enroll_admins` trigger enrolls every current admin automatically.

### Audit / repair

Run to check for drift (should return 0 rows):

```sql
SELECT au.email, c.slug
FROM public.user_profiles up
JOIN auth.users au ON au.id = up.id
CROSS JOIN public.courses c
WHERE up.role = 'admin' AND c.is_active = true
  AND NOT EXISTS (
    SELECT 1 FROM public.enrollments e
    WHERE e.user_id = up.id AND e.course_id = c.id AND e.status = 'active'
  );
```

If drift exists, one line fixes it:

```sql
SELECT public.ensure_admin_enrollments();
```

Returns the count of rows inserted. Zero = no drift. Safe to run anytime.

### What this does NOT do

- Does not revoke content on demotion. If you demote an admin to `student`, their existing enrollment rows remain `active`. Revoke manually if that's the intent.
- Does not handle coaches (`role = 'coach'`) — only `admin`. Extend the function's `WHERE` clause if we want coaches enrolled in everything too.
- Does not auto-enroll Jeff or any non-admin. Jeff is already `role = 'admin'` so this pattern covers him.

---

## 2. Supabase auth email deliverability

### What you're seeing

Reset-password emails from `noreply@mail.supabase.co` land in spam in Google Workspace, and the "Reset Password" link is visually blocked ("This link has been blocked" banner). Same problem for signup confirmation + magic link emails.

### Why

Supabase's default email sender (`noreply@mail.supabase.co`) has no SPF/DKIM alignment with `healingheartscourse.com`. Gmail treats it as spoofing and (a) filters the message to spam, (b) strips or warns on links because the sender domain doesn't match the link destination. This is working as intended on Gmail's side — the fix is on ours.

Spark Challenge emails don't have this problem because they go through Resend, which is SPF/DKIM-authenticated for `healingheartscourse.com`.

### The fix: Custom SMTP via Resend (one-time setup)

Supabase lets you route auth emails through any SMTP provider. Pointing it at Resend solves deliverability instantly — same sender, same alignment, same reputation as the Spark emails.

#### Step 1 — Supabase Dashboard → Project Settings → Auth → SMTP Settings

Toggle **"Enable Custom SMTP"** ON. Fields:

| Field | Value |
| --- | --- |
| **Sender email** | `hello@healingheartscourse.com` |
| **Sender name** | `Healing Hearts` |
| **Host** | `smtp.resend.com` |
| **Port** | `465` |
| **Username** | `resend` |
| **Password** | your Resend API key (same one in `.env.local` under `RESEND_API_KEY`) |
| **Min interval between emails** | `60` (seconds — default) |

Save. Send a test email from the dashboard (there's a "Send test email" button at the bottom of the SMTP section). It should arrive from `hello@healingheartscourse.com` within a few seconds and not be in spam.

#### Step 2 — Paste the branded templates

File `docs/supabase-auth-email-templates.md` has three ready-to-paste HTML templates:

1. Confirm Signup
2. Magic Link
3. Reset Password

For each one: Supabase Dashboard → Authentication → Email Templates → select from dropdown → paste the subject line into **Subject** and the HTML into **Message Body**. Click Save. Wait for the green "Saved" toast before switching templates — the dashboard does not auto-save.

#### Step 3 — Verify Site URL + Redirect URLs

Dashboard → Authentication → URL Configuration. Required settings:

- **Site URL**: `https://healingheartscourse.com`
- **Redirect URLs** (one per line):
  - `https://healingheartscourse.com/login?verified=true`
  - `https://healingheartscourse.com/portal`
  - `https://healingheartscourse.com/reset-password`
  - `https://healingheartscourse.com/account/password`
  - `https://www.healingheartscourse.com/**`

Without these, `resetPasswordForEmail({ redirectTo: '/reset-password' })` silently fails or redirects to a wildcard that Supabase considers unsafe.

#### Step 4 — Test end-to-end

1. Hit `/forgot-password`, submit your own email.
2. Check inbox — email should land in Inbox (not Spam) within 30 seconds, from `hello@healingheartscourse.com`.
3. Click the Reset Password button — should land at `/reset-password` with a valid session, ready to set a new password.
4. Set a new password — should redirect to `/portal`.

If any step fails, the next section covers diagnosis.

### Troubleshooting

**Email still in spam after SMTP setup.** Check Resend dashboard → Domains → `healingheartscourse.com` is verified (SPF, DKIM, DMARC all green). If not, DNS records need to be re-added to your registrar. The domain is typically managed in Cloudflare DNS for this project.

**Test email from Supabase fails with 535 auth error.** You pasted the wrong thing as password. Username must be literally `resend`, password must be the Resend API key starting with `re_`.

**Reset link still goes to localhost or a wrong domain.** Supabase is using the default Site URL. Fix in Step 3 above.

**Users see "Invalid flow state" when clicking the link.** Link expired (1-hour TTL) or was opened in a different browser session than the one that requested it. Ask them to request a fresh link.

**Bounced emails for valid addresses.** Check Resend dashboard → Emails → filter by status. If bounces are happening, the recipient domain's policy is the issue (rare for Gmail/Outlook/Apple; common for corporate servers with aggressive filters).

---

## Quick reference: useful SQL

```sql
-- Who are the admins?
SELECT au.email, up.display_name, up.created_at
FROM public.user_profiles up JOIN auth.users au ON au.id = up.id
WHERE up.role = 'admin' ORDER BY up.created_at;

-- Which admins are missing enrollments (should be empty)?
SELECT au.email, c.slug
FROM public.user_profiles up
JOIN auth.users au ON au.id = up.id
CROSS JOIN public.courses c
WHERE up.role = 'admin' AND c.is_active = true
  AND NOT EXISTS (
    SELECT 1 FROM public.enrollments e
    WHERE e.user_id = up.id AND e.course_id = c.id AND e.status = 'active'
  );

-- Repair any drift
SELECT public.ensure_admin_enrollments();

-- Promote someone
UPDATE public.user_profiles SET role = 'admin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'x@healingheartscourse.com');
```
