# Atlas Rules & Assumptions

> **Auto-generated** by `node scripts/generate-rules-doc.js`
> Generated: 2026-03-11

This document lists every configurable value used by Atlas intelligence engines, along with its rationale, source citations, and confidence level.

## Summary

| Category | Rules | Researched | Expert Consensus | Placeholder |
|---|---|---|---|---|
| Volume Landmarks | 22 | 0 | 13 | 9 |
| Progression Thresholds | 7 | 4 | 2 | 1 |
| Deload Parameters | 3 | 3 | 0 | 0 |
| Readiness Score | 1 | 1 | 0 | 0 |
| Volume Adherence | 1 | 0 | 0 | 1 |
| Strength Trends | 1 | 0 | 0 | 1 |
| Contribution Weights | 1 | 0 | 0 | 0 |
| Insight Milestones & Detection | 3 | 0 | 0 | 3 |
| Plan Engine | 2 | 0 | 1 | 1 |
| **Total** | **41** | **7** | **16** | **17** |

---

## Volume Landmarks

### Weekly volume landmarks for Chest

- **ID:** `volume_landmarks_chest`
- **Confidence:** Expert Consensus (multiple recognized experts)
- **Last Reviewed:** 2026-03-11
- **Values:**
  - mev: 6
  - mav: 16
  - mrv: 22

**Rationale:** Israetel recommends MEV of 6 direct sets/week for chest. MAV of 12-20 sets (midpoint ~16) for intermediates. MRV of 22 aligns with both Israetel and the upper bound of Schoenfeld's dose-response data showing continued gains up to high volumes.

**Notes:** Values for intermediate lifters (1-5+ years). Beginners may respond to lower volumes. MEV reduced from previous 8 to 6 per Israetel data.

