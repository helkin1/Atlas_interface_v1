import { Component } from "react";
import { themes } from "../context/theme.js";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[Atlas] Component error:", error, errorInfo);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    const t = themes.dark;
    return (
      <div style={{ padding: 60, textAlign: "center", maxWidth: 480, margin: "0 auto" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>{"!!"}</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: t.text, marginBottom: 8 }}>Something went wrong</h2>
        <p style={{ fontSize: 13, color: t.textDim, lineHeight: 1.6, marginBottom: 24 }}>
          An unexpected error occurred. Try reloading the page.
        </p>
        {this.state.error && (
          <pre style={{
            fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: t.colors.error,
            background: t.surface2, border: `1px solid ${t.border}`, borderRadius: 10,
            padding: 16, textAlign: "left", overflow: "auto", maxHeight: 120, marginBottom: 20,
          }}>
            {this.state.error.message}
          </pre>
        )}
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: "10px 28px", borderRadius: 10, fontSize: 13, fontWeight: 600,
            cursor: "pointer", background: "rgba(59,130,246,0.12)",
            border: "1px solid #3B82F6", color: "#3B82F6",
          }}
        >
          Reload Page
        </button>
      </div>
    );
  }
}
