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
  const [entered, setEntered] = useState("");
  const [error, setError] = useState(false);
  const [unlocking, setUnlocking] = useState(false);

  // Continuous vertical scroll position (0 = clock visible, 1 = PIN visible)
  const [scrollY, setScrollY] = useState(0);
  const dragRef = useRef({
    startY: 0,
    startScrollY: 0,
    lastY: 0,
    lastTime: 0,
    velocity: 0,
    active: false,
  });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const hours = time.getHours();
  const minutes = time.getMinutes().toString().padStart(2, "0");
  const displayHour = hours % 12 || 12;
  const ampm = hours >= 12 ? "pm" : "am";
  const dateStr = `${DAYS[time.getDay()]}, ${MONTHS[time.getMonth()]} ${time.getDate()}`;

  // --- Continuous drag handlers ---
  const handlePointerDown = (e: React.PointerEvent) => {
    if (unlocking) return;
    dragRef.current = {
      startY: e.clientY,
      startScrollY: scrollY,
      lastY: e.clientY,
      lastTime: Date.now(),
      velocity: 0,
      active: true,
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current.active || unlocking) return;
    const containerHeight = containerRef.current?.clientHeight || 600;
    const now = Date.now();
    const dt = now - dragRef.current.lastTime;
    const rawDy = dragRef.current.startY - e.clientY;

    if (dt > 0) {
      const instantV = (dragRef.current.lastY - e.clientY) / dt;
      dragRef.current.velocity = instantV * 0.7 + dragRef.current.velocity * 0.3;
    }
    dragRef.current.lastY = e.clientY;
    dragRef.current.lastTime = now;

    // Map drag distance to 0..1 with rubber-banding at edges
    let next = dragRef.current.startScrollY + rawDy / containerHeight;
    if (next < 0) next = next * 0.3; // rubber band top
    if (next > 1) next = 1 + (next - 1) * 0.3; // rubber band bottom
    setScrollY(next);
  };

  const handlePointerUp = () => {
    if (!dragRef.current.active || unlocking) return;
    dragRef.current.active = false;

    const { velocity } = dragRef.current;
    // Snap to nearest phase, biased by velocity
    let target: number;
    if (velocity > 0.4) {
      target = 1; // flicked up → PIN
    } else if (velocity < -0.4) {
      target = 0; // flicked down → clock
    } else {
      target = scrollY > 0.4 ? 1 : 0;
    }
    setScrollY(target);
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

  const [containerH, setContainerH] = useState(600);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setContainerH(el.clientHeight);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const translatePx = -scrollY * containerH;
  const isAnimating = !dragRef.current.active;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-[60] overflow-hidden select-none bg-background"
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
      {/* Continuous vertical surface: two viewport-height sections stacked */}
      <div
        style={{
          transform: `translateY(${translatePx}px)`,
          transition: isAnimating
            ? "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)"
            : "none",
        }}
      >
        {/* ── Page 1: Clock ── */}
        <div
          className="flex flex-col items-center justify-center"
          style={{ height: containerH, position: "relative" }}
        >
          <div className="flex flex-col items-center">
            {/* Time */}
            <span
              className="font-serif"
              style={{
                fontSize: 84,
                fontWeight: 300,
                lineHeight: 1,
                letterSpacing: "-0.04em",
                color: "hsl(var(--foreground))",
                opacity: 1 - scrollY * 0.6,
                transform: `scale(${1 - scrollY * 0.08})`,
                transition: isAnimating ? "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)" : "none",
              }}
            >
              {displayHour}:{minutes}
            </span>

            {/* Date & AM/PM as a prose line */}
            <span
              className="font-serif italic mt-4"
              style={{
                fontSize: 14,
                color: "hsl(var(--muted-foreground) / 0.35)",
                letterSpacing: "0.02em",
                opacity: 1 - scrollY * 1.5,
                transition: isAnimating ? "opacity 0.6s ease" : "none",
              }}
            >
              {dateStr}, {displayHour}:{minutes} {ampm}
            </span>
          </div>

          {/* Swipe hint */}
          <div
            className="absolute bottom-12 flex flex-col items-center"
            style={{
              opacity: Math.max(0, 0.25 - scrollY * 2),
              transition: isAnimating ? "opacity 0.6s ease" : "none",
            }}
          >
            <div className="animate-breathe">
              <svg width="20" height="10" viewBox="0 0 20 10" fill="none">
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

        {/* ── Page 2: PIN ── */}
        <div
          className="flex flex-col items-center justify-center"
          style={{ height: containerH }}
        >
          {/* Prose prompt */}
          <span
            className="font-serif italic"
            style={{
              fontSize: 14,
              color: "hsl(var(--muted-foreground) / 0.4)",
              letterSpacing: "0.04em",
            }}
          >
            enter passcode
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
                    unlocking && i < entered.length ? "scale(1.4)" : "scale(1)",
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
    </div>
  );
};
