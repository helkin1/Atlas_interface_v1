// ============================================================
// science-engine.js — Atlas deterministic exercise science layer
// All volume math lives here. No LLM logic.
// Architecture: docs/atlas-architecture-v1.md
// ============================================================

import { EXERCISES, VOLUME_LANDMARKS } from "../data/exercise-data.js";
import { calcGoalPcts, overallGoalPct, getVolumeZone } from "./helpers.js";

// ── Primary muscles: flag prominently if undertrained ────────
// These represent the major movement patterns that must be covered.
const PRIMARY_MUSCLES = new Set([
  "Chest", "Upper Chest", "Lats", "Upper Back",
  "Quads", "Hamstrings", "Glutes",
  "Front Delts", "Side Delts", "Rear Delts",
  "Biceps", "Triceps",
]);

// ── Effective sets per muscle from a weekTemplate ────────────
// effective sets = raw sets × contribution weight
//   direct  = 1.0 (full stimulus)
//   partial = 0.5 (significant secondary stimulus)
//   minimal = 0.25 (low secondary stimulus)
function computeEffectiveSets(weekTemplate) {
  const vol = {};
  weekTemplate.forEach(day => {
    if (day.isRest || !day.exercises || !day.exercises.length) return;
    day.exercises.forEach(entry => {
      const exId = typeof entry === "string" ? entry : entry.id;
      const sets = entry.setDetails ? entry.setDetails.length : 3;
      const ex = EXERCISES[exId];
      if (!ex) return;
      ex.muscles.forEach(m => {
        vol[m.name] = (vol[m.name] || 0) + sets * m.contribution;
      });
    });
  });
  return vol;
}

// ── Frequency: training days per week each muscle appears ────
function computeFrequency(weekTemplate) {
  const freq = {};
  weekTemplate.forEach(day => {
    if (day.isRest || !day.exercises || !day.exercises.length) return;
    const dayMuscles = new Set();
    day.exercises.forEach(entry => {
      const exId = typeof entry === "string" ? entry : entry.id;
      const ex = EXERCISES[exId];
      if (!ex) return;
      ex.muscles.forEach(m => dayMuscles.add(m.name));
    });
    dayMuscles.forEach(m => { freq[m] = (freq[m] || 0) + 1; });
  });
  return freq;
}

// ── Push / Pull / Legs balance ───────────────────────────────
function computePatternBalance(weekTemplate) {
  const sets = { push: 0, pull: 0, legs: 0, core: 0 };
  weekTemplate.forEach(day => {
    if (day.isRest || !day.exercises || !day.exercises.length) return;
    day.exercises.forEach(entry => {
      const exId = typeof entry === "string" ? entry : entry.id;
      const n = entry.setDetails ? entry.setDetails.length : 3;
      const ex = EXERCISES[exId];
      if (!ex) return;
      if (sets[ex.pattern] !== undefined) sets[ex.pattern] += n;
    });
  });

  const ratio = sets.push > 0 ? sets.pull / sets.push : sets.pull > 0 ? Infinity : 1;

  let status = "ok";
  let label = "balanced";

  if (sets.push === 0 && sets.pull === 0) {
    status = "ok"; label = "legs/core only";
  } else if (sets.push === 0) {
    status = "critical"; label = "no push";
  } else if (sets.pull === 0) {
    status = "critical"; label = "no pull";
  } else if (ratio < 0.75) {
    status = "warning"; label = "push-heavy";
  } else if (ratio > 1.4) {
    status = "info"; label = "pull-heavy";
  }

  return { sets, ratio: Number.isFinite(ratio) ? Math.round(ratio * 100) / 100 : null, status, label };
}

