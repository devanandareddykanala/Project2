import { InternetIdentityProvider } from "@caffeineai/core-infrastructure";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

BigInt.prototype.toJSON = function () {
  return this.toString();
};

declare global {
  interface BigInt {
    toJSON(): string;
  }
}

// ── Error Boundary ──────────────────────────────────────────────────────────
interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    const msg = error instanceof Error ? error.message : String(error);
    return { hasError: true, errorMessage: msg };
  }

  override componentDidCatch(error: unknown, info: React.ErrorInfo) {
    console.error("[Develvyn] Uncaught error:", error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  override render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100dvh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            background: "#f9fafb",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <img
            src="/develvyn-logo.png"
            alt="Develvyn"
            style={{
              width: 80,
              height: 80,
              borderRadius: 16,
              marginBottom: 24,
            }}
          />
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              marginBottom: 8,
              color: "#111",
            }}
          >
            Something went wrong
          </h1>
          <p
            style={{
              color: "#6b7280",
              marginBottom: 24,
              textAlign: "center",
              maxWidth: 400,
            }}
          >
            Please refresh the page. If the problem persists, contact support.
          </p>
          <button
            type="button"
            onClick={this.handleReload}
            style={{
              background: "#2E7D32",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "0.75rem 1.5rem",
              fontSize: "1rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Reload page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
// ────────────────────────────────────────────────────────────────────────────

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <AppErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <InternetIdentityProvider>
        <App />
      </InternetIdentityProvider>
    </QueryClientProvider>
  </AppErrorBoundary>,
);
