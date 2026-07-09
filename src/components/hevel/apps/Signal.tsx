import React, { useEffect, useMemo, useRef, useState } from "react";
import { AppScreen } from "./AppScreen";

interface Props {
  onClose: () => void;
  onOpenUtilityDrawer?: () => void;
}

interface Msg {
  id: number;
  from: "me" | "them";
  text: string;
  /** Minutes ago for prose timestamps */
  ago: string;
}

interface Conversation {
  id: string;
  name: string;
  handle: string; // @something or phone
  hue: number;
  agoLabel: string;
  unread: number;
  preview: string;
  messages: Msg[];
}

const CONVERSATIONS: Conversation[] = [
  {
    id: "c1",
    name: "Mira",
    handle: "@mira.signal",
    hue: 28,
    agoLabel: "just now",
    unread: 2,
    preview: "the new launcher feels right — softer than i expected.",
    messages: [
      { id: 1, from: "them", text: "did you push the launcher build?", ago: "12m" },
      { id: 2, from: "me", text: "yeah, just the prose variant. still rough at the edges.", ago: "10m" },
      { id: 3, from: "them", text: "the new launcher feels right — softer than i expected.", ago: "2m" },
      { id: 4, from: "them", text: "the ghost letter is a nice touch.", ago: "just now" },
    ],
  },
  {
    id: "c2",
    name: "Jonas",
    handle: "@jonas",
    hue: 200,
    agoLabel: "18m",
    unread: 0,
    preview: "i'll bring the camera. golden hour around 7.",
    messages: [
      { id: 1, from: "me", text: "still on for the walk tomorrow?", ago: "30m" },
      { id: 2, from: "them", text: "i'll bring the camera. golden hour around 7.", ago: "18m" },
    ],
  },
  {
    id: "c3",
    name: "linnea",
    handle: "+46 70 ··· 21",
    hue: 320,
    agoLabel: "2h",
    unread: 0,
    preview: "thanks ♥ talk soon.",
    messages: [
      { id: 1, from: "them", text: "got the package. it's perfect.", ago: "3h" },
      { id: 2, from: "me", text: "glad it arrived in one piece.", ago: "2h" },
      { id: 3, from: "them", text: "thanks ♥ talk soon.", ago: "2h" },
    ],
  },
  {
    id: "c4",
    name: "Studio",
    handle: "group · 5",
    hue: 140,
    agoLabel: "yesterday",
    unread: 4,
    preview: "anders: moved the review to thursday.",
    messages: [
      { id: 1, from: "them", text: "ines: figma is updated.", ago: "yesterday" },
      { id: 2, from: "them", text: "anders: moved the review to thursday.", ago: "yesterday" },
    ],
  },
  {
    id: "c5",
    name: "dad",
    handle: "+46 70 ··· 04",
    hue: 60,
    agoLabel: "tuesday",
    unread: 0,
    preview: "sunday lunch? mum is making pie.",
    messages: [
      { id: 1, from: "them", text: "sunday lunch? mum is making pie.", ago: "tuesday" },
    ],
  },
  {
    id: "c6",
    name: "Anders",
    handle: "@anders.h",
    hue: 260,
    agoLabel: "monday",
    unread: 0,
    preview: "let me know what you think of the draft.",
    messages: [
      { id: 1, from: "them", text: "sent you the draft — chapter two.", ago: "monday" },
      { id: 2, from: "them", text: "let me know what you think of the draft.", ago: "monday" },
    ],
  },
];

const Avatar: React.FC<{ name: string; hue: number; size?: number }> = ({ name, hue, size = 36 }) => {
  const initial = name.trim().charAt(0).toUpperCase();
  return (
    <div
      className="flex items-center justify-center"
      style={{
        width: size,
        height: size,
        borderRadius: 999,
        background: `linear-gradient(135deg, hsl(${hue} 35% 30%), hsl(${(hue + 40) % 360} 25% 18%))`,
        color: "hsl(var(--foreground) / 0.85)",
        fontSize: size * 0.42,
        border: "1px solid hsl(var(--border) / 0.4)",
        flexShrink: 0,
      }}
    >
      {initial}
    </div>
  );
};

