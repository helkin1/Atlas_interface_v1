import { useMemo } from "react";
import { useTheme } from "../context/theme.js";
import { usePlanData } from "../context/plan-data.js";
import { EXERCISES } from "../data/exercise-data.js";
import { calcMuscleVol, weekMuscleVol, calcGoalPcts, overallGoalPct, calcPersonalizedGoalPcts, personalizedOverallGoalPct, goalPctColor, getDaySets, getWeekSets } from "../utils/helpers.js";
import { analyzePlan } from "../utils/science-engine.js";
import { loadProfile } from "../utils/storage.js";
import { getPersonalizedConfig, getPersonalizedAlerts } from "../utils/personalization-engine.js";
import { MiniBar, GoalRing, MuscleGoalBar, MuscleDiagram, AlertsPanel, PersonalizationSummary, cardStyle } from "./shared.jsx";

// Reusable card wrapper for sidebar sections
function SidebarCard({ title, children, t }) {
  return (
    <div style={{
      background: t.surface,
      border: `1px solid ${t.border}`,
      borderRadius: 12,
      boxShadow: t.shadow,
      marginBottom: 16,
      overflow: "hidden",
    }}>
      {title && (
        <div style={{
          padding: "12px 16px",
          borderBottom: `1px solid ${t.border}`,
          background: t.surface2,
        }}>
          <h4 style={{
            fontSize: 12,
            fontWeight: 600,
            color: t.textMuted,
            margin: 0,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}>
            {title}
          </h4>
        </div>
      )}
      <div style={{ padding: 16 }}>
        {children}
      </div>
    </div>
  );
}

// Stat display component
function StatDisplay({ value, label, t }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 20, fontWeight: 600, color: t.text }}>{value}</div>
      <div style={{ fontSize: 11, color: t.textDim, fontWeight: 500 }}>{label}</div>
    </div>
  );
}

// Tier sorting helper
const TIER_ORDER = { priority: 0, supporting: 1, maintenance: 2, excluded: 3 };
function sortByTierThenPct(entries) {
  return entries
    .filter(([, d]) => d.tier !== "excluded")
    .sort((a, b) => {
      const tDiff = (TIER_ORDER[a[1].tier] || 2) - (TIER_ORDER[b[1].tier] || 2);
      if (tDiff !== 0) return tDiff;
      return b[1].pct - a[1].pct;
    });
}

