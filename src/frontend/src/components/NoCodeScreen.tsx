import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { KeyRound, LogOut } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { InviteCodeConfirmation } from "./InviteCodeConfirmation";
import { InviteCodeEntry } from "./InviteCodeEntry";
import { InviteCodeExpired } from "./InviteCodeExpired";
import { InviteCodeRevoked } from "./InviteCodeRevoked";
function codeTypeToRoleLabel(type: string): string {
  switch (type) {
    case "DAPT":
      return "Resident";
    case "DFAM":
      return "Adult Member";
    case "DWCH":
      return "Watchman";
    case "DFND":
      return "Employee";
    default:
      return type;
  }
}

interface NoCodeScreenProps {
  onCodeRedeemed: () => void;
  onSignOut: () => void;
}

export const NoCodeScreen: React.FC<NoCodeScreenProps> = ({
  onCodeRedeemed,
  onSignOut,
}) => {
  type InviteStep =
    | { kind: "landing" }
    | { kind: "entry" }
    | {
        kind: "confirmation";
        code: string;
        role: string;
        codeType: string;
      }
    | { kind: "expired"; code: string; expiredAt?: string }
    | { kind: "revoked"; code: string };

  const [step, setStep] = useState<InviteStep>({ kind: "landing" });
  const { identity } = useInternetIdentity();
  const principal = identity?.getPrincipal().toString() ?? "";
  const shortPrincipal = principal
    ? `${principal.slice(0, 8)}…${principal.slice(-8)}`
    : "";

  if (step.kind === "entry") {
    return (
      <InviteCodeEntry
        onBack={() => setStep({ kind: "landing" })}
        onExpired={(code) => setStep({ kind: "expired", code })}
        onRevoked={(code) => setStep({ kind: "revoked", code })}
        onConfirm={(codeType, rawCode) =>
          setStep({
            kind: "confirmation",
            code: rawCode,
            role: codeTypeToRoleLabel(codeType),
            codeType,
          })
        }
      />
    );
  }

  if (step.kind === "confirmation") {
    return (
      <InviteCodeConfirmation
        code={step.code}
        role={step.role}
        codeType={step.codeType}
        onConfirmed={onCodeRedeemed}
        onCancel={() => setStep({ kind: "entry" })}
        onExpired={(code) => setStep({ kind: "expired", code })}
        onRevoked={(code) => setStep({ kind: "revoked", code })}
      />
    );
  }

  if (step.kind === "expired") {
    return (
      <InviteCodeExpired
        code={step.code}
        expiredAt={step.expiredAt}
        onBack={() => setStep({ kind: "entry" })}
      />
    );
  }

  if (step.kind === "revoked") {
    return (
      <InviteCodeRevoked
        code={step.code}
        onBack={() => setStep({ kind: "entry" })}
      />
    );
  }

  // Landing screen
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-md">
        <CardContent className="p-8">
          {/* Brand header */}
          <div className="text-center mb-8">
            <img
              src="/develvyn-logo.png"
              alt="Develvyn"
              className="w-14 h-14 rounded-2xl mx-auto mb-4"
            />
            <h1 className="text-xl font-semibold text-foreground mb-1">
              Develvyn — The Family Suite
            </h1>
            <p className="text-sm text-muted-foreground">
              You need an invite code to access Develvyn.
              <br />
              Ask your administrator for one.
            </p>
          </div>

          {/* Principal reference */}
          {shortPrincipal && (
            <div className="bg-muted/40 border border-border rounded-xl px-4 py-3 mb-6">
              <p className="text-xs text-muted-foreground mb-1">
                Your Internet Identity principal
              </p>
              <p
                className="font-mono text-xs text-foreground break-all select-all"
                data-ocid="no_code.principal_display"
              >
                {principal}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Share this with your administrator so they can issue you an
                invite code.
              </p>
            </div>
          )}

          <div className="space-y-3">
            <Button
              className="w-full bg-primary hover:bg-primary/90 text-white"
              onClick={() => setStep({ kind: "entry" })}
              data-ocid="no_code.enter_code_button"
              type="button"
            >
              <KeyRound className="w-4 h-4 mr-2" />
              Enter Invite Code
            </Button>

            <Button
              variant="ghost"
              className="w-full"
              onClick={onSignOut}
              data-ocid="no_code.sign_out_button"
              type="button"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
