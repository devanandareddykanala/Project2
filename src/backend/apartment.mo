import Map "mo:core/Map";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Array "mo:core/Array";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Text "mo:core/Text";
import T "types/apartment";

/// Apartment canister — composition root for the Apartment domain.
/// Owns all persistent state; enforces role checks at canister level.
/// State persists via enhanced orthogonal persistence (no stable var needed).
actor Apartment {

  // ==================== Persistent State ====================

  /// Principal of the Founder — set once on first call.
  let founderState = { var principal : ?Principal = null };

  /// All apartment records keyed by ApartmentId.
  let apartments : Map.Map<T.ApartmentId, T.Apartment> =
    Map.empty<T.ApartmentId, T.Apartment>();

  /// All flat records keyed by FlatId.
  let flats : Map.Map<T.FlatId, T.Flat> =
    Map.empty<T.FlatId, T.Flat>();

  /// Role entries keyed by a monotonic Nat counter.
  let apartmentRoles : Map.Map<Nat, T.ApartmentRoleEntry> =
    Map.empty<Nat, T.ApartmentRoleEntry>();

  /// Audit log entries keyed by audit entry id.
  let auditLog : Map.Map<Nat, T.AuditEntry> =
    Map.empty<Nat, T.AuditEntry>();

  /// Monotonically increasing counters.
  let counters = {
    var nextApartmentId : Nat = 0;
    var nextFlatId      : Nat = 0;
    var nextAuditId     : Nat = 0;
    var nextRoleId      : Nat = 0;
  };

  // ==================== Private Helpers ====================

  func isFounder(caller : Principal) : Bool {
    switch (founderState.principal) {
      case null false;
      case (?fp) Principal.equal(fp, caller);
    }
  };

  func hasRoleInApartment(caller : Principal, aptId : T.ApartmentId) : Bool {
    for (entry in apartmentRoles.values()) {
      if (Principal.equal(entry.principal, caller) and entry.apartmentId == aptId) {
        return true;
      };
    };
    false;
  };

  func isRoleInApartment(caller : Principal, aptId : T.ApartmentId, role : T.ApartmentRole) : Bool {
    for (entry in apartmentRoles.values()) {
      if (Principal.equal(entry.principal, caller) and entry.apartmentId == aptId) {
        switch (role) {
          case (#SuperAdmin) {
            switch (entry.role) {
              case (#SuperAdmin) return true;
              case _ {};
            };
          };
          case (#FlatAdmin) {
            switch (entry.role) {
              case (#SuperAdmin) return true;
              case (#FlatAdmin)  return true;
              case _ {};
            };
          };
          case (#Resident) return true;
        };
      };
    };
    false;
  };

  func addAudit(
    action  : Text,
    caller  : Principal,
    aptId   : T.ApartmentId,
    flatId  : ?T.FlatId,
    details : Text,
  ) {
    let id = counters.nextAuditId;
    counters.nextAuditId += 1;
    let entry : T.AuditEntry = {
      id;
      action;
      principal   = caller;
      apartmentId = aptId;
      flatId;
      details;
      timestamp   = Time.now();
    };
    auditLog.add(id, entry);
  };

  // ==================== Founder Bootstrap ====================

  /// Set the Founder principal once. Silently ignored if already set.
  public shared ({ caller }) func setFounderPrincipal(p : Principal) : async () {
    switch (founderState.principal) {
      case null { founderState.principal := ?p };
      case _ {}; // already set
    };
  };

  // ==================== Apartment Requests ====================

  /// Request creation of a new apartment. Requires Founder approval within 48 hours.
  /// Caller becomes the pending Super Admin on approval.
  public shared ({ caller }) func requestApartmentCreation(
    name           : Text,
    address        : Text,
    totalFlats     : Nat,
    contactDetails : Text,
  ) : async T.CreateApartmentResult {
    if (caller.isAnonymous()) return #err "Not authenticated";
    if (name.size() == 0 or address.size() == 0) return #err "Name and address required";
    let id  = counters.nextApartmentId;
    counters.nextApartmentId += 1;
    let now = Time.now();
    let fortyEightHoursNs : Int = 172_800_000_000_000;
    let apt : T.Apartment = {
      id;
      name;
      address;
      totalFlats;
      contactDetails;
      founderPrincipal = caller;
      status           = #PendingApproval;
      createdAt        = now;
      requestedAt      = now;
      approvedAt       = null;
      expiresAt        = now + fortyEightHoursNs;
    };
    apartments.add(id, apt);
    addAudit("ApartmentCreationRequested", caller, id, null, name);
    #ok id;
  };

  /// Approve a pending apartment creation request. Caller must be the Founder.
  /// Approval window is 48 hours from request time; expired requests are rejected.
  public shared ({ caller }) func approveApartmentCreation(
    apartmentId : T.ApartmentId,
  ) : async T.ApproveApartmentResult {
    if (not isFounder(caller)) return #err "Unauthorized";
    switch (apartments.get(apartmentId)) {
      case null { #err "Not found" };
      case (?apt) {
        switch (apt.status) {
          case (#PendingApproval) {};
          case _ { return #err "Not pending" };
        };
        if (Time.now() > apt.expiresAt) return #err "Request expired";
        let roleEntry : T.ApartmentRoleEntry = {
          principal   = apt.founderPrincipal;
          role        = #SuperAdmin;
          apartmentId;
          flatId      = null;
          assignedAt  = Time.now();
          assignedBy  = caller;
        };
        let roleId = counters.nextRoleId;
        counters.nextRoleId += 1;
        apartmentRoles.add(roleId, roleEntry);
        let updated : T.Apartment = { apt with status = #Active; approvedAt = ?Time.now() };
        apartments.add(apartmentId, updated);
        addAudit("ApartmentApproved", caller, apartmentId, null, "");
        #ok;
      };
    };
  };

  /// Return all apartments whose status is #PendingApproval. Founder-only.
  public shared ({ caller }) func getPendingApartmentRequests() : async [T.Apartment] {
    if (not isFounder(caller)) return [];
    apartments.values().filter(func(apt : T.Apartment) : Bool {
      apt.status == #PendingApproval
    }).toArray();
  };

  /// Return the apartment record for the given id, or null if not found.
  /// Caller must be Founder or hold any role in the target apartment.
  public shared ({ caller }) func getApartment(
    apartmentId : T.ApartmentId,
  ) : async ?T.Apartment {
    if (not (isFounder(caller) or hasRoleInApartment(caller, apartmentId))) return null;
    apartments.get(apartmentId);
  };

  // ==================== Flat Management ====================

  /// Create a new flat within an apartment. Caller must be Super Admin of that apartment.
  public shared ({ caller }) func createFlat(
    apartmentId : T.ApartmentId,
    flatNumber  : Text,
    details     : Text,
  ) : async T.CreateFlatResult {
    if (not isRoleInApartment(caller, apartmentId, #SuperAdmin)) return #err "Unauthorized";
    if (flatNumber.size() == 0) return #err "Flat number required";
    let id = counters.nextFlatId;
    counters.nextFlatId += 1;
    let flat : T.Flat = {
      id;
      apartmentId;
      flatNumber;
      details;
      createdAt = Time.now();
    };
    flats.add(id, flat);
    addAudit("FlatCreated", caller, apartmentId, ?id, flatNumber);
    #ok id;
  };

  /// Return all flats belonging to the given apartment.
  /// Caller must be Founder or hold any role in the apartment.
  public shared ({ caller }) func getFlats(
    apartmentId : T.ApartmentId,
  ) : async [T.Flat] {
    if (not (isFounder(caller) or hasRoleInApartment(caller, apartmentId))) return [];
    flats.values().filter(func(f : T.Flat) : Bool {
      f.apartmentId == apartmentId
    }).toArray();
  };

  // ==================== Role Assignment ====================

  /// Assign an ApartmentRole to a principal within an apartment (and optionally a flat).
  /// Caller must be Founder or Super Admin of the apartment.
  public shared ({ caller }) func assignRole(
    principal   : Principal,
    role        : T.ApartmentRole,
    apartmentId : T.ApartmentId,
    flatId      : ?T.FlatId,
  ) : async T.AssignRoleResult {
    if (not (isFounder(caller) or isRoleInApartment(caller, apartmentId, #SuperAdmin))) {
      return #err "Unauthorized";
    };
    let entry : T.ApartmentRoleEntry = {
      principal;
      role;
      apartmentId;
      flatId;
      assignedAt = Time.now();
      assignedBy = caller;
    };
    let roleId = counters.nextRoleId;
    counters.nextRoleId += 1;
    apartmentRoles.add(roleId, entry);
    addAudit("RoleAssigned", caller, apartmentId, flatId, debug_show(role));
    #ok;
  };

  /// Return all ApartmentRoleEntries assigned to the calling principal.
  public shared ({ caller }) func getMyRoles() : async [T.ApartmentRoleEntry] {
    apartmentRoles.values().filter(func(e : T.ApartmentRoleEntry) : Bool {
      Principal.equal(e.principal, caller)
    }).toArray();
  };

  /// Return all role entries for a given apartment. Caller must be Founder or Super Admin.
  public shared ({ caller }) func getRolesByApartment(
    apartmentId : T.ApartmentId,
  ) : async [T.ApartmentRoleEntry] {
    if (not (isFounder(caller) or isRoleInApartment(caller, apartmentId, #SuperAdmin))) return [];
    apartmentRoles.values().filter(func(e : T.ApartmentRoleEntry) : Bool {
      e.apartmentId == apartmentId
    }).toArray();
  };

  // ==================== Resident Visibility ====================

  /// Return residents of a flat (principal + placeholder name).
  /// Caller must be Founder or hold any role in the apartment.
  /// Returns only principal and name — no financial data.
  public shared ({ caller }) func getFlatResidents(
    apartmentId : T.ApartmentId,
    flatId      : T.FlatId,
  ) : async [{ principal : Principal; name : Text }] {
    if (not (isFounder(caller) or hasRoleInApartment(caller, apartmentId))) return [];
    apartmentRoles.values().filter(
      func(e : T.ApartmentRoleEntry) : Bool {
        e.apartmentId == apartmentId and
        (switch (e.role) { case (#Resident) true; case _ false }) and
        e.flatId == ?flatId
      }
    ).map<T.ApartmentRoleEntry, { principal : Principal; name : Text }>(
      func(e : T.ApartmentRoleEntry) : { principal : Principal; name : Text } {
        { principal = e.principal; name = "Resident" }
      }
    ).toArray();
  };

  // ==================== Audit Log ====================

  /// Return the audit log for an apartment sorted newest-first.
  /// Caller must be Founder or Super Admin.
  public shared ({ caller }) func getAuditLog(
    apartmentId : T.ApartmentId,
  ) : async [T.AuditEntry] {
    if (not (isFounder(caller) or isRoleInApartment(caller, apartmentId, #SuperAdmin))) return [];
    auditLog.values().filter(
      func(e : T.AuditEntry) : Bool { e.apartmentId == apartmentId }
    ).toArray().sort(func(a : T.AuditEntry, b : T.AuditEntry) : { #less; #equal; #greater } {
      Int.compare(b.timestamp, a.timestamp)
    });
  };

};
