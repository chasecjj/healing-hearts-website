# Stripe Payment Portal — Design Spec

**Date:** 2026-04-09
**Author:** Chase + Claude
**Status:** Approved
**Approach:** A (Minimal Viable Payment) — Stripe Checkout redirect + webhook + email-matching enrollment
**Future:** Approach B (Customer Portal, subscriptions, admin dashboard) planned as next evolution

---

## Overview

Connect Stripe to the Healing Hearts website with a complete buy-to-access flow. Users can purchase products (Rescue Kit, Card Pack, future items) via Stripe-hosted Checkout, then create an account to access their purchases in the portal. No account required before purchase — "buy first, onboard second."

The full course ($12,997) is not publicly listed. Payment links are generated per-customer during the close process and sent privately.

---

## Architecture

```
User clicks "Buy" on product page
        |
Frontend POST /api/checkout { slug, email?, source? }
        |
checkout.js:
  1. Look up product in `products` table by slug
  2. Verify is_active = true
  3. Create Stripe Checkout Session (stripe_price_id)
  4. Upsert crm_contacts + insert pending order
  5. Return { url: session.url }
        |
Redirect to Stripe-hosted Checkout
        |
User pays on Stripe
        |
Two things happen in parallel:
  A) Stripe redirects user to /checkout/success?session_id=cs_...
  B) Stripe fires webhook to /api/webhooks/stripe
        |
Webhook (source of truth):
  1. Verify signature
  2. Update order status -> 'completed'
  3. Update crm_contact stage -> 'customer'
  4. Read product access_grants
  5. If auth user exists with this email -> create enrollment
  6. If no auth user -> enrollment created on future signup (DB trigger)
        |
Success page:
  1. GET /api/checkout?session_id=cs_... (verify session with Stripe)
  2. If logged in -> "Go to your portal"
  3. If not logged in -> "Create account to access" (email pre-filled)
```

---

## Component 1: Products Table

New Supabase migration. Source of truth for what can be purchased and what it unlocks.

```sql
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  price_cents integer NOT NULL,
  stripe_price_id text NOT NULL,
  product_type text NOT NULL DEFAULT 'one-time'
    CHECK (product_type IN ('one-time', 'subscription')),
  access_grants jsonb NOT NULL DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  is_public boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_active ON products(is_active) WHERE is_active = true;
```

**RLS Policies:**
- Public read: `is_active = true AND is_public = true` (anonymous + authenticated)
- Service role: full access (for webhook and admin operations)
- Admin read: all products regardless of is_active/is_public

**access_grants schema:**

```json
// One-time download (Rescue Kit, Card Pack)
{ "type": "download", "download_slug": "rescue-kit" }

// Full course enrollment
{ "type": "enrollment", "course_id": "<course-uuid-from-courses-table>" }
```

Only two types for now. If we later need per-lesson gating (e.g. buy a single module), we add a `lessons` type then.

**Adding a new product (future process):**
1. Create Product + Price in Stripe Dashboard
2. Insert one row in `products` table with the `stripe_price_id`
3. Build/update the marketing page with a "Buy" button that calls `/api/checkout`

No code changes, no redeployment needed for the backend.

**Initial seed products (created via Stripe API + migration):**

| Product | Slug | Price | Type | access_grants | Public |
|---------|------|-------|------|---------------|--------|
| Conflict Rescue Kit | rescue-kit | $39 | one-time | download | Yes |
| Card Pack | card-pack | $35 | one-time | download | Yes |
| Full Course | full-course | $12,997 | one-time | enrollment | No |

---

## Component 2: Checkout Endpoint (Modified)

**File:** `/api/checkout.js` (existing, upgraded)
**Methods:** POST (create session) + GET (verify session)

### POST /api/checkout — Create Checkout Session

Changes from current implementation:
- Remove hardcoded `PRODUCTS` object
- Look up product by `slug` from `products` table
- Use `stripe_price_id` from the product record instead of `price_data`
- Accept optional `source` param for UTM/attribution tracking
- Enable `allow_promotion_codes: true` on all sessions
- Set `cancel_url` dynamically based on the product's page (passed from frontend)

**Request:**
```json
{
  "slug": "rescue-kit",
  "email": "user@example.com",
  "source": "expo-booth",
  "cancel_path": "/rescue-kit"
}
```

**Response:**
```json
{ "url": "https://checkout.stripe.com/c/pay/cs_test_..." }
```

**Metadata stored on the Stripe session:**
```json
{
  "product_slug": "rescue-kit",
  "source": "expo-booth"
}
```

### GET /api/checkout?session_id=cs_test_... — Verify Session

Used by the success page to verify the session and retrieve customer info without exposing the secret key to the frontend.

**Response:**
```json
{
  "status": "complete",
  "customer_email": "user@example.com",
  "product_slug": "rescue-kit",
  "product_name": "Conflict Rescue Kit"
}
```

