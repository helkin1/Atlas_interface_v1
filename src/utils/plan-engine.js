import { EXERCISES, EXERCISE_DEFAULTS, getExDefault } from "../data/exercise-data.js";
import { SPLIT_PRESETS } from "../data/split-presets.js";
import { calcGoalPcts } from "./helpers.js";

export function buildMonthFromPlan(plan) {
  const wt = plan.weekTemplate || [];
  const weeks = plan.weeks || 4;
  const progressRate = plan.progressRate || 2.5;
  const startDate = new Date(2026, 1, 2); // Feb 2, 2026

  return Array.from({ length: weeks }, (_, wi) => {
    const overloadFactor = 1 + wi * (progressRate / 100);
    return {
      weekNum: wi + 1,
      label: wi === weeks - 1 && weeks > 2 ? `Week ${wi + 1} (Taper)` : `Week ${wi + 1}`,
      days: wt.map((day, di) => {
        const isRest = day.isRest || (!day.exercises.length && day.label === "Rest");
        const exercises = isRest ? [] : day.exercises.map(entry => {
          const exId = typeof entry === "string" ? entry : entry.id;
          const sd = entry.setDetails || (EXERCISE_DEFAULTS[exId] ? Array.from({ length: EXERCISE_DEFAULTS[exId].sets }, () => ({ reps: EXERCISE_DEFAULTS[exId].reps, weight: EXERCISE_DEFAULTS[exId].weight })) : [{ reps: 10, weight: 0 }]);
          return {
            exercise_id: exId,
            sets: sd.map(s => ({
              r: s.reps,
              w: s.weight > 0 ? Math.round(s.weight * overloadFactor / 5) * 5 : 0,
            })),
          };
        });
        return {
          dayNum: wi * 7 + di + 1,
          date: new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + wi * 7 + di),
          label: isRest ? "Rest" : day.label,
          isRest,
          exercises,
        };
      }),
    };
  });
}

export const DEFAULT_PLAN = {
  splitKey: "ppl",
  splitName: "Push / Pull / Legs",
  weekTemplate: SPLIT_PRESETS.ppl.weekTemplate.map(d => ({
    ...d,
    isRest: !d.exercises.length && d.label === "Rest",
    exercises: d.exercises.map(exId => getExDefault(exId)),
  })),
  weeks: 4,
  progressRate: 2.5,
};

export function getGapSuggestions(weekTemplate, count = 3) {
  const vol = {};
  weekTemplate.forEach(day => {
    if (day.isRest || !day.exercises.length) return;
    day.exercises.forEach(entry => {
      const exId = typeof entry === "string" ? entry : entry.id;
      const sets = entry.setDetails ? entry.setDetails.length : 3;
      const ex = EXERCISES[exId]; if (!ex) return;
      ex.muscles.forEach(m => { vol[m.name] = (vol[m.name] || 0) + sets * m.contribution; });
    });
  });
  const goals = calcGoalPcts(vol);
  const gaps = Object.entries(goals).filter(([, d]) => d.pct < 80).sort((a, b) => a[1].pct - b[1].pct);
  if (!gaps.length) return [];
  const underserved = gaps.slice(0, 5).map(([m]) => m);
  const alreadyUsed = new Set();
  weekTemplate.forEach(d => d.exercises.forEach(e => alreadyUsed.add(typeof e === "string" ? e : e.id)));
  return Object.entries(EXERCISES).map(([id, ex]) => {
    let score = 0;
    ex.muscles.forEach(m => { if (underserved.includes(m.name)) score += m.contribution * (m.role === "direct" ? 3 : 1); });
    return { id, ...ex, score, directMuscles: ex.muscles.filter(m => m.role === "direct").map(m => m.name), isNew: !alreadyUsed.has(id) };
  }).filter(c => c.score > 0).sort((a, b) => a.isNew !== b.isNew ? (a.isNew ? -1 : 1) : b.score - a.score).slice(0, count);
}

export function calcBuilderWeeklyVol(weekTemplate) {
  const vol = {};
  weekTemplate.forEach(day => {
    if (day.isRest || !day.exercises.length) return;
    day.exercises.forEach(entry => {
      const exId = typeof entry === "string" ? entry : entry.id;
      const sets = entry.setDetails ? entry.setDetails.length : 3;
      const ex = EXERCISES[exId]; if (!ex) return;
      ex.muscles.forEach(m => { vol[m.name] = (vol[m.name] || 0) + sets * m.contribution; });
    });
  });
  return vol;
}
