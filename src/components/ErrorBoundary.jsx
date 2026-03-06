import { Component } from "react";

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

    return (
      <div className="px-[60px] py-[60px] text-center max-w-[480px] mx-auto">
        <div className="text-5xl mb-4">{"!!"}</div>
        <h2 className="text-xl font-bold text-content mb-2">Something went wrong</h2>
        <p className="text-[13px] text-dim leading-relaxed mb-6">
          An unexpected error occurred. Try reloading the page.
        </p>
        {this.state.error && (
          <pre className="text-[11px] font-mono text-error bg-surface2 border border-edge rounded-[10px] p-4 text-left overflow-auto max-h-[120px] mb-5">
            {this.state.error.message}
          </pre>
        )}
        <button
          onClick={() => window.location.reload()}
          className="px-7 py-2.5 rounded-[10px] text-[13px] font-semibold cursor-pointer bg-primary/[0.12] border border-primary text-primary"
        >
          Reload Page
        </button>
      </div>
    );
  }
}
