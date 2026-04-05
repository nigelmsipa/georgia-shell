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
      {/* Full-screen blur layer — the whole home screen blurs */}
      <div
        className="absolute inset-0"
        style={{
          backdropFilter: isVisible ? "blur(24px) brightness(0.7)" : "blur(0px) brightness(1)",
          WebkitBackdropFilter: isVisible ? "blur(24px) brightness(0.7)" : "blur(0px) brightness(1)",
          zIndex: 44,
          opacity: isVisible ? 1 : 0,
          transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        onClick={dismiss}
      />

      {/* 
        The launcher content — no panel, no box, no card.
        Just text floating on the right side of the blurred screen.
        The content itself IS the interface, not a container around it.
      */}
      <div
        className="absolute z-50 flex flex-col"
        style={{
          top: 0,
          right: 0,
          bottom: 0,
          width: 200,
          /* No background at all — content floats on the blur */
          transform: isVisible ? "translateX(0)" : "translateX(30px)",
          opacity: isVisible ? 1 : 0,
          transition: "transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease-out",
        }}
        onKeyDown={handleKeyDown}
      >
        {/* Top spacer */}
        <div className="h-14 flex-shrink-0" />

        {/* Search — just floating text input, no box */}
        <div className="px-3 pr-2 mb-3">
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setSelectedIdx(0); setActiveLetter(""); }}
            placeholder="find"
            autoFocus
            className="w-full bg-transparent text-foreground font-serif text-sm px-0 py-1 border-none outline-none placeholder:text-foreground/25"
          />
        </div>

        {/* Pinned apps — just names, no container */}
        <div className="px-3 pr-2 pb-2">
          {pinnedApps.map((app) => (
            <button
              key={app.name}
              onClick={() => { onOpenApp(app.name); dismiss(); }}
              className="block w-full text-left text-[13px] text-foreground font-serif py-[5px] hover:text-primary transition-colors duration-150"
            >
              {app.name}
            </button>
          ))}
          {/* Organic separator — a gentle dot instead of a line */}
          <div className="flex justify-center py-2">
            <span className="text-foreground/10 text-[6px]">●</span>
          </div>
        </div>

        {/* Main area: app list + scrubber */}
        <div className="flex flex-1 overflow-hidden min-h-0">
          {/* App list — bare text, no backgrounds */}
          <div ref={listRef} className="flex-1 overflow-y-auto pl-3 pr-0 pb-6 hide-scrollbar">
            {filtered.length === 0 && (
              <div className="py-8">
                <span className="text-xs text-foreground/20 font-serif">nothing</span>
              </div>
            )}
            {grouped.map(([letter, apps]) => (
              <div key={letter} data-letter={letter}>
                <div className="text-[8px] text-foreground/20 font-serif pt-4 pb-1 uppercase tracking-[0.15em]">
                  {letter}
                </div>
                {apps.map((app) => {
                  const globalIdx = filtered.indexOf(app);
                  return (
                    <button
                      key={app}
                      onClick={() => { onOpenApp(app); dismiss(); setSearch(""); }}
                      onMouseEnter={() => setSelectedIdx(globalIdx)}
                      className={`block w-full text-left font-serif py-[5px] transition-all duration-150 text-[13px] ${
                        globalIdx === selectedIdx
                          ? "text-foreground"
                          : "text-foreground/40"
                      }`}
                    >
                      {app}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Alphabet scrubber — floating on edge */}
          <div
            className="flex flex-col items-center justify-center w-4 mr-1 flex-shrink-0 select-none"
            onPointerDown={(e) => { e.stopPropagation(); handleScrubber(e); }}
            onPointerMove={(e) => { if (e.buttons > 0) handleScrubber(e); }}
            style={{ touchAction: "none" }}
          >
            {letters.map((l) => (
              <span
                key={l}
                className={`font-serif cursor-pointer transition-all duration-100 ${
                  l === activeLetter
                    ? "text-[9px] leading-[12px] text-primary font-bold"
                    : availableLetters.has(l)
                    ? "text-[6px] leading-[10px] text-foreground/25"
                    : "text-[6px] leading-[10px] text-foreground/[0.06]"
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
    </>
  );
};
