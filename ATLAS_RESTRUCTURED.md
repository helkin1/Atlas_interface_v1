# Atlas — Restructured Product & Technical Plan

## 1. PRODUCT VISION & THESIS

### The Problem
Wide gap between fitness research and public practice. Not just "what to do," but *how important* and *how often*.

Root cause: **Knowledge barrier to entry**. Creating a sustainable fitness plan requires understanding exercise science, periodization, recovery, and individual adaptation. Most people give up because the cognitive load is too high.

Additionally: **Non-dynamic plans fail** when life/goals change. People need systems, not static spreadsheets.

### The Solution: Atlas
An AI-integrated fitness platform that **removes cognitive load** by embedding intelligence into a purpose-built system.

**Key Insight (Differentiation):**
- ❌ ChatGPT fitness = "smart friend" (user asks questions, manages planning)
- ✅ Atlas = "smart system" (AI manages training behind the scenes)

Users don't need to know MEV/MAV/MRV. The system surfaces insights automatically:
- Training balance across muscle groups
- Volume & intensity trends
- Strength & growth trajectories
- Recovery gaps
- Progressive overload recommendations

### Target User Tiers
1. **No plan** → Create one from scratch (AI-guided)
2. **Existing plan** → Upload/import, let AI optimize
3. **Advanced users** → Copy/adapt published plans from coaches/influencers

### Accessibility
- UI complexity scales by fitness knowledge (beginner → advanced)
- Multiple input styles: manual logging, voice, video upload, plan imports
- Works with any equipment; adapts to injuries

---

## 2. FEATURE REQUIREMENTS (MVP → Mature)

### MVP (Tier 1: Web Launch)
**Effort:** 1–2 weeks | **Complexity:** Low

**Must Have:**
- [ ] Plan creation wizard (working)
- [ ] Dashboard with calendar view (working)
- [ ] Exercise database (125 exercises — thin but functional)
- [ ] Data stored in localStorage (no sync)
- [ ] Responsive UI (mobile-friendly)

**Deploy:** Static site to Vercel (npm run build → Vercel)

---

### Phase 1: Core Product (Weeks 1–6)

**1.1 Exercise Science Engine** ⭐ (CRITICAL PATH)
**Effort:** 2–3 weeks | **Owner:** TBD | **Status:** Not started

What it does:
- Validates training splits against exercise science (e.g., enough pulling/pushing balance?)
- Calculates volume landmarks per muscle group
- Detects progressive overload (is weight/reps increasing over time?)
- Flags recovery gaps, deload opportunities

Inputs:
- User's current plan (exercises, volume, frequency)
- Fitness goal (strength, hypertrophy, endurance, health, aesthetics)
- Available equipment

Outputs:
- ✓ Plan is balanced / ⚠ Lacks [muscle group]
- Current weekly volume per muscle
- Next session recommendations (weight, reps)
- Recovery status

**Dependencies:** None (pure logic)

---

**1.2 Session Logging UX** ⭐ (CRITICAL PATH)
**Effort:** 2–3 weeks | **Owner:** TBD | **Status:** Data model exists, UX not built

What it does:
- User starts a workout → guided through each set
- Log weight, reps, RPE/RIR
- Option to swap exercises (AI suggests alternatives)
- Real-time feedback (form tips, if enough sets done, etc.)
- Finish → AI recalculates next workout

Design:
```
┌─────────────────────┐
│ Today's Workout     │
│ Bench Press         │
│ Set 1/4: 185 x 8    │
│ [✓] Done            │
│ [Swap Exercise]     │
│ [Skip Set]          │
│ [Form Tips]         │
└─────────────────────┘
```

**Dependencies:** Exercise science engine (for suggestions)

---

**1.3 Progress & Insights Layer**
**Effort:** 1–2 weeks | **Owner:** TBD | **Status:** Not started

Basic version:
- Volume by muscle group (weekly bar chart)
- PR detection (highest weight/reps per exercise)
- Workout completion rate (% workouts done vs planned)
- Trend arrows (↑ ↓ → volume, strength trajectory)

Advanced version (later):
- Periodization visualization
- Estimated 1RM projection
- Recovery scoring
- Custom metrics

**Dependencies:** Session logging

---

**1.4 Exercise Database Expansion**
**Effort:** 1–2 weeks (data entry) | **Owner:** TBD | **Status:** 125 exercises, need ~400+

What's needed:
- Cover major movement patterns (pressing, pulling, legs, core, isolation)
- Muscle contribution mappings (which muscles work, how much)
- Difficulty tiers (beginner → advanced variants)
- Equipment tags (barbell, dumbbell, machine, bodyweight)

Source: Extract from studies + create JSON fixtures

**Dependencies:** None (can run parallel)

---

### Phase 2: Cloud Infrastructure (Weeks 2–3)

**2.1 Authentication**
**Effort:** 3–5 days | **Complexity:** Medium

Use Supabase + Auth0:
- Sign up / Sign in
- Password reset
- Session management

**2.2 Database Migration**
**Effort:** 1 week | **Complexity:** Medium

