import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";

type CodeStep =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "locked"; lockUntil: number }
  | { kind: "success"; role: string; codeType: string; rawCode: string };

interface InviteCodeEntryProps {
  onBack: () => void;
  onExpired: (code: string, expiredAt?: string) => void;
  onRevoked: (code: string) => void;
  onConfirm: (codeType: string, rawCode: string) => void;
}

function formatCode(raw: string): string {
  const cleaned = raw
    .replace(/[^A-Za-z0-9]/g, "")
    .toUpperCase()
    .slice(0, 8);
  if (cleaned.length > 4) return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
  return cleaned;
}

export const InviteCodeEntry: React.FC<InviteCodeEntryProps> = ({
  onBack,
  onExpired: _onExpired,
  onRevoked: _onRevoked,
  onConfirm,
}) => {
  const [rawInput, setRawInput] = useState("");
  const [step, setStep] = useState<CodeStep>({ kind: "idle" });
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Countdown timer for lockout
  useEffect(() => {
    if (step.kind === "locked") {
      const tick = () => {
        const remaining = Math.ceil((step.lockUntil - Date.now()) / 1000);
        if (remaining <= 0) {
          setStep({ kind: "idle" });
          setCountdown(0);
          if (timerRef.current) clearInterval(timerRef.current);
        } else {
          setCountdown(remaining);
        }
      };
      tick();
      timerRef.current = setInterval(tick, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [step]);

  const displayCode = formatCode(rawInput);
  const isLocked = step.kind === "locked";
  const isLoading = step.kind === "loading";
  const codeReady = displayCode.length === 9; // XXXX-XXXX

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^A-Za-z0-9-]/g, "");
    // Strip the auto-hyphen so user can type naturally
    const stripped = raw.replace(/-/g, "").toUpperCase().slice(0, 8);
    setRawInput(stripped);
    if (step.kind === "error") setStep({ kind: "idle" });
  };

  const handleSubmit = () => {
    if (!codeReady || isLoading || isLocked) return;
    // Validate format only — infer code type from prefix, pass to confirmation.
    // redeemInviteCode is called exclusively by InviteCodeConfirmation.handleConfirm.
    const prefix = displayCode.slice(0, 4);
    const validPrefixes = ["DAPT", "DFAM", "DWCH", "DFND"];
    if (!validPrefixes.includes(prefix)) {
      setStep({
        kind: "error",
        message:
          "Invalid invite code format. Code must start with DAPT, DFAM, DWCH, or DFND.",
      });
      return;
    }
    const codeType = prefix;
    // Role will be determined after confirmation by the canister
    onConfirm(codeType, displayCode);
  };

  const countdownDisplay =
    countdown >= 60
      ? `${Math.floor(countdown / 60)}m ${countdown % 60}s`
      : `${countdown}s`;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-md">
        <CardContent className="p-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="shrink-0"
              data-ocid="invite_entry.back_button"
              type="button"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-3 flex-1">
              <img
                src="/develvyn-logo.png"
                alt="Develvyn"
                className="w-9 h-9 rounded-xl"
              />
              <div>
                <h1 className="text-base font-semibold text-foreground leading-tight">
                  Enter Invite Code
                </h1>
                <p className="text-xs text-muted-foreground">
                  Develvyn — The Family Suite
                </p>
              </div>
            </div>
          </div>

          {/* Code input */}
          <div className="space-y-4 mb-6">
            <div className="space-y-1.5">
              <Label htmlFor="invite-code-field">Invite code</Label>
              <Input
                id="invite-code-field"
                placeholder="XXXX-XXXX"
                value={displayCode}
                onChange={handleInput}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                disabled={isLoading || isLocked}
                className="uppercase tracking-[0.25em] text-center font-mono text-lg h-12"
                data-ocid="invite_entry.invite_code_input"
                autoComplete="off"
                spellCheck={false}
              />
              <p className="text-xs text-muted-foreground text-center">
                Format: XXXX-XXXX (e.g. DAPT-AB12)
              </p>
            </div>

            {/* Error state */}
            {step.kind === "error" && (
              <div
                className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2.5 flex items-start gap-2"
                data-ocid="invite_entry.error_state"
              >
                <span className="shrink-0 mt-0.5">⚠</span>
                <span>{step.message}</span>
              </div>
            )}

            {/* Lockout state */}
            {step.kind === "locked" && (
              <div
                className="text-sm bg-destructive/10 border border-destructive/30 text-destructive rounded-lg px-3 py-2.5"
                data-ocid="invite_entry.locked_state"
              >
                <p className="font-medium">Too many failed attempts.</p>
                <p>
                  Try again in{" "}
                  <span className="font-mono font-semibold">
                    {countdownDisplay}
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <Button
            className="w-full bg-primary hover:bg-primary/90 text-white"
            onClick={handleSubmit}
            disabled={!codeReady || isLoading || isLocked}
            data-ocid="invite_entry.submit_button"
            type="button"
          >
            {isLoading ? "Checking…" : "Continue"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
