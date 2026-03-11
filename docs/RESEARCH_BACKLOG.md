# Atlas Research Backlog: Placeholder Rules That Need Validation

> **13 of 41 rules** in the Atlas intelligence system are educated guesses ("placeholders") that need research-backed validation. This document ranks them by priority and explains exactly what to research, why it matters, and what "wrong" looks like for each value. *(6 resolved: contribution weights, readiness score weights, volume adherence thresholds, strength trend thresholds, close-to-target buffer, plan gap detection — see below)*

---

## How to Read This Document

Every numeric threshold Atlas uses to make decisions is called a **rule**. Rules control what users see: "add more chest work," "reduce weight," "your plan is 72% ready," "you've hit a plateau." There are 41 total:

- **28 rules** have citations (peer-reviewed studies or expert consensus)
- **13 rules** are placeholders — reasonable defaults that need validation

Each entry below includes:
- **Current value** — what the code uses today
- **What it controls** — what the user sees or experiences
- **What to research** — specific studies, data, or expert sources to look for
- **What "wrong" looks like** — concrete examples of how bad values hurt users
- **Files affected** — where in the codebase this value is consumed

All rules live in `src/data/rules-knowledge-base.js`.

---

## Priority Tier 1: CRITICAL

> Wrong values here corrupt downstream calculations across the entire system.

### 1. ~~Contribution Weights~~ — RESOLVED (2026-03-11)

| Field | Value |
|-------|-------|
| **Rule ID** | `contribution_weights` |
| **Default values** | direct = 1.0, partial = 0.5, minimal = 0.25 |
| **Confidence** | `research_supported` |

**Resolution:** Research confirms the 0.5 "half-set" rule as the best practical default for fractional set counting.

**Key findings:**
- **Pelland et al. (2024)** — Meta-regression of 67 studies (2,058 subjects). The fractional method (indirect × 0.5) had the strongest relative evidence for predicting hypertrophy. Exploratory analysis estimated indirect sets at ~32% of direct, but 0.5 provided best overall model fit.
- **Henselmans** — Explicitly advocates 0.5: "6 sets of rows = 3 sets of effective biceps work."
- **Outlift/Nuckols** — "Bench press stimulates about twice as much growth in the chest as in the triceps." Recommends 0.5.
- **RP/Israetel** — Does not use fractional counting; adjusts volume landmarks instead. Not directly comparable.

**Changes made:**
- Default 0.5/0.25 confirmed and kept as KB default
- 12 exercise-specific overrides applied in `exercise-data.js` where biomechanics warrant lower values:
  - Hamstrings from hip-dominant exercises (hip thrust, glute bridge, KB swing, rack pull) → 0.3 (hams not lengthened under load)
  - Back extension / reverse hyper → hamstrings 0.4 (decent stretch but LB/glute dominant)
  - Cable pull-through → hamstrings 0.4 (more hinge ROM than hip thrust)
  - Core from compound stabilization (front squat, single-leg RDL, KB swing) → 0.3 (isometric bracing ≠ dynamic hypertrophy)
  - Reverse lunge → hamstrings downgraded to minimal 0.25 (stabilizer only)
  - Rack pull → glutes 0.4 (reduced ROM), hamstrings downgraded to minimal 0.25

**Files changed:** `exercise-data.js`, `rules-knowledge-base.js`

---

### 2. ~~Readiness Score Weights~~ — RESOLVED

| Field | Value |
|-------|-------|
| **Rule ID** | `readiness_score_weights` |
| **Previous values** | plan quality = 35%, execution consistency = 40%, progression trend = 25% |
| **New values** | plan quality = 30%, execution consistency = 50%, progression trend = 20% |
| **Confidence** | ~~placeholder~~ → **researched** |
| **Resolved** | 2026-03-11 |

**Research summary:** Comprehensive literature review confirmed adherence/execution as the dominant predictor of training outcomes. Helms' Muscle & Strength Pyramid places adherence as the base. BJSM 2023 Bayesian meta-analysis (178 studies) found all protocols produce gains — adherence determines realization. Progressive overload roughly doubles hypertrophy magnitude but is partially redundant with adherence (a co-factor). 70% adherence is a critical threshold (Scott et al.).

**Full research:** `.docs/research-summaries/readiness-score-weights.md`

**Files affected:** `rules-knowledge-base.js`, `intelligence-engine.js`

---

## Priority Tier 2: HIGH

> Directly affects user-facing alerts, warnings, and exercise recommendations.

### 3. ~~Volume Adherence Thresholds~~ — RESOLVED (2026-03-11)

