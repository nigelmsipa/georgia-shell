import React, { useState, useRef, useMemo, useCallback } from "react";
import { ALL_APPS, COVER_APPS } from "./types";

interface Props {
  open: boolean;
  onClose: () => void;
  onOpenApp: (name: string) => void;
}

/* ── Alphabetical grouping ─────────────────────────────────────────────── */

function getGrouped(apps: string[], favorites: string[]) {
  const remaining = apps.filter((a) => !favorites.includes(a));
  const groups: Record<string, string[]> = {};
  remaining.forEach((a) => {
    const l = a[0].toUpperCase();
    if (!groups[l]) groups[l] = [];
    groups[l].push(a);
  });
  return groups;
}

/* ── Vertical Scrubber with arc layout ─────────────────────────────────── */

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const VerticalScrubber: React.FC<{
  activeLetter: string;
  availableLetters: Set<string>;
  onSelect: (letter: string) => void;
}> = ({ activeLetter, availableLetters, onSelect }) => {
  const ref = useRef<HTMLDivElement>(null);

  const scrub = useCallback(
    (clientY: number) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const y = clientY - rect.top;
      const idx = Math.floor((y / rect.height) * 26);
      const clamped = Math.max(0, Math.min(25, idx));
      onSelect(LETTERS[clamped]);
    },
    [onSelect]
  );

  const activeIdx = LETTERS.indexOf(activeLetter);

  return (
    <div
      ref={ref}
      className="flex flex-col items-center justify-between h-full py-2 select-none"
      style={{ touchAction: "none", width: 28 }}
      onPointerDown={(e) => {
        e.stopPropagation();
        scrub(e.clientY);
      }}
      onPointerMove={(e) => {
        if (e.buttons > 0) scrub(e.clientY);
      }}
    >
      {LETTERS.map((l, i) => {
        const dist = activeIdx >= 0 ? Math.abs(i - activeIdx) : 999;
        const isActive = l === activeLetter;
        const isNear = dist <= 2 && dist > 0;
        const hasApps = availableLetters.has(l);

        const offset = isActive ? -6 : isNear ? -3 * (1 - dist / 3) : 0;

        return (
          <span
            key={l}
            className="font-serif cursor-pointer block text-center transition-all"
            style={{
              fontSize: isActive ? 16 : isNear ? 9 : 7,
              fontWeight: isActive ? 700 : 400,
              fontStyle: isActive ? "italic" : "normal",
              lineHeight: isActive ? "18px" : "12px",
              color: isActive
                ? "hsl(var(--primary))"
                : hasApps
                  ? `hsl(var(--foreground) / ${isNear ? 0.35 : 0.2})`
                  : "hsl(var(--foreground) / 0.06)",
              transform: `translateX(${offset}px) scale(${isActive ? 1.1 : 1})`,
              transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            {l}
          </span>
        );
      })}
    </div>
  );
};

/* ── Component ─────────────────────────────────────────────────────────── */

export const ProseLauncher: React.FC<Props> = ({ open, onClose, onOpenApp }) => {
  const [closing, setClosing] = useState(false);
  const [activeLetter, setActiveLetter] = useState("");
  const [search, setSearch] = useState("");

  const dismiss = useCallback(() => {
    if (closing) return;
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      setActiveLetter("");
      setSearch("");
      onClose();
    }, 280);
  }, [closing, onClose]);

  const grouped = useMemo(() => getGrouped(ALL_APPS, COVER_APPS), []);

  const availableLetters = useMemo(
    () => new Set(Object.keys(grouped)),
    [grouped]
  );

  const visibleApps = useMemo(() => {
    if (search) {
      const q = search.toLowerCase();
      return ALL_APPS.filter(
        (a) => !COVER_APPS.includes(a) && a.toLowerCase().includes(q)
      );
    }
    if (activeLetter && grouped[activeLetter]) {
      return grouped[activeLetter];
    }
    return [];
  }, [search, activeLetter, grouped]);

  const handleLetterSelect = useCallback((letter: string) => {
    setActiveLetter(letter);
    setSearch("");
  }, []);

  const handleSearch = useCallback((val: string) => {
    setSearch(val);
    setActiveLetter("");
  }, []);

  if (!open && !closing) return null;
  const isVisible = open && !closing;

  return (
    <>
      {/* Scrim */}
      <div
        className="absolute inset-0"
        style={{
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          backgroundColor: "hsl(var(--background) / 0.6)",
          zIndex: 44,
          opacity: isVisible ? 1 : 0,
          transition: "opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        onClick={dismiss}
      />

      {/* Floating card */}
      <div
        className="absolute inset-0 z-50 flex items-center justify-center"
        style={{ pointerEvents: isVisible ? "auto" : "none" }}
        onClick={dismiss}
      >
        <div
          className="flex flex-col"
          style={{
            width: "88%",
            height: "78%",
            backgroundColor: "hsl(var(--card) / 0.72)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid hsl(var(--border) / 0.15)",
            borderRadius: 20,
            boxShadow: "0 16px 48px -12px hsl(var(--foreground) / 0.12)",
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "scale(1)" : "scale(0.96)",
            transition:
              "opacity 0.28s ease-out, transform 0.32s cubic-bezier(0.16, 1, 0.3, 1)",
            overflow: "hidden",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Favorites at top */}
          <div className="flex flex-wrap gap-x-5 gap-y-2 px-6 pt-6 pb-4">
            {COVER_APPS.map((app) => (
              <span
                key={app}
                onClick={() => {
                  onOpenApp(app);
                  dismiss();
                }}
                className="font-serif italic font-bold cursor-pointer select-none transition-all duration-200 hover:scale-[1.03]"
                style={{
                  fontSize: 17,
                  color: "hsl(var(--primary))",
                  textDecoration: "underline",
                  textDecorationColor: "hsl(var(--primary) / 0.3)",
                  textDecorationStyle: "dotted" as const,
                  textUnderlineOffset: 4,
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                {app}
              </span>
            ))}
          </div>

          {/* Hairline */}
          <div
            className="mx-6"
            style={{
              height: 1,
              background: "hsl(var(--border) / 0.1)",
            }}
          />

          {/* Main area: apps + scrubber */}
          <div className="flex flex-1 min-h-0 px-6 py-4">
            {/* App display area */}
            <div className="flex-1 flex flex-col justify-center pr-3 relative">
              {/* Watermark letter */}
              {activeLetter && (
                <div
                  className="absolute font-serif italic select-none pointer-events-none"
                  style={{
                    fontSize: 120,
                    fontWeight: 800,
                    color: "hsl(var(--primary) / 0.06)",
                    lineHeight: 1,
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                >
                  {activeLetter}
                </div>
              )}

              {/* Apps for current letter */}
              <div
                className="font-serif relative z-10"
                style={{
                  lineHeight: 2.2,
                  transition: "all 0.2s ease",
                }}
              >
                {visibleApps.length > 0 ? (
                  visibleApps.map((app, i) => (
                    <React.Fragment key={app}>
                      <span
                        onClick={() => {
                          onOpenApp(app);
                          dismiss();
                        }}
                        className="cursor-pointer italic select-none transition-all duration-200 hover:scale-[1.02] inline-block"
                        style={{
                          fontSize: 17,
                          fontWeight: 500,
                          color: "hsl(var(--foreground) / 0.8)",
                          textDecoration: "underline",
                          textDecorationColor: "hsl(var(--primary) / 0.25)",
                          textDecorationStyle: "dotted" as const,
                          textUnderlineOffset: 4,
                          WebkitTapHighlightColor: "transparent",
                        }}
                      >
                        {app}
                      </span>
                      {i < visibleApps.length - 1 && (
                        <span
                          style={{
                            color: "hsl(var(--muted-foreground) / 0.25)",
                            fontSize: 15,
                            fontStyle: "normal",
                            margin: "0 3px",
                          }}
                        >
                          ,{" "}
                        </span>
                      )}
                    </React.Fragment>
                  ))
                ) : !search && !activeLetter ? (
                  <span
                    className="font-serif italic"
                    style={{ fontSize: 14, color: "hsl(var(--muted-foreground) / 0.2)" }}
                  >
                    scrub or search
                  </span>
                ) : search ? (
                  <span
                    className="font-serif italic"
                    style={{ fontSize: 14, color: "hsl(var(--muted-foreground) / 0.2)" }}
                  >
                    nothing
                  </span>
                ) : null}
              </div>
            </div>

            {/* Vertical scrubber on right */}
            <div className="flex-shrink-0 flex items-center">
              <VerticalScrubber
                activeLetter={activeLetter}
                availableLetters={availableLetters}
                onSelect={handleLetterSelect}
              />
            </div>
          </div>

          {/* Search at bottom */}
          <div className="px-6 pb-5">
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="search..."
              className="w-full bg-transparent font-serif italic text-sm text-foreground/70 placeholder:text-foreground/15 border-none outline-none pb-1"
              style={{
                borderBottom: "1px solid hsl(var(--foreground) / 0.06)",
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
};
