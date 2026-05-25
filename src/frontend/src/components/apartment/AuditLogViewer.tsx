import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, ClipboardList } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { createApartmentActor } from "../../auth";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";

interface AuditEntry {
  action: string;
  actorPrincipal: { toString(): string };
  timestamp: bigint;
  details: string;
  flatId?: string[];
}

const PAGE_SIZE = 50;

function formatTs(ns: bigint): string {
  const ms = Number(ns) / 1_000_000;
  return new Date(ms).toLocaleString();
}

function truncatePrincipal(p: { toString(): string }): string {
  const s = p.toString();
  return s.length > 20 ? `${s.slice(0, 12)}…${s.slice(-6)}` : s;
}

interface AuditLogViewerProps {
  apartmentId: string;
}

export const AuditLogViewer: React.FC<AuditLogViewerProps> = ({
  apartmentId,
}) => {
  const { identity } = useInternetIdentity();
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);

  const loadLog = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const actor = createApartmentActor(identity);
      if (!actor) {
        setLoading(false);
        return;
      }
      const raw = await actor.getAuditLog(apartmentId);
      // Newest first (reverse in case canister returns oldest first)
      const sorted = [...(raw as AuditEntry[])].reverse();
      setEntries(sorted);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load audit log.",
      );
    } finally {
      setLoading(false);
    }
  }, [apartmentId, identity]);

  useEffect(() => {
    void loadLog();
  }, [loadLog]);

  const totalPages = Math.ceil(entries.length / PAGE_SIZE);
  const pageEntries = entries.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Audit Log</h2>
        {entries.length > 0 && (
          <span className="text-sm text-muted-foreground">
            {entries.length} total entries
          </span>
        )}
      </div>

      {loading ? (
        <div className="space-y-3" data-ocid="audit_log.loading_state">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <p
          className="text-destructive text-sm"
          data-ocid="audit_log.error_state"
        >
          {error}
        </p>
      ) : entries.length === 0 ? (
        <div
          className="text-center py-12 bg-muted/30 rounded-xl border border-dashed border-border"
          data-ocid="audit_log.empty_state"
        >
          <ClipboardList className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No actions recorded yet.</p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {pageEntries.map((entry, idx) => (
              <div
                key={`${entry.action}-${entry.timestamp.toString()}-${idx}`}
                className="flex items-start gap-3 p-3 rounded-xl bg-card border border-border hover:bg-muted/20 transition-colors"
                data-ocid={`audit_log.item.${page * PAGE_SIZE + idx + 1}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-0.5">
                    <Badge
                      variant="outline"
                      className="text-xs font-mono shrink-0"
                    >
                      {entry.action}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatTs(entry.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm font-mono text-muted-foreground truncate">
                    {truncatePrincipal(entry.actorPrincipal)}
                  </p>
                  {entry.details && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {entry.details}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
                data-ocid="audit_log.pagination_prev"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                {page + 1} / {totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                data-ocid="audit_log.pagination_next"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
