// ============================================================
// personalization-engine.js — Atlas personalization pipeline
// Transforms raw volume landmarks using the user's profile to
// produce personalized targets, muscle weights, and tier
// assignments. Every UI surface that shows plan quality should
// use this engine instead of raw VOLUME_LANDMARKS.
//
// Pipeline: Raw KB → Experience → Age → Sex → Goal → Injury →
//           Focus Override → Tier Assignment → Config
// ============================================================

import { VOLUME_LANDMARKS } from "../data/rules-knowledge-base.js";
import { INJURY_OPTIONS } from "../components/onboarding/constants.js";

// ── Experience scaling ──────────────────────────────────────
// Multipliers relative to intermediate baseline (1.0).
// Research: 01-experience-level.md
const EXPERIENCE_SCALES = {
  beginner:     { mev: 0.55, mav: 0.625, mrv: 0.725 },
  intermediate: { mev: 1.0,  mav: 1.0,   mrv: 1.0 },
  advanced:     { mev: 1.3,  mav: 1.3,   mrv: 1.35 },
};

// ── Age-based MRV reduction ─────────────────────────────────
// Only MRV is reduced — MEV and MAV stay the same because the
// productive training zone doesn't shrink with age, only the
// ceiling does. Research: 02-age.md
function getAgeMrvMultiplier(age) {
  if (age == null || age < 20) return 1.0;
  if (age < 30) return 1.0;
  if (age < 40) return 0.925;  // midpoint 0.90–0.95
  if (age < 50) return 0.80;   // midpoint 0.75–0.85
  if (age < 60) return 0.675;  // midpoint 0.60–0.75
  return 0.575;                 // midpoint 0.50–0.65
}

// ── Sex-based adjustment ────────────────────────────────────
// Women show higher fatigue resistance → can tolerate slightly
// more volume per session. Research: 03-sex.md
function getSexMrvMultiplier(sex) {
  if (sex === "female") return 1.075;  // midpoint 1.05–1.10
  return 1.0; // male, prefer_not_to_say, null
}

function getSexNotes(sex) {
  if (sex === "female") return [
    "Slightly higher volume tolerance due to fatigue resistance",
    "Upper body may benefit from proportionally more volume",
  ];
  if (sex === "prefer_not_to_say") return ["Using unmodified baseline (no sex adjustment)"];
  return [];
}

// ── Goal-based muscle weights ───────────────────────────────
// Research: 04-goals.md
// Weights: 1.0 = priority, 0.6 = supporting, 0.3 = maintenance
const GOAL_MUSCLE_WEIGHTS = {
  hypertrophy: {
    // Even distribution with slight emphasis on large visible muscles
    Chest: 1.0, "Upper Chest": 0.8, Lats: 1.0, "Upper Back": 0.8,
    Quads: 1.0, Hamstrings: 0.8, Glutes: 1.0,
    "Front Delts": 0.8, "Side Delts": 0.8, "Rear Delts": 0.6,
    Biceps: 0.6, Triceps: 0.6, Calves: 0.6,
    Core: 0.3, Traps: 0.3, "Lower Back": 0.3, Forearms: 0.3,
    "Rotator Cuff": 0.3, Brachialis: 0.3, Obliques: 0.3,
    "Hip Flexors": 0.3, Adductors: 0.3,
  },
  strength: {
    // Powerlifting emphasis: squat/bench/deadlift muscles
    Chest: 1.0, "Upper Chest": 0.6, Lats: 1.0, "Upper Back": 0.8,
    Quads: 1.0, Hamstrings: 0.8, Glutes: 1.0,
    "Front Delts": 0.8, "Side Delts": 0.6, "Rear Delts": 0.6,
    Biceps: 0.3, Triceps: 0.8, Calves: 0.3,
    Core: 0.6, Traps: 0.3, "Lower Back": 0.6, Forearms: 0.3,
    "Rotator Cuff": 0.3, Brachialis: 0.3, Obliques: 0.3,
    "Hip Flexors": 0.3, Adductors: 0.6,
  },
  endurance: {
    // Even distribution, core and postural muscles elevated
    Chest: 0.6, "Upper Chest": 0.3, Lats: 0.6, "Upper Back": 0.6,
    Quads: 0.8, Hamstrings: 0.8, Glutes: 0.8,
    "Front Delts": 0.6, "Side Delts": 0.6, "Rear Delts": 0.6,
    Biceps: 0.3, Triceps: 0.3, Calves: 0.8,
    Core: 0.8, Traps: 0.3, "Lower Back": 0.6, Forearms: 0.3,
    "Rotator Cuff": 0.3, Brachialis: 0.3, Obliques: 0.6,
    "Hip Flexors": 0.3, Adductors: 0.3,
  },
  recomp: {
    // Same as hypertrophy — prioritize lagging muscles, manage total volume
    Chest: 1.0, "Upper Chest": 0.8, Lats: 1.0, "Upper Back": 0.8,
    Quads: 1.0, Hamstrings: 0.8, Glutes: 1.0,
    "Front Delts": 0.8, "Side Delts": 0.8, "Rear Delts": 0.6,
    Biceps: 0.6, Triceps: 0.6, Calves: 0.6,
    Core: 0.3, Traps: 0.3, "Lower Back": 0.3, Forearms: 0.3,
    "Rotator Cuff": 0.3, Brachialis: 0.3, Obliques: 0.3,
    "Hip Flexors": 0.3, Adductors: 0.3,
  },
  general_fitness: {
    // All major groups equal — whole-body functional capacity
    Chest: 0.8, "Upper Chest": 0.6, Lats: 0.8, "Upper Back": 0.8,
    Quads: 0.8, Hamstrings: 0.8, Glutes: 0.8,
    "Front Delts": 0.6, "Side Delts": 0.6, "Rear Delts": 0.6,
    Biceps: 0.6, Triceps: 0.6, Calves: 0.6,
    Core: 0.6, Traps: 0.3, "Lower Back": 0.6, Forearms: 0.3,
    "Rotator Cuff": 0.3, Brachialis: 0.3, Obliques: 0.3,
    "Hip Flexors": 0.3, Adductors: 0.3,
  },
};

