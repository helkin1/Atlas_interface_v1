// ============================================================
// insights-engine.js — Proactive insight generation
// Auto-generates user-facing insights from intelligence data.
// No LLM calls — deterministic pattern detection.
// Architecture: docs/atlas-architecture-v1.md (Loop 3)
// ============================================================

import { VOLUME_LANDMARKS } from "../data/exercise-data.js";

// ── Insight categories ──────────────────────────────────────

const CATEGORY = {
  CELEBRATION: "celebration",   // PRs, streaks, milestones
  WARNING: "warning",           // stalls, volume drift, overtraining
  SUGGESTION: "suggestion",     // actionable improvements
  INFO: "info",                 // neutral observations
};

const PRIORITY = { HIGH: 1, MEDIUM: 2, LOW: 3 };

// ── Insight generators ──────────────────────────────────────

function detectNewPRs(report, previousPRs) {
  const insights = [];
  const currentPRs = report.progress?.prs || {};

  Object.entries(currentPRs).forEach(([exId, pr]) => {
    const prev = previousPRs?.[exId];

    // Weight PR
    if (pr.weight.value > 0 && (!prev || pr.weight.value > prev.weight?.value)) {
      insights.push({
        id: `pr_weight_${exId}`,
        category: CATEGORY.CELEBRATION,
        priority: PRIORITY.HIGH,
        title: "New weight PR!",
        message: `${pr.weight.value} lbs — a new personal best.`,
        exerciseId: exId,
        metric: "weight",
        value: pr.weight.value,
      });
    }

    // Estimated 1RM PR
    if (pr.est1RM.value > 0 && (!prev || pr.est1RM.value > prev.est1RM?.value)) {
      insights.push({
        id: `pr_1rm_${exId}`,
        category: CATEGORY.CELEBRATION,
        priority: PRIORITY.MEDIUM,
        title: "New estimated 1RM!",
        message: `Estimated 1RM: ${pr.est1RM.value} lbs.`,
        exerciseId: exId,
        metric: "est1RM",
        value: pr.est1RM.value,
      });
    }
  });

  return insights;
}

function detectStreakMilestones(report) {
  const insights = [];
  const streak = report.progress?.overview?.streak || 0;
  const milestones = [3, 5, 7, 10, 14, 21, 28];

  if (milestones.includes(streak)) {
    insights.push({
      id: `streak_${streak}`,
      category: CATEGORY.CELEBRATION,
      priority: PRIORITY.HIGH,
      title: `${streak}-workout streak!`,
      message: `You've completed ${streak} training sessions in a row. Keep it going.`,
      metric: "streak",
      value: streak,
    });
  }

  return insights;
}

function detectWorkoutMilestones(report) {
  const insights = [];
  const total = report.progress?.overview?.totalWorkouts || 0;
  const milestones = [1, 5, 10, 25, 50, 75, 100, 150, 200];

  if (milestones.includes(total)) {
    insights.push({
      id: `milestone_${total}`,
      category: CATEGORY.CELEBRATION,
      priority: total >= 25 ? PRIORITY.HIGH : PRIORITY.MEDIUM,
      title: `${total} workouts completed!`,
      message: total === 1
        ? "First workout in the books. The hardest one is done."
        : `You've completed ${total} workouts. That's real consistency.`,
      metric: "totalWorkouts",
      value: total,
    });
  }

  return insights;
}

function detectStalls(report) {
  const insights = [];
  const trends = report.intelligence?.strengthTrends || {};

  Object.entries(trends).forEach(([exId, trend]) => {
    if (trend.direction === "plateau" && trend.sessions >= 3) {
      insights.push({
        id: `stall_${exId}`,
        category: CATEGORY.WARNING,
        priority: PRIORITY.MEDIUM,
        title: "Strength plateau detected",
        message: `No meaningful progress over ${trend.sessions} sessions. Consider changing rep ranges, adding volume, or swapping for a variation.`,
        exerciseId: exId,
        metric: "plateau",
        sessions: trend.sessions,
      });
    }

    if (trend.direction === "regressing" && trend.sessions >= 3) {
      insights.push({
        id: `regression_${exId}`,
        category: CATEGORY.WARNING,
        priority: PRIORITY.HIGH,
        title: "Strength regression detected",
        message: `Performance has dropped ${Math.abs(trend.changePct)}% over recent sessions. This could indicate fatigue, recovery issues, or need for a deload.`,
        exerciseId: exId,
        metric: "regression",
        changePct: trend.changePct,
      });
    }
  });

  return insights;
}

