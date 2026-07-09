import React from "react";

export const ContactsCover: React.FC = () => {
  const people = [
    { name: "Mira", hue: 28 },
    { name: "Jonas", hue: 200 },
    { name: "Anders", hue: 260 },
    { name: "dad", hue: 60 },
  ];
  return (
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
          CONTACTS
        </p>
        <p
          className=""
          style={{
            fontSize: 9,
            marginTop: 8,
            lineHeight: 1.4,
            color: "hsl(var(--foreground) / 0.85)",
          }}
        >
          12 people{" "}
          <span className="italic" style={{ color: "hsl(var(--muted-foreground) / 0.55)" }}>
            you've been keeping.
          </span>
        </p>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {people.map((p) => (
          <div
            key={p.name}
            className="flex items-center justify-center"
            style={{
              width: 22,
              height: 22,
              borderRadius: 999,
              background: `linear-gradient(135deg, hsl(${p.hue} 35% 30%), hsl(${(p.hue + 40) % 360} 25% 18%))`,
              color: "hsl(var(--foreground) / 0.85)",
              fontSize: 9,
              border: "1px solid hsl(var(--border) / 0.4)",
            }}
          >
            {p.name.charAt(0).toUpperCase()}
          </div>
        ))}
      </div>

      <p
        className="italic"
        style={{
          fontSize: 7,
          color: "hsl(var(--accent) / 0.7)",
        }}
      >
        mira · just now
      </p>
    </div>
  );
};
