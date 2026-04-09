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
