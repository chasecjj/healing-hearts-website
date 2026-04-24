/**
 * HomeDrawer — Sanctuary / Journey / Resources 3-tab IA.
 *
 * Spec: consolidated-spec-v1.1.md
 *   §2.3  — Home drawer tabs: Sanctuary / Your Journey / Your Resources
 *   §2.23 — Account-switch affordance in Sanctuary tab (v1.1 new)
 *   §12.1 A-03 — P0 safety: shared-device privacy for trauma population
 *   §12.1 A-11 — Rest-permission empty-state copy register (Admin exempt)
 *   §12.1 A-12 — DailyIntentionWidget migrated here from Dashboard (per 2.3 literal)
 *
 * DrawerShell consumption per W-01 §2 prop contract.
 * Tab selection persisted to `portal-drawer-state-v1` LS JSON (sub-key `tab-home`),
 * consistent with useDrawerState sub-state pattern.
 */

import React, { useState } from 'react';
import { DrawerShell, DrawerSection, EmptyState } from './DrawerShell';
import { useDrawerState } from '../hooks/useDrawerState';
import { getTypeStyle } from '../design/typography';
import { useAuth } from '../../contexts/AuthContext';
import AccountSwitch from '../components/AccountSwitch';
import DailyIntentionWidget from '../DailyIntentionWidget';

// ── Tab persistence (sub-state in portal-drawer-state-v1) ─────────────────

const LS_KEY = 'portal-drawer-state-v1';
const TAB_SUB_KEY = 'tab-home';

function readTabFromLs() {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    const state = raw ? JSON.parse(raw) : {};
    const v = state[TAB_SUB_KEY];
    return typeof v === 'number' && v >= 0 && v <= 2 ? v : 0;
  } catch {
    return 0;
  }
}

function writeTabToLs(index) {
  if (typeof window === 'undefined') return;
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    const current = raw ? JSON.parse(raw) : {};
    window.localStorage.setItem(
      LS_KEY,
      JSON.stringify({ ...current, [TAB_SUB_KEY]: index })
    );
  } catch {
    // fail silently
  }
}

// ── Tab definitions ───────────────────────────────────────────────────────

const TABS = [
  { id: 'sanctuary', label: 'Sanctuary' },
  { id: 'journey', label: 'Your Journey' },
  { id: 'resources', label: 'Your Resources' },
];

// ── Sub-components ────────────────────────────────────────────────────────

/**
 * TabBar — pill-style tab switcher.
 * Three tabs. Active tab uses drawer-active-bg token; inactive uses subtle hover.
 */
