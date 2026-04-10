import React, { useState, useRef, useEffect } from "react";
import { COVER_APPS } from "./types";
import screenshotSignal from "@/assets/screenshot-signal.jpg";
import screenshotTerminal from "@/assets/screenshot-terminal.jpg";
import screenshotFirefox from "@/assets/screenshot-firefox.jpg";
import screenshotNotes from "@/assets/screenshot-notes.jpg";
import screenshotMessages from "@/assets/screenshot-messages.jpg";
import screenshotMusic from "@/assets/screenshot-music.jpg";

const COVER_SCREENSHOTS: Record<string, string> = {
  Signal: screenshotSignal,
  Terminal: screenshotTerminal,
  Firefox: screenshotFirefox,
  Notes: screenshotNotes,
  Messages: screenshotMessages,
  Music: screenshotMusic,
};

// Grid layout: row 1 has 3 cards, row 2 has 3 cards
// Varying heights to create masonry feel
const CARD_STYLES: Record<string, string> = {
  Signal: "row-span-2",    // tall
  Terminal: "row-span-2",  // tall
  Firefox: "row-span-2",  // tall
  Notes: "row-span-3",     // taller
  Messages: "row-span-2",  // medium
  Music: "row-span-2",     // medium
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

  const topRow = COVER_APPS.slice(0, 3);
  const bottomRow = COVER_APPS.slice(3, 6);

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
          {COVER_APPS.map((app) => (
            <button
              key={app}
              onClick={(e) => { e.stopPropagation(); onOpenApp(app); }}
              className="relative rounded-lg overflow-hidden transition-transform duration-200 active:scale-[0.97]"
              style={{ aspectRatio: "3/4" }}
            >
              <img
                src={COVER_SCREENSHOTS[app]}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Drag hint */}
      <div className="flex justify-center py-6">
        <div className="w-10 h-1 rounded-full bg-muted-foreground opacity-25" />
      </div>
    </div>
  );
};
