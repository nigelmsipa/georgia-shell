import React, { useState, useRef } from "react";
import { useTheme } from "./ThemeProvider";

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
  const { theme, toggle: toggleTheme } = useTheme();
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
        {/* Toggle grid */}
        <div className="grid grid-cols-2 gap-2 mt-4">
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

        {/* Theme */}
        <button
          onClick={toggleTheme}
          className="mt-4 w-full py-3 px-4 rounded-sm text-left font-serif text-sm bg-secondary/60 text-foreground transition-colors duration-200"
        >
          theme: {theme}
        </button>

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

        {/* Now playing */}
        <div className="mt-6 bg-card rounded-sm p-4">
          <span className="text-xs text-muted-foreground font-serif">now playing</span>
          <div className="mt-2 text-foreground font-serif text-base">Everything In Its Right Place</div>
          <div className="text-muted-foreground font-serif text-sm">Radiohead</div>
          <div className="flex gap-6 mt-3">
            <button className="text-sm text-muted-foreground font-serif hover:text-foreground transition-colors">prev</button>
            <button className="text-sm text-foreground font-serif hover:text-primary transition-colors">pause</button>
            <button className="text-sm text-muted-foreground font-serif hover:text-foreground transition-colors">next</button>
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
