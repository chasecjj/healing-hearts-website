/**
 * PortalLogo — heart-only SVG mark for portal chrome (Wave 5 directive #6).
 *
 * Previous (R2): rendered /logo.png (hand+heart+wordmark, teal/cyan). Too
 * bright + wordmark noise on dark rail.
 *
 * Wave 5 (mockup-branch, 2026-04-23): heart-only inline SVG, currentColor
 * fill so the rail inherits --pt-text-inverse. A cleaner, quieter mark on the
 * warm-brown rail. Future: Desirae may replace with finalized brand SVG.
 *
 * Shape: classic two-lobe heart, drawn as a single closed path. Solid fill.
 * No wordmark. No gradient. No outline stroke (rail backdrop provides contrast).
 */

import React from 'react';

export function PortalLogo({ size = 28, className = '', alt = 'Healing Hearts', style = {} }) {
  return (
    <svg
      role="img"
      aria-label={alt}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'block', color: 'currentColor', ...style }}
    >
      <title>{alt}</title>
      {/* Classic two-lobe heart — symmetric, warm, no embellishment */}
      <path
        d="M12 21.35c-.27 0-.53-.11-.72-.3l-7.83-7.62C1.6 11.58.83 9.32 1.46 7.18 2.09 5.04 3.97 3.43 6.22 3.08c1.83-.29 3.66.3 5 1.55l.78.73.78-.73c1.34-1.25 3.17-1.84 5-1.55 2.25.35 4.13 1.96 4.76 4.1.63 2.14-.14 4.4-1.99 6.25l-7.83 7.62c-.19.19-.45.3-.72.3z"
        fill="currentColor"
      />
    </svg>
  );
}

export default PortalLogo;
