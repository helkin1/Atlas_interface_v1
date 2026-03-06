import { useTheme, themes } from "../context/theme.js";
import { EXERCISES } from "../data/exercise-data.js";
import { DAY_NAMES, MO_NAMES, PATTERN_COLORS, MUSCLE_COLORS, getDayPattern, getDaySets, getWeekSets, weekMuscleVol, calcGoalPcts, overallGoalPct, goalPctColor } from "../utils/helpers.js";
import { PatternBadge, CARD_CLASS } from "./shared.jsx";

export default function WeekView({ week, onDay, onBack }) {
  const t = useTheme();
  const mv = weekMuscleVol(week);
  const goalPcts = calcGoalPcts(mv);
  const overall = overallGoalPct(goalPcts);

  const trainingDays = week.days.filter((d) => !d.isRest);

  return (
    <div>
      <button onClick={onBack} className="text-xs text-primary bg-none border-none cursor-pointer mb-4 flex items-center gap-1.5">&larr; Back to Month</button>

      <h2 className="text-xl font-[800] text-content mb-1">{week.label}</h2>
      <div className="flex gap-3 mb-6 text-xs text-dim">
        <span>{getWeekSets(week)} total sets</span><span>&middot;</span>
        <span>{trainingDays.length} training days</span><span>&middot;</span>
        <span className="font-semibold" style={{ color: goalPctColor(overall) }}>{overall}% of goal</span>
      </div>

      {/* 7-day grid */}
      <div className="grid grid-cols-7 gap-2 mb-7">
        {week.days.map((day, di) => {
          const pat = getDayPattern(day); const pc = pat ? PATTERN_COLORS[pat] : null;
          return (
            <button key={di} onClick={() => !day.isRest && onDay(di)}
              className="rounded-[14px] p-4 text-left transition-all duration-[150ms]"
              style={{
                background: day.isRest ? (t === themes.dark ? "#0C0E13" : "#EAEBEE") : "var(--atlas-surface)",
                border: `1px solid ${day.isRest ? "var(--atlas-border)" : pc ? pc.border : "var(--atlas-border)"}`,
                cursor: day.isRest ? "default" : "pointer",
                opacity: day.isRest ? 0.4 : 1,
                minHeight: 140,
              }}
            >
              <div className="text-xs text-faint mb-1">{DAY_NAMES[day.date.getDay()]} &middot; {MO_NAMES[day.date.getMonth()]} {day.date.getDate()}</div>
              <div className={`text-[15px] font-bold mb-2 ${day.isRest ? "text-faint" : "text-content"}`}>{day.label}</div>
              {!day.isRest && pat && <PatternBadge pattern={pat} />}
              {!day.isRest && <div className="mt-2.5 text-sm text-dim">{day.exercises.length} ex &middot; {getDaySets(day)} sets</div>}
              {day.isRest && <div className="text-2xl mt-2">😴</div>}
            </button>
          );
        })}
      </div>

      {/* Exercise breakdown */}
      <div className={`${CARD_CLASS} p-6`}>
        <div className="text-body font-semibold text-muted mb-[18px]">Exercise Breakdown</div>

        {trainingDays.map((day, di) => {
          const pat = getDayPattern(day);
          return (
            <div key={di} className={di < trainingDays.length - 1 ? "mb-5" : ""}>
              {/* Day header */}
              <div className="flex items-center gap-2 mb-2.5">
                <span className="text-body font-bold text-content">{day.label}</span>
                {pat && <PatternBadge pattern={pat} />}
                <span className="text-sm text-dim ml-auto">{getDaySets(day)} sets</span>
              </div>

              {/* Exercise rows */}
              {day.exercises.map((entry, ei) => {
                const ex = EXERCISES[entry.exercise_id];
                if (!ex) return null;
                const directMuscles = ex.muscles.filter((m) => m.role === "direct");
                return (
                  <div key={ei} className={`flex justify-between items-center px-2.5 py-[7px] rounded-[14px] mb-0.5 ${ei % 2 === 0 ? "bg-surface2" : "bg-transparent"}`}>
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-xs font-semibold text-content whitespace-nowrap overflow-hidden text-ellipsis">
                        {ex.name}
                      </span>
                      <div className="flex gap-1 flex-nowrap overflow-hidden">
                        {directMuscles.slice(0, 2).map((m) => (
                          <span key={m.name} className="text-[9px] px-1.5 py-[1px] rounded-[6px] whitespace-nowrap"
                            style={{ background: `${MUSCLE_COLORS[m.name] || "#666"}18`, color: MUSCLE_COLORS[m.name] || "#888" }}
                          >{m.name}</span>
                        ))}
                      </div>
                    </div>
                    <span className="text-sm text-faint shrink-0 ml-2">
                      {entry.sets.length} sets
                    </span>
                  </div>
                );
              })}

              {di < trainingDays.length - 1 && (
                <div className="h-px bg-edge mt-3.5" />
              )}
            </div>
          );
        })}

        {trainingDays.length === 0 && (
          <div className="text-xs text-faint text-center py-5">No training days this week</div>
        )}
      </div>
    </div>
  );
}
