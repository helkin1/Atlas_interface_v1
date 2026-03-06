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

/* ── Glassmorphism tokens ────────────────────────────────────── */
const glassTokens = {
  radius: { sm: 12, md: 16, lg: 20, xl: 24, xxl: 28, pill: 24, full: 9999 },
  spacing: tokens.spacing,
  fontSize: tokens.fontSize,
  fontWeight: tokens.fontWeight,
  font: tokens.font,
  colors: {
    primary: "#60A5FA",
    success: "#4ADE80",
    warning: "#FCD34D",
    error: "#F87171",
    pull: "#C4B5FD",
    accent: "#FB923C",
    pink: "#F9A8D4",
    orange: "#FB923C",
  },
};

/* ── Stark Minimal tokens ────────────────────────────────────── */
const starkTokens = {
  radius: { sm: 0, md: 0, lg: 0, xl: 0, xxl: 0, pill: 9999, full: 9999 },
  spacing: { xs: 4, sm: 8, md: 16, lg: 20, xl: 32, xxl: 40, xxxl: 56 },
  fontSize: { xs: 10, sm: 11, body: 14, md: 15, lg: 17, xl: 24, h1: 32, display: 56 },
  fontWeight: { normal: 300, medium: 400, semibold: 500, bold: 600, black: 700 },
  font: { body: "'Outfit', sans-serif", mono: "'Outfit', sans-serif" },
  colors: tokens.colors,
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
  /* ── Original ─────────────────────────────────────────────── */
  dark: {
    variant: "original",
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
    variant: "original",
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

  /* ── Glassmorphism ────────────────────────────────────────── */
  "glass-dark": {
    variant: "glass",
    bg: "#0A0C12",
    surface: "rgba(255,255,255,0.04)",
    surface2: "rgba(255,255,255,0.06)",
    surface3: "rgba(255,255,255,0.08)",
    border: "rgba(255,255,255,0.06)",
    borderLight: "rgba(255,255,255,0.10)",
    borderAccent: "rgba(255,255,255,0.15)",
    text: "#F0F2F8",
    textMuted: "#9BA4B8",
    textDim: "#6B7490",
    textFaint: "#3E4660",
    modalOverlay: "rgba(0,0,0,0.6)",
    cardHover: "rgba(255,255,255,0.07)",
    shadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)",
    // Glass-specific properties
    cardBg: "rgba(255,255,255,0.04)",
    cardBorder: "1px solid rgba(255,255,255,0.08)",
    cardBackdrop: "blur(20px) saturate(1.4)",
    glowPrimary: "0 0 40px rgba(96,165,250,0.08)",
    glowSuccess: "0 0 40px rgba(74,222,128,0.08)",
    ...glassTokens,
    alpha: tokens.alpha,
  },
  "glass-light": {
    variant: "glass",
    bg: "#E8EAF0",
    surface: "rgba(255,255,255,0.55)",
    surface2: "rgba(255,255,255,0.40)",
    surface3: "rgba(255,255,255,0.30)",
    border: "rgba(0,0,0,0.06)",
    borderLight: "rgba(0,0,0,0.08)",
    borderAccent: "rgba(0,0,0,0.12)",
    text: "#1A1D28",
    textMuted: "#505872",
    textDim: "#7882A0",
    textFaint: "#A0A8C0",
    modalOverlay: "rgba(0,0,0,0.25)",
    cardHover: "rgba(255,255,255,0.65)",
    shadow: "0 8px 32px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)",
    cardBg: "rgba(255,255,255,0.55)",
    cardBorder: "1px solid rgba(255,255,255,0.6)",
    cardBackdrop: "blur(20px) saturate(1.2)",
    glowPrimary: "0 0 40px rgba(96,165,250,0.06)",
    glowSuccess: "0 0 40px rgba(74,222,128,0.06)",
    ...glassTokens,
    alpha: tokens.alpha,
  },

  /* ── Stark Minimal ────────────────────────────────────────── */
  "stark-dark": {
    variant: "stark",
    bg: "#000000",
    surface: "transparent",
    surface2: "transparent",
    surface3: "rgba(255,255,255,0.04)",
    border: "transparent",
    borderLight: "rgba(255,255,255,0.08)",
    borderAccent: "rgba(255,255,255,0.15)",
    text: "#FFFFFF",
    textMuted: "#999999",
    textDim: "#666666",
    textFaint: "#333333",
    modalOverlay: "rgba(0,0,0,0.85)",
    cardHover: "rgba(255,255,255,0.03)",
    shadow: "none",
    // Stark-specific: divider lines instead of card backgrounds
    divider: "rgba(255,255,255,0.08)",
    cardBg: "transparent",
    cardBorder: "none",
    cardBackdrop: "none",
    ...starkTokens,
    alpha: tokens.alpha,
  },
  "stark-light": {
    variant: "stark",
    bg: "#FFFFFF",
    surface: "transparent",
    surface2: "transparent",
    surface3: "rgba(0,0,0,0.02)",
    border: "transparent",
    borderLight: "rgba(0,0,0,0.08)",
    borderAccent: "rgba(0,0,0,0.15)",
    text: "#000000",
    textMuted: "#666666",
    textDim: "#999999",
    textFaint: "#CCCCCC",
    modalOverlay: "rgba(0,0,0,0.5)",
    cardHover: "rgba(0,0,0,0.02)",
    shadow: "none",
    divider: "rgba(0,0,0,0.08)",
    cardBg: "transparent",
    cardBorder: "none",
    cardBackdrop: "none",
    ...starkTokens,
    alpha: tokens.alpha,
  },
};

/**
 * Resolve theme key from mode ("dark"/"light") + variant ("original"/"glass"/"stark")
 */
export function resolveThemeKey(mode, variant) {
  if (variant === "original") return mode;
  return `${variant}-${mode}`;
}

export const THEME_VARIANTS = [
  { key: "original", label: "Original" },
  { key: "glass", label: "Glass" },
  { key: "stark", label: "Stark" },
];

export const ThemeContext = createContext(themes.dark);
export function useTheme() { return useContext(ThemeContext); }
