

# Hevel — Mobile Shell UI Prototype

A complete phone shell experience rendered inside a phone-shaped frame (390×844px), using Georgia serif exclusively, Gruvbox theming, and gesture-driven navigation with no icons anywhere.

## Design System
- **Gruvbox Dark & Light themes** with toggle, all colors as specified
- **Georgia serif only** — every text element
- **No icons, no wallpaper, no bottom nav, no shadows** (except floating edge panel)
- Animations: ease-out on open, ease-in on close, physical feel

## Screens

### 1. Home Screen
- Large clock hero (HH:MM) in Georgia at top
- 2×2 grid of "cover cards" — colored placeholder cards with app name text representing recent app screenshots
- Drag-up gesture zone at bottom to open launcher
- Theme toggle (small, top-right corner)
- Swipe left → notifications pane

### 2. Launcher (full-screen overlay)
- Slides up from bottom with blurred backdrop scrim
- Search bar at top with live filtering
- Alphabetical app list with letter group headers (A, B, C…)
- Right-side alphabet scrubber rail (tap/drag to jump, active letter in teal)
- 19 apps as specified (Calendar through Weather)
- Drag/flick down to dismiss

### 3. App Switcher
- Triggered via "recent apps" button (simulating hold-swipe gesture)
- Vertical list: app name (large) + time-ago (subdued) per row
- Swipe-left to close: reveals red layer, commit = animate out, partial = snap back
- Right-side dot scrubber (focused dot larger + teal)
- Tap row = highlight/focus, "Clear all" text at bottom

### 4. Notifications (horizontal pane)
- Swipe left from home to access, swipe right to return
- Vertical list of notification cards (app name + body + time-ago)
- Swipe-left to dismiss individual cards
- "Clear all" at top, "nothing here" empty state

### 5. Edge Panel (floating switcher)
- Thin tab on right edge, mid-height — tap or swipe to open
- ~210px floating panel anchored top-right with dimmed scrim
- "switch to" ghost label, pinned/recent apps list, search field
- Tap app = fullscreen "app running" overlay
- Tap scrim to dismiss

### 6. App Running Overlay
- Fullscreen flat bg with app name centered large in Georgia
- "← back" text tap to dismiss
- Triggered from any app tap across all screens

## Component Architecture
- `PhoneFrame` — 390×844 container with overflow hidden
- `ThemeProvider` — Gruvbox dark/light context
- `HomeScreen` — clock, cover cards, gesture zones
- `Launcher` — overlay with app list, scrubber, search
- `AppSwitcher` — swipeable list with dot scrubber
- `NotificationsPane` — horizontal pager from home
- `EdgePanel` — floating overlay with scrim
- `AppOverlay` — fullscreen app-running state

## Gesture Simulation
- Touch/pointer events for drag-up (launcher), swipe-left (notifications, dismiss), swipe-right (snap back)
- CSS transitions for all state changes with appropriate easing

