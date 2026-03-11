// ============================================================
// intelligence-engine.js — Unified intelligence orchestration layer
// Combines science-engine, progress-engine, and plan-engine outputs
// into a single coherent intelligence report.
// Architecture: docs/atlas-architecture-v1.md
// ============================================================

import { analyzePlan } from "./science-engine.js";
import {
  getWorkoutHistory,
  getExerciseHistory,
  detectPRs,
  getWeeklyVolumeTrend,
  getMuscleTrend,
  getCompletionRate,
  getOverviewStats,
} from "./progress-engine.js";
import { getGapSuggestions } from "./plan-engine.js";
import {
  VOLUME_LANDMARKS,
  getReadinessWeights,
  getAdherenceThresholds,
  getStrengthTrendThresholds,
} from "../data/rules-knowledge-base.js";

const READINESS_WEIGHTS = getReadinessWeights();
const ADHERENCE = getAdherenceThresholds();
const STRENGTH_THRESHOLDS = getStrengthTrendThresholds();

// ── Readiness score: how well-designed is the plan + how consistently executed ──

function computeReadinessScore(planAnalysis, completion, weeklyTrend) {
  // Plan quality: 0–100 from science-engine overall score
  const planScore = planAnalysis.overallScore;

  // Execution quality: completion rate 0–100
  const executionScore = completion.pct;

  // Progression signal: are weekly volumes trending up?
  let progressionScore = 50; // neutral default
  const completedWeeks = weeklyTrend.filter(w => w.completedSets > 0);
  if (completedWeeks.length >= 2) {
    const first = completedWeeks[0].totalVolume;
    const last = completedWeeks[completedWeeks.length - 1].totalVolume;
    if (first > 0) {
      const change = ((last - first) / first) * 100;
      // Clamp between 0–100: -20% → 0, 0% → 50, +20% → 100
      progressionScore = Math.max(0, Math.min(100, 50 + change * 2.5));
    }
  }

  // Weighted composite: plan design matters most early, execution matters more over time
  const hasData = completedWeeks.length > 0;
  const weights = hasData ? READINESS_WEIGHTS.withData : READINESS_WEIGHTS.noData;

  const score = Math.round(
    planScore * weights.plan +
    executionScore * weights.execution +
    progressionScore * weights.progression
  );

  return {
    overall: Math.max(0, Math.min(100, score)),
    components: {
      planQuality: planScore,
      executionConsistency: executionScore,
      progressionTrend: Math.round(progressionScore),
    },
  };
}

// ── Volume adherence: planned vs actual effective sets per muscle ──

function computeVolumeAdherence(planAnalysis, muscleTrend) {
  const planned = planAnalysis.effectiveSets;
  const adherence = {};

  Object.entries(planned).forEach(([muscle, plannedSets]) => {
    const trend = muscleTrend[muscle];
    if (!trend || trend.length === 0) {
      adherence[muscle] = { planned: plannedSets, actual: 0, ratio: 0, status: "no_data" };
      return;
    }

    // Average actual effective sets across logged weeks
    const avgActual = trend.reduce((s, w) => s + w.effectiveSets, 0) / trend.length;
    const ratio = plannedSets > 0 ? Math.round((avgActual / plannedSets) * 100) / 100 : 0;

    let status = "on_track";
    if (ratio < ADHERENCE.significantlyUnder) status = "significantly_under";
    else if (ratio < ADHERENCE.under) status = "under";
    else if (ratio > ADHERENCE.over) status = "over";

    adherence[muscle] = {
      planned: Math.round(plannedSets * 10) / 10,
      actual: Math.round(avgActual * 10) / 10,
      ratio,
      status,
    };
  });

  return adherence;
}

// ── Strength trends: per-exercise progression direction ──

function computeStrengthTrends(exerciseHistory) {
  const trends = {};

  Object.entries(exerciseHistory).forEach(([exId, sessions]) => {
    if (sessions.length < 2) {
      trends[exId] = { direction: "insufficient_data", sessions: sessions.length };
      return;
    }

    // Compare first half average 1RM to second half average 1RM
    const mid = Math.floor(sessions.length / 2);
    const firstHalf = sessions.slice(0, mid);
    const secondHalf = sessions.slice(mid);

    const avg1RM = (arr) => arr.reduce((s, s2) => s + s2.est1RM, 0) / arr.length;
    const first = avg1RM(firstHalf);
    const second = avg1RM(secondHalf);

    let direction = "plateau";
    let changePct = 0;
    if (first > 0) {
      changePct = Math.round(((second - first) / first) * 100);
      if (changePct >= STRENGTH_THRESHOLDS.progressingPct) direction = "progressing";
      else if (changePct <= STRENGTH_THRESHOLDS.regressingPct) direction = "regressing";
    }

    trends[exId] = {
      direction,
      changePct,
      sessions: sessions.length,
      latest1RM: sessions[sessions.length - 1].est1RM,
    };
  });

  return trends;
}