// ── Injury-to-muscle mapping ────────────────────────────────
// Research: 05-injuries.md
// "directly" affected muscles get weight=0 (excluded)
// "indirectly" affected muscles get weight reduced by 50%
const INJURY_MUSCLE_MAP = {
  shoulder: {
    directly: ["Front Delts", "Side Delts", "Rear Delts", "Rotator Cuff"],
    indirectly: ["Chest", "Upper Chest", "Triceps", "Lats", "Biceps"],
  },
  knee: {
    directly: ["Quads", "Hamstrings"],
    indirectly: ["Glutes", "Adductors", "Hip Flexors", "Calves"],
  },
  lower_back: {
    directly: ["Lower Back"],
    indirectly: ["Glutes", "Hamstrings", "Hip Flexors", "Core", "Obliques"],
  },
  wrist: {
    directly: ["Forearms"],
    indirectly: ["Brachialis", "Biceps"],
  },
  elbow: {
    directly: ["Biceps", "Triceps", "Brachialis", "Forearms"],
    indirectly: [],
  },
  hip: {
    directly: ["Hip Flexors", "Glutes", "Adductors"],
    indirectly: ["Quads", "Hamstrings", "Lower Back", "Core"],
  },
  neck: {
    directly: ["Traps"],
    indirectly: ["Side Delts", "Rear Delts", "Upper Back"],
  },
  ankle: {
    directly: ["Calves"],
    indirectly: ["Quads", "Glutes", "Hamstrings"],
  },
};

// ── Focus muscle name normalization ─────────────────────────
// FOCUS_MUSCLES uses simplified names like "Back", "Shoulders"
// that need mapping to specific Atlas muscle names.
const FOCUS_TO_MUSCLES = {
  Chest:      ["Chest", "Upper Chest"],
  Back:       ["Lats", "Upper Back"],
  Shoulders:  ["Front Delts", "Side Delts", "Rear Delts"],
  Quads:      ["Quads"],
  Hamstrings: ["Hamstrings"],
  Glutes:     ["Glutes"],
  Biceps:     ["Biceps", "Brachialis"],
  Triceps:    ["Triceps"],
  Calves:     ["Calves"],
  Core:       ["Core", "Obliques"],
  Forearms:   ["Forearms"],
  Traps:      ["Traps"],
};

// ── Tier thresholds ─────────────────────────────────────────
// Used to classify muscles based on final weight
function weightToTier(weight) {
  if (weight <= 0) return "excluded";
  if (weight >= 0.9) return "priority";
  if (weight >= 0.5) return "supporting";
  return "maintenance";
}

