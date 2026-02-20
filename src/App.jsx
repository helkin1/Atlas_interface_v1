import { useState, useEffect, useRef, useCallback } from "react";
import { themes, ThemeContext } from "./context/theme.js";
import { PlanDataContext } from "./context/plan-data.js";
import { MO_NAMES } from "./utils/helpers.js";
import { buildMonthFromPlan, DEFAULT_PLAN, clonePlan, ensurePlanId } from "./utils/plan-engine.js";
import { loadPlan, savePlan, loadTheme, saveTheme, hasSavedPlan } from "./utils/storage.js";

import MonthView from "./components/MonthView.jsx";
import WeekView from "./components/WeekView.jsx";
import DayView from "./components/DayView.jsx";
import Sidebar from "./components/Sidebar.jsx";
import ThemeToggle from "./components/ThemeToggle.jsx";
import SettingsMenu from "./components/SettingsMenu.jsx";
import IntroScreen from "./components/IntroScreen.jsx";
import StepGoalSplit from "./components/StepGoalSplit.jsx";
import StepSchedule from "./components/StepSchedule.jsx";
import StepExercises from "./components/StepExercises.jsx";
import StepReview from "./components/StepReview.jsx";
import BuilderSidebar from "./components/BuilderSidebar.jsx";

const BUILDER_STEPS = [{ key: "split", label: "Split" }, { key: "schedule", label: "Schedule" }, { key: "exercises", label: "Exercises" }, { key: "review", label: "Review" }];

