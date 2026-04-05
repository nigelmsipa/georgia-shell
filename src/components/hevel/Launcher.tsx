import React, { useState, useRef, useMemo } from "react";
import { ALL_APPS } from "./types";

interface Props {
  open: boolean;
  onClose: () => void;
  onOpenApp: (name: string) => void;
}

export const Launcher: React.FC<Props> = ({ open, onClose, onOpenApp }) => {
  const [search, setSearch] = useState("");
  const [activeLetterIdx, setActiveLetterIdx] = useState(-1);
  const listRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ startY: 0 });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return ALL_APPS.filter((a) => a.toLowerCase().includes(q));
  }, [search]);

  const grouped = useMemo(() => {
    const g: Record<string, string[]> = {};
    filtered.forEach((a) => {
      const letter = a[0].toUpperCase();
      if (!g[letter]) g[letter] = [];
      g[letter].push(a);
    });
    return Object.entries(g).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const availableLetters = new Set(grouped.map(([l]) => l));

  const scrollToLetter = (letter: string) => {
    const el = listRef.current?.querySelector(`[data-letter="${letter}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleScrubber = (e: React.PointerEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const y = e.clientY - rect.top;
    const idx = Math.floor((y / rect.height) * 26);
    const clamped = Math.max(0, Math.min(25, idx));
    setActiveLetterIdx(clamped);
    scrollToLetter(letters[clamped]);
  };

  const handleDragDown = (e: React.PointerEvent) => {
    dragRef.current.startY = e.clientY;
  };

  const handleDragEnd = (e: React.PointerEvent) => {
    if (e.clientY - dragRef.current.startY > 80) {
      onClose();
      setSearch("");
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Scrim */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: "hsl(var(--background) / 0.6)", zIndex: 29, backdropFilter: "blur(8px)" }}
        onClick={() => { onClose(); setSearch(""); }}
      />
    <div
      className="absolute left-0 right-0 bottom-0 z-30 flex flex-col"
      style={{
        backgroundColor: "hsl(var(--background) / 0.96)",
        backdropFilter: "blur(20px)",
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        maxHeight: "82%",
        transition: "transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
        boxShadow: "0 -8px 32px hsl(var(--background) / 0.4)",
      }}
      onPointerDown={handleDragDown}
      onPointerUp={handleDragEnd}
    >
      {/* Drag handle */}
      <div className="flex justify-center pt-3 pb-1">
        <div className="w-10 h-1 rounded-full bg-muted-foreground opacity-30" />
      </div>
      {/* Search */}
      <div className="px-6 pb-3 pt-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="search"
          className="w-full bg-secondary/60 text-foreground font-serif text-base px-4 py-3 rounded-sm border-none outline-none placeholder:text-muted-foreground"
          onPointerDown={(e) => e.stopPropagation()}
        />
      </div>

      {/* App list + scrubber */}
      <div className="flex flex-1 overflow-hidden">
        <div ref={listRef} className="flex-1 overflow-y-auto px-6 pb-20">
          {grouped.map(([letter, apps]) => (
            <div key={letter} data-letter={letter}>
              <div className="text-xs text-muted-foreground font-serif pt-4 pb-1">
                {letter}
              </div>
              {apps.map((app) => (
                <button
                  key={app}
                  onClick={() => { onOpenApp(app); onClose(); setSearch(""); }}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="block w-full text-left text-lg text-foreground font-serif py-2 hover:text-primary transition-colors duration-150"
                >
                  {app}
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Alphabet scrubber */}
        <div
          className="flex flex-col items-center justify-center w-6 mr-1 select-none"
          onPointerDown={(e) => { e.stopPropagation(); handleScrubber(e); }}
          onPointerMove={(e) => { if (e.buttons > 0) handleScrubber(e); }}
          style={{ touchAction: "none" }}
        >
          {letters.map((l, i) => (
            <span
              key={l}
              className={`text-[9px] leading-[14px] font-serif cursor-pointer transition-colors duration-100 ${
                i === activeLetterIdx
                  ? "text-accent font-bold"
                  : availableLetters.has(l)
                  ? "text-muted-foreground"
                  : "text-muted-foreground/30"
              }`}
            >
              {l}
            </span>
          ))}
        </div>
      </div>

    </div>
    </>
  );
};
