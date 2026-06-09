import React, { useEffect, useRef, useState } from "react";
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
  /** Plain text for user; tokens for AI (so AI replies can have inline actions). */
  text?: string;
  tokens?: Token[];
  /** True while the assistant is "thinking" — renders a breathing placeholder. */
  pending?: boolean;
}

// Pre-scripted conversation showcasing the range of the AI app
const INITIAL: Message[] = [
  {
    id: 1,
    role: "user",
    text: "i can't focus today.",
  },
  {
    id: 2,
    role: "ai",
    tokens: [
      { text: "that's okay. some days the mind wanders before it works. try " },
      { text: "twenty-five minutes", action: "timer", highlight: true },
      { text: " of one small thing — no inbox, no music with words. when the timer ends, decide whether to keep going or rest." },
    ],
  },
  {
    id: 3,
    role: "user",
    text: "what should i work on?",
  },
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
  {
    id: 5,
    role: "user",
    text: "save that as a note",
  },
  {
    id: 6,
    role: "ai",
    tokens: [
      { text: "saved. " },
      { text: "open note", action: "open", highlight: true },
      { text: " — or keep going here." },
    ],
  },
];

// Canned AI responses cycled when the user types anything
const CANNED_REPLIES: Token[][] = [
  [
    { text: "noted. want me to " },
    { text: "set a reminder", action: "timer", highlight: true },
    { text: " for later?" },
  ],
  [
    { text: "that's worth sitting with. one angle: what's the smallest version of it you could finish today?" },
  ],
  [
    { text: "okay — " },
    { text: "saved to notes", action: "save", highlight: true },
    { text: ". anything else on your mind?" },
  ],
  [
    { text: "fair. take a breath. i'll be here when you come back." },
  ],
];

const VOICE_TRANSCRIPTS = [
  "remind me to call mom tomorrow",
  "what's the weather like later",
  "draft a quick email saying i'll be ten minutes late",
];

export const AIChat: React.FC<Props> = ({ onClose, onOpenUtilityDrawer }) => {
  const [messages, setMessages] = useState<Message[]>(INITIAL);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const replyIdx = useRef(0);
  const voiceIdx = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(100);

  // Auto-scroll on new messages
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendUser = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const userMsg: Message = { id: nextId.current++, role: "user", text: trimmed };
    const pendingMsg: Message = { id: nextId.current++, role: "ai", pending: true };
    setMessages((m) => [...m, userMsg, pendingMsg]);
    setInput("");

    // Breathing pause, then AI reply
    setTimeout(() => {
      const tokens = CANNED_REPLIES[replyIdx.current % CANNED_REPLIES.length];
      replyIdx.current += 1;
      setMessages((m) =>
        m.map((msg) =>
          msg.id === pendingMsg.id ? { ...msg, pending: false, tokens } : msg
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
    // Other actions are visual-only for now
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

  return (
    <AppScreen appName="AI Chat" onClose={onClose} onOpenUtilityDrawer={onOpenUtilityDrawer}>
      {/* Header */}
      <div className="px-6 pb-3">
        <span
          className="font-serif italic"
          style={{
            fontSize: 13,
            color: "hsl(var(--muted-foreground) / 0.4)",
            letterSpacing: "0.04em",
          }}
        >
          ask anything
        </span>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6"
        style={{ scrollbarWidth: "none" }}
      >
        <div className="flex flex-col gap-6 pb-4 pt-2">
          {messages.map((m) => {
            if (m.role === "user") {
              return (
                <div key={m.id} className="flex justify-end">
                  <p
                    className="font-serif italic max-w-[80%] text-right"
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
                    className="font-serif italic animate-breathe"
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
                  className="font-serif max-w-full"
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
                          className="font-serif transition-colors active:opacity-70"
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
            className="font-serif italic animate-breathe"
            style={{
              fontSize: 12,
              color: "hsl(var(--accent))",
              letterSpacing: "0.06em",
            }}
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
            className="font-serif italic"
            style={{
              fontSize: 13,
              color: "hsl(var(--muted-foreground) / 0.7)",
              letterSpacing: "0.08em",
            }}
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
          className="flex-1 bg-transparent outline-none font-serif italic"
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
          className="font-serif italic transition-colors active:opacity-60"
          style={{
            fontSize: 12,
            color: listening
              ? "hsl(var(--destructive))"
              : "hsl(var(--muted-foreground) / 0.55)",
            letterSpacing: "0.06em",
            whiteSpace: "nowrap",
          }}
        >
          hold to speak
        </button>
      </form>
    </AppScreen>
  );
};
