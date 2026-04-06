import React, { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { ALL_APPS, COVER_APPS } from "./types";

interface Props {
  open: boolean;
  onClose: () => void;
  onOpenApp: (name: string) => void;
}

/* ── Data helpers ──────────────────────────────────────────────────────── */

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function byLetter(apps: string[], exclude: string[]) {
  const m: Record<string, string[]> = {};
  apps
    .filter((a) => !exclude.includes(a))
    .forEach((a) => {
      const l = a[0].toUpperCase();
      if (!m[l]) m[l] = [];
      m[l].push(a);
    });
  return m;
}

/* ── Blinking cursor ───────────────────────────────────────────────────── */

const BlinkCursor: React.FC = () => {
  const [v, setV] = useState(true);
  useEffect(() => {
    const id = setInterval(() => setV((x) => !x), 530);
    return () => clearInterval(id);
  }, []);
  return (
    <span
      className="inline-block"
      style={{
        width: 3,
        height: 18,
        backgroundColor: "hsl(var(--primary))",
        opacity: v ? 0.9 : 0,
        transition: "opacity 0.08s",
        marginLeft: 2,
        verticalAlign: "middle",
        borderRadius: 1,
      }}
    />
  );
};

/* ── Vertical scrubber (Niagara arc) ───────────────────────────────────── */

const Scrubber: React.FC<{
  activeSet: Set<string>;
  onLetter: (l: string) => void;
  onRelease: () => void;
}> = ({ activeSet, onLetter, onRelease }) => {
  const ref = useRef<HTMLDivElement>(null);
  const active = useRef(false);
  const [cur, setCur] = useState<string | null>(null);

  const fromY = useCallback((y: number) => {
    if (!ref.current) return null;
    const r = ref.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(0.999, (y - r.top) / r.height));
    return LETTERS[Math.floor(pct * LETTERS.length)];
  }, []);

  const fire = useCallback(
    (y: number) => {
      const l = fromY(y);
      if (l) {
        setCur(l);
        onLetter(l);
      }
    },
    [fromY, onLetter]
  );

  const end = useCallback(() => {
    active.current = false;
    setCur(null);
    onRelease();
  }, [onRelease]);

  const curIdx = cur ? LETTERS.indexOf(cur) : -1;

  return (
    <div
      ref={ref}
      className="flex flex-col items-center justify-between select-none"
      style={{
        touchAction: "none",
        width: 28,
        flex: 1,
        padding: "4px 0",
        cursor: "pointer",
      }}
      onPointerDown={(e) => {
        e.stopPropagation();
        active.current = true;
        fire(e.clientY);
      }}
      onPointerMove={(e) => {
        if (active.current) fire(e.clientY);
      }}
      onPointerUp={end}
      onPointerLeave={end}
    >
      {LETTERS.map((l, i) => {
        const has = activeSet.has(l);
        const isCur = l === cur;
        const dist = curIdx >= 0 ? Math.abs(i - curIdx) : 999;
        const isNear = dist > 0 && dist <= 2;

        // Arc: push active letter left, neighbors slightly
        const offset = isCur ? -10 : isNear ? -5 * (1 - dist / 3) : 0;

        return (
          <span
            key={l}
            className="font-serif block text-center"
            style={{
              fontSize: isCur ? 18 : isNear ? 11 : 9,
              fontWeight: isCur ? 700 : 400,
              fontStyle: isCur ? "italic" : "normal",
              lineHeight: isCur ? "20px" : "13px",
              color: isCur
                ? "hsl(var(--primary))"
                : has
                  ? `hsl(var(--foreground) / ${isNear ? 0.4 : 0.22})`
                  : "hsl(var(--foreground) / 0.06)",
              transform: `translateX(${offset}px) scale(${isCur ? 1.15 : 1})`,
              transition: "all 0.18s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            {l}
          </span>
        );
      })}
    </div>
  );
};

/* ── App row item ──────────────────────────────────────────────────────── */

const AppItem: React.FC<{
  app: string;
  index: number;
  query: string;
  onOpen: (name: string) => void;
}> = ({ app, index, query, onOpen }) => {
  const [pressed, setPressed] = useState(false);
  const [vis, setVis] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVis(true), index * 45);
    return () => clearTimeout(t);
  }, [index]);

  // Highlight matching substring
  const renderName = () => {
    if (!query) return app;
    const q = query.toLowerCase();
    const i = app.toLowerCase().indexOf(q);
    if (i === -1) return app;
    return (
      <>
        {app.slice(0, i)}
        <span style={{ color: "hsl(var(--primary))", fontWeight: 700 }}>
          {app.slice(i, i + q.length)}
        </span>
        {app.slice(i + q.length)}
      </>
    );
  };

  return (
    <div
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => {
        setPressed(false);
        onOpen(app);
      }}
      onPointerLeave={() => setPressed(false)}
      className="flex items-baseline gap-2.5 cursor-pointer select-none"
      style={{
        padding: "8px 0",
        opacity: vis ? (pressed ? 0.5 : 1) : 0,
        transform: vis ? "translateX(0)" : "translateX(-6px)",
        transition: `opacity 0.2s ease ${index * 45}ms, transform 0.2s ease ${index * 45}ms`,
        borderBottom: "1px solid hsl(var(--border) / 0.15)",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      <span
        className="font-serif italic"
        style={{
          fontSize: 18,
          fontWeight: 500,
          color: "hsl(var(--foreground) / 0.85)",
        }}
      >
        {renderName()}
      </span>
    </div>
  );
};

/* ── Main component ────────────────────────────────────────────────────── */

