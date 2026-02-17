import { useTheme } from "../context/theme.js";
import ThemeToggle from "./ThemeToggle.jsx";

const FEATURES = [
  { icon: "\u{1F4CA}", title: "Smart Programming", desc: "Science-based volume and frequency targets" },
  { icon: "\u{1F3AF}", title: "Volume Tracking", desc: "MEV / MAV / MRV landmarks per muscle group" },
  { icon: "\u{1F4C8}", title: "Progressive Overload", desc: "Automatic weight progression across weeks" },
  { icon: "\u26A1",    title: "Gap Detection", desc: "Find and fill undertrained muscle groups" },
];

export default function IntroScreen({ onStart, themeMode, onToggleTheme }) {
  const t = useTheme();
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40, position: "relative" }}>

      {/* Theme toggle — top right */}
      <div style={{ position: "absolute", top: 28, right: 28 }}>
        <ThemeToggle mode={themeMode} onToggle={onToggleTheme} />
      </div>

      {/* Hero */}
      <div style={{ textAlign: "center", maxWidth: 520, marginBottom: 48 }}>
        <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 5, color: t.textFaint, fontFamily: "mono", marginBottom: 12 }}>Welcome to</div>
        <h1 style={{ fontSize: 48, fontWeight: 800, letterSpacing: -1.5, color: t.text, marginBottom: 12 }}>Atlas</h1>
        <p style={{ fontSize: 16, color: t.textMuted, lineHeight: 1.6 }}>
          Your intelligent training companion. Build science-based workout programs with real-time volume analysis and progressive overload.
        </p>
      </div>

      {/* CTA */}
      <button onClick={onStart} style={{
        padding: "16px 48px", borderRadius: 14, border: "none",
        background: "#4C9EFF", color: "#fff", fontSize: 16, fontWeight: 700,
        cursor: "pointer", marginBottom: 56, transition: "transform 0.15s, box-shadow 0.15s",
        boxShadow: "0 4px 24px rgba(76,158,255,0.3)",
      }}
        onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 32px rgba(76,158,255,0.4)"; }}
        onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 24px rgba(76,158,255,0.3)"; }}
      >
        Build Your Plan &rarr;
      </button>

      {/* Features grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, maxWidth: 720, width: "100%" }}>
        {FEATURES.map(f => (
          <div key={f.title} style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 14, padding: 20, textAlign: "center" }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{f.icon}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: t.text, marginBottom: 4 }}>{f.title}</div>
            <div style={{ fontSize: 10, color: t.textDim, lineHeight: 1.5 }}>{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
