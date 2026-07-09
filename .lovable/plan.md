## Gesture state machine for Shell

Refactor `Shell.tsx` from a bag of independent booleans (`locked`, `notifications`, `controlCenter`, `utilityDrawer`, `appSwitcher`, `runningApp`) into a single explicit state machine that owns every transition. Every gesture handler in the shell — HevelBar swipe-up, top-edge pull, SidePill, HomeScreen flick — becomes a request against the machine, not a direct setter. Illegal transitions are silently rejected. This is the spine every other paste hangs off.

### States

One enum, one active state at a time:

```text
LOCK_CLOCK        clock + whisper, pre-PIN
LOCK_PIN          PIN keypad visible
HOME              cover grid, idle
CONTROL_CENTER    top sheet over HOME
NOTIFICATIONS     horizontal page from HOME
LAUNCHER_FOCUS    scrub/search launcher over HOME
APP_FOREGROUND    a running app (carries appName)
SIDE_PILL         side pill quick-panel open
```

Utility drawer stays as-is for now (it's an app-level affordance triggered by the bottom-60px swipe inside HOME / APP_FOREGROUND — it doesn't need its own top-level state). SOS/emergency stays local to LockScreen.

### Legal transitions

```text
LOCK_CLOCK       --swipe up-->             LOCK_PIN
LOCK_PIN         --swipe down-->           LOCK_CLOCK
LOCK_PIN         --correct code-->         HOME
HOME             --top-edge pull-->        CONTROL_CENTER
HOME             --horizontal page-->      NOTIFICATIONS
HOME             --flick up-->             LAUNCHER_FOCUS
HOME             --launch app-->           APP_FOREGROUND(name)
HOME             --side pill tap-->        SIDE_PILL
APP_FOREGROUND   --Hevel Bar swipe up-->   HOME          (must always work)
APP_FOREGROUND   --launch other app-->     APP_FOREGROUND(name)
APP_FOREGROUND   --side pill tap-->        SIDE_PILL
CONTROL_CENTER   --dismiss-->              HOME
NOTIFICATIONS    --dismiss / page back-->  HOME
LAUNCHER_FOCUS   --dismiss-->              HOME
LAUNCHER_FOCUS   --pick app-->             APP_FOREGROUND(name)
SIDE_PILL        --dismiss / pick-->       previous (HOME or APP_FOREGROUND)
```

Explicitly forbidden:
- Any transition **into** `LOCK_CLOCK` or `LOCK_PIN` from a post-unlock state. Once unlocked, the shell cannot re-lock via gesture. (Re-locking is a future explicit action, not a swipe.)
- Any panel-to-panel jump (e.g. CONTROL_CENTER → NOTIFICATIONS). Panels dismiss to their origin first.
- APP_FOREGROUND → CONTROL_CENTER via top-edge pull is out of scope for this paste; top-edge pull is HOME-only until we revisit.

### Why this fixes "swipe home doesn't work"

Today `HevelBar` calls `onCloseApp` which sets `runningApp = null`. But the bar is only mounted when `!locked && !anyOverlay`, and `appDragY` is shared across screens, so a stale drag value or a race with `AnimatePresence` exit can swallow the gesture. With the machine, HevelBar's swipe-up always dispatches `REQUEST_HOME`; the reducer resolves it deterministically from any state that lists HOME as a legal target (currently APP_FOREGROUND, CONTROL_CENTER, NOTIFICATIONS, LAUNCHER_FOCUS, SIDE_PILL). No mounting condition can suppress it.

### Implementation

**New file: `src/components/hevel/shellMachine.ts`**
- `ShellState` discriminated union (`{ kind: "APP_FOREGROUND"; app: string }` etc.).
- `ShellEvent` union: `UNLOCK`, `LOCK_ENTER_PIN`, `LOCK_BACK_TO_CLOCK`, `OPEN_CONTROL_CENTER`, `OPEN_NOTIFICATIONS`, `OPEN_LAUNCHER`, `LAUNCH_APP(name)`, `REQUEST_HOME`, `OPEN_SIDE_PILL`, `DISMISS_SIDE_PILL`.
- `reduce(state, event): ShellState` — pure, table-driven, returns the same state reference when a transition is illegal (so React skips renders).
- `useShellMachine()` hook wrapping `useReducer`, exposing `state` and a typed `dispatch`.

**Edit `src/components/hevel/Shell.tsx`**
- Replace all `useState` booleans with `useShellMachine()`.
- Derive render flags from `state.kind` (`locked = kind === "LOCK_*"`, `anyOverlay = kind === "CONTROL_CENTER" | "SIDE_PILL"`, etc.).
- Keep `recents` and `appDragY` as-is — they're orthogonal to the machine.
- Every child callback becomes a `dispatch(...)`:
  - `HomeScreen.onOpenApp` → `dispatch({ type: "LAUNCH_APP", name })`
  - `HomeScreen.onSwipeToNotifications` → `dispatch({ type: "OPEN_NOTIFICATIONS" })`
  - `HomeScreen.onOpenControlCenter` → `dispatch({ type: "OPEN_CONTROL_CENTER" })`
  - `HevelBar.onCloseApp` → `dispatch({ type: "REQUEST_HOME" })`
  - `LockScreen.onUnlock` → `dispatch({ type: "UNLOCK" })`
  - Panel `onClose` → `dispatch({ type: "REQUEST_HOME" })`
- Remove the `!locked` guards on HevelBar / SidePill / top-edge hitbox in favor of `state.kind !== "LOCK_CLOCK" && state.kind !== "LOCK_PIN"`.
- Handle `navigateTo` (debug nav) by translating each label to the correct event, not by poking booleans.

**No changes** to LockScreen internals, HomeScreen internals, panel components, apps, AtmosphericBg, PhoneFrame, tokens, or motion physics. The refactor is entirely at the Shell level plus one new file.

### Verification

- Manual: from every non-lock state, Hevel Bar swipe-up returns to HOME.
- Manual: after unlock, no gesture (top-edge pull, side pill, notifications swipe, HevelBar) can produce LOCK_CLOCK/LOCK_PIN.
- Manual: debug nav sidebar still jumps to every screen.
- Build passes; no new deps.

### Out of scope

- Utility drawer / app switcher promotion to top-level states.
- Re-lock action.
- Persisting state across reloads.
- Animating transitions differently based on source/target — motion stays as it is.
