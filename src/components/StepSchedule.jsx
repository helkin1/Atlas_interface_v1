import { useState } from "react";
import { useTheme } from "../context/theme.js";
import { DAY_NAMES } from "../utils/helpers.js";
import { redistributeTrainingDays } from "../utils/plan-engine.js";

export default function StepSchedule({ plan, onChange }) {
  const t = useTheme();
  const wt = plan.weekTemplate || [];
  const [dragIdx, setDragIdx] = useState(null);

  const swapDays = (from, to) => {
    if (from === to) return;
    const u = [...wt];
    const tmp = u[from]; u[from] = u[to]; u[to] = tmp;
    const updated = { ...plan, weekTemplate: u };
    onChange({ ...updated, weekTemplate: redistributeTrainingDays(updated) });
  };

  const toggleRest = (idx) => {
    // Flip the rest flag at this position
    const toggled = wt.map((d, i) => {
      if (i !== idx) return d;
      return d.isRest
        ? { ...d, isRest: false, label: "Training", exercises: [] }
        : { ...d, isRest: true, label: "Rest", exercises: [], _saved: undefined };
    });

    // Build an updated plan, then redistribute training sequence
    const updated = { ...plan, weekTemplate: toggled };

    // For custom splits, grow trainingSequence when new training slots appear
    const isCustom = plan.splitKey === "custom";
    const newTrainCount = toggled.filter(d => !d.isRest).length;
    let seq = [...(plan.trainingSequence || [])];
    if (isCustom && newTrainCount > seq.length) {
      while (seq.length < newTrainCount) {
        const letter = String.fromCharCode(65 + seq.length);
        seq.push({ label: `Training ${letter}`, isRest: false, exercises: [] });
      }
      updated.trainingSequence = seq;
    }

    onChange({ ...updated, weekTemplate: redistributeTrainingDays(updated) });
  };

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Set Your Schedule</h2>
      <p style={{ fontSize: 13, color: t.textDim, marginBottom: 24 }}>Drag days to reorder. Toggle between training and rest. Training days keep their programmed order.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 10 }}>
        {wt.map((day, i) => {
          const isRest = day.isRest;
          return (
            <div key={i} draggable onDragStart={() => setDragIdx(i)} onDragOver={e => e.preventDefault()} onDrop={() => { swapDays(dragIdx, i); setDragIdx(null); }} onDragEnd={() => setDragIdx(null)} style={{ background: isRest ? t.surface2 : t.surface, border: `1px solid ${dragIdx === i ? "#4C9EFF" : t.border}`, borderRadius: 14, padding: 16, textAlign: "center", minHeight: 160, opacity: dragIdx === i ? 0.5 : 1, cursor: "grab", transition: "all 0.15s" }}>
              <div style={{ fontSize: 10, fontFamily: "mono", color: t.textFaint, marginBottom: 4 }}>{DAY_NAMES[(i + 1) % 7]}</div>
              <div style={{ fontSize: 12, color: t.textDim, marginBottom: 6, letterSpacing: 2 }}>{"\u2630"}</div>
              {isRest ? <><div style={{ fontSize: 28, marginBottom: 4 }}>😴</div><div style={{ fontSize: 12, color: t.textFaint, marginBottom: 8 }}>Rest</div></> : <>
                <div style={{ fontSize: 13, fontWeight: 700, color: t.text, marginBottom: 4 }}>{day.label}</div>
                <div style={{ fontSize: 10, fontFamily: "mono", color: t.textDim }}>{day.exercises.length > 0 ? `${day.exercises.length} exercises` : "No exercises"}</div>
              </>}
              <button onClick={() => toggleRest(i)} style={{ marginTop: 10, fontSize: 10, padding: "4px 10px", borderRadius: 6, cursor: "pointer", background: "transparent", border: `1px solid ${t.borderLight}`, color: t.textDim }}>{isRest ? "Make Training" : "Make Rest"}</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
