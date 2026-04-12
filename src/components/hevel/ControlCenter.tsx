import React, { useState, useRef, useEffect, useCallback } from "react";
import { useTheme, ALL_SCHEMES, type ThemeScheme } from "./ThemeProvider";

/* ── Inline Token (toggle) ─────────────────────────────────────────────── */

const Token: React.FC<{
  on: boolean;
  onLabel: string;
  offLabel: string;
  onToggle: () => void;
}> = ({ on, onLabel, offLabel, onToggle }) => {
  const [flash, setFlash] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFlash(true);
    setTimeout(() => setFlash(false), 220);
    onToggle();
  };

  return (
    <span
      onClick={handleClick}
      className="cursor-pointer font-serif italic select-none transition-all duration-200"
      style={{
        fontWeight: on ? 700 : 400,
        color: on ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.5)",
        background: flash
          ? on
            ? "hsl(var(--primary) / 0.18)"
            : "hsl(var(--muted-foreground) / 0.12)"
          : on
            ? "hsl(var(--primary) / 0.1)"
            : "hsl(var(--muted-foreground) / 0.06)",
        borderRadius: 4,
        padding: "1px 5px",
        textDecoration: "underline",
        textDecorationColor: on
          ? "hsl(var(--primary) / 0.35)"
          : "hsl(var(--muted-foreground) / 0.2)",
        textDecorationStyle: "dotted",
        textUnderlineOffset: 3,
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {on ? onLabel : offLabel}
    </span>
  );
};

/* ── Slider Token (inline expandable) ──────────────────────────────────── */

const SliderToken: React.FC<{
  value: number;
  onChange: (v: number) => void;
  label: string;
}> = ({ value, onChange, label }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const timer = setTimeout(() => document.addEventListener("mousedown", handler), 10);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handler);
    };
  }, [open]);

  const updateVal = useCallback(
    (clientX: number) => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      onChange(Math.round(pct * 100));
    },
    [onChange]
  );

  return (
    <span ref={ref} className="inline relative">
      <span
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className="cursor-pointer font-serif italic font-bold select-none"
        style={{
          color: "hsl(var(--primary))",
          background: "hsl(var(--primary) / 0.1)",
          borderRadius: 4,
          padding: "1px 5px",
          textDecoration: "underline",
          textDecorationColor: "hsl(var(--primary) / 0.35)",
          textDecorationStyle: "dotted",
          textUnderlineOffset: 3,
          WebkitTapHighlightColor: "transparent",
        }}
      >
        {value}%
      </span>

      {open && (
        <span
          className="absolute z-10"
          style={{
            top: "calc(100% + 8px)",
            left: "50%",
            transform: "translateX(-50%)",
            width: 200,
            background: "hsl(var(--background) / 0.97)",
            backdropFilter: "blur(16px)",
            border: "1px solid hsl(var(--primary) / 0.18)",
            borderRadius: 14,
            padding: "14px 16px",
            boxShadow:
              "0 8px 32px hsl(var(--primary) / 0.12), 0 2px 8px hsl(var(--background) / 0.3)",
          }}
        >
          <div
            className="text-muted-foreground uppercase tracking-wider mb-2.5"
            style={{ fontSize: 11, fontWeight: 600 }}
          >
            {label}
          </div>
          <div
            ref={trackRef}
            className="relative h-[3px] rounded-sm cursor-pointer"
            style={{ background: "hsl(var(--primary) / 0.12)", touchAction: "none" }}
            onMouseDown={(e) => {
              dragging.current = true;
              updateVal(e.clientX);
            }}
            onMouseMove={(e) => {
              if (dragging.current) updateVal(e.clientX);
            }}
            onMouseUp={() => {
              dragging.current = false;
            }}
            onTouchStart={(e) => {
              dragging.current = true;
              updateVal(e.touches[0].clientX);
            }}
            onTouchMove={(e) => {
              if (dragging.current) updateVal(e.touches[0].clientX);
            }}
            onTouchEnd={() => {
              dragging.current = false;
            }}
          >
            <div
              className="absolute left-0 top-0 h-full rounded-sm"
              style={{ width: `${value}%`, background: "hsl(var(--primary))" }}
            />
            <div
              className="absolute rounded-full"
              style={{
                top: "50%",
                left: `${value}%`,
                transform: "translate(-50%, -50%)",
                width: 13,
                height: 13,
                background: "hsl(var(--primary))",
                boxShadow: "0 0 0 3px hsl(var(--primary) / 0.18)",
              }}
            />
          </div>
          <div
            className="flex justify-between mt-2 text-muted-foreground"
            style={{ fontSize: 11 }}
          >
            <span>0</span>
            <span className="font-semibold" style={{ color: "hsl(var(--primary))" }}>
              {value}%
            </span>
            <span>100</span>
          </div>
        </span>
      )}
    </span>
  );
};

