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
  CARD_CLASS,
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
      <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3 mb-7">
        <StatCard label="Workouts" value={stats.totalWorkouts} color="#3B82F6" />
        <StatCard label="Total Volume" value={formatVolume(stats.totalVolume)} sub="lbs" color="#22C55E" />
        <StatCard label="Completion" value={`${stats.avgCompletion}%`} color="#F59E0B" />
        <StatCard label="Streak" value={stats.streak} sub="sessions" color="#8B5CF6" />
      </div>

      {barData.length > 0 && (
        <div className={`${CARD_CLASS} p-5 mb-5`}>
          <SectionLabel>Weekly Volume</SectionLabel>
          <BarChart data={barData} width={Math.min(600, barData.length * 80)} height={140} barColor="#3B82F6" />
        </div>
      )}

      {muscleEntries.length > 0 && (
        <div className={`${CARD_CLASS} p-5 mb-5`}>
          <SectionLabel>Muscle Volume Trends</SectionLabel>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3">
            {muscleEntries.map(([name, data]) => {
              const sparkData = data.map(d => d.effectiveSets);
              const last = data[data.length - 1]?.effectiveSets || 0;
              return (
                <div key={name} className="flex items-center gap-2.5 px-2.5 py-2 rounded-[8px] bg-surface2">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: MUSCLE_COLORS[name] || "#666" }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-muted whitespace-nowrap overflow-hidden text-ellipsis">{name}</div>
                    <div className="text-xs text-dim">{last} sets/wk</div>
                  </div>
                  <SparkLine data={sparkData} width={80} height={24} color={MUSCLE_COLORS[name] || "#3B82F6"} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {prList.length > 0 && (
        <div className={`${CARD_CLASS} p-5`}>
          <SectionLabel>Personal Records</SectionLabel>
          <div className="flex flex-col gap-1.5">
            {prList.slice(0, 10).map((pr, i) => (
              <div key={i} className="flex items-center gap-2.5 px-3 py-2 rounded-[8px] bg-surface2">
                <span className="text-md">🏆</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-content whitespace-nowrap overflow-hidden text-ellipsis">{pr.name}</div>
                  <div className="text-xs text-dim">{pr.type} &middot; {pr.date ? formatDate(pr.date) : ""}</div>
                </div>
                <div className="text-md font-bold text-warning">{pr.value}</div>
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
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search exercises..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full max-w-[360px] px-3.5 py-2 text-body bg-surface border border-edge rounded-[8px] text-content outline-none"
        />
      </div>

      <div className="flex flex-col gap-2">
        {filtered.map(exId => {
          const ex = EXERCISES[exId];
          const name = ex?.name || exId;
          const sessions = exerciseHistory[exId];
          const pr = prs[exId];
          const isOpen = expanded === exId;
          const lastSession = sessions[sessions.length - 1];

          return (
            <div key={exId} className={`${CARD_CLASS} overflow-hidden`}>
              <button
                onClick={() => setExpanded(isOpen ? null : exId)}
                className="w-full flex items-center gap-3 px-4 py-3.5 bg-transparent border-none cursor-pointer text-left"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-body font-semibold text-content whitespace-nowrap overflow-hidden text-ellipsis">{name}</div>
                  <div className="text-xs text-dim mt-0.5">
                    {sessions.length} session{sessions.length !== 1 ? "s" : ""}
                    {lastSession ? ` · Last: ${formatDate(lastSession.date)}` : ""}
                  </div>
                </div>
                {pr && (
                  <div className="text-sm text-warning font-semibold">
                    PR: {pr.weight.value} lbs
                  </div>
                )}
                <span className={`text-xs text-dim transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>▾</span>
              </button>

              {isOpen && (
                <div className="px-4 pb-4 border-t border-edge">
                  {sessions.length >= 2 && (
                    <div className="mt-3.5 mb-3.5">
                      <div className="text-sm text-dim mb-2">Weight Progression</div>
                      <LineChart
                        data={sessions.map(s => ({ x: formatDate(s.date), y: s.topWeight }))}
                        width={500} height={160} color="#3B82F6" yLabel="lbs"
                      />
                    </div>
                  )}

                  {sessions.length >= 2 && sessions.some(s => s.est1RM > 0) && (
                    <div className="mb-3.5">
                      <div className="text-sm text-dim mb-2">Estimated 1RM</div>
                      <LineChart
                        data={sessions.filter(s => s.est1RM > 0).map(s => ({ x: formatDate(s.date), y: s.est1RM }))}
                        width={500} height={160} color="#8B5CF6" yLabel="lbs"
                      />
                    </div>
                  )}

                  {pr && (
                    <div className="flex gap-2 flex-wrap mb-3">
                      {pr.weight.value > 0 && (
                        <span className="text-xs px-2.5 py-[3px] rounded-[20px] bg-warning/10 text-warning">
                          🏆 Best: {pr.weight.value} lbs
                        </span>
                      )}
                      {pr.est1RM.value > 0 && (
                        <span className="text-xs px-2.5 py-[3px] rounded-[20px] bg-pull/10 text-pull">
                          Est. 1RM: {pr.est1RM.value} lbs
                        </span>
                      )}
                    </div>
                  )}

                  <div className="text-sm text-dim mb-1.5">Recent Sessions</div>
                  <div className="flex flex-col gap-1">
                    {sessions.slice(-5).reverse().map((s, i) => (
                      <div key={i} className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-[6px] bg-surface2 text-sm">
                        <span className="text-dim w-[50px]">{formatDate(s.date)}</span>
                        <span className="text-content">
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
  const [expanded, setExpanded] = useState(null);

  if (workoutHistory.length === 0) {
    return <EmptyState icon="📅" title="No workout history" message="Complete workouts in GymMode to build your training log." />;
  }

  const reversed = [...workoutHistory].reverse();

  return (
    <div className="flex flex-col gap-2">
      {reversed.map((session, i) => {
        const isOpen = expanded === i;
        return (
          <div key={i} className={`${CARD_CLASS} overflow-hidden`}>
            <button
              onClick={() => setExpanded(isOpen ? null : i)}
              className="w-full flex items-center gap-3 px-4 py-3.5 bg-transparent border-none cursor-pointer text-left"
            >
              <div className="flex-1 min-w-0">
                <div className="text-body font-semibold text-content">{session.label}</div>
                <div className="text-xs text-dim mt-0.5">
                  {session.weekLabel} &middot; {session.date ? formatDate(session.date) : `Day ${session.dayNum}`}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-[60px] h-[5px] bg-edge rounded-[3px] overflow-hidden">
                  <div className="h-full rounded-[3px]" style={{ width: `${session.pct}%`, background: session.pct >= 80 ? "#22C55E" : session.pct >= 50 ? "#F59E0B" : "#EF4444" }} />
                </div>
                <span className="text-xs text-dim w-[30px] text-right">{session.pct}%</span>
              </div>
              <div className="text-sm text-muted w-[60px] text-right">
                {formatVolume(session.totalVolume)}
              </div>
              <span className={`text-xs text-dim transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>▾</span>
            </button>

            {isOpen && (
              <div className="px-4 pb-4 border-t border-edge">
                <div className="flex flex-col gap-1.5 mt-3">
                  {session.exercises.map((entry, ei) => {
                    const ex = EXERCISES[entry.exercise_id];
                    if (!ex) return null;
                    const loggedSets = entry.sets.map((set, si) => {
                      const key = `${ei}_${si}`;
                      const log = session.dayLog[key];
                      return { planned: set, logged: log || null };
                    });

                    return (
                      <div key={ei} className="px-2.5 py-2 rounded-[8px] bg-surface2">
                        <div className="text-xs font-semibold text-content mb-1">{ex.name}</div>
                        <div className="flex gap-1.5 flex-wrap">
                          {loggedSets.map((s, si) => {
                            const logged = s.logged;
                            if (!logged) {
                              return (
                                <span key={si} className="text-xs px-2 py-0.5 rounded-[6px] bg-edge text-faint">
                                  —
                                </span>
                              );
                            }
                            const hit = logged.reps >= s.planned.r;
                            const up = logged.w > s.planned.w;
                            const bg = up ? "rgba(245,158,11,0.12)" : hit ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)";
                            const c = up ? "#F59E0B" : hit ? "#22C55E" : "#EF4444";
                            return (
                              <span key={si} className="text-xs px-2 py-0.5 rounded-[6px] font-semibold" style={{ background: bg, color: c }}>
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
