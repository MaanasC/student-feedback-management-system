import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    localStorage.clear();
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-slate-800">
          <div className="w-full max-w-lg rounded-2xl border border-rose-200 bg-white p-8 text-center shadow-lg space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-600">
              <AlertTriangle className="h-8 w-8" />
            </div>

            <h1 className="text-xl font-bold text-slate-900">
              Something went wrong
            </h1>

            <p className="text-xs text-slate-500">
              An unexpected error occurred during rendering.
            </p>

            <div className="rounded-lg bg-slate-900 p-3 text-left font-mono text-[11px] text-rose-300 overflow-x-auto max-h-40">
              {this.state.error?.toString()}
            </div>

            <div className="pt-2">
              <button
                onClick={this.handleReload}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Reset Storage & Reload Application</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
