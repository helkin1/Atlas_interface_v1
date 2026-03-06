export function cardStyle(t, selected) {
  return {
    padding: "16px 20px",
    borderRadius: 12,
    border: `1.5px solid ${selected ? t.colors.primary : t.border}`,
    background: selected ? t.alpha.primary._6 : t.surface,
    cursor: "pointer",
    transition: "all 0.15s",
    textAlign: "left",
  };
}

export function chipStyle(t, selected) {
  return {
    padding: "8px 16px",
    borderRadius: 20,
    border: `1.5px solid ${selected ? t.colors.primary : t.border}`,
    background: selected ? t.alpha.primary._8 : "transparent",
    cursor: "pointer",
    fontSize: 12,
    fontWeight: selected ? 600 : 400,
    color: selected ? t.colors.primary : t.textMuted,
    transition: "all 0.15s",
  };
}

export function inputStyle(t) {
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