// ── Target computation ──────────────────────────────────────
// Priority muscles target MAV, supporting target midpoint(MEV,MAV),
// maintenance target MEV.
function tierToTarget(tier, landmarks) {
  switch (tier) {
    case "priority":    return landmarks.mav;
    case "supporting":  return Math.round(((landmarks.mev + landmarks.mav) / 2) * 10) / 10;
    case "maintenance": return landmarks.mev;
    case "excluded":    return 0;
    default:            return landmarks.mev;
  }
}

// ════════════════════════════════════════════════════════════
// MAIN PIPELINE
// ════════════════════════════════════════════════════════════

export function getPersonalizedConfig(profile) {
  if (!profile) profile = {};

  const experienceLevel = profile.experienceLevel || "intermediate";
  const age = profile.age;
  const sex = profile.sex;
  const primaryGoal = profile.primaryGoal || "hypertrophy";
  const injuries = profile.injuries || [];
  const focusMuscles = profile.focusMuscles || [];

  // ── Layer 1: Experience scaling ──
  const expScale = EXPERIENCE_SCALES[experienceLevel] || EXPERIENCE_SCALES.intermediate;

  // ── Layer 2: Age MRV modifier ──
  const ageRecoveryMod = getAgeMrvMultiplier(age);

  // ── Layer 3: Sex MRV modifier ──
  const sexMrvMod = getSexMrvMultiplier(sex);
  const sexNotes = getSexNotes(sex);

  // ── Compute adjusted landmarks ──
  const adjustedLandmarks = {};
  Object.entries(VOLUME_LANDMARKS).forEach(([muscle, lm]) => {
    adjustedLandmarks[muscle] = {
      mev: Math.round(lm.mev * expScale.mev * 10) / 10,
      mav: Math.round(lm.mav * expScale.mav * 10) / 10,
      mrv: Math.round(lm.mrv * expScale.mrv * ageRecoveryMod * sexMrvMod * 10) / 10,
    };
    // Ensure mev ≤ mav ≤ mrv
    if (adjustedLandmarks[muscle].mav < adjustedLandmarks[muscle].mev) {
      adjustedLandmarks[muscle].mav = adjustedLandmarks[muscle].mev;
    }
    if (adjustedLandmarks[muscle].mrv < adjustedLandmarks[muscle].mav) {
      adjustedLandmarks[muscle].mrv = adjustedLandmarks[muscle].mav;
    }
  });

  // ── Layer 4: Goal-based muscle weights ──
  const goalWeights = GOAL_MUSCLE_WEIGHTS[primaryGoal] || GOAL_MUSCLE_WEIGHTS.hypertrophy;
  const muscleWeights = {};
  Object.keys(VOLUME_LANDMARKS).forEach(muscle => {
    muscleWeights[muscle] = goalWeights[muscle] ?? 0.3;
  });

  // ── Layer 5: Injury exclusions ──
  const injuryExclusions = [];
  const indirectReductions = new Set();

  injuries.forEach(injuryId => {
    const mapping = INJURY_MUSCLE_MAP[injuryId];
    if (!mapping) return;

    mapping.directly.forEach(muscle => {
      if (muscleWeights[muscle] !== undefined) {
        muscleWeights[muscle] = 0;
        injuryExclusions.push(muscle);
      }
    });
    mapping.indirectly.forEach(muscle => {
      if (muscleWeights[muscle] !== undefined && muscleWeights[muscle] > 0) {
        indirectReductions.add(muscle);
      }
    });
  });

  // Apply indirect reductions (halve weight, but don't go below 0.15)
  indirectReductions.forEach(muscle => {
    if (muscleWeights[muscle] > 0) {
      muscleWeights[muscle] = Math.max(0.15, muscleWeights[muscle] * 0.5);
    }
  });

  // ── Layer 6: Focus muscle boost ──
  focusMuscles.forEach(focusName => {
    const mapped = FOCUS_TO_MUSCLES[focusName];
    if (!mapped) return;
    mapped.forEach(muscle => {
      if (muscleWeights[muscle] !== undefined && muscleWeights[muscle] > 0) {
        muscleWeights[muscle] = Math.max(muscleWeights[muscle], 1.0);
      }
    });
  });

  // ── Layer 7: Tier assignment + volume targets ──
  const muscleTiers = {};
  const volumeTargets = {};

  Object.keys(VOLUME_LANDMARKS).forEach(muscle => {
    const weight = muscleWeights[muscle];
    const tier = weightToTier(weight);
    muscleTiers[muscle] = tier;
    volumeTargets[muscle] = tierToTarget(tier, adjustedLandmarks[muscle]);
  });

  return {
    adjustedLandmarks,
    muscleWeights,
    muscleTiers,
    volumeTargets,
    modifiers: {
      experienceScale: expScale,
      ageRecoveryMod,
      sexMrvMod,
      sexNotes,
      injuryExclusions: [...new Set(injuryExclusions)],
      indirectReductions: [...indirectReductions],
    },
    // Pass-through for display
    experienceLevel,
    primaryGoal,
    age,
    sex,
  };
}

