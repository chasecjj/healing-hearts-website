/**
 * useDrawerState — A-04 drawer state preservation
 *
 * Spec: consolidated-spec-v1.1.md §12.1 A-04 (appended to 2.8-rev as impl-note)
 *
 * URL-state (?drawer=<id>) is the CANONICAL source for which drawer is open.
 * localStorage['portal-drawer-state-v1'] is for SECONDARY state only:
 *   scroll positions, sub-tab selections, per-slot secondary UI state.
 *
 * Sync restore pattern: useRef-init reads localStorage synchronously on first
 * render (pre-paint, no loading state flash). State changes are written back
 * to localStorage debounced 200ms.
 *
 * Supabase background-sync is STUBBED AS NO-OP:
 *   // TODO Wave 6D backend-data: wire Supabase user_preferences.drawer_state sync per A-04
 * IndexedDB offline fallback also stubbed:
 *   // TODO Wave 6D backend-data: wire IndexedDB offline fallback queue per A-04
 *
 * Conflict resolution: last-write-wins by client timestamp (stub — full impl deferred Wave 6D).
 */

import { useCallback, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const LS_KEY = 'portal-drawer-state-v1';

// ── Synchronous localStorage helpers ──────────────────────────────────────

/** Synchronous read — safe for useRef-init pre-paint restore */
function readLsState() {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    // Parse error or security restriction — fail silently
    return {};
  }
}

/** Per-key debounce timers to avoid cross-drawer write collisions */
const _lsWriteTimers = {};

/** Debounced write — merges key/value into the shared LS object */
function debouncedWriteLs(stateKey, value) {
  clearTimeout(_lsWriteTimers[stateKey]);
  _lsWriteTimers[stateKey] = setTimeout(() => {
    try {
      const current = readLsState();
      const next = { ...current, [stateKey]: value };
      window.localStorage.setItem(LS_KEY, JSON.stringify(next));
    } catch {
      // Storage quota exceeded or unavailable — fail silently
    }
    // TODO Wave 6D backend-data: wire Supabase user_preferences.drawer_state sync per A-04
    // TODO Wave 6D backend-data: wire IndexedDB offline fallback queue per A-04
  }, 200);
}

// ── Hook ──────────────────────────────────────────────────────────────────

/**
 * useDrawerState(drawerId)
 *
 * @param {string} drawerId  e.g. 'home' | 'courses' | 'rescue' | 'bookmarks' | 'calendar' | 'admin'
 *
 * @returns {{
 *   isOpen: boolean,
 *   open: () => void,
 *   close: () => void,
 *   toggle: () => void,
 *   persistedScrollTop: number | null,
 *   setScrollTop: (n: number) => void,
 * }}
 */
export function useDrawerState(drawerId) {
  const [searchParams, setSearchParams] = useSearchParams();

  // ── Canonical: URL ?drawer= param ──────────────────────────────────────
  const isOpen = searchParams.get('drawer') === drawerId;

  const open = useCallback(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set('drawer', drawerId);
        return next;
      },
      { replace: true }
    );
  }, [drawerId, setSearchParams]);

  const close = useCallback(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete('drawer');
        return next;
      },
      { replace: true }
    );
  }, [setSearchParams]);

  const toggle = useCallback(() => {
    if (isOpen) close();
    else open();
  }, [isOpen, open, close]);

  // ── Secondary: localStorage scroll position ────────────────────────────
  // Synchronous pre-paint restore per A-04: useState lazy initializer reads
  // localStorage once on first render (no flash, no useRef needed).
  const scrollKey = `scroll-${drawerId}`;
  const [persistedScrollTop, setScrollTopState] = useState(() => {
    const state = readLsState();
    const v = state[scrollKey];
    return typeof v === 'number' ? v : null;
  });

  const setScrollTop = useCallback(
    (/** @type {number} */ n) => {
      setScrollTopState(n);
      debouncedWriteLs(scrollKey, n);
    },
    [scrollKey]
  );

  return {
    isOpen,
    open,
    close,
    toggle,
    persistedScrollTop,
    setScrollTop,
  };
}
