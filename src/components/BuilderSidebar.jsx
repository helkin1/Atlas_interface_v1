import { useMemo } from "react";
import { useTheme } from "../context/theme.js";
import { analyzePlan } from "../utils/science-engine.js";
import { loadProfile } from "../utils/storage.js";
import { getPersonalizedConfig, calcPersonalizedGoalPcts, personalizedOverallScore, getPersonalizedAlerts } from "../utils/personalization-engine.js";
import { GoalRing, MuscleGoalBar, MuscleDiagram, AlertsPanel, PersonalizationSummary } from "./shared.jsx";

const BODY_REGION = {
  Chest: "upper", "Upper Chest": "upper",
  "Front Delts": "upper", "Side Delts": "upper", "Rear Delts": "upper",
  Triceps: "upper", Biceps: "upper", Brachialis: "upper",
  Lats: "upper", "Upper Back": "upper", Traps: "upper",
  "Rotator Cuff": "upper", Forearms: "upper",
  Core: "core", "Lower Back": "core",
  Quads: "lower", Hamstrings: "lower", Glutes: "lower", Calves: "lower",
};

export default function BuilderSidebar({ plan }) {
  const t = useTheme();
  const wt = plan.weekTemplate || [];

  const report = analyzePlan(wt);
  const { effectiveSets, alerts: rawAlerts } = report;

  // Personalization
  const profile = useMemo(() => loadProfile(), []);
  const config = useMemo(() => getPersonalizedConfig(profile), [profile]);
  const personalizedGoals = useMemo(() => calcPersonalizedGoalPcts(effectiveSets, config), [effectiveSets, config]);
  const personalizedScore = useMemo(() => personalizedOverallScore(personalizedGoals, config), [personalizedGoals, config]);
  const personalizedAlerts = useMemo(() => getPersonalizedAlerts(report, config), [report, config]);

  // Sort by tier (priority first), then by pct descending
  const tierOrder = { priority: 0, supporting: 1, maintenance: 2, excluded: 3 };
  const sorted = Object.entries(personalizedGoals)
    .filter(([, d]) => d.tier !== "excluded")
    .sort((a, b) => {
      const tDiff = (tierOrder[a[1].tier] || 2) - (tierOrder[b[1].tier] || 2);
      if (tDiff !== 0) return tDiff;
      return b[1].pct - a[1].pct;
    });

  const excludedCount = Object.values(personalizedGoals).filter(d => d.tier === "excluded").length;
  const trainDays = wt.filter(d => !d.isRest && d.exercises.length > 0).length;
  const totalExercises = wt.reduce((s, d) => s + (d.isRest ? 0 : d.exercises.length), 0);

  // Volume balance: Upper / Lower / Core
  const regionVol = { upper: 0, lower: 0, core: 0 };
  Object.entries(effectiveSets).forEach(([m, v]) => {
    const r = BODY_REGION[m];
    if (r) regionVol[r] += v;
  });
  const regionTotal = regionVol.upper + regionVol.lower + regionVol.core || 1;

  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 600, color: t.textMuted, marginBottom: 16 }}>Live Analysis</div>

      {/* Profile summary */}
      <div style={{ marginBottom: 12 }}>
        <PersonalizationSummary config={config} linkTo="/profile" />
      </div>

      {/* Muscle diagram + coverage ring */}
      <div style={{ background: t.surface, borderRadius: 12, padding: 20, marginBottom: 16, boxShadow: t.shadow, display: "flex", alignItems: "center", gap: 16 }}>
        <MuscleDiagram muscleVol={effectiveSets} size={120} config={config} />
        <div style={{ flex: 1 }}>
          <GoalRing pct={personalizedScore} size={72} strokeWidth={5} label="Your Fitness Score" sublabel="Weighted by goal" />
          <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#3B82F6" }}>{trainDays}</div>
              <div style={{ fontSize: 10, color: t.textDim }}>Train Days</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#F59E0B" }}>{totalExercises}</div>
              <div style={{ fontSize: 10, color: t.textDim }}>Exercises</div>
            </div>
          </div>
        </div>
      </div>

      {/* Volume Balance: Upper / Lower / Core */}
      <div style={{ background: t.surface, borderRadius: 12, padding: 16, marginBottom: 16, boxShadow: t.shadow }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, marginBottom: 10 }}>Volume Balance</div>
        <div style={{ display: "flex", gap: 6 }}>
          {[["upper", "#3B82F6", "Upper"], ["lower", "#8B5CF6", "Lower"], ["core", "#F59E0B", "Core"]].map(([key, color, label]) => {
            const v = regionVol[key];
            const pct = Math.round((v / regionTotal) * 100);
            return (
              <div key={key} style={{ flex: 1, textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 700, color }}>{Math.round(v)}</div>
                <div style={{ fontSize: 9, color: t.textDim }}>{label}</div>
                <div style={{ height: 4, background: t.border, borderRadius: 2, marginTop: 6, overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 2, transition: "width 0.3s" }} />
                </div>
                <div style={{ fontSize: 9, color: t.textFaint, marginTop: 3 }}>{pct}%</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Weekly Volume (vs Target) — personalized */}
      <div style={{ background: t.surface, borderRadius: 12, padding: 16, marginBottom: 16, boxShadow: t.shadow }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, marginBottom: 12 }}>Weekly Volume (vs Target)</div>
        {sorted.slice(0, 14).map(([m, data]) => (
          <MuscleGoalBar key={m} name={m} eff={data.eff} target={data.target} tier={data.tier} compact />
        ))}
        {excludedCount > 0 && (
          <div style={{ fontSize: 10, color: t.textFaint, marginTop: 8, textAlign: "center" }}>
            {excludedCount} excluded (injury)
          </div>
        )}
      </div>

      {/* Plan Alerts — personalized severity */}
      <div style={{ background: t.surface, borderRadius: 12, padding: 16, boxShadow: t.shadow }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, marginBottom: 12 }}>Plan Alerts</div>
        <AlertsPanel alerts={personalizedAlerts} maxVisible={4} />
      </div>
    </div>
  );
}
