import React, { useState, useCallback, useRef } from "react";
import { ALL_APPS } from "./types";

interface Props {
  open: boolean;
  onClose: () => void;
  onOpenApp: (name: string) => void;
}

export const DotsLauncher: React.FC<Props> = ({ open, onClose, onOpenApp }) => {
  const [closing, setClosing] = useState(false);
  const [revealedIdx, setRevealedIdx] = useState<number | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const dismiss = useCallback(() => {
    if (closing) return;
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      setRevealedIdx(null);
      onClose();
    }, 280);
  }, [closing, onClose]);

  if (!open && !closing) return null;
  const isVisible = open && !closing;

  const cols = 4;

  // Handle pointer move over grid to reveal nearest dot
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!gridRef.current) return;
    const rect = gridRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cellW = rect.width / cols;
    const rows = Math.ceil(ALL_APPS.length / cols);
    const cellH = rect.height / rows;
    const col = Math.floor(x / cellW);
    const row = Math.floor(y / cellH);
    const idx = row * cols + col;
    if (idx >= 0 && idx < ALL_APPS.length) {
      setRevealedIdx(idx);
    }
  };

  return (
    <>
      <div
        className="absolute inset-0"
        style={{
          backdropFilter: "blur(32px)",
          WebkitBackdropFilter: "blur(32px)",
          backgroundColor: "hsl(var(--background) / 0.8)",
          zIndex: 44,
          opacity: isVisible ? 1 : 0,
          transition: "opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        onClick={dismiss}
      />

      <div
        className="absolute inset-0 z-50 flex flex-col items-center justify-center"
        style={{
          opacity: isVisible ? 1 : 0,
          transition: "opacity 0.28s ease-out",
          pointerEvents: isVisible ? "auto" : "none",
        }}
        onClick={dismiss}
      >
        {/* Revealed app name */}
        <div
          className="mb-8 h-6 flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <span
            className="font-serif text-[17px] text-foreground/70 transition-all duration-150"
            style={{
              opacity: revealedIdx !== null ? 1 : 0,
              transform: revealedIdx !== null ? "translateY(0)" : "translateY(4px)",
            }}
          >
            {revealedIdx !== null ? ALL_APPS[revealedIdx] : ""}
          </span>
        </div>

        {/* Dots grid */}
        <div
          ref={gridRef}
          className="grid gap-y-5 px-12"
          style={{
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            justifyItems: "center",
            touchAction: "none",
          }}
          onClick={(e) => e.stopPropagation()}
          onPointerMove={handlePointerMove}
          onPointerLeave={() => setRevealedIdx(null)}
        >
          {ALL_APPS.map((app, i) => {
            const isRevealed = revealedIdx === i;
            // Proximity glow: neighbors glow slightly
            const isNeighbor =
              revealedIdx !== null &&
              (Math.abs(i - revealedIdx) === 1 ||
                Math.abs(i - revealedIdx) === cols);

            return (
              <button
                key={app}
                onClick={() => { onOpenApp(app); dismiss(); }}
                onMouseEnter={() => setRevealedIdx(i)}
                className="flex items-center justify-center transition-all duration-200"
                style={{
                  width: 44,
                  height: 44,
                }}
              >
                <div
                  className="rounded-full transition-all duration-200"
                  style={{
                    width: isRevealed ? 14 : isNeighbor ? 8 : 5,
                    height: isRevealed ? 14 : isNeighbor ? 8 : 5,
                    backgroundColor: isRevealed
                      ? "hsl(var(--foreground) / 0.7)"
                      : isNeighbor
                      ? "hsl(var(--foreground) / 0.2)"
                      : "hsl(var(--foreground) / 0.1)",
                    boxShadow: isRevealed
                      ? "0 0 12px hsl(var(--foreground) / 0.15)"
                      : "none",
                  }}
                />
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
