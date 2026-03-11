import { describe, it, expect } from "vitest";
import { generateReport, generateSummary } from "../intelligence-engine.js";
import { buildPlanFromPreset, buildMonthFromPlan } from "../plan-engine.js";

// ── Test helpers ──────────────────────────────────────────────

function makePlan() {
  return buildPlanFromPreset("ppl");
}

function makeMonthData(plan) {
  return buildMonthFromPlan(plan);
}

function makeLogs(monthData, planId, { fillRate = 1.0, weight = 100, reps = 10 } = {}) {
  const logs = {};
  monthData.forEach(week => {
    week.days.forEach(day => {
      if (day.isRest) return;
      if (fillRate < 1.0 && Math.random() > fillRate) return;
      // Key format must match getWorkoutLogKey: `${planId}:${dayNum}`
      const key = `${planId}:${day.dayNum}`;
      const dayLog = {};
      day.exercises.forEach((ex, ei) => {
        ex.sets.forEach((_, si) => {
          dayLog[`${ei}_${si}`] = { w: weight, reps };
        });
      });
      logs[key] = dayLog;
    });
  });
  return logs;
}

// ── Tests ─────────────────────────────────────────────────────

describe("generateReport", () => {
  it("returns all expected top-level keys", () => {
    const plan = makePlan();
    const report = generateReport({ weekTemplate: plan.weekTemplate });

    expect(report).toHaveProperty("generatedAt");
    expect(report).toHaveProperty("readiness");
    expect(report).toHaveProperty("planAnalysis");
    expect(report).toHaveProperty("progress");
    expect(report).toHaveProperty("intelligence");
    expect(report).toHaveProperty("suggestions");
  });

  it("readiness has overall score and components", () => {
    const plan = makePlan();
    const report = generateReport({ weekTemplate: plan.weekTemplate });

    expect(report.readiness.overall).toBeGreaterThanOrEqual(0);
    expect(report.readiness.overall).toBeLessThanOrEqual(100);
    expect(report.readiness.components).toHaveProperty("planQuality");
    expect(report.readiness.components).toHaveProperty("executionConsistency");
    expect(report.readiness.components).toHaveProperty("progressionTrend");
  });

  it("plan-only report (no logs) uses planQuality as sole readiness signal", () => {
    const plan = makePlan();
    const report = generateReport({ weekTemplate: plan.weekTemplate });

    // With no logs, readiness should equal planQuality
    expect(report.readiness.overall).toBe(report.readiness.components.planQuality);
    expect(report.readiness.components.executionConsistency).toBe(0);
  });

  it("includes plan analysis from science-engine", () => {
    const plan = makePlan();
    const report = generateReport({ weekTemplate: plan.weekTemplate });

    expect(report.planAnalysis.overallScore).toBeGreaterThan(0);
    expect(report.planAnalysis.alerts).toBeDefined();
    expect(report.planAnalysis.effectiveSets).toBeDefined();
  });

  it("includes progress data when logs are provided", () => {
    const plan = makePlan();
    const monthData = makeMonthData(plan);
    const logs = makeLogs(monthData, plan.planId);

    const report = generateReport({
      weekTemplate: plan.weekTemplate,
      logs,
      monthData,
      planId: plan.planId,
    });

    expect(report.progress.overview.totalWorkouts).toBeGreaterThan(0);
    expect(report.progress.completion.pct).toBeGreaterThan(0);
    expect(report.progress.weeklyTrend.length).toBeGreaterThan(0);
  });

  it("computes volume adherence when logs exist", () => {
    const plan = makePlan();
    const monthData = makeMonthData(plan);
    const logs = makeLogs(monthData, plan.planId);

    const report = generateReport({
      weekTemplate: plan.weekTemplate,
      logs,
      monthData,
      planId: plan.planId,
    });

    const adherence = report.intelligence.volumeAdherence;
    expect(Object.keys(adherence).length).toBeGreaterThan(0);

    // Each entry should have planned, actual, ratio, status
    const first = Object.values(adherence)[0];
    expect(first).toHaveProperty("planned");
    expect(first).toHaveProperty("actual");
    expect(first).toHaveProperty("ratio");
    expect(first).toHaveProperty("status");
  });

  it("computes strength trends when exercise history exists", () => {
    const plan = makePlan();
    const monthData = makeMonthData(plan);
    const logs = makeLogs(monthData, plan.planId);

    const report = generateReport({
      weekTemplate: plan.weekTemplate,
      logs,
      monthData,
      planId: plan.planId,
    });

    const trends = report.intelligence.strengthTrends;
    expect(Object.keys(trends).length).toBeGreaterThan(0);

    const first = Object.values(trends)[0];
    expect(first).toHaveProperty("direction");
    expect(first).toHaveProperty("sessions");
  });

  it("includes muscle balance status", () => {
    const plan = makePlan();
    const report = generateReport({ weekTemplate: plan.weekTemplate });

    const balance = report.intelligence.muscleBalance;
    expect(balance).toHaveProperty("patternBalance");
    expect(balance).toHaveProperty("imbalances");
    expect(balance).toHaveProperty("isBalanced");
  });

  it("includes gap suggestions", () => {
    const plan = makePlan();
    const report = generateReport({ weekTemplate: plan.weekTemplate });

    expect(report.suggestions).toHaveProperty("gapFills");
    expect(Array.isArray(report.suggestions.gapFills)).toBe(true);
  });

  it("empty plan generates valid report", () => {
    const report = generateReport({ weekTemplate: [] });

    expect(report.readiness.overall).toBe(0);
    expect(report.planAnalysis.overallScore).toBe(0);
    expect(report.planAnalysis.alerts.length).toBeGreaterThan(0);
  });
});

describe("generateSummary", () => {
  it("returns lightweight summary object", () => {
    const plan = makePlan();
    const summary = generateSummary({ weekTemplate: plan.weekTemplate });

    expect(summary).toHaveProperty("readiness");
    expect(summary).toHaveProperty("planScore");
    expect(summary).toHaveProperty("completionPct");
    expect(summary).toHaveProperty("totalWorkouts");
    expect(summary).toHaveProperty("streak");
    expect(summary).toHaveProperty("alertCount");
    expect(summary).toHaveProperty("gapCount");
  });

  it("readiness is a number 0-100", () => {
    const plan = makePlan();
    const summary = generateSummary({ weekTemplate: plan.weekTemplate });

    expect(typeof summary.readiness).toBe("number");
    expect(summary.readiness).toBeGreaterThanOrEqual(0);
    expect(summary.readiness).toBeLessThanOrEqual(100);
  });
});
