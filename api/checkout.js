/* global process */
// Vercel Serverless Function: POST /api/checkout
// Creates a Stripe Checkout Session for the Conflict Rescue Kit ($39).
// Upserts a CRM contact and creates a pending order in Supabase.

import Stripe from 'stripe';
import { supabaseAdmin } from './_lib/supabase-admin.js';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

const SITE_URL = process.env.SITE_URL || 'https://healingheartscourse.com';

// Product catalog — single source of truth for checkout
const PRODUCTS = {
  'rescue-kit': {
    name: 'The Conflict Rescue Kit',
    description: 'SPARK Method frameworks, Critter Brain guide, reflection prompts & more',
    amount_cents: 3900,
    currency: 'usd',
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!stripe) {
    return res.status(503).json({ error: 'Payments are not configured yet. Check back soon!' });
  }

  try {
    const { product = 'rescue-kit', email } = req.body || {};

    // Validate product exists
    const productInfo = PRODUCTS[product];
    if (!productInfo) {
      return res.status(400).json({ error: 'Unknown product' });
    }

    // Build Stripe Checkout Session params
    const sessionParams = {
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: productInfo.currency,
            product_data: {
              name: productInfo.name,
              description: productInfo.description,
            },
            unit_amount: productInfo.amount_cents,
          },
          quantity: 1,
        },
      ],
      success_url: `${SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/rescue-kit`,
      metadata: {
        product_slug: product,
      },
    };

    // Pre-fill email if provided
    if (email && typeof email === 'string' && email.includes('@')) {
      sessionParams.customer_email = email.trim().toLowerCase();
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create(sessionParams);

    // Upsert CRM contact (best-effort, don't block checkout)
    if (sessionParams.customer_email) {
      try {
        const { data: contact } = await supabaseAdmin
          .from('crm_contacts')
          .upsert(
            {
              email: sessionParams.customer_email,
              source: 'rescue-kit',
              last_activity_at: new Date().toISOString(),
            },
            { onConflict: 'email', ignoreDuplicates: false }
          )
          .select('id')
          .single();

        // Create pending order
        if (contact) {
          await supabaseAdmin.from('orders').insert({
            contact_id: contact.id,
            stripe_session_id: session.id,
            product_slug: product,
            amount_cents: productInfo.amount_cents,
            currency: productInfo.currency,
            status: 'pending',
          });
        }
      } catch (dbErr) {
        // Log but don't block — Stripe is the source of truth
        console.error('[checkout] DB upsert error (non-blocking):', dbErr.message);
      }
    }

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('[checkout] Stripe session creation failed:', err.message);
    return res.status(500).json({ error: 'Unable to create checkout session. Please try again.' });
  }
}
