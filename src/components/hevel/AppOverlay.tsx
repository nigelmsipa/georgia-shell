import React, { useRef } from "react";
import { AtmosphericBg } from "./AtmosphericBg";

interface Props {
  appName: string;
  onClose: () => void;
  onOpenUtilityDrawer?: () => void;
}

export const AppOverlay: React.FC<Props> = ({ appName, onClose, onOpenUtilityDrawer }) => {
  const dragRef = useRef({ startY: 0, dragging: false });
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    dragRef.current = { startY: e.clientY, dragging: true };
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!dragRef.current.dragging) return;
    const dy = dragRef.current.startY - e.clientY;
    dragRef.current.dragging = false;

    const rect = containerRef.current?.getBoundingClientRect();
    const fromBottom = rect ? dragRef.current.startY > rect.bottom - 60 : false;

    if (dy > 80 && fromBottom && onOpenUtilityDrawer) {
      onOpenUtilityDrawer();
    }
  };

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-50 flex flex-col items-center justify-center"
      style={{ transition: "opacity 0.3s ease-out", touchAction: "none" }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      <AtmosphericBg />
      <span
        className="text-3xl font-serif mb-8"
        style={{ color: "hsl(var(--foreground) / 0.85)", textShadow: "0 0 40px rgba(215, 153, 33, 0.08)" }}
      >
        {appName}
      </span>
      <button
        onClick={onClose}
        className="font-serif text-lg transition-colors duration-200"
        style={{ color: "hsl(var(--muted-foreground) / 0.4)" }}
      >
        ← back
      </button>
    </div>
  );
};
