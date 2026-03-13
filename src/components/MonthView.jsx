import { useMemo } from "react";
import { useTheme, themes } from "../context/theme.js";
import { usePlanData } from "../context/plan-data.js";
import { DAY_NAMES, MO_NAMES, PATTERN_COLORS, getDayPattern, getDaySets, getWeekSets, weekMuscleVol, calcPersonalizedGoalPcts, personalizedOverallGoalPct, goalPctColor } from "../utils/helpers.js";
import { loadProfile } from "../utils/storage.js";
import { getPersonalizedConfig } from "../utils/personalization-engine.js";

export default function MonthView({ onWeek, onDay }) {
  const t = useTheme();
  const MONTH = usePlanData();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const profile = useMemo(() => loadProfile(), []);
  const config = useMemo(() => getPersonalizedConfig(profile), [profile]);
  
  return (
    <div>
      {/* Day headers */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(7, 1fr)", 
        gap: 8, 
        marginBottom: 16,
        paddingBottom: 12,
        borderBottom: `1px solid ${t.border}`,
      }}>
        {DAY_NAMES.map((d) => (
          <div key={d} style={{ 
            textAlign: "center", 
            fontSize: 12, 
            fontWeight: 500,
            color: t.textMuted, 
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}>
            {d}
          </div>
        ))}
      </div>

      {/* Weeks */}
      {MONTH.map((week, wi) => (
        <div key={wi} style={{ marginBottom: 24 }}>
          {/* Week header */}
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "space-between",
            marginBottom: 12,
          }}>
            <button 
              onClick={() => onWeek(wi)} 
              style={{ 
                fontSize: 14, 
                fontWeight: 600,
                color: t.text, 
                background: "none", 
                border: "none", 
                cursor: "pointer",
                padding: "4px 0",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {week.label}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ opacity: 0.5 }}>
                <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <span style={{
              fontSize: 12,
              color: t.textDim,
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}>
              {getWeekSets(week)} sets
              {(() => {
                const mv = weekMuscleVol(week);
                const goals = calcPersonalizedGoalPcts(mv, config);
                const pct = personalizedOverallGoalPct(goals, config);
                return (
                  <span style={{ color: goalPctColor(pct), fontWeight: 600, fontSize: 11 }}>{pct}% goal</span>
                );
              })()}
            </span>
          </div>

          {/* Day cards */}
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(7, 1fr)", 
            gap: 8,
          }}>
            {week.days.map((day, di) => {
              const pat = getDayPattern(day);
              const isRest = day.isRest;
              const dayDate = new Date(day.date);
              dayDate.setHours(0, 0, 0, 0);
              const isPast = dayDate < today;
              const isToday = dayDate.getTime() === today.getTime();
              const dimmed = isRest || isPast;

              return (
                <button
                  key={di}
                  onClick={() => !isRest && onDay(wi, di)}
                  style={{
                    background: isToday ? (t.surface3 || t.surface2) : dimmed ? t.surface2 : t.surface,
                    border: isToday ? `2px solid ${t.colors?.primary || "#6366F1"}` : `1px solid ${t.border}`,
                    borderRadius: 12,
                    padding: "14px 8px",
                    cursor: isRest ? "default" : "pointer",
                    textAlign: "center",
                    opacity: dimmed && !isToday ? 0.5 : 1,
                    minHeight: 88,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    transition: "all 0.15s ease",
                    boxShadow: isToday ? `0 0 0 1px ${t.colors?.primary || "#6366F1"}22` : dimmed ? "none" : t.shadow,
                  }}
                  onMouseEnter={(e) => {
                    if (!isRest) {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = t.shadowLg;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isRest) {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = isToday ? `0 0 0 1px ${t.colors?.primary || "#6366F1"}22` : dimmed ? "none" : t.shadow;
                    }
                  }}
                >
                  <span style={{ 
                    fontSize: 11, 
                    color: t.textDim,
                    fontWeight: 400,
                  }}>
                    {MO_NAMES[day.date.getMonth()]} {day.date.getDate()}
                  </span>
                  <span style={{ 
                    fontSize: 14, 
                    fontWeight: 600, 
                    color: isRest ? t.textFaint : t.text,
                  }}>
                    {isRest ? "Rest" : day.label}
                  </span>
                  {!isRest && (
                    <span style={{ 
                      fontSize: 11, 
                      color: t.textMuted,
                      fontWeight: 500,
                    }}>
                      {getDaySets(day)} sets
                    </span>
                  )}
                  {!isRest && pat && (
                    <span style={{
                      fontSize: 10,
                      padding: "2px 8px",
                      borderRadius: 4,
                      background: t.surface2,
                      color: t.textDim,
                      fontWeight: 500,
                      marginTop: 2,
                    }}>
                      {pat}
                    </span>
                  )}
                  {isToday && !isRest && (
                    <span style={{
                      fontSize: 9,
                      padding: "3px 8px",
                      borderRadius: 4,
                      background: t.ctaBg,
                      color: t.ctaText,
                      fontWeight: 600,
                      marginTop: 4,
                      letterSpacing: "0.02em",
                    }}>
                      Start Workout
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
