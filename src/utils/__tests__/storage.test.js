import { describe, it, expect, beforeEach, vi } from "vitest";
import { getWorkoutLogKey, migrateLegacyWorkoutLog, DEFAULT_PROFILE } from "../storage.js";

describe("getWorkoutLogKey", () => {
  it("creates scoped key from planId and dayNum", () => {
    expect(getWorkoutLogKey("plan_abc", 5)).toBe("plan_abc:5");
  });

  it("uses 'legacy' prefix when planId is null", () => {
    expect(getWorkoutLogKey(null, 3)).toBe("legacy:3");
  });

  it("uses 'legacy' prefix when planId is undefined", () => {
    expect(getWorkoutLogKey(undefined, 7)).toBe("legacy:7");
  });
});

describe("migrateLegacyWorkoutLog", () => {
  it("migrates legacy key to scoped key", () => {
    const logs = { "5": { "0_0": { w: 100, reps: 10 } } };
    const result = migrateLegacyWorkoutLog(5, "plan_abc", logs);
    expect(result["plan_abc:5"]).toEqual({ "0_0": { w: 100, reps: 10 } });
    expect(result["5"]).toEqual({ "0_0": { w: 100, reps: 10 } }); // original preserved
  });

  it("does not overwrite existing scoped key", () => {
    const logs = {
      "5": { "0_0": { w: 100, reps: 10 } },
      "plan_abc:5": { "0_0": { w: 200, reps: 8 } },
    };
    const result = migrateLegacyWorkoutLog(5, "plan_abc", logs);
    expect(result["plan_abc:5"]).toEqual({ "0_0": { w: 200, reps: 8 } });
  });

  it("returns logs unchanged if no legacy key", () => {
    const logs = { "plan_abc:5": { "0_0": { w: 200, reps: 8 } } };
    const result = migrateLegacyWorkoutLog(5, "plan_abc", logs);
    expect(result).toEqual(logs);
  });
});

describe("DEFAULT_PROFILE", () => {
  it("has expected default values", () => {
    expect(DEFAULT_PROFILE.displayName).toBe("");
    expect(DEFAULT_PROFILE.unitPreference).toBe("imperial");
    expect(DEFAULT_PROFILE.onboardingCompleted).toBe(false);
    expect(DEFAULT_PROFILE.equipment).toEqual([]);
    expect(DEFAULT_PROFILE.injuries).toEqual([]);
    expect(DEFAULT_PROFILE.focusMuscles).toEqual([]);
    expect(DEFAULT_PROFILE.secondaryGoals).toEqual([]);
  });
});
