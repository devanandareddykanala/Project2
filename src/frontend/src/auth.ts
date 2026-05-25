import { Actor, HttpAgent } from "@dfinity/agent";
import env from "../env.json";

// TODO: Replace with generated idlFactory from src/frontend/src/declarations/auth/auth.did.js once bindgen runs for auth canister
const authIdlFactory = ({ IDL }: { IDL: any }) => {
  const CodeType = IDL.Variant({
    DAPT: IDL.Null,
    DFAM: IDL.Null,
    DWCH: IDL.Null,
    DFND: IDL.Null,
  });
  const ConsentType = IDL.Variant({
    dpdp: IDL.Null,
    policy: IDL.Null,
  });
  const Role = IDL.Variant({
    Founder: IDL.Null,
    CoFounder: IDL.Null,
    SuperAdmin: IDL.Null,
    FlatAdmin: IDL.Null,
    Resident: IDL.Null,
    Watchman: IDL.Null,
    FamilyHead: IDL.Null,
    AdultMember: IDL.Null,
    Child: IDL.Null,
    Employee: IDL.Null,
    Freelancer: IDL.Null,
  });
  const InitFounderResult = IDL.Variant({
    ok: IDL.Null,
    alreadyClaimed: IDL.Null,
    windowExpired: IDL.Null,
    notAuthenticated: IDL.Null,
  });
  const RedeemResult = IDL.Variant({
    ok: Role,
    expired: IDL.Null,
    revoked: IDL.Null,
    used: IDL.Null,
    notFound: IDL.Null,
    bruteForceLocked: IDL.Null,
  });
  const InviteCode = IDL.Record({
    code: IDL.Text,
    codeType: IDL.Text,
    issuerPrincipal: IDL.Principal,
    recipientPrincipal: IDL.Opt(IDL.Principal),
    createdAt: IDL.Int,
    expiresAt: IDL.Int,
    revoked: IDL.Bool,
    used: IDL.Bool,
  });
  const UsageLogEntry = IDL.Record({
    code: IDL.Text,
    issuerPrincipal: IDL.Principal,
    recipientPrincipal: IDL.Principal,
    usedAt: IDL.Int,
  });
  return IDL.Service({
    isFounderClaimed: IDL.Func([], [IDL.Bool], ["query"]),
    initFounder: IDL.Func([], [InitFounderResult], []),
    getUserRoles: IDL.Func([IDL.Principal], [IDL.Vec(Role)], ["query"]),
    recordConsent: IDL.Func([ConsentType, IDL.Text], [], []),
    generateInviteCode: IDL.Func(
      [CodeType, IDL.Opt(IDL.Text)],
      [IDL.Variant({ ok: IDL.Text, err: IDL.Text })],
      [],
    ),
    redeemInviteCode: IDL.Func([IDL.Text], [RedeemResult], []),
    revokeInviteCode: IDL.Func(
      [IDL.Text],
      [IDL.Variant({ ok: IDL.Null, err: IDL.Text })],
      [],
    ),
    getActiveCodesByApartment: IDL.Func(
      [IDL.Text],
      [IDL.Vec(InviteCode)],
      ["query"],
    ),
    getUsageLog: IDL.Func([IDL.Text], [IDL.Opt(UsageLogEntry)], ["query"]),
  });
};

// TODO: Replace with generated idlFactory from src/frontend/src/declarations/apartment/apartment.did.js once bindgen runs for apartment canister
const apartmentIdlFactory = ({ IDL }: { IDL: any }) => {
  const ApartmentRole = IDL.Variant({
    SuperAdmin: IDL.Null,
    FlatAdmin: IDL.Null,
    Resident: IDL.Null,
    Watchman: IDL.Null,
  });
  const ApartmentRoleEntry = IDL.Record({
    principal: IDL.Principal,
    role: ApartmentRole,
    apartmentId: IDL.Text,
    flatId: IDL.Opt(IDL.Text),
  });
  const Apartment = IDL.Record({
    id: IDL.Text,
    name: IDL.Text,
    address: IDL.Text,
    totalFlats: IDL.Nat,
    contactDetails: IDL.Text,
    status: IDL.Text,
    createdAt: IDL.Int,
  });
  const Flat = IDL.Record({
    id: IDL.Text,
    apartmentId: IDL.Text,
    flatNumber: IDL.Text,
    details: IDL.Text,
  });
  const AuditEntry = IDL.Record({
    action: IDL.Text,
    actorPrincipal: IDL.Principal,
    timestamp: IDL.Int,
    details: IDL.Text,
  });
  const ResidentInfo = IDL.Record({
    principal: IDL.Principal,
    name: IDL.Text,
  });
  const CreateApartmentResult = IDL.Variant({
    ok: IDL.Text,
    err: IDL.Text,
  });
  const ApproveApartmentResult = IDL.Variant({
    ok: IDL.Null,
    err: IDL.Text,
  });
  const CreateFlatResult = IDL.Variant({
    ok: IDL.Text,
    err: IDL.Text,
  });
  const AssignRoleResult = IDL.Variant({
    ok: IDL.Null,
    err: IDL.Text,
  });
  return IDL.Service({
    setFounderPrincipal: IDL.Func([IDL.Principal], [], []),
    requestApartmentCreation: IDL.Func(
      [IDL.Text, IDL.Text, IDL.Nat, IDL.Text],
      [CreateApartmentResult],
      [],
    ),
    approveApartmentCreation: IDL.Func(
      [IDL.Text],
      [ApproveApartmentResult],
      [],
    ),
    getPendingApartmentRequests: IDL.Func([], [IDL.Vec(Apartment)], ["query"]),
    getApartment: IDL.Func([IDL.Text], [IDL.Opt(Apartment)], ["query"]),
    createFlat: IDL.Func(
      [IDL.Text, IDL.Text, IDL.Text],
      [CreateFlatResult],
      [],
    ),
    getFlats: IDL.Func([IDL.Text], [IDL.Vec(Flat)], ["query"]),
    assignRole: IDL.Func(
      [IDL.Principal, ApartmentRole, IDL.Text, IDL.Opt(IDL.Text)],
      [AssignRoleResult],
      [],
    ),
    getMyRoles: IDL.Func([], [IDL.Vec(ApartmentRoleEntry)], ["query"]),
    getRolesByApartment: IDL.Func(
      [IDL.Text],
      [IDL.Vec(ApartmentRoleEntry)],
      ["query"],
    ),
    getFlatResidents: IDL.Func(
      [IDL.Text, IDL.Text],
      [IDL.Vec(ResidentInfo)],
      ["query"],
    ),
    getAuditLog: IDL.Func([IDL.Text], [IDL.Vec(AuditEntry)], ["query"]),
  });
};

