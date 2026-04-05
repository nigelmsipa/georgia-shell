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
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIdx((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && filtered[selectedIdx]) {
      onOpenApp(filtered[selectedIdx]);
      onClose();
      setSearch("");
      setSelectedIdx(0);
    } else if (e.key === "Escape") {
      onClose();
      setSearch("");
      setSelectedIdx(0);
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Scrim — only dismisses on explicit tap */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: "hsl(var(--background) / 0.35)", zIndex: 45 }}
        onClick={onClose}
      />
      {/* Panel */}
      <div
        className="absolute z-50 bg-card/95 rounded-l-sm overflow-hidden flex flex-col"
        style={{
          top: 40,
          right: 0,
          bottom: 40,
          width: 260,
          boxShadow: "0 8px 32px hsl(var(--background) / 0.6)",
          backdropFilter: "blur(16px)",
        }}
        onKeyDown={handleKeyDown}
      >
        {/* Search */}
        <div className="px-4 pt-4 pb-2">
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setSelectedIdx(0); setActiveLetter(""); }}
            placeholder="find app"
            autoFocus
            className="w-full bg-transparent text-foreground font-serif text-sm px-0 py-1 border-none outline-none placeholder:text-muted-foreground/40"
          />
          <div className="h-px bg-border/40 mt-2" />
        </div>

        {/* Pinned */}
        <div className="px-4 pb-2">
          <span className="text-[9px] text-muted-foreground/50 font-serif uppercase tracking-wider">pinned</span>
          <div className="mt-1.5 space-y-0.5">
            {pinnedApps.map((app) => (
              <button
                key={app.name}
                onClick={() => { onOpenApp(app.name); onClose(); }}
                className="block w-full text-left text-sm text-foreground font-serif py-1 hover:text-primary transition-colors duration-100"
              >
                {app.name}
              </button>
            ))}
          </div>
          <div className="h-px bg-border/30 mt-2" />
        </div>

        {/* App list + alphabet scrubber */}
        <div className="flex flex-1 overflow-hidden min-h-0">
          {/* Scrubber rail — left side */}
          <div
            className="flex flex-col items-center justify-center w-4 ml-1 select-none flex-shrink-0"
            onPointerDown={(e) => { e.stopPropagation(); handleScrubber(e); }}
            onPointerMove={(e) => { if (e.buttons > 0) handleScrubber(e); }}
            style={{ touchAction: "none" }}
          >
            {letters.map((l) => (
              <span
                key={l}
                className={`text-[6px] leading-[10px] font-serif cursor-pointer transition-colors duration-100 ${
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

          {/* List */}
          <div ref={listRef} className="flex-1 overflow-y-auto pr-3 pl-1 pb-2 hide-scrollbar">
            {filtered.length === 0 && (
              <div className="px-2 py-6 text-center">
                <span className="text-xs text-muted-foreground font-serif">no match</span>
              </div>
            )}
            {grouped.map(([letter, apps]) => (
              <div key={letter} data-letter={letter}>
                <div className="text-[9px] text-muted-foreground/40 font-serif pt-2.5 pb-0.5 px-1">
                  {letter}
                </div>
                {apps.map((app) => {
                  const globalIdx = filtered.indexOf(app);
                  return (
                    <button
                      key={app}
                      onClick={() => { onOpenApp(app); onClose(); setSearch(""); }}
                      onMouseEnter={() => setSelectedIdx(globalIdx)}
                      className={`block w-full text-left font-serif py-1.5 px-1.5 rounded-sm transition-colors duration-100 text-sm ${
                        globalIdx === selectedIdx
                          ? "bg-accent/20 text-foreground"
                          : "text-foreground/70"
                      }`}
                    >
                      {app}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 pb-3 pt-1">
          <div className="h-px bg-border/30 mb-2" />
          <span className="text-[9px] text-muted-foreground/35 font-serif">
            {filtered.length} app{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
    </>
  );
};
