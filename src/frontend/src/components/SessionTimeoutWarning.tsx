import { Button } from "@/components/ui/button";
import { LogOut, Timer } from "lucide-react";
import type React from "react";
import { useSessionTimeout } from "../hooks/useSessionTimeout";

interface SessionTimeoutWarningProps {
  timeoutMinutes: number;
  warningSeconds: number;
  onTimeout: () => void;
}

export const SessionTimeoutWarning: React.FC<SessionTimeoutWarningProps> = ({
  timeoutMinutes,
  warningSeconds,
  onTimeout,
}) => {
  const { showWarning, timeRemaining, resetTimer } = useSessionTimeout({
    timeoutMinutes,
    warningSeconds,
    onTimeout,
  });

  if (!showWarning) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      data-ocid="session_timeout.dialog"
    >
      <div className="bg-card border border-border rounded-2xl shadow-lg p-6 max-w-sm w-full mx-4 text-center">
        <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
          <Timer className="w-6 h-6 text-destructive" />
        </div>
        <h2 className="text-lg font-semibold text-foreground mb-2">
          Session expiring soon
        </h2>
        <p className="text-muted-foreground text-sm mb-6">
          You will be signed out in{" "}
          <span className="font-semibold text-foreground">{timeRemaining}</span>{" "}
          seconds due to inactivity.
        </p>
        <div className="flex gap-3 justify-center">
          <Button
            variant="default"
            onClick={resetTimer}
            data-ocid="session_timeout.stay_signed_in_button"
          >
            Stay signed in
          </Button>
          <Button
            variant="outline"
            onClick={onTimeout}
            data-ocid="session_timeout.sign_out_button"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign out now
          </Button>
        </div>
      </div>
    </div>
  );
};
