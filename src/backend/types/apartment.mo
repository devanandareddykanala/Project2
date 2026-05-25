import Principal "mo:core/Principal";

module {

  // ==================== ID Types ====================

  public type ApartmentId = Nat;
  public type FlatId      = Nat;

  // ==================== Apartment ====================

  public type ApartmentStatus = {
    #PendingApproval;
    #Active;
    #Rejected;
  };

  public type Apartment = {
    id              : ApartmentId;
    name            : Text;
    address         : Text;
    totalFlats      : Nat;
    contactDetails  : Text;
    founderPrincipal: Principal;
    status          : ApartmentStatus;
    createdAt       : Int;
    requestedAt     : Int;
    approvedAt      : ?Int;
    expiresAt       : Int;
  };

  // ==================== Flat ====================

  public type Flat = {
    id          : FlatId;
    apartmentId : ApartmentId;
    flatNumber  : Text;
    details     : Text;
    createdAt   : Int;
  };

  // ==================== Roles ====================

  public type ApartmentRole = {
    #SuperAdmin;
    #FlatAdmin;
    #Resident;
  };

  public type ApartmentRoleEntry = {
    principal   : Principal;
    role        : ApartmentRole;
    apartmentId : ApartmentId;
    flatId      : ?FlatId;
    assignedAt  : Int;
    assignedBy  : Principal;
  };

  // ==================== Audit ====================

  public type AuditEntry = {
    id          : Nat;
    action      : Text;
    principal   : Principal;
    apartmentId : ApartmentId;
    flatId      : ?FlatId;
    details     : Text;
    timestamp   : Int;
  };

  // ==================== Result Types ====================

  public type CreateApartmentResult = {
    #ok  : ApartmentId;
    #err : Text;
  };

  public type ApproveApartmentResult = {
    #ok;
    #err : Text;
  };

  public type CreateFlatResult = {
    #ok  : FlatId;
    #err : Text;
  };

  public type AssignRoleResult = {
    #ok;
    #err : Text;
  };

};
