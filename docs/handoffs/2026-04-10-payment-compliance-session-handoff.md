# Payment + Compliance Session Handoff

**Date:** 2026-04-10
**Session length:** ~all day
**Author:** Chase + Claude
**Status:** Session wrapped, next session resumes here
**Next session target:** Saturday 2026-04-11 or Monday 2026-04-13

---

## 🎯 What this session accomplished

This was the biggest compliance + payment infrastructure session to date. Three major workstreams all advanced significantly:

### 1. Stripe payment portal — fully live in production

| Component | Status |
|-----------|--------|
| Full Stripe Checkout integration (live mode, live keys) | ✅ Shipped |
| Live webhook endpoint at https://www.healingheartscourse.com/api/webhooks/stripe | ✅ Registered, 6 event types |
| Invoice + hosted receipt generation via invoice_creation.enabled | ✅ Shipped |
| Purchase confirmation emails (Trisha voice) with receipt + invoice links | ✅ Shipped |
| Dual-mode test/live Stripe support (sandbox still works on preview) | ✅ Shipped |
| Promo code for testing: `LAUNCHTEST90` (90% off, 5 redemptions, live mode) | ✅ Created |
| Downloads portal page + nav link | ✅ Shipped |
| Success page verification + warm copy | ✅ Shipped |
| Signup email prefill from checkout | ✅ Shipped |

Production URLs live:
- `https://www.healingheartscourse.com/rescue-kit` → Buy button → Stripe Checkout (live)
- `https://www.healingheartscourse.com/checkout/success` → Session verification + CTAs
- `https://www.healingheartscourse.com/portal/downloads` → Purchased downloads list
- `https://www.healingheartscourse.com/refund-policy` → New refund policy page

### 2. Compliance Pass 1 — 8 of 14 CRITICAL audit items resolved

Resolved:

| # | Audit item | Severity | Fix |
|---|------------|----------|-----|
| 1.1 | Terms installment plans don't exist in Stripe | 🔴 | Footnoted as "by invitation only during consultation" |
| 1.2 | LLC name inconsistency + stale dates | 🔴 | Standardized to "Healing Hearts Consulting, LLC" across Terms/Privacy/Login/Signup/Layout/footer |
| 1.3 | No refund policy page | 🔴 | /refund-policy live with 7-day / 14-day / FTC Cooling-Off language |
| 1.6 | No 18+ age gate at checkout | 🔴 | consent_collection.terms_of_service + custom_text with age affirmation |
| 2.1 | Webhook only handles 1 event type | 🔴 | Expanded to 6: completed, expired, refunded, dispute.created, dispute.closed, payment_failed |
| 2.2 | No idempotency keys on session creation | 🔴 | SHA-256 hash keyed to slug+email+5min bucket |
| 2.3 | 'disputed' state on order_status enum | 🔴 | Migration 018 applied |
| — | Stripe webhook events subscription | 🔴 | Both test + live webhooks subscribe to all 6 event types |

Still pending from audit (documented in section below).

### 3. Utah Business Tax Registration — SUBMITTED

Utah TAP Business Registration for Healing Hearts Consulting, LLC is **filed** as of 2026-04-10. Awaiting Utah processing (typically 1-2 business days to approval email).

**Confirmed on the registration:**
- Entity name: HEALING HEARTS CONSULTING, LLC
- Entity number: 14627343-0160
- EIN: [filed, not in this doc for privacy]
- Business address: 2889 W Chestnut St, Lehi, UT 84048-6008 (USPS-verified ZIP+4)
- Officer/owner: Trisha Ann Jamison (Managing Member, sole governing person per state record)
- Third party designee: Chase Jamison (authorized to discuss account with Utah Tax Commission)
- Tax type: Sales and Use Tax
- Estimated annual taxable sales: $16,001-$800,000 tier
- Filing frequency: Quarterly (assigned based on tier)
- Start date: 2026-04-10 (today, matching production launch)
- Authorized signatures: Yes (Trisha provided written e-signature authorization via iMessage)

**Documentation:**
- `Projects/healing-hearts/business-entity.md` (vault) — Utah state record details
- `Projects/healing-hearts/legal/2026-04-10-trisha-esignature-authorization.md` (vault) — text thread capturing Trisha's explicit authorization
- Local screenshots to be saved: `docs/legal/2026-04-10-trisha-esignature-authorization-*.png`

---

## 🚨 Critical actions for next session

### Immediate (next 1-2 business days)

- [ ] **Watch `hello@healingheartscourse.com` inbox** for Utah Sales and Use Tax account approval email. Usually arrives within 24-48h.
- [ ] **When approval arrives**, note the sales tax account number for future reference. Save to `Projects/healing-hearts/business-entity.md`.

### Monday 2026-04-13, 8am sharp

