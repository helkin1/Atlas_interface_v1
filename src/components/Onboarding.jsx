import { useState } from "react";
import { useTheme } from "../context/theme.js";
import ThemeToggle from "./ThemeToggle.jsx";
import { DEFAULT_PROFILE } from "../utils/storage.js";

/* ── Constants ──────────────────────────────────────────────── */

const EQUIPMENT_OPTIONS = [
  { id: "full_gym", label: "Full Commercial Gym", icon: "\uD83C\uDFCB\uFE0F" },
  { id: "home_barbell", label: "Home Gym (Barbell + Rack + Bench)", icon: "\uD83C\uDFE0" },
  { id: "dumbbells_bench", label: "Dumbbells + Bench", icon: "\uD83D\uDCAA" },
  { id: "dumbbells_only", label: "Dumbbells Only", icon: "\uD83D\uDD25" },
  { id: "kettlebells", label: "Kettlebells", icon: "\u{1FA86}" },
  { id: "bands", label: "Resistance Bands", icon: "\u{1F4CF}" },
  { id: "bodyweight", label: "Bodyweight Only", icon: "\u{1F9D8}" },
  { id: "cables", label: "Cable Machine", icon: "\u{1F517}" },
  { id: "smith_machine", label: "Smith Machine", icon: "\u2699\uFE0F" },
];

const INJURY_OPTIONS = [
  { id: "lower_back", label: "Lower Back" },
  { id: "shoulder", label: "Shoulder / Rotator Cuff" },
  { id: "knee", label: "Knee" },
  { id: "wrist", label: "Wrist" },
  { id: "elbow", label: "Elbow" },
  { id: "hip", label: "Hip" },
  { id: "neck", label: "Neck" },
  { id: "ankle", label: "Ankle" },
];

const FOCUS_MUSCLES = [
  "Chest", "Back", "Shoulders", "Quads", "Hamstrings", "Glutes",
  "Biceps", "Triceps", "Calves", "Core", "Forearms", "Traps",
];

const GOAL_OPTIONS = [
  { id: "hypertrophy", label: "Hypertrophy", desc: "Build muscle size and definition", icon: "\uD83D\uDCAA" },
  { id: "strength", label: "Strength", desc: "Get stronger on compound lifts", icon: "\uD83C\uDFCB\uFE0F" },
  { id: "endurance", label: "Endurance", desc: "Improve work capacity and muscular endurance", icon: "\u26A1" },
  { id: "recomp", label: "Recomp", desc: "Lose fat and gain muscle simultaneously", icon: "\uD83D\uDD25" },
  { id: "general_fitness", label: "General Fitness", desc: "Overall health and functional strength", icon: "\u2764\uFE0F" },
];

const EXPERIENCE_OPTIONS = [
  { id: "beginner", label: "Beginner", desc: "New to lifting or less than 6 months consistent training" },
  { id: "intermediate", label: "Intermediate", desc: "6 months to 2 years of consistent, structured training" },
  { id: "advanced", label: "Advanced", desc: "2+ years of structured training, familiar with periodization" },
];

const SESSION_DURATIONS = ["30 min", "45 min", "60 min", "75 min", "90+ min"];

/* ── Shared Styles ──────────────────────────────────────────── */

function cardStyle(t, selected) {
  return {
    padding: "16px 20px",
    borderRadius: 12,
    border: `1.5px solid ${selected ? "#4C9EFF" : t.border}`,
    background: selected ? "rgba(76,158,255,0.06)" : t.surface,
    cursor: "pointer",
    transition: "all 0.15s",
    textAlign: "left",
  };
}

function chipStyle(t, selected) {
  return {
    padding: "8px 16px",
    borderRadius: 20,
    border: `1.5px solid ${selected ? "#4C9EFF" : t.border}`,
    background: selected ? "rgba(76,158,255,0.08)" : "transparent",
    cursor: "pointer",
    fontSize: 12,
    fontWeight: selected ? 600 : 400,
    color: selected ? "#4C9EFF" : t.textMuted,
    transition: "all 0.15s",
  };
}

function inputStyle(t) {
  return {
    width: "100%",
    padding: "10px 14px",
    borderRadius: 10,
    border: `1px solid ${t.borderLight}`,
    background: t.surface,
    color: t.text,
    fontSize: 14,
    fontFamily: "'Outfit', sans-serif",
    outline: "none",
  };
}

/* ── Step Components ────────────────────────────────────────── */

