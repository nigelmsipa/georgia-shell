
# Freeze the design-system kernel

Scope: tokens + Tailwind config + a single utility applied across the existing shell components. No new features, no new components, no behavior changes.

## 1. `src/index.css` — Gruvbox OLED-dark as default `:root`

Replace the current light `:root, .gruvbox-light` block so light stops being the default. Light stays available only via the explicit `.gruvbox-light` class.

New `:root` values (hex → HSL, rounded):

- `#1d2021` background → `195 6% 12%`
- `#ebdbb2` foreground → `43 59% 81%`
- `#282828` surface / bg1 (card, popover) → `0 0% 16%`
- `#3c3836` bg2 (secondary, muted, border, input) → `20 5% 22%`
- `#928374` muted-foreground → `30 12% 51%`
- `#d79921` yellow → primary + accent gold + `--gruvbox-yellow` → `40 73% 49%`
- `#d65d0e` orange → `--gruvbox-orange` → `24 88% 45%`
- `#98971a` green → `--gruvbox-green` → `60 71% 35%`
- `#689d6a` teal → accent + `--gruvbox-teal` → `122 21% 51%`
- `#cc241d` red → destructive + `--gruvbox-red` → `2 75% 46%`

`--gruvbox-bg0/1/2` map to `#1d2021 / #282828 / #3c3836`. Sidebar tokens mirror the same. Glass tokens keep the dark values already used in `.dark`. Existing `.gruvbox-light` block is preserved verbatim (moved below `:root`). Other themes (nord, tokyo-night, solarized-dark, catppuccin, rhubarb, red-cabbage) stay as-is. The `.dark` selector block is dropped as a duplicate — `:root` already is dark.

`ThemeProvider.tsx`: keep default `"gruvbox-dark"`, but map that scheme to *no* extra class (root already carries the tokens). The other scheme classes continue to be toggled on `documentElement` as today. The `dark` class toggle is removed since darkMode isn't gated by a class anymore.

## 2. `tailwind.config.ts` — typography scale + tap-target

Add a Georgia-serif type scale under `theme.extend.fontSize`, tuple form `[size, { lineHeight, letterSpacing }]`:

```
display : ["2.25rem", { lineHeight: "2.75rem", letterSpacing: "-0.01em" }]
title   : ["1.5rem",  { lineHeight: "2rem" }]
body    : ["1.0625rem",{ lineHeight: "1.6rem" }]
caption : ["0.8125rem",{ lineHeight: "1.15rem", letterSpacing: "0.01em" }]
```

Add `theme.extend.spacing.tap = "3rem"` (48px) so `min-h-tap` / `min-w-tap` / `h-tap` compose naturally.

Add a tiny plugin block that registers a `.tap-target` component class:

```
.tap-target {
  min-height: 3rem;
  min-width: 3rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0; /* strict rectangle per design law */
}
```

This gives us one convention hit that every tappable element in the shell uses.

## 3. Apply across existing shell components

Purely mechanical rewrites — no logic changes. Files touched:

- `Shell.tsx`, `HomeScreen.tsx`, `LockScreen.tsx`, `ProseLauncher.tsx`, `AppSwitcher.tsx`, `ControlCenter.tsx`, `NotificationsPane.tsx`, `SettingsApp.tsx`, `AppOverlay.tsx`, `HevelBar.tsx`, `UtilityDrawer.tsx`, `SidePill.tsx`, `apps/*`, `covers/*`.

Rules applied to each:

1. Replace ad-hoc font sizes with the new scale:
   - `text-3xl`/`text-4xl` → `text-display`
   - `text-xl`/`text-2xl` → `text-title`
   - `text-base`/`text-lg` → `text-body`
   - `text-sm`/`text-xs` → `text-caption`
   - Micro sizes inside covers (`text-[7px]`, `text-[8px]`, `text-[9px]`) stay — those are miniature previews, not readable UI.
2. Drop redundant `font-serif` (Georgia is already the global default in `index.css`).
3. Every `<button>`, keypad key, toggle chip, list-item action, close/clear affordance, and swipe handle gets `tap-target` added. Existing width/height utilities that already meet ≥48px are kept; smaller ones (`w-14 h-14`, `w-16 h-16` in `apps/Phone.tsx`, the 44px theme swatches in `ControlCenter.tsx`) are bumped or wrapped by a `tap-target` hit-area so the *hit region* is ≥48px even if the visible mark stays smaller.
4. Any floating rounded circular button surfaced by the sweep is squared off (radius removed) — design law forbids floating circles. Phone keypad keys in `apps/Phone.tsx` in particular lose `rounded-full`.

## 4. Verification

- Build passes.
- Visual sweep via Playwright screenshots at `/` (lock, home, launcher, control center, app switcher, settings) to confirm dark palette, Georgia scale, and rectangular ≥48px targets.

## Out of scope

No new components, no behavior tweaks, no theme switcher changes beyond removing the `dark` class toggle, no changes to the other 6 theme blocks.
