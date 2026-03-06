import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useTheme } from "../context/theme.js";
import { MO_NAMES } from "../utils/helpers.js";
import ThemeToggle from "../components/ThemeToggle.jsx";
import SettingsMenu from "../components/SettingsMenu.jsx";
import Sidebar from "../components/Sidebar.jsx";
import ErrorBoundary from "../components/ErrorBoundary.jsx";

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
