import { useState, useEffect } from "react";
import { useTheme } from "../context/theme.js";
import { EXERCISES } from "../data/exercise-data.js";
import { PATTERN_COLORS, MUSCLE_COLORS } from "../utils/helpers.js";
import { PatternBadge } from "./shared.jsx";

// ── Constants ────────────────────────────────────────────────────
const REST_DURATION = 90; // seconds

const RPE_LABELS = {
  6: "Easy — 4+ reps left",
  7: "Moderate — 3 reps left",
  8: "Hard — 2 reps left",
  9: "Very hard — 1 rep left",
  10: "Max effort",
};

// ── Session clock ────────────────────────────────────────────────
function useSessionClock(startTime) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startTime) return;
    const update = () => {
      setElapsed(Math.floor((Date.now() - new Date(startTime).getTime()) / 1000));
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [startTime]);

  const m = Math.floor(elapsed / 60);
  const s = elapsed % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

// ── Rest timer banner ────────────────────────────────────────────
function RestTimer({ onDismiss }) {
  const t = useTheme();
  const [remaining, setRemaining] = useState(REST_DURATION);
  const done = remaining <= 0;

  useEffect(() => {
    if (done) return;
    const id = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(id);
  }, [remaining, done]);

  const pct = ((REST_DURATION - Math.max(remaining, 0)) / REST_DURATION) * 100;
  const m = Math.floor(Math.max(remaining, 0) / 60);
  const s = Math.max(remaining, 0) % 60;

  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 200,
      background: t.surface, borderTop: `1px solid ${t.border}`,
      padding: "14px 20px 28px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: t.textDim, fontFamily: "mono", textTransform: "uppercase", letterSpacing: 1 }}>
              {done ? "Rest complete" : "Rest timer"}
            </span>
            <span style={{
              fontSize: 18, fontFamily: "mono", fontWeight: 700,
              color: done ? "#3DDC84" : t.text,
            }}>
              {done ? "Ready!" : `${m}:${String(s).padStart(2, "0")}`}
            </span>
          </div>
          <div style={{ height: 6, background: t.border, borderRadius: 3, overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 3,
              background: done ? "#3DDC84" : "#4C9EFF",
              width: `${pct}%`, transition: "width 1s linear",
            }} />
          </div>
        </div>
        <button onClick={onDismiss} style={{
          padding: "10px 18px", borderRadius: 10,
          border: `1px solid ${done ? "#3DDC84" : t.borderLight}`,
          background: done ? "rgba(61,220,132,0.12)" : "transparent",
          color: done ? "#3DDC84" : t.textDim,
          fontSize: 13, fontWeight: 700, cursor: "pointer", flexShrink: 0,
        }}>{done ? "Go!" : "Skip"}</button>
      </div>
    </div>
  );
}

