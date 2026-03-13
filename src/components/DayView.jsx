import { useState, useEffect, useMemo } from "react";
import { useTheme } from "../context/theme.js";
import { EXERCISES } from "../data/exercise-data.js";
import { PATTERN_COLORS, MUSCLE_COLORS, getDayPattern, getDaySets, getDayVol, DAY_NAMES, MO_NAMES } from "../utils/helpers.js";
import { loadWorkoutLogs, saveWorkoutLogs, getWorkoutLogKey, migrateLegacyWorkoutLog, loadSessionMeta, saveSessionMeta, loadProfile } from "../utils/storage.js";
import { getPersonalizedConfig } from "../utils/personalization-engine.js";
import { PatternBadge, cardStyle } from "./shared.jsx";
import GymMode from "./GymMode.jsx";

function SetPill({ set, idx, logged }) {
  const t = useTheme();
  const isL = logged != null;
  const hit = isL && logged.reps >= set.r;
  const up = isL && logged.w > set.w;

  let borderColor = t.border;
  let bgColor = t.surface2;
  let textColor = t.textMuted;
  let statusIcon = null;
  
  if (isL && hit && !up) { 
    borderColor = t.colors.success; 
    bgColor = `${t.colors.success}10`; 
    textColor = t.colors.success;
    statusIcon = (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  }
  else if (isL && up) { 
    borderColor = t.colors.warning; 
    bgColor = `${t.colors.warning}10`; 
    textColor = t.colors.warning;
    statusIcon = (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M6 9V3M6 3L3 6M6 3L9 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  }
  else if (isL && !hit) { 
    borderColor = t.colors.error; 
    bgColor = `${t.colors.error}10`; 
    textColor = t.colors.error;
    statusIcon = (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M3 3L9 9M9 3L3 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  }

  const dw = isL ? logged.w : set.w;
  const dr = isL ? logged.reps : set.r;

  return (
    <div style={{
      border: `1px solid ${borderColor}`, 
      background: bgColor, 
      color: textColor, 
      borderRadius: 8,
      padding: "10px 14px", 
      fontSize: 13,
      minWidth: 80, 
      textAlign: "center",
      transition: "all 0.15s ease",
    }}>
      <div style={{ 
        fontSize: 10, 
        opacity: 0.7, 
        marginBottom: 4,
        fontWeight: 500,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
      }}>
        Set {idx + 1}
      </div>
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        gap: 6,
        fontWeight: 600,
      }}>
        {dw > 0 ? `${dw} x ${dr}` : `BW x ${dr}`}
        {statusIcon}
      </div>
    </div>
  );
}

export default function DayView({ day, planId, onBack }) {
  const t = useTheme();
  const dayKey = getWorkoutLogKey(planId, day.dayNum);

  const [sessionActive, setSessionActive] = useState(false);
  const [sessionMeta, setSessionMeta] = useState(() => loadSessionMeta(dayKey));
  const [logged, setLogged] = useState(() => {
    const all = migrateLegacyWorkoutLog(day.dayNum, planId, loadWorkoutLogs());
    return all[dayKey] || {};
  });

  useEffect(() => {
    const all = migrateLegacyWorkoutLog(day.dayNum, planId, loadWorkoutLogs());
    setLogged(all[dayKey] || {});
    setSessionMeta(loadSessionMeta(dayKey));
    setSessionActive(false);
  }, [dayKey, day.dayNum, planId]);

  // Persist whenever logged changes
  useEffect(() => {
    const migrated = migrateLegacyWorkoutLog(day.dayNum, planId, loadWorkoutLogs());
    const all = { ...migrated };
    if (Object.keys(logged).length > 0) {
      all[dayKey] = logged;
    } else {
      delete all[dayKey];
    }
    saveWorkoutLogs(all);
  }, [logged, dayKey, day.dayNum, planId]);

  const profile = useMemo(() => loadProfile(), []);
  const config = useMemo(() => getPersonalizedConfig(profile), [profile]);

  const hasLogs = Object.keys(logged).length > 0;

  // Check if this day is today
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  const dayDate = new Date(day.date);
  dayDate.setHours(0, 0, 0, 0);
  const isToday = dayDate.getTime() === todayDate.getTime();

  const pat = getDayPattern(day);
  const totalSets = getDaySets(day);
  const completedSets = Object.keys(logged).length;
  const pct = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;
  let actualVol = 0;
  Object.values(logged).forEach((l) => { actualVol += l.w * l.reps; });

  const startSession = () => {
    // Preserve original startTime for resumed sessions
    const existing = loadSessionMeta(dayKey);
    const meta = existing || { startTime: new Date().toISOString() };
    saveSessionMeta(dayKey, meta);
    setSessionMeta(meta);
    setSessionActive(true);
  };

  const endSession = () => { setSessionActive(false); };

  const clearLogs = () => {
    setLogged({});
    setSessionActive(false);
    saveSessionMeta(dayKey, null);
    setSessionMeta(null);
  };

  // Called by GymMode when a set is logged
  const handleLog = (key, data) => {
    setLogged((prev) => ({ ...prev, [key]: data }));
  };

  return (
    <div>
      {/* GymMode full-screen overlay */}
      {sessionActive && (
        <GymMode
          day={day}
          logged={logged}
          onLog={handleLog}
          onEnd={endSession}
          startTime={sessionMeta?.startTime}
        />
      )}

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
        Back to Week
      </button>

      {/* Header */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "flex-start", 
        marginBottom: 32,
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <h2 style={{ 
              fontSize: 28, 
              fontWeight: 600, 
              color: t.text,
              letterSpacing: -0.5,
              margin: 0,
            }}>
              {day.label}
            </h2>
            {pat && (
              <span style={{
                fontSize: 11,
                padding: "4px 10px",
                borderRadius: 6,
                background: t.surface2,
                color: t.textMuted,
                fontWeight: 500,
                border: `1px solid ${t.border}`,
              }}>
                {pat}
              </span>
            )}
          </div>
          <p style={{ 
            fontSize: 14, 
            color: t.textDim, 
            margin: 0,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}>
            <span>{DAY_NAMES[day.date.getDay()]}, {MO_NAMES[day.date.getMonth()]} {day.date.getDate()}</span>
            <span style={{ color: t.border }}>|</span>
            <span>{day.exercises.length} exercises</span>
            <span style={{ color: t.border }}>|</span>
            <span>{totalSets} sets</span>
            <span style={{ color: t.border }}>|</span>
            <span>{getDayVol(day).toLocaleString()} lbs</span>
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {isToday ? (
            <>
              {hasLogs && (
                <button
                  onClick={clearLogs}
                  style={{
                    padding: "10px 16px",
                    borderRadius: 8,
                    border: `1px solid ${t.border}`,
                    background: "transparent",
                    color: t.textMuted,
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  Clear Logs
                </button>
              )}
              <button
                onClick={startSession}
                style={{
                  padding: "12px 24px",
                  borderRadius: 8,
                  border: "none",
                  background: t.ctaBg,
                  color: t.ctaText,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {hasLogs ? "Resume Workout" : "Start Workout"}
              </button>
            </>
          ) : (
            <span style={{
              fontSize: 12,
              color: t.textDim,
              fontWeight: 500,
              padding: "10px 16px",
              background: t.surface2,
              borderRadius: 8,
              border: `1px solid ${t.border}`,
            }}>
              {dayDate < todayDate ? "Past workout" : "Upcoming workout"}
            </span>
          )}
        </div>
      </div>

      {/* Progress bar when there are logs */}
      {hasLogs && (
        <div style={{ 
          background: t.surface,
          border: `1px solid ${t.border}`,
          borderRadius: 12,
          padding: "16px 20px", 
          marginBottom: 24,
          boxShadow: t.shadow,
          display: "flex", 
          alignItems: "center", 
          gap: 20,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center", 
              marginBottom: 8,
            }}>
              <span style={{ fontSize: 13, color: t.textMuted, fontWeight: 500 }}>
                Session progress
              </span>
              <span style={{ 
                fontSize: 14, 
                fontWeight: 600, 
                color: pct === 100 ? t.colors.success : t.text,
              }}>
                {completedSets}/{totalSets} sets ({pct}%)
              </span>
            </div>
            <div style={{ 
              height: 6, 
              borderRadius: 3, 
              background: t.surface3, 
              overflow: "hidden",
            }}>
              <div style={{ 
                height: "100%", 
                borderRadius: 3, 
                background: pct === 100 ? t.colors.success : t.text, 
                width: `${pct}%`, 
                transition: "width 0.3s ease",
              }} />
            </div>
          </div>
          {actualVol > 0 && (
            <div style={{ 
              textAlign: "right", 
              flexShrink: 0,
              paddingLeft: 20,
              borderLeft: `1px solid ${t.border}`,
            }}>
              <div style={{ fontSize: 18, fontWeight: 600, color: t.text }}>{actualVol.toLocaleString()}</div>
              <div style={{ fontSize: 11, color: t.textFaint, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>lbs volume</div>
            </div>
          )}
        </div>
      )}

      {/* Exercise cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {day.exercises.map((entry, ei) => {
          const ex = EXERCISES[entry.exercise_id]; 
          if (!ex) return null;
          return (
            <div 
              key={ei} 
              style={{ 
                background: t.surface,
                border: `1px solid ${t.border}`,
                borderRadius: 12,
                boxShadow: t.shadow,
                overflow: "hidden",
              }}
            >
              {/* Exercise header */}
              <div style={{ 
                padding: "16px 20px",
                borderBottom: `1px solid ${t.border}`,
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center",
              }}>
                <div>
                  <h3 style={{ 
                    fontSize: 15, 
                    fontWeight: 600, 
                    color: t.text,
                    margin: 0,
                    marginBottom: 8,
                  }}>
                    {ex.name}
                  </h3>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {ex.muscles.filter((m) => m.role === "direct").map((m) => {
                      const tier = config.muscleTiers[m.name];
                      const isPriority = tier === "priority";
                      const isExcluded = tier === "excluded";
                      return (
                        <span
                          key={m.name}
                          style={{
                            fontSize: 11,
                            padding: "3px 8px",
                            borderRadius: 4,
                            background: isPriority ? "rgba(34,197,94,0.08)" : isExcluded ? "rgba(239,68,68,0.06)" : t.surface2,
                            color: isPriority ? "#22C55E" : isExcluded ? t.textFaint : t.textMuted,
                            fontWeight: isPriority ? 600 : 500,
                            textDecoration: isExcluded ? "line-through" : "none",
                          }}
                        >
                          {m.name}
                        </span>
                      );
                    })}
                    {ex.muscles.filter((m) => m.role !== "direct").map((m) => (
                      <span
                        key={m.name}
                        style={{
                          fontSize: 11,
                          padding: "3px 8px",
                          borderRadius: 4,
                          background: t.surface2,
                          color: t.textFaint,
                          fontWeight: 500,
                        }}
                      >
                        {m.name}
                      </span>
                    ))}
                  </div>
                </div>
                <span style={{ 
                  fontSize: 12, 
                  color: t.textDim,
                  fontWeight: 500,
                }}>
                  {entry.sets.length} sets
                </span>
              </div>
              
              {/* Sets */}
              <div style={{ padding: 16 }}>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {entry.sets.map((s, si) => {
                    const key = `${ei}_${si}`;
                    return <SetPill key={si} set={s} idx={si} logged={logged[key]} />;
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
