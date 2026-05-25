import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, CheckCircle2, Clock, Crown } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createApartmentActor } from "../auth";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface PendingApartment {
  id: string;
  name: string;
  address: string;
  totalFlats: bigint;
  contactDetails: string;
  status: string;
  createdAt: bigint;
}

function formatExpiryCountdown(createdAtNs: bigint): string {
  const createdMs = Number(createdAtNs) / 1_000_000;
  const expiresMs = createdMs + 48 * 60 * 60 * 1000;
  const remaining = expiresMs - Date.now();
  if (remaining <= 0) return "Expired";
  const hours = Math.floor(remaining / 3_600_000);
  const mins = Math.floor((remaining % 3_600_000) / 60_000);
  return `${hours}h ${mins}m remaining`;
}

function truncatePrincipal(p: string): string {
  return p.length > 20 ? `${p.slice(0, 12)}…${p.slice(-6)}` : p;
}

interface FounderHomeProps {
  onBackToModeSelector: () => void;
}

export const FounderHome: React.FC<FounderHomeProps> = ({
  onBackToModeSelector,
}) => {
  const { identity } = useInternetIdentity();
  const [pendingRequests, setPendingRequests] = useState<PendingApartment[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [approveResults, setApproveResults] = useState<
    Record<string, "ok" | "err">
  >({});
  const founderSet = useRef(false);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const actor = createApartmentActor(identity);
      if (!actor) {
        setLoading(false);
        return;
      }

      // Set founder principal once (idempotent after first call)
      if (!founderSet.current && identity) {
        founderSet.current = true;
        try {
          await actor.setFounderPrincipal(identity.getPrincipal());
        } catch {
          // Not fatal — continue
        }
      }

      const raw = await actor.getPendingApartmentRequests();
      setPendingRequests(raw as PendingApartment[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load requests.");
    } finally {
      setLoading(false);
    }
  }, [identity]);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  const handleApprove = async (apartmentId: string) => {
    setApprovingId(apartmentId);
    try {
      const actor = createApartmentActor(identity);
      if (!actor) return;
      const result = await actor.approveApartmentCreation(apartmentId);
      if ("ok" in result) {
        setApproveResults((r) => ({ ...r, [apartmentId]: "ok" }));
        void loadRequests();
      } else {
        setApproveResults((r) => ({ ...r, [apartmentId]: "err" }));
      }
    } catch {
      setApproveResults((r) => ({ ...r, [apartmentId]: "err" }));
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="bg-card border-b border-border px-4 py-3 flex items-center justify-between sticky top-0">
        <div className="flex items-center gap-3">
          <img
            src="/develvyn-logo.png"
            alt="Develvyn"
            className="w-8 h-8 rounded-lg"
          />
          <div>
            <h1 className="font-semibold text-foreground text-sm">
              Founder Dashboard
            </h1>
            <p className="text-xs text-muted-foreground">Platform overview</p>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onBackToModeSelector}
          data-ocid="founder_home.back_button"
        >
          ← Modes
        </Button>
      </div>

      <div className="p-4 max-w-3xl mx-auto space-y-6">
        {/* Header card */}
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Crown className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Founder</h2>
              <p className="text-sm text-muted-foreground">
                Full platform access
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Pending Apartment Requests */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              Pending Apartment Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div
                className="space-y-3"
                data-ocid="founder_home.requests.loading_state"
              >
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-xl" />
                ))}
              </div>
            ) : error ? (
              <p
                className="text-destructive text-sm"
                data-ocid="founder_home.requests.error_state"
              >
                {error}
              </p>
            ) : pendingRequests.length === 0 ? (
              <div
                className="text-center py-8 text-muted-foreground"
                data-ocid="founder_home.requests.empty_state"
              >
                No pending apartment requests.
              </div>
            ) : (
              <div className="space-y-3">
                {pendingRequests.map((apt, idx) => (
                  <div
                    key={apt.id}
                    className="p-4 rounded-xl bg-muted/30 border border-border"
                    data-ocid={`founder_home.request.item.${idx + 1}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-foreground truncate">
                            {apt.name}
                          </p>
                          <Badge variant="outline" className="text-xs shrink-0">
                            {apt.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {apt.address}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs font-mono text-muted-foreground">
                            {truncatePrincipal(apt.id)}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {formatExpiryCountdown(apt.createdAt)}
                          </span>
                        </div>
                      </div>
                      <div className="shrink-0">
                        {approveResults[apt.id] === "ok" ? (
                          <div
                            className="flex items-center gap-1 text-primary text-sm"
                            data-ocid={`founder_home.request.success_state.${idx + 1}`}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Approved
                          </div>
                        ) : (
                          <Button
                            type="button"
                            size="sm"
                            disabled={approvingId === apt.id}
                            onClick={() => handleApprove(apt.id)}
                            data-ocid={`founder_home.request.approve_button.${idx + 1}`}
                          >
                            {approvingId === apt.id ? "Approving…" : "Approve"}
                          </Button>
                        )}
                        {approveResults[apt.id] === "err" && (
                          <p
                            className="text-xs text-destructive mt-1"
                            data-ocid={`founder_home.request.error_state.${idx + 1}`}
                          >
                            Approval failed
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
