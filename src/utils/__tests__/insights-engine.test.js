import { describe, it, expect } from "vitest";
import { generateInsights, getHighPriorityInsights, CATEGORY, PRIORITY } from "../insights-engine.js";

// ── Test helper: build a mock intelligence report ───────────

function makeReport(overrides = {}) {
  return {
    readiness: { overall: 70, components: { planQuality: 75, executionConsistency: 80, progressionTrend: 50 } },
    planAnalysis: {
      overallScore: 75,
      alerts: [],
      effectiveSets: { Chest: 12, Lats: 10, Quads: 8 },
      gaps: [],
      excesses: [],
      patternBalance: { sets: { push: 20, pull: 18, legs: 16 }, ratio: 0.9, status: "ok", label: "balanced" },
      frequency: { Chest: 2, Lats: 2, Quads: 2 },
    },
    progress: {
      overview: { totalWorkouts: 0, totalVolume: 0, avgCompletion: 0, streak: 0 },
      completion: { trainingDays: 0, completedDays: 0, pct: 0 },
      workoutHistory: [],
      weeklyTrend: [],
      prs: {},
    },
    intelligence: {
      volumeAdherence: {},
      strengthTrends: {},
      muscleBalance: {
        patternBalance: { sets: { push: 20, pull: 18, legs: 16 }, ratio: 0.9, status: "ok", label: "balanced" },
        imbalances: [],
        isBalanced: true,
      },
    },
    suggestions: { gapFills: [] },
    ...overrides,
  };
}

// ── Tests ─────────────────────────────────────────────────────

