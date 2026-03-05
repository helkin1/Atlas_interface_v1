import { useState } from "react";
import { useTheme } from "../context/theme.js";

export default function SettingsMenu({ onEditPlan, onSignOut, onAIInsights, onProfile }) {
  const t = useTheme();
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <button onClick={() => setOpen(!open)} style={{
        width: 32, height: 32, borderRadius: 8, border: `1px solid ${t.borderLight}`,
        background: t.surface2, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 14, color: t.textMuted,
      }}>{"\u2699"}</button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 99 }} />
          <div style={{
            position: "absolute", right: 0, top: 38, background: t.surface, border: `1px solid ${t.border}`,
            borderRadius: 10, padding: 4, minWidth: 160, zIndex: 100, boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
          }}>
            {onProfile && (
              <button onClick={() => { setOpen(false); onProfile(); }} style={{
                display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "10px 12px",
                background: "transparent", border: "none", borderRadius: 8, cursor: "pointer",
                color: t.text, fontSize: 12, textAlign: "left",
              }}>
                <span>{"\uD83D\uDC64"}</span> Profile
              </button>
            )}
            <button onClick={() => { setOpen(false); onEditPlan(); }} style={{
              display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "10px 12px",
              background: "transparent", border: "none", borderRadius: 8, cursor: "pointer",
              color: t.text, fontSize: 12, textAlign: "left",
            }}>
              <span>{"\uD83D\uDCDD"}</span> Edit Plan
            </button>
            {onAIInsights && (
              <button onClick={() => { setOpen(false); onAIInsights(); }} style={{
                display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "10px 12px",
                background: "transparent", border: "none", borderRadius: 8, cursor: "pointer",
                color: "#A78BFA", fontSize: 12, textAlign: "left",
              }}>
                <span>{"\u2728"}</span> AI Insights
              </button>
            )}
            {onSignOut && (
              <button onClick={() => { setOpen(false); onSignOut(); }} style={{
                display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "10px 12px",
                background: "transparent", border: "none", borderRadius: 8, cursor: "pointer",
                color: "#EF4444", fontSize: 12, textAlign: "left",
                borderTop: `1px solid ${t.border}`, marginTop: 2, paddingTop: 10,
              }}>
                <span>{"\u{1F6AA}"}</span> Sign Out
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
