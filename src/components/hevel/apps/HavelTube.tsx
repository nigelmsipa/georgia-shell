import React, { useMemo, useState } from "react";
import { AppScreen } from "./AppScreen";

interface Props {
  onClose: () => void;
  onOpenUtilityDrawer?: () => void;
}

interface Video {
  id: string;
  title: string;
  channel: string;
  duration: string;
  ago: string;
  blurb: string;
  hue: number;
}

const FEED: Video[] = [
  {
    id: "v1",
    title: "what we lose when we stop walking",
    channel: "slow channel",
    duration: "12 min",
    ago: "2 days ago",
    blurb: "a quiet essay about cities, sidewalks, and the slow erosion of unhurried time.",
    hue: 28,
  },
  {
    id: "v2",
    title: "how linux phones actually feel in 2026",
    channel: "post-android",
    duration: "18 min",
    ago: "5 days ago",
    blurb: "two weeks with a pinephone pro — what surprised, what broke, what you stop missing.",
    hue: 200,
  },
  {
    id: "v3",
    title: "miles davis, in a small room",
    channel: "blue note archive",
    duration: "47 min",
    ago: "3 weeks ago",
    blurb: "rare 1964 club recording, restored. headphones recommended.",
    hue: 220,
  },
  {
    id: "v4",
    title: "the case against the home screen",
    channel: "interface notes",
    duration: "8 min",
    ago: "yesterday",
    blurb: "what if your phone showed you nothing until you asked?",
    hue: 12,
  },
  {
    id: "v5",
    title: "a dal recipe my grandmother refused to write down",
    channel: "kitchen letters",
    duration: "6 min",
    ago: "1 week ago",
    blurb: "tempering, timing, and the one ingredient she insisted on.",
    hue: 40,
  },
  {
    id: "v6",
    title: "lisbon, in the rain, on foot",
    channel: "field recordings",
    duration: "22 min",
    ago: "4 days ago",
    blurb: "no narration. just trams, cobbles, and water on stone.",
    hue: 180,
  },
];

const CATEGORIES = ["for you", "essays", "music", "field", "saved"];

