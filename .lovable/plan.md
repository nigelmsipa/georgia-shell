
# Navigation contract + gesture layer

Lock in the primary reservation now so later work can't drift.

## 1. The contract (constants, single source of truth)

New file `src/components/hevel/nav-contract.ts`:

```
NAV_ZONE_HEIGHT_DP = 48    // reserved bottom rectangle, full width
TOP_ZONE_HEIGHT_DP = 24    // pull-down for control center
SIDE_ZONE_WIDTH_DP = 16    // left edge for side-pill
SWIPE_UP_HOME_DP    = 140  // long swipe → home
SWIPE_UP_PEEK_DP    = 40   // short swipe → app switcher
SWIPE_SIDE_SCRUB_DP = 60   // L/R app scrub threshold
GESTURE_ZONES = [ ... ]    // {id,label,edge,x/y/w/h in dp} — consumed by dev overlay + /spec
```

1 dp = 1 CSS px in this prototype (PhoneFrame is fixed-pixel). All measurements downstream import from here.

## 2. Reserved bottom nav zone

- Replace the ad-hoc `bottom-2 h-16` container in `HevelBar.tsx` with a rectangular zone locked to `height = NAV_ZONE_HEIGHT_DP`, flush to the bottom, full width, strictly rectangular. The visible pill stays centered inside it; the surrounding rectangle is the reserved hit area.
- The zone reserves space visually — content above (home/app) gets `padding-bottom: NAV_ZONE_HEIGHT_DP` via a shared `useNavInset()` hook or a plain constant applied in `HomeScreen`, `AppOverlay`, and each `apps/*` screen wrapper (`AppScreen.tsx`).
- Top edge hitbox in `Shell.tsx` becomes `TOP_ZONE_HEIGHT_DP`. Side pill container becomes `SIDE_ZONE_WIDTH_DP`.

## 3. State machine

Explicit states in `Shell.tsx`:

```
type NavState =
  | { kind: "lock" }
  | { kind: "home" }
  | { kind: "app"; name: string }
  | { kind: "switcher"; from: "home" | { app: string } }
```

Transitions (all routed through one `dispatch(navEvent)`):

```
lock         --unlock-->             home
home         --openApp(name)-->      app(name)
app(name)    --swipeUpLong-->        home
app(name)    --swipeUpShort-->       switcher(from=app)
home         --swipeUpShort-->       switcher(from=home)
switcher     --pickApp(name)-->      app(name)
switcher     --done | back-->        from === home ? home : app(from.app)
switcher     --clearAll-->           home
app(a)       --scrubLeft/Right-->    app(next/prev recent)
```

- `recents[]` is appended on every `openApp` and reordered on scrub.
- Handoff from open app → switcher is explicit: `HevelBar` calls `dispatch({t:'swipeUpShort'})`; Shell computes the transition and passes `focusApp={name}` to `AppSwitcher`. That name is used to set `focusedIdx` and to scroll it into view on mount.
- Handoff from switcher → back: pressing "done" or swiping down returns to the exact prior state (`from`) via `dispatch({t:'back'})`. No more collapsing to home from an app context.
- The switcher opens over the currently-running app (kept mounted underneath with a scale/blur) so the return feels continuous. When `from.app` is truthy, Shell keeps that app mounted and applies the overlay blur; on `back` the blur reverses.

`HevelBar` gesture parsing:

- Vertical drag: distance ≥ `SWIPE_UP_HOME_DP` or vel ≥ 800 → home. Distance ≥ `SWIPE_UP_PEEK_DP` and < home threshold → switcher. Below peek → snap back.
- Horizontal drag: ≥ `SWIPE_SIDE_SCRUB_DP` → scrub.

## 4. Dev gesture overlay

New component `src/components/hevel/GestureDebugOverlay.tsx`, mounted inside `PhoneFrame` when enabled.

Enable via any of:
- URL param `?debug=gestures`
- `localStorage.hevel_debug_gestures = "1"`
- Toggle on `/spec`

Renders one absolutely-positioned rectangle per entry in `GESTURE_ZONES`, each with:
- Semi-transparent fill using a distinct hue per zone (`--accent`, `--primary`, `--gruvbox-orange`, `--gruvbox-teal`)
- 1px dashed border in the same hue
- Corner label: `{zone.label}  {w}×{h} dp`
- If `w > 200` or `h > 200`: fill becomes `hsl(var(--destructive)/0.25)`, label prefixed with `⚠ oversized (>200dp)` in destructive color

Measurements are read at mount from `getBoundingClientRect()` on each real zone's DOM node (via refs registered by `HevelBar`, top-edge hitbox, `SidePill`), not from the constants — this catches drift.

## 5. `/spec` additions

Append a "Navigation reservation" section to `src/pages/Spec.tsx`:

- Table of contract values (from `nav-contract.ts`).
- Live measurements: read `GestureDebugOverlay`'s registered rects (or re-measure via a lightweight hook that mounts the same rects invisibly) and print `label — x,y w×h dp — status ok / ⚠ oversized`.
- Total reserved area (sum of bottom + top + side) in dp and as a % of the 390×844 phone frame.

## 6. Files touched

- Add: `nav-contract.ts`, `GestureDebugOverlay.tsx`
- Edit: `Shell.tsx` (state machine + dispatch + overlay mount + query-param read), `HevelBar.tsx` (peek vs home thresholds, refs), `SidePill.tsx` (ref, width from constant), `AppSwitcher.tsx` (accept `focusApp` prop, scroll-into-view, distinguish `done` vs `back` return via `from`), `pages/Spec.tsx` (new section), `apps/AppScreen.tsx` + `AppOverlay.tsx` + `HomeScreen.tsx` (bottom padding from constant so content isn't hidden under the reserved zone).

## 7. Verification

- Build passes.
- Playwright: enable `?debug=gestures`, screenshot lock → home → open app → short-swipe → switcher → done → app; assert each zone label reads ≤200 dp (no red warning), and the switcher-from-app path returns to the same app.
- Screenshot `/spec` "Navigation reservation" section shows the same measured numbers.

## Out of scope

Icons or visible buttons on the nav zone (design law: text-first, no icons). No changes to control-center, notifications, utility-drawer entry points beyond the top-zone height constant. No lock-screen changes.
