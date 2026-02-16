import { useTheme } from "../context/theme.js";

export default function ThemeToggle({ mode, onToggle }) {
  const t = useTheme();
  return (
    <button onClick={onToggle} style={{
      width: 48, height: 26, borderRadius: 13, border: `1px solid ${t.borderLight}`,
      background: t.surface2, position: "relative", cursor: "pointer", padding: 0, transition: "all 0.2s",
    }}>
      <div style={{
        width: 20, height: 20, borderRadius: "50%",
        background: mode === "dark" ? "#4C9EFF" : "#FBBF24",
        position: "absolute", top: 2, left: mode === "dark" ? 2 : 24,
        transition: "all 0.25s ease", display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 11,
      }}>{mode === "dark" ? "\uD83C\uDF19" : "\u2600\uFE0F"}</div>
    </button>
  );
}
