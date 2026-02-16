import { useTheme } from "../context/theme.js";
import { EXERCISES } from "../data/exercise-data.js";
import { DAY_NAMES, goalPctColor, calcGoalPcts, overallGoalPct } from "../utils/helpers.js";
import { calcBuilderWeeklyVol } from "../utils/plan-engine.js";
import { MuscleGoalBar } from "./shared.jsx";

export default function StepReview({ plan }) {
  const t = useTheme();
  const wt = plan.weekTemplate || [];
  const vol = calcBuilderWeeklyVol(wt); const goals = calcGoalPcts(vol); const overall = overallGoalPct(goals);
  const sorted = Object.entries(goals).filter(([, d]) => d.eff > 0).sort((a, b) => b[1].pct - a[1].pct);
  const gaps = Object.entries(goals).filter(([, d]) => d.pct < 50 && d.pct > 0).sort((a, b) => a[1].pct - b[1].pct);
  const trainDays = wt.filter(d => !d.isRest && d.exercises.length > 0).length;
  const totalEx = wt.reduce((s, d) => s + (d.isRest ? 0 : d.exercises.length), 0);
  const totalSets = wt.reduce((s, d) => d.isRest ? s : s + d.exercises.reduce((ss, e) => ss + (e.setDetails ? e.setDetails.length : 3), 0), 0);
  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Review Your Plan</h2>
      <p style={{ fontSize: 13, color: t.textDim, marginBottom: 24 }}>{plan.weeks}-week {plan.splitName} mesocycle.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
        {[{ l: "Training Days", v: `${trainDays}/wk`, c: "#3DDC84" }, { l: "Exercises", v: totalEx, c: "#4C9EFF" }, { l: "Weekly Sets", v: totalSets, c: "#FBBF24" }, { l: "Mesocycle", v: `${plan.weeks} wks`, c: "#A78BFA" }].map(c => <div key={c.l} style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 16, textAlign: "center" }}><div style={{ fontSize: 24, fontFamily: "mono", fontWeight: 700, color: c.c }}>{c.v}</div><div style={{ fontSize: 10, color: t.textDim, fontFamily: "mono", textTransform: "uppercase", marginTop: 4 }}>{c.l}</div></div>)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8, marginBottom: 24 }}>
        {wt.map((day, i) => <div key={i} style={{ background: day.isRest ? t.surface2 : t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 12, minHeight: 100, opacity: day.isRest ? 0.5 : 1 }}><div style={{ fontSize: 9, fontFamily: "mono", color: t.textFaint, marginBottom: 4 }}>{DAY_NAMES[(i + 1) % 7]}</div><div style={{ fontSize: 13, fontWeight: 700, color: t.text, marginBottom: 6 }}>{day.label}</div>{!day.isRest && day.exercises.slice(0, 3).map((e, ei) => <div key={ei} style={{ fontSize: 9, color: t.textDim, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{EXERCISES[e.id]?.name}</div>)}{day.isRest && <div style={{ fontSize: 22, marginTop: 8 }}>😴</div>}</div>)}
      </div>
      <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 14, padding: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: t.textFaint, fontFamily: "mono", marginBottom: 14 }}>Predicted Weekly Coverage</div>
        {sorted.map(([m, data]) => <MuscleGoalBar key={m} name={m} eff={data.eff} target={data.target} />)}
      </div>
      {gaps.length > 0 && <div style={{ marginTop: 16, background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, padding: 16 }}><div style={{ fontSize: 11, fontWeight: 700, color: "#EF4444", marginBottom: 8 }}>{"\u26A0"} Potential gaps</div><div style={{ fontSize: 12, color: t.textMuted }}>Below 50% MAV: {gaps.map(([m]) => m).join(", ")}</div></div>}
    </div>
  );
}