// ════════════════════════════════════════════════════════════
// SCORING FUNCTIONS
// ════════════════════════════════════════════════════════════

/**
 * Like calcGoalPcts but uses personalized volumeTargets instead of flat MAV.
 * @param {Object} muscleVol - { [muscle]: effectiveSets }
 * @param {Object} config - from getPersonalizedConfig()
 * @returns {Object} { [muscle]: { eff, target, pct, tier, weight } }
 */
export function calcPersonalizedGoalPcts(muscleVol, config) {
  const results = {};

  Object.keys(VOLUME_LANDMARKS).forEach(muscle => {
    const tier = config.muscleTiers[muscle];
    const target = config.volumeTargets[muscle];
    const weight = config.muscleWeights[muscle];
    const eff = muscleVol[muscle] || 0;

    if (tier === "excluded") {
      results[muscle] = { eff, target: 0, pct: 100, tier, weight: 0 };
      return;
    }

    const pct = target > 0 ? Math.round((eff / target) * 100) : (eff > 0 ? 100 : 0);
    results[muscle] = { eff, target, pct, tier, weight };
  });

  return results;
}

/**
 * Weighted overall score: priority muscles count more than maintenance.
 * Excluded muscles are omitted entirely.
 * @param {Object} goalPcts - from calcPersonalizedGoalPcts()
 * @param {Object} config - from getPersonalizedConfig()
 * @returns {number} 0-100
 */
export function personalizedOverallScore(goalPcts, config) {
  let weightedSum = 0;
  let totalWeight = 0;

  Object.entries(goalPcts).forEach(([muscle, data]) => {
    if (data.tier === "excluded") return;
    const w = config.muscleWeights[muscle] || 0;
    if (w <= 0) return;
    weightedSum += Math.min(data.pct, 100) * w;
    totalWeight += w;
  });

  return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
}

/**
 * Generate personalized alerts with tier-aware severity.
 * Priority muscle gaps are critical; maintenance gaps are info.
 */
export function getPersonalizedAlerts(planAnalysis, config) {
  const { effectiveSets } = planAnalysis;
  const alerts = [];

  Object.entries(config.adjustedLandmarks).forEach(([muscle, lm]) => {
    const tier = config.muscleTiers[muscle];
    if (tier === "excluded") return;

    const eff = effectiveSets[muscle] || 0;

    // Gap alert: below MEV
    if (eff < lm.mev) {
      const got = Math.round(eff * 10) / 10;
      let severity;
      if (tier === "priority") severity = eff === 0 ? "critical" : "warning";
      else if (tier === "supporting") severity = "warning";
      else severity = "info"; // maintenance

      alerts.push({
        id: `gap_${muscle.toLowerCase().replace(/[\s/]+/g, "_")}`,
        type: "gap",
        severity,
        muscle,
        tier,
        title: eff === 0 ? `${muscle} not being trained` : `${muscle} needs more volume`,
        message: eff === 0
          ? `No sets targeting ${muscle}. Aim for at least ${Math.round(lm.mev)} sets per week.`
          : `~${got} sets/week — below the minimum for consistent progress (${Math.round(lm.mev)}+ sets/week).`,
      });
    }

    // Excess alert: above MRV
    if (eff > lm.mrv) {
      const got = Math.round(eff);
      alerts.push({
        id: `excess_${muscle.toLowerCase().replace(/[\s/]+/g, "_")}`,
        type: "excess",
        severity: tier === "priority" ? "warning" : "info",
        muscle,
        tier,
        title: `${muscle} volume is very high`,
        message: `~${got} sets/week exceeds the recommended recovery limit. Consider removing one exercise or reducing sets.`,
      });
    }
  });

  // Injury exclusion notice
  const excluded = config.modifiers.injuryExclusions;
  if (excluded.length > 0) {
    alerts.push({
      id: "injury_exclusions",
      type: "injury",
      severity: "info",
      title: `${excluded.length} muscle${excluded.length > 1 ? "s" : ""} excluded (injury)`,
      message: `${excluded.join(", ")} excluded from plan scoring due to injury.`,
    });
  }

  // Sort: critical → warning → info, priority before others
  const severityOrder = { critical: 0, warning: 1, info: 2 };
  const tierOrder = { priority: 0, supporting: 1, maintenance: 2 };
  alerts.sort((a, b) => {
    if (severityOrder[a.severity] !== severityOrder[b.severity])
      return severityOrder[a.severity] - severityOrder[b.severity];
    return (tierOrder[a.tier] || 2) - (tierOrder[b.tier] || 2);
  });

  return alerts;
}

