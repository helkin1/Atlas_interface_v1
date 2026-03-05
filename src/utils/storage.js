/**
 * Storage abstraction layer.
 *
 * Reads are always fast (from localStorage).
 * Writes go to localStorage immediately AND sync to Supabase in the background.
 * On login, pullFromCloud() loads Supabase data into localStorage.
 */

import { supabase } from "../lib/supabase.js";
import { buildPlanFromPreset } from "./plan-engine.js";

const PREFIX = "atlas_";

const KEYS = {
  plan: `${PREFIX}plan`,
  logs: `${PREFIX}logs`,
  theme: `${PREFIX}theme`,
  sessions: `${PREFIX}sessions`,
  profile: `${PREFIX}profile`,
};

/* ── Helpers ──────────────────────────────────────────────────── */

function getUserId() {
  // Supabase stores the session in localStorage; read it synchronously
  try {
    const sessionKey = Object.keys(localStorage).find(k => k.startsWith("sb-") && k.endsWith("-auth-token"));
    if (!sessionKey) return null;
    const raw = localStorage.getItem(sessionKey);
    const parsed = JSON.parse(raw);
    return parsed?.user?.id ?? null;
  } catch {
    return null;
  }
}

/** Fire-and-forget Supabase upsert. Errors are silently swallowed. */
function cloudUpsert(table, data, keyCol = "user_id") {
  if (isDemoMode()) return; // Skip cloud sync in demo mode
  const uid = getUserId();
  if (!uid) return;
  supabase
    .from(table)
    .upsert({ [keyCol]: uid, ...data, updated_at: new Date().toISOString() })
    .then(({ error }) => { if (error) console.warn(`[atlas] cloud sync ${table}:`, error.message); });
}

/* ── Plan ─────────────────────────────────────────────────────── */

export function hasSavedPlan() {
  try {
    return localStorage.getItem(KEYS.plan) !== null;
  } catch {
    return false;
  }
}

