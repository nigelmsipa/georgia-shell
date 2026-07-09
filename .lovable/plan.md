# Plan: The Breath

Replace the visual form of two handles with a soft, breathing edge glow. Gestures, state machine, and behavior are untouched.

## Scope

- `src/components/hevel/HevelBar.tsx` — swap the 4px pill bar for a horizontal breath at bottom-center.
- `src/components/hevel/SidePill.tsx` — swap the 4px vertical bar for a vertical breath on the left edge.
- New `src/components/hevel/Breath.tsx` — shared visual component.
- New `src/components/hevel/breathRhythm.ts` — shared tunables (period, min/max opacity, gather amount, spring).
- `src/components/hevel/LockScreen.tsx` — replace `animate-breathe` on the "swipe up" caret (and the PIN hint / calling label) with the shared rhythm so all three share one clock. Only the animation source changes; copy, layout, and behavior are unchanged.

No changes to `index.css` tokens, `tailwind.config.ts`, `Shell.tsx` wiring, or gesture handlers. The existing `<motion.div>` in each handle keeps its `onPan*`/`onTap`/`drag` props; only its visual children are replaced.

## The breath, at rest

- No solid bar, no border, no rounded rect. Just a soft radial/linear vapor cloud rendered as a `div` with a `radial-gradient` fade to transparent.
- Tinted from existing glow tokens (`--glow-gold` for warmth, faint `--foreground` for the core). Reuses the same material as `AtmosphericBg`.
- Slow cosine pulse on opacity + blur-glow intensity, driven in JS via a shared `useBreathPhase()` hook so all breath instances + lock-screen caret stay in phase.
- Orientation:
  - Bottom breath: ~120px wide × ~18px tall soft horizontal smear at bottom-center of PhoneFrame.
  - Side breath: ~18px wide × ~96px tall soft vertical smear on the left edge, vertically centered.

## The breath, on touch

- Pointer enter / active drag → spring `gather` from 0 → 1 (stiffness 280, damping 26). Pointer leave / release → spring back to 0.
- Gather multiplies opacity, warm tint, blur radius, and thickness, so at gather=1 the vapor is unmistakably present and warm under the thumb.
- Uses `onPointerEnter`/`onPointerLeave`/`onPointerDown`/`onPointerUp` on the existing hitbox `motion.div`. These are additive — they do not consume or alter Framer's pan gesture.

## Tunables (in `breathRhythm.ts`)

```ts
export const BREATH_PERIOD_MS = 3800;       // one full cosine cycle
export const BREATH_OPACITY_MIN = 0.18;
export const BREATH_OPACITY_MAX = 0.42;
export const BREATH_GATHER_MAX = 1;         // multiplier ceiling on touch
export const BREATH_GATHER_SPRING = { stiffness: 280, damping: 26 };
export const BREATH_WARM_HUE = "var(--glow-gold)";
```

Adjusting `BREATH_PERIOD_MS` retimes bottom breath, side breath, and lock-screen caret together.

## Technical notes

- `useBreathPhase()` returns a `MotionValue<number>` in [0,1] driven by `requestAnimationFrame` using `(1 - cos(2π·t/PERIOD)) / 2`. One shared module-level clock so all instances are in lockstep without prop drilling.
- `<Breath orientation="horizontal" | "vertical" gather={motionValue} />` renders an absolutely-positioned `pointer-events-none` layer; the parent hitbox stays fully responsible for gestures.
- Lock screen: replace the three `animate-breathe` class usages with `style={{ opacity: useBreathOpacity() }}` (a tiny hook wrapping the shared phase). The `animate-breathe` keyframe in `tailwind.config.ts` stays (still referenced elsewhere is possible; leaving it avoids churn).

## Out of scope

- No changes to gesture thresholds, state machine, or handler wiring.
- No changes to `DictationOverlay`, `HoldingStation`, theme tokens, or app screens.
