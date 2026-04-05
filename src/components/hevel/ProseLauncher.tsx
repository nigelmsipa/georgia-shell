import React, { useState, useCallback, useMemo } from "react";
import { ALL_APPS, RECENT_APPS } from "./types";

interface Props {
  open: boolean;
  onClose: () => void;
  onOpenApp: (name: string) => void;
}

/* ── Weight by recency ─────────────────────────────────────────────────── */

type Weight = 3 | 2 | 1 | 0;

const getWeight = (app: string): Weight => {
  const recent = RECENT_APPS.find((r) => r.name === app);
  if (!recent) return 0;
  if (recent.lastUsed <= 10) return 3;
  if (recent.lastUsed <= 30) return 2;
  if (recent.lastUsed <= 120) return 1;
  return 0;
};

/* ── Prose fragments that weave apps into sentences ────────────────────── */

interface ProseFragment {
  before: string;
  app: string;
  after: string;
}

function buildProse(apps: string[]): ProseFragment[][] {
  // Sort by weight descending, then alphabetical
  const sorted = [...apps].sort((a, b) => {
    const wa = getWeight(a);
    const wb = getWeight(b);
    if (wb !== wa) return wb - wa;
    return a.localeCompare(b);
  });

  const heavy = sorted.filter((a) => getWeight(a) >= 2);
  const medium = sorted.filter((a) => getWeight(a) === 1);
  const light = sorted.filter((a) => getWeight(a) === 0);

  const paragraphs: ProseFragment[][] = [];

  // ¶1 — recent / heavy apps as a conversational opener
  if (heavy.length > 0) {
    const p: ProseFragment[] = [];
    p.push({ before: "You were just in ", app: heavy[0], after: "" });
    if (heavy.length > 1) {
      for (let i = 1; i < heavy.length; i++) {
        const isLast = i === heavy.length - 1;
        p.push({
          before: isLast ? " and " : ", ",
          app: heavy[i],
          after: "",
        });
      }
    }
    // Append the period to the last fragment
    p[p.length - 1].after = ".";
    paragraphs.push(p);
  }

  // ¶2 — medium recency as suggestions
  if (medium.length > 0) {
    const p: ProseFragment[] = [];
    p.push({ before: "Maybe pick up ", app: medium[0], after: "" });
    for (let i = 1; i < medium.length; i++) {
      const isLast = i === medium.length - 1;
      p.push({
        before: isLast ? " or " : ", ",
        app: medium[i],
        after: "",
      });
    }
    p[p.length - 1].after = "?";
    paragraphs.push(p);
  }

  // ¶3 — light / unused as available
  if (light.length > 0) {
    const p: ProseFragment[] = [];
    // Group them more casually
    const first3 = light.slice(0, 3);
    const rest = light.slice(3);

    p.push({ before: "Also around: ", app: first3[0], after: "" });
    for (let i = 1; i < first3.length; i++) {
      p.push({ before: ", ", app: first3[i], after: "" });
    }

    if (rest.length > 0) {
      for (let i = 0; i < rest.length; i++) {
        const isLast = i === rest.length - 1;
        p.push({
          before: ", ",
          app: rest[i],
          after: isLast ? "." : "",
        });
      }
    } else {
      p[p.length - 1].after = ".";
    }

    paragraphs.push(p);
  }

  return paragraphs;
}

/* ── Weight → style ────────────────────────────────────────────────────── */

const WEIGHT_STYLES: Record<Weight, React.CSSProperties> = {
  3: { fontWeight: 700, fontSize: 19 },
  2: { fontWeight: 700, fontSize: 17 },
  1: { fontWeight: 600, fontSize: 16 },
  0: { fontWeight: 400, fontSize: 15 },
};

const WEIGHT_COLORS: Record<Weight, string> = {
  3: "hsl(var(--primary))",
  2: "hsl(var(--primary) / 0.85)",
  1: "hsl(var(--primary) / 0.6)",
  0: "hsl(var(--muted-foreground) / 0.7)",
};

/* ── App Token ─────────────────────────────────────────────────────────── */

const AppToken: React.FC<{
  app: string;
  weight: Weight;
  onOpen: () => void;
}> = ({ app, weight, onOpen }) => {
  const [flash, setFlash] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFlash(true);
    setTimeout(() => {
      setFlash(false);
      onOpen();
    }, 180);
  };

  const style = WEIGHT_STYLES[weight];
  const color = WEIGHT_COLORS[weight];

  return (
    <span
      onClick={handleClick}
      className="cursor-pointer font-serif italic select-none transition-all duration-200 hover:scale-[1.03]"
      style={{
        ...style,
        color,
        background: flash
          ? "hsl(var(--primary) / 0.18)"
          : weight >= 2
            ? "hsl(var(--primary) / 0.08)"
            : "transparent",
        borderRadius: 4,
        padding: weight >= 2 ? "1px 5px" : "0 2px",
        textDecoration: "underline",
        textDecorationColor:
          weight >= 2
            ? "hsl(var(--primary) / 0.35)"
            : "hsl(var(--muted-foreground) / 0.2)",
        textDecorationStyle: "dotted",
        textUnderlineOffset: 3,
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {app}
    </span>
  );
};

/* ── Component ─────────────────────────────────────────────────────────── */

export const ProseLauncher: React.FC<Props> = ({ open, onClose, onOpenApp }) => {
  const [closing, setClosing] = useState(false);

  const dismiss = useCallback(() => {
    if (closing) return;
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onClose();
    }, 280);
  }, [closing, onClose]);

  const paragraphs = useMemo(() => buildProse(ALL_APPS), []);

  if (!open && !closing) return null;
  const isVisible = open && !closing;

  return (
    <>
      {/* Scrim */}
      <div
        className="absolute inset-0"
        style={{
          backdropFilter: "blur(32px)",
          WebkitBackdropFilter: "blur(32px)",
          backgroundColor: "hsl(var(--background) / 0.82)",
          zIndex: 44,
          opacity: isVisible ? 1 : 0,
          transition: "opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        onClick={dismiss}
      />

      {/* Content */}
      <div
        className="absolute inset-0 z-50 flex items-center justify-center"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "translateY(0)" : "translateY(12px)",
          transition: "opacity 0.28s ease-out, transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
          pointerEvents: isVisible ? "auto" : "none",
        }}
        onClick={dismiss}
      >
        <div
          className="px-8 py-10 max-w-full max-h-[75%] overflow-y-auto hide-scrollbar"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="font-serif text-foreground"
            style={{ lineHeight: 2, letterSpacing: "-0.01em" }}
          >
            {paragraphs.map((fragments, pi) => (
              <p key={pi} className="mb-5">
                {fragments.map((f, fi) => (
                  <React.Fragment key={fi}>
                    <span
                      className="text-muted-foreground"
                      style={{ fontSize: 15, fontWeight: 400, fontStyle: "normal" }}
                    >
                      {f.before}
                    </span>
                    <AppToken
                      app={f.app}
                      weight={getWeight(f.app)}
                      onOpen={() => {
                        onOpenApp(f.app);
                        dismiss();
                      }}
                    />
                    {f.after && (
                      <span
                        className="text-muted-foreground"
                        style={{ fontSize: 15, fontWeight: 400, fontStyle: "normal" }}
                      >
                        {f.after}
                      </span>
                    )}
                  </React.Fragment>
                ))}
              </p>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
