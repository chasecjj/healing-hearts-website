# CRM Implementation — Session Handoff

**Date:** 2026-04-09
**Context:** Written during Stripe payment portal build. CRM database layer exists but has no UI, no unified view, and data is fragmented across tables.
**Priority:** Medium — data is being captured now, but nobody can see or act on it
**Prerequisite:** Stripe payment portal must be deployed first (this provides the orders + contact flow)

---

## Current State: What Exists

### Database Tables (all have data flowing in)

| Table | What writes to it | What it tracks |
|-------|-------------------|----------------|
| `crm_contacts` | checkout.js, webhook | Email, name, stage, source, stripe_customer_id, auth_user_id, tags, timestamps |
| `orders` | checkout.js, webhook | Stripe session/payment, product_slug, amount, status, metadata (UTM/source) |
| `spark_signups` | spark-signup.js, application.js | Spark Challenge registrations (separate from crm_contacts) |
| `applications` | application.js | Full program applications (name, email, relationship status, urgency, budget, etc.) |
| `webinar_registrations` | webinar-register.js | Webinar signups (separate from crm_contacts) |
| `enrollments` | webhook, DB trigger | Course access grants per user |
| `rescue_kit_drip` | webhook (planned) | Post-purchase drip tracking |

### Stage Progression (crm_stage enum)

```
visitor → lead → customer → enrolled → vip
```

Currently only two transitions are automated:
- `visitor` → set on first checkout (default)
- `customer` → set by webhook on completed purchase

**Not automated:** `lead` (should be set on Spark signup, webinar registration, or application), `enrolled` (should be set on full course purchase), `vip` (manual only).

### What's NOT Connected

1. **`spark_signups` does NOT write to `crm_contacts`** — A Spark Challenge signup creates a `spark_signups` row but never creates a `crm_contacts` row. Same person can exist in both tables with no link.

2. **`applications` does NOT write to `crm_contacts`** — An application creates an `applications` row but no CRM contact. If they later purchase, the webhook creates a `crm_contacts` row, but there's no link back to their application data.

3. **`webinar_registrations` does NOT write to `crm_contacts`** — Same pattern. Isolated table.

4. **No unified timeline** — There's no way to see: "This person signed up for Spark on March 1, registered for the webinar on March 15, submitted an application on March 20, and purchased the Rescue Kit on April 9."

---

## What the CRM Needs (When Built)

### Phase 1: Unified Contact Record

**Goal:** Every person who interacts with Healing Hearts has ONE record in `crm_contacts`, regardless of how they entered.

**Changes needed:**
- `spark-signup.js` → upsert `crm_contacts` (stage: lead, source: spark)
- `webinar-register.js` → upsert `crm_contacts` (stage: lead, source: webinar)
- `application.js` → upsert `crm_contacts` (stage: lead, source: application)
- Add `application_id` or link to `applications` table from `crm_contacts`
- Backfill: migrate existing `spark_signups` and `applications` into `crm_contacts`

**Stage automation:**
- Spark signup / webinar registration → stage = `lead`
- Any purchase → stage = `customer` (already done)
- Full course enrollment → stage = `enrolled` (add to webhook)
- VIP → manual only (Chase/Trisha decision)

### Phase 2: Admin Contact Dashboard

**Goal:** Chase and Makayla can see all contacts, their stage, activity, and orders.

**What to build in AdminPanel:**
- Contact list with search, filter by stage, sort by last activity
- Contact detail view: email, stage, source, tags, linked auth account
- Activity timeline per contact (Spark signup, webinar registration, application, orders, email opens)
- Order history per contact (product, amount, date, status)
- Enrollment status per contact
- Manual stage override (promote to VIP, etc.)
- Bulk actions (tag contacts, export CSV)

**Data already available for the timeline:**
- `crm_contacts.first_seen_at`, `last_activity_at`
- `orders.created_at` per order
- `spark_signups.created_at` (if backfilled)
- `applications.created_at` (if backfilled)
- `enrollments.enrolled_at`

### Phase 3: Close Process Integration

**Goal:** Makayla's close SOP lives in the admin panel, not in her head.

