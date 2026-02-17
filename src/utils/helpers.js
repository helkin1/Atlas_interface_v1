import { EXERCISES, VOLUME_LANDMARKS } from "../data/exercise-data.js";

export const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const MO_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const PATTERN_COLORS = {
  push: { bg: "rgba(61,220,132,0.1)", border: "rgba(61,220,132,0.25)", text: "#3DDC84" },
  pull: { bg: "rgba(167,139,250,0.1)", border: "rgba(167,139,250,0.25)", text: "#A78BFA" },
  legs: { bg: "rgba(76,158,255,0.1)", border: "rgba(76,158,255,0.25)", text: "#4C9EFF" },
};

export const MUSCLE_COLORS = {
  Chest: "#3DDC84", Quads: "#4C9EFF", Lats: "#A78BFA", Hamstrings: "#FF8A50",
  Glutes: "#F472B6", Triceps: "#FBBF24", "Front Delts": "#2DD4BF", Biceps: "#EF4444",
  "Side Delts": "#818CF8", "Upper Back": "#34D399", "Rear Delts": "#FB923C",
  Core: "#94A3B8", "Upper Chest": "#6EE7B7", Calves: "#A3A3A3", Traps: "#D4D4D8",
  "Lower Back": "#CA8A04", Forearms: "#78716C", "Rotator Cuff": "#7DD3FC", Brachialis: "#9CA3AF",
};

export function summarizeSets(entry) {
  const sd = entry.setDetails || [];
  if (!sd.length) return { count: 0, repsRange: "0", weightRange: "0" };
  const reps = sd.map(s => s.reps), weights = sd.map(s => s.weight);
  const minR = Math.min(...reps), maxR = Math.max(...reps);
  const minW = Math.min(...weights), maxW = Math.max(...weights);
  return { count: sd.length, repsRange: minR === maxR ? `${minR}` : `${minR}-${maxR}`, weightRange: minW === maxW ? (minW === 0 ? "BW" : `${minW}`) : `${minW}-${maxW}` };
}

export const getDayPattern = (d) => { if (d.isRest || !d.exercises.length) return null; const ex = EXERCISES[d.exercises[0].exercise_id]; return ex?.pattern || null; };
export const getDaySets = (d) => d.exercises.reduce((s, e) => s + e.sets.length, 0);
export const getDayVol = (d) => { let v = 0; d.exercises.forEach((e) => e.sets.forEach((s) => { v += s.w * s.r; })); return v; };
export const getWeekSets = (w) => w.days.reduce((s, d) => s + getDaySets(d), 0);
export const getWeekVol = (w) => w.days.reduce((s, d) => s + getDayVol(d), 0);

export function calcMuscleVol(exercises) {
  const vol = {};
  exercises.forEach((entry) => {
    const ex = EXERCISES[entry.exercise_id]; if (!ex) return;
    const n = entry.sets.length;
    ex.muscles.forEach((m) => { vol[m.name] = (vol[m.name] || 0) + n * m.contribution; });
  });
  return Object.entries(vol).sort((a, b) => b[1] - a[1]);
}

export function weekMuscleVol(week) {
  const vol = {};
  week.days.forEach((d) => {
    d.exercises.forEach((entry) => {
      const ex = EXERCISES[entry.exercise_id]; if (!ex) return;
      const n = entry.sets.length;
      ex.muscles.forEach((m) => { vol[m.name] = (vol[m.name] || 0) + n * m.contribution; });
    });
  });
  return vol;
}

export function getVolumeZone(sets, lm) {
  if (!lm) return "unknown";
  if (sets < lm.mev) return "below";
  if (sets <= lm.mav) return "productive";
  if (sets <= lm.mrv) return "high";
  return "over";
}

export function getZoneColor(zone) {
  return { below: "#EF4444", productive: "#3DDC84", high: "#FBBF24", over: "#F472B6", unknown: "#5A6478" }[zone];
}

export function getZoneText(zone) {
  return { below: "Below MEV", productive: "Productive", high: "Near MRV", over: "Over MRV", unknown: "\u2014" }[zone];
}

export function goalPctColor(pct) {
  if (pct >= 95) return "#3DDC84";
  if (pct >= 75) return "#FBBF24";
  if (pct >= 50) return "#FF8A50";
  return "#EF4444";
}

export function calcGoalPcts(muscleVol) {
  const results = {};
  Object.entries(muscleVol).forEach(([m, eff]) => {
    const lm = VOLUME_LANDMARKS[m];
    if (!lm) return;
    const target = lm.mav;
    const pct = target > 0 ? Math.round((eff / target) * 100) : 0;
    results[m] = { eff, target, pct };
  });
  Object.keys(VOLUME_LANDMARKS).forEach(m => {
    if (!results[m]) results[m] = { eff: 0, target: VOLUME_LANDMARKS[m].mav, pct: 0 };
  });
  return results;
}

export function overallGoalPct(goalPcts) {
  const entries = Object.values(goalPcts);
  if (!entries.length) return 0;
  return Math.round(entries.reduce((s, e) => s + Math.min(e.pct, 100), 0) / entries.length);
}
