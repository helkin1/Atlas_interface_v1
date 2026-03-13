import { useState, useEffect } from "react";
import { useTheme } from "../context/theme.js";

const CELEBRATION_MESSAGES = [
  { headline: "Crushed it!", sub: "That's another one in the books." },
  { headline: "Beast mode!", sub: "You showed up and delivered." },
  { headline: "Workout complete!", sub: "Recovery starts now. You earned it." },
  { headline: "Another W!", sub: "Consistency is your superpower." },
  { headline: "Locked in!", sub: "Your future self just sent a thank you." },
  { headline: "That's a wrap!", sub: "Solid session. Rest up." },
];

function randomMessage() {
  return CELEBRATION_MESSAGES[Math.floor(Math.random() * CELEBRATION_MESSAGES.length)];
}

// Simple confetti particle
function Confetti({ count = 40 }) {
  const [particles] = useState(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.6,
      duration: 1.2 + Math.random() * 1.5,
      size: 4 + Math.random() * 6,
      color: ["#22C55E", "#3B82F6", "#F59E0B", "#EF4444", "#A855F7", "#EC4899"][
        Math.floor(Math.random() * 6)
      ],
      drift: -30 + Math.random() * 60,
      rotation: Math.random() * 360,
    }))
  );

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: -10,
            width: p.size,
            height: p.size * 0.6,
            background: p.color,
            borderRadius: 1,
            transform: `rotate(${p.rotation}deg) translateX(${p.drift}px)`,
            animation: `confetti-fall ${p.duration}s ${p.delay}s ease-in forwards`,
            opacity: 0,
          }}
        />
      ))}
    </div>
  );
}

export default function WorkoutComplete({ completedSets, totalSets, duration, onClose }) {
  const t = useTheme();
  const [msg] = useState(randomMessage);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const mins = duration ? Math.floor(duration / 60) : 0;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 300,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(8px)",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.4s ease",
      }}
    >
      <Confetti />
      <div
        style={{
          background: t.surface,
          borderRadius: 24,
          padding: "48px 40px 36px",
          maxWidth: 400,
          width: "90%",
          textAlign: "center",
          position: "relative",
          zIndex: 1,
          transform: visible ? "scale(1) translateY(0)" : "scale(0.85) translateY(20px)",
          transition: "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.4)",
        }}
      >
        <div style={{ fontSize: 56, marginBottom: 16 }}>
          {completedSets === totalSets ? "\uD83C\uDF89" : "\uD83D\uDCAA"}
        </div>

        <h2
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: t.text,
            marginBottom: 8,
            letterSpacing: -0.5,
          }}
        >
          {msg.headline}
        </h2>
        <p style={{ fontSize: 15, color: t.textDim, marginBottom: 28, lineHeight: 1.4 }}>
          {msg.sub}
        </p>

        {/* Stats row */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 24,
            marginBottom: 32,
            padding: "16px 0",
            borderTop: `1px solid ${t.border}`,
            borderBottom: `1px solid ${t.border}`,
          }}
        >
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#22C55E" }}>
              {completedSets}/{totalSets}
            </div>
            <div style={{ fontSize: 11, color: t.textDim, marginTop: 2, fontWeight: 500 }}>
              Sets Logged
            </div>
          </div>
          {mins > 0 && (
            <div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#3B82F6" }}>
                {mins}m
              </div>
              <div style={{ fontSize: 11, color: t.textDim, marginTop: 2, fontWeight: 500 }}>
                Duration
              </div>
            </div>
          )}
          {completedSets === totalSets && (
            <div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#F59E0B" }}>100%</div>
              <div style={{ fontSize: 11, color: t.textDim, marginTop: 2, fontWeight: 500 }}>
                Completion
              </div>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          style={{
            width: "100%",
            padding: "14px 0",
            borderRadius: 12,
            border: "none",
            background: "#22C55E",
            color: "#000",
            fontSize: 15,
            fontWeight: 700,
            cursor: "pointer",
            transition: "transform 0.15s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          Done
        </button>
      </div>
    </div>
  );
}
