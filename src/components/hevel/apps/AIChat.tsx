import React, { useEffect, useMemo, useRef, useState } from "react";
import { AppScreen } from "./AppScreen";

interface Props {
  onClose: () => void;
  onOpenUtilityDrawer?: () => void;
}

interface Token {
  text: string;
  action?: "save" | "open" | "timer" | "dismiss";
  highlight?: boolean;
}

interface Message {
  id: number;
  role: "user" | "ai";
  text?: string;
  tokens?: Token[];
  pending?: boolean;
}

interface Thread {
  id: string;
  title: string;
  /** Minutes ago, used for prose timestamps like "3m", "yesterday", "tuesday". */
  agoLabel: string;
  messages: Message[];
}

// ── Scripted threads ────────────────────────────────────────────────────────
const SEED_THREADS: Thread[] = [
  {
    id: "t1",
    title: "can't focus today",
    agoLabel: "just now",
    messages: [
      { id: 1, role: "user", text: "i can't focus today." },
      {
        id: 2,
        role: "ai",
        tokens: [
          { text: "that's okay. some days the mind wanders before it works. try " },
          { text: "twenty-five minutes", action: "timer", highlight: true },
          { text: " of one small thing — no inbox, no music with words. when the timer ends, decide whether to keep going or rest." },
        ],
      },
      { id: 3, role: "user", text: "what should i work on?" },
      {
        id: 4,
        role: "ai",
        tokens: [
          { text: "you mentioned the " },
          { text: "havel launcher", highlight: true },
          { text: " yesterday, and a draft about " },
          { text: "voice as input", highlight: true },
          { text: ". either is small enough to finish today. start with whichever feels lighter." },
        ],
      },
      { id: 5, role: "user", text: "save that as a note" },
      {
        id: 6,
        role: "ai",
        tokens: [
          { text: "saved. " },
          { text: "open note", action: "open", highlight: true },
          { text: " — or keep going here." },
        ],
      },
    ],
  },
  {
    id: "t2",
    title: "havel launcher ideas",
    agoLabel: "2h",
    messages: [
      { id: 1, role: "user", text: "what should the launcher feel like?" },
      {
        id: 2,
        role: "ai",
        tokens: [
          { text: "a sentence, not a screen. the device should read like prose: " },
          { text: "open music", highlight: true },
          { text: ", " },
          { text: "ask anything", highlight: true },
          { text: ", " },
          { text: "set a timer", highlight: true },
          { text: ". each phrase becomes a tap." },
        ],
      },
    ],
  },
  {
    id: "t3",
    title: "voice as input",
    agoLabel: "yesterday",
    messages: [
      { id: 1, role: "user", text: "how should dictation feel?" },
      {
        id: 2,
        role: "ai",
        tokens: [
          { text: "ambient. press once and speak, release to commit. no waveform theater — just a quiet red dot and the words appearing where the cursor was." },
        ],
      },
    ],
  },
  {
    id: "t4",
    title: "recipe for dal",
    agoLabel: "tuesday",
    messages: [
      { id: 1, role: "user", text: "simple dal for one person?" },
      {
        id: 2,
        role: "ai",
        tokens: [
          { text: "rinse half a cup of red lentils. simmer in two cups of water with turmeric and salt until soft, about fifteen minutes. in a small pan, bloom cumin and a clove of garlic in ghee until fragrant, then pour over the lentils. finish with lemon." },
        ],
      },
    ],
  },
  {
    id: "t5",
    title: "rain in lisbon",
    agoLabel: "last week",
    messages: [
      { id: 1, role: "user", text: "is it rainy in lisbon next month?" },
      {
        id: 2,
        role: "ai",
        tokens: [
          { text: "december averages around ninety millimetres — about ten rainy days. pack a light coat, not a heavy one. mornings are bright more often than you'd expect." },
        ],
      },
    ],
  },
  {
    id: "t6",
    title: "postmarketos vs alpine",
    agoLabel: "last week",
    messages: [
      { id: 1, role: "user", text: "what's the relationship between postmarketos and alpine?" },
      {
        id: 2,
        role: "ai",
        tokens: [
          { text: "postmarketos is built on top of alpine — same package manager (apk), same musl libc, same lightweight philosophy. postmarket adds device ports, a mobile-friendly userland, and the ui shells (plasma mobile, phosh, sxmo)." },
        ],
      },
    ],
  },
];

