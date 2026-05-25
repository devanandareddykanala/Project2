import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, Home, Users } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { createApartmentActor } from "../../auth";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";

interface ResidentInfo {
  principal: { toString(): string };
  name: string;
}

interface ResidentHomeProps {
  apartmentId: string;
  flatId: string;
  flatNumber?: string;
}

export const ResidentHome: React.FC<ResidentHomeProps> = ({
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
    } catch {
      setError("Failed to load flat info.");
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
            My Home{flatNumber ? ` — Flat ${flatNumber}` : ""}
          </h1>
          <p className="text-sm text-muted-foreground">Resident view</p>
        </div>
      </div>

      {/* Flat info + residents */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            Flat Residents
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div
              className="space-y-2"
              data-ocid="resident.residents.loading_state"
            >
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          ) : error ? (
            <p
              className="text-destructive text-sm"
              data-ocid="resident.residents.error_state"
            >
              {error}
            </p>
          ) : residents.length === 0 ? (
            <div
              className="text-center py-6 text-muted-foreground"
              data-ocid="resident.residents.empty_state"
            >
              No other residents in this flat yet.
            </div>
          ) : (
            <div className="space-y-2">
              {residents.map((r, idx) => (
                <div
                  key={r.principal.toString()}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/30"
                  data-ocid={`resident.flat.item.${idx + 1}`}
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                    {r.name ? r.name[0].toUpperCase() : "R"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {r.name || "Resident"}
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

      {/* Notices placeholder */}
      <Card className="border-dashed border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-muted-foreground">
            <Bell className="w-4 h-4" />
            Building Notices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Building notices — coming in Phase 4
          </p>
        </CardContent>
      </Card>

      {/* Visitor pre-registration placeholder */}
      <Card className="border-dashed border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-muted-foreground">
            Visitor Pre-Registration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Pre-register a visitor — coming in Phase 4
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