function TabBar({ activeIndex, onChange }) {
  return (
    <div
      role="tablist"
      aria-label="Home drawer sections"
      className="flex gap-1 px-3 pt-2 pb-1"
    >
      {TABS.map((tab, i) => {
        const isActive = i === activeIndex;
        return (
          <button
            key={tab.id}
            role="tab"
            id={`home-tab-${tab.id}`}
            aria-selected={isActive}
            aria-controls={`home-tabpanel-${tab.id}`}
            onClick={() => onChange(i)}
            style={{
              ...getTypeStyle('caption', isActive ? 'medium' : 'regular'),
              padding: '5px 10px',
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: isActive
                ? 'var(--pt-drawer-active-bg-hex, #fafaf9)'
                : 'transparent',
              color: isActive
                ? 'var(--pt-text-primary-hex, #1c1917)'
                : 'var(--pt-text-muted-hex, #57534e)',
              transition: 'background-color 150ms ease, color 150ms ease',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              if (!isActive)
                e.currentTarget.style.backgroundColor =
                  'var(--pt-drawer-hover-hex, #a8a29e)';
            }}
            onMouseLeave={(e) => {
              if (!isActive)
                e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

// ── Sanctuary Tab ─────────────────────────────────────────────────────────

const FEELING_PILLS = [
  { id: 'flooded', label: 'Flooded' },
  { id: 'disconnected', label: 'Disconnected' },
  { id: 'hurt', label: 'Hurt' },
  { id: 'shutdown', label: 'Shut Down' },
  { id: 'reactive', label: 'Reactive' },
];

function TrishaFrameworkRouter() {
  return (
    <div className="flex flex-wrap gap-2 px-3 py-1">
      {FEELING_PILLS.map((f) => (
        <a
          key={f.id}
          href="/portal/rescue-kit"
          style={{
            ...getTypeStyle('caption', 'medium'),
            padding: '6px 12px',
            borderRadius: 8,
            backgroundColor: 'var(--pt-elevation-1-hex, #e7e5e4)',
            color: 'var(--pt-text-primary-hex, #1c1917)',
            textDecoration: 'none',
            transition: 'border-radius 150ms cubic-bezier(0.19,1,0.22,1)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderRadius = '12px')}
          onMouseLeave={(e) => (e.currentTarget.style.borderRadius = '8px')}
        >
          {f.label}
        </a>
      ))}
    </div>
  );
}

function SanctuaryTab({ firstName }) {
  return (
    <div
      role="tabpanel"
      id="home-tabpanel-sanctuary"
      aria-labelledby="home-tab-sanctuary"
    >
      {/* Header row: welcome + AccountSwitch top-right */}
      <div className="flex items-start justify-between px-3 pb-3 pt-1 gap-2">
        <div className="min-w-0">
          <p
            style={{ ...getTypeStyle('heading-2'), margin: 0, lineHeight: 1.3 }}
          >
            Welcome back, {firstName}
          </p>
          <p
            style={{
              ...getTypeStyle('caption'),
              color: 'var(--pt-text-muted-hex, #57534e)',
              marginTop: 4,
            }}
          >
            {/* A-11 rest-permission register */}
            Welcome back — nothing pressing. Settle in.
          </p>
        </div>

        {/* A-03 P0 safety: account-switch affordance */}
        <AccountSwitch />
      </div>

      {/* Daily Intention — migrated from Dashboard per §12.1 A-12 / 2.3 literal */}
      <DrawerSection label="Today's Intention">
        <div className="px-3 pb-2">
          <DailyIntentionWidget />
        </div>
      </DrawerSection>

      {/* Today's Focus */}
      <DrawerSection label="Today's Focus">
        <div
          className="px-3 py-2"
          style={{
            ...getTypeStyle('caption'),
            color: 'var(--pt-text-muted-hex, #57534e)',
          }}
        >
          [Trisha-voice placeholder: A small repair today is worth more than a
          grand gesture tomorrow.]
        </div>
      </DrawerSection>

      {/* How are you feeling? */}
      <DrawerSection label="How are you feeling?">
        <TrishaFrameworkRouter />
      </DrawerSection>
    </div>
  );
}

// ── Journey Tab ───────────────────────────────────────────────────────────

function JourneyTab() {
  return (
    <div
      role="tabpanel"
      id="home-tabpanel-journey"
      aria-labelledby="home-tab-journey"
    >
      {/* A-11 rest-permission empty-state register */}
      <EmptyState
        icon="🌱"
        message="You haven't started a module yet."
        sub="No pressure — your path will unfold here when you're ready."
      />
    </div>
  );
}

// ── Resources Tab ─────────────────────────────────────────────────────────

function ResourcesTab() {
  return (
    <div
      role="tabpanel"
      id="home-tabpanel-resources"
      aria-labelledby="home-tab-resources"
    >
      {/* A-11 rest-permission empty-state register */}
      <EmptyState
        icon="📖"
        message="Your resources will appear as you unlock them."
        sub="Nothing to do yet. Come back after exploring a module."
      />
    </div>
  );
}

// ── HomeDrawer ────────────────────────────────────────────────────────────

export default function HomeDrawer() {
  const { user, profile } = useAuth();

  // useDrawerState consumed per W-01 §4 contract
  // eslint-disable-next-line no-unused-vars
  const { persistedScrollTop, setScrollTop } = useDrawerState('home');

  const firstName =
    profile?.display_name?.split(' ')[0] ||
    user?.email?.split('@')[0] ||
    'friend';

  // Tab state — sync restore from portal-drawer-state-v1 sub-key `tab-home`
  const [activeTab, setActiveTab] = useState(() => readTabFromLs());

  function handleTabChange(index) {
    setActiveTab(index);
    writeTabToLs(index);
  }

  return (
    <DrawerShell title="Home" ariaContext="Home">
      {/* 3-tab IA per §2.3 */}
      <TabBar activeIndex={activeTab} onChange={handleTabChange} />

      {/* Tab panels */}
      {activeTab === 0 && <SanctuaryTab firstName={firstName} />}
      {activeTab === 1 && <JourneyTab />}
      {activeTab === 2 && <ResourcesTab />}
    </DrawerShell>
  );
}
