import { describe, it, expect } from "vitest";
import { suggestProgression, suggestDayProgression } from "../progression-engine.js";

// ── suggestProgression ──────────────────────────────────────

describe("suggestProgression", () => {
  it("returns maintain when no log data", () => {
    const result = suggestProgression({
      exerciseId: "barbell_bench_press",
      plannedSets: [{ r: 8, w: 135 }, { r: 8, w: 135 }, { r: 8, w: 135 }],
      lastSessionSets: [],
    });

    expect(result.action).toBe("maintain");
    expect(result.sets.length).toBe(3);
    expect(result.sets[0].w).toBe(135);
  });

  it("returns no_data when no planned sets", () => {
    const result = suggestProgression({
      exerciseId: "barbell_bench_press",
      plannedSets: [],
      lastSessionSets: [],
    });

    expect(result.action).toBe("no_data");
  });

  it("suggests weight increase when all targets hit (barbell)", () => {
    const result = suggestProgression({
      exerciseId: "barbell_bench_press",
      plannedSets: [{ r: 8, w: 135 }, { r: 8, w: 135 }, { r: 8, w: 135 }],
      lastSessionSets: [
        { reps: 8, w: 135 },
        { reps: 8, w: 135 },
        { reps: 8, w: 135 },
      ],
    });

    expect(result.action).toBe("increase_weight");
    expect(result.sets[0].w).toBe(140); // +5 lbs for barbell
  });

  it("suggests rep increase for bodyweight exercises", () => {
    const result = suggestProgression({
      exerciseId: "pull_up",
      plannedSets: [{ r: 8, w: 0 }, { r: 8, w: 0 }, { r: 8, w: 0 }],
      lastSessionSets: [
        { reps: 8, w: 0 },
        { reps: 8, w: 0 },
        { reps: 8, w: 0 },
      ],
    });

    expect(result.action).toBe("increase_reps");
    expect(result.sets[0].r).toBe(9); // +1 rep in hypertrophy range
    expect(result.sets[0].w).toBe(0);
  });

  it("maintains when close to targets but not quite there", () => {
    const result = suggestProgression({
      exerciseId: "barbell_bench_press",
      plannedSets: [{ r: 8, w: 135 }, { r: 8, w: 135 }, { r: 8, w: 135 }],
      lastSessionSets: [
        { reps: 8, w: 135 },
        { reps: 7, w: 135 },
        { reps: 7, w: 135 },
      ],
    });

    expect(result.action).toBe("maintain");
    expect(result.sets[0].w).toBe(135);
  });

  it("suggests weight decrease when struggling significantly", () => {
    const result = suggestProgression({
      exerciseId: "barbell_bench_press",
      plannedSets: [{ r: 8, w: 135 }, { r: 8, w: 135 }, { r: 8, w: 135 }],
      lastSessionSets: [
        { reps: 4, w: 135 },
        { reps: 3, w: 135 },
      ],
    });

    expect(result.action).toBe("decrease_weight");
    expect(result.sets[0].w).toBe(130); // -5 lbs
  });

  it("maintains when partially completing sets but doing okay on reps", () => {
    const result = suggestProgression({
      exerciseId: "barbell_bench_press",
      plannedSets: [{ r: 8, w: 135 }, { r: 8, w: 135 }, { r: 8, w: 135 }],
      lastSessionSets: [
        { reps: 8, w: 135 },
        { reps: 7, w: 135 },
      ],
    });

    expect(result.action).toBe("maintain");
  });

  it("suggests deload after 3+ sessions with no progress", () => {
    const stagnantSessions = [
      [{ reps: 6, w: 135 }, { reps: 5, w: 135 }, { reps: 4, w: 135 }],
      [{ reps: 6, w: 135 }, { reps: 5, w: 135 }, { reps: 4, w: 135 }],
      [{ reps: 6, w: 135 }, { reps: 5, w: 135 }, { reps: 4, w: 135 }],
    ];

    const result = suggestProgression({
      exerciseId: "barbell_bench_press",
      plannedSets: [{ r: 8, w: 135 }, { r: 8, w: 135 }, { r: 8, w: 135 }],
      lastSessionSets: stagnantSessions[2],
      recentSessions: stagnantSessions,
    });

    expect(result.action).toBe("deload_suggestion");
    expect(result.sets[0].w).toBeLessThan(135);
  });

  it("weight increments are rounded to nearest increment", () => {
    const result = suggestProgression({
      exerciseId: "barbell_bench_press",
      plannedSets: [{ r: 8, w: 137 }],
      lastSessionSets: [{ reps: 8, w: 137 }],
    });

    // Should round to nearest 5
    expect(result.sets[0].w % 5).toBe(0);
  });

  it("handles strength rep range correctly", () => {
    const result = suggestProgression({
      exerciseId: "barbell_back_squat",
      plannedSets: [{ r: 3, w: 315 }, { r: 3, w: 315 }],
      lastSessionSets: [
        { reps: 3, w: 315 },
        { reps: 3, w: 315 },
      ],
    });

    expect(result.action).toBe("increase_weight");
    expect(result.sets[0].w).toBe(320);
  });

  it("handles endurance rep range correctly", () => {
    const result = suggestProgression({
      exerciseId: "lateral_raise",
      plannedSets: [{ r: 15, w: 15 }],
      lastSessionSets: [{ reps: 15, w: 15 }],
    });

    expect(result.action).toBe("increase_weight");
  });
});

// ── suggestDayProgression ───────────────────────────────────

describe("suggestDayProgression", () => {
  it("returns suggestions for each exercise in the day", () => {
    const day = {
      exercises: [
        { exercise_id: "barbell_bench_press", sets: [{ r: 8, w: 135 }, { r: 8, w: 135 }] },
        { exercise_id: "dumbbell_fly", sets: [{ r: 12, w: 30 }, { r: 12, w: 30 }] },
      ],
    };

    const dayLog = {
      "0_0": { w: 135, reps: 8 },
      "0_1": { w: 135, reps: 8 },
      "1_0": { w: 30, reps: 12 },
      "1_1": { w: 30, reps: 12 },
    };

    const suggestions = suggestDayProgression({ day, dayLog, exerciseHistory: {} });

    expect(suggestions.length).toBe(2);
    expect(suggestions[0].exerciseId).toBe("barbell_bench_press");
    expect(suggestions[1].exerciseId).toBe("dumbbell_fly");
    expect(suggestions[0]).toHaveProperty("action");
    expect(suggestions[0]).toHaveProperty("sets");
    expect(suggestions[0]).toHaveProperty("reason");
    expect(suggestions[0]).toHaveProperty("exerciseName");
  });

  it("handles empty day", () => {
    const suggestions = suggestDayProgression({ day: { exercises: [] }, dayLog: {}, exerciseHistory: {} });
    expect(suggestions).toEqual([]);
  });

  it("handles null day", () => {
    const suggestions = suggestDayProgression({ day: null, dayLog: {}, exerciseHistory: {} });
    expect(suggestions).toEqual([]);
  });

  it("works without dayLog", () => {
    const day = {
      exercises: [
        { exercise_id: "barbell_bench_press", sets: [{ r: 8, w: 135 }] },
      ],
    };

    const suggestions = suggestDayProgression({ day, dayLog: null, exerciseHistory: {} });
    expect(suggestions.length).toBe(1);
    expect(suggestions[0].action).toBe("maintain");
  });
});
