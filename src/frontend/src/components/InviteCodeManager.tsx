import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, RefreshCw, ShieldOff } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { createAuthActor } from "../auth";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const MAX_CODES_PER_APARTMENT = 10;

interface InviteCode {
  code: string;
  codeType: string;
  issuerPrincipal: { toString(): string };
  recipientPrincipal: Array<{ toString(): string }>;
  createdAt: bigint;
  expiresAt: bigint;
  revoked: boolean;
  used: boolean;
}

const CODE_TYPE_COLORS: Record<string, string> = {
  DAPT: "bg-primary/10 text-primary border-primary/20",
  DFAM: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  DWCH: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  DFND: "bg-purple-500/10 text-purple-600 border-purple-500/20",
};

function maskCode(code: string): string {
  const prefix = code.slice(0, 4);
  return `${prefix}-XXXX`;
}

function truncatePrincipal(p: string): string {
  return `${p.slice(0, 8)}…${p.slice(-6)}`;
}

function formatTimeLeft(expiresAt: bigint): string {
  const expiresMs = Number(expiresAt) / 1_000_000;
  const diffMs = expiresMs - Date.now();
  if (diffMs <= 0) return "Expired";
  const hours = Math.floor(diffMs / 3_600_000);
  const minutes = Math.floor((diffMs % 3_600_000) / 60_000);
  if (hours >= 1) return `Expires in ${hours}h ${minutes}m`;
  return `Expires in ${minutes}m`;
}

interface InviteCodeManagerProps {
  apartmentId?: string;
}

export const InviteCodeManager: React.FC<InviteCodeManagerProps> = ({
  apartmentId = "",
}) => {
  const { identity } = useInternetIdentity();
  const [codes, setCodes] = useState<InviteCode[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [revokingCode, setRevokingCode] = useState<string | null>(null);
  const [confirmRevoke, setConfirmRevoke] = useState<string | null>(null);

  const loadCodes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const actor = createAuthActor(identity);
      if (!actor) {
        setError("Auth canister not available.");
        return;
      }
      const raw = await actor.getActiveCodesByApartment(apartmentId);
      setCodes(raw as InviteCode[]);
    } catch {
      setError("Failed to load invite codes.");
    } finally {
      setIsLoading(false);
    }
  }, [identity, apartmentId]);

  useEffect(() => {
    void loadCodes();
  }, [loadCodes]);

  const handleRevoke = async (code: string) => {
    setRevokingCode(code);
    setConfirmRevoke(null);
    try {
      const actor = createAuthActor(identity);
      if (!actor) return;
      await actor.revokeInviteCode(code);
      await loadCodes();
    } catch {
      setError("Failed to revoke code.");
    } finally {
      setRevokingCode(null);
    }
  };

  const activeCodes = codes.filter((c) => !c.revoked && !c.used);

  return (
    <Card className="shadow-md" data-ocid="invite_manager.panel">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-base font-semibold">
            Active Invite Codes
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            {activeCodes.length} of {MAX_CODES_PER_APARTMENT} codes used
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={loadCodes}
          disabled={isLoading}
          data-ocid="invite_manager.refresh_button"
          type="button"
          aria-label="Refresh codes"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </CardHeader>

      <CardContent>
        {error && (
          <div
            className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg mb-4"
            data-ocid="invite_manager.error_state"
          >
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="space-y-3" data-ocid="invite_manager.loading_state">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        ) : activeCodes.length === 0 ? (
          <div
            className="text-center py-8 text-muted-foreground"
            data-ocid="invite_manager.empty_state"
          >
            <ShieldOff className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No active invite codes.</p>
            <p className="text-xs mt-1">Generate one above.</p>
          </div>
        ) : (
          <ul className="space-y-3" data-ocid="invite_manager.list">
            {activeCodes.map((code, index) => {
              const isRevoking = revokingCode === code.code;
              const isConfirming = confirmRevoke === code.code;
              const colorClass =
                CODE_TYPE_COLORS[code.codeType] ??
                "bg-muted text-muted-foreground border-border";
              return (
                <li
                  key={code.code}
                  className="border border-border rounded-xl px-4 py-3 flex items-center justify-between gap-3"
                  data-ocid={`invite_manager.item.${index + 1}`}
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`font-mono text-xs ${colorClass}`}
                      >
                        {code.codeType}
                      </Badge>
                      <span className="font-mono text-sm font-medium text-foreground">
                        {maskCode(code.code)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      By: {truncatePrincipal(code.issuerPrincipal.toString())}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatTimeLeft(code.expiresAt)}
                    </p>
                  </div>

                  <div className="flex-shrink-0">
                    {isConfirming ? (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRevoke(code.code)}
                          disabled={isRevoking}
                          data-ocid={`invite_manager.confirm_button.${index + 1}`}
                          type="button"
                        >
                          {isRevoking ? "Revoking…" : "Confirm"}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setConfirmRevoke(null)}
                          data-ocid={`invite_manager.cancel_button.${index + 1}`}
                          type="button"
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setConfirmRevoke(code.code)}
                        disabled={isRevoking}
                        data-ocid={`invite_manager.delete_button.${index + 1}`}
                        type="button"
                      >
                        <ShieldOff className="w-3 h-3 mr-1" />
                        Revoke
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};
