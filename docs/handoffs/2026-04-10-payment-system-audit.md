# Payment System Audit — Healing Hearts Website

**Date:** 2026-04-10
**Auditor:** Claude (deep-audit pass)
**Scope:** Stripe Checkout integration shipped in Phase 3 (checkout.js, webhook, emails, products schema, Terms/Privacy, success page)
**Merchant:** Healing Hearts Consulting, LLC (Utah)
**Products in scope:** $39 Rescue Kit, $35 Card Pack, $12,997 Full Course (+ $11,997 pay-in-full, installment plans documented in Terms but not yet implemented)

---

## Executive Summary

The payment portal is **functionally live** but carries **several CRITICAL legal/compliance gaps** that should be closed before promoting the checkout widely (expo, webinars, paid ads). The webhook handles only one event type (`checkout.session.completed`), which means **refunds, disputes, and failed payments silently do nothing** — access is not revoked, the CRM stage does not update, and Trisha/Makayla get no alert. The Terms page documents payment plans that **do not exist yet in Stripe**, which is itself a misrepresentation risk. Privacy policy does not mention Stripe as a data processor, does not cover CCPA-required disclosures, and does not address payment data retention. There is no refund request workflow, no order history page, no rate limiting on `/api/checkout`, no idempotency keys, and no Stripe Tax. Utah economic nexus is $100k — you are under it today, but a handful of $12,997 sales will get you there and Utah itself taxes digital products delivered to Utah buyers from day one.

The good news: the core flow (create session → webhook → grant access → email) is well-built, signature verification is correct, CRM linkage via post-signup trigger is elegant, and idempotency on `checkout.session.completed` is handled correctly.

Counts by severity: **14 CRITICAL**, **21 IMPORTANT**, **12 NICE TO HAVE**.

---

## 1. Legal / Compliance Requirements

### 1.1 🔴 CRITICAL — Terms page describes payment plans that don't exist in Stripe

**What:** `src/pages/Terms.jsx` section 3.2 lists three payment options (Pay-in-Full $11,997, Monthly 8x$1,000, Quarterly 3x$2,667). Only one Stripe product (`full-course`) exists at $12,997 one-time. No subscription/installment infrastructure exists.
**Why it matters:** If a customer accepts Terms on signup then tries to pay in installments, the site cannot honor it. Advertising a price/plan you cannot deliver is an FTC deceptive-practices risk (15 USC §45) and a California UCL §17200 risk. It is also a chargeback goldmine.
**Fix:** Either (a) remove the two installment options from Terms until Stripe Billing / payment intents are wired up, OR (b) gate the Terms installment language behind a "by invitation" footnote that makes clear installments are handled manually during the close call. Given the current close process (manual payment links), option (b) is honest and fast.
**Effort:** trivial (copy edit).

### 1.2 🔴 CRITICAL — Terms dated "February 2026" but references 2026 commitments, LLC name mismatch

**What:** Terms.jsx line 13: "Last updated: February 2026." Document uses both "Healing Hearts Consulting, LLC" (most sections) and "Healing Hearts LLC" (recitals) inconsistently. Privacy.jsx has the same inconsistency.
**Why it matters:** LLC name mismatch creates ambiguity about which legal entity the customer is contracting with. If the Utah Division of Corporations shows one name but Terms uses another, enforceability suffers.
**Fix:** Pick one legal name (verify with Utah business registration at business.utah.gov), use it consistently in Terms, Privacy, footer, and purchase confirmation emails. Add `Effective Date: 2026-MM-DD` in addition to `Last Updated`.
**Effort:** trivial.

### 1.3 🔴 CRITICAL — No standalone, customer-visible refund policy linked from checkout