Map localStorage schema → Postgres:
```
users (id, email, created_at)
plans (id, user_id, name, goal, split_type)
workouts (id, plan_id, day, exercises)
sessions (id, workout_id, date, completed)
exercise_logs (id, session_id, exercise_id, sets, reps, weight)
```

**2.3 API Layer**
**Effort:** 1 week | **Complexity:** Medium

Serverless functions (Vercel/Netlify):
- `POST /plans` (create)
- `GET /plans/:id` (read)
- `PUT /plans/:id` (update)
- `GET /sessions/:id/insights` (calculate progress)

---

### Phase 3: Mobile & Monetization (Weeks 7+)

**3.1 PWA (Progressive Web App)**
**Effort:** 3–5 days | **Complexity:** Low

Add manifest.json + service worker → installable on mobile home screen

**3.2 Native Mobile (Optional)**
**Effort:** 3–6 months | **Complexity:** High

React Native or Capacitor if PWA isn't sufficient

**3.3 Coach/Influencer Publishing**
**Effort:** 2–3 weeks | **Complexity:** Medium

Allow power users to publish plans:
- Pricing tier
- License terms
- Analytics (how many copies, reviews)

---

## 3. TECHNICAL ROADMAP

### Codebase Status Today

**Strengths:**
- ✅ Vite/React foundation solid
- ✅ Data model (6-layer: User → Plan → Cycle → Day → ExerciseEntry → Set)
- ✅ storage.js abstracted (easy to swap localStorage → API)
- ✅ Exercise data + helpers are pure functions (portable)
- ✅ Theme/Context already in place

**Critical Gaps:**
- ❌ **Monolith:** fitness-app.jsx is 1460 lines (unmaintainable)
- ❌ No auth system
- ❌ No error boundaries (app crashes ungracefully)
- ❌ No tests (risky to refactor)
- ❌ No README / contributor docs

---

### Recommended Build Path

**Week 1: Deploy Tier 1 (Static Web)**
```bash
npm run build
# Deploy /dist to Vercel
# Point domain (optional)
```
**Goal:** Get live, gather feedback. No backend work yet.

**Week 2–3: Refactor + Foundation**
- [ ] Split fitness-app.jsx into smaller components
- [ ] Add error boundaries
- [ ] Write basic unit tests (Jest)
- [ ] Add README with architecture docs
- [ ] Set up CI/CD (GitHub Actions)

**Week 3: Add Auth + Supabase**
- [ ] Supabase project setup
- [ ] Auth integration
- [ ] DB schema + migrations
- [ ] API layer (serverless functions)

**Week 4–6: Build Core Features**
1. Session logging UX
2. Exercise science engine
3. Progress insights
4. Error handling + loading states

**Week 7+: Mobile + Monetization**
- [ ] PWA (fast)
- [ ] Coach publishing (medium effort)
- [ ] Native mobile (if demand)

---

## 4. CODEBASE AUDIT & TASKS

### High Priority (Do First)
- [ ] **Split fitness-app.jsx** → Break into component files (PlanBuilder, Dashboard, SessionLog, etc.)
- [ ] **Add error boundaries** → Graceful error handling
- [ ] **Add Jest tests** → Especially plan engine logic
- [ ] **Write README** → Architecture overview + dev setup

### Medium Priority (Do Next)
- [ ] Set up Supabase project
- [ ] Design DB schema + migrations
- [ ] Create serverless function stubs
- [ ] Add form validation + error messaging

### Low Priority (Polish)
- [ ] PWA manifest
- [ ] Accessibility audit (a11y)
- [ ] Performance profiling

---

## 5. CRITICAL PATH (Next 6 Weeks)

```
Week 1: Deploy to Vercel (Tier 1 static)
         ↓
Week 2: Refactor monolith + add error boundaries
Week 3: Add auth + Supabase setup
         ↓
Weeks 4–6: Build session logging + exercise science engine + insights
         ↓
Week 7: PWA or mobile decision
```

**Blockers:** None — everything can start immediately.

**Dependencies:**
- Session logging UX depends on exercise science engine
- Insights depends on session logging

---

## 6. OWNERSHIP & STATUS

| Task | Owner | Status | ETA |
|------|-------|--------|-----|
| Deploy Tier 1 | ? | — | Week 1 |
| Refactor monolith | ? | — | Week 2 |
| Exercise science engine | ? | — | Weeks 2–3 |
| Session logging UX | ? | — | Weeks 4–5 |
| Auth + Supabase | ? | — | Week 3 |
| Progress insights | ? | — | Week 6 |
| Exercise DB expand | ? | — | Week 4 |

---

## Questions to Answer

1. **Timeline:** Is 6–8 weeks realistic for you?
2. **Ownership:** Who's building what?
3. **Monetization:** Launch free first, or freemium from day 1?
4. **Coach marketplace:** In MVP or later phase?
5. **Form guidance:** Video tutorials or AI-generated cues?

---

**Next Step:** Assign owners to Phase 1 tasks and start Week 1 (deployment).
