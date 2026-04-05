import React, { useState, useCallback } from "react";
import { ALL_APPS, RECENT_APPS } from "./types";

interface Props {
  open: boolean;
  onClose: () => void;
  onOpenApp: (name: string) => void;
}

// Weight apps: recently used get larger sizes
const getWeight = (app: string): number => {
  const recent = RECENT_APPS.find((r) => r.name === app);
  if (!recent) return 0;
  if (recent.lastUsed <= 10) return 3;
  if (recent.lastUsed <= 30) return 2;
  if (recent.lastUsed <= 120) return 1;
  return 0;
};

const WEIGHT_STYLES: Record<number, string> = {
  3: "text-[28px] leading-tight text-foreground/90",
  2: "text-[21px] leading-snug text-foreground/60",
  1: "text-[16px] leading-normal text-foreground/40",
  0: "text-[13px] leading-normal text-foreground/20",
};

export const TypographicLauncher: React.FC<Props> = ({ open, onClose, onOpenApp }) => {
  const [closing, setClosing] = useState(false);
  const [hoveredApp, setHoveredApp] = useState<string | null>(null);

  const dismiss = useCallback(() => {
    if (closing) return;
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onClose();
    }, 280);
  }, [closing, onClose]);

  if (!open && !closing) return null;
  const isVisible = open && !closing;

  // Sort: heaviest first, then alphabetical within same weight
  const sorted = [...ALL_APPS].sort((a, b) => {
    const wa = getWeight(a);
    const wb = getWeight(b);
    if (wb !== wa) return wb - wa;
    return a.localeCompare(b);
  });

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
        className="absolute inset-0 z-50 flex items-center justify-center"
        style={{
          opacity: isVisible ? 1 : 0,
          transition: "opacity 0.28s ease-out",
          pointerEvents: isVisible ? "auto" : "none",
        }}
        onClick={dismiss}
      >
        <div
          className="px-8 py-10 max-w-full max-h-[80%] overflow-y-auto hide-scrollbar"
          onClick={(e) => e.stopPropagation()}
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "baseline",
            gap: "6px 14px",
            alignContent: "center",
            justifyContent: "center",
          }}
        >
          {sorted.map((app) => {
            const weight = getWeight(app);
            const isHovered = hoveredApp === app;
            return (
              <button
                key={app}
                onClick={() => { onOpenApp(app); dismiss(); }}
                onMouseEnter={() => setHoveredApp(app)}
                onMouseLeave={() => setHoveredApp(null)}
                className={`font-serif transition-all duration-200 ${WEIGHT_STYLES[weight]}`}
                style={{
                  opacity: isHovered ? 1 : undefined,
                  transform: isHovered ? "scale(1.05)" : "scale(1)",
                  color: isHovered ? "hsl(var(--foreground))" : undefined,
                }}
              >
                {app}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
