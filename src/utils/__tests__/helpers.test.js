import { describe, it, expect } from "vitest";
import {
  DAY_NAMES, MO_NAMES, PATTERN_COLORS, MUSCLE_COLORS,
  summarizeSets, getDayPattern, getDaySets, getDayVol, getWeekSets, getWeekVol,
  calcMuscleVol, weekMuscleVol, getVolumeZone, getZoneColor, getZoneText,
  goalPctColor, calcGoalPcts, overallGoalPct,
} from "../helpers.js";

describe("helpers constants", () => {
  it("DAY_NAMES has 7 entries", () => {
    expect(DAY_NAMES).toHaveLength(7);
    expect(DAY_NAMES[0]).toBe("Sun");
  });

  it("MO_NAMES has 12 entries", () => {
    expect(MO_NAMES).toHaveLength(12);
    expect(MO_NAMES[0]).toBe("Jan");
  });

  it("PATTERN_COLORS has push/pull/legs", () => {
    expect(PATTERN_COLORS.push).toBeDefined();
    expect(PATTERN_COLORS.pull).toBeDefined();
    expect(PATTERN_COLORS.legs).toBeDefined();
  });

  it("MUSCLE_COLORS covers major muscles", () => {
    expect(MUSCLE_COLORS.Chest).toBeDefined();
    expect(MUSCLE_COLORS.Quads).toBeDefined();
    expect(MUSCLE_COLORS.Lats).toBeDefined();
  });
});

describe("summarizeSets", () => {
  it("returns zeroed summary for empty entry", () => {
    const result = summarizeSets({ setDetails: [] });
    expect(result.count).toBe(0);
    expect(result.repsRange).toBe("0");
  });

  it("returns correct summary for uniform sets", () => {
    const result = summarizeSets({ setDetails: [{ reps: 10, weight: 135 }, { reps: 10, weight: 135 }] });
    expect(result.count).toBe(2);
    expect(result.repsRange).toBe("10");
    expect(result.weightRange).toBe("135");
  });

  it("returns ranges for varied sets", () => {
    const result = summarizeSets({ setDetails: [{ reps: 8, weight: 100 }, { reps: 12, weight: 150 }] });
    expect(result.repsRange).toBe("8-12");
    expect(result.weightRange).toBe("100-150");
  });

  it("shows BW for zero weight", () => {
    const result = summarizeSets({ setDetails: [{ reps: 10, weight: 0 }] });
    expect(result.weightRange).toBe("BW");
  });
});

describe("getDayPattern", () => {
  it("returns null for rest days", () => {
    expect(getDayPattern({ isRest: true, exercises: [] })).toBeNull();
  });

  it("returns pattern of first exercise", () => {
    // barbell_bench_press is a push exercise
    const day = { isRest: false, exercises: [{ exercise_id: "barbell_bench_press", sets: [{ r: 10, w: 135 }] }] };
    expect(getDayPattern(day)).toBe("push");
  });
});

describe("getDaySets / getDayVol", () => {
  const day = {
    exercises: [
      { exercise_id: "barbell_bench_press", sets: [{ r: 10, w: 100 }, { r: 8, w: 120 }] },
      { exercise_id: "overhead_press_barbell", sets: [{ r: 10, w: 50 }] },
    ],
  };

  it("counts total sets", () => {
    expect(getDaySets(day)).toBe(3);
  });

  it("calculates total volume", () => {
    // (10*100) + (8*120) + (10*50) = 1000 + 960 + 500
    expect(getDayVol(day)).toBe(2460);
  });
});

describe("getWeekSets / getWeekVol", () => {
  const week = {
    days: [
      { exercises: [{ exercise_id: "a", sets: [{ r: 10, w: 100 }] }] },
      { exercises: [{ exercise_id: "b", sets: [{ r: 5, w: 200 }] }] },
    ],
  };

  it("sums sets across days", () => {
    expect(getWeekSets(week)).toBe(2);
  });

  it("sums volume across days", () => {
    expect(getWeekVol(week)).toBe(2000);
  });
});

