import React, { useMemo, useRef, useState } from "react";
import { AppScreen } from "./AppScreen";

interface Props {
  onClose: () => void;
  onOpenUtilityDrawer?: () => void;
}

interface Tab {
  id: string;
  title: string;
  domain: string;
  whisper: string; // a prose summary of where this tab is
  body: string[]; // paragraphs of mock page content
  accent?: boolean;
}

const TABS: Tab[] = [
  {
    id: "t1",
    title: "the quiet web, revisited",
    domain: "are.na/channels/quiet-web",
    whisper: "a slow channel about reading without metrics",
    accent: true,
    body: [
      "There is a version of the web that is mostly text, mostly small, and mostly written by one person at a time.",
      "Angelfish was built for that web — for pages that do not need a sidebar, a banner, or a chat bubble that follows you down the screen.",
      "Pinch to read. Swipe to leave. Nothing here will autoplay.",
    ],
  },
  {
    id: "t2",
    title: "nigel / hevel",
    domain: "github.com/nigel/hevel",
    whisper: "a small phone shell, written mostly in serifs",
    body: [
      "Hevel is a mobile shell prototype with a single design rule: no buttons unless absolutely necessary.",
      "Most of the interface is sentences. You read your phone the way you would read a paperback — left to right, in your own time.",
      "Open issues: 3. Closed today: 7. The maintainer is, by all accounts, asleep.",
    ],
  },
  {
    id: "t3",
    title: "hacker news",
    domain: "news.ycombinator.com",
    whisper: "the orange site — somebody is wrong about rust again",
    body: [
      "412 points · 308 comments · 2 hours ago.",
      "Top comment is, predictably, three paragraphs about how the linked article missed the point.",
      "Second comment is a single line that begins with \"actually,\".",
    ],
  },
];

const BOOKMARKS = [
  { label: "are.na", whisper: "channels worth losing an afternoon in" },
  { label: "low←tech magazine", whisper: "solar-powered, sometimes offline" },
  { label: "wikipedia", whisper: "still, somehow, the best site on the web" },
  { label: "kagi", whisper: "search that doesn't shout" },
  { label: "the morning paper", whisper: "one cs paper a day, lightly chewed" },
];

const HISTORY = [
  "an hour ago you were reading about typewriter ribbons",
  "yesterday you opened the same recipe four times",
  "last week you searched \"is georgia a good font\" and decided it was",
];

