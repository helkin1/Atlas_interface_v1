import { useTheme } from "../context/theme.js";
import { PATTERN_COLORS, MUSCLE_COLORS, goalPctColor, calcGoalPcts, calcPersonalizedGoalPcts } from "../utils/helpers.js";

/**
 * Clean, elevated card style — rounded corners, soft shadow, white/dark surface.
 */
export function cardStyle(t, overrides = {}) {
  return {
    background: t.surface,
    borderRadius: 12,
    border: `1px solid ${t.border}`,
    boxShadow: t.shadow,
    transition: "all 0.2s ease",
    ...overrides,
  };
}

export function MiniBar({ name, sets, max }) {
  const t = useTheme();
  const pct = Math.min((sets / Math.max(max, 1)) * 100, 100);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ 
        fontSize: 12, 
        color: t.textMuted, 
        width: 80, 
        textAlign: "right", 
        overflow: "hidden", 
        textOverflow: "ellipsis", 
        whiteSpace: "nowrap",
        fontWeight: 500,
      }}>
        {name}
      </span>
      <div style={{ flex: 1, height: 4, background: t.surface3, borderRadius: 2, overflow: "hidden" }}>
        <div style={{ 
          width: `${pct}%`, 
          height: "100%", 
          background: t.text, 
          opacity: 0.5,
          borderRadius: 2, 
          transition: "width 0.3s ease",
        }} />
      </div>
      <span style={{ 
        fontSize: 12, 
        color: t.textDim, 
        width: 28, 
        textAlign: "right",
        fontWeight: 500,
      }}>
        {sets % 1 === 0 ? sets : sets.toFixed(1)}
      </span>
    </div>
  );
}

export function StatCard({ label, value, sub, color }) {
  const t = useTheme();
  return (
    <div style={{ ...cardStyle(t, { padding: 20 }) }}>
      <div style={{ 
        fontSize: 11, 
        color: t.textMuted, 
        fontWeight: 500,
        textTransform: "uppercase",
        letterSpacing: "0.05em", 
        marginBottom: 8,
      }}>
        {label}
      </div>
      <div style={{ fontSize: 28, fontWeight: 600, color: color || t.text }}>{value}</div>
      {sub && <div style={{ fontSize: 13, color: t.textDim, marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

export function PatternBadge({ pattern, size }) {
  const t = useTheme();
  const lg = size === "md";
  return (
    <span style={{
      fontSize: lg ? 11 : 10, 
      padding: lg ? "4px 10px" : "2px 8px",
      borderRadius: 6, 
      background: t.surface2, 
      color: t.textMuted,
      fontWeight: 500,
      border: `1px solid ${t.border}`,
    }}>
      {pattern}
    </span>
  );
}

export function GoalRing({ pct, size = 80, strokeWidth = 6, label, sublabel }) {
  const t = useTheme();
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const capped = Math.min(pct, 100);
  const offset = circ - (capped / 100) * circ;
  const ringColor = pct >= 80 ? t.colors.success : t.text;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={t.surface3} strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={ringColor} strokeWidth={strokeWidth}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.5s ease" }} />
      </svg>
      <div style={{
        position: "relative",
        marginTop: -size + 2,
        height: size - 2,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <div style={{ fontSize: size > 60 ? 18 : 14, fontWeight: 600, color: ringColor }}>{pct}%</div>
        {sublabel && <div style={{ fontSize: 9, color: t.textDim, marginTop: 1 }}>{sublabel}</div>}
      </div>
      {label && (
        <div style={{
          fontSize: 11,
          color: t.textDim,
          fontWeight: 500,
          marginTop: 4,
        }}>
          {label}
        </div>
      )}
    </div>
  );
}

export function MuscleGoalBar({ name, eff, target, compact, tier }) {
  const t = useTheme();
  const pct = target > 0 ? Math.round((eff / target) * 100) : 0;
  const barPct = Math.min(pct, 100);

  // Tier-aware styling
  const isExcluded = tier === "excluded";
  const isMaintenance = tier === "maintenance";
  const isPriority = tier === "priority";

  if (isExcluded) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 10, opacity: 0.4 }}>
        <span style={{
          fontSize: 12, color: t.textFaint, width: 75, textAlign: "right",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          fontWeight: 400, textDecoration: "line-through",
        }}>{name}</span>
        <div style={{ flex: 1, height: 4, background: t.surface3, borderRadius: 2 }} />
        <span style={{ fontSize: 10, color: t.textFaint, width: 36, textAlign: "right" }}>—</span>
      </div>
    );
  }

  const nameWeight = isPriority ? 600 : 500;
  const nameColor = isMaintenance ? t.textFaint : t.textMuted;
  const barBg = pct >= 80 ? t.colors.success : t.text;
  const barOpacity = isMaintenance ? 0.3 : (pct >= 80 ? 1 : 0.5);
  const pctColor = pct >= 80 ? t.colors.success : (isMaintenance ? t.textFaint : t.text);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{
        fontSize: 12, color: nameColor, width: 75, textAlign: "right",
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        fontWeight: nameWeight,
      }}>{name}</span>
      <div style={{ flex: 1, height: 4, background: t.surface3, borderRadius: 2, overflow: "hidden" }}>
        <div style={{
          width: `${barPct}%`, height: "100%", background: barBg,
          opacity: barOpacity, borderRadius: 2, transition: "width 0.3s ease",
        }} />
      </div>
      <span style={{
        fontSize: 12, fontWeight: 600, color: pctColor, width: 36, textAlign: "right",
      }}>{pct}%</span>
    </div>
  );
}

