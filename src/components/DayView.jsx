import { useState, useEffect } from "react";
import { useTheme } from "../context/theme.js";
import { EXERCISES } from "../data/exercise-data.js";
import { PATTERN_COLORS, MUSCLE_COLORS, getDayPattern, getDaySets, getDayVol, DAY_NAMES, MO_NAMES } from "../utils/helpers.js";
import { loadWorkoutLogs, saveWorkoutLogs, getWorkoutLogKey, migrateLegacyWorkoutLog, loadSessionMeta, saveSessionMeta } from "../utils/storage.js";
import { PatternBadge } from "./shared.jsx";
import GymMode from "./GymMode.jsx";

function SetPill({ set, idx, logged }) {
  const t = useTheme();
  const isL = logged != null;
  const hit = isL && logged.reps >= set.r;
  const up = isL && logged.w > set.w;

  let bc = t.borderLight, bg = "transparent", tc = t.textMuted, icon = "";
  if (isL && hit && !up) { bc = "#3DDC84"; bg = "rgba(61,220,132,0.06)"; tc = "#3DDC84"; icon = " \u2713"; }
  else if (isL && up)    { bc = "#FBBF24"; bg = "rgba(251,191,36,0.06)";  tc = "#FBBF24"; icon = " \u2191"; }
  else if (isL && !hit)  { bc = "#EF4444"; bg = "rgba(239,68,68,0.06)";   tc = "#EF4444"; icon = " \u2717"; }

  const dw = isL ? logged.w : set.w;
  const dr = isL ? logged.reps : set.r;

  return (
    <div style={{
      border: `1px solid ${bc}`, background: bg, color: tc, borderRadius: 8,
      padding: "8px 12px", fontFamily: "mono", fontSize: 12,
      minWidth: 78, textAlign: "center",
    }}>
      <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 0.5, opacity: 0.6, marginBottom: 2 }}>Set {idx + 1}</div>
      {dw > 0 ? `${dw} \u00d7 ${dr}` : `BW \u00d7 ${dr}`}{icon}
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

  const hasLogs = Object.keys(logged).length > 0;

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

      <button onClick={onBack} style={{ fontSize: 12, color: "#4C9EFF", background: "none", border: "none", cursor: "pointer", marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>&larr; Back to Week</button>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: t.text }}>{day.label}</h2>
            {pat && <PatternBadge pattern={pat} size="md" />}
          </div>
          <div style={{ fontSize: 13, color: t.textDim }}>
            {DAY_NAMES[day.date.getDay()]}, {MO_NAMES[day.date.getMonth()]} {day.date.getDate()} &middot; {day.exercises.length} exercises &middot; {totalSets} sets &middot; {getDayVol(day).toLocaleString()} lbs
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {hasLogs && (
            <button onClick={clearLogs} style={{ padding: "10px 16px", borderRadius: 12, border: `1px solid ${t.borderLight}`, background: "transparent", color: t.textDim, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Clear Logs</button>
          )}
          <button
            onClick={startSession}
            style={{
              padding: "12px 28px", borderRadius: 12, border: "none",
              background: "#4C9EFF", color: "#fff",
              fontSize: 14, fontWeight: 700, cursor: "pointer",
            }}
          >{hasLogs ? "Resume Workout" : "Start Workout"}</button>
        </div>
      </div>

      {/* Progress bar when there are logs */}
      {hasLogs && (
        <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: "12px 18px", marginBottom: 16, display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: t.textMuted, fontWeight: 500 }}>
                Session logged — {completedSets}/{totalSets} sets
              </span>
              <span style={{ fontSize: 12, fontFamily: "mono", fontWeight: 700, color: pct === 100 ? "#3DDC84" : "#4C9EFF" }}>{pct}%</span>
            </div>
            <div style={{ height: 4, borderRadius: 2, background: t.surface3, overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: 2, background: pct === 100 ? "#3DDC84" : "#4C9EFF", width: `${pct}%`, transition: "width 0.3s" }} />
            </div>
          </div>
          {actualVol > 0 && (
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontSize: 14, fontFamily: "mono", fontWeight: 700, color: t.text }}>{actualVol.toLocaleString()}</div>
              <div style={{ fontSize: 9, color: t.textFaint, fontFamily: "mono" }}>LBS VOL</div>
            </div>
          )}
        </div>
      )}

      <div>
        {day.exercises.map((entry, ei) => {
          const ex = EXERCISES[entry.exercise_id]; if (!ex) return null;
          return (
            <div key={ei} style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 14, padding: 20, marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: t.text }}>{ex.name}</div>
                  <div style={{ display: "flex", gap: 4, marginTop: 6, flexWrap: "wrap" }}>
                    {ex.muscles.filter((m) => m.role === "direct").map((m) => <span key={m.name} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 8, background: `${MUSCLE_COLORS[m.name] || "#666"}18`, color: MUSCLE_COLORS[m.name] || "#888" }}>{m.name}</span>)}
                    {ex.muscles.filter((m) => m.role !== "direct").map((m) => <span key={m.name} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 8, background: `${t.textFaint}20`, color: t.textDim }}>{m.name}</span>)}
                  </div>
                </div>
                <span style={{ fontSize: 10, fontFamily: "mono", color: t.textFaint }}>{entry.sets.length} sets</span>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {entry.sets.map((s, si) => {
                  const key = `${ei}_${si}`;
                  return <SetPill key={si} set={s} idx={si} logged={logged[key]} />;
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
