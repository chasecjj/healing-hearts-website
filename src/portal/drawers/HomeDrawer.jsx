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

import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Compass, BookOpen } from 'lucide-react';
import { DrawerShell, DrawerSection, DrawerItem } from './DrawerShell';
import { useDrawerState } from '../hooks/useDrawerState';
import { getTypeStyle } from '../design/typography';
import { useAuth } from '../../contexts/AuthContext';
import { clearAllRailState } from '../lib/railStateReset';

// ── HomeDrawer ────────────────────────────────────────────────────────────

export default function HomeDrawer() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [switching, setSwitching] = useState(false);

  // P0 shared-device safety per spec §12.1 A-03. Canonical entry point lives
  // in the rail-bottom avatar popup (PortalLayout) so it's reachable from
  // every drawer. This visible backstop in HomeDrawer ensures users in
  // urgency (shared device, abuser context) don't have to discover the
  // popup chrome to find it. Muted register (not terracotta CTA) per
  // trauma-informed framing — "here when you need it", not "press now".
  async function handleSwitchAccount() {
    if (switching) return;
    setSwitching(true);
    try {
      await signOut();
      clearAllRailState();
      navigate('/login', { replace: true });
    } catch (err) {
      console.error('[HomeDrawer] switch-account failed:', err);
      setSwitching(false);
    }
  }

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
      {/* Header — welcome heading. AccountSwitch (P0 A-03 affordance) lives in
          the bottom-rail account popup (PortalLayout) so it's reachable from
          every drawer surface, not just Home. */}
      <div className="px-3 pb-3 pt-1">
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

          {/* P0 A-03 safety backstop — shared-device account-switch link */}
          <button
            type="button"
            onClick={handleSwitchAccount}
            disabled={switching}
            style={{
              ...getTypeStyle('caption'),
              color: 'var(--pt-text-muted-hex, #57534e)',
              background: 'transparent',
              border: 'none',
              padding: 0,
              marginTop: 10,
              cursor: switching ? 'not-allowed' : 'pointer',
              textDecoration: 'underline',
              textUnderlineOffset: 2,
              opacity: switching ? 0.6 : 1,
            }}
            aria-label="Not you? Switch account — signs out and redirects to login"
          >
            {switching ? 'Signing out…' : 'Not you? Switch account'}
          </button>
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
