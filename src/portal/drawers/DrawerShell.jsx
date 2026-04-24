/**
 * DrawerShell — shared shell for all 6 contextual drawers.
 *
 * v1.1 changes (W-01 shell-rail-refactor):
 *   - Top-bar: Home icon + sectionIcon + label + breadcrumb + 2px flavor accent (2.13 + A-05)
 *   - DrawerMetaContext: PortalLayout injects flavor/icon/breadcrumb without touching drawer files
 *   - DrawerItem: 3-state Slack-depth darkening via token tiers (2.14)
 *   - Entrance motion: drawerContentVariants() from motion.js (2.19)
 *   - useReducedMotion() wraps animation (WCAG 2.1 SC 2.3.3 / D10)
 *
 * A-05 WCAG 1.4.1: active section identity conveyed via icon + label + breadcrumb text;
 *   hue/color is DECORATION ONLY — never the sole semantic channel.
 *
 * Tokens consumed: --pt-drawer (bg), --pt-text-primary, --pt-text-muted,
 *   --pt-border-subtle, --pt-flavor-<token>-hex (accent line),
 *   --pt-drawer-hover, --pt-drawer-active-bg (item tiers).
 *   Set by PortalLayout.portalTokensAsCssVars().
 */

import React, { useContext, useEffect, useState } from 'react';
import { Home } from 'lucide-react';
import { getTypeStyle } from '../design/typography';
import { drawerContentVariants, useReducedMotion } from '../design/motion';
import { DrawerMetaContext } from '../context/DrawerMetaContext';

// ── Entrance motion helper ────────────────────────────────────────────────
/**
 * Uses drawerContentVariants() from motion.js (2.19 / AC 10).
 * Drives a CSS transition from variants.item.hidden → variants.item.visible.
 * No framer-motion dependency required; factory values consumed for CSS.
 */
function useDrawerEntrance(prefersReduced) {
  const variants = drawerContentVariants(prefersReduced);
  const [phase, setPhase] = useState('hidden');

  useEffect(() => {
    // Trigger on next paint after mount so initial paint is hidden, then reveal
    const raf = requestAnimationFrame(() => setPhase('visible'));
    return () => {
      cancelAnimationFrame(raf);
      setPhase('hidden'); // reset on unmount (next mount starts hidden again)
    };
  }, []);

  const hidden = variants.item.hidden;
  const visible = variants.item.visible;
  const current = phase === 'visible' ? visible : hidden;

  const ease = current.transition?.ease;
  const easeStr = Array.isArray(ease)
    ? `cubic-bezier(${ease.join(',')})`
    : (ease || 'ease');
  const durationStr = `${current.transition?.duration ?? 0}s`;
  const transitionCss =
    phase === 'visible'
      ? `opacity ${durationStr} ${easeStr}, transform ${durationStr} ${easeStr}`
      : 'none';

  return {
    style: {
      opacity: current.opacity ?? 1,
      transform: `translateY(${current.y ?? 0}px)`,
      transition: transitionCss,
    },
  };
}

// ── DrawerShell ───────────────────────────────────────────────────────────
/**
 * @param {{
 *   title?: string,
 *   children: React.ReactNode,
 *   scrollable?: boolean,
 *   collapsible?: boolean,
 *   ariaContext?: string,
 *   drawerId?: string,
 *   sectionIcon?: React.ComponentType<{className?: string, strokeWidth?: number, 'aria-hidden'?: boolean}>,
 *   flavorToken?: string,
 *   breadcrumb?: string,
 * }} props
 */
