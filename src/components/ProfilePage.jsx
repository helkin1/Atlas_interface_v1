import { useState } from "react";
import { useTheme } from "../context/theme.js";
import { loadProfile, saveProfile } from "../utils/storage.js";
import {
  EQUIPMENT_OPTIONS, INJURY_OPTIONS, FOCUS_MUSCLES,
  GOAL_OPTIONS, EXPERIENCE_OPTIONS, SESSION_DURATIONS,
} from "./Onboarding.jsx";

const LABEL = "text-xs font-semibold text-muted mb-1.5 block";
const INPUT_CLS = "w-full px-4 py-3 rounded-[14px] border border-edge bg-surface text-content text-md outline-none";

function chipClass(sel) {
  return `px-4 py-2 rounded-pill border-[1.5px] cursor-pointer text-sm transition-all duration-200 ${
    sel ? "border-primary bg-primary/[0.08] font-semibold text-primary" : "border-edge bg-surface font-normal text-muted"
  }`;
}

function cardBtnClass(sel) {
  return `px-4 py-3 rounded-[14px] border-[1.5px] cursor-pointer text-xs text-left transition-all duration-200 ${
    sel ? "border-primary bg-primary/[0.06] font-semibold text-primary" : "border-edge bg-surface font-normal text-content"
  }`;
}

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

  return (
    <div className="max-w-[640px] mx-auto px-6 py-7 text-content">
      {/* Header */}
      <div className="flex items-center justify-between mb-7">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="bg-surface border border-edge rounded-sm cursor-pointer text-primary text-body px-4 py-2 font-medium">{"\u2190"} Back</button>
          <h1 className="text-[24px] font-[800] tracking-tight text-content">Your Profile</h1>
        </div>
        <button onClick={handleSave}
          className={`px-7 py-2.5 rounded-[14px] text-body font-semibold cursor-pointer border-none transition-all duration-200 ${
            saved ? "bg-success/[0.12] text-success" : "bg-cta text-cta-text"
          }`}
        >{saved ? "\u2713 Saved" : "Save Changes"}</button>
      </div>

      {/* Personal Info */}
      <div className="bg-surface rounded-lg p-7 mb-5 shadow-card">
        <div className="text-body font-semibold text-muted mb-[18px]">Personal Info</div>
        <div className="flex flex-col gap-4">
          <div>
            <label className={LABEL}>Display Name</label>
            <input value={profile.displayName} onChange={e => update({ displayName: e.target.value })} className={INPUT_CLS} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={LABEL}>Age</label>
              <input type="number" value={profile.age || ""} onChange={e => update({ age: e.target.value ? parseInt(e.target.value) : null })} className={INPUT_CLS} />
            </div>
            <div>
              <label className={LABEL}>Height ({isMetric ? "cm" : "in"})</label>
              <input type="number" value={displayHeight} onChange={e => setHeight(e.target.value)} className={INPUT_CLS} />
            </div>
            <div>
              <label className={LABEL}>Weight ({isMetric ? "kg" : "lbs"})</label>
              <input type="number" value={displayWeight} onChange={e => setWeight(e.target.value)} className={INPUT_CLS} />
            </div>
          </div>
          <div className="flex gap-3 items-center">
            <label className="text-xs font-semibold text-muted">Sex</label>
            <div className="flex gap-1.5">
              {["male", "female", "prefer_not_to_say"].map(s => (
                <button key={s} onClick={() => update({ sex: s })} className={chipClass(profile.sex === s)}>
                  {s === "prefer_not_to_say" ? "Prefer not to say" : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 items-center">
            <label className="text-xs font-semibold text-muted">Units</label>
            <div className="inline-flex gap-1 bg-surface2 rounded-[14px] p-1">
              {["imperial", "metric"].map(u => (
                <button key={u} onClick={() => update({ unitPreference: u })}
                  className={`px-4 py-[7px] rounded-[10px] border-none cursor-pointer text-xs transition-all duration-200 ${
                    profile.unitPreference === u ? "bg-surface text-content font-semibold shadow-card" : "bg-transparent text-dim font-normal"
                  }`}
                >{u === "imperial" ? "Imperial" : "Metric"}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Training Preferences */}
      <div className="bg-surface rounded-lg p-7 mb-5 shadow-card">
        <div className="text-body font-semibold text-muted mb-[18px]">Training Preferences</div>
        <div className="flex flex-col gap-5">
          {/* Experience */}
          <div>
            <label className={LABEL}>Experience Level</label>
            <div className="flex gap-2">
              {EXPERIENCE_OPTIONS.map(opt => (
                <button key={opt.id} onClick={() => update({ experienceLevel: opt.id })} className={chipClass(profile.experienceLevel === opt.id)}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Goals */}
          <div>
            <label className={LABEL}>Primary Goal</label>
            <div className="flex gap-2 flex-wrap">
              {GOAL_OPTIONS.map(opt => (
                <button key={opt.id} onClick={() => {
                  const sg = (profile.secondaryGoals || []).filter(g => g !== opt.id);
                  update({ primaryGoal: opt.id, secondaryGoals: sg });
                }} className={chipClass(profile.primaryGoal === opt.id)}>
                  {opt.icon} {opt.label}
                </button>
              ))}
            </div>
          </div>

          {profile.primaryGoal && (
            <div>
              <label className={LABEL}>Secondary Goals</label>
              <div className="flex gap-2 flex-wrap">
                {GOAL_OPTIONS.filter(g => g.id !== profile.primaryGoal).map(opt => (
                  <button key={opt.id} onClick={() => toggleList("secondaryGoals", opt.id)} className={chipClass((profile.secondaryGoals || []).includes(opt.id))}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Schedule */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL}>Training Days / Week</label>
              <div className="flex gap-1.5">
                {[2, 3, 4, 5, 6, 7].map(n => {
                  const sel = profile.trainingDaysPerWeek === n;
                  return (
                    <button key={n} onClick={() => update({ trainingDaysPerWeek: n })}
                      className={`w-10 h-10 rounded-sm border-[1.5px] cursor-pointer text-md font-bold flex items-center justify-center ${
                        sel ? "border-primary bg-primary/[0.08] text-primary" : "border-edge bg-surface text-content"
                      }`}
                    >{n}</button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className={LABEL}>Session Duration</label>
              <div className="flex gap-1.5 flex-wrap">
                {SESSION_DURATIONS.map(d => (
                  <button key={d} onClick={() => update({ sessionDuration: d })} className={chipClass(profile.sessionDuration === d)}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Equipment */}
          <div>
            <label className={LABEL}>Available Equipment</label>
            <div className="grid grid-cols-2 gap-1.5">
              {EQUIPMENT_OPTIONS.map(opt => (
                <button key={opt.id} onClick={() => toggleList("equipment", opt.id)} className={cardBtnClass((profile.equipment || []).includes(opt.id))}>
                  {opt.icon} {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Focus Muscles */}
          <div>
            <label className={LABEL}>Focus Muscles</label>
            <div className="flex gap-1.5 flex-wrap">
              {FOCUS_MUSCLES.map(m => (
                <button key={m} onClick={() => toggleList("focusMuscles", m)} className={chipClass((profile.focusMuscles || []).includes(m))}>
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Injuries */}
          <div>
            <label className={LABEL}>Injuries / Limitations</label>
            <div className="grid grid-cols-2 gap-1.5">
              {INJURY_OPTIONS.map(opt => (
                <button key={opt.id} onClick={() => toggleList("injuries", opt.id)} className={cardBtnClass((profile.injuries || []).includes(opt.id))}>
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
