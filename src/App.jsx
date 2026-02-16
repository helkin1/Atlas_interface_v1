import { useState, useMemo, createContext, useContext } from "react";
import { EXERCISES, EXERCISE_DATABASE, VOLUME_LANDMARKS, EXERCISE_DEFAULTS, getExDefault } from "./data/exercise-data.js";

// ============================================================
// THEME SYSTEM
// ============================================================

const themes = {
  dark: {
    bg: "#08090C",
    surface: "#11141A",
    surface2: "#151921",
    surface3: "#1C2230",
    border: "#1A1E28",
    borderLight: "#2A3040",
    borderAccent: "#3A4560",
    text: "#E8ECF2",
    textMuted: "#8892A4",
    textDim: "#5A6478",
    textFaint: "#3A4560",
    modalOverlay: "rgba(0,0,0,0.7)",
    cardHover: "#1A1E28",
  },
  light: {
    bg: "#F5F6F8",
    surface: "#FFFFFF",
    surface2: "#F0F1F4",
    surface3: "#E8E9ED",
    border: "#E0E2E8",
    borderLight: "#D0D3DA",
    borderAccent: "#B0B5C0",
    text: "#1A1D24",
    textMuted: "#5A6070",
    textDim: "#7A8090",
    textFaint: "#A0A8B8",
    modalOverlay: "rgba(0,0,0,0.35)",
    cardHover: "#F0F1F4",
  },
};

const ThemeContext = createContext(themes.dark);
function useTheme() { return useContext(ThemeContext); }

const PlanDataContext = createContext([]);
function usePlanData() { return useContext(PlanDataContext); }

function summarizeSets(entry) {
  const sd = entry.setDetails || [];
  if (!sd.length) return { count: 0, repsRange: "0", weightRange: "0" };
  const reps = sd.map(s => s.reps), weights = sd.map(s => s.weight);
  const minR = Math.min(...reps), maxR = Math.max(...reps);
  const minW = Math.min(...weights), maxW = Math.max(...weights);
  return { count: sd.length, repsRange: minR === maxR ? `${minR}` : `${minR}-${maxR}`, weightRange: minW === maxW ? (minW === 0 ? "BW" : `${minW}`) : `${minW}-${maxW}` };
}

// ============================================================
// SPLIT PRESETS
// ============================================================

const SPLIT_PRESETS = {
  ppl: { name: "Push / Pull / Legs", shortName: "PPL", description: "Classic 6-day split. Each muscle group hit 2×/week.", daysPerWeek: 6, tags: ["hypertrophy", "intermediate", "6-day"],
    weekTemplate: [
      { label: "Push A", exercises: ["barbell_bench_press", "overhead_press", "incline_db_press", "cable_lateral_raise", "tricep_pushdown"] },
      { label: "Pull A", exercises: ["barbell_row", "pull_up", "seated_cable_row", "face_pull", "barbell_curl"] },
      { label: "Legs A", exercises: ["barbell_back_squat", "romanian_deadlift", "leg_press", "leg_curl", "calf_raise"] },
      { label: "Rest", exercises: [] },
      { label: "Push B", exercises: ["dips", "incline_db_press", "dumbbell_fly", "cable_lateral_raise", "overhead_tri_ext"] },
      { label: "Pull B", exercises: ["lat_pulldown", "barbell_row", "reverse_fly", "face_pull", "hammer_curl"] },
      { label: "Legs B", exercises: ["romanian_deadlift", "bulgarian_split_squat", "hip_thrust", "leg_extension", "calf_raise"] },
    ],
  },
  upper_lower: { name: "Upper / Lower", shortName: "U/L", description: "4-day split alternating upper and lower body.", daysPerWeek: 4, tags: ["hypertrophy", "beginner-intermediate", "4-day"],
    weekTemplate: [
      { label: "Upper A", exercises: ["barbell_bench_press", "barbell_row", "overhead_press", "lat_pulldown", "cable_lateral_raise", "barbell_curl", "tricep_pushdown"] },
      { label: "Lower A", exercises: ["barbell_back_squat", "romanian_deadlift", "leg_press", "leg_curl", "calf_raise"] },
      { label: "Rest", exercises: [] },
      { label: "Upper B", exercises: ["incline_db_press", "seated_cable_row", "dips", "face_pull", "reverse_fly", "hammer_curl", "overhead_tri_ext"] },
      { label: "Lower B", exercises: ["romanian_deadlift", "bulgarian_split_squat", "hip_thrust", "leg_extension", "calf_raise"] },
      { label: "Rest", exercises: [] },
      { label: "Rest", exercises: [] },
    ],
  },
  full_body: { name: "Full Body", shortName: "FB", description: "3-day full body. High frequency, ideal for beginners.", daysPerWeek: 3, tags: ["hypertrophy", "beginner", "3-day"],
    weekTemplate: [
      { label: "Full Body A", exercises: ["barbell_back_squat", "barbell_bench_press", "barbell_row", "overhead_press", "barbell_curl", "calf_raise"] },
      { label: "Rest", exercises: [] },
      { label: "Full Body B", exercises: ["romanian_deadlift", "incline_db_press", "lat_pulldown", "cable_lateral_raise", "hammer_curl", "leg_curl"] },
      { label: "Rest", exercises: [] },
      { label: "Full Body C", exercises: ["bulgarian_split_squat", "dips", "seated_cable_row", "face_pull", "tricep_pushdown", "calf_raise"] },
      { label: "Rest", exercises: [] },
      { label: "Rest", exercises: [] },
    ],
  },
  bro_split: { name: "Bro Split", shortName: "Bro", description: "5-day bodypart split. One muscle group per day.", daysPerWeek: 5, tags: ["hypertrophy", "intermediate-advanced", "5-day"],
    weekTemplate: [
      { label: "Chest", exercises: ["barbell_bench_press", "incline_db_press", "dumbbell_fly", "dips"] },
      { label: "Back", exercises: ["barbell_row", "pull_up", "lat_pulldown", "seated_cable_row"] },
      { label: "Shoulders", exercises: ["overhead_press", "cable_lateral_raise", "face_pull", "reverse_fly"] },
      { label: "Legs", exercises: ["barbell_back_squat", "romanian_deadlift", "leg_press", "leg_curl", "hip_thrust", "calf_raise"] },
      { label: "Arms", exercises: ["barbell_curl", "hammer_curl", "tricep_pushdown", "overhead_tri_ext"] },
      { label: "Rest", exercises: [] },
      { label: "Rest", exercises: [] },
    ],
  },
  custom: { name: "Custom", shortName: "Custom", description: "Build your own split from scratch.", daysPerWeek: 0, tags: ["flexible"],
    weekTemplate: Array(7).fill(null).map(() => ({ label: "Rest", isRest: true, exercises: [] })),
  },
};

// ============================================================
// PLAN → MONTH CONVERTER
// ============================================================

function buildMonthFromPlan(plan) {
  const wt = plan.weekTemplate || [];
  const weeks = plan.weeks || 4;
  const progressRate = plan.progressRate || 2.5;
  const startDate = new Date(2026, 1, 2); // Feb 2, 2026

  return Array.from({ length: weeks }, (_, wi) => {
    const overloadFactor = 1 + wi * (progressRate / 100);
    return {
      weekNum: wi + 1,
      label: wi === weeks - 1 && weeks > 2 ? `Week ${wi + 1} (Taper)` : `Week ${wi + 1}`,
      days: wt.map((day, di) => {
        const isRest = day.isRest || (!day.exercises.length && day.label === "Rest");
        const exercises = isRest ? [] : day.exercises.map(entry => {
          const exId = typeof entry === "string" ? entry : entry.id;
          const sd = entry.setDetails || (EXERCISE_DEFAULTS[exId] ? Array.from({ length: EXERCISE_DEFAULTS[exId].sets }, () => ({ reps: EXERCISE_DEFAULTS[exId].reps, weight: EXERCISE_DEFAULTS[exId].weight })) : [{ reps: 10, weight: 0 }]);
          return {
            exercise_id: exId,
            sets: sd.map(s => ({
              r: s.reps,
              w: s.weight > 0 ? Math.round(s.weight * overloadFactor / 5) * 5 : 0,
            })),
          };
        });
        return {
          dayNum: wi * 7 + di + 1,
          date: new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + wi * 7 + di),
          label: isRest ? "Rest" : day.label,
          isRest,
          exercises,
        };
      }),
    };
  });
}

// Default PPL plan for initial state
const DEFAULT_PLAN = {
  splitKey: "ppl",
  splitName: "Push / Pull / Legs",
  weekTemplate: SPLIT_PRESETS.ppl.weekTemplate.map(d => ({
    ...d,
    isRest: !d.exercises.length && d.label === "Rest",
    exercises: d.exercises.map(exId => getExDefault(exId)),
  })),
  weeks: 4,
  progressRate: 2.5,
};

// ============================================================
// GAP ANALYSIS FOR BUILDER
// ============================================================

