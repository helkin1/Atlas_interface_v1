import { EXPERIENCE_OPTIONS, EQUIPMENT_OPTIONS, INJURY_OPTIONS } from "./constants.js";
import { cardStyle } from "./styles.js";

const EXP_NOTES = {
  beginner: "Your volume targets will start conservative to maximize early gains",
  intermediate: "Standard volume ranges apply — you've built a solid base",
  advanced: "Higher volume ranges unlocked to match your recovery capacity",
};

export default function StepFitnessBackground({ profile, onChange, t }) {
  const toggleEquipment = (id) => {
    const eq = profile.equipment.includes(id)
      ? profile.equipment.filter(e => e !== id)
      : [...profile.equipment, id];
    onChange({ ...profile, equipment: eq });
  };

  const toggleInjury = (id) => {
    const inj = profile.injuries.includes(id)
      ? profile.injuries.filter(e => e !== id)
      : [...profile.injuries, id];
    onChange({ ...profile, injuries: inj });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <div>
        <label style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, marginBottom: 12, display: "block" }}>Experience Level</label>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {EXPERIENCE_OPTIONS.map(opt => (
            <button key={opt.id} onClick={() => onChange({ ...profile, experienceLevel: opt.id })} style={cardStyle(t, profile.experienceLevel === opt.id)}>
              <div style={{ fontSize: 14, fontWeight: 700, color: profile.experienceLevel === opt.id ? t.colors.primary : t.text, marginBottom: 4 }}>{opt.label}</div>
              <div style={{ fontSize: 12, color: t.textMuted, lineHeight: 1.4 }}>{opt.desc}</div>
            </button>
          ))}
        </div>
        {profile.experienceLevel && (
          <div style={{ fontSize: 11, color: t.textDim, fontStyle: "italic", marginTop: 8, padding: "0 4px" }}>
            {EXP_NOTES[profile.experienceLevel]}
          </div>
        )}
      </div>

      <div>
        <label style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, marginBottom: 12, display: "block" }}>Available Equipment (select all that apply)</label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {EQUIPMENT_OPTIONS.map(opt => (
            <button key={opt.id} onClick={() => toggleEquipment(opt.id)} style={cardStyle(t, profile.equipment.includes(opt.id))}>
              <span style={{ marginRight: 8 }}>{opt.icon}</span>
              <span style={{ fontSize: 13, fontWeight: profile.equipment.includes(opt.id) ? 600 : 400, color: profile.equipment.includes(opt.id) ? t.colors.primary : t.text }}>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, marginBottom: 6, display: "block" }}>Injuries / Limitations (optional)</label>
        <div style={{ fontSize: 11, color: t.textDim, marginBottom: 12, lineHeight: 1.4 }}>
          Injured areas will be protected — Atlas will adjust your training goals so you're not penalized for avoiding these movements.
        </div>
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