// ── Muscle balance check: compare planned volume ratios to actual ──

function computeMuscleBalanceStatus(planAnalysis) {
  const { effectiveSets, patternBalance } = planAnalysis;

  // Identify primary muscles with the largest imbalances relative to landmarks
  const imbalances = [];
  Object.entries(effectiveSets).forEach(([muscle, sets]) => {
    const lm = VOLUME_LANDMARKS[muscle];
    if (!lm) return;

    const pctOfMAV = Math.round((sets / lm.mav) * 100);
    if (pctOfMAV < 50 || pctOfMAV > 150) {
      imbalances.push({
        muscle,
        sets: Math.round(sets * 10) / 10,
        mav: lm.mav,
        pctOfMAV,
        status: pctOfMAV < 50 ? "undertrained" : "overtrained",
      });
    }
  });

  imbalances.sort((a, b) => {
    // Undertrained first, then sorted by severity
    if (a.status !== b.status) return a.status === "undertrained" ? -1 : 1;
    return a.status === "undertrained"
      ? a.pctOfMAV - b.pctOfMAV
      : b.pctOfMAV - a.pctOfMAV;
  });

  return {
    patternBalance,
    imbalances,
    isBalanced: imbalances.length === 0 && patternBalance.status !== "critical",
  };
}

// ── Main export: generate full intelligence report ──────────────

export function generateReport({ weekTemplate, logs, monthData, planId }) {
  // 1. Plan analysis (deterministic science)
  const planAnalysis = analyzePlan(weekTemplate);

  // 2. Progress data (from workout logs)
  const hasLogs = logs && monthData && planId;
  const workoutHistory = hasLogs ? getWorkoutHistory(logs, monthData, planId) : [];
  const exerciseHistory = hasLogs ? getExerciseHistory(logs, monthData, planId) : {};
  const prs = hasLogs ? detectPRs(exerciseHistory) : {};
  const weeklyTrend = hasLogs ? getWeeklyVolumeTrend(logs, monthData, planId) : [];
  const muscleTrend = hasLogs ? getMuscleTrend(logs, monthData, planId) : {};
  const completion = hasLogs ? getCompletionRate(logs, monthData, planId) : { trainingDays: 0, completedDays: 0, pct: 0 };
  const overview = hasLogs ? getOverviewStats(logs, monthData, planId) : { totalWorkouts: 0, totalVolume: 0, avgCompletion: 0, streak: 0 };

  // 3. Cross-referenced intelligence
  const readiness = computeReadinessScore(planAnalysis, completion, weeklyTrend);
  const volumeAdherence = hasLogs ? computeVolumeAdherence(planAnalysis, muscleTrend) : {};
  const strengthTrends = hasLogs ? computeStrengthTrends(exerciseHistory) : {};
  const muscleBalance = computeMuscleBalanceStatus(planAnalysis);

  // 4. Gap suggestions from plan-engine
  const gapSuggestions = getGapSuggestions(weekTemplate, 5);

  return {
    // Timestamp
    generatedAt: Date.now(),

    // Composite readiness score
    readiness,

    // Plan design quality (from science-engine)
    planAnalysis,

    // Execution data (from progress-engine)
    progress: {
      overview,
      completion,
      workoutHistory,
      weeklyTrend,
      prs,
    },

    // Cross-referenced insights
    intelligence: {
      volumeAdherence,
      strengthTrends,
      muscleBalance,
    },

    // Actionable suggestions
    suggestions: {
      gapFills: gapSuggestions,
    },
  };
}

// ── Lightweight summary for dashboard widgets ──────────────────

export function generateSummary({ weekTemplate, logs, monthData, planId }) {
  const planAnalysis = analyzePlan(weekTemplate);
  const hasLogs = logs && monthData && planId;
  const completion = hasLogs ? getCompletionRate(logs, monthData, planId) : { pct: 0 };
  const weeklyTrend = hasLogs ? getWeeklyVolumeTrend(logs, monthData, planId) : [];
  const overview = hasLogs ? getOverviewStats(logs, monthData, planId) : { totalWorkouts: 0, streak: 0 };

  const readiness = computeReadinessScore(planAnalysis, completion, weeklyTrend);

  return {
    readiness: readiness.overall,
    planScore: planAnalysis.overallScore,
    completionPct: completion.pct,
    totalWorkouts: overview.totalWorkouts,
    streak: overview.streak,
    alertCount: planAnalysis.alerts.length,
    gapCount: planAnalysis.gaps.length,
    topAlert: planAnalysis.alerts[0] || null,
  };
}