// ── AlertsPanel ──────────────────────────────────────────────
const ALERT_STYLES = {
  critical: { color: "#EF4444", bg: "rgba(239,68,68,0.07)", border: "rgba(239,68,68,0.18)", dot: "#EF4444" },
  warning:  { color: "#F59E0B", bg: "rgba(245,158,11,0.07)", border: "rgba(245,158,11,0.18)", dot: "#F59E0B" },
  info:     { color: "#3B82F6", bg: "rgba(59,130,246,0.07)", border: "rgba(59,130,246,0.18)", dot: "#3B82F6" },
};

export function AlertsPanel({ alerts, maxVisible = 5 }) {
  const t = useTheme();
  const visible = alerts ? alerts.slice(0, maxVisible) : [];
  const overflow = alerts ? Math.max(0, alerts.length - maxVisible) : 0;

  if (!alerts || alerts.length === 0) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 14px", borderRadius: 14, background: "rgba(34,197,94,0.07)" }}>
        <span style={{ fontSize: 14 }}>✓</span>
        <span style={{ fontSize: 12, color: "#22C55E", fontWeight: 600 }}>Plan looks balanced</span>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {visible.map(alert => {
        const s = ALERT_STYLES[alert.severity] || ALERT_STYLES.info;
        return (
          <div key={alert.id} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "10px 12px", borderRadius: 14, background: s.bg }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, marginTop: 5, flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: s.color, lineHeight: 1.3, marginBottom: 2 }}>{alert.title}</div>
              <div style={{ fontSize: 10, color: t.textDim, lineHeight: 1.4 }}>{alert.message}</div>
            </div>
          </div>
        );
      })}
      {overflow > 0 && (
        <div style={{ fontSize: 10, color: t.textFaint, textAlign: "center", paddingTop: 2 }}>+{overflow} more</div>
      )}
    </div>
  );
}

// ── SparkLine ───────────────────────────────────────────────
export function SparkLine({ data = [], width = 120, height = 32, color = "#3B82F6", fillOpacity = 0.1 }) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(" ");
  const fillPoints = `0,${height} ${points} ${width},${height}`;
  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      <polyline points={fillPoints} fill={color} opacity={fillOpacity} stroke="none" />
      <polyline points={points} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── BarChart ─────────────────────────────────────────────────
