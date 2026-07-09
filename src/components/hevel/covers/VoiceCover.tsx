import React from "react";

export const VoiceCover: React.FC = () => {
  return (
    <div
      className="w-full h-full relative flex flex-col justify-between p-3 overflow-hidden"
      style={{
        background:
          "linear-gradient(160deg, hsl(var(--card)) 0%, hsl(var(--secondary) / 0.7) 100%)",
      }}
    >
      {/* breathing orb */}
      <div className="flex-1 flex items-center justify-center relative">
        <div
          className="absolute rounded-full"
          style={{
            width: 64,
            height: 64,
            border: "1px solid hsl(var(--primary) / 0.18)",
            animation: "breathe 3s ease-in-out infinite",
          }}
        />
        <div
          className="rounded-full"
          style={{
            width: 38,
            height: 38,
            background:
              "radial-gradient(circle at 35% 30%, hsl(var(--primary) / 0.75), hsl(var(--primary) / 0.2))",
            boxShadow: "0 0 24px hsl(var(--primary) / 0.35)",
            animation: "breathe 2.5s ease-in-out infinite",
          }}
        />
      </div>

      <div>
        <p
          className="font-serif italic"
          style={{
            fontSize: 10,
            color: "hsl(var(--muted-foreground) / 0.55)",
            letterSpacing: "0.04em",
            lineHeight: 1.45,
          }}
        >
          speak, and the umms quietly disappear.
        </p>
      </div>
    </div>
  );
};
