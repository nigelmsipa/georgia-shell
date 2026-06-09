import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { DEFAULT_COVER_APPS, ALL_APPS } from "./types";
import { AtmosphericBg } from "./AtmosphericBg";
import { SignalCover } from "./covers/SignalCover";
import { TerminalCover } from "./covers/TerminalCover";
import { AngelfishCover } from "./covers/AngelfishCover";
import { NotesCover } from "./covers/NotesCover";
import { MessagesCover } from "./covers/MessagesCover";
import { MusicCover } from "./covers/MusicCover";
import { AIChatCover } from "./covers/AIChatCover";
import { HavelTubeCover } from "./covers/HavelTubeCover";
import { ContactsCover } from "./covers/ContactsCover";
import { VoiceCover } from "./covers/VoiceCover";

const COVER_COMPONENTS: Record<string, React.FC> = {
  "AI Chat": AIChatCover,
  "HavelTube": HavelTubeCover,
  Signal: SignalCover,
  Terminal: TerminalCover,
  Angelfish: AngelfishCover,
  Notes: NotesCover,
  Messages: MessagesCover,
  Music: MusicCover,
  Contacts: ContactsCover,
  Voice: VoiceCover,
};


const SORTED_APPS = [...ALL_APPS].sort();
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

interface Props {
  onOpenApp: (name: string) => void;
  onSwipeToNotifications: () => void;
  onOpenControlCenter: () => void;
  onOpenUtilityDrawer?: () => void;
}

