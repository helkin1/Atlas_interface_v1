// ============================================================
// rules-knowledge-base.js — Research-backed rules knowledge base
// Single source of truth for all exercise science values used
// by Atlas intelligence engines. Every value carries its
// rationale, source citations, confidence level, and review date.
//
// Confidence levels:
//   "researched"        — backed by peer-reviewed studies or meta-analyses
//   "expert_consensus"  — supported by multiple recognized experts/coaches
//   "placeholder"       — reasonable guess, needs research validation
//
// Source types:
//   "meta_analysis"          — systematic review / meta-analysis
//   "rct"                    — randomized controlled trial
//   "peer_reviewed"          — other peer-reviewed study
//   "textbook"               — published training textbook
//   "expert_recommendation"  — recognized expert / coach recommendation
//   "coaching_standard"      — widely accepted coaching practice
// ============================================================

const RULES = [

  // ════════════════════════════════════════════════════════════
  // VOLUME LANDMARKS — Weekly effective sets per muscle group
  // ════════════════════════════════════════════════════════════

  {
    id: "volume_landmarks_chest",
    category: "volume",
    description: "Weekly volume landmarks for Chest",
    values: { mev: 6, mav: 16, mrv: 22 },
    rationale: "Israetel recommends MEV of 6 direct sets/week for chest. MAV of 12-20 sets (midpoint ~16) for intermediates. MRV of 22 aligns with both Israetel and the upper bound of Schoenfeld's dose-response data showing continued gains up to high volumes.",
    sources: [
      { ref: "Israetel, M. — Renaissance Periodization, Chest Training Volume Landmarks", type: "expert_recommendation", url: "https://rpstrength.com/chest-training-tips-hypertrophy", year: 2023 },
      { ref: "Schoenfeld, B.J., Ogborn, D., & Krieger, J.W. (2017). Dose-response relationship between weekly resistance training volume and increases in muscle mass. J Sports Sciences, 35(11):1073-1082", type: "meta_analysis", url: "https://pubmed.ncbi.nlm.nih.gov/27433992/", year: 2017 },
    ],
    confidence: "expert_consensus",
    lastReviewed: "2026-03-11",
    notes: "Values for intermediate lifters (1-5+ years). Beginners may respond to lower volumes. MEV reduced from previous 8 to 6 per Israetel data.",
  },
  {
    id: "volume_landmarks_upper_chest",
    category: "volume",
    description: "Weekly volume landmarks for Upper Chest",
    values: { mev: 4, mav: 8, mrv: 12 },
    rationale: "Upper chest is a subdivision of chest. Counted separately when incline movements are programmed. Lower MEV because flat pressing provides partial stimulus.",
    sources: [
      { ref: "Israetel, M. — Renaissance Periodization", type: "expert_recommendation", year: 2023 },
    ],
    confidence: "expert_consensus",
    lastReviewed: "2026-03-11",
    notes: "These sets are in addition to flat chest work. Total chest stimulus = Chest + Upper Chest contributions.",
  },
  {
    id: "volume_landmarks_lats",
    category: "volume",
    description: "Weekly volume landmarks for Lats",
    values: { mev: 10, mav: 18, mrv: 25 },
    rationale: "Israetel's 'Back' landmarks recommend MEV of 10, MAV range of 14-22 (midpoint 18), and MRV of 25. Back musculature is large and recovers relatively well, supporting higher volumes.",
    sources: [
      { ref: "Israetel, M. — Renaissance Periodization, Back Training Volume Landmarks", type: "expert_recommendation", year: 2023 },
      { ref: "Schoenfeld, B.J. et al. (2017). Dose-response relationship between weekly RT volume and muscle mass. J Sports Sciences, 35(11):1073-1082", type: "meta_analysis", url: "https://pubmed.ncbi.nlm.nih.gov/27433992/", year: 2017 },
    ],
    confidence: "expert_consensus",
    lastReviewed: "2026-03-11",
    notes: "Updated from {8, 16, 22} to match Israetel back landmarks. Lats and Upper Back share the same research base but are tracked separately for programming precision.",
  },
  {
    id: "volume_landmarks_upper_back",
    category: "volume",
    description: "Weekly volume landmarks for Upper Back (rhomboids, mid-traps)",
    values: { mev: 10, mav: 18, mrv: 25 },
    rationale: "Same research base as Lats — Israetel groups these under 'Back' training landmarks.",
    sources: [
      { ref: "Israetel, M. — Renaissance Periodization, Back Training Volume Landmarks", type: "expert_recommendation", year: 2023 },
    ],
    confidence: "expert_consensus",
    lastReviewed: "2026-03-11",
    notes: "Upper back rows vs lat-focused pulls. Both benefit from same volume ranges.",
  },
  {
    id: "volume_landmarks_front_delts",
    category: "volume",
    description: "Weekly volume landmarks for Front Delts",
    values: { mev: 0, mav: 7, mrv: 12 },
    rationale: "Front delts receive substantial indirect volume from all pressing movements (bench, overhead press). Israetel notes MV/MEV of 0 — heavy pressing is sufficient for most. Direct work MAV of 6-8 sets only if specifically lagging.",
    sources: [
      { ref: "Israetel, M. — Renaissance Periodization, Front Delt Volume Landmarks", type: "expert_recommendation", year: 2023 },
    ],
    confidence: "expert_consensus",
    lastReviewed: "2026-03-11",
    notes: "MEV of 0 means compound pressing provides sufficient stimulus. Atlas counts partial contributions from pressing exercises toward this total.",
  },
  {
    id: "volume_landmarks_side_delts",
    category: "volume",
    description: "Weekly volume landmarks for Side Delts",
    values: { mev: 8, mav: 19, mrv: 26 },
    rationale: "Israetel groups rear and side delts together with MEV of 8, MAV range of 16-22 (midpoint ~19), and MRV of 26. Side delts recover quickly and tolerate high volumes well.",
    sources: [
      { ref: "Israetel, M. — Renaissance Periodization, Side/Rear Delt Volume Landmarks", type: "expert_recommendation", year: 2023 },
    ],
    confidence: "expert_consensus",
    lastReviewed: "2026-03-11",
    notes: "Updated from {8, 16, 22} to match Israetel recommendations. Isolation-friendly muscle that benefits from higher frequency.",
  },
  {
    id: "volume_landmarks_rear_delts",
    category: "volume",
    description: "Weekly volume landmarks for Rear Delts",
    values: { mev: 8, mav: 19, mrv: 26 },
    rationale: "Grouped with side delts in Israetel's landmark system. Rear delts also receive indirect stimulus from rowing movements. Same volume tolerance as side delts.",
    sources: [
      { ref: "Israetel, M. — Renaissance Periodization, Side/Rear Delt Volume Landmarks", type: "expert_recommendation", year: 2023 },
    ],
    confidence: "expert_consensus",
    lastReviewed: "2026-03-11",
    notes: "Updated from {6, 12, 18}. Rear delts tolerate more volume than previously assumed. Partial contribution from rows should be factored in.",
  },
  {
    id: "volume_landmarks_triceps",
    category: "volume",
    description: "Weekly volume landmarks for Triceps",
    values: { mev: 6, mav: 12, mrv: 18 },
    rationale: "Israetel recommends MEV of 4-6, MAV of 10-14 (midpoint ~12), MRV of 18. Triceps receive significant indirect volume from all pressing, so direct set counts should account for this.",
    sources: [
      { ref: "Israetel, M. — Renaissance Periodization, Triceps Volume Landmarks", type: "expert_recommendation", year: 2023 },
    ],
    confidence: "expert_consensus",
    lastReviewed: "2026-03-11",
    notes: "Current values match research. These are DIRECT sets — pressing adds substantial partial contribution.",
  },
  {
    id: "volume_landmarks_biceps",
    category: "volume",
    description: "Weekly volume landmarks for Biceps",
    values: { mev: 8, mav: 17, mrv: 26 },
    rationale: "Israetel recommends MEV of 8, MAV range of 14-20 (midpoint ~17), MRV of 26. Biceps are a small muscle that recovers quickly and responds well to higher volumes and frequencies.",
    sources: [
      { ref: "Israetel, M. — Renaissance Periodization, Biceps Volume Landmarks", type: "expert_recommendation", year: 2023 },
      { ref: "Schoenfeld, B.J. et al. (2019). Resistance Training Volume Enhances Muscle Hypertrophy. Med Sci Sports Exerc, 51(1):94-103", type: "rct", url: "https://pubmed.ncbi.nlm.nih.gov/30153194/", year: 2019 },
    ],
    confidence: "expert_consensus",
    lastReviewed: "2026-03-11",
    notes: "Updated from {6, 12, 18}. Biceps tolerate significantly more volume than previously assumed. Indirect volume from pulling should be factored in.",
  },
  {
    id: "volume_landmarks_quads",
    category: "volume",
    description: "Weekly volume landmarks for Quads",
    values: { mev: 8, mav: 15, mrv: 20 },
    rationale: "Israetel recommends MEV of 8, MAV range of 12-18 (midpoint ~15), MRV of 20. Quads are large muscles that generate significant systemic fatigue, capping MRV lower than smaller muscles despite responding to volume.",
    sources: [
      { ref: "Israetel, M. — Renaissance Periodization, Quad Volume Landmarks", type: "expert_recommendation", year: 2023 },
      { ref: "Schoenfeld, B.J. et al. (2019). Resistance Training Volume Enhances Muscle Hypertrophy. Med Sci Sports Exerc, 51(1):94-103", type: "rct", url: "https://pubmed.ncbi.nlm.nih.gov/30153194/", year: 2019 },
    ],
    confidence: "expert_consensus",
    lastReviewed: "2026-03-11",
    notes: "Schoenfeld 2019 showed continued quad gains up to 45 sets/week in trained men, but ecological validity is debated. Israetel's practical MRV of 20 accounts for systemic fatigue.",
  },
  {
    id: "volume_landmarks_hamstrings",
    category: "volume",
    description: "Weekly volume landmarks for Hamstrings",
    values: { mev: 6, mav: 13, mrv: 20 },
    rationale: "Israetel recommends MEV of 6, MAV range of 10-16 (midpoint ~13), MRV of 20. Hamstrings receive indirect stimulus from squats and hip hinge movements.",
    sources: [
      { ref: "Israetel, M. — Renaissance Periodization, Hamstring Volume Landmarks", type: "expert_recommendation", year: 2023 },
    ],
    confidence: "expert_consensus",
    lastReviewed: "2026-03-11",
    notes: "Updated MAV from 12 to 13, MRV from 18 to 20 per Israetel data.",
  },
  {
    id: "volume_landmarks_glutes",
    category: "volume",
    description: "Weekly volume landmarks for Glutes",
    values: { mev: 0, mav: 8, mrv: 16 },
    rationale: "Israetel notes glute MV/MEV of 0 — squats and hip hinge compounds provide sufficient stimulus for maintenance. Direct work (hip thrusts, etc.) needed only for prioritized growth. MAV of 4-12 (midpoint ~8).",
    sources: [
      { ref: "Israetel, M. — Renaissance Periodization, Glute Volume Landmarks", type: "expert_recommendation", year: 2023 },
    ],
    confidence: "expert_consensus",
    lastReviewed: "2026-03-11",
    notes: "MEV of 0 means compounds suffice. Updated from {4, 10, 16}. Atlas contribution weights from squats/RDLs count toward this.",
  },
  {
    id: "volume_landmarks_calves",
    category: "volume",
    description: "Weekly volume landmarks for Calves",
    values: { mev: 8, mav: 14, mrv: 20 },
    rationale: "Israetel recommends MEV of 8, MAV of 12-16 (midpoint ~14), MRV of 20. Calves are endurance-adapted and require higher frequency and volume for growth.",
    sources: [
      { ref: "Israetel, M. — Renaissance Periodization, Calf Volume Landmarks", type: "expert_recommendation", year: 2023 },
    ],
    confidence: "expert_consensus",
    lastReviewed: "2026-03-11",
    notes: "Updated from {6, 12, 18}. Calves benefit from higher frequency (3-4x/week) and stretched-position training.",
  },

  // Minor muscle groups — placeholder confidence (less research available)
  {
    id: "volume_landmarks_core",
    category: "volume",
    description: "Weekly volume landmarks for Core (rectus abdominis)",
    values: { mev: 4, mav: 10, mrv: 16 },
    rationale: "Core receives indirect stimulus from compound lifts. Direct ab work provides additional hypertrophy stimulus. Limited controlled research on optimal direct core volume.",
    sources: [],
    confidence: "placeholder",
    lastReviewed: null,
    notes: "Retained from original values. Needs research validation.",
  },
  {
    id: "volume_landmarks_lower_back",
    category: "volume",
    description: "Weekly volume landmarks for Lower Back (erector spinae)",
    values: { mev: 2, mav: 6, mrv: 10 },
    rationale: "Lower back is heavily stimulated by deadlifts, squats, and rows. Direct isolation rarely needed. Very low MRV due to recovery demands and injury risk.",
    sources: [],
    confidence: "placeholder",
    lastReviewed: null,
    notes: "Retained from original values. Low volume is a safety-first default.",
  },
  {
    id: "volume_landmarks_traps",
    category: "volume",
    description: "Weekly volume landmarks for Traps",
    values: { mev: 4, mav: 10, mrv: 16 },
    rationale: "Traps receive substantial indirect stimulus from deadlifts, rows, and overhead pressing. Israetel notes MV of 0 for traps from compounds alone. Direct work only for prioritized growth.",
    sources: [
      { ref: "Israetel, M. — Renaissance Periodization", type: "expert_recommendation", year: 2023 },
    ],
    confidence: "placeholder",
    lastReviewed: null,
    notes: "Israetel suggests MV=0 with compounds, but Atlas tracks direct sets separately. Kept conservative pending further review.",
  },
  {
    id: "volume_landmarks_forearms",
    category: "volume",
    description: "Weekly volume landmarks for Forearms",
    values: { mev: 2, mav: 8, mrv: 14 },
    rationale: "Forearms are trained indirectly through all gripping movements. Direct work rarely necessary except for specific goals.",
    sources: [],
    confidence: "placeholder",
    lastReviewed: null,
    notes: "Retained from original values.",
  },
  {
    id: "volume_landmarks_rotator_cuff",
    category: "volume",
    description: "Weekly volume landmarks for Rotator Cuff",
    values: { mev: 2, mav: 6, mrv: 10 },
    rationale: "Rotator cuff work is primarily for injury prevention, not hypertrophy. Low volumes of external rotation work are sufficient.",
    sources: [],
    confidence: "placeholder",
    lastReviewed: null,
    notes: "Prehab-focused. Retained from original values.",
  },
  {
    id: "volume_landmarks_brachialis",
    category: "volume",
    description: "Weekly volume landmarks for Brachialis",
    values: { mev: 2, mav: 6, mrv: 10 },
    rationale: "Brachialis is trained through hammer curls and neutral-grip pulling. Typically tracked with biceps but separated here for precision.",
    sources: [],
    confidence: "placeholder",
    lastReviewed: null,
    notes: "Retained from original values.",
  },
  {
    id: "volume_landmarks_obliques",
    category: "volume",
    description: "Weekly volume landmarks for Obliques",
    values: { mev: 4, mav: 10, mrv: 16 },
    rationale: "Obliques receive indirect stimulus from compound lifts requiring bracing. Direct work adds rotational/anti-rotational strength.",
    sources: [],
    confidence: "placeholder",
    lastReviewed: null,
    notes: "Retained from original values.",
  },
  {
    id: "volume_landmarks_hip_flexors",
    category: "volume",
    description: "Weekly volume landmarks for Hip Flexors",
    values: { mev: 2, mav: 6, mrv: 10 },
    rationale: "Hip flexors are trained indirectly through squats and leg raises. Direct isolation rarely programmed.",
    sources: [],
    confidence: "placeholder",
    lastReviewed: null,
    notes: "Retained from original values.",
  },
  {
    id: "volume_landmarks_adductors",
    category: "volume",
    description: "Weekly volume landmarks for Adductors",
    values: { mev: 4, mav: 8, mrv: 14 },
    rationale: "Adductors receive indirect stimulus from squats (especially wider stances). Direct work only for specific goals.",
    sources: [],
    confidence: "placeholder",
    lastReviewed: null,
    notes: "Retained from original values.",
  },

  // ════════════════════════════════════════════════════════════
  // PROGRESSION — Rep ranges and weight increments
  // ════════════════════════════════════════════════════════════

  {
    id: "progression_strength_range",
    category: "progression",
    description: "Progression rules for strength rep range (1-5 reps)",
    values: { minReps: 1, maxReps: 5, weightIncrementBarbell: 5, weightIncrementOther: 5, repIncrement: 1 },
    rationale: "Standard strength training range. 5 lb barbell increments are the smallest standard plate jump. Rippetoe and other Starting Strength-derived programs use 5 lb jumps for both upper and lower body in this range.",
    sources: [
      { ref: "Rippetoe, M. & Baker, A. (2014). Practical Programming for Strength Training, 3rd Ed.", type: "textbook", year: 2014 },
      { ref: "Helms, E., Morgan, A., & Valdez, A. (2019). The Muscle and Strength Pyramids: Training, 2nd Ed.", type: "textbook", year: 2019 },
    ],
    confidence: "researched",
    lastReviewed: "2026-03-11",
    notes: "5 lb jumps work well for novices. Advanced lifters in this range may need 2.5 lb micro-plates — not yet modeled.",
  },
  {
    id: "progression_hypertrophy_range",
    category: "progression",
    description: "Progression rules for hypertrophy rep range (6-12 reps)",
    values: { minReps: 6, maxReps: 12, weightIncrementBarbell: 5, weightIncrementOther: 2.5, repIncrement: 1 },
    rationale: "6-12 rep range is the conventional hypertrophy zone supported by Schoenfeld's research showing similar hypertrophy across 6-12 and even up to 30 reps, but 6-12 is most time-efficient. 5 lb barbell increments, 2.5 lb for dumbbells/cables (smaller muscles, lighter loads).",
    sources: [
      { ref: "Schoenfeld, B.J. et al. (2017). Strength and Hypertrophy Adaptations Between Low- vs. High-Load Resistance Training. J Strength Cond Res, 31(12):3508-3523", type: "peer_reviewed", url: "https://pubmed.ncbi.nlm.nih.gov/28834797/", year: 2017 },
      { ref: "Helms, E., Morgan, A., & Valdez, A. (2019). The Muscle and Strength Pyramids: Training, 2nd Ed.", type: "textbook", year: 2019 },
    ],
    confidence: "researched",
    lastReviewed: "2026-03-11",
    notes: "Double progression model: hit top of range across all sets → increase weight, drop to bottom of range.",
  },
  {
    id: "progression_endurance_range",
    category: "progression",
    description: "Progression rules for endurance/metabolic rep range (13-20 reps)",
    values: { minReps: 13, maxReps: 20, weightIncrementBarbell: 5, weightIncrementOther: 2.5, repIncrement: 2 },
    rationale: "Higher rep ranges for muscular endurance and metabolic stress. Larger rep increments (+2) because each rep represents a smaller percentage of total work at these volumes.",
    sources: [
      { ref: "Helms, E., Morgan, A., & Valdez, A. (2019). The Muscle and Strength Pyramids: Training, 2nd Ed.", type: "textbook", year: 2019 },
    ],
    confidence: "expert_consensus",
    lastReviewed: "2026-03-11",
    notes: "Rep increment of 2 is a practical choice — at 15+ reps, adding 1 rep per session is very slow progression.",
  },

  // ════════════════════════════════════════════════════════════
  // PROGRESSION DECISION THRESHOLDS
  // ════════════════════════════════════════════════════════════

  {
    id: "progression_struggle_threshold",
    category: "progression",
    description: "Rep completion ratio below which performance is classified as 'struggling significantly'",
    values: { ratio: 0.6 },
    rationale: "If a lifter completes less than 60% of target reps, the weight is clearly too heavy. This threshold triggers a weight reduction rather than a maintain recommendation. The 60% threshold is a practical heuristic used in autoregulation literature.",
    sources: [
      { ref: "Helms, E., Morgan, A., & Valdez, A. (2019). The Muscle and Strength Pyramids: Training, 2nd Ed.", type: "textbook", year: 2019 },
    ],
    confidence: "expert_consensus",
    lastReviewed: "2026-03-11",
    notes: "Example: target 10 reps, actual < 6 reps → reduce weight.",
  },
  {
    id: "progression_stall_session_count",
    category: "progression",
    description: "Number of consecutive sessions without progress before triggering a deload suggestion",
    values: { sessions: 3 },
    rationale: "3 sessions is the standard threshold used in linear progression programs (Starting Strength, StrongLifts). After 3 failed attempts at the same weight, accumulated fatigue is likely the issue rather than acute underperformance.",
    sources: [
      { ref: "Rippetoe, M. & Baker, A. (2014). Practical Programming for Strength Training, 3rd Ed.", type: "textbook", year: 2014 },
      { ref: "Mehdi. StrongLifts 5x5 Program", type: "coaching_standard", url: "https://stronglifts.com/5x5/", year: 2020 },
    ],
    confidence: "researched",
    lastReviewed: "2026-03-11",
    notes: "Some coaches use 2 sessions, some use 3. 3 is more conservative and avoids premature deloads from one bad day.",
  },
  {
    id: "progression_deload_weight_reduction",
    category: "progression",
    description: "Percentage to reduce weight during a deload",
    values: { reductionPct: 0.10, deloadRepBoost: 2 },
    rationale: "10% weight reduction is the consensus recommendation across coaching literature. Bell et al. Delphi consensus found ~10% intensity reduction is appropriate. The +2 rep boost during deload increases time under tension at the lighter weight for continued stimulus.",
    sources: [
      { ref: "Bell, L. et al. (2023). Delphi consensus on deloading. Frontiers in Sports and Active Living, PMC10511399", type: "peer_reviewed", url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10511399/", year: 2023 },
      { ref: "Rippetoe, M. & Baker, A. (2014). Practical Programming for Strength Training, 3rd Ed.", type: "textbook", year: 2014 },
    ],
    confidence: "researched",
    lastReviewed: "2026-03-11",
    notes: "Applied as: newWeight = currentWeight × 0.9, rounded to nearest increment.",
  },
  {
    id: "progression_close_to_target_buffer",
    category: "progression",
    description: "How many reps below target is still considered 'close' (maintain rather than reduce)",
    values: { buffer: 2 },
    rationale: "Session-to-session rep variability is typically 1-2 reps (Helms 2016, 2020). RIR prediction error in trained lifters is ~1 rep (Refalo 2023, Hackett 2012). Missing by 1-2 reps is within normal biological noise; missing by 3+ indicates genuine load mismatch. Autoregulation literature (Zourdos 2015, Helms 2018) validates using rep completion proximity as the progression decision metric.",
    sources: [
      { ref: "Zourdos, M.C. et al. (2015). Novel Resistance Training-Specific Rating of Perceived Exertion Scale Measuring Repetitions in Reserve. J Strength Cond Res", type: "peer_reviewed", url: "https://pubmed.ncbi.nlm.nih.gov/26049792/", year: 2015 },
      { ref: "Helms, E.R. et al. (2018). RPE and Velocity Relationships for the Back Squat, Bench Press, and Deadlift in Powerlifters. J Strength Cond Res", type: "peer_reviewed", url: "https://pubmed.ncbi.nlm.nih.gov/28796129/", year: 2018 },
      { ref: "Refalo, M.C. et al. (2023). Influence of Resistance Training Proximity-to-Failure on Skeletal Muscle Hypertrophy. Sports Med", type: "meta_analysis", url: "https://pubmed.ncbi.nlm.nih.gov/36334240/", year: 2023 },
      { ref: "Hackett, D.A. et al. (2012). Training practices and ergogenic aids used by male bodybuilders. J Strength Cond Res", type: "peer_reviewed", url: "https://pubmed.ncbi.nlm.nih.gov/22614147/", year: 2012 },
    ],
    confidence: "researched",
    lastReviewed: "2026-03-11",
    notes: "Research summary: .docs/research-summaries/high-priority-thresholds.md. Buffer of 1 is too aggressive (flags normal variability). Buffer of 3+ is too permissive (allows genuine load mismatches to persist).",
  },

  // ════════════════════════════════════════════════════════════
  // DELOAD PARAMETERS
  // ════════════════════════════════════════════════════════════

  {
    id: "deload_frequency",
    category: "deload",
    description: "Recommended training weeks between planned deloads",
    values: { minWeeks: 3, typicalWeeks: 5, maxWeeks: 8, beginnerMaxWeeks: 12 },
    rationale: "Bell et al. (2024) survey found mean deload frequency of 5.6 ± 2.3 weeks. Coaching consensus from Bell et al. (2023) qualitative study is 4-6 weeks. Israetel notes beginners can train up to 12 weeks before needing a deload due to lower absolute intensity.",
    sources: [
      { ref: "Bell, L. et al. (2024). Deloading practices in resistance training: a cross-sectional survey. Sports Medicine - Open, PMC10948666", type: "peer_reviewed", url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10948666/", year: 2024 },
      { ref: "Bell, L. et al. (2023). Coaches' perceptions of deloading. Frontiers in Sports and Active Living, PMC9811819", type: "peer_reviewed", url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9811819/", year: 2023 },
      { ref: "Israetel, M. — Renaissance Periodization", type: "expert_recommendation", year: 2023 },
    ],
    confidence: "researched",
    lastReviewed: "2026-03-11",
    notes: "Currently Atlas doesn't implement planned deloads — only reactive deloads triggered by stalls. This data supports future planned deload feature.",
  },
  {
    id: "deload_duration",
    category: "deload",
    description: "Duration of a deload period",
    values: { minDays: 5, typicalDays: 7, maxDays: 10 },
    rationale: "Bell et al. (2024) survey found mean deload duration of 6.4 ± 1.7 days. Exercise physiology literature confirms less than 7 days of reduced training shows no measurable strength loss.",
    sources: [
      { ref: "Bell, L. et al. (2024). Sports Medicine - Open, PMC10948666", type: "peer_reviewed", url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10948666/", year: 2024 },
    ],
    confidence: "researched",
    lastReviewed: "2026-03-11",
    notes: "One week is the practical standard since most programs run on weekly cycles.",
  },
  {
    id: "deload_volume_reduction",
    category: "deload",
    description: "Volume and intensity reduction during deload",
    values: { volumeReductionLow: 0.25, volumeReductionMod: 0.50, volumeReductionHigh: 0.75, intensityReduction: 0.10 },
    rationale: "Bell et al. (2023) Delphi consensus: low recovery need = 25-45% volume reduction, moderate = 40-60%, high = 60-90%. Intensity reduction of ~10% across all tiers. Maintaining some training intensity during deloads preserves neuromuscular adaptations.",
    sources: [
      { ref: "Bell, L. et al. (2023). Delphi consensus on deloading. Frontiers in Sports and Active Living, PMC10511399", type: "peer_reviewed", url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10511399/", year: 2023 },
      { ref: "Ogasawara, R. et al. (2013). Comparison of muscle hypertrophy following 6-month continuous and periodic resistance training. Eur J Appl Physiol, 113(4):975-85", type: "rct", url: "https://pubmed.ncbi.nlm.nih.gov/23053130/", year: 2013 },
    ],
    confidence: "researched",
    lastReviewed: "2026-03-11",
    notes: "Ogasawara showed 6 weeks on / 3 weeks off = same hypertrophy as continuous training (untrained subjects, bench press only). Supports the idea that periodic rest doesn't cost gains.",
  },

  // ════════════════════════════════════════════════════════════
  // READINESS SCORE — Component weights
  // ════════════════════════════════════════════════════════════

  {
    id: "readiness_score_weights",
    category: "readiness",
    description: "Component weights for composite readiness score",
    values: {
      withData: { plan: 0.30, execution: 0.50, progression: 0.20 },
      noData: { plan: 1.0, execution: 0, progression: 0 },
    },
    rationale: "Execution/adherence is the dominant predictor of training outcomes (Helms pyramid base, BJSM 2023 meta-analysis of 178 studies). All reasonable programs produce gains; adherence determines whether gains are realized. Progression is a meaningful co-factor (~2x hypertrophy effect) but partially redundant with adherence. 70% adherence is a critical threshold (Scott et al.).",
    sources: [
      { ref: "Helms, E., Morgan, A., Valdez, A. — The Muscle and Strength Pyramids. Adherence as pyramid base.", type: "expert_framework", url: "https://muscleandstrengthpyramids.com/", year: 2019 },
      { ref: "Currier, B.S. et al. (2023). Resistance training prescription for muscle strength and hypertrophy: a Bayesian network meta-analysis. Br J Sports Med, PMC10579494", type: "meta_analysis", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10579494/", year: 2023 },
      { ref: "Lally, P. et al. (2010). How are habits formed: Modelling habit formation in the real world. European Journal of Social Psychology, 40(6), 998-1009", type: "peer_reviewed", url: "https://onlinelibrary.wiley.com/doi/10.1002/ejsp.674", year: 2010 },
      { ref: "Scott, J.M. et al. — Exercise Relative Dose Intensity and adherence threshold of 70%. PMC12376820", type: "peer_reviewed", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC12376820/", year: 2024 },
    ],
    confidence: "researched",
    lastReviewed: "2026-03-11",
    notes: "Research summary: .docs/research-summaries/readiness-score-weights.md. Future work: define sub-calculations within each component, explore context-sensitive multipliers (e.g., higher execution weight during first 66 days).",
  },

  // ════════════════════════════════════════════════════════════
  // VOLUME ADHERENCE — Classification thresholds
  // ════════════════════════════════════════════════════════════

  {
    id: "volume_adherence_thresholds",
    category: "adherence",
    description: "Ratio thresholds for classifying actual vs planned volume adherence",
    values: { significantlyUnder: 0.5, under: 0.8, over: 1.2 },
    rationale: "Dose-response for volume is curvilinear with diminishing returns (Schoenfeld 2017, Pelland 2025). Bickel et al. (2011) showed 1/3 (~33%) of volume maintains gains — 50% is above maintenance but approaching compromised territory. 80% captures the vast majority of stimulus given diminishing returns. ExRDI research found real-world patients average 77.4% of prescribed volume. >120% enters overreaching risk (Schoenfeld 2019: 30+ sets/muscle/week showed no additional gains with overreaching markers).",
    sources: [
      { ref: "Schoenfeld, B.J. et al. (2017). Dose-response relationship between weekly RT volume and muscle mass. J Sports Sciences, 35(11):1073-1082", type: "meta_analysis", url: "https://pubmed.ncbi.nlm.nih.gov/27433992/", year: 2017 },
      { ref: "Pelland, J.C. et al. (2025). The Resistance Training Dose Response: Meta-Regressions on Volume and Frequency", type: "meta_analysis", url: "https://pubmed.ncbi.nlm.nih.gov/41343037/", year: 2025 },
      { ref: "Bickel, C.S. et al. (2011). Exercise dosing to retain resistance training adaptations in young and older adults. Med Sci Sports Exerc, 43(7):1177-87", type: "rct", url: "https://pubmed.ncbi.nlm.nih.gov/21131862/", year: 2011 },
      { ref: "Schoenfeld, B.J. et al. (2019). Resistance Training Volume Enhances Muscle Hypertrophy but Not Strength in Trained Men. Med Sci Sports Exerc, 51(1):94-103", type: "rct", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC6303131/", year: 2019 },
      { ref: "Scott, J.M. et al. (2024). Exercise Relative Dose Intensity adherence metric. PMC12376820", type: "peer_reviewed", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC12376820/", year: 2024 },
    ],
    confidence: "researched",
    lastReviewed: "2026-03-11",
    notes: "Research summary: .docs/research-summaries/high-priority-thresholds.md. Values validated — no changes from original heuristics. The diminishing returns curve means the practical difference between 80% and 100% adherence is smaller than between 50% and 80%.",
  },

  // ════════════════════════════════════════════════════════════
  // STRENGTH TRENDS — Direction thresholds
  // ════════════════════════════════════════════════════════════

  {
    id: "strength_trend_thresholds",
    category: "trends",
    description: "Percentage change thresholds for classifying strength progression direction",
    values: { progressingPct: 5, regressingPct: -5 },
    rationale: "Direct 1RM test-retest CV is ~2-4% (Grgic 2020, 32 studies, n=1,595). Estimated 1RM from submaximal sets has ~5-10% total noise (prediction error + biological variability). MDC for bench press ~5.6 kg, squat ~10 kg in trained males. ±5% is the minimum defensible threshold — smaller changes cannot be reliably distinguished from measurement noise. Atlas's first-half vs second-half session averaging further reduces noise.",
    sources: [
      { ref: "Grgic, J. et al. (2020). Test-retest reliability of the one-repetition maximum: systematic review. Sports Med, 50(7):1169-1185", type: "meta_analysis", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7367986/", year: 2020 },
      { ref: "Seo, D.I. et al. (2012). Reliability of the one repetition maximum test based on muscle group and gender. J Sports Sci Med, 11(2):221-225", type: "peer_reviewed", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3525823/", year: 2012 },
      { ref: "Helms, E.R. et al. (2016). Application of the Repetitions in Reserve-Based RPE Scale for Resistance Training. Strength Cond J, 38(4):42-49", type: "peer_reviewed", url: "https://pubmed.ncbi.nlm.nih.gov/27531969/", year: 2016 },
    ],
    confidence: "researched",
    lastReviewed: "2026-03-11",
    notes: "Research summary: .docs/research-summaries/high-priority-thresholds.md. Limitation: intermediate lifters gaining 1-3%/month may take 2-5 months to cross 5%. This is an acceptable tradeoff vs. false plateau/regression alerts from normal variability.",
  },

  // ════════════════════════════════════════════════════════════
  // CONTRIBUTION WEIGHTS — Muscle stimulus by exercise role
  // ════════════════════════════════════════════════════════════

  {
    id: "contribution_weights",
    category: "contribution",
    description: "Default multipliers for calculating effective sets based on muscle role in an exercise. Individual exercises in exercise-data.js may override these defaults with exercise-specific values (e.g., 0.3 for hamstrings in hip thrusts).",
    values: { direct: 1.0, partial: 0.5, minimal: 0.25 },
    rationale: "The 0.5 'half-set' rule for secondary movers is the most widely used practical value in fractional set counting. Pelland et al. (2024) tested three volume quantification methods (total, fractional at 0.5, direct-only) across 67 studies and found the fractional method had the strongest relative evidence for predicting hypertrophy (Bayes Factor = 9.48). Their exploratory analysis estimated indirect sets contribute ~32% of a direct set for hypertrophy, but the 0.5 model still provided the best overall fit. Henselmans advocates 0.5 explicitly: '6 sets of rows = 3 sets of effective biceps work.' The 0.25 minimal weight represents tertiary/stabilizer muscles with limited hypertrophic stimulus.",
    sources: [
      { ref: "Pelland, J.C. et al. — The Resistance Training Dose Response: Meta-Regressions Exploring the Effects of Weekly Volume and Frequency on Muscle Hypertrophy and Strength Gains", type: "meta_analysis", year: 2024, doi: "10.1007/s40279-025-02344-w" },
      { ref: "Henselmans, M. — How to count training volume and design a sensible training split", type: "expert_recommendation", year: 2023, url: "https://mennohenselmans.com/how-to-count-training-volume-design-training-split/" },
      { ref: "Outlift / Nuckols, G. — Hypertrophy Training Volume: How Many Sets to Build Muscle?", type: "expert_recommendation", year: 2023, url: "https://outlift.com/hypertrophy-training-volume/" },
      { ref: "Stronger by Science — What Does EMG Amplitude Tell Us About Muscle Hypertrophy?", type: "review_article", year: 2023, url: "https://www.strongerbyscience.com/emg-amplitude-tell-us-muscle-hypertrophy/" },
    ],
    confidence: "research_supported",
    lastReviewed: "2026-03-11",
    notes: "Default 0.5 is the best-fit fractional model per Pelland et al. Individual exercises override this where biomechanics warrant lower values: hamstrings from hip-dominant exercises (hip thrust, glute bridge, swings) use 0.3 because hams are not lengthened under load; core from compound stabilization (front squat, single-leg RDL) uses 0.3 because isometric bracing does not drive hypertrophy like dynamic work. See exercise-data.js for all per-exercise overrides.",
  },

  // ════════════════════════════════════════════════════════════
  // INSIGHT MILESTONES — Celebration and detection thresholds
  // ════════════════════════════════════════════════════════════

  {
    id: "insight_streak_milestones",
    category: "insights",
    description: "Workout streak counts that trigger celebration insights",
    values: { milestones: [3, 5, 7, 10, 14, 21, 28] },
    rationale: "Spaced-out milestones to encourage consistency. Early milestones (3, 5, 7) reinforce habit formation during the critical first weeks. Later milestones (14, 21, 28) celebrate sustained commitment.",
    sources: [],
    confidence: "placeholder",
    lastReviewed: null,
    notes: "Behavioral — not exercise science. Could be informed by habit formation research (e.g., Lally et al. 2010 — 66 days average for habit automaticity).",
  },
  {
    id: "insight_workout_milestones",
    category: "insights",
    description: "Total workout counts that trigger celebration insights",
    values: { milestones: [1, 5, 10, 25, 50, 75, 100, 150, 200] },
    rationale: "Acknowledge total volume of work. First workout is a significant milestone. Subsequent milestones are spaced further apart as the accomplishment is less novel.",
    sources: [],
    confidence: "placeholder",
    lastReviewed: null,
    notes: "Behavioral design choice. Gamification-informed.",
  },
  {
    id: "insight_detection_thresholds",
    category: "insights",
    description: "Thresholds for detecting stalls, regressions, and consistency issues",
    values: {
      stallSessions: 3,
      stallChangePct: 5,
      regressionSessions: 3,
      regressionChangePct: -5,
      consistencyHigh: 90,
      consistencyLow: 50,
      consistencyMinDays: 4,
    },
    rationale: "3 sessions is consistent with the stall detection used in progression engine. ±5% matches the strength trend thresholds. 90% completion is high adherence; below 50% with 4+ planned days indicates significant inconsistency.",
    sources: [],
    confidence: "placeholder",
    lastReviewed: null,
    notes: "Mirrors progression_stall_session_count and strength_trend_thresholds for consistency.",
  },

  // ════════════════════════════════════════════════════════════
  // PLAN ENGINE — Construction thresholds
  // ════════════════════════════════════════════════════════════

  {
    id: "plan_progressive_overload_rate",
    category: "plan",
    description: "Default weekly progressive overload percentage for plan construction",
    values: { weeklyPct: 2.5 },
    rationale: "2.5% weekly overload across a 4-week mesocycle yields ~10% total increase, which aligns with intermediate progression rates. Helms and Nuckols recommend similar weekly micro-loading for intermediates.",
    sources: [
      { ref: "Helms, E., Morgan, A., & Valdez, A. (2019). The Muscle and Strength Pyramids: Training, 2nd Ed.", type: "textbook", year: 2019 },
    ],
    confidence: "expert_consensus",
    lastReviewed: "2026-03-11",
    notes: "This is applied during plan construction as a percentage increase per week.",
  },
  {
    id: "plan_gap_detection_threshold",
    category: "plan",
    description: "Threshold below which a muscle is flagged as undertrained (gap)",
    values: { pctOfMAV: 0.80 },
    rationale: "The dose-response curve is curvilinear with diminishing returns (Schoenfeld 2017, Pelland 2025) — 80% of MAV captures well over 80% of potential gains. Schoenfeld 2019 found 3-set vs 5-set differences often not statistically significant for strength. The biggest risk is being below MEV, not below MAV (already caught by the 50% volume adherence threshold). 80% serves as a conservative early-warning threshold for chronic underprogramming.",
    sources: [
      { ref: "Schoenfeld, B.J. et al. (2017). Dose-response relationship between weekly RT volume and muscle mass. J Sports Sciences, 35(11):1073-1082", type: "meta_analysis", url: "https://pubmed.ncbi.nlm.nih.gov/27433992/", year: 2017 },
      { ref: "Pelland, J.C. et al. (2025). The Resistance Training Dose Response: Meta-Regressions on Volume and Frequency", type: "meta_analysis", url: "https://pubmed.ncbi.nlm.nih.gov/41343037/", year: 2025 },
      { ref: "Baz-Valle, E. et al. (2022). RT volume and hypertrophy: a review. PMC8884877", type: "peer_reviewed", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC8884877/", year: 2022 },
      { ref: "Schoenfeld, B.J. et al. (2019). Resistance Training Volume Enhances Muscle Hypertrophy but Not Strength. Med Sci Sports Exerc, 51(1):94-103", type: "rct", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC6303131/", year: 2019 },
    ],
    confidence: "researched",
    lastReviewed: "2026-03-11",
    notes: "Research summary: .docs/research-summaries/high-priority-thresholds.md. 70-75% might be more evidence-aligned given how flat the curve is near MAV, but 80% is defensible as a 'catch things early' threshold. RP framework expects lifters to start mesocycles near MEV and ramp up — temporarily below 80% MAV is normal.",
  },
];


// ════════════════════════════════════════════════════════════
// ACCESSOR FUNCTIONS — Engines import these
// ════════════════════════════════════════════════════════════

/**
 * Returns all rules (for doc generator and introspection).
 */
export function getAllRules() {
  return RULES;
}

/**
 * Filter rules by confidence level.
 */
export function getRulesByConfidence(level) {
  return RULES.filter(r => r.confidence === level);
}

/**
 * Returns volume landmarks in the same shape as the old VOLUME_LANDMARKS constant.
 * { "Chest": { mev, mav, mrv }, ... }
 */
export function getVolumeLandmarks() {
  // Map rule IDs to the display names used throughout Atlas
  const ID_TO_NAME = {
    volume_landmarks_chest: "Chest",
    volume_landmarks_upper_chest: "Upper Chest",
    volume_landmarks_lats: "Lats",
    volume_landmarks_upper_back: "Upper Back",
    volume_landmarks_front_delts: "Front Delts",
    volume_landmarks_side_delts: "Side Delts",
    volume_landmarks_rear_delts: "Rear Delts",
    volume_landmarks_triceps: "Triceps",
    volume_landmarks_biceps: "Biceps",
    volume_landmarks_quads: "Quads",
    volume_landmarks_hamstrings: "Hamstrings",
    volume_landmarks_glutes: "Glutes",
    volume_landmarks_calves: "Calves",
    volume_landmarks_core: "Core",
    volume_landmarks_lower_back: "Lower Back",
    volume_landmarks_traps: "Traps",
    volume_landmarks_forearms: "Forearms",
    volume_landmarks_rotator_cuff: "Rotator Cuff",
    volume_landmarks_brachialis: "Brachialis",
    volume_landmarks_obliques: "Obliques",
    volume_landmarks_hip_flexors: "Hip Flexors",
    volume_landmarks_adductors: "Adductors",
  };

  const landmarks = {};
  RULES
    .filter(r => r.category === "volume")
    .forEach(r => {
      const name = ID_TO_NAME[r.id];
      if (name) {
        landmarks[name] = { ...r.values };
      }
    });
  return landmarks;
}

/**
 * Pre-computed VOLUME_LANDMARKS constant for backward compatibility.
 * Components and engines that import VOLUME_LANDMARKS continue to work.
 */
export const VOLUME_LANDMARKS = getVolumeLandmarks();

/**
 * Returns progression rules by rep range.
 * { strength: { minReps, maxReps, ... }, hypertrophy: {...}, endurance: {...} }
 */
export function getProgressionRules() {
  const rules = {};
  RULES
    .filter(r => r.category === "progression" && r.id.startsWith("progression_") && r.id.endsWith("_range"))
    .forEach(r => {
      const range = r.id.replace("progression_", "").replace("_range", "");
      rules[range] = { ...r.values };
    });
  return rules;
}

/**
 * Returns deload parameters used by the progression engine.
 */
export function getDeloadParams() {
  const stall = RULES.find(r => r.id === "progression_stall_session_count");
  const reduction = RULES.find(r => r.id === "progression_deload_weight_reduction");
  const struggle = RULES.find(r => r.id === "progression_struggle_threshold");
  const closeBuffer = RULES.find(r => r.id === "progression_close_to_target_buffer");
  const frequency = RULES.find(r => r.id === "deload_frequency");
  const duration = RULES.find(r => r.id === "deload_duration");
  const volumeReduction = RULES.find(r => r.id === "deload_volume_reduction");

  return {
    stallSessionCount: stall?.values.sessions ?? 3,
    weightReductionPct: reduction?.values.reductionPct ?? 0.10,
    deloadRepBoost: reduction?.values.deloadRepBoost ?? 2,
    struggleThreshold: struggle?.values.ratio ?? 0.6,
    closeToTargetBuffer: closeBuffer?.values.buffer ?? 2,
    frequency: frequency?.values ?? { minWeeks: 3, typicalWeeks: 5, maxWeeks: 8, beginnerMaxWeeks: 12 },
    duration: duration?.values ?? { minDays: 5, typicalDays: 7, maxDays: 10 },
    volumeReduction: volumeReduction?.values ?? { volumeReductionLow: 0.25, volumeReductionMod: 0.50, volumeReductionHigh: 0.75, intensityReduction: 0.10 },
  };
}

/**
 * Returns readiness score component weights.
 */
export function getReadinessWeights() {
  const rule = RULES.find(r => r.id === "readiness_score_weights");
  return rule?.values ?? {
    withData: { plan: 0.30, execution: 0.50, progression: 0.20 },
    noData: { plan: 1.0, execution: 0, progression: 0 },
  };
}

/**
 * Returns volume adherence classification thresholds.
 */
export function getAdherenceThresholds() {
  const rule = RULES.find(r => r.id === "volume_adherence_thresholds");
  return rule?.values ?? { significantlyUnder: 0.5, under: 0.8, over: 1.2 };
}

/**
 * Returns strength trend direction thresholds.
 */
export function getStrengthTrendThresholds() {
  const rule = RULES.find(r => r.id === "strength_trend_thresholds");
  return rule?.values ?? { progressingPct: 5, regressingPct: -5 };
}

/**
 * Returns contribution weight multipliers for effective set calculation.
 */
export function getContributionWeights() {
  const rule = RULES.find(r => r.id === "contribution_weights");
  return rule?.values ?? { direct: 1.0, partial: 0.5, minimal: 0.25 };
}

/**
 * Returns insight milestone arrays and detection thresholds.
 */
export function getInsightMilestones() {
  const streaks = RULES.find(r => r.id === "insight_streak_milestones");
  const workouts = RULES.find(r => r.id === "insight_workout_milestones");
  const detection = RULES.find(r => r.id === "insight_detection_thresholds");

  return {
    streakMilestones: streaks?.values.milestones ?? [3, 5, 7, 10, 14, 21, 28],
    workoutMilestones: workouts?.values.milestones ?? [1, 5, 10, 25, 50, 75, 100, 150, 200],
    detection: detection?.values ?? {
      stallSessions: 3, stallChangePct: 5,
      regressionSessions: 3, regressionChangePct: -5,
      consistencyHigh: 90, consistencyLow: 50, consistencyMinDays: 4,
    },
  };
}

/**
 * Returns plan engine construction thresholds.
 */
export function getPlanEngineThresholds() {
  const overload = RULES.find(r => r.id === "plan_progressive_overload_rate");
  const gap = RULES.find(r => r.id === "plan_gap_detection_threshold");

  return {
    progressRate: overload?.values.weeklyPct ?? 2.5,
    gapThreshold: gap?.values.pctOfMAV ?? 0.80,
  };
}
