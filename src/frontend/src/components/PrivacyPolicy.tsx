import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { AlertTriangle, ScrollText } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";

interface PrivacyPolicyProps {
  policyVersion: string;
  onAccept: (policyVersion: string) => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({
  policyVersion,
  onAccept,
}) => {
  const [checked, setChecked] = useState(false);
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const el = scrollRef.current;
      if (!el) return;
      const isBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 10;
      setScrolledToBottom(isBottom);
    };

    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <ScrollText className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-semibold text-foreground mb-2">
              Privacy Policy & Terms of Service
            </h1>
            <p className="text-muted-foreground text-sm">
              Version {policyVersion}
            </p>
          </div>

          <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-xl mb-6">
            <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-destructive">
                DRAFT — Not for real users
              </p>
              <p className="text-sm text-destructive/80">
                This is a placeholder document. It will be replaced with a final
                version before real user onboarding begins.
              </p>
            </div>
          </div>

          <div
            ref={scrollRef}
            className="h-80 overflow-y-auto border border-border rounded-xl p-5 space-y-6 mb-6 bg-card/50"
            data-ocid="policy.scroll_container"
          >
            <section>
              <h2 className="font-semibold text-foreground mb-2">
                Privacy Policy
              </h2>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  <strong className="text-foreground">Data Controller:</strong>{" "}
                  Develvyn operates as the data controller for all information
                  processed within the application.
                </p>
                <p>
                  <strong className="text-foreground">What is stored:</strong>{" "}
                  We store your Internet Identity principal, assigned roles,
                  consent records, and any data you voluntarily enter into the
                  app (family schedules, apartment notices, etc.).
                </p>
                <p>
                  <strong className="text-foreground">Data retention:</strong>{" "}
                  Financial records are retained for 7 years. Audit logs for 3
                  years. Visitor logs for 1 year. All other data is retained
                  until you request deletion.
                </p>
                <p>
                  <strong className="text-foreground">Your rights:</strong> You
                  have the right to access, correct, and delete your data.
                  Deletion requests are processed within 30 days. Data export
                  requests are processed within 7 days.
                </p>
                <p>
                  <strong className="text-foreground">Contact:</strong> For
                  privacy-related queries, contact the grievance officer. The
                  Founder serves as the initial grievance officer.
                </p>
                <p>
                  <strong className="text-foreground">Security:</strong> All
                  data is stored on the Internet Computer blockchain. Access is
                  controlled through Internet Identity and role-based
                  permissions.
                </p>
              </div>
            </section>

            <div className="border-t border-border" />

            <section>
              <h2 className="font-semibold text-foreground mb-2">
                Terms of Service
              </h2>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  <strong className="text-foreground">Acceptable use:</strong>{" "}
                  You agree to use Develvyn only for lawful purposes.
                  Harassment, abuse, or any illegal activity is strictly
                  prohibited.
                </p>
                <p>
                  <strong className="text-foreground">Account security:</strong>{" "}
                  You are responsible for maintaining the security of your
                  Internet Identity. Do not share your authentication device.
                </p>
                <p>
                  <strong className="text-foreground">No warranty:</strong>{" "}
                  Develvyn is provided &quot;as is&quot; without warranties of
                  any kind. We do not guarantee uninterrupted service or data
                  preservation.
                </p>
                <p>
                  <strong className="text-foreground">
                    Limitation of liability:
                  </strong>{" "}
                  To the maximum extent permitted by law, Develvyn shall not be
                  liable for any indirect, incidental, or consequential damages.
                </p>
                <p>
                  <strong className="text-foreground">Governing law:</strong>{" "}
                  These terms are governed by the laws of the jurisdiction where
                  the Founder entity is registered. Disputes shall be resolved
                  through arbitration where applicable.
                </p>
                <p>
                  <strong className="text-foreground">Changes:</strong> We may
                  update these terms at any time. You will be prompted to
                  re-accept on your next login if changes occur.
                </p>
              </div>
            </section>
          </div>

          {!scrolledToBottom && (
            <p className="text-xs text-muted-foreground text-center mb-4">
              Please scroll to the bottom to enable acceptance.
            </p>
          )}

          <div className="flex items-start gap-3 p-4 bg-secondary/50 rounded-xl mb-6">
            <Checkbox
              id="policy-accept"
              checked={checked}
              onCheckedChange={(v) => setChecked(v === true)}
              disabled={!scrolledToBottom}
              data-ocid="policy.accept_checkbox"
            />
            <Label
              htmlFor="policy-accept"
              className="text-sm text-foreground leading-relaxed cursor-pointer"
            >
              I have read and accept the Privacy Policy and Terms of Service
            </Label>
          </div>

          <Button
            onClick={() => onAccept(policyVersion)}
            disabled={!checked || !scrolledToBottom}
            className="w-full"
            data-ocid="policy.accept_button"
          >
            Accept and continue
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