**What to build:**
- Pipeline view: leads in each stage (kanban or table)
- Application review with qualification flags (already computed in application-team-notify.js)
- One-click "Send Calendly Link" from the contact detail view
- Close process checklist per contact (5-touch email sequence from Makayla Close SOP)
- Private checkout link generation for full course ($12,997) — currently manual, should be a button
- Notes per contact (Chase/Makayla can add context)

**SOP reference:** `Projects/healing-hearts/sops/2026-03-24-makayla-close-process.md`

### Phase 4: Analytics Dashboard

**Goal:** Funnel conversion metrics.

**What to track:**
- Visitor → Lead conversion (Spark signups + webinar registrations / total visitors)
- Lead → Application conversion
- Application → Consultation conversion
- Consultation → Enrollment conversion
- Revenue by product, by source, by time period
- UTM attribution (which sources drive purchases — expo booth, organic, etc.)

**Data already available:**
- `orders.metadata` has `source` and UTM params
- `crm_contacts.source` tracks first touch
- `orders.amount_cents` and `status` for revenue

---

## Known Issues to Fix During CRM Build

### 1. Overly Permissive RLS Policies (from code review)

These pre-existing policies grant write access to ALL roles, not just service role:

```sql
-- crm_contacts: FOR ALL USING (true) WITH CHECK (true)
-- orders: FOR INSERT WITH CHECK (true)
-- orders: FOR UPDATE USING (true)
```

Service role already bypasses RLS, so these policies are redundant AND dangerous. They should be dropped and replaced with admin-only or removed entirely.

### 2. Stage Progression Not Enforced

Nothing prevents a contact from going backward (e.g., `enrolled` → `visitor`). The webhook upsert sets `stage: 'customer'` unconditionally — if someone is already `enrolled`, buying a Rescue Kit would demote them.

**Fix:** Use a `GREATEST` or check pattern:
```sql
-- Only advance stage, never demote
UPDATE crm_contacts
SET stage = GREATEST(stage, 'customer')
WHERE email = ...;
```

Note: This requires making `crm_stage` enum ordinal, or using a numeric field with a mapping.

### 3. No Duplicate Contact Prevention Across Tables

A person can exist in `spark_signups`, `applications`, `webinar_registrations`, AND `crm_contacts` as four separate records with no foreign key linking them. Email is the implicit join key but there's no enforcement.

### 4. stripe_customer_id Never Set

`crm_contacts.stripe_customer_id` column exists but is never populated. The checkout flow uses Stripe Checkout (which creates a customer automatically), but the webhook doesn't store the Stripe customer ID back to the contact. Add this to the webhook:

```javascript
// After checkout.session.completed, if session.customer exists:
if (session.customer) {
  await supabaseAdmin.from('crm_contacts')
    .update({ stripe_customer_id: session.customer })
    .eq('email', customerEmail);
}
```

### 5. Contact Name Often Missing

`crm_contacts.name` is only set if the contact came through the application flow (which collects name). Checkout only collects email. Webinar registration collects name. Spark signup collects name.

When unifying contacts, merge the name from whichever table has it:
```sql
UPDATE crm_contacts c
SET name = COALESCE(c.name, s.name, a.name, w.name)
FROM spark_signups s, applications a, webinar_registrations w
WHERE ...
```

---

## Vercel Function Budget Impact

The CRM admin dashboard would likely need:
- `/api/admin/contacts.js` — list/search contacts (function slot 11)
- `/api/admin/contact-detail.js` — single contact + timeline (function slot 12)

This uses the last 2 Vercel function slots. If more admin endpoints are needed, consider consolidating into a single `/api/admin/index.js` with method routing, or upgrading the Vercel plan.

---

## Recommended Build Order

1. **Unify contact writes** (Phase 1) — quick, high impact, no new UI
2. **Fix RLS policies** — security issue, should happen with Phase 1
3. **Contact list in AdminPanel** (Phase 2) — Makayla needs this most
4. **Close process integration** (Phase 3) — depends on Phase 2
5. **Analytics** (Phase 4) — nice to have, lowest priority

Phases 1-2 could be a single session. Phase 3 needs Makayla input. Phase 4 can wait.
