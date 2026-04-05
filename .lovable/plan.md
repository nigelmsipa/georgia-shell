

# Prose App Launcher — Reimagined

## The Vision

A launcher with three clear zones, all rendered in the project's serif-driven, text-first aesthetic. No icons. No grids. Just typography with purpose.

```text
┌─────────────────────────┐
│                         │
│  ★ Firefox  Terminal    │  ← Favorites (persistent top row)
│    Signal   Notes       │
│                         │
│─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─│
│                         │
│  Also around:           │  ← Prose body (contextual text
│  Calendar, Camera,      │     with launchable app tokens,
│  Clock, Contacts,       │     weighted by recency)
│  Files, Gallery...      │
│                         │
│─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─│
│                         │
│  A B C D E F G H I ... │  ← Horizontal letter scrubber
│  ──────●────────────    │     (drag/tap to jump)
│                         │
│        search...        │  ← Ghost search input
└─────────────────────────┘
```

## Three Zones

### 1. Favorites Strip (top)
- A small cluster of 3-4 pinned apps displayed as bold, slightly larger serif tokens — styled like the Control Center's `Token` component but as app names.
- Uses `COVER_APPS` from types.ts as the favorites list.
- Subtle separator (hairline, `primary / 0.1`) below.

### 2. Prose App Body (middle, scrollable)
- Reuse the existing `buildProse` logic that weaves remaining apps into natural sentences ("Also around: Calendar, Camera, Clock...").
- Each app name is an interactive `AppToken` — tappable, with the flash effect, italic serif, dotted underline.
- When the scrubber is active, the prose body scrolls/highlights to show apps starting with that letter. Apps matching the active letter get emphasized (full opacity), others dim.
- When search is active, non-matching apps fade out in-place rather than disappearing — the prose structure stays intact but irrelevant tokens become ghostly.

### 3. Horizontal Letter Scrubber (bottom)
- A single horizontal row of A-Z letters in small serif text.
- Letters with available apps are brighter; unavailable letters are nearly invisible.
- Tap a letter: scrolls the prose body and highlights matching apps.
- Drag across: scrubs through letters continuously (using `onPointerMove` with `buttons > 0`, same pattern as the existing vertical scrubber in `Launcher.tsx`).
- Active letter gets a subtle scale bump and primary color.
- Below the scrubber, a minimal ghost search input (hairline underline, no border, serif placeholder "search...").

## Technical Plan

### File: `src/components/hevel/ProseLauncher.tsx` (rewrite)

1. **State**: Add `activeLetter`, `search`, `closing` state. Keep `buildProse` but modify it to exclude favorites from the prose paragraphs (they're shown separately at top).

2. **Favorites section**: Render `COVER_APPS` as a horizontal wrap of bold `AppToken` components at the top of the panel, separated by thin hairline from the prose body.

3. **Prose body**: Keep the existing fragment-based rendering. Add a `data-app` attribute to each `AppToken` wrapper so the scrubber can scroll to it. When `activeLetter` is set, tokens not starting with that letter get `opacity: 0.15`. When `search` is active, non-matching tokens get the same dim treatment.

4. **Horizontal scrubber**: Render `A-Z` in a horizontal flex row with `touch-action: none`. Use `onPointerDown` and `onPointerMove` (same pattern as existing scrubbers) to calculate which letter is under the pointer based on x-position. Set `activeLetter` on scrub, and scroll the first matching `[data-app]` element into view.

5. **Search input**: A ghost-style input below the scrubber — transparent background, serif font, hairline underline, placeholder "search...". Typing filters which tokens are highlighted in the prose (dimming non-matches rather than removing them).

6. **Overlay styling**: Keep the existing blurred scrim (`blur(32px)`, `background / 0.82`) and the centered content layout. The content area gets `overflow-y: auto` on the prose section only, with favorites and scrubber fixed.

### File: `src/components/hevel/types.ts`
- No changes needed. `COVER_APPS` already serves as the favorites list; `ALL_APPS` and `RECENT_APPS` provide the data.

### File: `src/components/hevel/Shell.tsx`
- No structural changes — the `prose` trigger tab already exists and wires to `ProseLauncher`.

