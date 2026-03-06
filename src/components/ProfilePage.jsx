import { useState, useEffect } from "react";
import { useTheme } from "../context/theme.js";
import { loadProfile, saveProfile, DEFAULT_PROFILE } from "../utils/storage.js";
import {
  EQUIPMENT_OPTIONS, INJURY_OPTIONS, FOCUS_MUSCLES,
  GOAL_OPTIONS, EXPERIENCE_OPTIONS, SESSION_DURATIONS,
} from "./Onboarding.jsx";

/* ── Shared Styles ──────────────────────────────────────────── */

function inputStyle(t) {
  return {
    width: "100%",
    padding: "10px 14px",
    borderRadius: 10,
    border: `1px solid ${t.borderLight}`,
    background: t.surface,
    color: t.text,
    fontSize: 14,
    fontFamily: "'Outfit', sans-serif",
    outline: "none",
  };
}

function chipStyle(t, selected) {
  return {
    padding: "6px 14px",
    borderRadius: 20,
    border: `1.5px solid ${selected ? "#4C9EFF" : t.border}`,
    background: selected ? "rgba(76,158,255,0.08)" : "transparent",
    cursor: "pointer",
    fontSize: 11,
    fontWeight: selected ? 600 : 400,
    color: selected ? "#4C9EFF" : t.textMuted,
    transition: "all 0.15s",
  };
}

function cardStyle(t, selected) {
  return {
    padding: "10px 16px",
    borderRadius: 10,
    border: `1.5px solid ${selected ? "#4C9EFF" : t.border}`,
    background: selected ? "rgba(76,158,255,0.06)" : "transparent",
    cursor: "pointer",
    fontSize: 12,
    fontWeight: selected ? 600 : 400,
    color: selected ? "#4C9EFF" : t.text,
    textAlign: "left",
    transition: "all 0.15s",
  };
}

/* ── Profile Page ────────────────────────────────────────────── */

