// ============================================================
// progression-engine.js — Adaptive progression suggestions
// Generates next-session weight/rep/set recommendations based
// on performance trends. Pure deterministic logic.
// Architecture: docs/atlas-architecture-v1.md (Loop 2)
// ============================================================

import { EXERCISES } from "../data/exercise-data.js";
import { getProgressionRules, getDeloadParams } from "../data/rules-knowledge-base.js";

// ── Progression rules by rep range (sourced from knowledge base) ──
const PROGRESSION_RULES = getProgressionRules();
const DELOAD = getDeloadParams();

function getRepRange(targetReps) {
  if (targetReps <= 5) return PROGRESSION_RULES.strength;
  if (targetReps <= 12) return PROGRESSION_RULES.hypertrophy;
  return PROGRESSION_RULES.endurance;
}

function getWeightIncrement(exerciseId) {
  const ex = EXERCISES[exerciseId];
  if (!ex) return 5;
  return ex.equipment === "Barbell" ? 5 : 2.5;
}

// ── Analyze last session performance for one exercise ───────

function analyzeSetPerformance(plannedSets, actualSets) {
  if (!actualSets || actualSets.length === 0) {
    return { completed: false, hitAllTargets: false, avgReps: 0, avgWeight: 0, setsCompleted: 0 };
  }

  let hitAllTargets = true;
  let totalReps = 0;
  let totalWeight = 0;

  plannedSets.forEach((planned, i) => {
    const actual = actualSets[i];
    if (!actual) {
      hitAllTargets = false;
      return;
    }
    if (actual.reps < planned.r || (planned.w > 0 && actual.w < planned.w)) {
      hitAllTargets = false;
    }
    totalReps += actual.reps || 0;
    totalWeight += actual.w || 0;
  });

  const setsCompleted = actualSets.length;
  return {
    completed: setsCompleted >= plannedSets.length,
    hitAllTargets,
    avgReps: setsCompleted > 0 ? Math.round((totalReps / setsCompleted) * 10) / 10 : 0,
    avgWeight: setsCompleted > 0 ? Math.round((totalWeight / setsCompleted) * 10) / 10 : 0,
    setsCompleted,
  };
}

// ── Generate next-session suggestion for one exercise ───────

/**
 * @param {object} params
 * @param {string} params.exerciseId
 * @param {Array} params.plannedSets - [{r, w}, ...] from current plan
 * @param {Array} params.lastSessionSets - [{reps, w}, ...] from last logged session
 * @param {Array} [params.recentSessions] - Last 3+ sessions for trend analysis
 * @returns {object} suggestion with new sets and reasoning
 */
