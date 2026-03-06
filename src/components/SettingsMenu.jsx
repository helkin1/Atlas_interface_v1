import { useState } from "react";
import { useTheme } from "../context/theme.js";

export default function SettingsMenu({ onEditPlan, onSignOut, onAIInsights, onProfile }) {
  const t = useTheme();
  const [open, setOpen] = useState(false);

  const itemStyle = {
    display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "11px 14px",
    background: "transparent", border: "none", borderRadius: 12, cursor: "pointer",
    color: t.text, fontSize: 13, textAlign: "left", transition: "background 0.15s",
  };

  return (
    <div style={{ position: "relative" }}>
      <button onClick={() => setOpen(!open)} style={{
        width: 36, height: 36, borderRadius: 12, border: `1px solid ${t.border}`,
        background: t.surface, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 14, color: t.textMuted, boxShadow: t.shadow,
      }}>{"\u2699"}</button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 99 }} />
          <div style={{
            position: "absolute", right: 0, top: 42, background: t.surface,
            borderRadius: 18, padding: 8, minWidth: 200, zIndex: 100,
            boxShadow: t.shadowLg, border: `1px solid ${t.border}`,
          }}>
            {onProfile && (
              <button onClick={() => { setOpen(false); onProfile(); }} style={itemStyle}>
                <span>{"\uD83D\uDC64"}</span> Profile
              </button>
            )}
            <button onClick={() => { setOpen(false); onEditPlan(); }} style={itemStyle}>
              <span>{"\uD83D\uDCDD"}</span> Edit Plan
            </button>
            {onAIInsights && (
              <button onClick={() => { setOpen(false); onAIInsights(); }} style={{ ...itemStyle, color: t.colors.pull }}>
                <span>{"\u2728"}</span> AI Insights
              </button>
            )}
            {onSignOut && (
              <button onClick={() => { setOpen(false); onSignOut(); }} style={{
                ...itemStyle, color: t.colors.error,
                borderTop: `1px solid ${t.border}`, marginTop: 4, paddingTop: 12,
                borderRadius: "0 0 12px 12px",
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
