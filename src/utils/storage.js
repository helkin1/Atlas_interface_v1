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
