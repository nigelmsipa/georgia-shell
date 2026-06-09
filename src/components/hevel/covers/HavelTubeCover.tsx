import React from "react";

export const HavelTubeCover: React.FC = () => (
  <div className="w-full h-full flex flex-col bg-card">
    {/* 16:9 thumbnail strip */}
    <div
      className="relative w-full"
      style={{
        aspectRatio: "16 / 9",
        background: "linear-gradient(135deg, hsl(28 40% 28%), hsl(68 30% 16%))",
      }}
    >
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ opacity: 0.4 }}
      >
        <div
          style={{
            width: 0,
            height: 0,
            borderLeft: "10px solid hsl(0 0% 95%)",
            borderTop: "6px solid transparent",
            borderBottom: "6px solid transparent",
            marginLeft: 3,
          }}
        />
      </div>
      <div
        className="absolute font-serif"
        style={{
          right: 4,
          bottom: 4,
          fontSize: 7,
          color: "hsl(0 0% 95%)",
          background: "hsl(0 0% 0% / 0.7)",
          padding: "1px 3px",
          borderRadius: 2,
        }}
      >
        12:04
      </div>
    </div>

    {/* Title + channel */}
    <div className="flex-1 px-3 py-2.5 flex flex-col justify-between">
      <div>
        <p
          className="font-serif"
          style={{
            fontSize: 9,
            lineHeight: 1.3,
            color: "hsl(var(--foreground) / 0.9)",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          What we lose when we stop walking
        </p>
        <p
          className="font-serif mt-1"
          style={{ fontSize: 7, color: "hsl(var(--muted-foreground) / 0.7)" }}
        >
          Slow Channel
        </p>
        <p
          className="font-serif"
          style={{ fontSize: 6.5, color: "hsl(var(--muted-foreground) / 0.5)" }}
        >
          84K views · 2 days ago
        </p>
      </div>
      <p
        className="font-serif italic"
        style={{
          fontSize: 6,
          color: "hsl(var(--accent) / 0.7)",
          letterSpacing: "0.1em",
        }}
      >
        HAVELTUBE
      </p>
    </div>
  </div>
);
