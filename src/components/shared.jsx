import { useState } from "react";
import { useTheme } from "../context/theme.js";
import { PATTERN_COLORS, MUSCLE_COLORS, goalPctColor, calcGoalPcts, calcPersonalizedGoalPcts } from "../utils/helpers.js";
import Body from "react-muscle-highlighter";

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

export function GoalRing({ pct, size = 80, strokeWidth = 6, label, sublabel, goalBreakdown, readinessBreakdown }) {
  const t = useTheme();
  const [showBreakdown, setShowBreakdown] = useState(false);
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const capped = Math.min(pct, 100);
  const offset = circ - (capped / 100) * circ;
  const ringColor = pct >= 70 ? "#22C55E" : pct >= 40 ? "#F59E0B" : "#EF4444";
  const hasBreakdown = goalBreakdown || readinessBreakdown;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, position: "relative" }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)", display: "block" }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={t.surface3} strokeWidth={strokeWidth} />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={ringColor} strokeWidth={strokeWidth}
            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.5s ease" }} />
        </svg>
        <div style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <div style={{ fontSize: size > 60 ? 18 : 14, fontWeight: 600, color: ringColor }}>{pct}%</div>
        </div>
      </div>
      {label && (
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          marginTop: 4,
        }}>
          <div style={{
            fontSize: 11,
            color: t.textDim,
            fontWeight: 500,
          }}>
            {label}
          </div>
          {hasBreakdown && (
            <button
              onClick={(e) => { e.stopPropagation(); setShowBreakdown(!showBreakdown); }}
              style={{
                width: 14, height: 14, borderRadius: "50%",
                border: `1px solid ${t.border}`, background: t.surface2,
                color: t.textDim, fontSize: 9, fontWeight: 700,
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                padding: 0, lineHeight: 1,
              }}
              aria-label="Score breakdown"
            >
              ?
            </button>
          )}
        </div>
      )}
      {showBreakdown && hasBreakdown && (
        <>
          <div onClick={() => setShowBreakdown(false)} style={{ position: "fixed", inset: 0, zIndex: 199 }} />
          <div style={{
            position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)",
            marginTop: 8, zIndex: 200,
            background: t.surface, borderRadius: 10, padding: 12,
            minWidth: 220, maxWidth: 280,
            boxShadow: t.shadowLg, border: `1px solid ${t.border}`,
            maxHeight: 300, overflowY: "auto",
          }}>
            {readinessBreakdown ? (
              <>
                <div style={{ fontSize: 11, fontWeight: 600, color: t.text, marginBottom: 8 }}>
                  Readiness Breakdown
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {[
                    { key: "executionConsistency", name: "Execution", weight: "50%" },
                    { key: "planQuality", name: "Plan Quality", weight: "30%" },
                    { key: "progressionTrend", name: "Progression", weight: "20%" },
                  ].map(({ key, name, weight }) => {
                    const val = readinessBreakdown[key] ?? 0;
                    const barColor = val >= 70 ? "#22C55E" : val >= 40 ? "#F59E0B" : "#EF4444";
                    return (
                      <div key={key}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                          <span style={{ fontSize: 10, color: t.textMuted, fontWeight: 500 }}>{name}</span>
                          <span style={{ fontSize: 10, color: t.textFaint }}>{weight}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ flex: 1, height: 4, background: t.surface3, borderRadius: 2, overflow: "hidden" }}>
                            <div style={{ width: `${Math.min(val, 100)}%`, height: "100%", background: barColor, borderRadius: 2 }} />
                          </div>
                          <span style={{ fontSize: 10, fontWeight: 600, color: barColor, width: 28, textAlign: "right" }}>{val}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 11, fontWeight: 600, color: t.text, marginBottom: 8 }}>
                  Plan Score Breakdown
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {goalBreakdown.map(({ name, pct: mPct, tier }) => {
                    const barColor = mPct >= 80 ? "#22C55E" : mPct >= 50 ? "#F59E0B" : "#EF4444";
                    return (
                      <div key={name} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{
                          fontSize: 10, color: tier === "priority" ? "#22C55E" : t.textMuted,
                          fontWeight: tier === "priority" ? 600 : 400,
                          width: 65, textAlign: "right", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>{name}</span>
                        <div style={{ flex: 1, height: 3, background: t.surface3, borderRadius: 2, overflow: "hidden" }}>
                          <div style={{ width: `${Math.min(mPct, 100)}%`, height: "100%", background: barColor, borderRadius: 2 }} />
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 600, color: barColor, width: 28, textAlign: "right" }}>{mPct}%</span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </>
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
  const [view, setView] = useState("front");
  const t = useTheme();
  const goals = config
    ? calcPersonalizedGoalPcts(muscleVol, config)
    : calcGoalPcts(muscleVol);

  /* ── Map Atlas muscle names → library slugs ────────────── */
  const SLUG_MAP = {
    chest:       ["Chest", "Upper Chest"],
    deltoids:    ["Front Delts", "Side Delts", "Rear Delts"],
    biceps:      ["Biceps", "Brachialis"],
    triceps:     ["Triceps"],
    forearm:     ["Forearms"],
    abs:         ["Core"],
    obliques:    ["Obliques"],
    trapezius:   ["Traps"],
    "upper-back":["Upper Back", "Lats"],
    "lower-back":["Lower Back"],
    gluteal:     ["Glutes"],
    quadriceps:  ["Quads", "Hip Flexors"],
    hamstring:   ["Hamstrings"],
    adductors:   ["Adductors"],
    calves:      ["Calves"],
  };

  /* ── Build the data array for the Body component ───────── */
  const excluded = [];
  const bodyData = Object.entries(SLUG_MAP).map(([slug, muscles]) => {
    const pcts = muscles.filter((m) => goals[m]).map((m) => goals[m].pct);
    if (!pcts.length) return { slug, styles: { fill: t.surface3 } };

    const isExcluded = config && muscles.some((m) => goals[m]?.tier === "excluded");
    if (isExcluded) {
      excluded.push(slug);
      return null;
    }

    const avg = Math.round(pcts.reduce((s, p) => s + p, 0) / pcts.length);
    const color = goalPctColor(avg);
    const opacity = Math.max(0.25, Math.min(avg / 100, 1));

    return { slug, styles: { fill: color, opacity } };
  }).filter(Boolean);

  const scale = size / 160;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Body
        data={bodyData}
        side={view}
        gender="male"
        scale={scale}
        border={t.borderLight}
        defaultFill={t.surface3}
        disabledParts={excluded}
      />

      {/* ── View toggle ───────────────────────────────────── */}
      <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
        {["front", "back"].map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            style={{
              padding: "3px 10px",
              fontSize: 11,
              borderRadius: 6,
              border: `1px solid ${view === v ? t.accent : t.borderLight}`,
              background: view === v ? t.accent + "18" : "transparent",
              color: view === v ? t.accent : t.textMuted,
              cursor: "pointer",
              textTransform: "capitalize",
              fontWeight: view === v ? 600 : 400,
            }}
          >
            {v}
          </button>
        ))}
      </div>
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
