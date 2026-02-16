import { useTheme } from "../context/theme.js";
import { PATTERN_COLORS, MUSCLE_COLORS, goalPctColor, calcGoalPcts } from "../utils/helpers.js";

export function MiniBar({ name, sets, max }) {
  const t = useTheme();
  const pct = Math.min((sets / Math.max(max, 1)) * 100, 100);
  const color = MUSCLE_COLORS[name] || "#666";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
      <span style={{ fontSize: 11, color: t.textMuted, width: 90, textAlign: "right", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</span>
      <div style={{ flex: 1, height: 6, background: t.border, borderRadius: 3, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 3, transition: "width 0.4s" }} />
      </div>
      <span style={{ fontSize: 10, fontFamily: "mono", color: t.textDim, width: 28, textAlign: "right" }}>{sets % 1 === 0 ? sets : sets.toFixed(1)}</span>
    </div>
  );
}

export function StatCard({ label, value, sub, color }) {
  const t = useTheme();
  return (
    <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 16 }}>
      <div style={{ fontSize: 11, color: t.textFaint, fontFamily: "mono", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 26, fontFamily: "mono", fontWeight: 700, color: color || t.text }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: t.textDim, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

export function PatternBadge({ pattern, size }) {
  const c = PATTERN_COLORS[pattern]; if (!c) return null;
  const lg = size === "md";
  return (
    <span style={{
      fontSize: lg ? 12 : 10, fontFamily: "mono", padding: lg ? "4px 12px" : "2px 8px",
      borderRadius: 8, background: c.bg, border: `1px solid ${c.border}`, color: c.text,
      textTransform: "uppercase", letterSpacing: 1, fontWeight: 600,
    }}>{pattern}</span>
  );
}

export function GoalRing({ pct, size = 80, strokeWidth = 6, label }) {
  const t = useTheme();
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const capped = Math.min(pct, 100);
  const offset = circ - (capped / 100) * circ;
  const color = goalPctColor(pct);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={t.border} strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s ease" }} />
      </svg>
      <div style={{ position: "relative", marginTop: -size + 2, height: size - 2, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: size > 60 ? 20 : 14, fontFamily: "mono", fontWeight: 700, color }}>{pct}%</div>
      </div>
      {label && <div style={{ fontSize: 9, fontFamily: "mono", color: t.textFaint, textTransform: "uppercase", letterSpacing: 1, marginTop: 2 }}>{label}</div>}
    </div>
  );
}

export function MuscleGoalBar({ name, eff, target, compact }) {
  const t = useTheme();
  const pct = target > 0 ? Math.round((eff / target) * 100) : 0;
  const barPct = Math.min(pct, 115);
  const color = goalPctColor(pct);
  const mc = MUSCLE_COLORS[name] || "#666";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: compact ? 6 : 8, marginBottom: compact ? 3 : 5 }}>
      <span style={{ fontSize: compact ? 10 : 11, color: t.textMuted, width: compact ? 75 : 90, textAlign: "right", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</span>
      <div style={{ flex: 1, height: compact ? 5 : 8, background: t.border, borderRadius: 4, overflow: "hidden", position: "relative" }}>
        <div style={{ width: `${Math.min(barPct, 100)}%`, height: "100%", background: `${mc}90`, borderRadius: 4, transition: "width 0.4s" }} />
        {/* MAV target marker */}
        <div style={{ position: "absolute", right: 0, top: 0, width: 2, height: "100%", background: `${t.textFaint}80` }} />
      </div>
      <span style={{ fontSize: compact ? 9 : 10, fontFamily: "mono", fontWeight: 600, color, width: compact ? 30 : 34, textAlign: "right" }}>{pct}%</span>
    </div>
  );
}

