export const ALL_APPS = [
  "AI Chat", "Angelfish", "Calculator", "Camera", "Clock", "Contacts",
  "Files", "Gallery", "HavelTube", "KOReader", "Maps",
  "Messages", "Music", "Notes", "Settings", "Signal",
  "Spotify", "Telegram", "Terminal", "Weather",
];


export interface AppEntry {
  name: string;
  lastUsed: number; // minutes ago
}

/** A token inside a prose notification — either plain text or an interactive action */
export interface NoteToken {
  text: string;
  /** If set, this token is tappable */
  action?: "open" | "dismiss" | "snooze" | "reply" | "custom";
  /** If true, renders as primary-colored bold link */
  highlight?: boolean;
}

export interface ProseNotification {
  id: string;
  app: string;
  /** Structured prose — array of tokens that form a sentence */
  tokens: NoteToken[];
  timeAgo: string;
}

export const SAMPLE_NOTIFICATIONS: ProseNotification[] = [
  {
    id: "1",
    app: "Signal",
    tokens: [
      { text: "Alex" , highlight: true },
      { text: " sent you a message about " },
      { text: "tonight's plans", highlight: true, action: "open" },
      { text: "." },
    ],
    timeAgo: "3m",
  },
  {
    id: "2",
    app: "Calendar",
    tokens: [
      { text: "Design review", highlight: true },
      { text: " starts in " },
      { text: "30 minutes", highlight: true },
      { text: ". Room B — " },
      { text: "open", action: "open", highlight: true },
      { text: " or " },
      { text: "snooze", action: "snooze" },
      { text: "." },
    ],
    timeAgo: "12m",
  },
  {
    id: "3",
    app: "Mail",
    tokens: [
      { text: "A new email from " },
      { text: "Paperback Co.", highlight: true },
      { text: " about your " },
      { text: "recent order", highlight: true, action: "open" },
      { text: "." },
    ],
    timeAgo: "28m",
  },
  {
    id: "4",
    app: "Music",
    tokens: [
      { text: "Kind of Blue", highlight: true },
      { text: " paused at track 3. " },
      { text: "Resume", action: "open", highlight: true },
      { text: " or " },
      { text: "let it rest", action: "dismiss" },
      { text: "." },
    ],
    timeAgo: "1h",
  },
  {
    id: "5",
    app: "Weather",
    tokens: [
      { text: "Rain expected after " },
      { text: "4 pm", highlight: true },
      { text: ". You have an outdoor event at " },
      { text: "6 pm", highlight: true },
      { text: " — " },
      { text: "see forecast", action: "open", highlight: true },
      { text: " or " },
      { text: "dismiss", action: "dismiss" },
      { text: "." },
    ],
    timeAgo: "2h",
  },
  {
    id: "6",
    app: "Reminders",
    tokens: [
      { text: "You set a reminder to " },
      { text: "call the bank", highlight: true },
      { text: " today. " },
      { text: "Mark done", action: "dismiss", highlight: true },
      { text: " or " },
      { text: "move to tomorrow", action: "snooze" },
      { text: "." },
    ],
    timeAgo: "3h",
  },
];

export const RECENT_APPS: AppEntry[] = [
  { name: "Firefox", lastUsed: 2 },
  { name: "Terminal", lastUsed: 8 },
  { name: "Signal", lastUsed: 15 },
  { name: "Notes", lastUsed: 34 },
  { name: "Spotify", lastUsed: 60 },
  { name: "Maps", lastUsed: 120 },
];

export const DEFAULT_COVER_APPS = ["AI Chat", "HavelTube", "Music", "Signal"];

export const COVER_APPS = DEFAULT_COVER_APPS;


export const COVER_COLORS = [
  "bg-gruvbox-orange",
  "bg-gruvbox-green",
  "bg-gruvbox-teal",
  "bg-gruvbox-yellow",
];
