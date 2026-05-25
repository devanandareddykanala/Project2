import type React from "react";
import { useEffect, useState } from "react";
import { createAuthActor } from "../auth";
import type { TabId } from "../constants";
import type { Role } from "../contexts/DevelvynAuthContext";
import { useDevelvynAuth } from "../contexts/DevelvynAuthContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { ApartmentHome } from "./ApartmentHome";
import { DPDPConsent } from "./DPDPConsent";
import { FamilyHome } from "./FamilyHome";
import { FounderHome } from "./FounderHome";
import { FounderSetup } from "./FounderSetup";
import { IIRecoveryGuidance } from "./IIRecoveryGuidance";
import { LoadingScreen } from "./LoadingScreen";
import { ModeSelector } from "./ModeSelector";
import { NoCodeScreen } from "./NoCodeScreen";
import { PrivacyPolicy } from "./PrivacyPolicy";
import { SessionTimeoutWarning } from "./SessionTimeoutWarning";
import { WatchmanHome } from "./WatchmanHome";

function deriveAllowedModes(roles: Role[]): string[] {
  const modeSet = new Set<string>();
  for (const role of roles) {
    if (["Founder", "CoFounder", "Employee", "Freelancer"].includes(role)) {
      modeSet.add("Founder");
    } else if (["SuperAdmin", "FlatAdmin", "Resident"].includes(role)) {
      modeSet.add("Apartment");
    } else if (["FamilyHead", "AdultMember", "Child"].includes(role)) {
      modeSet.add("Family");
    } else if (role === "Watchman") {
      modeSet.add("Watchman");
    }
  }
  // Preserve fixed display order
  const order = ["Founder", "Apartment", "Family", "Watchman"];
  return order.filter((m) => modeSet.has(m));
}

interface AuthenticatedAppProps {
  onLogout: () => void;
}

