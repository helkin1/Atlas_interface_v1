import { useState, useMemo } from "react";
import { useTheme } from "../context/theme.js";
import { EXERCISES, getExDefault } from "../data/exercise-data.js";
import { PATTERN_COLORS, MUSCLE_COLORS, summarizeSets } from "../utils/helpers.js";
import { getGapSuggestions } from "../utils/plan-engine.js";

export default function StepExercises({ plan, onChange }) {
  const t = useTheme();
  const [selectedDay, setSelectedDay] = useState(() => (plan.weekTemplate || []).findIndex(d => !d.isRest));
  const [search, setSearch] = useState(""); const [filterPattern, setFilterPattern] = useState("all"); const [filterMuscle, setFilterMuscle] = useState("all");
  const [dragIdx, setDragIdx] = useState(null); const [expandedIdx, setExpandedIdx] = useState(null);
  const wt = plan.weekTemplate || []; const currentDay = wt[selectedDay]; const isTrainingDay = currentDay && !currentDay.isRest;
  const updateDay = (dayIdx, fn) => onChange({ ...plan, weekTemplate: wt.map((d, i) => i === dayIdx ? fn(d) : d) });
  const addExercise = (exId) => updateDay(selectedDay, d => d.exercises.some(e => e.id === exId) ? d : { ...d, exercises: [...d.exercises, getExDefault(exId)] });
  const removeExercise = (idx) => { if (expandedIdx === idx) setExpandedIdx(null); else if (expandedIdx > idx) setExpandedIdx(expandedIdx - 1); updateDay(selectedDay, d => ({ ...d, exercises: d.exercises.filter((_, i) => i !== idx) })); };
  const updateSetDetail = (ei, si, field, val) => updateDay(selectedDay, d => ({ ...d, exercises: d.exercises.map((e, i) => i !== ei ? e : { ...e, setDetails: e.setDetails.map((s, j) => j === si ? { ...s, [field]: Number(val) || 0 } : s) }) }));
  const addSet = (ei) => updateDay(selectedDay, d => ({ ...d, exercises: d.exercises.map((e, i) => { if (i !== ei) return e; const last = e.setDetails[e.setDetails.length - 1] || { reps: 10, weight: 0 }; return { ...e, setDetails: [...e.setDetails, { ...last }] }; }) }));
  const removeSet = (ei, si) => updateDay(selectedDay, d => ({ ...d, exercises: d.exercises.map((e, i) => { if (i !== ei) return e; const sd = e.setDetails.filter((_, j) => j !== si); return { ...e, setDetails: sd.length ? sd : [{ reps: 10, weight: 0 }] }; }) }));
  const reorderExercise = (from, to) => { if (from === to) return; setExpandedIdx(null); updateDay(selectedDay, d => { const a = [...d.exercises]; const [it] = a.splice(from, 1); a.splice(to, 0, it); return { ...d, exercises: a }; }); };
  const suggestions = useMemo(() => getGapSuggestions(wt, 4), [wt]);
  const allMuscles = useMemo(() => { const ms = new Set(); Object.values(EXERCISES).forEach(ex => ex.muscles.filter(m => m.role === "direct").forEach(m => ms.add(m.name))); return Array.from(ms).sort(); }, []);
  const filtered = Object.entries(EXERCISES).filter(([, ex]) => { if (filterPattern !== "all" && ex.pattern !== filterPattern) return false; if (filterMuscle !== "all" && !ex.muscles.some(m => m.name === filterMuscle)) return false; if (search && !ex.name.toLowerCase().includes(search.toLowerCase()) && !ex.muscles.some(m => m.name.toLowerCase().includes(search.toLowerCase()))) return false; return true; });
  const currentExIds = isTrainingDay ? new Set(currentDay.exercises.map(e => e.id)) : new Set();
  const inputSt = { width: 52, padding: "4px 6px", borderRadius: 6, border: `1px solid ${t.borderLight}`, background: t.surface2, color: t.text, fontSize: 12, fontFamily: "mono", textAlign: "center", outline: "none" };

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Build Your Workouts</h2>
      <p style={{ fontSize: 13, color: t.textDim, marginBottom: 20 }}>Click to expand sets. Drag {"\u2630"} to reorder. Search by name or muscle.</p>
      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
        {wt.map((day, i) => { if (day.isRest) return null; const sel = selectedDay === i; return <button key={i} onClick={() => { setSelectedDay(i); setExpandedIdx(null); }} style={{ padding: "8px 16px", borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: "pointer", border: `1px solid ${sel ? "#4C9EFF" : t.borderLight}`, background: sel ? "rgba(76,158,255,0.1)" : "transparent", color: sel ? "#4C9EFF" : t.textMuted }}>{day.label}{day.exercises.length > 0 ? ` (${day.exercises.length})` : ""}</button>; })}
      </div>
      {isTrainingDay && (
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 20 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: t.textFaint, fontFamily: "mono", marginBottom: 12 }}>{currentDay.label} — {currentDay.exercises.length} exercises</div>
            {!currentDay.exercises.length && <div style={{ background: t.surface, border: `1px dashed ${t.borderLight}`, borderRadius: 12, padding: 40, textAlign: "center", fontSize: 13, color: t.textDim }}>No exercises yet. Add from the browser or try a suggestion.</div>}
            {currentDay.exercises.map((entry, ei) => {
              const ex = EXERCISES[entry.id]; if (!ex) return null;
              const isExp = expandedIdx === ei; const sm = summarizeSets(entry);
              return (
                <div key={`${entry.id}-${ei}`} style={{ marginBottom: 5 }}>
                  <div draggable onDragStart={() => setDragIdx(ei)} onDragOver={e => e.preventDefault()} onDrop={() => { reorderExercise(dragIdx, ei); setDragIdx(null); }} onDragEnd={() => setDragIdx(null)} onClick={() => setExpandedIdx(isExp ? null : ei)} style={{ background: isExp ? t.surface2 : t.surface, border: `1px solid ${dragIdx === ei ? "#4C9EFF" : isExp ? t.borderLight : t.border}`, borderRadius: isExp ? "10px 10px 0 0" : 10, padding: "10px 12px", display: "flex", alignItems: "center", gap: 6, opacity: dragIdx === ei ? 0.4 : 1, cursor: "pointer" }}>
                    <div style={{ cursor: "grab", color: t.textDim, fontSize: 14, width: 20, textAlign: "center" }} onClick={e => e.stopPropagation()}>{"\u2630"}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: t.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ex.name}</div>
                      <div style={{ display: "flex", gap: 2, marginTop: 3, flexWrap: "wrap" }}>{ex.muscles.filter(m => m.role === "direct").map(m => <span key={m.name} style={{ fontSize: 8, padding: "0 4px", borderRadius: 4, background: `${MUSCLE_COLORS[m.name] || '#666'}18`, color: MUSCLE_COLORS[m.name] || '#888' }}>{m.name}</span>)}</div>
                    </div>
                    <span style={{ fontSize: 11, fontFamily: "mono", color: "#4C9EFF", fontWeight: 600 }}>{sm.count} sets</span>
                    <span style={{ fontSize: 10, fontFamily: "mono", color: t.textMuted }}>{sm.repsRange} reps</span>
                    <span style={{ fontSize: 10, fontFamily: "mono", color: t.textDim }}>{sm.weightRange} lbs</span>
                    <span style={{ fontSize: 10, color: t.textDim, transform: isExp ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>{"\u25BC"}</span>
                    <button onClick={e => { e.stopPropagation(); removeExercise(ei); }} style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer", fontSize: 13, padding: "2px 4px" }}>{"\u2715"}</button>
                  </div>
                  {isExp && (
                    <div style={{ background: t.surface, border: `1px solid ${t.borderLight}`, borderTop: "none", borderRadius: "0 0 10px 10px", padding: "10px 12px" }}>
                      <div style={{ display: "flex", gap: 6, marginBottom: 6, paddingLeft: 26 }}><span style={{ width: 40, fontSize: 9, fontFamily: "mono", color: t.textFaint }}>SET</span><span style={{ width: 52, fontSize: 9, fontFamily: "mono", color: t.textFaint, textAlign: "center" }}>REPS</span><span style={{ width: 64, fontSize: 9, fontFamily: "mono", color: t.textFaint, textAlign: "center" }}>WEIGHT</span></div>
                      {entry.setDetails.map((set, si) => (
                        <div key={si} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, paddingLeft: 26 }}>
                          <span style={{ width: 40, fontSize: 11, fontFamily: "mono", color: t.textDim }}>#{si + 1}</span>
                          <input type="number" value={set.reps} min={1} max={30} onChange={e => updateSetDetail(ei, si, "reps", e.target.value)} style={inputSt} />
                          <input type="number" value={set.weight} min={0} max={999} onChange={e => updateSetDetail(ei, si, "weight", e.target.value)} style={{ ...inputSt, width: 64 }} />
                          <span style={{ fontSize: 9, color: t.textFaint }}>lbs</span>
                          {entry.setDetails.length > 1 && <button onClick={() => removeSet(ei, si)} style={{ background: "none", border: "none", color: t.textDim, cursor: "pointer", fontSize: 11 }}>{"\u2715"}</button>}
                        </div>
                      ))}
                      <button onClick={() => addSet(ei)} style={{ marginTop: 6, marginLeft: 26, fontSize: 11, padding: "4px 12px", borderRadius: 6, background: "transparent", border: `1px dashed ${t.borderLight}`, color: "#4C9EFF", cursor: "pointer" }}>+ Add Set</button>
                    </div>
                  )}
                </div>
              );
            })}
            {suggestions.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: t.textFaint, fontFamily: "mono", marginBottom: 8 }}><span style={{ color: "#FBBF24" }}>{"\u26A1"}</span> Suggested to fill gaps</div>
                {suggestions.map(s => <button key={s.id} onClick={() => addExercise(s.id)} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", background: "rgba(251,191,36,0.04)", border: "1px dashed rgba(251,191,36,0.25)", borderRadius: 10, padding: 10, marginBottom: 4, cursor: "pointer", textAlign: "left" }}><span style={{ fontSize: 14 }}>+</span><div style={{ flex: 1 }}><div style={{ fontSize: 12, fontWeight: 600, color: t.text }}>{s.name}</div><div style={{ fontSize: 10, color: t.textDim }}>Targets: {s.directMuscles.join(", ")}</div></div>{s.isNew && <span style={{ fontSize: 8, fontFamily: "mono", padding: "1px 5px", borderRadius: 4, background: "rgba(61,220,132,0.1)", color: "#3DDC84" }}>NEW</span>}</button>)}
              </div>
            )}
          </div>
          <div>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or muscle..." style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${t.borderLight}`, background: t.surface, color: t.text, fontSize: 12, outline: "none", marginBottom: 8 }} />
            <div style={{ display: "flex", gap: 3, marginBottom: 6 }}>{["all", "push", "pull", "legs"].map(p => <button key={p} onClick={() => setFilterPattern(p)} style={{ padding: "5px 9px", borderRadius: 6, fontSize: 10, fontFamily: "mono", cursor: "pointer", border: `1px solid ${filterPattern === p ? (PATTERN_COLORS[p]?.text || "#4C9EFF") + "40" : t.borderLight}`, background: filterPattern === p ? (PATTERN_COLORS[p]?.bg || "rgba(76,158,255,0.06)") : "transparent", color: filterPattern === p ? (PATTERN_COLORS[p]?.text || "#4C9EFF") : t.textDim, textTransform: "uppercase" }}>{p}</button>)}</div>
            <div style={{ display: "flex", gap: 3, marginBottom: 10, flexWrap: "wrap" }}>
              <button onClick={() => setFilterMuscle("all")} style={{ padding: "3px 7px", borderRadius: 5, fontSize: 9, cursor: "pointer", border: `1px solid ${filterMuscle === "all" ? "#4C9EFF40" : t.borderLight}`, background: filterMuscle === "all" ? "rgba(76,158,255,0.06)" : "transparent", color: filterMuscle === "all" ? "#4C9EFF" : t.textDim }}>All</button>
              {allMuscles.map(m => <button key={m} onClick={() => setFilterMuscle(filterMuscle === m ? "all" : m)} style={{ padding: "3px 7px", borderRadius: 5, fontSize: 9, cursor: "pointer", border: `1px solid ${filterMuscle === m ? (MUSCLE_COLORS[m] || "#4C9EFF") + "40" : t.borderLight}`, background: filterMuscle === m ? `${MUSCLE_COLORS[m] || "#4C9EFF"}10` : "transparent", color: filterMuscle === m ? (MUSCLE_COLORS[m] || "#4C9EFF") : t.textDim }}>{m}</button>)}
            </div>
            <div style={{ maxHeight: 480, overflowY: "auto", borderRadius: 12, border: `1px solid ${t.border}` }}>
              {filtered.map(([id, ex]) => { const inDay = currentExIds.has(id); const pc = PATTERN_COLORS[ex.pattern]; return <button key={id} onClick={() => !inDay && addExercise(id)} disabled={inDay} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 14px", background: inDay ? t.surface2 : "transparent", border: "none", borderBottom: `1px solid ${t.border}`, cursor: inDay ? "default" : "pointer", textAlign: "left", opacity: inDay ? 0.5 : 1 }}><span style={{ fontSize: 9, fontFamily: "mono", padding: "2px 6px", borderRadius: 6, background: pc?.bg, color: pc?.text, textTransform: "uppercase" }}>{ex.pattern}</span><div style={{ flex: 1 }}><div style={{ fontSize: 12, fontWeight: 600, color: t.text }}>{ex.name}</div><div style={{ fontSize: 10, color: t.textDim }}>{ex.muscles.filter(m => m.role === "direct").map(m => m.name).join(", ")}</div></div>{inDay ? <span style={{ fontSize: 10, color: t.textDim }}>Added</span> : <span style={{ fontSize: 14, color: "#3DDC84" }}>+</span>}</button>; })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
