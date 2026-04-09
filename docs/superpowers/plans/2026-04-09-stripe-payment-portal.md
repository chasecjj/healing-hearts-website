# Stripe Payment Portal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Connect Stripe to the Healing Hearts website so users can purchase products via Stripe Checkout, then create an account to access their purchases in the portal.

**Architecture:** Stripe-hosted Checkout (redirect) + single webhook endpoint + email-matching enrollment bridge. Products table in Supabase maps purchases to access grants. No account required before purchase.

**Tech Stack:** React 19, Vite 7, Stripe (v20.4.1), Supabase (PostgreSQL + RLS), Vercel Serverless Functions

**Spec:** `docs/superpowers/specs/2026-04-09-stripe-payment-portal-design.md`

---

## File Map

### New Files
| File | Responsibility |
|------|---------------|
| `supabase/migrations/016_products_and_purchase_linking.sql` | Products table, RLS policies, purchase-linking trigger |
| `api/webhooks/stripe.js` | Stripe webhook handler (checkout.session.completed) |
| `src/pages/CheckoutSuccess.jsx` | Post-purchase success page with session verification |
| `src/portal/Downloads.jsx` | Portal downloads page for purchased downloadable products |
| `src/lib/checkout.js` | Frontend checkout helper (POST to /api/checkout, UTM passthrough) |

### Modified Files
| File | Changes |
|------|---------|
| `api/checkout.js` | Replace hardcoded products with DB lookup, add GET handler for session verification |
| `src/hooks/useCourseData.js` | Add enrollments query, expose `hasActiveEnrollment` |
| `src/CoursePortal.jsx` | Update access check to include enrollment status, update denied screen CTA |
| `src/pages/RescueKit.jsx` | Change CTA from `/apply` link to Stripe checkout call |
| `src/pages/Signup.jsx` | Read `email` and `from` URL params for post-checkout pre-fill |
| `src/App.jsx` | Add `/checkout/success` and `/portal/downloads` routes |
| `src/portal/PortalDashboard.jsx` | Add "Downloads" link to portal navigation |

---

## Task 1: Create Stripe Products in Sandbox

**Files:**
- None (Stripe Dashboard / API only)

This task creates the product catalog in Stripe's sandbox so we have real `price_id` values for the migration.

- [ ] **Step 1: Create products via Stripe API**

Run from the project root (uses the sandbox secret key from `.env`):

```bash
# Load the secret key
source .env

# Create Rescue Kit product + price
curl https://api.stripe.com/v1/products \
  -u "$STRIPE_SECRET_KEY:" \
  -d "name=Conflict Rescue Kit" \
  -d "description=SPARK Method frameworks, Critter Brain guide, reflection prompts & more" \
  -d "metadata[slug]=rescue-kit"

# Note the product ID (prod_...) from the response, then create price:
curl https://api.stripe.com/v1/prices \
  -u "$STRIPE_SECRET_KEY:" \
  -d "product=prod_REPLACE_WITH_ID" \
  -d "unit_amount=3900" \
  -d "currency=usd"

# Create Card Pack product + price
curl https://api.stripe.com/v1/products \
  -u "$STRIPE_SECRET_KEY:" \
  -d "name=Healing Hearts Card Pack" \
  -d "description=Printable conversation cards for couples" \
  -d "metadata[slug]=card-pack"

curl https://api.stripe.com/v1/prices \
  -u "$STRIPE_SECRET_KEY:" \
  -d "product=prod_REPLACE_WITH_ID" \
  -d "unit_amount=3500" \
  -d "currency=usd"

# Create Full Course product + price
curl https://api.stripe.com/v1/products \
  -u "$STRIPE_SECRET_KEY:" \
  -d "name=Healing Hearts Journey Program" \
  -d "description=Complete 8-module couples healing program" \
  -d "metadata[slug]=full-course"

curl https://api.stripe.com/v1/prices \
  -u "$STRIPE_SECRET_KEY:" \
  -d "product=prod_REPLACE_WITH_ID" \
  -d "unit_amount=1299700" \
  -d "currency=usd"
```

- [ ] **Step 2: Record the price IDs**

Save the three `price_...` IDs returned by Stripe. You'll need them for the migration in Task 2. Format:

```
rescue-kit:  price_XXXXXXXXX
card-pack:   price_XXXXXXXXX
full-course: price_XXXXXXXXX
```

- [ ] **Step 3: Verify in Stripe Dashboard**

Open the Stripe sandbox Dashboard -> Products. Confirm all three products appear with correct names and prices.

---

## Task 2: Products Table Migration

**Files:**
- Create: `supabase/migrations/016_products_and_purchase_linking.sql`

- [ ] **Step 1: Write the migration**

Create `supabase/migrations/016_products_and_purchase_linking.sql`:

