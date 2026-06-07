# Refine the emergency action

Three coordinated changes in `src/components/hevel/LockScreen.tsx`.

## 1. Placement — opposite `delete`, inside the keypad

The bottom row of the keypad is currently `["", "0", "delete"]` — the empty cell at the left is just a spacer. Turn that cell into the emergency trigger so it sits symmetrically opposite `delete`, anchoring the row visually and removing the separate pill button below the keypad.

- Replace the spacer with a 68×68 button that opens the emergency overlay.
- Remove the standalone `emergency` pill below the keypad entirely.
- Keep tap target identical to other keys so the row reads as a unified trio.

## 2. Visual weight — whisper

No red at rest. The cell shows only the italic word `sos` (or `emergency` — see note) in muted-foreground at very low opacity, no border, no background. On press/hover it warms to `hsl(var(--destructive))` and a single 4px red ember dot fades in beside it. This keeps the lock screen calm and on-brand with Prose UI's "intentional roughness," while still being unmistakable in a real emergency.

- Resting: `color: hsl(var(--muted-foreground) / 0.3)`, no chrome.
- Hover/active: color shifts to destructive, tiny glowing dot fades in.
- Use `sos` (3 letters, balances `del` opposite it) — short enough to feel like a sibling of `del`.

## 3. Dialer overlay — prose sentence

Replace the chip cluster + label with a single flowing sentence in the Prose UI style. The keypad and call button below stay, but the chips become inline tappable tokens within natural language.

Sentence (centered, Georgia italic, ~16px, generous line-height):

> in an emergency, call **911**, **112**, or **999** — or reach **police**, **ambulance**, or **fire** directly.

- Each bold token is an inline button: tapping sets digits + initiates call (same handler as today).
- Above it, the large digit display stays for manual dialing.
- Drop the separate "dial a number, or call" label — the sentence carries that meaning.
- "calling…" state replaces the sentence with a single italic line: `calling {label}…`.

## Technical notes

- All colors via existing HSL tokens (`--destructive`, `--muted-foreground`, `--foreground`).
- Animations stay organic: opacity/color transitions 0.3–0.4s ease, no scale jumps.
- Cancel button and "emergency only" header unchanged.
- No new state, no new dependencies.
