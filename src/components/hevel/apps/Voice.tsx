import React, { useEffect, useRef, useState } from "react";
import { AppScreen } from "./AppScreen";

interface Props {
  onClose: () => void;
  onOpenUtilityDrawer?: () => void;
}

// A scripted "Wispr-Flow"-like dictation experience:
// raw speech streams in word-by-word, then on release it
// quietly rewrites itself into polished prose.

const SCRIPTS: { raw: string[]; polished: string }[] = [
  {
    raw: [
      "uh", "hey", "so", "like", "i", "wanted", "to", "let", "you", "know",
      "that", "the", "meeting", "tomorrow", "uh", "got", "moved", "to",
      "three", "instead", "of", "two", "yeah",
    ],
    polished:
      "Hey — just a heads up, tomorrow's meeting has been moved to three instead of two.",
  },
  {
    raw: [
      "ok", "so", "um", "remind", "me", "to", "pick", "up", "the", "uh",
      "the", "bread", "and", "also", "the", "coffee", "on", "the", "way",
      "home",
    ],
    polished:
      "Remind me to pick up bread and coffee on the way home.",
  },
  {
    raw: [
      "draft", "a", "quick", "email", "to", "marco", "telling", "him", "the",
      "draft", "looks", "great", "but", "uh", "the", "second", "paragraph",
      "needs", "a", "rewrite",
    ],
    polished:
      "Hi Marco — the draft looks great overall, but the second paragraph could use a rewrite. Let me know when you have a moment to revisit it.",
  },
];

type Phase = "idle" | "listening" | "thinking" | "polished" | "sent";

