# UI Overhaul Readiness Assessment — Atlas Interface v1

**Date**: 2026-03-06

## Architecture Snapshot

| Dimension | Current State |
|---|---|
| **Framework** | React 19 + Vite 6 |
| **Routing** | React Router DOM v7 (nested routes) |
| **Styling** | 100% inline styles via `style={{}}`, driven by design tokens |
| **Component lib** | Custom (no MUI/Chakra/etc.) |
| **State** | React Context + `useState` + localStorage + Supabase sync |
| **Tests** | None |

## What's in Good Shape

### 1. Clean business logic separation (8/10)
The `utils/` layer (`plan-engine.js`, `progress-engine.js`, `science-engine.js`, `storage.js`) is well isolated from the UI. You can swap every visual component without touching workout logic, persistence, or AI suggestions.

### 2. Centralized design tokens (8/10)
`src/context/theme.js` defines spacing, radii, font sizes, weights, and a dark/light color palette. A new design system can start by replacing this single file and having changes propagate everywhere tokens are used.

### 3. Shared component library (`shared.jsx`, 359 LOC)
Reusable primitives like `GoalRing`, `MiniBar`, `StatCard`, `MuscleGoalBar`, `AlertsPanel`, `Tabs`, etc. are factored out. Replacing these in one place updates the entire app.

### 4. Small component count (~20 files, ~3,200 LOC)
The surface area is manageable. Most components are 100–220 lines — focused and easy to rewrite individually.

### 5. Data layer is decoupled (9/10)
Components call `storage.js` abstractions, not Supabase directly. Exercise data, split presets, and plan templates live in `/src/data/` — pure data, no UI coupling.

## What Needs Attention

### 1. Zero test coverage — HIGH RISK
No test framework is installed. No unit, integration, or e2e tests exist. During a visual overhaul, there's no safety net to catch regressions in business logic or data flow.

### 2. `App.jsx` is a 678-line monolith
Mixes routing, auth flow, dashboard layout, global styles injection, and state orchestration. An overhaul will need to touch this file heavily.

### 3. Inline styles — limited flexibility
No pseudo-classes (`:hover`, `:focus`, `@media`), no CSS animations beyond globally injected keyframes, no responsive layouts. A serious overhaul will hit these limitations.

### 4. Scattered hardcoded colors
While tokens exist, many components use raw hex values (`#4C9EFF`, `#3DDC84`, `#FBBF24`) directly instead of referencing `tokens.colors.*`.

### 5. Prop drilling (3–4 levels deep)
Dashboard layout passes `weekIdx`, `viewLevel`, `curWeek`, `curDay` through multiple levels.

### 6. `Onboarding.jsx` (613 LOC) is monolithic
Multi-step form logic, validation, and UI are all in one file.

## Readiness Scorecard

| Area | Score | Notes |
|---|---|---|
| Business logic isolation | **8/10** | Engines are clean and UI-free |
| Token/theme system | **8/10** | Solid foundation, needs tighter adoption |
| Component modularity | **7/10** | Good overall, 2–3 files need splitting |
| Styling flexibility | **5/10** | Inline styles cap what you can do visually |
| Test safety net | **0/10** | Nothing — critical gap |
| State management | **7/10** | Context works, some prop drilling to clean up |
| Data layer decoupling | **9/10** | Storage, API, and data are well separated |
| **Overall Readiness** | **~6.5/10** | Architecturally decent, operationally risky |

## Recommended Pre-Overhaul Steps

1. **Add tests for `utils/`** — Vitest coverage on `plan-engine`, `progress-engine`, `science-engine`, and `storage` to protect core logic during visual changes.

2. **Migrate from inline styles to a CSS solution** — Tailwind CSS or CSS Modules to unlock responsive design, hover/focus states, animations, and media queries.

3. **Break up `App.jsx`** — Extract routing config, auth flow, and dashboard layout into separate files.

4. **Centralize all colors through tokens** — Replace ~50+ hardcoded hex values with `tokens.colors.*` references.

5. **Split `Onboarding.jsx`** — Break the 613-line file into per-step components.

## Bottom Line

The architecture is **sound enough for a phased overhaul** — business logic won't get in the way, the token system gives a head start, and the component count is small. But **zero test coverage and inline-style limitations** warrant 1–2 sprints of prep work before starting the visual redesign.