export function DrawerShell({
  title,
  children,
  scrollable = true,
  collapsible = false,
  ariaContext,
  // New v1.1 props (all optional — backward-compatible with existing callers):
  drawerId,
  sectionIcon: SectionIconProp,
  flavorToken: flavorTokenProp,
  breadcrumb: breadcrumbProp,
}) {
  // Context fallback: PortalLayout injects these when drawer files aren't yet updated
  const ctx = useContext(DrawerMetaContext);
  const flavorToken = flavorTokenProp ?? ctx.flavorToken;
  const SectionIcon = SectionIconProp ?? ctx.sectionIcon;
  const breadcrumb = breadcrumbProp ?? ctx.breadcrumb ?? title;

  const prefersReduced = useReducedMotion();
  const entranceMotion = useDrawerEntrance(prefersReduced);

  const label = `${ariaContext || title || 'Contextual'} drawer`;

  // Flavor accent color — CSS var from tokens.js (decoration only per A-05)
  const flavorVarHex = flavorToken
    ? `var(--pt-flavor-${flavorToken}-hex, var(--pt-primary-accent-hex, #B96A5F))`
    : `var(--pt-primary-accent-hex, #B96A5F)`;

  return (
    <aside
      role="complementary"
      aria-label={label}
      data-portal-drawer
      data-drawer-id={drawerId}
      data-collapsible={collapsible ? 'true' : undefined}
      className="h-full w-full flex flex-col"
      style={{
        backgroundColor: 'var(--pt-drawer-hex, #d6d3d1)',
        color: 'var(--pt-text-primary-hex, #1c1917)',
      }}
    >
      {/* ── Top-bar: 2px flavor accent + Home icon + label + breadcrumb ── */}
      {/* A-05: identity conveyed via icon + label + breadcrumb (NOT color alone) */}
      <div className="flex-shrink-0" role="navigation" aria-label={`${title || 'Section'} top bar`}>
        {/* 2px section-flavor accent line (DECORATION ONLY per A-05 / WCAG 1.4.1) */}
        <div
          aria-hidden="true"
          style={{ height: 2, backgroundColor: flavorVarHex }}
        />

        {/* Top-bar content row */}
        <div
          className="flex items-center gap-2 px-4 py-3"
          style={{ borderBottom: '1px solid var(--pt-border-subtle-hex, #d6d3d1)' }}
        >
          {/* Home icon — always present; semantic anchor per 2.13 */}
          <Home
            className="w-4 h-4 flex-shrink-0"
            strokeWidth={1.75}
            aria-hidden="true"
            style={{ color: 'var(--pt-text-muted-hex, #57534e)' }}
          />

          {/* Section icon — semantic identity channel (A-05) */}
          {SectionIcon && (
            <SectionIcon
              className="w-4 h-4 flex-shrink-0"
              strokeWidth={1.75}
              aria-hidden="true"
              style={{ color: 'var(--pt-text-primary-hex, #1c1917)' }}
            />
          )}

          {/* Section label — semantic identity channel (A-05) */}
          <span
            style={{
              ...getTypeStyle('meta', 'semibold'),
              color: 'var(--pt-text-primary-hex, #1c1917)',
              flexShrink: 1,
              minWidth: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {title || ''}
          </span>

          {/* Breadcrumb text — semantic position channel (A-05) */}
          {breadcrumb && breadcrumb !== title && (
            <>
              <span
                aria-hidden="true"
                style={{
                  ...getTypeStyle('meta'),
                  color: 'var(--pt-text-muted-hex, #57534e)',
                  flexShrink: 0,
                }}
              >
                ›
              </span>
              <span
                style={{
                  ...getTypeStyle('meta'),
                  color: 'var(--pt-text-muted-hex, #57534e)',
                  flexShrink: 0,
                  whiteSpace: 'nowrap',
                }}
              >
                {breadcrumb}
              </span>
            </>
          )}
        </div>
      </div>

      {/* ── Content area (entrance motion via drawerContentVariants) ─────── */}
      {/* drawerContentVariants() consumed per 2.19 / AC 10 */}
      <div
        className={`flex-1 px-2 py-3 ${scrollable ? 'overflow-y-auto' : 'overflow-hidden'}`}
        style={entranceMotion.style}
      >
        {children}
      </div>
    </aside>
  );
}

// ── DrawerSection ─────────────────────────────────────────────────────────
/**
 * DrawerSection — collapsible labeled section (Slack pattern §2.1).
 * Uses native <details>/<summary> for zero-dependency a11y.
 */
export function DrawerSection({ label, defaultOpen = true, badge, children }) {
  return (
    <details
      open={defaultOpen}
      className="group mb-2"
      style={{ borderBottom: '1px solid transparent' }}
    >
      {label ? (
        <summary
          className="flex items-center justify-between px-3 py-2 cursor-pointer list-none select-none"
          style={{
            ...getTypeStyle('meta', 'semibold'),
            color: 'var(--pt-text-muted-hex, #57534e)',
            textTransform: 'uppercase',
          }}
        >
          <span className="flex items-center gap-2">
            {label}
            {typeof badge === 'number' && badge > 0 && (
              <span
                style={{
                  ...getTypeStyle('meta'),
                  backgroundColor: 'rgba(185, 106, 95, 0.16)',
                  color: 'var(--pt-primary-accent-hex, #B96A5F)',
                  padding: '1px 6px',
                  borderRadius: '9999px',
                  lineHeight: 1,
                }}
              >
                {badge}
              </span>
            )}
          </span>
          <span
            aria-hidden="true"
            className="transition-transform group-open:rotate-180"
            style={{ color: 'var(--pt-text-muted-hex, #57534e)', fontSize: 10 }}
          >
            ▾
          </span>
        </summary>
      ) : null}
      <div className="px-1 pb-2">{children}</div>
    </details>
  );
}

// ── DrawerItem — Slack-depth 3-state darkening (2.14) ────────────────────
/**
 * DrawerItem implements 3-tier token darkening per spec 2.14:
 *   inactive  → transparent (drawer bg shows through)
 *   hover     → --pt-drawer-hover-hex  (Stone-400 #a8a29e — visible darkening)
 *   active    → --pt-drawer-active-bg-hex (Stone-50 #fafaf9 — warm near-white pill)
 *
 * All 3 states distinguishable at WCAG AA contrast against text-primary.
 *
 * @param {{
 *   icon?: React.ComponentType<{className?: string, strokeWidth?: number, 'aria-hidden'?: boolean}>,
 *   label: string,
 *   isActive?: boolean,
 *   onClick?: () => void,
 *   badge?: number,
 * }} props
 */
export function DrawerItem({ icon: Icon, label, isActive = false, onClick, badge }) {
  const [hovered, setHovered] = useState(false);

  let bgColor;
  if (isActive) {
    bgColor = 'var(--pt-drawer-active-bg-hex, #fafaf9)';
  } else if (hovered) {
    bgColor = 'var(--pt-drawer-hover-hex, #a8a29e)';
  } else {
    bgColor = 'transparent';
  }

  return (
    <button
      type="button"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      aria-current={isActive ? 'page' : undefined}
      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-start"
      style={{
        backgroundColor: bgColor,
        transition: 'background-color 150ms cubic-bezier(0,0,0.2,1)',
        color: 'var(--pt-text-primary-hex, #1c1917)',
        border: 'none',
        cursor: 'pointer',
        outline: 'none',
      }}
    >
      {Icon && (
        <Icon
          className="w-4 h-4 flex-shrink-0"
          strokeWidth={isActive ? 2 : 1.75}
          aria-hidden="true"
        />
      )}
      <span
        style={{
          ...getTypeStyle('caption', isActive ? 'semibold' : 'normal'),
          flexGrow: 1,
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          textAlign: 'start',
        }}
      >
        {label}
      </span>
      {typeof badge === 'number' && badge > 0 && (
        <span
          style={{
            ...getTypeStyle('meta'),
            backgroundColor: 'rgba(185, 106, 95, 0.16)',
            color: 'var(--pt-primary-accent-hex, #B96A5F)',
            padding: '1px 6px',
            borderRadius: '9999px',
            lineHeight: 1,
            flexShrink: 0,
          }}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

// ── EmptyState ────────────────────────────────────────────────────────────
/**
 * EmptyState — consistent empty-state treatment per spec §10
 */
export function EmptyState({ icon, message, sub, cta }) {
  return (
    <div className="flex flex-col items-center text-center py-6 px-4 gap-2">
      {icon && <div aria-hidden="true" style={{ fontSize: 28 }}>{icon}</div>}
      <p style={{ ...getTypeStyle('body', 'medium'), margin: 0 }}>{message}</p>
      {sub && (
        <p
          style={{
            ...getTypeStyle('caption'),
            color: 'var(--pt-text-muted-hex, #57534e)',
            margin: 0,
          }}
        >
          {sub}
        </p>
      )}
      {cta && <div className="mt-2">{cta}</div>}
    </div>
  );
}

export default DrawerShell;
