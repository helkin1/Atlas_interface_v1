import { useTheme } from "../context/theme.js";
import { THEME_VARIANTS } from "../context/theme.js";

export default function VariantSelector({ variant, onChange }) {
  const t = useTheme();
  return (
    <div style={{
      display: "flex", gap: 2, padding: 3,
      background: t.variant === "glass" ? "rgba(255,255,255,0.06)" : t.variant === "stark" ? "transparent" : t.surface2,
      borderRadius: t.variant === "stark" ? 0 : 10,
      border: t.variant === "stark" ? `1px solid ${t.borderLight}` : "none",
      backdropFilter: t.variant === "glass" ? "blur(12px)" : "none",
    }}>
      {THEME_VARIANTS.map(v => {
        const active = v.key === variant;
        return (
          <button key={v.key} onClick={() => onChange(v.key)} style={{
            fontSize: 11,
            padding: "5px 12px",
            borderRadius: t.variant === "stark" ? 0 : 8,
            border: "none",
            cursor: "pointer",
            background: active ? (t.variant === "glass" ? "rgba(255,255,255,0.10)" : t.alpha.primary._12) : "transparent",
            color: active ? t.colors.primary : t.textDim,
            fontWeight: active ? 600 : 400,
            fontFamily: t.font.body,
            transition: "all 0.2s ease",
            letterSpacing: t.variant === "stark" ? 0.5 : 0,
          }}>
            {v.label}
          </button>
        );
      })}
    </div>
  );
}
