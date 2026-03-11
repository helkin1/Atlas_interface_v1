import { describe, it, expect } from "vitest";
import {
  getAllRules,
  getRulesByConfidence,
  getVolumeLandmarks,
  getProgressionRules,
  getDeloadParams,
  getReadinessWeights,
  getAdherenceThresholds,
  getStrengthTrendThresholds,
  getContributionWeights,
  getInsightMilestones,
  getPlanEngineThresholds,
  VOLUME_LANDMARKS,
} from "../../data/rules-knowledge-base.js";

describe("Rules Knowledge Base", () => {
  describe("schema validation", () => {
    it("every rule has required fields", () => {
      const rules = getAllRules();
      const requiredFields = ["id", "category", "description", "values", "rationale", "sources", "confidence", "lastReviewed", "notes"];

      rules.forEach((rule) => {
        requiredFields.forEach((field) => {
          expect(rule, `Rule "${rule.id}" missing field "${field}"`).toHaveProperty(field);
        });
      });
    });

    it("no duplicate IDs", () => {
      const rules = getAllRules();
      const ids = rules.map((r) => r.id);
      const uniqueIds = new Set(ids);
      expect(ids.length).toBe(uniqueIds.size);
    });

    it("every rule has a valid confidence level", () => {
      const validLevels = ["researched", "expert_consensus", "placeholder"];
      getAllRules().forEach((rule) => {
        expect(validLevels, `Rule "${rule.id}" has invalid confidence "${rule.confidence}"`).toContain(rule.confidence);
      });
    });

    it("every source has a valid type", () => {
      const validTypes = ["meta_analysis", "rct", "peer_reviewed", "textbook", "expert_recommendation", "coaching_standard"];
      getAllRules().forEach((rule) => {
        rule.sources.forEach((source) => {
          expect(validTypes, `Rule "${rule.id}" source has invalid type "${source.type}"`).toContain(source.type);
        });
      });
    });

    it("researched/expert_consensus rules have at least one source", () => {
      getAllRules()
        .filter((r) => r.confidence !== "placeholder")
        .forEach((rule) => {
          expect(rule.sources.length, `Rule "${rule.id}" has confidence="${rule.confidence}" but no sources`).toBeGreaterThan(0);
        });
    });

    it("reviewed rules have a lastReviewed date", () => {
      getAllRules()
        .filter((r) => r.confidence !== "placeholder")
        .forEach((rule) => {
          expect(rule.lastReviewed, `Rule "${rule.id}" has confidence="${rule.confidence}" but no lastReviewed`).not.toBeNull();
        });
    });
  });

  describe("getRulesByConfidence", () => {
    it("filters correctly", () => {
      const placeholders = getRulesByConfidence("placeholder");
      expect(placeholders.length).toBeGreaterThan(0);
      placeholders.forEach((r) => expect(r.confidence).toBe("placeholder"));

      const researched = getRulesByConfidence("researched");
      expect(researched.length).toBeGreaterThan(0);
      researched.forEach((r) => expect(r.confidence).toBe("researched"));
    });
  });

  describe("getVolumeLandmarks", () => {
    it("returns all major muscle groups", () => {
      const vl = getVolumeLandmarks();
      const expected = ["Chest", "Lats", "Upper Back", "Quads", "Hamstrings", "Glutes", "Biceps", "Triceps", "Calves"];
      expected.forEach((m) => {
        expect(vl, `Missing muscle group "${m}"`).toHaveProperty(m);
        expect(vl[m]).toHaveProperty("mev");
        expect(vl[m]).toHaveProperty("mav");
        expect(vl[m]).toHaveProperty("mrv");
      });
    });

    it("values are in order mev < mav < mrv", () => {
      const vl = getVolumeLandmarks();
      Object.entries(vl).forEach(([muscle, vals]) => {
        expect(vals.mev, `${muscle}: mev should be <= mav`).toBeLessThanOrEqual(vals.mav);
        expect(vals.mav, `${muscle}: mav should be <= mrv`).toBeLessThanOrEqual(vals.mrv);
      });
    });
  });

  describe("VOLUME_LANDMARKS backward compatibility", () => {
    it("matches getVolumeLandmarks() output", () => {
      expect(VOLUME_LANDMARKS).toEqual(getVolumeLandmarks());
    });

    it("has the same muscle groups as before", () => {
      const expected = [
        "Chest", "Upper Chest", "Lats", "Upper Back", "Front Delts", "Side Delts",
        "Rear Delts", "Triceps", "Biceps", "Quads", "Hamstrings", "Glutes",
        "Calves", "Core", "Lower Back", "Traps", "Forearms", "Rotator Cuff",
        "Brachialis", "Obliques", "Hip Flexors", "Adductors",
      ];
      expected.forEach((m) => {
        expect(VOLUME_LANDMARKS, `Missing "${m}" in VOLUME_LANDMARKS`).toHaveProperty(m);
      });
    });
  });

  describe("getProgressionRules", () => {
    it("returns strength, hypertrophy, and endurance ranges", () => {
      const rules = getProgressionRules();
      expect(rules).toHaveProperty("strength");
      expect(rules).toHaveProperty("hypertrophy");
      expect(rules).toHaveProperty("endurance");
      ["strength", "hypertrophy", "endurance"].forEach((range) => {
        expect(rules[range]).toHaveProperty("minReps");
        expect(rules[range]).toHaveProperty("maxReps");
        expect(rules[range]).toHaveProperty("weightIncrementBarbell");
        expect(rules[range]).toHaveProperty("weightIncrementOther");
        expect(rules[range]).toHaveProperty("repIncrement");
      });
    });
  });

  describe("getDeloadParams", () => {
    it("returns expected shape", () => {
      const params = getDeloadParams();
      expect(params).toHaveProperty("stallSessionCount");
      expect(params).toHaveProperty("weightReductionPct");
      expect(params).toHaveProperty("deloadRepBoost");
      expect(params).toHaveProperty("struggleThreshold");
      expect(params).toHaveProperty("closeToTargetBuffer");
      expect(params.stallSessionCount).toBe(3);
      expect(params.weightReductionPct).toBe(0.10);
      expect(params.struggleThreshold).toBe(0.6);
    });
  });

  describe("getReadinessWeights", () => {
    it("returns withData and noData weight sets", () => {
      const weights = getReadinessWeights();
      expect(weights).toHaveProperty("withData");
      expect(weights).toHaveProperty("noData");
      // Weights should sum to ~1.0
      const withData = weights.withData;
      expect(withData.plan + withData.execution + withData.progression).toBeCloseTo(1.0);
      expect(weights.noData.plan).toBe(1.0);
    });
  });

  describe("getAdherenceThresholds", () => {
    it("returns ordered thresholds", () => {
      const t = getAdherenceThresholds();
      expect(t.significantlyUnder).toBeLessThan(t.under);
      expect(t.under).toBeLessThan(t.over);
    });
  });

  describe("getStrengthTrendThresholds", () => {
    it("returns symmetric thresholds", () => {
      const t = getStrengthTrendThresholds();
      expect(t.progressingPct).toBeGreaterThan(0);
      expect(t.regressingPct).toBeLessThan(0);
    });
  });

  describe("getContributionWeights", () => {
    it("returns direct > partial > minimal", () => {
      const w = getContributionWeights();
      expect(w.direct).toBeGreaterThan(w.partial);
      expect(w.partial).toBeGreaterThan(w.minimal);
    });
  });

  describe("getInsightMilestones", () => {
    it("returns sorted milestone arrays", () => {
      const m = getInsightMilestones();
      expect(m.streakMilestones).toEqual([...m.streakMilestones].sort((a, b) => a - b));
      expect(m.workoutMilestones).toEqual([...m.workoutMilestones].sort((a, b) => a - b));
      expect(m.detection).toHaveProperty("stallSessions");
    });
  });

  describe("getPlanEngineThresholds", () => {
    it("returns expected shape", () => {
      const t = getPlanEngineThresholds();
      expect(t).toHaveProperty("progressRate");
      expect(t).toHaveProperty("gapThreshold");
      expect(t.progressRate).toBe(2.5);
      expect(t.gapThreshold).toBe(0.80);
    });
  });
});
