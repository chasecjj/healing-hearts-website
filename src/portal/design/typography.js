/**
 * Portal Typography System — Healing Hearts Portal v1
 *
 * Font stacks sourced from: HealingHeartsWebsite/tailwind.config.js (read-only reference)
 * Type scale sourced from: CEO-AGENDA §5 (portal as tool-like product) + scout-03 patterns
 */

export const fontStacks = {
  'plus-jakarta': '"Plus Jakarta Sans", system-ui, -apple-system, sans-serif',
  outfit: '"Outfit", "Plus Jakarta Sans", sans-serif',
  drama: '"Playfair Display", Georgia, serif', // marketing only; not used in portal UI
  mono: '"IBM Plex Mono", "Fira Code", monospace',
};

export const fontWeights = {
  regular: 400,
  medium: 500,
  semibold: 600,
};

export const portalType = {
  scale: {
    display: {
      fontSize: '30px',
      lineHeight: 1.1,
      fontWeight: fontWeights.semibold,
      fontFamily: fontStacks['plus-jakarta'],
      letterSpacing: '-0.01em',
    },
    'heading-1': {
      fontSize: '24px',
      lineHeight: 1.2,
      fontWeight: fontWeights.semibold,
      fontFamily: fontStacks['plus-jakarta'],
      letterSpacing: '-0.01em',
    },
    'heading-2': {
      fontSize: '20px',
      lineHeight: 1.3,
      fontWeight: fontWeights.semibold,
      fontFamily: fontStacks['plus-jakarta'],
      letterSpacing: '0',
    },
    'body-lg': {
      fontSize: '17px',
      lineHeight: 1.55,
      fontWeight: fontWeights.regular,
      fontFamily: fontStacks['plus-jakarta'],
      letterSpacing: '0',
    },
    body: {
      fontSize: '15px',
      lineHeight: 1.55,
      fontWeight: fontWeights.regular,
      fontFamily: fontStacks['plus-jakarta'],
      letterSpacing: '0',
    },
    caption: {
      fontSize: '13px',
      lineHeight: 1.45,
      fontWeight: fontWeights.regular,
      fontFamily: fontStacks['plus-jakarta'],
      letterSpacing: '0.02em',
    },
    meta: {
      fontSize: '12px',
      lineHeight: 1.4,
      fontWeight: fontWeights.regular,
      fontFamily: fontStacks['plus-jakarta'],
      letterSpacing: '0.02em',
    },
  },

  numericDisplay: {
    statLarge: {
      fontSize: '28px',
      lineHeight: 1.0,
      fontWeight: fontWeights.semibold,
      fontFamily: fontStacks.outfit,
      letterSpacing: '-0.02em',
    },
    statSmall: {
      fontSize: '18px',
      lineHeight: 1.1,
      fontWeight: fontWeights.medium,
      fontFamily: fontStacks.outfit,
      letterSpacing: '-0.01em',
    },
  },
};

export function getTypeStyle(role, weight) {
  const base = portalType.scale[role];

  if (!base) {
    if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn(
        `[portalType] Unknown role "${role}". Valid roles: ${Object.keys(portalType.scale).join(', ')}`
      );
    }
    return portalType.scale.body;
  }

  if (weight && fontWeights[weight] !== undefined) {
    return { ...base, fontWeight: fontWeights[weight] };
  }

  return base;
}

export function getNumericStyle(variant = 'statLarge') {
  return portalType.numericDisplay[variant] ?? portalType.numericDisplay.statLarge;
}
