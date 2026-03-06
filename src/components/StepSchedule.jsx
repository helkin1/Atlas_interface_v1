import { useState } from "react";
import { DAY_NAMES } from "../utils/helpers.js";
import { redistributeTrainingDays } from "../utils/plan-engine.js";

export default function StepSchedule({ plan, onChange }) {
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
    const toggled = wt.map((d, i) => {
      if (i !== idx) return d;
      return d.isRest
        ? { ...d, isRest: false, label: "Training", exercises: [] }
        : { ...d, isRest: true, label: "Rest", exercises: [], _saved: undefined };
    });

    const updated = { ...plan, weekTemplate: toggled };

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
      <h2 className="text-[22px] font-[800] mb-1">Set Your Schedule</h2>
      <p className="text-[13px] text-dim mb-6">Drag days to reorder. Toggle between training and rest. Training days keep their programmed order.</p>
      <div className="grid grid-cols-7 gap-2.5">
        {wt.map((day, i) => {
          const isRest = day.isRest;
          return (
            <div key={i} draggable onDragStart={() => setDragIdx(i)} onDragOver={e => e.preventDefault()} onDrop={() => { swapDays(dragIdx, i); setDragIdx(null); }} onDragEnd={() => setDragIdx(null)}
              className={`rounded-xl p-5 text-center min-h-[160px] cursor-grab transition-all duration-150 ${isRest ? "bg-surface2" : "bg-surface"}`}
              style={{ border: `1px solid ${dragIdx === i ? "#3B82F6" : "var(--atlas-border)"}`, opacity: dragIdx === i ? 0.5 : 1 }}
            >
              <div className="text-[10px] text-faint mb-1">{DAY_NAMES[(i + 1) % 7]}</div>
              <div className="text-xs text-dim mb-1.5 tracking-[2px]">{"\u2630"}</div>
              {isRest ? (
                <>
                  <div className="text-[28px] mb-1">😴</div>
                  <div className="text-xs text-faint mb-2">Rest</div>
                </>
              ) : (
                <>
                  <div className="text-[13px] font-bold text-content mb-1">{day.label}</div>
                  <div className="text-[10px] text-dim">{day.exercises.length > 0 ? `${day.exercises.length} exercises` : "No exercises"}</div>
                </>
              )}
              <button onClick={() => toggleRest(i)}
                className="mt-2.5 text-[10px] px-2.5 py-1 rounded-[6px] cursor-pointer bg-transparent border border-edge-light text-dim"
              >{isRest ? "Make Training" : "Make Rest"}</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
