import React, { useRef, useState } from "react";
import { AtmosphericBg } from "../AtmosphericBg";

interface Props {
  appName: string;
  onClose: () => void;
  onOpenUtilityDrawer?: () => void;
  children: React.ReactNode;
}

/**
 * Shared shell for mock Havel apps. Provides:
 *  - AtmosphericBg + status bar with whisper app name
 *  - Swipe-down-from-top to close
 *  - Swipe-up-from-bottom to open the utility drawer
 *  - Rubber-band drag affordance while pulling down
 */
export const AppScreen: React.FC<Props> = ({
  appName,
  onClose,
  onOpenUtilityDrawer,
  children,
}) => {
  const dragRef = useRef({ startY: 0, startX: 0, fromTop: false, fromBottom: false, dragging: false });
  const containerRef = useRef<HTMLDivElement>(null);
  const [pull, setPull] = useState(0);
  const [time, setTime] = useState(new Date());

  React.useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const hours = time.getHours().toString().padStart(2, "0");
  const minutes = time.getMinutes().toString().padStart(2, "0");

  const handlePointerDown = (e: React.PointerEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    dragRef.current = {
      startY: e.clientY,
      startX: e.clientX,
      fromTop: e.clientY < rect.top + 80,
      fromBottom: e.clientY > rect.bottom - 60,
      dragging: true,
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current.dragging) return;
    if (!dragRef.current.fromTop) return;
    const dy = e.clientY - dragRef.current.startY;
    if (dy > 0) setPull(Math.min(dy, 200));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!dragRef.current.dragging) return;
    const dy = dragRef.current.startY - e.clientY;
    const { fromTop, fromBottom } = dragRef.current;
    dragRef.current.dragging = false;

    if (fromTop && -dy > 80) {
      onClose();
    } else if (fromBottom && dy > 80 && onOpenUtilityDrawer) {
      onOpenUtilityDrawer();
    }
    setPull(0);
  };

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-50 flex flex-col select-none"
      style={{
        touchAction: "none",
        transform: `translateY(${pull * 0.4}px)`,
        opacity: 1 - pull / 600,
        transition: pull === 0 ? "transform 0.4s cubic-bezier(0.16,1,0.3,1), opacity 0.4s ease" : "none",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <AtmosphericBg />

      {/* Status bar — time on left, whisper app name centered */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-12 pb-3">
        <span
          className="font-serif tracking-tight"
          style={{
            fontSize: 13,
            color: "hsl(var(--foreground) / 0.45)",
            letterSpacing: "0.02em",
          }}
        >
          {hours}:{minutes}
        </span>
        <span
          className="font-serif italic"
          style={{
            fontSize: 11,
            color: "hsl(var(--muted-foreground) / 0.35)",
            letterSpacing: "0.08em",
          }}
        >
          {appName.toLowerCase()}
        </span>
        <span style={{ width: 32 }} />
      </div>

      {/* Drag hint at top */}
      <div className="relative z-10 flex justify-center" style={{ marginTop: -4, marginBottom: 4 }}>
        <div
          className="rounded-full"
          style={{
            width: 32,
            height: 3,
            background: "hsl(var(--muted-foreground) / 0.15)",
            opacity: pull > 0 ? Math.min(1, 0.3 + pull / 100) : 0.4,
            transition: "opacity 0.2s ease",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
};
