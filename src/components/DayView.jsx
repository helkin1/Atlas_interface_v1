import { useState } from "react";
import { useTheme } from "../context/theme.js";
import { EXERCISES } from "../data/exercise-data.js";
import { PATTERN_COLORS, MUSCLE_COLORS, getDayPattern, getDaySets, getDayVol, DAY_NAMES, MO_NAMES } from "../utils/helpers.js";
import { PatternBadge } from "./shared.jsx";

function SetPill({ set, idx, logged, onLog, active }) {
  const t = useTheme();
  const isL = logged != null;
  const hit = isL && logged.reps >= set.r;
  const up = isL && logged.w > set.w;

  let bc = t.borderLight, bg = "transparent", tc = t.textMuted, icon = "";
  if (isL && hit && !up) { bc = "#3DDC84"; bg = "rgba(61,220,132,0.06)"; tc = "#3DDC84"; icon = " \u2713"; }
  else if (isL && up) { bc = "#FBBF24"; bg = "rgba(251,191,36,0.06)"; tc = "#FBBF24"; icon = " \u2191"; }
  else if (isL && !hit) { bc = "#EF4444"; bg = "rgba(239,68,68,0.06)"; tc = "#EF4444"; icon = " \u2717"; }

  const dw = isL ? logged.w : set.w;
  const dr = isL ? logged.reps : set.r;

  return (
    <button onClick={() => active && !isL && onLog()} style={{
      border: `1px solid ${bc}`, background: bg, color: tc, borderRadius: 8,
      padding: "8px 12px", fontFamily: "mono", fontSize: 12,
      cursor: active && !isL ? "pointer" : "default", minWidth: 78, textAlign: "center", transition: "all 0.15s",
    }}>
      <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 0.5, opacity: 0.6, marginBottom: 2 }}>Set {idx + 1}</div>
      {dw > 0 ? `${dw} \u00d7 ${dr}` : `BW \u00d7 ${dr}`}{icon}
    </button>
  );
}

function LogModal({ exercise, setData, idx, onConfirm, onCancel }) {
  const t = useTheme();
  const ex = EXERCISES[exercise.exercise_id];
  const [w, setW] = useState(String(setData.w));
  const [r, setR] = useState(String(setData.r));
  const iStyle = { background: t.surface2, border: `1px solid ${t.borderLight}`, borderRadius: 10, color: t.text, fontSize: 24, fontFamily: "mono", fontWeight: 700, padding: "14px 16px", width: "100%", textAlign: "center", outline: "none" };

  return (
    <div style={{ position: "fixed", inset: 0, background: t.modalOverlay, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, backdropFilter: "blur(4px)" }} onClick={onCancel}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: t.surface, border: `1px solid ${t.borderLight}`, borderRadius: 20, padding: 32, width: 340, maxWidth: "90vw" }}>
        <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 2, color: t.textDim, fontFamily: "mono", marginBottom: 4 }}>Log Set {idx + 1}</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: t.text, marginBottom: 4 }}>{ex.name}</div>
        <div style={{ fontSize: 12, color: t.textDim, marginBottom: 24, fontFamily: "mono" }}>Target: {setData.w > 0 ? `${setData.w} \u00d7 ${setData.r}` : `BW \u00d7 ${setData.r}`}</div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 11, color: t.textDim, fontFamily: "mono", display: "block", marginBottom: 6 }}>WEIGHT (lbs)</label>
          <input type="number" value={w} onChange={(e) => setW(e.target.value)} style={iStyle} />
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 11, color: t.textDim, fontFamily: "mono", display: "block", marginBottom: 6 }}>REPS</label>
          <input type="number" value={r} onChange={(e) => setR(e.target.value)} style={iStyle} />
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: 14, borderRadius: 12, border: `1px solid ${t.borderLight}`, background: "transparent", color: t.textMuted, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
          <button onClick={() => onConfirm(Number(w), Number(r))} style={{ flex: 2, padding: 14, borderRadius: 12, border: "none", background: "#4C9EFF", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Log Set</button>
        </div>
      </div>
    </div>
  );
}

export default function DayView({ day, onBack }) {
  const t = useTheme();
  const [sessionActive, setSessionActive] = useState(false);
  const [logged, setLogged] = useState({});
  const [modal, setModal] = useState(null);

  const pat = getDayPattern(day);

  const totalSets = getDaySets(day);
  const completedSets = Object.keys(logged).length;
  const pct = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;
  let actualVol = 0;
  Object.values(logged).forEach((l) => { actualVol += l.w * l.reps; });

  const startSession = () => { setSessionActive(true); setLogged({}); };
  const endSession = () => { setSessionActive(false); };

  const confirmLog = (w, r) => {
    const key = `${modal.exIdx}_${modal.setIdx}`;
    setLogged((p) => ({ ...p, [key]: { w, reps: r, completed: r >= modal.set.r } }));
    setModal(null);
  };

  return (
    <div>
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
        <button onClick={sessionActive ? endSession : startSession} style={{
          padding: "12px 28px", borderRadius: 12, border: "none",
          background: sessionActive ? t.surface2 : "#4C9EFF",
          color: sessionActive ? t.textMuted : "#fff",
          fontSize: 14, fontWeight: 700, cursor: "pointer",
        }}>{sessionActive ? "End Session" : "Start Workout"}</button>
      </div>

      {sessionActive && (
        <div style={{ background: "rgba(76,158,255,0.06)", border: "1px solid rgba(76,158,255,0.2)", borderRadius: 12, padding: "12px 18px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4C9EFF", animation: "pulse 2s infinite" }} />
          <span style={{ fontSize: 13, color: "#4C9EFF", fontWeight: 500 }}>Session active — tap sets to log</span>
        </div>
      )}

      <div>
        <div>
          {day.exercises.map((entry, ei) => {
            const ex = EXERCISES[entry.exercise_id]; if (!ex) return null;
            const pc = PATTERN_COLORS[ex.pattern];
            return (
              <div key={ei} style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 14, padding: 20, marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: t.text }}>{ex.name}</div>
                    <div style={{ display: "flex", gap: 4, marginTop: 6, flexWrap: "wrap" }}>
                      {ex.muscles.filter(m => m.role === "direct").map((m) => <span key={m.name} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 8, background: `${MUSCLE_COLORS[m.name] || '#666'}18`, color: MUSCLE_COLORS[m.name] || '#888' }}>{m.name}</span>)}
                      {ex.muscles.filter(m => m.role !== "direct").map((m) => <span key={m.name} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 8, background: `${t.textFaint}20`, color: t.textDim }}>{m.name}</span>)}
                    </div>
                  </div>
                  <span style={{ fontSize: 10, fontFamily: "mono", color: t.textFaint }}>{entry.sets.length} sets</span>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {entry.sets.map((s, si) => {
                    const key = `${ei}_${si}`;
                    return <SetPill key={si} set={s} idx={si} logged={logged[key]} active={sessionActive} onLog={() => setModal({ exercise: entry, set: s, exIdx: ei, setIdx: si })} />;
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {modal && <LogModal exercise={modal.exercise} setData={modal.set} idx={modal.setIdx} onConfirm={confirmLog} onCancel={() => setModal(null)} />}
    </div>
  );
}
