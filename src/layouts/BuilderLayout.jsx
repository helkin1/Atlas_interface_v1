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
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "36px 36px", color: t.text, transition: "color 0.3s" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 36 }}>
          <div>
            <div style={{ fontSize: 12, color: t.textDim, marginBottom: 6 }}>Plan Builder</div>
            <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.5, color: t.text }}>{builderPlan.splitName || "Build Your Plan"}</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "inline-flex", gap: 4, background: t.surface2, borderRadius: 16, padding: 4, alignItems: "center" }}>
              {BUILDER_STEPS.map((s, i) => (
                <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <button onClick={() => i <= builderStep && setBuilderStep(i)} style={{
                    fontSize: 12, padding: "7px 14px", borderRadius: 12, cursor: i <= builderStep ? "pointer" : "default",
                    background: i === builderStep ? t.surface : "transparent",
                    border: "none",
                    color: i === builderStep ? t.text : i < builderStep ? t.colors.success : t.textDim,
                    fontWeight: i === builderStep ? 600 : 400,
                    boxShadow: i === builderStep ? t.shadow : "none",
                    transition: "all 0.2s ease",
                  }}>{i < builderStep ? "\u2713 " : ""}{s.label}</button>
                  {i < BUILDER_STEPS.length - 1 && <span style={{ color: t.textFaint, fontSize: 10 }}>&rarr;</span>}
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              <button onClick={undo} disabled={!canUndo} title="Undo (Ctrl+Z)" style={{ padding: "6px 10px", borderRadius: 10, border: `1px solid ${t.border}`, background: t.surface, color: canUndo ? t.textMuted : t.textFaint, cursor: canUndo ? "pointer" : "default", fontSize: 13, fontWeight: 700, opacity: canUndo ? 1 : 0.35 }}>{"\u21A9"}</button>
              <button onClick={redo} disabled={!canRedo} title="Redo (Ctrl+Shift+Z)" style={{ padding: "6px 10px", borderRadius: 10, border: `1px solid ${t.border}`, background: t.surface, color: canRedo ? t.textMuted : t.textFaint, cursor: canRedo ? "pointer" : "default", fontSize: 13, fontWeight: 700, opacity: canRedo ? 1 : 0.35 }}>{"\u21AA"}</button>
            </div>
            <ThemeToggle mode={themeMode} onToggle={toggleTheme} />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: builderStep >= 1 ? "1fr 320px" : "1fr", gap: 32 }}>
          <div>
            {builderStep === 0 && <StepGoalSplit plan={builderPlan} onChange={setBuilderPlan} />}
            {builderStep === 1 && <StepSchedule plan={builderPlan} onChange={setBuilderPlan} />}
            {builderStep === 2 && <StepExercises plan={builderPlan} onChange={setBuilderPlan} />}
            {builderStep === 3 && <StepReview plan={builderPlan} />}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 32, paddingTop: 24, borderTop: `1px solid ${t.border}` }}>
              <button onClick={onCancel} style={{ padding: "12px 24px", borderRadius: 14, fontSize: 13, fontWeight: 600, cursor: "pointer", background: t.surface, border: `1px solid ${t.border}`, color: t.textMuted, boxShadow: t.shadow }}>{builderStep > 0 ? "\u2190 Back" : "\u2190 Cancel"}</button>
              {builderStep < 3 ? (
                <button onClick={() => canNext && setBuilderStep(builderStep + 1)} style={{ padding: "12px 28px", borderRadius: 14, fontSize: 13, fontWeight: 600, cursor: canNext ? "pointer" : "default", background: canNext ? t.ctaBg : t.surface2, border: "none", color: canNext ? t.ctaText : t.textDim }}>Next: {BUILDER_STEPS[builderStep + 1]?.label} &rarr;</button>
              ) : (
                <button onClick={onActivate} style={{ padding: "12px 28px", borderRadius: 14, fontSize: 13, fontWeight: 700, cursor: "pointer", background: t.colors.success, border: "none", color: "#FFFFFF" }}>{"\u2713"} Activate Plan</button>
              )}
            </div>
          </div>
          {builderStep >= 1 && <div style={{ position: "sticky", top: 20, alignSelf: "start", maxHeight: "calc(100vh - 60px)", overflowY: "auto" }}><BuilderSidebar plan={builderPlan} /></div>}
        </div>
      </div>
    </ErrorBoundary>
  );
}
