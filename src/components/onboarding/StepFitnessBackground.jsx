import { EXPERIENCE_OPTIONS, EQUIPMENT_OPTIONS } from "./constants.js";
import { cardStyle } from "./styles.js";

export default function StepFitnessBackground({ profile, onChange, t }) {
  const toggleEquipment = (id) => {
    const eq = profile.equipment.includes(id)
      ? profile.equipment.filter(e => e !== id)
      : [...profile.equipment, id];
    onChange({ ...profile, equipment: eq });
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
    </div>
  );
}
