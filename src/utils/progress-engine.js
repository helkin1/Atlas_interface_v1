/**
 * Progress data engine — transforms raw workout logs into chart-ready analytics.
 * Pure functions, no React dependencies.
 */

import { EXERCISES } from "../data/exercise-data.js";
import { getWorkoutLogKey } from "./storage.js";

/* ── Helpers ─────────────────────────────────────────────────── */

function est1RM(w, reps) {
  if (!w || !reps) return 0;
  return Math.round(w * (1 + reps / 30));
}

function parseDayLogs(dayLog, day) {
  // dayLog shape: { "0_0": { w, reps }, "0_1": { w, reps }, ... }
  // day shape: { exercises: [{ exercise_id, sets: [{ r, w }] }] }
  const byExercise = {};
  Object.entries(dayLog).forEach(([key, entry]) => {
    const [eiStr, siStr] = key.split("_");
    const ei = parseInt(eiStr, 10);
    const si = parseInt(siStr, 10);
    if (isNaN(ei) || isNaN(si)) return;
    const exercise = day.exercises[ei];
    if (!exercise) return;
    const exId = exercise.exercise_id;
    if (!byExercise[exId]) byExercise[exId] = { exerciseIdx: ei, sets: [] };
    byExercise[exId].sets.push({ w: entry.w || 0, reps: entry.reps || 0 });
  });
  return byExercise;
}

/* ── 1. Workout History ──────────────────────────────────────── */

export function getWorkoutHistory(logs, monthData, planId) {
  const history = [];
  monthData.forEach(week => {
    week.days.forEach(day => {
      if (day.isRest) return;
      const dayKey = getWorkoutLogKey(planId, day.dayNum);
      const dayLog = logs[dayKey];
      if (!dayLog || Object.keys(dayLog).length === 0) return;

      const totalSets = day.exercises.reduce((s, e) => s + e.sets.length, 0);
      const completedSets = Object.keys(dayLog).length;
      let totalVolume = 0;
      Object.values(dayLog).forEach(entry => {
        totalVolume += (entry.w || 0) * (entry.reps || 0);
      });

      history.push({
        dayNum: day.dayNum,
        date: day.date,
        label: day.label,
        weekNum: week.weekNum,
        weekLabel: week.label,
        exercises: day.exercises,
        dayLog,
        totalSets,
        completedSets,
        totalVolume,
        pct: totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0,
      });
    });
  });
  return history;
}

/* ── 2. Exercise History ─────────────────────────────────────── */

export function getExerciseHistory(logs, monthData, planId) {
  const exerciseMap = {};

  monthData.forEach(week => {
    week.days.forEach(day => {
      if (day.isRest) return;
      const dayKey = getWorkoutLogKey(planId, day.dayNum);
      const dayLog = logs[dayKey];
      if (!dayLog || Object.keys(dayLog).length === 0) return;

      const byExercise = parseDayLogs(dayLog, day);
      Object.entries(byExercise).forEach(([exId, data]) => {
        if (!exerciseMap[exId]) exerciseMap[exId] = [];
        const sets = data.sets;
        let topWeight = 0, topVolume = 0, bestForRM = { w: 0, reps: 0 };
        sets.forEach(s => {
          if (s.w > topWeight) topWeight = s.w;
          const vol = s.w * s.reps;
          if (vol > topVolume) topVolume = vol;
          if (est1RM(s.w, s.reps) > est1RM(bestForRM.w, bestForRM.reps)) {
            bestForRM = s;
          }
        });

        exerciseMap[exId].push({
          date: day.date,
          dayNum: day.dayNum,
          sets,
          topWeight,
          topVolume,
          est1RM: est1RM(bestForRM.w, bestForRM.reps),
        });
      });
    });
  });

  return exerciseMap;
}

/* ── 3. Detect PRs ───────────────────────────────────────────── */

