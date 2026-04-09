// Vercel Serverless Function: POST /api/webhooks/stripe
// Handles Stripe webhook events. Currently: checkout.session.completed.
// Source of truth for payment confirmation -- success page is UX only.

import Stripe from 'stripe';
import { Resend } from 'resend';
import { supabaseAdmin } from '../_lib/supabase-admin.js';
import { downloadPurchaseEmail, enrollmentPurchaseEmail } from '../_emails/purchase-confirmation.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
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
  try {
    if (event.type === 'checkout.session.completed') {
      await handleCheckoutCompleted(event.data.object);
    }
    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('[webhook] Processing failed, Stripe will retry:', err.message);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
}

async function handleCheckoutCompleted(session) {
  const sessionId = session.id;
  const customerEmail = (session.customer_details?.email || session.customer_email || '').toLowerCase();
  const paymentIntent = session.payment_intent;
  const productSlug = session.metadata?.product_slug;
  const source = session.metadata?.source || '';

  if (!customerEmail || !productSlug) {
    // Missing metadata is a permanent error -- don't retry
    console.error('[webhook] Missing email or product_slug in session:', sessionId);
    return; // Return without throwing so Stripe gets 200 (no point retrying bad data)
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
    throw new Error(`Failed to upsert CRM contact for: ${customerEmail}`);
  }

  // Update or create order
  const { data: existingPending } = await supabaseAdmin
    .from('orders')
    .select('id')
    .eq('stripe_session_id', sessionId)
    .maybeSingle();

  if (existingPending) {
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
    throw new Error(`Product not found: ${productSlug}`);
  }

  // Check if an auth user already exists with this email.
  // Query auth.users directly via the service role client.
  let authUserId = null;
  const { data: authUserRows } = await supabaseAdmin
    .from('auth.users')
    .select('id')
    .eq('email', customerEmail)
    .limit(1)
    .maybeSingle();

  if (authUserRows?.id) {
    authUserId = authUserRows.id;
  } else {
    // Fallback: use admin API (auth.users may not be queryable via PostgREST)
    const { data: listResult } = await supabaseAdmin.auth.admin.listUsers();
    const match = listResult?.users?.find(
      (u) => u.email?.toLowerCase() === customerEmail
    );
    authUserId = match?.id || null;
  }

  if (authUserId && product.access_grants?.type === 'enrollment') {
    const courseId = product.access_grants.course_id;
    if (courseId) {
      await supabaseAdmin.from('enrollments').upsert(
        {
          user_id: authUserId,
          course_id: courseId,
          status: 'active',
          stripe_payment_id: paymentIntent,
        },
        { onConflict: 'user_id,course_id' }
      );
    }
  }

  // Link order to auth user if they exist
  if (authUserId) {
    await supabaseAdmin
      .from('orders')
      .update({ auth_user_id: authUserId })
      .eq('stripe_session_id', sessionId);
  }

  // Send purchase confirmation email (best-effort, non-blocking)
  if (resend) {
    try {
      const productRecord = await supabaseAdmin
        .from('products')
        .select('name, access_grants')
        .eq('slug', productSlug)
        .single();

      const prodName = productRecord?.data?.name || productSlug;
      const grantType = productRecord?.data?.access_grants?.type;

      const emailData = grantType === 'enrollment'
        ? enrollmentPurchaseEmail(customerEmail, contact?.name)
        : downloadPurchaseEmail(customerEmail, prodName);

      await resend.emails.send({
        from: 'Healing Hearts <hello@healingheartscourse.com>',
        to: customerEmail,
        subject: emailData.subject,
        html: emailData.html,
      });
    } catch (emailErr) {
      // Log but don't throw -- email failure should not block payment processing
      console.error('[webhook] Confirmation email failed (non-blocking):', emailErr.message);
    }
  }

  console.log('[webhook] Processed checkout.session.completed:', {
    session: sessionId,
    email: customerEmail,
    product: productSlug,
    userFound: !!authUserId,
  });
}
