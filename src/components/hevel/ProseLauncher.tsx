import React, { useState, useRef, useMemo, useCallback } from "react";
import { ALL_APPS, COVER_APPS } from "./types";

interface Props {
  open: boolean;
  onClose: () => void;
  onOpenApp: (name: string) => void;
}

/* ── Alphabetical grouping ─────────────────────────────────────────────── */

function buildGrouped(apps: string[], favorites: string[]) {
  const remaining = apps.filter((a) => !favorites.includes(a));
  const groups: Record<string, string[]> = {};
  remaining.forEach((a) => {
    const l = a[0].toUpperCase();
    if (!groups[l]) groups[l] = [];
    groups[l].push(a);
  });
  return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
}

/* ── App Token ─────────────────────────────────────────────────────────── */

const AppToken: React.FC<{
  app: string;
  dimmed: boolean;
  highlighted: boolean;
  onOpen: () => void;
}> = ({ app, dimmed, highlighted, onOpen }) => {
  const [flash, setFlash] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFlash(true);
    setTimeout(() => {
      setFlash(false);
      onOpen();
    }, 180);
  };

  return (
    <span
      data-app={app}
      onClick={handleClick}
      className="cursor-pointer font-serif italic select-none transition-all duration-200"
      style={{
        fontSize: highlighted ? 17 : 15,
        fontWeight: highlighted ? 700 : 400,
        color: highlighted
          ? "hsl(var(--primary))"
          : dimmed
            ? "hsl(var(--muted-foreground) / 0.15)"
            : "hsl(var(--muted-foreground) / 0.7)",
        background: flash
          ? "hsl(var(--primary) / 0.18)"
          : highlighted
            ? "hsl(var(--primary) / 0.08)"
            : "transparent",
        borderRadius: 4,
        padding: highlighted ? "1px 5px" : "0 2px",
        textDecoration: "underline",
        textDecorationColor: dimmed
          ? "hsl(var(--muted-foreground) / 0.06)"
          : highlighted
            ? "hsl(var(--primary) / 0.35)"
            : "hsl(var(--muted-foreground) / 0.18)",
        textDecorationStyle: "dotted" as const,
        textUnderlineOffset: 3,
        opacity: dimmed ? 0.4 : 1,
        transition: "all 0.2s ease",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {app}
    </span>
  );
};

/* ── Vertical Scrubber ─────────────────────────────────────────────────── */

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

  return (
    <div
      ref={ref}
      className="flex flex-col items-center justify-between py-2 select-none"
      style={{ touchAction: "none" }}
      onPointerDown={(e) => {
        e.stopPropagation();
        scrub(e.clientY);
      }}
      onPointerMove={(e) => {
        if (e.buttons > 0) scrub(e.clientY);
      }}
    >
      {LETTERS.map((l) => (
        <span
          key={l}
          className="font-serif cursor-pointer transition-all duration-100"
          style={{
            fontSize: l === activeLetter ? 11 : 8,
            fontWeight: l === activeLetter ? 700 : 400,
            lineHeight: l === activeLetter ? "14px" : "12px",
            color:
              l === activeLetter
                ? "hsl(var(--primary))"
                : availableLetters.has(l)
                  ? "hsl(var(--foreground) / 0.25)"
                  : "hsl(var(--foreground) / 0.06)",
            transform: l === activeLetter ? "scale(1.4)" : "scale(1)",
          }}
        >
          {l}
        </span>
      ))}
    </div>
  );
};

/* ── Component ─────────────────────────────────────────────────────────── */

