// ============================================================
// exercise-data.js — Single source of truth for Atlas exercise data
// Extracted from Exercise Database v3 (helkin1-EDB-1 branch)
// ============================================================

export const EXERCISE_DATABASE = [
  // ── PUSH: CHEST ──────────────────────────────────────────
  {
    name: "Barbell Bench Press", pattern: "push", equipment: "Barbell",
    muscles: [
      { name: "Chest", role: "direct", contribution: 1.0 },
      { name: "Triceps", role: "partial", contribution: 0.5 },
      { name: "Front Delts", role: "partial", contribution: 0.5 },
    ]
  },
  {
    name: "Incline Barbell Bench Press", pattern: "push", equipment: "Barbell",
    muscles: [
      { name: "Upper Chest", role: "direct", contribution: 1.0 },
      { name: "Front Delts", role: "partial", contribution: 0.5 },
      { name: "Triceps", role: "partial", contribution: 0.5 },
    ]
  },
  {
    name: "Decline Barbell Bench Press", pattern: "push", equipment: "Barbell",
    muscles: [
      { name: "Chest", role: "direct", contribution: 1.0 },
      { name: "Triceps", role: "partial", contribution: 0.5 },
    ]
  },
  {
    name: "Close-Grip Bench Press", pattern: "push", equipment: "Barbell",
    muscles: [
      { name: "Triceps", role: "direct", contribution: 1.0 },
      { name: "Chest", role: "partial", contribution: 0.5 },
      { name: "Front Delts", role: "minimal", contribution: 0.25 },
    ]
  },
  {
    name: "Dumbbell Bench Press", pattern: "push", equipment: "Dumbbells",
    muscles: [
      { name: "Chest", role: "direct", contribution: 1.0 },
      { name: "Triceps", role: "partial", contribution: 0.5 },
      { name: "Front Delts", role: "partial", contribution: 0.5 },
    ]
  },
  {
    name: "Incline Dumbbell Bench Press", pattern: "push", equipment: "Dumbbells",
    muscles: [
      { name: "Upper Chest", role: "direct", contribution: 1.0 },
      { name: "Front Delts", role: "partial", contribution: 0.5 },
      { name: "Triceps", role: "partial", contribution: 0.5 },
    ]
  },
  {
    name: "Decline Dumbbell Bench Press", pattern: "push", equipment: "Dumbbells",
    muscles: [
      { name: "Chest", role: "direct", contribution: 1.0 },
      { name: "Triceps", role: "partial", contribution: 0.5 },
    ]
  },
  {
    name: "Dumbbell Fly", pattern: "push", equipment: "Dumbbells",
    muscles: [
      { name: "Chest", role: "direct", contribution: 1.0 },
      { name: "Front Delts", role: "minimal", contribution: 0.25 },
    ]
  },
  {
    name: "Incline Dumbbell Fly", pattern: "push", equipment: "Dumbbells",
    muscles: [
      { name: "Upper Chest", role: "direct", contribution: 1.0 },
      { name: "Front Delts", role: "minimal", contribution: 0.25 },
    ]
  },
  {
    name: "Cable Fly", pattern: "push", equipment: "Cable",
    muscles: [
      { name: "Chest", role: "direct", contribution: 1.0 },
      { name: "Front Delts", role: "minimal", contribution: 0.25 },
    ]
  },
  {
    name: "Low-to-High Cable Fly", pattern: "push", equipment: "Cable",
    muscles: [
      { name: "Upper Chest", role: "direct", contribution: 1.0 },
      { name: "Front Delts", role: "minimal", contribution: 0.25 },
    ]
  },
  {
    name: "High-to-Low Cable Fly", pattern: "push", equipment: "Cable",
    muscles: [{ name: "Chest", role: "direct", contribution: 1.0 }]
  },
  {
    name: "Machine Chest Press", pattern: "push", equipment: "Machine",
    muscles: [
      { name: "Chest", role: "direct", contribution: 1.0 },
      { name: "Triceps", role: "partial", contribution: 0.5 },
      { name: "Front Delts", role: "partial", contribution: 0.5 },
    ]
  },
  {
    name: "Pec Deck", pattern: "push", equipment: "Machine",
    muscles: [{ name: "Chest", role: "direct", contribution: 1.0 }]
  },
  {
    name: "Push-Up", pattern: "push", equipment: "Bodyweight",
    muscles: [
      { name: "Chest", role: "direct", contribution: 1.0 },
      { name: "Triceps", role: "partial", contribution: 0.5 },
      { name: "Front Delts", role: "partial", contribution: 0.5 },
      { name: "Core", role: "minimal", contribution: 0.25 },
    ]
  },
  {
    name: "Dip (Chest Focus)", pattern: "push", equipment: "Bodyweight",
    muscles: [
      { name: "Chest", role: "direct", contribution: 1.0 },
      { name: "Triceps", role: "partial", contribution: 0.5 },
      { name: "Front Delts", role: "partial", contribution: 0.5 },
    ]
  },

  // ── PUSH: SHOULDERS ──────────────────────────────────────
  {
    name: "Overhead Press (Barbell)", pattern: "push", equipment: "Barbell",
    muscles: [
      { name: "Front Delts", role: "direct", contribution: 1.0 },
      { name: "Triceps", role: "partial", contribution: 0.5 },
      { name: "Side Delts", role: "partial", contribution: 0.5 },
      { name: "Core", role: "minimal", contribution: 0.25 },
    ]
  },
  {
    name: "Push Press", pattern: "push", equipment: "Barbell",
    muscles: [
      { name: "Front Delts", role: "direct", contribution: 1.0 },
      { name: "Triceps", role: "partial", contribution: 0.5 },
      { name: "Side Delts", role: "partial", contribution: 0.5 },
      { name: "Quads", role: "minimal", contribution: 0.25 },
    ]
  },
  {
    name: "Dumbbell Shoulder Press", pattern: "push", equipment: "Dumbbells",
    muscles: [
      { name: "Front Delts", role: "direct", contribution: 1.0 },
      { name: "Triceps", role: "partial", contribution: 0.5 },
      { name: "Side Delts", role: "partial", contribution: 0.5 },
    ]
  },
  {
    name: "Arnold Press", pattern: "push", equipment: "Dumbbells",
    muscles: [
      { name: "Front Delts", role: "direct", contribution: 1.0 },
      { name: "Side Delts", role: "direct", contribution: 1.0 },
      { name: "Triceps", role: "partial", contribution: 0.5 },
    ]
  },
  {
    name: "Lateral Raise", pattern: "push", equipment: "Dumbbells",
    muscles: [{ name: "Side Delts", role: "direct", contribution: 1.0 }]
  },
  {
    name: "Cable Lateral Raise", pattern: "push", equipment: "Cable",
    muscles: [{ name: "Side Delts", role: "direct", contribution: 1.0 }]
  },
  {
    name: "Machine Lateral Raise", pattern: "push", equipment: "Machine",
    muscles: [{ name: "Side Delts", role: "direct", contribution: 1.0 }]
  },
  {
    name: "Front Raise", pattern: "push", equipment: "Dumbbells",
    muscles: [{ name: "Front Delts", role: "direct", contribution: 1.0 }]
  },
  {
    name: "Upright Row", pattern: "push", equipment: "Barbell",
    muscles: [
      { name: "Side Delts", role: "direct", contribution: 1.0 },
      { name: "Traps", role: "partial", contribution: 0.5 },
      { name: "Front Delts", role: "minimal", contribution: 0.25 },
      { name: "Biceps", role: "minimal", contribution: 0.25 },
    ]
  },
  {
    name: "Machine Shoulder Press", pattern: "push", equipment: "Machine",
    muscles: [
      { name: "Front Delts", role: "direct", contribution: 1.0 },
      { name: "Triceps", role: "partial", contribution: 0.5 },
      { name: "Side Delts", role: "partial", contribution: 0.5 },
    ]
  },
  {
    name: "Landmine Press", pattern: "push", equipment: "Barbell",
    muscles: [
      { name: "Front Delts", role: "direct", contribution: 1.0 },
      { name: "Upper Chest", role: "partial", contribution: 0.5 },
      { name: "Triceps", role: "partial", contribution: 0.5 },
      { name: "Core", role: "minimal", contribution: 0.25 },
    ]
  },

  // ── PUSH: TRICEPS ─────────────────────────────────────────
  {
    name: "Tricep Pushdown (Rope)", pattern: "push", equipment: "Cable",
    muscles: [{ name: "Triceps", role: "direct", contribution: 1.0 }]
  },
  {
    name: "Tricep Pushdown (Bar)", pattern: "push", equipment: "Cable",
    muscles: [{ name: "Triceps", role: "direct", contribution: 1.0 }]
  },
  {
    name: "Overhead Tricep Extension (Cable)", pattern: "push", equipment: "Cable",
    muscles: [{ name: "Triceps", role: "direct", contribution: 1.0 }]
  },
  {
    name: "Overhead Tricep Extension (Dumbbell)", pattern: "push", equipment: "Dumbbells",
    muscles: [{ name: "Triceps", role: "direct", contribution: 1.0 }]
  },
  {
    name: "Skull Crushers", pattern: "push", equipment: "Barbell",
    muscles: [{ name: "Triceps", role: "direct", contribution: 1.0 }]
  },
  {
    name: "Dip (Tricep Focus)", pattern: "push", equipment: "Bodyweight",
    muscles: [
      { name: "Triceps", role: "direct", contribution: 1.0 },
      { name: "Chest", role: "partial", contribution: 0.5 },
      { name: "Front Delts", role: "minimal", contribution: 0.25 },
    ]
  },
  {
    name: "Diamond Push-Up", pattern: "push", equipment: "Bodyweight",
    muscles: [
      { name: "Triceps", role: "direct", contribution: 1.0 },
      { name: "Chest", role: "partial", contribution: 0.5 },
    ]
  },
  {
    name: "Kickbacks", pattern: "push", equipment: "Dumbbells",
    muscles: [{ name: "Triceps", role: "direct", contribution: 1.0 }]
  },

  // ── PULL: BACK ────────────────────────────────────────────
  {
    name: "Barbell Row", pattern: "pull", equipment: "Barbell",
    muscles: [
      { name: "Upper Back", role: "direct", contribution: 1.0 },
      { name: "Lats", role: "direct", contribution: 1.0 },
      { name: "Biceps", role: "partial", contribution: 0.5 },
      { name: "Rear Delts", role: "partial", contribution: 0.5 },
    ]
  },
  {
    name: "Pendlay Row", pattern: "pull", equipment: "Barbell",
    muscles: [
      { name: "Upper Back", role: "direct", contribution: 1.0 },
      { name: "Lats", role: "direct", contribution: 1.0 },
      { name: "Biceps", role: "partial", contribution: 0.5 },
      { name: "Rear Delts", role: "partial", contribution: 0.5 },
    ]
  },
  {
    name: "Dumbbell Row", pattern: "pull", equipment: "Dumbbells",
    muscles: [
      { name: "Lats", role: "direct", contribution: 1.0 },
      { name: "Upper Back", role: "direct", contribution: 1.0 },
      { name: "Biceps", role: "partial", contribution: 0.5 },
      { name: "Rear Delts", role: "partial", contribution: 0.5 },
    ]
  },
  {
    name: "Chest-Supported Row", pattern: "pull", equipment: "Dumbbells",
    muscles: [
      { name: "Upper Back", role: "direct", contribution: 1.0 },
      { name: "Lats", role: "direct", contribution: 1.0 },
      { name: "Biceps", role: "partial", contribution: 0.5 },
      { name: "Rear Delts", role: "partial", contribution: 0.5 },
    ]
  },
  {
    name: "Seated Cable Row", pattern: "pull", equipment: "Cable",
    muscles: [
      { name: "Upper Back", role: "direct", contribution: 1.0 },
      { name: "Lats", role: "direct", contribution: 1.0 },
      { name: "Biceps", role: "partial", contribution: 0.5 },
      { name: "Rear Delts", role: "partial", contribution: 0.5 },
    ]
  },
  {
    name: "Seated Cable Row (Wide Grip)", pattern: "pull", equipment: "Cable",
    muscles: [
      { name: "Upper Back", role: "direct", contribution: 1.0 },
      { name: "Rear Delts", role: "partial", contribution: 0.5 },
      { name: "Lats", role: "partial", contribution: 0.5 },
      { name: "Biceps", role: "partial", contribution: 0.5 },
    ]
  },
  {
    name: "T-Bar Row", pattern: "pull", equipment: "Barbell",
    muscles: [
      { name: "Upper Back", role: "direct", contribution: 1.0 },
      { name: "Lats", role: "direct", contribution: 1.0 },
      { name: "Biceps", role: "partial", contribution: 0.5 },
      { name: "Rear Delts", role: "partial", contribution: 0.5 },
    ]
  },
  {
    name: "Machine Row", pattern: "pull", equipment: "Machine",
    muscles: [
      { name: "Upper Back", role: "direct", contribution: 1.0 },
      { name: "Lats", role: "direct", contribution: 1.0 },
      { name: "Biceps", role: "partial", contribution: 0.5 },
    ]
  },
  {
    name: "Pull-Up", pattern: "pull", equipment: "Bodyweight",
    muscles: [
      { name: "Lats", role: "direct", contribution: 1.0 },
      { name: "Biceps", role: "partial", contribution: 0.5 },
      { name: "Core", role: "minimal", contribution: 0.25 },
    ]
  },
  {
    name: "Chin-Up", pattern: "pull", equipment: "Bodyweight",
    muscles: [
      { name: "Lats", role: "direct", contribution: 1.0 },
      { name: "Biceps", role: "direct", contribution: 1.0 },
      { name: "Core", role: "minimal", contribution: 0.25 },
    ]
  },
  {
    name: "Neutral-Grip Pull-Up", pattern: "pull", equipment: "Bodyweight",
    muscles: [
      { name: "Lats", role: "direct", contribution: 1.0 },
      { name: "Biceps", role: "partial", contribution: 0.5 },
      { name: "Brachialis", role: "partial", contribution: 0.5 },
    ]
  },
  {
    name: "Lat Pulldown", pattern: "pull", equipment: "Cable",
    muscles: [
      { name: "Lats", role: "direct", contribution: 1.0 },
      { name: "Biceps", role: "partial", contribution: 0.5 },
    ]
  },
  {
    name: "Close-Grip Lat Pulldown", pattern: "pull", equipment: "Cable",
    muscles: [
      { name: "Lats", role: "direct", contribution: 1.0 },
      { name: "Biceps", role: "partial", contribution: 0.5 },
      { name: "Brachialis", role: "partial", contribution: 0.5 },
    ]
  },
  {
    name: "Straight-Arm Pulldown", pattern: "pull", equipment: "Cable",
    muscles: [
      { name: "Lats", role: "direct", contribution: 1.0 },
      { name: "Core", role: "minimal", contribution: 0.25 },
    ]
  },
  {
    name: "Single-Arm Cable Row", pattern: "pull", equipment: "Cable",
    muscles: [
      { name: "Lats", role: "direct", contribution: 1.0 },
      { name: "Upper Back", role: "partial", contribution: 0.5 },
      { name: "Biceps", role: "partial", contribution: 0.5 },
      { name: "Rear Delts", role: "minimal", contribution: 0.25 },
    ]
  },
  {
    name: "Meadows Row", pattern: "pull", equipment: "Barbell",
    muscles: [
      { name: "Lats", role: "direct", contribution: 1.0 },
      { name: "Upper Back", role: "partial", contribution: 0.5 },
      { name: "Biceps", role: "partial", contribution: 0.5 },
      { name: "Rear Delts", role: "partial", contribution: 0.5 },
    ]
  },
  {
    name: "Inverted Row", pattern: "pull", equipment: "Bodyweight",
    muscles: [
      { name: "Upper Back", role: "direct", contribution: 1.0 },
      { name: "Lats", role: "partial", contribution: 0.5 },
      { name: "Biceps", role: "partial", contribution: 0.5 },
      { name: "Rear Delts", role: "partial", contribution: 0.5 },
    ]
  },

  // ── PULL: REAR DELTS / TRAPS ──────────────────────────────
  {
    name: "Face Pull", pattern: "pull", equipment: "Cable",
    muscles: [
      { name: "Rear Delts", role: "direct", contribution: 1.0 },
      { name: "Rotator Cuff", role: "direct", contribution: 1.0 },
      { name: "Traps", role: "minimal", contribution: 0.25 },
    ]
  },
  {
    name: "Reverse Fly (Dumbbell)", pattern: "pull", equipment: "Dumbbells",
    muscles: [
      { name: "Rear Delts", role: "direct", contribution: 1.0 },
      { name: "Upper Back", role: "minimal", contribution: 0.25 },
    ]
  },
  {
    name: "Reverse Fly (Cable)", pattern: "pull", equipment: "Cable",
    muscles: [
      { name: "Rear Delts", role: "direct", contribution: 1.0 },
      { name: "Upper Back", role: "minimal", contribution: 0.25 },
    ]
  },
  {
    name: "Reverse Pec Deck", pattern: "pull", equipment: "Machine",
    muscles: [
      { name: "Rear Delts", role: "direct", contribution: 1.0 },
      { name: "Upper Back", role: "minimal", contribution: 0.25 },
    ]
  },
  {
    name: "Barbell Shrug", pattern: "pull", equipment: "Barbell",
    muscles: [{ name: "Traps", role: "direct", contribution: 1.0 }]
  },
  {
    name: "Dumbbell Shrug", pattern: "pull", equipment: "Dumbbells",
    muscles: [{ name: "Traps", role: "direct", contribution: 1.0 }]
  },
  {
    name: "Rack Pull", pattern: "pull", equipment: "Barbell",
    muscles: [
      { name: "Traps", role: "direct", contribution: 1.0 },
      { name: "Upper Back", role: "direct", contribution: 1.0 },
      { name: "Lower Back", role: "direct", contribution: 1.0 },
      { name: "Glutes", role: "partial", contribution: 0.5 },
      { name: "Hamstrings", role: "partial", contribution: 0.5 },
    ]
  },

  // ── PULL: BICEPS ──────────────────────────────────────────
  {
    name: "Barbell Curl", pattern: "pull", equipment: "Barbell",
    muscles: [
      { name: "Biceps", role: "direct", contribution: 1.0 },
      { name: "Forearms", role: "minimal", contribution: 0.25 },
    ]
  },
  {
    name: "EZ-Bar Curl", pattern: "pull", equipment: "Barbell",
    muscles: [
      { name: "Biceps", role: "direct", contribution: 1.0 },
      { name: "Forearms", role: "minimal", contribution: 0.25 },
    ]
  },
  {
    name: "Dumbbell Curl", pattern: "pull", equipment: "Dumbbells",
    muscles: [
      { name: "Biceps", role: "direct", contribution: 1.0 },
      { name: "Forearms", role: "minimal", contribution: 0.25 },
    ]
  },
  {
    name: "Hammer Curl", pattern: "pull", equipment: "Dumbbells",
    muscles: [
      { name: "Biceps", role: "direct", contribution: 1.0 },
      { name: "Brachialis", role: "direct", contribution: 1.0 },
      { name: "Forearms", role: "partial", contribution: 0.5 },
    ]
  },
  {
    name: "Incline Dumbbell Curl", pattern: "pull", equipment: "Dumbbells",
    muscles: [{ name: "Biceps", role: "direct", contribution: 1.0 }]
  },
  {
    name: "Preacher Curl", pattern: "pull", equipment: "Barbell",
    muscles: [{ name: "Biceps", role: "direct", contribution: 1.0 }]
  },
  {
    name: "Cable Curl", pattern: "pull", equipment: "Cable",
    muscles: [
      { name: "Biceps", role: "direct", contribution: 1.0 },
      { name: "Forearms", role: "minimal", contribution: 0.25 },
    ]
  },
  {
    name: "Concentration Curl", pattern: "pull", equipment: "Dumbbells",
    muscles: [{ name: "Biceps", role: "direct", contribution: 1.0 }]
  },
  {
    name: "Reverse Curl", pattern: "pull", equipment: "Barbell",
    muscles: [
      { name: "Brachialis", role: "direct", contribution: 1.0 },
      { name: "Forearms", role: "direct", contribution: 1.0 },
      { name: "Biceps", role: "partial", contribution: 0.5 },
    ]
  },
  {
    name: "Wrist Curl", pattern: "pull", equipment: "Barbell",
    muscles: [{ name: "Forearms", role: "direct", contribution: 1.0 }]
  },
  {
    name: "Reverse Wrist Curl", pattern: "pull", equipment: "Barbell",
    muscles: [{ name: "Forearms", role: "direct", contribution: 1.0 }]
  },

  // ── LEGS: QUAD DOMINANT ───────────────────────────────────
  {
    name: "Barbell Back Squat", pattern: "legs", equipment: "Barbell",
    muscles: [
      { name: "Quads", role: "direct", contribution: 1.0 },
      { name: "Glutes", role: "direct", contribution: 1.0 },
      { name: "Hamstrings", role: "minimal", contribution: 0.25 },
      { name: "Core", role: "minimal", contribution: 0.25 },
    ]
  },
  {
    name: "Barbell Front Squat", pattern: "legs", equipment: "Barbell",
    muscles: [
      { name: "Quads", role: "direct", contribution: 1.0 },
      { name: "Glutes", role: "partial", contribution: 0.5 },
      { name: "Core", role: "partial", contribution: 0.5 },
    ]
  },
  {
    name: "Goblet Squat", pattern: "legs", equipment: "Dumbbells",
    muscles: [
      { name: "Quads", role: "direct", contribution: 1.0 },
      { name: "Glutes", role: "partial", contribution: 0.5 },
      { name: "Core", role: "minimal", contribution: 0.25 },
    ]
  },
  {
    name: "Hack Squat", pattern: "legs", equipment: "Machine",
    muscles: [
      { name: "Quads", role: "direct", contribution: 1.0 },
      { name: "Glutes", role: "partial", contribution: 0.5 },
    ]
  },
  {
    name: "Leg Press", pattern: "legs", equipment: "Machine",
    muscles: [
      { name: "Quads", role: "direct", contribution: 1.0 },
      { name: "Glutes", role: "partial", contribution: 0.5 },
      { name: "Hamstrings", role: "minimal", contribution: 0.25 },
    ]
  },
  {
    name: "Leg Extension", pattern: "legs", equipment: "Machine",
    muscles: [{ name: "Quads", role: "direct", contribution: 1.0 }]
  },
  {
    name: "Bulgarian Split Squat", pattern: "legs", equipment: "Dumbbells",
    muscles: [
      { name: "Quads", role: "direct", contribution: 1.0 },
      { name: "Glutes", role: "direct", contribution: 1.0 },
      { name: "Hamstrings", role: "minimal", contribution: 0.25 },
      { name: "Core", role: "minimal", contribution: 0.25 },
    ]
  },
  {
    name: "Walking Lunge", pattern: "legs", equipment: "Dumbbells",
    muscles: [
      { name: "Quads", role: "direct", contribution: 1.0 },
      { name: "Glutes", role: "direct", contribution: 1.0 },
      { name: "Hamstrings", role: "minimal", contribution: 0.25 },
      { name: "Core", role: "minimal", contribution: 0.25 },
    ]
  },
  {
    name: "Reverse Lunge", pattern: "legs", equipment: "Dumbbells",
    muscles: [
      { name: "Quads", role: "direct", contribution: 1.0 },
      { name: "Glutes", role: "direct", contribution: 1.0 },
      { name: "Hamstrings", role: "partial", contribution: 0.5 },
      { name: "Core", role: "minimal", contribution: 0.25 },
    ]
  },
  {
    name: "Step-Up", pattern: "legs", equipment: "Dumbbells",
    muscles: [
      { name: "Quads", role: "direct", contribution: 1.0 },
      { name: "Glutes", role: "direct", contribution: 1.0 },
      { name: "Hamstrings", role: "minimal", contribution: 0.25 },
    ]
  },
  {
    name: "Sissy Squat", pattern: "legs", equipment: "Bodyweight",
    muscles: [{ name: "Quads", role: "direct", contribution: 1.0 }]
  },
  {
    name: "Leg Press (Narrow Stance)", pattern: "legs", equipment: "Machine",
    muscles: [
      { name: "Quads", role: "direct", contribution: 1.0 },
      { name: "Glutes", role: "minimal", contribution: 0.25 },
    ]
  },
  {
    name: "Smith Machine Squat", pattern: "legs", equipment: "Machine",
    muscles: [
      { name: "Quads", role: "direct", contribution: 1.0 },
      { name: "Glutes", role: "partial", contribution: 0.5 },
      { name: "Hamstrings", role: "minimal", contribution: 0.25 },
    ]
  },
  {
    name: "Pendulum Squat", pattern: "legs", equipment: "Machine",
    muscles: [
      { name: "Quads", role: "direct", contribution: 1.0 },
      { name: "Glutes", role: "partial", contribution: 0.5 },
    ]
  },

  // ── LEGS: HIP/GLUTE ───────────────────────────────────────
  {
    name: "Conventional Deadlift", pattern: "legs", equipment: "Barbell",
    muscles: [
      { name: "Hamstrings", role: "direct", contribution: 1.0 },
      { name: "Glutes", role: "direct", contribution: 1.0 },
      { name: "Lower Back", role: "direct", contribution: 1.0 },
      { name: "Quads", role: "partial", contribution: 0.5 },
      { name: "Traps", role: "partial", contribution: 0.5 },
      { name: "Core", role: "minimal", contribution: 0.25 },
    ]
  },
  {
    name: "Sumo Deadlift", pattern: "legs", equipment: "Barbell",
    muscles: [
      { name: "Glutes", role: "direct", contribution: 1.0 },
      { name: "Hamstrings", role: "direct", contribution: 1.0 },
      { name: "Quads", role: "partial", contribution: 0.5 },
      { name: "Lower Back", role: "partial", contribution: 0.5 },
      { name: "Adductors", role: "partial", contribution: 0.5 },
      { name: "Core", role: "minimal", contribution: 0.25 },
    ]
  },
  {
    name: "Romanian Deadlift", pattern: "legs", equipment: "Barbell",
    muscles: [
      { name: "Hamstrings", role: "direct", contribution: 1.0 },
      { name: "Glutes", role: "direct", contribution: 1.0 },
      { name: "Lower Back", role: "partial", contribution: 0.5 },
    ]
  },
  {
    name: "Dumbbell Romanian Deadlift", pattern: "legs", equipment: "Dumbbells",
    muscles: [
      { name: "Hamstrings", role: "direct", contribution: 1.0 },
      { name: "Glutes", role: "direct", contribution: 1.0 },
      { name: "Lower Back", role: "partial", contribution: 0.5 },
    ]
  },
  {
    name: "Stiff-Leg Deadlift", pattern: "legs", equipment: "Barbell",
    muscles: [
      { name: "Hamstrings", role: "direct", contribution: 1.0 },
      { name: "Glutes", role: "partial", contribution: 0.5 },
      { name: "Lower Back", role: "partial", contribution: 0.5 },
    ]
  },
  {
    name: "Hip Thrust", pattern: "legs", equipment: "Barbell",
    muscles: [
      { name: "Glutes", role: "direct", contribution: 1.0 },
      { name: "Hamstrings", role: "partial", contribution: 0.5 },
    ]
  },
  {
    name: "Glute Bridge", pattern: "legs", equipment: "Bodyweight",
    muscles: [
      { name: "Glutes", role: "direct", contribution: 1.0 },
      { name: "Hamstrings", role: "partial", contribution: 0.5 },
    ]
  },
  {
    name: "Cable Pull-Through", pattern: "legs", equipment: "Cable",
    muscles: [
      { name: "Glutes", role: "direct", contribution: 1.0 },
      { name: "Hamstrings", role: "partial", contribution: 0.5 },
      { name: "Lower Back", role: "minimal", contribution: 0.25 },
    ]
  },
  {
    name: "Good Morning", pattern: "legs", equipment: "Barbell",
    muscles: [
      { name: "Hamstrings", role: "direct", contribution: 1.0 },
      { name: "Lower Back", role: "direct", contribution: 1.0 },
      { name: "Glutes", role: "partial", contribution: 0.5 },
    ]
  },
  {
    name: "Glute-Ham Raise", pattern: "legs", equipment: "Bodyweight",
    muscles: [
      { name: "Hamstrings", role: "direct", contribution: 1.0 },
      { name: "Glutes", role: "partial", contribution: 0.5 },
      { name: "Lower Back", role: "minimal", contribution: 0.25 },
    ]
  },
  {
    name: "Leg Curl (Lying)", pattern: "legs", equipment: "Machine",
    muscles: [{ name: "Hamstrings", role: "direct", contribution: 1.0 }]
  },
  {
    name: "Leg Curl (Seated)", pattern: "legs", equipment: "Machine",
    muscles: [{ name: "Hamstrings", role: "direct", contribution: 1.0 }]
  },
  {
    name: "Nordic Hamstring Curl", pattern: "legs", equipment: "Bodyweight",
    muscles: [{ name: "Hamstrings", role: "direct", contribution: 1.0 }]
  },
  {
    name: "Single-Leg Romanian Deadlift", pattern: "legs", equipment: "Dumbbells",
    muscles: [
      { name: "Hamstrings", role: "direct", contribution: 1.0 },
      { name: "Glutes", role: "direct", contribution: 1.0 },
      { name: "Core", role: "partial", contribution: 0.5 },
    ]
  },
  {
    name: "Kettlebell Swing", pattern: "legs", equipment: "Dumbbells",
    muscles: [
      { name: "Glutes", role: "direct", contribution: 1.0 },
      { name: "Hamstrings", role: "partial", contribution: 0.5 },
      { name: "Core", role: "partial", contribution: 0.5 },
      { name: "Lower Back", role: "minimal", contribution: 0.25 },
    ]
  },
  {
    name: "Hip Abduction Machine", pattern: "legs", equipment: "Machine",
    muscles: [{ name: "Glutes", role: "direct", contribution: 1.0 }]
  },
  {
    name: "Hip Adduction Machine", pattern: "legs", equipment: "Machine",
    muscles: [{ name: "Adductors", role: "direct", contribution: 1.0 }]
  },
  {
    name: "Cable Kickback", pattern: "legs", equipment: "Cable",
    muscles: [{ name: "Glutes", role: "direct", contribution: 1.0 }]
  },

  // ── LEGS: CALVES ──────────────────────────────────────────
  {
    name: "Standing Calf Raise", pattern: "legs", equipment: "Machine",
    muscles: [{ name: "Calves", role: "direct", contribution: 1.0 }]
  },
  {
    name: "Seated Calf Raise", pattern: "legs", equipment: "Machine",
    muscles: [{ name: "Calves", role: "direct", contribution: 1.0 }]
  },
  {
    name: "Donkey Calf Raise", pattern: "legs", equipment: "Machine",
    muscles: [{ name: "Calves", role: "direct", contribution: 1.0 }]
  },
  {
    name: "Single-Leg Calf Raise", pattern: "legs", equipment: "Bodyweight",
    muscles: [{ name: "Calves", role: "direct", contribution: 1.0 }]
  },

  // ── CORE ──────────────────────────────────────────────────
  {
    name: "Plank", pattern: "core", equipment: "Bodyweight",
    muscles: [{ name: "Core", role: "direct", contribution: 1.0 }]
  },
  {
    name: "Side Plank", pattern: "core", equipment: "Bodyweight",
    muscles: [
      { name: "Obliques", role: "direct", contribution: 1.0 },
      { name: "Core", role: "partial", contribution: 0.5 },
    ]
  },
  {
    name: "Ab Rollout", pattern: "core", equipment: "Bodyweight",
    muscles: [
      { name: "Core", role: "direct", contribution: 1.0 },
      { name: "Lats", role: "minimal", contribution: 0.25 },
    ]
  },
  {
    name: "Hanging Leg Raise", pattern: "core", equipment: "Bodyweight",
    muscles: [
      { name: "Core", role: "direct", contribution: 1.0 },
      { name: "Hip Flexors", role: "partial", contribution: 0.5 },
    ]
  },
  {
    name: "Hanging Knee Raise", pattern: "core", equipment: "Bodyweight",
    muscles: [
      { name: "Core", role: "direct", contribution: 1.0 },
      { name: "Hip Flexors", role: "partial", contribution: 0.5 },
    ]
  },
  {
    name: "Cable Crunch", pattern: "core", equipment: "Cable",
    muscles: [{ name: "Core", role: "direct", contribution: 1.0 }]
  },
  {
    name: "Cable Woodchop", pattern: "core", equipment: "Cable",
    muscles: [
      { name: "Obliques", role: "direct", contribution: 1.0 },
      { name: "Core", role: "partial", contribution: 0.5 },
    ]
  },
  {
    name: "Pallof Press", pattern: "core", equipment: "Cable",
    muscles: [
      { name: "Core", role: "direct", contribution: 1.0 },
      { name: "Obliques", role: "direct", contribution: 1.0 },
    ]
  },
  {
    name: "Russian Twist", pattern: "core", equipment: "Bodyweight",
    muscles: [
      { name: "Obliques", role: "direct", contribution: 1.0 },
      { name: "Core", role: "partial", contribution: 0.5 },
    ]
  },
  {
    name: "Dead Bug", pattern: "core", equipment: "Bodyweight",
    muscles: [{ name: "Core", role: "direct", contribution: 1.0 }]
  },
  {
    name: "Bird Dog", pattern: "core", equipment: "Bodyweight",
    muscles: [
      { name: "Core", role: "direct", contribution: 1.0 },
      { name: "Lower Back", role: "partial", contribution: 0.5 },
      { name: "Glutes", role: "minimal", contribution: 0.25 },
    ]
  },
  {
    name: "Crunch", pattern: "core", equipment: "Bodyweight",
    muscles: [{ name: "Core", role: "direct", contribution: 1.0 }]
  },
  {
    name: "Bicycle Crunch", pattern: "core", equipment: "Bodyweight",
    muscles: [
      { name: "Core", role: "direct", contribution: 1.0 },
      { name: "Obliques", role: "direct", contribution: 1.0 },
    ]
  },
  {
    name: "Decline Sit-Up", pattern: "core", equipment: "Bodyweight",
    muscles: [
      { name: "Core", role: "direct", contribution: 1.0 },
      { name: "Hip Flexors", role: "partial", contribution: 0.5 },
    ]
  },
  {
    name: "Dragon Flag", pattern: "core", equipment: "Bodyweight",
    muscles: [{ name: "Core", role: "direct", contribution: 1.0 }]
  },
  {
    name: "Back Extension", pattern: "core", equipment: "Bodyweight",
    muscles: [
      { name: "Lower Back", role: "direct", contribution: 1.0 },
      { name: "Glutes", role: "partial", contribution: 0.5 },
      { name: "Hamstrings", role: "partial", contribution: 0.5 },
    ]
  },
  {
    name: "Reverse Hyperextension", pattern: "core", equipment: "Machine",
    muscles: [
      { name: "Lower Back", role: "direct", contribution: 1.0 },
      { name: "Glutes", role: "direct", contribution: 1.0 },
      { name: "Hamstrings", role: "partial", contribution: 0.5 },
    ]
  },
  {
    name: "Farmer's Walk", pattern: "core", equipment: "Dumbbells",
    muscles: [
      { name: "Core", role: "direct", contribution: 1.0 },
      { name: "Traps", role: "direct", contribution: 1.0 },
      { name: "Forearms", role: "direct", contribution: 1.0 },
      { name: "Glutes", role: "minimal", contribution: 0.25 },
    ]
  },
  {
    name: "Suitcase Carry", pattern: "core", equipment: "Dumbbells",
    muscles: [
      { name: "Obliques", role: "direct", contribution: 1.0 },
      { name: "Core", role: "direct", contribution: 1.0 },
      { name: "Traps", role: "partial", contribution: 0.5 },
      { name: "Forearms", role: "partial", contribution: 0.5 },
    ]
  },
];

