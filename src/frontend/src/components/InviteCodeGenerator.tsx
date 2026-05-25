import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, ClipboardCopy, X } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { createAuthActor } from "../auth";
import { useDevelvynAuth } from "../contexts/DevelvynAuthContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface InviteCodeGeneratorProps {
  onClose: () => void;
}

const CODE_TYPE_INFO: Record<
  string,
  {
    label: string;
    description: string;
    contextLabel: string;
    contextPlaceholder: string;
  }
> = {
  DFND: {
    label: "DFND",
    description:
      "Founder Team Invite — adds a Co-Founder, Employee, or Freelancer to the Founder team.",
    contextLabel: "Team Member Role",
    contextPlaceholder: "e.g. Employee, Freelancer",
  },
  DAPT: {
    label: "DAPT",
    description: "Apartment Resident Invite — adds a resident to an apartment.",
    contextLabel: "Apartment Name",
    contextPlaceholder: "e.g. Greenview Towers",
  },
  DWCH: {
    label: "DWCH",
    description:
      "Watchman Invite — adds a Watchman to an apartment's security team.",
    contextLabel: "Apartment Name",
    contextPlaceholder: "e.g. Greenview Towers",
  },
  DFAM: {
    label: "DFAM",
    description: "Family Member Invite — adds an Adult Member to your family.",
    contextLabel: "Family Name",
    contextPlaceholder: "e.g. The Sharma Family",
  },
};

function CodeTypeTab({ codeType }: { codeType: string }) {
  const { identity } = useInternetIdentity();
  const info = CODE_TYPE_INFO[codeType];
  const [context, setContext] = useState("");
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!context.trim()) {
      setError(`Please enter the ${info.contextLabel.toLowerCase()}.`);
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedCode(null);
    try {
      const actor = createAuthActor(identity);
      if (!actor) {
        setError("Auth canister not available. Please try again.");
        return;
      }
      const result = await actor.generateInviteCode(
        { [codeType]: null },
        context.trim() ? [context.trim()] : [],
      );
      if ("ok" in result) {
        setGeneratedCode(result.ok);
      } else {
        setError(result.err);
      }
    } catch (_e) {
      setError("Failed to generate code. Check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!generatedCode) return;
    await navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{info.description}</p>

      <div className="space-y-2">
        <Label htmlFor={`context-${codeType}`}>{info.contextLabel}</Label>
        <Input
          id={`context-${codeType}`}
          placeholder={info.contextPlaceholder}
          value={context}
          onChange={(e) => setContext(e.target.value)}
          disabled={isLoading}
          data-ocid={`invite_gen.context_input.${codeType.toLowerCase()}`}
        />
      </div>

      {error && (
        <p
          className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg"
          data-ocid={`invite_gen.error_state.${codeType.toLowerCase()}`}
        >
          {error}
        </p>
      )}

      {generatedCode && (
        <div
          className="bg-muted/40 border border-border rounded-xl p-4 space-y-2"
          data-ocid={`invite_gen.code_display.${codeType.toLowerCase()}`}
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-sm font-semibold text-foreground tracking-widest">
              {generatedCode}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              data-ocid={`invite_gen.copy_button.${codeType.toLowerCase()}`}
              type="button"
            >
              {copied ? (
                <Check className="w-4 h-4 text-primary" />
              ) : (
                <ClipboardCopy className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Valid for 24 hours. Share this code only with the intended
            recipient.
          </p>
        </div>
      )}

      <Button
        className="w-full bg-primary hover:bg-primary/90 text-white"
        onClick={handleGenerate}
        disabled={isLoading || !context.trim()}
        data-ocid={`invite_gen.generate_button.${codeType.toLowerCase()}`}
        type="button"
      >
        {isLoading ? "Generating…" : "Generate Code"}
      </Button>
    </div>
  );
}

export const InviteCodeGenerator: React.FC<InviteCodeGeneratorProps> = ({
  onClose,
}) => {
  const { userRoles } = useDevelvynAuth();

  const availableTabs: string[] = [];
  if (userRoles.includes("Founder") || userRoles.includes("CoFounder")) {
    availableTabs.push("DFND");
    availableTabs.push("DAPT");
  }
  if (userRoles.includes("SuperAdmin")) {
    if (!availableTabs.includes("DAPT")) availableTabs.push("DAPT");
    availableTabs.push("DWCH");
  }
  if (userRoles.includes("FamilyHead")) {
    availableTabs.push("DFAM");
  }

  const defaultTab = availableTabs[0] ?? "DAPT";

  return (
    <Card className="shadow-md" data-ocid="invite_gen.panel">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">
          Generate Invite Code
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          data-ocid="invite_gen.close_button"
          type="button"
          aria-label="Close invite code generator"
        >
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>

      <CardContent>
        {availableTabs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            You don't have permission to generate invite codes.
          </p>
        ) : (
          <Tabs defaultValue={defaultTab}>
            <TabsList className="mb-4">
              {availableTabs.map((codeType) => (
                <TabsTrigger
                  key={codeType}
                  value={codeType}
                  data-ocid={`invite_gen.tab.${codeType.toLowerCase()}`}
                >
                  <Badge
                    variant="secondary"
                    className="text-xs mr-1 font-mono pointer-events-none"
                  >
                    {codeType}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>
            {availableTabs.map((codeType) => (
              <TabsContent key={codeType} value={codeType}>
                <CodeTypeTab codeType={codeType} />
              </TabsContent>
            ))}
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};
