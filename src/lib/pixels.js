/**
 * Retargeting pixel helpers — Meta Pixel + Google Analytics
 *
 * TODO: Replace placeholder IDs with live IDs before the first expo visitor
 * hits the page. Set in index.html AND update the constants below.
 *
 * Meta Pixel: https://business.facebook.com/events_manager
 * Google Tag: https://analytics.google.com
 */

// TODO: Replace these placeholders with live IDs before go-live.
const META_PIXEL_ID = 'PLACEHOLDER_META_PIXEL_ID';
const GOOGLE_GTAG_ID = 'PLACEHOLDER_GA_ID';

/**
 * Returns true when pixel IDs are real (not placeholders).
 * All tracking calls no-op when IDs are placeholders.
 */
function isMetaReady() {
  return META_PIXEL_ID !== 'PLACEHOLDER_META_PIXEL_ID' && typeof window !== 'undefined' && typeof window.fbq === 'function';
}

function isGoogleReady() {
  return GOOGLE_GTAG_ID !== 'PLACEHOLDER_GA_ID' && typeof window !== 'undefined' && typeof window.gtag === 'function';
}

/**
 * Initialize pixels on first load.
 * Call once after React mounts (e.g. in a useEffect in main.jsx).
 * The base snippets are already in index.html — this triggers the initial PageView.
 */
export function initPixels() {
  if (typeof window === 'undefined') return;

  // Meta Pixel: fire initial PageView
  if (isMetaReady()) {
    window.fbq('init', META_PIXEL_ID);
    window.fbq('track', 'PageView');
  }

  // Google Analytics: initial page_view is fired automatically by gtag.js
  // Nothing extra needed here unless you want to set user properties.
}

/**
 * Track a page view (call on route changes).
 * @param {string} path - The current pathname (e.g. '/rescue-kit')
 */
export function trackPageView(path) {
  if (typeof window === 'undefined') return;

  if (isMetaReady()) {
    window.fbq('track', 'PageView');
  }

  if (isGoogleReady()) {
    window.gtag('event', 'page_view', {
      page_path: path,
    });
  }
}

/**
 * Track a completed purchase (call on /checkout/success).
 * @param {{ value: number, currency: string, orderId: string }} params
 */
export function trackPurchase({ value, currency = 'USD', orderId }) {
  if (typeof window === 'undefined') return;

  if (isMetaReady()) {
    window.fbq('track', 'Purchase', {
      value,
      currency,
      content_ids: [orderId || ''],
      content_type: 'product',
    });
  }

  if (isGoogleReady()) {
    window.gtag('event', 'purchase', {
      transaction_id: orderId || '',
      value,
      currency,
    });
  }
}

/**
 * Track a lead (email capture — call on Spark Challenge signup, webinar registration, etc.)
 * @param {{ email: string }} params
 */
export function trackLead({ email }) {
  if (typeof window === 'undefined') return;

  if (isMetaReady()) {
    // Hash the email before sending to Meta (privacy best practice)
    window.fbq('track', 'Lead', {
      content_name: 'lead_capture',
    });
  }

  if (isGoogleReady()) {
    window.gtag('event', 'generate_lead', {
      event_category: 'engagement',
    });
  }
}
