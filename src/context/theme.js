import { createContext, useContext } from "react";

/* ── Shared design tokens (theme-independent) ────────────────── */
export const tokens = {
  radius: { sm: 8, md: 12, lg: 12, xl: 12, xxl: 16, pill: 20, full: 9999 },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 40 },
  fontSize: { xs: 10, sm: 11, body: 13, md: 14, lg: 16, xl: 22, h1: 26, display: 48 },
  fontWeight: { normal: 400, medium: 500, semibold: 600, bold: 700, black: 800 },
  font: { body: "'Outfit', sans-serif", mono: "'Outfit', sans-serif" },
  colors: {
    primary: "#4C9EFF",
    success: "#3DDC84",
    warning: "#FBBF24",
    error: "#EF4444",
    pull: "#A78BFA",
    accent: "#FF8A50",
    pink: "#F472B6",
    orange: "#F97316",
  },
};

/**
 * Generate rgba() variant from a hex color.
 * Usage: colorAlpha(tokens.colors.primary, 0.12) → "rgba(76,158,255,0.12)"
 */
export function colorAlpha(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/* ── Pre-computed alpha variants for common usage ─────────────── */
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
  dark: {
    bg: "#0F1117",
    surface: "#161920",
    surface2: "#1C2028",
    surface3: "#1C2028",
    border: "#1E2230",
    borderLight: "#2A3040",
    borderAccent: "#3A4560",
    text: "#E8ECF2",
    textMuted: "#8892A4",
    textDim: "#5A6478",
    textFaint: "#3A4560",
    modalOverlay: "rgba(0,0,0,0.7)",
    cardHover: "#1A1E28",
    shadow: "0 1px 3px rgba(0,0,0,0.24), 0 0 0 1px rgba(255,255,255,0.03)",
    ...tokens,
  },
  light: {
    bg: "#F5F6F8",
    surface: "#FFFFFF",
    surface2: "#F0F1F4",
    surface3: "#E8E9ED",
    border: "#E0E2E8",
    borderLight: "#D0D3DA",
    borderAccent: "#B0B5C0",
    text: "#1A1D24",
    textMuted: "#5A6070",
    textDim: "#7A8090",
    textFaint: "#A0A8B8",
    modalOverlay: "rgba(0,0,0,0.35)",
    cardHover: "#F0F1F4",
    shadow: "0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)",
    ...tokens,
  },
};

export const ThemeContext = createContext(themes.dark);
export function useTheme() { return useContext(ThemeContext); }