// ── Log modal (bottom sheet) ─────────────────────────────────────
function GymLogModal({ exercise, setData, idx, onConfirm, onCancel }) {
  const t = useTheme();
  const ex = EXERCISES[exercise.exercise_id];
  const [w, setW] = useState(String(setData.w));
  const [r, setR] = useState(String(setData.r));
  const [rpe, setRpe] = useState(null);

  const iStyle = {
    background: t.surface2, border: `1px solid ${t.borderLight}`,
    borderRadius: 12, color: t.text, fontSize: 28, fontFamily: "mono",
    fontWeight: 700, padding: "14px", width: "100%", textAlign: "center", outline: "none",
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, background: t.modalOverlay,
        display: "flex", alignItems: "flex-end", justifyContent: "center",
        zIndex: 300, backdropFilter: "blur(6px)",
      }}
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: t.surface, borderRadius: "24px 24px 0 0",
          padding: "20px 24px 40px", width: "100%", maxWidth: 500,
          border: `1px solid ${t.borderLight}`,
        }}
      >
        {/* drag handle */}
        <div style={{ width: 40, height: 4, borderRadius: 2, background: t.borderLight, margin: "0 auto 20px" }} />

        <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 2, color: t.textDim, fontFamily: "mono", marginBottom: 4 }}>
          Set {idx + 1}
        </div>
        <div style={{ fontSize: 20, fontWeight: 800, color: t.text, marginBottom: 2 }}>{ex?.name}</div>
        <div style={{ fontSize: 12, color: t.textDim, marginBottom: 20, fontFamily: "mono" }}>
          Target: {setData.w > 0 ? `${setData.w} × ${setData.r}` : `BW × ${setData.r}`}
        </div>

        {/* Weight + reps side by side */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
          <div>
            <label style={{ fontSize: 11, color: t.textDim, fontFamily: "mono", display: "block", marginBottom: 6 }}>
              WEIGHT (lbs)
            </label>
            <input type="number" value={w} onChange={(e) => setW(e.target.value)} style={iStyle} />
          </div>
          <div>
            <label style={{ fontSize: 11, color: t.textDim, fontFamily: "mono", display: "block", marginBottom: 6 }}>
              REPS
            </label>
            <input type="number" value={r} onChange={(e) => setR(e.target.value)} style={iStyle} />
          </div>
        </div>

        {/* RPE selector */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 11, color: t.textDim, fontFamily: "mono", display: "block", marginBottom: 8 }}>
            RPE — optional
          </label>
          <div style={{ display: "flex", gap: 6 }}>
            {[6, 7, 8, 9, 10].map((v) => (
              <button
                key={v}
                onClick={() => setRpe(rpe === v ? null : v)}
                style={{
                  flex: 1, padding: "10px 0", borderRadius: 10,
                  border: `1px solid ${rpe === v ? "#4C9EFF" : t.borderLight}`,
                  background: rpe === v ? "rgba(76,158,255,0.12)" : "transparent",
                  color: rpe === v ? "#4C9EFF" : t.textMuted,
                  fontSize: 15, fontWeight: 700, cursor: "pointer",
                }}
              >
                {v}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 10, color: t.textFaint, textAlign: "center", marginTop: 6 }}>
            {rpe ? RPE_LABELS[rpe] : "Rate how hard the set felt"}
          </div>
        </div>

        <button
          onClick={() => onConfirm(Number(w), Number(r), rpe)}
          style={{
            width: "100%", padding: 18, borderRadius: 14, border: "none",
            background: "#4C9EFF", color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer",
          }}
        >
          Log Set
        </button>
      </div>
    </div>
  );
}

// ── Large set pill for gym mode ──────────────────────────────────
function GymSetPill({ set, idx, logged, onLog }) {
  const t = useTheme();
  const isL = logged != null;
  const hit = isL && logged.reps >= set.r;
  const up = isL && logged.w > set.w;

  let bc = t.borderLight, bg = t.surface2, tc = t.textMuted, icon = null;
  if (isL && hit && !up) { bc = "#3DDC84"; bg = "rgba(61,220,132,0.08)"; tc = "#3DDC84"; icon = "✓"; }
  else if (isL && up)    { bc = "#FBBF24"; bg = "rgba(251,191,36,0.08)";  tc = "#FBBF24"; icon = "↑"; }
  else if (isL && !hit)  { bc = "#EF4444"; bg = "rgba(239,68,68,0.08)";   tc = "#EF4444"; icon = "✗"; }

  const dw = isL ? logged.w : set.w;
  const dr = isL ? logged.reps : set.r;

  return (
    <button
      onClick={() => !isL && onLog()}
      style={{
        border: `1px solid ${bc}`, background: bg, color: tc,
        borderRadius: 12, padding: "14px 16px",
        fontFamily: "mono", fontSize: 14, fontWeight: 700,
        cursor: isL ? "default" : "pointer",
        minWidth: 96, textAlign: "center",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
        transition: "all 0.15s",
      }}
    >
      <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5, opacity: 0.6 }}>
        Set {idx + 1}
      </div>
      <div>{dw > 0 ? `${dw} × ${dr}` : `BW × ${dr}`}</div>
      {icon && <div style={{ fontSize: 13 }}>{icon}</div>}
      {logged?.rpe != null && (
        <div style={{ fontSize: 9, opacity: 0.7 }}>RPE {logged.rpe}</div>
      )}
    </button>
  );
}

