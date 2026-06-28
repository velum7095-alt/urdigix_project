import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/hooks/useAuth";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";

// Lazy-load pages so a broken component import doesn't crash the whole app
const Admin = lazy(() => import("./pages/Admin"));
const Auth = lazy(() => import("./pages/Auth"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

function PageLoader() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "hsl(var(--background, 0 0% 100%))",
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: 40, height: 40, borderRadius: "50%",
          border: "3px solid hsl(24 95% 53%)",
          borderTopColor: "transparent",
          animation: "spin 0.8s linear infinite",
          margin: "0 auto 12px"
        }} />
        <p style={{ color: "#6b7280", fontFamily: "sans-serif", fontSize: 14 }}>
          Loading…
        </p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function ErrorBoundaryFallback({ error }: { error: Error }) {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", padding: 24, fontFamily: "sans-serif",
      background: "#fff1f2"
    }}>
      <div style={{ maxWidth: 600, textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>💥</div>
        <h1 style={{ color: "#e11d48", fontSize: 22, marginBottom: 8 }}>Component failed to load</h1>
        <pre style={{
          background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 8,
          padding: 16, textAlign: "left", fontSize: 12, overflowX: "auto",
          whiteSpace: "pre-wrap", color: "#7f1d1d"
        }}>{error.message}</pre>
        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: 16, padding: "10px 24px", background: "#e11d48",
            color: "#fff", border: "none", borderRadius: 8, cursor: "pointer",
            fontSize: 14, fontWeight: 600
          }}
        >
          Reload Page
        </button>
      </div>
    </div>
  );
}

// Simple class-based error boundary since hooks can't catch render errors
import React from "react";
class PageErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return <ErrorBoundaryFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}

export default function App() {
  // Dev runs at localhost:PORT/, production at /admin/
  const base =
    typeof window !== "undefined" &&
    window.location.pathname.startsWith("/admin")
      ? "/admin"
      : "/";

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <BrowserRouter basename={base}>
            <PageErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Admin />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </PageErrorBoundary>
            <Toaster />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
