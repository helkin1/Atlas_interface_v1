import { useState } from "react";
import { useTheme } from "../context/theme.js";

const ITEM_CLS = "flex items-center gap-2.5 w-full px-3.5 py-[11px] bg-transparent border-none rounded-xl cursor-pointer text-content text-[13px] text-left transition-colors duration-150";

export default function SettingsMenu({ onEditPlan, onSignOut, onAIInsights, onProfile }) {
  const t = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className="w-9 h-9 rounded-xl border border-edge bg-surface cursor-pointer flex items-center justify-center text-sm text-muted shadow-card"
      >{"\u2699"}</button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} className="fixed inset-0 z-[99]" />
          <div className="absolute right-0 top-[42px] bg-surface rounded-[18px] p-2 min-w-[200px] z-[100] shadow-lg border border-edge">
            {onProfile && (
              <button onClick={() => { setOpen(false); onProfile(); }} className={ITEM_CLS}>
                <span>{"\uD83D\uDC64"}</span> Profile
              </button>
            )}
            <button onClick={() => { setOpen(false); onEditPlan(); }} className={ITEM_CLS}>
              <span>{"\uD83D\uDCDD"}</span> Edit Plan
            </button>
            {onAIInsights && (
              <button onClick={() => { setOpen(false); onAIInsights(); }} className={ITEM_CLS} style={{ color: t.colors.pull }}>
                <span>{"\u2728"}</span> AI Insights
              </button>
            )}
            {onSignOut && (
              <button onClick={() => { setOpen(false); onSignOut(); }}
                className={`${ITEM_CLS} border-t border-edge mt-1 pt-3 rounded-t-none`}
                style={{ color: t.colors.error }}
              >
                <span>{"\u{1F6AA}"}</span> Sign Out
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