export type AuthActor = {
  isFounderClaimed: () => Promise<boolean>;
  initFounder: () => Promise<
    | { ok: null }
    | { alreadyClaimed: null }
    | { windowExpired: null }
    | { notAuthenticated: null }
  >;
  getUserRoles: (principal: { toString(): string }) => Promise<
    Record<string, null>[]
  >;
  recordConsent: (
    consentType: Record<string, null>,
    policyVersion: string,
  ) => Promise<void>;
  generateInviteCode: (
    codeType: Record<string, null>,
    context: string[],
  ) => Promise<{ ok: string } | { err: string }>;
  redeemInviteCode: (code: string) => Promise<Record<string, unknown>>;
  revokeInviteCode: (code: string) => Promise<{ ok: null } | { err: string }>;
  getActiveCodesByApartment: (apartmentId: string) => Promise<unknown[]>;
  getUsageLog: (code: string) => Promise<unknown[]>;
};

export type ApartmentActor = {
  setFounderPrincipal: (p: unknown) => Promise<void>;
  requestApartmentCreation: (
    name: string,
    address: string,
    totalFlats: bigint,
    contactDetails: string,
  ) => Promise<{ ok: string } | { err: string }>;
  approveApartmentCreation: (
    apartmentId: string,
  ) => Promise<{ ok: null } | { err: string }>;
  getPendingApartmentRequests: () => Promise<unknown[]>;
  getApartment: (apartmentId: string) => Promise<unknown[]>;
  createFlat: (
    apartmentId: string,
    flatNumber: string,
    details: string,
  ) => Promise<{ ok: string } | { err: string }>;
  getFlats: (apartmentId: string) => Promise<unknown[]>;
  assignRole: (
    principal: unknown,
    role: Record<string, null>,
    apartmentId: string,
    flatId: unknown[],
  ) => Promise<{ ok: null } | { err: string }>;
  getMyRoles: () => Promise<unknown[]>;
  getRolesByApartment: (apartmentId: string) => Promise<unknown[]>;
  getFlatResidents: (apartmentId: string, flatId: string) => Promise<unknown[]>;
  getAuditLog: (apartmentId: string) => Promise<unknown[]>;
};

export function createAuthActor(identity?: unknown): AuthActor | null {
  const host = (env as Record<string, string>).backend_host;
  const canisterId = (env as Record<string, string>).auth_canister_id;
  if (!canisterId || canisterId === "undefined") return null;
  const resolvedHost =
    !host || host === "undefined" ? "https://icp-api.io" : host;
  const agent = new HttpAgent({
    host: resolvedHost,
    identity: identity as any,
  });
  return Actor.createActor(authIdlFactory as any, {
    agent,
    canisterId,
  }) as AuthActor;
}

export function createApartmentActor(
  identity?: unknown,
): ApartmentActor | null {
  const host = (env as Record<string, string>).backend_host;
  const canisterId = (env as Record<string, string>).apartment_canister_id;
  if (!canisterId || canisterId === "undefined") return null;
  const resolvedHost =
    !host || host === "undefined" ? "https://icp-api.io" : host;
  const agent = new HttpAgent({
    host: resolvedHost,
    identity: identity as any,
  });
  return Actor.createActor(apartmentIdlFactory as any, {
    agent,
    canisterId,
  }) as ApartmentActor;
}
