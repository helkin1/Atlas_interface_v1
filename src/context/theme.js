import { createContext, useContext } from "react";

/* ── Design tokens ─────────────────────────────────────────── */
export const tokens = {
  radius: { sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, pill: 9999, full: 9999 },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48, xxxl: 64 },
  fontSize: { xs: 11, sm: 12, body: 14, md: 15, lg: 17, xl: 24, h1: 32, display: 48 },
  fontWeight: { normal: 400, medium: 500, semibold: 600, bold: 700, black: 800 },
  font: { body: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", mono: "'SF Mono', 'Fira Code', monospace" },
  colors: {
    primary: "#18181B",
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
    pull: "#6366F1",
    accent: "#18181B",
    pink: "#EC4899",
    orange: "#F97316",
  },
};

/**
 * Generate rgba() variant from a hex color.
 */
export function colorAlpha(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/* ── Pre-computed alpha variants ───────────────────────────── */
function buildAlphas(hex) {
  return {
    _4: colorAlpha(hex, 0.04),
    _6: colorAlpha(hex, 0.06),
    _7: colorAlpha(hex, 0.07),
    _8: colorAlpha(hex, 0.08),
    _10: colorAlpha(hex, 0.1),
    _12: colorAlpha(hex, 0.12),
    _15: colorAlpha(hex, 0.15),
    _18: colorAlpha(hex, 0.18),
    _20: colorAlpha(hex, 0.2),
    _25: colorAlpha(hex, 0.25),
    _30: colorAlpha(hex, 0.3),
    _40: colorAlpha(hex, 0.4),
  };
}

tokens.alpha = {
  primary: buildAlphas(tokens.colors.primary),
  success: buildAlphas(tokens.colors.success),
  warning: buildAlphas(tokens.colors.warning),
  error: buildAlphas(tokens.colors.error),
  pull: buildAlphas(tokens.colors.pull),
  accent: buildAlphas(tokens.colors.accent),
  pink: buildAlphas(tokens.colors.pink),
};

export const themes = {
  /* ── Dark ──────────────────────────────────────────────────── */
  dark: {
    mode: "dark",
    bg: "#09090B",
    surface: "#18181B",
    surface2: "#1F1F23",
    surface3: "#27272A",
    border: "#27272A",
    borderLight: "#3F3F46",
    borderAccent: "#52525B",
    text: "#FAFAFA",
    textMuted: "#A1A1AA",
    textDim: "#71717A",
    textFaint: "#52525B",
    modalOverlay: "rgba(0,0,0,0.8)",
    cardHover: "#1F1F23",
    shadow: "0 1px 2px rgba(0,0,0,0.4)",
    shadowLg: "0 4px 16px rgba(0,0,0,0.5)",
    shadowXl: "0 8px 32px rgba(0,0,0,0.6)",
    // CTA button
    ctaBg: "#FAFAFA",
    ctaText: "#09090B",
    ...tokens,
  },

  /* ── Light ─────────────────────────────────────────────────── */
  light: {
    mode: "light",
    bg: "#FAFAFA",
    surface: "#FFFFFF",
    surface2: "#F4F4F5",
    surface3: "#E4E4E7",
    border: "#E4E4E7",
    borderLight: "#D4D4D8",
    borderAccent: "#A1A1AA",
    text: "#18181B",
    textMuted: "#52525B",
    textDim: "#71717A",
    textFaint: "#A1A1AA",
    modalOverlay: "rgba(0,0,0,0.4)",
    cardHover: "#F4F4F5",
    shadow: "0 1px 2px rgba(0,0,0,0.05)",
    shadowLg: "0 4px 16px rgba(0,0,0,0.08)",
    shadowXl: "0 8px 32px rgba(0,0,0,0.12)",
    // CTA button
    ctaBg: "#18181B",
    ctaText: "#FAFAFA",
    ...tokens,
  },
};

/**
 * Resolve theme key — simplified now that variants are removed.
 */
export function resolveThemeKey(mode) {
  return mode;
}

export const ThemeContext = createContext(themes.dark);
export function useTheme() { return useContext(ThemeContext); }