// ── Beginner-facing alert messages ───────────────────────────
// Never expose MEV/MAV/MRV terminology directly (ai-dev-contract §5).
function generateAlerts({ goalPcts, patternBalance }) {
  const alerts = [];

  // Volume gaps (below weekly minimum)
  const sortedByGap = Object.entries(goalPcts)
    .filter(([m, data]) => {
      const lm = VOLUME_LANDMARKS[m];
      return lm && data.eff < lm.mev;
    })
    .sort((a, b) => {
      // Primary muscles first, then by how far below target
      const aPrimary = PRIMARY_MUSCLES.has(a[0]) ? 0 : 1;
      const bPrimary = PRIMARY_MUSCLES.has(b[0]) ? 0 : 1;
      if (aPrimary !== bPrimary) return aPrimary - bPrimary;
      return a[1].pct - b[1].pct;
    });

  sortedByGap.forEach(([muscle, data]) => {
    const lm = VOLUME_LANDMARKS[muscle];
    const got = Math.round(data.eff);
    const need = lm.mev;
    const severity = data.eff === 0 ? "critical" : "warning";

    alerts.push({
      id: `gap_${muscle.toLowerCase().replace(/[\s/]+/g, "_")}`,
      type: "gap",
      severity,
      muscle,
      isPrimary: PRIMARY_MUSCLES.has(muscle),
      title: data.eff === 0 ? `${muscle} not being trained` : `${muscle} needs more volume`,
      message: data.eff === 0
        ? `No sets targeting ${muscle}. Aim for at least ${need} sets per week.`
        : `~${got} sets/week — below the minimum for consistent progress (${need}+ sets/week).`,
    });
  });

  // Volume excesses (over recovery limit)
  Object.entries(goalPcts).forEach(([muscle, data]) => {
    const lm = VOLUME_LANDMARKS[muscle];
    if (!lm || data.eff <= lm.mrv) return;
    const got = Math.round(data.eff);
    alerts.push({
      id: `excess_${muscle.toLowerCase().replace(/[\s/]+/g, "_")}`,
      type: "excess",
      severity: "warning",
      muscle,
      isPrimary: PRIMARY_MUSCLES.has(muscle),
      title: `${muscle} volume is very high`,
      message: `~${got} sets/week exceeds the recommended recovery limit. Consider removing one exercise or reducing sets.`,
    });
  });

  // Push / pull balance
  const pb = patternBalance;
  if (pb.status === "critical" && pb.label === "no pull") {
    alerts.push({
      id: "balance_no_pull",
      type: "balance",
      severity: "critical",
      title: "No pulling movements",
      message: "Your plan has no back or bicep work. Add rows, pulldowns, or pull-ups to avoid muscle imbalances.",
    });
  } else if (pb.status === "critical" && pb.label === "no push") {
    alerts.push({
      id: "balance_no_push",
      type: "balance",
      severity: "critical",
      title: "No pushing movements",
      message: "Your plan has no pressing exercises. Add bench press, overhead press, or push-ups.",
    });
  } else if (pb.status === "warning" && pb.label === "push-heavy") {
    alerts.push({
      id: "balance_push_heavy",
      type: "balance",
      severity: "warning",
      title: "Plan is push-heavy",
      message: `${pb.sets.pull} pull sets vs ${pb.sets.push} push sets. Adding more rows or pulldowns can prevent shoulder problems over time.`,
    });
  } else if (pb.status === "info" && pb.label === "pull-heavy") {
    alerts.push({
      id: "balance_pull_heavy",
      type: "info",
      severity: "info",
      title: "Plan is pull-heavy",
      message: `${pb.sets.pull} pull sets vs ${pb.sets.push} push sets. This is generally fine, but consider matching with more pressing work.`,
    });
  }

  // Sort: critical → warning → info, primary muscles before secondary
  const severityOrder = { critical: 0, warning: 1, info: 2 };
  alerts.sort((a, b) => {
    if (severityOrder[a.severity] !== severityOrder[b.severity])
      return severityOrder[a.severity] - severityOrder[b.severity];
    return (a.isPrimary === b.isPrimary) ? 0 : a.isPrimary ? -1 : 1;
  });

  return alerts;
}

// ── Main export: full plan analysis ─────────────────────────
// Input:  weekTemplate (array of day objects from plan.weekTemplate)
// Output: structured report object — all deterministic, no LLM
export function analyzePlan(weekTemplate) {
  const effectiveSets = computeEffectiveSets(weekTemplate);
  const goalPcts = calcGoalPcts(effectiveSets);
  const overallScore = overallGoalPct(goalPcts);

  const volumeZones = {};
  Object.entries(effectiveSets).forEach(([m, eff]) => {
    volumeZones[m] = getVolumeZone(eff, VOLUME_LANDMARKS[m]);
  });
  // Also mark muscles with no volume
  Object.keys(VOLUME_LANDMARKS).forEach(m => {
    if (!volumeZones[m]) volumeZones[m] = "below";
  });

  const frequency = computeFrequency(weekTemplate);
  const patternBalance = computePatternBalance(weekTemplate);

  const gaps = Object.entries(goalPcts)
    .filter(([m, data]) => {
      const lm = VOLUME_LANDMARKS[m];
      return lm && data.eff < lm.mev;
    })
    .map(([muscle, data]) => ({
      muscle,
      eff: data.eff,
      target: data.target,
      pct: data.pct,
      zone: "below",
      isPrimary: PRIMARY_MUSCLES.has(muscle),
    }))
    .sort((a, b) => a.pct - b.pct);

  const excesses = Object.entries(goalPcts)
    .filter(([m, data]) => {
      const lm = VOLUME_LANDMARKS[m];
      return lm && data.eff > lm.mrv;
    })
    .map(([muscle, data]) => ({
      muscle,
      eff: data.eff,
      target: data.target,
      pct: data.pct,
      zone: "over",
      isPrimary: PRIMARY_MUSCLES.has(muscle),
    }))
    .sort((a, b) => b.pct - a.pct);

  const alerts = generateAlerts({ goalPcts, patternBalance });

  return {
    effectiveSets,   // { [muscle]: number }  — weighted effective sets/week
    volumeZones,     // { [muscle]: "below" | "productive" | "high" | "over" }
    goalPcts,        // { [muscle]: { eff, target, pct } }
    overallScore,    // 0-100 average % of weekly target
    gaps,            // muscles below minimum effective volume
    excesses,        // muscles above recovery limit
    patternBalance,  // { sets, ratio, status, label }
    frequency,       // { [muscle]: daysPerWeek }
    alerts,          // [ { id, type, severity, title, message } ]
  };
}