function StepAboutYou({ profile, onChange, t }) {
  const isMetric = profile.unitPreference === "metric";

  // Height: in imperial, split into ft + in
  const totalInches = profile.heightCm ? profile.heightCm / 2.54 : null;
  const heightFt = totalInches !== null ? Math.floor(totalInches / 12) : "";
  const heightIn = totalInches !== null ? Math.round(totalInches % 12) : "";

  const setHeightImperial = (ft, inches) => {
    const f = parseInt(ft) || 0;
    const i = parseInt(inches) || 0;
    if (f === 0 && i === 0) { onChange({ ...profile, heightCm: null }); return; }
    onChange({ ...profile, heightCm: Math.round((f * 12 + i) * 2.54) });
  };

  // Weight: store lbs directly as a display value to avoid rounding artifacts
  const displayWeight = isMetric
    ? (profile.weightKg || "")
    : profile.weightKg ? Math.round(profile.weightKg * 2.205) : "";

  const setWeight = (val) => {
    const num = parseFloat(val);
    if (isNaN(num) || val === "") { onChange({ ...profile, weightKg: null }); return; }
    // Store with enough precision to avoid round-trip issues
    onChange({ ...profile, weightKg: isMetric ? num : parseFloat((num / 2.205).toFixed(2)) });
  };

  const selectStyle = {
    ...inputStyle(t),
    appearance: "none",
    WebkitAppearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M2 4l4 4 4-4'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 12px center",
    paddingRight: 32,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <label style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, marginBottom: 8, display: "block" }}>What should we call you?</label>
        <input
          value={profile.displayName}
          onChange={e => onChange({ ...profile, displayName: e.target.value })}
          placeholder="Your name"
          style={inputStyle(t)}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, marginBottom: 8, display: "block" }}>Age</label>
          <select
            value={profile.age || ""}
            onChange={e => onChange({ ...profile, age: e.target.value ? parseInt(e.target.value) : null })}
            style={selectStyle}
          >
            <option value="">Select age</option>
            {Array.from({ length: 101 }, (_, i) => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, marginBottom: 8, display: "block" }}>Sex</label>
          <div style={{ display: "flex", gap: 8 }}>
            {["male", "female", "prefer_not_to_say"].map(s => (
              <button key={s} onClick={() => onChange({ ...profile, sex: s })} style={chipStyle(t, profile.sex === s)}>
                {s === "prefer_not_to_say" ? "Prefer not to say" : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Units toggle */}
      <div>
        <label style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, marginBottom: 8, display: "block" }}>Preferred Units</label>
        <div style={{ display: "flex", gap: 4, background: t.surface2, borderRadius: 8, padding: 2, width: "fit-content" }}>
          {["imperial", "metric"].map(u => (
            <button key={u} onClick={() => onChange({ ...profile, unitPreference: u })} style={{
              padding: "6px 18px", borderRadius: 6, border: "none", cursor: "pointer",
              background: profile.unitPreference === u ? "rgba(76,158,255,0.12)" : "transparent",
              color: profile.unitPreference === u ? "#4C9EFF" : t.textDim,
              fontSize: 12, fontWeight: profile.unitPreference === u ? 600 : 400,
            }}>{u === "imperial" ? "Imperial (lbs/ft)" : "Metric (kg/cm)"}</button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, marginBottom: 8, display: "block" }}>
            Height {isMetric ? "(cm)" : ""}
          </label>
          {isMetric ? (
            <input
              type="number" min="100" max="250"
              value={profile.heightCm || ""}
              onChange={e => {
                const num = parseFloat(e.target.value);
                onChange({ ...profile, heightCm: isNaN(num) ? null : num });
              }}
              placeholder="175"
              style={inputStyle(t)}
            />
          ) : (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                type="number" min="0" max="8"
                value={heightFt}
                onChange={e => setHeightImperial(e.target.value, heightIn)}
                placeholder="5"
                style={{ ...inputStyle(t), width: "50%" }}
              />
              <span style={{ fontSize: 12, color: t.textMuted, flexShrink: 0 }}>ft</span>
              <input
                type="number" min="0" max="11"
                value={heightIn}
                onChange={e => setHeightImperial(heightFt, e.target.value)}
                placeholder="10"
                style={{ ...inputStyle(t), width: "50%" }}
              />
              <span style={{ fontSize: 12, color: t.textMuted, flexShrink: 0 }}>in</span>
            </div>
          )}
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, marginBottom: 8, display: "block" }}>
            Weight ({isMetric ? "kg" : "lbs"})
          </label>
          <input
            type="number" min="30" max="700"
            value={displayWeight}
            onChange={e => setWeight(e.target.value)}
            placeholder={isMetric ? "75" : "165"}
            style={inputStyle(t)}
          />
        </div>
      </div>
    </div>
  );
}

