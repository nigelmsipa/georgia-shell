import React, { useState } from "react";
import { useTheme, ALL_SCHEMES, type ThemeScheme } from "./ThemeProvider";

interface Props {
  onClose: () => void;
}

/* ── Inline toggle token ───────────────────────────────────────────────── */

const Toggle: React.FC<{
  label: string;
  active: boolean;
  onToggle: () => void;
}> = ({ label, active, onToggle }) => (
  <span
    onClick={(e) => { e.stopPropagation(); onToggle(); }}
    className="italic cursor-pointer select-none"
    style={{
      fontWeight: active ? 600 : 400,
      color: active
        ? "hsl(var(--primary))"
        : "hsl(var(--muted-foreground) / 0.35)",
      textDecoration: "underline",
      textDecorationStyle: active ? "solid" : "dotted",
      textUnderlineOffset: 3,
      textDecorationColor: active
        ? "hsl(var(--primary) / 0.4)"
        : "hsl(var(--muted-foreground) / 0.2)",
      transition: "all 0.2s ease",
    }}
  >
    {label}
  </span>
);

/* ── Section heading ───────────────────────────────────────────────────── */

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    className=""
    style={{
      fontSize: 10,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color: "hsl(var(--muted-foreground) / 0.3)",
      marginBottom: 8,
      marginTop: 28,
    }}
  >
    {children}
  </div>
);

/* ── Prose line ────────────────────────────────────────────────────────── */

const Prose: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    className=""
    style={{
      fontSize: 15,
      lineHeight: 1.7,
      color: "hsl(var(--foreground) / 0.7)",
      marginBottom: 4,
    }}
  >
    {children}
  </div>
);

/* ── Main ──────────────────────────────────────────────────────────────── */

export const SettingsApp: React.FC<Props> = ({ onClose }) => {
  const { scheme, setScheme } = useTheme();
  const [use24h, setUse24h] = useState(false);
  const [showSeconds, setShowSeconds] = useState(false);
  const [haptics, setHaptics] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-background">
      {/* Header */}
      <div className="px-6 pt-14 pb-2 flex justify-between items-baseline">
        <span
          className=""
          style={{ fontSize: 28, fontWeight: 300, color: "hsl(var(--foreground))" }}
        >
          Settings
        </span>
        <button
          onClick={onClose}
          className="italic"
          style={{
            fontSize: 13,
            color: "hsl(var(--muted-foreground) / 0.4)",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
        >
          done
        </button>
      </div>

      {/* Hairline */}
      <div className="mx-6" style={{ height: 1, backgroundColor: "hsl(var(--border) / 0.12)" }} />

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-8 hide-scrollbar">

        {/* ── Appearance ── */}
        <SectionLabel>appearance</SectionLabel>

        <Prose>
          Your shell is wearing{" "}
          <span
            className="italic"
            style={{ fontWeight: 600, color: "hsl(var(--primary))" }}
          >
            {ALL_SCHEMES.find(([s]) => s === scheme)?.[1].label}
          </span>
          . Switch to{" "}
          {ALL_SCHEMES.filter(([s]) => s !== scheme).map(([s, meta], i, arr) => (
            <React.Fragment key={s}>
              <Toggle
                label={meta.label}
                active={false}
                onToggle={() => setScheme(s)}
              />
              {i < arr.length - 1 ? (i === arr.length - 2 ? ", or " : ", ") : ""}
            </React.Fragment>
          ))}
          .
        </Prose>

        {/* Color preview */}
        <div className="flex gap-2 mt-3 mb-1">
          {ALL_SCHEMES.find(([s]) => s === scheme)?.[1].colors.map((c, i) => (
            <div
              key={i}
              style={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                backgroundColor: c,
                border: "1px solid hsl(var(--border) / 0.15)",
              }}
            />
          ))}
        </div>

        {/* ── Clock ── */}
        <SectionLabel>clock</SectionLabel>

        <Prose>
          Time is shown in{" "}
          <Toggle label="12-hour" active={!use24h} onToggle={() => setUse24h(false)} />
          {" "}or{" "}
          <Toggle label="24-hour" active={use24h} onToggle={() => setUse24h(true)} />
          {" "}format.{" "}
          Seconds are{" "}
          <Toggle label="visible" active={showSeconds} onToggle={() => setShowSeconds(true)} />
          {" "}or{" "}
          <Toggle label="hidden" active={!showSeconds} onToggle={() => setShowSeconds(false)} />
          .
        </Prose>

        {/* ── Feel ── */}
        <SectionLabel>feel</SectionLabel>

        <Prose>
          Haptic feedback is{" "}
          <Toggle label="on" active={haptics} onToggle={() => setHaptics(true)} />
          {" "}or{" "}
          <Toggle label="off" active={!haptics} onToggle={() => setHaptics(false)} />
          . Animations are{" "}
          <Toggle label="full" active={!reducedMotion} onToggle={() => setReducedMotion(false)} />
          {" "}or{" "}
          <Toggle label="reduced" active={reducedMotion} onToggle={() => setReducedMotion(true)} />
          .
        </Prose>

        {/* ── About ── */}
        <SectionLabel>about</SectionLabel>

        <Prose>
          <span style={{ color: "hsl(var(--foreground) / 0.5)" }}>
            Hevel is a personal shell. Georgia serif, no icons, no noise.
            Everything is text. Everything is intentional.
          </span>
        </Prose>

        <div
          className="italic mt-6"
          style={{ fontSize: 11, color: "hsl(var(--muted-foreground) / 0.2)" }}
        >
          v0.1 — a thing that is still becoming
        </div>
      </div>
    </div>
  );
};
