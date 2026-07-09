# Natural Side Pill + Peel Reveal

Two focused changes, both in `src/components/hevel/`. No new components, no token changes, keep everything on the left edge inside PhoneFrame.

## 1. Side Pill — natural edge cutout

Replace the current floating 4px bar with a shape that reads as *carved into* the screen edge, not stuck onto it.

Construction (SVG, ~24px wide × ~120px tall, absolute at `left:0, top:50%`):
- A single path drawing a smooth inward curve — straight edge above and below, bulging concavely into the screen around the pill's midpoint (quadratic bezier, ~18px depth, ~90px tall arc).
- Fill uses `hsl(var(--background))` so the cutout matches whatever is behind the screen layer — it reads as the screen itself being notched.
- Inside the notch: a slim vertical tab (3px × 56px, rounded, `hsl(var(--muted-foreground) / 0.45)`) with a soft outer glow (`0 0 10px hsl(var(--foreground) / 0.18)`).
- Subtle inner shadow along the curve (`filter: drop-shadow(1px 0 1px hsl(var(--foreground) / 0.08))`) to give the notch a hair of depth.

Idle micro-motion: the tab breathes on a 3.2s ease-in-out cycle (opacity 0.75 ↔ 1, scaleY 1 ↔ 1.04) — matches the project's organic-motion rule.

While dragging: tab brightens to full opacity and the notch depth grows subtly with drag distance (depth = 18 + progress × 6) so the edge feels like it's being pulled open. Pure visual — no change to hit region or gesture logic.

Gesture behavior (tap vs. pan, TAP_SLOP, onTap → dictation) stays exactly as-is.

## 2. Reveal — peel with parallax

Currently the screen slides 1:1 with the finger, spring-followed. Upgrade `Shell.tsx` so the reveal feels like lifting a page off the void:

- **Perspective**: wrap the screen layer's parent in `style={{ perspective: 1200 }}`.
- **Screen layer transform**: combine `x: screenX` with `rotateY: screenRotate` and `transformOrigin: "left center"`. `screenRotate` is `useTransform(dragTarget, [0, OPEN], [0, -6])` — negative so the right edge tips away as it slides right… wait, pill is on left, so screen slides right. `transformOrigin` stays `"left center"` and rotateY is a small positive angle (~5°) so the far edge lifts toward the viewer.
- **Edge shadow**: current `-24px 0 48px` becomes a layered shadow that deepens with progress: `-8px 0 16px rgba(0,0,0,0.35), -32px 0 56px rgba(0,0,0,0.55)`.
- **Parallax on the void**: `HoldingStation` sits in a wrapper whose `x` is `useTransform(dragTarget, [0, OPEN], [-40, 0])` and `scale` is `[1.04, 1]`. The void appears to settle into place as the screen peels away, instead of being statically revealed.
- **Void opacity curve**: swap linear `[0,1]` for a snappier `[0, 0.35, 1]` at `[0, OPEN*0.3, OPEN]` so the vapor stays hidden until the peel commits.
- **Spring**: soften the follow-spring on `screenX` to `{ stiffness: 220, damping: 30 }` — slightly heavier, more page-like.
- Snap thresholds and open-distance constant (`SIDE_PILL_OPEN_DISTANCE = 240`) unchanged.

## Files touched

- `src/components/hevel/SidePill.tsx` — new SVG notch + tab, breathing animation, drag-linked depth. Gesture logic untouched.
- `src/components/hevel/Shell.tsx` — perspective wrapper, rotateY on screen layer, layered shadow, parallax wrapper around `HoldingStation`, adjusted opacity curve and spring.

No changes to `HoldingStation`, `UtilityDrawer`, `AtmosphericBg`, `PhoneFrame`, `shellMachine`, `DictationOverlay`, or `index.css`.

## Verification

After build, drive Playwright: screenshot the pill idle, mid-drag (~120px), and fully open. Confirm the notch reads as carved into the edge and the screen tilts as it slides.
