import { createContext, useContext } from "react";

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
  },
};

export const ThemeContext = createContext(themes.dark);
export function useTheme() { return useContext(ThemeContext); }