export default function App() {
  const [themeMode, setThemeMode] = useState(() => loadTheme("dark"));
  const [mode, setMode] = useState(() => hasSavedPlan() ? "dashboard" : "intro");
  const [plan, setPlan] = useState(() => ensurePlanId(loadPlan(clonePlan(DEFAULT_PLAN))));
  const [monthData, setMonthData] = useState(() => buildMonthFromPlan(ensurePlanId(loadPlan(clonePlan(DEFAULT_PLAN)))));

  // Dashboard state
  const [viewLevel, setViewLevel] = useState("month");
  const [weekIdx, setWeekIdx] = useState(null);
  const [dayIdx, setDayIdx] = useState(null);

  // Builder state
  const [builderStep, setBuilderStep] = useState(0);
  const [builderPlan, _setBuilderPlan] = useState(() => clonePlan(DEFAULT_PLAN));

  // Undo / redo history for builder
  const historyRef = useRef({ past: [], future: [] });
  const setBuilderPlan = useCallback((planOrFn) => {
    _setBuilderPlan(prev => {
      const next = typeof planOrFn === "function" ? planOrFn(prev) : planOrFn;
      historyRef.current.past.push(prev);
      if (historyRef.current.past.length > 40) historyRef.current.past.shift();
      historyRef.current.future = [];
      return next;
    });
  }, []);
  const canUndo = historyRef.current.past.length > 0;
  const canRedo = historyRef.current.future.length > 0;
  const undo = () => { if (!canUndo) return; const prev = historyRef.current.past.pop(); historyRef.current.future.push(builderPlan); _setBuilderPlan(prev); };
  const redo = () => { if (!canRedo) return; const next = historyRef.current.future.pop(); historyRef.current.past.push(builderPlan); _setBuilderPlan(next); };

  useEffect(() => { saveTheme(themeMode); }, [themeMode]);
  useEffect(() => { savePlan(ensurePlanId(plan)); }, [plan]);

  // Keyboard shortcut: Ctrl/Cmd+Z = undo, Ctrl/Cmd+Shift+Z = redo
  useEffect(() => {
    if (mode !== "builder") return;
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) redo(); else undo();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [mode, undo, redo]);

  const t = themes[themeMode];
  const toggleTheme = () => setThemeMode(m => m === "dark" ? "light" : "dark");
  const goMonth = () => { setViewLevel("month"); setWeekIdx(null); setDayIdx(null); };
  const goWeek = (wi) => { setWeekIdx(wi); setDayIdx(null); setViewLevel("week"); };
  const goDay = (wi, di) => { setWeekIdx(wi); setDayIdx(di); setViewLevel("day"); };
  const backToWeek = () => { setViewLevel("week"); setDayIdx(null); };

  const curWeek = weekIdx !== null ? monthData[weekIdx] : null;
  const curDay = curWeek && dayIdx !== null ? curWeek.days[dayIdx] : null;

  const startBuilder = () => {
    historyRef.current = { past: [], future: [] };
    _setBuilderPlan(clonePlan(DEFAULT_PLAN));
    setBuilderStep(0);
    setMode("builder");
  };

  const activatePlan = () => {
    const nextPlan = ensurePlanId(clonePlan(builderPlan));
    const newMonth = buildMonthFromPlan(nextPlan);
    setPlan(nextPlan);
    setMonthData(newMonth);
    setMode("dashboard");
    goMonth();
  };

  const editPlan = () => {
    historyRef.current = { past: [], future: [] };
    _setBuilderPlan(clonePlan(plan));
    setBuilderStep(0);
    setMode("builder");
  };

  const cancelBuilder = () => {
    if (builderStep > 0) {
      setBuilderStep(builderStep - 1);
    } else {
      setMode(hasSavedPlan() ? "dashboard" : "intro");
    }
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

      {mode === "intro" ? (
        <IntroScreen onStart={startBuilder} themeMode={themeMode} onToggleTheme={toggleTheme} />
      ) : (
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
                <ThemeToggle mode={themeMode} onToggle={toggleTheme} />
                <SettingsMenu onEditPlan={editPlan} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 28 }}>
              <div>
                {viewLevel === "month" && <MonthView onWeek={goWeek} onDay={goDay} />}
                {viewLevel === "week" && curWeek && <WeekView week={curWeek} onDay={(di) => goDay(weekIdx, di)} onBack={goMonth} />}
                {viewLevel === "day" && curDay && !curDay.isRest && <DayView day={curDay} planId={plan.planId} onBack={backToWeek} />}
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
                <Sidebar weekIdx={weekIdx} viewLevel={viewLevel} curWeek={curWeek} curDay={curDay} plan={plan} />
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
                <div style={{ display: "flex", gap: 2, marginLeft: 4 }}>
                  <button onClick={undo} disabled={!canUndo} title="Undo (Ctrl+Z)" style={{ padding: "4px 8px", borderRadius: 6, border: `1px solid ${t.borderLight}`, background: "transparent", color: canUndo ? t.textMuted : t.textFaint, cursor: canUndo ? "pointer" : "default", fontSize: 13, fontWeight: 700, opacity: canUndo ? 1 : 0.35 }}>{"\u21A9"}</button>
                  <button onClick={redo} disabled={!canRedo} title="Redo (Ctrl+Shift+Z)" style={{ padding: "4px 8px", borderRadius: 6, border: `1px solid ${t.borderLight}`, background: "transparent", color: canRedo ? t.textMuted : t.textFaint, cursor: canRedo ? "pointer" : "default", fontSize: 13, fontWeight: 700, opacity: canRedo ? 1 : 0.35 }}>{"\u21AA"}</button>
                </div>
                <ThemeToggle mode={themeMode} onToggle={toggleTheme} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: builderStep >= 1 ? "1fr 320px" : "1fr", gap: 28 }}>
              <div>
                {builderStep === 0 && <StepGoalSplit plan={builderPlan} onChange={setBuilderPlan} />}
                {builderStep === 1 && <StepSchedule plan={builderPlan} onChange={setBuilderPlan} />}
                {builderStep === 2 && <StepExercises plan={builderPlan} onChange={setBuilderPlan} />}
                {builderStep === 3 && <StepReview plan={builderPlan} />}
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28, paddingTop: 20, borderTop: `1px solid ${t.border}` }}>
                  <button onClick={cancelBuilder} style={{ padding: "10px 24px", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", background: "transparent", border: `1px solid ${t.borderLight}`, color: t.textMuted }}>{builderStep > 0 ? "\u2190 Back" : "\u2190 Cancel"}</button>
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
      )}
      </PlanDataContext.Provider>
    </ThemeContext.Provider>
  );
}
