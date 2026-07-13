/**
 * Semantic design tokens for Speak Now.
 *
 * Palette concept: "warm hearth" — a calm, warm terracotta/clay accent on a
 * soft cream canvas. Never clinical white. A dedicated high-contrast palette
 * is provided for users who need maximum legibility.
 */

const colors = {
  light: {
    // Legacy aliases (kept for backward compatibility)
    text: '#2b2320',
    tint: '#c4622d',

    // Core surfaces
    background: '#faf3ea',
    foreground: '#2b2320',

    // Cards / elevated surfaces
    card: '#ffffff',
    cardForeground: '#2b2320',

    // Primary action color (buttons, links, active states)
    primary: '#c4622d',
    primaryForeground: '#fff8f0',

    // Secondary / less-emphasis interactive surfaces
    secondary: '#f0e4d4',
    secondaryForeground: '#2b2320',

    // Muted / subdued elements (dividers, timestamps, placeholders)
    muted: '#ece0d1',
    mutedForeground: '#8a7a6a',

    // Accent highlights (badges, selected items, focus rings)
    accent: '#e7ad6f',
    accentForeground: '#2b2320',

    // Destructive actions (delete, error states, STOP button)
    destructive: '#c73f3f',
    destructiveForeground: '#fff8f0',

    // Success / confirmation (save, correct match)
    success: '#4f8b5f',
    successForeground: '#ffffff',

    // Borders and input outlines
    border: '#e3d3bd',
    input: '#e3d3bd',

    // Sheen highlight used on glossy button sweep
    sheen: 'rgba(255,255,255,0.55)',
    ripple: 'rgba(255,255,255,0.45)',

    canvasBackground: '#fffdf9',
    canvasStroke: '#3a2f28',
  },

  dark: {
    text: '#f3e9dc',
    tint: '#e0824a',

    background: '#1c1613',
    foreground: '#f3e9dc',

    card: '#26201b',
    cardForeground: '#f3e9dc',

    primary: '#e0824a',
    primaryForeground: '#1c1613',

    secondary: '#332a23',
    secondaryForeground: '#f3e9dc',

    muted: '#2c2521',
    mutedForeground: '#a99686',

    accent: '#c98a4f',
    accentForeground: '#1c1613',

    destructive: '#e2685f',
    destructiveForeground: '#1c1613',

    success: '#6ea87c',
    successForeground: '#0f1a12',

    border: '#3a312a',
    input: '#3a312a',

    sheen: 'rgba(255,255,255,0.18)',
    ripple: 'rgba(255,255,255,0.16)',

    canvasBackground: '#211b17',
    canvasStroke: '#f3e9dc',
  },

  highContrast: {
    text: '#ffffff',
    tint: '#ffb454',

    background: '#000000',
    foreground: '#ffffff',

    card: '#0d0d0d',
    cardForeground: '#ffffff',

    primary: '#ffb454',
    primaryForeground: '#000000',

    secondary: '#1a1a1a',
    secondaryForeground: '#ffffff',

    muted: '#141414',
    mutedForeground: '#e2e2e2',

    accent: '#ffd583',
    accentForeground: '#000000',

    destructive: '#ff5252',
    destructiveForeground: '#000000',

    success: '#5cff8f',
    successForeground: '#000000',

    border: '#ffffff',
    input: '#ffffff',

    sheen: 'rgba(255,255,255,0.3)',
    ripple: 'rgba(255,255,255,0.3)',

    canvasBackground: '#000000',
    canvasStroke: '#ffffff',
  },

  // Border radius (in px). Applies to cards, buttons, inputs, and modals.
  radius: 20,
};

export default colors;
