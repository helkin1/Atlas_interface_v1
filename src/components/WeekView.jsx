import { useTheme, themes } from "../context/theme.js";
import { DAY_NAMES, MO_NAMES, PATTERN_COLORS, getDayPattern, getDaySets, getWeekSets, weekMuscleVol, calcGoalPcts, overallGoalPct, goalPctColor } from "../utils/helpers.js";
import { PatternBadge, MuscleGoalBar } from "./shared.jsx";

export default function WeekView({ week, onDay, onBack }) {
  const t = useTheme();
  const mv = weekMuscleVol(week);
  const goalPcts = calcGoalPcts(mv);
  const overall = overallGoalPct(goalPcts);
  const sortedGoals = Object.entries(goalPcts).filter(([,d]) => d.eff > 0).sort((a, b) => b[1].pct - a[1].pct);

  return (
    <div>
      <button onClick={onBack} style={{ fontSize: 12, color: "#4C9EFF", background: "none", border: "none", cursor: "pointer", marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>&larr; Back to Month</button>

      <h2 style={{ fontSize: 22, fontWeight: 800, color: t.text, marginBottom: 4 }}>{week.label}</h2>
      <div style={{ display: "flex", gap: 12, marginBottom: 24, fontSize: 12, color: t.textDim }}>
        <span>{getWeekSets(week)} total sets</span><span>&middot;</span>
        <span>{week.days.filter((d) => !d.isRest).length} training days</span><span>&middot;</span>
        <span style={{ color: goalPctColor(overall), fontWeight: 600 }}>{overall}% of goal</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8, marginBottom: 28 }}>
        {week.days.map((day, di) => {
          const pat = getDayPattern(day); const pc = pat ? PATTERN_COLORS[pat] : null;
          return (
            <button key={di} onClick={() => !day.isRest && onDay(di)} style={{
              background: day.isRest ? (t === themes.dark ? "#0C0E13" : "#EAEBEE") : t.surface,
              border: `1px solid ${day.isRest ? t.border : pc ? pc.border : t.border}`,
              borderRadius: 14, padding: 16, cursor: day.isRest ? "default" : "pointer",
              textAlign: "left", opacity: day.isRest ? 0.4 : 1, minHeight: 140, transition: "all 0.15s",
            }}>
              <div style={{ fontSize: 10, color: t.textFaint, fontFamily: "mono", marginBottom: 4 }}>{DAY_NAMES[day.date.getDay()]} &middot; {MO_NAMES[day.date.getMonth()]} {day.date.getDate()}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: day.isRest ? t.textFaint : t.text, marginBottom: 8 }}>{day.label}</div>
              {!day.isRest && pat && <PatternBadge pattern={pat} />}
              {!day.isRest && <div style={{ marginTop: 10, fontSize: 11, color: t.textDim, fontFamily: "mono" }}>{day.exercises.length} ex &middot; {getDaySets(day)} sets</div>}
              {day.isRest && <div style={{ fontSize: 28, marginTop: 8 }}>😴</div>}
            </button>
          );
        })}
      </div>

      <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 14, padding: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: t.textFaint, fontFamily: "mono", marginBottom: 14 }}>Weekly % of Goal (vs MAV)</div>
        {sortedGoals.map(([m, data]) => (
          <MuscleGoalBar key={m} name={m} eff={data.eff} target={data.target} />
        ))}
      </div>
    </div>
  );
}
