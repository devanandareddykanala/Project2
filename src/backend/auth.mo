import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Types "types/auth";
import AuthMixin "mixins/auth-api";

/// Auth canister — composition root for the auth domain.
/// Owns all stable state slices and delegates public API to AuthMixin.
actor {

  // ==================== Stable State ====================

  /// All registered principals (true = registered).
  let principals : Map.Map<Principal, Bool> = Map.empty<Principal, Bool>();

  /// Principal → assigned roles.
  let roleMap : Map.Map<Principal, List.List<Types.Role>> = Map.empty<Principal, List.List<Types.Role>>();

  /// Principal → consent record (DPDP + policy version).
  let consents : Map.Map<Principal, Types.ConsentRecord> = Map.empty<Principal, Types.ConsentRecord>();

  /// Tracks whether the Founder slot has been claimed.
  let founderState = { var claimed = false };

  /// Records the nanosecond timestamp of first canister deployment.
  /// Set once on fresh install; used to enforce the 1-hour claim window.
  let deployState = { var deployTime = Time.now() };

  /// Invite codes keyed by code text.
  let inviteCodes : Map.Map<Text, Types.InviteCode> = Map.empty<Text, Types.InviteCode>();

  /// Brute-force lockout state keyed by caller principal.
  let bruteForceLockMap : Map.Map<Principal, Types.BruteForceLockState> = Map.empty<Principal, Types.BruteForceLockState>();

  /// Active code count per apartment ID (enforces max-10 limit).
  let codeCounterByApartment : Map.Map<Text, Nat> = Map.empty<Text, Nat>();

  // ==================== Mixin Inclusion ====================

  include AuthMixin(
    principals,
    roleMap,
    consents,
    founderState,
    deployState,
    inviteCodes,
    bruteForceLockMap,
    codeCounterByApartment,
  );

};
