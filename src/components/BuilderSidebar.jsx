import { useTheme } from "../context/theme.js";
import { calcGoalPcts, overallGoalPct } from "../utils/helpers.js";
import { calcBuilderWeeklyVol } from "../utils/plan-engine.js";
import { GoalRing, MuscleGoalBar, MuscleDiagram } from "./shared.jsx";

export default function BuilderSidebar({ plan }) {
  const t = useTheme();
  const wt = plan.weekTemplate || [];
  const vol = calcBuilderWeeklyVol(wt); const goals = calcGoalPcts(vol); const overall = overallGoalPct(goals);
  const sorted = Object.entries(goals).sort((a, b) => b[1].pct - a[1].pct);
  const trainDays = wt.filter(d => !d.isRest && d.exercises.length > 0).length;
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: t.textFaint, fontFamily: "mono", marginBottom: 16 }}>Live Analysis</div>
      <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 16, marginBottom: 16, display: "flex", alignItems: "center", gap: 16 }}>
        <MuscleDiagram muscleVol={vol} size={120} />
        <div style={{ flex: 1 }}>
          <GoalRing pct={overall} size={72} strokeWidth={5} label="Coverage" />
          <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
            <div style={{ textAlign: "center" }}><div style={{ fontSize: 18, fontFamily: "mono", fontWeight: 700, color: "#4C9EFF" }}>{trainDays}</div><div style={{ fontSize: 8, color: t.textFaint, fontFamily: "mono", textTransform: "uppercase" }}>Train Days</div></div>
            <div style={{ textAlign: "center" }}><div style={{ fontSize: 18, fontFamily: "mono", fontWeight: 700, color: "#FBBF24" }}>{wt.reduce((s, d) => s + (d.isRest ? 0 : d.exercises.length), 0)}</div><div style={{ fontSize: 8, color: t.textFaint, fontFamily: "mono", textTransform: "uppercase" }}>Exercises</div></div>
          </div>
        </div>
      </div>
      <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: t.textFaint, fontFamily: "mono", marginBottom: 12 }}>% of Goal (vs MAV)</div>
        {sorted.slice(0, 14).map(([m, data]) => <MuscleGoalBar key={m} name={m} eff={data.eff} target={data.target} compact />)}
      </div>
    </div>
  );
}
