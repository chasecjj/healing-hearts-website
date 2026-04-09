# Stripe Terminal — Session Handoff

**Date:** 2026-04-09
**Target session:** Week of April 14-16 (before expo April 17-18)
**Priority:** High -- enables in-person card payments at the booth
**Prerequisite:** Stripe payment portal spec must be implemented first (webhook + products table)

---

## Why This Matters

Payment Links + QR codes work for the expo, but some customers will want to tap
their card and go -- especially at a busy health expo booth. A physical card reader
removes the friction of pulling out a phone, scanning a QR code, and typing in
payment details. It's the difference between a 15-second transaction and a 2-minute one.

---

## What to Build

### Hardware
- **Stripe Reader M2** (~$59) or **BBPOS WisePOS E** (~$249)
  - M2: Bluetooth, pairs with a phone/tablet app. Good for booth use.
  - WisePOS E: Standalone with screen. More polished but pricier.
- Chase to order the reader ASAP -- shipping may take 2-3 days.
- Task already exists in vault: "Get a Stripe card reader for $27 product sales at expo"

### Software Options

**Option A: Stripe Terminal JS SDK (browser-based)**
- Run a checkout page on a tablet/laptop at the booth
- Connect to the card reader via browser (Internet connection required)
- Uses the same products table and webhook pipeline from the payment portal spec
- Requires a new Vercel function: `/api/terminal/connection-token.js` (slot 11/12)
- Pros: No mobile app needed, runs in any browser
- Cons: Needs stable internet at the booth, uses a Vercel function slot

**Option B: Stripe Terminal mobile SDK (React Native)**
- Build a minimal POS app for Chase's phone
- Pairs with M2 reader via Bluetooth
- Phase 4 is already planned as React Native -- could be a foundation piece
- Pros: Works offline (processes when back online), no Vercel function needed
- Cons: Significantly more build time, needs React Native setup

**Recommendation:** Option A for the expo (fastest), Option B later if we build the
React Native app (Phase 4).

### Integration Points

The Terminal integration shares the same backend as online checkout:
- Same `products` table for product catalog
- Same webhook (`checkout.session.completed` or `payment_intent.succeeded` for Terminal)
- Same `orders` table for recording transactions
- Same `crm_contacts` for customer tracking
- Same `access_grants` logic for granting access

The only new pieces:
1. `/api/terminal/connection-token.js` -- Stripe Terminal requires a server-side
   connection token endpoint. The reader calls this to authenticate.
2. A simple checkout UI for the booth operator (staff picks product, customer taps card)
3. Email capture at the booth -- staff enters customer email so the purchase can be linked

### Booth Operator Flow

```
Staff selects product on tablet (e.g., "Rescue Kit - $39")
    -> System creates a PaymentIntent via Stripe Terminal SDK
    -> Reader prompts customer to tap/insert card
    -> Payment processes
    -> Staff asks for email: "Where should we send your access?"
    -> Email entered -> crm_contact + order created
    -> Customer gets a receipt email with account creation link
```

---

## Decisions for the Session

1. **Which reader to order?** M2 (Bluetooth, $59) vs WisePOS E (standalone, $249)
2. **Option A or B?** Browser-based vs mobile app
3. **Offline handling?** If internet drops at the booth, do we queue payments or fall back to QR codes?
4. **Receipt delivery?** Email receipt, text receipt, or printed receipt?
5. **Who operates?** Does the booth need a dedicated checkout person, or can anyone on the team process?

---

## Vercel Function Impact

If Option A: uses slot 11 of 12 (connection-token endpoint).
Leaves 1 slot for future (Approach B customer portal session endpoint).

---

## Pre-Session Checklist

- [ ] Stripe payment portal spec implemented (products table, webhook, checkout flow)
- [ ] Card reader ordered and received
- [ ] Stripe Terminal enabled in Stripe Dashboard (Settings -> Terminal)
- [ ] Test reader paired and connected in sandbox mode
- [ ] Internet connectivity confirmed at expo venue (or hotspot backup plan)