**Sources:**
- Israetel, M. — Renaissance Periodization, Chest Training Volume Landmarks (Expert Recommendation, 2023) — [link](https://rpstrength.com/chest-training-tips-hypertrophy)
- Schoenfeld, B.J., Ogborn, D., & Krieger, J.W. (2017). Dose-response relationship between weekly resistance training volume and increases in muscle mass. J Sports Sciences, 35(11):1073-1082 (Meta-Analysis, 2017) — [link](https://pubmed.ncbi.nlm.nih.gov/27433992/)

### Weekly volume landmarks for Upper Chest

- **ID:** `volume_landmarks_upper_chest`
- **Confidence:** Expert Consensus (multiple recognized experts)
- **Last Reviewed:** 2026-03-11
- **Values:**
  - mev: 4
  - mav: 8
  - mrv: 12

**Rationale:** Upper chest is a subdivision of chest. Counted separately when incline movements are programmed. Lower MEV because flat pressing provides partial stimulus.

**Notes:** These sets are in addition to flat chest work. Total chest stimulus = Chest + Upper Chest contributions.

**Sources:**
- Israetel, M. — Renaissance Periodization (Expert Recommendation, 2023)

### Weekly volume landmarks for Lats

- **ID:** `volume_landmarks_lats`
- **Confidence:** Expert Consensus (multiple recognized experts)
- **Last Reviewed:** 2026-03-11
- **Values:**
  - mev: 10
  - mav: 18
  - mrv: 25

**Rationale:** Israetel's 'Back' landmarks recommend MEV of 10, MAV range of 14-22 (midpoint 18), and MRV of 25. Back musculature is large and recovers relatively well, supporting higher volumes.

**Notes:** Updated from {8, 16, 22} to match Israetel back landmarks. Lats and Upper Back share the same research base but are tracked separately for programming precision.

**Sources:**
- Israetel, M. — Renaissance Periodization, Back Training Volume Landmarks (Expert Recommendation, 2023)
- Schoenfeld, B.J. et al. (2017). Dose-response relationship between weekly RT volume and muscle mass. J Sports Sciences, 35(11):1073-1082 (Meta-Analysis, 2017) — [link](https://pubmed.ncbi.nlm.nih.gov/27433992/)

### Weekly volume landmarks for Upper Back (rhomboids, mid-traps)

- **ID:** `volume_landmarks_upper_back`
- **Confidence:** Expert Consensus (multiple recognized experts)
- **Last Reviewed:** 2026-03-11
- **Values:**
  - mev: 10
  - mav: 18
  - mrv: 25

**Rationale:** Same research base as Lats — Israetel groups these under 'Back' training landmarks.

**Notes:** Upper back rows vs lat-focused pulls. Both benefit from same volume ranges.

**Sources:**
- Israetel, M. — Renaissance Periodization, Back Training Volume Landmarks (Expert Recommendation, 2023)

### Weekly volume landmarks for Front Delts

- **ID:** `volume_landmarks_front_delts`
- **Confidence:** Expert Consensus (multiple recognized experts)
- **Last Reviewed:** 2026-03-11
- **Values:**
  - mev: 0
  - mav: 7
  - mrv: 12

**Rationale:** Front delts receive substantial indirect volume from all pressing movements (bench, overhead press). Israetel notes MV/MEV of 0 — heavy pressing is sufficient for most. Direct work MAV of 6-8 sets only if specifically lagging.

**Notes:** MEV of 0 means compound pressing provides sufficient stimulus. Atlas counts partial contributions from pressing exercises toward this total.

**Sources:**
- Israetel, M. — Renaissance Periodization, Front Delt Volume Landmarks (Expert Recommendation, 2023)

### Weekly volume landmarks for Side Delts

- **ID:** `volume_landmarks_side_delts`
- **Confidence:** Expert Consensus (multiple recognized experts)
- **Last Reviewed:** 2026-03-11
- **Values:**
  - mev: 8
  - mav: 19
  - mrv: 26

**Rationale:** Israetel groups rear and side delts together with MEV of 8, MAV range of 16-22 (midpoint ~19), and MRV of 26. Side delts recover quickly and tolerate high volumes well.

**Notes:** Updated from {8, 16, 22} to match Israetel recommendations. Isolation-friendly muscle that benefits from higher frequency.

**Sources:**
- Israetel, M. — Renaissance Periodization, Side/Rear Delt Volume Landmarks (Expert Recommendation, 2023)

### Weekly volume landmarks for Rear Delts

- **ID:** `volume_landmarks_rear_delts`
- **Confidence:** Expert Consensus (multiple recognized experts)
- **Last Reviewed:** 2026-03-11
- **Values:**
  - mev: 8
  - mav: 19
  - mrv: 26

**Rationale:** Grouped with side delts in Israetel's landmark system. Rear delts also receive indirect stimulus from rowing movements. Same volume tolerance as side delts.

**Notes:** Updated from {6, 12, 18}. Rear delts tolerate more volume than previously assumed. Partial contribution from rows should be factored in.

**Sources:**
- Israetel, M. — Renaissance Periodization, Side/Rear Delt Volume Landmarks (Expert Recommendation, 2023)

### Weekly volume landmarks for Triceps

- **ID:** `volume_landmarks_triceps`
- **Confidence:** Expert Consensus (multiple recognized experts)
- **Last Reviewed:** 2026-03-11
- **Values:**
  - mev: 6
  - mav: 12
  - mrv: 18

**Rationale:** Israetel recommends MEV of 4-6, MAV of 10-14 (midpoint ~12), MRV of 18. Triceps receive significant indirect volume from all pressing, so direct set counts should account for this.

**Notes:** Current values match research. These are DIRECT sets — pressing adds substantial partial contribution.

**Sources:**
- Israetel, M. — Renaissance Periodization, Triceps Volume Landmarks (Expert Recommendation, 2023)

### Weekly volume landmarks for Biceps

- **ID:** `volume_landmarks_biceps`
- **Confidence:** Expert Consensus (multiple recognized experts)
- **Last Reviewed:** 2026-03-11
- **Values:**
  - mev: 8
  - mav: 17
  - mrv: 26

**Rationale:** Israetel recommends MEV of 8, MAV range of 14-20 (midpoint ~17), MRV of 26. Biceps are a small muscle that recovers quickly and responds well to higher volumes and frequencies.

**Notes:** Updated from {6, 12, 18}. Biceps tolerate significantly more volume than previously assumed. Indirect volume from pulling should be factored in.

**Sources:**
- Israetel, M. — Renaissance Periodization, Biceps Volume Landmarks (Expert Recommendation, 2023)
- Schoenfeld, B.J. et al. (2019). Resistance Training Volume Enhances Muscle Hypertrophy. Med Sci Sports Exerc, 51(1):94-103 (Randomized Controlled Trial, 2019) — [link](https://pubmed.ncbi.nlm.nih.gov/30153194/)

### Weekly volume landmarks for Quads

- **ID:** `volume_landmarks_quads`
- **Confidence:** Expert Consensus (multiple recognized experts)
- **Last Reviewed:** 2026-03-11
- **Values:**
  - mev: 8
  - mav: 15
  - mrv: 20

**Rationale:** Israetel recommends MEV of 8, MAV range of 12-18 (midpoint ~15), MRV of 20. Quads are large muscles that generate significant systemic fatigue, capping MRV lower than smaller muscles despite responding to volume.

**Notes:** Schoenfeld 2019 showed continued quad gains up to 45 sets/week in trained men, but ecological validity is debated. Israetel's practical MRV of 20 accounts for systemic fatigue.

**Sources:**
- Israetel, M. — Renaissance Periodization, Quad Volume Landmarks (Expert Recommendation, 2023)
- Schoenfeld, B.J. et al. (2019). Resistance Training Volume Enhances Muscle Hypertrophy. Med Sci Sports Exerc, 51(1):94-103 (Randomized Controlled Trial, 2019) — [link](https://pubmed.ncbi.nlm.nih.gov/30153194/)

### Weekly volume landmarks for Hamstrings

- **ID:** `volume_landmarks_hamstrings`
- **Confidence:** Expert Consensus (multiple recognized experts)
- **Last Reviewed:** 2026-03-11
- **Values:**
  - mev: 6
  - mav: 13
  - mrv: 20

**Rationale:** Israetel recommends MEV of 6, MAV range of 10-16 (midpoint ~13), MRV of 20. Hamstrings receive indirect stimulus from squats and hip hinge movements.

**Notes:** Updated MAV from 12 to 13, MRV from 18 to 20 per Israetel data.

**Sources:**
- Israetel, M. — Renaissance Periodization, Hamstring Volume Landmarks (Expert Recommendation, 2023)

### Weekly volume landmarks for Glutes

- **ID:** `volume_landmarks_glutes`
- **Confidence:** Expert Consensus (multiple recognized experts)
- **Last Reviewed:** 2026-03-11
- **Values:**
  - mev: 0
  - mav: 8
  - mrv: 16

**Rationale:** Israetel notes glute MV/MEV of 0 — squats and hip hinge compounds provide sufficient stimulus for maintenance. Direct work (hip thrusts, etc.) needed only for prioritized growth. MAV of 4-12 (midpoint ~8).

**Notes:** MEV of 0 means compounds suffice. Updated from {4, 10, 16}. Atlas contribution weights from squats/RDLs count toward this.

**Sources:**
- Israetel, M. — Renaissance Periodization, Glute Volume Landmarks (Expert Recommendation, 2023)

### Weekly volume landmarks for Calves

- **ID:** `volume_landmarks_calves`
- **Confidence:** Expert Consensus (multiple recognized experts)
- **Last Reviewed:** 2026-03-11
- **Values:**
  - mev: 8
  - mav: 14
  - mrv: 20

**Rationale:** Israetel recommends MEV of 8, MAV of 12-16 (midpoint ~14), MRV of 20. Calves are endurance-adapted and require higher frequency and volume for growth.

**Notes:** Updated from {6, 12, 18}. Calves benefit from higher frequency (3-4x/week) and stretched-position training.

**Sources:**
- Israetel, M. — Renaissance Periodization, Calf Volume Landmarks (Expert Recommendation, 2023)

### Weekly volume landmarks for Core (rectus abdominis)

- **ID:** `volume_landmarks_core`
- **Confidence:** Placeholder (needs research validation)
- **Last Reviewed:** Not yet reviewed
- **Values:**
  - mev: 4
  - mav: 10
  - mrv: 16

**Rationale:** Core receives indirect stimulus from compound lifts. Direct ab work provides additional hypertrophy stimulus. Limited controlled research on optimal direct core volume.

**Notes:** Retained from original values. Needs research validation.

### Weekly volume landmarks for Lower Back (erector spinae)

- **ID:** `volume_landmarks_lower_back`
- **Confidence:** Placeholder (needs research validation)
- **Last Reviewed:** Not yet reviewed
- **Values:**
  - mev: 2
  - mav: 6
  - mrv: 10

**Rationale:** Lower back is heavily stimulated by deadlifts, squats, and rows. Direct isolation rarely needed. Very low MRV due to recovery demands and injury risk.

**Notes:** Retained from original values. Low volume is a safety-first default.

### Weekly volume landmarks for Traps

- **ID:** `volume_landmarks_traps`
- **Confidence:** Placeholder (needs research validation)
- **Last Reviewed:** Not yet reviewed
- **Values:**
  - mev: 4
  - mav: 10
  - mrv: 16

**Rationale:** Traps receive substantial indirect stimulus from deadlifts, rows, and overhead pressing. Israetel notes MV of 0 for traps from compounds alone. Direct work only for prioritized growth.

**Notes:** Israetel suggests MV=0 with compounds, but Atlas tracks direct sets separately. Kept conservative pending further review.

**Sources:**
- Israetel, M. — Renaissance Periodization (Expert Recommendation, 2023)

### Weekly volume landmarks for Forearms

- **ID:** `volume_landmarks_forearms`
- **Confidence:** Placeholder (needs research validation)
- **Last Reviewed:** Not yet reviewed
- **Values:**
  - mev: 2
  - mav: 8
  - mrv: 14

**Rationale:** Forearms are trained indirectly through all gripping movements. Direct work rarely necessary except for specific goals.

**Notes:** Retained from original values.

### Weekly volume landmarks for Rotator Cuff

- **ID:** `volume_landmarks_rotator_cuff`
- **Confidence:** Placeholder (needs research validation)
- **Last Reviewed:** Not yet reviewed
- **Values:**
  - mev: 2
  - mav: 6
  - mrv: 10

**Rationale:** Rotator cuff work is primarily for injury prevention, not hypertrophy. Low volumes of external rotation work are sufficient.

**Notes:** Prehab-focused. Retained from original values.

### Weekly volume landmarks for Brachialis

- **ID:** `volume_landmarks_brachialis`
- **Confidence:** Placeholder (needs research validation)
- **Last Reviewed:** Not yet reviewed
- **Values:**
  - mev: 2
  - mav: 6
  - mrv: 10

**Rationale:** Brachialis is trained through hammer curls and neutral-grip pulling. Typically tracked with biceps but separated here for precision.

**Notes:** Retained from original values.

### Weekly volume landmarks for Obliques

- **ID:** `volume_landmarks_obliques`
- **Confidence:** Placeholder (needs research validation)
- **Last Reviewed:** Not yet reviewed
- **Values:**
  - mev: 4
  - mav: 10
  - mrv: 16

**Rationale:** Obliques receive indirect stimulus from compound lifts requiring bracing. Direct work adds rotational/anti-rotational strength.

**Notes:** Retained from original values.

### Weekly volume landmarks for Hip Flexors

- **ID:** `volume_landmarks_hip_flexors`
- **Confidence:** Placeholder (needs research validation)
- **Last Reviewed:** Not yet reviewed
- **Values:**
  - mev: 2
  - mav: 6
  - mrv: 10

**Rationale:** Hip flexors are trained indirectly through squats and leg raises. Direct isolation rarely programmed.

**Notes:** Retained from original values.

### Weekly volume landmarks for Adductors

- **ID:** `volume_landmarks_adductors`
- **Confidence:** Placeholder (needs research validation)
- **Last Reviewed:** Not yet reviewed
- **Values:**
  - mev: 4
  - mav: 8
  - mrv: 14

**Rationale:** Adductors receive indirect stimulus from squats (especially wider stances). Direct work only for specific goals.

**Notes:** Retained from original values.

---

## Progression Thresholds

### Progression rules for strength rep range (1-5 reps)

- **ID:** `progression_strength_range`
- **Confidence:** Researched (peer-reviewed / RCT / meta-analysis)
- **Last Reviewed:** 2026-03-11
- **Values:**
  - minReps: 1
  - maxReps: 5
  - weightIncrementBarbell: 5
  - weightIncrementOther: 5
  - repIncrement: 1

**Rationale:** Standard strength training range. 5 lb barbell increments are the smallest standard plate jump. Rippetoe and other Starting Strength-derived programs use 5 lb jumps for both upper and lower body in this range.

**Notes:** 5 lb jumps work well for novices. Advanced lifters in this range may need 2.5 lb micro-plates — not yet modeled.

**Sources:**
- Rippetoe, M. & Baker, A. (2014). Practical Programming for Strength Training, 3rd Ed. (Published Textbook, 2014)
- Helms, E., Morgan, A., & Valdez, A. (2019). The Muscle and Strength Pyramids: Training, 2nd Ed. (Published Textbook, 2019)

### Progression rules for hypertrophy rep range (6-12 reps)

- **ID:** `progression_hypertrophy_range`
- **Confidence:** Researched (peer-reviewed / RCT / meta-analysis)
- **Last Reviewed:** 2026-03-11
- **Values:**
  - minReps: 6
  - maxReps: 12
  - weightIncrementBarbell: 5
  - weightIncrementOther: 2.5
  - repIncrement: 1

**Rationale:** 6-12 rep range is the conventional hypertrophy zone supported by Schoenfeld's research showing similar hypertrophy across 6-12 and even up to 30 reps, but 6-12 is most time-efficient. 5 lb barbell increments, 2.5 lb for dumbbells/cables (smaller muscles, lighter loads).

**Notes:** Double progression model: hit top of range across all sets → increase weight, drop to bottom of range.

**Sources:**
- Schoenfeld, B.J. et al. (2017). Strength and Hypertrophy Adaptations Between Low- vs. High-Load Resistance Training. J Strength Cond Res, 31(12):3508-3523 (Peer-Reviewed Study, 2017) — [link](https://pubmed.ncbi.nlm.nih.gov/28834797/)
- Helms, E., Morgan, A., & Valdez, A. (2019). The Muscle and Strength Pyramids: Training, 2nd Ed. (Published Textbook, 2019)

### Progression rules for endurance/metabolic rep range (13-20 reps)

- **ID:** `progression_endurance_range`
- **Confidence:** Expert Consensus (multiple recognized experts)
- **Last Reviewed:** 2026-03-11
- **Values:**
  - minReps: 13
  - maxReps: 20
  - weightIncrementBarbell: 5
  - weightIncrementOther: 2.5
  - repIncrement: 2

**Rationale:** Higher rep ranges for muscular endurance and metabolic stress. Larger rep increments (+2) because each rep represents a smaller percentage of total work at these volumes.

**Notes:** Rep increment of 2 is a practical choice — at 15+ reps, adding 1 rep per session is very slow progression.

**Sources:**
- Helms, E., Morgan, A., & Valdez, A. (2019). The Muscle and Strength Pyramids: Training, 2nd Ed. (Published Textbook, 2019)

### Rep completion ratio below which performance is classified as 'struggling significantly'

- **ID:** `progression_struggle_threshold`
- **Confidence:** Expert Consensus (multiple recognized experts)
- **Last Reviewed:** 2026-03-11
- **Values:**
  - ratio: 0.6

**Rationale:** If a lifter completes less than 60% of target reps, the weight is clearly too heavy. This threshold triggers a weight reduction rather than a maintain recommendation. The 60% threshold is a practical heuristic used in autoregulation literature.

**Notes:** Example: target 10 reps, actual < 6 reps → reduce weight.

**Sources:**
- Helms, E., Morgan, A., & Valdez, A. (2019). The Muscle and Strength Pyramids: Training, 2nd Ed. (Published Textbook, 2019)

### Number of consecutive sessions without progress before triggering a deload suggestion

- **ID:** `progression_stall_session_count`
- **Confidence:** Researched (peer-reviewed / RCT / meta-analysis)
- **Last Reviewed:** 2026-03-11
- **Values:**
  - sessions: 3

**Rationale:** 3 sessions is the standard threshold used in linear progression programs (Starting Strength, StrongLifts). After 3 failed attempts at the same weight, accumulated fatigue is likely the issue rather than acute underperformance.

**Notes:** Some coaches use 2 sessions, some use 3. 3 is more conservative and avoids premature deloads from one bad day.

**Sources:**
- Rippetoe, M. & Baker, A. (2014). Practical Programming for Strength Training, 3rd Ed. (Published Textbook, 2014)
- Mehdi. StrongLifts 5x5 Program (Coaching Standard, 2020) — [link](https://stronglifts.com/5x5/)

### Percentage to reduce weight during a deload

- **ID:** `progression_deload_weight_reduction`
- **Confidence:** Researched (peer-reviewed / RCT / meta-analysis)
- **Last Reviewed:** 2026-03-11
- **Values:**
  - reductionPct: 0.1
  - deloadRepBoost: 2

**Rationale:** 10% weight reduction is the consensus recommendation across coaching literature. Bell et al. Delphi consensus found ~10% intensity reduction is appropriate. The +2 rep boost during deload increases time under tension at the lighter weight for continued stimulus.

**Notes:** Applied as: newWeight = currentWeight × 0.9, rounded to nearest increment.

**Sources:**
- Bell, L. et al. (2023). Delphi consensus on deloading. Frontiers in Sports and Active Living, PMC10511399 (Peer-Reviewed Study, 2023) — [link](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10511399/)
- Rippetoe, M. & Baker, A. (2014). Practical Programming for Strength Training, 3rd Ed. (Published Textbook, 2014)

### How many reps below target is still considered 'close' (maintain rather than reduce)

- **ID:** `progression_close_to_target_buffer`
- **Confidence:** Placeholder (needs research validation)
- **Last Reviewed:** Not yet reviewed
- **Values:**
  - buffer: 2

**Rationale:** If average reps are within 2 of the target, the lifter is close enough to maintain and push for full completion next session rather than reducing weight.

**Notes:** Practical heuristic. Needs validation.

---

## Deload Parameters

### Recommended training weeks between planned deloads

- **ID:** `deload_frequency`
- **Confidence:** Researched (peer-reviewed / RCT / meta-analysis)
- **Last Reviewed:** 2026-03-11
- **Values:**
  - minWeeks: 3
  - typicalWeeks: 5
  - maxWeeks: 8
  - beginnerMaxWeeks: 12

**Rationale:** Bell et al. (2024) survey found mean deload frequency of 5.6 ± 2.3 weeks. Coaching consensus from Bell et al. (2023) qualitative study is 4-6 weeks. Israetel notes beginners can train up to 12 weeks before needing a deload due to lower absolute intensity.

**Notes:** Currently Atlas doesn't implement planned deloads — only reactive deloads triggered by stalls. This data supports future planned deload feature.

**Sources:**
- Bell, L. et al. (2024). Deloading practices in resistance training: a cross-sectional survey. Sports Medicine - Open, PMC10948666 (Peer-Reviewed Study, 2024) — [link](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10948666/)
- Bell, L. et al. (2023). Coaches' perceptions of deloading. Frontiers in Sports and Active Living, PMC9811819 (Peer-Reviewed Study, 2023) — [link](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9811819/)
- Israetel, M. — Renaissance Periodization (Expert Recommendation, 2023)

### Duration of a deload period

- **ID:** `deload_duration`
- **Confidence:** Researched (peer-reviewed / RCT / meta-analysis)
- **Last Reviewed:** 2026-03-11
- **Values:**
  - minDays: 5
  - typicalDays: 7
  - maxDays: 10

**Rationale:** Bell et al. (2024) survey found mean deload duration of 6.4 ± 1.7 days. Exercise physiology literature confirms less than 7 days of reduced training shows no measurable strength loss.

**Notes:** One week is the practical standard since most programs run on weekly cycles.

**Sources:**
- Bell, L. et al. (2024). Sports Medicine - Open, PMC10948666 (Peer-Reviewed Study, 2024) — [link](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10948666/)

### Volume and intensity reduction during deload

- **ID:** `deload_volume_reduction`
- **Confidence:** Researched (peer-reviewed / RCT / meta-analysis)
- **Last Reviewed:** 2026-03-11
- **Values:**
  - volumeReductionLow: 0.25
  - volumeReductionMod: 0.5
  - volumeReductionHigh: 0.75
  - intensityReduction: 0.1

**Rationale:** Bell et al. (2023) Delphi consensus: low recovery need = 25-45% volume reduction, moderate = 40-60%, high = 60-90%. Intensity reduction of ~10% across all tiers. Maintaining some training intensity during deloads preserves neuromuscular adaptations.

**Notes:** Ogasawara showed 6 weeks on / 3 weeks off = same hypertrophy as continuous training (untrained subjects, bench press only). Supports the idea that periodic rest doesn't cost gains.

**Sources:**
- Bell, L. et al. (2023). Delphi consensus on deloading. Frontiers in Sports and Active Living, PMC10511399 (Peer-Reviewed Study, 2023) — [link](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10511399/)
- Ogasawara, R. et al. (2013). Comparison of muscle hypertrophy following 6-month continuous and periodic resistance training. Eur J Appl Physiol, 113(4):975-85 (Randomized Controlled Trial, 2013) — [link](https://pubmed.ncbi.nlm.nih.gov/23053130/)

---

## Readiness Score

### Component weights for composite readiness score

- **ID:** `readiness_score_weights`
- **Confidence:** Researched
- **Last Reviewed:** 2026-03-11
- **Values:**
  - withData: {"plan":0.30,"execution":0.50,"progression":0.20}
  - noData: {"plan":1,"execution":0,"progression":0}

**Rationale:** Execution/adherence is the dominant predictor of training outcomes (Helms pyramid base, BJSM 2023 meta-analysis of 178 studies). All reasonable programs produce gains; adherence determines whether gains are realized. Progression is a meaningful co-factor (~2x hypertrophy effect) but partially redundant with adherence. 70% adherence is a critical threshold (Scott et al.).

**Sources:**
- Helms, E., Morgan, A., Valdez, A. — The Muscle and Strength Pyramids (Expert Framework, 2019) — [link](https://muscleandstrengthpyramids.com/)
- Currier, B.S. et al. (2023). Resistance training prescription for muscle strength and hypertrophy: a Bayesian network meta-analysis. Br J Sports Med, PMC10579494 (Meta-Analysis, 2023) — [link](https://pmc.ncbi.nlm.nih.gov/articles/PMC10579494/)
- Lally, P. et al. (2010). How are habits formed. European Journal of Social Psychology, 40(6), 998-1009 (Peer-Reviewed Study, 2010) — [link](https://onlinelibrary.wiley.com/doi/10.1002/ejsp.674)
- Scott, J.M. et al. — Exercise Relative Dose Intensity and 70% adherence threshold. PMC12376820 (Peer-Reviewed Study, 2024) — [link](https://pmc.ncbi.nlm.nih.gov/articles/PMC12376820/)

**Notes:** Full research summary at `.docs/research-summaries/readiness-score-weights.md`. Future work: define sub-calculations within each component, explore context-sensitive multipliers.

---

## Volume Adherence

### Ratio thresholds for classifying actual vs planned volume adherence

- **ID:** `volume_adherence_thresholds`
- **Confidence:** Placeholder (needs research validation)
- **Last Reviewed:** Not yet reviewed
- **Values:**
  - significantlyUnder: 0.5
  - under: 0.8
  - over: 1.2

**Rationale:** Below 50% of planned volume is a significant deviation likely to impair results. 80-120% is a practical 'on track' band. Above 120% may indicate recovery risk or plan mismatch.

**Notes:** Heuristic thresholds. No specific study defines these cutoffs for training adherence classification.

---

## Strength Trends

### Percentage change thresholds for classifying strength progression direction

- **ID:** `strength_trend_thresholds`
- **Confidence:** Placeholder (needs research validation)
- **Last Reviewed:** Not yet reviewed
- **Values:**
  - progressingPct: 5
  - regressingPct: -5

**Rationale:** A 5% change in estimated 1RM over the analysis window represents a meaningful shift. Smaller changes are within normal session-to-session variation (fatigue, sleep, nutrition).

**Notes:** ±5% is a common practical threshold in strength coaching. Could be refined with test-retest reliability data for 1RM estimates.

---

## Contribution Weights

### Default multipliers for calculating effective sets based on muscle role in an exercise. Individual exercises in exercise-data.js may override these defaults with exercise-specific values (e.g., 0.3 for hamstrings in hip thrusts).

- **ID:** `contribution_weights`
- **Confidence:** research_supported
- **Last Reviewed:** 2026-03-11
- **Values:**
  - direct: 1
  - partial: 0.5
  - minimal: 0.25

**Rationale:** The 0.5 'half-set' rule for secondary movers is the most widely used practical value in fractional set counting. Pelland et al. (2024) tested three volume quantification methods (total, fractional at 0.5, direct-only) across 67 studies and found the fractional method had the strongest relative evidence for predicting hypertrophy (Bayes Factor = 9.48). Their exploratory analysis estimated indirect sets contribute ~32% of a direct set for hypertrophy, but the 0.5 model still provided the best overall fit. Henselmans advocates 0.5 explicitly: '6 sets of rows = 3 sets of effective biceps work.' The 0.25 minimal weight represents tertiary/stabilizer muscles with limited hypertrophic stimulus.

**Notes:** Default 0.5 is the best-fit fractional model per Pelland et al. Individual exercises override this where biomechanics warrant lower values: hamstrings from hip-dominant exercises (hip thrust, glute bridge, swings) use 0.3 because hams are not lengthened under load; core from compound stabilization (front squat, single-leg RDL) uses 0.3 because isometric bracing does not drive hypertrophy like dynamic work. See exercise-data.js for all per-exercise overrides.

**Sources:**
- Pelland, J.C. et al. — The Resistance Training Dose Response: Meta-Regressions Exploring the Effects of Weekly Volume and Frequency on Muscle Hypertrophy and Strength Gains (Meta-Analysis, 2024)
- Henselmans, M. — How to count training volume and design a sensible training split (Expert Recommendation, 2023) — [link](https://mennohenselmans.com/how-to-count-training-volume-design-training-split/)
- Outlift / Nuckols, G. — Hypertrophy Training Volume: How Many Sets to Build Muscle? (Expert Recommendation, 2023) — [link](https://outlift.com/hypertrophy-training-volume/)
- Stronger by Science — What Does EMG Amplitude Tell Us About Muscle Hypertrophy? (review_article, 2023) — [link](https://www.strongerbyscience.com/emg-amplitude-tell-us-muscle-hypertrophy/)

---

## Insight Milestones & Detection

### Workout streak counts that trigger celebration insights

- **ID:** `insight_streak_milestones`
- **Confidence:** Placeholder (needs research validation)
- **Last Reviewed:** Not yet reviewed
- **Values:**
  - milestones: [3, 5, 7, 10, 14, 21, 28]

**Rationale:** Spaced-out milestones to encourage consistency. Early milestones (3, 5, 7) reinforce habit formation during the critical first weeks. Later milestones (14, 21, 28) celebrate sustained commitment.

**Notes:** Behavioral — not exercise science. Could be informed by habit formation research (e.g., Lally et al. 2010 — 66 days average for habit automaticity).

### Total workout counts that trigger celebration insights

- **ID:** `insight_workout_milestones`
- **Confidence:** Placeholder (needs research validation)
- **Last Reviewed:** Not yet reviewed
- **Values:**
  - milestones: [1, 5, 10, 25, 50, 75, 100, 150, 200]

**Rationale:** Acknowledge total volume of work. First workout is a significant milestone. Subsequent milestones are spaced further apart as the accomplishment is less novel.

**Notes:** Behavioral design choice. Gamification-informed.

### Thresholds for detecting stalls, regressions, and consistency issues

- **ID:** `insight_detection_thresholds`
- **Confidence:** Placeholder (needs research validation)
- **Last Reviewed:** Not yet reviewed
- **Values:**
  - stallSessions: 3
  - stallChangePct: 5
  - regressionSessions: 3
  - regressionChangePct: -5
  - consistencyHigh: 90
  - consistencyLow: 50
  - consistencyMinDays: 4

**Rationale:** 3 sessions is consistent with the stall detection used in progression engine. ±5% matches the strength trend thresholds. 90% completion is high adherence; below 50% with 4+ planned days indicates significant inconsistency.

**Notes:** Mirrors progression_stall_session_count and strength_trend_thresholds for consistency.

---

## Plan Engine

### Default weekly progressive overload percentage for plan construction

- **ID:** `plan_progressive_overload_rate`
- **Confidence:** Expert Consensus (multiple recognized experts)
- **Last Reviewed:** 2026-03-11
- **Values:**
  - weeklyPct: 2.5

**Rationale:** 2.5% weekly overload across a 4-week mesocycle yields ~10% total increase, which aligns with intermediate progression rates. Helms and Nuckols recommend similar weekly micro-loading for intermediates.

**Notes:** This is applied during plan construction as a percentage increase per week.

**Sources:**
- Helms, E., Morgan, A., & Valdez, A. (2019). The Muscle and Strength Pyramids: Training, 2nd Ed. (Published Textbook, 2019)

### Threshold below which a muscle is flagged as undertrained (gap)

- **ID:** `plan_gap_detection_threshold`
- **Confidence:** Placeholder (needs research validation)
- **Last Reviewed:** Not yet reviewed
- **Values:**
  - pctOfMAV: 0.8

**Rationale:** If actual effective sets fall below 80% of MAV for a muscle, the plan likely has a gap worth addressing. This allows some room below MAV without triggering false positives.

**Notes:** Practical heuristic. 80% provides a reasonable buffer — 70% might miss real gaps, 90% would be too sensitive.

---

## Research Backlog

The following rules are currently set to **placeholder** confidence and need research validation:

- [ ] `volume_landmarks_core` — Weekly volume landmarks for Core (rectus abdominis)
- [ ] `volume_landmarks_lower_back` — Weekly volume landmarks for Lower Back (erector spinae)
- [ ] `volume_landmarks_traps` — Weekly volume landmarks for Traps
- [ ] `volume_landmarks_forearms` — Weekly volume landmarks for Forearms
- [ ] `volume_landmarks_rotator_cuff` — Weekly volume landmarks for Rotator Cuff
- [ ] `volume_landmarks_brachialis` — Weekly volume landmarks for Brachialis
- [ ] `volume_landmarks_obliques` — Weekly volume landmarks for Obliques
- [ ] `volume_landmarks_hip_flexors` — Weekly volume landmarks for Hip Flexors
- [ ] `volume_landmarks_adductors` — Weekly volume landmarks for Adductors
- [ ] `progression_close_to_target_buffer` — How many reps below target is still considered 'close' (maintain rather than reduce)
- [x] `readiness_score_weights` — Component weights for composite readiness score (RESOLVED 2026-03-11: 30/50/20)
- [ ] `volume_adherence_thresholds` — Ratio thresholds for classifying actual vs planned volume adherence
- [ ] `strength_trend_thresholds` — Percentage change thresholds for classifying strength progression direction
- [ ] `insight_streak_milestones` — Workout streak counts that trigger celebration insights
- [ ] `insight_workout_milestones` — Total workout counts that trigger celebration insights
- [ ] `insight_detection_thresholds` — Thresholds for detecting stalls, regressions, and consistency issues
- [ ] `plan_gap_detection_threshold` — Threshold below which a muscle is flagged as undertrained (gap)

---

## Legend

### Confidence Levels

- **researched**: Researched (peer-reviewed / RCT / meta-analysis)
- **expert_consensus**: Expert Consensus (multiple recognized experts)
- **placeholder**: Placeholder (needs research validation)

### Source Types

- **meta_analysis**: Meta-Analysis
- **rct**: Randomized Controlled Trial
- **peer_reviewed**: Peer-Reviewed Study
- **textbook**: Published Textbook
- **expert_recommendation**: Expert Recommendation
- **coaching_standard**: Coaching Standard

