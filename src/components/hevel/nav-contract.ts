/**
 * Georgia Shell — navigation & gesture reservation contract.
 * Single source of truth. 1 dp = 1 CSS px in this prototype.
 * All dimensions consumed by HevelBar, Shell (top edge), SidePill,
 * the dev gesture overlay, and the /spec reference sheet.
 */

export const NAV_ZONE_HEIGHT_DP = 48;   // reserved bottom rectangle
export const TOP_ZONE_HEIGHT_DP = 24;   // pull-down for control center
export const SIDE_ZONE_WIDTH_DP = 16;   // left edge for side-pill

export const SWIPE_UP_HOME_DP = 140;    // long swipe → home
export const SWIPE_UP_PEEK_DP = 40;     // short swipe → app switcher
export const SWIPE_SIDE_SCRUB_DP = 60;  // L/R app scrub threshold

export const PHONE_W_DP = 390;
export const PHONE_H_DP = 844;

export type GestureZoneId = "nav-bottom" | "top-edge" | "side-left";

export interface GestureZone {
  id: GestureZoneId;
  label: string;
  /** Anchor edge, drives absolute positioning */
  edge: "bottom" | "top" | "left";
  /** Nominal size in dp — the actual DOM node is measured live */
  w: number;
  h: number;
  /** Distinct hue for the dev overlay */
  hue: string; // hsl(var(--...))
}

export const GESTURE_ZONES: GestureZone[] = [
  { id: "nav-bottom", label: "nav zone",       edge: "bottom", w: PHONE_W_DP, h: NAV_ZONE_HEIGHT_DP, hue: "var(--primary)" },
  { id: "top-edge",   label: "control pull",   edge: "top",    w: PHONE_W_DP, h: TOP_ZONE_HEIGHT_DP, hue: "var(--accent)" },
  { id: "side-left",  label: "side pill zone", edge: "left",   w: SIDE_ZONE_WIDTH_DP, h: PHONE_H_DP * 0.2, hue: "var(--gruvbox-orange)" },
];

export const MAX_ZONE_DP = 200;

export const isDebugGesturesEnabled = (): boolean => {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  if (params.get("debug") === "gestures") return true;
  try { return window.localStorage.getItem("hevel_debug_gestures") === "1"; }
  catch { return false; }
};

export const setDebugGesturesEnabled = (on: boolean) => {
  try {
    if (on) window.localStorage.setItem("hevel_debug_gestures", "1");
    else window.localStorage.removeItem("hevel_debug_gestures");
  } catch { /* ignore */ }
};