export function MuscleDiagram({ muscleVol, size = 160 }) {
  const t = useTheme();
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

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <svg width={size} height={size * 1.65} viewBox="0 0 160 264" fill="none">
        {/* Head */}
        <ellipse cx="80" cy="18" rx="12" ry="14" fill={t.surface3} stroke={t.borderLight} strokeWidth="0.8" />
        {/* Neck */}
        <rect x="74" y="30" width="12" height="8" rx="3" fill={t.surface3} stroke={t.borderLight} strokeWidth="0.5" />
        {/* Traps */}
        <path d="M62 38 L74 34 L80 38 L86 34 L98 38 L95 48 L65 48 Z"
          fill={getRegionColor("traps").fill} opacity={getRegionColor("traps").opacity} stroke={t.borderLight} strokeWidth="0.5" />
        {/* Shoulders */}
        <ellipse cx="50" cy="52" rx="14" ry="10"
          fill={getRegionColor("shoulders").fill} opacity={getRegionColor("shoulders").opacity} stroke={t.borderLight} strokeWidth="0.5" />
        <ellipse cx="110" cy="52" rx="14" ry="10"
          fill={getRegionColor("shoulders").fill} opacity={getRegionColor("shoulders").opacity} stroke={t.borderLight} strokeWidth="0.5" />
        {/* Chest */}
        <path d="M62 46 Q80 42 98 46 L98 70 Q80 76 62 70 Z"
          fill={getRegionColor("chest").fill} opacity={getRegionColor("chest").opacity} stroke={t.borderLight} strokeWidth="0.5" />
        {/* Upper arms */}
        <path d="M44 60 Q38 80 36 100 Q42 102 48 100 Q46 80 50 60 Z"
          fill={getRegionColor("arms").fill} opacity={getRegionColor("arms").opacity} stroke={t.borderLight} strokeWidth="0.5" />
        <path d="M116 60 Q122 80 124 100 Q118 102 112 100 Q114 80 110 60 Z"
          fill={getRegionColor("arms").fill} opacity={getRegionColor("arms").opacity} stroke={t.borderLight} strokeWidth="0.5" />
        {/* Forearms */}
        <path d="M36 100 Q32 120 30 136 Q36 138 40 136 Q40 120 44 100 Z"
          fill={getRegionColor("forearms").fill} opacity={getRegionColor("forearms").opacity} stroke={t.borderLight} strokeWidth="0.5" />
        <path d="M124 100 Q128 120 130 136 Q124 138 120 136 Q120 120 116 100 Z"
          fill={getRegionColor("forearms").fill} opacity={getRegionColor("forearms").opacity} stroke={t.borderLight} strokeWidth="0.5" />
        {/* Core */}
        <path d="M66 70 Q80 76 94 70 L92 120 Q80 124 68 120 Z"
          fill={getRegionColor("core").fill} opacity={getRegionColor("core").opacity} stroke={t.borderLight} strokeWidth="0.5" />
        {/* Back (side hints) */}
        <path d="M56 50 L62 46 L62 70 L58 72 Q54 62 56 50 Z"
          fill={getRegionColor("back").fill} opacity={getRegionColor("back").opacity} stroke={t.borderLight} strokeWidth="0.5" />
        <path d="M104 50 L98 46 L98 70 L102 72 Q106 62 104 50 Z"
          fill={getRegionColor("back").fill} opacity={getRegionColor("back").opacity} stroke={t.borderLight} strokeWidth="0.5" />
        {/* Glutes */}
        <path d="M64 120 Q80 126 96 120 L98 140 Q80 146 62 140 Z"
          fill={getRegionColor("glutes").fill} opacity={getRegionColor("glutes").opacity} stroke={t.borderLight} strokeWidth="0.5" />
        {/* Quads */}
        <path d="M62 140 Q58 170 56 200 Q66 204 72 200 Q72 170 74 140 Z"
          fill={getRegionColor("quads").fill} opacity={getRegionColor("quads").opacity} stroke={t.borderLight} strokeWidth="0.5" />
        <path d="M98 140 Q102 170 104 200 Q94 204 88 200 Q88 170 86 140 Z"
          fill={getRegionColor("quads").fill} opacity={getRegionColor("quads").opacity} stroke={t.borderLight} strokeWidth="0.5" />
        {/* Hamstrings */}
        <path d="M56 200 Q54 186 58 172 Q62 170 62 186 Q60 200 56 200 Z"
          fill={getRegionColor("hamstrings").fill} opacity={getRegionColor("hamstrings").opacity} stroke={t.borderLight} strokeWidth="0.3" />
        <path d="M104 200 Q106 186 102 172 Q98 170 98 186 Q100 200 104 200 Z"
          fill={getRegionColor("hamstrings").fill} opacity={getRegionColor("hamstrings").opacity} stroke={t.borderLight} strokeWidth="0.3" />
        {/* Calves */}
        <path d="M58 204 Q56 224 54 244 Q62 248 66 244 Q66 224 68 204 Z"
          fill={getRegionColor("calves").fill} opacity={getRegionColor("calves").opacity} stroke={t.borderLight} strokeWidth="0.5" />
        <path d="M102 204 Q104 224 106 244 Q98 248 94 244 Q94 224 92 204 Z"
          fill={getRegionColor("calves").fill} opacity={getRegionColor("calves").opacity} stroke={t.borderLight} strokeWidth="0.5" />
        {/* Feet */}
        <ellipse cx="60" cy="254" rx="10" ry="4" fill={t.surface3} stroke={t.borderLight} strokeWidth="0.5" />
        <ellipse cx="100" cy="254" rx="10" ry="4" fill={t.surface3} stroke={t.borderLight} strokeWidth="0.5" />
        {/* Hands */}
        <ellipse cx="30" cy="142" rx="5" ry="7" fill={t.surface3} stroke={t.borderLight} strokeWidth="0.5" />
        <ellipse cx="130" cy="142" rx="5" ry="7" fill={t.surface3} stroke={t.borderLight} strokeWidth="0.5" />
      </svg>
    </div>
  );
}
