import React, { useState, useRef, useEffect } from "react";
import { PhoneCall } from "lucide-react";
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

const EMERGENCY_KEYS = [
  ...KEYS,
  ["", "0", "delete"],
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

  const closeEmergency = () => {
    setEmergency(false);
    setEmergencyDigits("");
    setCalling(false);
  };

  const startEmergencyCall = (target = emergencyDigits) => {
    if (!target || calling) return;
    setEmergencyDigits(target);
    setCalling(true);
    setTimeout(() => {
      setCalling(false);
      setEmergency(false);
      setEmergencyDigits("");
    }, 2500);
  };

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
                  color: entered.length
                    ? "hsl(var(--foreground) / 0.7)"
                    : "hsl(var(--muted-foreground) / 0.28)",
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

            <button
              onClick={() => setEmergency(true)}
              aria-label="Emergency call"
              className="font-serif italic transition-all duration-150 active:opacity-55"
              style={{
                minWidth: 144,
                minHeight: 44,
                background: "transparent",
                border: "none",
                color: "hsl(var(--destructive) / 0.56)",
                fontSize: 12,
                letterSpacing: "0.045em",
              }}
            >
              emergency
            </button>

          </div>
        </div>

      </div>

      {/* ── Emergency overlay ── */}
      <div
        className="absolute inset-0 flex flex-col overflow-hidden"
        style={{
          background: "hsl(var(--background))",
          opacity: emergency ? 1 : 0,
          pointerEvents: emergency ? "auto" : "none",
          transform: emergency ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 0.35s ease, transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <AtmosphericBg />
        <div className="relative z-10 flex items-center justify-between px-6 pt-6">
          <button
            onClick={closeEmergency}
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

        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 text-center">
          <span
            className="font-serif mt-2"
            style={{
              fontSize: emergencyDigits ? 52 : 22,
              fontWeight: 300,
              color: emergencyDigits
                ? "hsl(var(--foreground))"
                : "hsl(var(--muted-foreground) / 0.24)",
              letterSpacing: emergencyDigits ? "0.05em" : "0.04em",
              minHeight: 72,
              transition: "all 0.2s ease",
            }}
          >
            {emergencyDigits || "emergency"}
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
            <>
              <div className="mt-4 flex items-center gap-6">
                {(["911", "112", "999"] as const).map((n) => (
                  <button
                    key={n}
                    onClick={() => startEmergencyCall(n)}
                    className="font-serif transition-all duration-150 active:opacity-60"
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "hsl(var(--destructive) / 0.68)",
                      fontSize: 18,
                      fontWeight: 300,
                      letterSpacing: "0.04em",
                      padding: 0,
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <span
                className="font-serif italic mt-6"
                style={{
                  fontSize: 14,
                  color: "hsl(var(--muted-foreground) / 0.38)",
                  letterSpacing: "0.02em",
                }}
              >
                or dial below
              </span>
            </>
          )}
        </div>


        <div className="relative z-10 flex flex-col items-center gap-3 pb-10">
          {EMERGENCY_KEYS.map((row, ri) => (
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
                      boxShadow: isDelete ? "none" : "inset 0 1px 0 0 var(--glass-highlight)",
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
            onClick={() => startEmergencyCall()}
            className="mt-4 flex items-center justify-center rounded-full transition-all active:scale-95"
            style={{
              width: 64,
              height: 64,
              background: emergencyDigits
                ? "hsl(var(--destructive) / 0.82)"
                : "hsl(var(--muted-foreground) / 0.08)",
              boxShadow: emergencyDigits
                ? "0 0 22px hsl(var(--destructive) / 0.28)"
                : "none",
              opacity: emergencyDigits ? 1 : 0.65,
              color: emergencyDigits
                ? "hsl(var(--destructive-foreground))"
                : "hsl(var(--muted-foreground) / 0.45)",
            }}
          >
            <PhoneCall size={22} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  );
};