// ── Main GymMode component ───────────────────────────────────────
export default function GymMode({ day, logged, onLog, onEnd, startTime }) {
  const t = useTheme();
  const clock = useSessionClock(startTime);
  const [modal, setModal] = useState(null);
  const [restActive, setRestActive] = useState(false);

  const totalSets = day.exercises.reduce((n, e) => n + (e.sets?.length || 0), 0);
  const completedSets = Object.keys(logged).length;
  const pct = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;

  const handleConfirm = (w, r, rpe) => {
    onLog(modal.exIdx, modal.setIdx, w, r, rpe);
    setModal(null);
    setRestActive(true);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 150,
      background: t.bg, overflowY: "auto",
      paddingBottom: restActive ? 100 : 24,
    }}>
      {/* ── Top bar ── */}
      <div style={{
        position: "sticky", top: 0, zIndex: 10,
        background: t.bg, borderBottom: `1px solid ${t.border}`,
        padding: "14px 20px", display: "flex", alignItems: "center", gap: 16,
      }}>
        <button
          onClick={onEnd}
          style={{
            padding: "8px 14px", borderRadius: 10, border: `1px solid ${t.borderLight}`,
            background: "transparent", color: t.textMuted, fontSize: 12, fontWeight: 600, cursor: "pointer",
          }}
        >
          End Session
        </button>
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontSize: 11, fontFamily: "mono", color: t.textFaint, marginBottom: 2 }}>
            {day.label}
          </div>
          <div style={{ fontSize: 18, fontFamily: "mono", fontWeight: 700, color: t.text }}>
            {clock}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, fontFamily: "mono", color: t.textFaint }}>
            {completedSets}/{totalSets} sets
          </div>
          <div style={{
            fontSize: 14, fontFamily: "mono", fontWeight: 700,
            color: pct === 100 ? "#3DDC84" : "#4C9EFF",
          }}>
            {pct}%
          </div>
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div style={{ height: 3, background: t.border }}>
        <div style={{
          height: "100%", background: pct === 100 ? "#3DDC84" : "#4C9EFF",
          width: `${pct}%`, transition: "width 0.3s",
        }} />
      </div>

      {/* ── Exercise list ── */}
      <div style={{ padding: "20px 20px 0" }}>
        {day.exercises.map((entry, ei) => {
          const ex = EXERCISES[entry.exercise_id];
          if (!ex) return null;
          const pc = PATTERN_COLORS[ex.pattern];
          const doneSets = entry.sets.filter((_, si) => logged[`${ei}_${si}`]).length;
          const allDone = doneSets === entry.sets.length;

          return (
            <div
              key={ei}
              style={{
                background: t.surface,
                border: `1px solid ${allDone ? "rgba(61,220,132,0.3)" : t.border}`,
                borderRadius: 16, padding: 20, marginBottom: 12,
                opacity: allDone ? 0.75 : 1, transition: "opacity 0.2s",
              }}
            >
              {/* Exercise header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    {allDone && <span style={{ fontSize: 14, color: "#3DDC84" }}>✓</span>}
                    <div style={{ fontSize: 17, fontWeight: 700, color: t.text }}>{ex.name}</div>
                  </div>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {ex.muscles.filter((m) => m.role === "direct").map((m) => (
                      <span key={m.name} style={{
                        fontSize: 10, padding: "2px 8px", borderRadius: 8,
                        background: `${MUSCLE_COLORS[m.name] || "#666"}18`,
                        color: MUSCLE_COLORS[m.name] || "#888",
                      }}>{m.name}</span>
                    ))}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  <span style={{ fontSize: 10, fontFamily: "mono", color: t.textFaint }}>
                    {doneSets}/{entry.sets.length}
                  </span>
                  {pc && <PatternBadge pattern={ex.pattern} />}
                </div>
              </div>

              {/* Set pills */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {entry.sets.map((s, si) => (
                  <GymSetPill
                    key={si}
                    set={s}
                    idx={si}
                    logged={logged[`${ei}_${si}`]}
                    onLog={() => setModal({ exercise: entry, set: s, exIdx: ei, setIdx: si })}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Log modal ── */}
      {modal && (
        <GymLogModal
          exercise={modal.exercise}
          setData={modal.set}
          idx={modal.setIdx}
          onConfirm={handleConfirm}
          onCancel={() => setModal(null)}
        />
      )}

      {/* ── Rest timer ── */}
      {restActive && <RestTimer onDismiss={() => setRestActive(false)} />}
    </div>
  );
}
