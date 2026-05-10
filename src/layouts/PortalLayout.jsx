/**
 * PortalLayout.jsx — v1.1 W-01 shell+rail refactor
 *
 * v1.1 changes (Wave 4B.1):
 *   - Rail icon 44×44px min touch target (WCAG SC 2.5.5 / dec-2.7)
 *   - ESC + pointerdown click-outside close active drawer (2.9 / 2.10)
 *   - URL-state ?drawer=<id> round-trip via useSearchParams (2.11)
 *   - inset-inline logical-properties for RTL safety: start-0, start-[72px],
 *     ms-[352px] (2.12)
 *   - DrawerMetaContext injects top-bar flavor/icon/breadcrumb per section (2.13 + A-05)
 *   - Drawer width 280px; content margin = 72 (rail) + 280 (drawer) = 352px (2.12)
 *
 * Backward-compatible: existing drawer consumer files (HomeDrawer et al.)
 * unchanged. DrawerMetaContext provides flavor/icon/breadcrumb automatically.
 * Downstream workers (W-02/W-03/W-04/W-05) may pass explicit DrawerShell
 * props in their waves which will override context values.
 *
 * Round 2 chassis preserved:
 *   - 72px rail + 280px drawer + content area (352px total margin)
 *   - Mobile bottom-nav (5 items, admin desktop-only)
 *   - Admin email-domain gate + profile.role === 'admin' path
 *   - Breathing gradient keyframes injected via motion.js export (D9 4s)
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Home, BookOpen, LifeBuoy, Bookmark, Calendar, Shield } from 'lucide-react';
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
import { DrawerMetaContext } from '../portal/context/DrawerMetaContext';
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

// ── Drawer-collapse LS sub-key (Wave 9 E5) ────────────────────────────────
// Reuses the existing portal-drawer-state-v1 LS object via a sub-key, matching
// the useDrawerState scroll-position pattern. Default is `false` (expanded for
// new users, per Chase 2026-05-10 lock).
const LS_KEY = 'portal-drawer-state-v1';
const COLLAPSED_SUB_KEY = 'drawer-collapsed';

function readDrawerCollapsedFromLs() {
  if (typeof window === 'undefined') return false;
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    const state = raw ? JSON.parse(raw) : {};
    return state[COLLAPSED_SUB_KEY] === true;
  } catch {
    return false;
  }
}

function writeDrawerCollapsedToLs(collapsed) {
  if (typeof window === 'undefined') return;
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    const current = raw ? JSON.parse(raw) : {};
    window.localStorage.setItem(
      LS_KEY,
      JSON.stringify({ ...current, [COLLAPSED_SUB_KEY]: !!collapsed })
    );
  } catch {
    // fail silently
  }
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

// ── Section metadata for DrawerMetaContext injection (2.13 + A-05) ────────
// Provides flavor accent color, section icon, and breadcrumb text per drawer.
// These are injected via DrawerMetaContext so existing drawer files need no changes.
// Individual drawer files can override by passing explicit DrawerShell props.
const DRAWER_META = {
  home:      { flavorToken: 'home',      sectionIcon: Home,     breadcrumb: 'Home' },
  courses:   { flavorToken: 'courses',   sectionIcon: BookOpen,  breadcrumb: 'My Courses' },
  rescue:    { flavorToken: 'rescue',    sectionIcon: LifeBuoy,  breadcrumb: 'Rescue Kit' },
  bookmarks: { flavorToken: 'bookmarks', sectionIcon: Bookmark,  breadcrumb: 'Bookmarks' },
  calendar:  { flavorToken: 'calendar',  sectionIcon: Calendar,  breadcrumb: 'Calendar' },
  admin:     { flavorToken: 'admin',     sectionIcon: Shield,    breadcrumb: 'Admin' },
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
/**
 * RailIcon: 44×44px min touch target per WCAG SC 2.5.5 (dec-2.7 / AC 1).
 * NavLink writes ?drawer=<id> search param on navigation (2.11 / AC 4).
 * Rescue Kit is a direct-route carve-out (spec 2.2) — no ?drawer= written.
 */
