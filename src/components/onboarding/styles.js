export function cardStyle(t, selected) {
  return {
    padding: "16px 20px",
    borderRadius: 16,
    border: `1.5px solid ${selected ? t.colors.primary : t.border}`,
    background: selected ? t.alpha.primary._6 : t.surface,
    cursor: "pointer",
    transition: "all 0.2s ease",
    textAlign: "left",
    boxShadow: selected ? "none" : t.shadow,
  };
}

export function chipStyle(t, selected) {
  return {
    padding: "9px 18px",
    borderRadius: 9999,
    border: `1.5px solid ${selected ? t.colors.primary : t.border}`,
    background: selected ? t.alpha.primary._8 : t.surface,
    cursor: "pointer",
    fontSize: 12,
    fontWeight: selected ? 600 : 400,
    color: selected ? t.colors.primary : t.textMuted,
    transition: "all 0.2s ease",
    boxShadow: selected ? "none" : t.shadow,
  };
}

export function inputStyle(t) {
  return {
    width: "100%",
    padding: "12px 16px",
    borderRadius: 14,
    border: `1px solid ${t.border}`,
    background: t.surface,
    color: t.text,
    fontSize: 14,
    outline: "none",
    boxShadow: t.shadow,
  };
}
