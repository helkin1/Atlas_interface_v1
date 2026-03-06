import { GOAL_OPTIONS, EQUIPMENT_OPTIONS, INJURY_OPTIONS } from "./constants.js";
import { getSplitRecommendation } from "./getSplitRecommendation.js";

const SECTION = "bg-surface rounded-sm p-5 shadow-card";
const LABEL = "text-xs font-semibold text-muted mb-2";
const VAL = "text-md font-semibold text-content";

export default function StepReview({ profile, t }) {
  const rec = getSplitRecommendation(profile);

  return (
    <div className="flex flex-col gap-4">
      <div className={`${SECTION} border-[1.5px] border-primary/30 bg-primary/[0.04]`}>
        <div className={`${LABEL} !text-primary`}>Recommended Split</div>
        <div className="text-lg font-[800] text-primary mb-1">{rec.name}</div>
        <div className="text-xs text-muted leading-relaxed">{rec.reason}</div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className={SECTION}>
          <div className={LABEL}>About You</div>
          <div className={VAL}>{profile.displayName || "\u2014"}</div>
          <div className="text-xs text-muted mt-1">
            {[profile.age && `${profile.age} years old`, profile.sex && profile.sex !== "prefer_not_to_say" && profile.sex].filter(Boolean).join(" \u00B7 ") || "\u2014"}
          </div>
        </div>
        <div className={SECTION}>
          <div className={LABEL}>Experience</div>
          <div className={VAL}>{profile.experienceLevel ? profile.experienceLevel.charAt(0).toUpperCase() + profile.experienceLevel.slice(1) : "\u2014"}</div>
          <div className="text-xs text-muted mt-1">
            {profile.trainingDaysPerWeek ? `${profile.trainingDaysPerWeek} days/week` : "\u2014"}{profile.sessionDuration ? ` \u00B7 ${profile.sessionDuration}` : ""}
          </div>
        </div>
      </div>

      <div className={SECTION}>
        <div className={LABEL}>Primary Goal</div>
        <div className={VAL}>{GOAL_OPTIONS.find(g => g.id === profile.primaryGoal)?.label || "\u2014"}</div>
        {profile.secondaryGoals.length > 0 && (
          <div className="text-xs text-muted mt-1">Also: {profile.secondaryGoals.map(g => GOAL_OPTIONS.find(o => o.id === g)?.label).filter(Boolean).join(", ")}</div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className={SECTION}>
          <div className={LABEL}>Equipment</div>
          <div className="text-xs text-content leading-relaxed">
            {profile.equipment.length > 0 ? profile.equipment.map(e => EQUIPMENT_OPTIONS.find(o => o.id === e)?.label).filter(Boolean).join(", ") : "None selected"}
          </div>
        </div>
        <div className={SECTION}>
          <div className={LABEL}>Focus Areas</div>
          <div className="text-xs text-content leading-relaxed">
            {profile.focusMuscles.length > 0 ? profile.focusMuscles.join(", ") : "No specific focus"}
          </div>
        </div>
      </div>

      {profile.injuries.length > 0 && (
        <div className={SECTION}>
          <div className={LABEL}>Injuries / Limitations</div>
          <div className="text-xs text-content">
            {profile.injuries.map(i => INJURY_OPTIONS.find(o => o.id === i)?.label).filter(Boolean).join(", ")}
          </div>
        </div>
      )}
    </div>
  );
}
