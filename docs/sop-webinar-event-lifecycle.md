# SOP: Webinar & Live Event Lifecycle

End-to-end playbook for running a live event on Healing Hearts — from scheduling through post-event follow-up. Captures how the code, data, and emails cooperate, plus the failure modes seen in production so future events don't trip the same wires.

Last updated: 2026-04-23 (after the Spark Challenge April 23 webinar).

---

## TL;DR — if you only read one thing

**A webinar does not exist until a row is inserted into `public.webinars`.** Every page, API endpoint, email template, and cron job in this system is gated on the presence of that row. No row → `/webinar` shows "Coming Soon" even to people whose calendars say otherwise → `/api/webinar-register` returns 404 → no confirmation emails → no reminders → silent failure.

**Seed the row first, promote second.** The broadcast emails (`/api/admin/send-broadcast`) and the `spark-broadcast-morning` cron assume a valid webinar is in the DB. Sending the broadcast before the row exists is the single highest-impact mistake you can make, and it has happened.

---

## 1. Lifecycle overview

```
T-7 days:  Seed webinar row → announce → broadcast invite
T-1 day:   Registrants get day-before reminder (automatic)
T-0:       Day-of reminder (automatic, ~2h before)
T+0:       Manual status flip: scheduled → live (optional — isEffectivelyLive helper is a safety net)
T+0 to T+1h: Event runs
T+0:       Manual status flip: live → completed (unblocks the follow-up drip)
T+0 to T+7: Follow-up drip (5 emails over 7 days, automatic)
```

Everything between the row being seeded and `status='completed'` is automatic if you keep the row's fields correct. Everything around the edges — seeding, replay_url, status flips — is manual. This SOP is mostly about those manual touches.

---

## 2. Data model

### `public.webinars` — the source of truth

Key columns (see `supabase/migrations/010_webinars.sql` for the full schema):

| Column | Purpose | Example |
| --- | --- | --- |
| `id` | UUID — referenced everywhere | `cf709b00-…` |
| `title` | Shows in emails + on `/webinar` | `Spark Challenge Webinar — Live Q&A with Trisha` |
| `description` | Shown on `/webinar` hero | Short marketing copy |
| `starts_at` | `timestamptz` — drives reminder windows, `isEffectivelyLive()` | `2026-04-24 01:00:00+00` |
| `duration_minutes` | Default `90`. Drives how long `isEffectivelyLive()` treats a scheduled event as joinable after start. | `60` |
| `meeting_url` | Google Meet / Zoom / generic join URL. **First in the fallback chain.** | `https://meet.google.com/cam-fqwt-jdn` |
| `riverside_audience_url` | Legacy Riverside embed. Used if `meeting_url` is null. Iframeable. | `https://riverside.fm/…` |
| `replay_url` | Set post-event. Drives `/webinar/replay`. | YouTube or Mux URL |
| `status` | `scheduled` \| `live` \| `completed` \| `evergreen` | See §5 |
| `registrant_count` | Updated by `increment_webinar_registrants` RPC. Analytics only. | `142` |

### `public.webinar_registrations` — who registered

One row per (email × webinar). Composite uniqueness via the `onConflict: 'email,webinar_id'` upsert in `api/webinar-register.js:79`. Tracks reminder + follow-up state per registrant:

- `reminder_day_before_sent`, `reminder_day_of_sent` — flags set by the cron to prevent double-sends
- `followup_day` — counter 0–5 for the post-event drip
- `followup_completed` — set when the 5th template fires
- `spark_signup_id`, `application_id` — cross-links to attribution sources
- `unsubscribed` — excludes from future sends

**FK note**: pre-2026-04-25, `webinar_registrations.webinar_id` did **not** have `ON DELETE CASCADE`. Deleting a webinar row left orphan registrations (we had 35 of them). Migration `034_webinar_cascade_delete_fk.sql` fixes this; confirm it's applied before doing any webinar-deletion cleanup.

---

## 3. Code paths (the user-facing surfaces)

