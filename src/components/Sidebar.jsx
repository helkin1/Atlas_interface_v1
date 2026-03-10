import { useTheme } from "../context/theme.js";
import { usePlanData } from "../context/plan-data.js";
import { EXERCISES } from "../data/exercise-data.js";
import { calcMuscleVol, weekMuscleVol, calcGoalPcts, overallGoalPct, goalPctColor, getDaySets, getWeekSets } from "../utils/helpers.js";
import { analyzePlan } from "../utils/science-engine.js";
import { MiniBar, GoalRing, MuscleGoalBar, MuscleDiagram, AlertsPanel, cardStyle } from "./shared.jsx";

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

export default function Sidebar({ weekIdx, viewLevel, curWeek, curDay, plan }) {
  const t = useTheme();
  const MONTH = usePlanData();

  // ---- WEEK VIEW SIDEBAR ----
  if (viewLevel === "week" && curWeek) {
    const mv = weekMuscleVol(curWeek);
    const goalPcts = calcGoalPcts(mv);
    const overall = overallGoalPct(goalPcts);
    const sortedGoals = Object.entries(goalPcts).filter(([,d]) => d.eff > 0).sort((a, b) => b[1].pct - a[1].pct);
    const wkSets = getWeekSets(curWeek);
    const trainDays = curWeek.days.filter(d => !d.isRest).length;

    return (
      <div>
        <h3 style={{ 
          fontSize: 14, 
          fontWeight: 600, 
          color: t.text, 
          marginBottom: 16,
        }}>
          Week {curWeek.weekNum} Overview
        </h3>
        
        <SidebarCard t={t}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <MuscleDiagram muscleVol={mv} size={100} />
            <div style={{ flex: 1 }}>
              <GoalRing pct={overall} size={64} strokeWidth={4} label="Weekly Goal" />
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
              <MuscleGoalBar key={m} name={m} eff={data.eff} target={data.target} compact />
            ))}
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
    const wkGoals = calcGoalPcts(wkVol);
    const wkOverall = overallGoalPct(wkGoals);

    return (
      <div>
        <h3 style={{ 
          fontSize: 14, 
          fontWeight: 600, 
          color: t.text, 
          marginBottom: 16,
        }}>
          {curDay.label} Overview
        </h3>
        
        <SidebarCard t={t}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <MuscleDiagram muscleVol={dayMuscVol} size={100} />
            <div style={{ flex: 1 }}>
              <GoalRing pct={wkOverall} size={64} strokeWidth={4} label="Week So Far" />
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
              {Object.entries(wkGoals).filter(([,d]) => d.eff > 0).sort((a, b) => b[1].pct - a[1].pct).slice(0, 8).map(([m, data]) => {
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
                    <span style={{ fontSize: 12, color: t.textMuted, fontWeight: 500 }}>{m}</span>
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

  const goalPcts = calcGoalPcts(avgWeekMusc);
  const overall = overallGoalPct(goalPcts);
  const sortedGoals = Object.entries(goalPcts).sort((a, b) => b[1].pct - a[1].pct);

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

  // Science engine: run on canonical plan weekTemplate when available
  const scienceReport = plan ? analyzePlan(plan.weekTemplate || []) : null;
  const planAlerts = scienceReport ? scienceReport.alerts : [];

  return (
    <div>
      <h3 style={{ 
        fontSize: 14, 
        fontWeight: 600, 
        color: t.text, 
        marginBottom: 16,
      }}>
        Mesocycle Overview
      </h3>
      
      <SidebarCard t={t}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <MuscleDiagram muscleVol={avgWeekMusc} size={100} />
          <div style={{ flex: 1 }}>
            <GoalRing pct={overall} size={64} strokeWidth={4} label="Avg Weekly" />
            <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <StatDisplay value={totalSets} label="Total Sets" t={t} />
              <StatDisplay value={trainDays} label="Train Days" t={t} />
            </div>
          </div>
        </div>
      </SidebarCard>
      
      {/* Plan alerts from science engine */}
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
            <MuscleGoalBar key={m} name={m} eff={data.eff} target={data.target} compact />
          ))}
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
