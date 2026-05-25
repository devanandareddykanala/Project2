import type { backendInterface } from "../backend";

const now = BigInt(Date.now()) * BigInt(1_000_000);

const sampleMembers = [
  {
    id: BigInt(0),
    familyId: BigInt(0),
    name: "Sarah Johnson",
    color: "#2E7D32",
    avatarEmoji: "👩",
    role: "admin",
    principal: undefined,
    inviteCode: undefined,
    isLinked: true,
    createdAt: now,
  },
  {
    id: BigInt(1),
    familyId: BigInt(0),
    name: "David Johnson",
    color: "#1565C0",
    avatarEmoji: "👨",
    role: "member",
    principal: undefined,
    inviteCode: undefined,
    isLinked: true,
    createdAt: now,
  },
];

const sampleEvents = [
  {
    id: BigInt(0),
    title: "Family Dinner",
    description: "Monthly family dinner",
    startDate: now + BigInt(86_400_000_000_000),
    endDate: now + BigInt(86_400_000_000_000) + BigInt(3_600_000_000_000),
    memberIds: [BigInt(0), BigInt(1)],
    eventType: "family",
    createdAt: now,
  },
];

const sampleChores = [
  {
    id: BigInt(0),
    title: "Groceries",
    description: "Weekly grocery shopping",
    assignedTo: BigInt(1),
    dueDate: now + BigInt(86_400_000_000_000),
    isCompleted: false,
    recurrence: "weekly",
    createdAt: now,
  },
];

const sampleShoppingItems = [
  {
    id: BigInt(0),
    name: "Milk",
    quantity: "2L",
    category: "Dairy",
    addedBy: BigInt(0),
    isCompleted: false,
    createdAt: now,
  },
];

const sampleMoodEntries = [
  {
    id: BigInt(0),
    memberId: BigInt(0),
    mood: "happy",
    note: "Great day!",
    date: now,
    createdAt: now,
  },
];

const sampleMealOptions = [
  {
    id: BigInt(0),
    name: "Pasta Primavera",
    description: "Fresh vegetable pasta",
    proposedBy: BigInt(0),
    scheduledDate: now + BigInt(86_400_000_000_000),
    votes: [BigInt(0), BigInt(1)],
    isSelected: true,
    createdAt: now,
  },
];

export const mockBackend: backendInterface = {
  addCalendarEvent: async () => BigInt(1),
  addChore: async () => BigInt(1),
  addFamilyMemberWithInvite: async () => ({ memberId: BigInt(2), inviteCode: "DFAM-XXXX" }),
  addMealOption: async () => BigInt(1),
  addMoodEntry: async () => BigInt(1),
  addShoppingItem: async () => BigInt(1),
  clearAllData: async () => true,
  clearCompletedShoppingItems: async () => BigInt(0),
  createFamily: async () => ({ memberId: BigInt(0), familyId: BigInt(0) }),
  deleteCalendarEvent: async () => true,
  deleteChore: async () => true,
  deleteFamilyMember: async () => true,
  deleteMealOption: async () => true,
  deleteMoodEntry: async () => true,
  deleteShoppingItem: async () => true,
  generateSampleData: async () => ({
    members: sampleMembers,
    shoppingItems: sampleShoppingItems,
    moodEntries: sampleMoodEntries,
    mealOptions: sampleMealOptions,
    events: sampleEvents,
    chores: sampleChores,
  }),
  getAllCalendarEvents: async () => sampleEvents,
  getAllChores: async () => sampleChores,
  getAllFamilyMembers: async () => sampleMembers,
  getAllMealOptions: async () => sampleMealOptions,
  getAllMoodEntries: async () => sampleMoodEntries,
  getAllShoppingItems: async () => sampleShoppingItems,
  getCalendarEventsByDateRange: async () => sampleEvents,
  getCalendarEventsByMember: async () => sampleEvents,
  getChoresByMember: async () => sampleChores,
  getDataCounts: async () => ({
    meals: BigInt(1),
    members: BigInt(2),
    shoppingItems: BigInt(1),
    moodEntries: BigInt(1),
    events: BigInt(1),
    chores: BigInt(1),
  }),
  getFamilyMember: async () => sampleMembers[0],
  getInviteDetails: async () => ({
    familyName: "Johnson Family",
    memberColor: "#2E7D32",
    memberName: "Sarah",
    memberAvatarEmoji: "👩",
  }),
  getMealAttendanceForDate: async () => [],
  getMealOptionsByDate: async () => sampleMealOptions,
  getMemberAttendance: async () => null,
  getMoodEntriesByDateRange: async () => sampleMoodEntries,
  getMoodEntriesByMember: async () => sampleMoodEntries,
  getMyFamily: async () => ({
    id: BigInt(0),
    adminPrincipal: { toString: () => "aaaaa-aa", toText: () => "aaaaa-aa", isAnonymous: () => false, compareTo: () => ({ __kind__: "equal" }), hash: () => BigInt(0) } as any,
    name: "Johnson Family",
    createdAt: now,
  }),
  getMyFamilyStatus: async () => ({
    __kind__: "FamilyAdmin",
    FamilyAdmin: { memberId: BigInt(0), familyId: BigInt(0) },
  }),
  getMyMember: async () => sampleMembers[0],
  getShoppingItemsByCategory: async () => sampleShoppingItems,
  isAdmin: async () => true,
  joinFamilyWithCode: async () => ({ memberId: BigInt(1), familyId: BigInt(0) }),
  regenerateInviteCode: async () => "DFAM-NEWC",
  selectMeal: async () => sampleMealOptions[0],
  setMealAttendance: async () => ({ memberId: BigInt(0), date: now, attending: true }),
  toggleChoreComplete: async () => ({ ...sampleChores[0], isCompleted: true }),
  toggleShoppingItemComplete: async () => ({ ...sampleShoppingItems[0], isCompleted: true }),
  updateCalendarEvent: async () => sampleEvents[0],
  updateChore: async () => sampleChores[0],
  updateFamilyMember: async () => sampleMembers[0],
  updateMemberRole: async () => sampleMembers[0],
  updateMoodEntry: async () => sampleMoodEntries[0],
  updateShoppingItem: async () => sampleShoppingItems[0],
  voteForMeal: async () => sampleMealOptions[0],
};
