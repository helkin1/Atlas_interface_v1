import { GOAL_OPTIONS, EQUIPMENT_OPTIONS, INJURY_OPTIONS } from "./constants.js";
import { getSplitRecommendation } from "./getSplitRecommendation.js";
import { getPersonalizedConfig, getModifierDescriptions, getMusclesByTier } from "../../utils/personalization-engine.js";

export default function StepReview({ profile, t }) {
  const rec = getSplitRecommendation(profile);
  const config = getPersonalizedConfig(profile);
  const modDescriptions = getModifierDescriptions(config);
  const tiers = getMusclesByTier(config);

  const sectionStyle = { background: t.surface, borderRadius: 12, padding: 20, boxShadow: t.shadow };
  const labelStyle = { fontSize: 12, fontWeight: 600, color: t.textMuted, marginBottom: 8 };
  const valStyle = { fontSize: 14, fontWeight: 600, color: t.text };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ ...sectionStyle, border: `1.5px solid ${t.alpha.primary._30}`, background: t.alpha.primary._4 }}>
        <div style={{ ...labelStyle, color: t.colors.primary }}>Recommended Split</div>
        <div style={{ fontSize: 18, fontWeight: 800, color: t.colors.primary, marginBottom: 4 }}>{rec.name}</div>
        <div style={{ fontSize: 12, color: t.textMuted, lineHeight: 1.5 }}>{rec.reason}</div>
        <div style={{ fontSize: 11, color: t.textDim, marginTop: 8, fontStyle: "italic" }}>
          You can use this recommendation or build a completely custom plan in the Plan Builder.
        </div>
      </div>

      {/* Personalization Preview */}
      <div style={{ ...sectionStyle, border: `1px solid ${t.border}` }}>
        <div style={labelStyle}>Your Personalized Profile</div>
        {modDescriptions.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
            {modDescriptions.map((d, i) => (
              <div key={i} style={{ fontSize: 12, color: t.textMuted, lineHeight: 1.4 }}>
                <span style={{ fontWeight: 600, color: t.text }}>{d.label}:</span> {d.value}
              </div>
            ))}
          </div>
        )}
        {tiers.priority.length > 0 && (
          <div style={{ marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#22C55E" }}>Priority: </span>
            <span style={{ fontSize: 11, color: t.textMuted }}>{tiers.priority.slice(0, 4).map(m => m.muscle).join(", ")}{tiers.priority.length > 4 ? ` +${tiers.priority.length - 4}` : ""}</span>
          </div>
        )}
        {tiers.maintenance.length > 0 && (
          <div style={{ marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#94A3B8" }}>Maintenance: </span>
            <span style={{ fontSize: 11, color: t.textMuted }}>{tiers.maintenance.slice(0, 4).map(m => m.muscle).join(", ")}{tiers.maintenance.length > 4 ? ` +${tiers.maintenance.length - 4}` : ""}</span>
          </div>
        )}
        {tiers.excluded.length > 0 && (
          <div>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#EF4444" }}>Excluded: </span>
            <span style={{ fontSize: 11, color: t.textMuted }}>{tiers.excluded.map(m => m.muscle).join(", ")}</span>
          </div>
        )}
        <div style={{ fontSize: 10, color: t.textFaint, marginTop: 8, fontStyle: "italic" }}>
          Atlas uses your profile to personalize volume targets and plan scoring.
        </div>
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

      <div style={{ fontSize: 12, color: t.textMuted, textAlign: "center", marginTop: 4 }}>
        You can update any of this later in your Profile settings.
      </div>
    </div>
  );
}