export function BarChart({ data = [], width = 300, height = 140, barColor = "#3B82F6" }) {
  const t = useTheme();
  if (data.length === 0) return null;
  const maxVal = Math.max(...data.map(d => d.value), 1);
  const barGap = 4;
  const barWidth = Math.max(6, (width - barGap * (data.length - 1)) / data.length);
  return (
    <div>
      <svg width={width} height={height} style={{ display: "block" }}>
        {data.map((d, i) => {
          const barH = (d.value / maxVal) * (height - 20);
          const x = i * (barWidth + barGap);
          const y = height - 20 - barH;
          return (
            <g key={i}>
              <rect x={x} y={y} width={barWidth} height={barH} rx={6} fill={d.color || barColor} opacity={0.85} />
              <text x={x + barWidth / 2} y={height - 4} textAnchor="middle" fontSize={9} fontFamily="'Outfit', sans-serif" fill={t.textFaint}>
                {d.label || ""}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ── LineChart ────────────────────────────────────────────────
export function LineChart({ data = [], width = 400, height = 200, color = "#3B82F6", yLabel = "", showDots = true }) {
  const t = useTheme();
  if (data.length < 2) return null;
  const pad = { top: 10, right: 10, bottom: 24, left: yLabel ? 40 : 10 };
  const cw = width - pad.left - pad.right;
  const ch = height - pad.top - pad.bottom;
  const vals = data.map(d => d.y);
  const minY = Math.min(...vals);
  const maxY = Math.max(...vals);
  const rangeY = maxY - minY || 1;
  const points = data.map((d, i) => {
    const x = pad.left + (i / (data.length - 1)) * cw;
    const y = pad.top + ch - ((d.y - minY) / rangeY) * ch;
    return { x, y, label: d.x };
  });
  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
        const y = pad.top + ch - frac * ch;
        return <line key={frac} x1={pad.left} y1={y} x2={width - pad.right} y2={y} stroke={t.surface3} strokeWidth={0.5} />;
      })}
      <path d={linePath} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {showDots && points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill={color} />
      ))}
      {[0, Math.floor(points.length / 2), points.length - 1].map(idx => {
        const p = points[idx];
        if (!p) return null;
        return <text key={idx} x={p.x} y={height - 4} textAnchor="middle" fontSize={9} fontFamily="'Outfit', sans-serif" fill={t.textFaint}>{p.label}</text>;
      })}
      {yLabel && <text x={4} y={pad.top + ch / 2} textAnchor="start" fontSize={9} fontFamily="'Outfit', sans-serif" fill={t.textFaint} transform={`rotate(-90,4,${pad.top + ch / 2})`}>{yLabel}</text>}
    </svg>
  );
}

// ── Tabs ─────────────────────────────────────────────────────
export function Tabs({ items = [], active, onChange }) {
  const t = useTheme();
  return (
    <div style={{ display: "inline-flex", gap: 4, background: t.surface2, borderRadius: 16, padding: 4, marginBottom: 24 }}>
      {items.map(item => {
        const isActive = item.key === active;
        return (
          <button key={item.key} onClick={() => onChange(item.key)} style={{
            fontSize: 13, padding: "8px 20px", borderRadius: 12,
            border: "none", cursor: "pointer",
            background: isActive ? t.surface : "transparent",
            color: isActive ? t.text : t.textDim,
            fontWeight: isActive ? 600 : 400,
            boxShadow: isActive ? t.shadow : "none",
            transition: "all 0.2s ease",
          }}>{item.label}</button>
        );
      })}
    </div>
  );
}

// ── EmptyState ───────────────────────────────────────────────
export function EmptyState({ icon = "📭", title = "No data yet", message = "" }) {
  const t = useTheme();
  return (
    <div style={{ textAlign: "center", padding: "48px 24px" }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: t.text, marginBottom: 6 }}>{title}</div>
      {message && <div style={{ fontSize: 13, color: t.textDim, maxWidth: 320, margin: "0 auto" }}>{message}</div>}
    </div>
  );
}

// ── SectionLabel ─────────────────────────────────────────────
export function SectionLabel({ children }) {
  const t = useTheme();
  return (
    <div style={{ fontSize: 13, fontWeight: 600, color: t.textMuted, marginBottom: 14 }}>{children}</div>
  );
}

