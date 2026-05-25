import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Smartphone, Usb } from "lucide-react";
import type React from "react";
import { useState } from "react";

interface IIRecoveryGuidanceProps {
  onComplete: () => void;
}

export const IIRecoveryGuidance: React.FC<IIRecoveryGuidanceProps> = ({
  onComplete,
}) => {
  const [checked, setChecked] = useState(false);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-semibold text-foreground mb-2">
              Protect your account
            </h1>
            <p className="text-muted-foreground">
              One quick step to keep your Develvyn account safe.
            </p>
          </div>

          <div className="space-y-5 mb-8">
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                <Smartphone className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-foreground text-sm">
                  If you lose this device
                </h3>
                <p className="text-muted-foreground text-sm mt-0.5">
                  You need a recovery device to regain access to your Develvyn
                  account. Without it, your account cannot be recovered.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                <Usb className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-foreground text-sm">
                  Set up a recovery device now
                </h3>
                <p className="text-muted-foreground text-sm mt-0.5">
                  Use a USB security key or register a passkey on another
                  trusted device. This takes under a minute.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-foreground text-sm">
                  This screen cannot be skipped
                </h3>
                <p className="text-muted-foreground text-sm mt-0.5">
                  For your security, you must confirm you understand the
                  recovery process before continuing.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-secondary/50 rounded-xl mb-6">
            <Checkbox
              id="recovery-ack"
              checked={checked}
              onCheckedChange={(v) => setChecked(v === true)}
              data-ocid="recovery.ack_checkbox"
            />
            <Label
              htmlFor="recovery-ack"
              className="text-sm text-foreground leading-relaxed cursor-pointer"
            >
              I understand I need a recovery device to regain access if I lose
              this device
            </Label>
          </div>

          <Button
            onClick={onComplete}
            disabled={!checked}
            className="w-full"
            data-ocid="recovery.complete_button"
          >
            I&apos;ve set up my recovery device
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
