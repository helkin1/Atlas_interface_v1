import { useState } from "react";
import { useTheme } from "../context/theme.js";
import { signIn, signUp } from "../lib/supabase.js";
import ThemeToggle from "./ThemeToggle.jsx";

export default function AuthScreen({ themeMode, onToggleTheme, onDemoMode }) {
  const t = useTheme();
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirmMsg, setConfirmMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setConfirmMsg(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        const data = await signUp(email, password);
        if (data.user && !data.session) {
          setConfirmMsg("Check your email to confirm your account, then log in.");
          setMode("login");
        }
      } else {
        await signIn(email, password);
        // Auth state change handled by App.jsx listener
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 16px",
    borderRadius: 10,
    border: `1px solid ${t.borderLight}`,
    background: t.surface2,
    color: t.text,
    fontSize: 14,
    fontFamily: "'Outfit', sans-serif",
    outline: "none",
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40, position: "relative" }}>

      {/* Theme toggle */}
      <div style={{ position: "absolute", top: 28, right: 28 }}>
        <ThemeToggle mode={themeMode} onToggle={onToggleTheme} />
      </div>

      {/* Branding */}
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 5, color: t.textFaint, fontFamily: "mono", marginBottom: 12 }}>Welcome to</div>
        <h1 style={{ fontSize: 48, fontWeight: 800, letterSpacing: -1.5, color: t.text, marginBottom: 8 }}>Atlas</h1>
        <p style={{ fontSize: 14, color: t.textMuted }}>
          {mode === "login" ? "Sign in to your account" : "Create your account"}
        </p>
      </div>

      {/* Auth form */}
      <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: 380, display: "flex", flexDirection: "column", gap: 14 }}>

        {confirmMsg && (
          <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(61,220,132,0.1)", border: "1px solid rgba(61,220,132,0.3)", color: "#3DDC84", fontSize: 13 }}>
            {confirmMsg}
          </div>
        )}

        {error && (
          <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#EF4444", fontSize: 13 }}>
            {error}
          </div>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={inputStyle}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          style={inputStyle}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "14px 0",
            borderRadius: 12,
            border: "none",
            background: "#4C9EFF",
            color: "#fff",
            fontSize: 15,
            fontWeight: 700,
            cursor: loading ? "wait" : "pointer",
            opacity: loading ? 0.7 : 1,
            transition: "opacity 0.2s",
          }}
        >
          {loading ? "..." : mode === "login" ? "Sign In" : "Create Account"}
        </button>

        <div style={{ textAlign: "center", marginTop: 8 }}>
          <button
            type="button"
            onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(null); setConfirmMsg(null); }}
            style={{ background: "none", border: "none", color: "#4C9EFF", fontSize: 13, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}
          >
            {mode === "login" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "8px 0" }}>
          <div style={{ flex: 1, height: 1, background: t.borderLight }} />
          <span style={{ fontSize: 11, color: t.textFaint, textTransform: "uppercase", letterSpacing: 1 }}>or</span>
          <div style={{ flex: 1, height: 1, background: t.borderLight }} />
        </div>

        {/* Demo button */}
        <button
          type="button"
          onClick={onDemoMode}
          style={{
            padding: "12px 0",
            borderRadius: 12,
            border: `1px solid ${t.borderLight}`,
            background: "transparent",
            color: t.textMuted,
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "'Outfit', sans-serif",
            transition: "all 0.2s",
          }}
        >
          Try Demo
        </button>
        <p style={{ textAlign: "center", fontSize: 11, color: t.textFaint, marginTop: -4 }}>
          Explore Atlas with sample data — no account needed
        </p>
      </form>
    </div>
  );
}
