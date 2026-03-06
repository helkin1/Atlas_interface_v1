import { createContext, useContext } from "react";

/* ── Design tokens ─────────────────────────────────────────── */
export const tokens = {
  radius: { sm: 12, md: 16, lg: 20, xl: 24, xxl: 28, pill: 9999, full: 9999 },
  spacing: { xs: 4, sm: 8, md: 14, lg: 20, xl: 28, xxl: 36, xxxl: 48 },
  fontSize: { xs: 10, sm: 11, body: 13, md: 14, lg: 16, xl: 22, h1: 28, display: 48 },
  fontWeight: { normal: 400, medium: 500, semibold: 600, bold: 700, black: 800 },
  font: { body: "'Outfit', sans-serif", mono: "'JetBrains Mono', monospace" },
  colors: {
    primary: "#3B82F6",
    success: "#22C55E",
    warning: "#F59E0B",
    error: "#EF4444",
    pull: "#8B5CF6",
    accent: "#F97316",
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
    bg: "#0C0E14",
    surface: "#161922",
    surface2: "#1C2030",
    surface3: "#232838",
    border: "#1E2438",
    borderLight: "#2A3350",
    borderAccent: "#3A4868",
    text: "#F0F2F8",
    textMuted: "#8892A8",
    textDim: "#5C6680",
    textFaint: "#3A4460",
    modalOverlay: "rgba(0,0,0,0.7)",
    cardHover: "#1E2230",
    shadow: "0 2px 8px rgba(0,0,0,0.32), 0 0 0 1px rgba(255,255,255,0.04)",
    shadowLg: "0 8px 24px rgba(0,0,0,0.4)",
    // CTA button (dark pill)
    ctaBg: "#F0F2F8",
    ctaText: "#0C0E14",
    ...tokens,
  },

  /* ── Light ─────────────────────────────────────────────────── */
  light: {
    mode: "light",
    bg: "#F0F1F6",
    surface: "#FFFFFF",
    surface2: "#F5F6FA",
    surface3: "#ECEEF4",
    border: "#E2E5EE",
    borderLight: "#D0D4E0",
    borderAccent: "#B8BED0",
    text: "#1A1D28",
    textMuted: "#5A6070",
    textDim: "#7A8098",
    textFaint: "#A0A8C0",
    modalOverlay: "rgba(0,0,0,0.3)",
    cardHover: "#F5F6FA",
    shadow: "0 2px 8px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.03)",
    shadowLg: "0 8px 24px rgba(0,0,0,0.08)",
    // CTA button (dark pill)
    ctaBg: "#1A1D28",
    ctaText: "#FFFFFF",
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
