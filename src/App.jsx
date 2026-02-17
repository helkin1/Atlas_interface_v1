import { useState, useEffect } from "react";
import { themes, ThemeContext } from "./context/theme.js";
import { PlanDataContext } from "./context/plan-data.js";
import { MO_NAMES } from "./utils/helpers.js";
import { buildMonthFromPlan, DEFAULT_PLAN } from "./utils/plan-engine.js";
import { loadPlan, savePlan, loadTheme, saveTheme } from "./utils/storage.js";

import MonthView from "./components/MonthView.jsx";
import WeekView from "./components/WeekView.jsx";
import DayView from "./components/DayView.jsx";
import Sidebar from "./components/Sidebar.jsx";
import ThemeToggle from "./components/ThemeToggle.jsx";
import SettingsMenu from "./components/SettingsMenu.jsx";
import StepGoalSplit from "./components/StepGoalSplit.jsx";
import StepSchedule from "./components/StepSchedule.jsx";
import StepExercises from "./components/StepExercises.jsx";
import StepReview from "./components/StepReview.jsx";
import BuilderSidebar from "./components/BuilderSidebar.jsx";

const BUILDER_STEPS = [{ key: "split", label: "Split" }, { key: "schedule", label: "Schedule" }, { key: "exercises", label: "Exercises" }, { key: "review", label: "Review" }];

