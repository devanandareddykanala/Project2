import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ClipboardList, Home, Users } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { createApartmentActor } from "../../auth";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";

interface ResidentInfo {
  principal: { toString(): string };
  name: string;
}

interface FlatAdminHomeProps {
  apartmentId: string;
  flatId: string;
  flatNumber?: string;
}

function truncatePrincipal(p: { toString(): string }): string {
  const s = p.toString();
  return s.length > 20 ? `${s.slice(0, 12)}…${s.slice(-6)}` : s;
}

export const FlatAdminHome: React.FC<FlatAdminHomeProps> = ({
  apartmentId,
  flatId,
  flatNumber,
}) => {
  const { identity } = useInternetIdentity();
  const [residents, setResidents] = useState<ResidentInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadResidents = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const actor = createApartmentActor(identity);
      if (!actor) {
        setLoading(false);
        return;
      }
      const raw = await actor.getFlatResidents(apartmentId, flatId);
      setResidents(raw as ResidentInfo[]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load residents.",
      );
    } finally {
      setLoading(false);
    }
  }, [apartmentId, flatId, identity]);

  useEffect(() => {
    void loadResidents();
  }, [loadResidents]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Home className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            My Flat{flatNumber ? ` — ${flatNumber}` : ""}
          </h1>
          <p className="text-sm text-muted-foreground">Flat Admin view</p>
        </div>
      </div>

      {/* Residents */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            Residents
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div
              className="space-y-2"
              data-ocid="flat_admin.residents.loading_state"
            >
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          ) : error ? (
            <p
              className="text-destructive text-sm"
              data-ocid="flat_admin.residents.error_state"
            >
              {error}
            </p>
          ) : residents.length === 0 ? (
            <div
              className="text-center py-6 text-muted-foreground"
              data-ocid="flat_admin.residents.empty_state"
            >
              No residents assigned yet.
            </div>
          ) : (
            <div className="space-y-2">
              {residents.map((r, idx) => (
                <div
                  key={r.principal.toString()}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/30"
                  data-ocid={`flat_admin.resident.item.${idx + 1}`}
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                    {r.name ? r.name[0].toUpperCase() : "R"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {r.name || "Resident"}
                    </p>
                    <p className="text-xs font-mono text-muted-foreground">
                      {truncatePrincipal(r.principal)}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs shrink-0">
                    Resident
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Issues placeholder */}
      <Card className="border-dashed border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-muted-foreground">
            <ClipboardList className="w-4 h-4" />
            Issues
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Issues — coming in Phase 4
          </p>
        </CardContent>
      </Card>

      {/* Visitor placeholder */}
      <Card className="border-dashed border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-muted-foreground">
            Visitor Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Visitor management — coming in Phase 4
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
