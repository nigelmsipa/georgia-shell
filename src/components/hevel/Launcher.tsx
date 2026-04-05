import React, { useState, useRef, useMemo, useCallback } from "react";
import { ALL_APPS } from "./types";

interface Props {
  open: boolean;
  onClose: () => void;
  onOpenApp: (name: string) => void;
}

export const Launcher: React.FC<Props> = ({ open, onClose, onOpenApp }) => {
  const [search, setSearch] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [activeLetter, setActiveLetter] = useState("");
  const [closing, setClosing] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const pointerStartedInPanel = useRef(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return ALL_APPS.filter((a) => a.toLowerCase().includes(q));
  }, [search]);

  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const availableLetters = useMemo(
    () => new Set(filtered.map((a) => a[0].toUpperCase())),
    [filtered]
  );

  const grouped = useMemo(() => {
    const g: Record<string, string[]> = {};
    filtered.forEach((a) => {
      const l = a[0].toUpperCase();
      if (!g[l]) g[l] = [];
      g[l].push(a);
    });
    return Object.entries(g).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  const scrollToLetter = (letter: string) => {
    setActiveLetter(letter);
    const el = listRef.current?.querySelector(`[data-letter="${letter}"]`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    const idx = filtered.findIndex((a) => a[0].toUpperCase() === letter);
    if (idx >= 0) setSelectedIdx(idx);
  };

  const handleScrubber = (e: React.PointerEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const y = e.clientY - rect.top;
    const idx = Math.floor((y / rect.height) * 26);
    const clamped = Math.max(0, Math.min(25, idx));
    scrollToLetter(letters[clamped]);
  };

  const dismiss = useCallback(() => {
    if (closing) return;
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      setSearch("");
      setSelectedIdx(0);
      setActiveLetter("");
      onClose();
    }, 250);
  }, [closing, onClose]);

  const handleScrimClick = () => {
    if (pointerStartedInPanel.current) {
      pointerStartedInPanel.current = false;
      return;
    }
    dismiss();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIdx((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && filtered[selectedIdx]) {
      onOpenApp(filtered[selectedIdx]);
      dismiss();
    } else if (e.key === "Escape") {
      dismiss();
    }
  };

  if (!open && !closing) return null;

  const isVisible = open && !closing;

  return (
    <>
      {/* Blurred scrim */}
      <div
        className="absolute inset-0"
        style={{
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          backgroundColor: "hsl(var(--background) / 0.6)",
          zIndex: 29,
          opacity: isVisible ? 1 : 0,
          transition: "opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        onClick={handleScrimClick}
      />

      {/* Floating panel — no hard edges, translucent, blends with blur */}
      <div
        className="absolute z-30 flex flex-col"
        style={{
          top: "8%",
          left: 24,
          right: 24,
          maxHeight: "78%",
          backgroundColor: "hsl(var(--foreground) / 0.04)",
          borderRadius: 20,
          border: "1px solid hsl(var(--foreground) / 0.05)",
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "scale(1) translateY(0)" : "scale(0.97) translateY(6px)",
          transition: "opacity 0.25s ease-out, transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        onPointerDown={() => { pointerStartedInPanel.current = true; }}
        onPointerUp={() => { setTimeout(() => { pointerStartedInPanel.current = false; }, 50); }}
        onKeyDown={handleKeyDown}
      >
        {/* Search */}
        <div className="px-6 pt-5 pb-3">
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setSelectedIdx(0); setActiveLetter(""); }}
            placeholder="search anything"
            autoFocus
            className="w-full bg-transparent text-foreground/70 font-serif text-base px-0 border-none outline-none placeholder:text-foreground/20 pb-2"
            style={{ borderBottom: "1px solid hsl(var(--foreground) / 0.06)" }}
          />
        </div>

        {/* App list + scrubber */}
        <div className="flex flex-1 overflow-hidden min-h-0">
          <div ref={listRef} className="flex-1 overflow-y-auto px-6 pb-6 hide-scrollbar">
            {filtered.length === 0 && (
              <div className="py-8">
                <span className="text-sm text-foreground/15 font-serif">nothing</span>
              </div>
            )}
            {grouped.map(([letter, apps]) => (
              <div key={letter} data-letter={letter}>
                <div className="text-[9px] text-foreground/15 font-serif pt-4 pb-1 uppercase tracking-[0.25em]">
                  {letter}
                </div>
                {apps.map((app) => {
                  const globalIdx = filtered.indexOf(app);
                  return (
                    <button
                      key={app}
                      onClick={() => { onOpenApp(app); dismiss(); }}
                      onMouseEnter={() => setSelectedIdx(globalIdx)}
                      className={`block w-full text-left font-serif py-1.5 transition-all duration-150 text-[15px] leading-relaxed ${
                        globalIdx === selectedIdx
                          ? "text-foreground"
                          : "text-foreground/35"
                      }`}
                    >
                      {app}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Scrubber */}
          <div
            className="flex flex-col items-center justify-center w-5 mr-1.5 flex-shrink-0 select-none"
            onPointerDown={(e) => { e.stopPropagation(); handleScrubber(e); }}
            onPointerMove={(e) => { if (e.buttons > 0) handleScrubber(e); }}
            style={{ touchAction: "none" }}
          >
            {letters.map((l) => (
              <span
                key={l}
                className={`font-serif cursor-pointer transition-all duration-100 block text-center w-full ${
                  l === activeLetter
                    ? "text-[10px] leading-[14px] text-primary"
                    : availableLetters.has(l)
                    ? "text-[7px] leading-[11px] text-foreground/20"
                    : "text-[7px] leading-[11px] text-foreground/[0.06]"
                }`}
              >
                {l}
              </span>
            ))}
          </div>
        </div>

        {/* Subtle footer hint */}
        <div className="px-6 pb-3 pt-1 flex justify-end">
          <button
            onClick={dismiss}
            className="text-[9px] text-foreground/15 font-serif hover:text-foreground/30 transition-colors"
          >
            esc
          </button>
        </div>
      </div>
    </>
  );
};
