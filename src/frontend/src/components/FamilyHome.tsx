import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";
import type React from "react";

interface FamilyHomeProps {
  onBackToModeSelector: () => void;
}

export const FamilyHome: React.FC<FamilyHomeProps> = ({
  onBackToModeSelector,
}) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-md">
        <CardContent className="p-10 text-center">
          {/* Brand logo */}
          <img
            src="/develvyn-logo.png"
            alt="Develvyn"
            className="w-16 h-16 rounded-2xl mx-auto mb-6"
          />

          {/* Family icon */}
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-primary" />
          </div>

          <h1 className="text-2xl font-semibold text-foreground mb-2">
            Family
          </h1>
          <p className="text-base font-medium text-foreground mb-1">
            Family features coming soon
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            The Family module is planned for Phase 4. Check back after Phase 3
            is complete.
          </p>

          <Button
            variant="outline"
            className="border-primary text-primary hover:bg-primary/5"
            onClick={onBackToModeSelector}
            data-ocid="family_home.back_button"
            type="button"
          >
            Back to Mode Selector
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
