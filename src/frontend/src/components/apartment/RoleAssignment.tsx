import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldCheck, UserPlus } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { createApartmentActor } from "../../auth";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";

interface Flat {
  id: string;
  flatNumber: string;
  details: string;
  apartmentId: string;
}

interface RoleEntry {
  principal: { toString(): string };
  role: Record<string, null>;
  apartmentId: string;
  flatId: string[];
  assignedAt?: bigint;
  assignedBy?: { toString(): string };
}

function roleName(role: Record<string, null>): string {
  if ("SuperAdmin" in role) return "Super Admin";
  if ("FlatAdmin" in role) return "Flat Admin";
  if ("Resident" in role) return "Resident";
  if ("Watchman" in role) return "Watchman";
  return "Unknown";
}

function roleBadgeClass(role: Record<string, null>): string {
  if ("SuperAdmin" in role)
    return "bg-primary/10 text-primary border-primary/20";
  if ("FlatAdmin" in role)
    return "bg-blue-500/10 text-blue-700 border-blue-200";
  if ("Resident" in role) return "bg-muted text-muted-foreground";
  return "bg-muted text-muted-foreground";
}

interface RoleAssignmentProps {
  apartmentId: string;
}

export const RoleAssignment: React.FC<RoleAssignmentProps> = ({
  apartmentId,
}) => {
  const { identity } = useInternetIdentity();
  const [roles, setRoles] = useState<RoleEntry[]>([]);
  const [flats, setFlats] = useState<Flat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showAddForm, setShowAddForm] = useState(false);
  const [newPrincipal, setNewPrincipal] = useState("");
  const [newRole, setNewRole] = useState<"FlatAdmin" | "Resident">("Resident");
  const [newFlatId, setNewFlatId] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const actor = createApartmentActor(identity);
      if (!actor) {
        setLoading(false);
        return;
      }
      const [rawRoles, rawFlats] = await Promise.all([
        actor.getRolesByApartment(apartmentId),
        actor.getFlats(apartmentId),
      ]);
      setRoles(rawRoles as RoleEntry[]);
      setFlats(rawFlats as Flat[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load roles.");
    } finally {
      setLoading(false);
    }
  }, [apartmentId, identity]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleAssignRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrincipal.trim()) {
      setAddError("Principal ID is required.");
      return;
    }
    setAdding(true);
    setAddError("");
    try {
      const actor = createApartmentActor(identity);
      if (!actor) {
        setAddError("Actor unavailable.");
        setAdding(false);
        return;
      }
      const { Principal } = await import("@dfinity/principal");
      const p = Principal.fromText(newPrincipal.trim());
      const roleVariant: Record<string, null> = {};
      roleVariant[newRole] = null;
      const flatIdOpt: string[] = newFlatId ? [newFlatId] : [];
      const result = await actor.assignRole(
        p,
        roleVariant,
        apartmentId,
        flatIdOpt,
      );
      if ("ok" in result) {
        setNewPrincipal("");
        setNewFlatId("");
        setShowAddForm(false);
        void loadData();
      } else {
        setAddError(result.err ?? "Assignment failed.");
      }
    } catch (err) {
      setAddError(
        err instanceof Error ? err.message : "Invalid principal or error.",
      );
    } finally {
      setAdding(false);
    }
  };

  const truncatePrincipal = (p: { toString(): string }) =>
    p.toString().length > 20
      ? `${p.toString().slice(0, 12)}…${p.toString().slice(-6)}`
      : p.toString();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">
          Role Assignment
        </h2>
        <Button
          onClick={() => setShowAddForm((s) => !s)}
          size="sm"
          data-ocid="role_assignment.add_role_button"
        >
          <UserPlus className="w-4 h-4 mr-1" />
          Add Role
        </Button>
      </div>

      {showAddForm && (
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Assign a Role</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAssignRole} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="role-principal">Principal ID</Label>
                <Input
                  id="role-principal"
                  placeholder="2vxsx-fae…"
                  value={newPrincipal}
                  onChange={(e) => setNewPrincipal(e.target.value)}
                  className="font-mono text-sm"
                  data-ocid="role_assignment.principal_input"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Role</Label>
                  <Select
                    value={newRole}
                    onValueChange={(v) =>
                      setNewRole(v as "FlatAdmin" | "Resident")
                    }
                  >
                    <SelectTrigger data-ocid="role_assignment.role_select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FlatAdmin">Flat Admin</SelectItem>
                      <SelectItem value="Resident">Resident</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Flat (optional)</Label>
                  <Select value={newFlatId} onValueChange={setNewFlatId}>
                    <SelectTrigger data-ocid="role_assignment.flat_select">
                      <SelectValue placeholder="Select flat" />
                    </SelectTrigger>
                    <SelectContent>
                      {flats.map((f) => (
                        <SelectItem key={f.id} value={f.id}>
                          Flat {f.flatNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {addError && (
                <p
                  className="text-sm text-destructive"
                  data-ocid="role_assignment.error_state"
                >
                  {addError}
                </p>
              )}
              <div className="flex gap-2">
                <Button
                  type="submit"
                  size="sm"
                  disabled={adding}
                  data-ocid="role_assignment.submit_button"
                >
                  {adding ? "Assigning…" : "Assign Role"}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="space-y-3" data-ocid="role_assignment.loading_state">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <p
          className="text-destructive text-sm"
          data-ocid="role_assignment.error_state"
        >
          {error}
        </p>
      ) : roles.length === 0 ? (
        <div
          className="text-center py-12 bg-muted/30 rounded-xl border border-dashed border-border"
          data-ocid="role_assignment.empty_state"
        >
          <ShieldCheck className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No role assignments yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 text-muted-foreground font-medium">
                  Principal
                </th>
                <th className="text-left py-2 px-3 text-muted-foreground font-medium">
                  Role
                </th>
                <th className="text-left py-2 px-3 text-muted-foreground font-medium">
                  Flat
                </th>
                <th className="text-left py-2 px-3 text-muted-foreground font-medium">
                  Assigned
                </th>
              </tr>
            </thead>
            <tbody>
              {roles.map((entry, idx) => (
                <tr
                  key={`${entry.principal.toString()}-${idx}`}
                  className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                  data-ocid={`role_assignment.item.${idx + 1}`}
                >
                  <td className="py-2.5 px-3 font-mono text-xs text-foreground">
                    {truncatePrincipal(entry.principal)}
                  </td>
                  <td className="py-2.5 px-3">
                    <Badge
                      variant="outline"
                      className={roleBadgeClass(entry.role)}
                    >
                      {roleName(entry.role)}
                    </Badge>
                  </td>
                  <td className="py-2.5 px-3 text-muted-foreground">
                    {entry.flatId.length > 0
                      ? `${entry.flatId[0].slice(0, 8)}…`
                      : "—"}
                  </td>
                  <td className="py-2.5 px-3 text-muted-foreground">
                    {entry.assignedAt
                      ? new Date(
                          Number(entry.assignedAt) / 1_000_000,
                        ).toLocaleDateString()
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
