import { useState, useEffect, useRef } from "react";
import { useTheme } from "../context/theme.js";
import { EXERCISES } from "../data/exercise-data.js";
import { MUSCLE_COLORS } from "../utils/helpers.js";
import { MiniBar } from "./shared.jsx";

/* ── Helpers ──────────────────────────────────────────────────── */

function rpeColor(v) {
  if (v <= 7) return "#22C55E";
  if (v === 8) return "#F59E0B";
  if (v === 9) return "#F97316";
  return "#EF4444";
}

/* ── Inline Rest Timer (right panel) ─────────────────────────── */

function InlineRestTimer({ duration = 90, onDone }) {
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
    <div>
      <div className="h-[3px] bg-surface3 rounded-[2px] overflow-hidden mb-2.5">
        <div className="h-full transition-[width] duration-1000 linear" style={{ background: done ? "#22C55E" : "#3B82F6", width: `${pct}%` }} />
      </div>
      <div className="text-[36px] font-bold mb-2.5" style={{ color: done ? "#22C55E" : remaining <= 10 ? "#EF4444" : "var(--atlas-text)" }}>
        {mins}:{String(secs).padStart(2, "0")}
      </div>
      <div className="flex gap-1.5">
        <button onClick={onDone} className="flex-1 py-2 rounded-[8px] border border-edge-light bg-transparent text-muted text-xs font-semibold cursor-pointer">
          Skip
        </button>
        {done && (
          <button onClick={onDone} className="flex-1 py-2 rounded-[8px] border-none bg-success text-black text-xs font-bold cursor-pointer">
            Go!
          </button>
        )}
      </div>
    </div>
  );
}

/* ── GymLogModal ──────────────────────────────────────────────── */