export default function ProfilePage({ onBack }) {
  const t = useTheme();
  const [profile, setProfile] = useState(() => loadProfile());
  const [saved, setSaved] = useState(false);

  const update = (patch) => {
    setProfile(p => ({ ...p, ...patch }));
    setSaved(false);
  };

  const handleSave = () => {
    saveProfile(profile);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const isMetric = profile.unitPreference === "metric";
  const displayHeight = isMetric
    ? (profile.heightCm || "")
    : profile.heightCm ? Math.round(profile.heightCm / 2.54) : "";
  const displayWeight = isMetric
    ? (profile.weightKg || "")
    : profile.weightKg ? Math.round(profile.weightKg * 2.205) : "";

  const setHeight = (val) => {
    const num = parseFloat(val);
    if (isNaN(num)) { update({ heightCm: null }); return; }
    update({ heightCm: isMetric ? num : Math.round(num * 2.54) });
  };
  const setWeight = (val) => {
    const num = parseFloat(val);
    if (isNaN(num)) { update({ weightKg: null }); return; }
    update({ weightKg: isMetric ? num : Math.round(num / 2.205) });
  };

  const toggleList = (key, id) => {
    const list = profile[key] || [];
    update({ [key]: list.includes(id) ? list.filter(x => x !== id) : [...list, id] });
  };

  const sectionStyle = { background: t.surface, borderRadius: 12, padding: 24, marginBottom: 16 };
  const sectionTitle = { fontSize: 12, fontWeight: 600, color: t.textMuted, marginBottom: 16 };

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "28px 24px", color: t.text }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: "#4C9EFF", fontSize: 13, fontFamily: "'Outfit', sans-serif" }}>{"\u2190"} Back</button>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5, color: t.text }}>Your Profile</h1>
        </div>
        <button onClick={handleSave} style={{
          padding: "8px 24px", borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: "pointer",
          background: saved ? "rgba(61,220,132,0.12)" : "rgba(76,158,255,0.12)",
          border: `1px solid ${saved ? "rgba(61,220,132,0.4)" : "#4C9EFF"}`,
          color: saved ? "#3DDC84" : "#4C9EFF",
          transition: "all 0.2s",
        }}>{saved ? "\u2713 Saved" : "Save Changes"}</button>
      </div>

      {/* Personal Info */}
      <div style={sectionStyle}>
        <div style={sectionTitle}>Personal Info</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, marginBottom: 6, display: "block" }}>Display Name</label>
            <input value={profile.displayName} onChange={e => update({ displayName: e.target.value })} style={inputStyle(t)} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, marginBottom: 6, display: "block" }}>Age</label>
              <input type="number" value={profile.age || ""} onChange={e => update({ age: e.target.value ? parseInt(e.target.value) : null })} style={inputStyle(t)} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, marginBottom: 6, display: "block" }}>Height ({isMetric ? "cm" : "in"})</label>
              <input type="number" value={displayHeight} onChange={e => setHeight(e.target.value)} style={inputStyle(t)} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, marginBottom: 6, display: "block" }}>Weight ({isMetric ? "kg" : "lbs"})</label>
              <input type="number" value={displayWeight} onChange={e => setWeight(e.target.value)} style={inputStyle(t)} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: t.textMuted }}>Sex</label>
            <div style={{ display: "flex", gap: 6 }}>
              {["male", "female", "prefer_not_to_say"].map(s => (
                <button key={s} onClick={() => update({ sex: s })} style={chipStyle(t, profile.sex === s)}>
                  {s === "prefer_not_to_say" ? "Prefer not to say" : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: t.textMuted }}>Units</label>
            <div style={{ display: "flex", gap: 4, background: t.surface2, borderRadius: 8, padding: 2 }}>
              {["imperial", "metric"].map(u => (
                <button key={u} onClick={() => update({ unitPreference: u })} style={{
                  padding: "5px 14px", borderRadius: 6, border: "none", cursor: "pointer",
                  background: profile.unitPreference === u ? "rgba(76,158,255,0.12)" : "transparent",
                  color: profile.unitPreference === u ? "#4C9EFF" : t.textDim,
                  fontSize: 11, fontWeight: profile.unitPreference === u ? 600 : 400,
                }}>{u === "imperial" ? "Imperial" : "Metric"}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Training Preferences */}
      <div style={sectionStyle}>
        <div style={sectionTitle}>Training Preferences</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Experience */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, marginBottom: 8, display: "block" }}>Experience Level</label>
            <div style={{ display: "flex", gap: 8 }}>
              {EXPERIENCE_OPTIONS.map(opt => (
                <button key={opt.id} onClick={() => update({ experienceLevel: opt.id })} style={chipStyle(t, profile.experienceLevel === opt.id)}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Goals */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, marginBottom: 8, display: "block" }}>Primary Goal</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {GOAL_OPTIONS.map(opt => (
                <button key={opt.id} onClick={() => {
                  const sg = (profile.secondaryGoals || []).filter(g => g !== opt.id);
                  update({ primaryGoal: opt.id, secondaryGoals: sg });
                }} style={chipStyle(t, profile.primaryGoal === opt.id)}>
                  {opt.icon} {opt.label}
                </button>
              ))}
            </div>
          </div>

          {profile.primaryGoal && (
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, marginBottom: 8, display: "block" }}>Secondary Goals</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {GOAL_OPTIONS.filter(g => g.id !== profile.primaryGoal).map(opt => (
                  <button key={opt.id} onClick={() => toggleList("secondaryGoals", opt.id)} style={chipStyle(t, (profile.secondaryGoals || []).includes(opt.id))}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Schedule */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, marginBottom: 8, display: "block" }}>Training Days / Week</label>
              <div style={{ display: "flex", gap: 6 }}>
                {[2, 3, 4, 5, 6, 7].map(n => (
                  <button key={n} onClick={() => update({ trainingDaysPerWeek: n })} style={{
                    width: 36, height: 36, borderRadius: 8,
                    border: `1.5px solid ${profile.trainingDaysPerWeek === n ? "#4C9EFF" : t.border}`,
                    background: profile.trainingDaysPerWeek === n ? "rgba(76,158,255,0.08)" : "transparent",
                    color: profile.trainingDaysPerWeek === n ? "#4C9EFF" : t.text,
                    fontSize: 14, fontWeight: 700, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>{n}</button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, marginBottom: 8, display: "block" }}>Session Duration</label>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {SESSION_DURATIONS.map(d => (
                  <button key={d} onClick={() => update({ sessionDuration: d })} style={chipStyle(t, profile.sessionDuration === d)}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Equipment */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, marginBottom: 8, display: "block" }}>Available Equipment</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {EQUIPMENT_OPTIONS.map(opt => (
                <button key={opt.id} onClick={() => toggleList("equipment", opt.id)} style={cardStyle(t, (profile.equipment || []).includes(opt.id))}>
                  {opt.icon} {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Focus Muscles */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, marginBottom: 8, display: "block" }}>Focus Muscles</label>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {FOCUS_MUSCLES.map(m => (
                <button key={m} onClick={() => toggleList("focusMuscles", m)} style={chipStyle(t, (profile.focusMuscles || []).includes(m))}>
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Injuries */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, marginBottom: 8, display: "block" }}>Injuries / Limitations</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {INJURY_OPTIONS.map(opt => (
                <button key={opt.id} onClick={() => toggleList("injuries", opt.id)} style={cardStyle(t, (profile.injuries || []).includes(opt.id))}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
