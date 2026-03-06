import { useTheme } from "../context/theme.js";
import ThemeToggle from "../components/ThemeToggle.jsx";
import StepGoalSplit from "../components/StepGoalSplit.jsx";
import StepSchedule from "../components/StepSchedule.jsx";
import StepExercises from "../components/StepExercises.jsx";
import StepReview from "../components/StepReview.jsx";
import BuilderSidebar from "../components/BuilderSidebar.jsx";
import ErrorBoundary from "../components/ErrorBoundary.jsx";

const BUILDER_STEPS = [
  { key: "split", label: "Plan" },
  { key: "schedule", label: "Schedule" },
  { key: "exercises", label: "Exercises" },
  { key: "review", label: "Review" },
];

export { BUILDER_STEPS };

export default function BuilderLayout({
  builderPlan, builderStep, setBuilderStep, setBuilderPlan,
  canUndo, canRedo, undo, redo,
  canNext, onCancel, onActivate,
  themeMode, toggleTheme,
}) {
  const t = useTheme();

  return (
    <ErrorBoundary>
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "28px 24px", color: t.text, transition: "color 0.3s" }}>
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
              <button onClick={onCancel} style={{ padding: "10px 24px", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", background: "transparent", border: `1px solid ${t.borderLight}`, color: t.textMuted }}>{builderStep > 0 ? "\u2190 Back" : "\u2190 Cancel"}</button>
              {builderStep < 3 ? (
                <button onClick={() => canNext && setBuilderStep(builderStep + 1)} style={{ padding: "10px 28px", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: canNext ? "pointer" : "default", background: canNext ? "rgba(76,158,255,0.12)" : t.surface2, border: `1px solid ${canNext ? "#4C9EFF" : t.border}`, color: canNext ? "#4C9EFF" : t.textDim }}>Next: {BUILDER_STEPS[builderStep + 1]?.label} &rarr;</button>
              ) : (
                <button onClick={onActivate} style={{ padding: "10px 28px", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", background: "rgba(61,220,132,0.12)", border: "1px solid rgba(61,220,132,0.4)", color: "#3DDC84" }}>{"\u2713"} Activate Plan</button>
              )}
            </div>
          </div>
          {builderStep >= 1 && <div style={{ position: "sticky", top: 20, alignSelf: "start", maxHeight: "calc(100vh - 60px)", overflowY: "auto" }}><BuilderSidebar plan={builderPlan} /></div>}
        </div>
      </div>
    </ErrorBoundary>
  );
}
