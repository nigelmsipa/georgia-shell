import { useReducer, useCallback } from "react";

/**
 * Explicit state machine for the Hevel shell.
 *
 * One active state at a time. Every gesture handler dispatches an event; the
 * reducer decides whether the transition is legal. Illegal transitions return
 * the same state reference so React skips a render.
 *
 * Utility drawer and app switcher remain orthogonal booleans in `Shell.tsx` —
 * they are app-level affordances, not top-level shell states.
 */

export type ShellState =
  | { kind: "LOCK_CLOCK" }
  | { kind: "LOCK_PIN" }
  | { kind: "HOME" }
  | { kind: "CONTROL_CENTER" }
  | { kind: "NOTIFICATIONS" }
  | { kind: "LAUNCHER_FOCUS" }
  | { kind: "APP_FOREGROUND"; app: string }
  | { kind: "SIDE_PILL"; previous: "HOME" | "APP_FOREGROUND"; app?: string };

export type ShellEvent =
  | { type: "UNLOCK" }
  | { type: "LOCK_ENTER_PIN" }
  | { type: "LOCK_BACK_TO_CLOCK" }
  | { type: "OPEN_CONTROL_CENTER" }
  | { type: "OPEN_NOTIFICATIONS" }
  | { type: "OPEN_LAUNCHER" }
  | { type: "LAUNCH_APP"; name: string }
  | { type: "REQUEST_HOME" }
  | { type: "OPEN_SIDE_PILL" }
  | { type: "DISMISS_SIDE_PILL" }
  // Debug-only navigation from PhoneFrame sidebar. Bypasses the transition
  // graph so the prototype can jump anywhere for design review.
  | { type: "DEBUG_GOTO"; target: ShellState };

const isLocked = (s: ShellState) =>
  s.kind === "LOCK_CLOCK" || s.kind === "LOCK_PIN";

export const initialShellState: ShellState = { kind: "LOCK_CLOCK" };

export function reduce(state: ShellState, event: ShellEvent): ShellState {
  switch (event.type) {
    case "DEBUG_GOTO":
      return event.target;

    case "LOCK_ENTER_PIN":
      return state.kind === "LOCK_CLOCK" ? { kind: "LOCK_PIN" } : state;

    case "LOCK_BACK_TO_CLOCK":
      return state.kind === "LOCK_PIN" ? { kind: "LOCK_CLOCK" } : state;

    case "UNLOCK":
      // Only the PIN screen can complete unlock. Clock cannot skip PIN.
      return state.kind === "LOCK_PIN" || state.kind === "LOCK_CLOCK"
        ? { kind: "HOME" }
        : state;

    case "OPEN_CONTROL_CENTER":
      // Top-edge pull is HOME-only for now.
      return state.kind === "HOME" ? { kind: "CONTROL_CENTER" } : state;

    case "OPEN_NOTIFICATIONS":
      return state.kind === "HOME" ? { kind: "NOTIFICATIONS" } : state;

    case "OPEN_LAUNCHER":
      return state.kind === "HOME" ? { kind: "LAUNCHER_FOCUS" } : state;

    case "LAUNCH_APP":
      // Can launch from HOME, LAUNCHER_FOCUS, or swap while already in an app.
      if (
        state.kind === "HOME" ||
        state.kind === "LAUNCHER_FOCUS" ||
        state.kind === "APP_FOREGROUND"
      ) {
        return { kind: "APP_FOREGROUND", app: event.name };
      }
      return state;

    case "REQUEST_HOME":
      // The spine: any post-unlock state can always return HOME. Forbidden
      // from lock states — gestures cannot escape the lock without a code.
      if (isLocked(state)) return state;
      if (state.kind === "HOME") return state;
      return { kind: "HOME" };

    case "OPEN_SIDE_PILL":
      if (state.kind === "HOME") {
        return { kind: "SIDE_PILL", previous: "HOME" };
      }
      if (state.kind === "APP_FOREGROUND") {
        return { kind: "SIDE_PILL", previous: "APP_FOREGROUND", app: state.app };
      }
      return state;

    case "DISMISS_SIDE_PILL":
      if (state.kind !== "SIDE_PILL") return state;
      return state.previous === "APP_FOREGROUND" && state.app
        ? { kind: "APP_FOREGROUND", app: state.app }
        : { kind: "HOME" };

    default:
      return state;
  }
}

export function useShellMachine(initial: ShellState = initialShellState) {
  const [state, rawDispatch] = useReducer(reduce, initial);
  const dispatch = useCallback((e: ShellEvent) => rawDispatch(e), []);
  return { state, dispatch } as const;
}
