# Research Summary: Medium-Priority Volume Landmarks (9 Minor Muscle Groups)

> **Date:** 2026-03-11
> **Rules affected:** `volume_landmarks_traps`, `volume_landmarks_core`, `volume_landmarks_obliques`, `volume_landmarks_forearms`, `volume_landmarks_lower_back`, `volume_landmarks_brachialis`, `volume_landmarks_rotator_cuff`, `volume_landmarks_hip_flexors`, `volume_landmarks_adductors`
> **Outcome:** 7 of 9 rules updated (values changed); 2 of 9 validated as-is. All 9 upgraded from `"placeholder"` → `"expert_consensus"`.

---

## Sources

### Primary
- **Israetel, M. — Renaissance Periodization (RP) Hypertrophy Training Guides** (2023). Muscle-specific articles for traps, abs, forearms. Published at rpstrength.com/blogs/articles/.
- **RP Volume Landmarks Community Reference Tool** — https://volume-landmarks-rp-rals.vercel.app/ (aggregates all RP landmark data into a single table).

### Supporting
- **Kubo, K. et al.** — Squat depth and muscle volume changes. Found squats increase adductor muscle volume by ~6.2% over 10 weeks.
- **Vigotsky, A. & Bryanton, M.** — Biomechanical analysis of hip extension in squats. Half or more of hip extension torque comes from adductor magnus.
- **AAOS Shoulder Conditioning Protocol** — Recommends 2-4 sets × 2-3 sessions/week (6-12 sets/week) for rotator cuff prehab.
- **E3 Rehab** — Evidence-based shoulder prehab programming. Supports low-volume external rotation work for injury prevention.
- **Pelland, J. et al. (2024)** — Meta-regression on indirect volume contribution (context for how Atlas counts effective sets).

---

## Key RP Data Points

RP publishes volume landmarks for traps, abs, and forearms. These are **direct sets only** — RP explicitly states: *"When we say '18 sets is the MRV,' we mean direct work only. We've already factored in indirect volume."*

| Muscle | RP MV | RP MEV | RP MAV | RP MRV | RP Freq |
|--------|-------|--------|--------|--------|---------|
| Traps | 0 | 0 | 12-20 | 26 | 2-6x/wk |
| Abs | 0 | 0 | 16-20 | 25 | 3-5x/wk |
| Forearms | 0 | 0 | low | low | 3-6x/wk |

MEV=0 means **compounds alone provide sufficient stimulus** — zero direct sets needed for maintenance or even modest growth.

---

## Atlas Context: Effective Sets vs. Direct Sets

Atlas uses `computeEffectiveSets()` which counts weighted contributions:
- Direct: ×1.0
- Partial: ×0.5
- Minimal: ×0.25

This means RP's direct-only numbers need adjustment downward for MAV/MRV when used in Atlas, because Atlas's effective set count already includes indirect volume. For example, RP says trap MAV=12-20 for direct sets, but Atlas would count someone doing 10 sets of rows as having ~5 effective trap sets already. We use the **conservative (low) end** of RP ranges for MAV/MRV to account for this.

---

## Per-Muscle Findings

