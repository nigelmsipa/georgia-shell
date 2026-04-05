import React, { useState, useRef, useMemo, useCallback } from "react";
import { ALL_APPS, RECENT_APPS, COVER_APPS } from "./types";

interface Props {
  open: boolean;
  onClose: () => void;
  onOpenApp: (name: string) => void;
}

/* ── Weight by recency ─────────────────────────────────────────────────── */

type Weight = 3 | 2 | 1 | 0;

const getWeight = (app: string): Weight => {
  const recent = RECENT_APPS.find((r) => r.name === app);
  if (!recent) return 0;
  if (recent.lastUsed <= 10) return 3;
  if (recent.lastUsed <= 30) return 2;
  if (recent.lastUsed <= 120) return 1;
  return 0;
};

/* ── Prose builder (excludes favorites) ────────────────────────────────── */

interface ProseFragment {
  before: string;
  app: string;
  after: string;
}

function buildProse(apps: string[], favorites: string[]): ProseFragment[][] {
  const remaining = apps.filter((a) => !favorites.includes(a));
  const sorted = [...remaining].sort((a, b) => {
    const wa = getWeight(a);
    const wb = getWeight(b);
    if (wb !== wa) return wb - wa;
    return a.localeCompare(b);
  });

  const heavy = sorted.filter((a) => getWeight(a) >= 2);
  const medium = sorted.filter((a) => getWeight(a) === 1);
  const light = sorted.filter((a) => getWeight(a) === 0);

  const paragraphs: ProseFragment[][] = [];

  if (heavy.length > 0) {
    const p: ProseFragment[] = [];
    p.push({ before: "You were just in ", app: heavy[0], after: "" });
    for (let i = 1; i < heavy.length; i++) {
      const isLast = i === heavy.length - 1;
      p.push({ before: isLast ? " and " : ", ", app: heavy[i], after: "" });
    }
    p[p.length - 1].after = ".";
    paragraphs.push(p);
  }

  if (medium.length > 0) {
    const p: ProseFragment[] = [];
    p.push({ before: "Maybe pick up ", app: medium[0], after: "" });
    for (let i = 1; i < medium.length; i++) {
      const isLast = i === medium.length - 1;
      p.push({ before: isLast ? " or " : ", ", app: medium[i], after: "" });
    }
    p[p.length - 1].after = "?";
    paragraphs.push(p);
  }

  if (light.length > 0) {
    const p: ProseFragment[] = [];
    p.push({ before: "Also around: ", app: light[0], after: "" });
    for (let i = 1; i < light.length; i++) {
      const isLast = i === light.length - 1;
      p.push({ before: isLast ? " and " : ", ", app: light[i], after: isLast ? "." : "" });
    }
    if (light.length === 1) p[0].after = ".";
    paragraphs.push(p);
  }

  return paragraphs;
}

/* ── App Token ─────────────────────────────────────────────────────────── */

