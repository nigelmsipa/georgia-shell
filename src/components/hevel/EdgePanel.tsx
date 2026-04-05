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
    }, 300);
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
      {/* Blur + dark scrim for readability */}
      <div
        className="absolute inset-0"
        style={{
          backdropFilter: "blur(32px)",
          WebkitBackdropFilter: "blur(32px)",
          backgroundColor: "hsl(var(--background) / 0.75)",
          zIndex: 44,
          opacity: isVisible ? 1 : 0,
          transition: "opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        onClick={dismiss}
      />

      {/* Full-screen content */}
      <div
        className="absolute inset-0 z-50 flex flex-col"
        style={{
          opacity: isVisible ? 1 : 0,
          transition: "opacity 0.3s ease-out",
          pointerEvents: isVisible ? "auto" : "none",
        }}
        onKeyDown={handleKeyDown}
        onClick={dismiss}
      >
        <div
          className="flex flex-col w-full h-full"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top bar area */}
          <div className="flex-shrink-0 pt-14 pb-4 px-8">
            {/* Spotlight search bar */}
            <div
              className="rounded-xl px-4 py-3"
              style={{
                backgroundColor: "hsl(var(--foreground) / 0.08)",
              }}
            >
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setSelectedIdx(0); setActiveLetter(""); }}
                placeholder="Search apps…"
                autoFocus
                className="w-full bg-transparent text-foreground font-serif text-base px-0 border-none outline-none placeholder:text-foreground/30"
              />
            </div>
          </div>

          {/* Pinned / recent row */}
          <div className="flex-shrink-0 px-8 pb-3">
            <div className="text-[10px] text-foreground/30 font-serif uppercase tracking-[0.15em] mb-2">
              recent
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-1">
              {pinnedApps.map((app) => (
                <button
                  key={app.name}
                  onClick={() => { onOpenApp(app.name); dismiss(); }}
                  className="text-[15px] text-foreground/80 font-serif py-1 hover:text-foreground transition-colors duration-150"
                >
                  {app.name}
                </button>
              ))}
            </div>
          </div>

          {/* Separator */}
          <div className="px-8">
            <div className="h-px bg-foreground/[0.08]" />
          </div>

          {/* App list + alphabet scrubber */}
          <div className="flex flex-1 overflow-hidden min-h-0">
            {/* List */}
            <div ref={listRef} className="flex-1 overflow-y-auto px-8 pt-3 pb-10 hide-scrollbar">
              {filtered.length === 0 && (
                <div className="py-10 text-center">
                  <span className="text-sm text-foreground/25 font-serif">no results</span>
                </div>
              )}
              {grouped.map(([letter, apps]) => (
                <div key={letter} data-letter={letter}>
                  <div className="text-[11px] text-foreground/25 font-serif pt-5 pb-1.5 uppercase tracking-[0.2em]">
                    {letter}
                  </div>
                  {apps.map((app) => {
                    const globalIdx = filtered.indexOf(app);
                    return (
                      <button
                        key={app}
                        onClick={() => { onOpenApp(app); dismiss(); setSearch(""); }}
                        onMouseEnter={() => setSelectedIdx(globalIdx)}
                        className={`block w-full text-left font-serif py-2 transition-all duration-150 text-[17px] leading-snug ${
                          globalIdx === selectedIdx
                            ? "text-foreground"
                            : "text-foreground/45"
                        }`}
                      >
                        {app}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Alphabet scrubber — properly sized, right-aligned */}
            <div
              className="flex flex-col items-center justify-center w-7 mr-2 flex-shrink-0 select-none"
              onPointerDown={(e) => { e.stopPropagation(); handleScrubber(e); }}
              onPointerMove={(e) => { if (e.buttons > 0) handleScrubber(e); }}
              style={{ touchAction: "none" }}
            >
              {letters.map((l) => (
                <span
                  key={l}
                  className={`font-serif cursor-pointer transition-all duration-100 block text-center w-full ${
                    l === activeLetter
                      ? "text-[12px] leading-[16px] text-primary font-bold"
                      : availableLetters.has(l)
                      ? "text-[9px] leading-[14px] text-foreground/35"
                      : "text-[9px] leading-[14px] text-foreground/10"
                  }`}
                >
                  {l}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
