import React, { useMemo, useState, useEffect } from "react";
import { AppScreen } from "./AppScreen";

interface Props {
  onClose: () => void;
  onOpenUtilityDrawer?: () => void;
}

interface Video {
  id: string;
  title: string;
  channel: string;
  duration: string; // mm:ss
  views: string;
  ago: string;
  hue: number;
}

const FEED: Video[] = [
  { id: "v1", title: "What we lose when we stop walking", channel: "Slow Channel", duration: "12:04", views: "84K views", ago: "2 days ago", hue: 28 },
  { id: "v2", title: "How Linux phones actually feel in 2026", channel: "Post-Android", duration: "18:22", views: "210K views", ago: "5 days ago", hue: 200 },
  { id: "v3", title: "Miles Davis, in a small room (1964, restored)", channel: "Blue Note Archive", duration: "47:11", views: "1.2M views", ago: "3 weeks ago", hue: 220 },
  { id: "v4", title: "The case against the home screen", channel: "Interface Notes", duration: "8:37", views: "32K views", ago: "yesterday", hue: 12 },
  { id: "v5", title: "A dal recipe my grandmother refused to write down", channel: "Kitchen Letters", duration: "6:48", views: "58K views", ago: "1 week ago", hue: 40 },
  { id: "v6", title: "Lisbon, in the rain, on foot", channel: "Field Recordings", duration: "22:09", views: "147K views", ago: "4 days ago", hue: 180 },
  { id: "v7", title: "Sailfish OS in 2026 — a long look", channel: "Post-Android", duration: "26:30", views: "94K views", ago: "2 weeks ago", hue: 160 },
  { id: "v8", title: "Why your terminal is faster than your browser", channel: "lowlevel.dev", duration: "14:52", views: "412K views", ago: "1 month ago", hue: 280 },
];

const TABS = ["Subscriptions", "Trending", "Search"];

const Thumb: React.FC<{ v: Video; size?: "list" | "player" }> = ({ v, size = "list" }) => (
  <div
    className="relative w-full overflow-hidden"
    style={{
      aspectRatio: "16 / 9",
      background: `linear-gradient(135deg, hsl(${v.hue} 40% 28%), hsl(${(v.hue + 40) % 360} 30% 16%))`,
      borderRadius: size === "list" ? 4 : 6,
    }}
  >
    {/* Soft ghost play triangle */}
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{ opacity: 0.35 }}
    >
      <div
        style={{
          width: 0,
          height: 0,
          borderLeft: "14px solid hsl(var(--foreground) / 0.85)",
          borderTop: "9px solid transparent",
          borderBottom: "9px solid transparent",
          marginLeft: 4,
        }}
      />
    </div>
    {/* Duration badge */}
    <div
      className="absolute font-serif"
      style={{
        right: 4,
        bottom: 4,
        fontSize: 9,
        color: "hsl(0 0% 95%)",
        background: "hsl(0 0% 0% / 0.7)",
        padding: "1px 4px",
        borderRadius: 2,
        letterSpacing: "0.02em",
      }}
    >
      {v.duration}
    </div>
  </div>
);