describe("generateInsights", () => {
  it("returns empty array for a report with no notable events", () => {
    const report = makeReport();
    const insights = generateInsights(report);
    expect(Array.isArray(insights)).toBe(true);
  });

  it("detects new weight PRs", () => {
    const report = makeReport({
      progress: {
        ...makeReport().progress,
        prs: {
          barbell_bench_press: {
            weight: { value: 225, date: "2025-01-15" },
            est1RM: { value: 260, date: "2025-01-15" },
            volume: { value: 5000, date: "2025-01-15" },
          },
        },
      },
    });

    const insights = generateInsights(report, null);
    const prInsights = insights.filter(i => i.id.startsWith("pr_"));
    expect(prInsights.length).toBeGreaterThan(0);
    expect(prInsights[0].category).toBe(CATEGORY.CELEBRATION);
  });

  it("detects PR improvements over previous snapshot", () => {
    const previousPRs = {
      barbell_bench_press: {
        weight: { value: 200, date: "2025-01-01" },
        est1RM: { value: 230, date: "2025-01-01" },
      },
    };

    const report = makeReport({
      progress: {
        ...makeReport().progress,
        prs: {
          barbell_bench_press: {
            weight: { value: 225, date: "2025-01-15" },
            est1RM: { value: 260, date: "2025-01-15" },
            volume: { value: 5000, date: "2025-01-15" },
          },
        },
      },
    });

    const insights = generateInsights(report, previousPRs);
    const weightPR = insights.find(i => i.id === "pr_weight_barbell_bench_press");
    expect(weightPR).toBeDefined();
    expect(weightPR.value).toBe(225);
  });

  it("does not generate PR insight when current matches previous", () => {
    const prs = {
      barbell_bench_press: {
        weight: { value: 200, date: "2025-01-01" },
        est1RM: { value: 230, date: "2025-01-01" },
        volume: { value: 4000, date: "2025-01-01" },
      },
    };

    const report = makeReport({
      progress: { ...makeReport().progress, prs },
    });

    const insights = generateInsights(report, prs);
    const prInsights = insights.filter(i => i.id.startsWith("pr_"));
    expect(prInsights.length).toBe(0);
  });

  it("detects streak milestones", () => {
    [3, 5, 7, 10].forEach(streak => {
      const report = makeReport({
        progress: {
          ...makeReport().progress,
          overview: { totalWorkouts: streak, totalVolume: 0, avgCompletion: 100, streak },
        },
      });

      const insights = generateInsights(report);
      const streakInsight = insights.find(i => i.id === `streak_${streak}`);
      expect(streakInsight).toBeDefined();
      expect(streakInsight.category).toBe(CATEGORY.CELEBRATION);
    });
  });

  it("does not detect non-milestone streaks", () => {
    const report = makeReport({
      progress: {
        ...makeReport().progress,
        overview: { totalWorkouts: 4, totalVolume: 0, avgCompletion: 100, streak: 4 },
      },
    });

    const insights = generateInsights(report);
    const streakInsight = insights.find(i => i.id.startsWith("streak_"));
    expect(streakInsight).toBeUndefined();
  });

  it("detects workout milestones", () => {
    const report = makeReport({
      progress: {
        ...makeReport().progress,
        overview: { totalWorkouts: 10, totalVolume: 0, avgCompletion: 100, streak: 0 },
      },
    });

    const insights = generateInsights(report);
    const milestone = insights.find(i => i.id === "milestone_10");
    expect(milestone).toBeDefined();
    expect(milestone.category).toBe(CATEGORY.CELEBRATION);
  });

  it("detects strength plateaus", () => {
    const report = makeReport({
      intelligence: {
        ...makeReport().intelligence,
        strengthTrends: {
          barbell_bench_press: { direction: "plateau", changePct: 1, sessions: 4, latest1RM: 200 },
        },
      },
    });

    const insights = generateInsights(report);
    const stall = insights.find(i => i.id === "stall_barbell_bench_press");
    expect(stall).toBeDefined();
    expect(stall.category).toBe(CATEGORY.WARNING);
  });

  it("detects strength regression", () => {
    const report = makeReport({
      intelligence: {
        ...makeReport().intelligence,
        strengthTrends: {
          barbell_back_squat: { direction: "regressing", changePct: -12, sessions: 4, latest1RM: 180 },
        },
      },
    });

    const insights = generateInsights(report);
    const regression = insights.find(i => i.id === "regression_barbell_back_squat");
    expect(regression).toBeDefined();
    expect(regression.priority).toBe(PRIORITY.HIGH);
  });

  it("detects volume drift (significantly under)", () => {
    const report = makeReport({
      intelligence: {
        ...makeReport().intelligence,
        volumeAdherence: {
          Chest: { planned: 12, actual: 4, ratio: 0.33, status: "significantly_under" },
          Lats: { planned: 10, actual: 3, ratio: 0.3, status: "significantly_under" },
        },
      },
    });

    const insights = generateInsights(report);
    const drift = insights.find(i => i.id === "volume_drift_under");
    expect(drift).toBeDefined();
    expect(drift.category).toBe(CATEGORY.WARNING);
    expect(drift.muscles).toContain("Chest");
  });

  it("detects low consistency", () => {
    const report = makeReport({
      progress: {
        ...makeReport().progress,
        completion: { trainingDays: 12, completedDays: 4, pct: 33 },
      },
    });

    const insights = generateInsights(report);
    const consistency = insights.find(i => i.id === "consistency_low");
    expect(consistency).toBeDefined();
    expect(consistency.priority).toBe(PRIORITY.HIGH);
  });

  it("celebrates high consistency", () => {
    const report = makeReport({
      progress: {
        ...makeReport().progress,
        completion: { trainingDays: 12, completedDays: 11, pct: 92 },
      },
    });

    const insights = generateInsights(report);
    const consistency = insights.find(i => i.id === "consistency_high");
    expect(consistency).toBeDefined();
    expect(consistency.category).toBe(CATEGORY.CELEBRATION);
  });

  it("detects critical plan imbalance", () => {
    const report = makeReport({
      intelligence: {
        ...makeReport().intelligence,
        muscleBalance: {
          patternBalance: { sets: { push: 20, pull: 0, legs: 16 }, ratio: 0, status: "critical", label: "no pull" },
          imbalances: [],
          isBalanced: false,
        },
      },
    });

    const insights = generateInsights(report);
    const balance = insights.find(i => i.id === "balance_critical");
    expect(balance).toBeDefined();
    expect(balance.priority).toBe(PRIORITY.HIGH);
  });

  it("suggests exercises for undertrained muscles", () => {
    const report = makeReport({
      intelligence: {
        ...makeReport().intelligence,
        muscleBalance: {
          patternBalance: { sets: { push: 20, pull: 18, legs: 16 }, ratio: 0.9, status: "ok", label: "balanced" },
          imbalances: [
            { muscle: "Rear Delts", sets: 2, mav: 12, pctOfMAV: 17, status: "undertrained" },
            { muscle: "Calves", sets: 1, mav: 12, pctOfMAV: 8, status: "undertrained" },
          ],
          isBalanced: false,
        },
      },
    });

    const insights = generateInsights(report);
    const suggestion = insights.find(i => i.id === "undertrained_muscles");
    expect(suggestion).toBeDefined();
    expect(suggestion.category).toBe(CATEGORY.SUGGESTION);
    expect(suggestion.muscles).toContain("Rear Delts");
  });

  it("sorts insights by priority then category", () => {
    const report = makeReport({
      progress: {
        ...makeReport().progress,
        overview: { totalWorkouts: 10, totalVolume: 50000, avgCompletion: 33, streak: 0 },
        completion: { trainingDays: 12, completedDays: 4, pct: 33 },
        prs: {
          barbell_bench_press: {
            weight: { value: 225, date: "2025-01-15" },
            est1RM: { value: 260, date: "2025-01-15" },
            volume: { value: 5000, date: "2025-01-15" },
          },
        },
      },
      intelligence: {
        ...makeReport().intelligence,
        strengthTrends: {
          barbell_back_squat: { direction: "regressing", changePct: -12, sessions: 4, latest1RM: 180 },
        },
      },
    });

    const insights = generateInsights(report, null);
    expect(insights.length).toBeGreaterThan(1);

    // First insight should be high priority
    expect(insights[0].priority).toBe(PRIORITY.HIGH);
  });

  it("deduplicates insights by id", () => {
    // Ensure no duplicate IDs even if generators could overlap
    const report = makeReport({
      progress: {
        ...makeReport().progress,
        overview: { totalWorkouts: 5, totalVolume: 0, avgCompletion: 100, streak: 5 },
      },
    });

    const insights = generateInsights(report);
    const ids = insights.map(i => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("getHighPriorityInsights", () => {
  it("returns only high priority insights", () => {
    const report = makeReport({
      progress: {
        ...makeReport().progress,
        overview: { totalWorkouts: 10, totalVolume: 50000, avgCompletion: 100, streak: 5 },
        completion: { trainingDays: 12, completedDays: 4, pct: 33 },
      },
    });

    const high = getHighPriorityInsights(report);
    high.forEach(i => expect(i.priority).toBe(PRIORITY.HIGH));
  });
});
