import { GOAL_OPTIONS, FOCUS_MUSCLES } from "./constants.js";
import { cardClass, chipClass } from "./styles.js";

const LABEL = "text-xs font-semibold text-muted mb-3 block";

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
    <div className="flex flex-col gap-7">
      <div>
        <label className={LABEL}>Primary Goal</label>
        <div className="flex flex-col gap-2.5">
          {GOAL_OPTIONS.map(opt => {
            const sel = profile.primaryGoal === opt.id;
            return (
              <button key={opt.id} onClick={() => {
                const sg = profile.secondaryGoals.filter(g => g !== opt.id);
                onChange({ ...profile, primaryGoal: opt.id, secondaryGoals: sg });
              }} className={cardClass(sel)}>
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{opt.icon}</span>
                  <div>
                    <div className={`text-md font-bold ${sel ? "text-primary" : "text-content"}`}>{opt.label}</div>
                    <div className="text-xs text-muted">{opt.desc}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {profile.primaryGoal && (
        <div>
          <label className={LABEL}>Secondary Goals (optional)</label>
          <div className="flex gap-2 flex-wrap">
            {GOAL_OPTIONS.filter(g => g.id !== profile.primaryGoal).map(opt => (
              <button key={opt.id} onClick={() => toggleSecondary(opt.id)} className={chipClass(profile.secondaryGoals.includes(opt.id))}>
                {opt.icon} {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className={LABEL}>Muscle Groups to Prioritize (optional)</label>
        <div className="flex gap-2 flex-wrap">
          {FOCUS_MUSCLES.map(m => (
            <button key={m} onClick={() => toggleMuscle(m)} className={chipClass(profile.focusMuscles.includes(m))}>
              {m}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