// ════════════════════════════════════════════════════════════
// DISPLAY HELPERS
// ════════════════════════════════════════════════════════════

/**
 * Human-readable tier explanation.
 */
export function describeTier(muscle, config) {
  const tier = config.muscleTiers[muscle];
  const goal = config.primaryGoal || "hypertrophy";
  const goalLabel = goal.charAt(0).toUpperCase() + goal.slice(1).replace("_", " ");

  switch (tier) {
    case "priority":
      return `Priority muscle (${goalLabel} goal)`;
    case "supporting":
      return `Supporting muscle (${goalLabel} goal)`;
    case "maintenance":
      return `Maintenance muscle — indirect volume sufficient`;
    case "excluded":
      return `Excluded (injury)`;
    default:
      return "";
  }
}

/**
 * Compact one-line profile summary.
 */
export function getProfileSummaryText(config) {
  const parts = [];

  const expLabel = config.experienceLevel
    ? config.experienceLevel.charAt(0).toUpperCase() + config.experienceLevel.slice(1)
    : null;
  if (expLabel) parts.push(expLabel);

  const goalLabel = config.primaryGoal
    ? config.primaryGoal.charAt(0).toUpperCase() + config.primaryGoal.slice(1).replace("_", " ")
    : null;
  if (goalLabel) parts.push(goalLabel);

  if (config.age) parts.push(`${config.age}y/o`);

  if (config.modifiers.injuryExclusions.length > 0) {
    parts.push(`${config.modifiers.injuryExclusions.length} injury adj.`);
  }

  return parts.join(" · ");
}

/**
 * Get modifier descriptions for display in UI.
 */
export function getModifierDescriptions(config) {
  const descriptions = [];
  const { modifiers, experienceLevel, age } = config;

  // Experience
  const expPct = Math.round(modifiers.experienceScale.mav * 100);
  if (experienceLevel === "beginner") {
    descriptions.push({ label: "Experience", value: `Volume targets at ${expPct}% (Beginner)` });
  } else if (experienceLevel === "advanced") {
    descriptions.push({ label: "Experience", value: `Volume targets at ${expPct}% (Advanced)` });
  }

  // Age
  if (age && modifiers.ageRecoveryMod < 1.0) {
    const pct = Math.round(modifiers.ageRecoveryMod * 100);
    descriptions.push({ label: "Age", value: `Recovery capacity at ${pct}% (Age ${age})` });
  }

  // Sex
  if (modifiers.sexMrvMod !== 1.0) {
    descriptions.push({ label: "Sex", value: modifiers.sexNotes[0] || "Sex-based adjustment active" });
  }

  // Injuries
  if (modifiers.injuryExclusions.length > 0) {
    descriptions.push({
      label: "Injuries",
      value: `${modifiers.injuryExclusions.join(", ")} excluded from scoring`,
    });
  }

  return descriptions;
}

/**
 * Get tier counts for display.
 */
export function getTierCounts(config) {
  const counts = { priority: 0, supporting: 0, maintenance: 0, excluded: 0 };
  Object.values(config.muscleTiers).forEach(tier => {
    counts[tier] = (counts[tier] || 0) + 1;
  });
  return counts;
}

/**
 * Get muscles grouped by tier, sorted by weight within each tier.
 */
export function getMusclesByTier(config) {
  const groups = { priority: [], supporting: [], maintenance: [], excluded: [] };
  Object.entries(config.muscleTiers).forEach(([muscle, tier]) => {
    groups[tier].push({ muscle, weight: config.muscleWeights[muscle] });
  });
  // Sort each group by weight descending
  Object.values(groups).forEach(arr => arr.sort((a, b) => b.weight - a.weight));
  return groups;
}
