import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FileCheck } from "lucide-react";
import type React from "react";
import { useState } from "react";

interface DPDPConsentProps {
  policyVersion: string;
  onConsent: (policyVersion: string) => void;
}

export const DPDPConsent: React.FC<DPDPConsentProps> = ({
  policyVersion,
  onConsent,
}) => {
  const [checked, setChecked] = useState(false);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <FileCheck className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-semibold text-foreground mb-2">
              Data consent required
            </h1>
            <p className="text-muted-foreground">
              Under the Digital Personal Data Protection Act, 2023.
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <h2 className="font-medium text-foreground text-sm">
              What Develvyn stores about you
            </h2>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                <span>
                  Your <strong className="text-foreground">principal ID</strong>{" "}
                  — a unique anonymous identifier provided by Internet Identity
                </span>
              </li>
              <li className="flex gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                <span>
                  Your <strong className="text-foreground">roles</strong> within
                  apartments, families, and watchman shifts
                </span>
              </li>
              <li className="flex gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                <span>
                  A{" "}
                  <strong className="text-foreground">consent timestamp</strong>{" "}
                  and the{" "}
                  <strong className="text-foreground">policy version</strong>{" "}
                  you accepted
                </span>
              </li>
            </ul>
            <p className="text-sm text-muted-foreground">
              This data is necessary for the app to function. No personal
              information such as name, email, or phone number is collected
              unless you explicitly provide it within the app.
            </p>
          </div>

          <div className="flex items-start gap-3 p-4 bg-secondary/50 rounded-xl mb-6">
            <Checkbox
              id="dpdp-consent"
              checked={checked}
              onCheckedChange={(v) => setChecked(v === true)}
              data-ocid="consent.dpdp_checkbox"
            />
            <Label
              htmlFor="dpdp-consent"
              className="text-sm text-foreground leading-relaxed cursor-pointer"
            >
              I consent to Develvyn storing my principal ID, roles, and consent
              records as required for the app to function
            </Label>
          </div>

          <Button
            onClick={() => onConsent(policyVersion)}
            disabled={!checked}
            className="w-full"
            data-ocid="consent.accept_button"
          >
            Accept and continue
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
