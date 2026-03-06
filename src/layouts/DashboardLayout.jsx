import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useTheme } from "../context/theme.js";
import { MO_NAMES } from "../utils/helpers.js";
import ThemeToggle from "../components/ThemeToggle.jsx";
import VariantSelector from "../components/VariantSelector.jsx";
import SettingsMenu from "../components/SettingsMenu.jsx";
import Sidebar from "../components/Sidebar.jsx";
import ErrorBoundary from "../components/ErrorBoundary.jsx";

export default function DashboardLayout({ plan, monthData, themeMode, toggleTheme, themeVariant, setThemeVariant, onEditPlan, onSignOut, onAIInsights, onProfile, profile }) {
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
    <div style={{ maxWidth: 1400, margin: "0 auto", padding: t.variant === "stark" ? "48px 48px" : "32px 32px", color: t.text, transition: "all 0.3s ease" }}>
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
        <div>
          {profile?.displayName && (
            <div style={{ fontSize: 13, color: t.textMuted, marginBottom: 4 }}>
              {(() => { const h = new Date().getHours(); return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening"; })()}, {profile.displayName}
            </div>
          )}
          <div style={{ fontSize: 11, color: t.textDim, marginBottom: 6 }}>Active Plan &middot; {plan.weeks}-Week Mesocycle</div>
          <h1 style={{ fontSize: t.fontSize?.h1 ?? 26, fontWeight: t.fontWeight?.black ?? 800, letterSpacing: t.variant === "stark" ? -1.5 : -0.5, color: t.text }}>{plan.splitName}</h1>
          <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
            {[
              { text: profile?.primaryGoal?.replace(/_/g, " ") || "hypertrophy", bg: t.alpha.primary._10, color: t.colors.primary },
              { text: dateRange, bg: t.alpha.success._10, color: t.colors.success },
              { text: "progressive overload", bg: t.alpha.pull._10, color: t.colors.pull },
            ].map(({ text, bg, color }) => (
              <span key={text} style={{
                fontSize: 11, padding: t.variant === "stark" ? "0" : "4px 12px",
                borderRadius: t.variant === "stark" ? 0 : 20,
                background: t.variant === "stark" ? "transparent" : t.variant === "glass" ? "rgba(255,255,255,0.06)" : bg,
                color, fontWeight: t.variant === "stark" ? 400 : 500,
                backdropFilter: t.variant === "glass" ? "blur(8px)" : "none",
                border: t.variant === "glass" ? "1px solid rgba(255,255,255,0.08)" : "none",
                letterSpacing: t.variant === "stark" ? 0.5 : 0,
              }}>{text}{t.variant === "stark" ? " \u00b7 " : ""}</span>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Tab navigation */}
          <div style={{ display: "flex", gap: 2, background: t.variant === "glass" ? "rgba(255,255,255,0.06)" : t.variant === "stark" ? "transparent" : t.surface2, borderRadius: t.variant === "stark" ? 0 : 10, padding: 3, backdropFilter: t.variant === "glass" ? "blur(12px)" : "none", border: t.variant === "stark" ? `1px solid ${t.borderLight}` : "none" }}>
            <button onClick={() => navigate("/dashboard")} style={{ fontSize: 12, padding: "6px 16px", borderRadius: 8, border: "none", cursor: "pointer", background: !isProgress ? t.alpha.primary._12 : "transparent", color: !isProgress ? t.colors.primary : t.textDim, fontWeight: !isProgress ? 600 : 400 }}>Dashboard</button>
            <button onClick={() => navigate("/progress")} style={{ fontSize: 12, padding: "6px 16px", borderRadius: 8, border: "none", cursor: "pointer", background: isProgress ? t.alpha.primary._12 : "transparent", color: isProgress ? t.colors.primary : t.textDim, fontWeight: isProgress ? 600 : 400 }}>Progress</button>
          </div>

          {/* Breadcrumb */}
          {!isProgress && (
            <div style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 13 }}>
              <button onClick={() => navigate("/dashboard")} style={{ color: viewLevel === "month" ? t.text : t.colors.primary, background: "none", border: "none", cursor: "pointer", fontSize: "inherit", textDecoration: viewLevel === "month" ? "none" : "underline", textUnderlineOffset: 3 }}>Month</button>
              {viewLevel !== "month" && curWeek && <><span style={{ color: t.textFaint }}>/</span><button onClick={() => navigate(`/dashboard/week/${weekIdx}`)} style={{ color: viewLevel === "week" ? t.text : t.colors.primary, background: "none", border: "none", cursor: "pointer", fontSize: "inherit", textDecoration: viewLevel === "week" ? "none" : "underline", textUnderlineOffset: 3 }}>{curWeek.label}</button></>}
              {viewLevel === "day" && curDay && <><span style={{ color: t.textFaint }}>/</span><span style={{ color: t.text }}>{curDay.label}</span></>}
            </div>
          )}

          <VariantSelector variant={themeVariant} onChange={setThemeVariant} />
          <ThemeToggle mode={themeMode} onToggle={toggleTheme} />
          <SettingsMenu onEditPlan={onEditPlan} onSignOut={onSignOut} onAIInsights={onAIInsights} onProfile={onProfile} />
        </div>
      </div>

      {/* Content area */}
      {isProgress ? (
        <ErrorBoundary><Outlet /></ErrorBoundary>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 32 }}>
          <div><ErrorBoundary><Outlet /></ErrorBoundary></div>
          <div style={{ position: "sticky", top: 20, alignSelf: "start", maxHeight: "calc(100vh - 60px)", overflowY: "auto" }}>
            <Sidebar weekIdx={weekIdx} viewLevel={viewLevel} curWeek={curWeek} curDay={curDay} plan={plan} />
          </div>
        </div>
      )}
    </div>
  );
}
