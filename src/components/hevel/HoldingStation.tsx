import React from "react";

/**
 * The Void — a quiet layer behind the phone screen. Slow drifting vapor,
 * a short stack of recent clipboard entries and voice dictations, and a
 * couple of small tool tiles. No chrome, Georgia throughout.
 *
 * Rendered underneath the sliding screen. Only visible when the SidePill
 * pushes the screen aside.
 */

const CLIPBOARD = [
  "the joy of enough",
  "meeting notes — thursday morning",
  "orion.mira@hevel.co",
];

const DICTATIONS = [
  "remind me to water the fig tree",
  "call mom before sunset",
];

const TOOLS = ["copy", "paste", "screenshot"];

// Deterministic, calm particle field. Sparse and slow.
const PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  x: (i * 37 + 13) % 100,
  y: (i * 53 + 21) % 100,
  size: 90 + (i % 4) * 50,
  delay: (i * 1.7) % 12,
  duration: 22 + (i % 5) * 6,
  drift: 20 + (i % 3) * 10,
}));

export const HoldingStation: React.FC = () => (
  <div
    className="absolute inset-0 overflow-hidden"
    style={{
      background:
        "radial-gradient(ellipse at 25% 35%, hsl(220 18% 7%) 0%, hsl(225 22% 3%) 70%, hsl(225 25% 2%) 100%)",
      fontFamily: "Georgia, serif",
    }}
  >
    <style>{`
      @keyframes vapor-drift {
        0%   { transform: translate(0, 0) scale(1);   opacity: 0; }
        20%  { opacity: 0.9; }
        50%  { transform: translate(var(--dx), calc(var(--dx) * -0.6)) scale(1.15); opacity: 1; }
        80%  { opacity: 0.7; }
        100% { transform: translate(calc(var(--dx) * 1.6), calc(var(--dx) * -1)) scale(0.95); opacity: 0; }
      }
    `}</style>

    {/* Vapor field */}
    {PARTICLES.map((p, i) => (
      <div
        key={i}
        className="absolute rounded-full pointer-events-none"
        style={{
          left: `${p.x}%`,
          top: `${p.y}%`,
          width: p.size,
          height: p.size,
          background:
            "radial-gradient(circle, hsl(var(--foreground) / 0.06) 0%, transparent 65%)",
          filter: "blur(14px)",
          // @ts-expect-error css var
          "--dx": `${p.drift}px`,
          animation: `vapor-drift ${p.duration}s ease-in-out ${p.delay}s infinite`,
        }}
      />
    ))}

    {/* Faint noise for depth (reuses AtmosphericBg's texture idea) */}
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        opacity: 0.08,
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        backgroundSize: "128px 128px",
      }}
    />

    {/* Holding Station content — anchored to the left, revealed as the screen slides right */}
    <div className="relative h-full flex flex-col justify-center gap-7 pl-5 pr-24">
      <section>
        <p
          className="text-[11px] italic mb-3 tracking-wide"
          style={{ color: "hsl(var(--foreground) / 0.32)" }}
        >
          held
        </p>
        <div className="flex flex-col gap-2">
          {CLIPBOARD.map((t, i) => (
            <div
              key={i}
              className="px-3 py-2 text-[13px] leading-snug"
              style={{
                color: "hsl(var(--foreground) / 0.72)",
                background: "hsl(var(--foreground) / 0.035)",
                border: "1px solid hsl(var(--foreground) / 0.06)",
                borderRadius: 8,
                backdropFilter: "blur(6px)",
                boxShadow: "0 0 20px hsl(var(--foreground) / 0.025)",
              }}
            >
              {t}
            </div>
          ))}
        </div>
      </section>

      <section>
        <p
          className="text-[11px] italic mb-3 tracking-wide"
          style={{ color: "hsl(var(--foreground) / 0.32)" }}
        >
          said
        </p>
        <div className="flex flex-col gap-2">
          {DICTATIONS.map((t, i) => (
            <div
              key={i}
              className="px-3 py-2 text-[13px] italic leading-snug"
              style={{
                color: "hsl(var(--foreground) / 0.66)",
                background: "hsl(var(--foreground) / 0.035)",
                border: "1px solid hsl(var(--foreground) / 0.06)",
                borderRadius: 8,
                backdropFilter: "blur(6px)",
              }}
            >
              “{t}”
            </div>
          ))}
        </div>
      </section>

      <section className="flex gap-2">
        {TOOLS.map((label) => (
          <div
            key={label}
            className="px-3 py-1.5 text-[11px] italic"
            style={{
              color: "hsl(var(--foreground) / 0.55)",
              background: "hsl(var(--foreground) / 0.04)",
              border: "1px solid hsl(var(--foreground) / 0.07)",
              borderRadius: 6,
            }}
          >
            {label}
          </div>
        ))}
      </section>
    </div>
  </div>
);
