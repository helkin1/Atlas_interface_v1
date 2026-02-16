import { useTheme, themes } from "../context/theme.js";
import { usePlanData } from "../context/plan-data.js";
import { DAY_NAMES, MO_NAMES, PATTERN_COLORS, getDayPattern, getDaySets, getWeekSets } from "../utils/helpers.js";

export default function MonthView({ onWeek, onDay }) {
  const t = useTheme();
  const MONTH = usePlanData();
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 8 }}>
        {DAY_NAMES.map((d) => (
          <div key={d} style={{ textAlign: "center", fontSize: 10, fontFamily: "mono", color: t.textFaint, textTransform: "uppercase", letterSpacing: 1, padding: "4px 0" }}>{d}</div>
        ))}
      </div>
      {MONTH.map((week, wi) => (
        <div key={wi} style={{ marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <button onClick={() => onWeek(wi)} style={{ fontSize: 11, fontFamily: "mono", color: "#4C9EFF", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}>{week.label}</button>
            <span style={{ fontSize: 10, color: t.textFaint }}>&middot; {getWeekSets(week)} sets</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
            {week.days.map((day, di) => {
              const pat = getDayPattern(day);
              const pc = pat ? PATTERN_COLORS[pat] : null;
              return (
                <button key={di} onClick={() => !day.isRest && onDay(wi, di)} style={{
                  background: day.isRest ? (t === themes.dark ? "#0C0E13" : "#EAEBEE") : pc ? pc.bg : t.surface,
                  border: `1px solid ${day.isRest ? t.border : pc ? pc.border : t.border}`,
                  borderRadius: 10, padding: "12px 6px", cursor: day.isRest ? "default" : "pointer",
                  textAlign: "center", opacity: day.isRest ? 0.35 : 1, minHeight: 80,
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, transition: "all 0.15s",
                }}>
                  <div style={{ fontSize: 9, color: t.textDim, fontFamily: "mono" }}>{MO_NAMES[day.date.getMonth()]} {day.date.getDate()}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: day.isRest ? t.textFaint : pc ? pc.text : t.text }}>{day.isRest ? "Rest" : day.label}</div>
                  {!day.isRest && <div style={{ fontSize: 9, fontFamily: "mono", color: t.textDim }}>{getDaySets(day)} sets</div>}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
