import { createContext, useContext } from "react";

/* ── Shared design tokens (theme-independent) ────────────────── */
export const tokens = {
  radius: { sm: 6, md: 10, lg: 12, xl: 14, xxl: 16, pill: 20, full: 9999 },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 28 },
  fontSize: { xs: 9, sm: 10, body: 11, md: 12, lg: 13, xl: 16, xxl: 22, h1: 26, display: 48 },
  fontWeight: { normal: 400, medium: 500, semibold: 600, bold: 700, black: 800 },
  font: { body: "'Outfit', sans-serif", mono: "'JetBrains Mono', monospace" },
  colors: {
    primary: "#4C9EFF",
    success: "#3DDC84",
    warning: "#FBBF24",
    error: "#EF4444",
    pull: "#A78BFA",
    accent: "#FF8A50",
    pink: "#F472B6",
  },
};

export const themes = {
  dark: {
    bg: "#08090C",
    surface: "#11141A",
    surface2: "#151921",
    surface3: "#1C2230",
    border: "#1A1E28",
    borderLight: "#2A3040",
    borderAccent: "#3A4560",
    text: "#E8ECF2",
    textMuted: "#8892A4",
    textDim: "#5A6478",
    textFaint: "#3A4560",
    modalOverlay: "rgba(0,0,0,0.7)",
    cardHover: "#1A1E28",
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
    ...tokens,
  },
};

export const ThemeContext = createContext(themes.dark);
export function useTheme() { return useContext(ThemeContext); }
