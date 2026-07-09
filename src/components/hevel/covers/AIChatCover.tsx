import React from "react";

export const AIChatCover: React.FC = () => (
  <div className="w-full h-full flex flex-col justify-between px-3 py-4 bg-card">
    <span
      className="italic"
      style={{
        fontSize: 7,
        color: "hsl(var(--muted-foreground) / 0.5)",
        letterSpacing: "0.12em",
      }}
    >
      ask · just now
    </span>
    <div className="flex flex-col gap-1.5">
      <p
        className="italic text-right"
        style={{
          fontSize: 8,
          lineHeight: 1.4,
          color: "hsl(var(--primary) / 0.8)",
        }}
      >
        i can't focus today.
      </p>
      <p
        className=""
        style={{
          fontSize: 8,
          lineHeight: 1.5,
          color: "hsl(var(--foreground) / 0.8)",
        }}
      >
        try <span style={{ color: "hsl(var(--accent))", textDecoration: "underline" }}>twenty-five minutes</span> of one small thing.
      </p>
    </div>
  </div>
);