export const HavelTube: React.FC<Props> = ({ onClose, onOpenUtilityDrawer }) => {
  const [category, setCategory] = useState("for you");
  const [search, setSearch] = useState("");
  const [playing, setPlaying] = useState<Video | null>(null);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return FEED;
    return FEED.filter(
      (v) =>
        v.title.toLowerCase().includes(q) ||
        v.channel.toLowerCase().includes(q) ||
        v.blurb.toLowerCase().includes(q)
    );
  }, [search]);

  // Fake progress ticker when playing
  React.useEffect(() => {
    if (!playing || paused) return;
    const id = setInterval(() => {
      setProgress((p) => (p >= 1 ? 0 : p + 0.004));
    }, 200);
    return () => clearInterval(id);
  }, [playing, paused]);

  const openVideo = (v: Video) => {
    setPlaying(v);
    setProgress(0);
    setPaused(false);
  };

  return (
    <AppScreen appName="haveltube" onClose={onClose} onOpenUtilityDrawer={onOpenUtilityDrawer}>
      {/* Search line */}
      <div className="px-5 pt-2 pb-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="what do you want to see?"
          className="w-full bg-transparent outline-none font-serif italic"
          style={{
            fontSize: 18,
            color: "hsl(var(--foreground) / 0.85)",
            borderBottom: "1px solid hsl(var(--border) / 0.5)",
            paddingBottom: 6,
          }}
        />
      </div>

      {/* Category ribbon */}
      <div className="px-5 pb-3 flex gap-4 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
        {CATEGORIES.map((c) => {
          const active = c === category;
          return (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className="font-serif italic whitespace-nowrap"
              style={{
                fontSize: 12,
                color: active ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.5)",
                fontWeight: active ? 700 : 400,
                borderBottom: active ? "1px solid hsl(var(--primary) / 0.5)" : "1px solid transparent",
                paddingBottom: 2,
                letterSpacing: "0.04em",
              }}
            >
              {c}
            </button>
          );
        })}
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto px-5 pb-8" style={{ scrollbarWidth: "none" }}>
        {filtered.length === 0 && (
          <p
            className="font-serif italic mt-8"
            style={{ fontSize: 14, color: "hsl(var(--muted-foreground) / 0.5)" }}
          >
            nothing matches. try fewer words.
          </p>
        )}
        {filtered.map((v, i) => (
          <article
            key={v.id}
            className="py-5"
            style={{
              borderBottom: i < filtered.length - 1 ? "1px solid hsl(var(--border) / 0.25)" : "none",
            }}
          >
            {/* Soft poster bar */}
            <div
              onClick={() => openVideo(v)}
              className="w-full rounded-md mb-3 cursor-pointer relative overflow-hidden"
              style={{
                height: 110,
                background: `linear-gradient(135deg, hsl(${v.hue} 40% 28% / 0.7), hsl(${(v.hue + 40) % 360} 30% 18% / 0.85))`,
                border: "1px solid hsl(var(--border) / 0.3)",
              }}
            >
              <div
                className="absolute bottom-2 right-2 font-serif italic"
                style={{
                  fontSize: 10,
                  color: "hsl(var(--foreground) / 0.7)",
                  background: "hsl(var(--background) / 0.4)",
                  padding: "2px 6px",
                  borderRadius: 4,
                  backdropFilter: "blur(6px)",
                }}
              >
                {v.duration}
              </div>
            </div>

            <p
              onClick={() => openVideo(v)}
              className="font-serif cursor-pointer"
              style={{
                fontSize: 18,
                lineHeight: 1.35,
                color: "hsl(var(--foreground) / 0.92)",
                letterSpacing: "-0.01em",
              }}
            >
              {v.title}
            </p>
            <p
              className="font-serif italic mt-1"
              style={{
                fontSize: 12,
                color: "hsl(var(--muted-foreground) / 0.7)",
              }}
            >
              <span style={{ color: "hsl(var(--accent) / 0.85)" }}>{v.channel}</span>
              {" · "}
              {v.ago}
            </p>
            <p
              className="font-serif mt-2"
              style={{
                fontSize: 13,
                lineHeight: 1.5,
                color: "hsl(var(--foreground) / 0.65)",
              }}
            >
              {v.blurb}{" "}
              <button
                onClick={() => openVideo(v)}
                className="font-serif italic"
                style={{
                  color: "hsl(var(--primary))",
                  textDecoration: "underline",
                  textDecorationStyle: "dotted",
                  textUnderlineOffset: 3,
                  fontSize: 13,
                }}
              >
                watch
              </button>
              {" · "}
              <button
                className="font-serif italic"
                style={{ color: "hsl(var(--muted-foreground) / 0.7)", fontSize: 13 }}
              >
                save
              </button>
              {" · "}
              <button
                className="font-serif italic"
                style={{ color: "hsl(var(--muted-foreground) / 0.7)", fontSize: 13 }}
              >
                queue
              </button>
              .
            </p>
          </article>
        ))}
      </div>

      {/* Player overlay */}
      {playing && (
        <div
          className="absolute inset-0 z-40 flex flex-col"
          style={{
            background: "hsl(var(--background) / 0.96)",
            backdropFilter: "blur(20px)",
            animation: "fadeIn 0.3s ease",
          }}
        >
          {/* Top close */}
          <div className="flex items-center justify-between px-5 pt-12 pb-4">
            <button
              onClick={() => setPlaying(null)}
              className="font-serif italic"
              style={{ fontSize: 13, color: "hsl(var(--muted-foreground) / 0.7)" }}
            >
              ← back
            </button>
            <span
              className="font-serif italic"
              style={{ fontSize: 11, color: "hsl(var(--muted-foreground) / 0.35)", letterSpacing: "0.08em" }}
            >
              now playing
            </span>
            <span style={{ width: 40 }} />
          </div>

          {/* Stage */}
          <div className="px-5">
            <div
              onClick={() => setPaused((p) => !p)}
              className="w-full rounded-md relative overflow-hidden cursor-pointer"
              style={{
                aspectRatio: "16/10",
                background: `linear-gradient(135deg, hsl(${playing.hue} 40% 22%), hsl(${(playing.hue + 30) % 360} 30% 14%))`,
                border: "1px solid hsl(var(--border) / 0.3)",
              }}
            >
              {/* Soft floating play/pause */}
              <div
                className="absolute inset-0 flex items-center justify-center font-serif italic"
                style={{
                  fontSize: 14,
                  color: "hsl(var(--foreground) / 0.7)",
                  opacity: paused ? 1 : 0.0,
                  transition: "opacity 0.4s ease",
                }}
              >
                paused — tap to resume
              </div>
              {/* Subtle breathing dot */}
              {!paused && (
                <div
                  className="absolute"
                  style={{
                    left: 14,
                    top: 14,
                    width: 6,
                    height: 6,
                    borderRadius: 999,
                    background: "hsl(var(--accent))",
                    animation: "breathe 2.5s ease-in-out infinite",
                  }}
                />
              )}
            </div>

            {/* Scrubber */}
            <div className="mt-4">
              <div
                className="w-full rounded-full overflow-hidden"
                style={{ height: 2, background: "hsl(var(--border) / 0.4)" }}
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
                  className="font-serif italic"
                  style={{ fontSize: 10, color: "hsl(var(--muted-foreground) / 0.5)" }}
                >
                  {Math.floor(progress * 60)}s in
                </span>
                <span
                  className="font-serif italic"
                  style={{ fontSize: 10, color: "hsl(var(--muted-foreground) / 0.5)" }}
                >
                  {playing.duration}
                </span>
              </div>
            </div>

            {/* Title + meta */}
            <p
              className="font-serif mt-5"
              style={{
                fontSize: 20,
                lineHeight: 1.3,
                color: "hsl(var(--foreground) / 0.95)",
                letterSpacing: "-0.01em",
              }}
            >
              {playing.title}
            </p>
            <p
              className="font-serif italic mt-1"
              style={{ fontSize: 12, color: "hsl(var(--muted-foreground) / 0.7)" }}
            >
              <span style={{ color: "hsl(var(--accent) / 0.85)" }}>{playing.channel}</span>
              {" · "}
              {playing.ago}
            </p>
            <p
              className="font-serif mt-4"
              style={{
                fontSize: 14,
                lineHeight: 1.55,
                color: "hsl(var(--foreground) / 0.7)",
              }}
            >
              {playing.blurb}
            </p>

            {/* Inline actions */}
            <p
              className="font-serif mt-6"
              style={{
                fontSize: 13,
                lineHeight: 1.6,
                color: "hsl(var(--muted-foreground) / 0.6)",
              }}
            >
              you can{" "}
              <button
                className="font-serif italic"
                style={{ color: "hsl(var(--primary))", textDecoration: "underline", textDecorationStyle: "dotted", textUnderlineOffset: 3 }}
              >
                save
              </button>
              ,{" "}
              <button
                className="font-serif italic"
                style={{ color: "hsl(var(--primary))", textDecoration: "underline", textDecorationStyle: "dotted", textUnderlineOffset: 3 }}
              >
                share
              </button>
              , or{" "}
              <button
                className="font-serif italic"
                style={{ color: "hsl(var(--primary))", textDecoration: "underline", textDecorationStyle: "dotted", textUnderlineOffset: 3 }}
              >
                queue next
              </button>
              .
            </p>
          </div>
        </div>
      )}
    </AppScreen>
  );
};
