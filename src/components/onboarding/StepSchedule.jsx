import { INJURY_OPTIONS, SESSION_DURATIONS } from "./constants.js";
import { cardStyle, chipStyle } from "./styles.js";

export default function StepSchedule({ profile, onChange, t }) {
  const toggleInjury = (id) => {
    const inj = profile.injuries.includes(id)
      ? profile.injuries.filter(i => i !== id)
      : [...profile.injuries, id];
    onChange({ ...profile, injuries: inj });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <div>
        <label style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, marginBottom: 12, display: "block" }}>Training Days Per Week</label>
        <div style={{ display: "flex", gap: 8 }}>
          {[2, 3, 4, 5, 6, 7].map(n => (
            <button key={n} onClick={() => onChange({ ...profile, trainingDaysPerWeek: n })} style={{
              width: 48, height: 48, borderRadius: 12,
              border: `1.5px solid ${profile.trainingDaysPerWeek === n ? t.colors.primary : t.border}`,
              background: profile.trainingDaysPerWeek === n ? t.alpha.primary._8 : t.surface,
              color: profile.trainingDaysPerWeek === n ? t.colors.primary : t.text,
              fontSize: 18, fontWeight: 700, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>{n}</button>
          ))}
        </div>
      </div>

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

      <div>
        <label style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, marginBottom: 12, display: "block" }}>Any Injuries or Limitations? (optional)</label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {INJURY_OPTIONS.map(opt => (
            <button key={opt.id} onClick={() => toggleInjury(opt.id)} style={cardStyle(t, profile.injuries.includes(opt.id))}>
              <span style={{ fontSize: 13, fontWeight: profile.injuries.includes(opt.id) ? 600 : 400, color: profile.injuries.includes(opt.id) ? t.colors.primary : t.text }}>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
