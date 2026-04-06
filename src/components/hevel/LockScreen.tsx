import React, { useState, useEffect } from "react";

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
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const hours = time.getHours();
  const minutes = time.getMinutes().toString().padStart(2, "0");
  const dateStr = `${DAYS[time.getDay()]}, ${MONTHS[time.getMonth()]} ${time.getDate()}`;
  const displayHour = hours % 12 || 12;
  const ampm = hours >= 12 ? "pm" : "am";

  const handleKey = (key: string) => {
    if (success) return;

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
        setSuccess(true);
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

  return (
    <div
      className="absolute inset-0 z-[60] flex flex-col bg-background select-none"
      style={{
        opacity: success ? 0 : 1,
        transform: success ? "translateY(-100%)" : "none",
        transition: success
          ? "opacity 0.35s ease, transform 0.35s cubic-bezier(0.22, 0.9, 0.36, 1)"
          : "none",
      }}
    >
      {/* Top spacer */}
      <div className="flex-[0.6]" />

      {/* Time */}
      <div className="px-8 flex flex-col items-center">
        <div className="flex items-baseline gap-1">
          <span
            className="font-serif"
            style={{
              fontSize: 80,
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
              fontSize: 80,
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
              fontSize: 80,
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
              fontSize: 16,
              fontWeight: 400,
              color: "hsl(var(--muted-foreground) / 0.4)",
              marginLeft: 4,
              alignSelf: "flex-end",
              marginBottom: 6,
            }}
          >
            {ampm}
          </span>
        </div>

        <span
          className="font-serif italic mt-2"
          style={{
            fontSize: 14,
            color: "hsl(var(--muted-foreground) / 0.4)",
            letterSpacing: "0.02em",
          }}
        >
          {dateStr}
        </span>
      </div>

      {/* PIN dots */}
      <div className="flex items-center justify-center gap-4 mt-10">
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
              transform: error ? `translateX(${i % 2 === 0 ? -4 : 4}px)` : "none",
              transition: error
                ? "transform 0.08s ease"
                : "all 0.2s ease",
            }}
          />
        ))}
      </div>

      {/* Spacer */}
      <div className="flex-[0.3]" />

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
                    backgroundColor: isDelete ? "transparent" : "hsl(var(--muted) / 0.5)",
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
  );
};
