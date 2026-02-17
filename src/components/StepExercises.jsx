import { useState, useMemo } from "react";
import { useTheme } from "../context/theme.js";
import { EXERCISES, getExDefault } from "../data/exercise-data.js";
import { MUSCLE_COLORS, summarizeSets } from "../utils/helpers.js";
import { getGapSuggestions } from "../utils/plan-engine.js";

/* ── Helpers to map between trainingSequence and weekTemplate ── */

function seqIdxToWtIdx(wt, seqIdx) {
  let count = 0;
  for (let i = 0; i < wt.length; i++) {
    if (!wt[i].isRest) { if (count === seqIdx) return i; count++; }
  }
  return -1;
}

export default function StepExercises({ plan, onChange }) {
  const t = useTheme();
  const wt = plan.weekTemplate || [];
  const seq = plan.trainingSequence || wt.filter(d => !d.isRest);
  const cycleLen = plan.cycleLength || seq.length;

  // Week groups from training sequence
  const weekGroups = useMemo(() => {
    if (!seq.length || !cycleLen) return [];
    const groups = [];
    for (let i = 0; i < seq.length; i += cycleLen) {
      groups.push({ label: `Week ${String.fromCharCode(65 + groups.length)}`, days: seq.slice(i, i + cycleLen), startIdx: i });
    }
    return groups;
  }, [seq, cycleLen]);

  const [selectedWeekGroup, setSelectedWeekGroup] = useState(0);
  const [selectedSeqIdx, setSelectedSeqIdx] = useState(0);
  const [search, setSearch] = useState("");
  const [filterMuscle, setFilterMuscle] = useState("all");
  const [dragIdx, setDragIdx] = useState(null);
  const [expandedIdx, setExpandedIdx] = useState(null);

  // Resolve current selection
  const wtIdx = seqIdxToWtIdx(wt, selectedSeqIdx);
  const currentDay = wtIdx >= 0 ? wt[wtIdx] : null;
  const isTrainingDay = currentDay && !currentDay.isRest;

  // Update both weekTemplate and trainingSequence together
  const updateDay = (seqIdx, fn) => {
    const wi = seqIdxToWtIdx(wt, seqIdx);
    if (wi < 0) return;
    const newWt = wt.map((d, i) => i === wi ? fn(d) : d);
    const newSeq = seq.map((d, i) => i === seqIdx ? fn(d) : d);
    onChange({ ...plan, weekTemplate: newWt, trainingSequence: newSeq });
  };

  const addExercise = (exId) => updateDay(selectedSeqIdx, d => d.exercises.some(e => e.id === exId) ? d : { ...d, exercises: [...d.exercises, getExDefault(exId)] });
  const removeExercise = (idx) => { if (expandedIdx === idx) setExpandedIdx(null); else if (expandedIdx > idx) setExpandedIdx(expandedIdx - 1); updateDay(selectedSeqIdx, d => ({ ...d, exercises: d.exercises.filter((_, i) => i !== idx) })); };
  const updateSetDetail = (ei, si, field, val) => updateDay(selectedSeqIdx, d => ({ ...d, exercises: d.exercises.map((e, i) => i !== ei ? e : { ...e, setDetails: e.setDetails.map((s, j) => j === si ? { ...s, [field]: Number(val) || 0 } : s) }) }));
  const addSet = (ei) => updateDay(selectedSeqIdx, d => ({ ...d, exercises: d.exercises.map((e, i) => { if (i !== ei) return e; const last = e.setDetails[e.setDetails.length - 1] || { reps: 10, weight: 0 }; return { ...e, setDetails: [...e.setDetails, { ...last }] }; }) }));
  const removeSet = (ei, si) => updateDay(selectedSeqIdx, d => ({ ...d, exercises: d.exercises.map((e, i) => { if (i !== ei) return e; const sd = e.setDetails.filter((_, j) => j !== si); return { ...e, setDetails: sd.length ? sd : [{ reps: 10, weight: 0 }] }; }) }));
  const reorderExercise = (from, to) => { if (from === to) return; setExpandedIdx(null); updateDay(selectedSeqIdx, d => { const a = [...d.exercises]; const [it] = a.splice(from, 1); a.splice(to, 0, it); return { ...d, exercises: a }; }); };

  const suggestions = useMemo(() => getGapSuggestions(wt, 4), [wt]);
  const allMuscles = useMemo(() => { const ms = new Set(); Object.values(EXERCISES).forEach(ex => ex.muscles.filter(m => m.role === "direct").forEach(m => ms.add(m.name))); return Array.from(ms).sort(); }, []);
  const filtered = Object.entries(EXERCISES).filter(([, ex]) => {
    if (filterMuscle !== "all" && !ex.muscles.some(m => m.name === filterMuscle)) return false;
    if (search && !ex.name.toLowerCase().includes(search.toLowerCase()) && !ex.muscles.some(m => m.name.toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  });
  const currentExIds = isTrainingDay ? new Set(currentDay.exercises.map(e => e.id)) : new Set();
  const inputSt = { width: 52, padding: "4px 6px", borderRadius: 6, border: `1px solid ${t.borderLight}`, background: t.surface2, color: t.text, fontSize: 12, fontFamily: "mono", textAlign: "center", outline: "none" };

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Build Your Workouts</h2>
      <p style={{ fontSize: 13, color: t.textDim, marginBottom: 20 }}>Select a week and training day, then add or reorder exercises.</p>

      {/* ── Week group selector ── */}
      {weekGroups.length > 1 && (
        <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
          {weekGroups.map((wg, gi) => {
            const sel = selectedWeekGroup === gi;
            return (
              <button key={gi} onClick={() => { setSelectedWeekGroup(gi); setSelectedSeqIdx(wg.startIdx); setExpandedIdx(null); }} style={{ padding: "8px 20px", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", border: `1px solid ${sel ? "#4C9EFF" : t.border}`, background: sel ? "rgba(76,158,255,0.1)" : t.surface, color: sel ? "#4C9EFF" : t.textMuted }}>
                {wg.label}
              </button>
            );
          })}
        </div>
      )}

      {/* ── Day selector within the week group ── */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
        {(weekGroups[selectedWeekGroup]?.days || []).map((day, di) => {
          const absSeqIdx = (weekGroups[selectedWeekGroup]?.startIdx || 0) + di;
          const sel = selectedSeqIdx === absSeqIdx;
          return (
            <button key={di} onClick={() => { setSelectedSeqIdx(absSeqIdx); setExpandedIdx(null); }} style={{ padding: "8px 16px", borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: "pointer", border: `1px solid ${sel ? "#4C9EFF" : t.borderLight}`, background: sel ? "rgba(76,158,255,0.1)" : "transparent", color: sel ? "#4C9EFF" : t.textMuted }}>
              {day.label}{day.exercises.length > 0 ? ` (${day.exercises.length})` : ""}
            </button>
          );
        })}
      </div>

      {isTrainingDay && (
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 20 }}>
          {/* ── LEFT: Current day's exercises ── */}
          <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 16, padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: t.text }}>{currentDay.label}</div>
                <div style={{ fontSize: 11, fontFamily: "mono", color: t.textDim, marginTop: 2 }}>{currentDay.exercises.length} exercises</div>
              </div>
            </div>

            {!currentDay.exercises.length && (
              <div style={{ border: `1px dashed ${t.borderLight}`, borderRadius: 12, padding: 40, textAlign: "center", fontSize: 13, color: t.textDim }}>
                No exercises yet. Add from the browser or try a suggestion.
              </div>
            )}

            {currentDay.exercises.map((entry, ei) => {
              const ex = EXERCISES[entry.id]; if (!ex) return null;
              const isExp = expandedIdx === ei;
              const sm = summarizeSets(entry);
              return (
                <div key={`${entry.id}-${ei}`} style={{ marginBottom: 6 }}>
                  {/* Exercise header row */}
                  <div
                    draggable
                    onDragStart={() => setDragIdx(ei)}
                    onDragOver={e => e.preventDefault()}
                    onDrop={() => { reorderExercise(dragIdx, ei); setDragIdx(null); }}
                    onDragEnd={() => setDragIdx(null)}
                    style={{
                      background: isExp ? t.surface2 : t.surface3,
                      border: `1px solid ${dragIdx === ei ? "#4C9EFF" : isExp ? t.borderLight : t.border}`,
                      borderRadius: isExp ? "12px 12px 0 0" : 12,
                      padding: "12px 14px",
                      display: "flex", alignItems: "center", gap: 10,
                      opacity: dragIdx === ei ? 0.4 : 1,
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ cursor: "grab", color: t.textDim, fontSize: 14, width: 18, textAlign: "center", flexShrink: 0 }} onClick={e => e.stopPropagation()}>{"\u2630"}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: t.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ex.name}</div>
                      <div style={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" }}>
                        {ex.muscles.filter(m => m.role === "direct").map(m => (
                          <span key={m.name} style={{ fontSize: 9, padding: "1px 6px", borderRadius: 6, background: `${MUSCLE_COLORS[m.name] || '#666'}18`, color: MUSCLE_COLORS[m.name] || '#888' }}>{m.name}</span>
                        ))}
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0, marginRight: 4 }}>
                      <div style={{ fontSize: 11, fontFamily: "mono", color: "#4C9EFF", fontWeight: 600 }}>{sm.count} sets</div>
                      <div style={{ fontSize: 10, fontFamily: "mono", color: t.textMuted }}>{sm.repsRange} reps</div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); setExpandedIdx(isExp ? null : ei); }} style={{ background: isExp ? "rgba(76,158,255,0.1)" : "transparent", border: `1px solid ${isExp ? "#4C9EFF40" : t.borderLight}`, borderRadius: 8, padding: "4px 10px", cursor: "pointer", fontSize: 10, fontWeight: 600, color: isExp ? "#4C9EFF" : t.textDim, whiteSpace: "nowrap" }}>
                      {isExp ? "Close" : "Edit Sets"}
                    </button>
                    <button onClick={e => { e.stopPropagation(); removeExercise(ei); }} style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer", fontSize: 14, padding: "2px 4px", flexShrink: 0 }}>{"\u2715"}</button>
                  </div>

                  {/* Expanded set editor */}
                  {isExp && (
                    <div style={{ background: t.surface2, border: `1px solid ${t.borderLight}`, borderTop: "none", borderRadius: "0 0 12px 12px", padding: "14px 16px" }}>
                      <div style={{ display: "flex", gap: 6, marginBottom: 8, paddingLeft: 28 }}>
                        <span style={{ width: 40, fontSize: 9, fontFamily: "mono", color: t.textFaint }}>SET</span>
                        <span style={{ width: 52, fontSize: 9, fontFamily: "mono", color: t.textFaint, textAlign: "center" }}>REPS</span>
                        <span style={{ width: 64, fontSize: 9, fontFamily: "mono", color: t.textFaint, textAlign: "center" }}>WEIGHT</span>
                      </div>
                      {entry.setDetails.map((set, si) => (
                        <div key={si} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, paddingLeft: 28 }}>
                          <span style={{ width: 40, fontSize: 11, fontFamily: "mono", color: t.textDim }}>#{si + 1}</span>
                          <input type="number" value={set.reps} min={1} max={30} onChange={e => updateSetDetail(ei, si, "reps", e.target.value)} style={inputSt} />
                          <input type="number" value={set.weight} min={0} max={999} onChange={e => updateSetDetail(ei, si, "weight", e.target.value)} style={{ ...inputSt, width: 64 }} />
                          <span style={{ fontSize: 9, color: t.textFaint }}>lbs</span>
                          {entry.setDetails.length > 1 && <button onClick={() => removeSet(ei, si)} style={{ background: "none", border: "none", color: t.textDim, cursor: "pointer", fontSize: 11 }}>{"\u2715"}</button>}
                        </div>
                      ))}
                      <button onClick={() => addSet(ei)} style={{ marginTop: 8, marginLeft: 28, fontSize: 11, padding: "5px 14px", borderRadius: 8, background: "transparent", border: `1px dashed ${t.borderLight}`, color: "#4C9EFF", cursor: "pointer" }}>+ Add Set</button>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Gap suggestions inside the exercise list */}
            {suggestions.length > 0 && (
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${t.border}` }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: t.textFaint, fontFamily: "mono", marginBottom: 8 }}><span style={{ color: "#FBBF24" }}>{"\u26A1"}</span> Suggested to fill gaps</div>
                {suggestions.map(s => (
                  <button key={s.id} onClick={() => addExercise(s.id)} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", background: "rgba(251,191,36,0.04)", border: "1px dashed rgba(251,191,36,0.25)", borderRadius: 10, padding: 10, marginBottom: 4, cursor: "pointer", textAlign: "left" }}>
                    <span style={{ fontSize: 14, color: "#3DDC84" }}>+</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: t.text }}>{s.name}</div>
                      <div style={{ fontSize: 10, color: t.textDim }}>Targets: {s.directMuscles.join(", ")}</div>
                    </div>
                    {s.isNew && <span style={{ fontSize: 8, fontFamily: "mono", padding: "1px 5px", borderRadius: 4, background: "rgba(61,220,132,0.1)", color: "#3DDC84" }}>NEW</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── RIGHT: Exercise browser ── */}
          <div>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search exercises..." style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${t.borderLight}`, background: t.surface, color: t.text, fontSize: 13, outline: "none", marginBottom: 10 }} />

            {/* Muscle group filter */}
            <div style={{ display: "flex", gap: 4, marginBottom: 12, flexWrap: "wrap" }}>
              <button onClick={() => setFilterMuscle("all")} style={{ padding: "5px 10px", borderRadius: 8, fontSize: 10, fontWeight: 600, cursor: "pointer", border: `1px solid ${filterMuscle === "all" ? "#4C9EFF40" : t.borderLight}`, background: filterMuscle === "all" ? "rgba(76,158,255,0.08)" : "transparent", color: filterMuscle === "all" ? "#4C9EFF" : t.textDim }}>All Muscles</button>
              {allMuscles.map(m => (
                <button key={m} onClick={() => setFilterMuscle(filterMuscle === m ? "all" : m)} style={{ padding: "5px 10px", borderRadius: 8, fontSize: 10, fontWeight: 600, cursor: "pointer", border: `1px solid ${filterMuscle === m ? (MUSCLE_COLORS[m] || "#4C9EFF") + "40" : t.borderLight}`, background: filterMuscle === m ? `${MUSCLE_COLORS[m] || "#4C9EFF"}10` : "transparent", color: filterMuscle === m ? (MUSCLE_COLORS[m] || "#4C9EFF") : t.textDim }}>
                  {m}
                </button>
              ))}
            </div>

            {/* Exercise list */}
            <div style={{ maxHeight: 520, overflowY: "auto", borderRadius: 12, border: `1px solid ${t.border}` }}>
              {filtered.map(([id, ex]) => {
                const inDay = currentExIds.has(id);
                return (
                  <button key={id} onClick={() => !inDay && addExercise(id)} disabled={inDay} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 14px", background: inDay ? t.surface2 : "transparent", border: "none", borderBottom: `1px solid ${t.border}`, cursor: inDay ? "default" : "pointer", textAlign: "left", opacity: inDay ? 0.5 : 1 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: t.text }}>{ex.name}</div>
                      <div style={{ fontSize: 10, color: t.textDim }}>{ex.muscles.filter(m => m.role === "direct").map(m => m.name).join(", ")}</div>
                    </div>
                    {inDay ? <span style={{ fontSize: 10, color: t.textDim }}>Added</span> : <span style={{ fontSize: 14, color: "#3DDC84" }}>+</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
