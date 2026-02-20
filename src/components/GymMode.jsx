import { useState, useEffect } from "react";
import { useTheme } from "../context/theme.js";
import { EXERCISES } from "../data/exercise-data.js";
import { MUSCLE_COLORS } from "../utils/helpers.js";

/* ── Helpers ──────────────────────────────────────────────────── */

function rpeColor(v) {
  if (v <= 7) return "#3DDC84";
  if (v === 8) return "#FBBF24";
  if (v === 9) return "#F97316";
  return "#EF4444";
}

/* ── RestTimer ────────────────────────────────────────────────── */

function RestTimer({ duration = 90, onDone }) {
  const t = useTheme();
  const [remaining, setRemaining] = useState(duration);

  useEffect(() => {
    if (remaining <= 0) return;
    const id = setInterval(() => setRemaining((r) => r - 1), 1000);
    return () => clearInterval(id);
  }, [remaining]);

  const pct = (remaining / duration) * 100;
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const done = remaining <= 0;

  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 210 }}>
      {/* progress bar */}
      <div style={{ height: 3, background: "rgba(76,158,255,0.15)" }}>
        <div style={{ height: "100%", background: done ? "#3DDC84" : "#4C9EFF", width: `${pct}%`, transition: "width 1s linear" }} />
      </div>
      <div style={{
        background: t.surface,
        borderTop: `1px solid ${t.borderLight}`,
        padding: "12px 24px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div>
          <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1.5, color: t.textDim, fontFamily: "mono", marginBottom: 2 }}>Rest Timer</div>
          <div style={{ fontSize: 34, fontFamily: "mono", fontWeight: 700, color: done ? "#3DDC84" : remaining <= 10 ? "#EF4444" : t.text }}>
            {mins}:{String(secs).padStart(2, "0")}
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button onClick={onDone} style={{ padding: "10px 22px", borderRadius: 10, border: `1px solid ${t.borderLight}`, background: "transparent", color: t.textMuted, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            Skip
          </button>
          {done && (
            <button onClick={onDone} style={{ padding: "10px 26px", borderRadius: 10, border: "none", background: "#3DDC84", color: "#000", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              Go!
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── GymLogModal ──────────────────────────────────────────────── */

function GymLogModal({ exercise, setData, idx, onConfirm, onCancel }) {
  const t = useTheme();
  const ex = EXERCISES[exercise.exercise_id];
  const [w, setW] = useState(String(setData.w));
  const [r, setR] = useState(String(setData.r));
  const [rpe, setRpe] = useState(null);

  const iStyle = {
    background: t.surface2,
    border: `1px solid ${t.borderLight}`,
    borderRadius: 10,
    color: t.text,
    fontSize: 28,
    fontFamily: "mono",
    fontWeight: 700,
    padding: "14px 16px",
    width: "100%",
    textAlign: "center",
    outline: "none",
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 220, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      {/* tap backdrop to cancel */}
      <div onClick={onCancel} style={{ flex: 1, background: "rgba(0,0,0,0.55)" }} />

      <div style={{
        background: t.surface,
        borderRadius: "20px 20px 0 0",
        padding: "20px 24px 36px",
        borderTop: `1px solid ${t.borderLight}`,
        boxShadow: "0 -12px 40px rgba(0,0,0,0.45)",
      }}>
        {/* drag handle */}
        <div style={{ width: 36, height: 4, borderRadius: 2, background: t.borderLight, margin: "0 auto 20px" }} />

        <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 2, color: t.textDim, fontFamily: "mono", marginBottom: 4 }}>Log Set {idx + 1}</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: t.text, marginBottom: 2 }}>{ex?.name}</div>
        <div style={{ fontSize: 12, color: t.textDim, marginBottom: 22, fontFamily: "mono" }}>
          Target: {setData.w > 0 ? `${setData.w} \u00d7 ${setData.r}` : `BW \u00d7 ${setData.r}`}
        </div>

        {/* weight + reps side by side */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
          <div>
            <label style={{ fontSize: 11, color: t.textDim, fontFamily: "mono", display: "block", marginBottom: 6 }}>WEIGHT (lbs)</label>
            <input type="number" value={w} onChange={(e) => setW(e.target.value)} style={iStyle} />
          </div>
          <div>
            <label style={{ fontSize: 11, color: t.textDim, fontFamily: "mono", display: "block", marginBottom: 6 }}>REPS</label>
            <input type="number" value={r} onChange={(e) => setR(e.target.value)} style={iStyle} />
          </div>
        </div>

        {/* RPE 6–10 tap row */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, color: t.textDim, fontFamily: "mono", marginBottom: 8 }}>RPE (optional)</div>
          <div style={{ display: "flex", gap: 6 }}>
            {[6, 7, 8, 9, 10].map((v) => (
              <button
                key={v}
                onClick={() => setRpe(v === rpe ? null : v)}
                style={{
                  flex: 1,
                  padding: "11px 4px",
                  borderRadius: 8,
                  border: `1px solid ${rpe === v ? rpeColor(v) : t.borderLight}`,
                  background: rpe === v ? `${rpeColor(v)}20` : "transparent",
                  color: rpe === v ? rpeColor(v) : t.textMuted,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "mono",
                  transition: "all 0.12s",
                }}
              >{v}</button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: 14, borderRadius: 12, border: `1px solid ${t.borderLight}`, background: "transparent", color: t.textMuted, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
          <button onClick={() => onConfirm(Number(w), Number(r), rpe)} style={{ flex: 2, padding: 14, borderRadius: 12, border: "none", background: "#4C9EFF", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Log Set</button>
        </div>
      </div>
    </div>
  );
}

/* ── GymSetPill ───────────────────────────────────────────────── */

function GymSetPill({ set, idx, logged, onLog }) {
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
    <button
      onClick={() => !isL && onLog()}
      style={{
        border: `1px solid ${bc}`,
        background: bg,
        color: tc,
        borderRadius: 10,
        padding: "12px 14px",
        fontFamily: "mono",
        fontSize: 13,
        cursor: !isL ? "pointer" : "default",
        minWidth: 88,
        textAlign: "center",
        transition: "all 0.15s",
        position: "relative",
      }}
    >
      <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 0.5, opacity: 0.6, marginBottom: 4 }}>Set {idx + 1}</div>
      <div style={{ fontWeight: 700 }}>
        {dw > 0 ? `${dw} \u00d7 ${dr}` : `BW \u00d7 ${dr}`}{icon}
      </div>
      {isL && logged.rpe != null && (
        <div style={{
          position: "absolute",
          top: -7,
          right: -7,
          fontSize: 9,
          fontWeight: 800,
          fontFamily: "mono",
          background: rpeColor(logged.rpe),
          color: "#000",
          borderRadius: 6,
          padding: "2px 5px",
          lineHeight: 1,
        }}>
          {logged.rpe}
        </div>
      )}
    </button>
  );
}

/* ── GymMode ──────────────────────────────────────────────────── */

export default function GymMode({ day, logged, onLog, onEnd, startTime }) {
  const t = useTheme();
  const [modal, setModal] = useState(null);
  const [restActive, setRestActive] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  // Live session clock
  useEffect(() => {
    const start = startTime ? new Date(startTime) : new Date();
    const tick = () => setElapsed(Math.max(0, Math.floor((new Date() - start) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startTime]);

  const totalSets = day.exercises.reduce((acc, e) => acc + e.sets.length, 0);
  const completedSets = Object.keys(logged).length;
  const pct = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;

  const hrs = Math.floor(elapsed / 3600);
  const mins = Math.floor((elapsed % 3600) / 60);
  const secs = elapsed % 60;
  const clockStr = hrs > 0
    ? `${hrs}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
    : `${mins}:${String(secs).padStart(2, "0")}`;

  const handleLog = (w, r, rpe) => {
    const key = `${modal.exIdx}_${modal.setIdx}`;
    onLog(key, { w, reps: r, rpe, completed: r >= modal.set.r, ts: new Date().toISOString() });
    setModal(null);
    setRestActive(true);
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: t.bg,
      zIndex: 200,
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    }}>
      {/* ── Sticky top bar ── */}
      <div style={{
        background: t.surface,
        borderBottom: `1px solid ${t.borderLight}`,
        padding: "16px 20px 10px",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          {/* clock */}
          <div style={{ fontFamily: "mono", fontSize: 22, fontWeight: 700, color: t.text, letterSpacing: -0.5 }}>
            {clockStr}
          </div>
          {/* sets + pct */}
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 13, fontFamily: "mono", fontWeight: 700, color: pct === 100 ? "#3DDC84" : "#4C9EFF" }}>
              {completedSets}/{totalSets} sets
            </div>
            <div style={{ fontSize: 10, color: t.textDim, fontFamily: "mono" }}>{pct}% complete</div>
          </div>
          {/* close */}
          <button
            onClick={onEnd}
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              border: `1px solid ${t.borderLight}`,
              background: "transparent",
              color: t.textMuted,
              fontSize: 16,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >\u2715</button>
        </div>
        {/* thin progress bar */}
        <div style={{ height: 2, background: t.surface3, borderRadius: 2, overflow: "hidden" }}>
          <div style={{
            height: "100%",
            background: pct === 100 ? "#3DDC84" : "#4C9EFF",
            width: `${pct}%`,
            transition: "width 0.3s",
          }} />
        </div>
      </div>

      {/* ── Scrollable exercise list ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", paddingBottom: restActive ? 116 : 48 }}>
        {day.exercises.map((entry, ei) => {
          const ex = EXERCISES[entry.exercise_id];
          if (!ex) return null;
          const loggedCount = entry.sets.filter((_, si) => logged[`${ei}_${si}`] != null).length;
          const allDone = loggedCount === entry.sets.length;

          return (
            <div key={ei} style={{
              background: allDone ? "rgba(61,220,132,0.04)" : t.surface,
              border: `1px solid ${allDone ? "rgba(61,220,132,0.2)" : t.border}`,
              borderRadius: 14,
              padding: 20,
              marginBottom: 10,
              transition: "all 0.2s",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: allDone ? "#3DDC84" : t.text }}>
                    {ex.name}
                  </div>
                  <div style={{ display: "flex", gap: 4, marginTop: 6, flexWrap: "wrap" }}>
                    {ex.muscles.filter((m) => m.role === "direct").map((m) => (
                      <span key={m.name} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 8, background: `${MUSCLE_COLORS[m.name] || "#666"}18`, color: MUSCLE_COLORS[m.name] || "#888" }}>
                        {m.name}
                      </span>
                    ))}
                  </div>
                </div>
                <div style={{ fontSize: 11, fontFamily: "mono", color: allDone ? "#3DDC84" : t.textFaint }}>
                  {loggedCount}/{entry.sets.length}
                </div>
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {entry.sets.map((s, si) => {
                  const key = `${ei}_${si}`;
                  return (
                    <GymSetPill
                      key={si}
                      set={s}
                      idx={si}
                      logged={logged[key]}
                      onLog={() => setModal({ exercise: entry, set: s, exIdx: ei, setIdx: si })}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {modal && (
        <GymLogModal
          exercise={modal.exercise}
          setData={modal.set}
          idx={modal.setIdx}
          onConfirm={handleLog}
          onCancel={() => setModal(null)}
        />
      )}

      {restActive && <RestTimer onDone={() => setRestActive(false)} />}
    </div>
  );
}