export default function Sidebar({ weekIdx, viewLevel, curWeek, curDay, plan }) {
  const t = useTheme();
  const MONTH = usePlanData();

  // Load personalization config
  const profile = useMemo(() => loadProfile(), []);
  const config = useMemo(() => getPersonalizedConfig(profile), [profile]);

  // ---- WEEK VIEW SIDEBAR ----
  if (viewLevel === "week" && curWeek) {
    const mv = weekMuscleVol(curWeek);
    const goalPcts = calcPersonalizedGoalPcts(mv, config);
    const overall = personalizedOverallGoalPct(goalPcts, config);
    const sortedGoals = sortByTierThenPct(Object.entries(goalPcts).filter(([,d]) => d.eff > 0));
    const excludedCount = Object.values(goalPcts).filter(d => d.tier === "excluded").length;
    const wkSets = getWeekSets(curWeek);
    const trainDays = curWeek.days.filter(d => !d.isRest).length;

    return (
      <div>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: t.text, marginBottom: 16 }}>
          Week {curWeek.weekNum} Overview
        </h3>

        <div style={{ marginBottom: 12 }}>
          <PersonalizationSummary config={config} linkTo="/profile" />
        </div>

        <SidebarCard t={t}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <MuscleDiagram muscleVol={mv} size={100} config={config} />
            <div style={{ flex: 1 }}>
              <GoalRing pct={overall} size={64} strokeWidth={4} label="Your Weekly Score" sublabel="Weighted by goal" />
              <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <StatDisplay value={wkSets} label="Sets" t={t} />
                <StatDisplay value={trainDays} label="Train Days" t={t} />
              </div>
            </div>
          </div>
        </SidebarCard>

        <SidebarCard title="Goal Progress" t={t}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {sortedGoals.slice(0, 8).map(([m, data]) => (
              <MuscleGoalBar key={m} name={m} eff={data.eff} target={data.target} tier={data.tier} compact />
            ))}
            {excludedCount > 0 && (
              <div style={{ fontSize: 10, color: t.textFaint, marginTop: 4, textAlign: "center" }}>
                {excludedCount} excluded (injury)
              </div>
            )}
          </div>
        </SidebarCard>
      </div>
    );
  }

  // ---- DAY VIEW SIDEBAR ----
  if (viewLevel === "day" && curDay && !curDay.isRest) {
    const dayMuscles = calcMuscleVol(curDay.exercises);
    const dayMuscVol = Object.fromEntries(dayMuscles);
    const maxM = dayMuscles[0]?.[1] || 1;

    const wkIdx = MONTH.findIndex(wk => wk.days.some(d => d.dayNum === curDay.dayNum));
    const week = wkIdx >= 0 ? MONTH[wkIdx] : null;
    const wkVol = week ? weekMuscleVol(week) : {};
    const wkGoals = calcPersonalizedGoalPcts(wkVol, config);
    const wkOverall = personalizedOverallGoalPct(wkGoals, config);

    return (
      <div>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: t.text, marginBottom: 16 }}>
          {curDay.label} Overview
        </h3>

        <SidebarCard t={t}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <MuscleDiagram muscleVol={dayMuscVol} size={100} config={config} />
            <div style={{ flex: 1 }}>
              <GoalRing pct={wkOverall} size={64} strokeWidth={4} label="Week So Far" sublabel="Weighted by goal" />
              <div style={{ marginTop: 12, textAlign: "center" }}>
                <StatDisplay value={getDaySets(curDay)} label="Sets Today" t={t} />
              </div>
            </div>
          </div>
        </SidebarCard>

        <SidebarCard title="Muscle Breakdown" t={t}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {dayMuscles.slice(0, 8).map(([m, s]) => <MiniBar key={m} name={m} sets={s} max={maxM} />)}
          </div>
        </SidebarCard>

        {week && (
          <SidebarCard title="Weekly Goal Progress" t={t}>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {sortByTierThenPct(Object.entries(wkGoals).filter(([,d]) => d.eff > 0)).slice(0, 8).map(([m, data]) => {
                const dayContrib = dayMuscVol[m] || 0;
                const dayPct = data.target > 0 ? Math.round((dayContrib / data.target) * 100) : 0;
                return (
                  <div key={m} style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "6px 0",
                    borderBottom: `1px solid ${t.border}`,
                  }}>
                    <span style={{ fontSize: 12, color: t.textMuted, fontWeight: data.tier === "priority" ? 600 : 500 }}>{m}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 11, color: t.textDim }}>+{dayPct}%</span>
                      <span style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: data.pct >= 80 ? t.colors.success : t.text,
                      }}>
                        {data.pct}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </SidebarCard>
        )}
      </div>
    );
  }

  // ---- MONTH VIEW SIDEBAR (default) ----
  const totalSets = MONTH.reduce((s, w) => s + getWeekSets(w), 0);
  const trainDays = MONTH.reduce((s, w) => s + w.days.filter((d) => !d.isRest).length, 0);

  const wkSets = MONTH.map((w) => getWeekSets(w));
  const maxWS = Math.max(...wkSets);

  const numWeeks = MONTH.length;
  const allMusc = {};
  MONTH.forEach((w) => { const mv = weekMuscleVol(w); Object.entries(mv).forEach(([m, s]) => { allMusc[m] = (allMusc[m] || 0) + s; }); });
  const avgWeekMusc = {};
  Object.entries(allMusc).forEach(([m, s]) => { avgWeekMusc[m] = s / numWeeks; });

  const goalPcts = calcPersonalizedGoalPcts(avgWeekMusc, config);
  const overall = personalizedOverallGoalPct(goalPcts, config);
  const sortedGoals = sortByTierThenPct(Object.entries(goalPcts));
  const excludedCount = Object.values(goalPcts).filter(d => d.tier === "excluded").length;

  // Volume balance: Upper / Lower / Core from avg weekly effective sets
  const BODY_REGION = {
    Chest: "upper", "Upper Chest": "upper",
    "Front Delts": "upper", "Side Delts": "upper", "Rear Delts": "upper",
    Triceps: "upper", Biceps: "upper", Brachialis: "upper",
    Lats: "upper", "Upper Back": "upper", Traps: "upper",
    "Rotator Cuff": "upper", Forearms: "upper",
    Core: "core", "Lower Back": "core",
    Quads: "lower", Hamstrings: "lower", Glutes: "lower", Calves: "lower",
  };
  const regionVol = { upper: 0, lower: 0, core: 0 };
  Object.entries(avgWeekMusc).forEach(([m, v]) => {
    const r = BODY_REGION[m];
    if (r) regionVol[r] += v;
  });
  const regionTotal = regionVol.upper + regionVol.lower + regionVol.core || 1;

  // Science engine: run on canonical plan weekTemplate for personalized alerts
  const scienceReport = plan ? analyzePlan(plan.weekTemplate || []) : null;
  const planAlerts = scienceReport ? getPersonalizedAlerts(scienceReport, config) : [];

  return (
    <div>
      <h3 style={{ fontSize: 14, fontWeight: 600, color: t.text, marginBottom: 16 }}>
        Mesocycle Overview
      </h3>

      {/* Profile summary */}
      <div style={{ marginBottom: 12 }}>
        <PersonalizationSummary config={config} linkTo="/profile" />
      </div>

      <SidebarCard t={t}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <MuscleDiagram muscleVol={avgWeekMusc} size={100} config={config} />
          <div style={{ flex: 1 }}>
            <GoalRing pct={overall} size={64} strokeWidth={4} label="Your Plan Score" sublabel="Weighted by goal" />
            <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <StatDisplay value={totalSets} label="Total Sets" t={t} />
              <StatDisplay value={trainDays} label="Train Days" t={t} />
            </div>
          </div>
        </div>
      </SidebarCard>

      {/* Plan alerts — personalized severity */}
      <SidebarCard title="Plan Alerts" t={t}>
        <AlertsPanel alerts={planAlerts} maxVisible={4} />
      </SidebarCard>

      <SidebarCard title="Volume Balance" t={t}>
        <div style={{ display: "flex", gap: 12 }}>
          {[
            { key: "upper", label: "Upper" },
            { key: "lower", label: "Lower" },
            { key: "core",  label: "Core" },
          ].map(({ key, label }) => {
            const v = regionVol[key];
            const pct = Math.round((v / regionTotal) * 100);
            return (
              <div key={key} style={{ flex: 1, textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 600, color: t.text }}>{Math.round(v)}</div>
                <div style={{ fontSize: 11, color: t.textDim, fontWeight: 500, marginBottom: 8 }}>{label}</div>
                <div style={{ height: 4, background: t.surface3, borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: t.text, borderRadius: 2, opacity: 0.6 }} />
                </div>
                <div style={{ fontSize: 11, color: t.textFaint, marginTop: 6, fontWeight: 500 }}>{pct}%</div>
              </div>
            );
          })}
        </div>
        <p style={{ fontSize: 11, color: t.textDim, marginTop: 12, textAlign: "center", margin: 0 }}>
          avg weekly effective sets per region
        </p>
      </SidebarCard>

      <SidebarCard title="Weekly Sets" t={t}>
        <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 60 }}>
          {wkSets.map((s, i) => {
            const h = (s / maxWS) * 100;
            const sel = weekIdx === i;
            return (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: 10, color: sel ? t.text : t.textDim, fontWeight: sel ? 600 : 400 }}>{s}</span>
                <div style={{
                  width: "100%",
                  height: `${h}%`,
                  background: sel ? t.text : t.surface3,
                  borderRadius: 3,
                  minHeight: 4,
                  transition: "all 0.2s ease",
                }} />
                <span style={{ fontSize: 10, color: t.textFaint, fontWeight: 500 }}>W{i + 1}</span>
              </div>
            );
          })}
        </div>
      </SidebarCard>

      <SidebarCard title="Goal Progress" t={t}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {sortedGoals.slice(0, 10).map(([m, data]) => (
            <MuscleGoalBar key={m} name={m} eff={data.eff} target={data.target} tier={data.tier} compact />
          ))}
          {excludedCount > 0 && (
            <div style={{ fontSize: 10, color: t.textFaint, marginTop: 4, textAlign: "center" }}>
              {excludedCount} excluded (injury)
            </div>
          )}
        </div>
        {sortedGoals.length > 10 && (
          <p style={{ fontSize: 11, color: t.textFaint, textAlign: "center", margin: 0, marginTop: 8 }}>
            +{sortedGoals.length - 10} more
          </p>
        )}
      </SidebarCard>
    </div>
  );
}
