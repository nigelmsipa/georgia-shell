

# Two-Tier Launcher System

The core insight: you have two different intents when launching apps, and they deserve two different UIs.

## The Problem

The current launcher tries to be both a quick app-picker and a full search surface. The transient floating panel causes anxiety because accidental taps dismiss it, losing your place. Meanwhile, the swipe-up gesture from the bottom feels wrong for summoning an overlay that appears in the center.

## The Solution: Two Launchers

### Tier 1 — Quick Launcher (via Edge Panel)

Repurpose the existing edge panel into the primary quick launcher. Trigger: tap the right-edge tab (already exists) or swipe inward from the right edge.

- Keep it as a compact, right-anchored floating panel
- Add the Niagara-style alphabet scrubber vertically along its left edge
- Show pinned/recent apps at top, full alphabetical list below
- This is inherently non-anxious because it's small, anchored to an edge, and feels like a sidebar — not something that will vanish if you breathe wrong
- Dismissal: only via explicit scrim tap or swipe-right, not accidental touches inside the panel

### Tier 2 — Power Launcher (full rofi-style)

The current floating overlay becomes the "power mode" — summoned deliberately via a different gesture (swipe-up from bottom keeps this one, or double-tap the edge tab).

- Full blurred scrim, centered floating panel
- Search box that can find apps, but also acts as a command line (future: definitions, calculations, web search)
- Grouped alphabetical list with scrubber
- This one is okay being more dominant because you summoned it intentionally for a power task
- Add a subtle "pinned" feel: tapping the scrim shows a brief "closing..." fade so it doesn't feel instant/jarring

### Gesture Mapping

```text
Swipe up from bottom  →  Power Launcher (full overlay)
Tap right-edge tab    →  Quick Launcher (edge panel)
```

## Technical Changes

### 1. Enhance EdgePanel.tsx → QuickLauncher

- Add full ALL_APPS alphabetical list below pinned apps
- Add alphabet scrubber rail on the left side of the panel
- Widen panel slightly (210px → 260px) to fit scrubber + list
- Increase max-height to fill more vertical space
- Add keyboard support (arrow keys, enter, escape)
- Keep the anchored-right positioning — this is what makes it feel stable

### 2. Rename and refine Launcher.tsx → PowerLauncher

- Keep current floating overlay design
- Add a 150ms fade-out delay on scrim tap so dismissal feels intentional, not accidental
- Change placeholder text from "launch" to "search anything"
- Future-proof the search to accept commands beyond just app names

### 3. Update Shell.tsx

- Swipe-up from home → opens Power Launcher (unchanged)
- Edge tab tap → opens enhanced Quick Launcher (the edge panel)
- Remove redundancy: the edge panel and quick launcher become the same thing
- Keep the home screen blur effect for the Power Launcher only; the Quick Launcher is a sidebar overlay that doesn't need full-screen blur

### 4. Reduce dismissal anxiety on Power Launcher

- On scrim click, add a brief opacity transition (200ms) before unmounting
- Prevent dismissal if the user's pointer started inside the panel (drag that accidentally exits)
- Add a small "x" or "esc" hint in the corner so there's an explicit close affordance