function RailIcon({ item, isActive }) {
  const Icon = item.icon;
  const [hovered, setHovered] = useState(false);
  const prefersReduced = useReducedMotion();
  const hoverStyle = railIconHoverStyle(hovered, prefersReduced);

  // Rescue Kit = direct-route (no drawer), all others write ?drawer=<id>
  const to =
    item.id === 'rescue'
      ? item.path
      : { pathname: item.path, search: `?drawer=${item.id}` };

  return (
    <NavLink
      to={to}
      end={item.path === '/portal' || item.path === '/admin'}
      aria-label={item.label}
      title={item.label}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      // w-11 h-11 = 44×44px — WCAG SC 2.5.5 min touch target (2.7 / AC 1)
      className="relative flex items-center justify-center w-11 h-11 group focus-visible:outline-none focus-visible:ring-2"
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

// ── Determine active rail id from pathname (fallback when ?drawer= absent) ─
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
function DesktopTwoRail({ isAdmin, activeRailId: pathActiveRailId, drawerCollapsed, onToggleCollapsed }) {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef(null);

  // ── URL-state: ?drawer= is canonical source for active drawer (2.11) ───
  const [searchParams, setSearchParams] = useSearchParams();
  const drawerParam = searchParams.get('drawer');
  // Effective active drawer: URL param wins, else pathname-derived
  const activeRailId = drawerParam || pathActiveRailId;

  // ── Close drawer: removes ?drawer= param ─────────────────────────────
  const closeDrawer = useCallback(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete('drawer');
        return next;
      },
      { replace: true }
    );
  }, [setSearchParams]);

  // ── ESC closes active drawer; focus returns to rail icon (2.9 / AC 2) ─
  useEffect(() => {
    const handler = (/** @type {KeyboardEvent} */ e) => {
      if (e.key === 'Escape' && drawerParam) {
        closeDrawer();
        // Return focus to the active rail icon (best-effort)
        const railIcon = document.querySelector(
          `[aria-label="${DRAWER_META[drawerParam]?.breadcrumb || drawerParam}"]`
        );
        if (railIcon instanceof HTMLElement) railIcon.focus();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [drawerParam, closeDrawer]);

  // ── Click-outside closes active drawer (2.10 / AC 3) ─────────────────
  // Fires on pointerdown; ignores clicks inside <nav> rail or <aside> drawer.
  // Home drawer is persistent — skip close if ?drawer=home.
  const railNavRef = useRef(null);
  const drawerAsideRef = useRef(null);

  useEffect(() => {
    const handler = (/** @type {PointerEvent} */ e) => {
      if (!drawerParam) return;
      // Home drawer is persistent — click-outside does not close it (spec 2.10)
      if (drawerParam === 'home') return;
      if (railNavRef.current?.contains(/** @type {Node} */ (e.target))) return;
      if (drawerAsideRef.current?.contains(/** @type {Node} */ (e.target))) return;
      closeDrawer();
    };
    document.addEventListener('pointerdown', handler);
    return () => document.removeEventListener('pointerdown', handler);
  }, [drawerParam, closeDrawer]);

  // ── Account menu close handlers (unchanged from R2) ───────────────────
  const handleSignOut = async () => {
    setAccountMenuOpen(false);
    await signOut();
    navigate('/');
  };

  useEffect(() => {
    if (!accountMenuOpen) return;
    const onClick = (e) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target)) {
        setAccountMenuOpen(false);
      }
    };
    const onKey = (e) => { if (e.key === 'Escape') setAccountMenuOpen(false); };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [accountMenuOpen]);

  const displayName =
    profile?.display_name || user?.email?.split('@')[0] || 'Student';
  const initials = displayName
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  const DrawerComponent = DRAWERS[activeRailId] || HomeDrawer;
  const baseDrawerMeta = DRAWER_META[activeRailId] || DRAWER_META.home;
  // Inject Wave 9 E5 collapse-toggle wiring through DrawerMetaContext so each
  // DrawerShell instance shows the chevron without per-drawer prop plumbing.
  const drawerMeta = {
    ...baseDrawerMeta,
    onCollapseToggle: onToggleCollapsed,
    collapsed: drawerCollapsed,
  };

  return (
    <>
      {/* ── RAIL (72px, fixed at inline-start edge) ───────────────────── */}
      {/* start-0 = inset-inline-start: 0 (RTL-safe logical property, 2.12) */}
      <aside
        className="hidden md:flex flex-col fixed start-0 top-0 h-screen w-[72px] z-40"
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
        {/* ref attached for click-outside boundary (2.10 / AC 3) */}
        <nav
          ref={railNavRef}
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

        {/* Rail bottom: avatar + username (D3 locked) — click opens account menu */}
        <div ref={accountMenuRef} className="relative flex flex-col items-center gap-1 pb-4 flex-shrink-0">
          <button
            type="button"
            className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs focus-visible:outline-none focus-visible:ring-2"
            aria-label={`Account: ${displayName}`}
            aria-expanded={accountMenuOpen}
            aria-haspopup="menu"
            title={displayName}
            onClick={() => setAccountMenuOpen((o) => !o)}
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

          {accountMenuOpen && (
            <div
              role="menu"
              className="absolute left-[60px] bottom-4 w-52 rounded-xl shadow-lg py-2 z-50"
              style={{
                backgroundColor: 'var(--pt-elevation-2-hex, #ffffff)',
                border: '1px solid var(--pt-border-subtle-hex, #d6d3d1)',
              }}
            >
              <div className="px-4 py-2 border-b" style={{ borderColor: 'var(--pt-border-subtle-hex, #e7e5e4)' }}>
                <p className="text-xs text-foreground/50 truncate" title={user?.email}>
                  {user?.email}
                </p>
              </div>
              <button
                type="button"
                role="menuitem"
                onClick={() => { setAccountMenuOpen(false); navigate('/account/password'); }}
                className="w-full text-left px-4 py-2 text-sm hover:bg-black/5 transition-colors"
              >
                Change password
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={handleSignOut}
                className="w-full text-left px-4 py-2 text-sm hover:bg-black/5 transition-colors text-red-600"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ── DRAWER (280px, inset-inline-start: 72px for RTL safety, 2.12) ─ */}
      {/* start-[72px] = inset-inline-start: 72px (logical property)           */}
      {/* DrawerMetaContext provides flavor/icon/breadcrumb to DrawerShell      */}
      {/* Wave 9 E5: collapsed → width 0 + visibility hidden + aria-hidden.     */}
      {/*   DOM remains rendered (preserves React state); CSS-only collapse.   */}
      <aside
        ref={drawerAsideRef}
        className="hidden md:flex fixed start-[72px] top-0 h-screen z-30"
        aria-label="Contextual drawer"
        aria-hidden={drawerCollapsed ? 'true' : undefined}
        style={{
          width: drawerCollapsed ? 0 : 280,
          visibility: drawerCollapsed ? 'hidden' : 'visible',
          overflow: drawerCollapsed ? 'hidden' : 'visible',
          backgroundColor: 'var(--pt-drawer-hex, #d6d3d1)',
          borderInlineEnd: drawerCollapsed
            ? 'none'
            : '1px solid var(--pt-border-subtle-hex, #d6d3d1)',
          transition: 'width 200ms cubic-bezier(0,0,0.2,1)',
        }}
      >
        {/* Context injects flavor/icon/breadcrumb to DrawerShell (2.13 + A-05) */}
        {/* Plus Wave 9 E5: onCollapseToggle + collapsed for chevron toggle.    */}
        <DrawerMetaContext.Provider value={drawerMeta}>
          <DrawerComponent />
        </DrawerMetaContext.Provider>
      </aside>

      {/* Wave 9 E5: re-expand affordance — fixed-position chevron button at rail
          edge, shown only when drawer is collapsed. Clicking it expands the
          drawer back to its normal 280px width. Users can also click the rail
          icon itself (which already routes to the drawer's home view) but the
          rail icons don't toggle collapse — this affordance bridges that gap. */}
      {drawerCollapsed && (
        <button
          type="button"
          onClick={onToggleCollapsed}
          aria-label="Show drawer"
          aria-expanded="false"
          title="Show drawer"
          className="hidden md:flex fixed start-[72px] top-3 z-40 items-center justify-center rounded-e-md focus-visible:outline-none focus-visible:ring-2"
          style={{
            width: 22,
            height: 28,
            border: '1px solid var(--pt-border-subtle-hex, #d6d3d1)',
            borderInlineStart: 'none',
            backgroundColor: 'var(--pt-elevation-2-hex, #ffffff)',
            color: 'var(--pt-text-muted-hex, #57534e)',
            cursor: 'pointer',
            outlineColor: 'var(--pt-focus-ring-hex, #B96A5F)',
            boxShadow: '0 1px 3px rgba(28,25,23,0.10)',
          }}
        >
          <span aria-hidden="true" style={{ fontSize: 12, lineHeight: 1 }}>
            ›
          </span>
        </button>
      )}
    </>
  );
}

// ── Mobile bottom-nav (unchanged from R2) ─────────────────────────────────
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

  // Wave 9 E5: drawer collapsed state — sync-restored from LS pre-paint.
  // Default `false` (expanded) for new users per Chase 2026-05-10 lock.
  const [drawerCollapsed, setDrawerCollapsed] = useState(() =>
    readDrawerCollapsedFromLs()
  );

  const handleToggleCollapsed = useCallback(() => {
    setDrawerCollapsed((prev) => {
      const next = !prev;
      writeDrawerCollapsedToLs(next);
      return next;
    });
  }, []);

  // Close any residual body lock on route change
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    document.body.style.overflow = '';
  }, [location.pathname]);

  // Main-content inline-start margin: 72 (rail) + 280 (drawer) = 352 expanded;
  // 72 (rail only) when drawer is collapsed.
  const mainMarginClass = drawerCollapsed ? 'md:ms-[72px]' : 'md:ms-[352px]';

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
        <DesktopTwoRail
          isAdmin={isAdmin}
          activeRailId={activeRailId}
          drawerCollapsed={drawerCollapsed}
          onToggleCollapsed={handleToggleCollapsed}
        />

        {/* Main content — margin shifts based on drawer-collapsed state.       */}
        {/* Expanded: ms-[352px] = 72 (rail) + 280 (drawer). Collapsed: ms-[72px]. */}
        {/* Logical property `ms-` = margin-inline-start (RTL-safe).            */}
        <main
          className={`flex-1 ${mainMarginClass} flex flex-col min-h-screen overflow-y-auto pb-[80px] md:pb-0 transition-[margin] duration-200 ease-out`}
        >
          <Outlet />
        </main>

        {/* Mobile bottom-nav */}
        <MobileBottomNav />
      </div>
    </>
  );
}
