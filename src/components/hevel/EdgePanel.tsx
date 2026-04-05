import React, { useState, useRef, useMemo } from "react";
import { RECENT_APPS, ALL_APPS } from "./types";

interface Props {
  open: boolean;
  onClose: () => void;
  onOpenApp: (name: string) => void;
}

export const EdgePanel: React.FC<Props> = ({ open, onClose, onOpenApp }) => {
  const [search, setSearch] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [activeLetter, setActiveLetter] = useState("");
  const [closing, setClosing] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const pinnedApps = RECENT_APPS.slice(0, 4);

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

  const dismiss = () => {
    if (closing) return;
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      setSearch("");
      setSelectedIdx(0);
      setActiveLetter("");
      onClose();
    }, 250);
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
      {/* Scrim — very subtle, just darkens left side */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to right, hsl(var(--background) / 0.4) 0%, hsl(var(--background) / 0.15) 50%, transparent 100%)",
          zIndex: 45,
          opacity: isVisible ? 1 : 0,
          transition: "opacity 0.25s ease-out",
        }}
        onClick={dismiss}
      />

      {/* Integrated side panel — flush right, no card appearance */}
      <div
        className="absolute z-50 flex flex-col"
        style={{
          top: 0,
          right: 0,
          bottom: 0,
          width: 220,
          /* Gradient bg: transparent on left, solid on right — blends into the screen */
          background: `linear-gradient(to right, hsl(var(--background) / 0) 0%, hsl(var(--background) / 0.7) 15%, hsl(var(--background) / 0.88) 40%, hsl(var(--background) / 0.94) 100%)`,
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          transform: isVisible ? "translateX(0)" : "translateX(40px)",
          opacity: isVisible ? 1 : 0,
          transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease-out",
        }}
        onKeyDown={handleKeyDown}
      >
        {/* Top spacer to align with status bar area */}
        <div className="h-12 flex-shrink-0" />

        {/* Search — minimal, just a line */}
        <div className="px-4 pr-3 mb-1">
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setSelectedIdx(0); setActiveLetter(""); }}
            placeholder="find"
            autoFocus
            className="w-full bg-transparent text-foreground/80 font-serif text-sm px-0 py-1 border-none outline-none placeholder:text-muted-foreground/30"
          />
        </div>

        {/* Pinned — subtle, just names */}
        <div className="px-4 pr-3 pb-1">
          {pinnedApps.map((app) => (
            <button
              key={app.name}
              onClick={() => { onOpenApp(app.name); dismiss(); }}
              className="block w-full text-left text-[13px] text-foreground/90 font-serif py-[5px] hover:text-primary transition-colors duration-100"
            >
              {app.name}
            </button>
          ))}
          {/* Faint separator */}
          <div className="h-px bg-foreground/[0.06] mt-2 mb-1" />
        </div>

        {/* Main area: app list + scrubber */}
        <div className="flex flex-1 overflow-hidden min-h-0">
          {/* App list */}
          <div ref={listRef} className="flex-1 overflow-y-auto pl-4 pr-0 pb-4 hide-scrollbar">
            {filtered.length === 0 && (
              <div className="py-8 text-center">
                <span className="text-xs text-muted-foreground/40 font-serif">nothing</span>
              </div>
            )}
            {grouped.map(([letter, apps]) => (
              <div key={letter} data-letter={letter}>
                <div className="text-[8px] text-muted-foreground/30 font-serif pt-3 pb-0.5 uppercase tracking-wider">
                  {letter}
                </div>
                {apps.map((app) => {
                  const globalIdx = filtered.indexOf(app);
                  return (
                    <button
                      key={app}
                      onClick={() => { onOpenApp(app); dismiss(); setSearch(""); }}
                      onMouseEnter={() => setSelectedIdx(globalIdx)}
                      className={`block w-full text-left font-serif py-[5px] rounded-sm transition-all duration-100 text-[13px] ${
                        globalIdx === selectedIdx
                          ? "text-foreground translate-x-0.5"
                          : "text-foreground/50"
                      }`}
                    >
                      {app}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Alphabet scrubber — hugging right edge */}
          <div
            className="flex flex-col items-center justify-center w-5 flex-shrink-0 select-none"
            onPointerDown={(e) => { e.stopPropagation(); handleScrubber(e); }}
            onPointerMove={(e) => { if (e.buttons > 0) handleScrubber(e); }}
            style={{ touchAction: "none" }}
          >
            {letters.map((l) => (
              <span
                key={l}
                className={`font-serif cursor-pointer transition-all duration-100 ${
                  l === activeLetter
                    ? "text-[9px] leading-[12px] text-accent font-bold"
                    : availableLetters.has(l)
                    ? "text-[6px] leading-[10px] text-foreground/30"
                    : "text-[6px] leading-[10px] text-foreground/[0.08]"
                }`}
              >
                {l}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom spacer */}
        <div className="h-8 flex-shrink-0" />
      </div>
    </>
  );
};
