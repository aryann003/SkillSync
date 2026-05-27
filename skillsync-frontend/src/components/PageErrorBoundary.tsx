import { Component, ErrorInfo, ReactNode } from "react";

class PageErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(_error: Error, _errorInfo: ErrorInfo) {}
  render() {
    if (this.state.hasError) return <div className="rounded-xl border p-4"><p className="mb-2">Something went wrong.</p><button onClick={() => window.location.reload()}>Retry</button></div>;
    return this.props.children;
  }
}

export default PageErrorBoundary;
