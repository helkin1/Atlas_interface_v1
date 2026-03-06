import { useState } from "react";
import { useTheme } from "../context/theme.js";
import { loadWorkoutLogs, loadPlan, loadProfile } from "../utils/storage.js";

const MODES = [
  { key: "analyze", label: "Quick Analysis", desc: "Overall plan assessment" },
  { key: "stall", label: "Stall Detection", desc: "Find plateaus in your lifts" },
  { key: "swap", label: "Exercise Swaps", desc: "Fresh alternatives" },
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
    try {
      const logs = loadWorkoutLogs();
      const currentPlan = plan || loadPlan(null);
      const profile = loadProfile();
      const res = await fetch("/api/ai-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, plan: currentPlan, logs, profile }),
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
      <div onClick={onClose} className="fixed inset-0 bg-overlay z-[200]" />
      <div className="fixed top-0 right-0 bottom-0 w-[420px] max-w-[100vw] bg-canvas border-l border-edge z-[201] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-edge flex justify-between items-center">
          <div>
            <div className="text-lg font-bold text-content">AI Insights</div>
            <div className="text-sm text-dim mt-0.5">Powered by Claude</div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-[6px] border border-edge-light bg-transparent text-muted cursor-pointer text-md">{"\u2715"}</button>
        </div>

        {/* Mode selection */}
        {!mode && (
          <div className="p-6 flex flex-col gap-2.5">
            <div className="text-xs text-dim mb-1">Choose an analysis type:</div>
            {MODES.map(m => (
              <button key={m.key} onClick={() => run(m.key)} className="p-4 rounded-sm bg-surface cursor-pointer text-left transition-colors duration-[150ms]">
                <div className="text-md font-semibold text-content mb-1">{m.label}</div>
                <div className="text-xs text-dim">{m.desc}</div>
              </button>
            ))}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <div className="w-7 h-7 border-2 border-edge-light border-t-primary rounded-full animate-spin" />
            <div className="text-xs text-dim">Analyzing your training data...</div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-6">
            <div className="bg-error/[0.08] border border-error/20 rounded-sm p-4">
              <div className="text-body font-semibold text-error mb-1">Analysis failed</div>
              <div className="text-xs text-dim">{error}</div>
            </div>
            <button onClick={() => { setMode(null); setError(null); }} className="mt-3 text-xs text-primary bg-none border-none cursor-pointer">{"\u2190"} Try again</button>
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div className="flex-1 overflow-auto p-6">
            <button onClick={() => { setMode(null); setResult(null); }} className="text-sm text-primary bg-none border-none cursor-pointer mb-4">{"\u2190"} Back</button>

            {mode === "analyze" && <AnalyzeResult data={result.data} />}
            {mode === "stall" && <StallResult data={result.data} />}
            {mode === "swap" && <SwapResult data={result.data} />}
          </div>
        )}
      </div>
    </>
  );
}

function AnalyzeResult({ data }) {
  return (
    <div className="flex flex-col gap-4">
      {data.summary && (
        <div className="text-body text-content leading-relaxed">{data.summary}</div>
      )}
      {data.strengths?.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-success mb-2">Strengths</div>
          {data.strengths.map((s, i) => (
            <div key={i} className="text-xs text-muted py-1.5 border-b border-edge">{s}</div>
          ))}
        </div>
      )}
      {data.improvements?.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-warning mb-2">Improvements</div>
          {data.improvements.map((s, i) => (
            <div key={i} className="text-xs text-muted py-1.5 border-b border-edge">{s}</div>
          ))}
        </div>
      )}
      {data.tip && (
        <div className="bg-primary/[0.06] border border-primary/15 rounded-[10px] p-3.5">
          <div className="text-sm font-semibold text-primary mb-1">Tip</div>
          <div className="text-xs text-content leading-relaxed">{data.tip}</div>
        </div>
      )}
    </div>
  );
}

function StallResult({ data }) {
  return (
    <div className="flex flex-col gap-4">
      {data.general && (
        <div className="text-body text-content leading-relaxed">{data.general}</div>
      )}
      {data.stalls?.length > 0 ? data.stalls.map((s, i) => (
        <div key={i} className="bg-surface rounded-sm p-5 shadow-card">
          <div className="text-body font-semibold text-warning mb-1.5">{s.exercise}</div>
          <div className="text-xs text-dim mb-2">{s.observation}</div>
          <div className="text-xs text-content bg-primary/[0.06] rounded-[8px] p-2.5">{s.suggestion}</div>
        </div>
      )) : (
        <div className="text-xs text-success">No stalls detected. Keep pushing!</div>
      )}
    </div>
  );
}

function SwapResult({ data }) {
  return (
    <div className="flex flex-col gap-3">
      {data.swaps?.map((s, i) => (
        <div key={i} className="bg-surface rounded-sm p-5 shadow-card">
          <div className="text-body font-semibold text-content mb-1">{s.current}</div>
          <div className="text-sm text-dim mb-2.5">{s.reason}</div>
          <div className="flex gap-1.5 flex-wrap">
            {s.alternatives?.map((alt, j) => (
              <span key={j} className="text-sm px-2.5 py-1 rounded-[8px] bg-primary/[0.08] text-primary border border-primary/15">{alt}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
