# Research Summary: Readiness Score Component Weights

**Date:** 2026-03-11
**Status:** Applied
**Rule ID:** `readiness_score_weights`
**Decision:** Execution/Adherence 50%, Plan Quality 30%, Progression Trend 20%

---

## Decision Rationale

The readiness score is Atlas's composite metric summarizing a user's training effectiveness — analogous to Whoop's "Recovery Score." It combines three components: plan quality, execution/adherence, and progression trend.

Research across exercise science, behavioral psychology, and expert coaching consensus overwhelmingly supports **adherence as the dominant predictor of training outcomes**, justifying the heaviest weighting.

| Component | Previous Weight | New Weight | Direction |
|-----------|:-:|:-:|:-:|
| Execution/Adherence | 40% | **50%** | +10% |
| Plan Quality | 35% | **30%** | -5% |
| Progression Trend | 25% | **20%** | -5% |

---

## 1. Adherence/Consistency as the Dominant Predictor

### Helms' Muscle & Strength Pyramid
Adherence is the **base of the pyramid** — the most important factor for both training and nutrition. "That which on paper looks the best but makes us fall off the wagon is going to produce a worse outcome than something slightly suboptimal that we can adhere to."

### Bayesian Network Meta-Analysis (2023, BJSM)
178 studies (n=5,097) for strength and 119 studies (n=3,364) for hypertrophy. **All protocols** increased strength and hypertrophy. The authors conclude future work should focus on promoting engagement and adherence rather than chasing a single "optimal" protocol.

### Minimum Effective Dose (2024, PMC)
Even 1-2 working sets per exercise, once per week, produces significant strength gains in beginners. A "mediocre" low-volume program done consistently outperforms a sophisticated program done sporadically.

### 70% Adherence Threshold
Scott et al. found 70% Exercise Relative Dose Intensity is a critical threshold. Individuals below 70% experienced an 11% decline in fitness; those at or above 70% saw significant improvement.

### Dropout Reality
- ~50% of adults who start a program drop out within months
- Only 18.1% of beginner app users remained adherent at 6 months (median dropout: 14 weeks)
- Training >8 sessions/month significantly reduced dropout risk

### Expert Consensus (Helms, Nuckols, Israetel, Tuchscherer, Lewis)
"Consistency and adherence trump the perfect program." Nuckols designed MacroFactor to be "adherence neutral" — adapting to imperfect behavior rather than punishing it.

---

## 2. Progressive Overload as a Co-Factor

### Direct Evidence (2025-2026 Experimental Study)
- Progressive overload group: +21-25% triceps thickness
- Non-progressive group: +11-12%
- Control: +1-2.5%

Progressive overload roughly **doubles hypertrophy magnitude** — but non-progressive training still produces meaningful results.

### Volume Load Is Not Independently Predictive (in Males)
Haun et al. (2014, 83 subjects, 12 weeks): When sets and relative intensity were equated, total volume load was NOT independently associated with hypertrophy in males. Baseline strength was a stronger predictor.

### Leading vs Lagging Indicator
- Strength gains are a **leading indicator** (neural adaptations first, measurable week-to-week)
- Hypertrophy is a **lagging indicator** (requires ~6-7 weeks minimum to manifest)
- Rate of load progression (delta) correlates positively with hypertrophy magnitude

### Co-Factor With Adherence
If you adhere consistently and train with effort, you naturally progress. Progression is partly a *consequence* of adherence, not fully independent — justifying a lower independent weight.

---

## 3. Plan Quality: Real but Smaller Effect Size

### All Reasonable Programs Work
The BJSM meta-analysis found all protocols produced gains. The variance between "good" and "optimal" programs is small compared to the variance between "adherent" and "non-adherent" execution.

### Load Independence of Hypertrophy
Multiple meta-analyses confirm hypertrophy is largely load-independent when volume is equated. "Suboptimal" load choices (lighter weights) produce similar muscle growth to "optimal" ones when training to near-failure.

### Still Matters at 30%
Plan quality captures whether the user is training the right muscles with adequate volume — important for preventing imbalances and ensuring minimum effective volume. It is the only signal available before execution data exists (noData mode: plan = 100%).

---

## 4. Behavioral Science — Score Design Principles

### Lally et al. (2010) — Habit Formation
- Median time to automaticity: **66 days** (range: 18-254)
- Exercise habits take ~1.5x longer than eating/drinking habits
- **Missing a single day does NOT significantly affect** the habit formation process
- Asymptotic curve: early repetitions matter most

### Gamification Research
- **Context-sensitive scoring** (PMC, 2024): Points should be more rewarding when behavior is new/difficult
- **Self-Determination Theory**: Scores serve the competence need — feeling progress
- **S-shaped relationship** (Frontiers, 2025): Too many features overwhelm users. Keep scoring simple
- **Streaks have a dark side**: Can increase anxiety, guilt, burnout. Be forgiving of missed days

### Design Implications for Atlas
1. **Be forgiving of single missed days** (Lally: doesn't derail habit formation)
2. **Strongly reward early consistency** (first 28 days is strongest predictor of long-term adherence)
3. **Use context-sensitive scoring** (award more when behavior is new/difficult)
4. **Keep scoring simple** (comprehensible at a glance, like Whoop's 0-100 recovery score)
5. **Track progressive overload as a leading indicator**, not just an outcome metric
6. **Design for "adherence neutrality"** — adapt to imperfect behavior rather than punishing it

---

## Key Citations

| Source | Type | URL |
|--------|------|-----|
| Helms, Morgan, Valdez — Muscle & Strength Pyramids | Expert framework | [muscleandstrengthpyramids.com](https://muscleandstrengthpyramids.com/) |
| Bayesian Network Meta-Analysis (2023, BJSM) | Meta-analysis (178 studies) | [PMC10579494](https://pmc.ncbi.nlm.nih.gov/articles/PMC10579494/) |
| Minimum Effective Dose Strategies (2024) | Systematic review | [PMC11127831](https://pmc.ncbi.nlm.nih.gov/articles/PMC11127831/) |
| Scott et al. — 70% Adherence Threshold | Clinical study | [PMC12376820](https://pmc.ncbi.nlm.nih.gov/articles/PMC12376820/) |
| Progressive Overload & Hypertrophy (2025-2026) | Experimental | [ResearchGate](https://www.researchgate.net/publication/400404759) |
| Lally et al. (2010) — Habit Formation | Landmark study | [Wiley](https://onlinelibrary.wiley.com/doi/10.1002/ejsp.674) |
| Gamification of Behavior Change (2024) | Mathematical framework | [PMC10998180](https://pmc.ncbi.nlm.nih.gov/articles/PMC10998180/) |
| Nuckols — MacroFactor Philosophy | Expert design | [strongerbyscience.com](https://www.strongerbyscience.com/macrofactor-algorithms-philosophy/) |

---

## Future Work

- Define the specific sub-calculations within each component (e.g., how exactly execution % is computed — rolling window vs. all-time, weighting recent weeks more heavily)
- Explore context-sensitive multipliers for the score (e.g., higher execution weight during first 66 days of training)
- Design the user-facing presentation (0-100 scale, color coding, trend indicators)
- Investigate whether a 4th component (recovery/nutrition) should be added when trackable data becomes available
