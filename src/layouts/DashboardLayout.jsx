import { useState, useMemo } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useTheme } from "../context/theme.js";
import { MO_NAMES, weekMuscleVol, calcPersonalizedGoalPcts, personalizedOverallGoalPct, goalPctColor } from "../utils/helpers.js";
import { loadProfile } from "../utils/storage.js";
import { getPersonalizedConfig, getPersonalizedAlerts } from "../utils/personalization-engine.js";
import { analyzePlan } from "../utils/science-engine.js";
import ThemeToggle from "../components/ThemeToggle.jsx";
import SettingsMenu from "../components/SettingsMenu.jsx";
import Sidebar from "../components/Sidebar.jsx";
import ErrorBoundary from "../components/ErrorBoundary.jsx";

function IntelligenceBanner({ plan, monthData, t }) {
  const [expanded, setExpanded] = useState(false);
  const profile = useMemo(() => loadProfile(), []);
  const config = useMemo(() => getPersonalizedConfig(profile), [profile]);

  const { score, topAlerts } = useMemo(() => {
    if (!plan?.weekTemplate) return { score: 0, topAlerts: [] };
    const report = analyzePlan(plan.weekTemplate);
    const numWeeks = monthData.length || 1;
    const allMusc = {};
    monthData.forEach(w => {
      const mv = weekMuscleVol(w);
      Object.entries(mv).forEach(([m, s]) => { allMusc[m] = (allMusc[m] || 0) + s; });
    });
    const avgMusc = {};
    Object.entries(allMusc).forEach(([m, s]) => { avgMusc[m] = s / numWeeks; });
    const goals = calcPersonalizedGoalPcts(avgMusc, config);
    const sc = personalizedOverallGoalPct(goals, config);
    const alerts = getPersonalizedAlerts(report, config);
    return { score: sc, topAlerts: alerts.slice(0, 3) };
  }, [plan, monthData, config]);

  if (!topAlerts.length && score >= 80) return null;

  const scoreColor = goalPctColor(score);
  const topAlert = topAlerts[0];

  return (
    <div style={{
      background: t.surface, border: `1px solid ${t.border}`, borderRadius: 10,
      padding: "10px 16px", marginBottom: 20, boxShadow: t.shadow,
    }}>
      <div
        style={{ display: "flex", alignItems: "center", gap: 12, cursor: topAlerts.length > 1 ? "pointer" : "default" }}
        onClick={() => topAlerts.length > 1 && setExpanded(!expanded)}
      >
        <div style={{
          width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
          background: `${scoreColor}15`, color: scoreColor, fontSize: 12, fontWeight: 700, flexShrink: 0,
        }}>
          {score}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: t.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {topAlert ? topAlert.title : "Plan looks good for your goals"}
          </div>
          <div style={{ fontSize: 10, color: t.textDim }}>
            Your Plan Score · Weighted by {config.primaryGoal?.replace("_", " ") || "goal"}
          </div>
        </div>
        {topAlerts.length > 1 && (
          <span style={{ fontSize: 10, color: t.textDim, flexShrink: 0 }}>
            {expanded ? "▴" : `▾ +${topAlerts.length - 1}`}
          </span>
        )}
      </div>
      {expanded && topAlerts.length > 1 && (
        <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${t.border}` }}>
          {topAlerts.slice(1).map(a => (
            <div key={a.id} style={{ fontSize: 11, color: t.textMuted, padding: "3px 0", paddingLeft: 44 }}>
              {a.title}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DashboardLayout({ plan, monthData, themeMode, toggleTheme, onEditPlan, onSignOut, onAIInsights, onProfile, profile }) {
  const t = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Derive viewLevel, weekIdx, dayIdx from URL
  const pathParts = location.pathname.replace(/^\/dashboard\/?/, "").split("/").filter(Boolean);
  let viewLevel = "month", weekIdx = null, dayIdx = null;
  if (pathParts[0] === "week" && pathParts[1] != null) {
    weekIdx = parseInt(pathParts[1], 10);
    if (pathParts[2] === "day" && pathParts[3] != null) {
      dayIdx = parseInt(pathParts[3], 10);
      viewLevel = "day";
    } else {
      viewLevel = "week";
    }
  }

  const curWeek = weekIdx !== null ? monthData[weekIdx] : null;
  const curDay = curWeek && dayIdx !== null ? curWeek.days[dayIdx] : null;

  const firstDate = monthData[0]?.days[0]?.date;
  const lastDate = monthData[monthData.length - 1]?.days[6]?.date;
  const dateRange = firstDate && lastDate ? `${MO_NAMES[firstDate.getMonth()]} ${firstDate.getDate()} \u2013 ${MO_NAMES[lastDate.getMonth()]} ${lastDate.getDate()}` : "";

  const isProgress = location.pathname.startsWith("/progress");

  return (
    <div style={{ 
      minHeight: "100vh",
      background: t.bg,
      transition: "background 0.2s ease"
    }}>
      <div style={{ 
        maxWidth: 1280, 
        margin: "0 auto", 
        padding: "32px 40px",
        color: t.text,
      }}>
        {/* HEADER */}
        <header style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "flex-start", 
          marginBottom: 40,
          paddingBottom: 24,
          borderBottom: `1px solid ${t.border}`,
        }}>
          <div>
            {profile?.displayName && (
              <p style={{ 
                fontSize: 13, 
                color: t.textMuted, 
                marginBottom: 4,
                fontWeight: 400,
              }}>
                {(() => { const h = new Date().getHours(); return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening"; })()}, {profile.displayName}
              </p>
            )}
            <h1 style={{ 
              fontSize: 28, 
              fontWeight: 600, 
              letterSpacing: -0.5, 
              color: t.text, 
              marginBottom: 6,
              lineHeight: 1.2,
            }}>
              {plan.splitName}
            </h1>
            <p style={{ 
              fontSize: 14, 
              color: t.textDim, 
              marginBottom: 16,
            }}>
              {plan.weeks}-week mesocycle
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[
                { text: profile?.primaryGoal?.replace(/_/g, " ") || "hypertrophy" },
                { text: dateRange },
                { text: "progressive overload" },
              ].map(({ text }) => (
                <span key={text} style={{
                  fontSize: 12, 
                  padding: "6px 12px",
                  borderRadius: 6,
                  background: t.surface2,
                  color: t.textMuted, 
                  fontWeight: 500,
                  border: `1px solid ${t.border}`,
                }}>
                  {text}
                </span>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Tab navigation */}
            <nav style={{ 
              display: "inline-flex", 
              gap: 2, 
              background: t.surface2, 
              borderRadius: 10, 
              padding: 4,
              border: `1px solid ${t.border}`,
            }}>
              <button 
                onClick={() => navigate("/dashboard")} 
                style={{
                  fontSize: 13, 
                  padding: "8px 16px", 
                  borderRadius: 8, 
                  border: "none", 
                  cursor: "pointer",
                  background: !isProgress ? t.surface : "transparent",
                  color: !isProgress ? t.text : t.textDim,
                  fontWeight: !isProgress ? 500 : 400,
                  boxShadow: !isProgress ? t.shadow : "none",
                  transition: "all 0.15s ease",
                }}
              >
                Dashboard
              </button>
              <button 
                onClick={() => navigate("/progress")} 
                style={{
                  fontSize: 13, 
                  padding: "8px 16px", 
                  borderRadius: 8, 
                  border: "none", 
                  cursor: "pointer",
                  background: isProgress ? t.surface : "transparent",
                  color: isProgress ? t.text : t.textDim,
                  fontWeight: isProgress ? 500 : 400,
                  boxShadow: isProgress ? t.shadow : "none",
                  transition: "all 0.15s ease",
                }}
              >
                Progress
              </button>
            </nav>

            {/* Breadcrumb */}
            {!isProgress && viewLevel !== "month" && (
              <nav style={{ 
                display: "flex", 
                gap: 8, 
                alignItems: "center", 
                fontSize: 13,
                padding: "8px 12px",
                background: t.surface2,
                borderRadius: 8,
                border: `1px solid ${t.border}`,
              }}>
                <button 
                  onClick={() => navigate("/dashboard")} 
                  style={{ 
                    color: t.textMuted, 
                    background: "none", 
                    border: "none", 
                    cursor: "pointer", 
                    fontSize: "inherit",
                    fontWeight: 400,
                    padding: 0,
                  }}
                >
                  Month
                </button>
                {curWeek && (
                  <>
                    <span style={{ color: t.textFaint }}>/</span>
                    <button 
                      onClick={() => navigate(`/dashboard/week/${weekIdx}`)} 
                      style={{ 
                        color: viewLevel === "week" ? t.text : t.textMuted, 
                        background: "none", 
                        border: "none", 
                        cursor: "pointer", 
                        fontSize: "inherit",
                        fontWeight: viewLevel === "week" ? 500 : 400,
                        padding: 0,
                      }}
                    >
                      {curWeek.label}
                    </button>
                  </>
                )}
                {viewLevel === "day" && curDay && (
                  <>
                    <span style={{ color: t.textFaint }}>/</span>
                    <span style={{ color: t.text, fontWeight: 500 }}>{curDay.label}</span>
                  </>
                )}
              </nav>
            )}

            <ThemeToggle mode={themeMode} onToggle={toggleTheme} />
            <SettingsMenu onEditPlan={onEditPlan} onSignOut={onSignOut} onAIInsights={onAIInsights} onProfile={onProfile} />
          </div>
        </header>

        {/* Intelligence Banner — only on dashboard views */}
        {!isProgress && <IntelligenceBanner plan={plan} monthData={monthData} t={t} />}

        {/* Content area */}
        {isProgress ? (
          <ErrorBoundary><Outlet /></ErrorBoundary>
        ) : (
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "1fr 300px", 
            gap: 40,
            alignItems: "start",
          }}>
            <main>
              <ErrorBoundary><Outlet /></ErrorBoundary>
            </main>
            <aside style={{ 
              position: "sticky", 
              top: 32, 
              maxHeight: "calc(100vh - 64px)", 
              overflowY: "auto",
              overflowX: "hidden",
            }}>
              <Sidebar weekIdx={weekIdx} viewLevel={viewLevel} curWeek={curWeek} curDay={curDay} plan={plan} />
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