const AppToken: React.FC<{
  app: string;
  weight: Weight;
  dimmed: boolean;
  highlighted: boolean;
  onOpen: () => void;
}> = ({ app, weight, dimmed, highlighted, onOpen }) => {
  const [flash, setFlash] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFlash(true);
    setTimeout(() => {
      setFlash(false);
      onOpen();
    }, 180);
  };

  const sizes: Record<Weight, number> = { 3: 19, 2: 17, 1: 16, 0: 15 };
  const weights: Record<Weight, number> = { 3: 700, 2: 700, 1: 600, 0: 400 };

  return (
    <span
      data-app={app}
      onClick={handleClick}
      className="cursor-pointer font-serif italic select-none transition-all duration-200"
      style={{
        fontSize: sizes[weight],
        fontWeight: weights[weight],
        color: highlighted
          ? "hsl(var(--primary))"
          : dimmed
            ? "hsl(var(--muted-foreground) / 0.15)"
            : weight >= 2
              ? "hsl(var(--primary))"
              : weight === 1
                ? "hsl(var(--primary) / 0.6)"
                : "hsl(var(--muted-foreground) / 0.7)",
        background: flash
          ? "hsl(var(--primary) / 0.18)"
          : highlighted
            ? "hsl(var(--primary) / 0.1)"
            : weight >= 2 && !dimmed
              ? "hsl(var(--primary) / 0.08)"
              : "transparent",
        borderRadius: 4,
        padding: weight >= 2 || highlighted ? "1px 5px" : "0 2px",
        textDecoration: "underline",
        textDecorationColor: dimmed
          ? "hsl(var(--muted-foreground) / 0.06)"
          : highlighted
            ? "hsl(var(--primary) / 0.4)"
            : weight >= 2
              ? "hsl(var(--primary) / 0.35)"
              : "hsl(var(--muted-foreground) / 0.2)",
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

/* ── Horizontal Scrubber ───────────────────────────────────────────────── */

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const LetterScrubber: React.FC<{
  activeLetter: string;
  availableLetters: Set<string>;
  onSelect: (letter: string) => void;
}> = ({ activeLetter, availableLetters, onSelect }) => {
  const ref = useRef<HTMLDivElement>(null);

  const scrub = useCallback(
    (clientX: number) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const idx = Math.floor((x / rect.width) * 26);
      const clamped = Math.max(0, Math.min(25, idx));
      onSelect(LETTERS[clamped]);
    },
    [onSelect]
  );

  return (
    <div
      ref={ref}
      className="flex items-center justify-between px-2 select-none"
      style={{ touchAction: "none" }}
      onPointerDown={(e) => {
        e.stopPropagation();
        scrub(e.clientX);
      }}
      onPointerMove={(e) => {
        if (e.buttons > 0) scrub(e.clientX);
      }}
      onPointerUp={() => {}}
    >
      {LETTERS.map((l) => (
        <span
          key={l}
          className="font-serif cursor-pointer transition-all duration-100 text-center"
          style={{
            fontSize: l === activeLetter ? 13 : 10,
            fontWeight: l === activeLetter ? 700 : 400,
            color:
              l === activeLetter
                ? "hsl(var(--primary))"
                : availableLetters.has(l)
                  ? "hsl(var(--foreground) / 0.25)"
                  : "hsl(var(--foreground) / 0.06)",
            transform: l === activeLetter ? "scale(1.3)" : "scale(1)",
            width: "3.85%",
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
  const proseRef = useRef<HTMLDivElement>(null);

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

  const paragraphs = useMemo(() => buildProse(ALL_APPS, COVER_APPS), []);

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
      if (search) {
        return !app.toLowerCase().includes(search.toLowerCase());
      }
      if (activeLetter) {
        return app[0].toUpperCase() !== activeLetter;
      }
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

  const handleLetterSelect = useCallback(
    (letter: string) => {
      setActiveLetter(letter);
      setSearch("");
      // Scroll to first matching app in prose
      if (proseRef.current) {
        const el = proseRef.current.querySelector(`[data-app^="${letter}"]`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    },
    []
  );

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
          className="flex flex-col h-full px-8 pt-14 pb-8"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Zone 1: Favorites */}
          <div className="flex flex-wrap gap-x-5 gap-y-2 mb-4">
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

          {/* Separator */}
          <div
            className="mb-5"
            style={{
              height: 1,
              background: "hsl(var(--primary) / 0.1)",
            }}
          />

          {/* Zone 2: Prose body (scrollable) */}
          <div
            ref={proseRef}
            className="flex-1 overflow-y-auto hide-scrollbar"
            style={{ minHeight: 0 }}
          >
            <div
              className="font-serif text-foreground"
              style={{ lineHeight: 2, letterSpacing: "-0.01em" }}
            >
              {paragraphs.map((fragments, pi) => (
                <p key={pi} className="mb-5">
                  {fragments.map((f, fi) => {
                    const dimmed = isAppDimmed(f.app);
                    const highlighted = isAppHighlighted(f.app);
                    return (
                      <React.Fragment key={fi}>
                        <span
                          className="text-muted-foreground transition-opacity duration-200"
                          style={{
                            fontSize: 15,
                            fontWeight: 400,
                            fontStyle: "normal",
                            opacity: dimmed ? 0.15 : 1,
                          }}
                        >
                          {f.before}
                        </span>
                        <AppToken
                          app={f.app}
                          weight={getWeight(f.app)}
                          dimmed={dimmed}
                          highlighted={highlighted}
                          onOpen={() => {
                            onOpenApp(f.app);
                            dismiss();
                          }}
                        />
                        {f.after && (
                          <span
                            className="text-muted-foreground transition-opacity duration-200"
                            style={{
                              fontSize: 15,
                              fontWeight: 400,
                              fontStyle: "normal",
                              opacity: dimmed ? 0.15 : 1,
                            }}
                          >
                            {f.after}
                          </span>
                        )}
                      </React.Fragment>
                    );
                  })}
                </p>
              ))}
            </div>
          </div>

          {/* Zone 3: Scrubber + Search */}
          <div className="mt-auto pt-4">
            <LetterScrubber
              activeLetter={activeLetter}
              availableLetters={availableLetters}
              onSelect={handleLetterSelect}
            />

            <div className="mt-4 px-1">
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
      </div>
    </>
  );
};