export const ProseLauncher: React.FC<Props> = ({ open, onClose, onOpenApp }) => {
  const [closing, setClosing] = useState(false);
  const [letter, setLetter] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const dismiss = useCallback(() => {
    if (closing) return;
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      setLetter(null);
      setSearch("");
      onClose();
    }, 280);
  }, [closing, onClose]);

  const grouped = useMemo(() => byLetter(ALL_APPS, COVER_APPS), []);
  const activeSet = useMemo(() => new Set(Object.keys(grouped)), [grouped]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return ALL_APPS.filter((a) => !COVER_APPS.includes(a));
    return ALL_APPS.filter(
      (a) =>
        !COVER_APPS.includes(a) &&
        a.toLowerCase().includes(q)
    );
  }, [search]);

  const visibleApps = useMemo(() => {
    if (search.trim()) return filtered.slice(0, 12);
    if (letter) return grouped[letter] || [];
    return [];
  }, [search, letter, filtered, grouped]);

  const handleRelease = useCallback(() => {
    // Keep letter visible briefly after scrub release
    setTimeout(() => setLetter(null), 800);
  }, []);

  const favApps = COVER_APPS;
  const isScrubbing = !!letter;
  const showFavs = !letter && !search.trim();
  const showLetter = !!letter && !search.trim();
  const showSearch = !!search.trim();

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
          backgroundColor: "hsl(var(--background) / 0.88)",
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
          transform: isVisible ? "translateY(0)" : "translateY(8px)",
          transition:
            "opacity 0.28s ease-out, transform 0.32s cubic-bezier(0.16, 1, 0.3, 1)",
          pointerEvents: isVisible ? "auto" : "none",
        }}
        onClick={dismiss}
      >
        <div
          className="flex flex-col h-full pt-10 pb-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── Favorites ── */}
          <div className="px-6 mb-1">
            <div
              className="font-serif italic mb-3"
              style={{
                fontSize: 10,
                letterSpacing: "0.08em",
                color: "hsl(var(--muted-foreground) / 0.35)",
                textTransform: "lowercase",
              }}
            >
              favorites
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-1">
              {favApps.map((app) => (
                <span
                  key={app}
                  onClick={() => {
                    onOpenApp(app);
                    dismiss();
                  }}
                  className="font-serif italic font-bold cursor-pointer select-none"
                  style={{
                    fontSize: 21,
                    color: "hsl(var(--primary))",
                    lineHeight: 1.5,
                    WebkitTapHighlightColor: "transparent",
                  }}
                >
                  {app}
                </span>
              ))}
            </div>
          </div>

          {/* ── Main area: letter content + scrubber ── */}
          <div className="flex flex-1 min-h-0 px-6 mt-4">
            {/* Left: app content */}
            <div className="flex-1 flex flex-col pr-3 min-h-0">
              {/* Letter heading */}
              {showLetter && (
                <div
                  className="font-serif italic"
                  style={{
                    fontSize: 56,
                    fontWeight: 700,
                    color: "hsl(var(--primary) / 0.1)",
                    lineHeight: 1,
                    marginBottom: 8,
                    transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                >
                  {letter}
                </div>
              )}

              {/* Search result count */}
              {showSearch && (
                <div
                  className="font-serif italic mb-3"
                  style={{
                    fontSize: 13,
                    color: "hsl(var(--muted-foreground) / 0.4)",
                  }}
                >
                  {filtered.length} result{filtered.length !== 1 ? "s" : ""}
                </div>
              )}

              {/* App list */}
              <div className="flex-1 overflow-y-auto hide-scrollbar">
                {visibleApps.map((app, i) => (
                  <AppItem
                    key={app}
                    app={app}
                    index={i}
                    query={search}
                    onOpen={(name) => {
                      onOpenApp(name);
                      dismiss();
                    }}
                  />
                ))}

                {/* Empty states */}
                {showFavs && visibleApps.length === 0 && (
                  <div
                    className="font-serif italic mt-8"
                    style={{
                      fontSize: 14,
                      color: "hsl(var(--muted-foreground) / 0.2)",
                    }}
                  >
                    scrub or search
                  </div>
                )}
                {showSearch && filtered.length === 0 && (
                  <div
                    className="font-serif italic mt-4"
                    style={{
                      fontSize: 14,
                      color: "hsl(var(--muted-foreground) / 0.2)",
                    }}
                  >
                    nothing found
                  </div>
                )}
              </div>
            </div>

            {/* Right: scrubber */}
            <div className="flex-shrink-0 flex items-stretch">
              <Scrubber
                activeSet={activeSet}
                onLetter={(l) => {
                  setLetter(l);
                  setSearch("");
                }}
                onRelease={handleRelease}
              />
            </div>
          </div>

          {/* ── Search bar (bottom) ── */}
          <div
            className="flex items-center gap-2 px-6 mt-3"
            style={{
              borderTop: "1px solid hsl(var(--border) / 0.08)",
              paddingTop: 10,
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setLetter(null);
              }}
              onFocus={() => {
                setFocused(true);
                setLetter(null);
              }}
              onBlur={() => setTimeout(() => setFocused(false), 120)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setSearch("");
                  inputRef.current?.blur();
                }
                if (e.key === "Enter" && visibleApps.length > 0) {
                  onOpenApp(visibleApps[0]);
                  dismiss();
                }
              }}
              placeholder="search…"
              className="flex-1 bg-transparent font-serif italic text-sm outline-none"
              style={{
                color: "hsl(var(--foreground) / 0.7)",
                caretColor: "hsl(var(--primary))",
                border: "none",
              }}
            />
            {search ? (
              <button
                onClick={() => setSearch("")}
                className="font-serif text-sm"
                style={{
                  background: "none",
                  border: "none",
                  color: "hsl(var(--muted-foreground) / 0.4)",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                ×
              </button>
            ) : (
              <BlinkCursor />
            )}
          </div>
        </div>
      </div>
    </>
  );
};