function getGapSuggestions(weekTemplate, count = 3) {
  const vol = {};
  weekTemplate.forEach(day => {
    if (day.isRest || !day.exercises.length) return;
    day.exercises.forEach(entry => {
      const exId = typeof entry === "string" ? entry : entry.id;
      const sets = entry.setDetails ? entry.setDetails.length : 3;
      const ex = EXERCISES[exId]; if (!ex) return;
      ex.muscles.forEach(m => { vol[m.name] = (vol[m.name] || 0) + sets * m.contribution; });
    });
  });
  const goals = calcGoalPcts(vol);
  const gaps = Object.entries(goals).filter(([, d]) => d.pct < 80).sort((a, b) => a[1].pct - b[1].pct);
  if (!gaps.length) return [];
  const underserved = gaps.slice(0, 5).map(([m]) => m);
  const alreadyUsed = new Set();
  weekTemplate.forEach(d => d.exercises.forEach(e => alreadyUsed.add(typeof e === "string" ? e : e.id)));
  return Object.entries(EXERCISES).map(([id, ex]) => {
    let score = 0;
    ex.muscles.forEach(m => { if (underserved.includes(m.name)) score += m.contribution * (m.role === "direct" ? 3 : 1); });
    return { id, ...ex, score, directMuscles: ex.muscles.filter(m => m.role === "direct").map(m => m.name), isNew: !alreadyUsed.has(id) };
  }).filter(c => c.score > 0).sort((a, b) => a.isNew !== b.isNew ? (a.isNew ? -1 : 1) : b.score - a.score).slice(0, count);
}

function calcBuilderWeeklyVol(weekTemplate) {
  const vol = {};
  weekTemplate.forEach(day => {
    if (day.isRest || !day.exercises.length) return;
    day.exercises.forEach(entry => {
      const exId = typeof entry === "string" ? entry : entry.id;
      const sets = entry.setDetails ? entry.setDetails.length : 3;
      const ex = EXERCISES[exId]; if (!ex) return;
      ex.muscles.forEach(m => { vol[m.name] = (vol[m.name] || 0) + sets * m.contribution; });
    });
  });
  return vol;
}

// ============================================================
// HELPERS
// ============================================================

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MO_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const PATTERN_COLORS = {
  push: { bg: "rgba(61,220,132,0.1)", border: "rgba(61,220,132,0.25)", text: "#3DDC84" },
  pull: { bg: "rgba(167,139,250,0.1)", border: "rgba(167,139,250,0.25)", text: "#A78BFA" },
  legs: { bg: "rgba(76,158,255,0.1)", border: "rgba(76,158,255,0.25)", text: "#4C9EFF" },
};

const MUSCLE_COLORS = {
  Chest: "#3DDC84", Quads: "#4C9EFF", Lats: "#A78BFA", Hamstrings: "#FF8A50",
  Glutes: "#F472B6", Triceps: "#FBBF24", "Front Delts": "#2DD4BF", Biceps: "#EF4444",
  "Side Delts": "#818CF8", "Upper Back": "#34D399", "Rear Delts": "#FB923C",
  Core: "#94A3B8", "Upper Chest": "#6EE7B7", Calves: "#A3A3A3", Traps: "#D4D4D8",
  "Lower Back": "#CA8A04", Forearms: "#78716C", "Rotator Cuff": "#7DD3FC", Brachialis: "#9CA3AF",
};

const getDayPattern = (d) => { if (d.isRest || !d.exercises.length) return null; const ex = EXERCISES[d.exercises[0].exercise_id]; return ex?.pattern || null; };
const getDaySets = (d) => d.exercises.reduce((s, e) => s + e.sets.length, 0);
const getDayVol = (d) => { let v = 0; d.exercises.forEach((e) => e.sets.forEach((s) => { v += s.w * s.r; })); return v; };
const getWeekSets = (w) => w.days.reduce((s, d) => s + getDaySets(d), 0);
const getWeekVol = (w) => w.days.reduce((s, d) => s + getDayVol(d), 0);

function calcMuscleVol(exercises) {
  const vol = {};
  exercises.forEach((entry) => {
    const ex = EXERCISES[entry.exercise_id]; if (!ex) return;
    const n = entry.sets.length;
    ex.muscles.forEach((m) => { vol[m.name] = (vol[m.name] || 0) + n * m.contribution; });
  });
  return Object.entries(vol).sort((a, b) => b[1] - a[1]);
}

function weekMuscleVol(week) {
  const vol = {};
  week.days.forEach((d) => {
    d.exercises.forEach((entry) => {
      const ex = EXERCISES[entry.exercise_id]; if (!ex) return;
      const n = entry.sets.length;
      ex.muscles.forEach((m) => { vol[m.name] = (vol[m.name] || 0) + n * m.contribution; });
    });
  });
  return vol;
}

function getVolumeZone(sets, lm) {
  if (!lm) return "unknown";
  if (sets < lm.mev) return "below";
  if (sets <= lm.mav) return "productive";
  if (sets <= lm.mrv) return "high";
  return "over";
}

function getZoneColor(zone) {
  return { below: "#EF4444", productive: "#3DDC84", high: "#FBBF24", over: "#F472B6", unknown: "#5A6478" }[zone];
}

function getZoneText(zone) {
  return { below: "Below MEV", productive: "Productive", high: "Near MRV", over: "Over MRV", unknown: "—" }[zone];
}

function goalPctColor(pct) {
  if (pct >= 95) return "#3DDC84";
  if (pct >= 75) return "#FBBF24";
  if (pct >= 50) return "#FF8A50";
  return "#EF4444";
}

function calcGoalPcts(muscleVol) {
  const results = {};
  Object.entries(muscleVol).forEach(([m, eff]) => {
    const lm = VOLUME_LANDMARKS[m];
    if (!lm) return;
    const target = lm.mav;
    const pct = target > 0 ? Math.round((eff / target) * 100) : 0;
    results[m] = { eff, target, pct };
  });
  // Add muscles with 0 eff sets that have landmarks
  Object.keys(VOLUME_LANDMARKS).forEach(m => {
    if (!results[m]) results[m] = { eff: 0, target: VOLUME_LANDMARKS[m].mav, pct: 0 };
  });
  return results;
}

function overallGoalPct(goalPcts) {
  const entries = Object.values(goalPcts);
  if (!entries.length) return 0;
  return Math.round(entries.reduce((s, e) => s + Math.min(e.pct, 100), 0) / entries.length);
}

// ============================================================
// SHARED COMPONENTS
// ============================================================

