/**
 * Storage abstraction layer.
 *
 * Currently backed by localStorage. To migrate to a backend API,
 * replace the body of each function — the call-sites in App.jsx
 * stay the same.
 */

const PREFIX = "atlas_";

const KEYS = {
  plan: `${PREFIX}plan`,
  logs: `${PREFIX}logs`,
  theme: `${PREFIX}theme`,
};

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
}
