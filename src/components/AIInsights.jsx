import { useState, useMemo } from "react";
import { useTheme } from "../context/theme.js";
import { loadWorkoutLogs, loadPlan, loadProfile } from "../utils/storage.js";
import { getPersonalizedConfig, calcPersonalizedGoalPcts, personalizedOverallScore, getMusclesByTier } from "../utils/personalization-engine.js";
import { analyzePlan } from "../utils/science-engine.js";
import { TierBadge, cardStyle } from "./shared.jsx";

const MODES = [
  { key: "analyze", label: "Quick Analysis", desc: "Overall plan assessment" },
  { key: "stall", label: "Stall Detection", desc: "Find plateaus in your lifts" },
  { key: "swap", label: "Exercise Swaps", desc: "Fresh alternatives" },
  { key: "personalized", label: "Personalized Review", desc: "How well your plan fits YOUR goals" },
];

export default function AIInsights({ plan, onClose }) {
  const t = useTheme();
  const [mode, setMode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const run = async (type) => {
    setMode(type);
    setLoading(true);
    setError(null);
    setResult(null);

    // Personalized review runs client-side — no API call needed
    if (type === "personalized") {
      try {
        const currentPlan = plan || loadPlan(null);
        const profile = loadProfile();
        const config = getPersonalizedConfig(profile);
        if (!currentPlan?.weekTemplate) throw new Error("No plan found");
        const report = analyzePlan(currentPlan.weekTemplate);
        const goals = calcPersonalizedGoalPcts(report.effectiveSets, config);
        const score = personalizedOverallScore(goals, config);
        const tiers = getMusclesByTier(config);

        // Build insights
        const insights = [];
        Object.entries(goals).forEach(([m, d]) => {
          if (d.tier === "excluded") return;
          if (d.tier === "priority" && d.pct < 80 && d.target > 0) {
            insights.push({ type: "gap", muscle: m, tier: d.tier, pct: d.pct, target: d.target, eff: d.eff });
          }
          if (d.tier === "maintenance" && d.pct > 120) {
            insights.push({ type: "excess", muscle: m, tier: d.tier, pct: d.pct, target: d.target, eff: d.eff });
          }
        });
        // Check injured muscles still being trained
        const excluded = Object.entries(goals).filter(([, d]) => d.tier === "excluded" && d.eff > 0);
        excluded.forEach(([m, d]) => {
          insights.push({ type: "injury_concern", muscle: m, eff: d.eff });
        });

        setResult({ data: { score, insights, tiers, config } });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      const logs = loadWorkoutLogs();
      const currentPlan = plan || loadPlan(null);
      const profile = loadProfile();
      const personalizedConfig = getPersonalizedConfig(profile);
      const res = await fetch("/api/ai-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, plan: currentPlan, logs, profile, personalizedConfig }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Request failed (${res.status})`);
      }
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: t.modalOverlay, zIndex: 200 }} />
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, width: 420, maxWidth: "100vw",
        background: t.bg, borderLeft: `1px solid ${t.border}`, zIndex: 201,
        display: "flex", flexDirection: "column", overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${t.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: t.text }}>AI Insights</div>
            <div style={{ fontSize: 11, color: t.textDim, marginTop: 2 }}>Powered by Claude</div>
          </div>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${t.borderLight}`, background: "transparent", color: t.textMuted, cursor: "pointer", fontSize: 14 }}>{"\u2715"}</button>
        </div>

        {/* Mode selection */}
        {!mode && (
          <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ fontSize: 12, color: t.textDim, marginBottom: 4 }}>Choose an analysis type:</div>
            {MODES.map(m => (
              <button key={m.key} onClick={() => run(m.key)} style={{
                padding: 16, borderRadius: 12, background: t.surface,
                cursor: "pointer", textAlign: "left", transition: "border-color 0.15s",
              }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: t.text, marginBottom: 4 }}>{m.label}</div>
                <div style={{ fontSize: 12, color: t.textDim }}>{m.desc}</div>
              </button>
            ))}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
            <div style={{ width: 28, height: 28, border: `2px solid ${t.borderLight}`, borderTopColor: "#3B82F6", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            <div style={{ fontSize: 12, color: t.textDim }}>Analyzing your training data...</div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ padding: 24 }}>
            <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#EF4444", marginBottom: 4 }}>Analysis failed</div>
              <div style={{ fontSize: 12, color: t.textDim }}>{error}</div>
            </div>
            <button onClick={() => { setMode(null); setError(null); }} style={{ marginTop: 12, fontSize: 12, color: "#3B82F6", background: "none", border: "none", cursor: "pointer" }}>{"\u2190"} Try again</button>
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div style={{ flex: 1, overflow: "auto", padding: 24 }}>
            <button onClick={() => { setMode(null); setResult(null); }} style={{ fontSize: 11, color: "#3B82F6", background: "none", border: "none", cursor: "pointer", marginBottom: 16 }}>{"\u2190"} Back</button>

            {mode === "analyze" && <AnalyzeResult data={result.data} t={t} />}
            {mode === "stall" && <StallResult data={result.data} t={t} />}
            {mode === "swap" && <SwapResult data={result.data} t={t} />}
            {mode === "personalized" && <PersonalizedResult data={result.data} t={t} />}
          </div>
        )}
      </div>
    </>
  );
}

function AnalyzeResult({ data, t }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {data.summary && (
        <div style={{ fontSize: 13, color: t.text, lineHeight: 1.6 }}>{data.summary}</div>
      )}
      {data.strengths?.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#22C55E", marginBottom: 8 }}>Strengths</div>
          {data.strengths.map((s, i) => (
            <div key={i} style={{ fontSize: 12, color: t.textMuted, padding: "6px 0", borderBottom: `1px solid ${t.border}` }}>{s}</div>
          ))}
        </div>
      )}
      {data.improvements?.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#F59E0B", marginBottom: 8 }}>Improvements</div>
          {data.improvements.map((s, i) => (
            <div key={i} style={{ fontSize: 12, color: t.textMuted, padding: "6px 0", borderBottom: `1px solid ${t.border}` }}>{s}</div>
          ))}
        </div>
      )}
      {data.tip && (
        <div style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.15)", borderRadius: 10, padding: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#3B82F6", marginBottom: 4 }}>Tip</div>
          <div style={{ fontSize: 12, color: t.text, lineHeight: 1.5 }}>{data.tip}</div>
        </div>
      )}
    </div>
  );
}

function StallResult({ data, t }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {data.general && (
        <div style={{ fontSize: 13, color: t.text, lineHeight: 1.6 }}>{data.general}</div>
      )}
      {data.stalls?.length > 0 ? data.stalls.map((s, i) => (
        <div key={i} style={{ background: t.surface, borderRadius: 12, padding: 20, boxShadow: t.shadow }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#F59E0B", marginBottom: 6 }}>{s.exercise}</div>
          <div style={{ fontSize: 12, color: t.textDim, marginBottom: 8 }}>{s.observation}</div>
          <div style={{ fontSize: 12, color: t.text, background: "rgba(59,130,246,0.06)", borderRadius: 8, padding: 10 }}>{s.suggestion}</div>
        </div>
      )) : (
        <div style={{ fontSize: 12, color: "#22C55E" }}>No stalls detected. Keep pushing!</div>
      )}
    </div>
  );
}

function SwapResult({ data, t }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {data.swaps?.map((s, i) => (
        <div key={i} style={{ background: t.surface, borderRadius: 12, padding: 20, boxShadow: t.shadow }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: t.text, marginBottom: 4 }}>{s.current}</div>
          <div style={{ fontSize: 11, color: t.textDim, marginBottom: 10 }}>{s.reason}</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {s.alternatives?.map((alt, j) => (
              <span key={j} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 8, background: "rgba(59,130,246,0.08)", color: "#3B82F6", border: "1px solid rgba(59,130,246,0.15)" }}>{alt}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function PersonalizedResult({ data, t }) {
  const { score, insights, config } = data;
  const goalLabel = config.primaryGoal ? config.primaryGoal.charAt(0).toUpperCase() + config.primaryGoal.slice(1).replace("_", " ") : "your";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ textAlign: "center", padding: 20, background: t.surface, borderRadius: 12, boxShadow: t.shadow }}>
        <div style={{ fontSize: 36, fontWeight: 700, color: score >= 80 ? "#22C55E" : score >= 60 ? "#F59E0B" : "#EF4444" }}>{score}%</div>
        <div style={{ fontSize: 12, color: t.textDim, marginTop: 4 }}>Personalized Fitness Score</div>
        <div style={{ fontSize: 11, color: t.textFaint, marginTop: 2 }}>Weighted by your {goalLabel} goal</div>
      </div>

      {insights.length > 0 ? (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: t.textMuted, marginBottom: 10 }}>Insights</div>
          {insights.map((ins, i) => (
            <div key={i} style={{ padding: "10px 12px", borderRadius: 10, marginBottom: 6, background: ins.type === "injury_concern" ? "rgba(239,68,68,0.06)" : ins.type === "gap" ? "rgba(245,158,11,0.06)" : "rgba(59,130,246,0.06)" }}>
              {ins.type === "gap" && (
                <div style={{ fontSize: 12, color: t.textMuted }}>
                  <span style={{ fontWeight: 600 }}>{ins.muscle}</span> is at {ins.pct}% of target — a <TierBadge tier={ins.tier} /> muscle that needs +{Math.round(ins.target - ins.eff)} sets/wk
                </div>
              )}
              {ins.type === "excess" && (
                <div style={{ fontSize: 12, color: t.textMuted }}>
                  <span style={{ fontWeight: 600 }}>{ins.muscle}</span> has {Math.round(ins.eff)} sets/wk but only needs {Math.round(ins.target)} as a <TierBadge tier={ins.tier} /> muscle — consider redistributing volume
                </div>
              )}
              {ins.type === "injury_concern" && (
                <div style={{ fontSize: 12, color: "#EF4444" }}>
                  <span style={{ fontWeight: 600 }}>{ins.muscle}</span> is excluded (injury) but still getting {Math.round(ins.eff * 10) / 10} effective sets — review exercises targeting this area
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ fontSize: 12, color: "#22C55E", textAlign: "center", padding: 16 }}>
          Your plan is well-aligned with your {goalLabel} goal. No major adjustments needed.
        </div>
      )}
    </div>
  );
}
