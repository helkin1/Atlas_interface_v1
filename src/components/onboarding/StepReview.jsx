import { GOAL_OPTIONS, EQUIPMENT_OPTIONS, INJURY_OPTIONS } from "./constants.js";
import { getSplitRecommendation } from "./getSplitRecommendation.js";

export default function StepReview({ profile, t }) {
  const rec = getSplitRecommendation(profile);

  const sectionStyle = { background: t.surface, borderRadius: 12, padding: 20, boxShadow: t.shadow };
  const labelStyle = { fontSize: 12, fontWeight: 600, color: t.textMuted, marginBottom: 8 };
  const valStyle = { fontSize: 14, fontWeight: 600, color: t.text };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ ...sectionStyle, border: `1.5px solid ${t.alpha.primary._30}`, background: t.alpha.primary._4 }}>
        <div style={{ ...labelStyle, color: t.colors.primary }}>Recommended Split</div>
        <div style={{ fontSize: 18, fontWeight: 800, color: t.colors.primary, marginBottom: 4 }}>{rec.name}</div>
        <div style={{ fontSize: 12, color: t.textMuted, lineHeight: 1.5 }}>{rec.reason}</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={sectionStyle}>
          <div style={labelStyle}>About You</div>
          <div style={valStyle}>{profile.displayName || "\u2014"}</div>
          <div style={{ fontSize: 12, color: t.textMuted, marginTop: 4 }}>
            {[profile.age && `${profile.age} years old`, profile.sex && profile.sex !== "prefer_not_to_say" && profile.sex].filter(Boolean).join(" \u00B7 ") || "\u2014"}
          </div>
        </div>
        <div style={sectionStyle}>
          <div style={labelStyle}>Experience</div>
          <div style={valStyle}>{profile.experienceLevel ? profile.experienceLevel.charAt(0).toUpperCase() + profile.experienceLevel.slice(1) : "\u2014"}</div>
          <div style={{ fontSize: 12, color: t.textMuted, marginTop: 4 }}>
            {profile.trainingDaysPerWeek ? `${profile.trainingDaysPerWeek} days/week` : "\u2014"}{profile.sessionDuration ? ` \u00B7 ${profile.sessionDuration}` : ""}
          </div>
        </div>
      </div>

      <div style={sectionStyle}>
        <div style={labelStyle}>Primary Goal</div>
        <div style={valStyle}>{GOAL_OPTIONS.find(g => g.id === profile.primaryGoal)?.label || "\u2014"}</div>
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
