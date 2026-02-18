import { EXERCISES, EXERCISE_DEFAULTS, getExDefault } from "../data/exercise-data.js";
import { SPLIT_PRESETS } from "../data/split-presets.js";
import { calcGoalPcts } from "./helpers.js";

export function createPlanId() {
  return `plan_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function clonePlan(plan) {
  if (typeof structuredClone === "function") return structuredClone(plan);
  return JSON.parse(JSON.stringify(plan));
}

export function ensurePlanId(plan) {
  if (!plan) return plan;
  return plan.planId ? plan : { ...plan, planId: createPlanId() };
}

function parseStartDate(startDate) {
  if (!startDate) return null;
  if (startDate instanceof Date) return startDate;
  if (typeof startDate === "string") {
    const m = startDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  }
  const parsed = new Date(startDate);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function buildMonthFromPlan(plan) {
  const wt = plan.weekTemplate || [];
  const weeks = plan.weeks || 4;
  const progressRate = plan.progressRate || 2.5;
  const startDate = parseStartDate(plan.startDate) || new Date();
  // Align to next Monday if today
  if (!plan.startDate) { const dayOff = (8 - startDate.getDay()) % 7 || 7; startDate.setDate(startDate.getDate() + dayOff); }

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

/* ── Build a plan object from a preset key ────────────────── */

export function buildPlanFromPreset(key) {
  const preset = SPLIT_PRESETS[key];
  if (!preset) return null;

  const weekTemplate = preset.weekTemplate.map(d => ({
    ...d,
    isRest: d.isRest || (!d.exercises.length && d.label === "Rest"),
    exercises: d.exercises.map(exId => getExDefault(exId)),
  }));

  const trainingSequence = weekTemplate.filter(d => !d.isRest);

  return {
    planId: createPlanId(),
    splitKey: key,
    splitName: preset.name,
    weekTemplate,
    trainingSequence,
    cycleLength: preset.cycleLength || trainingSequence.length,
    weeks: 4,
    progressRate: 2.5,
  };
}

export const DEFAULT_PLAN = buildPlanFromPreset("ppl");

/* ── Redistribute training sequence across training slots ── */

export function redistributeTrainingDays(plan) {
  const wt = plan.weekTemplate || [];
  const seq = plan.trainingSequence || [];
  const trainingPositions = [];
  wt.forEach((d, i) => { if (!d.isRest) trainingPositions.push(i); });

  const rebuilt = wt.map((d, i) => {
    if (d.isRest) return { ...d, label: "Rest", exercises: [] };
    const seqIdx = trainingPositions.indexOf(i);
    if (seqIdx < seq.length) {
      return { ...seq[seqIdx], isRest: false };
    }
    // More training slots than sequence entries (custom — grow)
    const letter = String.fromCharCode(65 + seqIdx);
    return { label: `Training ${letter}`, isRest: false, exercises: [] };
  });

  return rebuilt;
}

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
