import React from "react";

export const MusicCover: React.FC = () => (
  <div className="w-full h-full flex flex-col bg-card">
    <div
      className="relative w-full"
      style={{
        aspectRatio: "1 / 1",
        background: "linear-gradient(135deg, hsl(220 45% 32%), hsl(270 35% 16%))",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: "22%",
          borderRadius: 999,
          border: "1px solid hsl(220 20% 70% / 0.25)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "46%",
          top: "46%",
          width: "8%",
          height: "8%",
          borderRadius: 999,
          background: "hsl(220 20% 80% / 0.4)",
        }}
      />
    </div>
    <div className="flex-1 px-3 py-2.5 flex flex-col justify-between">
      <div>
        <p
          className="font-serif"
          style={{
            fontSize: 9,
            lineHeight: 1.3,
            color: "hsl(var(--foreground) / 0.9)",
          }}
        >
          So What
        </p>
        <p
          className="font-serif"
          style={{ fontSize: 7, color: "hsl(var(--muted-foreground) / 0.7)" }}
        >
          Miles Davis
        </p>
        <p
          className="font-serif italic"
          style={{ fontSize: 6.5, color: "hsl(var(--accent) / 0.7)" }}
        >
          now playing
        </p>
      </div>
      <p
        className="font-serif italic"
        style={{
          fontSize: 6,
          color: "hsl(var(--muted-foreground) / 0.5)",
          letterSpacing: "0.1em",
        }}
      >
        MUSIC
      </p>
    </div>
  </div>
);
