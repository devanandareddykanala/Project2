import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { createAuthActor } from "../auth";
import { useDevelvynAuth } from "../contexts/DevelvynAuthContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface InviteCodeConfirmationProps {
  code: string;
  role: string;
  codeType: string;
  onConfirmed: () => void;
  onCancel: () => void;
  onExpired: (code: string) => void;
  onRevoked: (code: string) => void;
}

function getJoinSummary(codeType: string): {
  title: string;
  description: string;
} {
  switch (codeType) {
    case "DAPT":
      return {
        title: "Apartment Community",
        description:
          "You are joining as a Resident of this apartment community.",
      };
    case "DFAM":
      return {
        title: "Family Group",
        description: "You are joining as a Family Member.",
      };
    case "DWCH":
      return {
        title: "Watchman Duty",
        description: "You are joining as a Watchman.",
      };
    case "DFND":
      return {
        title: "Founder Team",
        description: "You are joining the Founder Team as an Employee.",
      };
    default:
      return {
        title: "Develvyn",
        description: "You are joining Develvyn — The Family Suite.",
      };
  }
}

function getCodeTypeLabel(codeType: string): string {
  switch (codeType) {
    case "DAPT":
      return "Apartment Invite";
    case "DFAM":
      return "Family Invite";
    case "DWCH":
      return "Watchman Invite";
    case "DFND":
      return "Founder Team Invite";
    default:
      return "Invite Code";
  }
}

export const InviteCodeConfirmation: React.FC<InviteCodeConfirmationProps> = ({
  code,
  role,
  codeType,
  onConfirmed,
  onCancel,
  onExpired,
  onRevoked,
}) => {
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [lockoutSeconds, setLockoutSeconds] = useState(0);
  const { identity } = useInternetIdentity();
  const { refreshAuthState } = useDevelvynAuth();
  const summary = getJoinSummary(codeType);

  // Countdown timer for brute-force lockout
  useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const t = setTimeout(() => setLockoutSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [lockoutSeconds]);

  const handleConfirm = async () => {
    if (lockoutSeconds > 0) return;
    setStatus("loading");
    setErrorMsg("");
    const authActor = createAuthActor(identity);
    if (!authActor) {
      setStatus("error");
      setErrorMsg("Auth service unavailable. Please try again later.");
      return;
    }
    try {
      const result = await authActor.redeemInviteCode(code);

      if (result && typeof result === "object") {
        if ("ok" in result) {
          setStatus("idle");
          refreshAuthState();
          onConfirmed();
          return;
        }
        if ("expired" in result) {
          onExpired(code);
          return;
        }
        if ("revoked" in result) {
          onRevoked(code);
          return;
        }
        if ("used" in result) {
          setStatus("error");
          setErrorMsg("This code has already been used.");
          return;
        }
        if ("notFound" in result) {
          setStatus("error");
          setErrorMsg("Code not found. Check and try again.");
          return;
        }
        if ("bruteForceLocked" in result) {
          setStatus("error");
          setLockoutSeconds(15 * 60);
          setErrorMsg("");
          return;
        }
      }
      // Fallback: treat as success if result is truthy
      setStatus("idle");
      refreshAuthState();
      onConfirmed();
    } catch {
      setStatus("error");
      setErrorMsg("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-md">
        <CardContent className="p-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <img
              src="/develvyn-logo.png"
              alt="Develvyn"
              className="w-9 h-9 rounded-xl"
            />
            <div>
              <h1 className="text-base font-semibold text-foreground leading-tight">
                Confirm Your Access
              </h1>
              <p className="text-xs text-muted-foreground">
                Develvyn — The Family Suite
              </p>
            </div>
          </div>

          {/* Code type badge */}
          <div className="flex items-center gap-2 mb-5">
            <span className="text-xs font-medium bg-primary/10 text-primary px-2.5 py-1 rounded-full">
              {getCodeTypeLabel(codeType)}
            </span>
            <span className="font-mono text-sm text-muted-foreground">
              {code}
            </span>
          </div>

          {/* Summary card */}
          <div className="bg-muted/40 rounded-xl p-5 mb-6 border border-border">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground text-sm mb-1">
                  {summary.title}
                </p>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {summary.description}
                </p>
              </div>
            </div>
          </div>

          {/* Role line */}
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-6 px-1">
            <span>Assigned role</span>
            <span className="font-medium text-foreground">{role}</span>
          </div>

          {lockoutSeconds > 0 && (
            <div
              className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2 mb-4"
              data-ocid="invite_confirm.error_state"
            >
              Too many failed attempts. Try again in{" "}
              {Math.floor(lockoutSeconds / 60)}:
              {String(lockoutSeconds % 60).padStart(2, "0")} min.
            </div>
          )}

          {status === "error" && lockoutSeconds === 0 && (
            <div
              className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2 mb-4"
              data-ocid="invite_confirm.error_state"
            >
              {errorMsg}
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <Button
              className="w-full bg-primary hover:bg-primary/90 text-white"
              onClick={handleConfirm}
              disabled={status === "loading" || lockoutSeconds > 0}
              data-ocid="invite_confirm.confirm_button"
              type="button"
            >
              {status === "loading" ? "Joining…" : "Confirm and Join"}
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={onCancel}
              disabled={status === "loading"}
              data-ocid="invite_confirm.cancel_button"
              type="button"
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
