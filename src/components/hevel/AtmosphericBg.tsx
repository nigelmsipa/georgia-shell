import React from "react";

export const AtmosphericBg: React.FC = () => (
  <>
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background: [
          "radial-gradient(ellipse 60% 50% at 15% 20%, var(--glow-gold), transparent)",
          "radial-gradient(ellipse 50% 45% at 85% 80%, var(--glow-blue), transparent)",
          "linear-gradient(180deg, hsl(var(--gruvbox-bg0)) 0%, hsl(var(--gruvbox-bg1)) 50%, hsl(var(--gruvbox-bg2)) 100%)",
        ].join(", "),
      }}
    />
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        opacity: "var(--grain-opacity)" as any,
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
        backgroundSize: "128px 128px",
      }}
    />
  </>
);