function detectVolumeDrift(report) {
  const insights = [];
  const adherence = report.intelligence?.volumeAdherence || {};

  const significantlyUnder = [];
  const significantlyOver = [];

  Object.entries(adherence).forEach(([muscle, data]) => {
    if (data.status === "significantly_under") significantlyUnder.push(muscle);
    if (data.status === "over") significantlyOver.push(muscle);
  });

  if (significantlyUnder.length > 0) {
    const top = significantlyUnder.slice(0, 3);
    insights.push({
      id: "volume_drift_under",
      category: CATEGORY.WARNING,
      priority: PRIORITY.MEDIUM,
      title: "Volume falling short",
      message: `${top.join(", ")}${significantlyUnder.length > 3 ? ` and ${significantlyUnder.length - 3} more` : ""} — actual training volume is well below what's planned. Try to complete all prescribed sets.`,
      muscles: significantlyUnder,
    });
  }

  if (significantlyOver.length > 0) {
    const top = significantlyOver.slice(0, 3);
    insights.push({
      id: "volume_drift_over",
      category: CATEGORY.INFO,
      priority: PRIORITY.LOW,
      title: "Exceeding planned volume",
      message: `${top.join(", ")} — you're doing more than planned. If recovery is fine, this is okay. If you're feeling run down, stick to the plan.`,
      muscles: significantlyOver,
    });
  }

  return insights;
}

function detectConsistencyIssues(report) {
  const insights = [];
  const pct = report.progress?.completion?.pct;

  if (pct === undefined || pct === null) return insights;

  if (pct < 50 && report.progress.completion.trainingDays >= 4) {
    insights.push({
      id: "consistency_low",
      category: CATEGORY.WARNING,
      priority: PRIORITY.HIGH,
      title: "Consistency is low",
      message: `Only ${pct}% of planned sessions completed. Consistency beats intensity — even partial workouts count. Consider reducing training days to a number you can sustain.`,
      metric: "completion",
      value: pct,
    });
  } else if (pct >= 90 && report.progress.completion.completedDays >= 4) {
    insights.push({
      id: "consistency_high",
      category: CATEGORY.CELEBRATION,
      priority: PRIORITY.MEDIUM,
      title: "Great consistency!",
      message: `${pct}% of planned sessions completed. This level of adherence drives real results.`,
      metric: "completion",
      value: pct,
    });
  }

  return insights;
}

function detectPlanQualityIssues(report) {
  const insights = [];
  const balance = report.intelligence?.muscleBalance;

  if (!balance) return insights;

  if (balance.patternBalance.status === "critical") {
    insights.push({
      id: "balance_critical",
      category: CATEGORY.WARNING,
      priority: PRIORITY.HIGH,
      title: "Major imbalance in your plan",
      message: `Your plan ${balance.patternBalance.label === "no pull" ? "has no pulling movements — add rows or pulldowns" : "has no pushing movements — add pressing exercises"} to prevent muscle imbalances.`,
    });
  }

  // Top undertrained muscles
  const undertrained = (balance.imbalances || []).filter(i => i.status === "undertrained").slice(0, 2);
  if (undertrained.length > 0) {
    const names = undertrained.map(i => i.muscle).join(" and ");
    insights.push({
      id: "undertrained_muscles",
      category: CATEGORY.SUGGESTION,
      priority: PRIORITY.MEDIUM,
      title: `${names} could use more work`,
      message: `These muscles are well below productive volume. Adding 1–2 exercises targeting them would improve your results.`,
      muscles: undertrained.map(i => i.muscle),
    });
  }

  return insights;
}

// ── Main export ─────────────────────────────────────────────

/**
 * Generate all proactive insights from an intelligence report.
 * @param {object} report - Output of intelligence-engine generateReport()
 * @param {object} [previousPRs] - Previous PR snapshot for delta detection
 * @returns {object[]} Sorted array of insight objects
 */
export function generateInsights(report, previousPRs = null) {
  const insights = [
    ...detectNewPRs(report, previousPRs),
    ...detectStreakMilestones(report),
    ...detectWorkoutMilestones(report),
    ...detectStalls(report),
    ...detectVolumeDrift(report),
    ...detectConsistencyIssues(report),
    ...detectPlanQualityIssues(report),
  ];

  // Deduplicate by id
  const seen = new Set();
  const unique = insights.filter(i => {
    if (seen.has(i.id)) return false;
    seen.add(i.id);
    return true;
  });

  // Sort: high priority first, celebrations before warnings at same priority
  const categoryOrder = {
    [CATEGORY.CELEBRATION]: 0,
    [CATEGORY.WARNING]: 1,
    [CATEGORY.SUGGESTION]: 2,
    [CATEGORY.INFO]: 3,
  };

  unique.sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    return (categoryOrder[a.category] || 3) - (categoryOrder[b.category] || 3);
  });

  return unique;
}

/**
 * Get only high-priority insights (for dashboard badges/notifications).
 */
export function getHighPriorityInsights(report, previousPRs = null) {
  return generateInsights(report, previousPRs).filter(i => i.priority === PRIORITY.HIGH);
}

export { CATEGORY, PRIORITY };
