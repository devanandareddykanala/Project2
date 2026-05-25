import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { XCircle } from "lucide-react";
import type React from "react";

interface InviteCodeRevokedProps {
  code: string;
  onBack: () => void;
}

export const InviteCodeRevoked: React.FC<InviteCodeRevokedProps> = ({
  code,
  onBack,
}) => {
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
                Code Cancelled
              </h1>
              <p className="text-xs text-muted-foreground">
                Develvyn — The Family Suite
              </p>
            </div>
          </div>

          {/* Icon + message */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <XCircle className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-2">
              This invite code was cancelled
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              This code was revoked by the issuer. Please contact them to
              request a new invite code.
            </p>
          </div>

          {/* Code detail */}
          <div className="bg-muted/40 rounded-xl px-4 py-3 mb-6 border border-border">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Code used</span>
              <span className="font-mono font-semibold text-foreground tracking-wider">
                {code}
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full border-primary text-primary hover:bg-primary/10"
            onClick={onBack}
            data-ocid="invite_revoked.back_button"
            type="button"
          >
            Try a Different Code
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
