import { useTheme } from "../context/theme.js";
import { SPLIT_PRESETS } from "../data/split-presets.js";
import { getExDefault } from "../data/exercise-data.js";
import { goalPctColor } from "../utils/helpers.js";

export default function StepGoalSplit({ plan, onChange }) {
  const t = useTheme();
  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Choose Your Split</h2>
      <p style={{ fontSize: 13, color: t.textDim, marginBottom: 24 }}>Select a training split to start with. Customize everything in the next steps.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
        {Object.entries(SPLIT_PRESETS).map(([key, preset]) => {
          const sel = plan.splitKey === key;
          return (
            <button key={key} onClick={() => onChange({ ...plan, splitKey: key, splitName: preset.name, weekTemplate: preset.weekTemplate.map(d => ({ ...d, isRest: d.isRest || (!d.exercises.length && d.label === "Rest"), exercises: d.exercises.map(exId => getExDefault(exId)) })), weeks: 4 })} style={{ background: sel ? `${goalPctColor(100)}08` : t.surface, border: `1px solid ${sel ? goalPctColor(100) + "40" : t.border}`, borderRadius: 14, padding: 20, cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: sel ? "#3DDC84" : t.text }}>{preset.name}</span>
                {preset.daysPerWeek > 0 && <span style={{ fontSize: 10, fontFamily: "mono", color: t.textDim, padding: "2px 8px", background: t.surface2, borderRadius: 6 }}>{preset.daysPerWeek}&times;/wk</span>}
              </div>
              <p style={{ fontSize: 12, color: t.textMuted, lineHeight: 1.5, marginBottom: 10 }}>{preset.description}</p>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {preset.tags.map(tag => <span key={tag} style={{ fontSize: 9, padding: "2px 6px", borderRadius: 6, background: `${t.textFaint}20`, color: t.textDim }}>{tag}</span>)}
              </div>
            </button>
          );
        })}
      </div>
      {plan.splitKey && (
        <div style={{ marginTop: 24, background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: t.textFaint, fontFamily: "mono", marginBottom: 12 }}>Mesocycle Length</div>
          <div style={{ display: "flex", gap: 8 }}>
            {[2, 3, 4, 5, 6].map(w => <button key={w} onClick={() => onChange({ ...plan, weeks: w })} style={{ padding: "10px 20px", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", border: `1px solid ${plan.weeks === w ? "#4C9EFF" : t.borderLight}`, background: plan.weeks === w ? "rgba(76,158,255,0.1)" : "transparent", color: plan.weeks === w ? "#4C9EFF" : t.textMuted }}>{w} weeks</button>)}
          </div>
        </div>
      )}
    </div>
  );
}
