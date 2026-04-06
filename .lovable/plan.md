

# Lock Screen Polish

## Current Issues

1. **Clock face** — The swipe hint uses crude `›` characters with a confusing rotated second one. The breathing animation is visually noisy.
2. **Time display** — The colon is rendered as a separate span with reduced opacity, creating visual weight imbalance. The am/pm indicator floats awkwardly.
3. **Clock-to-PIN transition** — The clock phase uses a raw drag offset that can feel janky. The threshold (80px) is arbitrary and the spring-back has no momentum.
4. **PIN screen** — The compact time at top is redundant visual clutter. The dots are small (10px) and the error shake is a crude alternating translateX. The keypad buttons use `hsl(var(--muted) / 0.5)` which looks washed out. The delete key is a tiny `‹` character.
5. **Spacing** — The keypad is pushed to the bottom with a full `flex-1` spacer, leaving the dots stranded near the top. The overall composition feels top-heavy.
6. **Inline `<style>` tag** — The breathe keyframe is injected as raw CSS inside the component.

## Plan

### Phase 1: Clock Face

- Simplify time to a single clean render: `{displayHour}:{minutes}` as one span, removing the separate colon element
- Move am/pm to a new line below the time, smaller and lighter, not crammed inline
- Replace the `›` swipe hint with a single subtle upward chevron (CSS-drawn `∧` or a thin line) that breathes gently
- Add the breathe keyframe to `tailwind.config.ts` instead of inline `<style>`

### Phase 2: Swipe Gesture

- Add velocity tracking — if the user flicks fast, transition even with less distance
- Smooth the drag with a rubber-band feel: `Math.pow(dy, 0.85)` for diminishing returns
- Add a subtle scale-down on the clock as the user drags (parallax depth)

### Phase 3: PIN Screen

- Remove the compact time/date header — unnecessary once you've just seen the clock
- Replace with a simple centered label: "Enter Passcode" in serif italic, very light
- Vertically center the dots + keypad as a cohesive unit instead of spacer-separated
- Increase dot size to 12px with more generous spacing (20px gap)
- Improve error animation: use a proper CSS keyframe shake (translateX oscillation over 4 frames) instead of the static alternating offset
- Keypad: increase button size to 68px, use a subtler background (`hsl(var(--foreground) / 0.06)`), add a scale-down active state
- Delete key: use the word "delete" in small italic serif instead of `‹`
- Add subtle letter-spacing to digit labels for a cleaner feel

### Phase 4: Unlock Transition

- On correct PIN, briefly scale dots up and fade them before the screen lifts
- Add a slight delay (200ms) before the screen slides away, so the success state registers visually

### Technical Details

**Files modified:** 
- `src/components/hevel/LockScreen.tsx` — full rewrite of the component
- `tailwind.config.ts` — add `breathe` and `shake` keyframes

**No new dependencies.** All animations are CSS keyframes + inline transitions.

