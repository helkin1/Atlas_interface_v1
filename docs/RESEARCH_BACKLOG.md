# Atlas Research Backlog: Placeholder Rules That Need Validation

> **18 of 41 rules** in the Atlas intelligence system are educated guesses ("placeholders") that need research-backed validation. This document ranks them by priority and explains exactly what to research, why it matters, and what "wrong" looks like for each value.

---

## How to Read This Document

Every numeric threshold Atlas uses to make decisions is called a **rule**. Rules control what users see: "add more chest work," "reduce weight," "your plan is 72% ready," "you've hit a plateau." There are 41 total:

- **23 rules** have citations (peer-reviewed studies or expert consensus)
- **18 rules** are placeholders — reasonable defaults that need validation

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

### 1. Contribution Weights

| Field | Value |
|-------|-------|
| **Rule ID** | `contribution_weights` |
| **Current values** | direct = 1.0, partial = 0.5, minimal = 0.25 |
| **Confidence** | placeholder |

**What it controls:** Every time Atlas counts "how many sets did you do for chest this week," it multiplies raw sets by these weights based on a muscle's role in the exercise. Bench press = 1.0× for chest, 0.5× for triceps, 0.5× for front delts. These multipliers feed into *every* volume calculation: gap detection, alerts, readiness score, plan quality.

**Why it's the #1 priority:** If 0.5 should actually be 0.3, then every secondary muscle's volume is overstated by 67%. Atlas would tell users "your triceps are fine" when they're actually undertrained. This is a multiplier on all other calculations — errors compound.

**What to research:**
- EMG activation studies comparing primary vs secondary muscle activation during compound lifts (e.g., bench press triceps EMG vs isolation triceps extension EMG)
- Hypertrophy outcome studies: does a set of bench grow triceps at 50% the rate of a set of tricep extensions? Or 30%? Or 70%?
- RP/Israetel's "counting rules" for partial contributions (he's discussed this in videos/articles)

**What "wrong" looks like:**
- If partial should be 0.3 (not 0.5): users who only do compounds get told their arms are fine when they actually need direct work
- If partial should be 0.7 (not 0.5): users get told to add arm isolation when compounds are already covering it

**Files affected:** `science-engine.js`, `helpers.js`, `plan-engine.js`, `progress-engine.js`, `intelligence-engine.js`

---

### 2. Readiness Score Weights

| Field | Value |
|-------|-------|
| **Rule ID** | `readiness_score_weights` |
| **Current values** | plan quality = 35%, execution consistency = 40%, progression trend = 25% |
| **Confidence** | placeholder |

**What it controls:** Produces the 0–100 "Readiness Score" shown on the dashboard — the primary number users see to judge their overall training quality.

**Why it's critical:** This is the most visible single number in the app. If execution is underweighted, a user with a perfect plan but 50% adherence still sees a decent score and doesn't get the signal to show up more consistently.

**What to research:**
- Adherence-outcome correlation studies: how much does consistency predict hypertrophy/strength results vs plan design?
- Is there research on which factor (plan quality, adherence, progressive overload) is the strongest predictor of outcomes?
- Behavioral science: what weighting motivates users to improve the *right* thing?

**What "wrong" looks like:**
- User at 50% adherence with a perfect plan:
  - Current weighting → score ≈ 58 (signals improvement needed)
  - If plan overweighted (60/20/20) → score ≈ 72 (masks inconsistency problem)

**Files affected:** `intelligence-engine.js`

---

## Priority Tier 2: HIGH

> Directly affects user-facing alerts, warnings, and exercise recommendations.

### 3. Volume Adherence Thresholds

| Field | Value |
|-------|-------|
| **Rule ID** | `volume_adherence_thresholds` |
| **Current values** | significantly_under = 50%, under = 80%, over = 120% |
| **Confidence** | placeholder |

**What it controls:** Classifies each muscle's actual-vs-planned volume ratio into "on track," "under," "significantly under," or "over." Drives volume drift warnings.

