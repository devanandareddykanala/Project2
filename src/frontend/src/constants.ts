export const APP_NAME = "Develvyn -- The Family Suite";
export const APP_SHORT_NAME = "Develvyn";

export const MOODS = [
  { emoji: "😊", label: "Happy" },
  { emoji: "😢", label: "Sad" },
  { emoji: "😡", label: "Angry" },
  { emoji: "😴", label: "Tired" },
  { emoji: "🤩", label: "Excited" },
  { emoji: "😐", label: "Neutral" },
];

export const COLORS = [
  "#3B82F6",
  "#EC4899",
  "#8B5CF6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#06B6D4",
  "#84CC16",
];

export const AVATARS = ["👨", "👩", "👧", "👦", "👴", "👵", "🧑", "👶"];

export const CATEGORIES = [
  "Produce",
  "Dairy",
  "Meat",
  "Bakery",
  "Pantry",
  "Beverages",
  "Frozen",
  "Other",
];

export type TabId =
  | "dashboard"
  | "family"
  | "mood"
  | "calendar"
  | "chores"
  | "meals"
  | "shopping"
  | "settings";

export const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "dashboard", label: "Home", icon: "🏠" },
  { id: "family", label: "Family", icon: "👨‍👩‍👧‍👦" },
  { id: "chores", label: "Chores", icon: "✅" },
  { id: "mood", label: "Mood", icon: "😊" },
  { id: "calendar", label: "Calendar", icon: "📅" },
  { id: "meals", label: "Meals", icon: "🍽️" },
  { id: "shopping", label: "Shopping", icon: "🛒" },
  { id: "settings", label: "Settings", icon: "⚙️" },
];
