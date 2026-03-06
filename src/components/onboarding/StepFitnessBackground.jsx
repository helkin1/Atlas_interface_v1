import { EXPERIENCE_OPTIONS, EQUIPMENT_OPTIONS } from "./constants.js";
import { cardClass } from "./styles.js";

const LABEL = "text-xs font-semibold text-muted mb-3 block";

export default function StepFitnessBackground({ profile, onChange, t }) {
  const toggleEquipment = (id) => {
    const eq = profile.equipment.includes(id)
      ? profile.equipment.filter(e => e !== id)
      : [...profile.equipment, id];
    onChange({ ...profile, equipment: eq });
  };

  return (
    <div className="flex flex-col gap-7">
      <div>
        <label className={LABEL}>Experience Level</label>
        <div className="flex flex-col gap-2.5">
          {EXPERIENCE_OPTIONS.map(opt => {
            const sel = profile.experienceLevel === opt.id;
            return (
              <button key={opt.id} onClick={() => onChange({ ...profile, experienceLevel: opt.id })} className={cardClass(sel)}>
                <div className={`text-md font-bold mb-1 ${sel ? "text-primary" : "text-content"}`}>{opt.label}</div>
                <div className="text-xs text-muted leading-snug">{opt.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className={LABEL}>Available Equipment (select all that apply)</label>
        <div className="grid grid-cols-2 gap-2">
          {EQUIPMENT_OPTIONS.map(opt => {
            const sel = profile.equipment.includes(opt.id);
            return (
              <button key={opt.id} onClick={() => toggleEquipment(opt.id)} className={cardClass(sel)}>
                <span className="mr-2">{opt.icon}</span>
                <span className={`text-body ${sel ? "font-semibold text-primary" : "font-normal text-content"}`}>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
