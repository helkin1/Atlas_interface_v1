import { useState } from "react";
import { useTheme } from "../context/theme.js";
import ThemeToggle from "./ThemeToggle.jsx";
import { DEFAULT_PROFILE } from "../utils/storage.js";

import { STEPS } from "./onboarding/constants.js";
import { getSplitRecommendation } from "./onboarding/getSplitRecommendation.js";
import StepAboutYou from "./onboarding/StepAboutYou.jsx";
import StepFitnessBackground from "./onboarding/StepFitnessBackground.jsx";
import StepGoals from "./onboarding/StepGoals.jsx";
import StepSchedule from "./onboarding/StepSchedule.jsx";
import StepReview from "./onboarding/StepReview.jsx";

// Re-export for backward compatibility with other files that import from Onboarding
export { EQUIPMENT_OPTIONS, INJURY_OPTIONS, FOCUS_MUSCLES, GOAL_OPTIONS, EXPERIENCE_OPTIONS, SESSION_DURATIONS } from "./onboarding/constants.js";
export { getSplitRecommendation } from "./onboarding/getSplitRecommendation.js";

export default function Onboarding({ themeMode, onToggleTheme, onComplete }) {
  const t = useTheme();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState({ ...DEFAULT_PROFILE });

  const canNext = () => {
    if (step === 0) return profile.displayName.trim().length > 0;
    if (step === 1) return profile.experienceLevel !== null && profile.equipment.length > 0;
    if (step === 2) return profile.primaryGoal !== null;
    if (step === 3) return profile.trainingDaysPerWeek !== null && profile.sessionDuration !== null;
    return true;
  };

  const handleComplete = () => {
    const finalProfile = { ...profile, onboardingCompleted: true };
    const rec = getSplitRecommendation(finalProfile);
    onComplete(finalProfile, rec.splitKey);
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-6 py-10 relative">
      {/* Theme toggle */}
      <div className="absolute top-7 right-7">
        <ThemeToggle mode={themeMode} onToggle={onToggleTheme} />
      </div>

      {/* Logo */}
      <div className="text-xs tracking-[3px] text-dim mb-2">Atlas</div>

      {/* Progress bar */}
      <div className="flex gap-1.5 mb-8 mt-4">
        {STEPS.map((_, i) => (
          <div key={i} className="h-1 rounded-[2px] transition-all duration-300"
            style={{
              width: i === step ? 32 : 12,
              background: i <= step ? "var(--atlas-primary)" : "var(--atlas-border)",
            }} />
        ))}
      </div>

      {/* Step header */}
      <div className="text-center mb-8 max-w-[480px]">
        <h2 className="text-2xl font-[800] text-content tracking-tight mb-2">{STEPS[step].title}</h2>
        <p className="text-sm text-muted">{STEPS[step].subtitle}</p>
      </div>

      {/* Step content */}
      <div className="w-full max-w-[560px] flex-1">
        {step === 0 && <StepAboutYou profile={profile} onChange={setProfile} t={t} />}
        {step === 1 && <StepFitnessBackground profile={profile} onChange={setProfile} t={t} />}
        {step === 2 && <StepGoals profile={profile} onChange={setProfile} t={t} />}
        {step === 3 && <StepSchedule profile={profile} onChange={setProfile} t={t} />}
        {step === 4 && <StepReview profile={profile} t={t} />}
      </div>

      {/* Navigation */}
      <div className="flex justify-between w-full max-w-[560px] mt-8 pt-5 border-t border-edge">
        <button onClick={() => step > 0 && setStep(step - 1)}
          className={`px-7 py-3 rounded-[10px] text-[13px] font-semibold bg-transparent border ${
            step > 0 ? "border-edge-light text-muted cursor-pointer" : "border-transparent text-transparent cursor-default"
          }`}
        >{"\u2190"} Back</button>

        {step < 4 ? (
          <button onClick={() => canNext() && setStep(step + 1)}
            className={`px-8 py-3 rounded-[10px] text-[13px] font-semibold ${
              canNext()
                ? "bg-primary/[0.12] border border-primary text-primary cursor-pointer"
                : "bg-surface2 border border-edge text-dim cursor-default"
            }`}
          >Next {"\u2192"}</button>
        ) : (
          <button onClick={handleComplete}
            className="px-8 py-3 rounded-[10px] text-[13px] font-bold cursor-pointer bg-success/[0.12] border border-success/40 text-success"
          >{"\u2713"} Build My Plan</button>
        )}
      </div>
    </div>
  );
}
