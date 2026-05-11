/**
 * FrameworkCardGrid — responsive grid for FrameworkCard instances.
 *
 * Spec: portal-rescue-kit-v1 wave-3.1-frameworks-spec §6.
 *
 * Layout contract (spec §6.2):
 *   - Mobile (< 640px): 1-column stack, 16px gap
 *   - Tablet+ (≥ 640px): 2-column grid, 20px gap
 *   - No 3- or 4-column variant: 2 cols max keeps cards readable
 *
 * Semantics (spec §6.3):
 *   role="list" + role="listitem" preserves list semantics for screen
 *   readers without forcing <ul>/<li> CSS resets. Announces as
 *   "Framework cards, N items".
 *
 * NOTE on Lane-FW brief vs. spec divergence: the Lane-FW brief mentions a
 * "1 col mobile, 2 col tablet, 4 col desktop" grid, but the authoritative
 * spec §6.2 reads "No 3- or 4-column breakpoint — the card content
 * warrants a maximum of 2 columns for readability." Following spec. The
 * card content is intentionally dense (title + subtitle); 4-col would
 * truncate badly.
 */

import React from 'react';
import FrameworkCard from './FrameworkCard';

/**
 * @param {object} props
 * @param {Array<object>} props.frameworks — typically 4 items; TIER_1 or TIER_2
 */
export default function FrameworkCardGrid({ frameworks }) {
  if (!Array.isArray(frameworks) || frameworks.length === 0) return null;

  return (
    <div
      role="list"
      aria-label="Framework cards"
      className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 w-full"
    >
      {frameworks.map((framework) => (
        <div key={framework.id} role="listitem">
          <FrameworkCard framework={framework} />
        </div>
      ))}
    </div>
  );
}