export const HavelTube: React.FC<Props> = ({ onClose, onOpenUtilityDrawer }) => {
  const [tab, setTab] = useState("Subscriptions");
  const [search, setSearch] = useState("");
  const [playing, setPlaying] = useState<Video | null>(null);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);

  const filtered = useMemo(() => {
    if (tab !== "Search") return FEED;
    const q = search.trim().toLowerCase();
    if (!q) return [];
    return FEED.filter(
      (v) => v.title.toLowerCase().includes(q) || v.channel.toLowerCase().includes(q)
    );
  }, [tab, search]);

  useEffect(() => {
    if (!playing || paused) return;
    const id = setInterval(() => setProgress((p) => (p >= 1 ? 0 : p + 0.003)), 200);
    return () => clearInterval(id);
  }, [playing, paused]);

  const fmtTime = (frac: number, dur: string) => {
    const [m, s] = dur.split(":").map(Number);
    const total = m * 60 + s;
    const cur = Math.floor(frac * total);
    return `${Math.floor(cur / 60)}:${String(cur % 60).padStart(2, "0")}`;
  };

  return (
    <AppScreen appName="haveltube" onClose={onClose} onOpenUtilityDrawer={onOpenUtilityDrawer}>
      {/* Tab strip */}
      <div
        className="flex px-4 pt-1 pb-2"
        style={{ borderBottom: "1px solid hsl(var(--border) / 0.3)" }}
      >
        {TABS.map((t) => {
          const active = t === tab;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
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

      {/* Search field (only on Search tab) */}
      {tab === "Search" && (
        <div className="px-4 pt-3">
          <input
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search videos…"
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
      <div className="flex-1 overflow-y-auto px-4 py-3" style={{ scrollbarWidth: "none" }}>
        {tab === "Search" && search.trim() === "" && (
          <p
            className="font-serif italic mt-6"
            style={{ fontSize: 13, color: "hsl(var(--muted-foreground) / 0.5)" }}
          >
            type to search.
          </p>
        )}
        {filtered.length === 0 && tab === "Search" && search.trim() !== "" && (
          <p
            className="font-serif italic mt-6"
            style={{ fontSize: 13, color: "hsl(var(--muted-foreground) / 0.5)" }}
          >
            no results.
          </p>
        )}
        {filtered.map((v) => (
          <button
            key={v.id}
            onPointerDown={(e) => e.stopPropagation()}
            onPointerUp={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              setPlaying(v);
              setProgress(0);
              setPaused(false);
            }}
            className="w-full text-left flex gap-3 py-2.5 active:opacity-70"
          >
            {/* Thumbnail — fixed width keeps 16:9 honest */}
            <div style={{ width: 140, flexShrink: 0 }}>
              <Thumb v={v} />
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <p
                className="font-serif"
                style={{
                  fontSize: 13,
                  lineHeight: 1.3,
                  color: "hsl(var(--foreground) / 0.95)",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {v.title}
              </p>
              <p
                className="font-serif mt-1"
                style={{ fontSize: 11, color: "hsl(var(--muted-foreground) / 0.7)" }}
              >
                {v.channel}
              </p>
              <p
                className="font-serif"
                style={{ fontSize: 10, color: "hsl(var(--muted-foreground) / 0.5)" }}
              >
                {v.views} · {v.ago}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Player */}
      {playing && (
        <div
          className="absolute inset-0 z-40 flex flex-col"
          style={{
            background: "hsl(var(--background) / 0.97)",
            backdropFilter: "blur(20px)",
          }}
        >
          {/* Top bar */}
          <div className="flex items-center justify-between px-4 pt-12 pb-3">
            <button
              onClick={() => setPlaying(null)}
              className="font-serif"
              style={{ fontSize: 13, color: "hsl(var(--muted-foreground) / 0.7)" }}
            >
              ← Back
            </button>
            <span style={{ width: 32 }} />
          </div>

          {/* 16:9 stage */}
          <div className="px-0">
            <div
              onClick={() => setPaused((p) => !p)}
              className="relative cursor-pointer"
              style={{
                width: "100%",
                aspectRatio: "16 / 9",
                background: `linear-gradient(135deg, hsl(${playing.hue} 40% 22%), hsl(${(playing.hue + 30) % 360} 30% 12%))`,
              }}
            >
              {/* Play/pause hint */}
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ opacity: paused ? 1 : 0, transition: "opacity 0.3s ease" }}
              >
                <div
                  style={{
                    width: 0,
                    height: 0,
                    borderLeft: "22px solid hsl(var(--foreground) / 0.9)",
                    borderTop: "14px solid transparent",
                    borderBottom: "14px solid transparent",
                    marginLeft: 6,
                  }}
                />
              </div>
              {/* Live dot */}
              {!paused && (
                <div
                  className="absolute"
                  style={{
                    left: 10,
                    top: 10,
                    width: 6,
                    height: 6,
                    borderRadius: 999,
                    background: "hsl(var(--accent))",
                    animation: "breathe 2.5s ease-in-out infinite",
                  }}
                />
              )}
              {/* Scrubber over thumb */}
              <div
                className="absolute left-0 right-0"
                style={{ bottom: 0, height: 2, background: "hsl(0 0% 100% / 0.15)" }}
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
          </div>

          {/* Meta */}
          <div className="px-4 pt-4 flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
            <p
              className="font-serif"
              style={{
                fontSize: 16,
                lineHeight: 1.3,
                color: "hsl(var(--foreground) / 0.95)",
              }}
            >
              {playing.title}
            </p>
            <p
              className="font-serif mt-1"
              style={{ fontSize: 12, color: "hsl(var(--muted-foreground) / 0.7)" }}
            >
              {playing.views} · {playing.ago}
            </p>

            <div
              className="flex items-center gap-3 mt-3 pb-3"
              style={{ borderBottom: "1px solid hsl(var(--border) / 0.3)" }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 999,
                  background: `hsl(${playing.hue} 40% 35%)`,
                }}
              />
              <p
                className="font-serif"
                style={{ fontSize: 13, color: "hsl(var(--foreground) / 0.9)" }}
              >
                {playing.channel}
              </p>
            </div>

            {/* Action row */}
            <div className="flex gap-5 mt-3">
              {["Like", "Save", "Share", "Queue"].map((a) => (
                <button
                  key={a}
                  className="font-serif italic"
                  style={{ fontSize: 12, color: "hsl(var(--primary) / 0.85)" }}
                >
                  {a}
                </button>
              ))}
            </div>

            <p
              className="font-serif italic mt-4"
              style={{ fontSize: 10, color: "hsl(var(--muted-foreground) / 0.5)" }}
            >
              {fmtTime(progress, playing.duration)} / {playing.duration}
            </p>
          </div>
        </div>
      )}
    </AppScreen>
  );
};
