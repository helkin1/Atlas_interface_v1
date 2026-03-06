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
      <div className="max-w-[1400px] mx-auto px-9 py-9 text-content transition-colors duration-300">
        <div className="flex justify-between items-start mb-9">
          <div>
            <div className="text-xs text-dim mb-1.5">Plan Builder</div>
            <h1 className="text-2xl font-[800] tracking-tight text-content">{builderPlan.splitName || "Build Your Plan"}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="inline-flex gap-1 bg-surface2 rounded-md p-1 items-center">
              {BUILDER_STEPS.map((s, i) => (
                <div key={s.key} className="flex items-center gap-1">
                  <button onClick={() => i <= builderStep && setBuilderStep(i)}
                    className={`text-xs px-3.5 py-[7px] rounded-sm border-none transition-all duration-200
                      ${i <= builderStep ? "cursor-pointer" : "cursor-default"}
                      ${i === builderStep ? "bg-surface text-content font-semibold shadow-card" : "bg-transparent font-normal"}
                      ${i < builderStep ? "text-success" : i > builderStep ? "text-dim" : ""}`}
                  >{i < builderStep ? "\u2713 " : ""}{s.label}</button>
                  {i < BUILDER_STEPS.length - 1 && <span className="text-faint text-xs">&rarr;</span>}
                </div>
              ))}
            </div>
            <div className="flex gap-1">
              <button onClick={undo} disabled={!canUndo} title="Undo (Ctrl+Z)"
                className={`px-2.5 py-1.5 rounded-[10px] border border-edge bg-surface text-body font-bold ${canUndo ? "text-muted cursor-pointer opacity-100" : "text-faint cursor-default opacity-35"}`}
              >{"\u21A9"}</button>
              <button onClick={redo} disabled={!canRedo} title="Redo (Ctrl+Shift+Z)"
                className={`px-2.5 py-1.5 rounded-[10px] border border-edge bg-surface text-body font-bold ${canRedo ? "text-muted cursor-pointer opacity-100" : "text-faint cursor-default opacity-35"}`}
              >{"\u21AA"}</button>
            </div>
            <ThemeToggle mode={themeMode} onToggle={toggleTheme} />
          </div>
        </div>
        <div className={`grid ${builderStep >= 1 ? "grid-cols-[1fr_320px]" : "grid-cols-1"} gap-8`}>
          <div>
            {builderStep === 0 && <StepGoalSplit plan={builderPlan} onChange={setBuilderPlan} />}
            {builderStep === 1 && <StepSchedule plan={builderPlan} onChange={setBuilderPlan} />}
            {builderStep === 2 && <StepExercises plan={builderPlan} onChange={setBuilderPlan} />}
            {builderStep === 3 && <StepReview plan={builderPlan} />}
            <div className="flex justify-between mt-8 pt-6 border-t border-edge">
              <button onClick={onCancel} className="px-6 py-3 rounded-[14px] text-body font-semibold cursor-pointer bg-surface border border-edge text-muted shadow-card">
                {builderStep > 0 ? "\u2190 Back" : "\u2190 Cancel"}
              </button>
              {builderStep < 3 ? (
                <button onClick={() => canNext && setBuilderStep(builderStep + 1)}
                  className={`px-7 py-3 rounded-[14px] text-body font-semibold border-none ${canNext ? "bg-cta text-cta-text cursor-pointer" : "bg-surface2 text-dim cursor-default"}`}
                >Next: {BUILDER_STEPS[builderStep + 1]?.label} &rarr;</button>
              ) : (
                <button onClick={onActivate} className="px-7 py-3 rounded-[14px] text-body font-bold cursor-pointer bg-success border-none text-white">
                  {"\u2713"} Activate Plan
                </button>
              )}
            </div>
          </div>
          {builderStep >= 1 && <div className="sticky top-5 self-start max-h-[calc(100vh-60px)] overflow-y-auto"><BuilderSidebar plan={builderPlan} /></div>}
        </div>
      </div>
    </ErrorBoundary>
  );
}
