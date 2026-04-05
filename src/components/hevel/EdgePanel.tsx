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
      {/* Full-screen blur */}
      <div
        className="absolute inset-0"
        style={{
          backdropFilter: isVisible ? "blur(28px) brightness(0.65)" : "blur(0px) brightness(1)",
          WebkitBackdropFilter: isVisible ? "blur(28px) brightness(0.65)" : "blur(0px) brightness(1)",
          zIndex: 44,
          opacity: isVisible ? 1 : 0,
          transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        onClick={dismiss}
      />

      {/* Full-screen sovereign layout — content centered */}
      <div
        className="absolute inset-0 z-50 flex flex-col items-center"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "scale(1)" : "scale(0.98)",
          transition: "opacity 0.3s ease-out, transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
          pointerEvents: isVisible ? "auto" : "none",
        }}
        onKeyDown={handleKeyDown}
        onClick={dismiss}
      >
        {/* Prevent clicks on content from dismissing */}
        <div
          className="flex flex-col w-full h-full max-w-xs px-8"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top spacer */}
          <div className="h-16 flex-shrink-0" />

          {/* Search */}
          <div className="mb-4">
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setSelectedIdx(0); setActiveLetter(""); }}
              placeholder="find"
              autoFocus
              className="w-full bg-transparent text-foreground font-serif text-lg px-0 py-1 border-none outline-none placeholder:text-foreground/20"
            />
          </div>

          {/* Pinned */}
          <div className="mb-2">
            {pinnedApps.map((app) => (
              <button
                key={app.name}
                onClick={() => { onOpenApp(app.name); dismiss(); }}
                className="block w-full text-left text-base text-foreground font-serif py-[6px] hover:text-primary transition-colors duration-150"
              >
                {app.name}
              </button>
            ))}
            <div className="flex py-3">
              <span className="text-foreground/[0.08] text-[6px]">●</span>
            </div>
          </div>

          {/* App list + scrubber */}
          <div className="flex flex-1 overflow-hidden min-h-0">
            {/* List */}
            <div ref={listRef} className="flex-1 overflow-y-auto pr-2 pb-8 hide-scrollbar">
              {filtered.length === 0 && (
                <div className="py-8">
                  <span className="text-sm text-foreground/20 font-serif">nothing</span>
                </div>
              )}
              {grouped.map(([letter, apps]) => (
                <div key={letter} data-letter={letter}>
                  <div className="text-[9px] text-foreground/15 font-serif pt-4 pb-1 uppercase tracking-[0.2em]">
                    {letter}
                  </div>
                  {apps.map((app) => {
                    const globalIdx = filtered.indexOf(app);
                    return (
                      <button
                        key={app}
                        onClick={() => { onOpenApp(app); dismiss(); setSearch(""); }}
                        onMouseEnter={() => setSelectedIdx(globalIdx)}
                        className={`block w-full text-left font-serif py-[6px] transition-all duration-150 text-base ${
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

            {/* Alphabet scrubber */}
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
                      ? "text-[10px] leading-[13px] text-primary font-bold"
                      : availableLetters.has(l)
                      ? "text-[7px] leading-[11px] text-foreground/25"
                      : "text-[7px] leading-[11px] text-foreground/[0.06]"
                  }`}
                >
                  {l}
                </span>
              ))}
            </div>
          </div>

          {/* Bottom spacer */}
          <div className="h-10 flex-shrink-0" />
        </div>
      </div>
    </>
  );
};
