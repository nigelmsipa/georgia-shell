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

  const dismissGracefully = useCallback(() => {
    if (closing) return;
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      setSearch("");
      setSelectedIdx(0);
      setActiveLetter("");
      onClose();
    }, 200);
  }, [closing, onClose]);

  const handleScrimClick = () => {
    // Prevent dismissal if pointer started inside the panel (accidental drag)
    if (pointerStartedInPanel.current) {
      pointerStartedInPanel.current = false;
      return;
    }
    dismissGracefully();
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
      dismissGracefully();
    } else if (e.key === "Escape") {
      dismissGracefully();
    }
  };

  const grouped = useMemo(() => {
    const g: Record<string, string[]> = {};
    filtered.forEach((a) => {
      const l = a[0].toUpperCase();
      if (!g[l]) g[l] = [];
      g[l].push(a);
    });
    return Object.entries(g).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  if (!open && !closing) return null;

  return (
    <>
      {/* Scrim */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: "hsl(var(--background) / 0.55)",
          backdropFilter: "blur(16px)",
          zIndex: 29,
          opacity: closing ? 0 : 1,
          transition: "opacity 0.2s ease-out",
        }}
        onClick={handleScrimClick}
      />

      {/* Floating panel */}
      <div
        className="absolute z-30 flex flex-col"
        style={{
          top: "10%",
          left: 20,
          right: 20,
          maxHeight: "76%",
          backgroundColor: "hsl(var(--background) / 0.95)",
          backdropFilter: "blur(24px)",
          borderRadius: 12,
          boxShadow: "0 16px 48px hsl(var(--background) / 0.6), 0 0 0 1px hsl(var(--border) / 0.3)",
          opacity: closing ? 0 : 1,
          transform: closing ? "scale(0.97) translateY(8px)" : "scale(1) translateY(0)",
          transition: "opacity 0.2s ease-out, transform 0.2s ease-out",
        }}
        onPointerDown={() => { pointerStartedInPanel.current = true; }}
        onPointerUp={() => { setTimeout(() => { pointerStartedInPanel.current = false; }, 50); }}
        onKeyDown={handleKeyDown}
      >
        {/* Search + close hint */}
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center justify-between">
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setSelectedIdx(0); setActiveLetter(""); }}
              placeholder="search anything"
              autoFocus
              className="flex-1 bg-transparent text-foreground font-serif text-lg px-0 py-1 border-none outline-none placeholder:text-muted-foreground/40"
            />
            <button
              onClick={dismissGracefully}
              className="text-[10px] text-muted-foreground/40 font-serif hover:text-muted-foreground transition-colors ml-2 flex-shrink-0"
            >
              esc
            </button>
          </div>
          <div className="h-px bg-border/50 mt-2" />
        </div>

        {/* App list + alphabet scrubber */}
        <div className="flex flex-1 overflow-hidden min-h-0">
          {/* List */}
          <div ref={listRef} className="flex-1 overflow-y-auto pl-4 pr-1 pb-2 hide-scrollbar">
            {filtered.length === 0 && (
              <div className="px-2 py-6 text-center">
                <span className="text-sm text-muted-foreground font-serif">no match</span>
              </div>
            )}
            {grouped.map(([letter, apps]) => (
              <div key={letter} data-letter={letter}>
                <div className="text-[10px] text-muted-foreground/50 font-serif pt-3 pb-0.5 px-1">
                  {letter}
                </div>
                {apps.map((app) => {
                  const globalIdx = filtered.indexOf(app);
                  return (
                    <button
                      key={app}
                      onClick={() => { onOpenApp(app); dismissGracefully(); }}
                      onMouseEnter={() => setSelectedIdx(globalIdx)}
                      className={`block w-full text-left font-serif py-2 px-2 rounded-sm transition-colors duration-100 ${
                        globalIdx === selectedIdx
                          ? "bg-accent/20 text-foreground"
                          : "text-foreground/70"
                      }`}
                    >
                      <span className="text-base">{app}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Alphabet scrubber rail */}
          <div
            className="flex flex-col items-center justify-center w-5 mr-1 select-none flex-shrink-0"
            onPointerDown={(e) => { e.stopPropagation(); handleScrubber(e); }}
            onPointerMove={(e) => { if (e.buttons > 0) handleScrubber(e); }}
            style={{ touchAction: "none" }}
          >
            {letters.map((l) => (
              <span
                key={l}
                className={`text-[7px] leading-[11px] font-serif cursor-pointer transition-colors duration-100 ${
                  l === activeLetter
                    ? "text-accent font-bold scale-125"
                    : availableLetters.has(l)
                    ? "text-muted-foreground/60"
                    : "text-muted-foreground/15"
                }`}
              >
                {l}
              </span>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 pb-3 pt-1">
          <div className="h-px bg-border/50 mb-2" />
          <div className="flex justify-between">
            <span className="text-[10px] text-muted-foreground/40 font-serif">
              {filtered.length} app{filtered.length !== 1 ? "s" : ""}
            </span>
            <span className="text-[10px] text-muted-foreground/40 font-serif">
              power launcher
            </span>
          </div>
        </div>
      </div>
    </>
  );
};
