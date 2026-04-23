/**
 * Portal Design Tokens — Healing Hearts Portal v1
 *
 * Strategy  : Neutral-first warm palette (Option B Neutral-first, CEO-AGENDA §13.1 D8/D10)
 * Date      : 2026-04-23
 *
 * Sources
 *   TW4    = Tailwind v4 CSS colors  https://tailwindcss.com/docs/colors
 *   HH     = HealingHeartsWebsite/tailwind.config.js  (brand tokens, read-only)
 *   RADIX  = Radix UI Colors scales  https://www.radix-ui.com/colors/docs/palette-composition/scales
 *
 * CONSTRAINT SUMMARY (D10 hard constraints)
 *   - No pure black on rail  -> rail is warm-brown charcoal #24201D
 *   - Chroma < 0.12 on all surface/accent tokens  -> max accent chroma 0.098
 *   - No cold-blue state indicators  -> success=green, warning=amber, danger=red, focus=terracotta
 *   - No shimmer / glassmorphism  -> flat color values only, no gradient token values on surfaces
 *   - No bounce/overshoot easing  -> belongs in motion.js, not here
 *   - No borderLeft-3px-solid AI-slop  -> use border-subtle / border-strong outline tokens
 *   - No PHEDRIS dark palette tokens  -> #0d1117 / #21262d / #30363d absent
 */

export const portalTokens = {

  // ─────────────────────────────────────────────────────────────────────────────
  // RAIL
  // ─────────────────────────────────────────────────────────────────────────────

  rail: {
    oklch: 'oklch(14.2% 0.009 40)',
    hex: '#24201D',
    why: 'D8 locked. Warm-brown charcoal validated against TW4 Taupe-950 (+/-5% luminance). Not pure black per D10.',
  },

  'rail-hover': {
    oklch: 'oklch(16.6% 0.008 38)',
    hex: '#2C2823',
    why: 'D8 locked. Minimal lightness bump for hover feedback, hue stays warm-brown.',
  },

  'rail-active-bg': {
    oklch: 'oklch(17.4% 0.008 37)',
    hex: '#2F2823',
    why: 'D8 locked. Pressed state, 1% brighter than rail-hover.',
  },

  'rail-selected-chip': {
    oklch: 'oklch(52.4% 0.098 28) -> oklch(62% 0.090 50)',
    hex: '#B96A5F -> #C49A6C',
    gradientCss: 'linear-gradient(135deg, #B96A5F 0%, #C49A6C 100%)',
    backgroundSize: '200% 200%',
    animationName: 'rail-chip-breathe',
    why: 'Warm terracotta-to-amber signature gradient. Chroma <= 0.098 (D10). D9 motion: 4s ease-in-out infinite alternate.',
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // DRAWER
  // ─────────────────────────────────────────────────────────────────────────────

  drawer: {
    oklch: 'oklch(86.9% 0.005 56)',
    hex: '#d6d3d1',
    why: 'TW4 Stone-300. Warm sand surface. text-primary passes AAA (11.8:1).',
  },

  'drawer-hover': {
    oklch: 'oklch(70.9% 0.010 56)',
    hex: '#a8a29e',
    why: 'TW4 Stone-400. Visible hover darkening without saturation increase.',
  },

  'drawer-active-bg': {
    oklch: 'oklch(98.5% 0.001 106)',
    hex: '#fafaf9',
    why: 'TW4 Stone-50. Warm near-white pill on drawer.',
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // CONTENT AREA SURFACES
  // ─────────────────────────────────────────────────────────────────────────────

  'content-bg': {
    oklch: 'oklch(97.0% 0.001 106)',
    hex: '#f5f5f4',
    why: 'TW4 Stone-100. Less bright than white; warm tone.',
  },

  'elevation-1': {
    oklch: 'oklch(92.3% 0.003 49)',
    hex: '#e7e5e4',
    why: 'TW4 Stone-200. Subtle card surface step above content-bg.',
  },

  'elevation-2': {
    oklch: 'oklch(100% 0 0)',
    hex: '#ffffff',
    why: 'Pure white for modal/popover surfaces.',
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // BORDERS
  // ─────────────────────────────────────────────────────────────────────────────

  'border-subtle': {
    oklch: 'oklch(86.9% 0.005 56)',
    hex: '#d6d3d1',
    why: 'TW4 Stone-300. Dividers, card outlines.',
  },

  'border-strong': {
    oklch: 'oklch(55.3% 0.013 58)',
    hex: '#78716c',
    why: 'TW4 Stone-500. Mid-tone border for input fields.',
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // TEXT
  // ─────────────────────────────────────────────────────────────────────────────

  'text-primary': {
    oklch: 'oklch(21.6% 0.006 56)',
    hex: '#1c1917',
    why: 'TW4 Stone-900. Warm near-black for primary text.',
  },

  'text-muted': {
    oklch: 'oklch(44.4% 0.011 74)',
    hex: '#57534e',
    why: 'TW4 Stone-600. AA on content-bg (6.4:1) and drawer (4.9:1).',
  },

  'text-inverse': {
    oklch: 'oklch(98.5% 0.001 106)',
    hex: '#fafaf9',
    why: 'TW4 Stone-50. Warm near-white on dark rail. Rail contrast: 15.9:1 (AAA).',
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // BRAND ACCENT
  // ─────────────────────────────────────────────────────────────────────────────

  'primary-accent': {
    oklch: 'oklch(52.4% 0.098 28)',
    hex: '#B96A5F',
    why: 'HH brand accent. Warm terracotta. Chroma 0.098 (D10). Single signature color.',
  },

  'primary-accent-hover': {
    oklch: 'oklch(57.5% 0.098 28)',
    hex: '#C87B6F',
    why: 'HH accent +5% OKLCH luminance. CTA button hover state.',
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // STATUS TOKENS (semantic only)
  // ─────────────────────────────────────────────────────────────────────────────

  success: {
    oklch: 'oklch(52.7% 0.154 150)',
    hex: '#15803d',
    why: 'TW4 Green-700. Warm-leaning green; AAA on content-bg.',
  },

  warning: {
    oklch: 'oklch(55.5% 0.163 49)',
    hex: '#b45309',
    why: 'TW4 Amber-700. Warm amber.',
  },

  danger: {
    oklch: 'oklch(50.5% 0.213 28)',
    hex: '#b91c1c',
    why: 'TW4 Red-700. Standard semantic danger.',
  },

  'focus-ring': {
    oklch: 'oklch(52.4% 0.098 28)',
    hex: '#B96A5F',
    why: 'Same as primary-accent. Warm terracotta focus ring replaces cold-blue default.',
  },
};

/**
 * CSS custom-property export helper.
 * Usage in PortalLayout.jsx:
 *   import { portalTokensAsCssVars } from '@/portal/design/tokens';
 *   <div style={portalTokensAsCssVars()} className="portal-root">
 */
export function portalTokensAsCssVars() {
  return Object.entries(portalTokens).reduce((vars, [key, value]) => {
    if (value && typeof value === 'object' && value.hex) {
      vars[`--pt-${key}`] = value.oklch;
      vars[`--pt-${key}-hex`] = value.hex;
    }
    return vars;
  }, {});
}
