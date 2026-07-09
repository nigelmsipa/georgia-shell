import React from "react";
import { AIChatCover } from "./AIChatCover";
import { AngelfishCover } from "./AngelfishCover";
import { ContactsCover } from "./ContactsCover";
import { HavelTubeCover } from "./HavelTubeCover";
import { MessagesCover } from "./MessagesCover";
import { MusicCover } from "./MusicCover";
import { NotesCover } from "./NotesCover";
import { SignalCover } from "./SignalCover";
import { TerminalCover } from "./TerminalCover";
import { VoiceCover } from "./VoiceCover";

/**
 * Live-cover previews. Used exclusively by AppSwitcher (recents)
 * as the visual identity for a running app. The rest of the shell
 * is text-first — no icon grid anywhere else.
 */
export const COVER_COMPONENTS: Record<string, React.FC> = {
  "AI Chat": AIChatCover,
  HavelTube: HavelTubeCover,
  Signal: SignalCover,
  Terminal: TerminalCover,
  Angelfish: AngelfishCover,
  Notes: NotesCover,
  Messages: MessagesCover,
  Music: MusicCover,
  Contacts: ContactsCover,
  Voice: VoiceCover,
};