export function detectPRs(exerciseHistory) {
  const prs = {};

  Object.entries(exerciseHistory).forEach(([exId, sessions]) => {
    let bestWeight = { value: 0, date: null };
    let best1RM = { value: 0, date: null };
    let bestVolume = { value: 0, date: null };

    sessions.forEach(session => {
      if (session.topWeight > bestWeight.value) {
        bestWeight = { value: session.topWeight, date: session.date };
      }
      if (session.est1RM > best1RM.value) {
        best1RM = { value: session.est1RM, date: session.date };
      }
      if (session.topVolume > bestVolume.value) {
        bestVolume = { value: session.topVolume, date: session.date };
      }
    });

    if (bestWeight.value > 0) {
      prs[exId] = { weight: bestWeight, est1RM: best1RM, volume: bestVolume };
    }
  });

  return prs;
}

/* ── 4. Weekly Volume Trend ──────────────────────────────────── */

export function getWeeklyVolumeTrend(logs, monthData, planId) {
  return monthData.map(week => {
    let totalSets = 0, completedSets = 0, totalVolume = 0;
    week.days.forEach(day => {
      if (day.isRest) return;
      totalSets += day.exercises.reduce((s, e) => s + e.sets.length, 0);
      const dayKey = getWorkoutLogKey(planId, day.dayNum);
      const dayLog = logs[dayKey];
      if (!dayLog) return;
      completedSets += Object.keys(dayLog).length;
      Object.values(dayLog).forEach(entry => {
        totalVolume += (entry.w || 0) * (entry.reps || 0);
      });
    });
    return { weekNum: week.weekNum, label: week.label, totalSets, completedSets, totalVolume };
  });
}

/* ── 5. Muscle Trend ─────────────────────────────────────────── */

export function getMuscleTrend(logs, monthData, planId) {
  const trend = {}; // { muscleName: [{ weekNum, effectiveSets }] }

  monthData.forEach(week => {
    const weekMuscle = {};
    week.days.forEach(day => {
      if (day.isRest) return;
      const dayKey = getWorkoutLogKey(planId, day.dayNum);
      const dayLog = logs[dayKey];
      if (!dayLog || Object.keys(dayLog).length === 0) return;

      const byExercise = parseDayLogs(dayLog, day);
      Object.entries(byExercise).forEach(([exId, data]) => {
        const ex = EXERCISES[exId];
        if (!ex) return;
        const nSets = data.sets.length;
        ex.muscles.forEach(m => {
          weekMuscle[m.name] = (weekMuscle[m.name] || 0) + nSets * m.contribution;
        });
      });
    });

    Object.entries(weekMuscle).forEach(([name, eff]) => {
      if (!trend[name]) trend[name] = [];
      trend[name].push({ weekNum: week.weekNum, effectiveSets: Math.round(eff * 10) / 10 });
    });
  });

  return trend;
}

/* ── 6. Completion Rate ──────────────────────────────────────── */

export function getCompletionRate(logs, monthData, planId) {
  let trainingDays = 0, completedDays = 0;

  monthData.forEach(week => {
    week.days.forEach(day => {
      if (day.isRest) return;
      trainingDays++;
      const dayKey = getWorkoutLogKey(planId, day.dayNum);
      const dayLog = logs[dayKey];
      if (dayLog && Object.keys(dayLog).length > 0) completedDays++;
    });
  });

  return {
    trainingDays,
    completedDays,
    pct: trainingDays > 0 ? Math.round((completedDays / trainingDays) * 100) : 0,
  };
}

/* ── 7. Overview Stats ───────────────────────────────────────── */

export function getOverviewStats(logs, monthData, planId) {
  const history = getWorkoutHistory(logs, monthData, planId);
  const completion = getCompletionRate(logs, monthData, planId);

  const totalWorkouts = history.length;
  const totalVolume = history.reduce((s, h) => s + h.totalVolume, 0);

  // Current streak: consecutive completed training days counting backwards
  let streak = 0;
  const allTrainingDays = [];
  monthData.forEach(week => {
    week.days.forEach(day => {
      if (!day.isRest) allTrainingDays.push(day);
    });
  });

  for (let i = allTrainingDays.length - 1; i >= 0; i--) {
    const day = allTrainingDays[i];
    const dayKey = getWorkoutLogKey(planId, day.dayNum);
    const dayLog = logs[dayKey];
    if (dayLog && Object.keys(dayLog).length > 0) {
      streak++;
    } else {
      break;
    }
  }

  return {
    totalWorkouts,
    totalVolume,
    avgCompletion: completion.pct,
    streak,
  };
}
