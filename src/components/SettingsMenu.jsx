import { useState } from "react";
import { useTheme } from "../context/theme.js";

export default function SettingsMenu({ onEditPlan, onSignOut, onAIInsights, onProfile }) {
  const t = useTheme();
  const [open, setOpen] = useState(false);

  const itemStyle = {
    display: "flex", 
    alignItems: "center", 
    gap: 10, 
    width: "100%", 
    padding: "10px 14px",
    background: "transparent", 
    border: "none", 
    borderRadius: 8, 
    cursor: "pointer",
    color: t.text, 
    fontSize: 13, 
    fontWeight: 500,
    textAlign: "left", 
    transition: "background 0.15s ease",
  };

  return (
    <div style={{ position: "relative" }}>
      <button 
        onClick={() => setOpen(!open)} 
        style={{
          width: 40, 
          height: 40, 
          borderRadius: 10, 
          border: `1px solid ${t.border}`,
          background: t.surface, 
          cursor: "pointer", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          color: t.textMuted, 
          boxShadow: t.shadow,
          transition: "all 0.15s ease",
        }}
        aria-label="Open settings menu"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 99 }} />
          <div style={{
            position: "absolute", 
            right: 0, 
            top: 48, 
            background: t.surface,
            borderRadius: 12, 
            padding: 6, 
            minWidth: 180, 
            zIndex: 100,
            boxShadow: t.shadowLg, 
            border: `1px solid ${t.border}`,
          }}>
            {onProfile && (
              <button 
                onClick={() => { setOpen(false); onProfile(); }} 
                style={itemStyle}
                onMouseEnter={(e) => e.currentTarget.style.background = t.surface2}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                Profile
              </button>
            )}
            <button 
              onClick={() => { setOpen(false); onEditPlan(); }} 
              style={itemStyle}
              onMouseEnter={(e) => e.currentTarget.style.background = t.surface2}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Edit Plan
            </button>
            {onAIInsights && (
              <button 
                onClick={() => { setOpen(false); onAIInsights(); }} 
                style={{ ...itemStyle, color: t.colors.pull }}
                onMouseEnter={(e) => e.currentTarget.style.background = t.surface2}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                AI Insights
              </button>
            )}
            {onSignOut && (
              <button 
                onClick={() => { setOpen(false); onSignOut(); }} 
                style={{
                  ...itemStyle, 
                  color: t.colors.error,
                  borderTop: `1px solid ${t.border}`, 
                  marginTop: 4, 
                  paddingTop: 12,
                  borderRadius: "0 0 8px 8px",
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = t.surface2}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Sign Out
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