function MiniBar({ name, sets, max }) {
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

function StatCard({ label, value, sub, color }) {
  const t = useTheme();
  return (
    <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 16 }}>
      <div style={{ fontSize: 11, color: t.textFaint, fontFamily: "mono", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 26, fontFamily: "mono", fontWeight: 700, color: color || t.text }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: t.textDim, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function PatternBadge({ pattern, size }) {
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

function GoalRing({ pct, size = 80, strokeWidth = 6, label }) {
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

function MuscleGoalBar({ name, eff, target, compact }) {
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

// Simplified front-facing muscle diagram SVG
function MuscleDiagram({ muscleVol, size = 160 }) {
  const t = useTheme();
  const goals = calcGoalPcts(muscleVol);

  // Map muscle names to body regions for the diagram
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

  // Aggregate % by region
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

  const sc = size / 160;

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

        {/* Upper arms (biceps/triceps) */}
        <path d="M44 60 Q38 80 36 100 Q42 102 48 100 Q46 80 50 60 Z"
          fill={getRegionColor("arms").fill} opacity={getRegionColor("arms").opacity} stroke={t.borderLight} strokeWidth="0.5" />
        <path d="M116 60 Q122 80 124 100 Q118 102 112 100 Q114 80 110 60 Z"
          fill={getRegionColor("arms").fill} opacity={getRegionColor("arms").opacity} stroke={t.borderLight} strokeWidth="0.5" />

        {/* Forearms */}
        <path d="M36 100 Q32 120 30 136 Q36 138 40 136 Q40 120 44 100 Z"
          fill={getRegionColor("forearms").fill} opacity={getRegionColor("forearms").opacity} stroke={t.borderLight} strokeWidth="0.5" />
        <path d="M124 100 Q128 120 130 136 Q124 138 120 136 Q120 120 116 100 Z"
          fill={getRegionColor("forearms").fill} opacity={getRegionColor("forearms").opacity} stroke={t.borderLight} strokeWidth="0.5" />

        {/* Core / Abs */}
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

        {/* Hamstrings (visible from slight side angle) */}
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

// ============================================================
// MONTH VIEW
// ============================================================

function MonthView({ onWeek, onDay }) {
  const t = useTheme();
  const MONTH = usePlanData();
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 8 }}>
        {DAY_NAMES.map((d) => (
          <div key={d} style={{ textAlign: "center", fontSize: 10, fontFamily: "mono", color: t.textFaint, textTransform: "uppercase", letterSpacing: 1, padding: "4px 0" }}>{d}</div>
        ))}
      </div>
      {MONTH.map((week, wi) => (
        <div key={wi} style={{ marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <button onClick={() => onWeek(wi)} style={{ fontSize: 11, fontFamily: "mono", color: "#4C9EFF", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}>{week.label}</button>
            <span style={{ fontSize: 10, color: t.textFaint }}>· {getWeekSets(week)} sets</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
            {week.days.map((day, di) => {
              const pat = getDayPattern(day);
              const pc = pat ? PATTERN_COLORS[pat] : null;
              return (
                <button key={di} onClick={() => !day.isRest && onDay(wi, di)} style={{
                  background: day.isRest ? (t === themes.dark ? "#0C0E13" : "#EAEBEE") : pc ? pc.bg : t.surface,
                  border: `1px solid ${day.isRest ? t.border : pc ? pc.border : t.border}`,
                  borderRadius: 10, padding: "12px 6px", cursor: day.isRest ? "default" : "pointer",
                  textAlign: "center", opacity: day.isRest ? 0.35 : 1, minHeight: 80,
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, transition: "all 0.15s",
                }}>
                  <div style={{ fontSize: 9, color: t.textDim, fontFamily: "mono" }}>{MO_NAMES[day.date.getMonth()]} {day.date.getDate()}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: day.isRest ? t.textFaint : pc ? pc.text : t.text }}>{day.isRest ? "Rest" : day.label}</div>
                  {!day.isRest && <div style={{ fontSize: 9, fontFamily: "mono", color: t.textDim }}>{getDaySets(day)} sets</div>}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// WEEK VIEW
// ============================================================

function WeekView({ week, onDay, onBack }) {
  const t = useTheme();
  const mv = weekMuscleVol(week);
  const goalPcts = calcGoalPcts(mv);
  const overall = overallGoalPct(goalPcts);
  const sortedGoals = Object.entries(goalPcts).filter(([,d]) => d.eff > 0).sort((a, b) => b[1].pct - a[1].pct);

  return (
    <div>
      <button onClick={onBack} style={{ fontSize: 12, color: "#4C9EFF", background: "none", border: "none", cursor: "pointer", marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>← Back to Month</button>

      {/* Week header */}
      <h2 style={{ fontSize: 22, fontWeight: 800, color: t.text, marginBottom: 4 }}>{week.label}</h2>
      <div style={{ display: "flex", gap: 12, marginBottom: 24, fontSize: 12, color: t.textDim }}>
        <span>{getWeekSets(week)} total sets</span><span>·</span>
        <span>{week.days.filter((d) => !d.isRest).length} training days</span><span>·</span>
        <span style={{ color: goalPctColor(overall), fontWeight: 600 }}>{overall}% of goal</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8, marginBottom: 28 }}>
        {week.days.map((day, di) => {
          const pat = getDayPattern(day); const pc = pat ? PATTERN_COLORS[pat] : null;
          return (
            <button key={di} onClick={() => !day.isRest && onDay(di)} style={{
              background: day.isRest ? (t === themes.dark ? "#0C0E13" : "#EAEBEE") : t.surface,
              border: `1px solid ${day.isRest ? t.border : pc ? pc.border : t.border}`,
              borderRadius: 14, padding: 16, cursor: day.isRest ? "default" : "pointer",
              textAlign: "left", opacity: day.isRest ? 0.4 : 1, minHeight: 140, transition: "all 0.15s",
            }}>
              <div style={{ fontSize: 10, color: t.textFaint, fontFamily: "mono", marginBottom: 4 }}>{DAY_NAMES[day.date.getDay()]} · {MO_NAMES[day.date.getMonth()]} {day.date.getDate()}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: day.isRest ? t.textFaint : t.text, marginBottom: 8 }}>{day.label}</div>
              {!day.isRest && pat && <PatternBadge pattern={pat} />}
              {!day.isRest && <div style={{ marginTop: 10, fontSize: 11, color: t.textDim, fontFamily: "mono" }}>{day.exercises.length} ex · {getDaySets(day)} sets</div>}
              {day.isRest && <div style={{ fontSize: 28, marginTop: 8 }}>😴</div>}
            </button>
          );
        })}
      </div>

      {/* % of Goal per muscle */}
      <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 14, padding: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: t.textFaint, fontFamily: "mono", marginBottom: 14 }}>Weekly % of Goal (vs MAV)</div>
        {sortedGoals.map(([m, data]) => (
          <MuscleGoalBar key={m} name={m} eff={data.eff} target={data.target} />
        ))}
      </div>
    </div>
  );
}

// ============================================================
// DAY VIEW + WORKOUT LOGGING
// ============================================================

function SetPill({ set, idx, logged, onLog, active }) {
  const t = useTheme();
  const isL = logged != null;
  const hit = isL && logged.reps >= set.r;
  const up = isL && logged.w > set.w;

  let bc = t.borderLight, bg = "transparent", tc = t.textMuted, icon = "";
  if (isL && hit && !up) { bc = "#3DDC84"; bg = "rgba(61,220,132,0.06)"; tc = "#3DDC84"; icon = " ✓"; }
  else if (isL && up) { bc = "#FBBF24"; bg = "rgba(251,191,36,0.06)"; tc = "#FBBF24"; icon = " ↑"; }
  else if (isL && !hit) { bc = "#EF4444"; bg = "rgba(239,68,68,0.06)"; tc = "#EF4444"; icon = " ✗"; }

  const dw = isL ? logged.w : set.w;
  const dr = isL ? logged.reps : set.r;

  return (
    <button onClick={() => active && !isL && onLog()} style={{
      border: `1px solid ${bc}`, background: bg, color: tc, borderRadius: 8,
      padding: "8px 12px", fontFamily: "mono", fontSize: 12,
      cursor: active && !isL ? "pointer" : "default", minWidth: 78, textAlign: "center", transition: "all 0.15s",
    }}>
      <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 0.5, opacity: 0.6, marginBottom: 2 }}>Set {idx + 1}</div>
      {dw > 0 ? `${dw} × ${dr}` : `BW × ${dr}`}{icon}
    </button>
  );
}

function LogModal({ exercise, setData, idx, onConfirm, onCancel }) {
  const t = useTheme();
  const ex = EXERCISES[exercise.exercise_id];
  const [w, setW] = useState(String(setData.w));
  const [r, setR] = useState(String(setData.r));
  const iStyle = { background: t.surface2, border: `1px solid ${t.borderLight}`, borderRadius: 10, color: t.text, fontSize: 24, fontFamily: "mono", fontWeight: 700, padding: "14px 16px", width: "100%", textAlign: "center", outline: "none" };

  return (
    <div style={{ position: "fixed", inset: 0, background: t.modalOverlay, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, backdropFilter: "blur(4px)" }} onClick={onCancel}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: t.surface, border: `1px solid ${t.borderLight}`, borderRadius: 20, padding: 32, width: 340, maxWidth: "90vw" }}>
        <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 2, color: t.textDim, fontFamily: "mono", marginBottom: 4 }}>Log Set {idx + 1}</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: t.text, marginBottom: 4 }}>{ex.name}</div>
        <div style={{ fontSize: 12, color: t.textDim, marginBottom: 24, fontFamily: "mono" }}>Target: {setData.w > 0 ? `${setData.w} × ${setData.r}` : `BW × ${setData.r}`}</div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 11, color: t.textDim, fontFamily: "mono", display: "block", marginBottom: 6 }}>WEIGHT (lbs)</label>
          <input type="number" value={w} onChange={(e) => setW(e.target.value)} style={iStyle} />
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 11, color: t.textDim, fontFamily: "mono", display: "block", marginBottom: 6 }}>REPS</label>
          <input type="number" value={r} onChange={(e) => setR(e.target.value)} style={iStyle} />
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: 14, borderRadius: 12, border: `1px solid ${t.borderLight}`, background: "transparent", color: t.textMuted, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
          <button onClick={() => onConfirm(Number(w), Number(r))} style={{ flex: 2, padding: 14, borderRadius: 12, border: "none", background: "#4C9EFF", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Log Set</button>
        </div>
      </div>
    </div>
  );
}