export function MuscleDiagram({ muscleVol, size = 160, config }) {
  const t = useTheme();
  const goals = config ? calcPersonalizedGoalPcts(muscleVol, config) : calcGoalPcts(muscleVol);

  const regionMap = {
    "Front Delts": "shoulders", "Side Delts": "shoulders", "Rear Delts": "shoulders",
    Chest: "chest", "Upper Chest": "chest",
    Biceps: "arms", Triceps: "arms", Forearms: "forearms", Brachialis: "arms",
    Core: "core",
    Quads: "quads", Hamstrings: "hamstrings", Glutes: "glutes",
    Calves: "calves",
    Lats: "back", "Upper Back": "back",
    Traps: "traps", "Lower Back": "lowerback",
    "Rotator Cuff": "shoulders",
  };

  const regionPcts = {};
  Object.entries(goals).forEach(([m, data]) => {
    const reg = regionMap[m] || "other";
    if (!regionPcts[reg]) regionPcts[reg] = [];
    regionPcts[reg].push(data.pct);
  });
  const regionAvg = {};
  Object.entries(regionPcts).forEach(([reg, pcts]) => {
    regionAvg[reg] = Math.round(pcts.reduce((s, p) => s + p, 0) / pcts.length);
  });

  // Check if any muscle in a region is excluded
  const regionHasExcluded = {};
  if (config) {
    Object.entries(goals).forEach(([m, data]) => {
      const reg = regionMap[m] || "other";
      if (data.tier === "excluded") regionHasExcluded[reg] = true;
    });
  }

  const getRegionColor = (region) => {
    if (regionHasExcluded[region]) return { fill: t.textFaint, opacity: 0.15 };
    const pct = regionAvg[region] || 0;
    const c = goalPctColor(pct);
    const alpha = Math.max(0.15, Math.min(pct / 100, 1));
    return { fill: c, opacity: alpha };
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <svg width={size} height={size * 1.65} viewBox="0 0 160 264" fill="none">
        <ellipse cx="80" cy="18" rx="12" ry="14" fill={t.surface3} stroke={t.borderLight} strokeWidth="0.8" />
        <rect x="74" y="30" width="12" height="8" rx="3" fill={t.surface3} stroke={t.borderLight} strokeWidth="0.5" />
        <path d="M62 38 L74 34 L80 38 L86 34 L98 38 L95 48 L65 48 Z"
          fill={getRegionColor("traps").fill} opacity={getRegionColor("traps").opacity} stroke={t.borderLight} strokeWidth="0.5" />
        <ellipse cx="50" cy="52" rx="14" ry="10"
          fill={getRegionColor("shoulders").fill} opacity={getRegionColor("shoulders").opacity} stroke={t.borderLight} strokeWidth="0.5" />
        <ellipse cx="110" cy="52" rx="14" ry="10"
          fill={getRegionColor("shoulders").fill} opacity={getRegionColor("shoulders").opacity} stroke={t.borderLight} strokeWidth="0.5" />
        <path d="M62 46 Q80 42 98 46 L98 70 Q80 76 62 70 Z"
          fill={getRegionColor("chest").fill} opacity={getRegionColor("chest").opacity} stroke={t.borderLight} strokeWidth="0.5" />
        <path d="M44 60 Q38 80 36 100 Q42 102 48 100 Q46 80 50 60 Z"
          fill={getRegionColor("arms").fill} opacity={getRegionColor("arms").opacity} stroke={t.borderLight} strokeWidth="0.5" />
        <path d="M116 60 Q122 80 124 100 Q118 102 112 100 Q114 80 110 60 Z"
          fill={getRegionColor("arms").fill} opacity={getRegionColor("arms").opacity} stroke={t.borderLight} strokeWidth="0.5" />
        <path d="M36 100 Q32 120 30 136 Q36 138 40 136 Q40 120 44 100 Z"
          fill={getRegionColor("forearms").fill} opacity={getRegionColor("forearms").opacity} stroke={t.borderLight} strokeWidth="0.5" />
        <path d="M124 100 Q128 120 130 136 Q124 138 120 136 Q120 120 116 100 Z"
          fill={getRegionColor("forearms").fill} opacity={getRegionColor("forearms").opacity} stroke={t.borderLight} strokeWidth="0.5" />
        <path d="M66 70 Q80 76 94 70 L92 120 Q80 124 68 120 Z"
          fill={getRegionColor("core").fill} opacity={getRegionColor("core").opacity} stroke={t.borderLight} strokeWidth="0.5" />
        <path d="M56 50 L62 46 L62 70 L58 72 Q54 62 56 50 Z"
          fill={getRegionColor("back").fill} opacity={getRegionColor("back").opacity} stroke={t.borderLight} strokeWidth="0.5" />
        <path d="M104 50 L98 46 L98 70 L102 72 Q106 62 104 50 Z"
          fill={getRegionColor("back").fill} opacity={getRegionColor("back").opacity} stroke={t.borderLight} strokeWidth="0.5" />
        <path d="M64 120 Q80 126 96 120 L98 140 Q80 146 62 140 Z"
          fill={getRegionColor("glutes").fill} opacity={getRegionColor("glutes").opacity} stroke={t.borderLight} strokeWidth="0.5" />
        <path d="M62 140 Q58 170 56 200 Q66 204 72 200 Q72 170 74 140 Z"
          fill={getRegionColor("quads").fill} opacity={getRegionColor("quads").opacity} stroke={t.borderLight} strokeWidth="0.5" />
        <path d="M98 140 Q102 170 104 200 Q94 204 88 200 Q88 170 86 140 Z"
          fill={getRegionColor("quads").fill} opacity={getRegionColor("quads").opacity} stroke={t.borderLight} strokeWidth="0.5" />
        <path d="M56 200 Q54 186 58 172 Q62 170 62 186 Q60 200 56 200 Z"
          fill={getRegionColor("hamstrings").fill} opacity={getRegionColor("hamstrings").opacity} stroke={t.borderLight} strokeWidth="0.3" />
        <path d="M104 200 Q106 186 102 172 Q98 170 98 186 Q100 200 104 200 Z"
          fill={getRegionColor("hamstrings").fill} opacity={getRegionColor("hamstrings").opacity} stroke={t.borderLight} strokeWidth="0.3" />
        <path d="M58 204 Q56 224 54 244 Q62 248 66 244 Q66 224 68 204 Z"
          fill={getRegionColor("calves").fill} opacity={getRegionColor("calves").opacity} stroke={t.borderLight} strokeWidth="0.5" />
        <path d="M102 204 Q104 224 106 244 Q98 248 94 244 Q94 224 92 204 Z"
          fill={getRegionColor("calves").fill} opacity={getRegionColor("calves").opacity} stroke={t.borderLight} strokeWidth="0.5" />
        <ellipse cx="60" cy="254" rx="10" ry="4" fill={t.surface3} stroke={t.borderLight} strokeWidth="0.5" />
        <ellipse cx="100" cy="254" rx="10" ry="4" fill={t.surface3} stroke={t.borderLight} strokeWidth="0.5" />
        <ellipse cx="30" cy="142" rx="5" ry="7" fill={t.surface3} stroke={t.borderLight} strokeWidth="0.5" />
        <ellipse cx="130" cy="142" rx="5" ry="7" fill={t.surface3} stroke={t.borderLight} strokeWidth="0.5" />
      </svg>
    </div>
  );
}

