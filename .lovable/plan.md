

# Prose Launcher — Overlay Style

## The Problem
The current full-screen prose launcher takes over everything but feels sparse — lots of empty space with just a few comma-separated app names and a scrubber. It doesn't earn the real estate it claims.

## The Idea
Make it an **overlay panel** instead of full-screen. A compact, floating card that sits over the home screen (similar to how the Control Center works as a prose overlay). The scrubber and app content live in a tighter, more intentional space where every element feels purposeful rather than lost.

```text
┌──────────────────────────────┐
│  Home screen (blurred)       │
│                              │
│   ┌────────────────────┐     │
│   │ Firefox  Signal    │     │  ← Favorites row
│   │ Terminal Notes     │     │
│   │                    │     │
│   │       C            │  A  │  ← Big ghost letter + scrubber
│   │  Calendar,         │  B  │
│   │  Camera,           │  C● │
│   │  Clock,            │  D  │
│   │  Contacts          │  E  │
│   │                    │  …  │
│   │  search...         │     │
│   └────────────────────┘     │
│                              │
└──────────────────────────────┘
```

## What Changes

### Layout shift: full-screen → floating card
- Replace `absolute inset-0` content with a centered/positioned card panel
- Card gets `backdrop-filter: blur(20px)`, subtle border, rounded corners (20px)
- Background scrim stays but content is contained in a ~85% height, ~88% width card
- This makes the launcher feel like a tool you summon, not a mode you enter

### Tighter composition inside the card
- **Favorites**: Same bold serif tokens at top, but with less padding (px-6 instead of px-8)
- **App area + scrubber**: Scrubber stays on the right edge of the card. App display area uses the remaining space. The large ghost letter sits behind the app names as a watermark
- **Search**: Stays at the bottom of the card, same ghost input style

### Keep everything else
- Same VerticalScrubber with arc animation
- Same single-letter-at-a-time display
- Same dismiss/close behavior
- Same app token styling

## Technical Plan

### File: `src/components/hevel/ProseLauncher.tsx`

1. **Scrim**: Keep the blurred backdrop but reduce opacity slightly since the card itself has blur
2. **Content wrapper**: Change from `absolute inset-0` full layout to a centered card:
   - `mx-auto my-auto` or absolute positioning with insets
   - Width: ~92% of container, max reasonable width
   - Height: ~82% of container
   - Background: `hsl(var(--card) / 0.7)` with `backdrop-filter: blur(20px)`
   - Border: `1px solid hsl(var(--border) / 0.15)`
   - Border-radius: 20px
   - Subtle shadow for depth
3. **Internal layout**: Same flex-col structure but everything is more compact within the card boundaries
4. **Entry animation**: Card scales from 0.96 → 1 and fades in (instead of translateY)

No changes to Shell.tsx or types.ts.

