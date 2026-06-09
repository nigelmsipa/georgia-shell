import React from "react";

export const CalendarCover: React.FC = () => (
  <div className="w-full h-full flex flex-col bg-card px-3 py-3 justify-between">
    <div>
      <p
        className="font-serif italic"
        style={{ fontSize: 7, color: "hsl(var(--muted-foreground) / 0.55)", letterSpacing: "0.1em" }}
      >
        CALENDAR
      </p>
      <p
        className="font-serif"
        style={{ fontSize: 9, marginTop: 6, color: "hsl(var(--foreground) / 0.85)", lineHeight: 1.35 }}
      >
        tuesday{" "}
        <span style={{ color: "hsl(var(--primary) / 0.9)", fontStyle: "italic" }}>9 june</span>
      </p>
    </div>

    <div>
      <p className="font-serif" style={{ fontSize: 7.5, lineHeight: 1.45, color: "hsl(var(--foreground) / 0.78)" }}>
        <span style={{ color: "hsl(var(--muted-foreground) / 0.6)" }}>10:00</span>{" "}
        design review
      </p>
      <p className="font-serif" style={{ fontSize: 7.5, lineHeight: 1.45, color: "hsl(var(--foreground) / 0.78)", marginTop: 2 }}>
        <span style={{ color: "hsl(var(--muted-foreground) / 0.6)" }}>12:30</span>{" "}
        lunch with mira
      </p>
      <p className="font-serif" style={{ fontSize: 7.5, lineHeight: 1.45, color: "hsl(var(--foreground) / 0.6)", marginTop: 2 }}>
        <span style={{ color: "hsl(var(--muted-foreground) / 0.5)" }}>14:00</span>{" "}
        deep work
      </p>
    </div>

    <p
      className="font-serif italic"
      style={{ fontSize: 6.5, color: "hsl(var(--accent) / 0.7)" }}
    >
      next: in 22 minutes
    </p>
  </div>
);
