import { useTheme } from "../context/theme.js";
import { PATTERN_COLORS, MUSCLE_COLORS, goalPctColor, calcGoalPcts } from "../utils/helpers.js";

/**
 * Tailwind card classes — use this for new/converted components.
 * Old cardStyle() kept below for backward compat during migration.
 */
export const CARD_CLASS = "bg-surface rounded-lg shadow-card transition-all duration-[250ms]";

/**
 * @deprecated Use CARD_CLASS + Tailwind padding/margin classes instead.
 */
export function cardStyle(t, overrides = {}) {
  return {
    background: t.surface,
    borderRadius: t.radius?.lg ?? 20,
    boxShadow: t.shadow,
    transition: "all 0.25s ease",
    ...overrides,
  };
}

export function MiniBar({ name, sets, max }) {
  const pct = Math.min((sets / Math.max(max, 1)) * 100, 100);
  const color = MUSCLE_COLORS[name] || "#666";
  return (
    <div className="flex items-center gap-2 mb-[5px]">
      <span className="text-xs text-muted w-[90px] text-right overflow-hidden text-ellipsis whitespace-nowrap">{name}</span>
      <div className="flex-1 h-1.5 bg-surface3 rounded-[3px] overflow-hidden">
        <div className="h-full rounded-[3px] transition-[width] duration-[400ms]" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-sm text-dim w-7 text-right">{sets % 1 === 0 ? sets : sets.toFixed(1)}</span>
    </div>
  );
}

export function StatCard({ label, value, sub, color }) {
  return (
    <div className={`${CARD_CLASS} p-[22px]`}>
      <div className="text-sm text-muted tracking-wide mb-2">{label}</div>
      <div className="text-2xl font-bold" style={color ? { color } : undefined}>
        {!color && <span className="text-content">{value}</span>}
        {color && value}
      </div>
      {sub && <div className="text-xs text-dim mt-1">{sub}</div>}
    </div>
  );
}

export function PatternBadge({ pattern, size }) {
  const c = PATTERN_COLORS[pattern]; if (!c) return null;
  const lg = size === "md";
  return (
    <span
      className={`${lg ? "text-xs px-3.5 py-[5px]" : "text-xs px-2.5 py-[3px]"} rounded-pill tracking-wide font-semibold`}
      style={{ background: c.bg, color: c.text }}
    >{pattern}</span>
  );
}

export function GoalRing({ pct, size = 80, strokeWidth = 6, label }) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const capped = Math.min(pct, 100);
  const offset = circ - (capped / 100) * circ;
  const color = goalPctColor(pct);
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--atlas-surface3)" strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s ease" }} />
      </svg>
      <div className="flex flex-col items-center justify-center" style={{ position: "relative", marginTop: -size + 2, height: size - 2 }}>
        <div className="font-bold" style={{ fontSize: size > 60 ? 20 : 14, color }}>{pct}%</div>
      </div>
      {label && <div className="text-xs text-dim tracking-wide mt-0.5">{label}</div>}
    </div>
  );
}