```sql
-- =====================================================
-- Phase 3: Products catalog + purchase-linking trigger
-- Products table maps Stripe prices to access grants.
-- DB trigger auto-links purchases when users sign up.
-- =====================================================

-- =====================================================
-- PRODUCTS TABLE
-- =====================================================
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  price_cents integer NOT NULL,
  stripe_price_id text NOT NULL,
  product_type text NOT NULL DEFAULT 'one-time'
    CHECK (product_type IN ('one-time', 'subscription')),
  access_grants jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  is_public boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_active ON products(is_active) WHERE is_active = true;

-- =====================================================
-- RLS POLICIES
-- =====================================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Public can read active, public products (for product pages)
CREATE POLICY "products_public_read" ON products
  FOR SELECT USING (is_active = true AND is_public = true);

-- Admins can read all products (including inactive/private)
CREATE POLICY "products_admin_read" ON products
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Admins can write products
CREATE POLICY "products_admin_write" ON products
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Service role has full access (for webhook + admin API calls)
-- (Service role bypasses RLS by default, no explicit policy needed)

-- =====================================================
-- SEED PRODUCTS
-- Replace price_XXXXXXXXX with actual Stripe price IDs
-- from Task 1.
-- =====================================================

-- Look up the course UUID for enrollment grants
DO $$
DECLARE
  course_uuid uuid;
BEGIN
  SELECT id INTO course_uuid FROM courses WHERE slug = 'healing-hearts-journey' LIMIT 1;

  INSERT INTO products (slug, name, description, price_cents, stripe_price_id, product_type, access_grants, is_active, is_public) VALUES
    (
      'rescue-kit',
      'Conflict Rescue Kit',
      'SPARK Method frameworks, Critter Brain guide, reflection prompts & more',
      3900,
      'price_REPLACE_RESCUE_KIT',
      'one-time',
      '{"type": "download", "download_slug": "rescue-kit"}'::jsonb,
      true,
      true
    ),
    (
      'card-pack',
      'Healing Hearts Card Pack',
      'Printable conversation cards for couples',
      3500,
      'price_REPLACE_CARD_PACK',
      'one-time',
      '{"type": "download", "download_slug": "card-pack"}'::jsonb,
      true,
      true
    ),
    (
      'full-course',
      'Healing Hearts Journey Program',
      'Complete 8-module couples healing program',
      1299700,
      'price_REPLACE_FULL_COURSE',
      'one-time',
      jsonb_build_object('type', 'enrollment', 'course_id', course_uuid::text),
      true,
      false
    );
END $$;

-- =====================================================
-- PURCHASE-LINKING TRIGGER
-- When a new user signs up, link any existing purchases
-- to their account and grant access.
-- =====================================================
CREATE OR REPLACE FUNCTION link_purchases_on_signup()
RETURNS TRIGGER AS $$
DECLARE
  contact_record RECORD;
  order_record RECORD;
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

    -- Process enrollment grants
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
    -- 'download' type: no enrollment row needed, Downloads page queries orders + products
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created_link_purchases
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION link_purchases_on_signup();
```

- [ ] **Step 2: Replace placeholder price IDs**

Open the migration file and replace the three `price_REPLACE_*` values with the actual Stripe price IDs from Task 1.

- [ ] **Step 3: Run the migration in Supabase**

Open the Supabase Dashboard -> SQL Editor. Paste and run the migration. Verify:
- `products` table exists with 3 rows
- `link_purchases_on_signup` function exists
- `on_auth_user_created_link_purchases` trigger exists on `auth.users`

- [ ] **Step 4: Verify RLS policies**

In the Supabase Dashboard -> Authentication -> Policies, confirm `products` has the three policies: `products_public_read`, `products_admin_read`, `products_admin_write`.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/016_products_and_purchase_linking.sql
git commit -m "feat: add products table, RLS policies, and purchase-linking trigger"
```

---

## Task 3: Upgrade Checkout Endpoint

**Files:**
- Modify: `api/checkout.js`

- [ ] **Step 1: Rewrite checkout.js with product lookup + GET handler**

Replace the entire contents of `api/checkout.js`:

```javascript
// Vercel Serverless Function: /api/checkout
// POST: Creates a Stripe Checkout Session for any product in the products table.
// GET:  Verifies a completed session (used by success page).

import Stripe from 'stripe';
import { supabaseAdmin } from './_lib/supabase-admin.js';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

const SITE_URL = process.env.SITE_URL || 'https://healingheartscourse.com';

export default async function handler(req, res) {
  if (!stripe) {
    return res.status(503).json({ error: 'Payments are not configured yet. Check back soon!' });
  }

  if (req.method === 'GET') {
    return handleGetSession(req, res);
  }

  if (req.method === 'POST') {
    return handleCreateSession(req, res);
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'Method not allowed' });
}

// ─── GET: Verify a checkout session ──────────────────────
async function handleGetSession(req, res) {
  const { session_id } = req.query;

  if (!session_id || typeof session_id !== 'string') {
    return res.status(400).json({ error: 'Missing session_id parameter' });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== 'paid') {
      return res.status(404).json({ error: 'Session not found or not completed' });
    }

    const productSlug = session.metadata?.product_slug;
    let productName = null;

    if (productSlug) {
      const { data: product } = await supabaseAdmin
        .from('products')
        .select('name')
        .eq('slug', productSlug)
        .single();
      productName = product?.name || null;
    }

    return res.status(200).json({
      status: 'complete',
      customer_email: session.customer_details?.email || session.customer_email,
      product_slug: productSlug,
      product_name: productName,
    });
  } catch (err) {
    console.error('[checkout] Session verification failed:', err.message);
    return res.status(404).json({ error: 'Session not found or not completed' });
  }
}