function StepFitnessBackground({ profile, onChange, t }) {
  const toggleEquipment = (id) => {
    const eq = profile.equipment.includes(id)
      ? profile.equipment.filter(e => e !== id)
      : [...profile.equipment, id];
    onChange({ ...profile, equipment: eq });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Experience Level */}
      <div>
        <label style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, marginBottom: 12, display: "block" }}>Experience Level</label>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {EXPERIENCE_OPTIONS.map(opt => (
            <button key={opt.id} onClick={() => onChange({ ...profile, experienceLevel: opt.id })} style={cardStyle(t, profile.experienceLevel === opt.id)}>
              <div style={{ fontSize: 14, fontWeight: 700, color: profile.experienceLevel === opt.id ? "#4C9EFF" : t.text, marginBottom: 4 }}>{opt.label}</div>
              <div style={{ fontSize: 12, color: t.textMuted, lineHeight: 1.4 }}>{opt.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Equipment */}
      <div>
        <label style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, marginBottom: 12, display: "block" }}>Available Equipment (select all that apply)</label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {EQUIPMENT_OPTIONS.map(opt => (
            <button key={opt.id} onClick={() => toggleEquipment(opt.id)} style={cardStyle(t, profile.equipment.includes(opt.id))}>
              <span style={{ marginRight: 8 }}>{opt.icon}</span>
              <span style={{ fontSize: 13, fontWeight: profile.equipment.includes(opt.id) ? 600 : 400, color: profile.equipment.includes(opt.id) ? "#4C9EFF" : t.text }}>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepGoals({ profile, onChange, t }) {
  const toggleSecondary = (id) => {
    const sg = profile.secondaryGoals.includes(id)
      ? profile.secondaryGoals.filter(g => g !== id)
      : [...profile.secondaryGoals, id];
    onChange({ ...profile, secondaryGoals: sg });
  };

  const toggleMuscle = (m) => {
    const fm = profile.focusMuscles.includes(m)
      ? profile.focusMuscles.filter(x => x !== m)
      : [...profile.focusMuscles, m];
    onChange({ ...profile, focusMuscles: fm });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Primary Goal */}
      <div>
        <label style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, marginBottom: 12, display: "block" }}>Primary Goal</label>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {GOAL_OPTIONS.map(opt => (
            <button key={opt.id} onClick={() => {
              const sg = profile.secondaryGoals.filter(g => g !== opt.id);
              onChange({ ...profile, primaryGoal: opt.id, secondaryGoals: sg });
            }} style={cardStyle(t, profile.primaryGoal === opt.id)}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 20 }}>{opt.icon}</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: profile.primaryGoal === opt.id ? "#4C9EFF" : t.text }}>{opt.label}</div>
                  <div style={{ fontSize: 12, color: t.textMuted }}>{opt.desc}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Secondary Goals */}
      {profile.primaryGoal && (
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, marginBottom: 12, display: "block" }}>Secondary Goals (optional)</label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {GOAL_OPTIONS.filter(g => g.id !== profile.primaryGoal).map(opt => (
              <button key={opt.id} onClick={() => toggleSecondary(opt.id)} style={chipStyle(t, profile.secondaryGoals.includes(opt.id))}>
                {opt.icon} {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Focus Muscles */}
      <div>
        <label style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, marginBottom: 12, display: "block" }}>Muscle Groups to Prioritize (optional)</label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {FOCUS_MUSCLES.map(m => (
            <button key={m} onClick={() => toggleMuscle(m)} style={chipStyle(t, profile.focusMuscles.includes(m))}>
              {m}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepSchedule({ profile, onChange, t }) {
  const toggleInjury = (id) => {
    const inj = profile.injuries.includes(id)
      ? profile.injuries.filter(i => i !== id)
      : [...profile.injuries, id];
    onChange({ ...profile, injuries: inj });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Training Days */}
      <div>
        <label style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, marginBottom: 12, display: "block" }}>Training Days Per Week</label>
        <div style={{ display: "flex", gap: 8 }}>
          {[2, 3, 4, 5, 6, 7].map(n => (
            <button key={n} onClick={() => onChange({ ...profile, trainingDaysPerWeek: n })} style={{
              width: 48, height: 48, borderRadius: 12,
              border: `1.5px solid ${profile.trainingDaysPerWeek === n ? "#4C9EFF" : t.border}`,
              background: profile.trainingDaysPerWeek === n ? "rgba(76,158,255,0.08)" : t.surface,
              color: profile.trainingDaysPerWeek === n ? "#4C9EFF" : t.text,
              fontSize: 18, fontWeight: 700, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>{n}</button>
          ))}
        </div>
      </div>

      {/* Session Duration */}
      <div>
        <label style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, marginBottom: 12, display: "block" }}>Typical Session Duration</label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {SESSION_DURATIONS.map(d => (
            <button key={d} onClick={() => onChange({ ...profile, sessionDuration: d })} style={chipStyle(t, profile.sessionDuration === d)}>
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Injuries */}
      <div>
        <label style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, marginBottom: 12, display: "block" }}>Any Injuries or Limitations? (optional)</label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {INJURY_OPTIONS.map(opt => (
            <button key={opt.id} onClick={() => toggleInjury(opt.id)} style={cardStyle(t, profile.injuries.includes(opt.id))}>
              <span style={{ fontSize: 13, fontWeight: profile.injuries.includes(opt.id) ? 600 : 400, color: profile.injuries.includes(opt.id) ? "#4C9EFF" : t.text }}>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepReview({ profile, t }) {
  // Recommend a split based on profile
  const rec = getSplitRecommendation(profile);

  const sectionStyle = { background: t.surface, border: `1px solid ${t.border}`, borderRadius: 14, padding: 20 };
  const labelStyle = { fontSize: 10, textTransform: "uppercase", letterSpacing: 2, color: t.textFaint, marginBottom: 8 };
  const valStyle = { fontSize: 14, fontWeight: 600, color: t.text };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Recommended Split */}
      <div style={{ ...sectionStyle, border: "1.5px solid rgba(76,158,255,0.3)", background: "rgba(76,158,255,0.04)" }}>
        <div style={{ ...labelStyle, color: "#4C9EFF" }}>Recommended Split</div>
        <div style={{ fontSize: 18, fontWeight: 800, color: "#4C9EFF", marginBottom: 4 }}>{rec.name}</div>
        <div style={{ fontSize: 12, color: t.textMuted, lineHeight: 1.5 }}>{rec.reason}</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={sectionStyle}>
          <div style={labelStyle}>About You</div>
          <div style={valStyle}>{profile.displayName || "—"}</div>
          <div style={{ fontSize: 12, color: t.textMuted, marginTop: 4 }}>
            {[profile.age && `${profile.age} years old`, profile.sex && profile.sex !== "prefer_not_to_say" && profile.sex].filter(Boolean).join(" \u00B7 ") || "—"}
          </div>
        </div>
        <div style={sectionStyle}>
          <div style={labelStyle}>Experience</div>
          <div style={valStyle}>{profile.experienceLevel ? profile.experienceLevel.charAt(0).toUpperCase() + profile.experienceLevel.slice(1) : "—"}</div>
          <div style={{ fontSize: 12, color: t.textMuted, marginTop: 4 }}>
            {profile.trainingDaysPerWeek ? `${profile.trainingDaysPerWeek} days/week` : "—"}{profile.sessionDuration ? ` \u00B7 ${profile.sessionDuration}` : ""}
          </div>
        </div>
      </div>

      <div style={sectionStyle}>
        <div style={labelStyle}>Primary Goal</div>
        <div style={valStyle}>{GOAL_OPTIONS.find(g => g.id === profile.primaryGoal)?.label || "—"}</div>
        {profile.secondaryGoals.length > 0 && (
          <div style={{ fontSize: 12, color: t.textMuted, marginTop: 4 }}>Also: {profile.secondaryGoals.map(g => GOAL_OPTIONS.find(o => o.id === g)?.label).filter(Boolean).join(", ")}</div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={sectionStyle}>
          <div style={labelStyle}>Equipment</div>
          <div style={{ fontSize: 12, color: t.text, lineHeight: 1.6 }}>
            {profile.equipment.length > 0 ? profile.equipment.map(e => EQUIPMENT_OPTIONS.find(o => o.id === e)?.label).filter(Boolean).join(", ") : "None selected"}
          </div>
        </div>
        <div style={sectionStyle}>
          <div style={labelStyle}>Focus Areas</div>
          <div style={{ fontSize: 12, color: t.text, lineHeight: 1.6 }}>
            {profile.focusMuscles.length > 0 ? profile.focusMuscles.join(", ") : "No specific focus"}
          </div>
        </div>
      </div>

      {profile.injuries.length > 0 && (
        <div style={sectionStyle}>
          <div style={labelStyle}>Injuries / Limitations</div>
          <div style={{ fontSize: 12, color: t.text }}>
            {profile.injuries.map(i => INJURY_OPTIONS.find(o => o.id === i)?.label).filter(Boolean).join(", ")}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Split Recommendation Logic ──────────────────────────────── */

function getSplitRecommendation(profile) {
  const days = profile.trainingDaysPerWeek || 3;
  const exp = profile.experienceLevel || "beginner";
  const goal = profile.primaryGoal || "general_fitness";

  if (exp === "beginner") {
    if (days <= 3) return { splitKey: "full_body", name: "Full Body (3 days)", reason: "Perfect for beginners \u2014 high frequency per muscle group with enough recovery time to learn the lifts and build a base." };
    if (days === 4) return { splitKey: "upper_lower", name: "Upper / Lower (4 days)", reason: "Great progression from full body \u2014 lets you add more volume per session while maintaining solid frequency." };
    return { splitKey: "ppl", name: "Push / Pull / Legs (5-6 days)", reason: "Ambitious for a beginner, but doable. Lets you focus on each muscle group with dedicated sessions." };
  }

  if (exp === "intermediate") {
    if (days <= 3) return { splitKey: "full_body", name: "Full Body (3 days)", reason: "Maximizes frequency with limited days. Great for intermediates who want efficient sessions." };
    if (days === 4) return { splitKey: "upper_lower", name: "Upper / Lower (4 days)", reason: "The sweet spot for intermediates \u2014 enough volume and frequency to drive progress on all lifts." };
    if (days === 5) return { splitKey: "ppl", name: "Push / Pull / Legs (5 days)", reason: "Popular intermediate split. Hits everything twice with one extra focus day for weak points." };
    return { splitKey: "ppl", name: "Push / Pull / Legs (6 days)", reason: "Classic PPL 2x/week. High volume, high frequency \u2014 ideal for intermediates chasing hypertrophy." };
  }

  // Advanced
  if (days <= 3) return { splitKey: "full_body", name: "Full Body (3 days)", reason: "Surprisingly effective for advanced lifters \u2014 high frequency, strategic exercise selection per session." };
  if (days === 4) return { splitKey: "upper_lower", name: "Upper / Lower (4 days)", reason: "Proven split for strength and size. Enough volume headroom for advanced progression schemes." };
  if (goal === "strength") return { splitKey: "upper_lower", name: "Upper / Lower (5-6 days)", reason: "Prioritizes compound frequency for strength. Extra days allow accessory specialization." };
  return { splitKey: "ppl", name: "Push / Pull / Legs (6 days)", reason: "Maximum volume and specialization. Ideal for advanced lifters pushing toward their genetic ceiling." };
}

/* ── Main Onboarding Component ──────────────────────────────── */

const STEPS = [
  { title: "Let's Get to Know You", subtitle: "This helps us personalize your experience" },
  { title: "Your Fitness Background", subtitle: "Tell us about your training experience" },
  { title: "Your Goals", subtitle: "What are you working toward?" },
  { title: "Your Schedule", subtitle: "How do you like to train?" },
  { title: "Review & Go", subtitle: "Here's what we've put together" },
];

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
      <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 5, color: t.textFaint, fontFamily: "mono", marginBottom: 8 }}>Atlas</div>

      {/* Progress bar */}
      <div style={{ display: "flex", gap: 6, marginBottom: 32, marginTop: 16 }}>
        {STEPS.map((_, i) => (
          <div key={i} style={{
            width: i === step ? 32 : 12, height: 4, borderRadius: 2,
            background: i <= step ? "#4C9EFF" : t.border,
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
            background: canNext() ? "rgba(76,158,255,0.12)" : t.surface2,
            border: `1px solid ${canNext() ? "#4C9EFF" : t.border}`,
            color: canNext() ? "#4C9EFF" : t.textDim,
          }}>Next {"\u2192"}</button>
        ) : (
          <button onClick={handleComplete} style={{
            padding: "12px 32px", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer",
            background: "rgba(61,220,132,0.12)", border: "1px solid rgba(61,220,132,0.4)", color: "#3DDC84",
          }}>{"\u2713"} Build My Plan</button>
        )}
      </div>
    </div>
  );
}

export { EQUIPMENT_OPTIONS, INJURY_OPTIONS, FOCUS_MUSCLES, GOAL_OPTIONS, EXPERIENCE_OPTIONS, SESSION_DURATIONS, getSplitRecommendation };
