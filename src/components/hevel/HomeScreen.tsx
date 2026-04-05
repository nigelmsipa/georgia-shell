import React, { useState, useRef, useEffect } from "react";
import { useTheme } from "./ThemeProvider";
import { COVER_APPS } from "./types";
import screenshotFirefox from "@/assets/screenshot-firefox.jpg";
import screenshotTerminal from "@/assets/screenshot-terminal.jpg";
import screenshotSignal from "@/assets/screenshot-signal.jpg";
import screenshotNotes from "@/assets/screenshot-notes.jpg";

const COVER_SCREENSHOTS = [screenshotFirefox, screenshotTerminal, screenshotSignal, screenshotNotes];

const COVER_META: Record<string, { subtitle: string; detail: string }> = {
  Firefox: { subtitle: "Wikipedia — Lichen", detail: "3 tabs" },
  Terminal: { subtitle: "~/.config", detail: "active" },
  Signal: { subtitle: "Alex", detail: "2 unread" },
  Notes: { subtitle: "Shopping list", detail: "edited 4m ago" },
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
  const { toggle, theme } = useTheme();
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

    if (dy > 80) {
      onOpenLauncher();
    } else if (dy < -60) {
      onOpenControlCenter();
    } else if (dx > 60) {
      onSwipeToNotifications();
    }
  };

  return (
    <div
      className="absolute inset-0 flex flex-col bg-background select-none"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      style={{ touchAction: "none" }}
    >
      {/* Top bar */}
      <div className="flex justify-between items-center px-5 pt-12 pb-1">
        <button
          onClick={onOpenSwitcher}
          className="text-[10px] text-muted-foreground font-serif"
        >
          recent
        </button>
        <button
          onClick={toggle}
          className="text-[10px] text-muted-foreground font-serif"
        >
          {theme === "dark" ? "light" : "dark"}
        </button>
      </div>

      {/* Clock row — compact, horizontal */}
      <div className="px-5 pt-2 pb-4">
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-serif text-foreground tracking-tight leading-none">
            {hours}:{minutes}
          </span>
        </div>
        <span className="text-sm font-serif text-muted-foreground mt-1 block">
          {dateStr}
        </span>
      </div>

      {/* At-a-glance info strip */}
      <div className="px-5 pb-4 flex gap-4">
        <div className="flex-1 bg-card rounded-sm px-3 py-2">
          <span className="text-[10px] text-muted-foreground font-serif block">weather</span>
          <span className="text-sm text-foreground font-serif">18° partly cloudy</span>
        </div>
        <div className="flex-1 bg-card rounded-sm px-3 py-2">
          <span className="text-[10px] text-muted-foreground font-serif block">next</span>
          <span className="text-sm text-foreground font-serif">Design sync 2:30p</span>
        </div>
      </div>

      {/* Cover cards — 2×2 with labels */}
      <div className="flex-1 px-5 pb-2 min-h-0">
        <div className="grid grid-cols-2 gap-3 h-full">
          {COVER_APPS.map((app, i) => {
            const meta = COVER_META[app];
            return (
              <button
                key={app}
                onClick={(e) => { e.stopPropagation(); onOpenApp(app); }}
                className="relative flex flex-col rounded-sm overflow-hidden transition-transform duration-200 active:scale-[0.97]"
              >
                {/* Screenshot */}
                <div className="relative flex-1 min-h-0">
                  <img
                    src={COVER_SCREENSHOTS[i]}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
                {/* Info bar */}
                <div className="bg-card px-2.5 py-2 flex justify-between items-baseline">
                  <div className="min-w-0">
                    <span className="text-xs text-foreground font-serif block truncate">{app}</span>
                    <span className="text-[10px] text-muted-foreground font-serif block truncate">
                      {meta.subtitle}
                    </span>
                  </div>
                  <span className="text-[9px] text-muted-foreground font-serif whitespace-nowrap ml-1">
                    {meta.detail}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Drag hint */}
      <div className="flex justify-center py-4">
        <div className="w-10 h-1 rounded-full bg-muted-foreground opacity-30" />
      </div>
    </div>
  );
};
