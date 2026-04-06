import React, { useState, useRef, useEffect } from "react";

interface Props {
  onUnlock: () => void;
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const PIN = "1234";
const PIN_LENGTH = 4;

const KEYS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["", "0", "delete"],
];

export const LockScreen: React.FC<Props> = ({ onUnlock }) => {
  const [time, setTime] = useState(new Date());
  const [phase, setPhase] = useState<"clock" | "pin">("clock");
  const [entered, setEntered] = useState("");
  const [error, setError] = useState(false);
  const [unlocking, setUnlocking] = useState(false);

  // Swipe state
  const [dragY, setDragY] = useState(0);
  const dragRef = useRef({ startY: 0, active: false });

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const hours = time.getHours();
  const minutes = time.getMinutes().toString().padStart(2, "0");
  const dateStr = `${DAYS[time.getDay()]}, ${MONTHS[time.getMonth()]} ${time.getDate()}`;
  const displayHour = hours % 12 || 12;
  const ampm = hours >= 12 ? "pm" : "am";

  // --- Swipe handlers (clock phase only) ---
  const handlePointerDown = (e: React.PointerEvent) => {
    if (phase !== "clock") return;
    dragRef.current = { startY: e.clientY, active: true };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current.active || phase !== "clock") return;
    const dy = dragRef.current.startY - e.clientY;
    if (dy > 0) setDragY(Math.min(dy, 200));
  };

  const handlePointerUp = () => {
    if (phase !== "clock") return;
    dragRef.current.active = false;
    if (dragY > 80) {
      setPhase("pin");
      setDragY(0);
    } else {
      setDragY(0);
    }
  };

  // --- PIN handlers ---
  const handleKey = (key: string) => {
    if (unlocking) return;

    if (key === "delete") {
      setEntered((p) => p.slice(0, -1));
      setError(false);
      return;
    }

    if (entered.length >= PIN_LENGTH) return;

    const next = entered + key;
    setEntered(next);

    if (next.length === PIN_LENGTH) {
      if (next === PIN) {
        setUnlocking(true);
        setTimeout(onUnlock, 400);
      } else {
        setError(true);
        setTimeout(() => {
          setEntered("");
          setError(false);
        }, 500);
      }
    }
  };

  const progress = Math.min(dragY / 120, 1);

  return (
    <div
      className="absolute inset-0 z-[60] flex flex-col bg-background select-none overflow-hidden"
      style={{
        touchAction: "none",
        opacity: unlocking ? 0 : 1,
        transform: unlocking ? "translateY(-100%)" : "none",
        transition: unlocking
          ? "opacity 0.35s ease, transform 0.35s cubic-bezier(0.22, 0.9, 0.36, 1)"
          : "none",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* ── Clock face ── */}
      <div
        className="absolute inset-0 flex flex-col transition-all"
        style={{
          opacity: phase === "pin" ? 0 : 1,
          transform:
            phase === "pin"
              ? "translateY(-60px) scale(0.95)"
              : `translateY(${-dragY * 0.3}px)`,
          transition:
            phase === "pin"
              ? "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)"
              : dragRef.current.active
                ? "none"
                : "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
          pointerEvents: phase === "pin" ? "none" : "auto",
        }}
      >
        <div className="flex-1" />

        <div className="px-8 flex flex-col items-center">
          <div className="flex items-baseline gap-1">
            <span
              className="font-serif"
              style={{
                fontSize: 96,
                fontWeight: 300,
                lineHeight: 1,
                letterSpacing: "-0.04em",
                color: "hsl(var(--foreground))",
              }}
            >
              {displayHour}
            </span>
            <span
              className="font-serif"
              style={{
                fontSize: 96,
                fontWeight: 300,
                lineHeight: 1,
                color: "hsl(var(--foreground) / 0.3)",
              }}
            >
              :
            </span>
            <span
              className="font-serif"
              style={{
                fontSize: 96,
                fontWeight: 300,
                lineHeight: 1,
                letterSpacing: "-0.04em",
                color: "hsl(var(--foreground))",
              }}
            >
              {minutes}
            </span>
            <span
              className="font-serif italic"
              style={{
                fontSize: 18,
                fontWeight: 400,
                color: "hsl(var(--muted-foreground) / 0.4)",
                marginLeft: 4,
                alignSelf: "flex-end",
                marginBottom: 8,
              }}
            >
              {ampm}
            </span>
          </div>

          <span
            className="font-serif italic mt-3"
            style={{
              fontSize: 15,
              color: "hsl(var(--muted-foreground) / 0.4)",
              letterSpacing: "0.02em",
            }}
          >
            {dateStr}
          </span>
        </div>

        {/* Swipe hint */}
        <div className="flex-1 flex flex-col items-center justify-end pb-10">
          <div
            className="flex flex-col items-center gap-2"
            style={{
              opacity: 1 - progress * 2,
              transform: `translateY(${-dragY * 0.2}px)`,
              transition: dragRef.current.active ? "none" : "all 0.4s ease",
            }}
          >
            <div
              className="flex flex-col items-center"
              style={{ animation: "breathe 2.5s ease-in-out infinite" }}
            >
              <span
                className="font-serif"
                style={{
                  fontSize: 18,
                  color: "hsl(var(--muted-foreground) / 0.15)",
                  lineHeight: 0.8,
                }}
              >
                ›
              </span>
              <span
                className="font-serif"
                style={{
                  fontSize: 18,
                  color: "hsl(var(--muted-foreground) / 0.25)",
                  lineHeight: 0.8,
                  transform: "rotate(-90deg)",
                }}
              >
                ›
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── PIN entry ── */}
      <div
        className="absolute inset-0 flex flex-col items-center transition-all"
        style={{
          opacity: phase === "pin" ? 1 : 0,
          transform: phase === "pin" ? "none" : "translateY(40px)",
          transition: "all 0.45s cubic-bezier(0.16, 1, 0.3, 1)",
          pointerEvents: phase === "pin" ? "auto" : "none",
        }}
      >
        {/* Compact time at top */}
        <div className="pt-12 flex flex-col items-center">
          <span
            className="font-serif"
            style={{
              fontSize: 32,
              fontWeight: 300,
              letterSpacing: "-0.03em",
              color: "hsl(var(--foreground))",
            }}
          >
            {displayHour}:{minutes}
          </span>
          <span
            className="font-serif italic mt-1"
            style={{
              fontSize: 12,
              color: "hsl(var(--muted-foreground) / 0.35)",
            }}
          >
            {dateStr}
          </span>
        </div>

        {/* PIN dots */}
        <div className="flex items-center justify-center gap-4 mt-8">
          {Array.from({ length: PIN_LENGTH }).map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-200"
              style={{
                width: 10,
                height: 10,
                backgroundColor:
                  i < entered.length
                    ? error
                      ? "hsl(var(--destructive))"
                      : "hsl(var(--foreground))"
                    : "hsl(var(--muted-foreground) / 0.15)",
                transform: error
                  ? `translateX(${i % 2 === 0 ? -4 : 4}px)`
                  : "none",
                transition: error ? "transform 0.08s ease" : "all 0.2s ease",
              }}
            />
          ))}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Keypad */}
        <div className="flex flex-col items-center gap-3 pb-8">
          {KEYS.map((row, ri) => (
            <div key={ri} className="flex items-center gap-5">
              {row.map((key, ci) => {
                if (key === "") {
                  return <div key={ci} style={{ width: 60, height: 60 }} />;
                }

                const isDelete = key === "delete";

                return (
                  <button
                    key={ci}
                    onClick={() => handleKey(key)}
                    className="flex items-center justify-center rounded-full transition-colors active:bg-muted"
                    style={{
                      width: 60,
                      height: 60,
                      backgroundColor: isDelete
                        ? "transparent"
                        : "hsl(var(--muted) / 0.5)",
                    }}
                  >
                    {isDelete ? (
                      <span
                        className="font-serif italic"
                        style={{
                          fontSize: 13,
                          color: "hsl(var(--muted-foreground) / 0.5)",
                        }}
                      >
                        ‹
                      </span>
                    ) : (
                      <span
                        className="font-serif"
                        style={{
                          fontSize: 24,
                          fontWeight: 300,
                          color: "hsl(var(--foreground))",
                        }}
                      >
                        {key}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes breathe {
          0%, 100% { opacity: 0.4; transform: translateY(0); }
          50% { opacity: 1; transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
};