/* ── Blinking Cursor ───────────────────────────────────────────────────── */

const BlinkingCursor: React.FC = () => {
  const [vis, setVis] = useState(true);
  useEffect(() => {
    const id = setInterval(() => setVis((v) => !v), 530);
    return () => clearInterval(id);
  }, []);
  return (
    <span
      className="inline-block align-middle rounded-sm"
      style={{
        width: 2,
        height: "1.1em",
        background: vis ? "hsl(var(--primary))" : "transparent",
        marginRight: 8,
        transition: "background 0.08s",
      }}
    />
  );
};

/* ── Clock hook ────────────────────────────────────────────────────────── */

function useClock() {
  const [t, setT] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setT(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return t;
}

/* ── Props ─────────────────────────────────────────────────────────────── */

interface Props {
  open: boolean;
  onClose: () => void;
}

/* ── Control Center ────────────────────────────────────────────────────── */

export const ControlCenter: React.FC<Props> = ({ open, onClose }) => {
  const { scheme, setScheme } = useTheme();
  const t = useClock();

  const [s, setS] = useState({
    wifi: true,
    bluetooth: false,
    airplane: false,
    location: true,
    dnd: false,
    hotspot: false,
    rotation: true,
    flashlight: false,
  });
  const [brightness, setBrightness] = useState(70);
  const [volume, setVolume] = useState(45);

  const tog = (k: string) => setS((p) => ({ ...p, [k]: !p[k] }));

  const dragRef = useRef({ startY: 0 });
  const handleDragStart = (e: React.PointerEvent) => {
    dragRef.current.startY = e.clientY;
  };
  const handleDragEnd = (e: React.PointerEvent) => {
    if (e.clientY - dragRef.current.startY > 80) onClose();
  };

  if (!open) return null;

  const hour = t.getHours() % 12 || 12;
  const min = String(t.getMinutes()).padStart(2, "0");
  const ampm = t.getHours() >= 12 ? "pm" : "am";
  const day = t.toLocaleDateString("en-US", { weekday: "long" });

  return (
    <>
      {/* Scrim */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: "rgba(29, 32, 33, 0.4)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          zIndex: 39,
          transition: "opacity 0.3s ease-out",
        }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="absolute left-0 right-0 top-0 z-40 flex flex-col glass-surface"
        style={{
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderBottomLeftRadius: 16,
          borderBottomRightRadius: 16,
          borderTop: "none",
          borderRadius: "0 0 16px 16px",
          maxHeight: "80%",
          transition:
            "transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease-out",
        }}
        onPointerDown={handleDragStart}
        onPointerUp={handleDragEnd}
      >
        {/* Header */}
        <div className="px-6 pt-14 pb-1 flex justify-between items-baseline">
          <span className="text-sm text-muted-foreground font-serif">
            It's{" "}
            <span className="text-foreground font-bold">
              {hour}:{min}
              {ampm}
            </span>{" "}
            on {day}.
          </span>
          <button
            onClick={onClose}
            className="text-sm text-muted-foreground font-serif"
          >
            done
          </button>
        </div>

        {/* Prose body */}
        <div
          className="overflow-y-auto px-6 pb-4"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div
            className="font-serif text-foreground mt-4"
            style={{ fontSize: 17, lineHeight: 1.85, letterSpacing: "-0.01em" }}
          >
            {/* ¶ Connectivity */}
            <p className="mb-5">
              {s.airplane ? (
                <>
                  <Token
                    on={s.airplane}
                    onLabel="Airplane mode is on"
                    offLabel="Airplane mode is off"
                    onToggle={() => tog("airplane")}
                  />
                  . All radios are quiet.
                </>
              ) : (
                <>
                  Connected to{" "}
                  <Token
                    on={s.wifi}
                    onLabel="Home_5GHz"
                    offLabel="no network"
                    onToggle={() => tog("wifi")}
                  />{" "}
                  over Wi-Fi. Bluetooth is{" "}
                  <Token
                    on={s.bluetooth}
                    onLabel="on"
                    offLabel="off"
                    onToggle={() => tog("bluetooth")}
                  />
                  . Location is{" "}
                  <Token
                    on={s.location}
                    onLabel="sharing"
                    offLabel="hidden"
                    onToggle={() => tog("location")}
                  />
                  .
                </>
              )}
            </p>

            {/* ¶ Display */}
            <p className="mb-5">
              Brightness is at{" "}
              <SliderToken
                value={brightness}
                onChange={setBrightness}
                label="Brightness"
              />
              . Rotation is{" "}
              <Token
                on={s.rotation}
                onLabel="locked"
                offLabel="free"
                onToggle={() => tog("rotation")}
              />
              . Flashlight is{" "}
              <Token
                on={s.flashlight}
                onLabel="on"
                offLabel="off"
                onToggle={() => tog("flashlight")}
              />
              .
            </p>

            {/* ¶ Focus + Sound */}
            <p className="mb-5">
              Do Not Disturb is{" "}
              <Token
                on={s.dnd}
                onLabel="on — calls silenced"
                offLabel="off — everything comes through"
                onToggle={() => tog("dnd")}
              />
              . Volume is at{" "}
              <SliderToken
                value={volume}
                onChange={setVolume}
                label="Volume"
              />
              .
            </p>

            {/* ¶ Extras */}
            <p className="mb-5">
              Hotspot is{" "}
              <Token
                on={s.hotspot}
                onLabel="broadcasting"
                offLabel="off"
                onToggle={() => tog("hotspot")}
              />
              .{" "}
              {!s.airplane && (
                <Token
                  on={s.airplane}
                  onLabel="Airplane mode on."
                  offLabel="Tap to go offline."
                  onToggle={() => tog("airplane")}
                />
              )}
            </p>
          </div>

          {/* Ambience picker — divider then swatches */}
          <div
            className="mt-2 mb-1"
            style={{
              height: 1,
              background: "hsl(var(--primary) / 0.1)",
            }}
          />
          <div className="mt-3">
            <span
              className="text-muted-foreground font-serif block mb-2"
              style={{ fontSize: 12 }}
            >
              ambience
            </span>
            <div
              className="flex gap-2.5 overflow-x-auto pb-1 hide-scrollbar"
              style={{
                scrollSnapType: "x mandatory",
                WebkitOverflowScrolling: "touch",
                scrollbarWidth: "none",
              }}
            >
              {ALL_SCHEMES.map(([id, meta]) => {
                const active = scheme === id;
                return (
                  <button
                    key={id}
                    onClick={() => setScheme(id)}
                    className="flex-shrink-0 transition-all duration-200"
                    style={{ scrollSnapAlign: "start", width: 44 }}
                  >
                    <div
                      className={`w-[44px] h-[44px] rounded-sm overflow-hidden transition-all duration-200 ${
                        active
                          ? "ring-2 ring-foreground/40 scale-105"
                          : "opacity-50"
                      }`}
                      style={{
                        background: `linear-gradient(135deg, ${meta.colors[0]} 0%, ${meta.colors[0]} 40%, ${meta.colors[3]} 60%, ${meta.colors[4]} 100%)`,
                      }}
                    >
                      <div className="w-full h-full flex items-center justify-center">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{
                            backgroundColor: meta.colors[2],
                            opacity: 0.9,
                          }}
                        />
                      </div>
                    </div>
                    <span
                      className={`text-[8px] font-serif block mt-1 text-center leading-tight truncate ${
                        active
                          ? "text-foreground"
                          : "text-muted-foreground/50"
                      }`}
                    >
                      {meta.label.split(" ")[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Drag hint */}
        <div className="flex justify-center py-4">
          <div className="w-10 h-1 rounded-full bg-muted-foreground opacity-25" />
        </div>
      </div>
    </>
  );
};