// ─── POST: Create a new checkout session ─────────────────
async function handleCreateSession(req, res) {
  try {
    const { slug, email, source, cancel_path } = req.body || {};

    if (!slug || typeof slug !== 'string') {
      return res.status(400).json({ error: 'Missing product slug' });
    }

    // Look up product in database
    const { data: product, error: productError } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (productError || !product) {
      return res.status(400).json({ error: 'Product not found or unavailable' });
    }

    // Build Stripe Checkout Session params
    const sessionParams = {
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: product.stripe_price_id,
          quantity: 1,
        },
      ],
      success_url: `${SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}${cancel_path || '/'}`,
      allow_promotion_codes: true,
      metadata: {
        product_slug: slug,
        source: source || '',
      },
    };

    // Pre-fill email if provided
    if (email && typeof email === 'string' && email.includes('@')) {
      sessionParams.customer_email = email.trim().toLowerCase();
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create(sessionParams);

    // Upsert CRM contact + create pending order (best-effort, non-blocking)
    const customerEmail = sessionParams.customer_email;
    if (customerEmail) {
      try {
        const { data: contact } = await supabaseAdmin
          .from('crm_contacts')
          .upsert(
            {
              email: customerEmail,
              source: source || slug,
              last_activity_at: new Date().toISOString(),
            },
            { onConflict: 'email', ignoreDuplicates: false }
          )
          .select('id')
          .single();

        if (contact) {
          await supabaseAdmin.from('orders').insert({
            contact_id: contact.id,
            stripe_session_id: session.id,
            product_slug: slug,
            amount_cents: product.price_cents,
            currency: 'usd',
            status: 'pending',
            metadata: { source: source || '' },
          });
        }
      } catch (dbErr) {
        console.error('[checkout] DB upsert error (non-blocking):', dbErr.message);
      }
    }

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('[checkout] Stripe session creation failed:', err.message);
    return res.status(500).json({ error: 'Unable to create checkout session. Please try again.' });
  }
}
```

- [ ] **Step 2: Verify the dev server picks up changes**

If the dev server is running, restart it. Then test manually:

```bash
# Test POST (should fail gracefully with no Stripe key in dev, or succeed with sandbox key)
curl -X POST http://localhost:5173/api/checkout \
  -H "Content-Type: application/json" \
  -d '{"slug": "rescue-kit"}'
```

Note: Vercel serverless functions don't run on Vite's dev server. For full testing, use `vercel dev` or deploy to a preview branch.

- [ ] **Step 3: Commit**

```bash
git add api/checkout.js
git commit -m "feat: upgrade checkout to product-lookup + session verification"
```

---

## Task 4: Stripe Webhook Handler

**Files:**
- Create: `api/webhooks/stripe.js`

- [ ] **Step 1: Create the webhook directory and handler**

```bash
mkdir -p api/webhooks
```

Create `api/webhooks/stripe.js`:

```javascript
// Vercel Serverless Function: POST /api/webhooks/stripe
// Handles Stripe webhook events. Currently: checkout.session.completed.
// Source of truth for payment confirmation — success page is UX only.

import Stripe from 'stripe';
import { supabaseAdmin } from '../_lib/supabase-admin.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Vercel requires raw body for Stripe signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

async function getRawBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!webhookSecret) {
    console.error('[webhook] STRIPE_WEBHOOK_SECRET not configured');
    return res.status(500).json({ error: 'Webhook not configured' });
  }

  // Verify Stripe signature
  let event;
  try {
    const rawBody = await getRawBody(req);
    const signature = req.headers['stripe-signature'];
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error('[webhook] Signature verification failed:', err.message);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  // Route by event type
  if (event.type === 'checkout.session.completed') {
    await handleCheckoutCompleted(event.data.object);
  }

  // Always return 200 to acknowledge receipt (even for unhandled event types)
  return res.status(200).json({ received: true });
}