**What:** Refund language is buried in Terms §3.3. There is no `/refund-policy` page, no refund link in the footer, no link from the product pages or Stripe Checkout `custom_text`/`consent_collection`, and no mention in the purchase confirmation email.
**Why it matters:** Visa, Mastercard, and Discover operating rules require merchants to disclose refund/return policies at the time of purchase ([Stripe SSA Services Terms](https://stripe.com/legal/ssa-services-terms)). Failure to disclose a refund policy means Visa defaults to "full refund available on request," which undermines the non-refundable installment language in Terms §3.3. FTC Rule 16 CFR §435 (Mail Order Rule) also applies to digital goods ordered online.
**Fix:**
1. Create `src/pages/Refund.jsx` — clear plain-English page covering: Rescue Kit/Card Pack (no refund, digital download, or 7-day satisfaction guarantee — pick one and ship), Full Course pay-in-full ($5,000 max partial), installments (non-refundable, liability continues), how to request.
2. Link from footer, Terms, Privacy, and product pages.
3. In `api/checkout.js` sessionParams, add `custom_text.terms_of_service_acceptance` and set `consent_collection: { terms_of_service: 'required' }` with a `custom_text.submit.message` pointing to your Terms + Refund URL.
4. Add one sentence to `purchase-confirmation.js` linking to the refund policy.

**Effort:** small.
**References:** [Stripe Checkout custom policies](https://docs.stripe.com/payments/checkout/customization/policies), [FTC Mail Order Rule](https://www.ftc.gov/legal-library/browse/rules/mail-internet-or-telephone-order-merchandise-rule).

### 1.4 🔴 CRITICAL — No sales tax collection (Stripe Tax disabled)

**What:** `api/checkout.js` does not set `automatic_tax: { enabled: true }`. No `tax_behavior` on the Stripe prices. No tax reports in Stripe Dashboard.
**Why it matters:**
- **Utah (home state) has physical nexus from day one.** Utah taxes digital products/SaaS ([Utah Publication 64](https://tax.utah.gov/forms/pubs/pub-64.pdf)). Every Utah sale needs tax collected and remitted. You are already out of compliance on any Utah buyer since launch.
- **Utah economic nexus:** $100,000 in-state sales ([Utah Code §59-12-107](https://le.utah.gov/xcode/Title59/Chapter12/59-12-S107.html)). 200-transaction test was removed July 1, 2025.
- **Other states:** Roughly 25 states tax digital goods (WA, TX, CT, PA, NY depending on type, etc.). Each has its own economic nexus ($100k–$500k). Even a few $12,997 sales into WA or TX trigger thresholds fast.
- **Expo retail sales (April 17–18)** — anything sold at the booth is a Utah transaction and requires a temporary sales tax license if not using Stripe Terminal with Tax enabled.

**Fix:**
1. **Immediately:** enable Stripe Tax in Dashboard (Settings → Tax). Add origin address = Utah. Set `tax_behavior: 'exclusive'` on the Rescue Kit, Card Pack, and Full Course prices OR set `tax_behavior: 'inclusive'` if you want the $39/$35/$12,997 to be the final price. Decide now — changing it later means price changes.
2. Update `api/checkout.js`:
   ```js
   sessionParams.automatic_tax = { enabled: true };
   sessionParams.customer_update = { address: 'auto' };  // only when customer is passed
   ```
   Note: automatic_tax requires billing address collection — Stripe Checkout handles this automatically once enabled.
3. Register for a Utah sales tax license (business.utah.gov) before the next sale.
4. Monitor Stripe Tax's "Registrations" tab monthly for states where you hit nexus — it will flag them.
5. For the expo, confirm whether you need a Utah Temporary Sales Tax License.

**Effort:** medium (tax registration is a real task, not just code).
**References:** [Stripe Tax](https://docs.stripe.com/tax), [Utah Pub 64](https://tax.utah.gov/forms/pubs/pub-64.pdf), [Utah Afternoon sales tax guide](https://www.afternoon.co/blog/utah-sales-tax-guide).

### 1.5 🔴 CRITICAL — Privacy policy does not disclose Stripe, Resend, Supabase, or payment data handling

**What:** `src/pages/Privacy.jsx` §3 vaguely mentions "trusted third-party service providers (e.g., payment processors, email providers, video hosting platforms)" but never names Stripe, Resend, Supabase, Mux, Vercel, Cloudflare, etc. §4 says "security measures" but gives no specifics. §5 says retention is "duration of Program Lifetime" without specifying payment records (IRS/Utah require 3–7 years).
**Why it matters:**
- **CCPA** (CA Civil Code §1798.100 et seq.) requires disclosure of "categories of third parties" that receive personal info — vague "service providers" is insufficient.
- **CPRA** (as amended 2023) requires a specific "Notice at Collection" before collecting info. Your checkout flow collects email + (via Stripe) full payment details with no linked privacy notice.
- **GDPR Art. 13/14** (if any EU customers): same — named controllers/processors required.
- **Utah Consumer Privacy Act (UCPA)** effective 12/31/2023: applies if you process data of 100k+ Utah consumers/yr OR 25k+ and derive 50% revenue from sale. You are under the threshold today but the disclosure hygiene is required by CCPA regardless.

**Fix:** Rewrite Privacy §3 as a "Third-Party Service Providers" table:

| Vendor | Purpose | Data shared |
|---|---|---|
| Stripe, Inc. | Payment processing | Name, email, billing address, card (direct to Stripe, we never see it) |
| Resend | Transactional email | Name, email |
| Supabase (AWS) | Database / auth | Email, hashed password, progress data |
| Mux | Video hosting | IP, user-agent, viewing analytics |
| Vercel | Hosting | IP, user-agent |
| Cloudflare | CDN / DNS | IP, user-agent |

Add a "Payment Data" section: "Your card number, CVV, and expiration are entered directly on Stripe's secure hosted checkout page. Healing Hearts never sees or stores your card details. Stripe retains transaction records per their [Privacy Policy](https://stripe.com/privacy)."

Add a "Retention" schedule: payment records retained 7 years per IRS Publication 583 and Utah Code §59-1-1406, account data until deletion request, marketing emails until unsubscribe.

Add "Your California Rights" section linking to a `/ccpa-request` email form.

**Effort:** small (draft + review).

### 1.6 🔴 CRITICAL — No age gate / "18 or older" check at checkout

**What:** Privacy §7 says services not directed to under-18s, but checkout never asks or verifies. Terms §2.1 doesn't require age affirmation.
**Why it matters:** COPPA (15 USC §6501) plus FTC enforcement on digital products sold to minors. Vulnerable-audience framing makes this worse — a minor buying a "couples healing course" with a parent's card is a refund + FTC complaint waiting to happen.
**Fix:** Add to `api/checkout.js` sessionParams:
```js
consent_collection: {
  terms_of_service: 'required',
},
custom_text: {
  terms_of_service_acceptance: {
    message: 'I am 18 or older and I agree to the [Terms](https://healingheartscourse.com/terms) and [Refund Policy](https://healingheartscourse.com/refund-policy).'
  }
}
```
**Effort:** trivial.

### 1.7 🟡 IMPORTANT — PCI DSS SAQ A posture not documented, ASV scans not configured

**What:** Using Stripe Checkout redirect qualifies you for **SAQ A** (the lightest self-assessment), but you are still the merchant of record and must complete the SAQ A annually and submit it to your acquirer (in this case Stripe handles this on your behalf for most processors — but you must attest). PCI DSS 4.0.1 effective April 2025 added script-integrity requirements for iframe/embedded forms (you use redirect so this doesn't hit you), but **ASV quarterly scans are still required** for SAQ A merchants ([PCI SSC FAQ 1588](https://www.pcisecuritystandards.org/faq/), [Davis Wright Tremaine analysis](https://www.dwt.com/blogs/privacy--security-law-blog/2025/03/pci-faqs-card-processing-ecommerce-merchants)).
**Why it matters:** Stripe requires all merchants to be PCI compliant. If you're ever audited and cannot produce a SAQ A, Stripe can freeze your account.
**Fix:**
1. Confirm you use only `stripe.checkout.sessions.create` + redirect (you do) — no Stripe Elements, no card fields on healingheartscourse.com. Grep for `stripe.elements` and `loadStripe` — none should appear.
2. Log into Stripe Dashboard → Settings → Compliance & Identity → complete the SAQ A questionnaire annually.
3. Run quarterly ASV scans — Stripe partners with [Security Metrics](https://www.securitymetrics.com/) free for Stripe merchants; enroll via Stripe Dashboard.
**Effort:** small (one-time setup, then 4x/year scan confirmation).

### 1.8 🟡 IMPORTANT — FTC "Click-to-Cancel" Rule preparation

**What:** The FTC Negative Option Rule ("Click-to-Cancel") was finalized October 2024 and applies to any recurring billing arrangement. Portions upheld / portions stayed by the 8th Circuit in July 2025, but the cancellation-simplicity requirements are effective.
**Why it matters:** When you launch the $12,997 installment plans via Stripe Billing (upcoming), this applies. Users must be able to cancel as easily as they subscribed. Pre-dispute arbitration clauses cannot be buried. California SB-313 ARL as amended by AB-2863 ([leginfo](https://leginfo.legislature.ca.gov/faces/billTextClient.xhtml?bill_id=202320240AB2863)) expanded scope July 1, 2025 to include any auto-renewing paid service.
**Fix:** Not applicable to current one-time checkout. Flag for Phase 3.5 (installments): plan on Stripe Customer Portal for self-serve cancel, plus a `/cancel` page that collects minimal info and triggers an email.
**Effort:** medium (when you build installments).

### 1.9 🟡 IMPORTANT — No cookie banner / GPC handling

**What:** Privacy §1 mentions cookies but no consent banner exists on the site. No Global Privacy Control (GPC) signal handling.
**Why it matters:** CCPA/CPRA require honoring GPC as an opt-out. Without a banner + GPC handler, a single CA resident complaint can trigger a $7,500 civil penalty per violation. GDPR requires opt-in consent for non-essential cookies.
**Fix:** Add a lightweight cookie banner (Cookiebot, Osano free tier, or a small in-house component) that defaults analytics off and respects `navigator.globalPrivacyControl`. Since you currently use minimal tracking (Vercel Analytics + GA?), this is mostly a disclosure + GPC listener.
**Effort:** small.

### 1.10 🟡 IMPORTANT — Accessibility (ADA/WCAG) for payment flow

**What:** Success page and checkout buttons have some accessible markup but no documented WCAG 2.1 AA audit.
**Why it matters:** ADA Title III website lawsuits are common for e-commerce. Accessible checkout is also a revenue issue.
**Fix:** Run axe-core on `/rescue-kit`, `/programs`, `/checkout/success`. Fix any color-contrast or aria-label issues. Already flagged in Forge Lite gates; extend to payment routes specifically.
**Effort:** small.

---

## 2. Missing Payment Functionality

### 2.1 🔴 CRITICAL — Webhook only handles `checkout.session.completed`

**What:** `api/webhooks/stripe.js` line 53 handles exactly one event. All other events return 200 with no processing.
**Missing events:**
- `charge.refunded` — no access revocation
- `charge.dispute.created` — no alert, no evidence flag
- `charge.dispute.closed` — no stage update
- `checkout.session.expired` — pending orders pile up in `orders` table forever
- `payment_intent.payment_failed` — no alert, no recovery email
- `customer.updated` — CRM name/email drift
- `invoice.payment_failed` (for future subscriptions) — not wired
- `invoice.payment_succeeded` (for future subscriptions) — not wired

**Why it matters:** When (not if) a refund is issued, the `orders.status` stays "completed," the customer still has portal access, and the `crm_contacts.stage` still says "customer." A disputed charge will surprise you days later in the Stripe Dashboard with no audit trail in your own DB.

**Fix:** Expand the event router:

```js
switch (event.type) {
  case 'checkout.session.completed':
    return handleCheckoutCompleted(event.data.object);
  case 'checkout.session.expired':
    return handleSessionExpired(event.data.object);
  case 'charge.refunded':
    return handleChargeRefunded(event.data.object);
  case 'charge.dispute.created':
    return handleDisputeCreated(event.data.object);
  case 'charge.dispute.closed':
    return handleDisputeClosed(event.data.object);
  case 'payment_intent.payment_failed':
    return handlePaymentFailed(event.data.object);
  default:
    return; // ignore
}
```

Handlers:
- **`handleChargeRefunded`**: look up order by `stripe_payment_intent`, set `status = 'refunded'`, revoke enrollment (`UPDATE enrollments SET status='refunded' WHERE stripe_payment_id=...`), mark CRM stage back to `lead`, send "refund processed" email.
- **`handleDisputeCreated`**: set `status = 'disputed'`, post Slack/email alert to Chase + Trisha, DO NOT revoke access yet (wait for outcome — dispute may go your way).
- **`handleDisputeClosed`**: if `reason` = 'won', no action. If lost, revoke access same as refunded.
- **`handleSessionExpired`**: delete or mark `status = 'failed'` on pending orders older than 24h.
- **`handlePaymentFailed`**: send a short recovery email ("your payment didn't go through — try again") with a new checkout link.

**Effort:** medium (4–6h).
**Schema:** add `'disputed'` to the `order_status` enum in a new migration.
**References:** [Stripe webhook events](https://docs.stripe.com/api/events/types).

### 2.2 🔴 CRITICAL — No idempotency keys on session creation

**What:** `api/checkout.js` calls `stripe.checkout.sessions.create(sessionParams)` without an `idempotencyKey` option. If the frontend retries (dodgy network, double-click), Stripe will create duplicate sessions.
**Why it matters:** Not catastrophic (only one will be paid) but bad hygiene — you will see duplicate `orders.pending` rows and Stripe support will ask about it during any audit. PCI DSS 4.0 indirectly cares about transaction integrity.
**Fix:**
```js
const idempotencyKey = crypto.randomUUID(); // or hash(email+slug+now-to-the-minute)
const session = await stripe.checkout.sessions.create(sessionParams, { idempotencyKey });
```
Or better: accept a client-generated key from the frontend via header.
**Effort:** trivial.
**Reference:** [Stripe idempotent requests](https://docs.stripe.com/api/idempotent_requests).

### 2.3 🟡 IMPORTANT — No handler for `customer.created` / `customer.updated`

**What:** `orders` table stores `contact_id` and `auth_user_id` but no `stripe_customer_id` on orders (the column exists on `crm_contacts` per migration 012 but is never populated).
**Why it matters:** Stripe's customer ID is the primary key for refunds, disputes, and future subscriptions. Without it on the order, reconciling Stripe Dashboard to your DB is manual detective work.
**Fix:**
1. In `handleCheckoutCompleted`, read `session.customer` and write it to `crm_contacts.stripe_customer_id` and `orders.stripe_customer_id` (new column).
2. In `api/checkout.js` POST, set `customer_creation: 'always'` on sessionParams so Stripe always creates a Customer object (not just a one-off payment).
3. Add webhook handler for `customer.updated` → upsert name/email into `crm_contacts`.
**Effort:** small.

### 2.4 🟡 IMPORTANT — No failed-payment recovery email

**What:** If a card is declined, Stripe shows an error on the Checkout page and the user bounces. No email, no retry nudge.
**Why it matters:** Failed-payment recovery is typically 15–25% of gross sales in e-commerce. For a $12,997 product, even one recovered sale/month is material.
**Fix:** Hook `payment_intent.payment_failed` → send a gentle "we noticed your payment didn't go through" email with a new checkout URL (reuse the slug + email). Keep it in Trisha's voice.
**Effort:** small (reuse email templates).

### 2.5 🟡 IMPORTANT — No email verification before granting access

**What:** Webhook grants enrollment as soon as `checkout.session.completed` fires, keyed to the email on the session. If a buyer typos `trishaa@gmail.com`, that typo'd address now owns the enrollment.
**Why it matters:** Support burden, not compliance. The signup trigger partially mitigates (user creates account with the typo'd email, gets linked). But if the real owner later creates an account with the correct email, they get nothing.
**Fix:** Accept this as by-design for the "buy first, onboard second" flow, but add a "can't find your purchase?" flow in Contact form that lets support look up by Stripe session ID or last-4 and manually re-link.
**Effort:** small.

### 2.6 🟢 NICE TO HAVE — No support for Apple Pay / Google Pay / Link

**What:** `api/checkout.js` line 114: `payment_method_types: ['card']`. This excludes Apple Pay, Google Pay, Link, Cash App Pay, Afterpay/Klarna, etc.
**Why it matters:** Mobile conversion lift from Apple Pay is 20–30% on mobile-heavy audiences. Afterpay/Klarna for the $12,997 is a conversion tool you're ignoring.
**Fix:** Remove `payment_method_types` entirely — Stripe Checkout will show whatever methods you've enabled in Dashboard (Settings → Payment methods). Enable Apple Pay, Google Pay, Link, Afterpay, Klarna, Affirm in Dashboard.
**Effort:** trivial.
**Reference:** [Stripe payment methods](https://docs.stripe.com/payments/payment-methods/overview).

---

## 3. Customer Experience Gaps

### 3.1 🔴 CRITICAL — No order history / receipts page

**What:** `Downloads.jsx` shows downloadable purchases but there is no "My Orders" page listing all past purchases, amounts, dates, and receipts.
**Why it matters:** Customers will ask "where's my receipt?" Support burden + refund disputes without proof the customer ever got confirmation.
**Fix:**
1. Create `src/portal/Orders.jsx` — queries `orders` + `products` where `auth_user_id = current user`.
2. Each row: product name, date, amount, status, "View receipt" button (links to Stripe's hosted receipt URL — available via `invoice.hosted_invoice_url` or by re-fetching the session and using `charges.data[0].receipt_url`).
3. Add to portal sidebar.
**Effort:** small-medium.

### 3.2 🔴 CRITICAL — No refund request flow

**What:** Terms §3.3 describes refund eligibility but there is no form, no email shortcut, no FAQ entry explaining "to request a refund, email hello@… with your order ID."
**Why it matters:** A customer in emotional distress who wants a refund and can't find how to request it will go straight to their bank → chargeback. Chargeback fees are $15–$25 and your chargeback rate is a metric Stripe monitors (>0.75% puts you in Early Warning).
**Fix:**
1. Add to `src/pages/Refund.jsx`: "To request a refund, email refunds@healingheartscourse.com with [order ID / email used / reason]. Refunds are processed within 5–7 business days. For installment plans, please see the cancellation terms in our Terms §3.3."
2. Create `refunds@` alias → forwards to Makayla.
3. Add a "Request a refund" link from the `Orders.jsx` page per-order.
4. Add a refund SOP doc for Makayla: eligibility check → Stripe Dashboard refund → webhook handles revocation automatically.
**Effort:** small.

### 3.3 🔴 CRITICAL — Account-recovery flow breaks if customer loses email access

**What:** Supabase auth uses email + password, with magic links as the reset path. If a customer buys the course, never creates an account, then loses access to that email (common after a breakup — and this is a couples course), they cannot access anything they paid for.
**Why it matters:** Audience-specific risk — couples in crisis + email access via shared accounts. Real scenario.
**Fix:**
1. Contact form "I bought something but can't access my account" workflow for Makayla: verify Stripe order by last-4 + name + ZIP, manually update `crm_contacts.email` to new address, manually trigger password reset to new address.
2. Document as an SOP.
3. Longer-term: store Stripe customer ID + payment method fingerprint on orders so support can verify without seeing card data.
**Effort:** small (SOP) + medium (secondary-email account recovery).

### 3.4 🟡 IMPORTANT — Success page is fragile if webhook hasn't fired yet

**What:** `CheckoutSuccess.jsx` calls `verifyCheckoutSession(sessionId)` → `api/checkout` GET → `stripe.checkout.sessions.retrieve`. This works because Stripe returns the session object synchronously. But the success page never waits for the webhook to finish writing to Supabase, so if the user lands and clicks "Go to portal" immediately, the enrollment may not exist yet.
**Why it matters:** Race condition. Rare but visible. The user gets "you don't have access to this course" on their first click.
**Fix:** On success page, after verifying the session, poll `GET /api/orders?session_id=...` (new endpoint) for up to 10s. If still pending after 10s, show a gentler "Your purchase is still processing. You'll receive a confirmation email shortly" state.
**Effort:** small.

### 3.5 🟡 IMPORTANT — Stripe automatic receipts not confirmed enabled

**What:** You mentioned enabling Stripe automatic email receipts but it's not confirmed in code/config. Even if enabled, Stripe's default receipt template is generic and doesn't include your branding.
**Why it matters:** Customers expect a receipt within seconds. Your purchase confirmation email is warm but not a legal receipt (no amount, no tax, no order number).
**Fix:**
1. Verify in Stripe Dashboard → Settings → Emails → "Successful payments" receipt is ON.
2. Customize the receipt branding (logo, colors, footer text).
3. Update `purchase-confirmation.js` to include: order number (last-8 of session ID), amount, date, "A detailed receipt has been sent separately from Stripe."
4. Even better: attach a PDF receipt (Stripe doesn't generate PDFs for one-time payments — but you can link to the hosted receipt URL from `charge.receipt_url`).
**Effort:** trivial (Stripe config) + small (email template update).

### 3.6 🟡 IMPORTANT — No payment FAQ

**What:** `src/pages/FAQ.jsx` exists but (per common patterns) likely has program questions, not payment/checkout questions.
**Why it matters:** Top FAQ questions for digital course buyers: "What cards do you accept?" "Is my info secure?" "Can I pay in installments?" "Do you offer refunds?" "Can I buy for a friend?" Answering these on the page reduces support tickets.
**Fix:** Add a "Payments & Refunds" section to FAQ.jsx with 8–10 Q&As.
**Effort:** trivial.

### 3.7 🟢 NICE TO HAVE — No "contact support" from inside checkout flow

**What:** If Stripe Checkout fails mid-payment, there's no visible support contact from the Stripe page (Stripe shows your support email only if you've set it).
**Fix:** Stripe Dashboard → Settings → Public details → set Support email + phone. These appear on receipts and the Stripe Checkout page.
**Effort:** trivial.

---

## 4. Operational / Ops Gaps

### 4.1 🔴 CRITICAL — No alerting on payment failures, disputes, or webhook errors

**What:** Logs go to Vercel but nothing pages a human. A dispute could sit in Stripe Dashboard for 7 days before anyone notices — and disputes have a response deadline.
**Why it matters:** Missed dispute deadline = automatic loss + chargeback fee + dispute rate hit. Stripe Radar doesn't save you here.
**Fix:**
1. In the new `handleDisputeCreated` webhook handler, send a Resend email to `alerts@healingheartscourse.com` + a phedris notification (Chase's phedris server already handles `send_notification`). Subject: "🚨 Stripe dispute opened — response due {dueBy}".
2. In `handlePaymentFailed`, send a lower-priority alert.
3. Enable Stripe Dashboard → Notifications → email alerts for disputes, refund requests, and unusual activity → Chase + Trisha.
**Effort:** small.

### 4.2 🔴 CRITICAL — Webhook failure / loss recovery

**What:** If `api/webhooks/stripe.js` throws a 500, Stripe retries for 3 days then gives up. After that, the event is lost. There is no reconciliation job that sweeps Stripe for missed events.
**Why it matters:** A customer's enrollment could be silently dropped if your Supabase is down during the retry window.
**Fix:**
1. Add a nightly cron (Vercel crons, similar to `webinar-cron`) that calls `stripe.checkout.sessions.list({ limit: 100, created: { gte: now-48h } })`, filters to `payment_status === 'paid'`, and cross-references to `orders` table. Any Stripe session with no completed order → replay the handler.
2. Already at 2/2 cron limit per memory — may need to consolidate or upgrade Vercel plan.
**Effort:** small.

### 4.3 🔴 CRITICAL — Stripe Radar rules not configured

**What:** Default Radar rules are enabled by Stripe, but there's no custom rule set for your business.
**Why it matters:** Vulnerable-audience scams (fake refund requests, stolen cards used to "buy" the course and resell access) are a thing. For a $12,997 product, fraud economics favor attackers.
**Fix:** In Stripe Dashboard → Radar → Rules:
1. **Block if** `:card_country: != :ip_country:` for the full-course product (SKU-level rule via metadata).
2. **Review if** amount > $500 and card is prepaid/anonymous.
3. **Block if** 3+ failed attempts from same IP in 1 hour.
4. **Review if** email domain in [disposable email list] (Radar has a built-in list).
5. Enable 3D Secure for amounts > $100.
**Effort:** small.

### 4.4 🟡 IMPORTANT — No bookkeeping export configured

**What:** No QuickBooks/Xero integration, no CSV export pipeline, no monthly close process.
**Why it matters:** End of Q1 2027 (Jan 2027 filing for Q4 2026), Trisha will need a P&L. Stripe Dashboard's CSV is fine for now, but it doesn't include tax breakdown, doesn't reconcile against refunds automatically, and has no category tagging.
**Fix (near-term):** Stripe Dashboard → Reports → Financial Reports → schedule monthly "Balance summary" + "Payouts" email to bookkeeper. Use Stripe Tax for tax reports.
**Fix (medium-term):** Stripe's QuickBooks Online integration (native, free) or Xero's Stripe feed.
**Effort:** small.

### 4.5 🟡 IMPORTANT — No dashboard for conversion / chargeback metrics

**What:** `AdminPanel.jsx` exists but no payment metrics are surfaced.
**Why it matters:** Conversion rate, AOV, failed-payment rate, refund rate, dispute rate are the 5 numbers that tell you if the payment system is healthy.
**Fix:** Add a "Payments" tab to AdminPanel.jsx with queries on `orders` table:
- Conversion rate: count(completed) / count(all orders created in window)
- Avg order value: avg(amount_cents) / 100
- Failed rate: count(failed) / count(all)
- Refund rate: count(refunded) / count(completed)
- 7-day and 30-day rolling windows
**Effort:** small.

### 4.6 🟡 IMPORTANT — Dispute response workflow not documented

**What:** When a chargeback comes in, what do you do? Stripe gives you 7 days to submit evidence. No SOP exists.
**Fix:** Write `docs/sops/stripe-dispute-response.md`:
1. Alert fires → assigned to Chase within 24h
2. Collect evidence: order confirmation email, access logs (portal login history), Terms acceptance timestamp, refund policy, any coaching call records
3. Submit via Stripe Dashboard → Dispute → Evidence
4. Track outcomes in a `disputes` log (new migration or CSV)
**Effort:** small.

### 4.7 🟢 NICE TO HAVE — No webhook event logging

**What:** Webhook events are logged only to Vercel logs (30-day retention on free/pro).
**Fix:** Add a `webhook_events` table, insert every received event (id, type, processed_at, error). Gives you a replay log + audit trail.
**Effort:** small.

---

## 5. Security Best Practices

### 5.1 🔴 CRITICAL — No rate limiting on /api/checkout

**What:** `api/checkout.js` POST can be called unlimited times. Each call creates a Stripe session (API call + row in `orders`). An attacker could call it 10,000x in a minute.
**Why it matters:** DoS risk on Stripe API quota (Stripe has rate limits, but hitting them affects legit customers), `orders` table pollution, Vercel function invocation costs, potential cost explosion if you hit 100M Vercel invocations.
**Fix:**
1. Add a simple in-memory rate limiter (not reliable across serverless cold starts) OR
2. Use Upstash Redis (free tier, 10k commands/day) + `@upstash/ratelimit` — 10 requests per IP per 10 minutes.
3. Add CAPTCHA (Cloudflare Turnstile — free, already Cloudflare customer) on the client-side button before calling checkout.
**Effort:** small.

### 5.2 🟡 IMPORTANT — API keys rotation plan absent

**What:** No documented procedure for rotating `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY` if compromised.
**Fix:** Write `docs/sops/key-rotation.md`:
1. Stripe: Dashboard → Developers → API keys → Create new restricted key → update Vercel env var → redeploy → revoke old key. Rolling webhook secret: create new endpoint with new secret, update env, verify both working, delete old endpoint.
2. Supabase service role: Dashboard → Settings → API → Reset (invalidates existing key). Update Vercel env var. Note: breaks all in-flight requests.
3. Test in a preview deployment first.
**Effort:** trivial (SOP only).

### 5.3 🟡 IMPORTANT — auth.users query pattern is fragile

**What:** `webhooks/stripe.js` lines 158–174 first tries `.from('auth.users')` (which doesn't work via PostgREST) and falls back to `supabaseAdmin.auth.admin.listUsers()` which lists ALL users and filters client-side. This doesn't scale past ~1000 users.
**Why it matters:** Performance degrades linearly with user count. Also a minor info-disclosure risk if logs ever leak (the full user list is briefly in memory).
**Fix:** Replace with `supabaseAdmin.auth.admin.getUserByEmail?`... actually Supabase doesn't expose that directly. Best path: create a database function `get_auth_user_id_by_email(email text)` as SECURITY DEFINER that returns just the ID. Call via `.rpc('get_auth_user_id_by_email', { email })`.
**Effort:** small.

### 5.4 🟡 IMPORTANT — Open redirect partially mitigated but incomplete

**What:** `api/checkout.js` validates `cancel_path` starts with `/` and not `//` — good. But `success_url` is hardcoded to `SITE_URL`, which is correct.
**Why it matters:** Current mitigation is adequate. Flag for awareness.
**Fix:** Add a URL-allowlist check: `new URL(cancel_path, SITE_URL).origin === SITE_URL`. Belt-and-suspenders.
**Effort:** trivial.

### 5.5 🟡 IMPORTANT — Sensitive data in logs

**What:** `console.log('[webhook] Processed checkout.session.completed:', { session, email, product, userFound })` — logs email in plaintext. Vercel logs are accessible to anyone with Vercel team access.
**Why it matters:** CCPA/GDPR — emails are PII. Log retention beyond business need is a risk.
**Fix:** Redact or hash emails in logs: `email: email.replace(/(.{2}).+(@.+)/, '$1***$2')`. Or remove from production logs entirely and log only session ID.
**Effort:** trivial.

### 5.6 🟡 IMPORTANT — Data retention policy for payment records

**What:** No documented retention schedule. Orders and crm_contacts grow forever.
**Fix:** Document in Privacy policy + actual SOP:
- Transaction records: 7 years (IRS / Utah State Tax Commission)
- Dispute evidence: 7 years
- Marketing email data: until unsubscribe + 30 days
- Account data: until deletion request + 30 days
- Add a quarterly cleanup job that hard-deletes `crm_contacts` where `stage = 'visitor'` and `last_activity_at < now - 2 years` AND no orders.
**Effort:** small.

### 5.7 🟢 NICE TO HAVE — Stripe restricted keys instead of full secret

**What:** `STRIPE_SECRET_KEY` is the full-access secret. The checkout endpoint only needs `checkout.sessions:write` + `checkout.sessions:read`. The webhook only needs `events:read`.
**Fix:** Create two Stripe restricted keys in Dashboard (checkout-only and webhook-only), use them instead of the full secret. If compromised, damage is limited.
**Effort:** trivial.
**Reference:** [Stripe restricted keys](https://docs.stripe.com/keys#limit-access).

### 5.8 🟢 NICE TO HAVE — CSP headers for payment pages

**What:** `vercel.json` sets X-Frame-Options, HSTS, Referrer-Policy but no Content-Security-Policy. Recent PCI DSS 4.0.1 script-integrity requirements don't apply (you use redirect, not iframe), but CSP is still best practice.
**Fix:** Add CSP header allowing Stripe, Supabase, Resend, Mux, Vercel Analytics. Test carefully — CSP breaks things.
**Effort:** medium.

---

## 6. Healing Hearts-Specific Concerns

### 6.1 🔴 CRITICAL — No cooling-off period for vulnerable audience

**What:** Terms §3.3 gives zero-day refund window on downloads and allows up to $5,000 discretionary refund on pay-in-full — but the audience is "couples in emotional distress." Impulse buys at a webinar while crying are a real pattern.
**Why it matters:** Beyond legal risk, this is a values alignment question: a faith-based healing business with the brand voice "I am cheering for you" needs a refund policy that matches the voice. Also, many US states have 3-day cooling-off rules for in-person sales ([FTC Cooling-Off Rule, 16 CFR §429](https://www.ftc.gov/business-guidance/resources/complying-ftcs-cooling-rule)) — may apply to expo sales.
**Fix:** Add a **14-day unconditional satisfaction guarantee** on the Full Course (the industry norm for high-ticket courses): "If within 14 days of purchase you've tried Module 1 and feel this isn't right for you, email us and we'll refund your pay-in-full payment. For installment plans, the first payment is refundable within 14 days; subsequent payments are committed."
- Rescue Kit / Card Pack: 7-day refund, no questions asked.
- Expo sales: honor the FTC Cooling-Off Rule (3 days, written notice).
**Why this is a feature:** Lowers friction on the sale, reduces chargebacks, signals confidence in the product, matches brand voice.
**Effort:** small (Terms update + SOP).

### 6.2 🟡 IMPORTANT — Faith-compatible payment providers

**What:** Stripe is not a faith-based processor. Some Christian businesses prefer processors like [FaithPays](https://faithpays.org/) or [Nickelson](https://www.nicholsongroup.net/) that explicitly don't process transactions they find objectionable.
**Why it matters:** Minor brand alignment consideration. Stripe has (rarely) debanked businesses for faith-adjacent content. Not a real risk for couples coaching, but worth flagging.
**Fix:** Stay on Stripe for now (best developer experience, lowest rates). Document in a disaster-recovery SOP: "If Stripe ever freezes our account, fallback to PayPal Business + Square as emergency processors — takes 24–48h to reroute traffic."
**Effort:** trivial (SOP).

### 6.3 🟡 IMPORTANT — Prepare payment plan infrastructure now

**What:** Per Terms §3.2, three plans are listed but none wired. When installments launch, you need Stripe Billing (not one-off Checkout).
**Fix (do now, even before building):**
1. Add a `subscriptions` table migration (or reuse `orders` with a `parent_order_id` for installment plans).
2. Create the 3 Stripe Products in Dashboard now with draft Prices:
   - `full-course-pif` — one-time $11,997
   - `full-course-monthly-down` — one-time $4,997 (down payment)
   - `full-course-monthly-installment` — recurring $1,000 × 8 months
   - `full-course-quarterly-down` — one-time $4,997
   - `full-course-quarterly-installment` — recurring $2,667 × 3 quarters
3. When ready, add Stripe Billing subscription events to the webhook: `customer.subscription.created`, `invoice.paid`, `invoice.payment_failed`, `customer.subscription.deleted`.
4. For the close-process payment links, use Stripe Payment Links (created per-customer by Makayla) pointing at the right price ID.
**Effort:** medium (4–8h for infra, full build is large when done).

### 6.4 🟢 NICE TO HAVE — Gift purchase flow

**What:** No "buy for a friend" option. A well-meaning family member who wants to gift the course to a couple in crisis has no path.
**Why it matters:** Gifts are 5–15% of high-ticket course revenue in Q4. Also a faith-community share pattern.
**Fix (later, Phase 3.5):**
1. Add `gift_email` field to checkout: buyer enters their own email as billing + recipient email as the access grant.
2. Webhook sends the confirmation to the recipient, CC's the gifter a "your gift was delivered" email.
3. Schema: add `gifted_to_email` column on `orders`.
**Effort:** medium.

### 6.5 🟢 NICE TO HAVE — International currency support

**What:** `api/checkout.js` hardcodes `currency: 'usd'` in the order insert. Stripe Checkout will still process international cards, but the customer sees USD pricing.
**Why it matters:** Couples coaching has international demand (Canada, UK, AU specifically). USD-only caps conversion.
**Fix:**
1. Enable Adaptive Pricing in Stripe Checkout (auto-converts to local currency based on IP).
2. OR: create multi-currency Prices in Stripe for the top 3 markets (CAD, GBP, AUD) and route based on Cloudflare's `CF-IPCountry` header.
3. Tax implications: selling to EU → VAT MOSS registration or use a merchant of record like Paddle/LemonSqueezy.
**Effort:** medium (Stripe config) to large (tax + MoR consideration).

### 6.6 🟢 NICE TO HAVE — Partner-pair enrollment

**What:** Course is sold to "couples" but enrollment is per-user. Partner A buys, creates account. How does Partner B get access?
**Current state:** Only Partner A's email has portal access. Partner B would need to log in using Partner A's account — violating Terms §4.4 if interpreted strictly ("sharing login credentials"), but Terms §4.3 allows "use within your immediate relationship."
**Fix:** Add a "Invite your partner" button in the portal that creates a linked sub-account (same enrollment, separate login + progress). Schema: add `partner_user_id` to enrollments or create a `couple_memberships` table.
**Effort:** medium.

### 6.7 🟢 NICE TO HAVE — In-portal support contact

**What:** No "Contact Support" button from inside the portal. A user stuck needs to leave the portal to find `/contact`.
**Fix:** Persistent "Need help?" widget (Crisp, Intercom, or a simple mailto). For faith-based + vulnerable audience, a human email (hello@) is better than a chatbot.
**Effort:** trivial.

---

## Punch List (sorted)

### Do before promoting widely (Week 1)
1. 🔴 1.1 — Remove or footnote installment options from Terms
2. 🔴 1.2 — Fix LLC name consistency in Terms + Privacy
3. 🔴 1.3 — Create Refund policy page + link from checkout
4. 🔴 1.4 — Enable Stripe Tax + register for Utah sales tax
5. 🔴 1.5 — Rewrite Privacy §3 with named vendors + CCPA disclosures
6. 🔴 1.6 — Add 18+ age affirmation on checkout
7. 🔴 2.1 — Expand webhook to handle refunds + disputes + failures
8. 🔴 2.2 — Add idempotency keys to session creation
9. 🔴 4.1 — Wire dispute alerts to Chase + Trisha
10. 🔴 4.2 — Nightly webhook reconciliation cron
11. 🔴 4.3 — Configure Stripe Radar rules
12. 🔴 5.1 — Rate limit /api/checkout
13. 🔴 6.1 — 14-day satisfaction guarantee on Full Course
14. 🔴 3.1 — Order history page in portal
15. 🔴 3.2 — Refund request flow + SOP
16. 🔴 3.3 — Account-recovery SOP for lost email

### Do within 2–4 weeks
- 🟡 1.7 — Complete SAQ A + enroll in ASV scans
- 🟡 1.9 — Cookie banner + GPC listener
- 🟡 1.10 — WCAG audit of checkout routes
- 🟡 2.3 — Store stripe_customer_id on orders + handle customer.updated
- 🟡 2.4 — Failed-payment recovery email
- 🟡 2.5 — Support workflow for typo'd emails
- 🟡 3.4 — Success page wait-for-webhook pattern
- 🟡 3.5 — Confirm Stripe auto receipts + brand them
- 🟡 3.6 — Add payment FAQ section
- 🟡 4.4 — Bookkeeping export cadence
- 🟡 4.5 — Admin dashboard payment metrics
- 🟡 4.6 — Dispute response SOP
- 🟡 5.2 — API key rotation SOP
- 🟡 5.3 — Replace auth.users listUsers() with RPC
- 🟡 5.4 — Tighten cancel_path allowlist
- 🟡 5.5 — Redact emails from logs
- 🟡 5.6 — Document data retention policy
- 🟡 6.2 — Disaster-recovery fallback processor SOP
- 🟡 6.3 — Stub payment plan infrastructure

### Defer to Phase 3.5+
- 🟢 1.8 — FTC Click-to-Cancel (when installments launch)
- 🟢 2.6 — Enable Apple/Google Pay, Link, Afterpay, Klarna
- 🟢 3.7 — Stripe Dashboard public support details
- 🟢 4.7 — Webhook event log table
- 🟢 5.7 — Restricted Stripe keys
- 🟢 5.8 — CSP headers
- 🟢 6.4 — Gift purchase flow
- 🟢 6.5 — International currency
- 🟢 6.6 — Partner-pair enrollment
- 🟢 6.7 — In-portal support widget

---

## Primary Sources Cited

- [Stripe Services Agreement — Services Terms](https://stripe.com/legal/ssa-services-terms)
- [Stripe Tax Documentation](https://docs.stripe.com/tax)
- [Stripe Checkout Custom Policies](https://docs.stripe.com/payments/checkout/customization/policies)
- [Stripe Webhook Event Types](https://docs.stripe.com/api/events/types)
- [Stripe Idempotent Requests](https://docs.stripe.com/api/idempotent_requests)
- [Stripe Integration Security Guide](https://docs.stripe.com/security/guide)
- [Stripe Restricted API Keys](https://docs.stripe.com/keys#limit-access)
- [PCI SSC FAQ 1588 — SAQ A eligibility for e-commerce](https://www.pcisecuritystandards.org/faq/)
- [Davis Wright Tremaine — PCI FAQs for E-commerce Merchants (2025)](https://www.dwt.com/blogs/privacy--security-law-blog/2025/03/pci-faqs-card-processing-ecommerce-merchants)
- [Utah Publication 64 — Sales Tax Information for Computer Service Providers](https://tax.utah.gov/forms/pubs/pub-64.pdf)
- [Utah Code §59-12-107 — Economic Nexus](https://le.utah.gov/xcode/Title59/Chapter12/59-12-S107.html)
- [FTC Mail Order Rule, 16 CFR §435](https://www.ftc.gov/legal-library/browse/rules/mail-internet-or-telephone-order-merchandise-rule)
- [FTC Cooling-Off Rule, 16 CFR §429](https://www.ftc.gov/business-guidance/resources/complying-ftcs-cooling-rule)
- [California AB-2863 (ARL amendments)](https://leginfo.legislature.ca.gov/faces/billTextClient.xhtml?bill_id=202320240AB2863)
- [CCPA (California Civil Code §1798.100 et seq.)](https://oag.ca.gov/privacy/ccpa)
- [Utah Consumer Privacy Act (UCPA)](https://le.utah.gov/xcode/Title13/Chapter61/13-61.html)
- [Stripe PCI Compliance Guide](https://stripe.com/guides/pci-compliance)

---

*End of audit.*