Returns 404 if session doesn't exist or hasn't completed.

---

## Component 3: Webhook Handler (New)

**File:** `/api/webhooks/stripe.js` (new — Vercel function slot 10/12)
**Listens for:** `checkout.session.completed`

### Flow

```
1. Read raw body (req.rawBody for Vercel)
2. Verify Stripe signature using STRIPE_WEBHOOK_SECRET
3. If invalid -> 400
4. Extract: session.id, customer_email, payment_intent, metadata.product_slug
5. Idempotency check: SELECT from orders WHERE stripe_session_id = session.id AND status = 'completed'
   - If exists -> return 200 (already processed)
6. UPDATE orders SET status = 'completed', stripe_payment_intent = payment_intent
7. UPDATE crm_contacts SET stage = 'customer', last_activity_at = now()
   WHERE email = customer_email
8. SELECT access_grants FROM products WHERE slug = metadata.product_slug
9. Check: does an auth user exist with this email?
   - Use supabaseAdmin.auth.admin.listUsers() filtered by email
   - If YES -> process_access_grants(user_id, access_grants, order)
   - If NO -> grants will be processed on account creation (DB trigger)
10. Return 200
```

### process_access_grants(user_id, access_grants, order)

```
Switch on access_grants.type:
  'enrollment':
    INSERT INTO enrollments (user_id, course_id, status, stripe_payment_id)
    VALUES (user_id, access_grants.course_id, 'active', order.stripe_payment_intent)
    ON CONFLICT DO NOTHING

  'download':
    No enrollment needed. Downloads page queries orders + products
    to show available downloads. No additional DB write.
```

### Webhook registration

After deploying, register the endpoint in Stripe Dashboard:
- URL: `https://healingheartscourse.com/api/webhooks/stripe`
- Events: `checkout.session.completed`
- Copy the `whsec_...` signing secret into Vercel env vars and local `.env`

**Future events (Approach B):**
- `payment_intent.payment_failed`
- `charge.refunded`
- `customer.subscription.updated`
- `customer.subscription.deleted`

---

## Component 4: Success Page (New)

**File:** `/src/pages/CheckoutSuccess.jsx` (new)
**Route:** `/checkout/success` (inside Layout wrapper, not protected)

### Behavior

```
Page loads with ?session_id=cs_test_...
        |
Call GET /api/checkout?session_id=cs_test_...
        |
If invalid/not found -> "Something went wrong" + link to contact support
        |
If valid:
  Check auth state (useAuth hook)
        |
  Logged in:
    "Your purchase is complete!"
    "[Product name] has been added to your portal."
    [Go to Your Portal] button -> /portal
        |
  Not logged in:
    "Your purchase is complete!"
    "Create your free account to access [product name]."
    [Create Account] button -> /signup?email=<prefilled>&from=checkout
    (or inline signup form with email pre-filled)
```

### Design notes
- Warm, on-brand (not transactional/corporate)
- Use Scoria components if appropriate (HeroSection or simpler)
- Trisha-voice copy: "You just took a beautiful step" not "Transaction successful"
- Include order confirmation details (product name, amount)
- For downloads: show "Your download is ready in your portal" with direct link
- Mobile-first — many expo purchases will be on phones

### Route addition in App.jsx

```jsx
<Route path="/checkout/success" element={<CheckoutSuccess />} />
```

Added inside the `<Layout>` wrapper (public, not protected).

---

## Component 5: Account-Purchase Linking (DB Trigger)

**Supabase DB function + trigger** — fires when a new user signs up.

```sql
CREATE OR REPLACE FUNCTION link_purchases_on_signup()
RETURNS TRIGGER AS $$
DECLARE
  contact_record RECORD;
  order_record RECORD;
  product_record RECORD;
BEGIN
  -- Find matching CRM contact by email
  SELECT * INTO contact_record
  FROM crm_contacts
  WHERE email = NEW.email;

  IF contact_record IS NULL THEN
    RETURN NEW;
  END IF;

  -- Link auth user to CRM contact
  UPDATE crm_contacts
  SET auth_user_id = NEW.id
  WHERE id = contact_record.id;

  -- Process each completed order for this contact
  FOR order_record IN
    SELECT o.*, p.access_grants
    FROM orders o
    JOIN products p ON p.slug = o.product_slug
    WHERE o.contact_id = contact_record.id
      AND o.status = 'completed'
  LOOP
    -- Link order to auth user
    UPDATE orders SET auth_user_id = NEW.id WHERE id = order_record.id;

    -- Process access grants
    IF (order_record.access_grants->>'type') = 'enrollment' THEN
      INSERT INTO enrollments (user_id, course_id, status, stripe_payment_id)
      VALUES (
        NEW.id,
        (order_record.access_grants->>'course_id')::uuid,
        'active',
        order_record.stripe_payment_intent
      )
      ON CONFLICT DO NOTHING;
    END IF;

    -- 'download' and 'lessons' types don't need enrollment rows
    -- Downloads page queries orders + products directly
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created_link_purchases
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION link_purchases_on_signup();
```

