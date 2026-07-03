# HANDOFF — Hevel OS Phase 1 (georgia-shell React prototype)

Read this whole file before touching code. Execute the tasks in order. Do not
invent features outside this list. When you finish a task (or run out of
session), rewrite **State now** and **Next action** only — the rest is stable.

---

## State now

- Repo: `/home/nigel/georgia-shell` (Vite + React + TS + Tailwind + shadcn, bun).
- **Tasks 1 and 2 completed and committed**: `AppScreen` surface drag was replaced with the global `HevelBar` (bottom edge hit box for close/scrub/voice) and a global top edge hit box for `ControlCenter`.
- Lock screen is **active** (`locked = useState(true)` in `Shell.tsx`).
- Existing mock apps in `src/components/hevel/apps/`: AIChat, Angelfish
  (browser UI already started), Contacts, HavelTube, Music, Signal, Voice.
- Shell chrome components in `src/components/hevel/`: Shell, HomeScreen,
  ProseLauncher, ControlCenter, NotificationsPane, UtilityDrawer, AppSwitcher,
  AppOverlay, LockScreen, AtmosphericBg, PhoneFrame, SettingsApp, HevelBar.

## Next action

Start Task 3 (Side Pill).

## Goal

Finish Phase 1: a polished, interactive React mock-up of the Hevel OS shell
that fully implements the "Reliable PDF" gesture system, so the feel is locked
before any Android/AOSP (Phase 2) code is written. We are NOT writing
Kotlin/AOSP code in this phase. The canonical gesture spec is
`/home/nigel/zombies/Projects/hevel/hevel_gesture_spec.md` — it wins over any
code or doc that disagrees with it, including this file.

## How — ordered task list

Run dev server: `cd /home/nigel/georgia-shell && bun run dev -- --host 0.0.0.0`
Verify each task in a browser at a phone-ish viewport (~390×844) before moving on.

### Task 0 — Checkpoint (5 min)
`git add -A && git commit` the pending framer-motion work so nothing is lost
(message: "Checkpoint: framer-motion app transitions (drag surface still wrong)").
It builds; commit as-is, then fix forward.

### Task 1 — Fix AppScreen drag + build the Hevel Bar (core of the spec)
This is one task because the correct close-gesture IS the Hevel Bar.

1. In `AppScreen.tsx`, remove `drag="y"` from the app container. Keep the
   `motion.div` and its enter/exit spring (`AnimatePresence` in Shell already
   keys it) — the open/close animation is good, whole-surface dragging is not.
2. Create `src/components/hevel/HevelBar.tsx`: a persistent bottom-center
   cream/off-white pill, rendered by `Shell.tsx` ABOVE apps (z-index above
   AppScreen). It is a reserved hit-box — apps never receive its touches.
   - **Swipe up (fast):** close the running app / go Home. Drive the running
     app's motion (pass drag progress down or use a shared MotionValue) so the
     app visually follows the finger with spring release — this replaces the
     deleted drag behavior.
   - **Scrub sideways:** flip between recent apps (Shell already tracks
     `runningApp`; add a simple recents array in Shell state).
   - **Tap:** Echo voice mock — show a small listening indicator; on second
     tap, "type" a canned transcription into the focused input, else toast
     "Copied to clipboard". Pure mock, no real STT.
   - **Swipe up + hold:** reserved; no-op for now (leave a TODO).
3. Delete the old bottom "handle" bar inside `AppScreen.tsx` (the 32×3 pill) —
   the Hevel Bar replaces it globally.

### Task 2 — Top edge: Control Center everywhere
Swipe down from the top ~40px must open `ControlCenter` from ANY context
(home, inside any app, over the launcher). Today the pull-down only lives in
pieces. Put one top-edge hit-box in `Shell.tsx` (above apps, like the Hevel
Bar) so it is truly global. Note: the top edge does NOT close apps — closing
is the Hevel Bar's job (spec §2).

### Task 3 — Side Pill (Edge Panel)
`src/components/hevel/SidePill.tsx`, rendered by Shell, floating on the left
edge (recent commit "Swapped right rail to left" — keep left).
- **Swipe straight inward:** open `UtilityDrawer` (already exists — wire it).
- **Swipe inward + down (diagonal):** open `AppSwitcher` popup (already
  exists — wire it). Use the drag vector angle to disambiguate (e.g. >30° below
  horizontal = switcher).

### Task 4 — Home canvas: paging + Niagara edge scrub
On the Home screen only (`!runningApp && !locked`):
- **Center swipe left/right:** page between Running Apps view and
  `NotificationsPane`.
- **Vertical scrub on extreme left/right edge (~24px):** Niagara-style
  alphabetized text list of apps; thumb position selects the letter, release
  launches/highlights. Text-forward, Georgia serif, no icons grid — match
  `ProseLauncher` styling.

### Task 5 — Mock app flows (only after 1–4 all verified)
- **Browser:** extend the existing `Angelfish.tsx` (tabs + URL bar). Do not
  start a new browser component.
- **Phone:** dial pad + in-call screen (check `Contacts.tsx` first, reuse).
- **Messages:** check whether `Signal.tsx` already covers this; extend rather
  than duplicate.

### Done means
Each gesture in the spec works reliably in the browser prototype, nothing in
an app's content area triggers system navigation, and the tree is committed.

## Gotchas (learned the hard way — do not relearn)

- **Gesture spec is law.** Reserved hit-boxes only; NO whole-surface or bare
  edge-swipe system gestures over app content. That's the entire "Reliable
  PDF" thesis. The previous agent's `drag="y"`-on-everything violated it.
- **framer-motion drag vs scroll:** never put `drag` on a container with
  scrollable children. Use a dedicated handle (the Hevel Bar / pills) with
  `useDragControls` or its own pointer handlers, and drive the target with a
  MotionValue.
- **Don't reopen decisions.** AOSP pivot, Prose UI (Georgia serif, atmospheric
  backgrounds, text over cards/buttons), Phase 1 = React mock only — all
  settled. Don't pitch alternatives.
- **User verbiage:** it's the "Hevel Bar", "Side Pill", "Reliable PDF". Keep
  attribution/labels quiet; text-forward minimalism.
- Lock screen: leave `locked` default `true`; if you need to skip it while
  iterating, unlock via the UI or flip it locally but NEVER commit the bypass.
- `bun`, not npm. Build check: `bun run build`. Dev: `bun run dev -- --host 0.0.0.0`.
- Work in SHORT bursts; at end of burst update State now / Next action here and
  commit. The chat is disposable; this file is the memory.
