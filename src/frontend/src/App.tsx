import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import type React from "react";
import { useEffect } from "react";
import { AuthenticatedApp } from "./components/AuthenticatedApp";
import { LandingPage } from "./components/LandingPage";
import { LoadingScreen } from "./components/LoadingScreen";
import { DevelvynAuthProvider } from "./contexts/DevelvynAuthContext";
import { useInternetIdentity } from "./hooks/useInternetIdentity";

const App: React.FC = () => {
  const { identity, isInitializing, clear: logout } = useInternetIdentity();
  const isAuthenticated = !!identity;

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Service worker registration is best-effort
      });
    }
  }, []);

  // Determine which content to render
  let content: React.ReactNode;

  if (isInitializing) {
    // Initializing identity - show loading screen
    content = <LoadingScreen />;
  } else if (!isAuthenticated) {
    // Not authenticated - always show login page regardless of actor state
    content = <LandingPage />;
  } else {
    // Authenticated — render the app
    // Key ensures component remounts and resets local state when identity changes
    content = (
      <AuthenticatedApp
        key={identity?.getPrincipal().toString()}
        onLogout={logout}
      />
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <DevelvynAuthProvider>
        {content}
        <Toaster position="bottom-right" />
      </DevelvynAuthProvider>
    </ThemeProvider>
  );
};

export default App;