export const AuthenticatedApp: React.FC<AuthenticatedAppProps> = ({
  onLogout,
}) => {
  const [, setActiveTab] = useState<TabId>("dashboard");
  const [isClaimingFounder, setIsClaimingFounder] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);

  const auth = useDevelvynAuth();
  const { identity } = useInternetIdentity();
  const principalId = identity?.getPrincipal().toString() ?? "";

  // Derive allowed modes from roles assigned in context
  const allowedModes = deriveAllowedModes(auth.userRoles);

  const handleTimeout = () => {
    auth.setActiveMode(null);
    onLogout();
  };

  const timeoutMinutes = auth.activeMode === "Watchman" ? 5 : 30;
  const warningSeconds = auth.activeMode === "Watchman" ? 60 : 120;

  // authStep starts at 'recovery'; a useEffect corrects it once isLoadingAuth goes false
  const [authStep, setAuthStep] = useState<
    "recovery" | "consent" | "policy" | "mode"
  >("recovery");

  // biome-ignore lint/correctness/useExhaustiveDependencies: run only when isLoadingAuth transitions to false
  useEffect(() => {
    if (auth.isLoadingAuth) return;
    if (auth.hasCompletedConsent && auth.hasAcceptedPolicy) {
      setAuthStep("mode");
    } else if (auth.hasCompletedConsent) {
      setAuthStep("policy");
    }
    // else leave at 'recovery'
  }, [auth.isLoadingAuth]);

  // Keep setActiveTab from being unused
  void setActiveTab;

  // ── Loading gate: wait until auth canister responds ──
  if (auth.isLoadingAuth) {
    return <LoadingScreen />;
  }

  // ── Develvyn auth flow ──
  if (!auth.isFounderClaimed) {
    return (
      <FounderSetup
        principalId={principalId}
        deployTime={auth.deployTime}
        claimError={claimError}
        onClaim={async () => {
          setIsClaimingFounder(true);
          setClaimError(null);
          const actor = createAuthActor(identity);
          if (!actor) {
            // Canister not yet deployed — optimistically mark claimed for dev preview
            auth.setFounderSetupNeeded(false);
            auth.refreshAuthState();
            setIsClaimingFounder(false);
            return;
          }
          try {
            const result = await actor.initFounder();
            if ("windowExpired" in result) {
              setClaimError("Setup window has expired. Redeployment required.");
            } else if ("alreadyClaimed" in result) {
              setClaimError("A Founder has already been registered.");
            } else if ("notAuthenticated" in result) {
              setClaimError("Authentication error. Please sign in again.");
            } else {
              // ok — refresh state from canister
              auth.refreshAuthState();
            }
          } catch {
            setClaimError("Connection error. Please try again.");
          } finally {
            setIsClaimingFounder(false);
          }
        }}
        isLoading={isClaimingFounder}
      />
    );
  }

  // ── No Code Screen: Founder claimed but user has no roles ──
  if (auth.isFounderClaimed && auth.userRoles.length === 0) {
    return (
      <NoCodeScreen
        onCodeRedeemed={() => auth.refreshAuthState()}
        onSignOut={() => {
          auth.setActiveMode(null);
          onLogout();
        }}
      />
    );
  }

  if (authStep === "recovery") {
    return <IIRecoveryGuidance onComplete={() => setAuthStep("consent")} />;
  }

  if (authStep === "consent") {
    return (
      <DPDPConsent
        policyVersion="1.0"
        onConsent={async (policyVersion) => {
          await auth.recordConsent("dpdp", policyVersion);
          setAuthStep("policy");
        }}
      />
    );
  }

  if (authStep === "policy") {
    return (
      <PrivacyPolicy
        policyVersion="1.0"
        onAccept={async (policyVersion) => {
          await auth.recordConsent("policy", policyVersion);
          setAuthStep("mode");
        }}
      />
    );
  }

  if (!auth.activeMode) {
    const principalShort = principalId.slice(-8);

    return (
      <ModeSelector
        allowedModes={allowedModes}
        principalShort={principalShort}
        onSelectMode={(mode) => {
          auth.setActiveMode(
            mode as "Founder" | "Apartment" | "Family" | "Watchman",
          );
          auth.setSessionRole(mode === "Watchman" ? "Watchman" : "other");
        }}
        onSignOut={() => {
          auth.setActiveMode(null);
          onLogout();
        }}
        onEnterCode={() => {
          auth.setActiveMode(null);
        }}
      />
    );
  }

  // ── Mode homes ──
  if (auth.activeMode === "Founder") {
    return (
      <>
        <FounderHome onBackToModeSelector={() => auth.setActiveMode(null)} />
        <SessionTimeoutWarning
          timeoutMinutes={timeoutMinutes}
          warningSeconds={warningSeconds}
          onTimeout={handleTimeout}
        />
      </>
    );
  }

  if (auth.activeMode === "Apartment") {
    return (
      <>
        <ApartmentHome onBackToModeSelector={() => auth.setActiveMode(null)} />
        <SessionTimeoutWarning
          timeoutMinutes={timeoutMinutes}
          warningSeconds={warningSeconds}
          onTimeout={handleTimeout}
        />
      </>
    );
  }

  if (auth.activeMode === "Watchman") {
    return (
      <>
        <WatchmanHome onBackToModeSelector={() => auth.setActiveMode(null)} />
        <SessionTimeoutWarning
          timeoutMinutes={timeoutMinutes}
          warningSeconds={warningSeconds}
          onTimeout={handleTimeout}
        />
      </>
    );
  }

  if (auth.activeMode === "Family") {
    return (
      <>
        <FamilyHome onBackToModeSelector={() => auth.setActiveMode(null)} />
        <SessionTimeoutWarning
          timeoutMinutes={timeoutMinutes}
          warningSeconds={warningSeconds}
          onTimeout={handleTimeout}
        />
      </>
    );
  }

  // Fallback — should not be reached
  return <LoadingScreen />;
};
