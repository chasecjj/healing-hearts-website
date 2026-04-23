/**
 * PortalLogo — HH wordmark renderer for portal chrome (rail mark, login, etc.)
 *
 * Source asset: /logo.png (37.9 KB, hand+heart+wordmark, teal/cyan).
 * Per scout-wave3-logo-redux.md (2026-04-23): NO brand SVG exists in the
 * codebase today. PNG is production-deployed in the marketing nav + emails.
 * Chase-gate G5 tracks Desirae SVG sourcing for v1.1 — NOT a v1 blocker.
 *
 * Rendered as <img> consuming the public-root asset so Vite doesn't pipe
 * through a loader we haven't configured (no SVG-as-component plugin yet).
 */

import React from 'react';

/**
 * PortalLogo
 *
 * @param {number|string} [size=32]      pixel width/height or CSS value
 * @param {string}        [className]    optional Tailwind / CSS class
 * @param {string}        [alt]          accessible name; empty string = decorative
 * @param {object}        [style]        inline style override
 */
export function PortalLogo({ size = 32, className = '', alt = 'Healing Hearts', style = {} }) {
  return (
    <img
      src="/logo.png"
      alt={alt}
      width={size}
      height={size}
      className={className}
      style={{ objectFit: 'contain', display: 'block', ...style }}
      draggable="false"
    />
  );
}

export default PortalLogo;
