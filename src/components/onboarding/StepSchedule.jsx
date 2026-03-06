import { INJURY_OPTIONS, SESSION_DURATIONS } from "./constants.js";
import { cardClass, chipClass } from "./styles.js";

const LABEL = "text-xs font-semibold text-muted mb-3 block";

export default function StepSchedule({ profile, onChange, t }) {
  const toggleInjury = (id) => {
    const inj = profile.injuries.includes(id)
      ? profile.injuries.filter(i => i !== id)
      : [...profile.injuries, id];
    onChange({ ...profile, injuries: inj });
  };

  return (
    <div className="flex flex-col gap-7">
      <div>
        <label className={LABEL}>Training Days Per Week</label>
        <div className="flex gap-2">
          {[2, 3, 4, 5, 6, 7].map(n => {
            const sel = profile.trainingDaysPerWeek === n;
            return (
              <button key={n} onClick={() => onChange({ ...profile, trainingDaysPerWeek: n })}
                className={`w-12 h-12 rounded-sm border-[1.5px] cursor-pointer text-lg font-bold flex items-center justify-center ${
                  sel
                    ? "border-primary bg-primary/[0.08] text-primary"
                    : "border-edge bg-surface text-content"
                }`}
              >{n}</button>
            );
          })}
        </div>
      </div>

      <div>
        <label className={LABEL}>Typical Session Duration</label>
        <div className="flex gap-2 flex-wrap">
          {SESSION_DURATIONS.map(d => (
            <button key={d} onClick={() => onChange({ ...profile, sessionDuration: d })} className={chipClass(profile.sessionDuration === d)}>
              {d}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className={LABEL}>Any Injuries or Limitations? (optional)</label>
        <div className="grid grid-cols-2 gap-2">
          {INJURY_OPTIONS.map(opt => {
            const sel = profile.injuries.includes(opt.id);
            return (
              <button key={opt.id} onClick={() => toggleInjury(opt.id)} className={cardClass(sel)}>
                <span className={`text-body ${sel ? "font-semibold text-primary" : "font-normal text-content"}`}>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
