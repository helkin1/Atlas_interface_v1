import { useTheme } from "../context/theme.js";
import { analyzePlan } from "../utils/science-engine.js";
import { GoalRing, MuscleGoalBar, MuscleDiagram, AlertsPanel } from "./shared.jsx";

export default function BuilderSidebar({ plan }) {
  const t = useTheme();
  const wt = plan.weekTemplate || [];

  const report = analyzePlan(wt);
  const { effectiveSets, goalPcts, overallScore, patternBalance, alerts } = report;

  const sorted = Object.entries(goalPcts).sort((a, b) => b[1].pct - a[1].pct);
  const trainDays = wt.filter(d => !d.isRest && d.exercises.length > 0).length;
  const totalExercises = wt.reduce((s, d) => s + (d.isRest ? 0 : d.exercises.length), 0);

  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: t.textFaint, fontFamily: "mono", marginBottom: 16 }}>Live Analysis</div>

      {/* Muscle diagram + coverage ring */}
      <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 16, marginBottom: 16, display: "flex", alignItems: "center", gap: 16 }}>
        <MuscleDiagram muscleVol={effectiveSets} size={120} />
        <div style={{ flex: 1 }}>
          <GoalRing pct={overallScore} size={72} strokeWidth={5} label="Coverage" />
          <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 18, fontFamily: "mono", fontWeight: 700, color: "#4C9EFF" }}>{trainDays}</div>
              <div style={{ fontSize: 8, color: t.textFaint, fontFamily: "mono", textTransform: "uppercase" }}>Train Days</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 18, fontFamily: "mono", fontWeight: 700, color: "#FBBF24" }}>{totalExercises}</div>
              <div style={{ fontSize: 8, color: t.textFaint, fontFamily: "mono", textTransform: "uppercase" }}>Exercises</div>
            </div>
          </div>
        </div>
      </div>

      {/* Push / Pull / Legs balance */}
      <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 16, marginBottom: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: t.textFaint, fontFamily: "mono", marginBottom: 10 }}>Pattern Balance</div>
        <div style={{ display: "flex", gap: 6 }}>
          {[["push", "#3DDC84"], ["pull", "#A78BFA"], ["legs", "#4C9EFF"]].map(([p, color]) => {
            const s = patternBalance.sets[p] || 0;
            const total = patternBalance.sets.push + patternBalance.sets.pull + patternBalance.sets.legs;
            const pct = total > 0 ? Math.round((s / total) * 100) : 0;
            return (
              <div key={p} style={{ flex: 1, textAlign: "center" }}>
                <div style={{ fontSize: 18, fontFamily: "mono", fontWeight: 700, color }}>{s}</div>
                <div style={{ fontSize: 9, color: t.textDim, textTransform: "capitalize" }}>{p}</div>
                <div style={{ height: 4, background: t.border, borderRadius: 2, marginTop: 6, overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 2, transition: "width 0.3s" }} />
                </div>
                <div style={{ fontSize: 9, fontFamily: "mono", color: t.textFaint, marginTop: 3 }}>{pct}%</div>
              </div>
            );
          })}
        </div>
        {patternBalance.status !== "ok" && (
          <div style={{ marginTop: 8, fontSize: 10, textAlign: "center", fontWeight: 600,
            color: patternBalance.status === "critical" ? "#EF4444" : patternBalance.status === "warning" ? "#FBBF24" : "#4C9EFF" }}>
            {patternBalance.label.charAt(0).toUpperCase() + patternBalance.label.slice(1)}
          </div>
        )}
      </div>

      {/* Alerts */}
      <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 16, marginBottom: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: t.textFaint, fontFamily: "mono", marginBottom: 12 }}>Plan Alerts</div>
        <AlertsPanel alerts={alerts} maxVisible={4} />
      </div>

      {/* % of Goal bars */}
      <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: t.textFaint, fontFamily: "mono", marginBottom: 12 }}>Weekly Volume (vs Target)</div>
        {sorted.slice(0, 14).map(([m, data]) => <MuscleGoalBar key={m} name={m} eff={data.eff} target={data.target} compact />)}
      </div>
    </div>
  );
}
