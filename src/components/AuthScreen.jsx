import { useState } from "react";
import { signIn, signUp } from "../lib/supabase.js";
import ThemeToggle from "./ThemeToggle.jsx";

const INPUT_CLS = "w-full px-4 py-3 rounded-[10px] border border-edge-light bg-surface2 text-content text-sm outline-none";

export default function AuthScreen({ themeMode, onToggleTheme, onDemoMode }) {
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
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-10 relative">

      {/* Theme toggle */}
      <div className="absolute top-7 right-7">
        <ThemeToggle mode={themeMode} onToggle={onToggleTheme} />
      </div>

      {/* Branding */}
      <div className="text-center mb-10">
        <div className="text-xs tracking-[3px] text-dim mb-3">Welcome to</div>
        <h1 className="text-5xl font-[800] tracking-tighter text-content mb-2">Atlas</h1>
        <p className="text-sm text-muted">
          {mode === "login" ? "Sign in to your account" : "Create your account"}
        </p>
      </div>

      {/* Auth form */}
      <form onSubmit={handleSubmit} className="w-full max-w-[380px] flex flex-col gap-3.5">

        {confirmMsg && (
          <div className="px-3.5 py-2.5 rounded-[10px] bg-success/10 border border-success/30 text-success text-[13px]">
            {confirmMsg}
          </div>
        )}

        {error && (
          <div className="px-3.5 py-2.5 rounded-[10px] bg-error/10 border border-error/30 text-error text-[13px]">
            {error}
          </div>
        )}

        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className={INPUT_CLS} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className={INPUT_CLS} />

        <button type="submit" disabled={loading}
          className={`py-3.5 rounded-xl border-none bg-[#3B82F6] text-white text-[15px] font-bold transition-opacity duration-200 ${loading ? "cursor-wait opacity-70" : "cursor-pointer opacity-100"}`}
        >
          {loading ? "..." : mode === "login" ? "Sign In" : "Create Account"}
        </button>

        <div className="text-center mt-2">
          <button type="button"
            onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(null); setConfirmMsg(null); }}
            className="bg-none border-none text-primary text-[13px] cursor-pointer"
          >
            {mode === "login" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 my-2">
          <div className="flex-1 h-px bg-edge-light" />
          <span className="text-xs text-dim">or</span>
          <div className="flex-1 h-px bg-edge-light" />
        </div>

        {/* Demo button */}
        <button type="button" onClick={onDemoMode}
          className="py-3 rounded-xl border border-edge-light bg-transparent text-muted text-sm font-semibold cursor-pointer transition-all duration-200"
        >
          Try Demo
        </button>
        <p className="text-center text-[11px] text-faint -mt-1">
          Explore Atlas with sample data — no account needed
        </p>
      </form>
    </div>
  );
}