function DayView({ day, onBack }) {
  const t = useTheme();
  const [sessionActive, setSessionActive] = useState(false);
  const [logged, setLogged] = useState({});
  const [modal, setModal] = useState(null);

  const pat = getDayPattern(day);

  const totalSets = getDaySets(day);
  const completedSets = Object.keys(logged).length;
  const pct = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;
  let actualVol = 0;
  Object.values(logged).forEach((l) => { actualVol += l.w * l.reps; });

  const startSession = () => { setSessionActive(true); setLogged({}); };
  const endSession = () => { setSessionActive(false); };

  const confirmLog = (w, r) => {
    const key = `${modal.exIdx}_${modal.setIdx}`;
    setLogged((p) => ({ ...p, [key]: { w, reps: r, completed: r >= modal.set.r } }));
    setModal(null);
  };

  return (
    <div>
      <button onClick={onBack} style={{ fontSize: 12, color: "#4C9EFF", background: "none", border: "none", cursor: "pointer", marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>← Back to Week</button>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: t.text }}>{day.label}</h2>
            {pat && <PatternBadge pattern={pat} size="md" />}
          </div>
          <div style={{ fontSize: 13, color: t.textDim }}>
            {DAY_NAMES[day.date.getDay()]}, {MO_NAMES[day.date.getMonth()]} {day.date.getDate()} · {day.exercises.length} exercises · {totalSets} sets · {getDayVol(day).toLocaleString()} lbs
          </div>
        </div>
        <button onClick={sessionActive ? endSession : startSession} style={{
          padding: "12px 28px", borderRadius: 12, border: "none",
          background: sessionActive ? t.surface2 : "#4C9EFF",
          color: sessionActive ? t.textMuted : "#fff",
          fontSize: 14, fontWeight: 700, cursor: "pointer",
        }}>{sessionActive ? "End Session" : "Start Workout"}</button>
      </div>

      {sessionActive && (
        <div style={{ background: "rgba(76,158,255,0.06)", border: "1px solid rgba(76,158,255,0.2)", borderRadius: 12, padding: "12px 18px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4C9EFF", animation: "pulse 2s infinite" }} />
          <span style={{ fontSize: 13, color: "#4C9EFF", fontWeight: 500 }}>Session active — tap sets to log</span>
        </div>
      )}

      <div>
        <div>
          {day.exercises.map((entry, ei) => {
            const ex = EXERCISES[entry.exercise_id]; if (!ex) return null;
            const pc = PATTERN_COLORS[ex.pattern];
            return (
              <div key={ei} style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 14, padding: 20, marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: t.text }}>{ex.name}</div>
                    <div style={{ display: "flex", gap: 4, marginTop: 6, flexWrap: "wrap" }}>
                      {ex.muscles.filter(m => m.role === "direct").map((m) => <span key={m.name} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 8, background: `${MUSCLE_COLORS[m.name] || '#666'}18`, color: MUSCLE_COLORS[m.name] || '#888' }}>{m.name}</span>)}
                      {ex.muscles.filter(m => m.role !== "direct").map((m) => <span key={m.name} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 8, background: `${t.textFaint}20`, color: t.textDim }}>{m.name}</span>)}
                    </div>
                  </div>
                  <span style={{ fontSize: 10, fontFamily: "mono", color: t.textFaint }}>{entry.sets.length} sets</span>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {entry.sets.map((s, si) => {
                    const key = `${ei}_${si}`;
                    return <SetPill key={si} set={s} idx={si} logged={logged[key]} active={sessionActive} onLog={() => setModal({ exercise: entry, set: s, exIdx: ei, setIdx: si })} />;
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {modal && <LogModal exercise={modal.exercise} setData={modal.set} idx={modal.setIdx} onConfirm={confirmLog} onCancel={() => setModal(null)} />}
    </div>
  );
}

// ============================================================
// STATS SIDEBAR
// ============================================================

function Sidebar({ weekIdx, viewLevel, curWeek, curDay }) {
  const t = useTheme();
  const MONTH = usePlanData();

  // ---- WEEK VIEW SIDEBAR ----
  if (viewLevel === "week" && curWeek) {
    const mv = weekMuscleVol(curWeek);
    const goalPcts = calcGoalPcts(mv);
    const overall = overallGoalPct(goalPcts);
    const sortedGoals = Object.entries(goalPcts).filter(([,d]) => d.eff > 0).sort((a, b) => b[1].pct - a[1].pct);
    const wkSets = getWeekSets(curWeek);
    const trainDays = curWeek.days.filter(d => !d.isRest).length;

    return (
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: t.textFaint, fontFamily: "mono", marginBottom: 16 }}>Week {curWeek.weekNum} Overview</div>

        {/* Muscle Diagram + Goal */}
        <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 16, marginBottom: 16, display: "flex", alignItems: "center", gap: 16 }}>
          <MuscleDiagram muscleVol={mv} size={120} />
          <div style={{ flex: 1 }}>
            <GoalRing pct={overall} size={72} strokeWidth={5} label="Weekly Goal" />
            <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 18, fontFamily: "mono", fontWeight: 700, color: "#4C9EFF" }}>{wkSets}</div>
                <div style={{ fontSize: 8, color: t.textFaint, fontFamily: "mono", textTransform: "uppercase" }}>Sets</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 18, fontFamily: "mono", fontWeight: 700, color: "#3DDC84" }}>{trainDays}</div>
                <div style={{ fontSize: 8, color: t.textFaint, fontFamily: "mono", textTransform: "uppercase" }}>Train Days</div>
              </div>
            </div>
          </div>
        </div>

        {/* % of Goal per muscle */}
        <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: t.textFaint, fontFamily: "mono", marginBottom: 12 }}>% of Goal (vs MAV)</div>
          {sortedGoals.map(([m, data]) => (
            <MuscleGoalBar key={m} name={m} eff={data.eff} target={data.target} compact />
          ))}
        </div>
      </div>
    );
  }

  // ---- DAY VIEW SIDEBAR ----
  if (viewLevel === "day" && curDay && !curDay.isRest) {
    const dayMuscles = calcMuscleVol(curDay.exercises);
    const dayMuscVol = Object.fromEntries(dayMuscles);
    const maxM = dayMuscles[0]?.[1] || 1;

    // Find this day's week for weekly context
    const wkIdx = MONTH.findIndex(wk => wk.days.some(d => d.dayNum === curDay.dayNum));
    const week = wkIdx >= 0 ? MONTH[wkIdx] : null;
    const wkVol = week ? weekMuscleVol(week) : {};
    const wkGoals = calcGoalPcts(wkVol);
    const wkOverall = overallGoalPct(wkGoals);

    return (
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: t.textFaint, fontFamily: "mono", marginBottom: 16 }}>{curDay.label} Overview</div>

        {/* Muscle diagram for this day */}
        <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 16, marginBottom: 16, display: "flex", alignItems: "center", gap: 16 }}>
          <MuscleDiagram muscleVol={dayMuscVol} size={120} />
          <div style={{ flex: 1 }}>
            <GoalRing pct={wkOverall} size={72} strokeWidth={5} label="Week So Far" />
            <div style={{ marginTop: 10, textAlign: "center" }}>
              <div style={{ fontSize: 18, fontFamily: "mono", fontWeight: 700, color: "#4C9EFF" }}>{getDaySets(curDay)}</div>
              <div style={{ fontSize: 8, color: t.textFaint, fontFamily: "mono", textTransform: "uppercase" }}>Sets Today</div>
            </div>
          </div>
        </div>

        {/* Muscle breakdown */}
        <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: t.textFaint, fontFamily: "mono", marginBottom: 12 }}>Muscle Breakdown</div>
          {dayMuscles.map(([m, s]) => <MiniBar key={m} name={m} sets={s} max={maxM} />)}
        </div>

        {/* Weekly goal contribution */}
        {week && (
          <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: t.textFaint, fontFamily: "mono", marginBottom: 12 }}>Weekly Goal Progress</div>
            {Object.entries(wkGoals).filter(([,d]) => d.eff > 0).sort((a, b) => b[1].pct - a[1].pct).slice(0, 10).map(([m, data]) => {
              const dayContrib = dayMuscVol[m] || 0;
              const dayPct = data.target > 0 ? Math.round((dayContrib / data.target) * 100) : 0;
              const pc = goalPctColor(data.pct);
              return (
                <div key={m} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0", borderBottom: `1px solid ${t.border}` }}>
                  <span style={{ fontSize: 11, color: t.textMuted }}>{m}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 9, fontFamily: "mono", color: t.textDim }}>+{dayPct}%</span>
                    <span style={{ fontSize: 11, fontFamily: "mono", fontWeight: 600, color: pc }}>{data.pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ---- MONTH VIEW SIDEBAR (default) ----
  const totalSets = MONTH.reduce((s, w) => s + getWeekSets(w), 0);
  const trainDays = MONTH.reduce((s, w) => s + w.days.filter((d) => !d.isRest).length, 0);

  const patterns = { push: 0, pull: 0, legs: 0 };
  MONTH.forEach((w) => w.days.forEach((d) => d.exercises.forEach((e) => { const ex = EXERCISES[e.exercise_id]; if (ex && patterns[ex.pattern] !== undefined) patterns[ex.pattern] += e.sets.length; })));
  const patTotal = patterns.push + patterns.pull + patterns.legs;

  const wkSets = MONTH.map((w) => getWeekSets(w));
  const maxWS = Math.max(...wkSets);

  const numWeeks = MONTH.length;
  const allMusc = {};
  MONTH.forEach((w) => { const mv = weekMuscleVol(w); Object.entries(mv).forEach(([m, s]) => { allMusc[m] = (allMusc[m] || 0) + s; }); });
  const avgWeekMusc = {};
  Object.entries(allMusc).forEach(([m, s]) => { avgWeekMusc[m] = s / numWeeks; });

  const goalPcts = calcGoalPcts(avgWeekMusc);
  const overall = overallGoalPct(goalPcts);
  const sortedGoals = Object.entries(goalPcts).sort((a, b) => b[1].pct - a[1].pct);

  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: t.textFaint, fontFamily: "mono", marginBottom: 16 }}>Mesocycle Overview</div>

      {/* Muscle Diagram + Overall Goal */}
      <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 16, marginBottom: 16, display: "flex", alignItems: "center", gap: 16 }}>
        <MuscleDiagram muscleVol={avgWeekMusc} size={120} />
        <div style={{ flex: 1 }}>
          <GoalRing pct={overall} size={72} strokeWidth={5} label="Avg Weekly" />
          <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 18, fontFamily: "mono", fontWeight: 700, color: "#4C9EFF" }}>{totalSets}</div>
              <div style={{ fontSize: 8, color: t.textFaint, fontFamily: "mono", textTransform: "uppercase" }}>Total Sets</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 18, fontFamily: "mono", fontWeight: 700, color: "#3DDC84" }}>{trainDays}</div>
              <div style={{ fontSize: 8, color: t.textFaint, fontFamily: "mono", textTransform: "uppercase" }}>Train Days</div>
            </div>
          </div>
        </div>
      </div>

      {/* Pattern dist */}
      <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 16, marginBottom: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: t.textFaint, fontFamily: "mono", marginBottom: 12 }}>Pattern Split</div>
        <div style={{ display: "flex", gap: 8 }}>
          {Object.entries(patterns).map(([p, s]) => {
            const pct = Math.round((s / patTotal) * 100);
            const pc = PATTERN_COLORS[p];
            return (
              <div key={p} style={{ flex: 1, textAlign: "center" }}>
                <div style={{ fontSize: 22, fontFamily: "mono", fontWeight: 700, color: pc.text }}>{s}</div>
                <div style={{ fontSize: 10, color: t.textDim }}>{p}</div>
                <div style={{ height: 4, background: t.border, borderRadius: 2, marginTop: 8, overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: pc.text, borderRadius: 2 }} />
                </div>
                <div style={{ fontSize: 10, fontFamily: "mono", color: t.textFaint, marginTop: 4 }}>{pct}%</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Weekly sets trend */}
      <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 16, marginBottom: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: t.textFaint, fontFamily: "mono", marginBottom: 12 }}>Weekly Sets</div>
        <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 70 }}>
          {wkSets.map((s, i) => {
            const h = (s / maxWS) * 100;
            const sel = weekIdx === i;
            return (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                <span style={{ fontSize: 10, fontFamily: "mono", color: sel ? "#4C9EFF" : t.textDim }}>{s}</span>
                <div style={{ width: "100%", height: `${h}%`, background: sel ? "#4C9EFF" : t.border, borderRadius: 4, minHeight: 4, transition: "all 0.3s" }} />
                <span style={{ fontSize: 9, fontFamily: "mono", color: t.textFaint }}>W{i + 1}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* % of Goal per muscle */}
      <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: t.textFaint, fontFamily: "mono", marginBottom: 12 }}>% of Goal (Avg Weekly vs MAV)</div>
        {sortedGoals.slice(0, 12).map(([m, data]) => (
          <MuscleGoalBar key={m} name={m} eff={data.eff} target={data.target} compact />
        ))}
        {sortedGoals.length > 12 && <div style={{ fontSize: 10, color: t.textFaint, textAlign: "center", marginTop: 6 }}>+{sortedGoals.length - 12} more</div>}
      </div>
    </div>
  );
}

