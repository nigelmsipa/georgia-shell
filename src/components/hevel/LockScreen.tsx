import React, { useState, useRef, useEffect } from "react";
import { AtmosphericBg } from "./AtmosphericBg";

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
];

export const LockScreen: React.FC<Props> = ({ onUnlock }) => {
  const [time, setTime] = useState(new Date());
  const [entered, setEntered] = useState("");
  const [error, setError] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [emergency, setEmergency] = useState(false);
  const [emergencyDigits, setEmergencyDigits] = useState("");
  const [calling, setCalling] = useState(false);

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

    let next = dragRef.current.startScrollY + rawDy / containerHeight;
    if (next < 0) next = next * 0.3;
    if (next > 1) next = 1 + (next - 1) * 0.3;
    setScrollY(next);
  };

  const handlePointerUp = () => {
    if (!dragRef.current.active || unlocking) return;
    dragRef.current.active = false;

    const { velocity } = dragRef.current;
    let target: number;
    if (velocity > 0.4) {
      target = 1;
    } else if (velocity < -0.4) {
      target = 0;
    } else {
      target = scrollY > 0.4 ? 1 : 0;
    }
    setScrollY(target);
  };

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
      className="absolute inset-0 z-[60] overflow-hidden select-none"
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
      <AtmosphericBg />
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
            <span
              className="font-serif"
              style={{
                fontSize: 84,
                fontWeight: 300,
                lineHeight: 1,
                letterSpacing: "-0.04em",
                color: "hsl(var(--foreground))",
                textShadow: "0 0 60px rgba(215, 153, 33, 0.08)",
                opacity: 1 - scrollY * 0.6,
                transform: `scale(${1 - scrollY * 0.08})`,
                transition: isAnimating ? "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)" : "none",
              }}
            >
              {displayHour}:{minutes}
            </span>

            <span
              className="font-serif italic mt-4"
              style={{
                fontSize: 14,
                color: "hsl(var(--muted-foreground) / 0.3)",
                letterSpacing: "0.02em",
                opacity: 1 - scrollY * 1.5,
                transition: isAnimating ? "opacity 0.6s ease" : "none",
              }}
            >
              {dateStr}, {displayHour}:{minutes} {ampm}
            </span>
          </div>

          <div
            className="absolute bottom-12 animate-breathe"
            style={{
              opacity: Math.max(0, 0.3 - scrollY * 2),
              transition: isAnimating ? "opacity 0.6s ease" : "none",
            }}
          >
            <span
              className="font-serif italic"
              style={{
                fontSize: 12,
                color: "hsl(var(--muted-foreground) / 0.4)",
                letterSpacing: "0.06em",
              }}
            >
              swipe up
            </span>
          </div>
        </div>

        {/* ── Page 2: PIN ── */}
        <div
          className="flex flex-col items-center justify-center"
          style={{ height: containerH }}
        >
          <span
            className="font-serif italic animate-breathe"
            style={{
              fontSize: 14,
              color: "hsl(var(--muted-foreground) / 0.35)",
              letterSpacing: "0.04em",
            }}
          >
            enter passcode or use fingerprint
          </span>

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
                        : "hsl(var(--primary))"
                      : "hsl(var(--muted-foreground) / 0.1)",
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

          <div className="flex flex-col items-center gap-3 mt-10">
            {KEYS.map((row, ri) => (
              <div key={ri} className="flex items-center gap-5">
                {row.map((key, ci) => (
                  <button
                    key={ci}
                    onClick={() => handleKey(key)}
                    className="flex items-center justify-center rounded-full transition-all duration-150 active:scale-90"
                    style={{
                      width: 68,
                      height: 68,
                      background: "var(--glass-bg)",
                      border: "1px solid var(--glass-border)",
                      boxShadow: "inset 0 1px 0 0 var(--glass-highlight)",
                    }}
                  >
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
                  </button>
                ))}
              </div>
            ))}

            {/* 4th row: Back — 0 — Enter */}
            <div className="flex items-center gap-5">
              <button
                onClick={() => handleKey("delete")}
                className="font-serif italic transition-all duration-150 active:opacity-50"
                style={{
                  fontSize: 14,
                  color: "hsl(var(--foreground) / 0.7)",
                  letterSpacing: "0.04em",
                  width: 68,
                  height: 68,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                Back
              </button>

              <button
                onClick={() => handleKey("0")}
                className="flex items-center justify-center rounded-full transition-all duration-150 active:scale-90"
                style={{
                  width: 68,
                  height: 68,
                  background: "var(--glass-bg)",
                  border: "1px solid var(--glass-border)",
                  boxShadow: "inset 0 1px 0 0 var(--glass-highlight)",
                }}
              >
                <span
                  className="font-serif"
                  style={{
                    fontSize: 26,
                    fontWeight: 300,
                    letterSpacing: "0.02em",
                    color: "hsl(var(--foreground))",
                  }}
                >
                  0
                </span>
              </button>

              <button
                onClick={() => {
                  if (entered.length === PIN_LENGTH) {
                    if (entered === PIN) {
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
                }}
                className="font-serif italic transition-all duration-150 active:opacity-50"
                style={{
                  fontSize: 14,
                  color: entered.length === PIN_LENGTH
                    ? "hsl(var(--primary))"
                    : "hsl(var(--foreground) / 0.7)",
                  letterSpacing: "0.04em",
                  opacity: entered.length > 0 ? 1 : 0,
                  pointerEvents: entered.length > 0 ? "auto" : "none",
                  width: 68,
                  height: 68,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                Enter
              </button>
            </div>

            {/* Emergency pill */}
            <div className="flex items-center justify-center mt-2">
              <button
                onClick={() => setEmergency(true)}
                className="font-serif italic transition-all duration-150 active:opacity-60"
                style={{
                  fontSize: 13,
                  color: "hsl(var(--destructive) / 0.85)",
                  letterSpacing: "0.04em",
                  background: "hsl(var(--muted) / 0.12)",
                  border: "1px solid hsl(var(--destructive) / 0.15)",
                  borderRadius: 9999,
                  padding: "10px 32px",
                }}
              >
                Emergency
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* ── Emergency overlay ── */}
      <div
        className="absolute inset-0 flex flex-col"
        style={{
          background: "hsl(var(--background))",
          opacity: emergency ? 1 : 0,
          pointerEvents: emergency ? "auto" : "none",
          transform: emergency ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 0.35s ease, transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <div className="flex items-center justify-between px-6 pt-6">
          <button
            onClick={() => {
              setEmergency(false);
              setEmergencyDigits("");
              setCalling(false);
            }}
            className="font-serif italic"
            style={{
              fontSize: 13,
              color: "hsl(var(--muted-foreground) / 0.6)",
              letterSpacing: "0.04em",
            }}
          >
            cancel
          </button>
          <span
            className="font-serif italic"
            style={{
              fontSize: 13,
              color: "hsl(var(--destructive) / 0.8)",
              letterSpacing: "0.06em",
            }}
          >
            emergency only
          </span>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <span
            className="font-serif mt-2"
            style={{
              fontSize: emergencyDigits ? 52 : 64,
              fontWeight: 300,
              color: "hsl(var(--foreground))",
              letterSpacing: "0.05em",
              minHeight: 72,
              transition: "all 0.2s ease",
            }}
          >
            {emergencyDigits || "—"}
          </span>

          {calling ? (
            <span
              className="font-serif italic mt-8 animate-breathe"
              style={{
                fontSize: 15,
                color: "hsl(var(--destructive) / 0.85)",
                letterSpacing: "0.05em",
              }}
            >
              calling {emergencyDigits}…
            </span>
          ) : (
            <p
              className="font-serif italic mt-8 max-w-[280px]"
              style={{
                fontSize: 15,
                lineHeight: 1.7,
                color: "hsl(var(--muted-foreground) / 0.55)",
                letterSpacing: "0.01em",
              }}
            >
              in an emergency, call{" "}
              {(["911", "112", "999"] as const).map((n, i, arr) => (
                <React.Fragment key={n}>
                  <button
                    onClick={() => {
                      setEmergencyDigits(n);
                      setCalling(true);
                      setTimeout(() => {
                        setCalling(false);
                        setEmergency(false);
                        setEmergencyDigits("");
                      }, 2200);
                    }}
                    className="font-serif italic transition-colors active:opacity-70"
                    style={{
                      color: "hsl(var(--destructive))",
                      textDecoration: "underline",
                      textUnderlineOffset: "3px",
                      textDecorationColor: "hsl(var(--destructive) / 0.35)",
                    }}
                  >
                    {n}
                  </button>
                  {i < arr.length - 2 ? ", " : i === arr.length - 2 ? ", or " : ""}
                </React.Fragment>
              ))}
              {" — or reach "}
              {(["police", "ambulance", "fire"] as const).map((n, i, arr) => (
                <React.Fragment key={n}>
                  <button
                    onClick={() => {
                      setEmergencyDigits(n);
                      setCalling(true);
                      setTimeout(() => {
                        setCalling(false);
                        setEmergency(false);
                        setEmergencyDigits("");
                      }, 2200);
                    }}
                    className="font-serif italic transition-colors active:opacity-70"
                    style={{
                      color: "hsl(var(--destructive))",
                      textDecoration: "underline",
                      textUnderlineOffset: "3px",
                      textDecorationColor: "hsl(var(--destructive) / 0.35)",
                    }}
                  >
                    {n}
                  </button>
                  {i < arr.length - 2 ? ", " : i === arr.length - 2 ? ", or " : ""}
                </React.Fragment>
              ))}
              {" directly."}
            </p>
          )}
        </div>


        <div className="flex flex-col items-center gap-3 pb-10">
          {KEYS.map((row, ri) => (
            <div key={ri} className="flex items-center gap-5">
              {row.map((key, ci) => {
                if (key === "") return <div key={ci} style={{ width: 64, height: 64 }} />;
                const isDelete = key === "delete";
                return (
                  <button
                    key={ci}
                    onClick={() => {
                      if (isDelete) setEmergencyDigits((p) => p.slice(0, -1));
                      else setEmergencyDigits((p) => (p.length < 12 ? p + key : p));
                    }}
                    className="flex items-center justify-center rounded-full transition-all duration-150 active:scale-90"
                    style={{
                      width: 64,
                      height: 64,
                      background: isDelete ? "transparent" : "var(--glass-bg)",
                      border: isDelete ? "none" : "1px solid var(--glass-border)",
                    }}
                  >
                    <span
                      className={isDelete ? "font-serif italic" : "font-serif"}
                      style={{
                        fontSize: isDelete ? 12 : 24,
                        fontWeight: 300,
                        color: isDelete
                          ? "hsl(var(--muted-foreground) / 0.5)"
                          : "hsl(var(--foreground))",
                        letterSpacing: "0.02em",
                      }}
                    >
                      {isDelete ? "del" : key}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}

          <button
            disabled={!emergencyDigits || calling}
            onClick={() => {
              setCalling(true);
              setTimeout(() => {
                setCalling(false);
                setEmergency(false);
                setEmergencyDigits("");
              }, 2500);
            }}
            className="mt-4 flex items-center justify-center rounded-full transition-all active:scale-95"
            style={{
              width: 64,
              height: 64,
              background: emergencyDigits
                ? "hsl(var(--destructive))"
                : "hsl(var(--destructive) / 0.25)",
              boxShadow: emergencyDigits
                ? "0 0 24px hsl(var(--destructive) / 0.4)"
                : "none",
              opacity: emergencyDigits ? 1 : 0.5,
            }}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="hsl(var(--destructive-foreground))"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0 1 22 16.92z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
