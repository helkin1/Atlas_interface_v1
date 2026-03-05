# Atlas Interface — User Profile & Onboarding Plan

## Overview

Two interconnected features: (1) a user profile data model that captures fitness-specific information, and (2) an onboarding flow that collects this data intelligently before routing to the plan builder/dashboard.

---

## 1. User Profile Data Model

### General User Data
| Field | Type | How We Ask | Why |
|-------|------|------------|-----|
| `displayName` | string | Text input | Personalization ("Good morning, Alex") |
| `age` | number | Number picker | Recovery capacity, volume recommendations |
| `sex` | enum: male/female/prefer_not_to_say | Select | Baseline strength estimates, body comp defaults |
| `heightCm` | number | Input (with unit toggle cm/ft-in) | BMI context, proportional exercise suggestions |
| `weightKg` | number | Input (with unit toggle kg/lbs) | Starting weight estimates, relative strength |
| `unitPreference` | enum: metric/imperial | Toggle | Display all weights/heights in preferred units |

### Fitness-Specific Data
| Field | Type | How We Ask | Why |
|-------|------|------------|-----|
| `experienceLevel` | enum: beginner/intermediate/advanced | Card select (with descriptions) | Volume ranges, exercise complexity, progression rate |
| `primaryGoal` | enum: hypertrophy/strength/endurance/recomp/general_fitness | Card select | Drives rep ranges, rest periods, exercise selection |
| `secondaryGoals` | string[] (multi-select from same list) | Multi-select chips | Adds nuance — "primarily strength, but also hypertrophy" |
| `trainingDaysPerWeek` | number (2-7) | Slider or stepper | Pre-fills schedule in builder |
| `sessionDuration` | enum: 30min/45min/60min/75min/90min+ | Select | Constrains exercise count per day |
| `equipment` | string[] multi-select | Checkbox grid | Filters exercise library |
| `injuries` | string[] multi-select | Checkbox grid + free text | Exclude/flag exercises that load affected areas |
| `focusMuscles` | string[] multi-select | Body diagram tap or checkbox | Prioritize volume for selected muscles |

### Equipment Options
- Full commercial gym
- Home gym (barbell + rack + bench)
- Dumbbells only
- Dumbbells + bench
- Kettlebells
- Resistance bands
- Bodyweight only
- Cable machine
- Smith machine

