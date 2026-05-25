import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Types "../types/auth";
import AuthLib "../lib/auth";

/// Public API surface for the Auth canister.
/// Receives injected stable state slices from main.mo (auth.mo actor).
mixin (
  principals             : Map.Map<Principal, Bool>,
  roleMap                : Map.Map<Principal, List.List<Types.Role>>,
  consents               : Map.Map<Principal, Types.ConsentRecord>,
  founderState           : { var claimed : Bool },
  deployState            : { var deployTime : Int },
  inviteCodes            : Map.Map<Text, Types.InviteCode>,
  bruteForceLockMap      : Map.Map<Principal, Types.BruteForceLockState>,
  codeCounterByApartment : Map.Map<Text, Nat>,
) {

  // ==================== Founder Setup ====================

  /// Return true if the Founder slot has already been claimed.
  public query func isFounderClaimed() : async Bool {
    AuthLib.isFounderClaimed(founderState);
  };

  /// Claim Founder role. Locked after first successful call.
  /// Must be called within 1 hour of canister deployment.
  public shared ({ caller }) func initFounder() : async Types.InitFounderResult {
    AuthLib.initFounder(
      roleMap,
      founderState,
      caller,
      deployState.deployTime,
      Time.now(),
    );
  };

  // ==================== Role Queries ====================

  /// Return the roles assigned to the given principal.
  public query func getUserRoles(p : Principal) : async [Types.Role] {
    AuthLib.getUserRoles(roleMap, p);
  };

  // ==================== Consent ====================

  /// Return whether the given principal has recorded DPDP consent.
  public query func hasDoneConsent(p : Principal) : async Bool {
    AuthLib.hasDoneConsent(consents, p);
  };

  public query func hasDonePolicy(p : Principal) : async Bool {
    AuthLib.hasDonePolicy(consents, p);
  };

  /// Return the policy version accepted by the given principal, if any.
  public query func getPolicyVersionAccepted(p : Principal) : async ?Text {
    AuthLib.getPolicyVersionAccepted(consents, p);
  };

  /// Record DPDP consent for the caller with the given policy version.
  public shared ({ caller }) func recordConsent(consentType : {#dpdp; #policy}, policyVersion : Text) : async () {
    AuthLib.recordConsent(consents, principals, caller, consentType, policyVersion, Time.now());
  };

  // ==================== Invite Code API ====================

  /// Generate an invite code of the specified type.
  /// Caller must have the appropriate issuer role.
  /// Optional context carries an apartment ID (required for DAPT/DWCH codes).
  public shared ({ caller }) func generateInviteCode(
    codeType : Types.CodeType,
    context  : ?Text,
  ) : async { #ok : Text; #err : Text } {
    AuthLib.generateInviteCode(
      inviteCodes,
      codeCounterByApartment,
      roleMap,
      caller,
      codeType,
      context,
      Time.now(),
    );
  };

  /// Redeem an invite code. Assigns a role on success.
  public shared ({ caller }) func redeemInviteCode(code : Text) : async Types.RedeemResult {
    AuthLib.redeemInviteCode(
      inviteCodes,
      codeCounterByApartment,
      roleMap,
      bruteForceLockMap,
      caller,
      code,
      Time.now(),
    );
  };

  /// Revoke an existing invite code immediately.
  /// Only the original issuer may revoke.
  public shared ({ caller }) func revokeInviteCode(code : Text) : async { #ok; #err : Text } {
    AuthLib.revokeInviteCode(inviteCodes, codeCounterByApartment, caller, code);
  };

  /// Return all active (non-expired, non-revoked, non-used) codes for an apartment.
  public shared func getActiveCodesByApartment(apartmentId : Text) : async [Types.InviteCode] {
    AuthLib.getActiveCodesByApartment(inviteCodes, apartmentId, Time.now());
  };

  /// Return the usage log entry for a specific code.
  public query func getUsageLog(code : Text) : async ?Types.UsageLogEntry {
    AuthLib.getUsageLog(inviteCodes, code);
  };

};
