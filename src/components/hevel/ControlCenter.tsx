import React, { useState, useRef } from "react";
import { useTheme, ALL_SCHEMES, type ThemeScheme } from "./ThemeProvider";

interface Props {
  open: boolean;
  onClose: () => void;
}

const toggleItems = [
  { id: "wifi", label: "wifi", defaultOn: true },
  { id: "bt", label: "bluetooth", defaultOn: false },
  { id: "airplane", label: "airplane", defaultOn: false },
  { id: "location", label: "location", defaultOn: true },
  { id: "dnd", label: "do not disturb", defaultOn: false },
  { id: "hotspot", label: "hotspot", defaultOn: false },
];

export const ControlCenter: React.FC<Props> = ({ open, onClose }) => {
  const { scheme, setScheme } = useTheme();
  const [toggles, setToggles] = useState<Record<string, boolean>>(
    Object.fromEntries(toggleItems.map((t) => [t.id, t.defaultOn]))
  );
  const [brightness, setBrightness] = useState(70);
  const [volume, setVolume] = useState(45);
  const dragRef = useRef({ startY: 0 });

  const flip = (id: string) =>
    setToggles((t) => ({ ...t, [id]: !t[id] }));

  const handleSlider = (
    e: React.PointerEvent,
    setter: (v: number) => void
  ) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const pct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    setter(Math.round(pct));
  };

  const handleDragStart = (e: React.PointerEvent) => {
    dragRef.current.startY = e.clientY;
  };

  const handleDragEnd = (e: React.PointerEvent) => {
    if (e.clientY - dragRef.current.startY > 80) {
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div
      className="absolute inset-0 z-40 flex flex-col"
      style={{
        backgroundColor: "hsl(var(--background) / 0.94)",
        backdropFilter: "blur(16px)",
        transition: "opacity 0.3s ease-out",
      }}
      onPointerDown={handleDragStart}
      onPointerUp={handleDragEnd}
    >
      {/* Header */}
      <div className="px-6 pt-14 pb-2 flex justify-between items-center">
        <span className="text-xl text-foreground font-serif">control center</span>
        <button onClick={onClose} className="text-sm text-muted-foreground font-serif">
          done
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-8" onPointerDown={(e) => e.stopPropagation()}>
        {/* Ambience — at top, inline with content, hidden scrollbar */}
        <div className="mt-4">
          <div
            className="flex gap-2.5 overflow-x-auto pb-1 hide-scrollbar"
            style={{
              scrollSnapType: "x mandatory",
              WebkitOverflowScrolling: "touch",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {ALL_SCHEMES.map(([id, meta]) => {
              const active = scheme === id;
              return (
                <button
                  key={id}
                  onClick={() => setScheme(id)}
                  className="flex-shrink-0 transition-all duration-200"
                  style={{ scrollSnapAlign: "start", width: 52 }}
                >
                  <div
                    className={`w-[52px] h-[52px] rounded-sm overflow-hidden transition-all duration-200 ${
                      active ? "ring-2 ring-foreground/40 scale-105" : "opacity-60"
                    }`}
                    style={{
                      background: `linear-gradient(135deg, ${meta.colors[0]} 0%, ${meta.colors[0]} 40%, ${meta.colors[3]} 60%, ${meta.colors[4]} 100%)`,
                    }}
                  >
                    <div className="w-full h-full flex items-center justify-center">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: meta.colors[2], opacity: 0.9 }}
                      />
                    </div>
                  </div>
                  <span className={`text-[8px] font-serif block mt-1 text-center leading-tight truncate ${
                    active ? "text-foreground" : "text-muted-foreground/50"
                  }`}>
                    {meta.label.split(" ")[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Toggle grid */}
        <div className="grid grid-cols-2 gap-2 mt-5">
          {toggleItems.map((item) => (
            <button
              key={item.id}
              onClick={() => flip(item.id)}
              className={`py-3 px-4 rounded-sm text-left font-serif text-sm transition-colors duration-200 ${
                toggles[item.id]
                  ? "bg-accent text-accent-foreground"
                  : "bg-secondary/60 text-muted-foreground"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Brightness */}
        <div className="mt-6">
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-sm text-foreground font-serif">brightness</span>
            <span className="text-xs text-muted-foreground font-serif">{brightness}%</span>
          </div>
          <div
            className="relative h-8 bg-secondary/60 rounded-sm cursor-pointer"
            onPointerDown={(e) => handleSlider(e, setBrightness)}
            onPointerMove={(e) => { if (e.buttons > 0) handleSlider(e, setBrightness); }}
            style={{ touchAction: "none" }}
          >
            <div
              className="absolute inset-y-0 left-0 bg-primary/70 rounded-sm transition-[width] duration-75"
              style={{ width: `${brightness}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-serif text-foreground mix-blend-difference">
                brightness
              </span>
            </div>
          </div>
        </div>

        {/* Volume */}
        <div className="mt-4">
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-sm text-foreground font-serif">volume</span>
            <span className="text-xs text-muted-foreground font-serif">{volume}%</span>
          </div>
          <div
            className="relative h-8 bg-secondary/60 rounded-sm cursor-pointer"
            onPointerDown={(e) => handleSlider(e, setVolume)}
            onPointerMove={(e) => { if (e.buttons > 0) handleSlider(e, setVolume); }}
            style={{ touchAction: "none" }}
          >
            <div
              className="absolute inset-y-0 left-0 bg-primary/70 rounded-sm transition-[width] duration-75"
              style={{ width: `${volume}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-serif text-foreground mix-blend-difference">
                volume
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Drag hint */}
      <div className="flex justify-center pb-6">
        <span className="text-xs text-muted-foreground/50 font-serif">swipe down to dismiss</span>
      </div>
    </div>
  );
};
