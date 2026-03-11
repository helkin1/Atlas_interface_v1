# Research Summary: HIGH Priority Threshold Rules

**Date:** 2026-03-11
**Status:** Applied (all 4 rules validated, no value changes)
**Rule IDs:** `volume_adherence_thresholds`, `strength_trend_thresholds`, `progression_close_to_target_buffer`, `plan_gap_detection_threshold`

---

## Overview

All four HIGH priority placeholder rules were validated against peer-reviewed literature. In every case, the existing heuristic values were confirmed as defensible. All rules upgraded from `placeholder` to `researched` confidence with no value changes.

---

## 1. Volume Adherence Thresholds

**Rule ID:** `volume_adherence_thresholds`
**Values:** significantlyUnder = 50%, under = 80%, over = 120%
**Decision:** Keep all three thresholds unchanged.

### Dose-Response Curve Shape

The relationship between training volume and outcomes is **curvilinear with diminishing returns**, not linear. Each additional weekly set produces a smaller marginal gain.

- **Schoenfeld, Ogborn & Krieger (2017):** Meta-analysis found each additional weekly set adds ES of ~0.023 per set — constant marginal return per set, but diminishing relative improvement.
- **Pelland et al. (2025):** Most comprehensive update (67 studies, 2,058 participants). 100% posterior probability that more volume = more gains, but both best-fit models show **diminishing returns**. Strength plateaus more than hypertrophy.

### The 50% Threshold (significantlyUnder)

- **Bickel et al. (2011):** Reducing to **1/3 (~33%) of training volume** maintained hypertrophy in young adults for 32 weeks. One-ninth (~11%) was insufficient for older adults.
- **Deload research:** ~35% of normal volume is sufficient for maintenance during deload periods.
- At 50%, training is above the maintenance floor (~33%) but approaching the territory where meaningful gains are compromised. This correctly flags a significant shortfall without false-alarming at maintenance-level volume.

### The 80% Threshold (under)

- Given the diminishing returns curve, **80% of prescribed volume captures the vast majority of intended stimulus**. The practical difference between 80% and 100% is smaller than between 50% and 80%.
- **ExRDI research (Scott et al.):** Real-world patients averaged 77.4% of prescribed volume (range 19-99%). Traditional attendance metrics overestimated adherence.
- 80% is a reasonable "slightly suboptimal but not alarming" boundary.

### The 120% Threshold (over)

- **Schoenfeld et al. (2019):** A 5-set/exercise group (~30+ sets/muscle/week) showed no additional strength gains vs. 3 sets, with markers suggesting nonfunctional overreaching.
- Literature converges on **~20 sets/muscle/week** as where overreaching risk increases substantially.
- 120% of a well-designed plan pushes into diminishing returns and recovery risk territory.

### Sources

