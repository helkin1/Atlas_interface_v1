import { useTheme, themes } from "../context/theme.js";
import { EXERCISES } from "../data/exercise-data.js";
import { DAY_NAMES, MO_NAMES, PATTERN_COLORS, MUSCLE_COLORS, getDayPattern, getDaySets, getWeekSets, weekMuscleVol, calcGoalPcts, overallGoalPct, goalPctColor } from "../utils/helpers.js";
import { PatternBadge } from "./shared.jsx";

export default function WeekView({ week, onDay, onBack }) {
  const t = useTheme();
  const mv = weekMuscleVol(week);
  const goalPcts = calcGoalPcts(mv);
  const overall = overallGoalPct(goalPcts);

  const trainingDays = week.days.filter((d) => !d.isRest);

  return (
    <div>
      <button onClick={onBack} style={{ fontSize: 12, color: "#4C9EFF", background: "none", border: "none", cursor: "pointer", marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>&larr; Back to Month</button>

      <h2 style={{ fontSize: 22, fontWeight: 800, color: t.text, marginBottom: 4 }}>{week.label}</h2>
      <div style={{ display: "flex", gap: 12, marginBottom: 24, fontSize: 12, color: t.textDim }}>
        <span>{getWeekSets(week)} total sets</span><span>&middot;</span>
        <span>{trainingDays.length} training days</span><span>&middot;</span>
        <span style={{ color: goalPctColor(overall), fontWeight: 600 }}>{overall}% of goal</span>
      </div>

      {/* 7-day grid */}
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

      {/* Exercise breakdown — replaces the goal-bars panel */}
      <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 14, padding: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: t.textFaint, fontFamily: "mono", marginBottom: 18 }}>Exercise Breakdown</div>

        {trainingDays.map((day, di) => {
          const pat = getDayPattern(day);
          return (
            <div key={di} style={{ marginBottom: di < trainingDays.length - 1 ? 20 : 0 }}>
              {/* Day header */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: t.text }}>{day.label}</span>
                {pat && <PatternBadge pattern={pat} />}
                <span style={{ fontSize: 11, color: t.textDim, fontFamily: "mono", marginLeft: "auto" }}>{getDaySets(day)} sets</span>
              </div>

              {/* Exercise rows */}
              {day.exercises.map((entry, ei) => {
                const ex = EXERCISES[entry.exercise_id];
                if (!ex) return null;
                const directMuscles = ex.muscles.filter((m) => m.role === "direct");
                return (
                  <div key={ei} style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "7px 10px",
                    borderRadius: 8,
                    background: ei % 2 === 0 ? t.surface2 : "transparent",
                    marginBottom: 2,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: t.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {ex.name}
                      </span>
                      <div style={{ display: "flex", gap: 4, flexWrap: "nowrap", overflow: "hidden" }}>
                        {directMuscles.slice(0, 2).map((m) => (
                          <span key={m.name} style={{
                            fontSize: 9,
                            padding: "1px 6px",
                            borderRadius: 6,
                            background: `${MUSCLE_COLORS[m.name] || "#666"}18`,
                            color: MUSCLE_COLORS[m.name] || "#888",
                            whiteSpace: "nowrap",
                          }}>{m.name}</span>
                        ))}
                      </div>
                    </div>
                    <span style={{ fontSize: 11, fontFamily: "mono", color: t.textFaint, flexShrink: 0, marginLeft: 8 }}>
                      {entry.sets.length} sets
                    </span>
                  </div>
                );
              })}

              {di < trainingDays.length - 1 && (
                <div style={{ height: 1, background: t.border, marginTop: 14 }} />
              )}
            </div>
          );
        })}

        {trainingDays.length === 0 && (
          <div style={{ fontSize: 12, color: t.textFaint, textAlign: "center", padding: "20px 0" }}>No training days this week</div>
        )}
      </div>
    </div>
  );
}