// ── TierBadge ─────────────────────────────────────────────
const TIER_STYLES = {
  priority:    { bg: "rgba(34,197,94,0.10)", color: "#22C55E", label: "Priority" },
  supporting:  { bg: "rgba(59,130,246,0.10)", color: "#3B82F6", label: "Supporting" },
  maintenance: { bg: "rgba(148,163,184,0.10)", color: "#94A3B8", label: "Maintenance" },
  excluded:    { bg: "rgba(239,68,68,0.08)", color: "#EF4444", label: "Excluded" },
};

export function TierBadge({ tier }) {
  const s = TIER_STYLES[tier] || TIER_STYLES.maintenance;
  return (
    <span style={{
      fontSize: 9, fontWeight: 600, padding: "2px 6px", borderRadius: 4,
      background: s.bg, color: s.color, textTransform: "uppercase", letterSpacing: "0.03em",
    }}>{s.label}</span>
  );
}

// ── PersonalizationSummary ────────────────────────────────
export function PersonalizationSummary({ config, linkTo }) {
  const t = useTheme();
  if (!config) return null;
  const { experienceLevel, primaryGoal, age, modifiers } = config;

  const expLabel = experienceLevel ? experienceLevel.charAt(0).toUpperCase() + experienceLevel.slice(1) : "";
  const goalLabel = primaryGoal ? primaryGoal.charAt(0).toUpperCase() + primaryGoal.slice(1).replace("_", " ") : "";
  const parts = [expLabel, goalLabel, age ? `${age}y/o` : ""].filter(Boolean);
  const injuryCount = modifiers.injuryExclusions.length;

  return (
    <div style={{
      ...cardStyle(t, { padding: "10px 14px" }),
      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
    }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: t.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {parts.join(" · ")}
        </div>
        {injuryCount > 0 && (
          <div style={{ fontSize: 10, color: t.textFaint, marginTop: 2 }}>
            {injuryCount} injury adjustment{injuryCount > 1 ? "s" : ""} active
          </div>
        )}
      </div>
      {linkTo && (
        <a href={linkTo} style={{ fontSize: 10, color: t.textDim, textDecoration: "none", fontWeight: 500, flexShrink: 0 }}>
          Edit
        </a>
      )}
    </div>
  );
}
