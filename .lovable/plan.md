Add two new ambient themes alongside the existing six, selectable from the Settings ribbon.

## Rhubarb
Inspired by fresh rhubarb stalks on a dark grocery shelf — deep near-black background with warm crimson-to-pink primary and a pale celadon-green accent (the leafy tops).
- bg0 #1a0e0c, bg1 #241412, bg2 #2e1a17 (deep near-black with red undertone)
- foreground: warm cream #f2e3d0
- primary: rhubarb crimson #d8395a
- accent: pale celadon green #9fb89a
- destructive: deeper red #a8232f
- Glass glow: warm pink tint

## Red Cabbage
Inspired by the wet purple leaf — saturated magenta-violet primary on deep aubergine ground with cool green-leaf accent.
- bg0 #15101a, bg1 #1f1827, bg2 #2a1f36
- foreground: cool lavender-white #e6dcf0
- primary: vivid magenta #b13bb8
- accent: cabbage green #6fa067
- Glass glow: violet + green

## Technical changes
1. `src/index.css` — append two `:root.rhubarb { ... }` and `:root.red-cabbage { ... }` blocks following the same token shape as existing themes (background/card/popover/primary/secondary/muted/accent/destructive/border/input/ring + gruvbox-bg0/1/2 + glass tokens + grain).
2. `src/components/hevel/ThemeProvider.tsx` — extend `ThemeScheme` union with `"rhubarb" | "red-cabbage"`, add entries to `SCHEME_META` with labels "rhubarb" and "red cabbage" and 5-color swatches matching the palette.
3. No other code changes needed — `SettingsApp` and `ControlCenter` iterate `ALL_SCHEMES` and pick up new themes automatically.