- [ ] **Call Utah State Tax Commission at 801-297-6303** (or toll-free 1-800-662-4335 ext. 6303) to request a **Temporary Sales Tax License for Special Events** covering the Be Healthy Utah expo (April 17-18, 2026).
- [ ] Have ready when calling:
  - Entity number: 14627343-0160
  - Business name: Healing Hearts Consulting, LLC
  - Main sales tax account number (from the approval email if it arrived; otherwise tell them the TAP registration was just submitted)
  - Expo venue name + full address (look up from expo confirmation email)
  - Expo dates: April 17-18, 2026
  - Estimated sales at event: $500-$2,000 (honest rough estimate)
- [ ] Take notes of the rep's name and any reference/confirmation numbers.
- [ ] Confirm how the license will be delivered (email PDF, physical mail, or both).
- [ ] **Must be IN HAND before Thursday April 16** so the expo booth is legal on Thursday setup / Friday opening.

### Once Utah sales tax account is active

- [ ] Enable Stripe Tax via `automatic_tax: { enabled: true }` in `api/checkout.js`. (10 minutes of code, done by Claude in next session)
- [ ] Update Stripe business profile to match the Utah registration (legal name, address). (Manual, done via Stripe Dashboard)
- [ ] Do one small real purchase on production using `LAUNCHTEST90` promo code to verify Stripe Tax is computing correctly and invoicing reflects the new tax behavior.

---

## 📋 Sprint 2 — Code items still from the audit

These are items Claude can code without blocking on external actions. Recommended order of priority:

### 🔴 CRITICAL still pending

1. **Privacy policy vendor table rewrite** (audit item 1.5)
   - Name Stripe, Resend, Supabase, Mux, Vercel, Cloudflare as data processors
   - Add CCPA "specific categories of third parties" disclosures
   - Add payment data retention section (7 years per IRS Pub 583 + Utah Code §59-1-1406)
   - Add "Your California Rights" link
   - Effort: medium (1-2 hours)

2. **Rate limiting on /api/checkout** (audit item 5.1)
   - Add simple in-memory or Redis-backed rate limit (5 requests/minute per IP)
   - Prevents DoS and brute-force session creation
   - Effort: small (30 minutes)

3. **Nightly webhook reconciliation cron** (audit item 4.2)
   - Vercel cron that queries Stripe for completed charges in the last 24h
   - Cross-references with `orders` table to catch missed webhook events
   - Alerts hello@ if any charges exist in Stripe but NOT in our DB
   - Catches cases where webhooks fail silently
   - Effort: medium (2-3 hours)

4. **Dispute alerts via Slack** (audit item 4.1)
   - Current dispute handler sends email to hello@
   - Upgrade to also post to a Slack channel for faster visibility
   - Requires Slack incoming webhook URL from Chase
   - Effort: small (30 minutes once Slack webhook is provided)

5. **Stripe Radar rules configuration** (audit item 4.3)
   - In Stripe Dashboard: enable basic fraud rules
   - Block ISO mismatches, velocity rules, high-risk countries if not serving them
   - Effort: small (15-30 minutes manual, Chase does this)

### 🟡 IMPORTANT — can wait a few weeks

6. **Orders page in portal** (audit item 3.1)
   - New `/portal/orders` page showing all past orders with receipt links
   - Complement to existing Downloads page
   - Effort: small-medium (1-2 hours)

7. **Refund request flow + SOP for Makayla** (audit item 3.2)
   - Create `refunds@healingheartscourse.com` email alias forwarding to Makayla
   - Write SOP doc explaining refund workflow
   - Add "Request refund" link from Orders page (once built)
   - Effort: small (SOP is 30 min, alias setup 5 min via Google Workspace)

8. **Account recovery SOP** (audit item 3.3)
   - Doc explaining how support can manually re-link a purchase to an account when a customer loses email access
   - Important for vulnerable audience (couples in distress, breakups)
   - Effort: small (30 minutes of writing)

9. **Store stripe_customer_id on orders** (audit item 2.3)
   - Wire the checkout session's customer ID through the webhook
   - Populate a new column on orders and crm_contacts
   - Makes future dispute and refund lookups faster
   - Effort: small (1 hour)

### 🟢 POST-EXPO (non-urgent)

