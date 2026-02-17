import { useTheme } from "../context/theme.js";
import { usePlanData } from "../context/plan-data.js";
import { EXERCISES } from "../data/exercise-data.js";
import { PATTERN_COLORS, calcMuscleVol, weekMuscleVol, calcGoalPcts, overallGoalPct, goalPctColor, getDaySets, getWeekSets } from "../utils/helpers.js";
import { MiniBar, GoalRing, MuscleGoalBar, MuscleDiagram } from "./shared.jsx";

export default function Sidebar({ weekIdx, viewLevel, curWeek, curDay }) {
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
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: t.textFaint, fontFamily: "mono", marginBottom: 16 }}>Week {curWeek.weekNum} Overview</div>
        <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 16, marginBottom: 16, display: "flex", alignItems: "center", gap: 16 }}>
          <MuscleDiagram muscleVol={mv} size={120} />
          <div style={{ flex: 1 }}>
            <GoalRing pct={overall} size={72} strokeWidth={5} label="Weekly Goal" />
            <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 18, fontFamily: "mono", fontWeight: 700, color: "#4C9EFF" }}>{wkSets}</div>
                <div style={{ fontSize: 8, color: t.textFaint, fontFamily: "mono", textTransform: "uppercase" }}>Sets</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 18, fontFamily: "mono", fontWeight: 700, color: "#3DDC84" }}>{trainDays}</div>
                <div style={{ fontSize: 8, color: t.textFaint, fontFamily: "mono", textTransform: "uppercase" }}>Train Days</div>
              </div>
            </div>
          </div>
        </div>
        <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: t.textFaint, fontFamily: "mono", marginBottom: 12 }}>% of Goal (vs MAV)</div>
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
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: t.textFaint, fontFamily: "mono", marginBottom: 16 }}>{curDay.label} Overview</div>
        <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 16, marginBottom: 16, display: "flex", alignItems: "center", gap: 16 }}>
          <MuscleDiagram muscleVol={dayMuscVol} size={120} />
          <div style={{ flex: 1 }}>
            <GoalRing pct={wkOverall} size={72} strokeWidth={5} label="Week So Far" />
            <div style={{ marginTop: 10, textAlign: "center" }}>
              <div style={{ fontSize: 18, fontFamily: "mono", fontWeight: 700, color: "#4C9EFF" }}>{getDaySets(curDay)}</div>
              <div style={{ fontSize: 8, color: t.textFaint, fontFamily: "mono", textTransform: "uppercase" }}>Sets Today</div>
            </div>
          </div>
        </div>
        <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: t.textFaint, fontFamily: "mono", marginBottom: 12 }}>Muscle Breakdown</div>
          {dayMuscles.map(([m, s]) => <MiniBar key={m} name={m} sets={s} max={maxM} />)}
        </div>
        {week && (
          <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: t.textFaint, fontFamily: "mono", marginBottom: 12 }}>Weekly Goal Progress</div>
            {Object.entries(wkGoals).filter(([,d]) => d.eff > 0).sort((a, b) => b[1].pct - a[1].pct).slice(0, 10).map(([m, data]) => {
              const dayContrib = dayMuscVol[m] || 0;
              const dayPct = data.target > 0 ? Math.round((dayContrib / data.target) * 100) : 0;
              const pc = goalPctColor(data.pct);
              return (
                <div key={m} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0", borderBottom: `1px solid ${t.border}` }}>
                  <span style={{ fontSize: 11, color: t.textMuted }}>{m}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 9, fontFamily: "mono", color: t.textDim }}>+{dayPct}%</span>
                    <span style={{ fontSize: 11, fontFamily: "mono", fontWeight: 600, color: pc }}>{data.pct}%</span>
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

  const patterns = { push: 0, pull: 0, legs: 0 };
  MONTH.forEach((w) => w.days.forEach((d) => d.exercises.forEach((e) => { const ex = EXERCISES[e.exercise_id]; if (ex && patterns[ex.pattern] !== undefined) patterns[ex.pattern] += e.sets.length; })));
  const patTotal = patterns.push + patterns.pull + patterns.legs;

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

  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: t.textFaint, fontFamily: "mono", marginBottom: 16 }}>Mesocycle Overview</div>
      <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 16, marginBottom: 16, display: "flex", alignItems: "center", gap: 16 }}>
        <MuscleDiagram muscleVol={avgWeekMusc} size={120} />
        <div style={{ flex: 1 }}>
          <GoalRing pct={overall} size={72} strokeWidth={5} label="Avg Weekly" />
          <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 18, fontFamily: "mono", fontWeight: 700, color: "#4C9EFF" }}>{totalSets}</div>
              <div style={{ fontSize: 8, color: t.textFaint, fontFamily: "mono", textTransform: "uppercase" }}>Total Sets</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 18, fontFamily: "mono", fontWeight: 700, color: "#3DDC84" }}>{trainDays}</div>
              <div style={{ fontSize: 8, color: t.textFaint, fontFamily: "mono", textTransform: "uppercase" }}>Train Days</div>
            </div>
          </div>
        </div>
      </div>
      <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 16, marginBottom: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: t.textFaint, fontFamily: "mono", marginBottom: 12 }}>Pattern Split</div>
        <div style={{ display: "flex", gap: 8 }}>
          {Object.entries(patterns).map(([p, s]) => {
            const pct = Math.round((s / patTotal) * 100);
            const pc = PATTERN_COLORS[p];
            return (
              <div key={p} style={{ flex: 1, textAlign: "center" }}>
                <div style={{ fontSize: 22, fontFamily: "mono", fontWeight: 700, color: pc.text }}>{s}</div>
                <div style={{ fontSize: 10, color: t.textDim }}>{p}</div>
                <div style={{ height: 4, background: t.border, borderRadius: 2, marginTop: 8, overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: pc.text, borderRadius: 2 }} />
                </div>
                <div style={{ fontSize: 10, fontFamily: "mono", color: t.textFaint, marginTop: 4 }}>{pct}%</div>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 16, marginBottom: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: t.textFaint, fontFamily: "mono", marginBottom: 12 }}>Weekly Sets</div>
        <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 70 }}>
          {wkSets.map((s, i) => {
            const h = (s / maxWS) * 100;
            const sel = weekIdx === i;
            return (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                <span style={{ fontSize: 10, fontFamily: "mono", color: sel ? "#4C9EFF" : t.textDim }}>{s}</span>
                <div style={{ width: "100%", height: `${h}%`, background: sel ? "#4C9EFF" : t.border, borderRadius: 4, minHeight: 4, transition: "all 0.3s" }} />
                <span style={{ fontSize: 9, fontFamily: "mono", color: t.textFaint }}>W{i + 1}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: t.textFaint, fontFamily: "mono", marginBottom: 12 }}>% of Goal (Avg Weekly vs MAV)</div>
        {sortedGoals.slice(0, 12).map(([m, data]) => (
          <MuscleGoalBar key={m} name={m} eff={data.eff} target={data.target} compact />
        ))}
        {sortedGoals.length > 12 && <div style={{ fontSize: 10, color: t.textFaint, textAlign: "center", marginTop: 6 }}>+{sortedGoals.length - 12} more</div>}
      </div>
    </div>
  );
}