| Field | Value |
|-------|-------|
| **Rule ID** | `volume_adherence_thresholds` |
| **Current values** | significantly_under = 50%, under = 80%, over = 120% |
| **Confidence** | ~~placeholder~~ → **researched** |

**Resolution:** Research validates all three thresholds. Values unchanged.

**Key findings:**
- **Dose-response is curvilinear with diminishing returns** (Schoenfeld 2017, Pelland 2025). 80% of prescribed volume captures the vast majority of intended stimulus.
- **Bickel et al. (2011):** 1/3 (~33%) of volume maintains hypertrophy — 50% is above maintenance but approaching compromised territory.
- **ExRDI research (Scott et al.):** Real-world patients average 77.4% of prescribed volume.
- **Schoenfeld et al. (2019):** 30+ sets/muscle/week showed no additional gains with overreaching markers — 120% correctly flags overtraining risk.

**Full research:** `.docs/research-summaries/high-priority-thresholds.md`

**Files affected:** `rules-knowledge-base.js`, `intelligence-engine.js`

---

### 4. ~~Strength Trend Thresholds~~ — RESOLVED (2026-03-11)

| Field | Value |
|-------|-------|
| **Rule ID** | `strength_trend_thresholds` |
| **Current values** | progressing = +5%, regressing = −5% |
| **Confidence** | ~~placeholder~~ → **researched** |

**Resolution:** ±5% is the minimum defensible threshold for estimated 1RM. Values unchanged.

**Key findings:**
- **Grgic et al. (2020):** Direct 1RM test-retest CV = ~2-4% (32 studies, n=1,595).
- **Estimated 1RM noise:** Combined prediction error + biological variability = ~5-10% total noise from working sets.
- **MDC:** Bench press ~5.6 kg, squat ~10 kg in trained males.
- **Limitation:** Intermediates gaining 1-3%/month may take 2-5 months to cross 5%. Acceptable tradeoff vs. false alerts.

**Full research:** `.docs/research-summaries/high-priority-thresholds.md`

**Files affected:** `rules-knowledge-base.js`, `intelligence-engine.js`, `insights-engine.js`

---

### 5. ~~Plan Gap Detection Threshold~~ — RESOLVED (2026-03-11)

| Field | Value |
|-------|-------|
| **Rule ID** | `plan_gap_detection_threshold` |
| **Current values** | 80% of MAV |
| **Confidence** | ~~placeholder~~ → **researched** |

**Resolution:** 80% is a defensible conservative early-warning threshold. Value unchanged.

**Key findings:**
- **Diminishing returns curve** means 80% of MAV captures well over 80% of potential gains.
- **Schoenfeld 2019:** 3-set vs 5-set differences often not statistically significant for strength.
- Biggest risk is being below MEV, not below MAV (already caught by 50% adherence threshold).
- 70-75% might be more evidence-aligned, but 80% is appropriate for early detection.

**Full research:** `.docs/research-summaries/high-priority-thresholds.md`

**Files affected:** `rules-knowledge-base.js`, `plan-engine.js`

---

### 6. ~~Progression Close-to-Target Buffer~~ — RESOLVED (2026-03-11)

| Field | Value |
|-------|-------|
| **Rule ID** | `progression_close_to_target_buffer` |
| **Current values** | 2 reps |
| **Confidence** | ~~placeholder~~ → **researched** |

**Resolution:** 2-rep buffer matches RIR prediction error and session-to-session variability. Value unchanged.

**Key findings:**
- **Refalo et al. (2023):** RIR prediction error in trained lifters = ~1 rep.
- **Helms et al. (2016, 2020):** Session-to-session rep variability = 1-2 reps.
- Missing by 1-2 reps = normal noise. Missing by 3+ = genuine load mismatch.
- **Zourdos (2015), Helms (2018):** Autoregulation literature validates proximity-to-failure as the progression decision metric.

**Full research:** `.docs/research-summaries/high-priority-thresholds.md`

**Files affected:** `rules-knowledge-base.js`, `progression-engine.js`

---

## Priority Tier 3: MEDIUM

> Volume landmarks for 9 minor muscle groups with no citations. Affects tracking, gap detection, and alerts for those specific muscles.

