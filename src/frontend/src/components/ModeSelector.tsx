import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, Crown, LogOut, Shield, Users } from "lucide-react";
import type React from "react";

interface ModeSelectorProps {
  allowedModes: string[];
  principalShort: string;
  onSelectMode: (mode: string) => void;
  onSignOut: () => void;
  onEnterCode?: () => void;
}

const MODE_CONFIG: {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    id: "Founder",
    name: "Founder",
    description: "Platform-wide management and oversight",
    icon: Crown,
  },
  {
    id: "Apartment",
    name: "Apartment",
    description: "Building management, residents, and security",
    icon: Building2,
  },
  {
    id: "Family",
    name: "Family",
    description: "Family schedules, chores, and shared life",
    icon: Users,
  },
  {
    id: "Watchman",
    name: "Watchman",
    description: "Gate duty, visitor logs, and patrol",
    icon: Shield,
  },
];

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  allowedModes,
  principalShort,
  onSelectMode,
  onSignOut,
  onEnterCode,
}) => {
  const visibleModes = MODE_CONFIG.filter((m) => allowedModes.includes(m.id));

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <img
              src="/develvyn-logo.png"
              alt="Develvyn"
              className="w-14 h-14 rounded-2xl mx-auto mb-4"
            />
            <h1 className="text-2xl font-semibold text-foreground mb-2">
              Choose your mode
            </h1>
            <p className="text-muted-foreground text-sm">
              You are signed in as{" "}
              <code className="text-xs bg-secondary px-1.5 py-0.5 rounded">
                ...{principalShort}
              </code>
            </p>
          </div>

          {visibleModes.length === 0 ? (
            <div
              className="text-center py-8"
              data-ocid="mode_selector.empty_state"
            >
              <p className="text-muted-foreground mb-2 font-medium">
                Your account is set up.
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Enter an invite code to access your assigned mode.
              </p>
              {onEnterCode && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onEnterCode}
                  data-ocid="mode_selector.enter_code_button"
                  className="border-primary text-primary hover:bg-primary/5"
                >
                  Enter invite code
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3 mb-8">
              {visibleModes.map((mode) => {
                const Icon = mode.icon;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => onSelectMode(mode.id)}
                    className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition-colors text-left"
                    data-ocid={`mode_selector.${mode.id.toLowerCase()}_card`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium text-foreground text-sm">
                        {mode.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {mode.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          <Button
            variant="ghost"
            onClick={onSignOut}
            className="w-full"
            data-ocid="mode_selector.sign_out_button"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
