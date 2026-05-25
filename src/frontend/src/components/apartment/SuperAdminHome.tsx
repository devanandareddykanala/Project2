import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Building,
  ClipboardList,
  Key,
  LayoutDashboard,
  ShieldCheck,
  Users,
} from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { createApartmentActor } from "../../auth";
import { InviteCodeGenerator } from "../../components/InviteCodeGenerator";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import { AuditLogViewer } from "./AuditLogViewer";
import { FlatManager } from "./FlatManager";
import { InviteCodeManager } from "./InviteCodeManager";
import { RoleAssignment } from "./RoleAssignment";

type Tab = "overview" | "flats" | "roles" | "audit" | "codes";

interface Apartment {
  id: string;
  name: string;
  address: string;
  totalFlats: bigint;
  contactDetails: string;
  status: string;
  createdAt: bigint;
}

interface Flat {
  id: string;
  apartmentId: string;
  flatNumber: string;
  details: string;
}
interface RoleEntry {
  role: Record<string, null>;
  flatId: string[];
}

interface SuperAdminHomeProps {
  apartmentId: string;
  onBackToModeSelector?: () => void;
}

export const SuperAdminHome: React.FC<SuperAdminHomeProps> = ({
  apartmentId,
  onBackToModeSelector,
}) => {
  const { identity } = useInternetIdentity();
  const [tab, setTab] = useState<Tab>("overview");
  const [apartment, setApartment] = useState<Apartment | null>(null);
  const [flats, setFlats] = useState<Flat[]>([]);
  const [roles, setRoles] = useState<RoleEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOverview = useCallback(async () => {
    setLoading(true);
    try {
      const actor = createApartmentActor(identity);
      if (!actor) {
        setLoading(false);
        return;
      }
      const [aptResult, rawFlats, rawRoles] = await Promise.all([
        actor.getApartment(apartmentId),
        actor.getFlats(apartmentId),
        actor.getRolesByApartment(apartmentId),
      ]);
      const aptArr = aptResult as Apartment[];
      setApartment(aptArr.length > 0 ? aptArr[0] : null);
      setFlats(rawFlats as Flat[]);
      setRoles(rawRoles as RoleEntry[]);
    } catch {
      // non-fatal — show whatever loaded
    } finally {
      setLoading(false);
    }
  }, [apartmentId, identity]);

  useEffect(() => {
    void loadOverview();
  }, [loadOverview]);

  const residentCount = roles.filter((r) => "Resident" in r.role).length;
  const pendingCount = 0; // Will be populated in Phase 4

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    {
      id: "overview",
      label: "Overview",
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: "flats",
      label: "Flat Manager",
      icon: <Building className="w-4 h-4" />,
    },
    {
      id: "roles",
      label: "Role Assignment",
      icon: <ShieldCheck className="w-4 h-4" />,
    },
    {
      id: "audit",
      label: "Audit Log",
      icon: <ClipboardList className="w-4 h-4" />,
    },
    { id: "codes", label: "Invite Codes", icon: <Key className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="bg-card border-b border-border px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <img
            src="/develvyn-logo.png"
            alt="Develvyn"
            className="w-8 h-8 rounded-lg"
          />
          <div>
            <h1 className="font-semibold text-foreground text-sm leading-tight">
              {loading
                ? "Loading…"
                : (apartment?.name ?? "Apartment Dashboard")}
            </h1>
            <p className="text-xs text-muted-foreground">Super Admin</p>
          </div>
        </div>
        {onBackToModeSelector && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onBackToModeSelector}
            data-ocid="super_admin.back_button"
          >
            ← Modes
          </Button>
        )}
      </div>

      {/* Tab Nav */}
      <div className="bg-card border-b border-border px-4">
        <div className="flex gap-1 overflow-x-auto no-scrollbar">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                tab === t.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              data-ocid={`super_admin.${t.id}_tab`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 max-w-4xl mx-auto">
        {tab === "overview" && (
          <div className="space-y-6 pt-2">
            {loading ? (
              <div
                className="grid grid-cols-3 gap-3"
                data-ocid="super_admin.overview.loading_state"
              >
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 rounded-xl" />
                ))}
              </div>
            ) : (
              <>
                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <Card data-ocid="super_admin.stats.total_flats">
                    <CardContent className="p-4 text-center">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2">
                        <Building className="w-4 h-4 text-primary" />
                      </div>
                      <p className="text-2xl font-bold text-foreground">
                        {flats.length}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Total Flats
                      </p>
                    </CardContent>
                  </Card>
                  <Card data-ocid="super_admin.stats.total_residents">
                    <CardContent className="p-4 text-center">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2">
                        <Users className="w-4 h-4 text-primary" />
                      </div>
                      <p className="text-2xl font-bold text-foreground">
                        {residentCount}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Residents
                      </p>
                    </CardContent>
                  </Card>
                  <Card data-ocid="super_admin.stats.pending">
                    <CardContent className="p-4 text-center">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2">
                        <ClipboardList className="w-4 h-4 text-primary" />
                      </div>
                      <p className="text-2xl font-bold text-foreground">
                        {pendingCount}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Pending
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Apartment info */}
                {apartment && (
                  <Card>
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="text-primary border-primary/20 bg-primary/5"
                        >
                          {apartment.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {apartment.address}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {apartment.contactDetails}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        )}

        {tab === "flats" && <FlatManager apartmentId={apartmentId} />}
        {tab === "roles" && <RoleAssignment apartmentId={apartmentId} />}
        {tab === "audit" && <AuditLogViewer apartmentId={apartmentId} />}

        {tab === "codes" && (
          <div className="space-y-4 mt-2" data-ocid="super_admin.codes.panel">
            <InviteCodeGenerator onClose={() => {}} />
            <InviteCodeManager apartmentId={String(apartmentId)} />
          </div>
        )}
      </div>
    </div>
  );
};
