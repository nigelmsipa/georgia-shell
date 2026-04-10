import React, { useState, useRef, useEffect } from "react";
import { COVER_APPS } from "./types";
import { SignalCover } from "./covers/SignalCover";
import { TerminalCover } from "./covers/TerminalCover";
import { FirefoxCover } from "./covers/FirefoxCover";
import { NotesCover } from "./covers/NotesCover";
import { MessagesCover } from "./covers/MessagesCover";
import { MusicCover } from "./covers/MusicCover";

const COVER_COMPONENTS: Record<string, React.FC> = {
  Signal: SignalCover,
  Terminal: TerminalCover,
  Firefox: FirefoxCover,
  Notes: NotesCover,
  Messages: MessagesCover,
  Music: MusicCover,
};

interface Props {
  onOpenLauncher: () => void;
  onOpenApp: (name: string) => void;
  onSwipeToNotifications: () => void;
  onOpenSwitcher: () => void;
  onOpenControlCenter: () => void;
}

export const HomeScreen: React.FC<Props> = ({
  onOpenLauncher,
  onOpenApp,
  onSwipeToNotifications,
  onOpenSwitcher,
  onOpenControlCenter,
}) => {
  const [time, setTime] = useState(new Date());
  const dragRef = useRef({ startY: 0, startX: 0, dragging: false });

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const hours = time.getHours().toString().padStart(2, "0");
  const minutes = time.getMinutes().toString().padStart(2, "0");

  const handlePointerDown = (e: React.PointerEvent) => {
    dragRef.current = { startY: e.clientY, startX: e.clientX, dragging: true };
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!dragRef.current.dragging) return;
    const dy = dragRef.current.startY - e.clientY;
    const dx = dragRef.current.startX - e.clientX;
    dragRef.current.dragging = false;

    if (dy > 80) onOpenLauncher();
    else if (dy < -60) onOpenControlCenter();
    else if (dx > 60) onSwipeToNotifications();
  };

  return (
    <div
      className="absolute inset-0 flex flex-col bg-background select-none"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      style={{ touchAction: "none" }}
    >
      {/* Status bar */}
      <div className="flex justify-between items-center px-6 pt-14 pb-2">
        <span className="text-sm font-serif text-foreground tracking-tight">
          {hours}:{minutes}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-serif text-muted-foreground tracking-wider">
            ▲▲
          </span>
          <span className="text-xs font-serif text-muted-foreground">
            78%
          </span>
        </div>
      </div>

      {/* Cover cards */}
      <div className="flex-1 px-4 pt-6 pb-2 overflow-hidden">
        <div className="grid grid-cols-3 gap-3">
          {COVER_APPS.map((app) => {
            const Cover = COVER_COMPONENTS[app];
            return (
              <button
                key={app}
                onClick={(e) => { e.stopPropagation(); onOpenApp(app); }}
                className="relative rounded-lg overflow-hidden transition-transform duration-200 active:scale-[0.97]"
                style={{ aspectRatio: "3/4" }}
              >
                {Cover && <Cover />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Drag hint */}
      <div className="flex justify-center py-6">
        <div className="w-10 h-1 rounded-full bg-muted-foreground opacity-25" />
      </div>
    </div>
  );
};
