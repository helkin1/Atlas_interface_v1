import { EXERCISES } from "../data/exercise-data.js";
import { DAY_NAMES, goalPctColor, calcGoalPcts, overallGoalPct } from "../utils/helpers.js";
import { calcBuilderWeeklyVol } from "../utils/plan-engine.js";
import { MuscleGoalBar, CARD_CLASS } from "./shared.jsx";

export default function StepReview({ plan }) {
  const wt = plan.weekTemplate || [];
  const vol = calcBuilderWeeklyVol(wt); const goals = calcGoalPcts(vol); const overall = overallGoalPct(goals);
  const sorted = Object.entries(goals).filter(([, d]) => d.eff > 0).sort((a, b) => b[1].pct - a[1].pct);
  const gaps = Object.entries(goals).filter(([, d]) => d.pct < 50 && d.pct > 0).sort((a, b) => a[1].pct - b[1].pct);
  const trainDays = wt.filter(d => !d.isRest && d.exercises.length > 0).length;
  const totalEx = wt.reduce((s, d) => s + (d.isRest ? 0 : d.exercises.length), 0);
  const totalSets = wt.reduce((s, d) => d.isRest ? s : s + d.exercises.reduce((ss, e) => ss + (e.setDetails ? e.setDetails.length : 3), 0), 0);

  return (
    <div>
      <h2 className="text-[22px] font-[800] mb-1">Review Your Plan</h2>
      <p className="text-[13px] text-dim mb-6">{plan.weeks}-week {plan.splitName} mesocycle.</p>

      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { l: "Training Days", v: `${trainDays}/wk`, c: "#22C55E" },
          { l: "Exercises", v: totalEx, c: "#3B82F6" },
          { l: "Weekly Sets", v: totalSets, c: "#F59E0B" },
          { l: "Mesocycle", v: `${plan.weeks} wks`, c: "#8B5CF6" },
        ].map(c => (
          <div key={c.l} className="bg-surface rounded-xl p-5 text-center">
            <div className="text-2xl font-bold" style={{ color: c.c }}>{c.v}</div>
            <div className="text-[11px] text-dim mt-1">{c.l}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2 mb-6">
        {wt.map((day, i) => (
          <div key={i} className={`rounded-xl p-4 min-h-[100px] ${day.isRest ? "bg-surface2 opacity-50" : "bg-surface"}`}>
            <div className="text-[9px] text-faint mb-1">{DAY_NAMES[(i + 1) % 7]}</div>
            <div className="text-[13px] font-bold text-content mb-1.5">{day.label}</div>
            {!day.isRest && day.exercises.slice(0, 3).map((e, ei) => (
              <div key={ei} className="text-[9px] text-dim overflow-hidden text-ellipsis whitespace-nowrap">{EXERCISES[e.id]?.name}</div>
            ))}
            {day.isRest && <div className="text-[22px] mt-2">😴</div>}
          </div>
        ))}
      </div>

      <div className={`${CARD_CLASS} p-6`}>
        <div className="text-[13px] font-semibold text-muted mb-3.5">Predicted Weekly Coverage</div>
        {sorted.map(([m, data]) => <MuscleGoalBar key={m} name={m} eff={data.eff} target={data.target} />)}
      </div>

      {gaps.length > 0 && (
        <div className="mt-4 bg-error/5 border border-error/20 rounded-xl p-4">
          <div className="text-[11px] font-bold text-error mb-2">{"\u26A0"} Potential gaps</div>
          <div className="text-xs text-muted">Below 50% MAV: {gaps.map(([m]) => m).join(", ")}</div>
        </div>
      )}
    </div>
  );
}