export const HomeScreen: React.FC<Props> = ({
  onOpenApp,
  onSwipeToNotifications,
  onOpenControlCenter,
  onOpenUtilityDrawer,
}) => {
  const [time, setTime] = useState(new Date());
  const dragRef = useRef({ startY: 0, startX: 0, dragging: false });

  // Dynamic cover apps
  const [coverApps, setCoverApps] = useState<string[]>(DEFAULT_COVER_APPS);
  const [editMode, setEditMode] = useState(false);
  const [addedFlash, setAddedFlash] = useState<string | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const launcherLpTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Scrub / launcher-focus state
  const [scrubbing, setScrubbing] = useState(false);
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const [fadingOut, setFadingOut] = useState(false);
  const [launcherFocus, setLauncherFocus] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const scrubZoneRef = useRef<HTMLDivElement>(null);

  // Grid columns: 2 for ≤4, 3 for 5+
  const gridCols = coverApps.length <= 4 ? 2 : 3;

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
  const containerRef = useRef<HTMLDivElement>(null);

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

    // Swipe up from bottom 60px → utility drawer
    const containerRect = containerRef.current?.getBoundingClientRect();
    const startedFromBottom = containerRect
      ? dragRef.current.startY > containerRect.bottom - 60
      : false;

    if (dy > 80 && startedFromBottom && onOpenUtilityDrawer) {
      onOpenUtilityDrawer();
    } else if (dy > 80) {
      // Flick up enters launcher focus (with search)
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
    const letter = activeLetter;
    const apps = letter ? grouped[letter] : null;

    // Single-app letter → open directly
    if (letter && apps && apps.length === 1) {
      onOpenApp(apps[0]);
      setFadingOut(true);
      setTimeout(() => {
        setScrubbing(false);
        setFadingOut(false);
        setActiveLetter(null);
      }, 250);
      return;
    }

    // Multi-app letter → keep visible so user can tap a specific app
    if (letter && apps && apps.length > 1) {
      setScrubbing(false);
      setLauncherFocus(true);
      setSearch("");
      // keep activeLetter as-is
      return;
    }

    // No letter selected → just fade out
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

  const addAppToHome = useCallback((name: string) => {
    setCoverApps((prev) => {
      if (prev.includes(name)) return prev;
      return [...prev, name];
    });
    setAddedFlash(name);
    setTimeout(() => setAddedFlash(null), 800);
  }, []);

  const startLauncherLongPress = useCallback((name: string) => {
    launcherLpTimer.current = setTimeout(() => {
      addAppToHome(name);
    }, 600);
  }, [addAppToHome]);

  const cancelLauncherLongPress = useCallback(() => {
    if (launcherLpTimer.current) {
      clearTimeout(launcherLpTimer.current);
      launcherLpTimer.current = null;
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 flex flex-col select-none"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      style={{ touchAction: "none" }}
    >
      <AtmosphericBg />

      {/* ── Status bar ── */}
      <div
        className="flex justify-center items-center px-5 pt-12 pb-3 relative z-10"
      >
        <span
          className="font-serif tracking-tight"
          style={{
            fontSize: 15,
            fontWeight: 500,
            color: "hsl(var(--foreground) / 0.5)",
            letterSpacing: "0.02em",
          }}
        >
          {hours}:{minutes}
        </span>
      </div>

      {/* ── Cover cards — recede when scrubbing or in launcher focus ── */}
      <div
        className="flex-1 px-3 pt-4 pb-2 overflow-hidden relative"
        style={{
          transform: receded ? "scale(0.95)" : "scale(1)",
          opacity: receded ? 0.28 : 1,
          filter: receded ? "blur(14px)" : "blur(0px)",
          transition: "transform 0.35s cubic-bezier(0.16,1,0.3,1), opacity 0.35s cubic-bezier(0.16,1,0.3,1), filter 0.35s cubic-bezier(0.16,1,0.3,1)",
          pointerEvents: receded ? "none" : "auto",
        }}

      >
        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
            gap: gridCols === 2 ? 10 : 8,
            transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          {coverApps.map((app, idx) => {
            const Cover = COVER_COMPONENTS[app];
            return (
              <div
                key={app}
                className="relative"
                style={{
                  aspectRatio: gridCols === 2 ? "2/3" : "3/5",
                  animation: editMode ? `wiggle 0.3s ease-in-out infinite ${idx % 2 === 0 ? '' : '0.15s'}` : "none",
                }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (editMode) {
                      setEditMode(false);
                    } else {
                      onOpenApp(app);
                    }
                  }}
                  onPointerDown={() => {
                    longPressTimer.current = setTimeout(() => {
                      setEditMode(true);
                    }, 500);
                  }}
                  onPointerUp={() => {
                    if (longPressTimer.current) {
                      clearTimeout(longPressTimer.current);
                      longPressTimer.current = null;
                    }
                  }}
                  onPointerCancel={() => {
                    if (longPressTimer.current) {
                      clearTimeout(longPressTimer.current);
                      longPressTimer.current = null;
                    }
                  }}
                  className="w-full h-full relative rounded-[20px] overflow-hidden transition-transform duration-200 active:scale-[0.97] bg-card border border-border/40"
                >
                  {Cover ? <Cover /> : (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{ background: "hsl(var(--secondary))" }}
                    >
                      <span
                        className="font-serif italic text-sm"
                        style={{ color: "hsl(var(--foreground) / 0.4)" }}
                      >
                        {app}
                      </span>
                    </div>
                  )}
                </button>
                {/* Remove badge in edit mode */}
                {editMode && coverApps.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCoverApps((prev) => prev.filter((a) => a !== app));
                      if (coverApps.length <= 2) setEditMode(false);
                    }}
                    className="absolute -top-1.5 -right-1.5 z-10 flex items-center justify-center rounded-full"
                    style={{
                      width: 22,
                      height: 22,
                      background: "hsl(var(--destructive))",
                      border: "2px solid hsl(var(--background))",
                    }}
                  >
                    <span
                      className="font-serif"
                      style={{ fontSize: 12, fontWeight: 700, color: "hsl(var(--destructive-foreground))", lineHeight: 1 }}
                    >
                      ×
                    </span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Drag hint */}
      <div
        className="flex justify-center py-4"
        style={{
          opacity: receded ? 0 : 1,
          transition: "opacity 0.2s ease",
        }}
      >
        <div
          className="w-8 h-[3px] rounded-full"
          style={{ backgroundColor: "hsl(var(--muted-foreground) / 0.12)" }}
        />
      </div>

      {/* ── Invisible scrub zone — right edge ── */}
      <div
        ref={scrubZoneRef}
        className="absolute right-0 top-16 bottom-16 w-10 z-30"
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
                {(grouped[activeLetter] || []).map((app, i) => {
                  const isOnHome = coverApps.includes(app);
                  const justAdded = addedFlash === app;
                  return (
                    <div
                      key={app}
                      onClick={() => handleAppSelect(app)}
                      onPointerDown={() => startLauncherLongPress(app)}
                      onPointerUp={cancelLauncherLongPress}
                      onPointerCancel={cancelLauncherLongPress}
                      className="cursor-pointer select-none flex items-center gap-2"
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
                          color: justAdded
                            ? "hsl(var(--accent))"
                            : i === 0
                              ? "hsl(var(--primary))"
                              : "hsl(var(--foreground) / 0.6)",
                          transition: "color 0.3s ease-out",
                        }}
                      >
                        {app}
                      </span>
                      {isOnHome && (
                        <span
                          className="font-serif"
                          style={{ fontSize: 8, color: "hsl(var(--muted-foreground) / 0.3)" }}
                        >
                          ●
                        </span>
                      )}
                    </div>
                  );
                })}
              </>
            )}
          </div>

          {/* Right: alphabet rail */}
          <div
            className="flex flex-col items-center justify-between select-none"
            style={{ width: 32, padding: "8px 0" }}
          >
            {LETTERS.map((l, i) => {
              const has = activeLetterSet.has(l);
              const isCur = l === activeLetter;
              const dist = activeIdx >= 0 ? Math.abs(i - activeIdx) : 999;
              const isNear = dist > 0 && dist <= 2;
              const offset = isCur ? -8 : isNear ? -4 * (1 - dist / 3) : 0;

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
                const isOnHome = coverApps.includes(app);
                const justAdded = addedFlash === app;
                return (
                  <div
                    key={app}
                    onClick={() => handleAppSelect(app)}
                    onPointerDown={() => startLauncherLongPress(app)}
                    onPointerUp={cancelLauncherLongPress}
                    onPointerCancel={cancelLauncherLongPress}
                    className="cursor-pointer select-none flex items-center gap-2"
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
                        color: justAdded
                          ? "hsl(var(--accent))"
                          : isFirst
                            ? "hsl(var(--primary))"
                            : "hsl(var(--foreground) / 0.6)",
                        transition: "color 0.3s ease-out",
                      }}
                    >
                      {search.trim() ? highlightMatch(app, search) : app}
                    </span>
                    {isOnHome && (
                      <span
                        className="font-serif"
                        style={{ fontSize: 8, color: "hsl(var(--muted-foreground) / 0.3)" }}
                      >
                        ●
                      </span>
                    )}
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

          {/* Right: alphabet rail (tappable) */}
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
              const offset = isCur ? -8 : isNear ? -4 * (1 - dist / 3) : 0;

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