export const Voice: React.FC<Props> = ({ onClose, onOpenUtilityDrawer }) => {
  const [phase, setPhase] = useState<Phase>("idle");
  const [scriptIdx, setScriptIdx] = useState(0);
  const [words, setWords] = useState<string[]>([]);
  const [polished, setPolished] = useState<string>("");
  const [polishedRevealCount, setPolishedRevealCount] = useState(0);
  const [target, setTarget] = useState<"note" | "message" | "clipboard">("clipboard");
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };
  useEffect(() => () => clearTimers(), []);

  const startListening = () => {
    clearTimers();
    const script = SCRIPTS[scriptIdx];
    setWords([]);
    setPolished("");
    setPolishedRevealCount(0);
    setPhase("listening");

    script.raw.forEach((w, i) => {
      const t = setTimeout(() => {
        setWords((prev) => [...prev, w]);
      }, 180 + i * 220);
      timersRef.current.push(t);
    });
  };

  const stopListening = () => {
    clearTimers();
    setPhase("thinking");
    const script = SCRIPTS[scriptIdx];

    // brief "thinking" then reveal polished text word-by-word
    timersRef.current.push(
      setTimeout(() => {
        setPolished(script.polished);
        setPhase("polished");
        const polishedWords = script.polished.split(" ");
        polishedWords.forEach((_, i) => {
          timersRef.current.push(
            setTimeout(() => setPolishedRevealCount(i + 1), 60 + i * 45)
          );
        });
      }, 900)
    );
  };

  const handleSend = () => {
    setPhase("sent");
    timersRef.current.push(
      setTimeout(() => {
        setScriptIdx((i) => (i + 1) % SCRIPTS.length);
        setWords([]);
        setPolished("");
        setPolishedRevealCount(0);
        setPhase("idle");
      }, 1400)
    );
  };

  const handleRetry = () => {
    clearTimers();
    setWords([]);
    setPolished("");
    setPolishedRevealCount(0);
    setPhase("idle");
  };

  // Breathing orb scale based on phase
  const orbActive = phase === "listening";
  const orbThinking = phase === "thinking";

  const polishedWords = polished.split(" ");

  return (
    <AppScreen appName="Voice" onClose={onClose} onOpenUtilityDrawer={onOpenUtilityDrawer}>
      <div className="flex-1 flex flex-col px-7 pt-2 pb-6 relative overflow-hidden">
        {/* Mode prose line at top */}
        <div className="mb-6">
          <p
            className="italic"
            style={{
              fontSize: 14,
              lineHeight: 1.7,
              color: "hsl(var(--muted-foreground) / 0.55)",
            }}
          >
            speak, and it lands as{" "}
            {(["clipboard", "note", "message"] as const).map((t, i, arr) => (
              <React.Fragment key={t}>
                <button
                  onClick={() => setTarget(t)}
                  className="italic transition-colors active:opacity-70"
                  style={{
                    color:
                      target === t
                        ? "hsl(var(--primary))"
                        : "hsl(var(--muted-foreground) / 0.5)",
                    textDecoration: target === t ? "underline" : "none",
                    textUnderlineOffset: "3px",
                    textDecorationColor: "hsl(var(--primary) / 0.4)",
                  }}
                >
                  {t === "clipboard" ? "a quiet clipboard" : t === "note" ? "a fresh note" : "a message draft"}
                </button>
                {i < arr.length - 2 ? ", " : i === arr.length - 2 ? ", or " : ""}
              </React.Fragment>
            ))}
            .
          </p>
        </div>

        {/* Transcript area */}
        <div className="flex-1 flex flex-col justify-start overflow-y-auto" style={{ scrollbarWidth: "none" }}>
          {phase === "idle" && (
            <p
              className="italic"
              style={{
                fontSize: 22,
                lineHeight: 1.5,
                color: "hsl(var(--muted-foreground) / 0.25)",
              }}
            >
              hold the orb. speak naturally. the umms will quietly disappear.
            </p>
          )}

          {(phase === "listening" || phase === "thinking") && (
            <p
              className=""
              style={{
                fontSize: 22,
                lineHeight: 1.55,
                color: "hsl(var(--foreground) / 0.78)",
                letterSpacing: "-0.005em",
              }}
            >
              {words.map((w, i) => {
                const isFiller = ["uh", "um", "like", "yeah", "ok", "so"].includes(w);
                return (
                  <span
                    key={i}
                    style={{
                      opacity: isFiller ? 0.4 : 0.95,
                      fontStyle: isFiller ? "italic" : "normal",
                      color: isFiller
                        ? "hsl(var(--muted-foreground) / 0.55)"
                        : "hsl(var(--foreground) / 0.85)",
                      animation: "fadeIn 0.35s ease forwards",
                    }}
                  >
                    {w}{" "}
                  </span>
                );
              })}
              {phase === "listening" && (
                <span
                  className="inline-block animate-breathe"
                  style={{
                    width: 6,
                    height: 18,
                    background: "hsl(var(--primary) / 0.6)",
                    verticalAlign: "middle",
                    marginLeft: 2,
                  }}
                />
              )}
            </p>
          )}

          {(phase === "polished" || phase === "sent") && (
            <div>
              {/* faded "before" */}
              <p
                className="italic mb-4"
                style={{
                  fontSize: 13,
                  lineHeight: 1.6,
                  color: "hsl(var(--muted-foreground) / 0.3)",
                  textDecoration: "line-through",
                  textDecorationColor: "hsl(var(--muted-foreground) / 0.2)",
                }}
              >
                {words.join(" ")}
              </p>
              <p
                className=""
                style={{
                  fontSize: 22,
                  lineHeight: 1.55,
                  color: "hsl(var(--foreground))",
                  letterSpacing: "-0.005em",
                }}
              >
                {polishedWords.slice(0, polishedRevealCount).map((w, i) => (
                  <span
                    key={i}
                    style={{
                      animation: "fadeIn 0.4s ease forwards",
                      color: "hsl(var(--foreground))",
                    }}
                  >
                    {w}{" "}
                  </span>
                ))}
              </p>
            </div>
          )}
        </div>

        {/* Bottom: orb + actions */}
        <div className="flex flex-col items-center gap-5 pt-4">
          {phase === "polished" && (
            <div className="flex items-center gap-5">
              <button
                onClick={handleRetry}
                className="italic active:opacity-60 transition-opacity"
                style={{
                  fontSize: 13,
                  color: "hsl(var(--muted-foreground) / 0.55)",
                  letterSpacing: "0.02em",
                }}
              >
                say it again
              </button>
              <button
                onClick={handleSend}
                className="italic active:opacity-60 transition-opacity"
                style={{
                  fontSize: 15,
                  color: "hsl(var(--primary))",
                  letterSpacing: "0.02em",
                  textDecoration: "underline",
                  textUnderlineOffset: "4px",
                  textDecorationColor: "hsl(var(--primary) / 0.4)",
                }}
              >
                send it to {target === "clipboard" ? "the clipboard" : target === "note" ? "a new note" : "a draft"}
              </button>
            </div>
          )}

          {phase === "sent" && (
            <p
              className="italic"
              style={{
                fontSize: 13,
                color: "hsl(var(--accent, var(--primary)))",
                letterSpacing: "0.04em",
              }}
            >
              landed in {target === "clipboard" ? "the clipboard" : target === "note" ? "a new note" : "your drafts"}.
            </p>
          )}

          {/* Orb */}
          <button
            onPointerDown={(e) => {
              e.stopPropagation();
              if (phase === "idle") startListening();
            }}
            onPointerUp={(e) => {
              e.stopPropagation();
              if (phase === "listening") stopListening();
            }}
            onPointerCancel={() => {
              if (phase === "listening") stopListening();
            }}
            disabled={phase === "thinking" || phase === "sent" || phase === "polished"}
            className="relative flex items-center justify-center rounded-full"
            style={{
              width: 110,
              height: 110,
              background: "transparent",
              border: "none",
              touchAction: "none",
            }}
          >
            {/* outer ripples */}
            {orbActive && (
              <>
                <div
                  className="absolute rounded-full"
                  style={{
                    inset: -20,
                    border: "1px solid hsl(var(--primary) / 0.25)",
                    animation: "ripple 1.8s ease-out infinite",
                  }}
                />
                <div
                  className="absolute rounded-full"
                  style={{
                    inset: -10,
                    border: "1px solid hsl(var(--primary) / 0.35)",
                    animation: "ripple 1.8s ease-out infinite 0.6s",
                  }}
                />
              </>
            )}

            {/* orb core */}
            <div
              className="rounded-full"
              style={{
                width: orbActive ? 78 : 64,
                height: orbActive ? 78 : 64,
                background: orbThinking
                  ? "radial-gradient(circle at 35% 30%, hsl(var(--primary) / 0.55), hsl(var(--primary) / 0.15))"
                  : orbActive
                    ? "radial-gradient(circle at 35% 30%, hsl(var(--primary) / 0.85), hsl(var(--primary) / 0.35))"
                    : "radial-gradient(circle at 35% 30%, hsl(var(--foreground) / 0.18), hsl(var(--foreground) / 0.05))",
                boxShadow: orbActive
                  ? "0 0 40px hsl(var(--primary) / 0.45), inset 0 1px 0 hsl(var(--foreground) / 0.1)"
                  : "inset 0 1px 0 hsl(var(--foreground) / 0.1), 0 0 20px hsl(var(--foreground) / 0.05)",
                transition: "all 0.5s cubic-bezier(0.16,1,0.3,1)",
                animation: orbActive
                  ? "breathe 2.5s ease-in-out infinite"
                  : orbThinking
                    ? "breathe 1.2s ease-in-out infinite"
                    : "breathe 4s ease-in-out infinite",
              }}
            />
          </button>

          <p
            className="italic text-center"
            style={{
              fontSize: 11,
              color: "hsl(var(--muted-foreground) / 0.4)",
              letterSpacing: "0.08em",
              minHeight: 14,
            }}
          >
            {phase === "idle" && "hold to speak"}
            {phase === "listening" && "listening — release when done"}
            {phase === "thinking" && "tidying it up…"}
            {phase === "polished" && "ready"}
            {phase === "sent" && " "}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(2px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes ripple {
          0% { transform: scale(0.85); opacity: 0.7; }
          100% { transform: scale(1.6); opacity: 0; }
        }
      `}</style>
    </AppScreen>
  );
};
