import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Key, RotateCcw, Trash2 } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { createAuthActor } from "../../auth";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";

interface InviteCode {
  code: string;
  codeType: string;
  issuerPrincipal: { toString(): string };
  recipientPrincipal: { toString(): string }[];
  createdAt: bigint;
  expiresAt: bigint;
  revoked: boolean;
  used: boolean;
}

interface InviteCodeManagerProps {
  apartmentId: string;
}

function formatCodeType(raw: string): string {
  if (raw.startsWith("DAPT")) return "DAPT";
  if (raw.startsWith("DFAM")) return "DFAM";
  if (raw.startsWith("DWCH")) return "DWCH";
  if (raw.startsWith("DFND")) return "DFND";
  return raw;
}

function codeStatus(
  code: InviteCode,
): "active" | "used" | "revoked" | "expired" {
  if (code.revoked) return "revoked";
  if (code.used) return "used";
  const now = BigInt(Date.now()) * BigInt(1_000_000);
  if (code.expiresAt < now) return "expired";
  return "active";
}

const STATUS_BADGE: Record<string, string> = {
  active: "bg-primary/10 text-primary border-primary/20",
  used: "bg-muted text-muted-foreground",
  revoked: "bg-destructive/10 text-destructive border-destructive/20",
  expired: "bg-muted text-muted-foreground",
};

export const InviteCodeManager: React.FC<InviteCodeManagerProps> = ({
  apartmentId,
}) => {
  const { identity } = useInternetIdentity();
  const [codes, setCodes] = useState<InviteCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revoking, setRevoking] = useState<string | null>(null);

  const loadCodes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const actor = createAuthActor(identity);
      if (!actor) {
        setError("Auth canister not available.");
        setLoading(false);
        return;
      }
      const result = await actor.getActiveCodesByApartment(apartmentId);
      setCodes(result as InviteCode[]);
    } catch {
      setError("Failed to load invite codes.");
    } finally {
      setLoading(false);
    }
  }, [apartmentId, identity]);

  useEffect(() => {
    void loadCodes();
  }, [loadCodes]);

  const handleRevoke = async (code: string) => {
    setRevoking(code);
    try {
      const actor = createAuthActor(identity);
      if (!actor) return;
      await actor.revokeInviteCode(code);
      await loadCodes();
    } catch {
      // non-fatal
    } finally {
      setRevoking(null);
    }
  };

  return (
    <Card className="mt-4" data-ocid="invite_manager.panel">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Key className="w-4 h-4 text-primary" />
          Active Invite Codes
        </CardTitle>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={loadCodes}
          aria-label="Refresh codes"
          data-ocid="invite_manager.refresh_button"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2" data-ocid="invite_manager.loading_state">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 rounded-lg" />
            ))}
          </div>
        ) : error ? (
          <div
            className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 px-3 py-2 rounded-lg"
            data-ocid="invite_manager.error_state"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        ) : codes.length === 0 ? (
          <p
            className="text-sm text-muted-foreground text-center py-6"
            data-ocid="invite_manager.empty_state"
          >
            No invite codes yet. Generate one above.
          </p>
        ) : (
          <ul className="space-y-2">
            {codes.map((c, idx) => {
              const status = codeStatus(c);
              return (
                <li
                  key={c.code}
                  className="flex items-center justify-between gap-2 bg-muted/30 rounded-lg px-3 py-2"
                  data-ocid={`invite_manager.item.${idx + 1}`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-xs font-semibold text-foreground tracking-widest truncate">
                      {c.code}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-xs shrink-0 ${STATUS_BADGE[status]}`}
                    >
                      {status}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="text-xs font-mono shrink-0"
                    >
                      {formatCodeType(c.code)}
                    </Badge>
                  </div>
                  {status === "active" && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRevoke(c.code)}
                      disabled={revoking === c.code}
                      aria-label={`Revoke code ${c.code}`}
                      data-ocid={`invite_manager.revoke_button.${idx + 1}`}
                    >
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};