export function suggestProgression({ exerciseId, plannedSets, lastSessionSets, recentSessions = [] }) {
  if (!plannedSets || plannedSets.length === 0) {
    return { action: "no_data", sets: [], reason: "No planned sets to base suggestion on." };
  }

  const targetReps = plannedSets[0].r || 10;
  const targetWeight = plannedSets[0].w || 0;
  const range = getRepRange(targetReps);
  const increment = getWeightIncrement(exerciseId);

  // No log data → keep current plan
  if (!lastSessionSets || lastSessionSets.length === 0) {
    return {
      action: "maintain",
      sets: plannedSets.map(s => ({ r: s.r, w: s.w })),
      reason: "No recent data. Follow the current plan.",
    };
  }

  const perf = analyzeSetPerformance(plannedSets, lastSessionSets);

  // Check for consecutive successes (3+ sessions hitting all targets → definitely progress)
  const consecutiveSuccesses = countConsecutiveSuccesses(recentSessions, plannedSets);

  // ── Decision logic ──

  // 1. Hit all targets on all sets → increase weight (double progression)
  if (perf.hitAllTargets && perf.completed) {
    // If bodyweight exercise (w=0), increase reps instead
    if (targetWeight === 0) {
      return {
        action: "increase_reps",
        sets: plannedSets.map(s => ({ r: s.r + range.repIncrement, w: 0 })),
        reason: `Hit all ${targetReps} reps across ${plannedSets.length} sets. Adding ${range.repIncrement} rep${range.repIncrement > 1 ? "s" : ""} per set.`,
      };
    }

    const newWeight = roundToNearest(targetWeight + increment, increment);
    // When increasing weight, drop reps to bottom of range to give room
    const newReps = Math.max(range.minReps, targetReps - 2);
    return {
      action: "increase_weight",
      sets: plannedSets.map(() => ({ r: newReps, w: newWeight })),
      reason: `Hit all targets. Increasing weight to ${newWeight} lbs (${targetReps > newReps ? `reps adjusted to ${newReps} at heavier weight` : "same reps"}).`,
    };
  }

  // 2. Completed all sets but didn't hit all rep targets → increase reps next time
  if (perf.completed && !perf.hitAllTargets && perf.avgReps >= targetReps - DELOAD.closeToTargetBuffer) {
    return {
      action: "maintain",
      sets: plannedSets.map(s => ({ r: s.r, w: s.w })),
      reason: `Close to hitting all targets (avg ${perf.avgReps} reps). Keep the same weight and push for full reps.`,
    };
  }

  // 3. Didn't complete all sets → possible fatigue or weight too heavy
  if (!perf.completed && perf.setsCompleted > 0) {
    // Only completed some sets
    if (perf.avgReps < targetReps * DELOAD.struggleThreshold) {
      // Struggling significantly → reduce weight
      const newWeight = roundToNearest(Math.max(0, targetWeight - increment), increment);
      return {
        action: "decrease_weight",
        sets: plannedSets.map(s => ({ r: s.r, w: newWeight })),
        reason: `Only completed ${perf.setsCompleted}/${plannedSets.length} sets with avg ${perf.avgReps} reps. Reducing weight to ${newWeight} lbs to build back up.`,
      };
    }

    // Somewhat short → maintain and aim to complete
    return {
      action: "maintain",
      sets: plannedSets.map(s => ({ r: s.r, w: s.w })),
      reason: `Completed ${perf.setsCompleted}/${plannedSets.length} sets. Focus on finishing all sets before increasing.`,
    };
  }

  // 4. Stalled for N+ sessions → suggest a micro-change
  if (consecutiveSuccesses === 0 && recentSessions.length >= DELOAD.stallSessionCount) {
    return {
      action: "deload_suggestion",
      sets: plannedSets.map(s => ({
        r: Math.min(s.r + DELOAD.deloadRepBoost, range.maxReps),
        w: roundToNearest(Math.max(0, targetWeight * (1 - DELOAD.weightReductionPct)), increment),
      })),
      reason: `No progress over ${DELOAD.stallSessionCount}+ sessions. Try a brief deload: reduce weight ${Math.round(DELOAD.weightReductionPct * 100)}% and increase reps to build back stronger.`,
    };
  }

  // Default: maintain
  return {
    action: "maintain",
    sets: plannedSets.map(s => ({ r: s.r, w: s.w })),
    reason: "Keep current targets and focus on form and full completion.",
  };
}

// ── Batch: generate suggestions for an entire workout day ───

/**
 * @param {object} params
 * @param {object} params.day - Day object from monthData { exercises: [...] }
 * @param {object} params.dayLog - Logged data { "0_0": {w, reps}, ... }
 * @param {object} params.exerciseHistory - From progress-engine getExerciseHistory()
 * @returns {object[]} Array of per-exercise suggestions
 */
export function suggestDayProgression({ day, dayLog, exerciseHistory }) {
  if (!day || !day.exercises) return [];

  return day.exercises.map((exercise, ei) => {
    const exId = exercise.exercise_id;
    const plannedSets = exercise.sets; // [{r, w}, ...]

    // Extract last session's actual sets for this exercise from dayLog
    const actualSets = [];
    if (dayLog) {
      plannedSets.forEach((_, si) => {
        const key = `${ei}_${si}`;
        const logged = dayLog[key];
        if (logged) {
          actualSets.push({ reps: logged.reps || 0, w: logged.w || 0 });
        }
      });
    }

    // Get recent sessions from exercise history
    const history = exerciseHistory?.[exId] || [];
    const recentSessions = history.slice(-5).map(session => session.sets);

    const suggestion = suggestProgression({
      exerciseId: exId,
      plannedSets,
      lastSessionSets: actualSets,
      recentSessions,
    });

    return {
      exerciseId: exId,
      exerciseName: EXERCISES[exId]?.name || exId,
      ...suggestion,
    };
  });
}

// ── Helpers ──────────────────────────────────────────────────

function roundToNearest(value, increment) {
  if (increment <= 0) return value;
  return Math.round(value / increment) * increment;
}

function countConsecutiveSuccesses(recentSessions, plannedSets) {
  if (!recentSessions || recentSessions.length === 0) return 0;

  let count = 0;
  const targetReps = plannedSets[0]?.r || 0;
  const targetWeight = plannedSets[0]?.w || 0;

  // Count backwards from most recent
  for (let i = recentSessions.length - 1; i >= 0; i--) {
    const session = recentSessions[i];
    if (!session || session.length < plannedSets.length) break;

    const allHit = session.every(s =>
      (s.reps || 0) >= targetReps && (targetWeight === 0 || (s.w || 0) >= targetWeight)
    );

    if (allHit) count++;
    else break;
  }

  return count;
}
