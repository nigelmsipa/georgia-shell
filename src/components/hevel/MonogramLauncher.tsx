import React, { useState, useCallback } from "react";
import { ALL_APPS } from "./types";

interface Props {
  open: boolean;
  onClose: () => void;
  onOpenApp: (name: string) => void;
}

export const MonogramLauncher: React.FC<Props> = ({ open, onClose, onOpenApp }) => {
  const [closing, setClosing] = useState(false);
  const [focusedApp, setFocusedApp] = useState<string | null>(null);

  const dismiss = useCallback(() => {
    if (closing) return;
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      setFocusedApp(null);
      onClose();
    }, 280);
  }, [closing, onClose]);

  if (!open && !closing) return null;
  const isVisible = open && !closing;

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
        {/* Monogram label — shows full name of focused app */}
        <div
          className="mb-6 h-5 flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <span
            className="font-serif text-[13px] text-foreground/40 transition-opacity duration-200"
            style={{ opacity: focusedApp ? 1 : 0 }}
          >
            {focusedApp || ""}
          </span>
        </div>

        {/* Monogram grid */}
        <div
          className="grid gap-4 px-8"
          style={{ gridTemplateColumns: "repeat(4, 1fr)" }}
          onClick={(e) => e.stopPropagation()}
        >
          {ALL_APPS.map((app) => {
            const letter = app[0].toUpperCase();
            const isFocused = focusedApp === app;
            return (
              <button
                key={app}
                onClick={() => { onOpenApp(app); dismiss(); }}
                onMouseEnter={() => setFocusedApp(app)}
                onMouseLeave={() => setFocusedApp(null)}
                className="flex items-center justify-center transition-all duration-200"
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  border: `1px solid hsl(var(--foreground) / ${isFocused ? "0.25" : "0.08"})`,
                  backgroundColor: isFocused
                    ? "hsl(var(--foreground) / 0.06)"
                    : "transparent",
                  transform: isFocused ? "scale(1.1)" : "scale(1)",
                }}
              >
                <span
                  className="font-serif transition-colors duration-200"
                  style={{
                    fontSize: 20,
                    color: isFocused
                      ? "hsl(var(--foreground) / 0.9)"
                      : "hsl(var(--foreground) / 0.3)",
                  }}
                >
                  {letter}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
