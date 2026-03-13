import { useState, useEffect, useRef, useCallback } from "react";
import { Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import { themes, ThemeContext, resolveThemeKey } from "./context/theme.js";
import { PlanDataContext } from "./context/plan-data.js";
import { buildMonthFromPlan, DEFAULT_PLAN, clonePlan, ensurePlanId } from "./utils/plan-engine.js";
import { loadPlan, savePlan, loadTheme, saveTheme, hasSavedPlan, pullFromCloud, pushToCloud, loadProfile, saveProfile, isOnboardingComplete, seedDemoData, isDemoMode, exitDemoMode, archiveCurrentLogs } from "./utils/storage.js";
import { onAuthStateChange, signOut, updateUserMetadata } from "./lib/supabase.js";

import DashboardLayout from "./layouts/DashboardLayout.jsx";
import BuilderLayout from "./layouts/BuilderLayout.jsx";
import { MonthRoute, WeekRoute, DayRoute } from "./routes/DashboardRoutes.jsx";
import IntroScreen from "./components/IntroScreen.jsx";
import AuthScreen from "./components/AuthScreen.jsx";
import ProgressView from "./components/ProgressView.jsx";
import AIInsights from "./components/AIInsights.jsx";
import Onboarding from "./components/Onboarding.jsx";
import ProfilePage from "./components/ProfilePage.jsx";

/* ── Main App ─────────────────────────────────────────────────── */
export default function App() {
  const [authUser, setAuthUser] = useState(undefined); // undefined = loading, null = logged out, object = logged in
  const [authReady, setAuthReady] = useState(false);
  const [onboardingDone, setOnboardingDone] = useState(() => isOnboardingComplete());
  const [demoMode, setDemoMode] = useState(() => isDemoMode());
  const [themeMode, setThemeMode] = useState(() => loadTheme("dark"));
  const [plan, setPlan] = useState(() => ensurePlanId(loadPlan(clonePlan(DEFAULT_PLAN))));
  const [monthData, setMonthData] = useState(() => buildMonthFromPlan(ensurePlanId(loadPlan(clonePlan(DEFAULT_PLAN)))));
  const navigate = useNavigate();

  // Profile state
  const [userProfile, setUserProfile] = useState(() => loadProfile());

  // AI Insights panel
  const [showAI, setShowAI] = useState(false);

  // Listen for auth state changes
  useEffect(() => {
    if (isDemoMode()) {
      setAuthUser({ id: "demo", email: "demo@atlas.app" });
      const freshPlan = ensurePlanId(loadPlan(clonePlan(DEFAULT_PLAN)));
      setPlan(freshPlan);
      setMonthData(buildMonthFromPlan(freshPlan));
      setUserProfile(loadProfile());
      setAuthReady(true);
    }

    const { data: { subscription } } = onAuthStateChange(async (event, session) => {
      if (isDemoMode()) return;
      const user = session?.user ?? null;
      setAuthUser(user);

      if (user && (event === "SIGNED_IN" || event === "INITIAL_SESSION")) {
        // Show loading spinner while cloud data syncs (prevents flash of onboarding)
        setAuthReady(false);

        // Check onboarding flag from Supabase user metadata (survives across devices/browsers)
        const metaDone = user.user_metadata?.onboarding_completed === true;
        const localDone = isOnboardingComplete();
        setOnboardingDone(metaDone || localDone);

        // If localStorage knows onboarding is done but metadata doesn't, migrate the flag
        if (localDone && !metaDone) {
          updateUserMetadata({ onboarding_completed: true });
        }

        // Pull cloud data on sign-in AND on session restore (e.g. page refresh)
        const cloudTheme = await pullFromCloud(user.id);
        if (cloudTheme) setThemeMode(cloudTheme);
        if (hasSavedPlan()) await pushToCloud(user.id);
        const freshPlan = ensurePlanId(loadPlan(clonePlan(DEFAULT_PLAN)));
        setPlan(freshPlan);
        setMonthData(buildMonthFromPlan(freshPlan));
        setUserProfile(loadProfile());

        // Re-check after cloud pull (cloud may have restored profile data)
        setOnboardingDone(metaDone || isOnboardingComplete());
      }

      setAuthReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    if (demoMode) {
      exitDemoMode();
      setDemoMode(false);
      setAuthUser(null);
      navigate("/");
      return;
    }
    await signOut();
    navigate("/");
  };

  const handleDemoMode = () => {
    const { profile, plan } = seedDemoData();
    setDemoMode(true);
    setAuthUser({ id: "demo", email: "demo@atlas.app" });
    setUserProfile(profile);
    setOnboardingDone(true);
    const freshPlan = ensurePlanId(plan);
    setPlan(freshPlan);
    setMonthData(buildMonthFromPlan(freshPlan));
    setAuthReady(true);
    navigate("/dashboard");
  };

  // ── Builder state ──────────────────────────────────────────
  const [builderStep, setBuilderStep] = useState(0);
  const [builderPlan, _setBuilderPlan] = useState(() => clonePlan(DEFAULT_PLAN));

  const historyRef = useRef({ past: [], future: [] });
  const setBuilderPlan = useCallback((planOrFn) => {
    _setBuilderPlan(prev => {
      const next = typeof planOrFn === "function" ? planOrFn(prev) : planOrFn;
      historyRef.current.past.push(prev);
      if (historyRef.current.past.length > 40) historyRef.current.past.shift();
      historyRef.current.future = [];
      return next;
    });
  }, []);
  const canUndo = historyRef.current.past.length > 0;
  const canRedo = historyRef.current.future.length > 0;
  const undo = () => { if (!canUndo) return; const prev = historyRef.current.past.pop(); historyRef.current.future.push(builderPlan); _setBuilderPlan(prev); };
  const redo = () => { if (!canRedo) return; const next = historyRef.current.future.pop(); historyRef.current.past.push(builderPlan); _setBuilderPlan(next); };

  const location = useLocation();
  const isBuilder = location.pathname.startsWith("/builder");

  useEffect(() => { saveTheme(themeMode); }, [themeMode]);

  useEffect(() => { savePlan(ensurePlanId(plan)); }, [plan]);

  // Keyboard shortcut: Ctrl/Cmd+Z = undo, Ctrl/Cmd+Shift+Z = redo (builder only)
  useEffect(() => {
    if (!isBuilder) return;
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) redo(); else undo();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isBuilder, undo, redo]);

  const t = themes[resolveThemeKey(themeMode)];
  const toggleTheme = () => setThemeMode(m => m === "dark" ? "light" : "dark");

  const startBuilder = () => {
    historyRef.current = { past: [], future: [] };
    _setBuilderPlan(clonePlan(DEFAULT_PLAN));
    setBuilderStep(0);
    navigate("/builder");
  };

  const activatePlan = () => {
    // Archive current workout logs before switching plans
    if (plan?.planId) {
      archiveCurrentLogs(plan.planId, plan.splitName);
    }
    const nextPlan = ensurePlanId(clonePlan(builderPlan));
    const newMonth = buildMonthFromPlan(nextPlan);
    setPlan(nextPlan);
    setMonthData(newMonth);
    navigate("/dashboard");
  };

  const editPlan = () => {
    historyRef.current = { past: [], future: [] };
    _setBuilderPlan(clonePlan(plan));
    setBuilderStep(0);
    navigate("/builder");
  };

  const cancelBuilder = () => {
    if (builderStep > 0) {
      setBuilderStep(builderStep - 1);
    } else {
      navigate(hasSavedPlan() ? "/dashboard" : "/");
    }
  };

  const canNext = builderStep === 0 ? !!builderPlan.splitKey : builderStep === 1 ? builderPlan.weekTemplate.some(d => !d.isRest) : true;

  const handleOnboardingComplete = (profile) => {
    saveProfile(profile);
    setUserProfile(profile);
    setOnboardingDone(true);
    // Persist flag to Supabase user metadata so it survives across devices/browsers
    updateUserMetadata({ onboarding_completed: true });
    // Send user to dashboard (or builder if no plan exists)
    if (hasSavedPlan()) {
      navigate("/dashboard");
    } else {
      navigate("/builder");
    }
  };

  // Shared dashboard layout props
  const dashLayoutProps = {
    plan, monthData, themeMode, toggleTheme,
    onEditPlan: editPlan, onSignOut: handleSignOut,
    onAIInsights: () => setShowAI(true),
    onProfile: () => navigate("/profile"),
    profile: userProfile,
  };

  // ── Loading state ──────────────────────────────────────────
  if (!authReady) {
    return (
      <ThemeContext.Provider value={t}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          body { background: ${t.bg}; transition: background 0.2s ease; }
        `}</style>
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
          <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: -0.5, color: t.text, fontFamily: "'Inter', sans-serif" }}>Atlas</div>
          <div style={{ width: 24, height: 24, border: `2px solid ${t.border}`, borderTopColor: t.text, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        </div>
      </ThemeContext.Provider>
    );
  }

  // ── Auth screen ────────────────────────────────────────────
  if (!authUser) {
    return (
      <ThemeContext.Provider value={t}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          body { background: ${t.bg}; transition: background 0.2s ease; }
        `}</style>
        <AuthScreen themeMode={themeMode} onToggleTheme={toggleTheme} onDemoMode={handleDemoMode} />
      </ThemeContext.Provider>
    );
  }

  // ── Authenticated app ──────────────────────────────────────
  return (
    <ThemeContext.Provider value={t}>
      <PlanDataContext.Provider value={monthData}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        body { background: ${t.bg}; transition: background 0.2s ease; }
        ::-webkit-scrollbar-thumb { background: ${t.border}; border-radius: 3px; }
      `}</style>

      {demoMode && (
        <div style={{ 
          position: "fixed", 
          top: 0, 
          left: 0, 
          right: 0, 
          zIndex: 9999, 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center", 
          gap: 12, 
          padding: "10px 16px", 
          background: t.surface2, 
          borderBottom: `1px solid ${t.border}`,
        }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: t.text }}>Demo Mode</span>
          <span style={{ fontSize: 12, color: t.textMuted }}>Exploring with sample data</span>
          <button 
            onClick={handleSignOut} 
            style={{ 
              fontSize: 12, 
              padding: "4px 12px", 
              borderRadius: 6, 
              border: `1px solid ${t.border}`, 
              background: "transparent", 
              color: t.textMuted, 
              cursor: "pointer", 
              fontWeight: 500,
            }}
          >
            Exit Demo
          </button>
        </div>
      )}

      <div style={demoMode ? { paddingTop: 40 } : undefined}>
      <Routes>
        <Route path="/" element={
          !onboardingDone
            ? <Navigate to="/onboarding" replace />
            : hasSavedPlan()
              ? <Navigate to="/dashboard" replace />
              : <IntroScreen onStart={startBuilder} themeMode={themeMode} onToggleTheme={toggleTheme} />
        } />

        <Route path="/onboarding" element={
          onboardingDone
            ? <Navigate to={hasSavedPlan() ? "/dashboard" : "/"} replace />
            : <Onboarding themeMode={themeMode} onToggleTheme={toggleTheme} onComplete={handleOnboardingComplete} />
        } />

        <Route path="/dashboard" element={<DashboardLayout {...dashLayoutProps} />}>
          <Route index element={<MonthRoute />} />
          <Route path="week/:weekIdx" element={<WeekRoute monthData={monthData} />} />
          <Route path="week/:weekIdx/day/:dayIdx" element={<DayRoute monthData={monthData} plan={plan} />} />
        </Route>

        <Route path="/progress" element={<DashboardLayout {...dashLayoutProps} />}>
          <Route index element={<ProgressView plan={plan} monthData={monthData} />} />
        </Route>

        <Route path="/builder" element={
          <BuilderLayout
            builderPlan={builderPlan} builderStep={builderStep}
            setBuilderStep={setBuilderStep} setBuilderPlan={setBuilderPlan}
            canUndo={canUndo} canRedo={canRedo} undo={undo} redo={redo}
            canNext={canNext} onCancel={cancelBuilder} onActivate={activatePlan}
            themeMode={themeMode} toggleTheme={toggleTheme}
          />
        } />

        <Route path="/profile" element={
          <ProfilePage onBack={() => navigate(hasSavedPlan() ? "/dashboard" : "/")} />
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </div>

      {showAI && <AIInsights plan={plan} onClose={() => setShowAI(false)} />}

      </PlanDataContext.Provider>
    </ThemeContext.Provider>
  );
}
