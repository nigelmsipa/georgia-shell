
# `/spec` — self-documenting reference sheet

Add one hidden, text-first route that reads live tokens and measured pixel sizes so real numbers can be copied out. No links to it from the shell — accessed only by typing `/spec`.

## 1. Router

`src/App.tsx`: add `<Route path="/spec" element={<Spec />} />` above the catch-all, importing from `./pages/Spec.tsx`. That's the only edit to existing files.

## 2. New file `src/pages/Spec.tsx`

Full-page, plain text-first layout — no PhoneFrame, no glass. Uses `bg-background text-foreground` and the same Georgia scale (`text-caption`, `text-body`, etc.) so the page itself demonstrates the tokens.

Three sections, all populated from live sources on mount inside a `useEffect`:

### (1) Palette

Iterate a hard-coded list of token names that exist on `:root` — `background, foreground, card, popover, primary, secondary, muted, muted-foreground, accent, destructive, border, input, ring, gruvbox-yellow, gruvbox-orange, gruvbox-green, gruvbox-teal, gruvbox-red, gruvbox-gray, gruvbox-bg0, gruvbox-bg1, gruvbox-bg2`.

For each name, read `getComputedStyle(document.documentElement).getPropertyValue('--' + name)` (returns the raw `H S% L%` triplet), then render one row:

```
[ 48×48 swatch, strict rectangle ]   --token-name    hsl(H S% L%)    #rrggbb
```

Hex is computed in-file with a small `hslToHex(h, s, l)` helper. Swatch background is `hsl(var(--token))` (or the raw triplet).

### (2) Type ramp

Static list mirroring the Tailwind scale added in kernel: `display, title, body, caption`. For each, render a sample word in that class and a caption line beside it showing measured values from `getComputedStyle` on the sample element:

```
display   Georgia   36px / 44px  (letter-spacing -0.16px)
title     Georgia   24px / 32px
body      Georgia   17px / 25.6px
caption   Georgia   13px / 18.4px
```

Font-size and line-height come from `computedStyle.fontSize` and `computedStyle.lineHeight` on the actual rendered sample, so the numbers stay honest if the scale is later tweaked.

### (3) Live layout measurements

Render two off-flow but visible measurement targets inside the /spec page:

- One `<HevelBar />` mounted in a fixed-width container (390px, matching the phone width used by `PhoneFrame`) so its rendered pill and vertical footprint match the real shell.
- One PIN-key button built with the exact class list used in `LockScreen.tsx` (`tap-target w-tap h-tap` plus the digit's text classes) — no need to mount full `LockScreen`.

`useLayoutEffect` on refs calls `getBoundingClientRect()` and prints:

```
Nav bar      width × height    e.g. 128 × 12 px
PIN key      width × height    e.g. 48 × 48 px
Tap target   min-w × min-h     read from computed style of the same key
Phone frame  width × height    hard-coded reference: 390 × 844 px
```

Also print the resolved font-family string once (`Georgia, 'Times New Roman', serif`) as a sanity check.

## 3. Look & feel

- Single column, max-width ~720px, generous vertical spacing.
- Section headings use `text-title`; row labels `text-caption text-muted-foreground`; values in monospace (`font-mono`) so hex/px columns align.
- Strictly rectangular swatches (radius 0), consistent with design law.
- No interactivity beyond a "copy" affordance? Skipped — plain reference sheet per the request.

## 4. Verification

- Build passes.
- Visit `/spec` via Playwright, screenshot, confirm all three sections render with real HSL/hex/px values.

## Out of scope

No changes to shell components, tokens, or Tailwind config. Not linked from the UI. Not indexed.
