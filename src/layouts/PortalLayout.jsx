/**
 * PortalLayout.jsx — Round 1 chassis rebuild
 *
 * Desktop:  72px dark rail + 240px beige drawer (always-open) + content area
 * Mobile:   content fills viewport, 80px bottom-nav (5 items, admin hidden)
 *           + bottom-sheet stub for secondary actions (Round 2 populates)
 *
 * Tokens from tailwind.config.js:
 *   rail (#24201D), drawer (#DDD3C4), elevation-1, elevation-2,
 *   primary-dark (#0D6E87, 3.4:1 on rail), accent-dark (#8C4A40, 3.1:1 on rail)
 *
 * Animation hooks: see § 7 of dispatch-brief.
 * The 4s breathing gradient on the selected rail icon IS implemented (CEO-specified).
 */

import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, ChevronUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { studentNavItems, adminNavItems } from './portalNav.config';

// ── CSS keyframes injected once ────────────────────────────────────────────
// The 4s breathing gradient on the selected rail icon.
// Respects prefers-reduced-motion: the @media block disables animation
// and falls back to a static primary-teal fill.
const BREATHING_GRADIENT_STYLE = `
@keyframes rail-breathing {
  0%   { background-position: 0%   50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0%   50%; }
}

.rail-active-pill {
  background: linear-gradient(135deg, #1191B1 0%, #B96A5F 100%);
  background-size: 200% 200%;
  animation: rail-breathing 4s ease infinite;
}

@media (prefers-reduced-motion: reduce) {
  .rail-active-pill {
    background: #1191B1;
    background-size: unset;
    animation: none;
  }
}
`;

function BreathingGradientStyles() {
  return <style>{BREATHING_GRADIENT_STYLE}</style>;
}

// ── Derived isAdmin predicate ───────────────────────────────────────────────
// Per dispatch-brief § 4: email-domain check is an ADDITIONAL affirmative path,
// not a replacement for the existing profile.role === 'admin' check.
function useIsAdmin() {
  const { user, isAdmin: profileRoleIsAdmin } = useAuth();
  const emailDomainIsAdmin =
    typeof user?.email === 'string' &&
    user.email.endsWith('@healingheartscourse.com');
  return profileRoleIsAdmin === true || emailDomainIsAdmin === true;
}

// ── Rail icon (desktop + helpers) ──────────────────────────────────────────

/**
 * RailIcon — renders a single icon in the 72px dark rail.
 * Selected state: 4s breathing gradient pill.
 * Hover state: bg-rail-hover transition.
 */
function RailIcon({ item, isActive }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.path}
      end={item.path === '/portal' || item.path === '/admin'}
      aria-label={item.label}
      title={item.label}
      className="relative flex items-center justify-center w-10 h-10 rounded-xl transition-colors duration-150 ease-in-out group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-dark"
      // [animation-target: rail-hover-opacity]
    >
      {/* Breathing gradient pill (selected) or hover bg */}
      {isActive ? (
        // [animation-target: rail-breathing-gradient]
        <span
          className="rail-active-pill absolute inset-0 rounded-xl"
          aria-hidden="true"
        />
      ) : (
        <span
          className="absolute inset-0 rounded-xl bg-transparent group-hover:bg-rail-hover transition-colors duration-150 ease-in-out"
          aria-hidden="true"
        />
      )}
      {/* Icon — layered above pill */}
      {/* [animation-target: rail-scale-pulse] */}
      <span className="relative z-10">
        <Icon
          className={`w-5 h-5 transition-colors duration-150 ${
            isActive ? 'text-white' : 'text-primary-dark group-hover:text-white/80'
          }`}
          strokeWidth={1.75}
          aria-hidden="true"
        />
      </span>
    </NavLink>
  );
}

// ── Drawer item (desktop) ───────────────────────────────────────────────────

function DrawerItem({ item, onClick }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.path}
      end={item.path === '/portal' || item.path === '/admin'}
      onClick={onClick}
      className={({ isActive }) =>
        `relative flex items-center gap-3 h-10 px-3 rounded-lg text-[13px] font-medium transition-colors duration-150 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40
        ${
          isActive
            ? 'text-foreground'
            : 'text-foreground/70 hover:text-foreground hover:bg-drawer-hover'
        }`
        // [animation-target: drawer-item-hover]
      }
    >
      {({ isActive }) => (
        <>
          {/* Active pill background */}
          {isActive && (
            // [animation-target: drawer-pill-slide]
            <span
              className="absolute inset-0 rounded-lg bg-drawer-active-bg shadow-sm"
              aria-hidden="true"
            />
          )}
          <span className="relative z-10 flex items-center gap-3">
            <Icon
              className={`w-4 h-4 flex-shrink-0 ${
                isActive ? 'text-primary' : 'text-foreground/50'
              }`}
              strokeWidth={1.75}
              aria-hidden="true"
            />
            <span>{item.label}</span>
          </span>
        </>
      )}
    </NavLink>
  );
}

