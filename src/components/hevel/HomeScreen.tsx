import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { COVER_APPS, ALL_APPS } from "./types";
import { AtmosphericBg } from "./AtmosphericBg";
import { SignalCover } from "./covers/SignalCover";
import { TerminalCover } from "./covers/TerminalCover";
import { FirefoxCover } from "./covers/FirefoxCover";
import { NotesCover } from "./covers/NotesCover";
import { MessagesCover } from "./covers/MessagesCover";
import { MusicCover } from "./covers/MusicCover";

const COVER_COMPONENTS: Record<string, React.FC> = {
  Signal: SignalCover,
  Terminal: TerminalCover,
  Firefox: FirefoxCover,
  Notes: NotesCover,
  Messages: MessagesCover,
  Music: MusicCover,
};

const SORTED_APPS = [...ALL_APPS].sort();
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

interface Props {
  onOpenApp: (name: string) => void;
  onSwipeToNotifications: () => void;
  onOpenSwitcher: () => void;
  onOpenControlCenter: () => void;
}

export const HomeScreen: React.FC<Props> = ({
  onOpenApp,
  onSwipeToNotifications,
  onOpenSwitcher,
  onOpenControlCenter,
}) => {
  const [time, setTime] = useState(new Date());
  const dragRef = useRef({ startY: 0, startX: 0, dragging: false });

  // Scrub / launcher-focus state
  const [scrubbing, setScrubbing] = useState(false);
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const [fadingOut, setFadingOut] = useState(false);
  const [launcherFocus, setLauncherFocus] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const scrubZoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const hours = time.getHours().toString().padStart(2, "0");
  const minutes = time.getMinutes().toString().padStart(2, "0");

  // Apps grouped by letter
  const grouped = useMemo(() => {
    const m: Record<string, string[]> = {};
    SORTED_APPS.forEach((a) => {
      const l = a[0].toUpperCase();
      if (!m[l]) m[l] = [];
      m[l].push(a);
    });
    return m;
  }, []);

  const activeLetterSet = useMemo(() => new Set(Object.keys(grouped)), [grouped]);

  // Filtered apps for search
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    return SORTED_APPS.filter((a) => a.toLowerCase().includes(q));
  }, [search]);

  // Visible apps: scrub shows letter group, search shows filtered
  const visibleApps = useMemo(() => {
    if (search.trim()) return filtered;
    if (activeLetter) return grouped[activeLetter] || [];
    return [];
  }, [search, activeLetter, filtered, grouped]);

  // Is the home surface receded?
  const receded = scrubbing || launcherFocus;
  const activeIdx = activeLetter ? LETTERS.indexOf(activeLetter) : -1;

  // Exit everything
  const exitLauncher = useCallback(() => {
    setLauncherFocus(false);
    setActiveLetter(null);
    setSearch("");
    setScrubbing(false);
    setFadingOut(false);
  }, []);

  // Gesture handling
  const handlePointerDown = (e: React.PointerEvent) => {
    dragRef.current = { startY: e.clientY, startX: e.clientX, dragging: true };
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!dragRef.current.dragging) return;
    const dy = dragRef.current.startY - e.clientY;
    const dx = dragRef.current.startX - e.clientX;
    dragRef.current.dragging = false;

    if (launcherFocus) {
      if (dy < -60) exitLauncher();
      return;
    }

    // Flick up enters launcher focus (with search)
    if (dy > 80) {
      setLauncherFocus(true);
      setSearch("");
      setActiveLetter(null);
    } else if (dy < -60) onOpenControlCenter();
    else if (dx > 60) onSwipeToNotifications();
  };

  // Scrub zone handlers — invisible left-edge strip
  const calcLetter = useCallback((clientY: number) => {
    const zone = scrubZoneRef.current;
    if (!zone) return null;
    const rect = zone.getBoundingClientRect();
    const pct = Math.max(0, Math.min(0.999, (clientY - rect.top) / rect.height));
    return LETTERS[Math.floor(pct * LETTERS.length)];
  }, []);

  const handleScrubStart = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setScrubbing(true);
    setFadingOut(false);
    const l = calcLetter(e.clientY);
    if (l) setActiveLetter(l);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleScrubMove = (e: React.PointerEvent) => {
    if (!scrubbing) return;
    const l = calcLetter(e.clientY);
    if (l && l !== activeLetter) setActiveLetter(l);
  };

  const handleScrubEnd = () => {
    if (!scrubbing) return;
    // Select the first app in the active letter group
    if (activeLetter) {
      const apps = grouped[activeLetter];
      if (apps && apps.length === 1) {
        onOpenApp(apps[0]);
      }
    }
    setFadingOut(true);
    setTimeout(() => {
      setScrubbing(false);
      setFadingOut(false);
      setActiveLetter(null);
    }, 250);
  };

  const handleAppSelect = useCallback((name: string) => {
    onOpenApp(name);
    exitLauncher();
  }, [onOpenApp, exitLauncher]);

  return (
    <div
      className="absolute inset-0 flex flex-col select-none"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      style={{ touchAction: "none" }}
    >
      <AtmosphericBg />

      {/* Status bar */}
      <div className="flex justify-between items-center px-6 pt-14 pb-2 relative z-10">
        <span
          className="text-sm font-serif tracking-tight"
          style={{ color: "hsl(var(--foreground) / 0.6)" }}
        >
          {hours}:{minutes}
        </span>
        <div className="flex items-center gap-1.5">
          <span
            className="text-[10px] font-serif tracking-wider"
            style={{ color: "hsl(var(--muted-foreground) / 0.3)" }}
          >
            ▲▲
          </span>
          <span
            className="text-xs font-serif"
            style={{ color: "hsl(var(--muted-foreground) / 0.4)" }}
          >
            78%
          </span>
        </div>
      </div>

      {/* Cover cards — recede when scrubbing or in launcher focus */}
      <div
        className="flex-1 px-4 pt-6 pb-2 overflow-hidden"
        style={{
          filter: receded ? "blur(10px) brightness(0.6)" : "none",
          transform: receded ? "scale(0.95)" : "scale(1)",
          opacity: receded ? 0.5 : 1,
          transition: "all 0.35s cubic-bezier(0.16,1,0.3,1)",
          pointerEvents: receded ? "none" : "auto",
        }}
      >
        <div className={`grid gap-3 ${COVER_APPS.length <= 4 ? "grid-cols-2" : "grid-cols-3"}`}>
          {COVER_APPS.map((app) => {
            const Cover = COVER_COMPONENTS[app];
            return (
              <button
                key={app}
                onClick={(e) => { e.stopPropagation(); onOpenApp(app); }}
                className="relative rounded-[24px] overflow-hidden transition-transform duration-200 active:scale-[0.97] glass-surface"
                style={{ aspectRatio: "3/4" }}
              >
                {Cover && <Cover />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Drag hint */}
      <div
        className="flex justify-center py-6"
        style={{
          opacity: receded ? 0 : 1,
          transition: "opacity 0.2s ease",
        }}
      >
        <div
          className="w-10 h-1 rounded-full"
          style={{ backgroundColor: "hsl(var(--muted-foreground) / 0.15)" }}
        />
      </div>

      {/* ── Invisible scrub zone — left edge ── */}
      <div
        ref={scrubZoneRef}
        className="absolute left-0 top-16 bottom-16 w-10 z-30"
        style={{ touchAction: "none" }}
        onPointerDown={handleScrubStart}
        onPointerMove={handleScrubMove}
        onPointerUp={handleScrubEnd}
        onPointerCancel={handleScrubEnd}
      />

      {/* ── Scrub content — floats over receded home, no box ── */}
      {(scrubbing || fadingOut) && (
        <div
          className="absolute inset-0 z-20 flex"
          style={{
            paddingTop: 72,
            paddingBottom: 16,
            opacity: fadingOut ? 0 : 1,
            transition: "opacity 0.25s ease",
            pointerEvents: fadingOut ? "none" : "auto",
          }}
        >
          {/* Left: alphabet rail */}
          <div
            className="flex flex-col items-center justify-between select-none"
            style={{ width: 32, padding: "8px 0" }}
          >
            {LETTERS.map((l, i) => {
              const has = activeLetterSet.has(l);
              const isCur = l === activeLetter;
              const dist = activeIdx >= 0 ? Math.abs(i - activeIdx) : 999;
              const isNear = dist > 0 && dist <= 2;
              const offset = isCur ? 8 : isNear ? 4 * (1 - dist / 3) : 0;

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
                        ? `hsl(var(--foreground) / ${isNear ? 0.5 : 0.25})`
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

          {/* Center: focused app name + neighbors */}
          <div className="flex-1 flex flex-col justify-center items-start px-6">
            {activeLetter && (
              <>
                {/* Watermark letter */}
                <div
                  className="font-serif italic"
                  style={{
                    fontSize: 96,
                    fontWeight: 700,
                    color: "hsl(var(--primary) / 0.05)",
                    lineHeight: 0.85,
                    marginBottom: 16,
                    transition: "all 0.15s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                >
                  {activeLetter}
                </div>
                {/* App names in this letter */}
                {(grouped[activeLetter] || []).map((app, i) => (
                  <div
                    key={app}
                    onClick={() => handleAppSelect(app)}
                    className="cursor-pointer select-none"
                    style={{
                      padding: "4px 0",
                      WebkitTapHighlightColor: "transparent",
                    }}
                  >
                    <span
                      className="font-serif italic"
                      style={{
                        fontSize: i === 0 ? 28 : 20,
                        fontWeight: i === 0 ? 700 : 400,
                        color: i === 0
                          ? "hsl(var(--primary))"
                          : "hsl(var(--foreground) / 0.6)",
                        transition: "all 0.12s ease-out",
                      }}
                    >
                      {app}
                    </span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Launcher focus (flick-up) — same integrated look + search ── */}
      {launcherFocus && !scrubbing && (
        <div
          className="absolute inset-0 z-20 flex"
          style={{
            paddingTop: 72,
            paddingBottom: 16,
          }}
        >
          {/* Left: alphabet rail (tappable) */}
          <div
            className="flex flex-col items-center justify-between select-none"
            style={{
              width: 32,
              padding: "8px 0",
              touchAction: "none",
              cursor: "pointer",
            }}
            onPointerDown={(e) => {
              e.stopPropagation();
              const l = calcLetter(e.clientY);
              if (l) { setActiveLetter(l); setSearch(""); }
            }}
            onPointerMove={(e) => {
              if (e.buttons > 0) {
                const l = calcLetter(e.clientY);
                if (l && l !== activeLetter) { setActiveLetter(l); setSearch(""); }
              }
            }}
          >
            {LETTERS.map((l, i) => {
              const has = activeLetterSet.has(l);
              const isCur = l === activeLetter;
              const dist = activeIdx >= 0 ? Math.abs(i - activeIdx) : 999;
              const isNear = dist > 0 && dist <= 2;
              const offset = isCur ? 8 : isNear ? 4 * (1 - dist / 3) : 0;

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
                        ? `hsl(var(--foreground) / ${isNear ? 0.5 : 0.25})`
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

          {/* Center: app content */}
          <div className="flex-1 flex flex-col min-h-0 px-4">
            {/* Letter heading watermark */}
            {activeLetter && !search.trim() && (
              <div
                className="font-serif italic"
                style={{
                  fontSize: 96,
                  fontWeight: 700,
                  color: "hsl(var(--primary) / 0.05)",
                  lineHeight: 0.85,
                  marginBottom: 16,
                  transition: "all 0.15s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                {activeLetter}
              </div>
            )}

            {/* Search result count */}
            {search.trim() && (
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
              {visibleApps.map((app, i) => {
                const isFirst = i === 0 && !search.trim();
                return (
                  <div
                    key={app}
                    onClick={() => handleAppSelect(app)}
                    className="cursor-pointer select-none"
                    style={{
                      padding: "6px 0",
                      opacity: 0,
                      transform: "translateX(-6px)",
                      animation: `fadeSlideIn 0.2s ease ${i * 45}ms forwards`,
                      WebkitTapHighlightColor: "transparent",
                    }}
                  >
                    <span
                      className="font-serif italic"
                      style={{
                        fontSize: isFirst ? 28 : 20,
                        fontWeight: isFirst ? 700 : 400,
                        color: isFirst
                          ? "hsl(var(--primary))"
                          : "hsl(var(--foreground) / 0.6)",
                        transition: "all 0.12s ease-out",
                      }}
                    >
                      {search.trim() ? highlightMatch(app, search) : app}
                    </span>
                  </div>
                );
              })}

              {/* Resting hint */}
              {!activeLetter && !search.trim() && (
                <div
                  className="font-serif italic mt-12"
                  style={{
                    fontSize: 16,
                    color: "hsl(var(--muted-foreground) / 0.18)",
                  }}
                >
                  scrub or search
                </div>
              )}
              {search.trim() && filtered.length === 0 && (
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

            {/* Search bar at bottom */}
            <div
              className="flex items-center gap-2 mt-3"
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
                  setActiveLetter(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    if (search) setSearch("");
                    else exitLauncher();
                  }
                  if (e.key === "Enter" && visibleApps.length > 0) {
                    handleAppSelect(visibleApps[0]);
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
                <span
                  className="inline-block animate-breathe"
                  style={{
                    width: 3,
                    height: 18,
                    backgroundColor: "hsl(var(--primary))",
                    opacity: 0.6,
                    borderRadius: 1,
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Helpers ──────────────────────────────────────────────────────────── */

function highlightMatch(app: string, query: string): React.ReactNode {
  const q = query.trim().toLowerCase();
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
}
