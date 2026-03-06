import { useState, useMemo } from "react";
import { useTheme } from "../context/theme.js";
import { EXERCISES } from "../data/exercise-data.js";
import { loadWorkoutLogs } from "../utils/storage.js";
import { MUSCLE_COLORS } from "../utils/helpers.js";
import {
  getWorkoutHistory,
  getExerciseHistory,
  detectPRs,
  getWeeklyVolumeTrend,
  getMuscleTrend,
  getOverviewStats,
} from "../utils/progress-engine.js";
import {
  StatCard,
  SparkLine,
  BarChart,
  LineChart,
  Tabs,
  EmptyState,
  SectionLabel,
} from "./shared.jsx";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "exercises", label: "Exercises" },
  { key: "history", label: "History" },
];

function formatVolume(v) {
  if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `${(v / 1000).toFixed(1)}k`;
  return String(v);
}

function formatDate(d) {
  if (!d) return "";
  const mo = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${mo[d.getMonth()]} ${d.getDate()}`;
}

/* ── Overview Tab ────────────────────────────────────────────── */

function OverviewTab({ stats, weeklyTrend, muscleTrend, prs, hasData }) {
  const t = useTheme();

  if (!hasData) {
    return <EmptyState icon="🏋️" title="No workouts logged yet" message="Start logging workouts in GymMode to see your progress here." />;
  }

  const prList = [];
  Object.entries(prs).forEach(([exId, pr]) => {
    const ex = EXERCISES[exId];
    const name = ex?.name || exId;
    if (pr.weight.value > 0) prList.push({ name, type: "Weight", value: `${pr.weight.value} lbs`, date: pr.weight.date });
    if (pr.est1RM.value > 0) prList.push({ name, type: "Est. 1RM", value: `${pr.est1RM.value} lbs`, date: pr.est1RM.date });
  });
  prList.sort((a, b) => (b.date || 0) - (a.date || 0));

  const barData = weeklyTrend
    .filter(w => w.totalVolume > 0)
    .map(w => ({ value: w.totalVolume, label: `W${w.weekNum + 1}` }));

  const muscleEntries = Object.entries(muscleTrend)
    .filter(([, arr]) => arr.length >= 1)
    .sort((a, b) => {
      const lastA = a[1][a[1].length - 1]?.effectiveSets || 0;
      const lastB = b[1][b[1].length - 1]?.effectiveSets || 0;
      return lastB - lastA;
    });

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 28 }}>
        <StatCard label="Workouts" value={stats.totalWorkouts} color="#4C9EFF" />
        <StatCard label="Total Volume" value={formatVolume(stats.totalVolume)} sub="lbs" color="#3DDC84" />
        <StatCard label="Completion" value={`${stats.avgCompletion}%`} color="#FBBF24" />
        <StatCard label="Streak" value={stats.streak} sub="sessions" color="#A78BFA" />
      </div>

      {barData.length > 0 && (
        <div style={{ background: t.surface, borderRadius: 12, padding: 20, marginBottom: 20 }}>
          <SectionLabel>Weekly Volume</SectionLabel>
          <BarChart data={barData} width={Math.min(600, barData.length * 80)} height={140} barColor="#4C9EFF" />
        </div>
      )}

      {muscleEntries.length > 0 && (
        <div style={{ background: t.surface, borderRadius: 12, padding: 20, marginBottom: 20 }}>
          <SectionLabel>Muscle Volume Trends</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
            {muscleEntries.map(([name, data]) => {
              const sparkData = data.map(d => d.effectiveSets);
              const last = data[data.length - 1]?.effectiveSets || 0;
              return (
                <div key={name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 8, background: t.surface2 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: MUSCLE_COLORS[name] || "#666", flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, color: t.textMuted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</div>
                    <div style={{ fontSize: 10, fontFamily: "inherit", color: t.textDim }}>{last} sets/wk</div>
                  </div>
                  <SparkLine data={sparkData} width={80} height={24} color={MUSCLE_COLORS[name] || "#4C9EFF"} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {prList.length > 0 && (
        <div style={{ background: t.surface, borderRadius: 12, padding: 20 }}>
          <SectionLabel>Personal Records</SectionLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {prList.slice(0, 10).map((pr, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 8, background: t.surface2 }}>
                <span style={{ fontSize: 14 }}>🏆</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: t.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{pr.name}</div>
                  <div style={{ fontSize: 10, color: t.textDim }}>{pr.type} &middot; {pr.date ? formatDate(pr.date) : ""}</div>
                </div>
                <div style={{ fontSize: 14, fontFamily: "inherit", fontWeight: 700, color: "#FBBF24" }}>{pr.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Exercises Tab ───────────────────────────────────────────── */

function ExercisesTab({ exerciseHistory, prs }) {
  const t = useTheme();
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(null);

  const exerciseIds = Object.keys(exerciseHistory);
  const filtered = exerciseIds.filter(exId => {
    const ex = EXERCISES[exId];
    const name = ex?.name || exId;
    return name.toLowerCase().includes(search.toLowerCase());
  });

  if (exerciseIds.length === 0) {
    return <EmptyState icon="📋" title="No exercises logged" message="Log sets in GymMode to track exercise progression." />;
  }

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Search exercises..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: "100%", maxWidth: 360, padding: "8px 14px", fontSize: 13,
            background: t.surface, border: `1px solid ${t.border}`, borderRadius: 8,
            color: t.text, outline: "none", fontFamily: "inherit",
          }}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.map(exId => {
          const ex = EXERCISES[exId];
          const name = ex?.name || exId;
          const sessions = exerciseHistory[exId];
          const pr = prs[exId];
          const isOpen = expanded === exId;
          const lastSession = sessions[sessions.length - 1];

          return (
            <div key={exId} style={{ background: t.surface, borderRadius: 12, overflow: "hidden" }}>
              <button
                onClick={() => setExpanded(isOpen ? null : exId)}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 12,
                  padding: "14px 16px", background: "transparent", border: "none",
                  cursor: "pointer", textAlign: "left",
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: t.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</div>
                  <div style={{ fontSize: 10, fontFamily: "inherit", color: t.textDim, marginTop: 2 }}>
                    {sessions.length} session{sessions.length !== 1 ? "s" : ""}
                    {lastSession ? ` · Last: ${formatDate(lastSession.date)}` : ""}
                  </div>
                </div>
                {pr && (
                  <div style={{ fontSize: 11, fontFamily: "inherit", color: "#FBBF24", fontWeight: 600 }}>
                    PR: {pr.weight.value} lbs
                  </div>
                )}
                <span style={{ fontSize: 12, color: t.textDim, transition: "transform 0.2s", transform: isOpen ? "rotate(180deg)" : "rotate(0)" }}>▾</span>
              </button>

              {isOpen && (
                <div style={{ padding: "0 16px 16px", borderTop: `1px solid ${t.border}` }}>
                  {sessions.length >= 2 && (
                    <div style={{ marginTop: 14, marginBottom: 14 }}>
                      <div style={{ fontSize: 11, color: t.textDim, marginBottom: 8 }}>Weight Progression</div>
                      <LineChart
                        data={sessions.map(s => ({ x: formatDate(s.date), y: s.topWeight }))}
                        width={500} height={160} color="#4C9EFF" yLabel="lbs"
                      />
                    </div>
                  )}

                  {sessions.length >= 2 && sessions.some(s => s.est1RM > 0) && (
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ fontSize: 11, color: t.textDim, marginBottom: 8 }}>Estimated 1RM</div>
                      <LineChart
                        data={sessions.filter(s => s.est1RM > 0).map(s => ({ x: formatDate(s.date), y: s.est1RM }))}
                        width={500} height={160} color="#A78BFA" yLabel="lbs"
                      />
                    </div>
                  )}

                  {pr && (
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                      {pr.weight.value > 0 && (
                        <span style={{ fontSize: 10, fontFamily: "inherit", padding: "3px 10px", borderRadius: 20, background: "rgba(251,191,36,0.1)", color: "#FBBF24" }}>
                          🏆 Best: {pr.weight.value} lbs
                        </span>
                      )}
                      {pr.est1RM.value > 0 && (
                        <span style={{ fontSize: 10, fontFamily: "inherit", padding: "3px 10px", borderRadius: 20, background: "rgba(167,139,250,0.1)", color: "#A78BFA" }}>
                          Est. 1RM: {pr.est1RM.value} lbs
                        </span>
                      )}
                    </div>
                  )}

                  <div style={{ fontSize: 11, color: t.textDim, marginBottom: 6 }}>Recent Sessions</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {sessions.slice(-5).reverse().map((s, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 10px", borderRadius: 6, background: t.surface2, fontSize: 11 }}>
                        <span style={{ fontFamily: "inherit", color: t.textDim, width: 50 }}>{formatDate(s.date)}</span>
                        <span style={{ fontFamily: "inherit", color: t.text }}>
                          {s.sets.map(set => `${set.w}×${set.reps}`).join(", ")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── History Tab ─────────────────────────────────────────────── */

function HistoryTab({ workoutHistory }) {
  const t = useTheme();
  const [expanded, setExpanded] = useState(null);

  if (workoutHistory.length === 0) {
    return <EmptyState icon="📅" title="No workout history" message="Complete workouts in GymMode to build your training log." />;
  }

  const reversed = [...workoutHistory].reverse();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {reversed.map((session, i) => {
        const isOpen = expanded === i;
        return (
          <div key={i} style={{ background: t.surface, borderRadius: 12, overflow: "hidden" }}>
            <button
              onClick={() => setExpanded(isOpen ? null : i)}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 12,
                padding: "14px 16px", background: "transparent", border: "none",
                cursor: "pointer", textAlign: "left",
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: t.text }}>{session.label}</div>
                <div style={{ fontSize: 10, fontFamily: "inherit", color: t.textDim, marginTop: 2 }}>
                  {session.weekLabel} &middot; {session.date ? formatDate(session.date) : `Day ${session.dayNum}`}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 60, height: 5, background: t.border, borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ width: `${session.pct}%`, height: "100%", background: session.pct >= 80 ? "#3DDC84" : session.pct >= 50 ? "#FBBF24" : "#EF4444", borderRadius: 3 }} />
                </div>
                <span style={{ fontSize: 10, fontFamily: "inherit", color: t.textDim, width: 30, textAlign: "right" }}>{session.pct}%</span>
              </div>
              <div style={{ fontSize: 11, fontFamily: "inherit", color: t.textMuted, width: 60, textAlign: "right" }}>
                {formatVolume(session.totalVolume)}
              </div>
              <span style={{ fontSize: 12, color: t.textDim, transition: "transform 0.2s", transform: isOpen ? "rotate(180deg)" : "rotate(0)" }}>▾</span>
            </button>

            {isOpen && (
              <div style={{ padding: "0 16px 16px", borderTop: `1px solid ${t.border}` }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 12 }}>
                  {session.exercises.map((entry, ei) => {
                    const ex = EXERCISES[entry.exercise_id];
                    if (!ex) return null;
                    const loggedSets = entry.sets.map((set, si) => {
                      const key = `${ei}_${si}`;
                      const log = session.dayLog[key];
                      return { planned: set, logged: log || null };
                    });

                    return (
                      <div key={ei} style={{ padding: "8px 10px", borderRadius: 8, background: t.surface2 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: t.text, marginBottom: 4 }}>{ex.name}</div>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {loggedSets.map((s, si) => {
                            const logged = s.logged;
                            if (!logged) {
                              return (
                                <span key={si} style={{ fontSize: 10, fontFamily: "inherit", padding: "2px 8px", borderRadius: 6, background: t.border, color: t.textFaint }}>
                                  —
                                </span>
                              );
                            }
                            const hit = logged.reps >= s.planned.r;
                            const up = logged.w > s.planned.w;
                            const bg = up ? "rgba(251,191,36,0.12)" : hit ? "rgba(61,220,132,0.12)" : "rgba(239,68,68,0.12)";
                            const c = up ? "#FBBF24" : hit ? "#3DDC84" : "#EF4444";
                            return (
                              <span key={si} style={{ fontSize: 10, fontFamily: "inherit", padding: "2px 8px", borderRadius: 6, background: bg, color: c, fontWeight: 600 }}>
                                {logged.w}×{logged.reps}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Main ProgressView ───────────────────────────────────────── */

export default function ProgressView({ plan, monthData }) {
  const [activeTab, setActiveTab] = useState("overview");

  const { stats, workoutHistory, exerciseHistory, prs, weeklyTrend, muscleTrend, hasData } = useMemo(() => {
    const logs = loadWorkoutLogs();
    const planId = plan?.planId;
    const workoutHistory = getWorkoutHistory(logs, monthData, planId);
    const exerciseHistory = getExerciseHistory(logs, monthData, planId);
    const prs = detectPRs(exerciseHistory);
    const weeklyTrend = getWeeklyVolumeTrend(logs, monthData, planId);
    const muscleTrend = getMuscleTrend(logs, monthData, planId);
    const stats = getOverviewStats(logs, monthData, planId);
    const hasData = workoutHistory.length > 0;
    return { stats, workoutHistory, exerciseHistory, prs, weeklyTrend, muscleTrend, hasData };
  }, [plan, monthData]);

  return (
    <div>
      <Tabs items={TABS} active={activeTab} onChange={setActiveTab} />

      {activeTab === "overview" && (
        <OverviewTab stats={stats} weeklyTrend={weeklyTrend} muscleTrend={muscleTrend} prs={prs} hasData={hasData} />
      )}
      {activeTab === "exercises" && (
        <ExercisesTab exerciseHistory={exerciseHistory} prs={prs} />
      )}
      {activeTab === "history" && (
        <HistoryTab workoutHistory={workoutHistory} />
      )}
    </div>
  );
}
