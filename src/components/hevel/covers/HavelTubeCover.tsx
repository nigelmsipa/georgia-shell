import React from "react";

export const HavelTubeCover: React.FC = () => (
  <div className="w-full h-full flex flex-col justify-between px-3 py-4 bg-card">
    <span
      className="font-serif italic"
      style={{
        fontSize: 7,
        color: "hsl(var(--muted-foreground) / 0.5)",
        letterSpacing: "0.12em",
      }}
    >
      haveltube · 6 new
    </span>
    <div className="flex flex-col gap-2">
      <div
        className="rounded"
        style={{
          height: 28,
          background: "linear-gradient(135deg, hsl(28 40% 28% / 0.7), hsl(68 30% 18% / 0.85))",
        }}
      />
      <p
        className="font-serif"
        style={{
          fontSize: 8,
          lineHeight: 1.35,
          color: "hsl(var(--foreground) / 0.9)",
        }}
      >
        what we lose when we stop walking.
      </p>
      <p
        className="font-serif italic"
        style={{
          fontSize: 6.5,
          color: "hsl(var(--accent) / 0.8)",
        }}
      >
        slow channel · 12 min
      </p>
    </div>
  </div>
);
