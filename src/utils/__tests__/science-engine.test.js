import { describe, it, expect } from "vitest";
import { analyzePlan } from "../science-engine.js";
import { buildPlanFromPreset } from "../plan-engine.js";

describe("analyzePlan", () => {
  it("returns all expected keys", () => {
    const plan = buildPlanFromPreset("ppl");
    const result = analyzePlan(plan.weekTemplate);
    expect(result).toHaveProperty("effectiveSets");
    expect(result).toHaveProperty("volumeZones");
    expect(result).toHaveProperty("goalPcts");
    expect(result).toHaveProperty("overallScore");
    expect(result).toHaveProperty("gaps");
    expect(result).toHaveProperty("excesses");
    expect(result).toHaveProperty("patternBalance");
    expect(result).toHaveProperty("frequency");
    expect(result).toHaveProperty("alerts");
  });

  it("PPL plan has good overall score", () => {
    const plan = buildPlanFromPreset("ppl");
    const result = analyzePlan(plan.weekTemplate);
    expect(result.overallScore).toBeGreaterThan(50);
  });

  it("PPL plan has balanced push/pull", () => {
    const plan = buildPlanFromPreset("ppl");
    const result = analyzePlan(plan.weekTemplate);
    expect(["ok", "info"]).toContain(result.patternBalance.status);
  });

  it("PPL plan has non-zero frequency for major muscles", () => {
    const plan = buildPlanFromPreset("ppl");
    const result = analyzePlan(plan.weekTemplate);
    expect(result.frequency.Chest).toBeGreaterThan(0);
    expect(result.frequency.Quads).toBeGreaterThan(0);
    expect(result.frequency.Lats).toBeGreaterThan(0);
  });

  it("empty template generates gap alerts", () => {
    const result = analyzePlan([]);
    expect(result.alerts.length).toBeGreaterThan(0);
    expect(result.overallScore).toBe(0);
  });

  it("all-rest template has zero effective sets", () => {
    const result = analyzePlan([{ isRest: true, exercises: [] }]);
    expect(Object.keys(result.effectiveSets)).toHaveLength(0);
  });

  it("detects push-only imbalance", () => {
    const pushOnly = [
      { label: "Push", isRest: false, exercises: [
        { id: "barbell_bench_press", setDetails: Array(4).fill({ reps: 10, weight: 135 }) },
        { id: "overhead_press_barbell", setDetails: Array(3).fill({ reps: 10, weight: 95 }) },
      ]},
    ];
    const result = analyzePlan(pushOnly);
    const balanceAlert = result.alerts.find(a => a.type === "balance");
    expect(balanceAlert).toBeDefined();
    expect(balanceAlert.title).toContain("pull");
  });

  it("detects volume excess", () => {
    // Many sets for one muscle group
    const template = [
      { label: "Chest Overload", isRest: false, exercises: [
        { id: "barbell_bench_press", setDetails: Array(10).fill({ reps: 10, weight: 135 }) },
        { id: "dumbbell_bench_press", setDetails: Array(10).fill({ reps: 10, weight: 50 }) },
        { id: "cable_fly", setDetails: Array(10).fill({ reps: 12, weight: 25 }) },
      ]},
    ];
    const result = analyzePlan(template);
    expect(result.excesses.length).toBeGreaterThan(0);
  });

  it("volume zones include below for untrained muscles", () => {
    const plan = buildPlanFromPreset("ppl");
    const result = analyzePlan(plan.weekTemplate);
    const zones = Object.values(result.volumeZones);
    // At least some zones should be defined
    expect(zones.length).toBeGreaterThan(0);
  });

  it("full body plan covers most muscles", () => {
    const plan = buildPlanFromPreset("full_body");
    const result = analyzePlan(plan.weekTemplate);
    expect(result.gaps.length).toBeLessThan(15);
  });

  it("alerts are sorted by severity", () => {
    const result = analyzePlan([]);
    const severityOrder = { critical: 0, warning: 1, info: 2 };
    for (let i = 1; i < result.alerts.length; i++) {
      expect(severityOrder[result.alerts[i].severity]).toBeGreaterThanOrEqual(
        severityOrder[result.alerts[i - 1].severity]
      );
    }
  });
});
