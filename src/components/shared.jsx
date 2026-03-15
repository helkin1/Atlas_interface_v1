import { useState } from "react";
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

  const getMuscleStyle = (muscleNames) => {
    const pcts = muscleNames.filter((m) => goals[m]).map((m) => goals[m].pct);
    if (!pcts.length) return { fill: t.surface3, opacity: 0.3 };
    if (config && muscleNames.some((m) => goals[m]?.tier === "excluded")) {
      return { fill: t.textFaint, opacity: 0.15 };
    }
    const avg = Math.round(pcts.reduce((s, p) => s + p, 0) / pcts.length);
    return {
      fill: goalPctColor(avg),
      opacity: Math.max(0.2, Math.min(avg / 100, 1)),
    };
  };

  const stroke = t.borderLight;
  const sw = "0.5";
  const neutral = { fill: t.surface3, stroke, strokeWidth: sw };

  /* ── Front-view muscle regions ─────────────────────────── */
  const frontRegions = [
    { muscles: ["Traps"], paths: [
      "M90,48 C86,50 76,54 68,58 L62,62 L66,66 L80,58 L90,52 Z",
      "M110,48 C114,50 124,54 132,58 L138,62 L134,66 L120,58 L110,52 Z",
    ]},
    { muscles: ["Front Delts", "Side Delts"], paths: [
      "M62,58 C54,52 42,50 34,58 C28,66 32,76 42,80 L52,74 L60,66 Z",
      "M138,58 C146,52 158,50 166,58 C172,66 168,76 158,80 L148,74 L140,66 Z",
    ]},
    { muscles: ["Chest", "Upper Chest"], paths: [
      "M62,66 L96,60 Q99,62 99,68 L97,84 C93,92 80,94 66,90 L58,84 C56,76 58,70 62,66 Z",
      "M138,66 L104,60 Q101,62 101,68 L103,84 C107,92 120,94 134,90 L142,84 C144,76 142,70 138,66 Z",
    ]},
    { muscles: ["Biceps", "Brachialis"], paths: [
      "M42,80 L52,76 C56,84 54,100 52,112 L46,118 L36,116 C30,108 32,92 38,82 Z",
      "M158,80 L148,76 C144,84 146,100 148,112 L154,118 L164,116 C170,108 168,92 162,82 Z",
    ]},
    { muscles: ["Forearms"], paths: [
      "M36,120 L48,120 C52,130 50,146 46,162 L40,174 L32,172 C28,162 30,148 34,132 Z",
      "M164,120 L152,120 C148,130 150,146 154,162 L160,174 L168,172 C172,162 170,148 166,132 Z",
    ]},
    { muscles: ["Core"], paths: [
      "M78,92 L122,92 C126,100 126,114 124,134 L120,148 L80,148 L76,134 C74,114 74,100 78,92 Z",
    ]},
    { muscles: ["Obliques"], paths: [
      "M64,90 L76,92 C74,108 74,128 76,140 L78,148 L70,154 L62,148 C56,132 58,112 62,96 Z",
      "M136,90 L124,92 C126,108 126,128 124,140 L122,148 L130,154 L138,148 C144,132 142,112 138,96 Z",
    ]},
    { muscles: ["Quads", "Hip Flexors", "Adductors"], paths: [
      "M64,158 L94,158 C98,168 98,186 96,218 L94,242 C92,254 88,262 82,266 L72,266 C66,260 62,248 58,228 C56,202 56,178 60,164 Z",
      "M136,158 L106,158 C102,168 102,186 104,218 L106,242 C108,254 112,262 118,266 L128,266 C134,260 138,248 142,228 C144,202 144,178 140,164 Z",
    ]},
    { muscles: ["Calves"], paths: [
      "M62,274 L86,274 C92,284 90,300 88,316 C86,326 82,334 76,338 L70,338 C64,334 60,326 58,316 C56,300 56,284 62,274 Z",
      "M138,274 L114,274 C108,284 110,300 112,316 C114,326 118,334 124,338 L130,338 C136,334 140,326 142,316 C144,300 144,284 138,274 Z",
    ]},
  ];

  /* ── Back-view muscle regions ──────────────────────────── */
  const backRegions = [
    { muscles: ["Traps"], paths: [
      "M90,48 C84,50 74,56 66,62 L60,66 L66,70 L82,60 L90,52 Z",
      "M110,48 C116,50 126,56 134,62 L140,66 L134,70 L118,60 L110,52 Z",
      "M92,52 L100,60 L108,52 L108,72 L100,80 L92,72 Z",
    ]},
    { muscles: ["Rear Delts", "Rotator Cuff"], paths: [
      "M62,60 C54,54 42,52 34,60 C28,68 32,78 42,82 L52,76 L60,68 Z",
      "M138,60 C146,54 158,52 166,60 C172,68 168,78 158,82 L148,76 L140,68 Z",
    ]},
    { muscles: ["Upper Back"], paths: [
      "M80,70 L100,80 L120,70 L122,92 L100,102 L78,92 Z",
    ]},
    { muscles: ["Lats"], paths: [
      "M60,90 L76,90 C78,104 78,120 76,136 L70,148 L60,148 C54,136 54,118 56,100 Z",
      "M140,90 L124,90 C122,104 122,120 124,136 L130,148 L140,148 C146,136 146,118 144,100 Z",
    ]},
    { muscles: ["Triceps"], paths: [
      "M42,82 L52,78 C56,88 54,104 52,116 L46,120 L36,118 C30,110 32,94 38,84 Z",
      "M158,82 L148,78 C144,88 146,104 148,116 L154,120 L164,118 C170,110 168,94 162,84 Z",
    ]},
    { muscles: ["Forearms"], paths: [
      "M36,122 L48,122 C52,132 50,148 46,164 L40,176 L32,174 C28,164 30,150 34,134 Z",
      "M164,122 L152,122 C148,132 150,148 154,164 L160,176 L168,174 C172,164 170,150 166,134 Z",
    ]},
    { muscles: ["Lower Back"], paths: [
      "M78,130 L122,130 L126,146 L124,158 L100,166 L76,158 L74,146 Z",
    ]},
    { muscles: ["Glutes"], paths: [
      "M64,160 L96,160 C100,170 98,184 92,196 L78,200 C66,196 60,184 58,172 C58,166 60,162 64,160 Z",
      "M136,160 L104,160 C100,170 102,184 108,196 L122,200 C134,196 140,184 142,172 C142,166 140,162 136,160 Z",
    ]},
    { muscles: ["Hamstrings"], paths: [
      "M64,204 L90,204 C94,216 94,234 92,254 C90,266 86,274 80,278 L72,278 C66,272 62,260 58,242 C56,222 58,210 64,204 Z",
      "M136,204 L110,204 C106,216 106,234 108,254 C110,266 114,274 120,278 L128,278 C134,272 138,260 142,242 C144,222 142,210 136,204 Z",
    ]},
    { muscles: ["Calves"], paths: [
      "M62,286 L86,286 C92,296 90,312 88,328 C86,338 82,346 76,350 L70,350 C64,346 60,338 58,328 C56,312 56,296 62,286 Z",
      "M138,286 L114,286 C108,296 110,312 112,328 C114,338 118,346 124,350 L130,350 C136,346 140,338 142,328 C144,312 144,296 138,286 Z",
    ]},
  ];

  const regions = view === "front" ? frontRegions : backRegions;
  const vbHeight = view === "front" ? 350 : 360;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <svg
        width={size}
        height={size * (vbHeight / 200)}
        viewBox={`0 0 200 ${vbHeight}`}
        fill="none"
      >
        {/* ── Neutral body parts ──────────────────────────── */}
        <ellipse cx="100" cy="24" rx="14" ry="16" {...neutral} />
        <path d="M89,40 Q87,44 89,48 L111,48 Q113,44 111,40 Z" {...neutral} />
        <ellipse cx="36" cy="180" rx="5" ry="7" {...neutral} />
        <ellipse cx="164" cy="180" rx="5" ry="7" {...neutral} />
        <ellipse cx="76" cy="270" rx="9" ry="5" {...neutral} />
        <ellipse cx="124" cy="270" rx="9" ry="5" {...neutral} />
        <ellipse cx="74" cy={vbHeight - 6} rx="9" ry="4" {...neutral} />
        <ellipse cx="126" cy={vbHeight - 6} rx="9" ry="4" {...neutral} />

        {/* ── Muscle regions ──────────────────────────────── */}
        {regions.map((region, i) => {
          const s = getMuscleStyle(region.muscles);
          return region.paths.map((d, j) => (
            <path
              key={`${view}-${i}-${j}`}
              d={d}
              fill={s.fill}
              opacity={s.opacity}
              stroke={stroke}
              strokeWidth={sw}
            />
          ));
        })}
      </svg>

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
