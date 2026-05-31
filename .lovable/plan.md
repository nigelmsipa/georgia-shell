I’ll make the Utility Drawer actually leave the interaction stack instead of only trying to animate away.

Plan:
1. Update the drawer close path so tapping `close`, tapping the backdrop, pressing Escape, and swiping down all call one shared dismiss function.
2. Make that dismiss function immediately disable drawer pointer events and then notify `Shell` to set `utilityDrawer` to `false`, so the drawer can’t remain “always on top.”
3. Add a transition-end-safe state so the drawer/backdrop are non-interactive when closed, while still preserving the smooth bottom-sheet animation.
4. Verify the state wiring in `Shell` still lets the debug `Utility` button and bottom swipe open it normally.