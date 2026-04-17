// Vercel Serverless Function: POST /api/webhooks/stripe
// Handles Stripe webhook events. Currently: checkout.session.completed.
// Source of truth for payment confirmation -- success page is UX only.

import Stripe from 'stripe';
import { Resend } from 'resend';
import { supabaseAdmin } from '../_lib/supabase-admin.js';
import { downloadPurchaseEmail, enrollmentPurchaseEmail } from '../_emails/purchase-confirmation.js';
import { sendRescueKitWelcome } from '../_emails/rescue-kit-welcome.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
// Resolve signing secret from any of the known env var names. Session 93's
// dual-mode expansion introduced _LIVE/_TEST variants; the original
// STRIPE_WEBHOOK_SECRET is still the production default. Fall back through
// all three so a missed rename in Vercel doesn't brick the webhook.
const webhookSecret =
  process.env.STRIPE_WEBHOOK_SECRET ||
  process.env.STRIPE_WEBHOOK_SECRET_LIVE ||
  process.env.STRIPE_WEBHOOK_SECRET_TEST;

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
    // Return 200 so Stripe stops retrying (retries won't fix a missing env var).
    // This is loud on purpose — fix the Vercel env var ASAP when this fires.
    console.error('[webhook] CRITICAL: STRIPE_WEBHOOK_SECRET not configured — events are being acknowledged without processing. Set the env var in Vercel immediately.');
    return res.status(200).json({ received: false, error: 'webhook_not_configured' });
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
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;
      case 'checkout.session.expired':
        await handleSessionExpired(event.data.object);
        break;
      case 'charge.refunded':
        await handleChargeRefunded(event.data.object);
        break;
      case 'charge.dispute.created':
        await handleDisputeCreated(event.data.object);
        break;
      case 'charge.dispute.closed':
        await handleDisputeClosed(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;
      default:
        // Unhandled event type -- acknowledge without processing
        console.log('[webhook] Unhandled event type:', event.type);
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
  let productSlug = session.metadata?.product_slug;
  const source = session.metadata?.source || '';

  // Fallback: if metadata didn't carry product_slug, resolve it from the
  // session's line-item price_id against products.stripe_price_id. This
  // covers Payment Links (Stripe Dashboard UI doesn't always expose link
  // metadata), manually-created Checkout Sessions, admin tools, etc.
  if (!productSlug) {
    try {
      const fullSession = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['line_items.data.price'],
      });
      const priceId = fullSession.line_items?.data?.[0]?.price?.id;
      if (priceId) {
        const { data: priceMatch } = await supabaseAdmin
          .from('products')
          .select('slug')
          .eq('stripe_price_id', priceId)
          .maybeSingle();
        if (priceMatch?.slug) {
          productSlug = priceMatch.slug;
          console.log('[webhook] Resolved product_slug via price_id fallback:', { sessionId, priceId, productSlug });
        }
      }
    } catch (fallbackErr) {
      console.error('[webhook] price_id fallback failed:', fallbackErr.message);
    }
  }

  if (!customerEmail || !productSlug) {
    // Missing metadata AND no price_id match -- permanent error, don't retry
    console.error('[webhook] Missing email or product_slug in session (after fallback):', sessionId);
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
    .select('id, name')
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

  // Look up product (access_grants for enrollment, name for confirmation email)
  const { data: product } = await supabaseAdmin
    .from('products')
    .select('name, access_grants')
    .eq('slug', productSlug)
    .single();

  if (!product) {
    throw new Error(`Product not found: ${productSlug}`);
  }

  // Resolve auth user via admin API — auth.users is not queryable through PostgREST.
  const authUserId = await findAuthUserIdByEmail(customerEmail);

  // Normalize access_grants into a flat enrollment list (supports single + multi shapes).
  const enrollmentGrants = collectEnrollmentGrants(product.access_grants);

  if (authUserId && enrollmentGrants.length > 0) {
    for (const grant of enrollmentGrants) {
      await supabaseAdmin.from('enrollments').upsert(
        {
          user_id: authUserId,
          course_id: grant.course_id,
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
  if (resend && product) {
    try {
      // Fetch the receipt URL + invoice URL so the email can link to both.
      // Expand latest_charge on the payment intent to get receipt_url in one call.
      let receiptUrl = null;
      let invoiceUrl = null;
      if (paymentIntent) {
        try {
          const pi = await stripe.paymentIntents.retrieve(paymentIntent, {
            expand: ['latest_charge', 'invoice'],
          });
          receiptUrl = pi.latest_charge?.receipt_url || null;
          invoiceUrl = pi.invoice?.hosted_invoice_url || null;
        } catch (piErr) {
          console.error('[webhook] Could not fetch payment intent details:', piErr.message);
        }
      }

      const emailData = enrollmentGrants.length > 0
        ? enrollmentPurchaseEmail(customerEmail, contact?.name, { receiptUrl, invoiceUrl })
        : downloadPurchaseEmail(customerEmail, product.name, { receiptUrl, invoiceUrl });

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

  // Rescue Kit drip onboarding: seed the drip row so the daily cron
  // sends Day 3 check-in and Day 7 progress + upsell emails.
  // Only for the rescue-kit product (download, not enrollment).
  if (productSlug === 'rescue-kit') {
    try {
      await supabaseAdmin
        .from('rescue_kit_drip')
        .upsert(
          {
            email: customerEmail,
            name: contact?.name || null,
            purchased_at: new Date().toISOString(),
            current_day: 0,
            unsubscribed: false,
          },
          { onConflict: 'email', ignoreDuplicates: true }
        );

      // Send welcome email immediately (best-effort, non-blocking)
      try {
        const welcomeResult = await sendRescueKitWelcome(customerEmail, contact?.name || null);
        if (!welcomeResult.sent) {
          console.warn('[webhook] Rescue Kit welcome email not sent:', welcomeResult.reason);
        }
      } catch (welcomeErr) {
        console.error('[webhook] Rescue Kit welcome email threw (non-blocking):', welcomeErr.message);
      }
    } catch (dripErr) {
      // Log but don't throw — drip failure should not block payment confirmation
      console.error('[webhook] rescue_kit_drip upsert failed (non-blocking):', dripErr.message);
    }
  }

  console.log('[webhook] Processed checkout.session.completed:', {
    session: sessionId,
    email: customerEmail,
    product: productSlug,
    userFound: !!authUserId,
  });
}

// ─── Session expired ─────────────────────────────────────
// Customer started checkout but did not pay within the 24h window.
// Stripe fires this to let us clean up stale pending orders.
async function handleSessionExpired(session) {
  const { error } = await supabaseAdmin
    .from('orders')
    .update({ status: 'failed', updated_at: new Date().toISOString() })
    .eq('stripe_session_id', session.id)
    .eq('status', 'pending');

  if (error) {
    console.error('[webhook] Failed to mark session expired:', error.message);
    throw error;
  }

  console.log('[webhook] Marked expired session as failed:', session.id);
}

// ─── Charge refunded ─────────────────────────────────────
// Refund issued via Stripe Dashboard or API. Revoke enrollment,
// flip order status, and downgrade CRM stage from customer to lead.
async function handleChargeRefunded(charge) {
  const paymentIntent = charge.payment_intent;
  if (!paymentIntent) {
    console.error('[webhook] Refund missing payment_intent:', charge.id);
    return;
  }

  // Look up the order
  const { data: order } = await supabaseAdmin
    .from('orders')
    .select('id, contact_id, auth_user_id, product_slug')
    .eq('stripe_payment_intent', paymentIntent)
    .maybeSingle();

  if (!order) {
    console.error('[webhook] Refund: no order found for payment_intent:', paymentIntent);
    return; // Not retryable -- bad data or a direct Stripe-dashboard charge
  }

  // Mark order refunded
  await supabaseAdmin
    .from('orders')
    .update({ status: 'refunded', updated_at: new Date().toISOString() })
    .eq('id', order.id);

  // If the product grants enrollment, revoke it
  const { data: product } = await supabaseAdmin
    .from('products')
    .select('access_grants')
    .eq('slug', order.product_slug)
    .single();

  const refundGrants = collectEnrollmentGrants(product?.access_grants);
  if (order.auth_user_id && refundGrants.length > 0) {
    for (const grant of refundGrants) {
      await supabaseAdmin
        .from('enrollments')
        .update({ status: 'refunded' })
        .eq('user_id', order.auth_user_id)
        .eq('course_id', grant.course_id);
    }
  }
  // 'download' type: no enrollment row to revoke. Future work: soft-hide
  // the order from the Downloads page (requires a query filter change).

  // Downgrade CRM stage: customer -> lead (they were a customer, refunded back to lead)
  if (order.contact_id) {
    await supabaseAdmin
      .from('crm_contacts')
      .update({ stage: 'lead', last_activity_at: new Date().toISOString() })
      .eq('id', order.contact_id);
  }

  console.log('[webhook] Processed refund:', {
    charge: charge.id,
    order: order.id,
    user: order.auth_user_id,
  });
}

// ─── Dispute created ─────────────────────────────────────
// Customer filed a chargeback with their bank. Mark the order as
// 'disputed' (NOT revoked) and alert the team. Dispute response
// deadline is typically 7 days from this event.
async function handleDisputeCreated(dispute) {
  const chargeId = dispute.charge;
  if (!chargeId) return;

  // Fetch the charge to get the payment_intent
  const charge = await stripe.charges.retrieve(chargeId);
  const paymentIntent = charge.payment_intent;

  const { data: order } = await supabaseAdmin
    .from('orders')
    .select('id, contact_id, product_slug, amount_cents')
    .eq('stripe_payment_intent', paymentIntent)
    .maybeSingle();

  if (order) {
    await supabaseAdmin
      .from('orders')
      .update({ status: 'disputed', updated_at: new Date().toISOString() })
      .eq('id', order.id);
  }

  // Alert the team (best-effort, non-blocking)
  if (resend) {
    try {
      await resend.emails.send({
        from: 'Healing Hearts Alerts <hello@healingheartscourse.com>',
        to: 'hello@healingheartscourse.com',
        subject: `[URGENT] Chargeback dispute opened: $${(dispute.amount / 100).toFixed(2)}`,
        html: `
          <h2>Dispute Alert</h2>
          <p>A customer has filed a chargeback with their bank.</p>
          <ul>
            <li><strong>Amount:</strong> $${(dispute.amount / 100).toFixed(2)} ${dispute.currency?.toUpperCase()}</li>
            <li><strong>Reason:</strong> ${dispute.reason || 'unknown'}</li>
            <li><strong>Stripe dispute ID:</strong> ${dispute.id}</li>
            <li><strong>Charge ID:</strong> ${chargeId}</li>
            <li><strong>Due by:</strong> ${dispute.evidence_details?.due_by ? new Date(dispute.evidence_details.due_by * 1000).toLocaleString() : 'check Stripe Dashboard'}</li>
            <li><strong>Order:</strong> ${order?.id || 'not found in our DB'}</li>
            <li><strong>Product:</strong> ${order?.product_slug || 'unknown'}</li>
          </ul>
          <p><strong>Action needed:</strong> Review the dispute in the Stripe Dashboard and submit evidence before the deadline. Missing the deadline results in automatic loss + $15-25 chargeback fee.</p>
          <p><a href="https://dashboard.stripe.com/disputes/${dispute.id}">Open in Stripe Dashboard</a></p>
        `,
      });
    } catch (emailErr) {
      console.error('[webhook] Dispute alert email failed:', emailErr.message);
    }
  }

  console.log('[webhook] Dispute created:', { dispute: dispute.id, reason: dispute.reason });
}

// ─── Dispute closed ──────────────────────────────────────
// Outcome is known. If we won, restore status. If lost, revoke access.
async function handleDisputeClosed(dispute) {
  const chargeId = dispute.charge;
  if (!chargeId) return;

  const charge = await stripe.charges.retrieve(chargeId);
  const paymentIntent = charge.payment_intent;

  const { data: order } = await supabaseAdmin
    .from('orders')
    .select('id, auth_user_id, product_slug, contact_id')
    .eq('stripe_payment_intent', paymentIntent)
    .maybeSingle();

  if (!order) return;

  if (dispute.status === 'won') {
    // Dispute resolved in our favor -- restore completed status
    await supabaseAdmin
      .from('orders')
      .update({ status: 'completed', updated_at: new Date().toISOString() })
      .eq('id', order.id);
    console.log('[webhook] Dispute won, order restored:', order.id);
  } else if (dispute.status === 'lost') {
    // Dispute resolved against us -- treat as refund
    await supabaseAdmin
      .from('orders')
      .update({ status: 'refunded', updated_at: new Date().toISOString() })
      .eq('id', order.id);

    // Revoke enrollment if applicable
    const { data: product } = await supabaseAdmin
      .from('products')
      .select('access_grants')
      .eq('slug', order.product_slug)
      .single();

    const disputeGrants = collectEnrollmentGrants(product?.access_grants);
    if (order.auth_user_id && disputeGrants.length > 0) {
      for (const grant of disputeGrants) {
        await supabaseAdmin
          .from('enrollments')
          .update({ status: 'refunded' })
          .eq('user_id', order.auth_user_id)
          .eq('course_id', grant.course_id);
      }
    }

    if (order.contact_id) {
      await supabaseAdmin
        .from('crm_contacts')
        .update({ stage: 'lead' })
        .eq('id', order.contact_id);
    }
    console.log('[webhook] Dispute lost, access revoked:', order.id);
  }
}

// ─── Payment failed ──────────────────────────────────────
// Payment declined or processing error. Log for observability.
// Future: send a gentle recovery email with a new checkout link.
async function handlePaymentFailed(paymentIntent) {
  const email = paymentIntent.receipt_email ||
    paymentIntent.last_payment_error?.payment_method?.billing_details?.email ||
    null;

  const errorMessage = paymentIntent.last_payment_error?.message || 'unknown';
  const errorCode = paymentIntent.last_payment_error?.code || 'unknown';

  console.log('[webhook] Payment failed:', {
    payment_intent: paymentIntent.id,
    email,
    error_code: errorCode,
    error_message: errorMessage,
  });

  // TODO future: send "your payment didn't go through" recovery email
  // with a regenerated checkout URL. Requires the product slug, which
  // we don't have on the payment_intent alone -- need to look up via
  // the original order record if it was created.
}

// ─── Payment intent succeeded (Terminal / booth sales) ──
// Fires for BOTH online Checkout Sessions and in-person Terminal charges.
// Online sales are already handled via checkout.session.completed -- we
// filter those out by checking payment_method_types for 'card_present'.
// Only card_present (physical reader) charges get processed here.
//
// Booth SOP assumption: staff collects customer email via the "Send receipt"
// step in the Stripe Dashboard mobile app. That sets receipt_email on the PI.
// Without receipt_email we cannot grant access -- order lands as pending_email.
//
// Product inference: the Stripe app has no product concept. We map amount to
// slug (3900 -> rescue-kit, 3500 -> card-pack). Unknown amounts get flagged
// for manual reconciliation by Makayla post-event.
async function handlePaymentIntentSucceeded(paymentIntent) {
  const paymentMethodTypes = paymentIntent.payment_method_types || [];
  if (!paymentMethodTypes.includes('card_present')) {
    // Online Checkout -- already handled by checkout.session.completed. Skip.
    return;
  }

  const piId = paymentIntent.id;
  const customerEmail = (paymentIntent.receipt_email || '').toLowerCase();
  const amountCents = paymentIntent.amount;

  // Idempotency: skip if we've already recorded this PI
  const { data: existingOrder } = await supabaseAdmin
    .from('orders')
    .select('id, status')
    .eq('stripe_payment_intent', piId)
    .maybeSingle();

  if (existingOrder && existingOrder.status === 'completed') {
    console.log('[webhook] Terminal PI already processed:', piId);
    return;
  }

  // Amount -> product slug map. Keep in sync with migration 016 prices.
  const productSlug =
    amountCents === 3900 ? 'rescue-kit'
    : amountCents === 3500 ? 'card-pack'
    : null;

  // Error paths: we can't insert into orders (contact_id NOT NULL) without a
  // valid email + mapped product. Log loud and rely on Makayla reconciling via
  // Stripe Dashboard + booth paper log after the event. Vercel log retention is
  // 30 days — fine for a 2-day expo.
  if (!productSlug) {
    console.error('[webhook] BOOTH_RECONCILE unmapped_amount:', { piId, amountCents, email: customerEmail || null });
    return;
  }

  if (!customerEmail) {
    console.error('[webhook] BOOTH_RECONCILE missing_receipt_email:', { piId, productSlug, amountCents });
    return;
  }

  // Upsert CRM contact (booth sales are a high-intent lead -> customer event)
  const { data: contact } = await supabaseAdmin
    .from('crm_contacts')
    .upsert(
      {
        email: customerEmail,
        stage: 'customer',
        source: 'expo-booth',
        last_activity_at: new Date().toISOString(),
      },
      { onConflict: 'email', ignoreDuplicates: false }
    )
    .select('id, name')
    .single();

  if (!contact) {
    throw new Error(`Failed to upsert CRM contact for booth sale: ${customerEmail}`);
  }

  // Insert or update order
  if (existingOrder) {
    await supabaseAdmin
      .from('orders')
      .update({
        status: 'completed',
        contact_id: contact.id,
        product_slug: productSlug,
        amount_cents: amountCents,
        metadata: { source: 'expo-booth' },
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingOrder.id);
  } else {
    await supabaseAdmin.from('orders').insert({
      contact_id: contact.id,
      stripe_payment_intent: piId,
      product_slug: productSlug,
      amount_cents: amountCents,
      currency: paymentIntent.currency || 'usd',
      status: 'completed',
      metadata: { source: 'expo-booth' },
    });
  }

  // Look up product metadata (access_grants + name for the confirmation email)
  const { data: product } = await supabaseAdmin
    .from('products')
    .select('name, access_grants')
    .eq('slug', productSlug)
    .single();

  if (!product) {
    throw new Error(`Product not found for booth sale: ${productSlug}`);
  }

  // Grant enrollment if the product is enrollment-type (rescue-kit + card-pack
  // are download type, so this will be a no-op for booth sales today).
  const authUserId = await findAuthUserIdByEmail(customerEmail);
  const enrollmentGrants = collectEnrollmentGrants(product.access_grants);

  if (authUserId && enrollmentGrants.length > 0) {
    for (const grant of enrollmentGrants) {
      await supabaseAdmin.from('enrollments').upsert(
        {
          user_id: authUserId,
          course_id: grant.course_id,
          status: 'active',
          stripe_payment_id: piId,
        },
        { onConflict: 'user_id,course_id' }
      );
    }
  }

  if (authUserId) {
    await supabaseAdmin
      .from('orders')
      .update({ auth_user_id: authUserId })
      .eq('stripe_payment_intent', piId);
  }

  // Purchase confirmation email (best-effort, non-blocking)
  if (resend) {
    try {
      // Use the same retrieve-with-expand pattern as handleCheckoutCompleted —
      // raw webhook `charges` field is deprecated in newer API versions.
      let receiptUrl = null;
      try {
        const pi = await stripe.paymentIntents.retrieve(piId, { expand: ['latest_charge'] });
        receiptUrl = pi.latest_charge?.receipt_url || null;
      } catch (piErr) {
        console.error('[webhook] Booth: could not fetch PI for receipt URL:', piErr.message);
      }

      const emailData = enrollmentGrants.length > 0
        ? enrollmentPurchaseEmail(customerEmail, contact?.name, { receiptUrl })
        : downloadPurchaseEmail(customerEmail, product.name, { receiptUrl });

      await resend.emails.send({
        from: 'Healing Hearts <hello@healingheartscourse.com>',
        to: customerEmail,
        subject: emailData.subject,
        html: emailData.html,
      });
    } catch (emailErr) {
      console.error('[webhook] Booth confirmation email failed (non-blocking):', emailErr.message);
    }
  }

  // Rescue Kit drip onboarding (mirrors the online flow)
  if (productSlug === 'rescue-kit') {
    try {
      await supabaseAdmin
        .from('rescue_kit_drip')
        .upsert(
          {
            email: customerEmail,
            name: contact?.name || null,
            purchased_at: new Date().toISOString(),
            current_day: 0,
            unsubscribed: false,
          },
          { onConflict: 'email', ignoreDuplicates: true }
        );
      try {
        await sendRescueKitWelcome(customerEmail, contact?.name || null);
      } catch (welcomeErr) {
        console.error('[webhook] Booth rescue-kit welcome email threw (non-blocking):', welcomeErr.message);
      }
    } catch (dripErr) {
      console.error('[webhook] Booth rescue_kit_drip upsert failed (non-blocking):', dripErr.message);
    }
  }

  console.log('[webhook] Processed Terminal/booth payment_intent.succeeded:', {
    pi: piId,
    email: customerEmail,
    product: productSlug,
    amount: amountCents,
    userFound: !!authUserId,
  });
}

// ─── Helpers ─────────────────────────────────────────────

// auth.users is not queryable via PostgREST. Use the admin API instead.
async function findAuthUserIdByEmail(email) {
  if (!email) return null;
  try {
    const { data: listResult } = await supabaseAdmin.auth.admin.listUsers();
    const match = listResult?.users?.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    );
    return match?.id || null;
  } catch (err) {
    console.error('[webhook] findAuthUserIdByEmail failed:', err.message);
    return null;
  }
}

// Normalize access_grants into a flat list of enrollment grants.
// Supports both shapes:
//   { type: 'enrollment', course_id: '...' }
//   { type: 'multi', grants: [{ type: 'enrollment', course_id: '...' }, ...] }
// Returns [] for download-only or unrecognized shapes.
function collectEnrollmentGrants(accessGrants) {
  if (!accessGrants) return [];
  if (accessGrants.type === 'enrollment' && accessGrants.course_id) {
    return [{ course_id: accessGrants.course_id }];
  }
  if (accessGrants.type === 'multi' && Array.isArray(accessGrants.grants)) {
    return accessGrants.grants
      .filter((g) => g?.type === 'enrollment' && g.course_id)
      .map((g) => ({ course_id: g.course_id }));
  }
  return [];
}

