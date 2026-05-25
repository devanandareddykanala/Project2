import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Timer } from "lucide-react";
import type React from "react";

interface WatchmanHomeProps {
  onBackToModeSelector: () => void;
}

export const WatchmanHome: React.FC<WatchmanHomeProps> = ({
  onBackToModeSelector,
}) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-l-4 border-l-primary">
        <CardContent className="p-8 text-center">
          <img
            src="/develvyn-logo.png"
            alt="Develvyn"
            className="w-16 h-16 rounded-2xl mx-auto mb-4"
          />
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground mb-2">
            Watchman
          </h1>
          <p className="text-muted-foreground mb-2">
            Watchman Home — Coming in a later phase
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-destructive/10 text-destructive rounded-lg text-xs font-medium mb-6">
            <Timer className="w-3.5 h-3.5" />
            Session timeout: 5 minutes
          </div>
          <Button
            variant="outline"
            onClick={onBackToModeSelector}
            data-ocid="watchman_home.back_button"
          >
            Back to Mode Selector
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
