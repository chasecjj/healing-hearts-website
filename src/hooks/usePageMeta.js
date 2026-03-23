import { useEffect } from 'react';

const SITE_NAME = 'Healing Hearts';
const DEFAULT_DESCRIPTION =
  'Healing Hearts helps couples move from disconnection to deep, lasting connection through science-backed coaching and practical tools.';

/**
 * Sets page title and meta description for SEO.
 * @param {string} title — page-specific title (appended with " | Healing Hearts")
 * @param {string} [description] — meta description (defaults to site-wide)
 */
export default function usePageMeta(title, description) {
  useEffect(() => {
    const prev = document.title;
    document.title = title ? `${title} | ${SITE_NAME}` : SITE_NAME;

    const meta = document.querySelector('meta[name="description"]');
    const prevDesc = meta?.getAttribute('content');
    if (meta && description) {
      meta.setAttribute('content', description);
    }

    return () => {
      document.title = prev;
      if (meta && prevDesc) meta.setAttribute('content', prevDesc);
    };
  }, [title, description]);
}
