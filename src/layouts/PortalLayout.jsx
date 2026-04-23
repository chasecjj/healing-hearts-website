/**
 * PortalLayout.jsx — Round 2 refactor
 *
 * Consumes portal tokens via portalTokensAsCssVars() (scoped to .portal-root).
 * Rail-aware contextual drawer routing: each rail icon mounts its own drawer.
 * Username moves from drawer top → rail bottom below avatar (D3 + Top-5 #5).
 * PortalLogo integrated at top of rail.
 * Breathing gradient keyframes injected via motion.js export (D9 4s animation).
 *
 * Round 1 chassis preserved:
 *   - 72px rail + 320px drawer + content area
 *   - Mobile bottom-nav (5 items, admin desktop-only)
 *   - Admin email-domain gate + profile.role === 'admin' path
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { studentNavItems, adminNavItems } from './portalNav.config';
import {
  portalTokens,
  portalTokensAsCssVars,
  breathingGradientKeyframes,
  railIconHoverStyle,
  useReducedMotion,
  getTypeStyle,
} from '../portal/design';
import { PortalLogo } from '../portal/components/PortalLogo';
import HomeDrawer from '../portal/drawers/HomeDrawer';
import CoursesDrawer from '../portal/drawers/CoursesDrawer';
import RescueKitDrawer from '../portal/drawers/RescueKitDrawer';
import BookmarksDrawer from '../portal/drawers/BookmarksDrawer';
import CalendarDrawer from '../portal/drawers/CalendarDrawer';
import AdminDrawer from '../portal/drawers/AdminDrawer';

// ── Inject portal keyframes once per app ──────────────────────────────────
function PortalKeyframeStyles() {
  return <style>{breathingGradientKeyframes}</style>;
}

// ── Rail-id → drawer component map ────────────────────────────────────────
const DRAWERS = {
  home: HomeDrawer,
  courses: CoursesDrawer,
  rescue: RescueKitDrawer,
  bookmarks: BookmarksDrawer,
  calendar: CalendarDrawer,
  admin: AdminDrawer,
};

// ── Derived isAdmin predicate ─────────────────────────────────────────────
function useIsAdmin() {
  const { user, isAdmin: profileRoleIsAdmin } = useAuth();
  const emailDomainIsAdmin =
    typeof user?.email === 'string' &&
    user.email.endsWith('@healingheartscourse.com');
  return profileRoleIsAdmin === true || emailDomainIsAdmin === true;
}

// ── Rail icon ─────────────────────────────────────────────────────────────
function RailIcon({ item, isActive }) {
  const Icon = item.icon;
  const [hovered, setHovered] = useState(false);
  const prefersReduced = useReducedMotion();
  const hoverStyle = railIconHoverStyle(hovered, prefersReduced);

  return (
    <NavLink
      to={item.path}
      end={item.path === '/portal' || item.path === '/admin'}
      aria-label={item.label}
      title={item.label}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative flex items-center justify-center w-10 h-10 group focus-visible:outline-none focus-visible:ring-2"
      style={{
        ...hoverStyle,
        outlineColor: 'var(--pt-focus-ring-hex, #B96A5F)',
      }}
    >
      {/* Selected breathing gradient (D9) */}
      {isActive ? (
        <span
          className="rail-icon--selected absolute inset-0"
          aria-hidden="true"
          style={{
            borderRadius: 'inherit',
            background: portalTokens['rail-selected-chip'].gradientCss,
            backgroundSize: '200% 200%',
            animation: prefersReduced
              ? 'none'
              : 'rail-chip-breathe 4s cubic-bezier(0.4,0,0.2,1) infinite alternate',
          }}
        />
      ) : (
        <span
          className="absolute inset-0 transition-colors duration-150"
          aria-hidden="true"
          style={{
            borderRadius: 'inherit',
            backgroundColor: hovered
              ? 'var(--pt-rail-hover-hex, #2C2823)'
              : 'transparent',
          }}
        />
      )}
      {/* Icon layered above */}
      <span className="relative z-10">
        <Icon
          className="w-5 h-5"
          strokeWidth={1.75}
          aria-hidden="true"
          style={{
            color: isActive
              ? 'var(--pt-text-inverse-hex, #fafaf9)'
              : 'rgba(250,250,249,0.65)',
          }}
        />
      </span>
    </NavLink>
  );
}

// ── Determine active rail id from pathname ────────────────────────────────
function useActiveRailId(isAdmin) {
  const location = useLocation();
  return useMemo(() => {
    const pathname = location.pathname;
    if (isAdmin) {
      for (const item of adminNavItems) {
        if (pathname === item.path || pathname.startsWith(item.path + '/')) {
          return item.id;
        }
      }
    }
    for (const item of [...studentNavItems].reverse()) {
      if (item.path === '/portal') continue;
      if (pathname.startsWith(item.path)) return item.id;
    }
    if (
      pathname === '/portal' ||
      pathname.startsWith('/portal/course') ||
      pathname.startsWith('/portal/')
    ) {
      return 'home';
    }
    return null;
  }, [location.pathname, isAdmin]);
}