// ============================================================
// ID GENERATION & LOOKUP
// ============================================================

function toId(name) {
  return name
    .toLowerCase()
    .replace(/[().']/g, "")
    .replace(/[-–]/g, "_")
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

EXERCISE_DATABASE.forEach(ex => { ex.id = toId(ex.name); });

export const EXERCISES = Object.fromEntries(
  EXERCISE_DATABASE.map(ex => [ex.id, ex])
);

// Backward-compatible aliases: old fitness-app IDs → new auto-generated IDs
const ALIASES = {
  incline_db_press:    "incline_dumbbell_bench_press",
  overhead_press:      "overhead_press_barbell",
  tricep_pushdown:     "tricep_pushdown_rope",
  dips:                "dip_chest_focus",
  overhead_tri_ext:    "overhead_tricep_extension_dumbbell",
  reverse_fly:         "reverse_fly_dumbbell",
  leg_curl:            "leg_curl_lying",
  calf_raise:          "standing_calf_raise",
};

Object.entries(ALIASES).forEach(([alias, target]) => {
  if (EXERCISES[target]) EXERCISES[alias] = EXERCISES[target];
});


// ============================================================
// VOLUME LANDMARKS — weekly sets per muscle group
// ============================================================

export const VOLUME_LANDMARKS = {
  Chest:          { mev: 8,  mav: 16, mrv: 22 },
  "Upper Chest":  { mev: 4,  mav: 8,  mrv: 12 },
  Lats:           { mev: 8,  mav: 16, mrv: 22 },
  "Upper Back":   { mev: 8,  mav: 16, mrv: 22 },
  "Front Delts":  { mev: 4,  mav: 8,  mrv: 14 },
  "Side Delts":   { mev: 8,  mav: 16, mrv: 22 },
  "Rear Delts":   { mev: 6,  mav: 12, mrv: 18 },
  Triceps:        { mev: 6,  mav: 12, mrv: 18 },
  Biceps:         { mev: 6,  mav: 12, mrv: 18 },
  Quads:          { mev: 8,  mav: 16, mrv: 22 },
  Hamstrings:     { mev: 6,  mav: 12, mrv: 18 },
  Glutes:         { mev: 4,  mav: 10, mrv: 16 },
  Calves:         { mev: 6,  mav: 12, mrv: 18 },
  Core:           { mev: 4,  mav: 10, mrv: 16 },
  "Lower Back":   { mev: 2,  mav: 6,  mrv: 10 },
  Traps:          { mev: 4,  mav: 10, mrv: 16 },
  Forearms:       { mev: 2,  mav: 8,  mrv: 14 },
  "Rotator Cuff": { mev: 2,  mav: 6,  mrv: 10 },
  Brachialis:     { mev: 2,  mav: 6,  mrv: 10 },
  Obliques:       { mev: 4,  mav: 10, mrv: 16 },
  "Hip Flexors":  { mev: 2,  mav: 6,  mrv: 10 },
  Adductors:      { mev: 4,  mav: 8,  mrv: 14 },
};


// ============================================================
// EXERCISE DEFAULTS — starting sets/reps/weight for plan builder
// ============================================================

export const EXERCISE_DEFAULTS = {
  barbell_bench_press:    { sets: 4, reps: 8,  weight: 135 },
  incline_db_press:       { sets: 3, reps: 10, weight: 50 },
  overhead_press:         { sets: 3, reps: 8,  weight: 95 },
  cable_lateral_raise:    { sets: 3, reps: 15, weight: 15 },
  tricep_pushdown:        { sets: 3, reps: 12, weight: 50 },
  dumbbell_fly:           { sets: 3, reps: 12, weight: 30 },
  dips:                   { sets: 3, reps: 10, weight: 0 },
  overhead_tri_ext:       { sets: 3, reps: 12, weight: 35 },
  barbell_row:            { sets: 4, reps: 8,  weight: 135 },
  pull_up:                { sets: 3, reps: 8,  weight: 0 },
  lat_pulldown:           { sets: 3, reps: 10, weight: 120 },
  seated_cable_row:       { sets: 3, reps: 10, weight: 120 },
  face_pull:              { sets: 3, reps: 15, weight: 30 },
  barbell_curl:           { sets: 3, reps: 10, weight: 60 },
  hammer_curl:            { sets: 3, reps: 10, weight: 30 },
  reverse_fly:            { sets: 3, reps: 15, weight: 15 },
  barbell_back_squat:     { sets: 4, reps: 6,  weight: 185 },
  romanian_deadlift:      { sets: 3, reps: 10, weight: 155 },
  leg_press:              { sets: 3, reps: 12, weight: 270 },
  bulgarian_split_squat:  { sets: 3, reps: 10, weight: 40 },
  leg_curl:               { sets: 3, reps: 12, weight: 80 },
  leg_extension:          { sets: 3, reps: 12, weight: 90 },
  hip_thrust:             { sets: 3, reps: 10, weight: 135 },
  calf_raise:             { sets: 3, reps: 15, weight: 135 },
  incline_barbell_bench_press:    { sets: 3, reps: 8,  weight: 115 },
  decline_barbell_bench_press:    { sets: 3, reps: 8,  weight: 135 },
  close_grip_bench_press:         { sets: 3, reps: 10, weight: 105 },
  dumbbell_bench_press:           { sets: 3, reps: 10, weight: 50 },
  incline_dumbbell_bench_press:   { sets: 3, reps: 10, weight: 45 },
  cable_fly:                      { sets: 3, reps: 12, weight: 25 },
  machine_chest_press:            { sets: 3, reps: 10, weight: 100 },
  push_up:                        { sets: 3, reps: 15, weight: 0 },
  dip_chest_focus:                { sets: 3, reps: 10, weight: 0 },
  overhead_press_barbell:         { sets: 3, reps: 8,  weight: 95 },
  dumbbell_shoulder_press:        { sets: 3, reps: 10, weight: 40 },
  arnold_press:                   { sets: 3, reps: 10, weight: 35 },
  lateral_raise:                  { sets: 3, reps: 15, weight: 15 },
  machine_shoulder_press:         { sets: 3, reps: 10, weight: 80 },
  tricep_pushdown_rope:           { sets: 3, reps: 12, weight: 50 },
  tricep_pushdown_bar:            { sets: 3, reps: 12, weight: 55 },
  overhead_tricep_extension_cable:    { sets: 3, reps: 12, weight: 40 },
  overhead_tricep_extension_dumbbell: { sets: 3, reps: 12, weight: 35 },
  skull_crushers:                 { sets: 3, reps: 10, weight: 65 },
  dip_tricep_focus:               { sets: 3, reps: 10, weight: 0 },
  pendlay_row:                    { sets: 3, reps: 8,  weight: 135 },
  dumbbell_row:                   { sets: 3, reps: 10, weight: 50 },
  chest_supported_row:            { sets: 3, reps: 10, weight: 45 },
  t_bar_row:                      { sets: 3, reps: 10, weight: 90 },
  machine_row:                    { sets: 3, reps: 10, weight: 100 },
  chin_up:                        { sets: 3, reps: 8,  weight: 0 },
  close_grip_lat_pulldown:        { sets: 3, reps: 10, weight: 110 },
  reverse_fly_dumbbell:           { sets: 3, reps: 15, weight: 15 },
  reverse_fly_cable:              { sets: 3, reps: 15, weight: 15 },
  barbell_shrug:                  { sets: 3, reps: 12, weight: 135 },
  dumbbell_shrug:                 { sets: 3, reps: 12, weight: 50 },
  ez_bar_curl:                    { sets: 3, reps: 10, weight: 55 },
  dumbbell_curl:                  { sets: 3, reps: 10, weight: 25 },
  preacher_curl:                  { sets: 3, reps: 10, weight: 50 },
  cable_curl:                     { sets: 3, reps: 12, weight: 40 },
  barbell_front_squat:            { sets: 3, reps: 8,  weight: 135 },
  goblet_squat:                   { sets: 3, reps: 10, weight: 50 },
  hack_squat:                     { sets: 3, reps: 10, weight: 180 },
  walking_lunge:                  { sets: 3, reps: 12, weight: 35 },
  conventional_deadlift:          { sets: 3, reps: 5,  weight: 225 },
  sumo_deadlift:                  { sets: 3, reps: 5,  weight: 225 },
  stiff_leg_deadlift:             { sets: 3, reps: 10, weight: 135 },
  glute_bridge:                   { sets: 3, reps: 12, weight: 0 },
  good_morning:                   { sets: 3, reps: 10, weight: 95 },
  leg_curl_lying:                 { sets: 3, reps: 12, weight: 80 },
  leg_curl_seated:                { sets: 3, reps: 12, weight: 80 },
  standing_calf_raise:            { sets: 3, reps: 15, weight: 135 },
  seated_calf_raise:              { sets: 3, reps: 15, weight: 90 },
};


// ============================================================
// HELPER
// ============================================================

export function getExDefault(exId) {
  const d = EXERCISE_DEFAULTS[exId] || { sets: 3, reps: 10, weight: 0 };
  return { id: exId, setDetails: Array.from({ length: d.sets }, () => ({ reps: d.reps, weight: d.weight })) };
}
