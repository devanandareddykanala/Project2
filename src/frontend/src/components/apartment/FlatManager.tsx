import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Building, Plus, UserPlus } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { createApartmentActor } from "../../auth";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";

interface Flat {
  id: string;
  apartmentId: string;
  flatNumber: string;
  details: string;
}

interface FlatManagerProps {
  apartmentId: string;
}

export const FlatManager: React.FC<FlatManagerProps> = ({ apartmentId }) => {
  const { identity } = useInternetIdentity();
  const [flats, setFlats] = useState<Flat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Add flat form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newFlatNumber, setNewFlatNumber] = useState("");
  const [newFlatDetails, setNewFlatDetails] = useState("");
  const [addingFlat, setAddingFlat] = useState(false);
  const [addError, setAddError] = useState("");

  // Assign admin inline per flat
  const [assigningFlatId, setAssigningFlatId] = useState<string | null>(null);
  const [assignPrincipal, setAssignPrincipal] = useState("");
  const [assigningRole, setAssigningRole] = useState(false);
  const [assignError, setAssignError] = useState("");

  const loadFlats = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const actor = createApartmentActor(identity);
      if (!actor) {
        setLoading(false);
        return;
      }
      const raw = await actor.getFlats(apartmentId);
      setFlats(raw as Flat[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load flats.");
    } finally {
      setLoading(false);
    }
  }, [apartmentId, identity]);

  useEffect(() => {
    void loadFlats();
  }, [loadFlats]);

  const handleAddFlat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFlatNumber.trim()) {
      setAddError("Flat number is required.");
      return;
    }
    setAddingFlat(true);
    setAddError("");
    try {
      const actor = createApartmentActor(identity);
      if (!actor) {
        setAddError("Actor unavailable.");
        setAddingFlat(false);
        return;
      }
      const result = await actor.createFlat(
        apartmentId,
        newFlatNumber.trim(),
        newFlatDetails.trim(),
      );
      if ("ok" in result) {
        setNewFlatNumber("");
        setNewFlatDetails("");
        setShowAddForm(false);
        void loadFlats();
      } else {
        setAddError(result.err ?? "Failed to add flat.");
      }
    } catch (err) {
      setAddError(err instanceof Error ? err.message : "Unexpected error.");
    } finally {
      setAddingFlat(false);
    }
  };

  const handleAssignAdmin = async (flatId: string) => {
    if (!assignPrincipal.trim()) {
      setAssignError("Principal ID is required.");
      return;
    }
    setAssigningRole(true);
    setAssignError("");
    try {
      const actor = createApartmentActor(identity);
      if (!actor) {
        setAssignError("Actor unavailable.");
        setAssigningRole(false);
        return;
      }
      // Build principal from text
      const { Principal } = await import("@dfinity/principal");
      const p = Principal.fromText(assignPrincipal.trim());
      const result = await actor.assignRole(
        p,
        { FlatAdmin: null },
        apartmentId,
        [flatId],
      );
      if ("ok" in result) {
        setAssigningFlatId(null);
        setAssignPrincipal("");
        void loadFlats();
      } else {
        setAssignError(result.err ?? "Assignment failed.");
      }
    } catch (err) {
      setAssignError(
        err instanceof Error ? err.message : "Invalid principal or error.",
      );
    } finally {
      setAssigningRole(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Flat Manager</h2>
        <Button
          onClick={() => setShowAddForm((s) => !s)}
          size="sm"
          data-ocid="flat_manager.add_flat_button"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Flat
        </Button>
      </div>

      {showAddForm && (
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">New Flat</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddFlat} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="flat-number">Flat Number</Label>
                  <Input
                    id="flat-number"
                    placeholder="e.g. 4B"
                    value={newFlatNumber}
                    onChange={(e) => setNewFlatNumber(e.target.value)}
                    data-ocid="flat_manager.flat_number_input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="flat-details">Details</Label>
                  <Input
                    id="flat-details"
                    placeholder="Optional notes"
                    value={newFlatDetails}
                    onChange={(e) => setNewFlatDetails(e.target.value)}
                    data-ocid="flat_manager.flat_details_input"
                  />
                </div>
              </div>
              {addError && (
                <p
                  className="text-sm text-destructive"
                  data-ocid="flat_manager.add_error_state"
                >
                  {addError}
                </p>
              )}
              <div className="flex gap-2">
                <Button
                  type="submit"
                  size="sm"
                  disabled={addingFlat}
                  data-ocid="flat_manager.add_submit_button"
                >
                  {addingFlat ? "Adding…" : "Add Flat"}
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
        <div className="space-y-3" data-ocid="flat_manager.loading_state">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <p
          className="text-destructive text-sm"
          data-ocid="flat_manager.error_state"
        >
          {error}
        </p>
      ) : flats.length === 0 ? (
        <div
          className="text-center py-12 bg-muted/30 rounded-xl border border-dashed border-border"
          data-ocid="flat_manager.empty_state"
        >
          <Building className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">
            No flats added yet. Click Add Flat to get started.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {flats.map((flat, idx) => (
            <Card
              key={flat.id}
              className=""
              data-ocid={`flat_manager.item.${idx + 1}`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        Flat {flat.flatNumber}
                      </p>
                      {flat.details && (
                        <p className="text-sm text-muted-foreground">
                          {flat.details}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {flat.id.slice(0, 8)}…
                    </Badge>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setAssigningFlatId(
                          assigningFlatId === flat.id ? null : flat.id,
                        );
                        setAssignPrincipal("");
                        setAssignError("");
                      }}
                      data-ocid={`flat_manager.assign_admin_button.${idx + 1}`}
                    >
                      <UserPlus className="w-3.5 h-3.5 mr-1" />
                      Assign Admin
                    </Button>
                  </div>
                </div>

                {assigningFlatId === flat.id && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Principal ID"
                        value={assignPrincipal}
                        onChange={(e) => setAssignPrincipal(e.target.value)}
                        className="font-mono text-sm"
                        data-ocid={`flat_manager.assign_principal_input.${idx + 1}`}
                      />
                      <Button
                        type="button"
                        size="sm"
                        disabled={assigningRole}
                        onClick={() => handleAssignAdmin(flat.id)}
                        data-ocid={`flat_manager.assign_confirm_button.${idx + 1}`}
                      >
                        {assigningRole ? "…" : "Assign"}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setAssigningFlatId(null);
                          setAssignError("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                    {assignError && (
                      <p
                        className="text-xs text-destructive mt-1"
                        data-ocid="flat_manager.assign_error_state"
                      >
                        {assignError}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
