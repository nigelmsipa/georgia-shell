import React, { useState, useRef, useEffect } from "react";
import { useTheme } from "./ThemeProvider";
import { COVER_APPS } from "./types";
import screenshotFirefox from "@/assets/screenshot-firefox.jpg";
import screenshotTerminal from "@/assets/screenshot-terminal.jpg";
import screenshotSignal from "@/assets/screenshot-signal.jpg";
import screenshotNotes from "@/assets/screenshot-notes.jpg";

const COVER_SCREENSHOTS = [screenshotFirefox, screenshotTerminal, screenshotSignal, screenshotNotes];

const COVER_META: Record<string, string> = {
  Firefox: "3 tabs",
  Terminal: "active",
  Signal: "2 unread",
  Notes: "4m ago",
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

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
  const { scheme } = useTheme();
  const [time, setTime] = useState(new Date());
  const dragRef = useRef({ startY: 0, startX: 0, dragging: false });

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const hours = time.getHours().toString().padStart(2, "0");
  const minutes = time.getMinutes().toString().padStart(2, "0");
  const dateStr = `${DAYS[time.getDay()]}, ${MONTHS[time.getMonth()]} ${time.getDate()}`;

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
      {/* Top bar */}
      <div className="flex justify-between items-center px-6 pt-14">
        <button onClick={onOpenSwitcher} className="text-[10px] text-muted-foreground font-serif">
          recent
        </button>
        <span className="text-[10px] text-muted-foreground font-serif">
          {scheme.replace("-", " ")}
        </span>
      </div>

      {/* Clock + date — generous breathing room */}
      <div className="px-6 pt-10 pb-8">
        <span className="text-5xl font-serif text-foreground tracking-tight leading-none block">
          {hours}:{minutes}
        </span>
        <span className="text-base font-serif text-muted-foreground mt-2 block">
          {dateStr}
        </span>
      </div>

      {/* Cover cards */}
      <div className="flex-1 px-6">
        <div className="grid grid-cols-2 gap-4">
          {COVER_APPS.map((app, i) => (
            <button
              key={app}
              onClick={(e) => { e.stopPropagation(); onOpenApp(app); }}
              className="relative flex flex-col rounded-sm overflow-hidden transition-transform duration-200 active:scale-[0.97]"
            >
              <div className="relative aspect-[3/4]">
                <img
                  src={COVER_SCREENSHOTS[i]}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
              <div className="flex justify-between items-baseline px-1 pt-2 pb-1">
                <span className="text-xs text-foreground font-serif">{app}</span>
                <span className="text-[10px] text-muted-foreground font-serif">{COVER_META[app]}</span>
              </div>
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