### 1. Traps
**RP Official:** MV=0, MEV=0, MAV=12-20, MRV=26
- Compounds (deadlifts, rows, overhead presses) provide substantial indirect trap stimulus
- MEV=0 confirmed: zero direct trap work needed for maintenance
- Atlas adjustment: MAV=12 (low end), MRV=20 (below RP's 26) because Atlas effective sets already include indirect volume
- **Change:** 4/10/16 → **0/12/20**

### 2. Core (Rectus Abdominis)
**RP Official:** MV=0, MEV=0, MAV=16-20, MRV=25
- Abs can handle very high volumes and recover quickly (high frequency tolerance: 3-5x/week)
- Compound bracing provides maintenance-level stimulus
- Abs respond well to higher direct volume for hypertrophy
- **Change:** 4/10/16 → **0/16/25**

### 3. Obliques
**No RP-specific guide.** Extrapolated from abs guide and general core training research.
- Obliques receive indirect stimulus from compound bracing and anti-rotation demands
- Most lifters never train obliques directly
- Smaller muscle group than rectus abdominis — lower MAV warranted
- **Change:** 4/10/16 → **0/8/16**

### 4. Forearms
**RP Official:** MV=0, MEV=0. "Relatively low volume needs and tolerances." Max 1 exercise per session.
- Every gripping movement provides indirect forearm stimulus
- RP recommends myoreps for efficiency — low total set count needed
- Direct forearm work is rarely necessary except for specific aesthetic or grip-sport goals
- **Change:** 2/8/14 → **0/6/12**

### 5. Lower Back (Erector Spinae)
**No RP-specific guide.** Safety-first approach.
- Heavily stimulated by deadlifts, squats, rows (isometric loading)
- High direct volume → accumulated fatigue → injury risk
- Some coaches argue minimal direct work (back extensions) is beneficial for spinal health
- Conservative values are the correct default for a safety-sensitive muscle
- **No change:** 2/6/10 confirmed

### 6. Brachialis
**No RP-specific guide.** Treated as biceps synergist.
- All bicep training (especially hammer curls, neutral-grip pulling) trains brachialis
- Most lifters never isolate the brachialis
- Separate tracking from biceps has marginal value — MEV=0 avoids false alerts
- **Change:** MEV only: 2/6/10 → **0/6/10**

### 7. Rotator Cuff
**No RP-specific guide.** Prehab literature.
- AAOS recommends 6-12 sets/week for shoulder prehab (2-4 sets × 2-3 sessions)
- Not trained for hypertrophy — prehab/injury prevention focus
- MEV=2 is appropriate: a small dose of external rotation is genuinely recommended
- Current values fall within evidence-based prehab range
- **No change:** 2/6/10 confirmed

### 8. Hip Flexors
**No RP-specific guide.** Very limited research.
- Indirect stimulus from squats, leg raises, and hanging knee raises
- Rarely trained for hypertrophy in isolation
- Flagging "undertrained" for hip flexors is not actionable for most users
- **Change:** MEV only: 2/6/10 → **0/6/10**

### 9. Adductors
**No RP-specific guide.** Biomechanics research.
- Kubo: squats increase adductor volume by ~6.2% over 10 weeks
- Vigotsky/Bryanton: adductor magnus contributes 50%+ of hip extension torque in squats
- Wide-stance squats, lunges, and leg presses provide substantial indirect stimulus
- MEV=4 was causing false "undertrained" alerts for lifters who squat but don't do machine adductions
- **Change:** MEV only: 4/8/14 → **0/8/14**

---

## Summary of Changes

| Muscle | Old MEV/MAV/MRV | New MEV/MAV/MRV | Changed? |
|--------|-----------------|-----------------|----------|
| Traps | 4/10/16 | **0/12/20** | Yes — all 3 |
| Core | 4/10/16 | **0/16/25** | Yes — all 3 |
| Obliques | 4/10/16 | **0/8/16** | Yes — MEV, MAV |
| Forearms | 2/8/14 | **0/6/12** | Yes — all 3 |
| Lower Back | 2/6/10 | 2/6/10 | No |
| Brachialis | 2/6/10 | **0/6/10** | Yes — MEV only |
| Rotator Cuff | 2/6/10 | 2/6/10 | No |
| Hip Flexors | 2/6/10 | **0/6/10** | Yes — MEV only |
| Adductors | 4/8/14 | **0/8/14** | Yes — MEV only |

**Key principle:** MEV=0 for muscles that receive adequate indirect stimulus from compounds. This eliminates false "undertrained" alerts while preserving meaningful MAV/MRV zones for lifters who do choose to train these muscles directly.
