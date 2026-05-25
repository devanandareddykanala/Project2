import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Types "../types/auth";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Char "mo:core/Char";
import List "mo:core/List";
import Array "mo:core/Array";

module {

  // ==================== Types ====================

  /// 1 hour in nanoseconds
  let FOUNDER_CLAIM_WINDOW_NS : Int = 3_600_000_000_000;

  // ==================== Principal Storage ====================

  /// Register a principal as a known user (called on first consent).
  public func registerPrincipal(
    principals : Map.Map<Principal, Bool>,
    p : Principal,
  ) {
    principals.add(p, true);
  };

  /// Check whether a principal is registered.
  public func isPrincipalRegistered(
    principals : Map.Map<Principal, Bool>,
    p : Principal,
  ) : Bool {
    switch (principals.get(p)) {
      case (?_) true;
      case null false;
    };
  };

  // ==================== Role Assignment ====================

  /// Return the roles assigned to a principal (empty list if none).
  public func getUserRoles(
    roleMap : Map.Map<Principal, List.List<Types.Role>>,
    p : Principal,
  ) : [Types.Role] {
    switch (roleMap.get(p)) {
      case (?roles) roles.toArray();
      case null [];
    };
  };

  /// Assign a role to a principal (appends; idempotent by convention).
  public func assignRole(
    roleMap : Map.Map<Principal, List.List<Types.Role>>,
    p : Principal,
    role : Types.Role,
  ) {
    let existing = switch (roleMap.get(p)) {
      case (?roles) roles;
      case null List.empty<Types.Role>();
    };
    let alreadyHas = existing.find(func(r : Types.Role) : Bool { r == role }) != null;
    if (not alreadyHas) {
      existing.add(role);
      roleMap.add(p, existing);
    };
  };

  // ==================== Consent ====================

  /// Return true if the principal has recorded DPDP consent.
  public func hasDoneConsent(
    consents : Map.Map<Principal, Types.ConsentRecord>,
    p : Principal,
  ) : Bool {
    switch (consents.get(p)) {
      case (?record) record.dpDpConsentVersion != null;
      case null false;
    };
  };

  /// Return the policy version the principal accepted, if any.
  public func getPolicyVersionAccepted(
    consents : Map.Map<Principal, Types.ConsentRecord>,
    p : Principal,
  ) : ?Text {
    switch (consents.get(p)) {
      case (?record) record.policyVersion;
      case null null;
    };
  };

  public func hasDonePolicy(
    consents : Map.Map<Principal, Types.ConsentRecord>,
    p : Principal,
  ) : Bool {
    switch (consents.get(p)) {
      case (?record) record.policyVersion != null;
      case null false;
    };
  };

  /// Record DPDP consent with a timestamp for the given principal.
  public func recordConsent(
    consents : Map.Map<Principal, Types.ConsentRecord>,
    principals : Map.Map<Principal, Bool>,
    p : Principal,
    consentType : {#dpdp; #policy},
    policyVersion : Text,
    now : Int,
  ) {
    let existing = switch (consents.get(p)) {
      case (?r) r;
      case null {
        {
          principal = p;
          dpDpConsentVersion = null;
          dpDpConsentTimestamp = null;
          policyVersion = null;
          policyTimestamp = null;
        };
      };
    };
    let updated = switch (consentType) {
      case (#dpdp) {
        {
          principal = p;
          dpDpConsentVersion = ?policyVersion;
          dpDpConsentTimestamp = ?now;
          policyVersion = existing.policyVersion;
          policyTimestamp = existing.policyTimestamp;
        };
      };
      case (#policy) {
        {
          principal = p;
          dpDpConsentVersion = existing.dpDpConsentVersion;
          dpDpConsentTimestamp = existing.dpDpConsentTimestamp;
          policyVersion = ?policyVersion;
          policyTimestamp = ?now;
        };
      };
    };
    consents.add(p, updated);
    registerPrincipal(principals, p);
  };

  // ==================== Invite Code Stubs ====================

  /// Return true if the Founder slot has already been claimed.
  public func isFounderClaimed(
    founderClaimed : { var claimed : Bool },
  ) : Bool {
    founderClaimed.claimed;
  };

  /// Generate a new invite code of the given type.
  /// Enforces: caller has issuer rights, max 10 active codes per apartment.
  public func generateInviteCode(
    inviteCodes            : Map.Map<Text, Types.InviteCode>,
    codeCounterByApartment : Map.Map<Text, Nat>,
    roleMap                : Map.Map<Principal, List.List<Types.Role>>,
    caller                 : Principal,
    codeType               : Types.CodeType,
    context                : ?Text,
    now                    : Int,
  ) : { #ok : Text; #err : Text } {
    // Permission check
    let callerRoles = getUserRoles(roleMap, caller);
    let permitted = switch codeType {
      case (#DAPT) {
        callerRoles.find<Types.Role>(func(r) { r == #Founder or r == #CoFounder or r == #SuperAdmin }) != null;
      };
      case (#DFAM) {
        callerRoles.find<Types.Role>(func(r) { r == #FamilyHead }) != null;
      };
      case (#DWCH) {
        callerRoles.find<Types.Role>(func(r) { r == #SuperAdmin }) != null;
      };
      case (#DFND) {
        callerRoles.find<Types.Role>(func(r) { r == #Founder }) != null;
      };
    };
    if (not permitted) {
      return #err("Caller does not have permission to generate this code type");
    };

    // Max 10 active codes per apartment for DAPT and DWCH
    switch codeType {
      case (#DAPT or #DWCH) {
        let aptId = switch context {
          case (?id) id;
          case null { return #err("Apartment context required for DAPT/DWCH codes") };
        };
        let current = switch (codeCounterByApartment.get(aptId)) {
          case (?n) n;
          case null 0;
        };
        if (current >= 10) {
          return #err("Maximum of 10 active codes per apartment reached");
        };
      };
      case _ {};
    };

    // Generate pseudo-random 4-char suffix using now + counter seed
    let seed = Int.abs(now);
    let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let charArray = chars.toArray();
    let len : Nat = charArray.size();
    let c0 = charArray[(seed / 1)           % len];
    let c1 = charArray[(seed / 37)          % len];
    let c2 = charArray[(seed / 1369)        % len];
    let c3 = charArray[(seed / 50653)       % len];
    let suffix = c0.toText() # c1.toText() # c2.toText() # c3.toText();
    let prefix = switch codeType {
      case (#DAPT) "DAPT";
      case (#DFAM) "DFAM";
      case (#DWCH) "DWCH";
      case (#DFND) "DFND";
    };
    let codeStr = prefix # "-" # suffix;

    let entry : Types.InviteCode = {
      code               = codeStr;
      codeType           = codeType;
      issuerPrincipal    = caller;
      recipientPrincipal = null;
      createdAt          = now;
      expiresAt          = now + 86_400_000_000_000;
      revoked            = false;
      used               = false;
      redeemedAt         = null;
      context            = context;
    };
    inviteCodes.add(codeStr, entry);

    // Increment apartment counter for DAPT/DWCH
    switch codeType {
      case (#DAPT or #DWCH) {
        let aptId = switch context { case (?id) id; case null "" };
        let current = switch (codeCounterByApartment.get(aptId)) {
          case (?n) n;
          case null 0;
        };
        codeCounterByApartment.add(aptId, current + 1);
      };
      case _ {};
    };

    #ok(codeStr);
  };

  /// Validate and redeem an invite code; assign the resulting role.
  public func redeemInviteCode(
    inviteCodes            : Map.Map<Text, Types.InviteCode>,
    codeCounterByApartment : Map.Map<Text, Nat>,
    roleMap                : Map.Map<Principal, List.List<Types.Role>>,
    bruteForceLockMap      : Map.Map<Principal, Types.BruteForceLockState>,
    caller                 : Principal,
    code                   : Text,
    now                    : Int,
  ) : Types.RedeemResult {
    // Brute-force lockout check
    let lockState = switch (bruteForceLockMap.get(caller)) {
      case (?s) s;
      case null {
        let fresh : Types.BruteForceLockState = { var attemptCount = 0; var lockUntil = null };
        bruteForceLockMap.add(caller, fresh);
        fresh;
      };
    };
    switch (lockState.lockUntil) {
      case (?until) {
        if (now < until) {
          return #bruteForceLocked;
        } else {
          // Lock window passed — reset
          lockState.attemptCount := 0;
          lockState.lockUntil    := null;
        };
      };
      case null {};
    };

    // Look up code
    switch (inviteCodes.get(code)) {
      case null {
        // Failed attempt
        lockState.attemptCount := lockState.attemptCount + 1;
        if (lockState.attemptCount >= 5) {
          lockState.lockUntil    := ?(now + 900_000_000_000);
          lockState.attemptCount := 0;
        };
        return #notFound;
      };
      case (?entry) {
        if (entry.revoked) { return #revoked };
        if (entry.used)    { return #used };
        if (now > entry.expiresAt) { return #expired };

        // Assign role based on code type
        let assignedRole : Types.Role = switch (entry.codeType) {
          case (#DAPT) #Resident;
          case (#DFAM) #AdultMember;
          case (#DWCH) #Watchman;
          case (#DFND) #Employee;
        };
        assignRole(roleMap, caller, assignedRole);

        // Mark code as used
        let updated : Types.InviteCode = {
          entry with
          used               = true;
          recipientPrincipal = ?caller;
          redeemedAt         = ?now;
        };
        inviteCodes.add(entry.code, updated);

        // Decrement apartment counter for DAPT/DWCH on redemption
        switch (entry.codeType) {
          case (#DAPT or #DWCH) {
            let aptId = switch (entry.context) { case (?id) id; case null "" };
            let current = switch (codeCounterByApartment.get(aptId)) {
              case (?n) n;
              case null 0;
            };
            if (current > 0) {
              codeCounterByApartment.add(aptId, current - 1);
            };
          };
          case _ {};
        };

        // Reset brute-force counter on success
        lockState.attemptCount := 0;
        lockState.lockUntil    := null;

        #success(assignedRole);
      };
    };
  };

  /// Revoke a code immediately. Only the original issuer may revoke.
  public func revokeInviteCode(
    inviteCodes            : Map.Map<Text, Types.InviteCode>,
    codeCounterByApartment : Map.Map<Text, Nat>,
    caller                 : Principal,
    code                   : Text,
  ) : { #ok; #err : Text } {
    switch (inviteCodes.get(code)) {
      case null { #err("Code not found") };
      case (?entry) {
        if (entry.issuerPrincipal != caller) {
          return #err("Only the original issuer may revoke this code");
        };
        let updated : Types.InviteCode = { entry with revoked = true };
        inviteCodes.add(code, updated);

        // Decrement apartment counter for DAPT/DWCH on revocation
        switch (entry.codeType) {
          case (#DAPT or #DWCH) {
            let aptId = switch (entry.context) { case (?id) id; case null "" };
            let current = switch (codeCounterByApartment.get(aptId)) {
              case (?n) n;
              case null 0;
            };
            if (current > 0) {
              codeCounterByApartment.add(aptId, current - 1);
            };
          };
          case _ {};
        };

        #ok;
      };
    };
  };

  /// Return non-expired, non-revoked, non-used codes for an apartment.
  public func getActiveCodesByApartment(
    inviteCodes : Map.Map<Text, Types.InviteCode>,
    apartmentId : Text,
    now         : Int,
  ) : [Types.InviteCode] {
    let result = List.empty<Types.InviteCode>();
    for ((_, entry) in inviteCodes.entries()) {
      let matchesApt = switch (entry.context) {
        case (?id) id == apartmentId;
        case null  false;
      };
      if (matchesApt and not entry.revoked and not entry.used and entry.expiresAt > now) {
        result.add(entry);
      };
    };
    result.toArray();
  };

  /// Return the usage log entry for a specific code, if it exists.
  public func getUsageLog(
    inviteCodes : Map.Map<Text, Types.InviteCode>,
    code        : Text,
  ) : ?Types.UsageLogEntry {
    switch (inviteCodes.get(code)) {
      case null null;
      case (?entry) {
        ?{
          codeValue   = entry.code;
          generatedBy = entry.issuerPrincipal;
          generatedAt = entry.createdAt;
          redeemedBy  = entry.recipientPrincipal;
          redeemedAt  = entry.redeemedAt;
        };
      };
    };
  };

  // ==================== Founder Initialisation ====================

  /// Attempt to claim the Founder role.
  /// Succeeds only when: no Founder yet registered, caller is authenticated,
  /// and current time is within FOUNDER_CLAIM_WINDOW_NS of deployTime.
  public func initFounder(
    roleMap : Map.Map<Principal, List.List<Types.Role>>,
    founderClaimed : { var claimed : Bool },
    caller : Principal,
    deployTime : Int,
    now : Int,
  ) : Types.InitFounderResult {
    if (founderClaimed.claimed) {
      return #err(#AlreadyClaimed);
    };
    if (caller.isAnonymous()) {
      return #err(#NotAuthenticated);
    };
    if (now - deployTime > FOUNDER_CLAIM_WINDOW_NS) {
      return #err(#WindowExpired);
    };
    assignRole(roleMap, caller, #Founder);
    founderClaimed.claimed := true;
    #ok;
  };

};