// ============================================================
// THEME TOGGLE
// ============================================================

function ThemeToggle({ mode, onToggle }) {
  const t = useTheme();
  return (
    <button onClick={onToggle} style={{
      width: 48, height: 26, borderRadius: 13, border: `1px solid ${t.borderLight}`,
      background: t.surface2, position: "relative", cursor: "pointer", padding: 0, transition: "all 0.2s",
    }}>
      <div style={{
        width: 20, height: 20, borderRadius: "50%",
        background: mode === "dark" ? "#4C9EFF" : "#FBBF24",
        position: "absolute", top: 2, left: mode === "dark" ? 2 : 24,
        transition: "all 0.25s ease", display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 11,
      }}>{mode === "dark" ? "🌙" : "☀️"}</div>
    </button>
  );
}

// ============================================================
// SETTINGS MENU
// ============================================================

function SettingsMenu({ onEditPlan }) {
  const t = useTheme();
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <button onClick={() => setOpen(!open)} style={{
        width: 32, height: 32, borderRadius: 8, border: `1px solid ${t.borderLight}`,
        background: t.surface2, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 14, color: t.textMuted,
      }}>⚙</button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 99 }} />
          <div style={{
            position: "absolute", right: 0, top: 38, background: t.surface, border: `1px solid ${t.border}`,
            borderRadius: 10, padding: 4, minWidth: 160, zIndex: 100, boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
          }}>
            <button onClick={() => { setOpen(false); onEditPlan(); }} style={{
              display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "10px 12px",
              background: "transparent", border: "none", borderRadius: 8, cursor: "pointer",
              color: t.text, fontSize: 12, textAlign: "left",
            }}>
              <span>📝</span> Edit Plan
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================
// PLAN BUILDER STEPS (integrated)
// ============================================================

