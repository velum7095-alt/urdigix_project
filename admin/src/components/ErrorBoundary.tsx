import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary component to catch runtime errors and prevent blank screens
 * Displays a fallback UI instead of crashing the entire app
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    
    // Log component stack for debugging
    if (errorInfo.componentStack) {
      console.error("Component stack:", errorInfo.componentStack);
    }
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI - use inline styles so it shows even if CSS fails
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', padding: '24px', fontFamily: 'sans-serif' }}>
          <div style={{ maxWidth: '480px', width: '100%', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <span style={{ fontSize: 28 }}>⚠️</span>
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111', marginBottom: 8 }}>Something went wrong</h1>
            <p style={{ color: '#666', marginBottom: 16 }}>An unexpected error occurred. Please try refreshing the page.</p>
            {this.state.error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: 12, marginBottom: 16, textAlign: 'left' }}>
                <p style={{ fontSize: 13, fontFamily: 'monospace', color: '#dc2626', wordBreak: 'break-all' }}>
                  {this.state.error.message}
                </p>
              </div>
            )}
            <button
              onClick={this.handleReload}
              style={{ padding: '10px 24px', borderRadius: 8, background: '#ea580c', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: 15 }}
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;