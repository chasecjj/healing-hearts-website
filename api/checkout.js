// Vercel Serverless Function: /api/checkout
// POST: Creates a Stripe Checkout Session for any product in the products table.
// GET:  Verifies a completed session (used by success page).

import Stripe from 'stripe';
import crypto from 'crypto';
import { supabaseAdmin } from './_lib/supabase-admin.js';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

// Detect Stripe mode from secret key prefix. Test keys start with sk_test_,
// live keys start with sk_live_. This determines which price ID column we
// query in the products table.
const IS_TEST_MODE = process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_') ?? false;

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
    const { slug, email, source, cancel_path: rawCancelPath } = req.body || {};

    if (!slug || typeof slug !== 'string') {
      return res.status(400).json({ error: 'Missing product slug' });
    }

    // Validate cancel_path to prevent open redirect
    const cancel_path = (typeof rawCancelPath === 'string' && rawCancelPath.startsWith('/') && !rawCancelPath.startsWith('//'))
      ? rawCancelPath
      : '/';

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

    // Select the correct Stripe price ID based on mode.
    // Test keys must use test price IDs; live keys must use live price IDs.
    const priceId = IS_TEST_MODE ? product.stripe_price_id_test : product.stripe_price_id;

    if (!priceId) {
      return res.status(500).json({
        error: `Product "${slug}" is not configured for ${IS_TEST_MODE ? 'test' : 'live'} mode. Missing ${IS_TEST_MODE ? 'stripe_price_id_test' : 'stripe_price_id'}.`
      });
    }

    // Build Stripe Checkout Session params
    const sessionParams = {
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}${cancel_path || '/'}`,
      allow_promotion_codes: true,
      // Require explicit Terms acceptance. The custom_text message also
      // includes the 18+ affirmation (COPPA/FTC compliance) and links to
      // the Refund Policy per card-network disclosure rules.
      consent_collection: {
        terms_of_service: 'required',
      },
      custom_text: {
        terms_of_service_acceptance: {
          message: 'I am 18 or older and I agree to the [Terms of Service](https://www.healingheartscourse.com/terms) and [Refund Policy](https://www.healingheartscourse.com/refund-policy).',
        },
      },
      // Generate a formal Stripe Invoice (with PDF) for every purchase.
      // Customers get an invoice email from Stripe + we get queryable
      // Invoice objects for bookkeeping and chargebacks.
      invoice_creation: {
        enabled: true,
        invoice_data: {
          description: `Healing Hearts: ${product.name}`,
          metadata: {
            product_slug: slug,
            source: source || '',
          },
          footer: 'Thank you for investing in your relationship. If you have any questions about your order, reply to this email or contact hello@healingheartscourse.com.',
        },
      },
      metadata: {
        product_slug: slug,
        source: source || '',
      },
    };

    // Pre-fill email if provided
    if (email && typeof email === 'string' && email.includes('@')) {
      sessionParams.customer_email = email.trim().toLowerCase();
    }

    // Idempotency key: prevent duplicate session creation on double-click
    // or network retry. Keyed to slug + email + 5-minute bucket so legitimate
    // retries within ~5 min return the same session rather than creating duplicates.
    const bucket = Math.floor(Date.now() / (5 * 60 * 1000));
    const idempotencyKey = crypto
      .createHash('sha256')
      .update(`${slug}:${sessionParams.customer_email || 'anon'}:${bucket}`)
      .digest('hex')
      .slice(0, 40);

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create(sessionParams, {
      idempotencyKey,
    });

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
