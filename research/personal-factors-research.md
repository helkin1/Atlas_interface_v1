# Personal Factor Research: Evidence-Based Training Modifications
## Atlas Intelligence Engine — Research Foundation
### Date: March 2026

> This document compiles evidence-based research on how personal factors (experience level, age, biological sex, training goals, and injuries) should modify resistance training programming. Each section includes specific findings, recommended multipliers/modifiers, confidence levels, and full source citations. This research directly informs the personalization-engine layer architecture.
>
> The research is organized into five files by factor:
> 1. `01-experience-level.md` — How training experience changes volume needs, progression, frequency, deloading
> 2. `02-age.md` — How age affects recovery, volume tolerance, hormones, joint health
> 3. `03-sex.md` — Sex-based differences in fatigue resistance, volume tolerance, fiber types
> 4. `04-goals.md` — Goal-specific programming for hypertrophy, strength, endurance, recomp, general fitness
> 5. `05-injuries.md` — Injury-region modifications, contraindications, rehab protocols

---

## Summary of Confidence Levels Across All Factors

| Factor | Sub-area | Confidence | Notes |
|--------|----------|------------|-------|
| **Experience** | Volume landmarks by level | High | Multiple meta-analyses support dose-response curves |
| **Experience** | Beginner ceiling (~12-14 sets) | Moderate-High | Barbalho 2019 directly tested; Schoenfeld 2017 meta-analysis |
| **Experience** | Advanced need for higher volume | High | Mechanistic (anabolic resistance) + empirical (Schoenfeld 2019) |
| **Experience** | Progression rate by level | Moderate | Large inter-individual variation; McDonald model broadly supported |
| **Experience** | Deload frequency | Low-Moderate | Mostly practitioner consensus; limited RCT evidence |
| **Age** | MRV declines with age | Moderate | Indirect evidence; no direct MRV measurement studies across decades |
| **Age** | Hypertrophy potential preserved | High | Multiple meta-analyses confirm older adults build muscle |
| **Age** | Recovery time increases | Moderate | Indirect evidence from volume tolerance and MPS duration studies |
| **Age** | Joint/connective tissue changes | High | Well-established in orthopedic and sports medicine literature |
| **Sex** | Between-set recovery advantage (female) | High | Nuckols 2026; Hunter 2014; consistent across study designs |
| **Sex** | Between-session recovery | Moderate | Nuckols 2026 suggests similarity; fewer direct comparisons |
| **Sex** | Volume tolerance (MRV) higher in women | Moderate | Mechanistic inference from fatigue resistance; not directly measured |
| **Sex** | Menstrual cycle effects | Moderate-High (trivial) | Umbrella review confirms no meaningful population-level effect |
| **Sex** | Relative hypertrophy rate same | High | Multiple meta-analyses converge |
| **Goals** | Hypertrophy rep ranges (6-30 reps) | High | Schoenfeld 2021 meta-analysis; proximity to failure matters more |
| **Goals** | Strength requires heavy loads | High | Schoenfeld 2017; NSCA guidelines |
| **Goals** | Recomp feasibility | Moderate-High | Barakat 2020 meta-analysis; context-dependent on training status |
| **Goals** | Concurrent training interference | High | Wilson 2012 meta-analysis; Hickson 1980 original finding |
| **Injury** | Shoulder exercise contraindications | High | Well-established clinical guidelines; Kolber 2014 |
| **Injury** | Training through vs. around pain | Moderate-High | Kristensen & Franklyn-Miller 2012; emerging evidence favors modified training |
| **Injury** | Preventive training effectiveness | High | Lauersen 2018 meta-analysis: strength training reduces injury risk by 66% |
| **Injury** | Specific rehab protocols | Moderate | Varies by region; some areas better studied than others |

---

## How This Research Maps to the Personalization Engine

### Experience Layer
- Volume landmarks scale by level (beginner MEV ~4-6, intermediate ~8-10, advanced ~10-14)
- Progression engine uses level-specific weight increment expectations
- Deload timing adjusts (beginners 6-8 wk, intermediate 4-6 wk, advanced 3-5 wk)

### Age Layer
- MRV modifier decreases with age (sharpest after 50)
- Recovery time considerations for frequency recommendations
- Joint-stress sensitivity increases — influences exercise suggestions

### Sex Layer
- Minor MRV increase for women (~5-10%, conservative given moderate evidence)
- No rep range or exercise selection changes
- Menstrual cycle: not implemented (insufficient evidence)

### Goal Layer
- Muscle importance weights set per goal profile
- Volume targets shift (MAV for priority muscles, MEV for maintenance)
- Rep range and intensity defaults change per goal

### Injury Layer
- Affected muscles mapped per injury region
- Volume caps and weight overrides applied
- Exercise contraindication flagging
- Rehab/prehab suggestions
