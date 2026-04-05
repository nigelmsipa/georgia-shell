import React, { useState, useRef, useEffect } from "react";
import { useTheme } from "./ThemeProvider";
import { COVER_APPS, COVER_COLORS } from "./types";

interface Props {
  onOpenLauncher: () => void;
  onOpenApp: (name: string) => void;
  onSwipeToNotifications: () => void;
  onOpenSwitcher: () => void;
}

export const HomeScreen: React.FC<Props> = ({
  onOpenLauncher,
  onOpenApp,
  onSwipeToNotifications,
  onOpenSwitcher,
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
      {/* Theme toggle */}
      <div className="flex justify-between items-center px-6 pt-14">
        <button
          onClick={onOpenSwitcher}
          className="text-xs text-muted-foreground font-serif"
        >
          recent apps
        </button>
        <button
          onClick={toggle}
          className="text-xs text-muted-foreground font-serif"
        >
          {theme === "dark" ? "light" : "dark"}
        </button>
      </div>

      {/* Clock */}
      <div className="flex-1 flex flex-col items-center justify-start pt-16">
        <span className="text-8xl font-serif text-foreground tracking-tight leading-none">
          {hours}
        </span>
        <span className="text-8xl font-serif text-foreground tracking-tight leading-none mt-1">
          {minutes}
        </span>
      </div>

      {/* Cover cards */}
      <div className="px-6 pb-6">
        <div className="grid grid-cols-2 gap-3">
          {COVER_APPS.map((app, i) => (
            <button
              key={app}
              onClick={(e) => { e.stopPropagation(); onOpenApp(app); }}
              className={`${COVER_COLORS[i]} aspect-[4/3] rounded-sm flex items-end p-3 transition-transform duration-200 active:scale-95`}
            >
              <span className="text-sm font-serif" style={{ color: "hsl(0 0% 16%)" }}>
                {app}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Drag hint */}
      <div className="flex justify-center pb-8">
        <div className="w-10 h-1 rounded-full bg-muted-foreground opacity-40" />
      </div>
    </div>
  );
};
