import React, { useEffect, useMemo, useState } from "react";
import { AppScreen } from "./AppScreen";

interface Props {
  onClose: () => void;
  onOpenUtilityDrawer?: () => void;
}

interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string; // mm:ss
  hue: number;
}

const LIBRARY: Track[] = [
  { id: "t1", title: "So What", artist: "Miles Davis", album: "Kind of Blue", duration: "9:22", hue: 220 },
  { id: "t2", title: "Blue in Green", artist: "Miles Davis", album: "Kind of Blue", duration: "5:37", hue: 220 },
  { id: "t3", title: "Naima", artist: "John Coltrane", album: "Giant Steps", duration: "4:25", hue: 200 },
  { id: "t4", title: "Round Midnight", artist: "Thelonious Monk", album: "Monk's Dream", duration: "6:48", hue: 280 },
  { id: "t5", title: "Take Five", artist: "Dave Brubeck", album: "Time Out", duration: "5:24", hue: 12 },
  { id: "t6", title: "Cantaloupe Island", artist: "Herbie Hancock", album: "Empyrean Isles", duration: "5:33", hue: 40 },
  { id: "t7", title: "A Love Supreme, Pt. I", artist: "John Coltrane", album: "A Love Supreme", duration: "7:43", hue: 28 },
  { id: "t8", title: "Footprints", artist: "Wayne Shorter", album: "Adam's Apple", duration: "7:30", hue: 160 },
  { id: "t9", title: "Stolen Moments", artist: "Oliver Nelson", album: "Blues and the Abstract Truth", duration: "8:46", hue: 180 },
];

const TABS = ["Recent", "Albums", "Artists", "Search"];

const AlbumArt: React.FC<{ hue: number; size: number; rounded?: number }> = ({
  hue,
  size,
  rounded = 4,
}) => (
  <div
    style={{
      width: size,
      height: size,
      flexShrink: 0,
      borderRadius: rounded,
      background: `linear-gradient(135deg, hsl(${hue} 45% 32%), hsl(${(hue + 50) % 360} 35% 16%))`,
      position: "relative",
      overflow: "hidden",
    }}
  >
    <div
      style={{
        position: "absolute",
        inset: "20%",
        borderRadius: 999,
        border: `1px solid hsl(${hue} 20% 70% / 0.25)`,
      }}
    />
    <div
      style={{
        position: "absolute",
        left: "46%",
        top: "46%",
        width: "8%",
        height: "8%",
        borderRadius: 999,
        background: `hsl(${hue} 20% 80% / 0.4)`,
      }}
    />
  </div>
);

