export default function ThemeToggle({ mode, onToggle }) {
  return (
    <button onClick={onToggle}
      className="w-12 h-[26px] rounded-[13px] border border-edge-light bg-surface2 relative cursor-pointer p-0 transition-all duration-200"
    >
      <div
        className="w-5 h-5 rounded-full absolute top-[2px] flex items-center justify-center text-[11px] transition-all duration-[250ms] ease-in-out"
        style={{
          background: mode === "dark" ? "#3B82F6" : "#F59E0B",
          left: mode === "dark" ? 2 : 24,
        }}
      >{mode === "dark" ? "\uD83C\uDF19" : "\u2600\uFE0F"}</div>
    </button>
  );
}
