import { useState, useEffect } from "react";
import { useTheme } from "../context/theme.js";
import { EXERCISES } from "../data/exercise-data.js";
import { PATTERN_COLORS, MUSCLE_COLORS, getDayPattern, getDaySets, getDayVol, DAY_NAMES, MO_NAMES } from "../utils/helpers.js";
import { loadWorkoutLogs, saveWorkoutLogs, getWorkoutLogKey, migrateLegacyWorkoutLog, loadSessionMeta, saveSessionMeta } from "../utils/storage.js";
import { PatternBadge, CARD_CLASS } from "./shared.jsx";
import GymMode from "./GymMode.jsx";

function SetPill({ set, idx, logged }) {
  const isL = logged != null;
  const hit = isL && logged.reps >= set.r;
  const up = isL && logged.w > set.w;

  let bc = "var(--atlas-border-light)", bg = "transparent", tc = "var(--atlas-text-muted)", icon = "";
  if (isL && hit && !up) { bc = "#22C55E"; bg = "rgba(34,197,94,0.06)"; tc = "#22C55E"; icon = " \u2713"; }
  else if (isL && up)    { bc = "#F59E0B"; bg = "rgba(245,158,11,0.06)";  tc = "#F59E0B"; icon = " \u2191"; }
  else if (isL && !hit)  { bc = "#EF4444"; bg = "rgba(239,68,68,0.06)";   tc = "#EF4444"; icon = " \u2717"; }

  const dw = isL ? logged.w : set.w;
  const dr = isL ? logged.reps : set.r;

  return (
    <div className="rounded-[14px] px-3 py-2 text-xs min-w-[78px] text-center" style={{ border: `1px solid ${bc}`, background: bg, color: tc }}>
      <div className="text-xs opacity-60 mb-0.5">Set {idx + 1}</div>
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

  const handleLog = (key, data) => {
    setLogged((prev) => ({ ...prev, [key]: data }));
  };

  return (
    <div>
      {sessionActive && (
        <GymMode day={day} logged={logged} onLog={handleLog} onEnd={endSession} startTime={sessionMeta?.startTime} />
      )}

      <button onClick={onBack} className="text-xs text-primary bg-none border-none cursor-pointer mb-4 flex items-center gap-1.5">&larr; Back to Week</button>
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-xl font-[800] text-content">{day.label}</h2>
            {pat && <PatternBadge pattern={pat} size="md" />}
          </div>
          <div className="text-body text-dim">
            {DAY_NAMES[day.date.getDay()]}, {MO_NAMES[day.date.getMonth()]} {day.date.getDate()} &middot; {day.exercises.length} exercises &middot; {totalSets} sets &middot; {getDayVol(day).toLocaleString()} lbs
          </div>
        </div>
        <div className="flex gap-2 items-center">
          {hasLogs && (
            <button onClick={clearLogs} className="px-4 py-2.5 rounded-[14px] border border-edge-light bg-transparent text-dim text-xs font-semibold cursor-pointer">Clear Logs</button>
          )}
          <button onClick={startSession} className="px-7 py-3 rounded-[14px] border-none bg-primary text-white text-md font-bold cursor-pointer">
            {hasLogs ? "Resume Workout" : "Start Workout"}
          </button>
        </div>
      </div>

      {/* Progress bar when there are logs */}
      {hasLogs && (
        <div className={`${CARD_CLASS} px-[18px] py-3 mb-4 flex items-center gap-3.5`}>
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-muted font-medium">
                Session logged — {completedSets}/{totalSets} sets
              </span>
              <span className="text-xs font-bold" style={{ color: pct === 100 ? "#22C55E" : "#3B82F6" }}>{pct}%</span>
            </div>
            <div className="h-1 rounded-[2px] bg-surface3 overflow-hidden">
              <div className="h-full rounded-[2px] transition-[width] duration-300" style={{ background: pct === 100 ? "#22C55E" : "#3B82F6", width: `${pct}%` }} />
            </div>
          </div>
          {actualVol > 0 && (
            <div className="text-right shrink-0">
              <div className="text-md font-bold text-content">{actualVol.toLocaleString()}</div>
              <div className="text-[9px] text-faint">LBS VOL</div>
            </div>
          )}
        </div>
      )}

      <div>
        {day.exercises.map((entry, ei) => {
          const ex = EXERCISES[entry.exercise_id]; if (!ex) return null;
          return (
            <div key={ei} className={`${CARD_CLASS} p-6 mb-2.5`}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="text-lg font-bold text-content">{ex.name}</div>
                  <div className="flex gap-1 mt-1.5 flex-wrap">
                    {ex.muscles.filter((m) => m.role === "direct").map((m) => <span key={m.name} className="text-xs px-2 py-0.5 rounded-[8px]" style={{ background: `${MUSCLE_COLORS[m.name] || "#666"}18`, color: MUSCLE_COLORS[m.name] || "#888" }}>{m.name}</span>)}
                    {ex.muscles.filter((m) => m.role !== "direct").map((m) => <span key={m.name} className="text-xs px-2 py-0.5 rounded-[8px] bg-faint/20 text-dim">{m.name}</span>)}
                  </div>
                </div>
                <span className="text-xs text-faint">{entry.sets.length} sets</span>
              </div>
              <div className="flex gap-1.5 flex-wrap">
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
