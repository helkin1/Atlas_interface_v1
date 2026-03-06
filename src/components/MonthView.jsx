import { useTheme, themes } from "../context/theme.js";
import { usePlanData } from "../context/plan-data.js";
import { DAY_NAMES, MO_NAMES, PATTERN_COLORS, getDayPattern, getDaySets, getWeekSets } from "../utils/helpers.js";

export default function MonthView({ onWeek, onDay }) {
  const t = useTheme();
  const MONTH = usePlanData();
  return (
    <div>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAY_NAMES.map((d) => (
          <div key={d} className="text-center text-[11px] text-dim py-1">{d}</div>
        ))}
      </div>
      {MONTH.map((week, wi) => (
        <div key={wi} className="mb-2">
          <div className="flex items-center gap-2 mb-1.5">
            <button onClick={() => onWeek(wi)} className="text-[11px] text-primary bg-none border-none cursor-pointer underline underline-offset-[3px]">{week.label}</button>
            <span className="text-[10px] text-faint">&middot; {getWeekSets(week)} sets</span>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {week.days.map((day, di) => {
              const pat = getDayPattern(day);
              const pc = pat ? PATTERN_COLORS[pat] : null;
              return (
                <button key={di} onClick={() => !day.isRest && onDay(wi, di)}
                  className="rounded-[10px] py-3 px-1.5 text-center flex flex-col items-center justify-center gap-[3px] transition-all duration-150"
                  style={{
                    background: day.isRest ? (t === themes.dark ? "#0C0E13" : "#EAEBEE") : pc ? pc.bg : "var(--atlas-surface)",
                    border: `1px solid ${day.isRest ? "var(--atlas-border)" : pc ? pc.border : "var(--atlas-border)"}`,
                    cursor: day.isRest ? "default" : "pointer",
                    opacity: day.isRest ? 0.35 : 1,
                    minHeight: 80,
                  }}>
                  <div className="text-[9px] text-dim">{MO_NAMES[day.date.getMonth()]} {day.date.getDate()}</div>
                  <div className="text-xs font-bold" style={{ color: day.isRest ? "var(--atlas-text-faint)" : pc ? pc.text : "var(--atlas-text)" }}>{day.isRest ? "Rest" : day.label}</div>
                  {!day.isRest && <div className="text-[9px] text-dim">{getDaySets(day)} sets</div>}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
