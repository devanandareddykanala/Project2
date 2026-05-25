import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { type AuthActor, createAuthActor } from "../auth";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export type Role =
  | "Founder"
  | "CoFounder"
  | "Employee"
  | "Freelancer"
  | "SuperAdmin"
  | "FlatAdmin"
  | "Resident"
  | "FamilyHead"
  | "AdultMember"
  | "Child"
  | "Watchman";

type DevelvynMode = "Founder" | "Apartment" | "Family" | "Watchman";
type SessionRole = "Watchman" | "other";

interface DevelvynAuthState {
  hasCompletedConsent: boolean;
  hasAcceptedPolicy: boolean;
  founderSetupNeeded: boolean;
  isFounderClaimed: boolean;
  userRoles: Role[];
  isLoadingAuth: boolean;
  activeMode: DevelvynMode | null;
  sessionRole: SessionRole;
  isAuthenticated: boolean;
  deployTime: number;
}

interface DevelvynAuthContextValue extends DevelvynAuthState {
  setHasCompletedConsent: (value: boolean) => void;
  setHasAcceptedPolicy: (value: boolean) => void;
  setFounderSetupNeeded: (value: boolean) => void;
  setActiveMode: (mode: DevelvynMode | null) => void;
  setSessionRole: (role: SessionRole) => void;
  setIsAuthenticated: (value: boolean) => void;
  recordConsent: (consentType: string, policyVersion: string) => Promise<void>;
  refreshAuthState: () => void;
}

const DevelvynAuthContext = createContext<DevelvynAuthContextValue | null>(
  null,
);

function mapRole(raw: Record<string, null>): Role | null {
  if ("Founder" in raw) return "Founder";
  if ("CoFounder" in raw) return "CoFounder";
  if ("Employee" in raw) return "Employee";
  if ("Freelancer" in raw) return "Freelancer";
  if ("SuperAdmin" in raw) return "SuperAdmin";
  if ("FlatAdmin" in raw) return "FlatAdmin";
  if ("Resident" in raw) return "Resident";
  if ("FamilyHead" in raw) return "FamilyHead";
  if ("AdultMember" in raw) return "AdultMember";
  if ("Child" in raw) return "Child";
  if ("Watchman" in raw) return "Watchman";
  return null;
}

export const DevelvynAuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [hasCompletedConsent, setHasCompletedConsent] = useState(false);
  const [hasAcceptedPolicy, setHasAcceptedPolicy] = useState(false);
  const [founderSetupNeeded, setFounderSetupNeeded] = useState(false);
  const [isFounderClaimed, setIsFounderClaimed] = useState(false);
  const [userRoles, setUserRoles] = useState<Role[]>([]);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [activeMode, setActiveMode] = useState<DevelvynMode | null>(null);
  const [sessionRole, setSessionRole] = useState<SessionRole>("other");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [deployTime] = useState(() => Date.now());
  const [refreshTick, setRefreshTick] = useState(0);
  const [authActor, setAuthActor] = useState<AuthActor | null>(null);

  const { identity } = useInternetIdentity();

  const refreshAuthState = useCallback(() => {
    setRefreshTick((t) => t + 1);
  }, []);

  // When identity changes, create actor and wire it.
  useEffect(() => {
    setIsAuthenticated(!!identity);

    if (!identity) {
      setAuthActor(null);
      setIsLoadingAuth(false);
      setUserRoles([]);
      setHasCompletedConsent(false);
      setHasAcceptedPolicy(false);
      setIsFounderClaimed(false);
      setFounderSetupNeeded(false);
      return;
    }

    const actor = createAuthActor(identity);
    setAuthActor(actor);
  }, [identity]);

  // Query canister state whenever actor or refreshTick changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: refreshTick intentionally triggers re-fetch
  useEffect(() => {
    if (!identity) return;

    const actor = createAuthActor(identity);

    if (!actor) {
      // Auth canister not yet deployed — degrade gracefully
      setIsLoadingAuth(false);
      setUserRoles([]);
      setHasCompletedConsent(false);
      setHasAcceptedPolicy(false);
      setIsFounderClaimed(false);
      setFounderSetupNeeded(true);
      return;
    }

    setIsLoadingAuth(true);

    void (async () => {
      try {
        const principalText = identity.getPrincipal().toString();
        const consentKey = `develvyn_consent_${principalText}`;
        const policyKey = `develvyn_policy_${principalText}`;

        const [claimed, rawRoles] = await Promise.all([
          actor.isFounderClaimed(),
          actor.getUserRoles(identity.getPrincipal()),
        ]);

        const roles = rawRoles
          .map((r) => mapRole(r as Record<string, null>))
          .filter((r): r is Role => r !== null);

        const consentRecorded = localStorage.getItem(consentKey) === "true";
        const policyRecorded = localStorage.getItem(policyKey) === "true";

        setIsFounderClaimed(claimed);
        setUserRoles(roles);
        setHasCompletedConsent(consentRecorded);
        setHasAcceptedPolicy(policyRecorded);
        setFounderSetupNeeded(!claimed);
        setIsLoadingAuth(false);
      } catch {
        // Canister unreachable — fall back to safe defaults
        setIsFounderClaimed(false);
        setUserRoles([]);
        setHasCompletedConsent(false);
        setHasAcceptedPolicy(false);
        setFounderSetupNeeded(true);
        setIsLoadingAuth(false);
      }
    })();
  }, [identity, refreshTick]);

  const recordConsent = useCallback(
    async (consentType: string, policyVersion: string) => {
      if (!identity) return;
      const principalText = identity.getPrincipal().toString();

      if (consentType === "dpdp") {
        localStorage.setItem(`develvyn_consent_${principalText}`, "true");
        setHasCompletedConsent(true);
      } else if (consentType === "policy") {
        localStorage.setItem(`develvyn_policy_${principalText}`, "true");
        setHasAcceptedPolicy(true);
      }

      // Fire-and-forget canister call — localStorage is the source of truth for now
      if (authActor) {
        try {
          const variantType: Record<string, null> =
            consentType === "dpdp" ? { dpdp: null } : { policy: null };
          await authActor.recordConsent(variantType, policyVersion);
        } catch {
          // Ignore — localStorage already updated
        }
      }
    },
    [identity, authActor],
  );

  return (
    <DevelvynAuthContext.Provider
      value={{
        hasCompletedConsent,
        hasAcceptedPolicy,
        founderSetupNeeded,
        isFounderClaimed,
        userRoles,
        isLoadingAuth,
        activeMode,
        sessionRole,
        isAuthenticated,
        deployTime,
        setHasCompletedConsent,
        setHasAcceptedPolicy,
        setFounderSetupNeeded,
        setActiveMode,
        setSessionRole,
        setIsAuthenticated,
        recordConsent,
        refreshAuthState,
      }}
    >
      {children}
    </DevelvynAuthContext.Provider>
  );
};

export function useDevelvynAuth(): DevelvynAuthContextValue {
  const ctx = useContext(DevelvynAuthContext);
  if (!ctx) {
    throw new Error("useDevelvynAuth must be used within DevelvynAuthProvider");
  }
  return ctx;
}
