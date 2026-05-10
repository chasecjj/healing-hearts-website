/**
 * railStateReset — clears all 6 rail-slot localStorage keys on account-change.
 *
 * Spec: consolidated-spec-v1.1.md §2.23, §12.1 A-03 (P0 safety — shared-device
 * privacy for trauma population).
 *
 * The 6 rail slots are: home, courses, rescue, bookmarks, calendar, admin.
 * All secondary state (scroll positions, tab selections, sub-state) lives in
 * the single `portal-drawer-state-v1` JSON object keyed by slot. Removing
 * that key atomically wipes all 6 slots. Stray top-level keys (defensive) are
 * also swept per the SUB_STATE_PREFIXES list.
 *
 * Idempotent: safe to call multiple times; removeItem on a missing key is a
 * no-op per the Web Storage spec.
 */

/** Primary localStorage key (W-01 useDrawerState.js) */
const LS_KEY = 'portal-drawer-state-v1';

/** All 6 rail drawer IDs */
export const RAIL_DRAWER_IDS = [
  'home',
  'courses',
  'rescue',
  'bookmarks',
  'calendar',
  'admin',
];

/**
 * Sub-state key prefixes stored at the top level (defensive sweep).
 * The hook uses the composite JSON object; these cover any future direct keys.
 */
const SUB_STATE_PREFIXES = ['scroll-', 'tab-'];

/**
 * clearAllRailState()
 *
 * Wipes the primary portal-drawer-state-v1 key (contains all scroll + tab
 * sub-state for all 6 slots) and defensively removes any stray per-prefix
 * top-level keys. Idempotent and safe in SSR (no-op when window is absent).
 */
export function clearAllRailState() {
  if (typeof window === 'undefined') return;

  // 1. Remove the primary composite key (covers all 6 scroll + tab slots)
  try {
    window.localStorage.removeItem(LS_KEY);
  } catch {
    // Storage unavailable or restricted — fail silently
  }

  // 2. Defensive sweep for any stray top-level per-drawer sub-state keys
  for (const id of RAIL_DRAWER_IDS) {
    for (const prefix of SUB_STATE_PREFIXES) {
      try {
        window.localStorage.removeItem(`${prefix}${id}`);
      } catch {
        // fail silently
      }
    }
  }
}
