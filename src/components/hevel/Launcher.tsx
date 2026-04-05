import React, { useState, useRef, useMemo } from "react";
import { ALL_APPS } from "./types";

interface Props {
  open: boolean;
  onClose: () => void;
  onOpenApp: (name: string) => void;
}

export const Launcher: React.FC<Props> = ({ open, onClose, onOpenApp }) => {
  const [search, setSearch] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return ALL_APPS.filter((a) => a.toLowerCase().includes(q));
  }, [search]);

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
      {/* Scrim — full blurred backdrop */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: "hsl(var(--background) / 0.55)",
          backdropFilter: "blur(16px)",
          zIndex: 29,
        }}
        onClick={() => { onClose(); setSearch(""); setSelectedIdx(0); }}
      />

      {/* Floating rofi-style panel */}
      <div
        className="absolute z-30 flex flex-col"
        style={{
          top: "12%",
          left: 24,
          right: 24,
          maxHeight: "72%",
          backgroundColor: "hsl(var(--background) / 0.95)",
          backdropFilter: "blur(24px)",
          borderRadius: 12,
          boxShadow: "0 16px 48px hsl(var(--background) / 0.6), 0 0 0 1px hsl(var(--border) / 0.3)",
          transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease-out",
        }}
        onKeyDown={handleKeyDown}
      >
        {/* Search input */}
        <div className="px-4 pt-4 pb-2">
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setSelectedIdx(0); }}
            placeholder="launch"
            autoFocus
            className="w-full bg-transparent text-foreground font-serif text-lg px-0 py-1 border-none outline-none placeholder:text-muted-foreground/40"
          />
          <div className="h-px bg-border/50 mt-2" />
        </div>

        {/* Results list */}
        <div ref={listRef} className="flex-1 overflow-y-auto px-2 pb-3 hide-scrollbar">
          {filtered.length === 0 && (
            <div className="px-2 py-6 text-center">
              <span className="text-sm text-muted-foreground font-serif">no match</span>
            </div>
          )}
          {filtered.map((app, i) => (
            <button
              key={app}
              onClick={() => { onOpenApp(app); onClose(); setSearch(""); setSelectedIdx(0); }}
              onMouseEnter={() => setSelectedIdx(i)}
              className={`block w-full text-left font-serif py-2.5 px-3 rounded-sm transition-colors duration-100 ${
                i === selectedIdx
                  ? "bg-accent/20 text-foreground"
                  : "text-foreground/70 hover:text-foreground"
              }`}
            >
              <span className="text-base">{app}</span>
            </button>
          ))}
        </div>

        {/* Footer hint */}
        <div className="px-4 pb-3 pt-1">
          <div className="h-px bg-border/50 mb-2" />
          <div className="flex justify-between">
            <span className="text-[10px] text-muted-foreground/40 font-serif">
              {filtered.length} app{filtered.length !== 1 ? "s" : ""}
            </span>
            <span className="text-[10px] text-muted-foreground/40 font-serif">
              tap outside to close
            </span>
          </div>
        </div>
      </div>
    </>
  );
};