export default function App() {
  const [themeMode, setThemeMode] = useState(() => loadTheme("dark"));
  const [mode, setMode] = useState("dashboard");
  const [plan, setPlan] = useState(() => loadPlan(DEFAULT_PLAN));
  const [monthData, setMonthData] = useState(() => buildMonthFromPlan(loadPlan(DEFAULT_PLAN)));

  // Dashboard state
  const [viewLevel, setViewLevel] = useState("month");
  const [weekIdx, setWeekIdx] = useState(null);
  const [dayIdx, setDayIdx] = useState(null);

  // Builder state
  const [builderStep, setBuilderStep] = useState(0);
  const [builderPlan, setBuilderPlan] = useState(DEFAULT_PLAN);

  useEffect(() => { saveTheme(themeMode); }, [themeMode]);
  useEffect(() => { savePlan(plan); }, [plan]);

  const t = themes[themeMode];
  const goMonth = () => { setViewLevel("month"); setWeekIdx(null); setDayIdx(null); };
  const goWeek = (wi) => { setWeekIdx(wi); setDayIdx(null); setViewLevel("week"); };
  const goDay = (wi, di) => { setWeekIdx(wi); setDayIdx(di); setViewLevel("day"); };
  const backToWeek = () => { setViewLevel("week"); setDayIdx(null); };

  const curWeek = weekIdx !== null ? monthData[weekIdx] : null;
  const curDay = curWeek && dayIdx !== null ? curWeek.days[dayIdx] : null;

  const activatePlan = () => {
    const newMonth = buildMonthFromPlan(builderPlan);
    setPlan(builderPlan);
    setMonthData(newMonth);
    setMode("dashboard");
    goMonth();
  };

  const editPlan = () => {
    setBuilderPlan({ ...plan });
    setBuilderStep(0);
    setMode("builder");
  };

  const canNext = builderStep === 0 ? !!builderPlan.splitKey : builderStep === 1 ? builderPlan.weekTemplate.some(d => !d.isRest) : true;

  const firstDate = monthData[0]?.days[0]?.date;
  const lastDate = monthData[monthData.length - 1]?.days[6]?.date;
  const dateRange = firstDate && lastDate ? `${MO_NAMES[firstDate.getMonth()]} ${firstDate.getDate()} \u2013 ${MO_NAMES[lastDate.getMonth()]} ${lastDate.getDate()}` : "";

  return (
    <ThemeContext.Provider value={t}>
      <PlanDataContext.Provider value={monthData}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Outfit', sans-serif; }
        body { background: ${t.bg}; transition: background 0.3s; }
        [style*="fontFamily: \\"mono\\""], [style*="font-family: mono"] { font-family: 'JetBrains Mono', monospace !important; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${t.borderLight}; border-radius: 4px; }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
        input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
      `}</style>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "28px 24px", color: t.text, transition: "color 0.3s" }}>

        {mode === "dashboard" ? (
          <>
            {/* DASHBOARD HEADER */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
              <div>
                <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 3, color: t.textFaint, fontFamily: "mono", marginBottom: 6 }}>Active Plan &middot; {plan.weeks}-Week Mesocycle</div>
                <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.5, color: t.text }}>{plan.splitName}</h1>
                <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "rgba(76,158,255,0.1)", color: "#4C9EFF" }}>hypertrophy</span>
                  <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "rgba(61,220,132,0.1)", color: "#3DDC84" }}>{dateRange}</span>
                  <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "rgba(167,139,250,0.1)", color: "#A78BFA" }}>progressive overload</span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ display: "flex", gap: 4, alignItems: "center", fontSize: 12, fontFamily: "mono" }}>
                  <button onClick={goMonth} style={{ color: viewLevel === "month" ? t.text : "#4C9EFF", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: "inherit", textDecoration: viewLevel === "month" ? "none" : "underline", textUnderlineOffset: 3 }}>Month</button>
                  {viewLevel !== "month" && curWeek && <><span style={{ color: t.textFaint }}>/</span><button onClick={() => { setViewLevel("week"); setDayIdx(null); }} style={{ color: viewLevel === "week" ? t.text : "#4C9EFF", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: "inherit", textDecoration: viewLevel === "week" ? "none" : "underline", textUnderlineOffset: 3 }}>{curWeek.label}</button></>}
                  {viewLevel === "day" && curDay && <><span style={{ color: t.textFaint }}>/</span><span style={{ color: t.text }}>{curDay.label}</span></>}
                </div>
                <ThemeToggle mode={themeMode} onToggle={() => setThemeMode(m => m === "dark" ? "light" : "dark")} />
                <SettingsMenu onEditPlan={editPlan} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 28 }}>
              <div>
                {viewLevel === "month" && <MonthView onWeek={goWeek} onDay={goDay} />}
                {viewLevel === "week" && curWeek && <WeekView week={curWeek} onDay={(di) => goDay(weekIdx, di)} onBack={goMonth} />}
                {viewLevel === "day" && curDay && !curDay.isRest && <DayView day={curDay} onBack={backToWeek} />}
                {viewLevel === "day" && curDay && curDay.isRest && (
                  <div>
                    <button onClick={backToWeek} style={{ fontSize: 12, color: "#4C9EFF", background: "none", border: "none", cursor: "pointer", marginBottom: 16 }}>&larr; Back to Week</button>
                    <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 16, padding: 60, textAlign: "center" }}>
                      <div style={{ fontSize: 48, marginBottom: 12 }}>😴</div>
                      <div style={{ fontSize: 22, fontWeight: 700, color: t.text }}>Rest Day</div>
                      <div style={{ fontSize: 14, color: t.textDim, marginTop: 8 }}>Recovery is part of the plan.</div>
                    </div>
                  </div>
                )}
              </div>
              <div style={{ position: "sticky", top: 20, alignSelf: "start", maxHeight: "calc(100vh - 60px)", overflowY: "auto" }}>
                <Sidebar weekIdx={weekIdx} viewLevel={viewLevel} curWeek={curWeek} curDay={curDay} />
              </div>
            </div>
          </>
        ) : (
          <>
            {/* BUILDER HEADER */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
              <div>
                <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 3, color: t.textFaint, fontFamily: "mono", marginBottom: 6 }}>Plan Builder &middot; New Mesocycle</div>
                <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.5, color: t.text }}>{builderPlan.splitName || "Build Your Plan"}</h1>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                  {BUILDER_STEPS.map((s, i) => (
                    <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <button onClick={() => i <= builderStep && setBuilderStep(i)} style={{ fontSize: 11, fontFamily: "mono", padding: "4px 10px", borderRadius: 6, cursor: i <= builderStep ? "pointer" : "default", background: i === builderStep ? "rgba(76,158,255,0.1)" : "transparent", border: `1px solid ${i === builderStep ? "#4C9EFF" : i < builderStep ? "rgba(61,220,132,0.3)" : t.border}`, color: i === builderStep ? "#4C9EFF" : i < builderStep ? "#3DDC84" : t.textDim }}>{i < builderStep ? "\u2713" : i + 1}. {s.label}</button>
                      {i < BUILDER_STEPS.length - 1 && <span style={{ color: t.textFaint, fontSize: 10 }}>&rarr;</span>}
                    </div>
                  ))}
                </div>
                <ThemeToggle mode={themeMode} onToggle={() => setThemeMode(m => m === "dark" ? "light" : "dark")} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: builderStep >= 1 ? "1fr 320px" : "1fr", gap: 28 }}>
              <div>
                {builderStep === 0 && <StepGoalSplit plan={builderPlan} onChange={setBuilderPlan} />}
                {builderStep === 1 && <StepSchedule plan={builderPlan} onChange={setBuilderPlan} />}
                {builderStep === 2 && <StepExercises plan={builderPlan} onChange={setBuilderPlan} />}
                {builderStep === 3 && <StepReview plan={builderPlan} />}
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28, paddingTop: 20, borderTop: `1px solid ${t.border}` }}>
                  <button onClick={() => builderStep > 0 ? setBuilderStep(builderStep - 1) : setMode("dashboard")} style={{ padding: "10px 24px", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", background: "transparent", border: `1px solid ${t.borderLight}`, color: t.textMuted }}>{builderStep > 0 ? "\u2190 Back" : "\u2190 Cancel"}</button>
                  {builderStep < 3 ? (
                    <button onClick={() => canNext && setBuilderStep(builderStep + 1)} style={{ padding: "10px 28px", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: canNext ? "pointer" : "default", background: canNext ? "rgba(76,158,255,0.12)" : t.surface2, border: `1px solid ${canNext ? "#4C9EFF" : t.border}`, color: canNext ? "#4C9EFF" : t.textDim }}>Next: {BUILDER_STEPS[builderStep + 1]?.label} &rarr;</button>
                  ) : (
                    <button onClick={activatePlan} style={{ padding: "10px 28px", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", background: "rgba(61,220,132,0.12)", border: "1px solid rgba(61,220,132,0.4)", color: "#3DDC84" }}>{"\u2713"} Activate Plan</button>
                  )}
                </div>
              </div>
              {builderStep >= 1 && <div style={{ position: "sticky", top: 20, alignSelf: "start", maxHeight: "calc(100vh - 60px)", overflowY: "auto" }}><BuilderSidebar plan={builderPlan} /></div>}
            </div>
          </>
        )}
      </div>
      </PlanDataContext.Provider>
    </ThemeContext.Provider>
  );
}
