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

const NOTIF_SEVERITY_STYLES = {
  critical: { color: "#EF4444", dot: "#EF4444" },
  warning:  { color: "#F59E0B", dot: "#F59E0B" },
  info:     { color: "#3B82F6", dot: "#3B82F6" },
};

function NotificationsButton({ plan, monthData }) {
  const t = useTheme();
  const [open, setOpen] = useState(false);
  const profile = useMemo(() => loadProfile(), []);
  const config = useMemo(() => getPersonalizedConfig(profile), [profile]);

  const alerts = useMemo(() => {
    if (!plan?.weekTemplate) return [];
    const report = analyzePlan(plan.weekTemplate);
    return getPersonalizedAlerts(report, config).slice(0, 8);
  }, [plan, monthData, config]);

  const count = alerts.length;

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: 40, height: 40, borderRadius: 10,
          border: `1px solid ${t.border}`, background: t.surface,
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          color: t.textMuted, boxShadow: t.shadow, transition: "all 0.15s ease",
          position: "relative",
        }}
        aria-label="Notifications"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {count > 0 && (
          <span style={{
            position: "absolute", top: -4, right: -4,
            width: 18, height: 18, borderRadius: "50%",
            background: "#EF4444", color: "#fff",
            fontSize: 10, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {count}
          </span>
        )}
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 99 }} />
          <div style={{
            position: "absolute", right: 0, top: 48,
            background: t.surface, borderRadius: 12, padding: 0,
            minWidth: 300, maxWidth: 360, zIndex: 100,
            boxShadow: t.shadowLg, border: `1px solid ${t.border}`,
            maxHeight: 400, overflowY: "auto",
          }}>
            <div style={{
              padding: "12px 16px", borderBottom: `1px solid ${t.border}`,
              fontSize: 13, fontWeight: 600, color: t.text,
            }}>
              Notifications
            </div>
            {alerts.length === 0 ? (
              <div style={{ padding: "24px 16px", textAlign: "center" }}>
                <div style={{ fontSize: 12, color: t.textDim }}>No notifications</div>
              </div>
            ) : (
              <div style={{ padding: 8 }}>
                {alerts.map(alert => {
                  const s = NOTIF_SEVERITY_STYLES[alert.severity] || NOTIF_SEVERITY_STYLES.info;
                  return (
                    <div key={alert.id} style={{
                      display: "flex", alignItems: "flex-start", gap: 10,
                      padding: "10px 12px", borderRadius: 8,
                      transition: "background 0.1s ease",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = t.surface2}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    >
                      <div style={{
                        width: 6, height: 6, borderRadius: "50%",
                        background: s.dot, marginTop: 5, flexShrink: 0,
                      }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: t.text, lineHeight: 1.3, marginBottom: 2 }}>
                          {alert.title}
                        </div>
                        <div style={{ fontSize: 11, color: t.textDim, lineHeight: 1.4 }}>
                          {alert.message}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
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
            {!isProgress && <NotificationsButton plan={plan} monthData={monthData} />}
            <SettingsMenu onEditPlan={onEditPlan} onSignOut={onSignOut} onAIInsights={onAIInsights} onProfile={onProfile} />
          </div>
        </header>

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