export const Signal: React.FC<Props> = ({ onClose, onOpenUtilityDrawer }) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");
  const [convos, setConvos] = useState<Conversation[]>(CONVERSATIONS);
  const scrollRef = useRef<HTMLDivElement>(null);

  const active = useMemo(() => convos.find((c) => c.id === activeId) || null, [convos, activeId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return convos;
    return convos.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.handle.toLowerCase().includes(q) ||
        c.preview.toLowerCase().includes(q),
    );
  }, [convos, query]);

  useEffect(() => {
    if (active && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [active?.id, active?.messages.length]);

  const openConvo = (id: string) => {
    setActiveId(id);
    setConvos((cs) => cs.map((c) => (c.id === id ? { ...c, unread: 0 } : c)));
  };

  const send = () => {
    const text = draft.trim();
    if (!text || !active) return;
    setConvos((cs) =>
      cs.map((c) =>
        c.id === active.id
          ? {
              ...c,
              preview: text,
              agoLabel: "just now",
              messages: [...c.messages, { id: Date.now(), from: "me", text, ago: "just now" }],
            }
          : c,
      ),
    );
    setDraft("");
  };

  return (
    <AppScreen appName="signal" onClose={onClose} onOpenUtilityDrawer={onOpenUtilityDrawer}>
      {active ? (
        <ThreadView
          convo={active}
          draft={draft}
          setDraft={setDraft}
          onSend={send}
          onBack={() => setActiveId(null)}
          scrollRef={scrollRef}
        />
      ) : (
        <InboxView
          convos={filtered}
          query={query}
          setQuery={setQuery}
          onOpen={openConvo}
        />
      )}
    </AppScreen>
  );
};

// ── Inbox ────────────────────────────────────────────────────────────────────

const InboxView: React.FC<{
  convos: Conversation[];
  query: string;
  setQuery: (v: string) => void;
  onOpen: (id: string) => void;
}> = ({ convos, query, setQuery, onOpen }) => {
  const totalUnread = convos.reduce((acc, c) => acc + c.unread, 0);
  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ touchAction: "auto" }}>
      {/* Heading prose */}
      <div className="px-6 pt-2 pb-3">
        <p
          className=""
          style={{
            fontSize: 22,
            lineHeight: 1.25,
            color: "hsl(var(--foreground) / 0.92)",
          }}
        >
          signal,{" "}
          <span style={{ color: "hsl(var(--muted-foreground) / 0.6)" }} className="italic">
            {totalUnread > 0 ? `${totalUnread} new since you last looked.` : "all quiet."}
          </span>
        </p>
      </div>

      {/* Search — prose-style */}
      <div className="px-6 pb-3">
        <div
          className="flex items-center"
          style={{
            borderBottom: "1px solid hsl(var(--border) / 0.4)",
            paddingBottom: 6,
          }}
        >
          <span
            className="italic"
            style={{ fontSize: 13, color: "hsl(var(--muted-foreground) / 0.5)", marginRight: 8 }}
          >
            find
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="a name, a word…"
            onPointerDown={(e) => e.stopPropagation()}
            className="flex-1 bg-transparent outline-none"
            style={{
              fontSize: 14,
              color: "hsl(var(--foreground) / 0.9)",
            }}
          />
        </div>
      </div>

      {/* List */}
      <div
        className="flex-1 overflow-y-auto px-3"
        style={{ touchAction: "pan-y" }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {convos.map((c) => (
          <button
            key={c.id}
            onClick={() => onOpen(c.id)}
            className="w-full flex items-start gap-3 px-3 py-3 text-left rounded-md"
            style={{
              background: "transparent",
            }}
          >
            <Avatar name={c.name} hue={c.hue} />
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2">
                <span
                  className="truncate"
                  style={{
                    fontSize: 15,
                    color: "hsl(var(--foreground) / 0.92)",
                    fontWeight: c.unread > 0 ? 600 : 400,
                  }}
                >
                  {c.name}
                </span>
                <span
                  className="italic"
                  style={{
                    fontSize: 11,
                    color: "hsl(var(--muted-foreground) / 0.55)",
                    flexShrink: 0,
                  }}
                >
                  {c.agoLabel}
                </span>
              </div>
              <p
                className="truncate"
                style={{
                  fontSize: 13,
                  lineHeight: 1.4,
                  color:
                    c.unread > 0
                      ? "hsl(var(--foreground) / 0.78)"
                      : "hsl(var(--muted-foreground) / 0.6)",
                  marginTop: 2,
                }}
              >
                {c.preview}
              </p>
            </div>
            {c.unread > 0 && (
              <span
                className=""
                style={{
                  fontSize: 10,
                  color: "hsl(var(--primary-foreground) / 0.95)",
                  background: "hsl(var(--primary) / 0.85)",
                  padding: "2px 7px",
                  borderRadius: 999,
                  alignSelf: "center",
                  flexShrink: 0,
                }}
              >
                {c.unread}
              </span>
            )}
          </button>
        ))}

        {convos.length === 0 && (
          <p
            className="italic text-center py-12"
            style={{
              fontSize: 13,
              color: "hsl(var(--muted-foreground) / 0.5)",
            }}
          >
            nothing matches that.
          </p>
        )}
      </div>

      {/* Footer prose — new message hint */}
      <div className="px-6 py-3" style={{ borderTop: "1px solid hsl(var(--border) / 0.25)" }}>
        <p
          className="italic"
          style={{ fontSize: 12, color: "hsl(var(--muted-foreground) / 0.55)" }}
        >
          tap a name to talk. swipe down to leave.
        </p>
      </div>
    </div>
  );
};