10. SAQ A annual compliance (Stripe Dashboard → Settings → Compliance) — Chase manual
11. Quarterly ASV scans enrollment (Security Metrics, free via Stripe) — Chase manual
12. Upload logo to Stripe Branding (Settings → Branding) — Chase manual
13. Failed-payment recovery email (when someone's card is declined, send a gentle retry email)
14. Cookie banner + GPC listener (CCPA compliance for web visitors)
15. WCAG audit of checkout routes (ADA compliance)
16. In-portal support widget (Crisp / Intercom / mailto)

---

## 🗣️ Items deferred to human discussion

### Family conversation: Is Jeff a member of the LLC?

During Trisha's text exchange acknowledging her e-signature authorization, she expressed surprise that Jeff wasn't listed as an officer ("So dad is not in this? That's weird!"). The Utah state record shows Jeff only as the registered agent, not as a member or governing person.

**Added to next team meeting agenda (Tuesday April 14, 2026)** via `Projects/healing-hearts/meetings/meeting-state.md` with full context and decision framework.

Options:
- **Option A:** Leave as-is (Trisha sole member, Jeff only registered agent)
- **Option B:** Formally add Jeff as a member (requires Operating Agreement amendment + state filing + tax restructuring)

Non-urgent, non-blocking for expo.

---

## 📁 Files created or modified in this session

### New files
- `src/pages/Refund.jsx` — Refund policy page
- `api/_emails/purchase-confirmation.js` — (upgraded to accept receipt/invoice URLs)
- `supabase/migrations/018_add_disputed_order_status.sql`
- `docs/handoffs/2026-04-10-payment-system-audit.md` — Full 47-item audit report
- `docs/handoffs/2026-04-10-payment-compliance-session-handoff.md` — This file
- `Projects/healing-hearts/business-entity.md` (vault) — Official legal entity reference
- `Projects/healing-hearts/legal/2026-04-10-trisha-esignature-authorization.md` (vault) — Trisha's authorization doc
- `memory/user_personal_address.md` — Chase's personal address saved to memory

### Modified files
- `api/checkout.js` — Added: consent_collection, custom_text 18+ affirmation, idempotency keys, invoice_creation, dual-mode Stripe detection
- `api/webhooks/stripe.js` — Expanded from 1 to 6 event handlers
- `src/pages/Terms.jsx` — LLC name standardized, installment footnote, date update
- `src/pages/Privacy.jsx` — Date update
- `src/pages/Login.jsx` — LLC name standardized
- `src/pages/Signup.jsx` — LLC name standardized
- `src/App.jsx` — Added /refund-policy route
- `src/components/Layout.jsx` — Refund Policy link in footer, LLC name standardized
- `Projects/healing-hearts/meetings/meeting-state.md` (vault) — Added April 14 agenda topic

### Git commits (on master)
- `932234e` feat: Stripe invoices + receipt/invoice links in confirmation emails
- `cd94a7c` feat: compliance pass 1 — legal name, refund policy, webhook expansion

---

## 📊 Current state of the codebase

**Branch:** master (up to date)
**Latest production deploy:** `dpl_3RaSueUpjsFMENb84F9RDaqjPveh`
**Lambda count:** 10 of 12 (2 slots remaining)
**Webhook ID (live):** `we_1TKmCPL710AglWR1zrng6Ygi`
**Webhook ID (test):** `we_1TKijZLBP5IHGcpKlvB1ikEL`
**Stripe mode:** Live on production, Test on preview (dual-mode via sk_live_/sk_test_ detection)

**Env vars status:**
- Production: VITE_STRIPE_PUBLISHABLE_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, RESEND_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY ✓
- Preview: Same as above but with test-mode Stripe keys + SITE_URL override ✓

**Databases:**
- `products` table has dual-mode IDs (stripe_price_id = live, stripe_price_id_test = sandbox)
- `orders` table has 'disputed' status available via migration 018
- All RLS policies in place

---

## 🧠 Key insights worth remembering

1. **Utah entity number vs sales tax permit are DIFFERENT things.** Lots of small business owners think registering the LLC is the same as getting a sales tax permit. It's not. They're separate applications through different systems (business.utah.gov vs tap.utah.gov).

2. **USPS is authoritative for ZIP+4.** The 5-digit ZIP can differ from the first 5 of the ZIP+4 when USPS reassigns delivery routes to new subdivisions. Always use the USPS-verified form on official documents. For 2889 W Chestnut St, Lehi, the correct ZIP+4 is `84048-6008` (not `84043-6008` despite the city being "Lehi 84043" in common property records).

3. **§59-1-302 responsible-person liability** is the kind of thing most people click through on a tax form. It's actually load-bearing: Trisha (as sole governing person) and potentially Chase (as accounting-directing designee) have PERSONAL liability for sales tax the business fails to collect. LLC shield does NOT protect against this.

4. **Text-based authorization is stronger documentation than phone recordings** even in a one-party-consent state. Trisha's "I authorize, Chase Jamison, to submit the application for licenses and to use my e-signature" text is the single strongest piece of legal documentation from today's session.

5. **Adding unnecessary attachments to tax registrations SLOWS processing**, not speeds it up. Utah's "You are not required to attach additional documents" line means exactly what it says. The only time to attach is when a specific field demands it.

6. **Stripe webhook events need to be subscribed EXPLICITLY per event type.** Registering a webhook endpoint is not enough — you have to enumerate which events that endpoint wants to receive. Our webhook is now subscribed to 6 event types (up from 1) on both test and live modes.

---

## 🎬 How to resume in the next session

1. Read this handoff doc first (you are here)
2. Read the audit report at `docs/handoffs/2026-04-10-payment-system-audit.md` for the full punch list
3. Check `hello@healingheartscourse.com` for any Utah Tax Commission approval email
4. If approval arrived, update `Projects/healing-hearts/business-entity.md` with the new sales tax account number
5. Pick up Sprint 2 work: recommended starting point is the Privacy policy vendor table rewrite (CRITICAL and no external blockers)
6. Before doing anything expo-related, verify Temporary Sales Tax License was obtained Monday (see Critical Actions above)

**Expo countdown:** As of session close 2026-04-10, there are **7 days** until Be Healthy Utah expo opening (April 17-18).
