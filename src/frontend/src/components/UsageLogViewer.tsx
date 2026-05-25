import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, CheckCircle, Clock } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { createAuthActor } from "../auth";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const CODE_TYPE_COLORS: Record<string, string> = {
  DAPT: "bg-primary/10 text-primary border-primary/20",
  DFAM: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  DWCH: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  DFND: "bg-purple-500/10 text-purple-600 border-purple-500/20",
};

function truncatePrincipal(p: string): string {
  return `${p.slice(0, 8)}…${p.slice(-6)}`;
}

function formatTimestamp(ts: bigint): string {
  const ms = Number(ts) / 1_000_000;
  return new Date(ms).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface CodeRecord {
  code: string;
  codeType: string;
  issuerPrincipal: { toString(): string };
  recipientPrincipal: Array<{ toString(): string }>;
  createdAt: bigint;
  expiresAt: bigint;
  revoked: boolean;
  used: boolean;
}

interface UsageLogViewerProps {
  apartmentId?: string;
}

export const UsageLogViewer: React.FC<UsageLogViewerProps> = ({
  apartmentId = "",
}) => {
  const { identity } = useInternetIdentity();
  const [records, setRecords] = useState<CodeRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRecords = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const actor = createAuthActor(identity);
      if (!actor) {
        setError("Auth canister not available.");
        return;
      }
      const raw = await actor.getActiveCodesByApartment(apartmentId);
      // Sort newest first
      const sorted = (raw as CodeRecord[]).sort(
        (a, b) => Number(b.createdAt) - Number(a.createdAt),
      );
      setRecords(sorted);
    } catch {
      setError("Failed to load usage history.");
    } finally {
      setIsLoading(false);
    }
  }, [identity, apartmentId]);

  useEffect(() => {
    void loadRecords();
  }, [loadRecords]);

  return (
    <Card className="shadow-md" data-ocid="usage_log.panel">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          Code Usage History
        </CardTitle>
      </CardHeader>

      <CardContent>
        {error && (
          <div
            className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg mb-4"
            data-ocid="usage_log.error_state"
          >
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="space-y-3" data-ocid="usage_log.loading_state">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : records.length === 0 ? (
          <div
            className="text-center py-8 text-muted-foreground"
            data-ocid="usage_log.empty_state"
          >
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No codes have been generated yet.</p>
          </div>
        ) : (
          <ul className="space-y-3" data-ocid="usage_log.list">
            {records.map((rec, index) => {
              const recipient =
                rec.recipientPrincipal.length > 0
                  ? rec.recipientPrincipal[0]?.toString()
                  : null;
              const colorClass =
                CODE_TYPE_COLORS[rec.codeType] ??
                "bg-muted text-muted-foreground border-border";

              return (
                <li
                  key={rec.code}
                  className="border border-border rounded-xl px-4 py-3 space-y-1.5"
                  data-ocid={`usage_log.item.${index + 1}`}
                >
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`font-mono text-xs ${colorClass}`}
                    >
                      {rec.codeType}
                    </Badge>
                    {rec.used ? (
                      <span className="flex items-center gap-1 text-xs text-primary">
                        <CheckCircle className="w-3 h-3" />
                        Used
                      </span>
                    ) : rec.revoked ? (
                      <span className="flex items-center gap-1 text-xs text-destructive">
                        Revoked
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        Pending
                      </span>
                    )}
                  </div>

                  {recipient ? (
                    <p className="text-xs text-foreground">
                      Used by:{" "}
                      <span className="font-mono">
                        {truncatePrincipal(recipient)}
                      </span>
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Not yet used
                    </p>
                  )}

                  <p className="text-xs text-muted-foreground">
                    Generated by:{" "}
                    <span className="font-mono">
                      {truncatePrincipal(rec.issuerPrincipal.toString())}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatTimestamp(rec.createdAt)}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};
