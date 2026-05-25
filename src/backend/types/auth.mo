import Time "mo:core/Time";
import Principal "mo:core/Principal";

module {

  // ==================== Role Definitions ====================

  /// All roles in the Develvyn system.
  /// Founder-mode roles: Founder, CoFounder, Employee, Freelancer
  /// Apartment-mode roles: SuperAdmin, FlatAdmin, Resident, Watchman
  /// Family-mode roles: FamilyHead, AdultMember, Child
  public type Role = {
    #Founder;
    #CoFounder;
    #Employee;
    #Freelancer;
    #SuperAdmin;
    #FlatAdmin;
    #Resident;
    #Watchman;
    #FamilyHead;
    #AdultMember;
    #Child;
  };

  // ==================== Consent + Policy ====================

  /// DPDP consent record stored per principal.
  public type ConsentRecord = {
    principal : Principal;
    dpDpConsentVersion : ?Text;
    dpDpConsentTimestamp : ?Time.Time;
    policyVersion : ?Text;
    policyTimestamp : ?Time.Time;
  };

  // ==================== Access Control ====================

  /// Variants that describe what a principal is NOT permitted to access.
  /// Enforced at canister level, not UI level.
  public type AccessDeniedReason = {
    /// Founder principals cannot query resident financial data.
    #FounderQueriedResidentFinancials;
    /// Watchman principals cannot query any family data.
    #WatchmanQueriedFamilyData;
    /// Residents cannot see another resident's payment history.
    #ResidentQueriedOtherPaymentHistory;
    /// Child principals cannot see any financial data.
    #ChildQueriedFinancialData;
  };

  // ==================== Invite Code Types ====================

  /// The four invite code categories.
  public type CodeType = {
    #DAPT; // Apartment resident invite — issued by Founder or SuperAdmin
    #DFAM; // Family member invite — issued by FamilyHead
    #DWCH; // Watchman invite — issued by SuperAdmin
    #DFND; // Founder team invite — issued by Founder only
  };

  /// A single invite code record stored in the Auth canister.
  public type InviteCode = {
    code               : Text;
    codeType           : CodeType;
    issuerPrincipal    : Principal;
    recipientPrincipal : ?Principal;
    createdAt          : Int;
    expiresAt          : Int;
    revoked            : Bool;
    used               : Bool;
    redeemedAt         : ?Int;
    /// Apartment ID context for DAPT / DWCH codes; null for other types.
    context            : ?Text;
  };

  /// Optional apartment-ID context supplied at code generation time.
  /// When #apartment is provided, the code is scoped to that apartment.
  public type CodeContext = {
    #apartment : Text;
    #none;
  };

  /// Result returned by redeemInviteCode.
  public type RedeemResult = {
    #success : Role;        // role that was assigned
    #expired;
    #revoked;
    #used;
    #notFound;
    #bruteForceLocked;      // caller is currently locked out
  };

  /// Audit log entry for a single invite code.
  public type UsageLogEntry = {
    codeValue   : Text;
    generatedBy : Principal;
    generatedAt : Int;
    redeemedBy  : ?Principal;
    redeemedAt  : ?Int;
  };

  /// Brute-force lockout state per caller principal.
  public type BruteForceLockState = {
    var attemptCount : Nat;
    var lockUntil    : ?Int;
  };

  // ==================== initFounder Result ====================

  public type InitFounderResult = {
    #ok;
    #err : InitFounderError;
  };

  public type InitFounderError = {
    /// A Founder has already been registered; this function is permanently locked.
    #AlreadyClaimed;
    /// The 1-hour deployment window has expired.
    #WindowExpired;
    /// Caller is the anonymous principal.
    #NotAuthenticated;
  };

};
