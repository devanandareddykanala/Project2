import type React from "react";
import { useEffect, useState } from "react";

interface LoadingScreenProps {
  timedOut?: boolean;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ timedOut }) => {
  const [showSlowMessage, setShowSlowMessage] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowSlowMessage(true), 10_000);
    return () => clearTimeout(t);
  }, []);

  if (timedOut || showSlowMessage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen w-full gap-6 px-6 text-center">
        <img
          src="/develvyn-logo.png"
          alt="Develvyn"
          className="w-16 h-16 rounded-2xl"
        />
        <p className="text-muted-foreground text-sm max-w-sm">
          Taking longer than expected. Check your connection and try again.
        </p>
        <button
          type="button"
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen w-full">
      <div className="text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex space-x-2">
            <div className="h-3 w-3 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
            <div className="h-3 w-3 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
            <div className="h-3 w-3 animate-bounce rounded-full bg-primary" />
          </div>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Please wait a moment
        </p>
      </div>
    </div>
  );
};
