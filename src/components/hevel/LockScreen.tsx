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

  // Swipe state with velocity
  const [dragY, setDragY] = useState(0);
  const dragRef = useRef({ startY: 0, lastY: 0, lastTime: 0, velocity: 0, active: false });

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const hours = time.getHours();
  const minutes = time.getMinutes().toString().padStart(2, "0");
  const dateStr = `${DAYS[time.getDay()]}, ${MONTHS[time.getMonth()]} ${time.getDate()}`;
  const displayHour = hours % 12 || 12;
  const ampm = hours >= 12 ? "PM" : "AM";

  // --- Swipe handlers with velocity tracking ---
  const handlePointerDown = (e: React.PointerEvent) => {
    if (phase !== "clock") return;
    dragRef.current = { startY: e.clientY, lastY: e.clientY, lastTime: Date.now(), velocity: 0, active: true };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current.active || phase !== "clock") return;
    const now = Date.now();
    const dt = now - dragRef.current.lastTime;
    const dy = dragRef.current.startY - e.clientY;

    if (dt > 0) {
      const instantVelocity = (dragRef.current.lastY - e.clientY) / dt;
      dragRef.current.velocity = instantVelocity * 0.7 + dragRef.current.velocity * 0.3;
    }
    dragRef.current.lastY = e.clientY;
    dragRef.current.lastTime = now;

    if (dy > 0) {
      // Rubber-band feel
      setDragY(Math.pow(dy, 0.85));
    }
  };

  const handlePointerUp = () => {
    if (phase !== "clock") return;
    const { velocity } = dragRef.current;
    dragRef.current.active = false;

    // Transition if dragged far enough OR flicked fast
    if (dragY > 60 || velocity > 0.5) {
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
        // Brief success state before sliding away
        setTimeout(onUnlock, 600);
      } else {
        setError(true);
        setTimeout(() => {
          setEntered("");
          setError(false);
        }, 600);
      }
    }
  };

  const progress = Math.min(dragY / 100, 1);

  return (
    <div
      className="absolute inset-0 z-[60] flex flex-col bg-background select-none overflow-hidden"
      style={{
        touchAction: "none",
        opacity: unlocking ? 0 : 1,
        transform: unlocking ? "translateY(-100%)" : "none",
        transition: unlocking
          ? "opacity 0.4s ease 0.2s, transform 0.4s cubic-bezier(0.22, 0.9, 0.36, 1) 0.2s"
          : "none",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* ── Clock face ── */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center"
        style={{
          opacity: phase === "pin" ? 0 : 1,
          transform:
            phase === "pin"
              ? "translateY(-80px) scale(0.9)"
              : `translateY(${-dragY * 0.3}px) scale(${1 - progress * 0.03})`,
          transition:
            phase === "pin"
              ? "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)"
              : dragRef.current.active
                ? "none"
                : "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
          pointerEvents: phase === "pin" ? "none" : "auto",
        }}
      >
        <div className="flex flex-col items-center">
          <span
            className="font-serif"
            style={{
              fontSize: 88,
              fontWeight: 300,
              lineHeight: 1,
              letterSpacing: "-0.04em",
              color: "hsl(var(--foreground))",
            }}
          >
            {displayHour}:{minutes}
          </span>

          <span
            className="font-serif italic mt-2"
            style={{
              fontSize: 13,
              fontWeight: 400,
              letterSpacing: "0.08em",
              color: "hsl(var(--muted-foreground) / 0.35)",
            }}
          >
            {ampm}
          </span>

          <span
            className="font-serif italic mt-4"
            style={{
              fontSize: 14,
              color: "hsl(var(--muted-foreground) / 0.3)",
              letterSpacing: "0.02em",
            }}
          >
            {dateStr}
          </span>
        </div>

        {/* Swipe hint — subtle chevron */}
        <div
          className="absolute bottom-10 flex flex-col items-center"
          style={{
            opacity: 1 - progress * 3,
            transform: `translateY(${-dragY * 0.15}px)`,
            transition: dragRef.current.active ? "none" : "all 0.5s ease",
          }}
        >
          <div className="animate-breathe">
            <svg
              width="20"
              height="10"
              viewBox="0 0 20 10"
              fill="none"
              style={{ opacity: 0.2 }}
            >
              <path
                d="M2 8L10 2L18 8"
                stroke="hsl(var(--muted-foreground))"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* ── PIN entry ── */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center"
        style={{
          opacity: phase === "pin" ? 1 : 0,
          transform: phase === "pin" ? "none" : "translateY(60px)",
          transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
          pointerEvents: phase === "pin" ? "auto" : "none",
        }}
      >
        {/* Label */}
        <span
          className="font-serif italic"
          style={{
            fontSize: 14,
            color: "hsl(var(--muted-foreground) / 0.4)",
            letterSpacing: "0.04em",
          }}
        >
          Enter Passcode
        </span>

        {/* PIN dots */}
        <div
          className={`flex items-center justify-center gap-5 mt-8 ${error ? "animate-shake" : ""}`}
        >
          {Array.from({ length: PIN_LENGTH }).map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-200"
              style={{
                width: 12,
                height: 12,
                backgroundColor:
                  i < entered.length
                    ? error
                      ? "hsl(var(--destructive))"
                      : "hsl(var(--foreground))"
                    : "hsl(var(--muted-foreground) / 0.12)",
                transform:
                  unlocking && i < entered.length
                    ? "scale(1.4)"
                    : "scale(1)",
                opacity: unlocking ? 0 : 1,
                transition: unlocking
                  ? `all 0.3s ease ${i * 0.05}s`
                  : "all 0.2s ease",
              }}
            />
          ))}
        </div>

        {/* Keypad */}
        <div className="flex flex-col items-center gap-3 mt-10">
          {KEYS.map((row, ri) => (
            <div key={ri} className="flex items-center gap-5">
              {row.map((key, ci) => {
                if (key === "") {
                  return <div key={ci} style={{ width: 68, height: 68 }} />;
                }

                const isDelete = key === "delete";

                return (
                  <button
                    key={ci}
                    onClick={() => handleKey(key)}
                    className="flex items-center justify-center rounded-full transition-all duration-150 active:scale-90"
                    style={{
                      width: 68,
                      height: 68,
                      backgroundColor: isDelete
                        ? "transparent"
                        : "hsl(var(--foreground) / 0.06)",
                    }}
                  >
                    {isDelete ? (
                      <span
                        className="font-serif italic"
                        style={{
                          fontSize: 12,
                          color: "hsl(var(--muted-foreground) / 0.4)",
                          letterSpacing: "0.03em",
                        }}
                      >
                        delete
                      </span>
                    ) : (
                      <span
                        className="font-serif"
                        style={{
                          fontSize: 26,
                          fontWeight: 300,
                          letterSpacing: "0.02em",
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
    </div>
  );
};