| Route / endpoint | File | What it does |
| --- | --- | --- |
| `/webinar` | `src/pages/WebinarRegister.jsx` | Three states: **upcoming** (registration form), **replay exists** (waitlist), **neither** (generic waitlist). Queries webinars table. |
| `/api/webinar-register` | `api/webinar-register.js` | POST endpoint. Finds next scheduled/live webinar → upserts registration → sends confirmation + team notification. Returns 404 if no webinar exists. |
| `/webinar/live` | `src/pages/WebinarLive.jsx` | Two states: **live** (join button / iframe) and **scheduled** (countdown). Uses `isEffectivelyLive()` (see §6). |
| `/webinar/replay` | `src/pages/WebinarReplay.jsx` | Plays `replay_url` for completed/evergreen webinars. |
| `/api/cron/webinar-cron` | `api/cron/webinar-cron.js` | Daily at 5 PM MT. Sends day-before + day-of reminders + follow-ups. See §5. |
| `/api/cron/spark-broadcast-morning` | (see git log `f6f2b4f`) | One-off cron that blasts the morning-of invitation to Spark subscribers. Does **not** create registrations — purely a marketing email. |

### The fallback chain for the "join" URL

`api/_emails/webinar-reminder-day-of.js:10` and `src/pages/WebinarLive.jsx` use the same fallback:

```
meeting_url || riverside_audience_url || 'https://healingheartscourse.com/webinar/live'
```

Google Meet is ALWAYS `meeting_url`. Riverside is ALWAYS `riverside_audience_url`. If neither is set and start-time passes, users click "Join" and bounce back to `/webinar/live` which has nothing to embed — **dead end**. Always set at least one before going live.

---

## 4. Email sequence

| Template | File | Fires when | Sender |
| --- | --- | --- | --- |
| Confirmation | `api/_emails/webinar-confirmation.js` | Immediately on successful `/api/webinar-register` | Resend via `hello@healingheartscourse.com` |
| Team notification | inline in `api/webinar-register.js:110` | Same | Sent to `hello@healingheartscourse.com` |
| Day-before reminder | `api/_emails/webinar-reminder-day-before.js` | Daily cron, 20–26h before `starts_at` | Resend |
| Day-of reminder | `api/_emails/webinar-reminder-day-of.js` | Daily cron, 0–4h before `starts_at` | Resend |
| Follow-up 1 | `api/_emails/webinar-followup-1.js` | Cron, `afterDays >= 0` post-event, status IN (completed, evergreen) | Resend |
| Follow-up 2 | `webinar-followup-2.js` | `afterDays >= 1` | Resend |
| Follow-up 3 | `webinar-followup-3.js` | `afterDays >= 3` | Resend |
| Follow-up 4 | `webinar-followup-4.js` | `afterDays >= 5` | Resend |
| Follow-up 5 | `webinar-followup-5.js` | `afterDays >= 7` | Resend |

Follow-up schedule config lives at `api/cron/webinar-cron.js:48-54` (`FOLLOWUP_SCHEDULE`).

**Critical gotcha**: follow-ups **only fire if the webinar row's status is `completed` or `evergreen`**. If you forget to flip status after the event, nobody gets any follow-up. The post-webinar cleanup agent (see §8) flips this automatically when it runs 48h post-event.

### Deliverability

All webinar emails route through **Resend + Custom SMTP on Supabase** (see `docs/sop-admin-auto-enrollment-and-auth-email.md` §2 for the SMTP setup). Sender is `hello@healingheartscourse.com` with SPF/DKIM alignment — no spam issues.

The `broadcast_sends` table tracks one-off broadcast IDs so you can dedupe / audit who got what. Every broadcast campaign should use a unique `broadcast_id` (e.g., `webinar-broadcast-aprilNN`, `webinar-joinlink-aprilNN`).

---

## 5. Status transitions

The `status` column drives routing across the whole system:

| Status | What happens | When to set |
| --- | --- | --- |
| `scheduled` | `/webinar` shows registration form; reminders fire based on `starts_at`. `isEffectivelyLive()` treats it as joinable once `starts_at` passes (belt-and-suspenders). | On initial seed |
| `live` | `/webinar/live` shows the live-now state unconditionally. Reminders do not fire (wrong window). | Manually at showtime OR let `isEffectivelyLive()` cover it |
| `completed` | `/webinar/replay` can surface if `replay_url` is set. Follow-up drip activates. | Immediately after the event ends |
| `evergreen` | Same as completed, but marked as permanently-available content (e.g., for a recorded masterclass). | For library content; rare for live events |

