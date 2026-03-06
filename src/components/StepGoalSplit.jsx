import { useState } from "react";
import { useTheme } from "../context/theme.js";
import { SPLIT_PRESETS } from "../data/split-presets.js";
import { PLAN_TEMPLATES } from "../data/plan-templates.js";
import { buildPlanFromPreset, buildPlanFromTemplate } from "../utils/plan-engine.js";
import { goalPctColor } from "../utils/helpers.js";

const DIFFICULTY_COLORS = { beginner: "#22C55E", intermediate: "#F59E0B", advanced: "#EF4444" };

export default function StepGoalSplit({ plan, onChange }) {
  const t = useTheme();
  const [showWeekPicker, setShowWeekPicker] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  return (
    <div>
      <h2 className="text-xl font-[800] mb-1">Choose Your Plan</h2>
      <p className="text-body text-dim mb-6">Select a training plan to start with. Customize everything in the next steps.</p>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3">
        {Object.entries(SPLIT_PRESETS).map(([key, preset]) => {
          const sel = plan.splitKey === key;
          return (
            <button key={key} onClick={() => { const p = buildPlanFromPreset(key); if (p) onChange({ ...p, weeks: plan.weeks || 4 }); }}
              className="rounded-sm p-6 cursor-pointer text-left transition-all duration-[150ms]"
              style={{ background: sel ? `${goalPctColor(100)}08` : "var(--atlas-surface)", border: `1px solid ${sel ? goalPctColor(100) + "40" : "var(--atlas-border)"}` }}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-lg font-bold" style={{ color: sel ? "#22C55E" : "var(--atlas-text)" }}>{preset.name}</span>
                {preset.daysPerWeek > 0 && <span className="text-xs text-dim px-2 py-0.5 bg-surface2 rounded-[6px]">{preset.daysPerWeek}&times;/wk</span>}
              </div>
              <p className="text-xs text-muted leading-relaxed mb-2.5">{preset.description}</p>
              <div className="flex gap-1 flex-wrap">
                {preset.tags.map(tag => <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-[6px] bg-faint/20 text-dim">{tag}</span>)}
              </div>
            </button>
          );
        })}
      </div>

      {/* Popular Programs Section */}
      <div className="mt-8">
        <button
          onClick={() => setShowTemplates(v => !v)}
          className={`flex items-center gap-2 w-full bg-none border-none cursor-pointer p-0 ${showTemplates ? "mb-4" : ""}`}
        >
          <div className="flex-1 h-px bg-edge" />
          <span className="text-sm text-dim whitespace-nowrap">
            {showTemplates ? "\u25BC" : "\u25B6"} Popular Programs
          </span>
          <div className="flex-1 h-px bg-edge" />
        </button>

        {showTemplates && (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3">
            {PLAN_TEMPLATES.map(tmpl => {
              const sel = plan.splitKey === tmpl.key;
              const diffColor = DIFFICULTY_COLORS[tmpl.difficulty] || "var(--atlas-text-dim)";
              return (
                <button key={tmpl.key} onClick={() => { const p = buildPlanFromTemplate(tmpl); if (p) onChange({ ...p, weeks: plan.weeks || 4 }); }}
                  className="rounded-sm p-6 cursor-pointer text-left transition-all duration-[150ms]"
                  style={{ background: sel ? `${goalPctColor(100)}08` : "var(--atlas-surface)", border: `1px solid ${sel ? goalPctColor(100) + "40" : "var(--atlas-border)"}` }}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-lg font-bold" style={{ color: sel ? "#22C55E" : "var(--atlas-text)" }}>{tmpl.name}</span>
                    <span className="text-xs text-dim px-2 py-0.5 bg-surface2 rounded-[6px]">{tmpl.daysPerWeek}&times;/wk</span>
                  </div>
                  <div className="text-xs text-dim mb-2">by {tmpl.author}</div>
                  <p className="text-xs text-muted leading-relaxed mb-2.5">{tmpl.description}</p>
                  <div className="flex gap-1 flex-wrap">
                    <span className="text-[9px] px-1.5 py-0.5 rounded-[6px]" style={{ background: `${diffColor}15`, color: diffColor }}>{tmpl.difficulty}</span>
                    {tmpl.tags.map(tag => <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-[6px] bg-faint/20 text-dim">{tag}</span>)}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {plan.splitKey && (
        <div className="mt-6 grid grid-cols-2 gap-4">
          {/* Cycle length */}
          <div className="bg-surface rounded-sm p-6">
            <div className={`flex items-center justify-between ${showWeekPicker ? "mb-3" : ""}`}>
              <div>
                <div className="text-body font-semibold text-content">
                  {plan.weeks || 4}-week cycle
                </div>
                <div className="text-sm text-dim mt-0.5">Mesocycle length</div>
              </div>
              <button
                onClick={() => setShowWeekPicker(v => !v)}
                className="text-sm px-3 py-[5px] rounded-[8px] border border-edge-light bg-transparent text-muted cursor-pointer whitespace-nowrap"
              >
                {showWeekPicker ? "Done" : "Customize"}
              </button>
            </div>
            {showWeekPicker && (
              <div className="flex gap-1.5 flex-wrap">
                {[2, 3, 4, 5, 6].map(w => {
                  const sel = plan.weeks === w;
                  return (
                    <button key={w} onClick={() => onChange({ ...plan, weeks: w })}
                      className={`px-4 py-2 rounded-[10px] text-body font-semibold cursor-pointer border ${
                        sel ? "border-primary bg-primary/10 text-primary" : "border-edge-light bg-transparent text-muted"
                      }`}
                    >{w}w</button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Start Date */}
          <div className="bg-surface rounded-sm p-6">
            <div className="text-xs font-semibold text-muted mb-3">Start Date</div>
            <input type="date" value={plan.startDate || ""} onChange={e => onChange({ ...plan, startDate: e.target.value })}
              className="px-3.5 py-2.5 rounded-[10px] text-md font-semibold border border-edge-light bg-surface2 text-content outline-none cursor-pointer"
            />
            {!plan.startDate && <div className="text-sm text-dim mt-2">Defaults to next Monday if not set.</div>}
          </div>
        </div>
      )}
    </div>
  );
}
