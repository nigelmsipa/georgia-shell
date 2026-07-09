import React, { useEffect, useRef, useState } from "react";
import { RECENT_APPS, type AppEntry } from "./types";
import { NAV_ZONE_HEIGHT_DP } from "./nav-contract";
import { COVER_COMPONENTS } from "./covers/registry";

interface Props {
  open: boolean;
  /** When entering the switcher from an open app, that app is focused + scrolled into view */
  focusApp: string | null;
  onPickApp: (name: string) => void;
  onBack: () => void;
  onClearAll: () => void;
}

const formatAgo = (m: number) => (m < 60 ? `${m}m ago` : `${Math.floor(m / 60)}h ago`);

export const AppSwitcher: React.FC<Props> = ({ open, focusApp, onPickApp, onBack, onClearAll }) => {
  const [apps, setApps] = useState<AppEntry[]>(RECENT_APPS);
  const [focusedIdx, setFocusedIdx] = useState(0);
  const swipeRef = useRef<{ startX: number; idx: number } | null>(null);
  const [swipeOffsets, setSwipeOffsets] = useState<Record<number, number>>({});
  const [dismissing, setDismissing] = useState<number | null>(null);
  const rowRefs = useRef<Record<number, HTMLDivElement | null>>({});

  // If we entered from an open app, ensure it's at the top of recents and focused
  useEffect(() => {
    if (!open || !focusApp) return;
    setApps((prev) => {
      const rest = prev.filter((a) => a.name !== focusApp);
      return [{ name: focusApp, lastUsed: 0 }, ...rest];
    });
    setFocusedIdx(0);
    // scroll into view next tick
    requestAnimationFrame(() => rowRefs.current[0]?.scrollIntoView({ block: "nearest" }));
  }, [open, focusApp]);

  const handleSwipeStart = (e: React.PointerEvent, idx: number) => {
    swipeRef.current = { startX: e.clientX, idx };
  };
  const handleSwipeMove = (e: React.PointerEvent) => {
    if (!swipeRef.current) return;
    const dx = e.clientX - swipeRef.current.startX;
    if (dx < 0) setSwipeOffsets((o) => ({ ...o, [swipeRef.current!.idx]: dx }));
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

  const handleDotDrag = (e: React.PointerEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const y = e.clientY - rect.top;
    const idx = Math.floor((y / rect.height) * apps.length);
    setFocusedIdx(Math.max(0, Math.min(apps.length - 1, idx)));
  };

  if (!open) return null;

  return (
    <div
      className="absolute inset-0 z-40 flex flex-col bg-background/95 backdrop-blur-md"
      style={{ transition: "opacity 0.3s ease-out", paddingBottom: NAV_ZONE_HEIGHT_DP }}
    >
      {/* Header */}
      <div className="px-6 pt-14 pb-4 flex justify-between items-center">
        <span className="text-title text-foreground">recent</span>
        <button onClick={onBack} className="tap-target text-caption text-muted-foreground">
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
              <span className="text-muted-foreground">nothing running</span>
            </div>
          )}
          {apps.map((app, i) => {
            const offset = swipeOffsets[i] || 0;
            const isDismissing = dismissing === i;
            return (
              <div
                key={`${app.name}-${i}`}
                ref={(el) => { rowRefs.current[i] = el; }}
                className="relative overflow-hidden"
                style={{
                  transition: isDismissing ? "all 0.25s ease-in" : offset === 0 ? "transform 0.2s ease-out" : "none",
                  opacity: isDismissing ? 0 : 1,
                  height: isDismissing ? 0 : "auto",
                }}
              >
                <div className="absolute inset-0 bg-destructive flex items-center justify-end pr-6">
                  <span className="text-destructive-foreground text-caption">close</span>
                </div>
                <div
                  className={`relative bg-background py-4 cursor-pointer transition-colors duration-150 ${
                    i === focusedIdx ? "bg-secondary/50" : ""
                  }`}
                  style={{ transform: `translateX(${offset}px)` }}
                  onPointerDown={(e) => handleSwipeStart(e, i)}
                  onClick={() => setFocusedIdx(i)}
                  onDoubleClick={() => onPickApp(app.name)}
                >
                  <div className="text-title text-foreground">{app.name}</div>
                  <div className="text-caption text-muted-foreground mt-1">
                    {formatAgo(app.lastUsed)}
                    {i === focusedIdx && (
                      <>
                        {" · "}
                        <button
                          onClick={(e) => { e.stopPropagation(); onPickApp(app.name); }}
                          className="italic text-foreground/80"
                        >
                          open
                        </button>
                      </>
                    )}
                  </div>
                </div>
                {i < apps.length - 1 && <div className="h-px bg-border" />}
              </div>
            );
          })}
        </div>

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
                  i === focusedIdx ? "w-3 h-3 bg-accent" : "w-1.5 h-1.5 bg-muted-foreground/50"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {apps.length > 0 && (
        <div className="flex justify-center pb-8 pt-4">
          <button onClick={onClearAll} className="tap-target text-caption text-muted-foreground">
            clear all
          </button>
        </div>
      )}
    </div>
  );
};