export const Music: React.FC<Props> = ({ onClose, onOpenUtilityDrawer }) => {
  const [tab, setTab] = useState("Recent");
  const [search, setSearch] = useState("");
  const [playing, setPlaying] = useState<Track | null>(null);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fullPlayer, setFullPlayer] = useState(false);

  const visible = useMemo(() => {
    if (tab === "Search") {
      const q = search.trim().toLowerCase();
      if (!q) return [];
      return LIBRARY.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.artist.toLowerCase().includes(q) ||
          t.album.toLowerCase().includes(q)
      );
    }
    if (tab === "Albums") {
      const seen = new Set<string>();
      return LIBRARY.filter((t) => {
        if (seen.has(t.album)) return false;
        seen.add(t.album);
        return true;
      });
    }
    if (tab === "Artists") {
      const seen = new Set<string>();
      return LIBRARY.filter((t) => {
        if (seen.has(t.artist)) return false;
        seen.add(t.artist);
        return true;
      });
    }
    return LIBRARY;
  }, [tab, search]);

  useEffect(() => {
    if (!playing || paused) return;
    const id = setInterval(() => setProgress((p) => (p >= 1 ? 0 : p + 0.004)), 200);
    return () => clearInterval(id);
  }, [playing, paused]);

  const startTrack = (t: Track) => {
    setPlaying(t);
    setProgress(0);
    setPaused(false);
  };

  const fmtTime = (frac: number, dur: string) => {
    const [m, s] = dur.split(":").map(Number);
    const total = m * 60 + s;
    const cur = Math.floor(frac * total);
    return `${Math.floor(cur / 60)}:${String(cur % 60).padStart(2, "0")}`;
  };

  return (
    <AppScreen appName="music" onClose={onClose} onOpenUtilityDrawer={onOpenUtilityDrawer}>
      {/* Tabs */}
      <div
        className="flex px-4 pt-1 pb-2"
        style={{ borderBottom: "1px solid hsl(var(--border) / 0.3)" }}
      >
        {TABS.map((t) => {
          const active = t === tab;
          return (
            <button
              key={t}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                setTab(t);
              }}
              className="font-serif"
              style={{
                fontSize: 13,
                color: active ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.6)",
                fontStyle: active ? "italic" : "normal",
                padding: "6px 14px 6px 0",
                marginRight: 6,
                letterSpacing: "0.01em",
              }}
            >
              {t}
            </button>
          );
        })}
      </div>

      {tab === "Search" && (
        <div className="px-4 pt-3">
          <input
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onPointerDown={(e) => e.stopPropagation()}
            placeholder="Search tracks, artists, albums…"
            className="w-full bg-transparent outline-none font-serif"
            style={{
              fontSize: 14,
              color: "hsl(var(--foreground) / 0.9)",
              borderBottom: "1px solid hsl(var(--border) / 0.5)",
              paddingBottom: 6,
            }}
          />
        </div>
      )}

      {/* List */}
      <div
        className="flex-1 overflow-y-auto px-4 py-2"
        style={{ scrollbarWidth: "none", paddingBottom: playing ? 84 : 16 }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {tab === "Search" && !search.trim() && (
          <p
            className="font-serif italic mt-6"
            style={{ fontSize: 13, color: "hsl(var(--muted-foreground) / 0.5)" }}
          >
            type to search.
          </p>
        )}
        {visible.length === 0 && tab === "Search" && search.trim() && (
          <p
            className="font-serif italic mt-6"
            style={{ fontSize: 13, color: "hsl(var(--muted-foreground) / 0.5)" }}
          >
            no results.
          </p>
        )}
        {visible.map((t) => {
          const active = playing?.id === t.id;
          return (
            <button
              key={t.id}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                startTrack(t);
              }}
              className="w-full text-left flex gap-3 py-2 active:opacity-70 items-center"
            >
              <AlbumArt hue={t.hue} size={48} />
              <div className="flex-1 min-w-0">
                <p
                  className="font-serif truncate"
                  style={{
                    fontSize: 14,
                    color: active ? "hsl(var(--primary))" : "hsl(var(--foreground) / 0.95)",
                    fontStyle: active ? "italic" : "normal",
                  }}
                >
                  {tab === "Albums" ? t.album : tab === "Artists" ? t.artist : t.title}
                </p>
                <p
                  className="font-serif truncate"
                  style={{ fontSize: 11, color: "hsl(var(--muted-foreground) / 0.7)" }}
                >
                  {tab === "Albums"
                    ? t.artist
                    : tab === "Artists"
                    ? `${LIBRARY.filter((x) => x.artist === t.artist).length} tracks`
                    : `${t.artist} · ${t.album}`}
                </p>
              </div>
              {tab !== "Albums" && tab !== "Artists" && (
                <span
                  className="font-serif"
                  style={{
                    fontSize: 10,
                    color: "hsl(var(--muted-foreground) / 0.5)",
                  }}
                >
                  {t.duration}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Mini player */}
      {playing && !fullPlayer && (
        <div
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            setFullPlayer(true);
          }}
          className="absolute left-0 right-0 flex items-center gap-3 px-4 py-2 cursor-pointer"
          style={{
            bottom: 0,
            height: 72,
            background: "hsl(var(--card) / 0.85)",
            backdropFilter: "blur(12px)",
            borderTop: "1px solid hsl(var(--border) / 0.4)",
          }}
        >
          <AlbumArt hue={playing.hue} size={44} />
          <div className="flex-1 min-w-0">
            <p
              className="font-serif truncate"
              style={{ fontSize: 13, color: "hsl(var(--foreground) / 0.95)" }}
            >
              {playing.title}
            </p>
            <p
              className="font-serif truncate"
              style={{ fontSize: 11, color: "hsl(var(--muted-foreground) / 0.7)" }}
            >
              {playing.artist}
            </p>
            {/* mini scrubber */}
            <div
              className="rounded-full overflow-hidden mt-1"
              style={{ height: 2, background: "hsl(var(--border) / 0.5)" }}
            >
              <div
                style={{
                  width: `${progress * 100}%`,
                  height: "100%",
                  background: "hsl(var(--primary))",
                  transition: "width 0.2s linear",
                }}
              />
            </div>
          </div>
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              setPaused((p) => !p);
            }}
            className="font-serif italic"
            style={{
              fontSize: 13,
              color: "hsl(var(--primary))",
              padding: "8px 6px",
            }}
          >
            {paused ? "play" : "pause"}
          </button>
        </div>
      )}

      {/* Full player */}
      {playing && fullPlayer && (
        <div
          onPointerDown={(e) => e.stopPropagation()}
          onPointerUp={(e) => e.stopPropagation()}
          onPointerMove={(e) => e.stopPropagation()}
          className="absolute inset-0 z-40 flex flex-col px-6"
          style={{
            background: "hsl(var(--background) / 0.97)",
            backdropFilter: "blur(20px)",
            touchAction: "auto",
          }}
        >
          <div className="flex items-center justify-between pt-12 pb-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setFullPlayer(false);
              }}
              className="font-serif"
              style={{ fontSize: 13, color: "hsl(var(--muted-foreground) / 0.7)" }}
            >
              ↓ Now Playing
            </button>
            <span style={{ width: 32 }} />
          </div>

          <div className="flex-1 flex flex-col justify-center items-center">
            <AlbumArt hue={playing.hue} size={240} rounded={8} />
            <p
              className="font-serif text-center mt-8"
              style={{
                fontSize: 20,
                color: "hsl(var(--foreground) / 0.95)",
                letterSpacing: "-0.01em",
              }}
            >
              {playing.title}
            </p>
            <p
              className="font-serif italic text-center mt-1"
              style={{ fontSize: 13, color: "hsl(var(--muted-foreground) / 0.75)" }}
            >
              {playing.artist} · {playing.album}
            </p>
          </div>

          <div className="pb-8">
            <div
              className="rounded-full overflow-hidden"
              style={{ height: 3, background: "hsl(var(--border) / 0.5)" }}
            >
              <div
                style={{
                  width: `${progress * 100}%`,
                  height: "100%",
                  background: "hsl(var(--primary))",
                  transition: "width 0.2s linear",
                }}
              />
            </div>
            <div className="flex justify-between mt-1.5">
              <span
                className="font-serif"
                style={{ fontSize: 10, color: "hsl(var(--muted-foreground) / 0.6)" }}
              >
                {fmtTime(progress, playing.duration)}
              </span>
              <span
                className="font-serif"
                style={{ fontSize: 10, color: "hsl(var(--muted-foreground) / 0.6)" }}
              >
                {playing.duration}
              </span>
            </div>

            <div className="flex items-center justify-center gap-8 mt-6">
              <button
                className="font-serif italic"
                style={{ fontSize: 13, color: "hsl(var(--muted-foreground) / 0.7)" }}
              >
                ⏮
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setPaused((p) => !p);
                }}
                className="font-serif italic"
                style={{
                  fontSize: 18,
                  color: "hsl(var(--primary))",
                  width: 56,
                  height: 56,
                  borderRadius: 999,
                  border: "1px solid hsl(var(--primary) / 0.4)",
                }}
              >
                {paused ? "▶" : "❚❚"}
              </button>
              <button
                className="font-serif italic"
                style={{ fontSize: 13, color: "hsl(var(--muted-foreground) / 0.7)" }}
              >
                ⏭
              </button>
            </div>
          </div>
        </div>
      )}
    </AppScreen>
  );
};