const DAY_ABBR = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function StepGoalSplit({ plan, onChange }) {
  const t = useTheme();
  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Choose Your Split</h2>
      <p style={{ fontSize: 13, color: t.textDim, marginBottom: 24 }}>Select a training split to start with. Customize everything in the next steps.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
        {Object.entries(SPLIT_PRESETS).map(([key, preset]) => {
          const sel = plan.splitKey === key;
          return (
            <button key={key} onClick={() => onChange({ ...plan, splitKey: key, splitName: preset.name, weekTemplate: preset.weekTemplate.map(d => ({ ...d, isRest: d.isRest || (!d.exercises.length && d.label === "Rest"), exercises: d.exercises.map(exId => getExDefault(exId)) })), weeks: 4 })} style={{ background: sel ? `${goalPctColor(100)}08` : t.surface, border: `1px solid ${sel ? goalPctColor(100) + "40" : t.border}`, borderRadius: 14, padding: 20, cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: sel ? "#3DDC84" : t.text }}>{preset.name}</span>
                {preset.daysPerWeek > 0 && <span style={{ fontSize: 10, fontFamily: "mono", color: t.textDim, padding: "2px 8px", background: t.surface2, borderRadius: 6 }}>{preset.daysPerWeek}×/wk</span>}
              </div>
              <p style={{ fontSize: 12, color: t.textMuted, lineHeight: 1.5, marginBottom: 10 }}>{preset.description}</p>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {preset.tags.map(tag => <span key={tag} style={{ fontSize: 9, padding: "2px 6px", borderRadius: 6, background: `${t.textFaint}20`, color: t.textDim }}>{tag}</span>)}
              </div>
            </button>
          );
        })}
      </div>
      {plan.splitKey && (
        <div style={{ marginTop: 24, background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: t.textFaint, fontFamily: "mono", marginBottom: 12 }}>Mesocycle Length</div>
          <div style={{ display: "flex", gap: 8 }}>
            {[2, 3, 4, 5, 6].map(w => <button key={w} onClick={() => onChange({ ...plan, weeks: w })} style={{ padding: "10px 20px", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer", border: `1px solid ${plan.weeks === w ? "#4C9EFF" : t.borderLight}`, background: plan.weeks === w ? "rgba(76,158,255,0.1)" : "transparent", color: plan.weeks === w ? "#4C9EFF" : t.textMuted }}>{w} weeks</button>)}
          </div>
        </div>
      )}
    </div>
  );
}

function StepSchedule({ plan, onChange }) {
  const t = useTheme();
  const wt = plan.weekTemplate || [];
  const [dragIdx, setDragIdx] = useState(null);
  const swapDays = (from, to) => { if (from === to) return; const u = [...wt]; const tmp = u[from]; u[from] = u[to]; u[to] = tmp; onChange({ ...plan, weekTemplate: u }); };
  const toggleRest = (idx) => { const u = wt.map((d, i) => { if (i !== idx) return d; return d.isRest ? { ...d, isRest: false, label: d._saved?.label || "Training", exercises: d._saved?.exercises || [] } : { ...d, isRest: true, _saved: { label: d.label, exercises: d.exercises } }; }); onChange({ ...plan, weekTemplate: u }); };
  const updateLabel = (idx, label) => onChange({ ...plan, weekTemplate: wt.map((d, i) => i === idx ? { ...d, label } : d) });
  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Set Your Schedule</h2>
      <p style={{ fontSize: 13, color: t.textDim, marginBottom: 24 }}>Drag days to reorder. Toggle between training and rest.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 10 }}>
        {wt.map((day, i) => {
          const isRest = day.isRest;
          return (
            <div key={i} draggable onDragStart={() => setDragIdx(i)} onDragOver={e => e.preventDefault()} onDrop={() => { swapDays(dragIdx, i); setDragIdx(null); }} onDragEnd={() => setDragIdx(null)} style={{ background: isRest ? t.surface2 : t.surface, border: `1px solid ${dragIdx === i ? "#4C9EFF" : t.border}`, borderRadius: 14, padding: 16, textAlign: "center", minHeight: 160, opacity: dragIdx === i ? 0.5 : 1, cursor: "grab", transition: "all 0.15s" }}>
              <div style={{ fontSize: 10, fontFamily: "mono", color: t.textFaint, marginBottom: 4 }}>{DAY_ABBR[(i + 1) % 7]}</div>
              <div style={{ fontSize: 12, color: t.textDim, marginBottom: 6, letterSpacing: 2 }}>☰</div>
              {isRest ? <><div style={{ fontSize: 28, marginBottom: 4 }}>😴</div><div style={{ fontSize: 12, color: t.textFaint, marginBottom: 8 }}>Rest</div></> : <>
                <input value={day.label} onChange={e => updateLabel(i, e.target.value)} style={{ fontSize: 13, fontWeight: 700, color: t.text, background: "transparent", border: "1px solid transparent", borderRadius: 6, padding: "2px 4px", textAlign: "center", width: "100%", outline: "none", marginBottom: 4 }} onFocus={e => e.target.style.borderColor = t.borderLight} onBlur={e => e.target.style.borderColor = "transparent"} />
                <div style={{ fontSize: 10, fontFamily: "mono", color: t.textDim }}>{day.exercises.length > 0 ? `${day.exercises.length} exercises` : "No exercises"}</div>
              </>}
              <button onClick={() => toggleRest(i)} style={{ marginTop: 10, fontSize: 10, padding: "4px 10px", borderRadius: 6, cursor: "pointer", background: "transparent", border: `1px solid ${t.borderLight}`, color: t.textDim }}>{isRest ? "Make Training" : "Make Rest"}</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StepExercises({ plan, onChange }) {
  const t = useTheme();
  const [selectedDay, setSelectedDay] = useState(() => (plan.weekTemplate || []).findIndex(d => !d.isRest));
  const [search, setSearch] = useState(""); const [filterPattern, setFilterPattern] = useState("all"); const [filterMuscle, setFilterMuscle] = useState("all");
  const [dragIdx, setDragIdx] = useState(null); const [expandedIdx, setExpandedIdx] = useState(null);
  const wt = plan.weekTemplate || []; const currentDay = wt[selectedDay]; const isTrainingDay = currentDay && !currentDay.isRest;
  const updateDay = (dayIdx, fn) => onChange({ ...plan, weekTemplate: wt.map((d, i) => i === dayIdx ? fn(d) : d) });
  const addExercise = (exId) => updateDay(selectedDay, d => d.exercises.some(e => e.id === exId) ? d : { ...d, exercises: [...d.exercises, getExDefault(exId)] });
  const removeExercise = (idx) => { if (expandedIdx === idx) setExpandedIdx(null); else if (expandedIdx > idx) setExpandedIdx(expandedIdx - 1); updateDay(selectedDay, d => ({ ...d, exercises: d.exercises.filter((_, i) => i !== idx) })); };
  const updateSetDetail = (ei, si, field, val) => updateDay(selectedDay, d => ({ ...d, exercises: d.exercises.map((e, i) => i !== ei ? e : { ...e, setDetails: e.setDetails.map((s, j) => j === si ? { ...s, [field]: Number(val) || 0 } : s) }) }));
  const addSet = (ei) => updateDay(selectedDay, d => ({ ...d, exercises: d.exercises.map((e, i) => { if (i !== ei) return e; const last = e.setDetails[e.setDetails.length - 1] || { reps: 10, weight: 0 }; return { ...e, setDetails: [...e.setDetails, { ...last }] }; }) }));
  const removeSet = (ei, si) => updateDay(selectedDay, d => ({ ...d, exercises: d.exercises.map((e, i) => { if (i !== ei) return e; const sd = e.setDetails.filter((_, j) => j !== si); return { ...e, setDetails: sd.length ? sd : [{ reps: 10, weight: 0 }] }; }) }));
  const reorderExercise = (from, to) => { if (from === to) return; setExpandedIdx(null); updateDay(selectedDay, d => { const a = [...d.exercises]; const [it] = a.splice(from, 1); a.splice(to, 0, it); return { ...d, exercises: a }; }); };
  const suggestions = useMemo(() => getGapSuggestions(wt, 4), [wt]);
  const allMuscles = useMemo(() => { const ms = new Set(); Object.values(EXERCISES).forEach(ex => ex.muscles.filter(m => m.role === "direct").forEach(m => ms.add(m.name))); return Array.from(ms).sort(); }, []);
  const filtered = Object.entries(EXERCISES).filter(([, ex]) => { if (filterPattern !== "all" && ex.pattern !== filterPattern) return false; if (filterMuscle !== "all" && !ex.muscles.some(m => m.name === filterMuscle)) return false; if (search && !ex.name.toLowerCase().includes(search.toLowerCase()) && !ex.muscles.some(m => m.name.toLowerCase().includes(search.toLowerCase()))) return false; return true; });
  const currentExIds = isTrainingDay ? new Set(currentDay.exercises.map(e => e.id)) : new Set();
  const inputSt = { width: 52, padding: "4px 6px", borderRadius: 6, border: `1px solid ${t.borderLight}`, background: t.surface2, color: t.text, fontSize: 12, fontFamily: "mono", textAlign: "center", outline: "none" };

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Build Your Workouts</h2>
      <p style={{ fontSize: 13, color: t.textDim, marginBottom: 20 }}>Click to expand sets. Drag ☰ to reorder. Search by name or muscle.</p>
      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
        {wt.map((day, i) => { if (day.isRest) return null; const sel = selectedDay === i; return <button key={i} onClick={() => { setSelectedDay(i); setExpandedIdx(null); }} style={{ padding: "8px 16px", borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: "pointer", border: `1px solid ${sel ? "#4C9EFF" : t.borderLight}`, background: sel ? "rgba(76,158,255,0.1)" : "transparent", color: sel ? "#4C9EFF" : t.textMuted }}>{day.label}{day.exercises.length > 0 ? ` (${day.exercises.length})` : ""}</button>; })}
      </div>
      {isTrainingDay && (
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 20 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: t.textFaint, fontFamily: "mono", marginBottom: 12 }}>{currentDay.label} — {currentDay.exercises.length} exercises</div>
            {!currentDay.exercises.length && <div style={{ background: t.surface, border: `1px dashed ${t.borderLight}`, borderRadius: 12, padding: 40, textAlign: "center", fontSize: 13, color: t.textDim }}>No exercises yet. Add from the browser or try a suggestion.</div>}
            {currentDay.exercises.map((entry, ei) => {
              const ex = EXERCISES[entry.id]; if (!ex) return null;
              const isExp = expandedIdx === ei; const sm = summarizeSets(entry);
              return (
                <div key={`${entry.id}-${ei}`} style={{ marginBottom: 5 }}>
                  <div draggable onDragStart={() => setDragIdx(ei)} onDragOver={e => e.preventDefault()} onDrop={() => { reorderExercise(dragIdx, ei); setDragIdx(null); }} onDragEnd={() => setDragIdx(null)} onClick={() => setExpandedIdx(isExp ? null : ei)} style={{ background: isExp ? t.surface2 : t.surface, border: `1px solid ${dragIdx === ei ? "#4C9EFF" : isExp ? t.borderLight : t.border}`, borderRadius: isExp ? "10px 10px 0 0" : 10, padding: "10px 12px", display: "flex", alignItems: "center", gap: 6, opacity: dragIdx === ei ? 0.4 : 1, cursor: "pointer" }}>
                    <div style={{ cursor: "grab", color: t.textDim, fontSize: 14, width: 20, textAlign: "center" }} onClick={e => e.stopPropagation()}>☰</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: t.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ex.name}</div>
                      <div style={{ display: "flex", gap: 2, marginTop: 3, flexWrap: "wrap" }}>{ex.muscles.filter(m => m.role === "direct").map(m => <span key={m.name} style={{ fontSize: 8, padding: "0 4px", borderRadius: 4, background: `${MUSCLE_COLORS[m.name] || '#666'}18`, color: MUSCLE_COLORS[m.name] || '#888' }}>{m.name}</span>)}</div>
                    </div>
                    <span style={{ fontSize: 11, fontFamily: "mono", color: "#4C9EFF", fontWeight: 600 }}>{sm.count} sets</span>
                    <span style={{ fontSize: 10, fontFamily: "mono", color: t.textMuted }}>{sm.repsRange} reps</span>
                    <span style={{ fontSize: 10, fontFamily: "mono", color: t.textDim }}>{sm.weightRange} lbs</span>
                    <span style={{ fontSize: 10, color: t.textDim, transform: isExp ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>▼</span>
                    <button onClick={e => { e.stopPropagation(); removeExercise(ei); }} style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer", fontSize: 13, padding: "2px 4px" }}>✕</button>
                  </div>
                  {isExp && (
                    <div style={{ background: t.surface, border: `1px solid ${t.borderLight}`, borderTop: "none", borderRadius: "0 0 10px 10px", padding: "10px 12px" }}>
                      <div style={{ display: "flex", gap: 6, marginBottom: 6, paddingLeft: 26 }}><span style={{ width: 40, fontSize: 9, fontFamily: "mono", color: t.textFaint }}>SET</span><span style={{ width: 52, fontSize: 9, fontFamily: "mono", color: t.textFaint, textAlign: "center" }}>REPS</span><span style={{ width: 64, fontSize: 9, fontFamily: "mono", color: t.textFaint, textAlign: "center" }}>WEIGHT</span></div>
                      {entry.setDetails.map((set, si) => (
                        <div key={si} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, paddingLeft: 26 }}>
                          <span style={{ width: 40, fontSize: 11, fontFamily: "mono", color: t.textDim }}>#{si + 1}</span>
                          <input type="number" value={set.reps} min={1} max={30} onChange={e => updateSetDetail(ei, si, "reps", e.target.value)} style={inputSt} />
                          <input type="number" value={set.weight} min={0} max={999} onChange={e => updateSetDetail(ei, si, "weight", e.target.value)} style={{ ...inputSt, width: 64 }} />
                          <span style={{ fontSize: 9, color: t.textFaint }}>lbs</span>
                          {entry.setDetails.length > 1 && <button onClick={() => removeSet(ei, si)} style={{ background: "none", border: "none", color: t.textDim, cursor: "pointer", fontSize: 11 }}>✕</button>}
                        </div>
                      ))}
                      <button onClick={() => addSet(ei)} style={{ marginTop: 6, marginLeft: 26, fontSize: 11, padding: "4px 12px", borderRadius: 6, background: "transparent", border: `1px dashed ${t.borderLight}`, color: "#4C9EFF", cursor: "pointer" }}>+ Add Set</button>
                    </div>
                  )}
                </div>
              );
            })}
            {suggestions.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: t.textFaint, fontFamily: "mono", marginBottom: 8 }}><span style={{ color: "#FBBF24" }}>⚡</span> Suggested to fill gaps</div>
                {suggestions.map(s => <button key={s.id} onClick={() => addExercise(s.id)} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", background: "rgba(251,191,36,0.04)", border: "1px dashed rgba(251,191,36,0.25)", borderRadius: 10, padding: 10, marginBottom: 4, cursor: "pointer", textAlign: "left" }}><span style={{ fontSize: 14 }}>+</span><div style={{ flex: 1 }}><div style={{ fontSize: 12, fontWeight: 600, color: t.text }}>{s.name}</div><div style={{ fontSize: 10, color: t.textDim }}>Targets: {s.directMuscles.join(", ")}</div></div>{s.isNew && <span style={{ fontSize: 8, fontFamily: "mono", padding: "1px 5px", borderRadius: 4, background: "rgba(61,220,132,0.1)", color: "#3DDC84" }}>NEW</span>}</button>)}
              </div>
            )}
          </div>
          <div>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or muscle..." style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${t.borderLight}`, background: t.surface, color: t.text, fontSize: 12, outline: "none", marginBottom: 8 }} />
            <div style={{ display: "flex", gap: 3, marginBottom: 6 }}>{["all", "push", "pull", "legs"].map(p => <button key={p} onClick={() => setFilterPattern(p)} style={{ padding: "5px 9px", borderRadius: 6, fontSize: 10, fontFamily: "mono", cursor: "pointer", border: `1px solid ${filterPattern === p ? (PATTERN_COLORS[p]?.text || "#4C9EFF") + "40" : t.borderLight}`, background: filterPattern === p ? (PATTERN_COLORS[p]?.bg || "rgba(76,158,255,0.06)") : "transparent", color: filterPattern === p ? (PATTERN_COLORS[p]?.text || "#4C9EFF") : t.textDim, textTransform: "uppercase" }}>{p}</button>)}</div>
            <div style={{ display: "flex", gap: 3, marginBottom: 10, flexWrap: "wrap" }}>
              <button onClick={() => setFilterMuscle("all")} style={{ padding: "3px 7px", borderRadius: 5, fontSize: 9, cursor: "pointer", border: `1px solid ${filterMuscle === "all" ? "#4C9EFF40" : t.borderLight}`, background: filterMuscle === "all" ? "rgba(76,158,255,0.06)" : "transparent", color: filterMuscle === "all" ? "#4C9EFF" : t.textDim }}>All</button>
              {allMuscles.map(m => <button key={m} onClick={() => setFilterMuscle(filterMuscle === m ? "all" : m)} style={{ padding: "3px 7px", borderRadius: 5, fontSize: 9, cursor: "pointer", border: `1px solid ${filterMuscle === m ? (MUSCLE_COLORS[m] || "#4C9EFF") + "40" : t.borderLight}`, background: filterMuscle === m ? `${MUSCLE_COLORS[m] || "#4C9EFF"}10` : "transparent", color: filterMuscle === m ? (MUSCLE_COLORS[m] || "#4C9EFF") : t.textDim }}>{m}</button>)}
            </div>
            <div style={{ maxHeight: 480, overflowY: "auto", borderRadius: 12, border: `1px solid ${t.border}` }}>
              {filtered.map(([id, ex]) => { const inDay = currentExIds.has(id); const pc = PATTERN_COLORS[ex.pattern]; return <button key={id} onClick={() => !inDay && addExercise(id)} disabled={inDay} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 14px", background: inDay ? t.surface2 : "transparent", border: "none", borderBottom: `1px solid ${t.border}`, cursor: inDay ? "default" : "pointer", textAlign: "left", opacity: inDay ? 0.5 : 1 }}><span style={{ fontSize: 9, fontFamily: "mono", padding: "2px 6px", borderRadius: 6, background: pc?.bg, color: pc?.text, textTransform: "uppercase" }}>{ex.pattern}</span><div style={{ flex: 1 }}><div style={{ fontSize: 12, fontWeight: 600, color: t.text }}>{ex.name}</div><div style={{ fontSize: 10, color: t.textDim }}>{ex.muscles.filter(m => m.role === "direct").map(m => m.name).join(", ")}</div></div>{inDay ? <span style={{ fontSize: 10, color: t.textDim }}>Added</span> : <span style={{ fontSize: 14, color: "#3DDC84" }}>+</span>}</button>; })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StepReview({ plan }) {
  const t = useTheme();
  const wt = plan.weekTemplate || [];
  const vol = calcBuilderWeeklyVol(wt); const goals = calcGoalPcts(vol); const overall = overallGoalPct(goals);
  const sorted = Object.entries(goals).filter(([, d]) => d.eff > 0).sort((a, b) => b[1].pct - a[1].pct);
  const gaps = Object.entries(goals).filter(([, d]) => d.pct < 50 && d.pct > 0).sort((a, b) => a[1].pct - b[1].pct);
  const trainDays = wt.filter(d => !d.isRest && d.exercises.length > 0).length;
  const totalEx = wt.reduce((s, d) => s + (d.isRest ? 0 : d.exercises.length), 0);
  const totalSets = wt.reduce((s, d) => d.isRest ? s : s + d.exercises.reduce((ss, e) => ss + (e.setDetails ? e.setDetails.length : 3), 0), 0);
  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Review Your Plan</h2>
      <p style={{ fontSize: 13, color: t.textDim, marginBottom: 24 }}>{plan.weeks}-week {plan.splitName} mesocycle.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
        {[{ l: "Training Days", v: `${trainDays}/wk`, c: "#3DDC84" }, { l: "Exercises", v: totalEx, c: "#4C9EFF" }, { l: "Weekly Sets", v: totalSets, c: "#FBBF24" }, { l: "Mesocycle", v: `${plan.weeks} wks`, c: "#A78BFA" }].map(c => <div key={c.l} style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 16, textAlign: "center" }}><div style={{ fontSize: 24, fontFamily: "mono", fontWeight: 700, color: c.c }}>{c.v}</div><div style={{ fontSize: 10, color: t.textDim, fontFamily: "mono", textTransform: "uppercase", marginTop: 4 }}>{c.l}</div></div>)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8, marginBottom: 24 }}>
        {wt.map((day, i) => <div key={i} style={{ background: day.isRest ? t.surface2 : t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 12, minHeight: 100, opacity: day.isRest ? 0.5 : 1 }}><div style={{ fontSize: 9, fontFamily: "mono", color: t.textFaint, marginBottom: 4 }}>{DAY_ABBR[(i + 1) % 7]}</div><div style={{ fontSize: 13, fontWeight: 700, color: t.text, marginBottom: 6 }}>{day.label}</div>{!day.isRest && day.exercises.slice(0, 3).map((e, ei) => <div key={ei} style={{ fontSize: 9, color: t.textDim, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{EXERCISES[e.id]?.name}</div>)}{day.isRest && <div style={{ fontSize: 22, marginTop: 8 }}>😴</div>}</div>)}
      </div>
      <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 14, padding: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: t.textFaint, fontFamily: "mono", marginBottom: 14 }}>Predicted Weekly Coverage</div>
        {sorted.map(([m, data]) => <MuscleGoalBar key={m} name={m} eff={data.eff} target={data.target} />)}
      </div>
      {gaps.length > 0 && <div style={{ marginTop: 16, background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, padding: 16 }}><div style={{ fontSize: 11, fontWeight: 700, color: "#EF4444", marginBottom: 8 }}>⚠ Potential gaps</div><div style={{ fontSize: 12, color: t.textMuted }}>Below 50% MAV: {gaps.map(([m]) => m).join(", ")}</div></div>}
    </div>
  );
}

function BuilderSidebar({ plan }) {
  const t = useTheme();
  const wt = plan.weekTemplate || [];
  const vol = calcBuilderWeeklyVol(wt); const goals = calcGoalPcts(vol); const overall = overallGoalPct(goals);
  const sorted = Object.entries(goals).sort((a, b) => b[1].pct - a[1].pct);
  const trainDays = wt.filter(d => !d.isRest && d.exercises.length > 0).length;
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: t.textFaint, fontFamily: "mono", marginBottom: 16 }}>Live Analysis</div>
      <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 16, marginBottom: 16, display: "flex", alignItems: "center", gap: 16 }}>
        <MuscleDiagram muscleVol={vol} size={120} />
        <div style={{ flex: 1 }}>
          <GoalRing pct={overall} size={72} strokeWidth={5} label="Coverage" />
          <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
            <div style={{ textAlign: "center" }}><div style={{ fontSize: 18, fontFamily: "mono", fontWeight: 700, color: "#4C9EFF" }}>{trainDays}</div><div style={{ fontSize: 8, color: t.textFaint, fontFamily: "mono", textTransform: "uppercase" }}>Train Days</div></div>
            <div style={{ textAlign: "center" }}><div style={{ fontSize: 18, fontFamily: "mono", fontWeight: 700, color: "#FBBF24" }}>{wt.reduce((s, d) => s + (d.isRest ? 0 : d.exercises.length), 0)}</div><div style={{ fontSize: 8, color: t.textFaint, fontFamily: "mono", textTransform: "uppercase" }}>Exercises</div></div>
          </div>
        </div>
      </div>
      <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: t.textFaint, fontFamily: "mono", marginBottom: 12 }}>% of Goal (vs MAV)</div>
        {sorted.slice(0, 14).map(([m, data]) => <MuscleGoalBar key={m} name={m} eff={data.eff} target={data.target} compact />)}
      </div>
    </div>
  );
}

