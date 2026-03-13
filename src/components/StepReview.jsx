import { useMemo } from "react";
import { useTheme } from "../context/theme.js";
import { EXERCISES } from "../data/exercise-data.js";
import { DAY_NAMES, goalPctColor, calcPersonalizedGoalPcts, personalizedOverallGoalPct } from "../utils/helpers.js";
import { calcBuilderWeeklyVol } from "../utils/plan-engine.js";
import { loadProfile } from "../utils/storage.js";
import { getPersonalizedConfig } from "../utils/personalization-engine.js";
import { MuscleGoalBar } from "./shared.jsx";

export default function StepReview({ plan }) {
  const t = useTheme();
  const wt = plan.weekTemplate || [];

  const profile = useMemo(() => loadProfile(), []);
  const config = useMemo(() => getPersonalizedConfig(profile), [profile]);

  const vol = calcBuilderWeeklyVol(wt);
  const goals = calcPersonalizedGoalPcts(vol, config);
  const overall = personalizedOverallGoalPct(goals, config);

  const tierOrder = { priority: 0, supporting: 1, maintenance: 2, excluded: 3 };
  const sorted = Object.entries(goals)
    .filter(([, d]) => d.tier !== "excluded" && d.eff > 0)
    .sort((a, b) => {
      const tDiff = (tierOrder[a[1].tier] || 2) - (tierOrder[b[1].tier] || 2);
      if (tDiff !== 0) return tDiff;
      return b[1].pct - a[1].pct;
    });
  // Only flag gaps for priority/supporting muscles
  const gaps = Object.entries(goals)
    .filter(([, d]) => d.pct < 50 && d.pct > 0 && (d.tier === "priority" || d.tier === "supporting"))
    .sort((a, b) => a[1].pct - b[1].pct);
  const excludedCount = Object.values(goals).filter(d => d.tier === "excluded").length;

  const trainDays = wt.filter(d => !d.isRest && d.exercises.length > 0).length;
  const totalEx = wt.reduce((s, d) => s + (d.isRest ? 0 : d.exercises.length), 0);
  const totalSets = wt.reduce((s, d) => d.isRest ? s : s + d.exercises.reduce((ss, e) => ss + (e.setDetails ? e.setDetails.length : 3), 0), 0);

  const goalLabel = config.primaryGoal ? config.primaryGoal.charAt(0).toUpperCase() + config.primaryGoal.slice(1).replace("_", " ") : "";

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Review Your Plan</h2>
      <p style={{ fontSize: 13, color: t.textDim, marginBottom: 24 }}>{plan.weeks}-week {plan.splitName} mesocycle.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
        {[{ l: "Training Days", v: `${trainDays}/wk`, c: "#22C55E" }, { l: "Exercises", v: totalEx, c: "#3B82F6" }, { l: "Weekly Sets", v: totalSets, c: "#F59E0B" }, { l: "Mesocycle", v: `${plan.weeks} wks`, c: "#8B5CF6" }].map(c => <div key={c.l} style={{ background: t.surface, borderRadius: 12, padding: 20, textAlign: "center" }}><div style={{ fontSize: 24, fontWeight: 700, color: c.c }}>{c.v}</div><div style={{ fontSize: 11, color: t.textDim, marginTop: 4 }}>{c.l}</div></div>)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8, marginBottom: 24 }}>
        {wt.map((day, i) => <div key={i} style={{ background: day.isRest ? t.surface2 : t.surface, borderRadius: 12, padding: 16, minHeight: 100, opacity: day.isRest ? 0.5 : 1 }}><div style={{ fontSize: 9, color: t.textFaint, marginBottom: 4 }}>{DAY_NAMES[(i + 1) % 7]}</div><div style={{ fontSize: 13, fontWeight: 700, color: t.text, marginBottom: 6 }}>{day.label}</div>{!day.isRest && day.exercises.slice(0, 3).map((e, ei) => <div key={ei} style={{ fontSize: 9, color: t.textDim, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{EXERCISES[e.id]?.name}</div>)}{day.isRest && <div style={{ fontSize: 22, marginTop: 8 }}>😴</div>}</div>)}
      </div>
      <div style={{ background: t.surface, borderRadius: 12, padding: 24, boxShadow: t.shadow }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: t.textMuted }}>Predicted Weekly Coverage</div>
          <div style={{ fontSize: 11, color: t.textDim }}>
            {overall}% plan score
          </div>
        </div>
        {sorted.map(([m, data]) => <MuscleGoalBar key={m} name={m} eff={data.eff} target={data.target} tier={data.tier} />)}
        {excludedCount > 0 && (
          <div style={{ fontSize: 10, color: t.textFaint, marginTop: 8, textAlign: "center" }}>
            {excludedCount} excluded (injury)
          </div>
        )}
        {goalLabel && (
          <div style={{ fontSize: 10, color: t.textFaint, marginTop: 8, textAlign: "center", fontStyle: "italic" }}>
            Scores weighted by your {goalLabel} goal — priority muscles count more
          </div>
        )}
      </div>
      {gaps.length > 0 && <div style={{ marginTop: 16, background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, padding: 16 }}><div style={{ fontSize: 11, fontWeight: 700, color: "#EF4444", marginBottom: 8 }}>{"\u26A0"} Potential gaps in priority muscles</div><div style={{ fontSize: 12, color: t.textMuted }}>Below 50% target: {gaps.map(([m]) => m).join(", ")}</div></div>}
    </div>
  );
}
