import { useEffect } from 'react';

const SITE_NAME = 'Healing Hearts';
const DEFAULT_DESCRIPTION =
  'Healing Hearts helps couples move from disconnection to deep, lasting connection through science-backed coaching and practical tools.';

/**
 * Sets page title, meta description, and Open Graph / Twitter Card tags.
 * @param {string} title — page-specific title (appended with " | Healing Hearts")
 * @param {string} [description] — meta description (defaults to site-wide)
 * @param {object} [og] — optional OG overrides
 * @param {string} [og.ogTitle] — og:title and twitter:title content
 * @param {string} [og.ogDescription] — og:description and twitter:description content
 * @param {string} [og.ogImage] — og:image and twitter:image content
 * @param {string} [og.ogUrl] — og:url content
 */
export default function usePageMeta(title, description, { ogTitle, ogDescription, ogImage, ogUrl } = {}) {
  useEffect(() => {
    const prev = document.title;
    document.title = title ? `${title} | ${SITE_NAME}` : SITE_NAME;

    const meta = document.querySelector('meta[name="description"]');
    const prevDesc = meta?.getAttribute('content');
    if (meta && description) {
      meta.setAttribute('content', description);
    }

    // Helper: find or create a <meta> tag by attribute selector
    function setMeta(selector, attrKey, attrValue, content) {
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attrKey, attrValue);
        document.head.appendChild(el);
      }
      const prev = el.getAttribute('content');
      el.setAttribute('content', content);
      return prev;
    }

    const prevOgTitle = ogTitle
      ? setMeta('meta[property="og:title"]', 'property', 'og:title', ogTitle)
      : null;
    const prevTwitterTitle = ogTitle
      ? setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', ogTitle)
      : null;

    const prevOgDesc = ogDescription
      ? setMeta('meta[property="og:description"]', 'property', 'og:description', ogDescription)
      : null;
    const prevTwitterDesc = ogDescription
      ? setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', ogDescription)
      : null;

    const prevOgImage = ogImage
      ? setMeta('meta[property="og:image"]', 'property', 'og:image', ogImage)
      : null;
    const prevTwitterImage = ogImage
      ? setMeta('meta[name="twitter:image"]', 'name', 'twitter:image', ogImage)
      : null;

    const prevOgUrl = ogUrl
      ? setMeta('meta[property="og:url"]', 'property', 'og:url', ogUrl)
      : null;

    return () => {
      document.title = prev;
      if (meta && prevDesc) meta.setAttribute('content', prevDesc);

      function restoreMeta(selector, prevVal) {
        if (prevVal !== null) {
          const el = document.querySelector(selector);
          if (el) el.setAttribute('content', prevVal);
        }
      }

      restoreMeta('meta[property="og:title"]', prevOgTitle);
      restoreMeta('meta[name="twitter:title"]', prevTwitterTitle);
      restoreMeta('meta[property="og:description"]', prevOgDesc);
      restoreMeta('meta[name="twitter:description"]', prevTwitterDesc);
      restoreMeta('meta[property="og:image"]', prevOgImage);
      restoreMeta('meta[name="twitter:image"]', prevTwitterImage);
      restoreMeta('meta[property="og:url"]', prevOgUrl);
    };
  }, [title, description, ogTitle, ogDescription, ogImage, ogUrl]);
}
