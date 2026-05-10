/**
 * HomeDrawer — pure sub-tab navigation (Wave 9 architectural pivot, 2026-05-10).
 *
 * Wave 9 E1: spec §2.3 literal "DailyIntentionWidget in Sanctuary tab" + 3-tab
 * IA (Sanctuary / Journey / Resources) is REPLACED with a Slack-pattern vertical
 * nav. Daily Intention canonical home is now PortalDashboard Sanctuary register
 * (see PortalDashboard.jsx). Mood pills also live on the dashboard (or moved to
 * future dedicated surface). Drawer = pure nav, no interactive widgets.
 *
 * Spec amendment: see ./reports/wave-9-spec-amendment.md
 *
 * Source-of-truth (Chase 2026-05-10):
 *   "drawer should be sub tab navigation only, not interactable fields or
 *    things like the daily intention. The drawer needs to be able to be hidden
 *    as well."
 *
 * Routes:
 *   /portal           — Sanctuary (PortalDashboard)
 *   /portal/journey   — Journey view (stub placeholder)
 *   /portal/resources — Resources view (stub placeholder)
 *
 * DrawerShell consumption per W-01 §2 prop contract; useDrawerState consumed
 * for scroll-position sub-state per W-01 §4.
 */

import React from 'react';
import { useLocation } from 'react-router-dom';
import { Home, Compass, BookOpen } from 'lucide-react';
import { DrawerShell, DrawerSection, DrawerItem } from './DrawerShell';
import { useDrawerState } from '../hooks/useDrawerState';
import { getTypeStyle } from '../design/typography';
import { useAuth } from '../../contexts/AuthContext';
import AccountSwitch from '../components/AccountSwitch';

// ── HomeDrawer ────────────────────────────────────────────────────────────

export default function HomeDrawer() {
  const { user, profile } = useAuth();
  const { pathname } = useLocation();

  // useDrawerState consumed per W-01 §4 contract (scroll-position sub-state)
  // eslint-disable-next-line no-unused-vars
  const { persistedScrollTop, setScrollTop } = useDrawerState('home');

  const firstName =
    profile?.display_name?.split(' ')[0] ||
    user?.email?.split('@')[0] ||
    'friend';

  // Active-state predicate per Slack-pattern reference. /portal exact match for
  // Sanctuary; prefix-match for /portal/journey + /portal/resources sub-routes.
  const isSanctuary = pathname === '/portal';
  const isJourney = pathname.startsWith('/portal/journey');
  const isResources = pathname.startsWith('/portal/resources');

  return (
    <DrawerShell title="Home" ariaContext="Home" drawerId="home">
      {/* Header — eyebrow row (AccountSwitch P0 affordance) + welcome heading.
          Stacked vertical so heading-2 doesn't compete with AccountSwitch at
          280px column width (Wave 8 vertical-stack fix). */}
      <div className="px-3 pb-3 pt-1">
        {/* A-03 P0 safety: account-switch affordance — eyebrow row */}
        <div className="flex justify-end pb-2">
          <AccountSwitch />
        </div>

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
      </div>

      {/* ── Primary nav (Slack-pattern vertical nav) ─────────────────────── */}
      <DrawerSection label="">
        <DrawerItem
          icon={Home}
          label="Sanctuary"
          to="/portal"
          isActive={isSanctuary}
        />
        <DrawerItem
          icon={Compass}
          label="Your Journey"
          to="/portal/journey"
          isActive={isJourney}
        />
        <DrawerItem
          icon={BookOpen}
          label="Your Resources"
          to="/portal/resources"
          isActive={isResources}
        />
      </DrawerSection>

      {/* ── Recent (placeholder until useRecentLessons() lands) ──────────── */}
      {/* TODO Wave 10: derive from progress / lesson_progress for real recents. */}
      <DrawerSection label="Recent">
        <p
          className="px-3 py-2"
          style={{
            ...getTypeStyle('caption'),
            color: 'var(--pt-text-muted-hex, #57534e)',
          }}
        >
          {/* A-11 rest-permission register */}
          Your recent visits will surface here.
        </p>
      </DrawerSection>
    </DrawerShell>
  );
}