export function loadPlan(fallback) {
  try {
    const raw = localStorage.getItem(KEYS.plan);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function savePlan(plan) {
  try {
    localStorage.setItem(KEYS.plan, JSON.stringify(plan));
  } catch {
    // Silently fail (e.g. quota exceeded in private browsing).
  }
  cloudUpsert("plans", { data: plan });
}

/* ── Workout Logs ─────────────────────────────────────────────── */

export function loadWorkoutLogs() {
  try {
    const raw = localStorage.getItem(KEYS.logs);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveWorkoutLogs(logs) {
  try {
    localStorage.setItem(KEYS.logs, JSON.stringify(logs));
  } catch {
    // Silently fail.
  }
  cloudUpsert("workout_logs", { data: logs });
}


export function getWorkoutLogKey(planId, dayNum) {
  const pid = planId || "legacy";
  return `${pid}:${dayNum}`;
}

export function migrateLegacyWorkoutLog(dayNum, planId, logs) {
  const legacyKey = String(dayNum);
  const scopedKey = getWorkoutLogKey(planId, dayNum);
  if (!logs[scopedKey] && logs[legacyKey]) {
    return { ...logs, [scopedKey]: logs[legacyKey] };
  }
  return logs;
}

/* ── Session Metadata ─────────────────────────────────────────── */

export function loadSessionMeta(dayKey) {
  try {
    const raw = localStorage.getItem(KEYS.sessions);
    const all = raw ? JSON.parse(raw) : {};
    return all[dayKey] || null;
  } catch {
    return null;
  }
}

export function saveSessionMeta(dayKey, meta) {
  let all;
  try {
    const raw = localStorage.getItem(KEYS.sessions);
    all = raw ? JSON.parse(raw) : {};
    if (meta === null) {
      delete all[dayKey];
    } else {
      all[dayKey] = meta;
    }
    localStorage.setItem(KEYS.sessions, JSON.stringify(all));
  } catch {
    return; // Silently fail.
  }
  cloudUpsert("session_meta", { data: all });
}

/* ── Profile ─────────────────────────────────────────────────── */

export const DEFAULT_PROFILE = {
  displayName: "",
  age: null,
  sex: null,
  heightCm: null,
  weightKg: null,
  unitPreference: "imperial",
  experienceLevel: null,
  primaryGoal: null,
  secondaryGoals: [],
  trainingDaysPerWeek: null,
  sessionDuration: null,
  equipment: [],
  injuries: [],
  focusMuscles: [],
  onboardingCompleted: false,
};

export function loadProfile() {
  try {
    const raw = localStorage.getItem(KEYS.profile);
    return raw ? { ...DEFAULT_PROFILE, ...JSON.parse(raw) } : { ...DEFAULT_PROFILE };
  } catch {
    return { ...DEFAULT_PROFILE };
  }
}

export function saveProfile(profile) {
  try {
    localStorage.setItem(KEYS.profile, JSON.stringify(profile));
  } catch {
    // Silently fail.
  }
  cloudUpsert("profiles", { profile_data: profile }, "id");
}

export function isOnboardingComplete() {
  try {
    const raw = localStorage.getItem(KEYS.profile);
    if (!raw) return false;
    return JSON.parse(raw).onboardingCompleted === true;
  } catch {
    return false;
  }
}

/* ── Theme ────────────────────────────────────────────────────── */

export function loadTheme(fallback) {
  try {
    return localStorage.getItem(KEYS.theme) || fallback;
  } catch {
    return fallback;
  }
}

export function saveTheme(mode) {
  try {
    localStorage.setItem(KEYS.theme, mode);
  } catch {
    // Silently fail.
  }
  // Sync theme to profiles table
  if (isDemoMode()) return;
  const uid = getUserId();
  if (uid && supabase) {
    supabase
      .from("profiles")
      .update({ theme: mode })
      .eq("id", uid)
      .then(({ error }) => { if (error) console.warn("[atlas] cloud sync theme:", error.message); });
  }
}

/* ── Demo Mode ───────────────────────────────────────────────── */

const DEMO_KEY = `${PREFIX}demo`;

export function isDemoMode() {
  try { return localStorage.getItem(DEMO_KEY) === "true"; } catch { return false; }
}

export function exitDemoMode() {
  // Clear all atlas data seeded by demo
  Object.values(KEYS).forEach(k => { try { localStorage.removeItem(k); } catch {} });
  try { localStorage.removeItem(DEMO_KEY); } catch {}
}

export function seedDemoData() {
  // Mark demo mode
  try { localStorage.setItem(DEMO_KEY, "true"); } catch {}

  // Seed a completed profile
  const demoProfile = {
    displayName: "Alex",
    age: 28,
    sex: "male",
    heightCm: 178,
    weightKg: 80,
    unitPreference: "imperial",
    experienceLevel: "intermediate",
    primaryGoal: "hypertrophy",
    secondaryGoals: ["strength"],
    trainingDaysPerWeek: 4,
    sessionDuration: "60min",
    equipment: ["barbell", "dumbbell", "cable", "machine"],
    injuries: [],
    focusMuscles: ["chest", "back"],
    onboardingCompleted: true,
  };
  try { localStorage.setItem(KEYS.profile, JSON.stringify(demoProfile)); } catch {}

  // Seed an Upper/Lower plan (already built with exercises)
  const demoPlan = buildPlanFromPreset("upper_lower");
  try { localStorage.setItem(KEYS.plan, JSON.stringify(demoPlan)); } catch {}

  return { profile: demoProfile, plan: demoPlan };
}

/* ── Cloud Sync (called on login) ─────────────────────────────── */

/**
 * Pull all user data from Supabase and populate localStorage.
 * Returns the cloud theme (or null) so App can apply it.
 */
export async function pullFromCloud(userId) {
  if (!supabase) return null;
  const results = await Promise.allSettled([
    supabase.from("profiles").select("theme, profile_data").eq("id", userId).single(),
    supabase.from("plans").select("data").eq("user_id", userId).single(),
    supabase.from("workout_logs").select("data").eq("user_id", userId).single(),
    supabase.from("session_meta").select("data").eq("user_id", userId).single(),
  ]);

  let cloudTheme = null;

  // Profile / theme
  if (results[0].status === "fulfilled" && results[0].value.data) {
    cloudTheme = results[0].value.data.theme;
    if (cloudTheme) {
      try { localStorage.setItem(KEYS.theme, cloudTheme); } catch {}
    }
    // Profile data
    const profileData = results[0].value.data.profile_data;
    if (profileData) {
      try { localStorage.setItem(KEYS.profile, JSON.stringify(profileData)); } catch {}
    }
  }

  // Plan
  if (results[1].status === "fulfilled" && results[1].value.data?.data) {
    try { localStorage.setItem(KEYS.plan, JSON.stringify(results[1].value.data.data)); } catch {}
  }

  // Workout logs
  if (results[2].status === "fulfilled" && results[2].value.data?.data) {
    try { localStorage.setItem(KEYS.logs, JSON.stringify(results[2].value.data.data)); } catch {}
  }

  // Session meta
  if (results[3].status === "fulfilled" && results[3].value.data?.data) {
    try { localStorage.setItem(KEYS.sessions, JSON.stringify(results[3].value.data.data)); } catch {}
  }

  return cloudTheme;
}

/**
 * Push all localStorage data to Supabase (called on first login to seed cloud).
 */
export async function pushToCloud(userId) {
  if (!supabase) return;
  const plan = loadPlan(null);
  const logs = loadWorkoutLogs();
  const theme = loadTheme("dark");
  const profile = loadProfile();
  let sessions = {};
  try { const raw = localStorage.getItem(KEYS.sessions); sessions = raw ? JSON.parse(raw) : {}; } catch {}

  await Promise.allSettled([
    supabase.from("profiles").upsert({ id: userId, theme, profile_data: profile }),
    plan ? supabase.from("plans").upsert({ user_id: userId, data: plan, updated_at: new Date().toISOString() }) : Promise.resolve(),
    Object.keys(logs).length > 0 ? supabase.from("workout_logs").upsert({ user_id: userId, data: logs, updated_at: new Date().toISOString() }) : Promise.resolve(),
    Object.keys(sessions).length > 0 ? supabase.from("session_meta").upsert({ user_id: userId, data: sessions, updated_at: new Date().toISOString() }) : Promise.resolve(),
  ]);
}
