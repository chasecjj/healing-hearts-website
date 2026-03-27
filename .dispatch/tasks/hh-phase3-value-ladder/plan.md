# Phase 3 — Value Ladder: Stripe Checkout + Onboarding + CRM + Pixels

## Context
Phase 3 adds monetization to the Healing Hearts customer journey:
- Stripe checkout for the $39 Conflict Rescue Kit
- Onboarding email sequence for new purchasers
- CRM pipeline tracking in Supabase
- Retargeting pixel infrastructure (Meta + Google)

## Constraints
- Vercel Hobby: max 12 serverless functions (currently 6), max 2 cron jobs (currently 2 — NO new crons)
- Email templates go in `api/_emails/` (underscore prefix = not deployed as functions)
- Stripe keys are placeholders until Chase adds the EIN
- Supabase project ID: `qleojrlqnbiutyhfnqgb`

## Checklist

### 1. Supabase Schema — CRM Pipeline + Orders
- [x] 1a. Create migration `012_crm_pipeline.sql`: `crm_contacts` + `orders` + `rescue_kit_drip` tables with enums, RLS, indexes, updated_at triggers
- [x] 1b. Apply migration via Supabase MCP — success

### 2. Install Stripe SDK
- [x] 2a. `npm install stripe` — added Stripe Node SDK

### 3. Stripe Checkout Serverless Function
- [ ] 3a. Create `api/checkout.js` — POST handler that creates a Stripe Checkout Session for the Rescue Kit ($39), redirects to Stripe-hosted payment page, stores pending order in `orders` table
- [ ] 3b. Wire the RescueKit.jsx CTA button to call `/api/checkout`

### 4. Stripe Webhook Handler
- [ ] 4a. Create `api/stripe-webhook.js` — handles `checkout.session.completed` event, updates order status, upserts crm_contact, creates enrollment record, triggers welcome email via Resend
- [ ] 4b. Add webhook signature verification using `STRIPE_WEBHOOK_SECRET` env var

### 5. Onboarding Email Sequence
- [ ] 5a. Create `api/_emails/rescue-kit-welcome.js` — immediate welcome email with kit access instructions
- [ ] 5b. Create `api/_emails/rescue-kit-day3.js` — Day 3 check-in email (how's it going?)
- [ ] 5c. Create `api/_emails/rescue-kit-day7.js` — Day 7 progress email + upsell to Journey Program
- [ ] 5d. Add onboarding drip logic to existing `api/cron/spark-drip.js` (reuse cron, add rescue-kit drip table scan) — NO new cron allowed

### 6. Retargeting Pixel Infrastructure
- [ ] 6a. Create `src/lib/pixels.js` — pixel helper module with `initPixels()`, `trackPageView()`, `trackPurchase()`, `trackLead()` functions (placeholder pixel IDs)
- [ ] 6b. Add Meta Pixel base code + Google gtag.js snippet to `index.html` (with placeholder IDs)
- [ ] 6c. Call `trackPurchase()` on the checkout success page and `trackLead()` on form submissions

### 7. Checkout Success Page
- [ ] 7a. Create `src/pages/CheckoutSuccess.jsx` — thank you page with order confirmation, next steps, pixel fire
- [ ] 7b. Wire route in `src/App.jsx` at `/checkout/success`

### 8. Integration + Build Verification
- [ ] 8a. Verify `npm run build` passes cleanly
- [ ] 8b. Verify serverless function count ≤ 12 (should be 8: 4 existing + checkout + stripe-webhook + 2 crons)
- [ ] 8c. Write completion summary to `.dispatch/tasks/hh-phase3-value-ladder/output.md`
