/* global describe, test, expect, beforeEach */

/**
 * railStateReset unit tests
 *
 * Verifies:
 *   1. All 6 rail-slot keys wiped from portal-drawer-state-v1 composite object
 *   2. Idempotency — calling clearAllRailState twice does not error
 *   3. No-op on empty localStorage — calling on empty storage is safe
 */

import { clearAllRailState, RAIL_DRAWER_IDS } from '../lib/railStateReset';

// ── localStorage mock ─────────────────────────────────────────────────────

let store = {};

const localStorageMock = {
  getItem: (key) => (key in store ? store[key] : null),
  setItem: (key, value) => {
    store[key] = String(value);
  },
  removeItem: (key) => {
    delete store[key];
  },
  clear: () => {
    store = {};
  },
  get length() {
    return Object.keys(store).length;
  },
  key: (i) => Object.keys(store)[i] ?? null,
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// ── Helpers ───────────────────────────────────────────────────────────────

function seedAllSlots() {
  const state = {};
  for (const id of RAIL_DRAWER_IDS) {
    state[`scroll-${id}`] = 120;
    state[`tab-${id}`] = 0;
  }
  window.localStorage.setItem('portal-drawer-state-v1', JSON.stringify(state));
}

// ── Tests ─────────────────────────────────────────────────────────────────

beforeEach(() => {
  store = {};
});

describe('clearAllRailState', () => {
  test('wipes portal-drawer-state-v1 when populated with all 6 slots', () => {
    seedAllSlots();
    expect(window.localStorage.getItem('portal-drawer-state-v1')).not.toBeNull();

    clearAllRailState();

    expect(window.localStorage.getItem('portal-drawer-state-v1')).toBeNull();
  });

  test('covers all 6 rail drawer IDs in RAIL_DRAWER_IDS', () => {
    expect(RAIL_DRAWER_IDS).toHaveLength(6);
    expect(RAIL_DRAWER_IDS).toEqual(
      expect.arrayContaining([
        'home',
        'courses',
        'rescue',
        'bookmarks',
        'calendar',
        'admin',
      ])
    );
  });

  test('all 6 scroll sub-state entries are absent after wipe', () => {
    seedAllSlots();
    clearAllRailState();

    // After removal, JSON object is gone — parse would fail; key is null
    const raw = window.localStorage.getItem('portal-drawer-state-v1');
    expect(raw).toBeNull();
  });

  test('idempotent — calling twice does not throw and storage stays clear', () => {
    seedAllSlots();

    expect(() => {
      clearAllRailState();
      clearAllRailState();
    }).not.toThrow();

    expect(window.localStorage.getItem('portal-drawer-state-v1')).toBeNull();
  });

  test('no-op on empty localStorage — does not throw when nothing is stored', () => {
    // Store is empty (cleared in beforeEach)
    expect(window.localStorage.getItem('portal-drawer-state-v1')).toBeNull();

    expect(() => {
      clearAllRailState();
    }).not.toThrow();

    expect(window.localStorage.getItem('portal-drawer-state-v1')).toBeNull();
  });

  test('sweeps stray top-level scroll- and tab- keys for all 6 drawers', () => {
    // Seed stray top-level keys (defensive sweep target)
    for (const id of RAIL_DRAWER_IDS) {
      window.localStorage.setItem(`scroll-${id}`, '99');
      window.localStorage.setItem(`tab-${id}`, '1');
    }

    clearAllRailState();

    for (const id of RAIL_DRAWER_IDS) {
      expect(window.localStorage.getItem(`scroll-${id}`)).toBeNull();
      expect(window.localStorage.getItem(`tab-${id}`)).toBeNull();
    }
  });
});
