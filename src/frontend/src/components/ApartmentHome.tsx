import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2 } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { createApartmentActor } from "../auth";
import { useDevelvynAuth } from "../contexts/DevelvynAuthContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { ApartmentSetup } from "./apartment/ApartmentSetup";
import { FlatAdminHome } from "./apartment/FlatAdminHome";
import { ResidentHome } from "./apartment/ResidentHome";
import { SuperAdminHome } from "./apartment/SuperAdminHome";

type ApartmentRole =
  | "SuperAdmin"
  | "FlatAdmin"
  | "Resident"
  | "none"
  | "loading";

interface ApartmentRoleEntry {
  role: Record<string, null>;
  apartmentId: string;
  flatId: string[];
}

interface ApartmentHomeProps {
  onBackToModeSelector: () => void;
}

export const ApartmentHome: React.FC<ApartmentHomeProps> = ({
  onBackToModeSelector,
}) => {
  const { identity } = useInternetIdentity();
  const { userRoles } = useDevelvynAuth();
  const [apartmentRole, setApartmentRole] = useState<ApartmentRole>("loading");
  const [apartmentId, setApartmentId] = useState("");
  const [flatId, setFlatId] = useState("");

  const isFounder =
    userRoles.includes("Founder") || userRoles.includes("CoFounder");

  const loadRoles = useCallback(async () => {
    setApartmentRole("loading");
    try {
      const actor = createApartmentActor(identity);
      if (!actor) {
        setApartmentRole(isFounder ? "none" : "none");
        return;
      }
      const raw = await actor.getMyRoles();
      const entries = raw as ApartmentRoleEntry[];
      if (entries.length === 0) {
        setApartmentRole("none");
        return;
      }
      const first = entries[0];
      setApartmentId(first.apartmentId);
      setFlatId(first.flatId.length > 0 ? first.flatId[0] : "");
      if ("SuperAdmin" in first.role) setApartmentRole("SuperAdmin");
      else if ("FlatAdmin" in first.role) setApartmentRole("FlatAdmin");
      else if ("Resident" in first.role) setApartmentRole("Resident");
      else setApartmentRole("none");
    } catch {
      setApartmentRole("none");
    }
  }, [identity, isFounder]);

  useEffect(() => {
    void loadRoles();
  }, [loadRoles]);

  if (apartmentRole === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div
          className="space-y-3 w-full max-w-sm"
          data-ocid="apartment_home.loading_state"
        >
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (apartmentRole === "SuperAdmin") {
    return (
      <SuperAdminHome
        apartmentId={apartmentId}
        onBackToModeSelector={onBackToModeSelector}
      />
    );
  }

  if (apartmentRole === "FlatAdmin") {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-card border-b border-border px-4 py-3 flex items-center justify-between sticky top-0">
          <div className="flex items-center gap-3">
            <img
              src="/develvyn-logo.png"
              alt="Develvyn"
              className="w-8 h-8 rounded-lg"
            />
            <div>
              <h1 className="font-semibold text-foreground text-sm">
                Apartment
              </h1>
              <p className="text-xs text-muted-foreground">Flat Admin</p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onBackToModeSelector}
            data-ocid="apartment_home.back_button"
          >
            ← Modes
          </Button>
        </div>
        <div className="p-4 max-w-2xl mx-auto">
          <FlatAdminHome apartmentId={apartmentId} flatId={flatId} />
        </div>
      </div>
    );
  }

  if (apartmentRole === "Resident") {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-card border-b border-border px-4 py-3 flex items-center justify-between sticky top-0">
          <div className="flex items-center gap-3">
            <img
              src="/develvyn-logo.png"
              alt="Develvyn"
              className="w-8 h-8 rounded-lg"
            />
            <div>
              <h1 className="font-semibold text-foreground text-sm">
                Apartment
              </h1>
              <p className="text-xs text-muted-foreground">Resident</p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onBackToModeSelector}
            data-ocid="apartment_home.back_button"
          >
            ← Modes
          </Button>
        </div>
        <div className="p-4 max-w-2xl mx-auto">
          <ResidentHome apartmentId={apartmentId} flatId={flatId} />
        </div>
      </div>
    );
  }

  // no roles
  if (isFounder) {
    return <ApartmentSetup />;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-l-4 border-l-primary">
        <CardContent className="p-8 text-center">
          <img
            src="/develvyn-logo.png"
            alt="Develvyn"
            className="w-16 h-16 rounded-2xl mx-auto mb-4"
          />
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground mb-2">
            Apartment Access
          </h1>
          <p className="text-muted-foreground mb-6">
            No apartment access. Contact your Super Admin.
          </p>
          <Button
            variant="outline"
            onClick={onBackToModeSelector}
            data-ocid="apartment_home.back_button"
          >
            Back to Mode Selector
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
