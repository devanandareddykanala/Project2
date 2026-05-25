import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Crown, Timer } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";

interface FounderSetupProps {
  principalId: string;
  deployTime: number;
  onClaim: () => void;
  isLoading?: boolean;
  claimError?: string | null;
}

const SETUP_WINDOW_MS = 60 * 60 * 1000; // 1 hour

export const FounderSetup: React.FC<FounderSetupProps> = ({
  principalId,
  deployTime,
  onClaim,
  isLoading = false,
  claimError = null,
}) => {
  const [checked, setChecked] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    const update = () => {
      const elapsed = Date.now() - deployTime;
      const remaining = Math.max(0, SETUP_WINDOW_MS - elapsed);
      setTimeRemaining(remaining);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [deployTime]);

  const isExpired = timeRemaining <= 0;

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Crown className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-semibold text-foreground mb-2">
              Welcome, Founder
            </h1>
            <p className="text-muted-foreground">
              No Founder has been registered for this Develvyn instance.
            </p>
          </div>

          <div className="space-y-5 mb-8">
            <div>
              <h3 className="font-medium text-foreground text-sm mb-2">
                Your principal ID
              </h3>
              <code className="block w-full p-3 bg-secondary rounded-lg text-xs font-mono text-foreground break-all">
                {principalId}
              </code>
            </div>

            <div className="flex items-start gap-3 p-4 bg-secondary/50 rounded-xl">
              <Timer className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-foreground font-medium">
                  Setup window
                </p>
                <p className="text-sm text-muted-foreground">
                  This principal will be permanently saved as the Founder. This
                  action cannot be undone.
                </p>
              </div>
            </div>

            <div className="text-center">
              {isExpired ? (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-destructive/10 text-destructive rounded-lg text-sm font-medium">
                  <Timer className="w-4 h-4" />
                  Setup window has closed. Redeployment required.
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-medium">
                  <Timer className="w-4 h-4" />
                  Time remaining: {formatTime(timeRemaining)}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-secondary/50 rounded-xl mb-6">
            <Checkbox
              id="founder-confirm"
              checked={checked}
              onCheckedChange={(v) => setChecked(v === true)}
              disabled={isExpired}
              data-ocid="founder.confirm_checkbox"
            />
            <Label
              htmlFor="founder-confirm"
              className="text-sm text-foreground leading-relaxed cursor-pointer"
            >
              I confirm this is the correct principal and I want to claim
              Founder access
            </Label>
          </div>

          <Button
            onClick={onClaim}
            disabled={!checked || isExpired || isLoading}
            className="w-full"
            data-ocid="founder.claim_button"
          >
            {isLoading ? "Claiming…" : "Claim Founder access"}
          </Button>
          {claimError && (
            <p
              className="mt-3 text-sm text-destructive text-center"
              data-ocid="founder.error_state"
            >
              {claimError}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
