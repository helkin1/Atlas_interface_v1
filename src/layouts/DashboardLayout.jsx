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
    <div className="max-w-[1400px] mx-auto px-9 py-9 text-content transition-all duration-300">
      {/* HEADER */}
      <div className="flex justify-between items-start mb-9">
        <div>
          {profile?.displayName && (
            <div className="text-md text-muted mb-1.5">
              {(() => { const h = new Date().getHours(); return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening"; })()}, {profile.displayName}
            </div>
          )}
          <h1 className="text-2xl font-[800] tracking-tight text-content mb-1">{plan.splitName}</h1>
          <div className="text-xs text-dim mb-3">{plan.weeks}-Week Mesocycle</div>
          <div className="flex gap-2 flex-wrap">
            {[
              { text: profile?.primaryGoal?.replace(/_/g, " ") || "hypertrophy", bg: t.alpha.primary._8, color: t.colors.primary },
              { text: dateRange, bg: t.alpha.success._8, color: t.colors.success },
              { text: "progressive overload", bg: t.alpha.pull._8, color: t.colors.pull },
            ].map(({ text, bg, color }) => (
              <span key={text} className="text-sm px-3.5 py-[5px] rounded-pill font-medium" style={{ background: bg, color }}>{text}</span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          {/* Tab navigation */}
          <div className="inline-flex gap-1 bg-surface2 rounded-md p-1">
            <button onClick={() => navigate("/dashboard")}
              className={`text-body px-5 py-2 rounded-sm border-none cursor-pointer transition-all duration-200 ${!isProgress ? "bg-surface text-content font-semibold shadow-card" : "bg-transparent text-dim font-normal"}`}
            >Dashboard</button>
            <button onClick={() => navigate("/progress")}
              className={`text-body px-5 py-2 rounded-sm border-none cursor-pointer transition-all duration-200 ${isProgress ? "bg-surface text-content font-semibold shadow-card" : "bg-transparent text-dim font-normal"}`}
            >Progress</button>
          </div>

          {/* Breadcrumb */}
          {!isProgress && (
            <div className="flex gap-1.5 items-center text-body">
              <button onClick={() => navigate("/dashboard")} className={`bg-none border-none cursor-pointer text-[inherit] ${viewLevel === "month" ? "text-content no-underline" : "text-primary underline underline-offset-[3px]"}`}>Month</button>
              {viewLevel !== "month" && curWeek && <><span className="text-faint">/</span><button onClick={() => navigate(`/dashboard/week/${weekIdx}`)} className={`bg-none border-none cursor-pointer text-[inherit] ${viewLevel === "week" ? "text-content no-underline" : "text-primary underline underline-offset-[3px]"}`}>{curWeek.label}</button></>}
              {viewLevel === "day" && curDay && <><span className="text-faint">/</span><span className="text-content">{curDay.label}</span></>}
            </div>
          )}

          <ThemeToggle mode={themeMode} onToggle={toggleTheme} />
          <SettingsMenu onEditPlan={onEditPlan} onSignOut={onSignOut} onAIInsights={onAIInsights} onProfile={onProfile} />
        </div>
      </div>

      {/* Content area */}
      {isProgress ? (
        <ErrorBoundary><Outlet /></ErrorBoundary>
      ) : (
        <div className="grid grid-cols-[1fr_320px] gap-9">
          <div><ErrorBoundary><Outlet /></ErrorBoundary></div>
          <div className="sticky top-5 self-start max-h-[calc(100vh-60px)] overflow-y-auto">
            <Sidebar weekIdx={weekIdx} viewLevel={viewLevel} curWeek={curWeek} curDay={curDay} plan={plan} />
          </div>
        </div>
      )}
    </div>
  );
}
