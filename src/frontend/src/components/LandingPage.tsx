import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type React from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { ThemeToggle } from "./shared/ThemeToggle";

export const LandingPage: React.FC = () => {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <div className="h-dvh overflow-hidden bg-landing relative flex flex-col items-center justify-center px-6">
      {/* Theme Toggle */}
      <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-30">
        <ThemeToggle />
      </div>

      {/* Logo + Wordmark */}
      <div className="flex items-center gap-3 mb-8 sm:mb-12 animate-fade-up">
        <img
          src="/develvyn-logo.png"
          alt="Develvyn"
          className="w-16 h-16 rounded-2xl"
        />
        <span className="font-semibold text-foreground text-xl tracking-tight">
          Develvyn
        </span>
      </div>

      {/* Headline */}
      <h1 className="text-center animate-fade-up-delay-1">
        <span className="block text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight tracking-tight">
          Your family&apos;s complete
        </span>
        <span className="block text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display italic text-foreground leading-tight mt-1 sm:mt-2">
          suite.
        </span>
      </h1>

      {/* Subtitle */}
      <p className="text-muted-foreground text-sm sm:text-lg max-w-md mx-auto text-center mt-4 sm:mt-6 animate-fade-up-delay-2">
        Apartment living, family management, and security — all in one place.
      </p>

      {/* CTA Button */}
      <div className="mt-6 sm:mt-10 animate-fade-up-delay-3">
        <Button onClick={() => login()} disabled={isLoggingIn} size="lg">
          {isLoggingIn && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
          {isLoggingIn ? "Signing in..." : "Sign in with Internet Identity"}
        </Button>
      </div>

      {/* Footer */}
      <footer className="fixed bottom-4 sm:bottom-6 text-center text-muted-foreground text-sm">
        © 2026. Built with ❤️ using{" "}
        <a
          href="https://caffeine.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:text-primary/80 underline"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
};
