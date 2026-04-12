

# Gruvbox Glass Restyle

## Overview
Restyle the entire Hevel prototype to achieve a warm, translucent "Gruvbox Glass" aesthetic with atmospheric depth, soft glows, and tinted glass surfaces — while preserving the existing interaction model, text-first philosophy, and component structure.

## What Changes

### 1. CSS Foundation — `src/index.css`
- Replace the flat `--background` with layered CSS: a base dark gradient (`#1d2021` to `#282828`), plus two radial glow zones (warm gold at top-left, cool blue-green at bottom-right) at very low opacity (~0.08).
- Add new CSS custom properties under `.gruvbox-dark` for glass surfaces:
  - `--glass-bg`: `rgba(40, 40, 36, 0.55)` — translucent card fill
  - `--glass-border`: `rgba(235, 219, 178, 0.08)` — soft 1px border
  - `--glass-highlight`: `rgba(235, 219, 178, 0.04)` — inner top highlight
  - `--glass-blur`: `12px` — backdrop blur amount
  - `--glow-gold`: `rgba(215, 153, 33, 0.06)` — accent glow
  - `--glow-blue`: `rgba(69, 133, 136, 0.05)` — cool counterpoint
  - `--grain-opacity`: `0.03` — subtle noise/grain overlay
- Add a reusable `.glass-surface` utility class combining these tokens.
- Ensure all other themes (nord, tokyo-night, etc.) get sensible glass token fallbacks.

### 2. Atmospheric Background — `HomeScreen.tsx`
- Replace the flat `bg-background` with a layered div stack:
  - Base: linear gradient `#1d2021 → #282828 → #32302f`
  - Glow layer 1: radial gradient (gold, top-left, 40% spread, ~6% opacity)
  - Glow layer 2: radial gradient (blue, bottom-right, 35% spread, ~4% opacity)
  - Grain layer: a CSS pseudo-element with a subtle noise texture via SVG filter or repeating pattern at 3% opacity
- This same background treatment will be extracted as a reusable component (`AtmosphericBg`) used by Shell, LockScreen, etc.

### 3. Glass Cover Cards — `HomeScreen.tsx`
- Wrap each cover card button in glass styling:
  - `background: var(--glass-bg)` with `backdrop-filter: blur(var(--glass-blur))`
  - `border: 1px solid var(--glass-border))`
  - Inner highlight: `box-shadow: inset 0 1px 0 0 var(--glass-highlight)`
  - Outer depth: `box-shadow: 0 8px 32px rgba(0,0,0,0.3)`
  - Keep `rounded-[24px]` and `overflow-hidden`
- Each cover component (Signal, Terminal, Firefox, Notes, Messages, Music) gets its colors muted into the Gruvbox palette — lower saturation, warmer tones, with slight transparency so the glass shows through.

### 4. Cover Component Palette Muting
Update each cover in `src/components/hevel/covers/`:
- **SignalCover**: Darken to `#32302f` base, use `#458588` for sent bubbles, `#3c3836` for received
- **TerminalCover**: Already close; adjust to exact `#1d2021` bg with `#98971a` green text
- **FirefoxCover**: Dark tab bar (`#282828`), `#458588` accent links
- **NotesCover**: Warm parchment becomes muted `#3c3836` with `#ebdbb2` text
- **MessagesCover**: Dark base with `#b16286` purple accents
- **MusicCover**: Gradient shifts to `#3c3836 → #32302f` with `#d79921` progress bar

### 5. Typography Refinements — across all components
- App names in launcher: Georgia italic, `color: rgba(235, 219, 178, 0.85)`, not bold-shouty
- Active/highlighted text: `#d79921` gold accent
- Muted/secondary text: `#a89984` at reduced opacity (~0.4-0.6)
- Status bar text: lighter, more atmospheric presence

### 6. Launcher-Focus State — `ProseLauncher.tsx`
- Replace the opaque `0.88` scrim with a translucent glass haze: `rgba(29, 32, 33, 0.7)` + `backdrop-filter: blur(32px)`
- Add subtle warm glow behind the active content area
- The favorites section gets glass-pill treatment with `var(--glass-bg)` background
- Letter heading watermark uses `#d79921` at ~8% opacity instead of `--primary / 0.12`
- Search bar at bottom: glass-bordered input with warm caret color `#d79921`
- The scrubber letters use the gold accent for active state, with smoother opacity falloff

### 7. Scrubber Overlay — `HomeScreen.tsx`
- The right-side scrubber overlay gets glass treatment: `var(--glass-bg)` + blur + soft border
- Active app name highlighted in `#d79921`
- Smoother opacity gradients for distance-based items

### 8. Lock Screen — `LockScreen.tsx`
- Apply atmospheric background (same layered gradients)
- PIN pad circles: glass-styled buttons with `var(--glass-bg)` and subtle borders
- Clock text gets a very subtle text-shadow glow: `0 0 40px rgba(215, 153, 33, 0.1)`

### 9. Shell & Overlays — `Shell.tsx`, `ControlCenter.tsx`, `NotificationsPane.tsx`, `AppOverlay.tsx`
- All overlays and panels inherit the atmospheric background
- Control Center toggles and sliders get glass surface treatment
- Notifications pane uses glass-bordered notification rows
- AppOverlay placeholder gets atmospheric bg

### 10. PhoneFrame — `PhoneFrame.tsx`
- Phone border becomes a subtle glass rim: darker border with inner glow
- Outer page background uses the darkest Gruvbox tone

## Files Modified
1. `src/index.css` — new glass tokens, atmospheric utility classes
2. `src/components/hevel/HomeScreen.tsx` — atmospheric bg, glass cards, scrubber glass
3. `src/components/hevel/covers/SignalCover.tsx` — Gruvbox palette
4. `src/components/hevel/covers/TerminalCover.tsx` — palette tweak
5. `src/components/hevel/covers/FirefoxCover.tsx` — Gruvbox palette
6. `src/components/hevel/covers/NotesCover.tsx` — warm muted tones
7. `src/components/hevel/covers/MessagesCover.tsx` — Gruvbox palette
8. `src/components/hevel/covers/MusicCover.tsx` — Gruvbox palette
9. `src/components/hevel/ProseLauncher.tsx` — glass scrim, warm accents
10. `src/components/hevel/LockScreen.tsx` — atmospheric bg, glass PIN pad
11. `src/components/hevel/Shell.tsx` — atmospheric base layer
12. `src/components/hevel/ControlCenter.tsx` — glass surfaces
13. `src/components/hevel/NotificationsPane.tsx` — glass borders
14. `src/components/hevel/AppOverlay.tsx` — atmospheric bg
15. `src/components/hevel/PhoneFrame.tsx` — refined frame

## What Does NOT Change
- Component structure / file organization
- Interaction model (gestures, scrubber, launcher-as-home)
- Text-first / prose UI philosophy
- Georgia serif typography family
- ThemeProvider architecture
- Navigation/routing logic