async function handleCheckoutCompleted(session) {
  const sessionId = session.id;
  const customerEmail = (session.customer_details?.email || session.customer_email || '').toLowerCase();
  const paymentIntent = session.payment_intent;
  const productSlug = session.metadata?.product_slug;
  const source = session.metadata?.source || '';

  if (!customerEmail || !productSlug) {
    console.error('[webhook] Missing email or product_slug in session:', sessionId);
    return;
  }

  // Idempotency: skip if already processed
  const { data: existingOrder } = await supabaseAdmin
    .from('orders')
    .select('id')
    .eq('stripe_session_id', sessionId)
    .eq('status', 'completed')
    .maybeSingle();

  if (existingOrder) {
    console.log('[webhook] Already processed session:', sessionId);
    return;
  }

  // Upsert CRM contact (in case checkout.js didn't have email at session creation)
  const { data: contact } = await supabaseAdmin
    .from('crm_contacts')
    .upsert(
      {
        email: customerEmail,
        stage: 'customer',
        source: source || productSlug,
        last_activity_at: new Date().toISOString(),
      },
      { onConflict: 'email', ignoreDuplicates: false }
    )
    .select('id')
    .single();

  if (!contact) {
    console.error('[webhook] Failed to upsert contact for:', customerEmail);
    return;
  }

  // Update or create order
  const { data: existingPending } = await supabaseAdmin
    .from('orders')
    .select('id')
    .eq('stripe_session_id', sessionId)
    .maybeSingle();

  if (existingPending) {
    // Update existing pending order
    await supabaseAdmin
      .from('orders')
      .update({
        status: 'completed',
        stripe_payment_intent: paymentIntent,
        metadata: { source },
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingPending.id);
  } else {
    // Create order (checkout.js may not have created one if email was missing)
    const { data: product } = await supabaseAdmin
      .from('products')
      .select('price_cents')
      .eq('slug', productSlug)
      .single();

    await supabaseAdmin.from('orders').insert({
      contact_id: contact.id,
      stripe_session_id: sessionId,
      stripe_payment_intent: paymentIntent,
      product_slug: productSlug,
      amount_cents: product?.price_cents || 0,
      currency: 'usd',
      status: 'completed',
      metadata: { source },
    });
  }

  // Look up product access_grants
  const { data: product } = await supabaseAdmin
    .from('products')
    .select('access_grants')
    .eq('slug', productSlug)
    .single();

  if (!product) {
    console.error('[webhook] Product not found:', productSlug);
    return;
  }

  // Check if an auth user already exists with this email
  const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();
  const authUser = authUsers?.users?.find(
    (u) => u.email?.toLowerCase() === customerEmail
  );

  if (authUser && product.access_grants?.type === 'enrollment') {
    const courseId = product.access_grants.course_id;
    if (courseId) {
      await supabaseAdmin.from('enrollments').upsert(
        {
          user_id: authUser.id,
          course_id: courseId,
          status: 'active',
          stripe_payment_id: paymentIntent,
        },
        { onConflict: 'user_id,course_id' }
      );
    }
  }

  // Link order to auth user if they exist
  if (authUser) {
    await supabaseAdmin
      .from('orders')
      .update({ auth_user_id: authUser.id })
      .eq('stripe_session_id', sessionId);
  }

  console.log('[webhook] Processed checkout.session.completed:', {
    session: sessionId,
    email: customerEmail,
    product: productSlug,
    userFound: !!authUser,
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add api/webhooks/stripe.js
git commit -m "feat: add Stripe webhook handler for checkout.session.completed"
```

---

## Task 5: Frontend Checkout Helper

**Files:**
- Create: `src/lib/checkout.js`

- [ ] **Step 1: Create the checkout helper**

Create `src/lib/checkout.js`:

```javascript
/**
 * Frontend checkout utilities.
 * Handles calling /api/checkout and reading UTM params.
 */

/**
 * Extract UTM/source params from the current URL.
 */
function getSourceAttribution() {
  const params = new URLSearchParams(window.location.search);
  return {
    source: params.get('utm_source') || params.get('source') || '',
    utm_campaign: params.get('utm_campaign') || '',
  };
}

/**
 * Start a Stripe Checkout session for a product.
 *
 * @param {string} slug - Product slug (e.g. 'rescue-kit')
 * @param {object} options
 * @param {string} [options.email] - Pre-fill customer email
 * @param {string} [options.cancelPath] - Path to return to on cancel (default: current path)
 * @returns {Promise<void>} Redirects to Stripe Checkout on success
 * @throws {Error} If checkout session creation fails
 */
export async function startCheckout(slug, { email, cancelPath } = {}) {
  const { source } = getSourceAttribution();

  const res = await fetch('/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      slug,
      email: email || undefined,
      source: source || undefined,
      cancel_path: cancelPath || window.location.pathname,
    }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to start checkout');
  }

  const { url } = await res.json();
  window.location.href = url;
}

/**
 * Verify a completed checkout session.
 *
 * @param {string} sessionId - Stripe session ID from URL params
 * @returns {Promise<object>} Session details (status, customer_email, product_slug, product_name)
 * @throws {Error} If verification fails
 */
export async function verifyCheckoutSession(sessionId) {
  const res = await fetch(`/api/checkout?session_id=${encodeURIComponent(sessionId)}`);

  if (!res.ok) {
    throw new Error('Session verification failed');
  }

  return res.json();
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/checkout.js
git commit -m "feat: add frontend checkout helper with UTM attribution"
```

---

## Task 6: Checkout Success Page

**Files:**
- Create: `src/pages/CheckoutSuccess.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Create the success page component**

Create `src/pages/CheckoutSuccess.jsx`:

```jsx
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { verifyCheckoutSession } from '../lib/checkout';
import { CheckCircle, ShieldAlert, ArrowRight, Download } from 'lucide-react';

export default function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { user } = useAuth();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!sessionId) {
      setError('No session found');
      setLoading(false);
      return;
    }

    verifyCheckoutSession(sessionId)
      .then(setSession)
      .catch(() => setError('We could not verify your purchase. Please contact us for help.'))
      .finally(() => setLoading(false));
  }, [sessionId]);

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="font-sans text-foreground/60 text-sm">Confirming your purchase...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !session) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-6">
        <div className="flex flex-col items-center gap-6 max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
            <ShieldAlert className="w-8 h-8 text-accent" />
          </div>
          <div>
            <h2 className="font-outfit font-bold text-xl text-primary mb-2">
              Something Went Wrong
            </h2>
            <p className="font-sans text-foreground/60 text-sm leading-relaxed">
              {error || 'We could not verify your purchase.'}
            </p>
          </div>
          <Link
            to="/contact"
            className="px-6 py-3 rounded-full text-sm font-medium text-white bg-primary hover:bg-primary/90 transition-colors"
          >
            Contact Support
          </Link>
        </div>
      </div>
    );
  }

  // Success state
  const isDownload = session.product_slug !== 'full-course';
  const signupUrl = `/signup?email=${encodeURIComponent(session.customer_email || '')}&from=checkout`;

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6 py-16">
      <div className="flex flex-col items-center gap-8 max-w-lg text-center">
        {/* Checkmark */}
        <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>

        {/* Headline */}
        <div>
          <h1 className="font-drama italic text-3xl sm:text-4xl text-primary mb-3">
            You Just Took a Beautiful Step
          </h1>
          <p className="font-sans text-foreground/70 text-lg leading-relaxed">
            Your purchase of <strong>{session.product_name}</strong> is confirmed.
          </p>
        </div>

        {/* Next step based on auth state */}
        {user ? (
          <div className="flex flex-col items-center gap-4">
            <p className="font-sans text-foreground/60">
              {isDownload
                ? 'Your download is waiting in your portal.'
                : 'Your course is now unlocked in your portal.'}
            </p>
            <Link
              to={isDownload ? '/portal/downloads' : '/portal'}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-medium text-white bg-accent hover:bg-accent/90 transition-colors shadow-lg"
            >
              {isDownload ? (
                <>
                  <Download className="w-5 h-5" />
                  Go to Downloads
                </>
              ) : (
                <>
                  Go to Your Portal
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Link>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <p className="font-sans text-foreground/60 leading-relaxed">
              Create your free account to access{' '}
              <strong>{session.product_name}</strong>. We will use the same email
              you just checked out with.
            </p>
            <Link
              to={signupUrl}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-medium text-white bg-accent hover:bg-accent/90 transition-colors shadow-lg"
            >
              Create Your Account
              <ArrowRight className="w-5 h-5" />
            </Link>
            <p className="font-sans text-foreground/40 text-xs">
              Already have an account?{' '}
              <Link to="/login" className="underline hover:text-primary">
                Log in
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add route in App.jsx**

In `src/App.jsx`, add the import at the top with the other page imports (after line 36):

```javascript
import CheckoutSuccess from './pages/CheckoutSuccess';
```

Add the route inside the `<Route element={<Layout />}>` block (after the `/rescue-kit` route, line 85):

```jsx
<Route path="/checkout/success" element={<CheckoutSuccess />} />
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/CheckoutSuccess.jsx src/App.jsx
git commit -m "feat: add checkout success page with session verification"
```

---

## Task 7: Signup Email Pre-fill

**Files:**
- Modify: `src/pages/Signup.jsx`

- [ ] **Step 1: Add URL param reading to Signup**

In `src/pages/Signup.jsx`, add `useSearchParams` to the router import (line 2):

```javascript
import { Link, useSearchParams } from 'react-router-dom';
```

Inside the `Signup` function (after line 6), add:

```javascript
  const [searchParams] = useSearchParams();
  const prefillEmail = searchParams.get('email') || '';
  const fromCheckout = searchParams.get('from') === 'checkout';
```

Change the email state initialization (line 8 originally) to use the prefill:

```javascript
  const [email, setEmail] = useState(prefillEmail);
```

- [ ] **Step 2: Add post-checkout welcome message**

After the `<h2>` heading in the signup form (find the heading text in the JSX), add a conditional message:

```jsx
{fromCheckout && (
  <p className="font-sans text-foreground/60 text-sm mt-2 mb-4">
    Create your account to access your purchase. We have pre-filled the email you used at checkout.
  </p>
)}
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/Signup.jsx
git commit -m "feat: pre-fill email on signup from checkout redirect"
```

---

## Task 8: Update RescueKit Page CTA

**Files:**
- Modify: `src/pages/RescueKit.jsx`

- [ ] **Step 1: Add checkout import and state**

At the top of `src/pages/RescueKit.jsx`, add imports:

```javascript
import { startCheckout } from '../lib/checkout';
import { useAuth } from '../contexts/AuthContext';
```

Inside the `RescueKitPricing` component (or wherever the pricing section lives), add:

```javascript
const { user } = useAuth();
const [checkoutLoading, setCheckoutLoading] = useState(false);
const [checkoutError, setCheckoutError] = useState(null);

async function handleBuyClick() {
  setCheckoutLoading(true);
  setCheckoutError(null);
  try {
    await startCheckout('rescue-kit', {
      email: user?.email,
      cancelPath: '/rescue-kit',
    });
  } catch (err) {
    setCheckoutError(err.message);
    setCheckoutLoading(false);
  }
}
```

- [ ] **Step 2: Replace the CTA button**

Find the existing CTA (around line 476):

```jsx
<Link to="/apply">
  <MagneticButton
    className="bg-accent text-white px-8 sm:px-12 py-4 rounded-full text-base w-full sm:w-auto font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 w-full md:w-auto"
  >
    Get the Conflict Rescue Kit
  </MagneticButton>
</Link>
```

Replace with:

```jsx
<MagneticButton
  onClick={handleBuyClick}
  disabled={checkoutLoading}
  className="bg-accent text-white px-8 sm:px-12 py-4 rounded-full text-base w-full sm:w-auto font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 w-full md:w-auto disabled:opacity-60 disabled:cursor-wait"
>
  {checkoutLoading ? 'Redirecting to checkout...' : 'Get the Conflict Rescue Kit'}
</MagneticButton>
{checkoutError && (
  <p className="text-red-500 text-sm mt-2">{checkoutError}</p>
)}
```

- [ ] **Step 3: Remove the `Link` import if no longer needed**

Check if `Link` from `react-router-dom` is still used elsewhere in the file. If the "Explore the full Healing Hearts Program" link on line 498 still uses it, keep the import. Otherwise remove it.

- [ ] **Step 4: Commit**

```bash
git add src/pages/RescueKit.jsx
git commit -m "feat: wire RescueKit CTA to Stripe checkout"
```

---

## Task 9: Portal Enrollment Awareness

**Files:**
- Modify: `src/hooks/useCourseData.js`
- Modify: `src/CoursePortal.jsx`

- [ ] **Step 1: Add enrollment query to useCourseData**

In `src/hooks/useCourseData.js`, add the `supabase` import at the top (it's already used indirectly via `courses.js`, but we need it directly):

```javascript
import { supabase } from '../lib/supabase';
```

Inside the `loadData` callback (after line 70, after `getUserProgress`), add:

```javascript
      // Check for active enrollments
      let enrollments = [];
      try {
        const { data: enrollmentData } = await supabase
          .from('enrollments')
          .select('course_id, status')
          .eq('user_id', user.id)
          .eq('status', 'active');
        enrollments = enrollmentData || [];
      } catch {
        // Non-critical — default to no enrollments
      }
```

Add enrollment state (after line 54):

```javascript
  const [enrollments, setEnrollments] = useState([]);
```

In the `loadData` try block, after `setProgress(progressData)` (line 73), add:

```javascript
      setEnrollments(enrollments);
```

In the return object (after `overallProgress` around line 185), add:

```javascript
    hasActiveEnrollment: enrollments.length > 0,
```

- [ ] **Step 2: Update CoursePortal access check**

In `src/CoursePortal.jsx`, destructure `hasActiveEnrollment` from `useCourseData` (line 25-34):

```javascript
  const {
    course,
    loading,
    error,
    toggleLessonComplete,
    isLessonCompleted,
    getModuleProgress,
    overallProgress,
    hasActiveEnrollment,
    refetch,
  } = useCourseData();
```

Update the module access check (line 50):

```javascript
      if (mod && !mod.is_preview && !isAdmin && !hasActiveEnrollment) {
        denied = true;
      }
```

Update the lesson access check (line 64):

```javascript
      if (lesson && !lesson.is_preview && !mod.is_preview && !isAdmin && !hasActiveEnrollment) {
        denied = true;
        lesson = null;
      }
```

Add `hasActiveEnrollment` to the useMemo dependency array (line 75):

```javascript
  }, [course, moduleSlug, lessonSlug, isAdmin, hasActiveEnrollment]);
```

- [ ] **Step 3: Update access denied screen with purchase CTA**

In `src/CoursePortal.jsx`, update the access denied block (lines 117-142). Replace the content inside the `isAccessDenied` block:

```jsx
  if (isAccessDenied) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-6 max-w-md text-center px-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="font-drama italic text-3xl text-primary mb-3">
              This Content Is Locked
            </h2>
            <p className="font-sans text-foreground/60 leading-relaxed">
              This module is part of the full Healing Hearts Program.
              Explore the free preview to experience what is inside, or learn
              more about the program.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate('/course')}
              className="px-8 py-3 rounded-full text-sm font-medium text-white bg-accent hover:bg-accent/90 transition-colors shadow-lg"
            >
              Learn About the Program
            </button>
            <button
              onClick={() => navigate('/portal')}
              className="px-8 py-3 rounded-full text-sm font-medium text-primary border border-primary/20 hover:bg-primary/5 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }
```

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useCourseData.js src/CoursePortal.jsx
git commit -m "feat: portal enrollment awareness + access denied CTA"
```

---

## Task 10: Downloads Portal Page

**Files:**
- Create: `src/portal/Downloads.jsx`
- Modify: `src/App.jsx`
- Modify: `src/portal/PortalDashboard.jsx`

- [ ] **Step 1: Create the Downloads page**

Create `src/portal/Downloads.jsx`:

```jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Download, Package, ArrowLeft, ShoppingBag } from 'lucide-react';

export default function Downloads() {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function loadPurchases() {
      try {
        // Query completed orders (no FK join -- orders.product_slug is text, not FK)
        const { data: orders } = await supabase
          .from('orders')
          .select('id, product_slug, created_at')
          .eq('auth_user_id', user.id)
          .eq('status', 'completed');

        if (!orders || orders.length === 0) {
          setPurchases([]);
          return;
        }

        // Fetch matching products separately
        const slugs = [...new Set(orders.map((o) => o.product_slug))];
        const { data: products } = await supabase
          .from('products')
          .select('slug, name, description, access_grants')
          .in('slug', slugs);

        const productMap = Object.fromEntries(
          (products || []).map((p) => [p.slug, p])
        );

        // Filter to download-type products only
        const downloads = orders
          .filter((o) => productMap[o.product_slug]?.access_grants?.type === 'download')
          .map((o) => ({ ...o, product: productMap[o.product_slug] }));

        setPurchases(downloads);
      } catch (err) {
        console.error('Failed to load purchases:', err);
      } finally {
        setLoading(false);
      }
    }

    loadPurchases();
  }, [user]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background">
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link
            to="/portal"
            className="p-2 rounded-full hover:bg-primary/5 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-primary" />
          </Link>
          <div>
            <h1 className="font-outfit font-bold text-2xl text-primary">
              Your Downloads
            </h1>
            <p className="font-sans text-foreground/60 text-sm">
              Access your purchased resources
            </p>
          </div>
        </div>

        {/* Downloads list */}
        {purchases.length === 0 ? (
          <div className="flex flex-col items-center gap-6 py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center">
              <Package className="w-8 h-8 text-primary/40" />
            </div>
            <div>
              <h2 className="font-outfit font-semibold text-lg text-primary mb-2">
                No Downloads Yet
              </h2>
              <p className="font-sans text-foreground/60 text-sm max-w-sm">
                When you purchase downloadable resources, they will appear here.
              </p>
            </div>
            <Link
              to="/rescue-kit"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium text-white bg-accent hover:bg-accent/90 transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              Browse Resources
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {purchases.map((purchase) => (
              <div
                key={purchase.id}
                className="border border-primary/10 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white"
              >
                <div>
                  <h3 className="font-outfit font-semibold text-primary">
                    {purchase.product?.name || purchase.product_slug}
                  </h3>
                  <p className="font-sans text-foreground/50 text-sm mt-1">
                    {purchase.product?.description}
                  </p>
                  <p className="font-sans text-foreground/40 text-xs mt-2">
                    Purchased {new Date(purchase.created_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium text-white bg-primary hover:bg-primary/90 transition-colors shrink-0"
                  onClick={() => {
                    // Supabase Storage signed URL would go here
                    // For now, show a placeholder
                    alert('Download link will be available once files are uploaded to Supabase Storage.');
                  }}
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add route in App.jsx**

In `src/App.jsx`, add the import (after the `CheckoutSuccess` import):

```javascript
import Downloads from './portal/Downloads';
```

Add a protected route (after the existing portal routes, around line 123):

```jsx
            <Route
              path="/portal/downloads"
              element={
                <ProtectedRoute>
                  <Downloads />
                </ProtectedRoute>
              }
            />
```

- [ ] **Step 3: Add Downloads link to PortalDashboard**

In `src/portal/PortalDashboard.jsx`, add `Download` to the Lucide imports (line 8):

```javascript
import {
  BookOpen,
  Clock,
  Flame,
  Lock,
  ChevronRight,
  ChevronLeft,
  Quote,
  Download,
} from 'lucide-react';
```

Find the navigation area in the dashboard (near the welcome section or module list header) and add a Downloads link:

```jsx
<Link
  to="/portal/downloads"
  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-primary border border-primary/20 hover:bg-primary/5 transition-colors"
>
  <Download className="w-4 h-4" />
  My Downloads
</Link>
```

- [ ] **Step 4: Create Supabase Storage bucket**

In the Supabase Dashboard -> Storage -> Create bucket:
- Name: `downloads`
- Public: No (private -- signed URLs only)
- File size limit: 50MB

Upload placeholder files for testing:
- `downloads/rescue-kit/conflict-rescue-kit.pdf`
- `downloads/card-pack/healing-hearts-card-pack.pdf`

Note: The download button currently shows an alert until real files are uploaded. Replace the `onClick` handler with a Supabase Storage signed URL call when files are ready:
```javascript
const { data } = await supabase.storage
  .from('downloads')
  .createSignedUrl(`${purchase.product?.access_grants?.download_slug}/filename.pdf`, 86400);
if (data?.signedUrl) window.open(data.signedUrl, '_blank');
```

- [ ] **Step 5: Commit**

```bash
git add src/portal/Downloads.jsx src/App.jsx src/portal/PortalDashboard.jsx
git commit -m "feat: add portal Downloads page with purchase list"
```

---

## Task 11: Expo Payment Links Setup (No Code)

**Files:** None (Stripe Dashboard + QR code SOP)

This task is done entirely in the Stripe Dashboard and uses the existing QR code SOP. No code changes needed — Payment Links use Stripe Checkout under the hood, so the same webhook handles everything.

- [ ] **Step 1: Create Payment Links in Stripe Dashboard**

Go to Stripe Dashboard -> Payment Links -> Create:

1. **Rescue Kit Payment Link:**
   - Product: Conflict Rescue Kit ($39)
   - Enable "Allow promotion codes"
   - After payment: redirect to `https://healingheartscourse.com/checkout/success?session_id={CHECKOUT_SESSION_ID}`

2. **Card Pack Payment Link:**
   - Product: Healing Hearts Card Pack ($35)
   - Same settings as above

Copy both Payment Link URLs.

- [ ] **Step 2: Add UTM params to each link**

Append tracking params:
```
https://buy.stripe.com/XXXXX?utm_source=expo-booth&utm_campaign=be-healthy-2026
```

- [ ] **Step 3: Generate QR codes**

Use the existing QR code SOP at `Projects/ai-os/sops/qr-code-generation-sop.md` to generate QR codes for each Payment Link URL (with UTM params).

- [ ] **Step 4: Create print collateral**

Design QR code signs for the booth:
- One sign per product (product name + price + QR code)
- Include text: "Scan to purchase -- instant access"
- Mobile-friendly sizing (QR code at least 2x2 inches)

---

## Task 12: Private Checkout Documentation

**Files:** None (documentation only)

The full course ($12,997) uses the same `/api/checkout` endpoint but is not publicly listed. This task documents the admin workflow.

- [ ] **Step 1: Document the private checkout process**

The workflow for creating a private checkout link:

```bash
# From any terminal with access to the Stripe sandbox key:
curl -X POST https://healingheartscourse.com/api/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "slug": "full-course",
    "email": "customer@example.com",
    "source": "close-process"
  }'

# Response: { "url": "https://checkout.stripe.com/c/pay/cs_..." }
# Send this URL to the customer via email.
```

Alternatively, create the checkout session directly in Stripe Dashboard:
1. Go to Products -> Healing Hearts Journey Program
2. Click "Create payment link" or share the price link directly
3. Send to the customer

This will be replaced by an admin panel action in Approach B (future).

---

## Task 13: Email Mismatch Fallback (Post-Launch)

**Files:** None (documentation only — deferred implementation)

Per the spec, this is a lower-priority feature that can ship after launch. Documenting it here so it is not forgotten.

**What to build later:**
- Add "Purchased with a different email?" link on the Downloads page and portal settings
- User enters the email they used at checkout
- System checks `crm_contacts.email` match + `orders.status = 'completed'`
- If match: links the contact to their `auth_user_id`, processes `access_grants`
- Rate-limited to 3 attempts per hour to prevent abuse

**For now:** The success page pre-fills the signup form with the Stripe email, which prevents ~90% of mismatches. Manual resolution by Chase via Supabase Dashboard for edge cases.

- [ ] **Step 1: Acknowledged — no code in this sprint**

---

## Task 14: Build Verification

**Files:** None (verification only)

- [ ] **Step 1: Run the build**

```bash
cd C:\Users\chase\Documents\HealingHeartsWebsite
npm run build
```

Expected: Build succeeds with no errors. Warnings about unused vars are acceptable but should be reviewed.

- [ ] **Step 2: Fix any build errors**

If the build fails, fix the issues. Common problems:
- Missing imports (check that all new files import correctly)
- Unused imports from modified files (clean up any `Link` imports that are no longer needed)
- JSX syntax errors in new components

- [ ] **Step 3: Run lint**

```bash
npm run lint
```

Fix any linting errors in new/modified files.

- [ ] **Step 4: Commit fixes if any**

```bash
git add -A
git commit -m "fix: resolve build and lint issues"
```

---

## Task 15: End-to-End Smoke Test

**Files:** None (testing only)

This task requires `vercel dev` or deploying to a preview branch since Vercel serverless functions don't run on Vite's dev server.

- [ ] **Step 1: Deploy to preview branch**

```bash
git checkout -b feature/stripe-payment-portal
git push -u origin feature/stripe-payment-portal
```

Vercel will auto-deploy a preview URL.

- [ ] **Step 2: Test checkout flow**

1. Navigate to `/rescue-kit` on the preview URL
2. Click "Get the Conflict Rescue Kit"
3. Verify redirect to Stripe Checkout with correct product ($39)
4. Complete payment with test card: `4242 4242 4242 4242`, any future expiry, any CVC
5. Verify redirect to `/checkout/success?session_id=cs_test_...`
6. Verify success page shows product name and account creation prompt

- [ ] **Step 3: Test account linking**

1. From the success page, click "Create Your Account"
2. Verify email is pre-filled on the signup page
3. Create the account
4. Navigate to `/portal/downloads`
5. Verify the Rescue Kit appears in the downloads list

- [ ] **Step 4: Test webhook (requires Stripe webhook registration)**

1. In Stripe Dashboard -> Developers -> Webhooks -> Add endpoint
2. URL: `https://[preview-url]/api/webhooks/stripe`
3. Events: `checkout.session.completed`
4. Copy the `whsec_...` signing secret
5. Add `STRIPE_WEBHOOK_SECRET` to Vercel env vars for the preview deployment
6. Make another test purchase and verify:
   - Order status updates to `completed` in Supabase
   - CRM contact stage updates to `customer`

- [ ] **Step 5: Test portal enrollment gating**

1. Log in as a non-admin user
2. Navigate to a non-preview module (e.g., Module 1)
3. Verify the "This Content Is Locked" screen appears
4. Verify the "Learn About the Program" CTA is present
5. If the user has an active enrollment, verify they can access the content

- [ ] **Step 6: Document any issues**

Create a list of any bugs found during testing. Fix critical issues before merging.

---

## Task 16: Code Review

**Files:** All new and modified files

- [ ] **Step 1: Request code review**

Use `superpowers:requesting-code-review` to review all changes against the spec. The reviewer should verify:

1. All 13 spec components are implemented
2. No hardcoded product data remains in `checkout.js`
3. Webhook is idempotent (duplicate session IDs don't create duplicate orders)
4. Success page verifies session server-side (not trusting URL params)
5. Portal access check includes `hasActiveEnrollment`
6. RLS policies on `products` table are correct
7. No `dangerouslySetInnerHTML` in any new file
8. No Stripe secret key exposed to frontend
9. All SQL uses ASCII only (no em dashes, smart quotes)
10. `allow_promotion_codes: true` is set on checkout sessions

- [ ] **Step 2: Address review feedback**

Fix any issues found during review.

- [ ] **Step 3: Final commit and merge readiness**

```bash
git add -A
git commit -m "fix: address code review feedback"
```

The branch is ready for merge to master when all tests pass and review is complete.
