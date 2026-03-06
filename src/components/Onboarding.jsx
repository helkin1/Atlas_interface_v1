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
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 24px", position: "relative" }}>
      {/* Theme toggle */}
      <div style={{ position: "absolute", top: 28, right: 28 }}>
        <ThemeToggle mode={themeMode} onToggle={onToggleTheme} />
      </div>

      {/* Logo */}
      <div style={{ fontSize: 12, letterSpacing: 3, color: t.textDim, marginBottom: 8 }}>Atlas</div>

      {/* Progress bar */}
      <div style={{ display: "flex", gap: 6, marginBottom: 32, marginTop: 16 }}>
        {STEPS.map((_, i) => (
          <div key={i} style={{
            width: i === step ? 32 : 12, height: 4, borderRadius: 2,
            background: i <= step ? t.colors.primary : t.border,
            transition: "all 0.3s",
          }} />
        ))}
      </div>

      {/* Step header */}
      <div style={{ textAlign: "center", marginBottom: 32, maxWidth: 480 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: t.text, letterSpacing: -0.5, marginBottom: 8 }}>{STEPS[step].title}</h2>
        <p style={{ fontSize: 14, color: t.textMuted }}>{STEPS[step].subtitle}</p>
      </div>

      {/* Step content */}
      <div style={{ width: "100%", maxWidth: 560, flex: 1 }}>
        {step === 0 && <StepAboutYou profile={profile} onChange={setProfile} t={t} />}
        {step === 1 && <StepFitnessBackground profile={profile} onChange={setProfile} t={t} />}
        {step === 2 && <StepGoals profile={profile} onChange={setProfile} t={t} />}
        {step === 3 && <StepSchedule profile={profile} onChange={setProfile} t={t} />}
        {step === 4 && <StepReview profile={profile} t={t} />}
      </div>

      {/* Navigation */}
      <div style={{
        display: "flex", justifyContent: "space-between", width: "100%", maxWidth: 560,
        marginTop: 32, paddingTop: 20, borderTop: `1px solid ${t.border}`,
      }}>
        <button onClick={() => step > 0 && setStep(step - 1)} style={{
          padding: "12px 28px", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: step > 0 ? "pointer" : "default",
          background: "transparent", border: `1px solid ${step > 0 ? t.borderLight : "transparent"}`,
          color: step > 0 ? t.textMuted : "transparent",
        }}>{"\u2190"} Back</button>

        {step < 4 ? (
          <button onClick={() => canNext() && setStep(step + 1)} style={{
            padding: "12px 32px", borderRadius: 10, fontSize: 13, fontWeight: 600,
            cursor: canNext() ? "pointer" : "default",
            background: canNext() ? t.alpha.primary._12 : t.surface2,
            border: `1px solid ${canNext() ? t.colors.primary : t.border}`,
            color: canNext() ? t.colors.primary : t.textDim,
          }}>Next {"\u2192"}</button>
        ) : (
          <button onClick={handleComplete} style={{
            padding: "12px 32px", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer",
            background: t.alpha.success._12, border: `1px solid ${t.alpha.success._40}`, color: t.colors.success,
          }}>{"\u2713"} Build My Plan</button>
        )}
      </div>
    </div>
  );
}
