import React, { useState, useRef, useEffect, useCallback } from "react";
import { COVER_APPS, ALL_APPS } from "./types";
import { AtmosphericBg } from "./AtmosphericBg";
import { SignalCover } from "./covers/SignalCover";
import { TerminalCover } from "./covers/TerminalCover";
import { FirefoxCover } from "./covers/FirefoxCover";
import { NotesCover } from "./covers/NotesCover";
import { MessagesCover } from "./covers/MessagesCover";
import { MusicCover } from "./covers/MusicCover";

const COVER_COMPONENTS: Record<string, React.FC> = {
  Signal: SignalCover,
  Terminal: TerminalCover,
  Firefox: FirefoxCover,
  Notes: NotesCover,
  Messages: MessagesCover,
  Music: MusicCover,
};

const SORTED_APPS = [...ALL_APPS].sort();

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

  // Scrubber state
  const [scrubbing, setScrubbing] = useState(false);
  const [scrubIndex, setScrubIndex] = useState(-1);
  const [fadingOut, setFadingOut] = useState(false);
  const scrubZoneRef = useRef<HTMLDivElement>(null);

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

  // Scrubber handlers
  const calcIndex = useCallback((clientY: number) => {
    const zone = scrubZoneRef.current;
    if (!zone) return -1;
    const rect = zone.getBoundingClientRect();
    const y = clientY - rect.top;
    const ratio = y / rect.height;
    return Math.max(0, Math.min(SORTED_APPS.length - 1, Math.floor(ratio * SORTED_APPS.length)));
  }, []);

  const handleScrubStart = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setScrubbing(true);
    setFadingOut(false);
    setScrubIndex(calcIndex(e.clientY));
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleScrubMove = (e: React.PointerEvent) => {
    if (!scrubbing) return;
    const newIdx = calcIndex(e.clientY);
    if (newIdx !== scrubIndex) {
      setScrubIndex(newIdx);
    }
  };

  const handleScrubEnd = () => {
    if (!scrubbing) return;
    if (scrubIndex >= 0 && scrubIndex < SORTED_APPS.length) {
      onOpenApp(SORTED_APPS[scrubIndex]);
    }
    setFadingOut(true);
    setTimeout(() => {
      setScrubbing(false);
      setFadingOut(false);
      setScrubIndex(-1);
    }, 200);
  };

  const scrubActive = scrubbing && !fadingOut;

  return (
    <div
      className="absolute inset-0 flex flex-col select-none"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      style={{ touchAction: "none" }}
    >
      <AtmosphericBg />
      {/* Status bar */}
      <div className="flex justify-between items-center px-6 pt-14 pb-2 relative z-10">
        <span
          className="text-sm font-serif tracking-tight"
          style={{ color: "hsl(var(--foreground) / 0.6)" }}
        >
          {hours}:{minutes}
        </span>
        <div className="flex items-center gap-1.5">
          <span
            className="text-[10px] font-serif tracking-wider"
            style={{ color: "hsl(var(--muted-foreground) / 0.3)" }}
          >
            ▲▲
          </span>
          <span
            className="text-xs font-serif"
            style={{ color: "hsl(var(--muted-foreground) / 0.4)" }}
          >
            78%
          </span>
        </div>
      </div>

      {/* Cover cards — shifts left & blurs when scrubbing */}
      <div
        className="flex-1 px-4 pt-6 pb-2 overflow-hidden"
        style={{
          filter: scrubActive ? "blur(8px) brightness(0.7)" : "none",
          transform: scrubActive ? "translateX(-20px) scale(0.97)" : "translateX(0) scale(1)",
          transition: "filter 0.35s cubic-bezier(0.16,1,0.3,1), transform 0.35s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        <div className="grid grid-cols-3 gap-3">
          {COVER_APPS.map((app) => {
            const Cover = COVER_COMPONENTS[app];
            return (
              <button
                key={app}
                onClick={(e) => { e.stopPropagation(); onOpenApp(app); }}
                className="relative rounded-[24px] overflow-hidden transition-transform duration-200 active:scale-[0.97] glass-surface"
                style={{ aspectRatio: "3/4" }}
              >
                {Cover && <Cover />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Drag hint */}
      <div
        className="flex justify-center py-6"
        style={{
          opacity: scrubActive ? 0 : 1,
          transition: "opacity 0.2s ease",
        }}
      >
        <div
          className="w-10 h-1 rounded-full"
          style={{ backgroundColor: "hsl(var(--muted-foreground) / 0.15)" }}
        />
      </div>

      {/* Scrubber touch zone — always present, invisible */}
      <div
        ref={scrubZoneRef}
        className="absolute right-0 top-16 bottom-16 w-10 z-30"
        style={{ touchAction: "none" }}
        onPointerDown={handleScrubStart}
        onPointerMove={handleScrubMove}
        onPointerUp={handleScrubEnd}
        onPointerCancel={handleScrubEnd}
      />

      {/* Scrubber overlay list */}
      {(scrubbing) && (
        <div
          className="absolute right-0 top-16 bottom-16 w-48 z-20 flex flex-col justify-center glass-surface"
          style={{
            borderRadius: "16px 0 0 16px",
            opacity: fadingOut ? 0 : 1,
            transform: fadingOut ? "translateX(12px)" : "translateX(0)",
            transition: "opacity 0.2s ease, transform 0.2s ease",
          }}
        >
          <div className="flex flex-col items-start py-2 px-1 overflow-hidden h-full justify-center">
            {SORTED_APPS.map((app, i) => {
              const isActive = i === scrubIndex;
              const dist = Math.abs(i - scrubIndex);
              const opacity = dist === 0 ? 1 : dist <= 2 ? 0.6 : dist <= 4 ? 0.3 : 0.12;

              return (
                <div
                  key={app}
                  className="w-full px-3 flex items-center shrink-0"
                  style={{
                    height: isActive ? "28px" : "22px",
                    opacity,
                    transition: "all 0.12s ease-out",
                  }}
                >
                  <span
                    className={`font-serif truncate ${
                      isActive
                        ? "text-base font-semibold italic"
                        : "text-xs"
                    }`}
                    style={{
                      color: isActive
                        ? "hsl(var(--primary))"
                        : "hsl(var(--foreground) / 0.85)",
                      transition: "all 0.12s ease-out",
                    }}
                  >
                    {app}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