export function MuscleGoalBar({ name, eff, target, compact }) {
  const pct = target > 0 ? Math.round((eff / target) * 100) : 0;
  const barPct = Math.min(pct, 115);
  const color = goalPctColor(pct);
  const mc = MUSCLE_COLORS[name] || "#666";
  return (
    <div className={`flex items-center ${compact ? "gap-1.5 mb-[3px]" : "gap-2 mb-[5px]"}`}>
      <span className={`${compact ? "text-xs w-[75px]" : "text-sm w-[90px]"} text-muted text-right overflow-hidden text-ellipsis whitespace-nowrap`}>{name}</span>
      <div className={`flex-1 ${compact ? "h-[5px]" : "h-2"} bg-surface3 rounded-[4px] overflow-hidden relative`}>
        <div className="h-full rounded-[4px] transition-[width] duration-[400ms]" style={{ width: `${Math.min(barPct, 100)}%`, background: `${mc}90` }} />
        <div className="absolute right-0 top-0 w-0.5 h-full" style={{ background: "var(--atlas-text-faint)", opacity: 0.5 }} />
      </div>
      <span className={`${compact ? "text-xs w-[30px]" : "text-sm w-[34px]"} font-semibold text-right`} style={{ color }}>{pct}%</span>
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
  const visible = alerts ? alerts.slice(0, maxVisible) : [];
  const overflow = alerts ? Math.max(0, alerts.length - maxVisible) : 0;

  if (!alerts || alerts.length === 0) {
    return (
      <div className="flex items-center gap-2 px-3.5 py-3 rounded-[14px] bg-success/[0.07]">
        <span className="text-md">✓</span>
        <span className="text-xs text-success font-semibold">Plan looks balanced</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      {visible.map(alert => {
        const s = ALERT_STYLES[alert.severity] || ALERT_STYLES.info;
        return (
          <div key={alert.id} className="flex items-start gap-2 px-3 py-2.5 rounded-[14px]" style={{ background: s.bg }}>
            <div className="w-1.5 h-1.5 rounded-full mt-[5px] shrink-0" style={{ background: s.dot }} />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold leading-tight mb-0.5" style={{ color: s.color }}>{alert.title}</div>
              <div className="text-xs text-dim leading-snug">{alert.message}</div>
            </div>
          </div>
        );
      })}
      {overflow > 0 && (
        <div className="text-xs text-faint text-center pt-0.5">+{overflow} more</div>
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
    <svg width={width} height={height} className="block">
      <polyline points={fillPoints} fill={color} opacity={fillOpacity} stroke="none" />
      <polyline points={points} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── BarChart ─────────────────────────────────────────────────
export function BarChart({ data = [], width = 300, height = 140, barColor = "#3B82F6" }) {
  if (data.length === 0) return null;
  const maxVal = Math.max(...data.map(d => d.value), 1);
  const barGap = 4;
  const barWidth = Math.max(6, (width - barGap * (data.length - 1)) / data.length);
  return (
    <div>
      <svg width={width} height={height} className="block">
        {data.map((d, i) => {
          const barH = (d.value / maxVal) * (height - 20);
          const x = i * (barWidth + barGap);
          const y = height - 20 - barH;
          return (
            <g key={i}>
              <rect x={x} y={y} width={barWidth} height={barH} rx={6} fill={d.color || barColor} opacity={0.85} />
              <text x={x + barWidth / 2} y={height - 4} textAnchor="middle" fontSize={9} fontFamily="'Outfit', sans-serif" fill="var(--atlas-text-faint)">
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
    <svg width={width} height={height} className="block">
      {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
        const y = pad.top + ch - frac * ch;
        return <line key={frac} x1={pad.left} y1={y} x2={width - pad.right} y2={y} stroke="var(--atlas-surface3)" strokeWidth={0.5} />;
      })}
      <path d={linePath} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {showDots && points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill={color} />
      ))}
      {[0, Math.floor(points.length / 2), points.length - 1].map(idx => {
        const p = points[idx];
        if (!p) return null;
        return <text key={idx} x={p.x} y={height - 4} textAnchor="middle" fontSize={9} fontFamily="'Outfit', sans-serif" fill="var(--atlas-text-faint)">{p.label}</text>;
      })}
      {yLabel && <text x={4} y={pad.top + ch / 2} textAnchor="start" fontSize={9} fontFamily="'Outfit', sans-serif" fill="var(--atlas-text-faint)" transform={`rotate(-90,4,${pad.top + ch / 2})`}>{yLabel}</text>}
    </svg>
  );
}

// ── Tabs ─────────────────────────────────────────────────────
export function Tabs({ items = [], active, onChange }) {
  return (
    <div className="inline-flex gap-1 bg-surface2 rounded-md p-1 mb-6">
      {items.map(item => {
        const isActive = item.key === active;
        return (
          <button key={item.key} onClick={() => onChange(item.key)}
            className={`text-body px-5 py-2 rounded-sm border-none cursor-pointer transition-all duration-200
              ${isActive ? "bg-surface text-content font-semibold shadow-card" : "bg-transparent text-dim font-normal"}`}
          >{item.label}</button>
        );
      })}
    </div>
  );
}

// ── EmptyState ───────────────────────────────────────────────
export function EmptyState({ icon = "📭", title = "No data yet", message = "" }) {
  return (
    <div className="text-center py-12 px-6">
      <div className="text-[40px] mb-3">{icon}</div>
      <div className="text-lg font-bold text-content mb-1.5">{title}</div>
      {message && <div className="text-body text-dim max-w-xs mx-auto">{message}</div>}
    </div>
  );
}

// ── SectionLabel ─────────────────────────────────────────────
export function SectionLabel({ children }) {
  return (
    <div className="text-body font-semibold text-muted mb-3.5">{children}</div>
  );
}

export function MuscleDiagram({ muscleVol, size = 160 }) {
  const goals = calcGoalPcts(muscleVol);

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

  const getRegionColor = (region) => {
    const pct = regionAvg[region] || 0;
    const c = goalPctColor(pct);
    const alpha = Math.max(0.15, Math.min(pct / 100, 1));
    return { fill: c, opacity: alpha };
  };

  const s3 = "var(--atlas-surface3)";
  const bl = "var(--atlas-border-light)";

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size * 1.65} viewBox="0 0 160 264" fill="none">
        <ellipse cx="80" cy="18" rx="12" ry="14" fill={s3} stroke={bl} strokeWidth="0.8" />
        <rect x="74" y="30" width="12" height="8" rx="3" fill={s3} stroke={bl} strokeWidth="0.5" />
        <path d="M62 38 L74 34 L80 38 L86 34 L98 38 L95 48 L65 48 Z"
          fill={getRegionColor("traps").fill} opacity={getRegionColor("traps").opacity} stroke={bl} strokeWidth="0.5" />
        <ellipse cx="50" cy="52" rx="14" ry="10"
          fill={getRegionColor("shoulders").fill} opacity={getRegionColor("shoulders").opacity} stroke={bl} strokeWidth="0.5" />
        <ellipse cx="110" cy="52" rx="14" ry="10"
          fill={getRegionColor("shoulders").fill} opacity={getRegionColor("shoulders").opacity} stroke={bl} strokeWidth="0.5" />
        <path d="M62 46 Q80 42 98 46 L98 70 Q80 76 62 70 Z"
          fill={getRegionColor("chest").fill} opacity={getRegionColor("chest").opacity} stroke={bl} strokeWidth="0.5" />
        <path d="M44 60 Q38 80 36 100 Q42 102 48 100 Q46 80 50 60 Z"
          fill={getRegionColor("arms").fill} opacity={getRegionColor("arms").opacity} stroke={bl} strokeWidth="0.5" />
        <path d="M116 60 Q122 80 124 100 Q118 102 112 100 Q114 80 110 60 Z"
          fill={getRegionColor("arms").fill} opacity={getRegionColor("arms").opacity} stroke={bl} strokeWidth="0.5" />
        <path d="M36 100 Q32 120 30 136 Q36 138 40 136 Q40 120 44 100 Z"
          fill={getRegionColor("forearms").fill} opacity={getRegionColor("forearms").opacity} stroke={bl} strokeWidth="0.5" />
        <path d="M124 100 Q128 120 130 136 Q124 138 120 136 Q120 120 116 100 Z"
          fill={getRegionColor("forearms").fill} opacity={getRegionColor("forearms").opacity} stroke={bl} strokeWidth="0.5" />
        <path d="M66 70 Q80 76 94 70 L92 120 Q80 124 68 120 Z"
          fill={getRegionColor("core").fill} opacity={getRegionColor("core").opacity} stroke={bl} strokeWidth="0.5" />
        <path d="M56 50 L62 46 L62 70 L58 72 Q54 62 56 50 Z"
          fill={getRegionColor("back").fill} opacity={getRegionColor("back").opacity} stroke={bl} strokeWidth="0.5" />
        <path d="M104 50 L98 46 L98 70 L102 72 Q106 62 104 50 Z"
          fill={getRegionColor("back").fill} opacity={getRegionColor("back").opacity} stroke={bl} strokeWidth="0.5" />
        <path d="M64 120 Q80 126 96 120 L98 140 Q80 146 62 140 Z"
          fill={getRegionColor("glutes").fill} opacity={getRegionColor("glutes").opacity} stroke={bl} strokeWidth="0.5" />
        <path d="M62 140 Q58 170 56 200 Q66 204 72 200 Q72 170 74 140 Z"
          fill={getRegionColor("quads").fill} opacity={getRegionColor("quads").opacity} stroke={bl} strokeWidth="0.5" />
        <path d="M98 140 Q102 170 104 200 Q94 204 88 200 Q88 170 86 140 Z"
          fill={getRegionColor("quads").fill} opacity={getRegionColor("quads").opacity} stroke={bl} strokeWidth="0.5" />
        <path d="M56 200 Q54 186 58 172 Q62 170 62 186 Q60 200 56 200 Z"
          fill={getRegionColor("hamstrings").fill} opacity={getRegionColor("hamstrings").opacity} stroke={bl} strokeWidth="0.3" />
        <path d="M104 200 Q106 186 102 172 Q98 170 98 186 Q100 200 104 200 Z"
          fill={getRegionColor("hamstrings").fill} opacity={getRegionColor("hamstrings").opacity} stroke={bl} strokeWidth="0.3" />
        <path d="M58 204 Q56 224 54 244 Q62 248 66 244 Q66 224 68 204 Z"
          fill={getRegionColor("calves").fill} opacity={getRegionColor("calves").opacity} stroke={bl} strokeWidth="0.5" />
        <path d="M102 204 Q104 224 106 244 Q98 248 94 244 Q94 224 92 204 Z"
          fill={getRegionColor("calves").fill} opacity={getRegionColor("calves").opacity} stroke={bl} strokeWidth="0.5" />
        <ellipse cx="60" cy="254" rx="10" ry="4" fill={s3} stroke={bl} strokeWidth="0.5" />
        <ellipse cx="100" cy="254" rx="10" ry="4" fill={s3} stroke={bl} strokeWidth="0.5" />
        <ellipse cx="30" cy="142" rx="5" ry="7" fill={s3} stroke={bl} strokeWidth="0.5" />
        <ellipse cx="130" cy="142" rx="5" ry="7" fill={s3} stroke={bl} strokeWidth="0.5" />
      </svg>
    </div>
  );
}
