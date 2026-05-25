import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, CheckCircle2, Clock } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { createApartmentActor } from "../../auth";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";

type FormState = "idle" | "submitting" | "success" | "error";

export const ApartmentSetup: React.FC = () => {
  const { identity } = useInternetIdentity();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [totalFlats, setTotalFlats] = useState("1");
  const [contactDetails, setContactDetails] = useState("");
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [submittedAt, setSubmittedAt] = useState(0);

  const expiryHours = 48;
  const expiryMs = submittedAt + expiryHours * 60 * 60 * 1000;
  const expiryDate = new Date(expiryMs).toLocaleString();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !address.trim() || !contactDetails.trim()) {
      setErrorMsg("All fields are required.");
      setFormState("error");
      return;
    }
    const flats = Number.parseInt(totalFlats, 10);
    if (!Number.isFinite(flats) || flats < 1) {
      setErrorMsg("Total flats must be at least 1.");
      setFormState("error");
      return;
    }

    setFormState("submitting");
    setErrorMsg("");

    try {
      const actor = createApartmentActor(identity);
      if (!actor) {
        setErrorMsg(
          "Apartment canister not available. Please try again later.",
        );
        setFormState("error");
        return;
      }
      const result = await actor.requestApartmentCreation(
        name.trim(),
        address.trim(),
        BigInt(flats),
        contactDetails.trim(),
      );
      if ("ok" in result) {
        setSubmittedAt(Date.now());
        setFormState("success");
      } else {
        setErrorMsg(result.err ?? "Submission failed. Please try again.");
        setFormState("error");
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Unexpected error.");
      setFormState("error");
    }
  };

  if (formState === "success") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-7 h-7 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Request Submitted
            </h2>
            <p className="text-muted-foreground mb-4">
              Your apartment creation request has been submitted. A Founder will
              review it within 48 hours.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground bg-muted/40 rounded-lg px-4 py-3">
              <Clock className="w-4 h-4 shrink-0" />
              <span>Expires {expiryDate}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <CardHeader className="bg-primary/5 border-b border-border rounded-t-lg pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-foreground">
                Request Apartment Setup
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                A Founder will approve within 48 hours
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="apt-name">Apartment Name</Label>
              <Input
                id="apt-name"
                placeholder="e.g. Sunrise Heights"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={formState === "submitting"}
                data-ocid="apartment_setup.name_input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="apt-address">Address</Label>
              <Input
                id="apt-address"
                placeholder="Full address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={formState === "submitting"}
                data-ocid="apartment_setup.address_input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="apt-flats">Total Flats</Label>
              <Input
                id="apt-flats"
                type="number"
                min="1"
                placeholder="e.g. 24"
                value={totalFlats}
                onChange={(e) => setTotalFlats(e.target.value)}
                disabled={formState === "submitting"}
                data-ocid="apartment_setup.total_flats_input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="apt-contact">Contact Details</Label>
              <Input
                id="apt-contact"
                placeholder="Phone or email for building inquiries"
                value={contactDetails}
                onChange={(e) => setContactDetails(e.target.value)}
                disabled={formState === "submitting"}
                data-ocid="apartment_setup.contact_input"
              />
            </div>
            {formState === "error" && errorMsg && (
              <p
                className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2"
                data-ocid="apartment_setup.error_state"
              >
                {errorMsg}
              </p>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={formState === "submitting"}
              data-ocid="apartment_setup.submit_button"
            >
              {formState === "submitting" ? "Submitting…" : "Submit Request"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