export const Angelfish: React.FC<Props> = ({ onClose, onOpenUtilityDrawer }) => {
  const [tabs, setTabs] = useState<Tab[]>(TABS);
  const [activeId, setActiveId] = useState<string>(TABS[0].id);
  const [view, setView] = useState<"reading" | "tabs" | "elsewhere">("reading");
  const [draftUrl, setDraftUrl] = useState("");
  const [reader, setReader] = useState(false);

  const active = useMemo(() => tabs.find((t) => t.id === activeId) ?? tabs[0], [tabs, activeId]);

  const closeTab = (id: string) => {
    setTabs((prev) => {
      const next = prev.filter((t) => t.id !== id);
      if (next.length === 0) {
        onClose();
        return prev;
      }
      if (id === activeId) setActiveId(next[0].id);
      return next;
    });
  };

  const openNewTab = (label: string) => {
    const id = `t-${Date.now()}`;
    const newTab: Tab = {
      id,
      title: label,
      domain: label.toLowerCase().replace(/\s+/g, "") + ".example",
      whisper: "a freshly opened page, still warm",
      body: [
        "This page hasn't loaded much yet. Angelfish renders the structure first, the prose second, the images last — if at all.",
        "Give it a moment, or don't.",
      ],
    };
    setTabs((prev) => [newTab, ...prev]);
    setActiveId(id);
    setView("reading");
    setDraftUrl("");
  };

  // ── Reading view ──
  const ReadingView = (
    <div className="flex-1 flex flex-col overflow-y-auto px-6" style={{ paddingBottom: 100 }}>
      {/* whisper above title */}
      <span
        className="italic"
        style={{
          fontSize: 11,
          color: "hsl(var(--muted-foreground) / 0.6)",
          letterSpacing: "0.04em",
          marginTop: 12,
        }}
      >
        {active.whisper}
      </span>

      {/* large serif title */}
      <h1
        className=""
        style={{
          fontSize: 30,
          fontWeight: 700,
          lineHeight: 1.1,
          color: "hsl(var(--foreground) / 0.92)",
          marginTop: 6,
          letterSpacing: "-0.01em",
        }}
      >
        {active.title}
      </h1>

      {/* domain pill — prose style */}
      <div
        className="italic"
        style={{
          fontSize: 11,
          color: "hsl(var(--accent) / 0.85)",
          marginTop: 10,
          letterSpacing: "0.02em",
        }}
      >
        — {active.domain}
      </div>

      {/* hairline */}
      <div
        style={{
          height: 1,
          background: "hsl(var(--foreground) / 0.08)",
          margin: "20px 0",
        }}
      />

      {/* body paragraphs */}
      <div className="flex flex-col gap-4">
        {active.body.map((p, i) => (
          <p
            key={i}
            className=""
            style={{
              fontSize: reader ? 18 : 15,
              lineHeight: 1.55,
              color: "hsl(var(--foreground) / 0.78)",
            }}
          >
            {p}
          </p>
        ))}
      </div>

      {/* reader toggle as inline prose */}
      <div className="mt-6 flex items-center gap-2 flex-wrap">
        <span className="italic" style={{ fontSize: 13, color: "hsl(var(--muted-foreground) / 0.6)" }}>
          reading at
        </span>
        <button
          onClick={() => setReader(false)}
          className="italic"
          style={{
            fontSize: 13,
            color: reader ? "hsl(var(--muted-foreground) / 0.5)" : "hsl(var(--primary))",
            fontWeight: reader ? 400 : 700,
            background: "none",
            border: "none",
            padding: 0,
          }}
        >
          page width
        </button>
        <span className="italic" style={{ fontSize: 13, color: "hsl(var(--muted-foreground) / 0.4)" }}>
          ·
        </span>
        <button
          onClick={() => setReader(true)}
          className="italic"
          style={{
            fontSize: 13,
            color: reader ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.5)",
            fontWeight: reader ? 700 : 400,
            background: "none",
            border: "none",
            padding: 0,
          }}
        >
          comfortable
        </button>
        <span className="italic" style={{ fontSize: 13, color: "hsl(var(--muted-foreground) / 0.6)" }}>
          .
        </span>
      </div>
    </div>
  );

  // ── Tabs view (prose list) ──
  const TabsView = (
    <div className="flex-1 flex flex-col overflow-y-auto px-6" style={{ paddingBottom: 100 }}>
      <span
        className="italic"
        style={{ fontSize: 11, color: "hsl(var(--muted-foreground) / 0.55)", marginTop: 12 }}
      >
        you have {tabs.length} {tabs.length === 1 ? "page" : "pages"} open.
      </span>
      <h2
        className=""
        style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.15, marginTop: 4, color: "hsl(var(--foreground) / 0.9)" }}
      >
        wander between them.
      </h2>

      <div style={{ height: 1, background: "hsl(var(--foreground) / 0.08)", margin: "20px 0" }} />

      <div className="flex flex-col gap-5">
        {tabs.map((t, i) => {
          const isActive = t.id === activeId;
          return (
            <div key={t.id} className="flex flex-col gap-1">
              <div className="flex items-baseline gap-2">
                <span
                  className="italic"
                  style={{ fontSize: 11, color: "hsl(var(--muted-foreground) / 0.4)" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <button
                  onClick={() => {
                    setActiveId(t.id);
                    setView("reading");
                  }}
                  className="text-left"
                  style={{
                    fontSize: 19,
                    fontWeight: isActive ? 700 : 500,
                    fontStyle: isActive ? "italic" : "normal",
                    color: isActive ? "hsl(var(--primary))" : "hsl(var(--foreground) / 0.82)",
                    background: "none",
                    border: "none",
                    padding: 0,
                    lineHeight: 1.25,
                  }}
                >
                  {t.title}
                </button>
              </div>
              <span
                className="italic"
                style={{ fontSize: 12, color: "hsl(var(--muted-foreground) / 0.55)", paddingLeft: 22 }}
              >
                {t.whisper}.
              </span>
              <div className="flex items-center gap-3" style={{ paddingLeft: 22, marginTop: 2 }}>
                <span
                  className=""
                  style={{ fontSize: 10, color: "hsl(var(--accent) / 0.7)" }}
                >
                  {t.domain}
                </span>
                <button
                  onClick={() => closeTab(t.id)}
                  className="italic"
                  style={{
                    fontSize: 11,
                    color: "hsl(var(--destructive) / 0.7)",
                    background: "none",
                    border: "none",
                    padding: 0,
                  }}
                >
                  close
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ── Elsewhere view (bookmarks + history + new url) ──
  const ElsewhereView = (
    <div className="flex-1 flex flex-col overflow-y-auto px-6" style={{ paddingBottom: 100 }}>
      <span
        className="italic"
        style={{ fontSize: 11, color: "hsl(var(--muted-foreground) / 0.55)", marginTop: 12 }}
      >
        somewhere to go?
      </span>
      <h2
        className=""
        style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.15, marginTop: 4, color: "hsl(var(--foreground) / 0.9)" }}
      >
        type, or pick a familiar place.
      </h2>

      {/* prose url field */}
      <div
        className="flex items-baseline gap-2 mt-5"
        style={{
          borderBottom: "1px solid hsl(var(--foreground) / 0.15)",
          paddingBottom: 6,
        }}
      >
        <span
          className="italic"
          style={{ fontSize: 14, color: "hsl(var(--muted-foreground) / 0.55)" }}
        >
          go to
        </span>
        <input
          value={draftUrl}
          onChange={(e) => setDraftUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && draftUrl.trim()) openNewTab(draftUrl.trim());
          }}
          placeholder="somewhere quiet…"
          className="flex-1 italic bg-transparent outline-none"
          style={{
            fontSize: 16,
            color: "hsl(var(--foreground) / 0.9)",
          }}
        />
      </div>

      <div style={{ height: 1, background: "hsl(var(--foreground) / 0.08)", margin: "24px 0 16px" }} />

      <span
        className="italic"
        style={{ fontSize: 11, color: "hsl(var(--muted-foreground) / 0.5)", letterSpacing: "0.04em" }}
      >
        places you keep
      </span>

      <div className="flex flex-col gap-3 mt-3">
        {BOOKMARKS.map((b) => (
          <div key={b.label} className="flex flex-col">
            <button
              onClick={() => openNewTab(b.label)}
              className="text-left"
              style={{
                fontSize: 17,
                fontWeight: 600,
                fontStyle: "italic",
                color: "hsl(var(--foreground) / 0.82)",
                background: "none",
                border: "none",
                padding: 0,
                lineHeight: 1.25,
              }}
            >
              {b.label}
            </button>
            <span
              className="italic"
              style={{ fontSize: 12, color: "hsl(var(--muted-foreground) / 0.55)" }}
            >
              {b.whisper}.
            </span>
          </div>
        ))}
      </div>

      <div style={{ height: 1, background: "hsl(var(--foreground) / 0.08)", margin: "24px 0 16px" }} />

      <span
        className="italic"
        style={{ fontSize: 11, color: "hsl(var(--muted-foreground) / 0.5)", letterSpacing: "0.04em" }}
      >
        where you've been
      </span>
      <div className="flex flex-col gap-2 mt-3">
        {HISTORY.map((h, i) => (
          <span
            key={i}
            className="italic"
            style={{ fontSize: 13, color: "hsl(var(--muted-foreground) / 0.6)", lineHeight: 1.5 }}
          >
            {h}.
          </span>
        ))}
      </div>
    </div>
  );

  return (
    <AppScreen appName="Angelfish" onClose={onClose} onOpenUtilityDrawer={onOpenUtilityDrawer}>
      {view === "reading" && ReadingView}
      {view === "tabs" && TabsView}
      {view === "elsewhere" && ElsewhereView}

      {/* ── Prose bottom bar ── */}
      <div
        className="absolute left-0 right-0 px-6"
        style={{
          bottom: 14,
          zIndex: 20,
          pointerEvents: "auto",
        }}
      >
        <div
          className="flex items-baseline justify-center gap-2 flex-wrap italic"
          style={{
            fontSize: 14,
            color: "hsl(var(--muted-foreground) / 0.7)",
            padding: "10px 14px",
            background: "hsl(var(--background) / 0.55)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid hsl(var(--foreground) / 0.06)",
            borderRadius: 20,
          }}
        >
          <button
            onClick={() => setView("reading")}
            className="italic"
            style={{
              fontSize: 14,
              fontWeight: view === "reading" ? 700 : 400,
              color: view === "reading" ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.65)",
              background: "none",
              border: "none",
              padding: 0,
            }}
          >
            read
          </button>
          <span style={{ color: "hsl(var(--muted-foreground) / 0.35)" }}>·</span>
          <button
            onClick={() => setView("tabs")}
            className="italic"
            style={{
              fontSize: 14,
              fontWeight: view === "tabs" ? 700 : 400,
              color: view === "tabs" ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.65)",
              background: "none",
              border: "none",
              padding: 0,
            }}
          >
            {tabs.length} tabs
          </button>
          <span style={{ color: "hsl(var(--muted-foreground) / 0.35)" }}>·</span>
          <button
            onClick={() => setView("elsewhere")}
            className="italic"
            style={{
              fontSize: 14,
              fontWeight: view === "elsewhere" ? 700 : 400,
              color: view === "elsewhere" ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.65)",
              background: "none",
              border: "none",
              padding: 0,
            }}
          >
            elsewhere
          </button>
        </div>
      </div>
    </AppScreen>
  );
};