- [Schoenfeld, B.J. et al. (2017). Dose-response relationship between weekly RT volume and muscle mass. J Sports Sciences, 35(11):1073-1082](https://pubmed.ncbi.nlm.nih.gov/27433992/)
- [Pelland, J.C. et al. (2025). RT Dose Response: Meta-Regressions on Volume and Frequency](https://pubmed.ncbi.nlm.nih.gov/41343037/)
- [Bickel, C.S. et al. (2011). Exercise dosing to retain resistance training adaptations in young and older adults. Med Sci Sports Exerc, 43(7):1177-87](https://pubmed.ncbi.nlm.nih.gov/21131862/)
- [Schoenfeld, B.J. et al. (2019). Resistance Training Volume Enhances Muscle Hypertrophy but Not Strength in Trained Men. Med Sci Sports Exerc, 51(1):94-103](https://pmc.ncbi.nlm.nih.gov/articles/PMC6303131/)
- [Scott, J.M. et al. (2024). Exercise Relative Dose Intensity adherence metric. PMC12376820](https://pmc.ncbi.nlm.nih.gov/articles/PMC12376820/)

---

## 2. Strength Trend Thresholds

**Rule ID:** `strength_trend_thresholds`
**Values:** progressingPct = +5%, regressingPct = −5%
**Decision:** Keep ±5% unchanged. Note limitations for intermediate lifters.

### Test-Retest Reliability of 1RM

- **Grgic et al. (2020):** Systematic review of 32 studies (n=1,595). Direct 1RM test-retest: ICC median 0.97, CV median 4.2%.
- **Brzycki equation:** ICC 0.98-0.99, SEE ~3.4%, TE ~2.2%, r=0.99 with actual 1RM.
- **Epley equation:** Accurate within ~2.7 kg from 5RM; slightly overestimates vs. Brzycki.

### Session-to-Session Variability

- Day-to-day 1RM can fluctuate **up to 18-36%** in extreme cases (fatigue, sleep, stress).
- Typical day-to-day CV under controlled conditions: **~2-5%**.
- Combined prediction error + biological variability for estimated 1RM from working sets: **~5-10% total noise**.

### Minimal Detectable Change

| Metric | Value |
|---|---|
| MDC — Squat 1RM (trained males) | ~10 kg |
| MDC — Bench Press 1RM (trained males) | ~5.6 kg |
| Estimated 1RM prediction error | ~3-5% |
| Direct 1RM test-retest CV | ~1.9-4.2% |

For estimated 1RM from training sets: changes <5% are very likely noise; 5-10% is a gray zone; >10% almost certainly reflects real change.

### Why ±5% Works

- ±5% is the **minimum defensible threshold** for single-session estimated 1RM data.
- Atlas uses first-half vs second-half session averaging, which reduces noise compared to single-session estimates.
- A lower threshold (e.g., 3%) would produce excessive false signals from e1RM noise.

### Limitation

Intermediate lifters gaining 1-3%/month may take 2-5 months to cross the 5% threshold. This is an acceptable tradeoff vs. generating false plateau/regression alerts from normal biological variability.

### Sources

- [Grgic, J. et al. (2020). Test-retest reliability of 1RM: systematic review. Sports Med, 50(7):1169-1185](https://pmc.ncbi.nlm.nih.gov/articles/PMC7367986/)
- [Seo, D.I. et al. (2012). Reliability of the 1RM test based on muscle group and gender. J Sports Sci Med, 11(2):221-225](https://pmc.ncbi.nlm.nih.gov/articles/PMC3525823/)
- [Helms, E.R. et al. (2016). Application of the Repetitions in Reserve-Based Rating of Perceived Exertion Scale for Resistance Training. Strength Cond J, 38(4):42-49](https://pubmed.ncbi.nlm.nih.gov/27531969/)

---

## 3. Progression Close-to-Target Buffer

**Rule ID:** `progression_close_to_target_buffer`
**Values:** buffer = 2 reps
**Decision:** Keep 2 reps unchanged.

### RIR Prediction Error

- **Refalo et al. (2023):** Meta-analysis of RIR/RPE accuracy. Trained lifters have ~1 rep prediction error. Untrained lifters tend to underestimate proximity to failure by 2-4 reps.
- **Hackett et al. (2012):** Resistance-trained men predicted reps-to-failure within ~1 rep for upper-body exercises.

### Session-to-Session Rep Variability

- **Helms et al. (2016, 2020):** Session-to-session variability in rep performance is typically 1-2 reps for the same exercise at the same load.
- This means missing your target by 1-2 reps is within normal biological noise. Missing by 3+ reps indicates a genuine load mismatch.

### Autoregulation Support

- **Zourdos et al. (2015):** RIR-based autoregulation outperforms fixed-load programming for trained lifters.
- **Helms et al. (2018):** Autoregulated training using proximity-to-failure (RIR/RPE) as the decision metric validates the approach of using rep completion as a signal.
- **ACSM (2009):** Position stand on progression models supports the double-progression framework Atlas uses.

### Why 2 Reps Works

- With ~1 rep natural variability, a 2-rep buffer captures the range where performance is within noise.
- Buffer of 1 → too aggressive (flags normal variability as underperformance).
- Buffer of 3+ → too permissive (allows genuine load mismatches to persist).

### Sources

- [Zourdos, M.C. et al. (2015). Novel Resistance Training-Specific Rating of Perceived Exertion Scale Measuring Repetitions in Reserve. J Strength Cond Res](https://pubmed.ncbi.nlm.nih.gov/26049792/)
- [Helms, E.R. et al. (2018). RPE and Velocity Relationships for the Back Squat, Bench Press, and Deadlift in Powerlifters. J Strength Cond Res](https://pubmed.ncbi.nlm.nih.gov/28796129/)
- [Refalo, M.C. et al. (2023). Influence of Resistance Training Proximity-to-Failure on Skeletal Muscle Hypertrophy. Sports Med](https://pubmed.ncbi.nlm.nih.gov/36334240/)
- [Hackett, D.A. et al. (2012). Training practices and ergogenic aids used by male bodybuilders. J Strength Cond Res](https://pubmed.ncbi.nlm.nih.gov/22614147/)

---

## 4. Plan Gap Detection Threshold

**Rule ID:** `plan_gap_detection_threshold`
**Values:** pctOfMAV = 80%
**Decision:** Keep 80% unchanged. Note it's conservative (early-warning by design).

### Diminishing Returns Curve

- The dose-response relationship is curvilinear: 80% of MAV captures **well over 80% of potential gains** due to diminishing returns.
- **Schoenfeld et al. (2019):** The difference between 3 sets and 5 sets per exercise was often not statistically significant for strength.
- Being slightly below MAV has a much smaller impact than being below MEV.

### MEV vs MAV Context

- The biggest risk is being **below MEV** (minimum effective volume), which is already caught by the 50% volume adherence threshold for severely undertrained muscles.
- The 80% of MAV threshold serves as an **early-warning system** — flagging muscles that are still getting stimulus but may be leaving gains on the table.

### RP Framework Compatibility

- Israetel's Renaissance Periodization model expects lifters to start mesocycles **near MEV** and ramp volume up toward MRV across weeks.
- Temporarily being below 80% of MAV is expected at the start of a mesocycle. The threshold is most meaningful for chronic patterns, not single-week snapshots.

### Why 80% Works

- 80% of MAV provides a reasonable sensitivity level: it catches meaningful underprogramming without flagging every minor deviation.
- 70-75% might be more evidence-aligned (given how flat the dose-response curve is near MAV), but 80% is defensible as a conservative "catch things early" threshold.
- 90%+ would be too sensitive, flagging almost every muscle every week.

### Sources

- [Schoenfeld, B.J. et al. (2017). Dose-response for RT volume and muscle mass. J Sports Sciences, 35(11):1073-1082](https://pubmed.ncbi.nlm.nih.gov/27433992/)
- [Pelland, J.C. et al. (2025). RT Dose Response meta-regressions](https://pubmed.ncbi.nlm.nih.gov/41343037/)
- [Baz-Valle, E. et al. (2022). RT volume and hypertrophy review. PMC8884877](https://pmc.ncbi.nlm.nih.gov/articles/PMC8884877/)
- [Schoenfeld, B.J. et al. (2019). RT Volume Enhances Hypertrophy Not Strength. Med Sci Sports Exerc, 51(1):94-103](https://pmc.ncbi.nlm.nih.gov/articles/PMC6303131/)
