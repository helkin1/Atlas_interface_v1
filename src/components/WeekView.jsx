import { useTheme, themes } from "../context/theme.js";
import { EXERCISES } from "../data/exercise-data.js";
import { DAY_NAMES, MO_NAMES, PATTERN_COLORS, MUSCLE_COLORS, getDayPattern, getDaySets, getWeekSets, weekMuscleVol, calcGoalPcts, overallGoalPct, goalPctColor } from "../utils/helpers.js";
import { PatternBadge, cardStyle } from "./shared.jsx";

export default function WeekView({ week, onDay, onBack }) {
  const t = useTheme();
  const mv = weekMuscleVol(week);
  const goalPcts = calcGoalPcts(mv);
  const overall = overallGoalPct(goalPcts);

  const trainingDays = week.days.filter((d) => !d.isRest);

  return (
    <div>
      {/* Back button */}
      <button 
        onClick={onBack} 
        style={{ 
          fontSize: 13, 
          color: t.textMuted, 
          background: "none", 
          border: "none", 
          cursor: "pointer", 
          marginBottom: 20, 
          display: "flex", 
          alignItems: "center", 
          gap: 8,
          padding: "8px 0",
          fontWeight: 500,
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Back to Month
      </button>

      {/* Week header */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ 
          fontSize: 28, 
          fontWeight: 600, 
          color: t.text, 
          marginBottom: 8,
          letterSpacing: -0.5,
        }}>
          {week.label}
        </h2>
        <div style={{ 
          display: "flex", 
          gap: 16, 
          fontSize: 14, 
          color: t.textDim,
          alignItems: "center",
        }}>
          <span style={{ fontWeight: 500 }}>{getWeekSets(week)} total sets</span>
          <span style={{ color: t.border }}>|</span>
          <span>{trainingDays.length} training days</span>
          <span style={{ color: t.border }}>|</span>
          <span style={{ 
            color: overall >= 80 ? t.colors.success : t.textDim, 
            fontWeight: 600,
          }}>
            {overall}% of goal
          </span>
        </div>
      </div>

      {/* 7-day grid */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(7, 1fr)", 
        gap: 10, 
        marginBottom: 36,
      }}>
        {week.days.map((day, di) => {
          const pat = getDayPattern(day);
          const isRest = day.isRest;
          
          return (
            <button 
              key={di} 
              onClick={() => !isRest && onDay(di)} 
              style={{
                background: isRest ? t.surface2 : t.surface,
                border: `1px solid ${t.border}`,
                borderRadius: 12, 
                padding: 16, 
                cursor: isRest ? "default" : "pointer",
                textAlign: "left", 
                opacity: isRest ? 0.5 : 1, 
                minHeight: 140, 
                transition: "all 0.15s ease",
                boxShadow: isRest ? "none" : t.shadow,
                display: "flex",
                flexDirection: "column",
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
                  e.currentTarget.style.boxShadow = t.shadow;
                }
              }}
            >
              <span style={{ 
                fontSize: 11, 
                color: t.textDim, 
                marginBottom: 6,
                fontWeight: 500,
              }}>
                {DAY_NAMES[day.date.getDay()]}
              </span>
              <span style={{ 
                fontSize: 10, 
                color: t.textFaint, 
                marginBottom: 8,
              }}>
                {MO_NAMES[day.date.getMonth()]} {day.date.getDate()}
              </span>
              <span style={{ 
                fontSize: 15, 
                fontWeight: 600, 
                color: isRest ? t.textFaint : t.text, 
                marginBottom: 8,
              }}>
                {day.label}
              </span>
              {!isRest && pat && (
                <span style={{
                  fontSize: 10,
                  padding: "3px 8px",
                  borderRadius: 4,
                  background: t.surface2,
                  color: t.textMuted,
                  fontWeight: 500,
                  alignSelf: "flex-start",
                  marginBottom: 8,
                }}>
                  {pat}
                </span>
              )}
              {!isRest && (
                <span style={{ 
                  marginTop: "auto", 
                  fontSize: 12, 
                  color: t.textMuted,
                  fontWeight: 500,
                }}>
                  {day.exercises.length} exercises
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Exercise breakdown */}
      <div style={{ 
        background: t.surface,
        borderRadius: 16,
        border: `1px solid ${t.border}`,
        boxShadow: t.shadow,
        overflow: "hidden",
      }}>
        <div style={{ 
          padding: "16px 20px",
          borderBottom: `1px solid ${t.border}`,
          background: t.surface2,
        }}>
          <h3 style={{ 
            fontSize: 14, 
            fontWeight: 600, 
            color: t.text,
            margin: 0,
          }}>
            Exercise Breakdown
          </h3>
        </div>

        <div style={{ padding: 20 }}>
          {trainingDays.map((day, di) => {
            const pat = getDayPattern(day);
            return (
              <div key={di} style={{ marginBottom: di < trainingDays.length - 1 ? 24 : 0 }}>
                {/* Day header */}
                <div style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "space-between",
                  marginBottom: 12,
                  paddingBottom: 8,
                  borderBottom: `1px solid ${t.border}`,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: t.text }}>{day.label}</span>
                    {pat && (
                      <span style={{
                        fontSize: 10,
                        padding: "2px 8px",
                        borderRadius: 4,
                        background: t.surface2,
                        color: t.textMuted,
                        fontWeight: 500,
                      }}>
                        {pat}
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: 12, color: t.textDim, fontWeight: 500 }}>
                    {getDaySets(day)} sets
                  </span>
                </div>

                {/* Exercise rows */}
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {day.exercises.map((entry, ei) => {
                    const ex = EXERCISES[entry.exercise_id];
                    if (!ex) return null;
                    const directMuscles = ex.muscles.filter((m) => m.role === "direct");
                    return (
                      <div key={ei} style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "10px 12px",
                        borderRadius: 8,
                        background: ei % 2 === 0 ? t.surface2 : "transparent",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                          <span style={{ 
                            fontSize: 13, 
                            fontWeight: 500, 
                            color: t.text, 
                            whiteSpace: "nowrap", 
                            overflow: "hidden", 
                            textOverflow: "ellipsis",
                          }}>
                            {ex.name}
                          </span>
                          <div style={{ display: "flex", gap: 4, flexWrap: "nowrap", overflow: "hidden" }}>
                            {directMuscles.slice(0, 2).map((m) => (
                              <span key={m.name} style={{
                                fontSize: 10,
                                padding: "2px 6px",
                                borderRadius: 4,
                                background: t.surface3,
                                color: t.textMuted,
                                whiteSpace: "nowrap",
                                fontWeight: 500,
                              }}>
                                {m.name}
                              </span>
                            ))}
                          </div>
                        </div>
                        <span style={{ 
                          fontSize: 12, 
                          color: t.textDim, 
                          flexShrink: 0, 
                          marginLeft: 12,
                          fontWeight: 500,
                        }}>
                          {entry.sets.length} sets
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {trainingDays.length === 0 && (
            <div style={{ 
              fontSize: 13, 
              color: t.textFaint, 
              textAlign: "center", 
              padding: "32px 0",
            }}>
              No training days this week
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