export const ProseLauncher: React.FC<Props> = ({ open, onClose, onOpenApp }) => {
  const [closing, setClosing] = useState(false);
  const [activeLetter, setActiveLetter] = useState("");
  const [search, setSearch] = useState("");
  const bodyRef = useRef<HTMLDivElement>(null);

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

  const grouped = useMemo(() => buildGrouped(ALL_APPS, COVER_APPS), []);

  const nonFavApps = useMemo(
    () => ALL_APPS.filter((a) => !COVER_APPS.includes(a)),
    []
  );

  const availableLetters = useMemo(
    () => new Set(nonFavApps.map((a) => a[0].toUpperCase())),
    [nonFavApps]
  );

  const isAppDimmed = useCallback(
    (app: string) => {
      if (search) return !app.toLowerCase().includes(search.toLowerCase());
      if (activeLetter) return app[0].toUpperCase() !== activeLetter;
      return false;
    },
    [search, activeLetter]
  );

  const isAppHighlighted = useCallback(
    (app: string) => {
      if (activeLetter && app[0].toUpperCase() === activeLetter) return true;
      if (search && app.toLowerCase().includes(search.toLowerCase())) return true;
      return false;
    },
    [activeLetter, search]
  );

  const handleLetterSelect = useCallback((letter: string) => {
    setActiveLetter(letter);
    setSearch("");
    if (bodyRef.current) {
      const el = bodyRef.current.querySelector(`[data-letter="${letter}"]`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
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
          backdropFilter: "blur(32px)",
          WebkitBackdropFilter: "blur(32px)",
          backgroundColor: "hsl(var(--background) / 0.82)",
          zIndex: 44,
          opacity: isVisible ? 1 : 0,
          transition: "opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        onClick={dismiss}
      />

      {/* Content */}
      <div
        className="absolute inset-0 z-50 flex flex-col"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "translateY(0)" : "translateY(12px)",
          transition:
            "opacity 0.28s ease-out, transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
          pointerEvents: isVisible ? "auto" : "none",
        }}
        onClick={dismiss}
      >
        <div
          className="flex flex-col h-full pt-14 pb-8 pl-8 pr-2"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Favorites */}
          <div className="flex flex-wrap gap-x-5 gap-y-2 mb-6 pr-6">
            {COVER_APPS.map((app) => (
              <span
                key={app}
                onClick={() => {
                  onOpenApp(app);
                  dismiss();
                }}
                className="font-serif italic font-bold cursor-pointer select-none transition-all duration-200 hover:scale-[1.03]"
                style={{
                  fontSize: 20,
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

          {/* Body + Scrubber side by side */}
          <div className="flex flex-1 min-h-0">
            {/* Comma-separated alphabetical body */}
            <div
              ref={bodyRef}
              className="flex-1 overflow-y-auto hide-scrollbar pr-3"
            >
              <div
                className="font-serif text-foreground"
                style={{ lineHeight: 2.1, letterSpacing: "-0.01em" }}
              >
                {grouped.map(([letter, apps]) => (
                  <span key={letter} data-letter={letter}>
                    {apps.map((app, i) => {
                      const dimmed = isAppDimmed(app);
                      const highlighted = isAppHighlighted(app);
                      const isLast = i === apps.length - 1;
                      return (
                        <React.Fragment key={app}>
                          <AppToken
                            app={app}
                            dimmed={dimmed}
                            highlighted={highlighted}
                            onOpen={() => {
                              onOpenApp(app);
                              dismiss();
                            }}
                          />
                          {!isLast && (
                            <span
                              className="text-muted-foreground transition-opacity duration-200"
                              style={{
                                fontSize: 14,
                                fontStyle: "normal",
                                opacity: dimmed ? 0.15 : 0.35,
                              }}
                            >
                              ,{" "}
                            </span>
                          )}
                        </React.Fragment>
                      );
                    })}
                    <span style={{ display: "inline", marginRight: 12 }} />
                  </span>
                ))}
              </div>
            </div>

            {/* Vertical scrubber on the right */}
            <div className="w-5 flex-shrink-0 flex items-center">
              <VerticalScrubber
                activeLetter={activeLetter}
                availableLetters={availableLetters}
                onSelect={handleLetterSelect}
              />
            </div>
          </div>

          {/* Search */}
          <div className="mt-4 pr-6">
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="search..."
              className="w-full bg-transparent font-serif text-sm text-foreground/70 placeholder:text-foreground/15 border-none outline-none pb-1"
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
