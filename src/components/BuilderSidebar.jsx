import { analyzePlan } from "../utils/science-engine.js";
import { GoalRing, MuscleGoalBar, MuscleDiagram, AlertsPanel, CARD_CLASS } from "./shared.jsx";

const BODY_REGION = {
  Chest: "upper", "Upper Chest": "upper",
  "Front Delts": "upper", "Side Delts": "upper", "Rear Delts": "upper",
  Triceps: "upper", Biceps: "upper", Brachialis: "upper",
  Lats: "upper", "Upper Back": "upper", Traps: "upper",
  "Rotator Cuff": "upper", Forearms: "upper",
  Core: "core", "Lower Back": "core",
  Quads: "lower", Hamstrings: "lower", Glutes: "lower", Calves: "lower",
};

export default function BuilderSidebar({ plan }) {
  const wt = plan.weekTemplate || [];

  const report = analyzePlan(wt);
  const { effectiveSets, goalPcts, overallScore, alerts } = report;

  const sorted = Object.entries(goalPcts).sort((a, b) => b[1].pct - a[1].pct);
  const trainDays = wt.filter(d => !d.isRest && d.exercises.length > 0).length;
  const totalExercises = wt.reduce((s, d) => s + (d.isRest ? 0 : d.exercises.length), 0);

  // Volume balance: Upper / Lower / Core
  const regionVol = { upper: 0, lower: 0, core: 0 };
  Object.entries(effectiveSets).forEach(([m, v]) => {
    const r = BODY_REGION[m];
    if (r) regionVol[r] += v;
  });
  const regionTotal = regionVol.upper + regionVol.lower + regionVol.core || 1;

  return (
    <div>
      <div className="text-[13px] font-semibold text-muted mb-4">Live Analysis</div>

      {/* Muscle diagram + coverage ring */}
      <div className={`${CARD_CLASS} p-5 mb-4 flex items-center gap-4`}>
        <MuscleDiagram muscleVol={effectiveSets} size={120} />
        <div className="flex-1">
          <GoalRing pct={overallScore} size={72} strokeWidth={5} label="Coverage" />
          <div className="mt-2.5 grid grid-cols-2 gap-1">
            <div className="text-center">
              <div className="text-lg font-bold text-[#3B82F6]">{trainDays}</div>
              <div className="text-[10px] text-dim">Train Days</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-[#F59E0B]">{totalExercises}</div>
              <div className="text-[10px] text-dim">Exercises</div>
            </div>
          </div>
        </div>
      </div>

      {/* Volume Balance: Upper / Lower / Core */}
      <div className={`${CARD_CLASS} p-4 mb-4`}>
        <div className="text-xs font-semibold text-muted mb-2.5">Volume Balance</div>
        <div className="flex gap-1.5">
          {[["upper", "#3B82F6", "Upper"], ["lower", "#8B5CF6", "Lower"], ["core", "#F59E0B", "Core"]].map(([key, color, label]) => {
            const v = regionVol[key];
            const pct = Math.round((v / regionTotal) * 100);
            return (
              <div key={key} className="flex-1 text-center">
                <div className="text-lg font-bold" style={{ color }}>{Math.round(v)}</div>
                <div className="text-[9px] text-dim">{label}</div>
                <div className="h-1 bg-edge rounded-[2px] mt-1.5 overflow-hidden">
                  <div className="h-full rounded-[2px] transition-[width] duration-300" style={{ width: `${pct}%`, background: color }} />
                </div>
                <div className="text-[9px] text-faint mt-[3px]">{pct}%</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Weekly Volume (vs Target) */}
      <div className={`${CARD_CLASS} p-4 mb-4`}>
        <div className="text-xs font-semibold text-muted mb-3">Weekly Volume (vs Target)</div>
        {sorted.slice(0, 14).map(([m, data]) => <MuscleGoalBar key={m} name={m} eff={data.eff} target={data.target} compact />)}
      </div>

      {/* Plan Alerts — below weekly volume */}
      <div className={`${CARD_CLASS} p-4`}>
        <div className="text-xs font-semibold text-muted mb-3">Plan Alerts</div>
        <AlertsPanel alerts={alerts} maxVisible={4} />
      </div>
    </div>
  );
}