---

## Component 6: Portal Enrollment Awareness (Fix)

### 6a: Query enrollments in useCourseData

**File:** `/src/hooks/useCourseData.js`

Add an enrollments query:
```javascript
const { data: enrollments } = await supabase
  .from('enrollments')
  .select('course_id, status')
  .eq('user_id', user.id)
  .eq('status', 'active');
```

Expose `hasActiveEnrollment` from the hook.

### 6b: Update access check in CoursePortal.jsx

**Current (broken for enrolled users):**
```javascript
if (mod && !mod.is_preview && !isAdmin) {
  denied = true;
}
```

**Fixed:**
```javascript
if (mod && !mod.is_preview && !isAdmin && !hasActiveEnrollment) {
  denied = true;
}
```

Same fix for the lesson-level check at line 64.

### 6c: Update access denied screen

**Current:** "Back to Dashboard" only.

**Updated:** Add contextual CTA based on available products:
- If there's a public product for this content: "Get Access" button -> product page
- If full course only: "Learn More About the Program" -> /course or /apply
- Keep "Back to Dashboard" as secondary action

---

## Component 7: Downloads Portal Page (New)

**File:** `/src/portal/Downloads.jsx` (new portal section)
**Access:** Inside the portal (protected route), shows purchases with downloadable content.

### Behavior

```
Query: orders (status = 'completed') JOIN products (access_grants.type = 'download')
  WHERE orders.auth_user_id = current user
        |
Show list of downloadable products:
  - Product name
  - Purchase date
  - Download button -> Supabase Storage signed URL (24h expiry)
        |
If no downloads: "No downloads yet. Check out our tools!" -> /tools or /rescue-kit
```

### File storage
- Downloadable files stored in Supabase Storage bucket: `downloads`
- Path convention: `downloads/{product_slug}/{filename}`
- Example: `downloads/card-pack/healing-hearts-card-pack.pdf`
- Signed URL generated server-side or via Supabase client with RLS

### Route addition
- Add "Downloads" link to portal sidebar/dashboard
- Route: `/portal/downloads` (protected)

---

## Component 8: Product Page Updates

### RescueKit.jsx
- Change CTA from `<Link to="/apply">` to a button that calls `POST /api/checkout`
- Pass `slug: 'rescue-kit'`, user's email if logged in, and UTM params from URL
- Handle loading state on the button while Stripe session is created
- On response, `window.location.href = data.url` to redirect to Stripe

### Future product pages (Card Pack, etc.)
- Same pattern: button calls `/api/checkout` with the product slug
- Can be built with Forge Lite when the marketing page is needed

---

## Component 9: Private Checkout for Full Course

For the $12,997 program (not publicly listed):

1. During the close process, Chase/Makayla creates a checkout session:
   - Could be an admin action in AdminPanel (future)
   - For now: a simple script or API call with `slug: 'full-course'` and customer email
   - Or: create the session manually via Stripe Dashboard and share the URL
2. Customer receives unique Stripe Checkout URL via email
3. Same webhook handles payment -> enrollment created
4. Customer creates account (or already has one from application) -> full portal access

No new endpoints needed -- same `/api/checkout` works.

---

## Component 10: Promo Code Support

Enabled by default on all Stripe Checkout sessions:
```javascript
sessionParams.allow_promotion_codes = true;
```

**Creating promo codes:**
- Done entirely in Stripe Dashboard (Coupons -> Create)
- No code changes per promo
- Useful for expo booth discounts, early bird offers, etc.

---

## Component 11: Source Attribution

### Frontend
Product pages read UTM params from the URL and pass them through:
```javascript
const params = new URLSearchParams(window.location.search);
const source = params.get('utm_source') || params.get('source') || '';
```

### Checkout endpoint
Stores source in Stripe session metadata:
```javascript
metadata: {
  product_slug: slug,
  source: source,
  utm_campaign: utm_campaign || '',
}
```

### Webhook
Persists attribution in `orders.metadata`:
```javascript
await supabaseAdmin.from('orders').update({
  metadata: { source, utm_campaign, ...existing }
}).eq('stripe_session_id', session.id);
```

### QR codes for expo
Use existing QR code SOP with UTM params:
`healingheartscourse.com/rescue-kit?utm_source=expo-booth&utm_campaign=be-healthy-2026`

---

## Component 12: In-Person Payment Links (Expo)

For the Be Healthy Utah expo (April 17-18), in-person sales use Stripe Payment Links
with printed QR codes at the booth.