describe("getVolumeZone", () => {
  const lm = { mev: 8, mav: 16, mrv: 22 };

  it("returns below when under mev", () => {
    expect(getVolumeZone(5, lm)).toBe("below");
  });

  it("returns productive in mev-mav range", () => {
    expect(getVolumeZone(12, lm)).toBe("productive");
  });

  it("returns high in mav-mrv range", () => {
    expect(getVolumeZone(18, lm)).toBe("high");
  });

  it("returns over when above mrv", () => {
    expect(getVolumeZone(25, lm)).toBe("over");
  });

  it("returns unknown if no landmark", () => {
    expect(getVolumeZone(10, null)).toBe("unknown");
  });
});

describe("getZoneColor / getZoneText", () => {
  it("maps zones to colors", () => {
    expect(getZoneColor("below")).toBe("#EF4444");
    expect(getZoneColor("productive")).toBe("#3DDC84");
  });

  it("maps zones to text", () => {
    expect(getZoneText("productive")).toBe("Productive");
    expect(getZoneText("over")).toBe("Over MRV");
  });
});

describe("goalPctColor", () => {
  it("returns green for >= 95%", () => {
    expect(goalPctColor(100)).toBe("#3DDC84");
  });

  it("returns yellow for >= 75%", () => {
    expect(goalPctColor(80)).toBe("#FBBF24");
  });

  it("returns orange for >= 50%", () => {
    expect(goalPctColor(60)).toBe("#FF8A50");
  });

  it("returns red for < 50%", () => {
    expect(goalPctColor(30)).toBe("#EF4444");
  });
});

describe("calcGoalPcts", () => {
  it("calculates percentages relative to MAV", () => {
    const result = calcGoalPcts({ Chest: 16 });
    expect(result.Chest.pct).toBe(100);
    expect(result.Chest.eff).toBe(16);
    expect(result.Chest.target).toBe(16);
  });

  it("fills missing muscles with 0", () => {
    const result = calcGoalPcts({});
    expect(result.Chest.pct).toBe(0);
    expect(result.Chest.eff).toBe(0);
  });
});

describe("overallGoalPct", () => {
  it("averages capped percentages", () => {
    const goalPcts = {
      Chest: { eff: 16, target: 16, pct: 100 },
      Quads: { eff: 8, target: 16, pct: 50 },
    };
    expect(overallGoalPct(goalPcts)).toBe(75);
  });

  it("caps individual pcts at 100", () => {
    const goalPcts = {
      Chest: { eff: 32, target: 16, pct: 200 },
    };
    expect(overallGoalPct(goalPcts)).toBe(100);
  });

  it("returns 0 for empty input", () => {
    expect(overallGoalPct({})).toBe(0);
  });
});

describe("calcMuscleVol", () => {
  it("accumulates weighted muscle volume", () => {
    const exercises = [
      { exercise_id: "barbell_bench_press", sets: [{ r: 10, w: 100 }, { r: 10, w: 100 }] },
    ];
    const vol = calcMuscleVol(exercises);
    // barbell_bench_press: Chest 1.0, Triceps 0.5, Front Delts 0.5
    const chestEntry = vol.find(([name]) => name === "Chest");
    expect(chestEntry).toBeDefined();
    expect(chestEntry[1]).toBe(2); // 2 sets * 1.0
  });
});

describe("weekMuscleVol", () => {
  it("accumulates volume across all days", () => {
    const week = {
      days: [
        { exercises: [{ exercise_id: "barbell_bench_press", sets: [{ r: 10, w: 100 }] }] },
        { exercises: [{ exercise_id: "barbell_bench_press", sets: [{ r: 10, w: 100 }] }] },
      ],
    };
    const vol = weekMuscleVol(week);
    expect(vol.Chest).toBe(2);
  });
});