**Default pattern**: seed as `scheduled`, leave it there through the event (the `isEffectivelyLive()` safety net in `src/pages/WebinarLive.jsx:30` handles the live transition), then flip to `completed` 1–2h after the event ends to start the drip.

The `live` status is technically optional with the safety net in place, but flipping it explicitly is cleaner and surfaces the "Live Now" red-dot badge on `/webinar/live`.

---

## 6. The `isEffectivelyLive()` safety net

Lives in `src/pages/WebinarLive.jsx:28`:

```js
function isEffectivelyLive(webinar) {
  if (webinar.status === 'live') return true;
  if (webinar.status !== 'scheduled') return false;
  const startsAt = new Date(webinar.starts_at).getTime();
  const duration = (webinar.duration_minutes || 90) * 60 * 1000;
  const now = Date.now();
  return now >= startsAt && now <= startsAt + duration + 30 * 60 * 1000;
}
```

Translation: a webinar that is still `scheduled` but whose start time has passed (and isn't more than `duration + 30min` in the past) is treated as live. This means a forgotten manual status flip doesn't strand registrants clicking the "Join Session" link in their reminder email.

If you know you won't be near the dashboard at showtime, this is the net. Don't rely on it alone for high-stakes events — flip status manually and add calendar reminders for yourself — but know it's there.

---

## 7. Provider-specific notes

### Google Meet (current default)

- Set `meeting_url` = the Meet URL (e.g., `https://meet.google.com/cam-fqwt-jdn`)
- Leave `riverside_audience_url` NULL
- `/webinar/live` detects via regex (`/meet\.google\.com/i`) and renders a click-to-join button — **Meet cannot be iframed** (X-Frame-Options: SAMEORIGIN blocks it)
- Meet link opens in a new tab
- Phone dial-in + PIN should be added to the confirmation email copy manually for events where that matters (see `api/_emails/webinar-april23-join-link.js` for the pattern)

### Riverside (legacy)

- Set `riverside_audience_url` = the Riverside audience URL
- Leave `meeting_url` NULL
- `/webinar/live` iframes it directly (`allow="camera; microphone; fullscreen; display-capture"`)
- Permissions-Policy on `/webinar/live` already grants camera+mic — see commit `f637398`

### Zoom (if ever needed)

Same pattern as Google Meet — Zoom blocks iframe embedding too. Use `meeting_url` and the code will fall through to click-to-join because the regex only matches Meet. You'd want to generalize the `isMeetLink` detection in `WebinarLive.jsx:~97` to include Zoom if this becomes a regular pattern.

---

## 8. Pre-event checklist

Run through these in order. Each box is a hard dependency for the next.

### T-7 days (or whenever you schedule)

- [ ] **Seed the webinar row** — `INSERT INTO webinars (title, description, starts_at, duration_minutes, meeting_url OR riverside_audience_url, status='scheduled')`. Verify with `SELECT id, title, starts_at, status, meeting_url, riverside_audience_url FROM webinars WHERE starts_at > now() ORDER BY starts_at LIMIT 1;`
- [ ] **Confirm the registration page works** — visit `/webinar` in an incognito tab. Should show registration form with your date/time formatted in Mountain Time.
- [ ] **Test a registration** — use a throwaway email, verify the confirmation email arrives from `hello@healingheartscourse.com` within ~30s. Check inbox-not-spam.
- [ ] **Confirm `webinar_registrations` row was created** — `SELECT * FROM webinar_registrations WHERE email = 'your-test@...' AND webinar_id = '<the uuid>';`

### T-2 days

- [ ] **Send the broadcast invite** (if using Spark audience): `/api/admin/send-broadcast` or a manual script like `scripts/send-webinar-april23-joinlink.mjs` (template). Always record the broadcast with a unique `broadcast_id` in `broadcast_sends` — dedupes future re-sends.
- [ ] **Monitor `webinar_registrations`** for a few hours to catch any API errors in Resend/Vercel logs.

### T-1 day

- [ ] **Verify day-before reminder fired** — cron runs at 5 PM MT. Check `reminder_day_before_sent = true` on all active registrations.
- [ ] **Eyeball attendance** — registrant count growing? Any surprising inbound?

### T-2 hours (same day)

- [ ] **Verify day-of reminder fired** — the 5 PM MT cron will email everyone whose webinar starts in the next 0–4h. Check `reminder_day_of_sent = true`.
- [ ] **Confirm the Meet room / Riverside studio is ready** — open it yourself, make sure audio/video are working.

### T-5 minutes

- [ ] **Flip status to `live`** (optional — safety net will cover, but this makes `/webinar/live` show the "Live Now" red dot): `UPDATE webinars SET status = 'live' WHERE id = '<uuid>';`

### T+0 → T+1h

- [ ] **Event runs.**

### T+1h (right after you end)

- [ ] **Flip status to `completed`** — this unblocks the follow-up drip. The scheduled post-webinar agent will do this automatically at T+48h if you forget, but earlier is better.
- [ ] **If recording**: drop the recording URL into `replay_url`. For Google Meet, you need Workspace with recording enabled; recordings land in Drive. For YouTube/Mux, paste the playback URL.

### T+48h

- [ ] **Scheduled post-webinar agent runs** (see §9) — generates cleanup PR with status-flip SQL, cascade-delete migration, and follow-up verification.

---

## 9. Post-event automation

Every live event should have a scheduled remote agent fire ~48h after it ends to do cleanup + verification. Use `/schedule` to create a one-shot routine that:

1. Generates a `scripts/post-webinar-<slug>-cleanup.sql` with the status flip + follow-up count query + commented-out orphan-cleanup options
2. Drafts (or confirms) a `supabase/migrations/*_webinar_cascade_delete_fk.sql` if the cascade FK isn't yet live
3. Writes a `docs/handoffs/YYYY-MM-DD-post-webinar-cleanup.md` decision brief
4. Opens a PR against master with those files

The remote agent does NOT have Supabase MCP access — it generates SQL and drafts files, then the next local Claude Code session applies them via local tooling. See `trig_01ESb6zg1rdqamstHBPuWES3` (the Apr 23 instance) for the template prompt.

---

## 10. Recovery playbook — things that have gone wrong

### Problem: `/webinar` shows "Coming Soon" even though the event is today

**Cause**: `webinars` table has no row with a future `starts_at`. Broadcast might have already gone out pointing people at this URL.

**Fix**:
1. `INSERT INTO webinars (...) VALUES (...)` with correct `starts_at`
2. Write a one-off "here's your join link" email (template: `api/_emails/webinar-april23-join-link.js`)
3. Pull recipient list from `broadcast_sends WHERE broadcast_id = '<morning-broadcast-id>'`, dedupe against `spark_signups.unsubscribed = true`
4. Send via Resend, simultaneously upserting `webinar_registrations` rows with `reminder_day_of_sent = true` to prevent the 5 PM cron from double-sending
5. Record the send with a new `broadcast_id` like `webinar-joinlink-<date>` in `broadcast_sends` so you can audit

This is exactly what happened April 23, 2026 — see `scripts/send-webinar-april23-joinlink.mjs` for the reference implementation.

### Problem: `/webinar/live` shows the countdown state even though the event started

**Cause**: `status` is still `scheduled` and either the `isEffectivelyLive()` check isn't deployed yet, or `starts_at` is wrong.

**Fix**:
- Check `starts_at` — should be in the past by seconds to minutes, not hours. Timezone-drift is a common mistake (UTC vs local).
- Manually `UPDATE webinars SET status = 'live' WHERE id = '<uuid>';`
- If the `isEffectivelyLive()` helper is deployed (production as of commit `1043f1f`), this is belt-and-suspenders — the page should already be rendering the live state.

### Problem: "Join Session" button in reminder email is broken

**Cause**: neither `meeting_url` nor `riverside_audience_url` is set on the webinar row. The fallback chain lands on `/webinar/live`, which has nothing to embed.

**Fix**: set `meeting_url` immediately. Any users who have already clicked and seen the broken state need a fresh email — use the recovery pattern above.

### Problem: Orphan `webinar_registrations` rows after deleting a webinar

**Cause**: pre-migration-034, `webinar_registrations.webinar_id` FK did not cascade. Deleting a webinar row left orphans.

**Fix**:
- Migration `034_webinar_cascade_delete_fk.sql` adds `ON DELETE CASCADE` going forward
- Existing orphans: `DELETE FROM webinar_registrations WHERE webinar_id NOT IN (SELECT id FROM webinars);`
- Verify with: `SELECT COUNT(*) FROM webinar_registrations wr LEFT JOIN webinars w ON w.id = wr.webinar_id WHERE w.id IS NULL;` → should return 0

### Problem: Follow-up emails aren't firing after the event

**Cause**: `status` is still `live` or `scheduled`, not `completed`/`evergreen`. The cron's follow-up job filters by `.in('status', ['completed', 'evergreen'])` at `webinar-cron.js:129`.

**Fix**: `UPDATE webinars SET status = 'completed' WHERE id = '<uuid>';`. Next 5 PM MT cron will pick up and fire whatever template is applicable.

---

## 11. Useful queries

```sql
-- Next upcoming webinar
SELECT id, title, starts_at, status, meeting_url, riverside_audience_url
FROM public.webinars
WHERE starts_at > now()
ORDER BY starts_at
LIMIT 1;

-- Registrations + reminder state for the current event
SELECT
  COUNT(*) AS total,
  SUM((reminder_day_before_sent)::int) AS day_before_sent,
  SUM((reminder_day_of_sent)::int) AS day_of_sent,
  SUM((unsubscribed)::int) AS unsubs
FROM public.webinar_registrations
WHERE webinar_id = '<uuid>';

-- Follow-up drip state
SELECT followup_day, followup_completed, COUNT(*) AS n
FROM public.webinar_registrations
WHERE webinar_id = '<uuid>'
GROUP BY followup_day, followup_completed
ORDER BY followup_day;

-- Broadcast audit (who got what email)
SELECT broadcast_id, COUNT(*) AS sent_count, MIN(sent_at), MAX(sent_at)
FROM public.broadcast_sends
WHERE broadcast_id ILIKE '%webinar%'
GROUP BY broadcast_id
ORDER BY MAX(sent_at) DESC;

-- Orphan check (should be 0 after migration 034)
SELECT wr.webinar_id, COUNT(*) AS orphan_count
FROM public.webinar_registrations wr
LEFT JOIN public.webinars w ON w.id = wr.webinar_id
WHERE w.id IS NULL
GROUP BY wr.webinar_id;
```

---

## 12. Ownership at a glance

| Area | Owner | Notes |
| --- | --- | --- |
| Seed the webinar row + confirm URL | Chase | Do this 7+ days before the event |
| Broadcast copy + send | Trisha (copy), Chase (send) | Unique `broadcast_id` per campaign |
| Meet/Riverside room setup | Trisha | Test audio/video T-2h |
| Status transitions (scheduled → completed) | Chase | Or let the T+48h agent handle `completed` |
| Replay URL capture | Trisha | Drop into `webinars.replay_url` post-event |
| Post-event drip monitoring | Chase via the scheduled cleanup agent | Reads the PR the agent opens |

---

## 13. Appendix — what to change in the code when conventions shift

- **Add Zoom support**: extend the regex in `WebinarLive.jsx:~97` (`const isMeetLink = /meet\.google\.com/i.test(joinUrl)`) and the fallback logic. Keep Meet's click-to-join pattern — Zoom also can't be iframed.
- **Change cron frequency**: edit `vercel.json` `crons` block, or add a new cron entry. Minimum useful frequency is hourly; finer than that requires reworking the window math in `webinar-cron.js:REMINDER_JOBS`.
- **Add new follow-up email**: create `api/_emails/webinar-followup-N.js`, add entry to `FOLLOWUP_SCHEDULE` in `webinar-cron.js:48`, update the 0–5 check constraint on `webinar_registrations.followup_day` via migration. Bump the `followup_completed` threshold.
- **Attribution to a new source**: extend the `spark_signup_id` / `application_id` lookups in `api/webinar-register.js:60` with a new cross-link.