**What to research:**
- Is there an adherence % below which training outcomes meaningfully decline? (e.g., does 70% of planned volume still produce 90% of results?)
- Dose-response curves for volume: is the relationship linear, or is there a cliff?

**What "wrong" looks like:**
- If "under" = 0.9 instead of 0.8: users at 85% adherence get unnecessary warnings every week
- If "significantly_under" = 0.7 instead of 0.5: users at 60% adherence get "critical" warnings when they're still getting decent stimulus

**Files affected:** `intelligence-engine.js`

---

### 4. Strength Trend Thresholds

| Field | Value |
|-------|-------|
| **Rule ID** | `strength_trend_thresholds` |
| **Current values** | progressing = +5%, regressing = −5% |
| **Confidence** | placeholder |

**What it controls:** Compares estimated 1RM across sessions. If change > ±5%, classified as progressing/regressing. Otherwise "plateau." Triggers "plateau detected" and "regression detected" insights.

**What to research:**
- Test-retest reliability of estimated 1RM from submaximal sets (Epley, Brzycki formulas). If natural session-to-session variance is ±8%, then a 5% threshold produces false signals constantly.
- What % change over what timeframe constitutes a "real" plateau vs noise?

**What "wrong" looks like:**
- Threshold = 2%: "plateau" alerts after normal daily fluctuation. Creates alert fatigue.
- Threshold = 10%: user doesn't get warned until they've lost significant strength.

**Files affected:** `intelligence-engine.js`, `insights-engine.js`

---

### 5. Plan Gap Detection Threshold

| Field | Value |
|-------|-------|
| **Rule ID** | `plan_gap_detection_threshold` |
| **Current values** | 80% of MAV |
| **Confidence** | placeholder |

**What it controls:** If a muscle's effective weekly sets fall below 80% of its MAV, Atlas suggests exercises to fill the gap.

**What to research:**
- Is there a meaningful hypertrophy difference between 75% of MAV and 100% of MAV? Or is MEV → MAV a smooth gradient?
- Should the threshold be relative to MEV (minimum) instead of MAV (moderate)?

**What "wrong" looks like:**
- At 50%: only flags severely undertrained muscles. Misses subtle imbalances.
- At 95%: nearly every muscle gets flagged, creating suggestion overload.

**Files affected:** `plan-engine.js`

---

### 6. Progression Close-to-Target Buffer

| Field | Value |
|-------|-------|
| **Rule ID** | `progression_close_to_target_buffer` |
| **Current values** | 2 reps |
| **Confidence** | placeholder |

**What it controls:** If you hit within 2 reps of your target (e.g., 8 out of 10), Atlas says "maintain weight, push harder next time" instead of "reduce weight."

**What to research:**
- What % of target completion typically leads to success on the next attempt? (If 80% completion usually converts to 100% next session, buffer of 2 is right for a 10-rep target.)
- How do autoregulated programs (RPE-based) handle this decision?

**What "wrong" looks like:**
- Buffer = 1: target 10, hit 9 → "reduce weight." Frustrating and unnecessary.
- Buffer = 4: target 10, hit 6 → "maintain." User keeps failing at the same weight.

**Files affected:** `progression-engine.js`

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
| **CRITICAL** | Readiness score weights (35/40/25) | Misleading primary dashboard metric | Medium — adherence-outcome studies |
| **HIGH** | Volume adherence bands (50/80/120%) | False or missed warnings | Medium — dose-response literature |
| **HIGH** | Strength trend ±5% | False plateau/regression alerts | Medium — 1RM reliability data |
| **HIGH** | Gap detection 80% MAV | Over/under-suggesting exercises | Low — sensitivity analysis |
| **HIGH** | Close-to-target buffer (2 reps) | Too fast or too slow progression | Low — practical testing |
| **MEDIUM** | 9 minor muscle volumes | Incorrect tracking for those muscles | Medium — expert consensus check |
| **LOW** | Insight detection thresholds | Alert timing | Low — match other validated thresholds |
| **LOW** | Streak/workout milestones | Gamification timing | Minimal — UX decision |