| # | Muscle | Current MEV/MAV/MRV | Risk if Wrong | Research Approach |
|---|--------|---------------------|---------------|-------------------|
| 7 | **Traps** | 4 / 10 / 16 | Israetel says MEV=0 with compounds. Current MEV of 4 may cause false "undertrained" alerts. | Check Israetel trap landmarks; EMG data on trap activation in deadlifts/rows. |
| 8 | **Core** (rectus abdominis) | 4 / 10 / 16 | Limited controlled research on direct ab volume for hypertrophy. | Look for ab training volume studies; check if compounds provide sufficient stimulus. |
| 9 | **Obliques** | 4 / 10 / 16 | Indirect stimulus from compound bracing is hard to quantify. | Check anti-rotation/rotational training research. |
| 10 | **Adductors** | 4 / 8 / 14 | Wide-stance squat contribution is uncertain. | EMG data on adductor activation in squat variations. |
| 11 | **Lower Back** (erectors) | 2 / 6 / 10 | **Safety concern** — overestimating MRV risks injury. Conservative values may be fine as-is. | Validate low MRV is appropriate; check injury literature. |
| 12 | **Forearms** | 2 / 8 / 14 | Most users don't program direct forearm work. | Check if any coach has forearm-specific volume recommendations. |
| 13 | **Brachialis** | 2 / 6 / 10 | Usually trained with biceps; separate tracking may be unnecessary. | Validate whether separate tracking adds value. |
| 14 | **Rotator Cuff** | 2 / 6 / 10 | Prehab-focused, not hypertrophy. Current values seem reasonable. | Check physical therapy literature for prehab volume. |
| 15 | **Hip Flexors** | 2 / 6 / 10 | Rarely directly trained. | Validate indirect contribution from leg raises/squats. |

**Files affected (all 9):** `rules-knowledge-base.js`, `science-engine.js`, `intelligence-engine.js`

---

## Priority Tier 4: LOW

> Behavioral design choices, not exercise science. No "wrong" answer — these are UX tuning knobs.

### 16. Insight Detection Thresholds

| Field | Value |
|-------|-------|
| **Rule ID** | `insight_detection_thresholds` |
| **Current values** | stallSessions=3, stallChangePct=5%, regressionSessions=3, regressionChangePct=−5%, consistencyHigh=90%, consistencyLow=50%, consistencyMinDays=4 |

These mirror the strength trend and stall thresholds in the progression engine (Tier 2). Once those are validated, these should match. The 90%/50% consistency bands could use behavioral research on what adherence level predicts outcomes.

**Files affected:** `insights-engine.js`

### 17. Streak Milestones

| Field | Value |
|-------|-------|
| **Rule ID** | `insight_streak_milestones` |
| **Current values** | [3, 5, 7, 10, 14, 21, 28] |

Gamification timing. Lally et al. (2010) found habit automaticity takes ~66 days on average. Could extend milestones past 28 to 42 and 66. Otherwise, this is a UX design choice.

### 18. Workout Milestones

| Field | Value |
|-------|-------|
| **Rule ID** | `insight_workout_milestones` |
| **Current values** | [1, 5, 10, 25, 50, 75, 100, 150, 200] |

Total workout celebration triggers. Whether milestone spacing affects user retention is a product analytics question, not exercise science.

---

## Summary: Research Priority Matrix

| Priority | Rule | Impact if Wrong | Research Effort |
|----------|------|-----------------|-----------------|
| **CRITICAL** | Contribution weights (1.0/0.5/0.25) | Corrupts ALL volume calculations | High — needs EMG + outcome data |
| ~~**CRITICAL**~~ | ~~Readiness score weights (35/40/25)~~ → **RESOLVED (30/50/20)** | ~~Misleading primary dashboard metric~~ | ~~Medium~~ |
| ~~**HIGH**~~ | ~~Volume adherence bands (50/80/120%)~~ → **RESOLVED (values confirmed)** | ~~False or missed warnings~~ | ~~Medium~~ |
| ~~**HIGH**~~ | ~~Strength trend ±5%~~ → **RESOLVED (value confirmed)** | ~~False plateau/regression alerts~~ | ~~Medium~~ |
| ~~**HIGH**~~ | ~~Gap detection 80% MAV~~ → **RESOLVED (value confirmed)** | ~~Over/under-suggesting exercises~~ | ~~Low~~ |
| ~~**HIGH**~~ | ~~Close-to-target buffer (2 reps)~~ → **RESOLVED (value confirmed)** | ~~Too fast or too slow progression~~ | ~~Low~~ |
| **MEDIUM** | 9 minor muscle volumes | Incorrect tracking for those muscles | Medium — expert consensus check |
| **LOW** | Insight detection thresholds | Alert timing | Low — match other validated thresholds |
| **LOW** | Streak/workout milestones | Gamification timing | Minimal — UX decision |