### Injury/Limitation Options
- Lower back
- Shoulder (rotator cuff)
- Knee
- Wrist
- Elbow (tennis/golfer's elbow)
- Hip
- Neck
- Ankle
- None

### Focus Muscle Options
Use existing muscle list from `exercise-data.js` (chest, back, shoulders, quads, hamstrings, glutes, biceps, triceps, calves, abs, forearms, traps)

---

## 2. Supabase Schema Changes

**Extend the `profiles` table** (currently only stores `id` and `theme`):

```sql
ALTER TABLE profiles ADD COLUMN display_name TEXT;
ALTER TABLE profiles ADD COLUMN age INTEGER;
ALTER TABLE profiles ADD COLUMN sex TEXT;
ALTER TABLE profiles ADD COLUMN height_cm REAL;
ALTER TABLE profiles ADD COLUMN weight_kg REAL;
ALTER TABLE profiles ADD COLUMN unit_preference TEXT DEFAULT 'imperial';
ALTER TABLE profiles ADD COLUMN experience_level TEXT;
ALTER TABLE profiles ADD COLUMN primary_goal TEXT;
ALTER TABLE profiles ADD COLUMN secondary_goals JSONB DEFAULT '[]';
ALTER TABLE profiles ADD COLUMN training_days_per_week INTEGER;
ALTER TABLE profiles ADD COLUMN session_duration TEXT;
ALTER TABLE profiles ADD COLUMN equipment JSONB DEFAULT '[]';
ALTER TABLE profiles ADD COLUMN injuries JSONB DEFAULT '[]';
ALTER TABLE profiles ADD COLUMN focus_muscles JSONB DEFAULT '[]';
ALTER TABLE profiles ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE profiles ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
```

Since we may not have direct DB migration access, we'll also cache the profile in localStorage (`atlas_profile`) and sync to Supabase via the existing storage pattern (localStorage-first, Supabase sync).

---

## 3. Onboarding Flow

### Current Post-Login Flow
```
Login → authUser set → pullFromCloud() → if plan exists → /dashboard, else → IntroScreen
```

### New Post-Login Flow
```
Login → authUser set → pullFromCloud() → check onboarding_completed
  → FALSE: /onboarding (new)
  → TRUE + has plan: /dashboard
  → TRUE + no plan: /builder
```

### Onboarding Steps (5 screens, wizard-style)

**Step 1: "Welcome — Let's Get to Know You"**
- Display name
- Age, sex
- Height, weight (with unit toggle)
- Tone: warm, casual, "This helps us personalize your experience"

**Step 2: "Your Fitness Background"**
- Experience level (beginner / intermediate / advanced) — card-style with descriptions:
  - Beginner: "New to lifting or less than 6 months consistent training"
  - Intermediate: "6 months to 2 years of consistent training"
  - Advanced: "2+ years of structured training, familiar with periodization"
- Available equipment — checkbox grid with icons

**Step 3: "Your Goals"**
- Primary goal — single select cards:
  - Hypertrophy: "Build muscle size"
  - Strength: "Get stronger on compound lifts"
  - Endurance: "Improve muscular endurance and work capacity"
  - Recomp: "Lose fat and gain muscle simultaneously"
  - General Fitness: "Overall health and functional strength"
- Secondary goals — multi-select from same list (minus primary)
- Focus muscles — optional multi-select (body part chips or diagram)

**Step 4: "Your Schedule"**
- Training days per week (2-7 slider/stepper)
- Session duration select
- Any injuries/limitations — checkbox + optional free text

**Step 5: "Your Plan — Review & Go"**
- Summary of all inputs
- Smart recommendation: based on goals + experience + days/week, suggest a split:
  - Beginner + 3 days → Full Body
  - Intermediate + 4 days → Upper/Lower
  - Intermediate/Advanced + 5-6 days → PPL
  - etc.
- "Build My Plan" CTA → saves profile (onboarding_completed = true) → routes to /builder with pre-filled data
- "Customize Myself" option → routes to /builder without pre-fill

### Design Notes
- Match existing dark/light theme system
- Use inline styles consistent with rest of app (no CSS framework)
- Progress indicator (dots or bar) at top
- Back/Next navigation
- Smooth transitions between steps
- Each step validates before allowing Next

---

## 4. Profile Page in Settings

### Access Point
Add "Profile" option to the SettingsMenu dropdown (above "Edit Plan").

### Profile Page Layout (`/profile` route)
- Header: "Your Profile" with back arrow
- Two sections in a card layout:

**Personal Info Section**
- Display name, age, sex, height, weight, units
- All editable inline or via modal

**Training Preferences Section**
- Experience level, goals, equipment, injuries, focus muscles, schedule
- All editable
- "Save Changes" button → updates localStorage + Supabase sync

### Behavior
- Pre-fills from saved profile data
- Save triggers re-sync to cloud
- Changes to equipment/injuries could trigger a suggestion: "Your equipment changed — want to review your plan's exercises?"

---

## 5. Integration Points

### Builder Pre-fill
When onboarding completes, pass profile data to builder:
- `trainingDaysPerWeek` → pre-set schedule (StepSchedule)
- `primaryGoal` → suggest matching split (StepGoalSplit)
- `equipment` → filter exercise library (StepExercises)
- `injuries` → flag/exclude exercises targeting injured areas (StepExercises)
- `experienceLevel` → adjust default progression rate, volume
- `focusMuscles` → highlight in volume analysis sidebar

### AI Insights Enhancement
Pass profile context to `/api/ai-suggest` so Claude can give personalized advice:
- "Given your shoulder injury, consider..."
- "As an intermediate lifter focused on hypertrophy..."

### Dashboard Personalization
- Greeting: "Good morning, {displayName}"
- Goal badges reflect actual primary goal (not hardcoded "hypertrophy")

---

## 6. Files to Create/Modify

### New Files
| File | Purpose |
|------|---------|
| `src/components/Onboarding.jsx` | 5-step onboarding wizard (single component with internal step state) |
| `src/components/ProfilePage.jsx` | Profile view/edit page |

### Modified Files
| File | Change |
|------|--------|
| `src/App.jsx` | Add `/onboarding` and `/profile` routes, add onboarding redirect logic |
| `src/utils/storage.js` | Add `KEYS.profile`, `saveProfile()`, `loadProfile()`, profile cloud sync |
| `src/lib/supabase.js` | Add `saveProfileToCloud()`, `loadProfileFromCloud()` functions |
| `src/components/SettingsMenu.jsx` | Add "Profile" menu item linking to `/profile` |
| `src/components/StepGoalSplit.jsx` | Accept profile data as props to pre-fill split suggestion |
| `src/components/StepSchedule.jsx` | Accept `trainingDaysPerWeek` to pre-set schedule |
| `src/components/StepExercises.jsx` | Filter exercises by equipment, flag injuries |
| `api/ai-suggest.js` | Include profile context in prompts to Claude |

---

## 7. Implementation Order

1. **Storage layer** — profile data model, localStorage + Supabase sync
2. **Onboarding component** — 5-step wizard
3. **App routing** — onboarding redirect logic, new routes
4. **Profile page** — view/edit under settings
5. **Builder integration** — pre-fill from profile
6. **AI integration** — pass profile context to insights
7. **Dashboard personalization** — greeting, dynamic badges
