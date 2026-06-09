# Build mock app screens — starting with AI Chat

Replace the generic `AppOverlay` placeholder with real Prose-UI mock app screens, one essential app at a time. **This is a static visual mock** — no real AI integration, no backend, no message persistence. Just a beautiful scripted conversation that demonstrates how the AI chat would feel on Havel.

## Phase 1 (this turn): AI Chat

### Shared "app screen" shell — `apps/AppScreen.tsx` (new)
A reusable wrapper every future mock app will use, so they all feel cohesive.

- Full-screen surface inside the phone frame (`absolute inset-0 z-50`).
- `AtmosphericBg` underneath.
- Minimal status bar at top (time only, like `HomeScreen`).
- **Gesture-close:** swipe down from the top ~80px closes the app (calls `onClose`). Optional swipe-up-from-bottom for the utility drawer, same as current `AppOverlay`.
- A whisper-quiet italic Georgia app name in the status bar area (very low opacity), so the app identity is present but unobtrusive — true to Prose UI.
- Children render in a `flex-1` content region.

### `apps/AIChat.tsx` (new)
A scripted demo conversation in pure Prose UI form.

- **Header:** italic "ask anything" in muted foreground at the top of the content area.
- **Message list:** vertically stacked messages. Two roles:
  - **User messages:** right-aligned, Georgia italic, slightly warmer foreground color, no bubble — just text on the atmospheric background. Small italic timestamp underneath.
  - **Assistant messages:** left-aligned, regular Georgia (non-italic), foreground color, no bubble. Renders as flowing prose. Tappable inline tokens for "actions" the AI suggests (e.g., "save to notes", "set a timer for 25 min") — uses the same `highlight + action` token model the notifications system already uses.
- **Pre-scripted conversation** (5–6 turns) showing the range: a question, a thoughtful answer with an inline action, a follow-up, a list rendered as prose ("you could try a, b, or c"), a "saved to notes" confirmation that fades in.
- **Composer:** bottom of screen. A single-line italic placeholder "what's on your mind?" with a faint underline. Typing into it adds a user message; the AI "responds" with a canned next turn from a queue, after a 600ms breathing pause. No real API.
- **Voice trigger:** a small italic "hold to speak" affordance to the right of the composer — purely visual for now (the actual Voice app is Phase 4). When pressed, shows a 2.5s breathing "listening…" then drops a fake transcribed message.
- **Theme-aware:** uses semantic tokens (`--foreground`, `--muted-foreground`, `--primary`, `--accent`) so it adapts to the 6 ambient themes.

### Wiring in `Shell.tsx`
- Add a `MOCK_APPS` registry: `{ "AI Chat": AIChat, "Settings": SettingsApp, ... }` so future apps slot in cleanly.
- Render the mock if the running app name has an entry; fall back to `AppOverlay` for anything not yet built.
- Add `"AI Chat"` to `ALL_APPS` in `types.ts` so it shows up in the launcher and scrub list.

### Optional polish (this turn if room)
- Make `AI Chat` one of the default cover apps on the home screen, replacing one of the current slots (suggest: drop `Notes` since AI Chat subsumes it per the strategy doc).
- Add an `AIChatCover` matching the existing cover aesthetic — a single italic line of prose mid-conversation, slightly dimmed.

## Phase 2+ (future turns, one per request)
Build these in order using the same `AppScreen` shell:

1. **HavelTube** — search/feed of mock videos as prose entries, tap a title to "play" (mock player surface with breathing waveform, audio-only toggle, "download" inline action).
2. **Music** — now-playing surface, library as prose list, playlists as inline tokens.
3. **Voice** — system-wide style overlay (not full-screen) — floating, transient, listens then drops text into the previous app.
4. **Browser** — minimal mock tabs + URL bar, prose-style bookmarks.
5. **Messages** — already has a cover; build the conversation view with inline action tokens.
6. **Phone / Calls** — new app for dial pad + recent calls as prose.
7. **Camera + Gallery, Clock, Files, Calculator, Weather, Maps, Recorder** — smaller utility mocks, one per request.

After this turn, ask the user which to do next.

## Technical notes
- All colors via existing HSL tokens. No hardcoded colors.
- Georgia serif only. Italic for prompts/labels, regular for the AI's voice, italic for user voice.
- Animations: 600–2500ms ease-in-out, organic. No mechanical spring.
- No new dependencies. Pure React + Tailwind + existing theme tokens.
- Save a new memory file `mem://features/ai-chat-app` and add to `mem://index.md`.
