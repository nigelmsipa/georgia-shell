
# Utility Drawer (Bottom Half-Sheet)

A system-level utility tray that swipes up from the bottom edge, opens to ~50% height, blurs the content behind it, and provides quick access to clipboard and system tools that are rough on postmarketOS. Dismissible by swiping down or tapping the blurred backdrop.

## What It Does

- **Trigger**: Swipe up from the bottom ~40px zone on any screen (home, app, lock excluded)
- **Appearance**: Slides up to 50% screen height with the Gruvbox Glass aesthetic, blurring the content underneath (same blur treatment as Control Center)
- **Tools available** (prose-style, consistent with the rest of the UI):
  - Copy / Paste / Cut / Select All (clipboard operations)
  - Screenshot
  - Share
  - Brightness / Volume quick sliders
  - Kill foreground app
- **Dismiss**: Swipe down on the drawer handle, or tap the blurred backdrop

## What Changes

### 1. New component: `src/components/hevel/UtilityDrawer.tsx`
- Half-sheet overlay (~50% height) with glass-surface styling, drag handle at top
- Prose UI layout: tools presented as interactive inline tokens in natural sentences, e.g. *"You can copy, paste, or select all. Take a screenshot or share what's on screen."*
- Swipe-down-to-dismiss gesture on the drawer itself
- Slide-up animation with the same organic cubic-bezier curves used elsewhere

### 2. Update `src/components/hevel/Shell.tsx`
- Add `utilityDrawer` boolean state
- Wire `onOpenUtilityDrawer` callback to HomeScreen and AppOverlay
- Apply the same blur+scale treatment to the base layer when drawer is open (like `controlCenter` already does)
- Add `"Utility"` to the debug nav `navigateTo` switch
- Render `<UtilityDrawer open={utilityDrawer} onClose={...} />`

### 3. Update `src/components/hevel/HomeScreen.tsx`
- Add a bottom-edge swipe-up gesture zone (~40px from bottom)
- Call `onOpenUtilityDrawer()` when detected

### 4. Update `src/components/hevel/PhoneFrame.tsx`
- Add `"Utility"` to the debug sidebar screen list

### 5. Update `src/components/hevel/AppOverlay.tsx`
- Accept and wire `onOpenUtilityDrawer` prop so the drawer works while inside apps too

## What Does NOT Change
- Existing gestures (notifications swipe-down, control center, scrubber)
- Lock screen (no utility drawer access while locked)
- Prose UI philosophy, Georgia typography, Gruvbox Glass aesthetic
- Component structure and routing