// ── Desktop two-rail (Rail + Drawer) ───────────────────────────────────────

function DesktopTwoRail({ isAdmin }) {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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

  // Determine active rail item
  const activeRailId = (() => {
    const pathname = location.pathname;
    // Admin items checked first
    if (isAdmin) {
      for (const item of adminNavItems) {
        if (pathname === item.path || pathname.startsWith(item.path + '/')) {
          return item.id;
        }
      }
    }
    // Student items — reverse order so longer paths match first
    for (const item of [...studentNavItems].reverse()) {
      if (item.path === '/portal') {
        // exact only — handled by 'end' on NavLink
        continue;
      }
      if (pathname.startsWith(item.path)) return item.id;
    }
    if (pathname === '/portal' || pathname.startsWith('/portal/course') || pathname.startsWith('/portal/')) {
      return 'home';
    }
    return null;
  })();

  return (
    <>
      {/* ── RAIL (72px) ─────────────────────────────────────────────────── */}
      <aside
        className="hidden md:flex flex-col fixed left-0 top-0 h-screen w-[72px] bg-rail z-40"
        aria-label="Main navigation rail"
      >
        {/* Logo / brand mark */}
        <div className="flex items-center justify-center h-14 flex-shrink-0">
          <span className="w-8 h-8 rounded-full bg-primary-dark flex items-center justify-center">
            <span className="font-outfit font-bold text-white text-xs">HH</span>
          </span>
        </div>

        {/* Divider */}
        <div className="mx-4 h-px bg-white/10 flex-shrink-0" />

        {/* Student nav icons */}
        <nav
          className="flex flex-col items-center gap-6 flex-1 pt-6 px-4"
          aria-label="Student navigation"
        >
          {studentNavItems.map((item) => (
            <RailIcon
              key={item.id}
              item={item}
              isActive={activeRailId === item.id}
            />
          ))}

          {/* Admin icon — desktop only, shown only when isAdmin */}
          {isAdmin && (
            <>
              <div className="w-6 h-px bg-white/10 mt-2" />
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

        {/* Avatar — below icon list, above bottom edge */}
        <div className="flex items-center justify-center pb-6 flex-shrink-0">
          <button
            className="w-10 h-10 rounded-full bg-accent-dark/80 flex items-center justify-center text-white font-outfit font-semibold text-sm hover:bg-accent-dark transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-dark"
            aria-label={`Account: ${displayName}`}
            title={`${displayName} — Sign out`}
            onClick={handleSignOut}
          >
            {initials || '?'}
          </button>
        </div>
      </aside>

      {/* ── DRAWER (240px, always-open) ────────────────────────────────── */}
      <aside
        className="hidden md:flex flex-col fixed left-[72px] top-0 h-screen w-[240px] bg-drawer z-30 border-r border-black/5"
        aria-label="Navigation drawer"
      >
        {/* Header area */}
        <div className="flex flex-col justify-end h-14 px-4 pb-3 flex-shrink-0">
          <p className="font-outfit font-semibold text-foreground text-sm leading-tight truncate">
            {displayName}
          </p>
          <p className="text-[11px] text-foreground/50 truncate">{user?.email}</p>
        </div>

        <div className="mx-4 h-px bg-foreground/10 flex-shrink-0" />

        {/* Student nav items */}
        <nav
          className="flex flex-col gap-0.5 flex-1 pt-4 px-3 overflow-y-auto"
          aria-label="Portal navigation"
        >
          <p className="px-3 mb-1 text-[10px] font-outfit font-bold uppercase tracking-widest text-foreground/40">
            My Portal
          </p>
          {studentNavItems.map((item) => (
            <DrawerItem key={item.id} item={item} />
          ))}

          {isAdmin && (
            <>
              <div className="my-3 h-px bg-foreground/10" />
              <p className="px-3 mb-1 text-[10px] font-outfit font-bold uppercase tracking-widest text-foreground/40">
                Admin
              </p>
              {adminNavItems.map((item) => (
                <DrawerItem key={item.id} item={item} />
              ))}
            </>
          )}
        </nav>

        {/* Footer */}
        <div className="px-4 pb-4 pt-3 border-t border-black/10 flex-shrink-0">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-xs text-foreground/50 hover:text-foreground transition-colors duration-150"
          >
            <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
            Sign out
          </button>
          <p className="mt-2 text-[10px] text-foreground/35 leading-relaxed">
            Healing Hearts v2026 ·{' '}
            <a href="/contact" className="hover:text-foreground/60 transition-colors">
              Contact
            </a>
          </p>
        </div>
      </aside>
    </>
  );
}

// ── Mobile bottom-nav ───────────────────────────────────────────────────────

/**
 * MobileBottomNav — 5 equal-width student items only.
 * Admin is NEVER shown here (per brief locked Q1).
 * Total height 80px (56px content + 24px iOS home-indicator buffer).
 */
function MobileBottomNav({ onSheetToggle }) {
  const location = useLocation();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200"
      style={{ height: '80px', paddingBottom: '24px' }}
      aria-label="Mobile navigation"
    >
      <div className="flex h-[56px]">
        {studentNavItems.map((item) => {
          const Icon = item.icon;
          // Determine active state
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
              className="flex-1 flex flex-col items-center justify-center gap-0.5 relative focus-visible:outline-none"
              // [animation-target: bottom-nav-ripple]
              aria-label={item.label}
            >
              {/* Active indicator pill */}
              {/* [animation-target: bottom-nav-scale] */}
              <span
                className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors duration-150 ${
                  isActive
                    ? 'bg-rail/10'
                    : 'bg-transparent'
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${
                    isActive ? 'text-foreground' : 'text-foreground/40'
                  }`}
                  strokeWidth={isActive ? 2 : 1.75}
                  aria-hidden="true"
                />
                <span
                  className={`text-[10px] font-outfit font-semibold leading-none ${
                    isActive ? 'text-foreground' : 'text-foreground/40'
                  }`}
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

// ── Mobile bottom-sheet stub (Round 2 populates) ───────────────────────────

function MobileBottomSheet({ open, onClose }) {
  return (
    <>
      {/* Backdrop */}
      {open && (
        // [animation-target: bottom-sheet-backdrop]
        <div
          className="md:hidden fixed inset-0 bg-foreground/20 z-40"
          aria-hidden="true"
          onClick={onClose}
        />
      )}

      {/* Sheet */}
      {/* [animation-target: bottom-sheet-spring] */}
      <aside
        className={`md:hidden fixed left-0 right-0 bottom-0 z-50 bg-white rounded-t-2xl shadow-lg transition-transform duration-300 ease-in-out ${
          open ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ maxHeight: '60vh' }}
        aria-label="Secondary actions sheet"
        aria-hidden={!open}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-2 pb-4">
          <span className="w-9 h-1 rounded-full bg-foreground/20" />
        </div>

        {/* Coming soon placeholder (Round 2 replaces) */}
        <div className="flex flex-col items-center justify-center gap-3 py-12 px-6">
          <p className="font-outfit font-semibold text-foreground text-base">
            More actions
          </p>
          <p className="text-foreground/50 text-sm text-center">
            Additional portal tools are coming in Round 2.
          </p>
        </div>
      </aside>
    </>
  );
}

// ── PortalLayout (root export) ─────────────────────────────────────────────

export default function PortalLayout() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const location = useLocation();
  const isAdmin = useIsAdmin();

  // Close sheet on route change
  useEffect(() => {
    setSheetOpen(false);
  }, [location.pathname]);

  // Lock body scroll when sheet is open
  useEffect(() => {
    document.body.style.overflow = sheetOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [sheetOpen]);

  return (
    <>
      <BreathingGradientStyles />

      <div className="flex min-h-screen bg-background text-foreground">
        {/* ── Desktop two-rail ───────────────────────────────────────────── */}
        <DesktopTwoRail isAdmin={isAdmin} />

        {/* ── Main content ───────────────────────────────────────────────── */}
        {/* On desktop: ml-[312px] = 72px rail + 240px drawer */}
        {/* On mobile:  full width, pb-[80px] for bottom-nav clearance */}
        <main
          className="flex-1 md:ml-[312px] flex flex-col min-h-screen overflow-y-auto pb-[80px] md:pb-0"
        >
          {/* [animation-target: page-fade-through] */}
          <Outlet />
        </main>

        {/* ── Mobile bottom-nav ──────────────────────────────────────────── */}
        <MobileBottomNav onSheetToggle={() => setSheetOpen((prev) => !prev)} />

        {/* ── Mobile bottom-sheet stub ───────────────────────────────────── */}
        <MobileBottomSheet
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
        />
      </div>
    </>
  );
}
