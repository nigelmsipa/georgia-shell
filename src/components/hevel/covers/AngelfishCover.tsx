import React from "react";

/**
 * Angelfish cover — prose-first browser cover.
 * Shows the currently-open site as a soft sentence + ambient gradient.
 */
export const AngelfishCover: React.FC = () => (
  <div
    className="w-full h-full flex flex-col px-3 py-3 relative overflow-hidden"
    style={{
      background:
        "radial-gradient(120% 70% at 20% 0%, hsl(var(--accent) / 0.18), transparent 60%), hsl(var(--card))",
    }}
  >
    {/* tiny domain whisper */}
    <span
      className="italic"
      style={{ fontSize: 7, color: "hsl(var(--muted-foreground) / 0.55)", letterSpacing: "0.04em" }}
    >
      reading
    </span>

    {/* site title — large serif */}
    <div
      className=""
      style={{
        fontSize: 11,
        fontWeight: 700,
        color: "hsl(var(--foreground) / 0.85)",
        lineHeight: 1.15,
        marginTop: 2,
      }}
    >
      the quiet web,
      <br />
      revisited.
    </div>

    {/* hairline rule */}
    <div
      style={{
        height: 1,
        background: "hsl(var(--foreground) / 0.08)",
        margin: "8px 0 6px",
      }}
    />

    {/* prose tab list */}
    <div className="flex flex-col gap-[3px]">
      <span className="italic" style={{ fontSize: 6.5, color: "hsl(var(--foreground) / 0.5)" }}>
        are.na · channels
      </span>
      <span className="italic" style={{ fontSize: 6.5, color: "hsl(var(--foreground) / 0.5)" }}>
        nigel / hevel
      </span>
      <span className="italic" style={{ fontSize: 6.5, color: "hsl(var(--foreground) / 0.35)" }}>
        hacker news
      </span>
    </div>

    {/* footer label */}
    <div className="mt-auto flex items-center justify-between">
      <span className="" style={{ fontSize: 6, color: "hsl(var(--muted-foreground) / 0.4)" }}>
        angelfish
      </span>
      <span className="italic" style={{ fontSize: 6, color: "hsl(var(--accent) / 0.7)" }}>
        3 tabs open
      </span>
    </div>
  </div>
);
