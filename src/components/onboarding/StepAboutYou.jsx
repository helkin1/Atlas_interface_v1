import { inputStyle, chipStyle } from "./styles.js";

export default function StepAboutYou({ profile, onChange, t, weightWarning }) {
  const isMetric = profile.unitPreference === "metric";

  // Height: in imperial, split into ft + in (store exact cm to avoid rounding)
  const totalInches = profile.heightCm ? profile.heightCm / 2.54 : null;
  const heightFt = totalInches !== null ? Math.floor(totalInches / 12) : "";
  const heightIn = totalInches !== null ? Math.round(totalInches % 12) : "";

  const setHeightImperial = (ft, inches) => {
    const f = parseInt(ft) || 0;
    const i = parseInt(inches) || 0;
    if (f === 0 && i === 0) { onChange({ ...profile, heightCm: null }); return; }
    onChange({ ...profile, heightCm: (f * 12 + i) * 2.54 });
  };

  const displayWeight = isMetric
    ? (profile.weightKg || "")
    : profile.weightKg ? Math.round(profile.weightKg * 2.205) : "";

  const setWeight = (val) => {
    const num = parseFloat(val);
    if (isNaN(num) || val === "") { onChange({ ...profile, weightKg: null }); return; }
    onChange({ ...profile, weightKg: isMetric ? num : parseFloat((num / 2.205).toFixed(2)) });
  };

  const selectStyle = {
    ...inputStyle(t),
    appearance: "none",
    WebkitAppearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M2 4l4 4 4-4'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 12px center",
    paddingRight: 32,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <label style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, marginBottom: 8, display: "block" }}>What should we call you?</label>
        <input value={profile.displayName} onChange={e => onChange({ ...profile, displayName: e.target.value })} placeholder="Your name" style={inputStyle(t)} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, marginBottom: 8, display: "block" }}>Age</label>
          <select value={profile.age || ""} onChange={e => onChange({ ...profile, age: e.target.value ? parseInt(e.target.value) : null })} style={selectStyle}>
            <option value="">Select age</option>
            {Array.from({ length: 101 }, (_, i) => (<option key={i} value={i}>{i}</option>))}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, marginBottom: 8, display: "block" }}>Sex</label>
          <div style={{ display: "flex", gap: 8 }}>
            {["male", "female", "prefer_not_to_say"].map(s => (
              <button key={s} onClick={() => onChange({ ...profile, sex: s })} style={chipStyle(t, profile.sex === s)}>
                {s === "prefer_not_to_say" ? "Prefer not to say" : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, marginBottom: 8, display: "block" }}>Preferred Units</label>
        <div style={{ display: "flex", gap: 4, background: t.surface2, borderRadius: 8, padding: 2, width: "fit-content" }}>
          {["imperial", "metric"].map(u => (
            <button key={u} onClick={() => onChange({ ...profile, unitPreference: u })} style={{
              padding: "6px 18px", borderRadius: 6, border: "none", cursor: "pointer",
              background: profile.unitPreference === u ? t.alpha.primary._12 : "transparent",
              color: profile.unitPreference === u ? t.colors.primary : t.textDim,
              fontSize: 12, fontWeight: profile.unitPreference === u ? 600 : 400,
            }}>{u === "imperial" ? "Imperial (lbs/ft)" : "Metric (kg/cm)"}</button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, marginBottom: 8, display: "block" }}>Height {isMetric ? "(cm)" : ""}</label>
          {isMetric ? (
            <select
              value={profile.heightCm ? Math.round(profile.heightCm) : ""}
              onChange={e => onChange({ ...profile, heightCm: e.target.value ? parseInt(e.target.value) : null })}
              style={selectStyle}
            >
              <option value="">Select height</option>
              {Array.from({ length: 81 }, (_, i) => 120 + i).map(cm => (
                <option key={cm} value={cm}>{cm} cm</option>
              ))}
            </select>
          ) : (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <select value={heightFt || ""} onChange={e => setHeightImperial(e.target.value, heightIn)} style={{ ...selectStyle, width: "50%" }}>
                <option value="">ft</option>
                {Array.from({ length: 5 }, (_, i) => i + 4).map(ft => (
                  <option key={ft} value={ft}>{ft} ft</option>
                ))}
              </select>
              <select value={heightIn || ""} onChange={e => setHeightImperial(heightFt, e.target.value)} style={{ ...selectStyle, width: "50%" }}>
                <option value="">in</option>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i} value={i}>{i} in</option>
                ))}
              </select>
            </div>
          )}
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, marginBottom: 8, display: "block" }}>Weight ({isMetric ? "kg" : "lbs"})</label>
          <input type="number" min="30" max="700" value={displayWeight} onChange={e => setWeight(e.target.value)} placeholder={isMetric ? "75" : "165"} style={inputStyle(t)} />
          {weightWarning && (<div style={{ fontSize: 11, color: t.colors.accent, marginTop: 6, fontStyle: "italic" }}>{weightWarning} (click Next again to continue)</div>)}
        </div>
      </div>
    </div>
  );
}