function GymLogModal({ exercise, setData, idx, onConfirm, onCancel }) {
  const ex = EXERCISES[exercise.exercise_id];
  const [w, setW] = useState(String(setData.w));
  const [r, setR] = useState(String(setData.r));
  const [rpe, setRpe] = useState(null);

  return (
    <div className="fixed inset-0 z-[220] flex flex-col justify-end">
      <div onClick={onCancel} className="flex-1 bg-black/55" />
      <div className="bg-surface rounded-t-lg px-6 pt-5 pb-9 border-t border-edge-light shadow-[0_-12px_40px_rgba(0,0,0,0.45)]">
        <div className="w-9 h-1 rounded-[2px] bg-edge-light mx-auto mb-5" />
        <div className="text-xs text-muted mb-1">Log Set {idx + 1}</div>
        <div className="text-xl font-bold text-content mb-0.5">{ex?.name}</div>
        <div className="text-xs text-dim mb-[22px]">
          Target: {setData.w > 0 ? `${setData.w} \u00d7 ${setData.r}` : `BW \u00d7 ${setData.r}`}
        </div>

        {/* weight + reps side by side */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div>
            <label className="text-sm text-dim block mb-1.5">WEIGHT (lbs)</label>
            <input type="number" value={w} onChange={(e) => setW(e.target.value)}
              className="bg-surface2 border border-edge-light rounded-[10px] text-content text-2xl font-bold px-4 py-3.5 w-full text-center outline-none"
            />
          </div>
          <div>
            <label className="text-sm text-dim block mb-1.5">REPS</label>
            <input type="number" value={r} onChange={(e) => setR(e.target.value)}
              className="bg-surface2 border border-edge-light rounded-[10px] text-content text-2xl font-bold px-4 py-3.5 w-full text-center outline-none"
            />
          </div>
        </div>

        {/* RPE 6–10 tap row */}
        <div className="mb-6">
          <div className="text-sm text-dim mb-2">RPE (optional)</div>
          <div className="flex gap-1.5">
            {[6, 7, 8, 9, 10].map((v) => (
              <button
                key={v}
                onClick={() => setRpe(v === rpe ? null : v)}
                className="flex-1 py-[11px] px-1 rounded-[8px] text-md font-bold cursor-pointer transition-all duration-[120ms]"
                style={{
                  border: `1px solid ${rpe === v ? rpeColor(v) : "var(--atlas-border-light)"}`,
                  background: rpe === v ? `${rpeColor(v)}20` : "transparent",
                  color: rpe === v ? rpeColor(v) : "var(--atlas-text-muted)",
                }}
              >{v}</button>
            ))}
          </div>
        </div>

        <div className="flex gap-2.5">
          <button onClick={onCancel} className="flex-1 py-3.5 rounded-sm border border-edge-light bg-transparent text-muted text-md font-semibold cursor-pointer">Cancel</button>
          <button onClick={() => onConfirm(Number(w), Number(r), rpe)} className="flex-2 py-3.5 rounded-sm border-none bg-primary text-white text-md font-bold cursor-pointer">Log Set</button>
        </div>
      </div>
    </div>
  );
}

/* ── GymSetPill ───────────────────────────────────────────────── */

function GymSetPill({ set, idx, logged, onLog }) {
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
    <button
      onClick={() => !isL && onLog()}
      className="rounded-[10px] px-3.5 py-3 text-body min-w-[88px] text-center transition-all duration-[150ms] relative"
      style={{ border: `1px solid ${bc}`, background: bg, color: tc, cursor: !isL ? "pointer" : "default" }}
    >
      <div className="text-xs opacity-60 mb-1">Set {idx + 1}</div>
      <div className="font-bold">
        {dw > 0 ? `${dw} \u00d7 ${dr}` : `BW \u00d7 ${dr}`}{icon}
      </div>
      {isL && logged.rpe != null && (
        <div className="absolute -top-[7px] -right-[7px] text-[9px] font-[800] text-black rounded-[6px] px-[5px] py-[2px] leading-none"
          style={{ background: rpeColor(logged.rpe) }}
        >
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
  const [paused, setPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const effectiveStartRef = useRef(startTime ? new Date(startTime) : new Date());

  useEffect(() => {
    if (paused) return;
    const tick = () => setElapsed(Math.max(0, Math.floor((new Date() - effectiveStartRef.current) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [paused]);

  const togglePause = () => {
    if (paused) {
      effectiveStartRef.current = new Date(Date.now() - elapsed * 1000);
      setPaused(false);
    } else {
      setPaused(true);
    }
  };

  const totalSets = day.exercises.reduce((acc, e) => acc + e.sets.length, 0);
  const completedSets = Object.keys(logged).length;
  const pct = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;

  const hrs = Math.floor(elapsed / 3600);
  const mins = Math.floor((elapsed % 3600) / 60);
  const secs = elapsed % 60;
  const clockStr = hrs > 0
    ? `${hrs}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
    : `${mins}:${String(secs).padStart(2, "0")}`;

  const hitMuscles = {};
  day.exercises.forEach((entry, ei) => {
    const ex = EXERCISES[entry.exercise_id];
    if (!ex) return;
    const loggedSets = entry.sets.filter((_, si) => logged[`${ei}_${si}`] != null).length;
    if (loggedSets === 0) return;
    ex.muscles.filter((m) => m.role === "direct").forEach((m) => {
      hitMuscles[m.name] = (hitMuscles[m.name] || 0) + loggedSets * m.contribution;
    });
  });
  const hitEntries = Object.entries(hitMuscles).sort((a, b) => b[1] - a[1]);
  const maxHit = hitEntries[0]?.[1] || 1;

  const handleLog = (w, r, rpe) => {
    const key = `${modal.exIdx}_${modal.setIdx}`;
    onLog(key, { w, reps: r, rpe, completed: r >= modal.set.r, ts: new Date().toISOString() });
    setModal(null);
    setRestActive(true);
  };

  return (
    <div className="fixed inset-0 bg-canvas z-[200] flex flex-col overflow-hidden">

      {/* ── Sticky header ── */}
      <div className="bg-surface border-b border-edge-light px-5 pt-3.5 pb-2.5 shrink-0">
        <div className="flex justify-between items-center mb-2.5">
          <div>
            <div className="text-xs text-dim">{day.label}</div>
            <div className="text-body font-semibold" style={{ color: pct === 100 ? "#22C55E" : "#3B82F6" }}>
              {completedSets}/{totalSets} sets &middot; {pct}%
            </div>
          </div>
          <button onClick={onEnd} className="px-[18px] py-2 rounded-[8px] border border-edge-light bg-transparent text-muted text-body font-semibold cursor-pointer tracking-wide">
            Exit
          </button>
        </div>
        {/* progress bar */}
        <div className="h-0.5 bg-surface3 rounded-[2px] overflow-hidden">
          <div className="h-full transition-[width] duration-300" style={{ background: pct === 100 ? "#22C55E" : "#3B82F6", width: `${pct}%` }} />
        </div>
      </div>

      {/* ── Content row ── */}
      <div className="flex-1 flex overflow-hidden">

        {/* Left: scrollable exercise list */}
        <div className="flex-1 overflow-y-auto px-5 pt-4 pb-10">
          {day.exercises.map((entry, ei) => {
            const ex = EXERCISES[entry.exercise_id];
            if (!ex) return null;
            const loggedCount = entry.sets.filter((_, si) => logged[`${ei}_${si}`] != null).length;
            const allDone = loggedCount === entry.sets.length;

            return (
              <div key={ei}
                className="rounded-[14px] p-5 mb-2.5 transition-all duration-200"
                style={{
                  background: allDone ? "rgba(34,197,94,0.04)" : "var(--atlas-surface)",
                  border: `1px solid ${allDone ? "rgba(34,197,94,0.2)" : "var(--atlas-border)"}`,
                }}
              >
                <div className="flex justify-between items-start mb-3.5">
                  <div>
                    <div className="text-[17px] font-bold" style={{ color: allDone ? "#22C55E" : "var(--atlas-text)" }}>{ex.name}</div>
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                      {ex.muscles.filter((m) => m.role === "direct").map((m) => (
                        <span key={m.name} className="text-xs px-2 py-0.5 rounded-[8px]" style={{ background: `${MUSCLE_COLORS[m.name] || "#666"}18`, color: MUSCLE_COLORS[m.name] || "#888" }}>
                          {m.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-sm" style={{ color: allDone ? "#22C55E" : "var(--atlas-text-faint)" }}>
                    {loggedCount}/{entry.sets.length}
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {entry.sets.map((s, si) => {
                    const key = `${ei}_${si}`;
                    return (
                      <GymSetPill
                        key={si} set={s} idx={si} logged={logged[key]}
                        onLog={() => setModal({ exercise: entry, set: s, exIdx: ei, setIdx: si })}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: sticky dashboard panel */}
        <div className="w-[272px] shrink-0 bg-surface border-l border-edge-light p-5 flex flex-col gap-5 overflow-y-auto">

          {/* Session clock */}
          <div>
            <div className="text-xs text-muted mb-2">Session Time</div>
            <div className="text-[38px] font-bold mb-2.5 tracking-tight" style={{ color: paused ? "var(--atlas-text-muted)" : "var(--atlas-text)" }}>
              {clockStr}
            </div>
            <button onClick={togglePause} className="w-full py-2 rounded-[8px] border border-edge-light bg-transparent text-muted text-xs font-semibold cursor-pointer">
              {paused ? "\u25B6 Resume" : "\u23F8 Pause"}
            </button>
          </div>

          {/* Muscles hit */}
          {hitEntries.length > 0 && (
            <div>
              <div className="text-xs text-muted mb-2.5">Muscles Hit</div>
              {hitEntries.map(([m, v]) => (
                <MiniBar key={m} name={m} sets={parseFloat(v.toFixed(1))} max={maxHit} />
              ))}
            </div>
          )}

          {/* Rest timer */}
          {restActive && (
            <div>
              <div className="text-xs text-muted mb-2">Rest Timer</div>
              <InlineRestTimer onDone={() => setRestActive(false)} />
            </div>
          )}

          {/* End session */}
          <div className="mt-auto">
            <button onClick={onEnd} className="w-full py-3 rounded-[10px] border border-error/30 bg-error/[0.06] text-error text-body font-bold cursor-pointer">
              End Session
            </button>
          </div>
        </div>

      </div>

      {modal && (
        <GymLogModal
          exercise={modal.exercise} setData={modal.set} idx={modal.setIdx}
          onConfirm={handleLog} onCancel={() => setModal(null)}
        />
      )}
    </div>
  );
}
