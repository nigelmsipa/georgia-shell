import React from "react";

export const SignalCover: React.FC = () => (
  <div className="w-full h-full flex flex-col bg-card px-3 py-3 justify-between">
    <div>
      <p
        className="italic"
        style={{
          fontSize: 7,
          color: "hsl(var(--muted-foreground) / 0.55)",
          letterSpacing: "0.1em",
        }}
      >
        SIGNAL
      </p>
      <p
        className=""
        style={{
          fontSize: 9,
          marginTop: 8,
          color: "hsl(var(--foreground) / 0.9)",
          lineHeight: 1.35,
        }}
      >
        <span style={{ color: "hsl(var(--primary) / 0.9)" }}>mira</span>
        <span style={{ color: "hsl(var(--muted-foreground) / 0.55)" }}> · 2m</span>
      </p>
      <p
        className=""
        style={{
          fontSize: 7.5,
          marginTop: 3,
          lineHeight: 1.35,
          color: "hsl(var(--foreground) / 0.75)",
        }}
      >
        the new launcher feels right — softer than i expected.
      </p>
    </div>

    <div>
      <div
        style={{
          height: 1,
          background: "hsl(var(--border) / 0.4)",
          marginBottom: 6,
        }}
      />
      <p
        className=""
        style={{
          fontSize: 7,
          color: "hsl(var(--muted-foreground) / 0.55)",
          lineHeight: 1.4,
        }}
      >
        <span style={{ color: "hsl(var(--foreground) / 0.8)" }}>jonas</span> · golden hour around 7.
      </p>
      <p
        className="italic"
        style={{
          fontSize: 6.5,
          marginTop: 6,
          color: "hsl(var(--accent) / 0.7)",
        }}
      >
        2 new
      </p>
    </div>
  </div>
);
