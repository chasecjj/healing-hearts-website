// [BRANCH_DO_NOT_MERGE_UNTIL_IDS_PROVISIONED]
// Real IDs live in Meta Events Manager (Business Manager > Data Sources)
// and GA Admin (Property > Data Streams). Swap via:
//   1. Set META_PIXEL_ID + GA_MEASUREMENT_ID in Vercel env (prod + preview)
//   2. Update index.html to read from import.meta.env.VITE_META_PIXEL_ID
//      and VITE_GA_MEASUREMENT_ID (Vite exposes VITE_* at build time)
//   3. Remove this comment block when ready to merge
//
// See docs/pixel-ga-swap-in.md for full provisioning walkthrough.

/**
 * Analytics helpers — Meta Pixel + Google Analytics 4
 *
 * Sentinel values that mean "not yet provisioned":
 *   __META_PIXEL_ID__        — replaced by real 15-16 digit pixel ID
 *   __GA_MEASUREMENT_ID__    — replaced by real G-XXXXXXXXXX measurement ID
 *
 * All functions no-op silently when the sentinel is still present, so this
 * code is safe to deploy before IDs are provisioned.
 *
 * Meta Pixel:  https://business.facebook.com/events_manager
 * Google GA4:  https://analytics.google.com  (Admin > Data Streams)
 */

// ---------------------------------------------------------------------------
// Sentinels — DO NOT replace these directly in this file.
// Set VITE_META_PIXEL_ID and VITE_GA_MEASUREMENT_ID in Vercel env instead,
// then update index.html to inject them. These fallbacks keep the build
// working while provisioning is in progress.
// ---------------------------------------------------------------------------
const META_PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID || '__META_PIXEL_ID__';
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || '__GA_MEASUREMENT_ID__';

// ---------------------------------------------------------------------------
// Internal readiness checks
// ---------------------------------------------------------------------------

function isMetaReady() {
  return (
    META_PIXEL_ID !== '__META_PIXEL_ID__' &&
    typeof window !== 'undefined' &&
    typeof window.fbq === 'function'
  );
}

function isGAReady() {
  return (
    GA_MEASUREMENT_ID !== '__GA_MEASUREMENT_ID__' &&
    typeof window !== 'undefined' &&
    typeof window.gtag === 'function'
  );
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * initMetaPixel(pixelId)
 *
 * Installs the fbq stub and fires the initial PageView.
 * The base snippet in index.html already loads fbevents.js — this completes
 * the init handshake. No-op if pixelId is the sentinel placeholder.
 *
 * @param {string} pixelId  Real Meta Pixel ID (15–16 digits)
 */
export function initMetaPixel(pixelId) {
  if (typeof window === 'undefined') return;
  if (pixelId === '__META_PIXEL_ID__') return; // placeholder guard

  if (typeof window.fbq === 'function') {
    window.fbq('init', pixelId);
    window.fbq('track', 'PageView');
  }
}

/**
 * initGA(measurementId)
 *
 * Fires the initial gtag config call. The gtag.js script tag in index.html
 * loads the library — this call activates the stream.
 * No-op if measurementId is the sentinel placeholder.
 *
 * @param {string} measurementId  Real GA4 Measurement ID (G-XXXXXXXXXX)
 */
export function initGA(measurementId) {
  if (typeof window === 'undefined') return;
  if (measurementId === '__GA_MEASUREMENT_ID__') return; // placeholder guard

  if (typeof window.gtag === 'function') {
    window.gtag('config', measurementId);
  }
}

/**
 * initPixels()
 *
 * Convenience wrapper: calls initMetaPixel + initGA with the env-resolved IDs.
 * Call once after React mounts (e.g. in a useEffect in main.jsx).
 */
export function initPixels() {
  initMetaPixel(META_PIXEL_ID);
  initGA(GA_MEASUREMENT_ID);
}

/**
 * trackLeadSignup({ source, email_hash })
 *
 * Fires Meta `Lead` + GA4 `generate_lead` events.
 * Used on Spark Challenge signup and any other email capture.
 *
 * - source: a short label for the capture context, e.g. 'spark-challenge', 'expo-table'
 * - email_hash: optional SHA-256 hex of the lowercased email (never send raw email to pixels)
 *
 * Both platforms no-op silently if not initialized.
 *
 * @param {{ source?: string, email_hash?: string }} params
 */
export function trackLeadSignup({ source = 'unknown', email_hash } = {}) {
  if (typeof window === 'undefined') return;

  if (isMetaReady()) {
    const params = { content_name: 'lead_capture', content_category: source };
    if (email_hash) params.em = email_hash; // hashed email for Meta advanced matching
    window.fbq('track', 'Lead', params);
  }

  if (isGAReady()) {
    window.gtag('event', 'generate_lead', {
      event_category: 'engagement',
      event_label: source,
    });
  }
}

/**
 * trackPurchase({ product_slug, amount_cents, currency, transaction_id })
 *
 * Fires Meta `Purchase` + GA4 `purchase` events.
 * Call on mount inside CheckoutSuccess after verifyCheckoutSession resolves.
 *
 * Both platforms no-op silently if not initialized.
 *
 * @param {{
 *   product_slug: string,
 *   amount_cents: number,
 *   currency?: string,
 *   transaction_id: string
 * }} params
 */
export function trackPurchase({ product_slug, amount_cents, currency = 'USD', transaction_id }) {
  if (typeof window === 'undefined') return;

  const value = amount_cents ? amount_cents / 100 : 0;

  if (isMetaReady()) {
    window.fbq('track', 'Purchase', {
      value,
      currency,
      content_ids: [product_slug || transaction_id || ''],
      content_type: 'product',
    });
  }

  if (isGAReady()) {
    window.gtag('event', 'purchase', {
      transaction_id: transaction_id || '',
      value,
      currency,
      items: [
        {
          item_id: product_slug || '',
          item_name: product_slug || 'healing-hearts-product',
          price: value,
          quantity: 1,
        },
      ],
    });
  }
}

/**
 * trackPageView(path)
 *
 * Fires Meta `PageView` + GA4 `page_view` events.
 * Useful for SPA route changes after initial load.
 *
 * @param {string} path  e.g. '/rescue-kit'
 */
export function trackPageView(path) {
  if (typeof window === 'undefined') return;

  if (isMetaReady()) {
    window.fbq('track', 'PageView');
  }

  if (isGAReady()) {
    window.gtag('event', 'page_view', {
      page_path: path,
    });
  }
}
