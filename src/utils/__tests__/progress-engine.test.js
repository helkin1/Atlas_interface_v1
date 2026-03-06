import { describe, it, expect } from "vitest";
import {
  getWorkoutHistory, getExerciseHistory, detectPRs,
  getWeeklyVolumeTrend, getMuscleTrend, getCompletionRate, getOverviewStats,
} from "../progress-engine.js";

// Helper: build minimal monthData
function makeMonthData() {
  return [
    {
      weekNum: 1, label: "Week 1",
      days: [
        { dayNum: 1, date: new Date(2025, 0, 6), label: "Push A", isRest: false, exercises: [
          { exercise_id: "barbell_bench_press", sets: [{ r: 10, w: 135 }, { r: 8, w: 145 }] },
        ]},
        { dayNum: 2, date: new Date(2025, 0, 7), label: "Pull A", isRest: false, exercises: [
          { exercise_id: "barbell_row", sets: [{ r: 10, w: 135 }] },
        ]},
        { dayNum: 3, date: new Date(2025, 0, 8), label: "Rest", isRest: true, exercises: [] },
      ],
    },
  ];
}

const PLAN_ID = "plan_test123";

function makeLogs() {
  return {
    [`${PLAN_ID}:1`]: { "0_0": { w: 135, reps: 10 }, "0_1": { w: 150, reps: 8 } },
    [`${PLAN_ID}:2`]: { "0_0": { w: 135, reps: 10 } },
  };
}

describe("getWorkoutHistory", () => {
  it("returns completed workout entries", () => {
    const history = getWorkoutHistory(makeLogs(), makeMonthData(), PLAN_ID);
    expect(history).toHaveLength(2);
    expect(history[0].dayNum).toBe(1);
    expect(history[0].label).toBe("Push A");
  });

  it("calculates completion percentage", () => {
    const history = getWorkoutHistory(makeLogs(), makeMonthData(), PLAN_ID);
    expect(history[0].pct).toBe(100); // 2/2 sets logged
  });

  it("calculates total volume", () => {
    const history = getWorkoutHistory(makeLogs(), makeMonthData(), PLAN_ID);
    // 135*10 + 150*8 = 1350 + 1200 = 2550
    expect(history[0].totalVolume).toBe(2550);
  });

  it("skips rest days and unlogged days", () => {
    const history = getWorkoutHistory({}, makeMonthData(), PLAN_ID);
    expect(history).toHaveLength(0);
  });
});

describe("getExerciseHistory", () => {
  it("groups sessions by exercise", () => {
    const exHistory = getExerciseHistory(makeLogs(), makeMonthData(), PLAN_ID);
    expect(exHistory.barbell_bench_press).toBeDefined();
    expect(exHistory.barbell_bench_press).toHaveLength(1);
    expect(exHistory.barbell_row).toHaveLength(1);
  });

  it("tracks top weight and est1RM", () => {
    const exHistory = getExerciseHistory(makeLogs(), makeMonthData(), PLAN_ID);
    const bench = exHistory.barbell_bench_press[0];
    expect(bench.topWeight).toBe(150);
    expect(bench.est1RM).toBeGreaterThan(150);
  });
});

describe("detectPRs", () => {
  it("detects weight, 1RM, and volume PRs", () => {
    const exHistory = getExerciseHistory(makeLogs(), makeMonthData(), PLAN_ID);
    const prs = detectPRs(exHistory);
    expect(prs.barbell_bench_press).toBeDefined();
    expect(prs.barbell_bench_press.weight.value).toBe(150);
    expect(prs.barbell_bench_press.est1RM.value).toBeGreaterThan(0);
    expect(prs.barbell_bench_press.volume.value).toBeGreaterThan(0);
  });

  it("returns empty for no sessions", () => {
    expect(detectPRs({})).toEqual({});
  });
});

describe("getWeeklyVolumeTrend", () => {
  it("returns per-week volume stats", () => {
    const trend = getWeeklyVolumeTrend(makeLogs(), makeMonthData(), PLAN_ID);
    expect(trend).toHaveLength(1);
    expect(trend[0].weekNum).toBe(1);
    expect(trend[0].totalVolume).toBeGreaterThan(0);
    expect(trend[0].completedSets).toBe(3);
  });
});

describe("getMuscleTrend", () => {
  it("returns per-muscle weekly effective sets", () => {
    const trend = getMuscleTrend(makeLogs(), makeMonthData(), PLAN_ID);
    // bench press hits Chest, Triceps, Front Delts; barbell row hits Upper Back, Lats, Biceps, Rear Delts
    expect(trend.Chest).toBeDefined();
    expect(trend.Chest[0].weekNum).toBe(1);
    expect(trend.Chest[0].effectiveSets).toBeGreaterThan(0);
  });
});

describe("getCompletionRate", () => {
  it("calculates training day completion", () => {
    const rate = getCompletionRate(makeLogs(), makeMonthData(), PLAN_ID);
    expect(rate.trainingDays).toBe(2); // 2 non-rest days
    expect(rate.completedDays).toBe(2);
    expect(rate.pct).toBe(100);
  });

  it("handles zero training days", () => {
    const allRest = [{ weekNum: 1, days: [{ isRest: true, dayNum: 1 }] }];
    const rate = getCompletionRate({}, allRest, PLAN_ID);
    expect(rate.pct).toBe(0);
  });
});

describe("getOverviewStats", () => {
  it("returns aggregated stats", () => {
    const stats = getOverviewStats(makeLogs(), makeMonthData(), PLAN_ID);
    expect(stats.totalWorkouts).toBe(2);
    expect(stats.totalVolume).toBeGreaterThan(0);
    expect(stats.avgCompletion).toBe(100);
  });

  it("calculates streak from the end", () => {
    const stats = getOverviewStats(makeLogs(), makeMonthData(), PLAN_ID);
    expect(stats.streak).toBe(2); // both training days completed
  });

  it("streak breaks on unlogged day", () => {
    const logs = { [`${PLAN_ID}:2`]: { "0_0": { w: 135, reps: 10 } } }; // only day 2 logged
    const stats = getOverviewStats(logs, makeMonthData(), PLAN_ID);
    expect(stats.streak).toBe(1); // only last day
  });
});
