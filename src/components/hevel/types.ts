export const ALL_APPS = [
  "Calendar", "Calculator", "Camera", "Clock", "Contacts",
  "Files", "Firefox", "Gallery", "KOReader", "Maps",
  "Messages", "Music", "Notes", "Settings", "Signal",
  "Spotify", "Telegram", "Terminal", "Weather",
];

export interface AppEntry {
  name: string;
  lastUsed: number; // minutes ago
}

export interface Notification {
  id: string;
  app: string;
  body: string;
  timeAgo: string;
}

export const RECENT_APPS: AppEntry[] = [
  { name: "Firefox", lastUsed: 2 },
  { name: "Terminal", lastUsed: 8 },
  { name: "Signal", lastUsed: 15 },
  { name: "Notes", lastUsed: 34 },
  { name: "Spotify", lastUsed: 60 },
  { name: "Maps", lastUsed: 120 },
];

export const COVER_APPS = ["Firefox", "Terminal", "Signal", "Notes"];

export const COVER_COLORS = [
  "bg-gruvbox-orange",
  "bg-gruvbox-green",
  "bg-gruvbox-teal",
  "bg-gruvbox-yellow",
];

export const SAMPLE_NOTIFICATIONS: Notification[] = [
  { id: "1", app: "Signal", body: "New message from Alex", timeAgo: "3m" },
  { id: "2", app: "Calendar", body: "Meeting with design team in 30 min", timeAgo: "12m" },
  { id: "3", app: "Telegram", body: "2 new messages in Linux group", timeAgo: "28m" },
  { id: "4", app: "Weather", body: "Rain expected this afternoon", timeAgo: "1h" },
  { id: "5", app: "Firefox", body: "Download complete: kernel-6.8.tar.xz", timeAgo: "2h" },
];
