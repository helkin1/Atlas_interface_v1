import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/theme.js";
import {
  weekMuscleVol,
  calcPersonalizedGoalPcts,
  personalizedOverallGoalPct,
  getWeekSets,
} from "../utils/helpers.js";
import { loadProfile, loadWorkoutLogs } from "../utils/storage.js";
import { getPersonalizedConfig } from "../utils/personalization-engine.js";
import {
  getOverviewStats,
  getWeeklyVolumeTrend,
  getExerciseHistory,
  detectPRs,
} from "../utils/progress-engine.js";
import { generateReport } from "../utils/intelligence-engine.js";
import { generateInsights, CATEGORY } from "../utils/insights-engine.js";
import { EXERCISES } from "../data/exercise-data.js";
import {
  StatCard,
  GoalRing,
  BarChart,
  PatternBadge,
  MuscleDiagram,
  cardStyle,
} from "./shared.jsx";

export default function DashboardHome({ plan, monthData }) {
  const t = useTheme();
  const navigate = useNavigate();

  const profile = useMemo(() => loadProfile(), []);
  const config = useMemo(() => getPersonalizedConfig(profile), [profile]);
  const logs = useMemo(() => loadWorkoutLogs(), []);

  const stats = useMemo(
    () => getOverviewStats(logs, monthData, plan.planId),
    [logs, monthData, plan.planId],
  );

  const weeklyTrend = useMemo(
    () => getWeeklyVolumeTrend(logs, monthData, plan.planId),
    [logs, monthData, plan.planId],
  );

  const prs = useMemo(() => {
    const exHist = getExerciseHistory(logs, monthData, plan.planId);
    return detectPRs(exHist);
  }, [logs, monthData, plan.planId]);

  const insights = useMemo(() => {
    const report = generateReport({
      weekTemplate: plan.weekTemplate,
      logs,
      monthData,
      planId: plan.planId,
    });
    return generateInsights(report);
  }, [plan, logs, monthData]);

  // Fitness score (same calc as Sidebar month view)
  const { overall, goalBreakdown } = useMemo(() => {
    const numWeeks = monthData.length;
    const allMusc = {};
    monthData.forEach((w) => {
      const mv = weekMuscleVol(w);
      Object.entries(mv).forEach(([m, s]) => {
        allMusc[m] = (allMusc[m] || 0) + s;
      });
    });
    const avgWeekMusc = {};
    Object.entries(allMusc).forEach(([m, s]) => {
      avgWeekMusc[m] = s / numWeeks;
    });
    const goalPcts = calcPersonalizedGoalPcts(avgWeekMusc, config);
    const pct = personalizedOverallGoalPct(goalPcts, config);
    const breakdown = Object.entries(goalPcts)
      .filter(([, d]) => d.tier !== "excluded")
      .sort((a, b) => b[1].pct - a[1].pct)
      .map(([m, d]) => ({ name: m, pct: d.pct, tier: d.tier }));
    return { overall: pct, goalBreakdown: breakdown };
  }, [monthData, config]);

  // Find today's workout (or rest day + next upcoming)
  const { todayDay, todayWeekIdx, todayDayIdx, nextDay, nextWeekIdx, nextDayIdx, isRestDay } =
    useMemo(() => {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const nowTime = now.getTime();
      let tDay = null, tWi = null, tDi = null;
      let nDay = null, nWi = null, nDi = null;

      for (let wi = 0; wi < monthData.length; wi++) {
        for (let di = 0; di < monthData[wi].days.length; di++) {
          const day = monthData[wi].days[di];
          const d = new Date(day.date);
          d.setHours(0, 0, 0, 0);
          if (d.getTime() === nowTime) {
            tDay = day; tWi = wi; tDi = di;
          }
          if (d.getTime() >= nowTime && !day.isRest && !nDay) {
            // Skip today if it's already found as tDay (we want next if today is rest)
            if (d.getTime() === nowTime && tDay && !tDay.isRest) continue;
            if (d.getTime() > nowTime || (tDay && tDay.isRest)) {
              nDay = day; nWi = wi; nDi = di;
            }
          }
        }
      }

      // If today is a training day, it IS the "next" workout
      if (tDay && !tDay.isRest) {
        return { todayDay: tDay, todayWeekIdx: tWi, todayDayIdx: tDi, nextDay: tDay, nextWeekIdx: tWi, nextDayIdx: tDi, isRestDay: false };
      }
      return { todayDay: tDay, todayWeekIdx: tWi, todayDayIdx: tDi, nextDay: nDay, nextWeekIdx: nWi, nextDayIdx: nDi, isRestDay: !!tDay };
    }, [monthData]);

  // Top 5 PRs, sorted by most recent
  const topPRs = useMemo(() => {
    const prList = [];
    Object.entries(prs).forEach(([exId, prData]) => {
      const ex = EXERCISES.find((e) => e.id === exId);
      const name = ex ? ex.name : exId;
      if (prData.weight?.value) {
        prList.push({ name, type: "Weight", value: `${prData.weight.value} lbs`, date: prData.weight.date });
      }
      if (prData.est1RM?.value) {
        prList.push({ name, type: "Est 1RM", value: `${prData.est1RM.value} lbs`, date: prData.est1RM.date });
      }
    });
    prList.sort((a, b) => new Date(b.date) - new Date(a.date));
    return prList.slice(0, 5);
  }, [prs]);

  // Weekly trend bar chart data
  const trendChartData = useMemo(() => {
    return weeklyTrend.map((w) => ({
      value: w.totalVolume || w.totalSets || 0,
      label: w.label || `W${w.weekNum + 1}`,
    }));
  }, [weeklyTrend]);

  // Average weekly muscle volume for diagram
  const avgWeekMusc = useMemo(() => {
    const allMusc = {};
    monthData.forEach((w) => {
      const mv = weekMuscleVol(w);
      Object.entries(mv).forEach(([m, s]) => { allMusc[m] = (allMusc[m] || 0) + s; });
    });
    const avg = {};
    Object.entries(allMusc).forEach(([m, s]) => { avg[m] = s / monthData.length; });
    return avg;
  }, [monthData]);

  const INSIGHT_STYLES = {
    celebration: { color: "#22C55E", bg: "rgba(34,197,94,0.07)" },
    warning: { color: "#F59E0B", bg: "rgba(245,158,11,0.07)" },
    suggestion: { color: "#3B82F6", bg: "rgba(59,130,246,0.07)" },
    info: { color: "#94A3B8", bg: "rgba(148,163,184,0.07)" },
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      {/* Today's Workout */}
      {isRestDay ? (
        <div style={{ marginBottom: 24 }}>
          <div style={{
            ...cardStyle(t, { padding: 32 }),
            textAlign: "center",
            marginBottom: 12,
          }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>😴</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: t.text }}>Rest Day</div>
            <div style={{ fontSize: 14, color: t.textDim, marginTop: 6 }}>
              Recovery is part of the plan.
            </div>
          </div>
          {nextDay && (
            <div
              style={{
                ...cardStyle(t, { padding: 20 }),
                cursor: "pointer",
              }}
              onClick={() => navigate(`/plan/week/${nextWeekIdx}/day/${nextDayIdx}`)}
            >
              <div style={{ fontSize: 11, color: t.textMuted, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
                Coming Up
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: t.text }}>{nextDay.label}</div>
                  <div style={{ fontSize: 12, color: t.textDim, marginTop: 4 }}>
                    {nextDay.exercises?.length || 0} exercises · {nextDay.exercises?.reduce((s, e) => s + e.sets.length, 0) || 0} sets
                  </div>
                </div>
                <span style={{ fontSize: 13, color: t.textDim }}>→</span>
              </div>
            </div>
          )}
        </div>
      ) : nextDay ? (
        <div
          style={{
            ...cardStyle(t, { padding: 24, marginBottom: 24 }),
            cursor: "pointer",
          }}
          onClick={() => navigate(`/plan/week/${nextWeekIdx}/day/${nextDayIdx}`)}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 11, color: t.textMuted, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
                Today's Workout
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: t.text }}>{nextDay.label}</div>
            </div>
            <button
              style={{
                padding: "8px 20px",
                borderRadius: 8,
                border: "none",
                background: t.text,
                color: t.bg,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Start Workout
            </button>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {nextDay.exercises?.slice(0, 6).map((ex, i) => {
              const exData = EXERCISES.find((e) => e.id === ex.exercise_id);
              return (
                <span key={i} style={{
                  fontSize: 12,
                  padding: "4px 10px",
                  borderRadius: 6,
                  background: t.surface2,
                  color: t.textMuted,
                  fontWeight: 500,
                  border: `1px solid ${t.border}`,
                }}>
                  {exData?.name || ex.exercise_id}
                </span>
              );
            })}
            {nextDay.exercises?.length > 6 && (
              <span style={{ fontSize: 12, color: t.textFaint, alignSelf: "center" }}>
                +{nextDay.exercises.length - 6} more
              </span>
            )}
          </div>
        </div>
      ) : (
        <div style={{ ...cardStyle(t, { padding: 24, marginBottom: 24 }), textAlign: "center" }}>
          <div style={{ fontSize: 14, color: t.textDim }}>No upcoming workouts in this mesocycle.</div>
        </div>
      )}

      {/* Stats Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
        <StatCard label="Streak" value={`${stats.streak} wk${stats.streak !== 1 ? "s" : ""}`} color={stats.streak >= 3 ? "#22C55E" : undefined} />
        <StatCard label="Completion" value={`${stats.avgCompletion}%`} color={stats.avgCompletion >= 80 ? "#22C55E" : stats.avgCompletion >= 50 ? "#F59E0B" : "#EF4444"} />
        <StatCard label="Workouts" value={stats.totalWorkouts} color="#3B82F6" />
        <div style={{ ...cardStyle(t, { padding: 20 }), display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <GoalRing pct={overall} size={56} strokeWidth={4} label="Fitness Score" goalBreakdown={goalBreakdown} />
        </div>
      </div>

      {/* Two-column grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        {/* Weekly Volume Trend */}
        <div style={cardStyle(t, { padding: 20 })}>
          <div style={{ fontSize: 11, color: t.textMuted, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>
            Weekly Volume
          </div>
          {trendChartData.length > 0 ? (
            <BarChart data={trendChartData} width={360} height={120} barColor="#3B82F6" />
          ) : (
            <div style={{ fontSize: 12, color: t.textFaint, textAlign: "center", padding: 20 }}>
              Log workouts to see trends
            </div>
          )}
        </div>

        {/* Recent PRs */}
        <div style={cardStyle(t, { padding: 20 })}>
          <div style={{ fontSize: 11, color: t.textMuted, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>
            Recent PRs
          </div>
          {topPRs.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {topPRs.map((pr, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: t.text }}>{pr.name}</span>
                    <span style={{ fontSize: 11, color: t.textFaint, marginLeft: 6 }}>{pr.type}</span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#22C55E" }}>{pr.value}</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 12, color: t.textFaint, textAlign: "center", padding: 20 }}>
              PRs will appear as you log workouts
            </div>
          )}
        </div>

        {/* Insights */}
        <div style={cardStyle(t, { padding: 20 })}>
          <div style={{ fontSize: 11, color: t.textMuted, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>
            Insights
          </div>
          {insights.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {insights.slice(0, 4).map((insight) => {
                const s = INSIGHT_STYLES[insight.category] || INSIGHT_STYLES.info;
                return (
                  <div key={insight.id} style={{
                    display: "flex", alignItems: "flex-start", gap: 8,
                    padding: "8px 10px", borderRadius: 8, background: s.bg,
                  }}>
                    <div style={{ width: 5, height: 5, borderRadius: "50%", background: s.color, marginTop: 5, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: s.color, lineHeight: 1.3 }}>{insight.title}</div>
                      <div style={{ fontSize: 10, color: t.textDim, lineHeight: 1.4, marginTop: 2 }}>{insight.message}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ fontSize: 12, color: t.textFaint, textAlign: "center", padding: 20 }}>
              Insights will appear as you train
            </div>
          )}
        </div>

        {/* Muscle Diagram */}
        <div style={{ ...cardStyle(t, { padding: 20 }), display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ fontSize: 11, color: t.textMuted, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12, alignSelf: "flex-start" }}>
            Muscle Coverage
          </div>
          <MuscleDiagram muscleVol={avgWeekMusc} size={120} config={config} />
        </div>
      </div>
    </div>
  );
}
