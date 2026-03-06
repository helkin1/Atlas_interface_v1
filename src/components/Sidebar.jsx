import { useTheme } from "../context/theme.js";
import { usePlanData } from "../context/plan-data.js";
import { EXERCISES } from "../data/exercise-data.js";
import { calcMuscleVol, weekMuscleVol, calcGoalPcts, overallGoalPct, goalPctColor, getDaySets, getWeekSets } from "../utils/helpers.js";
import { analyzePlan } from "../utils/science-engine.js";
import { MiniBar, GoalRing, MuscleGoalBar, MuscleDiagram, AlertsPanel, CARD_CLASS } from "./shared.jsx";

export default function Sidebar({ weekIdx, viewLevel, curWeek, curDay, plan }) {
  const t = useTheme();
  const MONTH = usePlanData();

  // ---- WEEK VIEW SIDEBAR ----
  if (viewLevel === "week" && curWeek) {
    const mv = weekMuscleVol(curWeek);
    const goalPcts = calcGoalPcts(mv);
    const overall = overallGoalPct(goalPcts);
    const sortedGoals = Object.entries(goalPcts).filter(([,d]) => d.eff > 0).sort((a, b) => b[1].pct - a[1].pct);
    const wkSets = getWeekSets(curWeek);
    const trainDays = curWeek.days.filter(d => !d.isRest).length;

    return (
      <div>
        <div className="text-body font-semibold text-muted mb-4">Week {curWeek.weekNum} Overview</div>
        <div className={`${CARD_CLASS} p-5 mb-4 flex items-center gap-4`}>
          <MuscleDiagram muscleVol={mv} size={120} />
          <div className="flex-1">
            <GoalRing pct={overall} size={72} strokeWidth={5} label="Weekly Goal" />
            <div className="mt-2.5 grid grid-cols-2 gap-1">
              <div className="text-center">
                <div className="text-lg font-bold text-primary">{wkSets}</div>
                <div className="text-xs text-dim">Sets</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-success">{trainDays}</div>
                <div className="text-xs text-dim">Train Days</div>
              </div>
            </div>
          </div>
        </div>
        <div className={`${CARD_CLASS} p-4`}>
          <div className="text-xs font-semibold text-muted mb-3">% of Goal (vs MAV)</div>
          {sortedGoals.map(([m, data]) => (
            <MuscleGoalBar key={m} name={m} eff={data.eff} target={data.target} compact />
          ))}
        </div>
      </div>
    );
  }

  // ---- DAY VIEW SIDEBAR ----
  if (viewLevel === "day" && curDay && !curDay.isRest) {
    const dayMuscles = calcMuscleVol(curDay.exercises);
    const dayMuscVol = Object.fromEntries(dayMuscles);
    const maxM = dayMuscles[0]?.[1] || 1;

    const wkIdx = MONTH.findIndex(wk => wk.days.some(d => d.dayNum === curDay.dayNum));
    const week = wkIdx >= 0 ? MONTH[wkIdx] : null;
    const wkVol = week ? weekMuscleVol(week) : {};
    const wkGoals = calcGoalPcts(wkVol);
    const wkOverall = overallGoalPct(wkGoals);

    return (
      <div>
        <div className="text-body font-semibold text-muted mb-4">{curDay.label} Overview</div>
        <div className={`${CARD_CLASS} p-5 mb-4 flex items-center gap-4`}>
          <MuscleDiagram muscleVol={dayMuscVol} size={120} />
          <div className="flex-1">
            <GoalRing pct={wkOverall} size={72} strokeWidth={5} label="Week So Far" />
            <div className="mt-2.5 text-center">
              <div className="text-lg font-bold text-primary">{getDaySets(curDay)}</div>
              <div className="text-xs text-dim">Sets Today</div>
            </div>
          </div>
        </div>
        <div className={`${CARD_CLASS} p-4 mb-4`}>
          <div className="text-xs font-semibold text-muted mb-3">Muscle Breakdown</div>
          {dayMuscles.map(([m, s]) => <MiniBar key={m} name={m} sets={s} max={maxM} />)}
        </div>
        {week && (
          <div className={`${CARD_CLASS} p-4`}>
            <div className="text-xs font-semibold text-muted mb-3">Weekly Goal Progress</div>
            {Object.entries(wkGoals).filter(([,d]) => d.eff > 0).sort((a, b) => b[1].pct - a[1].pct).slice(0, 10).map(([m, data]) => {
              const dayContrib = dayMuscVol[m] || 0;
              const dayPct = data.target > 0 ? Math.round((dayContrib / data.target) * 100) : 0;
              const pc = goalPctColor(data.pct);
              return (
                <div key={m} className="flex justify-between items-center py-1 border-b border-edge">
                  <span className="text-sm text-muted">{m}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] text-dim">+{dayPct}%</span>
                    <span className="text-sm font-semibold" style={{ color: pc }}>{data.pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ---- MONTH VIEW SIDEBAR (default) ----
  const totalSets = MONTH.reduce((s, w) => s + getWeekSets(w), 0);
  const trainDays = MONTH.reduce((s, w) => s + w.days.filter((d) => !d.isRest).length, 0);

  const wkSets = MONTH.map((w) => getWeekSets(w));
  const maxWS = Math.max(...wkSets);

  const numWeeks = MONTH.length;
  const allMusc = {};
  MONTH.forEach((w) => { const mv = weekMuscleVol(w); Object.entries(mv).forEach(([m, s]) => { allMusc[m] = (allMusc[m] || 0) + s; }); });
  const avgWeekMusc = {};
  Object.entries(allMusc).forEach(([m, s]) => { avgWeekMusc[m] = s / numWeeks; });

  const goalPcts = calcGoalPcts(avgWeekMusc);
  const overall = overallGoalPct(goalPcts);
  const sortedGoals = Object.entries(goalPcts).sort((a, b) => b[1].pct - a[1].pct);

  const BODY_REGION = {
    Chest: "upper", "Upper Chest": "upper",
    "Front Delts": "upper", "Side Delts": "upper", "Rear Delts": "upper",
    Triceps: "upper", Biceps: "upper", Brachialis: "upper",
    Lats: "upper", "Upper Back": "upper", Traps: "upper",
    "Rotator Cuff": "upper", Forearms: "upper",
    Core: "core", "Lower Back": "core",
    Quads: "lower", Hamstrings: "lower", Glutes: "lower", Calves: "lower",
  };
  const regionVol = { upper: 0, lower: 0, core: 0 };
  Object.entries(avgWeekMusc).forEach(([m, v]) => {
    const r = BODY_REGION[m];
    if (r) regionVol[r] += v;
  });
  const regionTotal = regionVol.upper + regionVol.lower + regionVol.core || 1;

  const scienceReport = plan ? analyzePlan(plan.weekTemplate || []) : null;
  const planAlerts = scienceReport ? scienceReport.alerts : [];

  return (
    <div>
      <div className="text-body font-semibold text-muted mb-4">Mesocycle Overview</div>
      <div className={`${CARD_CLASS} p-5 mb-4 flex items-center gap-4`}>
        <MuscleDiagram muscleVol={avgWeekMusc} size={120} />
        <div className="flex-1">
          <GoalRing pct={overall} size={72} strokeWidth={5} label="Avg Weekly" />
          <div className="mt-2.5 grid grid-cols-2 gap-1">
            <div className="text-center">
              <div className="text-lg font-bold text-primary">{totalSets}</div>
              <div className="text-xs text-dim">Total Sets</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-success">{trainDays}</div>
              <div className="text-xs text-dim">Train Days</div>
            </div>
          </div>
        </div>
      </div>
      {/* Plan alerts from science engine */}
      <div className={`${CARD_CLASS} p-4 mb-4`}>
        <div className="text-xs font-semibold text-muted mb-3">Plan Alerts</div>
        <AlertsPanel alerts={planAlerts} maxVisible={4} />
      </div>
      <div className={`${CARD_CLASS} p-4 mb-4`}>
        <div className="text-xs font-semibold text-muted mb-3">Volume Balance</div>
        <div className="flex gap-2">
          {[
            { key: "upper", label: "Upper", color: "#3B82F6" },
            { key: "lower", label: "Lower", color: "#8B5CF6" },
            { key: "core",  label: "Core",  color: "#F59E0B" },
          ].map(({ key, label, color }) => {
            const v = regionVol[key];
            const pct = Math.round((v / regionTotal) * 100);
            return (
              <div key={key} className="flex-1 text-center">
                <div className="text-xl font-bold" style={{ color }}>{Math.round(v)}</div>
                <div className="text-xs text-dim">{label}</div>
                <div className="h-1 bg-edge rounded-[2px] mt-2 overflow-hidden">
                  <div className="h-full rounded-[2px]" style={{ width: `${pct}%`, background: color }} />
                </div>
                <div className="text-xs text-faint mt-1">{pct}%</div>
              </div>
            );
          })}
        </div>
        <div className="text-xs text-dim mt-2.5 text-center">avg weekly effective sets per region</div>
      </div>
      <div className={`${CARD_CLASS} p-4 mb-4`}>
        <div className="text-xs font-semibold text-muted mb-3">Weekly Sets</div>
        <div className="flex gap-1.5 items-end h-[70px]">
          {wkSets.map((s, i) => {
            const h = (s / maxWS) * 100;
            const sel = weekIdx === i;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-[3px]">
                <span className={`text-xs ${sel ? "text-primary" : "text-dim"}`}>{s}</span>
                <div className="w-full rounded-[4px] min-h-1 transition-all duration-300" style={{ height: `${h}%`, background: sel ? "#3B82F6" : "var(--atlas-border)" }} />
                <span className="text-[9px] text-faint">W{i + 1}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className={`${CARD_CLASS} p-4`}>
        <div className="text-xs font-semibold text-muted mb-3">% of Goal (Avg Weekly vs MAV)</div>
        {sortedGoals.slice(0, 12).map(([m, data]) => (
          <MuscleGoalBar key={m} name={m} eff={data.eff} target={data.target} compact />
        ))}
        {sortedGoals.length > 12 && <div className="text-xs text-faint text-center mt-1.5">+{sortedGoals.length - 12} more</div>}
      </div>
    </div>
  );
}