const CANNED_REPLIES: Token[][] = [
  [
    { text: "noted. want me to " },
    { text: "set a reminder", action: "timer", highlight: true },
    { text: " for later?" },
  ],
  [{ text: "that's worth sitting with. one angle: what's the smallest version of it you could finish today?" }],
  [
    { text: "okay — " },
    { text: "saved to notes", action: "save", highlight: true },
    { text: ". anything else on your mind?" },
  ],
  [{ text: "fair. take a breath. i'll be here when you come back." }],
];

const VOICE_TRANSCRIPTS = [
  "remind me to call mom tomorrow",
  "what's the weather like later",
  "draft a quick email saying i'll be ten minutes late",
];

// ── Component ───────────────────────────────────────────────────────────────
export const AIChat: React.FC<Props> = ({ onClose, onOpenUtilityDrawer }) => {
  const [threads, setThreads] = useState<Thread[]>(SEED_THREADS);
  const [activeId, setActiveId] = useState<string>(SEED_THREADS[0].id);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");

  const replyIdx = useRef(0);
  const voiceIdx = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(1000);
  const newThreadCounter = useRef(0);

  const active = threads.find((t) => t.id === activeId) ?? threads[0];

  // Auto-scroll on new messages within active thread
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [active?.messages.length, activeId]);

  // Close sidebar when switching threads
  const selectThread = (id: string) => {
    setActiveId(id);
    setSidebarOpen(false);
    setSearch("");
  };

  const newChat = () => {
    newThreadCounter.current += 1;
    const id = `new-${Date.now()}`;
    const fresh: Thread = {
      id,
      title: "new conversation",
      agoLabel: "just now",
      messages: [],
    };
    setThreads((ts) => [fresh, ...ts]);
    setActiveId(id);
    setSidebarOpen(false);
    setSearch("");
  };

  const sendUser = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const userMsg: Message = { id: nextId.current++, role: "user", text: trimmed };
    const pendingMsg: Message = { id: nextId.current++, role: "ai", pending: true };

    setThreads((ts) =>
      ts.map((t) =>
        t.id === activeId
          ? {
              ...t,
              title: t.messages.length === 0 ? trimmed.slice(0, 40).toLowerCase() : t.title,
              agoLabel: "just now",
              messages: [...t.messages, userMsg, pendingMsg],
            }
          : t
      )
    );
    setInput("");

    setTimeout(() => {
      const tokens = CANNED_REPLIES[replyIdx.current % CANNED_REPLIES.length];
      replyIdx.current += 1;
      setThreads((ts) =>
        ts.map((t) =>
          t.id === activeId
            ? {
                ...t,
                messages: t.messages.map((m) =>
                  m.id === pendingMsg.id ? { ...m, pending: false, tokens } : m
                ),
              }
            : t
        )
      );
    }, 900);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendUser(input);
  };

  const handleAction = (action: Token["action"]) => {
    if (action === "save") {
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 1400);
    }
  };

  const startListening = () => {
    setListening(true);
    setTimeout(() => {
      const transcript = VOICE_TRANSCRIPTS[voiceIdx.current % VOICE_TRANSCRIPTS.length];
      voiceIdx.current += 1;
      setListening(false);
      sendUser(transcript);
    }, 2400);
  };

  // Filter threads by search
  const filteredThreads = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return threads;
    return threads.filter((t) => {
      if (t.title.toLowerCase().includes(q)) return true;
      return t.messages.some((m) => {
        const body = m.text ?? m.tokens?.map((tk) => tk.text).join("") ?? "";
        return body.toLowerCase().includes(q);
      });
    });
  }, [threads, search]);

  return (
    <AppScreen appName="AI Chat" onClose={onClose} onOpenUtilityDrawer={onOpenUtilityDrawer}>
      {/* Header — sidebar toggle + ask anything + new chat */}
      <div className="px-6 pb-3 flex items-center justify-between">
        <button
          onClick={() => setSidebarOpen(true)}
          className="italic transition-colors active:opacity-60"
          style={{
            fontSize: 13,
            color: "hsl(var(--muted-foreground) / 0.45)",
            letterSpacing: "0.06em",
          }}
        >
          past chats
        </button>
        <span
          className="italic"
          style={{
            fontSize: 13,
            color: "hsl(var(--muted-foreground) / 0.4)",
            letterSpacing: "0.04em",
          }}
        >
          ask anything
        </span>
        <button
          onClick={newChat}
          className="italic transition-colors active:opacity-60"
          style={{
            fontSize: 13,
            color: "hsl(var(--primary) / 0.7)",
            letterSpacing: "0.06em",
          }}
        >
          new
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6" style={{ scrollbarWidth: "none" }}>
        <div className="flex flex-col gap-6 pb-4 pt-2">
          {active.messages.length === 0 && (
            <div className="flex justify-center pt-12">
              <p
                className="italic text-center max-w-[240px]"
                style={{
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: "hsl(var(--muted-foreground) / 0.4)",
                  letterSpacing: "0.02em",
                }}
              >
                a fresh page. say anything, or hold to speak.
              </p>
            </div>
          )}
          {active.messages.map((m) => {
            if (m.role === "user") {
              return (
                <div key={m.id} className="flex justify-end">
                  <p
                    className="italic max-w-[80%] text-right"
                    style={{
                      fontSize: 16,
                      lineHeight: 1.55,
                      color: "hsl(var(--primary) / 0.85)",
                      letterSpacing: "0.005em",
                    }}
                  >
                    {m.text}
                  </p>
                </div>
              );
            }
            if (m.pending) {
              return (
                <div key={m.id} className="flex">
                  <span
                    className="italic animate-breathe"
                    style={{
                      fontSize: 15,
                      color: "hsl(var(--muted-foreground) / 0.5)",
                      letterSpacing: "0.04em",
                    }}
                  >
                    thinking…
                  </span>
                </div>
              );
            }
            return (
              <div key={m.id} className="flex">
                <p
                  className="max-w-full"
                  style={{
                    fontSize: 16,
                    lineHeight: 1.7,
                    color: "hsl(var(--foreground) / 0.88)",
                    letterSpacing: "0.005em",
                  }}
                >
                  {m.tokens?.map((t, i) => {
                    if (t.action || t.highlight) {
                      return (
                        <button
                          key={i}
                          onClick={() => t.action && handleAction(t.action)}
                          className="transition-colors active:opacity-70"
                          style={{
                            color: "hsl(var(--accent))",
                            textDecoration: t.action ? "underline" : "none",
                            textUnderlineOffset: "3px",
                            textDecorationColor: "hsl(var(--accent) / 0.4)",
                            background: "transparent",
                            padding: 0,
                            fontSize: "inherit",
                            lineHeight: "inherit",
                          }}
                        >
                          {t.text}
                        </button>
                      );
                    }
                    return <span key={i}>{t.text}</span>;
                  })}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Saved flash */}
      {savedFlash && (
        <div className="absolute left-0 right-0 flex justify-center pointer-events-none" style={{ bottom: 96 }}>
          <span
            className="italic animate-breathe"
            style={{ fontSize: 12, color: "hsl(var(--accent))", letterSpacing: "0.06em" }}
          >
            saved to notes
          </span>
        </div>
      )}

      {/* Listening overlay */}
      {listening && (
        <div className="absolute left-0 right-0 flex flex-col items-center pointer-events-none" style={{ bottom: 96 }}>
          <div
            className="rounded-full animate-breathe"
            style={{
              width: 14,
              height: 14,
              background: "hsl(var(--destructive) / 0.7)",
              boxShadow: "0 0 24px hsl(var(--destructive) / 0.5)",
              marginBottom: 10,
            }}
          />
          <span
            className="italic"
            style={{ fontSize: 13, color: "hsl(var(--muted-foreground) / 0.7)", letterSpacing: "0.08em" }}
          >
            listening…
          </span>
        </div>
      )}

      {/* Composer */}
      <form
        onSubmit={handleSubmit}
        className="px-6 pb-8 pt-3 flex items-center gap-3"
        style={{
          borderTop: "1px solid hsl(var(--border) / 0.2)",
          background: "hsl(var(--background) / 0.4)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="what's on your mind?"
          disabled={listening}
          className="flex-1 bg-transparent outline-none italic"
          style={{
            fontSize: 15,
            color: "hsl(var(--foreground))",
            borderBottom: "1px solid hsl(var(--muted-foreground) / 0.2)",
            paddingBottom: 6,
            letterSpacing: "0.01em",
          }}
        />
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            if (!listening) startListening();
          }}
          className="italic transition-colors active:opacity-60"
          style={{
            fontSize: 12,
            color: listening ? "hsl(var(--destructive))" : "hsl(var(--muted-foreground) / 0.55)",
            letterSpacing: "0.06em",
            whiteSpace: "nowrap",
          }}
        >
          hold to speak
        </button>
      </form>

      {/* ── Sidebar: past chats ───────────────────────────────────────── */}
      {/* Scrim */}
      <div
        onClick={() => setSidebarOpen(false)}
        className="absolute inset-0 z-40"
        style={{
          background: "hsl(var(--background) / 0.55)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          opacity: sidebarOpen ? 1 : 0,
          pointerEvents: sidebarOpen ? "auto" : "none",
          transition: "opacity 0.3s ease",
        }}
      />
      {/* Drawer */}
      <aside
        className="absolute top-0 bottom-0 left-0 z-50 flex flex-col"
        style={{
          width: "82%",
          maxWidth: 320,
          background: "hsl(var(--card) / 0.96)",
          borderRight: "1px solid hsl(var(--border) / 0.4)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
          boxShadow: sidebarOpen ? "0 0 40px hsl(var(--background) / 0.6)" : "none",
        }}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between px-5 pt-14 pb-3">
          <span
            className="italic"
            style={{ fontSize: 14, color: "hsl(var(--muted-foreground) / 0.5)", letterSpacing: "0.06em" }}
          >
            past chats
          </span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="italic transition-colors active:opacity-60"
            style={{ fontSize: 12, color: "hsl(var(--muted-foreground) / 0.45)", letterSpacing: "0.06em" }}
          >
            close
          </button>
        </div>

        {/* Search */}
        <div className="px-5 pb-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="search"
            className="w-full bg-transparent outline-none italic"
            style={{
              fontSize: 14,
              color: "hsl(var(--foreground))",
              borderBottom: "1px solid hsl(var(--muted-foreground) / 0.2)",
              paddingBottom: 6,
              letterSpacing: "0.01em",
            }}
          />
        </div>

        {/* New chat */}
        <button
          onClick={newChat}
          className="text-left px-5 py-3 transition-colors active:opacity-70"
          style={{ borderBottom: "1px solid hsl(var(--border) / 0.25)" }}
        >
          <span
            className="italic"
            style={{ fontSize: 15, color: "hsl(var(--primary))", letterSpacing: "0.02em" }}
          >
            + new chat
          </span>
        </button>

        {/* Thread list */}
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
          {filteredThreads.length === 0 && (
            <p
              className="italic px-5 py-6 text-center"
              style={{ fontSize: 13, color: "hsl(var(--muted-foreground) / 0.4)" }}
            >
              nothing matches "{search}".
            </p>
          )}
          {filteredThreads.map((t) => {
            const isActive = t.id === activeId;
            const preview =
              t.messages.length > 0
                ? (() => {
                    const last = t.messages[t.messages.length - 1];
                    return last.text ?? last.tokens?.map((tk) => tk.text).join("") ?? "";
                  })()
                : "empty";
            return (
              <button
                key={t.id}
                onClick={() => selectThread(t.id)}
                className="w-full text-left px-5 py-3 transition-colors active:opacity-70"
                style={{
                  background: isActive ? "hsl(var(--primary) / 0.08)" : "transparent",
                  borderLeft: isActive ? "2px solid hsl(var(--primary))" : "2px solid transparent",
                }}
              >
                <div className="flex items-baseline justify-between gap-3 mb-1">
                  <span
                    className="italic truncate"
                    style={{
                      fontSize: 14,
                      color: isActive ? "hsl(var(--foreground))" : "hsl(var(--foreground) / 0.78)",
                      letterSpacing: "0.01em",
                    }}
                  >
                    {t.title}
                  </span>
                  <span
                    className="italic shrink-0"
                    style={{ fontSize: 10, color: "hsl(var(--muted-foreground) / 0.4)" }}
                  >
                    {t.agoLabel}
                  </span>
                </div>
                <p
                  className="truncate"
                  style={{ fontSize: 12, color: "hsl(var(--muted-foreground) / 0.55)", letterSpacing: "0.005em" }}
                >
                  {preview}
                </p>
              </button>
            );
          })}
        </div>
      </aside>
    </AppScreen>
  );
};
