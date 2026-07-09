import React, { useState, useRef } from "react";
import { RECENT_APPS, type AppEntry } from "./types";

interface Props {
  open: boolean;
  onClose: () => void;
  onOpenApp: (name: string) => void;
}

const formatAgo = (m: number) => (m < 60 ? `${m}m ago` : `${Math.floor(m / 60)}h ago`);

export const AppSwitcher: React.FC<Props> = ({ open, onClose, onOpenApp }) => {
  const [apps, setApps] = useState<AppEntry[]>(RECENT_APPS);
  const [focusedIdx, setFocusedIdx] = useState(0);
  const swipeRef = useRef<{ startX: number; idx: number } | null>(null);
  const [swipeOffsets, setSwipeOffsets] = useState<Record<number, number>>({});
  const [dismissing, setDismissing] = useState<number | null>(null);

  const handleSwipeStart = (e: React.PointerEvent, idx: number) => {
    swipeRef.current = { startX: e.clientX, idx };
  };

  const handleSwipeMove = (e: React.PointerEvent) => {
    if (!swipeRef.current) return;
    const dx = e.clientX - swipeRef.current.startX;
    if (dx < 0) {
      setSwipeOffsets((o) => ({ ...o, [swipeRef.current!.idx]: dx }));
    }
  };

  const handleSwipeEnd = () => {
    if (!swipeRef.current) return;
    const offset = swipeOffsets[swipeRef.current.idx] || 0;
    const idx = swipeRef.current.idx;

    if (offset < -120) {
      setDismissing(idx);
      setTimeout(() => {
        setApps((a) => a.filter((_, i) => i !== idx));
        setSwipeOffsets({});
        setDismissing(null);
        setFocusedIdx((f) => Math.min(f, apps.length - 2));
      }, 250);
    } else {
      setSwipeOffsets((o) => ({ ...o, [idx]: 0 }));
    }
    swipeRef.current = null;
  };

  const clearAll = () => {
    setApps([]);
    setTimeout(onClose, 200);
  };

  // Dot scrubber
  const handleDotDrag = (e: React.PointerEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const y = e.clientY - rect.top;
    const idx = Math.floor((y / rect.height) * apps.length);
    setFocusedIdx(Math.max(0, Math.min(apps.length - 1, idx)));
  };

  if (!open) return null;

  return (
    <div
      className="absolute inset-0 z-40 flex flex-col bg-background"
      style={{ transition: "opacity 0.3s ease-out" }}
    >
      {/* Header */}
      <div className="px-6 pt-14 pb-4 flex justify-between items-center">
        <span className="text-xl text-foreground font-serif">recent</span>
        <button onClick={onClose} className="text-sm text-muted-foreground font-serif">
          done
        </button>
      </div>

      {/* List + dot scrubber */}
      <div
        className="flex flex-1 overflow-hidden"
        onPointerMove={handleSwipeMove}
        onPointerUp={handleSwipeEnd}
        style={{ touchAction: "none" }}
      >
        <div className="flex-1 overflow-y-auto px-6">
          {apps.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <span className="text-muted-foreground font-serif">nothing running</span>
            </div>
          )}
          {apps.map((app, i) => {
            const offset = swipeOffsets[i] || 0;
            const isDismissing = dismissing === i;
            return (
              <div
                key={`${app.name}-${i}`}
                className="relative overflow-hidden"
                style={{
                  transition: isDismissing ? "all 0.25s ease-in" : offset === 0 ? "transform 0.2s ease-out" : "none",
                  opacity: isDismissing ? 0 : 1,
                  height: isDismissing ? 0 : "auto",
                }}
              >
                {/* Red background layer */}
                <div className="absolute inset-0 bg-destructive flex items-center justify-end pr-6">
                  <span className="text-destructive-foreground font-serif text-sm">close</span>
                </div>
                {/* Foreground row */}
                <div
                  className={`relative bg-background py-4 cursor-pointer transition-colors duration-150 ${
                    i === focusedIdx ? "bg-secondary/50" : ""
                  }`}
                  style={{ transform: `translateX(${offset}px)` }}
                  onPointerDown={(e) => handleSwipeStart(e, i)}
                  onClick={() => setFocusedIdx(i)}
                  onDoubleClick={() => { onOpenApp(app.name); onClose(); }}
                >
                  <div className="text-xl text-foreground font-serif">{app.name}</div>
                  <div className="text-xs text-muted-foreground font-serif mt-1">
                    {formatAgo(app.lastUsed)}
                  </div>
                </div>
                {i < apps.length - 1 && <div className="h-px bg-border" />}
              </div>
            );
          })}
        </div>

        {/* Dot scrubber */}
        {apps.length > 0 && (
          <div
            className="flex flex-col items-center justify-center w-6 mr-2 select-none"
            onPointerDown={(e) => handleDotDrag(e)}
            onPointerMove={(e) => { if (e.buttons > 0) handleDotDrag(e); }}
            style={{ touchAction: "none" }}
          >
            {apps.map((_, i) => (
              <div
                key={i}
                className={`rounded-full my-1 transition-all duration-150 ${
                  i === focusedIdx
                    ? "w-3 h-3 bg-accent"
                    : "w-1.5 h-1.5 bg-muted-foreground/50"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Clear all */}
      {apps.length > 0 && (
        <div className="flex justify-center pb-8 pt-4">
          <button onClick={clearAll} className="text-sm text-muted-foreground font-serif">
            clear all
          </button>
        </div>
      )}
    </div>
  );
};
