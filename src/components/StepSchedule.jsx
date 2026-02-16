import { useState } from "react";
import { useTheme } from "../context/theme.js";
import { DAY_NAMES } from "../utils/helpers.js";

export default function StepSchedule({ plan, onChange }) {
  const t = useTheme();
  const wt = plan.weekTemplate || [];
  const [dragIdx, setDragIdx] = useState(null);
  const swapDays = (from, to) => { if (from === to) return; const u = [...wt]; const tmp = u[from]; u[from] = u[to]; u[to] = tmp; onChange({ ...plan, weekTemplate: u }); };
  const toggleRest = (idx) => { const u = wt.map((d, i) => { if (i !== idx) return d; return d.isRest ? { ...d, isRest: false, label: d._saved?.label || "Training", exercises: d._saved?.exercises || [] } : { ...d, isRest: true, _saved: { label: d.label, exercises: d.exercises } }; }); onChange({ ...plan, weekTemplate: u }); };
  const updateLabel = (idx, label) => onChange({ ...plan, weekTemplate: wt.map((d, i) => i === idx ? { ...d, label } : d) });
  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Set Your Schedule</h2>
      <p style={{ fontSize: 13, color: t.textDim, marginBottom: 24 }}>Drag days to reorder. Toggle between training and rest.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 10 }}>
        {wt.map((day, i) => {
          const isRest = day.isRest;
          return (
            <div key={i} draggable onDragStart={() => setDragIdx(i)} onDragOver={e => e.preventDefault()} onDrop={() => { swapDays(dragIdx, i); setDragIdx(null); }} onDragEnd={() => setDragIdx(null)} style={{ background: isRest ? t.surface2 : t.surface, border: `1px solid ${dragIdx === i ? "#4C9EFF" : t.border}`, borderRadius: 14, padding: 16, textAlign: "center", minHeight: 160, opacity: dragIdx === i ? 0.5 : 1, cursor: "grab", transition: "all 0.15s" }}>
              <div style={{ fontSize: 10, fontFamily: "mono", color: t.textFaint, marginBottom: 4 }}>{DAY_NAMES[(i + 1) % 7]}</div>
              <div style={{ fontSize: 12, color: t.textDim, marginBottom: 6, letterSpacing: 2 }}>{"\u2630"}</div>
              {isRest ? <><div style={{ fontSize: 28, marginBottom: 4 }}>😴</div><div style={{ fontSize: 12, color: t.textFaint, marginBottom: 8 }}>Rest</div></> : <>
                <input value={day.label} onChange={e => updateLabel(i, e.target.value)} style={{ fontSize: 13, fontWeight: 700, color: t.text, background: "transparent", border: "1px solid transparent", borderRadius: 6, padding: "2px 4px", textAlign: "center", width: "100%", outline: "none", marginBottom: 4 }} onFocus={e => e.target.style.borderColor = t.borderLight} onBlur={e => e.target.style.borderColor = "transparent"} />
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