const BUILDER_STEPS = [{ key: "split", label: "Split" }, { key: "schedule", label: "Schedule" }, { key: "exercises", label: "Exercises" }, { key: "review", label: "Review" }];

// ============================================================
// MAIN APP
// ============================================================

export default function App() {
  const [themeMode, setThemeMode] = useState("dark");
  const [mode, setMode] = useState("dashboard"); // "dashboard" | "builder"
  const [plan, setPlan] = useState(DEFAULT_PLAN);
  const [monthData, setMonthData] = useState(() => buildMonthFromPlan(DEFAULT_PLAN));

  // Dashboard state
  const [viewLevel, setViewLevel] = useState("month");
  const [weekIdx, setWeekIdx] = useState(null);
  const [dayIdx, setDayIdx] = useState(null);

  // Builder state
  const [builderStep, setBuilderStep] = useState(0);
  const [builderPlan, setBuilderPlan] = useState(DEFAULT_PLAN);

  const t = themes[themeMode];
  const goMonth = () => { setViewLevel("month"); setWeekIdx(null); setDayIdx(null); };
  const goWeek = (wi) => { setWeekIdx(wi); setDayIdx(null); setViewLevel("week"); };
  const goDay = (wi, di) => { setWeekIdx(wi); setDayIdx(di); setViewLevel("day"); };
  const backToWeek = () => { setViewLevel("week"); setDayIdx(null); };

  const curWeek = weekIdx !== null ? monthData[weekIdx] : null;
  const curDay = curWeek && dayIdx !== null ? curWeek.days[dayIdx] : null;

  const activatePlan = () => {
    const newMonth = buildMonthFromPlan(builderPlan);
    setPlan(builderPlan);
    setMonthData(newMonth);
    setMode("dashboard");
    goMonth();
  };

  const editPlan = () => {
    setBuilderPlan({ ...plan });
    setBuilderStep(0);
    setMode("builder");
  };

  const canNext = builderStep === 0 ? !!builderPlan.splitKey : builderStep === 1 ? builderPlan.weekTemplate.some(d => !d.isRest) : true;

  // Compute date range for header
  const firstDate = monthData[0]?.days[0]?.date;
  const lastDate = monthData[monthData.length - 1]?.days[6]?.date;
  const dateRange = firstDate && lastDate ? `${MO_NAMES[firstDate.getMonth()]} ${firstDate.getDate()} – ${MO_NAMES[lastDate.getMonth()]} ${lastDate.getDate()}` : "";

  return (
    <ThemeContext.Provider value={t}>
      <PlanDataContext.Provider value={monthData}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Outfit', sans-serif; }
        body { background: ${t.bg}; transition: background 0.3s; }
        [style*="fontFamily: \\"mono\\""], [style*="font-family: mono"] { font-family: 'JetBrains Mono', monospace !important; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${t.borderLight}; border-radius: 4px; }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
        input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
      `}</style>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "28px 24px", color: t.text, transition: "color 0.3s" }}>

        {mode === "dashboard" ? (
          <>
            {/* DASHBOARD HEADER */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
              <div>
                <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 3, color: t.textFaint, fontFamily: "mono", marginBottom: 6 }}>Active Plan · {plan.weeks}-Week Mesocycle</div>
                <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.5, color: t.text }}>{plan.splitName}</h1>
                <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "rgba(76,158,255,0.1)", color: "#4C9EFF" }}>hypertrophy</span>
                  <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "rgba(61,220,132,0.1)", color: "#3DDC84" }}>{dateRange}</span>
                  <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "rgba(167,139,250,0.1)", color: "#A78BFA" }}>progressive overload</span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ display: "flex", gap: 4, alignItems: "center", fontSize: 12, fontFamily: "mono" }}>
                  <button onClick={goMonth} style={{ color: viewLevel === "month" ? t.text : "#4C9EFF", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: "inherit", textDecoration: viewLevel === "month" ? "none" : "underline", textUnderlineOffset: 3 }}>Month</button>
                  {viewLevel !== "month" && curWeek && <><span style={{ color: t.textFaint }}>/</span><button onClick={() => { setViewLevel("week"); setDayIdx(null); }} style={{ color: viewLevel === "week" ? t.text : "#4C9EFF", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: "inherit", textDecoration: viewLevel === "week" ? "none" : "underline", textUnderlineOffset: 3 }}>{curWeek.label}</button></>}
                  {viewLevel === "day" && curDay && <><span style={{ color: t.textFaint }}>/</span><span style={{ color: t.text }}>{curDay.label}</span></>}
                </div>
                <ThemeToggle mode={themeMode} onToggle={() => setThemeMode(m => m === "dark" ? "light" : "dark")} />
                <SettingsMenu onEditPlan={editPlan} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 28 }}>
              <div>
                {viewLevel === "month" && <MonthView onWeek={goWeek} onDay={goDay} />}
                {viewLevel === "week" && curWeek && <WeekView week={curWeek} onDay={(di) => goDay(weekIdx, di)} onBack={goMonth} />}
                {viewLevel === "day" && curDay && !curDay.isRest && <DayView day={curDay} onBack={backToWeek} />}
                {viewLevel === "day" && curDay && curDay.isRest && (
                  <div>
                    <button onClick={backToWeek} style={{ fontSize: 12, color: "#4C9EFF", background: "none", border: "none", cursor: "pointer", marginBottom: 16 }}>← Back to Week</button>
                    <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 16, padding: 60, textAlign: "center" }}>
                      <div style={{ fontSize: 48, marginBottom: 12 }}>😴</div>
                      <div style={{ fontSize: 22, fontWeight: 700, color: t.text }}>Rest Day</div>
                      <div style={{ fontSize: 14, color: t.textDim, marginTop: 8 }}>Recovery is part of the plan.</div>
                    </div>
                  </div>
                )}
              </div>
              <div style={{ position: "sticky", top: 20, alignSelf: "start", maxHeight: "calc(100vh - 60px)", overflowY: "auto" }}>
                <Sidebar weekIdx={weekIdx} viewLevel={viewLevel} curWeek={curWeek} curDay={curDay} />
              </div>
            </div>
          </>
        ) : (
          <>
            {/* BUILDER HEADER */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
              <div>
                <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 3, color: t.textFaint, fontFamily: "mono", marginBottom: 6 }}>Plan Builder · New Mesocycle</div>
                <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.5, color: t.text }}>{builderPlan.splitName || "Build Your Plan"}</h1>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                  {BUILDER_STEPS.map((s, i) => (
                    <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <button onClick={() => i <= builderStep && setBuilderStep(i)} style={{ fontSize: 11, fontFamily: "mono", padding: "4px 10px", borderRadius: 6, cursor: i <= builderStep ? "pointer" : "default", background: i === builderStep ? "rgba(76,158,255,0.1)" : "transparent", border: `1px solid ${i === builderStep ? "#4C9EFF" : i < builderStep ? "rgba(61,220,132,0.3)" : t.border}`, color: i === builderStep ? "#4C9EFF" : i < builderStep ? "#3DDC84" : t.textDim }}>{i < builderStep ? "✓" : i + 1}. {s.label}</button>
                      {i < BUILDER_STEPS.length - 1 && <span style={{ color: t.textFaint, fontSize: 10 }}>→</span>}
                    </div>
                  ))}
                </div>
                <ThemeToggle mode={themeMode} onToggle={() => setThemeMode(m => m === "dark" ? "light" : "dark")} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: builderStep >= 1 ? "1fr 320px" : "1fr", gap: 28 }}>
              <div>
                {builderStep === 0 && <StepGoalSplit plan={builderPlan} onChange={setBuilderPlan} />}
                {builderStep === 1 && <StepSchedule plan={builderPlan} onChange={setBuilderPlan} />}
                {builderStep === 2 && <StepExercises plan={builderPlan} onChange={setBuilderPlan} />}
                {builderStep === 3 && <StepReview plan={builderPlan} />}
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28, paddingTop: 20, borderTop: `1px solid ${t.border}` }}>
                  <button onClick={() => builderStep > 0 ? setBuilderStep(builderStep - 1) : setMode("dashboard")} style={{ padding: "10px 24px", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", background: "transparent", border: `1px solid ${t.borderLight}`, color: t.textMuted }}>{builderStep > 0 ? "← Back" : "← Cancel"}</button>
                  {builderStep < 3 ? (
                    <button onClick={() => canNext && setBuilderStep(builderStep + 1)} style={{ padding: "10px 28px", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: canNext ? "pointer" : "default", background: canNext ? "rgba(76,158,255,0.12)" : t.surface2, border: `1px solid ${canNext ? "#4C9EFF" : t.border}`, color: canNext ? "#4C9EFF" : t.textDim }}>Next: {BUILDER_STEPS[builderStep + 1]?.label} →</button>
                  ) : (
                    <button onClick={activatePlan} style={{ padding: "10px 28px", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", background: "rgba(61,220,132,0.12)", border: "1px solid rgba(61,220,132,0.4)", color: "#3DDC84" }}>✓ Activate Plan</button>
                  )}
                </div>
              </div>
              {builderStep >= 1 && <div style={{ position: "sticky", top: 20, alignSelf: "start", maxHeight: "calc(100vh - 60px)", overflowY: "auto" }}><BuilderSidebar plan={builderPlan} /></div>}
            </div>
          </>
        )}
      </div>
      </PlanDataContext.Provider>
    </ThemeContext.Provider>
  );
}