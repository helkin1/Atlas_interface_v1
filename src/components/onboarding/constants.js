export const EQUIPMENT_OPTIONS = [
  { id: "full_gym", label: "Full Commercial Gym", icon: "\uD83C\uDFCB\uFE0F" },
  { id: "home_barbell", label: "Home Gym (Barbell + Rack + Bench)", icon: "\uD83C\uDFE0" },
  { id: "dumbbells_bench", label: "Dumbbells + Bench", icon: "\uD83D\uDCAA" },
  { id: "dumbbells_only", label: "Dumbbells Only", icon: "\uD83D\uDD25" },
  { id: "kettlebells", label: "Kettlebells", icon: "\u{1FA86}" },
  { id: "bands", label: "Resistance Bands", icon: "\u{1F4CF}" },
  { id: "bodyweight", label: "Bodyweight Only", icon: "\u{1F9D8}" },
  { id: "cables", label: "Cable Machine", icon: "\u{1F517}" },
  { id: "smith_machine", label: "Smith Machine", icon: "\u2699\uFE0F" },
];

export const INJURY_OPTIONS = [
  { id: "lower_back", label: "Lower Back" },
  { id: "shoulder", label: "Shoulder / Rotator Cuff" },
  { id: "knee", label: "Knee" },
  { id: "wrist", label: "Wrist" },
  { id: "elbow", label: "Elbow" },
  { id: "hip", label: "Hip" },
  { id: "neck", label: "Neck" },
  { id: "ankle", label: "Ankle" },
];

export const FOCUS_MUSCLES = [
  "Chest", "Back", "Shoulders", "Quads", "Hamstrings", "Glutes",
  "Biceps", "Triceps", "Calves", "Core", "Forearms", "Traps",
];

export const GOAL_OPTIONS = [
  { id: "hypertrophy", label: "Hypertrophy", desc: "Build muscle size and definition", icon: "\uD83D\uDCAA" },
  { id: "strength", label: "Strength", desc: "Get stronger on compound lifts", icon: "\uD83C\uDFCB\uFE0F" },
  { id: "endurance", label: "Endurance", desc: "Improve work capacity and muscular endurance", icon: "\u26A1" },
  { id: "recomp", label: "Recomp", desc: "Lose fat and gain muscle simultaneously", icon: "\uD83D\uDD25" },
  { id: "general_fitness", label: "General Fitness", desc: "Overall health and functional strength", icon: "\u2764\uFE0F" },
];

export const EXPERIENCE_OPTIONS = [
  { id: "beginner", label: "Beginner", desc: "New to lifting or less than 6 months consistent training" },
  { id: "intermediate", label: "Intermediate", desc: "6 months to 2 years of consistent, structured training" },
  { id: "advanced", label: "Advanced", desc: "2+ years of structured training, familiar with periodization" },
];

export const SESSION_DURATIONS = ["30 min", "45 min", "60 min", "75 min", "90+ min"];

export const STEPS = [
  { title: "Let's Get to Know You", subtitle: "This helps us personalize your experience" },
  { title: "Your Fitness Background", subtitle: "Tell us about your training experience" },
  { title: "Your Goals", subtitle: "What are you working toward?" },
  { title: "Your Schedule", subtitle: "How do you like to train?" },
  { title: "Review & Go", subtitle: "Here's what we've put together" },
];
