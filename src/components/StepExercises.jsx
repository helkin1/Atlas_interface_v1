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

const INPUT_CLS = "w-[52px] px-1.5 py-1 rounded-[6px] border border-edge-light bg-surface2 text-content text-xs text-center outline-none";

export default function StepExercises({ plan, onChange }) {
  const t = useTheme();
  const wt = plan.weekTemplate || [];
  const seq = plan.trainingSequence || wt.filter(d => !d.isRest);

  const [selectedSeqIdx, setSelectedSeqIdx] = useState(0);
  const [search, setSearch] = useState("");
  const [filterMuscle, setFilterMuscle] = useState("all");
  const [dragIdx, setDragIdx] = useState(null);
  const [expandedIdx, setExpandedIdx] = useState(null);

  const wtIdx = seqIdxToWtIdx(wt, selectedSeqIdx);
  const currentDay = wtIdx >= 0 ? wt[wtIdx] : null;
  const isTrainingDay = currentDay && !currentDay.isRest;

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

  return (
    <div>
      <h2 className="text-xl font-[800] mb-1">Build Your Workouts</h2>
      <p className="text-body text-dim mb-5">Select a training day, then add or reorder exercises.</p>

      {/* ── Day selector ── */}
      <div className="flex gap-1.5 mb-5 flex-wrap">
        {seq.map((day, seqIdx) => {
          const sel = selectedSeqIdx === seqIdx;
          return (
            <button key={seqIdx} onClick={() => { setSelectedSeqIdx(seqIdx); setExpandedIdx(null); }}
              className={`px-4 py-2 rounded-[10px] text-xs font-semibold cursor-pointer border ${
                sel ? "border-primary bg-primary/10 text-primary" : "border-edge-light bg-transparent text-muted"
              }`}
            >
              {day.label}{day.exercises.length > 0 ? ` (${day.exercises.length})` : ""}
            </button>
          );
        })}
      </div>

      {isTrainingDay && (
        <div className="grid grid-cols-[1.2fr_0.8fr] gap-5">
          {/* ── LEFT: Current day's exercises ── */}
          <div className="bg-surface rounded-sm p-5 shadow-card">
            <div className="flex justify-between items-center mb-4">
              <div>
                <div className="text-lg font-bold text-content">{currentDay.label}</div>
                <div className="text-sm text-dim mt-0.5">{currentDay.exercises.length} exercises</div>
              </div>
            </div>

            {!currentDay.exercises.length && (
              <div className="border border-dashed border-edge-light rounded-sm p-10 text-center text-body text-dim">
                No exercises yet. Add from the browser or try a suggestion.
              </div>
            )}

            {currentDay.exercises.map((entry, ei) => {
              const ex = EXERCISES[entry.id]; if (!ex) return null;
              const isExp = expandedIdx === ei;
              const sm = summarizeSets(entry);
              return (
                <div key={`${entry.id}-${ei}`} className="mb-1.5">
                  {/* Exercise header row */}
                  <div
                    draggable
                    onDragStart={() => setDragIdx(ei)}
                    onDragOver={e => e.preventDefault()}
                    onDrop={() => { reorderExercise(dragIdx, ei); setDragIdx(null); }}
                    onDragEnd={() => setDragIdx(null)}
                    className={`flex items-center gap-2.5 px-3.5 py-3 cursor-pointer ${isExp ? "bg-surface2 border border-edge-light rounded-t-sm" : "bg-surface3 border border-edge rounded-sm"}`}
                    style={{ opacity: dragIdx === ei ? 0.4 : 1, borderColor: dragIdx === ei ? "#3B82F6" : undefined }}
                  >
                    <div className="cursor-grab text-dim text-md w-[18px] text-center shrink-0" onClick={e => e.stopPropagation()}>{"\u2630"}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-body font-semibold text-content overflow-hidden text-ellipsis whitespace-nowrap">{ex.name}</div>
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {ex.muscles.filter(m => m.role === "direct").map(m => (
                          <span key={m.name} className="text-[9px] px-1.5 py-[1px] rounded-[6px]" style={{ background: `${MUSCLE_COLORS[m.name] || '#666'}18`, color: MUSCLE_COLORS[m.name] || '#888' }}>{m.name}</span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right shrink-0 mr-1">
                      <div className="text-sm text-primary font-semibold">{sm.count} sets</div>
                      <div className="text-xs text-muted">{sm.repsRange} reps</div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); setExpandedIdx(isExp ? null : ei); }}
                      className={`rounded-[8px] px-2.5 py-1 cursor-pointer text-xs font-semibold whitespace-nowrap ${
                        isExp ? "bg-primary/10 border border-primary/25 text-primary" : "bg-transparent border border-edge-light text-dim"
                      }`}
                    >{isExp ? "Close" : "Edit Sets"}</button>
                    <button onClick={e => { e.stopPropagation(); removeExercise(ei); }} className="bg-none border-none text-error cursor-pointer text-md px-1 py-0.5 shrink-0">{"\u2715"}</button>
                  </div>

                  {/* Expanded set editor */}
                  {isExp && (
                    <div className="bg-surface2 border border-edge-light border-t-0 rounded-b-sm px-4 py-3.5">
                      <div className="flex gap-1.5 mb-2 pl-7">
                        <span className="w-10 text-xs text-dim">SET</span>
                        <span className="w-[52px] text-xs text-dim text-center">REPS</span>
                        <span className="w-16 text-xs text-dim text-center">WEIGHT</span>
                      </div>
                      {entry.setDetails.map((set, si) => (
                        <div key={si} className="flex items-center gap-1.5 mb-1 pl-7">
                          <span className="w-10 text-sm text-dim">#{si + 1}</span>
                          <input type="number" value={set.reps} min={1} max={30} onChange={e => updateSetDetail(ei, si, "reps", e.target.value)} className={INPUT_CLS} />
                          <input type="number" value={set.weight} min={0} max={999} onChange={e => updateSetDetail(ei, si, "weight", e.target.value)} className={`${INPUT_CLS} !w-16`} />
                          <span className="text-[9px] text-faint">lbs</span>
                          {entry.setDetails.length > 1 && <button onClick={() => removeSet(ei, si)} className="bg-none border-none text-dim cursor-pointer text-sm">{"\u2715"}</button>}
                        </div>
                      ))}
                      <button onClick={() => addSet(ei)} className="mt-2 ml-7 text-sm px-3.5 py-[5px] rounded-[8px] bg-transparent border border-dashed border-edge-light text-primary cursor-pointer">+ Add Set</button>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Gap suggestions */}
            {suggestions.length > 0 && (
              <div className="mt-4 pt-4 border-t border-edge">
                <div className="text-xs font-semibold text-muted mb-2"><span className="text-warning">{"\u26A1"}</span> Suggested to fill gaps</div>
                {suggestions.map(s => (
                  <button key={s.id} onClick={() => addExercise(s.id)} className="flex items-center gap-2.5 w-full bg-warning/[0.04] border border-dashed border-warning/25 rounded-[10px] p-2.5 mb-1 cursor-pointer text-left">
                    <span className="text-md text-success">+</span>
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-content">{s.name}</div>
                      <div className="text-xs text-dim">Targets: {s.directMuscles.join(", ")}</div>
                    </div>
                    {s.isNew && <span className="text-[8px] px-[5px] py-[1px] rounded-[4px] bg-success/10 text-success">NEW</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── RIGHT: Exercise browser ── */}
          <div>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search exercises..."
              className="w-full px-3.5 py-2.5 rounded-[10px] border border-edge-light bg-surface text-content text-body outline-none mb-2.5"
            />

            {/* Muscle group filter */}
            <div className="flex gap-1 mb-3 flex-wrap">
              <button onClick={() => setFilterMuscle("all")}
                className={`px-2.5 py-[5px] rounded-[8px] text-xs font-semibold cursor-pointer border ${
                  filterMuscle === "all" ? "border-primary/25 bg-primary/[0.08] text-primary" : "border-edge-light bg-transparent text-dim"
                }`}
              >All Muscles</button>
              {allMuscles.map(m => (
                <button key={m} onClick={() => setFilterMuscle(filterMuscle === m ? "all" : m)}
                  className="px-2.5 py-[5px] rounded-[8px] text-xs font-semibold cursor-pointer border"
                  style={{
                    borderColor: filterMuscle === m ? `${MUSCLE_COLORS[m] || "#3B82F6"}40` : "var(--atlas-border-light)",
                    background: filterMuscle === m ? `${MUSCLE_COLORS[m] || "#3B82F6"}10` : "transparent",
                    color: filterMuscle === m ? (MUSCLE_COLORS[m] || "#3B82F6") : "var(--atlas-text-dim)",
                  }}
                >{m}</button>
              ))}
            </div>

            {/* Exercise list */}
            <div className="max-h-[520px] overflow-y-auto rounded-sm border border-edge">
              {filtered.map(([id, ex]) => {
                const inDay = currentExIds.has(id);
                return (
                  <button key={id} onClick={() => !inDay && addExercise(id)} disabled={inDay}
                    className={`flex items-center gap-2.5 w-full px-3.5 py-2.5 border-none border-b border-edge cursor-pointer text-left ${
                      inDay ? "bg-surface2 opacity-50 !cursor-default" : "bg-transparent"
                    }`}
                  >
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-content">{ex.name}</div>
                      <div className="text-xs text-dim">{ex.muscles.filter(m => m.role === "direct").map(m => m.name).join(", ")}</div>
                    </div>
                    {inDay ? <span className="text-xs text-dim">Added</span> : <span className="text-md text-success">+</span>}
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
