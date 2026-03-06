import { GOAL_OPTIONS, FOCUS_MUSCLES } from "./constants.js";
import { cardStyle, chipStyle } from "./styles.js";

export default function StepGoals({ profile, onChange, t }) {
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
                  <div style={{ fontSize: 14, fontWeight: 700, color: profile.primaryGoal === opt.id ? t.colors.primary : t.text }}>{opt.label}</div>
                  <div style={{ fontSize: 12, color: t.textMuted }}>{opt.desc}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

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