### How it works

Stripe Payment Links use Stripe Checkout under the hood -- the same webhook pipeline
handles everything. No new code needed.

### Setup (Stripe Dashboard)

1. Create a Payment Link for each booth product (Rescue Kit $39, Card Pack $35)
2. Enable `allow_promotion_codes` if booth promos are planned
3. Append UTM params to each link: `?utm_source=expo-booth&utm_campaign=be-healthy-2026`
4. Generate QR codes using the existing QR code SOP (`Projects/ai-os/sops/qr-code-generation-sop.md`)

### Booth flow

```
Customer at booth
    -> scans QR code on printed sign (or staff shares link)
    -> Stripe Checkout on their phone
    -> pays with Apple Pay / Google Pay / card entry
    -> webhook fires -> order created
    -> success page: "Create account to access your purchase"
```

### Print collateral needed
- One QR code sign per product (product name + price + QR code)
- Signs should include: "Scan to purchase -- instant access"
- Consider a combined sign with multiple QR codes if booth space is tight

### Limitations
- Requires customer to use their phone (some friction)
- No tap-to-pay card reader option (see Stripe Terminal handoff for future)
- Customer must have internet connection

### Future: Stripe Terminal
A dedicated Stripe Terminal session is planned for next week to add physical
card reader support (tap/chip/swipe). This will complement Payment Links for
customers who prefer paying with a physical card without using their phone.
See handoff: `docs/handoffs/2026-04-09-stripe-terminal-handoff.md`

---

## Component 13: Email Mismatch Fallback

### Primary prevention
Success page pre-fills signup form with the email used on Stripe. This prevents ~90% of mismatches.

### Fallback: Manual purchase claim
Portal settings or downloads page includes:
- "Purchased with a different email? Link your order"
- User enters the email they used at checkout
- System checks: crm_contacts.email match + orders.status = 'completed'
- If match: links the contact to their auth user, processes access_grants
- Rate-limited to prevent abuse (3 attempts per hour)

This is a lower-priority feature -- can ship after launch if needed.

---

## Vercel Function Budget

| Function | Status | Slot |
|----------|--------|------|
| Existing functions (9) | In use | 1-9 |
| `/api/webhooks/stripe.js` | New (this spec) | 10 |
| Reserved for future | -- | 11-12 |

**Crons:** 2/2 used (spark-drip, webinar-cron). No new crons needed.

GET handler on `/api/checkout` reuses the existing function -- no additional slot consumed.

---

## Testing Plan (Sandbox)

Using Stripe sandbox keys (`pk_test_...`, `sk_test_...`):

1. **Create products in Stripe sandbox** via API
2. **Run migration** to create `products` table + seed data
3. **Test checkout flow:**
   - Click "Buy" on Rescue Kit -> verify redirect to Stripe
   - Complete payment with test card `4242 4242 4242 4242`
   - Verify redirect to success page with valid session
4. **Test webhook:**
   - Use Stripe CLI `stripe listen --forward-to localhost:3000/api/webhooks/stripe` for local testing
   - Verify order status updates to 'completed'
   - Verify enrollment created (if logged in)
5. **Test account linking:**
   - Purchase without account -> create account with same email -> verify portal access
   - Purchase while logged in -> verify immediate portal access
6. **Test access denied -> purchase CTA flow**
7. **Test promo codes**

**Test card numbers:**
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- 3D Secure: `4000 0027 6000 3184`

---

## Future Evolution (Approach B — not built now)

Documented for future reference:

- **Stripe Customer Portal** — self-service invoices, subscription management, payment method updates. Requires `/api/create-portal-session.js` endpoint (function slot 11).
- **Payment plans** — Stripe Subscriptions for the full course ($4,997 + 8x$1,000 monthly or $4,997 + 3x$2,667 quarterly). Requires subscription webhook events.
- **Admin order dashboard** — in AdminPanel: view orders, enrollments, revenue, coupon usage.
- **Refund handling** — `charge.refunded` webhook event -> revoke enrollment, update order status.
- **Coupon system** — dedicated `coupons` + `coupon_usage` tables for tracking beyond Stripe's built-in promos.
- **Subscription lifecycle** — handle `customer.subscription.updated`, `customer.subscription.deleted` for payment plan status changes.

---

## Forbidden Patterns

- NEVER store Stripe secret key in frontend code (no `VITE_` prefix)
- NEVER trust the success page URL alone -- always verify session server-side
- NEVER process payments without webhook verification (success page is UX only)
- NEVER create enrollment without a completed order backing it
- NEVER use `dangerouslySetInnerHTML` on the success page or downloads page
- NEVER hardcode product prices in code -- products table is the source of truth
- NEVER use non-ASCII characters in SQL migrations (em dashes, smart quotes)
- NEVER skip RLS policies on new tables
