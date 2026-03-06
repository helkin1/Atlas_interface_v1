import { useTheme } from "../context/theme.js";
import { THEME_VARIANTS } from "../context/theme.js";

export default function VariantSelector({ variant, onChange }) {
  const t = useTheme();
  return (
    <div className="flex gap-0.5 p-[3px] rounded-[10px]"
      style={{
        background: t.variant === "glass" ? "rgba(255,255,255,0.06)" : t.variant === "stark" ? "transparent" : "var(--atlas-surface2)",
        borderRadius: t.variant === "stark" ? 0 : 10,
        border: t.variant === "stark" ? `1px solid var(--atlas-border-light)` : "none",
        backdropFilter: t.variant === "glass" ? "blur(12px)" : "none",
      }}>
      {THEME_VARIANTS.map(v => {
        const active = v.key === variant;
        return (
          <button key={v.key} onClick={() => onChange(v.key)}
            className={`text-[11px] px-3 py-[5px] border-none cursor-pointer transition-all duration-200 ${
              active ? "font-semibold" : "font-normal"
            }`}
            style={{
              borderRadius: t.variant === "stark" ? 0 : 8,
              background: active ? (t.variant === "glass" ? "rgba(255,255,255,0.10)" : t.alpha.primary._12) : "transparent",
              color: active ? t.colors.primary : "var(--atlas-text-dim)",
              fontFamily: t.font.body,
              letterSpacing: t.variant === "stark" ? 0.5 : 0,
            }}>
            {v.label}
          </button>
        );
      })}
    </div>
  );
}
