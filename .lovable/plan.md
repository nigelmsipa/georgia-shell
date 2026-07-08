## Lock screen: fingerprint cue

Keep everything about the current lock screen. Add a single quiet affordance so the user knows fingerprint is an option alongside the PIN — no sensor visualization, no state machine, no ceremony.

### Changes

**`src/components/hevel/LockScreen.tsx`**
- On page 1 (clock), replace the current `swipe up` whisper at the bottom with a two-line italic serif whisper:
  - line 1: `unlock with pin or fingerprint`
  - line 2: `swipe up`
  - Same muted color, same breathing animation, same fade-on-scroll behavior.
- On page 2 (PIN), replace the `enter passcode` label with `enter passcode or use fingerprint` in the same style.
- Add a debug-only tap target: a tiny italic `fingerprint` word centered at the very bottom of page 2 (below the keypad, minimal footprint) that simply calls the existing unlock sequence (`setUnlocking(true)` → `onUnlock()` after 600ms). This stands in for the hardware sensor in the prototype so the flow is demonstrable on desktop; on a real device the hardware event would call the same handler.
- No new animations, no sensor ring, no atmosphere changes. Emergency overlay untouched.

### Out of scope
- No fingerprint reader illustration, halo, ripple, or ink bloom.
- No changes to AtmosphericBg, PIN logic, SOS flow, gesture scrolling, or Shell wiring.
