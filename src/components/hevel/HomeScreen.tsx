import React, { useState, useRef, useEffect } from "react";
import { AtmosphericBg } from "./AtmosphericBg";

interface Props {
  onOpenApp: (name: string) => void;
  onSwipeToNotifications: () => void;
  onOpenControlCenter: () => void;
  onOpenUtilityDrawer?: () => void;
  onOpenLauncher: () => void;
}

/**
 * Text-first home surface. Deliberately no icon grid — the launcher
 * (ProseLauncher) is the only way to reach an app. Live cover previews
 * live exclusively in AppSwitcher.
 */
export const HomeScreen: React.FC<Props> = ({
  onSwipeToNotifications,
  onOpenControlCenter,
  onOpenUtilityDrawer,
  onOpenLauncher,
}) => {
  const [time, setTime] = useState(new Date());
  const dragRef = useRef({ startY: 0, startX: 0, dragging: false });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const hours = time.getHours().toString().padStart(2, "0");
  const minutes = time.getMinutes().toString().padStart(2, "0");

  const weekday = time.toLocaleDateString(undefined, { weekday: "long" }).toLowerCase();
  const month = time.toLocaleDateString(undefined, { month: "long" }).toLowerCase();
  const day = time.getDate();

  const handlePointerDown = (e: React.PointerEvent) => {
    dragRef.current = { startY: e.clientY, startX: e.clientX, dragging: true };
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!dragRef.current.dragging) return;
    const dy = dragRef.current.startY - e.clientY;
    const dx = dragRef.current.startX - e.clientX;
    dragRef.current.dragging = false;

    const rect = containerRef.current?.getBoundingClientRect();
    const startedFromBottom = rect ? dragRef.current.startY > rect.bottom - 60 : false;

    if (dy > 80 && startedFromBottom && onOpenUtilityDrawer) {
      onOpenUtilityDrawer();
    } else if (dy > 40) {
      onOpenLauncher();
    } else if (dy < -60) {
      onOpenControlCenter();
    } else if (dx > 60) {
      onSwipeToNotifications();
    }
  };

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 flex flex-col select-none"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      style={{ touchAction: "none" }}
    >
      <AtmosphericBg />

      {/* status bar */}
      <div className="flex justify-center items-center px-5 pt-12 pb-3 relative z-10">
        <span
          className="tracking-tight"
          style={{
            fontSize: 15,
            fontWeight: 500,
            color: "hsl(var(--foreground) / 0.5)",
            letterSpacing: "0.02em",
          }}
        >
          {hours}:{minutes}
        </span>
      </div>

      {/* Text-first centerpiece: date, clock, prose */}
      <div className="flex-1 flex flex-col justify-center px-8 relative z-10">
        <div
          className="italic"
          style={{
            fontSize: 13,
            letterSpacing: "0.08em",
            color: "hsl(var(--muted-foreground) / 0.5)",
            marginBottom: 8,
          }}
        >
          {weekday}, {month} {day}
        </div>

        <div
          className="italic"
          style={{
            fontSize: 72,
            fontWeight: 700,
            lineHeight: 0.95,
            color: "hsl(var(--foreground) / 0.9)",
            letterSpacing: "-0.02em",
          }}
        >
          {hours}
          <span style={{ color: "hsl(var(--primary))" }}>:</span>
          {minutes}
        </div>

        <p
          className="italic mt-10"
          style={{
            fontSize: 15,
            lineHeight: 1.55,
            color: "hsl(var(--foreground) / 0.55)",
            maxWidth: 260,
          }}
        >
          swipe up to{" "}
          <span
            onPointerUp={(e) => {
              e.stopPropagation();
              onOpenLauncher();
            }}
            style={{ color: "hsl(var(--primary))", fontWeight: 700 }}
          >
            find an app
          </span>
          , down for{" "}
          <span
            onPointerUp={(e) => {
              e.stopPropagation();
              onOpenControlCenter();
            }}
            style={{ color: "hsl(var(--foreground) / 0.8)", fontWeight: 600 }}
          >
            controls
          </span>
          , right for{" "}
          <span
            onPointerUp={(e) => {
              e.stopPropagation();
              onSwipeToNotifications();
            }}
            style={{ color: "hsl(var(--foreground) / 0.8)", fontWeight: 600 }}
          >
            notifications
          </span>
          .
        </p>
      </div>

      {/* subtle drag hint */}
      <div className="flex justify-center py-4 relative z-10">
        <div
          className="w-8 h-[3px] rounded-full"
          style={{ backgroundColor: "hsl(var(--muted-foreground) / 0.12)" }}
        />
      </div>
    </div>
  );
};
