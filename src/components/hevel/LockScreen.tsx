import React, { useState, useRef, useEffect } from "react";
import { useTheme } from "./ThemeProvider";

interface Props {
  onUnlock: () => void;
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export const LockScreen: React.FC<Props> = ({ onUnlock }) => {
  const { scheme } = useTheme();
  const [time, setTime] = useState(new Date());
  const [dragY, setDragY] = useState(0);
  const [unlocking, setUnlocking] = useState(false);
  const dragRef = useRef({ startY: 0, active: false });

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const hours = time.getHours();
  const minutes = time.getMinutes().toString().padStart(2, "0");
  const dateStr = `${DAYS[time.getDay()]}, ${MONTHS[time.getMonth()]} ${time.getDate()}`;

  // Use 12-hour with no leading zero
  const displayHour = hours % 12 || 12;
  const ampm = hours >= 12 ? "pm" : "am";

  const handlePointerDown = (e: React.PointerEvent) => {
    dragRef.current = { startY: e.clientY, active: true };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current.active) return;
    const dy = dragRef.current.startY - e.clientY;
    if (dy > 0) setDragY(Math.min(dy, 200));
  };

  const handlePointerUp = () => {
    dragRef.current.active = false;
    if (dragY > 100) {
      setUnlocking(true);
      setTimeout(onUnlock, 350);
    } else {
      setDragY(0);
    }
  };

  const progress = Math.min(dragY / 140, 1);

  return (
    <div
      className="absolute inset-0 z-[60] flex flex-col bg-background select-none"
      style={{
        touchAction: "none",
        opacity: unlocking ? 0 : 1,
        transform: unlocking ? "translateY(-100%)" : `translateY(${-dragY * 0.3}px)`,
        transition: unlocking
          ? "opacity 0.35s ease, transform 0.35s cubic-bezier(0.22, 0.9, 0.36, 1)"
          : dragRef.current.active
            ? "none"
            : "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* Top spacer */}
      <div className="flex-1" />

      {/* Time — large, centered, breathing */}
      <div className="px-8 flex flex-col items-center">
        <div className="flex items-baseline gap-1">
          <span
            className="font-serif"
            style={{
              fontSize: 96,
              fontWeight: 300,
              lineHeight: 1,
              letterSpacing: "-0.04em",
              color: "hsl(var(--foreground))",
            }}
          >
            {displayHour}
          </span>
          <span
            className="font-serif"
            style={{
              fontSize: 96,
              fontWeight: 300,
              lineHeight: 1,
              letterSpacing: "-0.04em",
              color: "hsl(var(--foreground) / 0.3)",
            }}
          >
            :
          </span>
          <span
            className="font-serif"
            style={{
              fontSize: 96,
              fontWeight: 300,
              lineHeight: 1,
              letterSpacing: "-0.04em",
              color: "hsl(var(--foreground))",
            }}
          >
            {minutes}
          </span>
          <span
            className="font-serif italic"
            style={{
              fontSize: 18,
              fontWeight: 400,
              color: "hsl(var(--muted-foreground) / 0.4)",
              marginLeft: 4,
              alignSelf: "flex-end",
              marginBottom: 8,
            }}
          >
            {ampm}
          </span>
        </div>

        {/* Date */}
        <span
          className="font-serif italic mt-3"
          style={{
            fontSize: 15,
            color: "hsl(var(--muted-foreground) / 0.4)",
            letterSpacing: "0.02em",
          }}
        >
          {dateStr}
        </span>
      </div>

      {/* Bottom spacer + unlock hint */}
      <div className="flex-1 flex flex-col items-center justify-end pb-10">
        {/* Swipe indicator */}
        <div
          className="flex flex-col items-center gap-2"
          style={{
            opacity: 1 - progress * 2,
            transform: `translateY(${-dragY * 0.2}px)`,
            transition: dragRef.current.active ? "none" : "all 0.4s ease",
          }}
        >
          {/* Animated chevrons */}
          <div className="flex flex-col items-center" style={{ animation: "breathe 2.5s ease-in-out infinite" }}>
            <span
              className="font-serif"
              style={{
                fontSize: 18,
                color: "hsl(var(--muted-foreground) / 0.15)",
                lineHeight: 0.8,
              }}
            >
              ›
            </span>
            <span
              className="font-serif"
              style={{
                fontSize: 18,
                color: "hsl(var(--muted-foreground) / 0.25)",
                lineHeight: 0.8,
                transform: "rotate(-90deg)",
              }}
            >
              ›
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes breathe {
          0%, 100% { opacity: 0.4; transform: translateY(0); }
          50% { opacity: 1; transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
};