// ── Desktop two-rail + contextual drawer ──────────────────────────────────
function DesktopTwoRail({ isAdmin, activeRailId }) {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const displayName =
    profile?.display_name || user?.email?.split('@')[0] || 'Student';
  const initials = displayName
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  const DrawerComponent = DRAWERS[activeRailId] || HomeDrawer;

  return (
    <>
      {/* ── RAIL (72px) ───────────────────────────────────────────────── */}
      <aside
        className="hidden md:flex flex-col fixed left-0 top-0 h-screen w-[72px] z-40"
        aria-label="Main navigation rail"
        style={{ backgroundColor: 'var(--pt-rail-hex, #24201D)' }}
      >
        {/* Logo — top of rail */}
        <div className="flex items-center justify-center h-14 flex-shrink-0">
          <PortalLogo size={32} alt="Healing Hearts" />
        </div>

        <div
          className="mx-4 h-px flex-shrink-0"
          style={{ backgroundColor: 'rgba(255,255,255,0.10)' }}
        />

        {/* Student nav icons */}
        <nav
          className="flex flex-col items-center gap-5 flex-1 pt-6 px-4"
          aria-label="Student navigation"
        >
          {studentNavItems.map((item) => (
            <RailIcon
              key={item.id}
              item={item}
              isActive={activeRailId === item.id}
            />
          ))}

          {isAdmin && (
            <>
              <div
                className="w-6 h-px mt-2"
                style={{ backgroundColor: 'rgba(255,255,255,0.10)' }}
              />
              {adminNavItems.map((item) => (
                <RailIcon
                  key={item.id}
                  item={item}
                  isActive={activeRailId === item.id}
                />
              ))}
            </>
          )}
        </nav>

        {/* Rail bottom: avatar + username (D3 locked) */}
        <div className="flex flex-col items-center gap-1 pb-4 flex-shrink-0">
          <button
            type="button"
            className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs focus-visible:outline-none focus-visible:ring-2"
            aria-label={`Account: ${displayName} — sign out`}
            title={`${displayName} — sign out`}
            onClick={handleSignOut}
            style={{
              backgroundColor: 'var(--pt-primary-accent-hex, #B96A5F)',
              color: 'var(--pt-text-inverse-hex, #fafaf9)',
              outlineColor: 'var(--pt-focus-ring-hex, #B96A5F)',
            }}
          >
            {initials || '?'}
          </button>
          <span
            className="truncate text-center"
            style={{
              ...getTypeStyle('meta'),
              maxWidth: 56,
              color: 'rgba(250,250,249,0.60)',
              lineHeight: 1,
            }}
            title={displayName}
          >
            {displayName}
          </span>
        </div>
      </aside>

      {/* ── DRAWER (320px, always-open, contextual per active rail) ────── */}
      <aside
        className="hidden md:flex fixed left-[72px] top-0 h-screen w-[320px] z-30"
        aria-label="Contextual drawer"
        style={{
          backgroundColor: 'var(--pt-drawer-hex, #d6d3d1)',
          borderRight: '1px solid var(--pt-border-subtle-hex, #d6d3d1)',
        }}
      >
        <DrawerComponent />
      </aside>
    </>
  );
}

// ── Mobile bottom-nav (unchanged from R1) ─────────────────────────────────
function MobileBottomNav() {
  const location = useLocation();
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40"
      style={{
        height: '80px',
        paddingBottom: '24px',
        backgroundColor: 'var(--pt-elevation-2-hex, #ffffff)',
        borderTop: '1px solid var(--pt-border-subtle-hex, #d6d3d1)',
      }}
      aria-label="Mobile navigation"
    >
      <div className="flex h-[56px]">
        {studentNavItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.path === '/portal'
              ? location.pathname === '/portal' ||
                (location.pathname.startsWith('/portal/') &&
                  !studentNavItems
                    .filter((i) => i.path !== '/portal')
                    .some((i) => location.pathname.startsWith(i.path)))
              : location.pathname.startsWith(item.path);

          return (
            <NavLink
              key={item.id}
              to={item.path}
              end={item.path === '/portal'}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 focus-visible:outline-none"
              aria-label={item.label}
            >
              <span
                className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors duration-150"
                style={{
                  backgroundColor: isActive ? 'rgba(36,32,29,0.08)' : 'transparent',
                }}
              >
                <Icon
                  className="w-5 h-5"
                  strokeWidth={isActive ? 2 : 1.75}
                  aria-hidden="true"
                  style={{
                    color: isActive
                      ? 'var(--pt-text-primary-hex, #1c1917)'
                      : 'rgba(28,25,23,0.45)',
                  }}
                />
                <span
                  style={{
                    ...getTypeStyle('meta', 'semibold'),
                    lineHeight: 1,
                    color: isActive
                      ? 'var(--pt-text-primary-hex, #1c1917)'
                      : 'rgba(28,25,23,0.45)',
                  }}
                >
                  {item.label}
                </span>
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

// ── PortalLayout (root export) ────────────────────────────────────────────
export default function PortalLayout() {
  const location = useLocation();
  const isAdmin = useIsAdmin();
  const activeRailId = useActiveRailId(isAdmin);
  const cssVars = portalTokensAsCssVars();

  // Close any residual body lock on route change
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    document.body.style.overflow = '';
  }, [location.pathname]);

  return (
    <>
      <PortalKeyframeStyles />

      <div
        className="portal-root flex min-h-screen"
        style={{
          ...cssVars,
          backgroundColor: 'var(--pt-content-bg-hex, #f5f5f4)',
          color: 'var(--pt-text-primary-hex, #1c1917)',
        }}
      >
        {/* Desktop two-rail */}
        <DesktopTwoRail isAdmin={isAdmin} activeRailId={activeRailId} />

        {/* Main content — ml = 72 rail + 320 drawer = 392px on desktop */}
        <main
          className="flex-1 md:ml-[392px] flex flex-col min-h-screen overflow-y-auto pb-[80px] md:pb-0"
        >
          <Outlet />
        </main>

        {/* Mobile bottom-nav */}
        <MobileBottomNav />
      </div>
    </>
  );
}
