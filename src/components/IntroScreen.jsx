import ThemeToggle from "./ThemeToggle.jsx";

const FEATURES = [
  { icon: "\u{1F4CA}", title: "Smart Programming", desc: "Science-based volume and frequency targets" },
  { icon: "\u{1F3AF}", title: "Volume Tracking", desc: "MEV / MAV / MRV landmarks per muscle group" },
  { icon: "\u{1F4C8}", title: "Progressive Overload", desc: "Automatic weight progression across weeks" },
  { icon: "\u26A1",    title: "Gap Detection", desc: "Find and fill undertrained muscle groups" },
];

export default function IntroScreen({ onStart, themeMode, onToggleTheme }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-10 relative">

      {/* Theme toggle — top right */}
      <div className="absolute top-7 right-7">
        <ThemeToggle mode={themeMode} onToggle={onToggleTheme} />
      </div>

      {/* Hero */}
      <div className="text-center max-w-[520px] mb-12">
        <div className="text-xs tracking-[3px] text-dim mb-3">Welcome to</div>
        <h1 className="text-5xl font-[800] tracking-tighter text-content mb-3">Atlas</h1>
        <p className="text-base text-muted leading-relaxed">
          Your intelligent training companion. Build science-based workout programs with real-time volume analysis and progressive overload.
        </p>
      </div>

      {/* CTA */}
      <button onClick={onStart}
        className="px-12 py-4 rounded-[14px] border-none bg-[#3B82F6] text-white text-base font-bold cursor-pointer mb-14 transition-transform duration-150 shadow-[0_4px_24px_rgba(59,130,246,0.3)] hover:-translate-y-0.5 hover:shadow-[0_6px_32px_rgba(59,130,246,0.4)]"
      >
        Build Your Plan &rarr;
      </button>

      {/* Features grid */}
      <div className="grid grid-cols-4 gap-4 max-w-[720px] w-full">
        {FEATURES.map(f => (
          <div key={f.title} className="bg-surface rounded-xl p-6 shadow-card text-center">
            <div className="text-2xl mb-2">{f.icon}</div>
            <div className="text-xs font-bold text-content mb-1">{f.title}</div>
            <div className="text-[10px] text-dim leading-relaxed">{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
