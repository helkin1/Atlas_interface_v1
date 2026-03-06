import { useState } from "react";
import { INPUT_CLASS, chipClass } from "./styles.js";

const LABEL = "text-xs font-semibold text-muted mb-2 block";

const SELECT_CLASS = `${INPUT_CLASS} appearance-none bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M2 4l4 4 4-4'/%3E%3C/svg%3E")] bg-no-repeat bg-[right_12px_center] pr-8`;

export default function StepAboutYou({ profile, onChange, t }) {
  const isMetric = profile.unitPreference === "metric";
  const [weightWarning, setWeightWarning] = useState(null);

  const totalInches = profile.heightCm ? profile.heightCm / 2.54 : null;
  const heightFt = totalInches !== null ? Math.floor(totalInches / 12) : "";
  const heightIn = totalInches !== null ? Math.round(totalInches % 12) : "";

  const setHeightImperial = (ft, inches) => {
    const f = parseInt(ft) || 0;
    const i = parseInt(inches) || 0;
    if (f === 0 && i === 0) { onChange({ ...profile, heightCm: null }); return; }
    onChange({ ...profile, heightCm: Math.round((f * 12 + i) * 2.54) });
  };

  const displayWeight = isMetric
    ? (profile.weightKg || "")
    : profile.weightKg ? Math.round(profile.weightKg * 2.205) : "";

  const setWeight = (val) => {
    const num = parseFloat(val);
    if (isNaN(num) || val === "") {
      onChange({ ...profile, weightKg: null });
      setWeightWarning(null);
      return;
    }
    if (num > 500) {
      setWeightWarning("are you sure? that seems like a lot");
    } else if (num < 50) {
      setWeightWarning("are you sure? that's awfully light");
    } else {
      setWeightWarning(null);
    }
    onChange({ ...profile, weightKg: isMetric ? num : parseFloat((num / 2.205).toFixed(2)) });
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <label className={LABEL}>What should we call you?</label>
        <input value={profile.displayName} onChange={e => onChange({ ...profile, displayName: e.target.value })} placeholder="Your name" className={INPUT_CLASS} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={LABEL}>Age</label>
          <select value={profile.age || ""} onChange={e => onChange({ ...profile, age: e.target.value ? parseInt(e.target.value) : null })} className={SELECT_CLASS}>
            <option value="">Select age</option>
            {Array.from({ length: 101 }, (_, i) => (<option key={i} value={i}>{i}</option>))}
          </select>
        </div>
        <div>
          <label className={LABEL}>Sex</label>
          <div className="flex gap-2">
            {["male", "female", "prefer_not_to_say"].map(s => (
              <button key={s} onClick={() => onChange({ ...profile, sex: s })} className={chipClass(profile.sex === s)}>
                {s === "prefer_not_to_say" ? "Prefer not to say" : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className={LABEL}>Preferred Units</label>
        <div className="flex gap-1 bg-surface2 rounded-[8px] p-0.5 w-fit">
          {["imperial", "metric"].map(u => (
            <button key={u} onClick={() => onChange({ ...profile, unitPreference: u })}
              className={`px-[18px] py-1.5 rounded-[6px] border-none cursor-pointer text-xs ${
                profile.unitPreference === u
                  ? "bg-primary/[0.12] text-primary font-semibold"
                  : "bg-transparent text-dim font-normal"
              }`}
            >{u === "imperial" ? "Imperial (lbs/ft)" : "Metric (kg/cm)"}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={LABEL}>Height {isMetric ? "(cm)" : ""}</label>
          {isMetric ? (
            <input type="number" min="100" max="250" value={profile.heightCm || ""} onChange={e => { const num = parseFloat(e.target.value); onChange({ ...profile, heightCm: isNaN(num) ? null : num }); }} placeholder="175" className={INPUT_CLASS} />
          ) : (
            <div className="flex gap-2 items-center">
              <select value={heightFt || ""} onChange={e => setHeightImperial(e.target.value, heightIn)} className={`${SELECT_CLASS} w-1/2`}>
                <option value="">ft</option>
                {Array.from({ length: 9 }, (_, i) => (<option key={i} value={i}>{i}</option>))}
              </select>
              <select value={heightIn || ""} onChange={e => setHeightImperial(heightFt, e.target.value)} className={`${SELECT_CLASS} w-1/2`}>
                <option value="">in</option>
                {Array.from({ length: 12 }, (_, i) => (<option key={i} value={i}>{i}</option>))}
              </select>
            </div>
          )}
        </div>
        <div>
          <label className={LABEL}>Weight ({isMetric ? "kg" : "lbs"})</label>
          <input type="number" min="30" max="700" value={displayWeight} onChange={e => setWeight(e.target.value)} placeholder={isMetric ? "75" : "165"} className={INPUT_CLASS} />
          {weightWarning && (<div className="text-sm text-accent mt-1.5 italic">{weightWarning}</div>)}
        </div>
      </div>
    </div>
  );
}