// ── Thread ────────────────────────────────────────────────────────────────────

const ThreadView: React.FC<{
  convo: Conversation;
  draft: string;
  setDraft: (v: string) => void;
  onSend: () => void;
  onBack: () => void;
  scrollRef: React.RefObject<HTMLDivElement>;
}> = ({ convo, draft, setDraft, onSend, onBack, scrollRef }) => {
  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ touchAction: "auto" }}>
      {/* Thread header */}
      <div
        className="px-5 pb-3 flex items-center gap-3"
        style={{ borderBottom: "1px solid hsl(var(--border) / 0.3)" }}
      >
        <button
          onClick={onBack}
          onPointerDown={(e) => e.stopPropagation()}
          className="italic"
          style={{
            fontSize: 13,
            color: "hsl(var(--muted-foreground) / 0.7)",
          }}
        >
          ‹ back
        </button>
        <Avatar name={convo.name} hue={convo.hue} size={30} />
        <div className="flex-1 min-w-0">
          <p
            className="truncate"
            style={{ fontSize: 15, color: "hsl(var(--foreground) / 0.92)" }}
          >
            {convo.name}
          </p>
          <p
            className="italic truncate"
            style={{ fontSize: 11, color: "hsl(var(--muted-foreground) / 0.55)" }}
          >
            {convo.handle}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-5 py-4 space-y-3"
        style={{ touchAction: "pan-y" }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {convo.messages.map((m) => (
          <div
            key={m.id}
            className="flex flex-col"
            style={{ alignItems: m.from === "me" ? "flex-end" : "flex-start" }}
          >
            <div
              className=""
              style={{
                maxWidth: "78%",
                padding: "8px 12px",
                borderRadius: 14,
                fontSize: 14,
                lineHeight: 1.45,
                background:
                  m.from === "me"
                    ? "hsl(var(--primary) / 0.22)"
                    : "hsl(var(--muted) / 0.35)",
                color: "hsl(var(--foreground) / 0.92)",
                border: "1px solid hsl(var(--border) / 0.3)",
                backdropFilter: "blur(8px)",
              }}
            >
              {m.text}
            </div>
            <span
              className="italic"
              style={{
                fontSize: 10,
                color: "hsl(var(--muted-foreground) / 0.45)",
                marginTop: 3,
                paddingLeft: m.from === "me" ? 0 : 4,
                paddingRight: m.from === "me" ? 4 : 0,
              }}
            >
              {m.ago}
            </span>
          </div>
        ))}
      </div>

      {/* Composer */}
      <div
        className="px-5 py-3 flex items-end gap-3"
        style={{ borderTop: "1px solid hsl(var(--border) / 0.3)" }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
          placeholder="say something…"
          rows={1}
          className="flex-1 bg-transparent outline-none resize-none"
          style={{
            fontSize: 14,
            color: "hsl(var(--foreground) / 0.92)",
            borderBottom: "1px solid hsl(var(--border) / 0.4)",
            paddingBottom: 4,
            maxHeight: 100,
          }}
        />
        <button
          onClick={onSend}
          disabled={!draft.trim()}
          className="italic"
          style={{
            fontSize: 13,
            color: draft.trim()
              ? "hsl(var(--primary))"
              : "hsl(var(--muted-foreground) / 0.4)",
            transition: "color 0.2s ease",
          }}
        >
          send →
        </button>
      </div>
    </div>
  );
};
