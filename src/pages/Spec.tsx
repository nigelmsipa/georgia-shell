import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  NAV_ZONE_HEIGHT_DP,
  TOP_ZONE_HEIGHT_DP,
  SIDE_ZONE_WIDTH_DP,
  SWIPE_UP_HOME_DP,
  SWIPE_UP_PEEK_DP,
  SWIPE_SIDE_SCRUB_DP,
  MAX_ZONE_DP,
  PHONE_W_DP,
  PHONE_H_DP,
  isDebugGesturesEnabled,
  setDebugGesturesEnabled,
} from "../components/hevel/nav-contract";


/* ── token list, mirrors :root in index.css ───────────────────────────── */
const TOKENS = [
  "background", "foreground",
  "card", "card-foreground",
  "popover", "popover-foreground",
  "primary", "primary-foreground",
  "secondary", "secondary-foreground",
  "muted", "muted-foreground",
  "accent", "accent-foreground",
  "destructive", "destructive-foreground",
  "border", "input", "ring",
  "gruvbox-yellow", "gruvbox-orange", "gruvbox-green",
  "gruvbox-teal", "gruvbox-red", "gruvbox-gray",
  "gruvbox-bg0", "gruvbox-bg1", "gruvbox-bg2",
];

const TYPE_STEPS = ["display", "title", "body", "caption"] as const;

/* ── H S% L% → #rrggbb ───────────────────────────────────────────────── */
function hslTripletToHex(triplet: string): string {
  const m = triplet.trim().match(/^([\d.]+)\s+([\d.]+)%\s+([\d.]+)%$/);
  if (!m) return "—";
  const h = parseFloat(m[1]) / 360;
  const s = parseFloat(m[2]) / 100;
  const l = parseFloat(m[3]) / 100;
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  let r: number, g: number, b: number;
  if (s === 0) { r = g = b = l; }
  else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  const to = (x: number) => Math.round(x * 255).toString(16).padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}

const Spec: React.FC = () => {
  const [palette, setPalette] = useState<{ name: string; hsl: string; hex: string }[]>([]);
  const [typeMetrics, setTypeMetrics] = useState<Record<string, { size: string; lineHeight: string; letterSpacing: string }>>({});
  const [layout, setLayout] = useState<{ navW: number; navH: number; pillW: number; pillH: number; keyW: number; keyH: number; tapMinW: string; tapMinH: string; fontFamily: string } | null>(null);

  const typeRefs = useRef<Record<string, HTMLSpanElement | null>>({});
  const navContainerRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const keyRef = useRef<HTMLButtonElement>(null);
  const tapRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const cs = getComputedStyle(document.documentElement);
    setPalette(
      TOKENS.map((name) => {
        const hsl = cs.getPropertyValue(`--${name}`).trim();
        return { name, hsl, hex: hsl ? hslTripletToHex(hsl) : "—" };
      })
    );
  }, []);

  useLayoutEffect(() => {
    // Type metrics
    const t: Record<string, { size: string; lineHeight: string; letterSpacing: string }> = {};
    TYPE_STEPS.forEach((step) => {
      const el = typeRefs.current[step];
      if (!el) return;
      const cs = getComputedStyle(el);
      t[step] = {
        size: cs.fontSize,
        lineHeight: cs.lineHeight,
        letterSpacing: cs.letterSpacing,
      };
    });
    setTypeMetrics(t);

    // Layout metrics
    const nav = navContainerRef.current?.getBoundingClientRect();
    const pill = pillRef.current?.getBoundingClientRect();
    const key = keyRef.current?.getBoundingClientRect();
    const tap = tapRef.current;
    const tapCs = tap ? getComputedStyle(tap) : null;
    const bodyCs = getComputedStyle(document.body);
    setLayout({
      navW: nav?.width ?? 0,
      navH: nav?.height ?? 0,
      pillW: pill?.width ?? 0,
      pillH: pill?.height ?? 0,
      keyW: key?.width ?? 0,
      keyH: key?.height ?? 0,
      tapMinW: tapCs?.minWidth ?? "—",
      tapMinH: tapCs?.minHeight ?? "—",
      fontFamily: bodyCs.fontFamily,
    });
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground px-8 py-16">
      <div className="max-w-[720px] mx-auto">
        <h1 className="text-display mb-2">Georgia Shell — spec sheet</h1>
        <p className="text-caption text-muted-foreground mb-12">
          Live readout of tokens and layout. Copy real numbers from here.
        </p>

        {/* ── (1) Palette ─────────────────────────────────────────── */}
        <section className="mb-16">
          <h2 className="text-title mb-6">Palette</h2>
          <div className="flex flex-col gap-3">
            {palette.map(({ name, hsl, hex }) => (
              <div key={name} className="flex items-center gap-6">
                <div
                  className="shrink-0"
                  style={{
                    width: 48,
                    height: 48,
                    background: `hsl(${hsl})`,
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 0,
                  }}
                />
                <span className="font-mono text-caption w-56 shrink-0">--{name}</span>
                <span className="font-mono text-caption text-muted-foreground w-40 shrink-0">
                  hsl({hsl})
                </span>
                <span className="font-mono text-caption">{hex}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── (2) Type ramp ───────────────────────────────────────── */}
        <section className="mb-16">
          <h2 className="text-title mb-6">Type ramp</h2>
          <div className="flex flex-col gap-6">
            {TYPE_STEPS.map((step) => {
              const m = typeMetrics[step];
              return (
                <div key={step} className="flex flex-col gap-1">
                  <span
                    ref={(el) => { typeRefs.current[step] = el; }}
                    className={`text-${step}`}
                  >
                    {step} — Georgia serif, the quick brown fox
                  </span>
                  <span className="font-mono text-caption text-muted-foreground">
                    text-{step}{"  "}·{"  "}
                    {m ? `${m.size} / ${m.lineHeight}` : "measuring…"}
                    {m && m.letterSpacing !== "normal" ? `  ·  ls ${m.letterSpacing}` : ""}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── (3) Layout measurements ─────────────────────────────── */}
        <section className="mb-16">
          <h2 className="text-title mb-6">Layout</h2>

          {/* Off-flow measurement targets — visible but at real dimensions */}
          <div className="mb-8 flex flex-col gap-6">
            {/* Nav bar replica: matches HevelBar's container + pill */}
            <div>
              <div className="text-caption text-muted-foreground mb-2">
                Nav bar (HevelBar container + pill)
              </div>
              <div
                ref={navContainerRef}
                className="relative h-16 flex flex-col items-center justify-end"
                style={{ width: 390, background: "hsl(var(--card))" }}
              >
                <div
                  ref={pillRef}
                  className="w-32 h-[4px] rounded-full bg-[hsl(var(--muted-foreground)/0.3)]"
                />
              </div>
            </div>

            {/* PIN key replica: matches LockScreen keypad button */}
            <div>
              <div className="text-caption text-muted-foreground mb-2">
                PIN key (LockScreen keypad)
              </div>
              <button
                ref={keyRef}
                className="flex items-center justify-center rounded-full"
                style={{
                  width: 68,
                  height: 68,
                  background: "var(--glass-bg)",
                  border: "1px solid var(--glass-border)",
                }}
              >
                <span style={{ fontSize: 26, fontWeight: 300, color: "hsl(var(--foreground))" }}>
                  1
                </span>
              </button>
            </div>

            {/* tap-target reference */}
            <div>
              <div className="text-caption text-muted-foreground mb-2">
                .tap-target utility (minimum hit region)
              </div>
              <button
                ref={tapRef}
                className="tap-target"
                style={{ background: "hsl(var(--secondary))" }}
              >
                <span className="text-body">tap</span>
              </button>
            </div>
          </div>

          {/* Numeric readout */}
          <div className="flex flex-col gap-2 font-mono text-caption">
            {layout ? (
              <>
                <div>Nav bar container   {layout.navW.toFixed(1)} × {layout.navH.toFixed(1)} px</div>
                <div>Nav bar pill        {layout.pillW.toFixed(1)} × {layout.pillH.toFixed(1)} px</div>
                <div>PIN key             {layout.keyW.toFixed(1)} × {layout.keyH.toFixed(1)} px</div>
                <div>.tap-target min     {layout.tapMinW} × {layout.tapMinH}</div>
                <div>Phone frame ref     390 × 844 px</div>
                <div className="mt-4 text-muted-foreground">
                  font-family: {layout.fontFamily}
                </div>
              </>
            ) : (
              <div className="text-muted-foreground">measuring…</div>
            )}
          </div>
        </section>

        {/* ── (4) Navigation reservation ─────────────────────────── */}
        <NavigationSection />
      </div>
    </main>

  );
};

/* ── Navigation reservation section ─────────────────────────────────── */

const NAV_CONTRACT_ROWS: [string, string][] = [
  ["NAV_ZONE_HEIGHT_DP", `${NAV_ZONE_HEIGHT_DP} dp`],
  ["TOP_ZONE_HEIGHT_DP", `${TOP_ZONE_HEIGHT_DP} dp`],
  ["SIDE_ZONE_WIDTH_DP", `${SIDE_ZONE_WIDTH_DP} dp`],
  ["SWIPE_UP_HOME_DP",   `${SWIPE_UP_HOME_DP} dp`],
  ["SWIPE_UP_PEEK_DP",   `${SWIPE_UP_PEEK_DP} dp`],
  ["SWIPE_SIDE_SCRUB_DP",`${SWIPE_SIDE_SCRUB_DP} dp`],
  ["MAX_ZONE_DP",        `${MAX_ZONE_DP} dp (warning threshold)`],
];

const NavigationSection: React.FC = () => {
  const [debug, setDebug] = useState<boolean>(() => isDebugGesturesEnabled());

  const toggleDebug = () => {
    const next = !debug;
    setDebugGesturesEnabled(next);
    setDebug(next);
  };

  // Reserved-area math (from contract)
  const bottomArea = PHONE_W_DP * NAV_ZONE_HEIGHT_DP;
  const topArea = PHONE_W_DP * TOP_ZONE_HEIGHT_DP;
  const sideArea = SIDE_ZONE_WIDTH_DP * Math.round(PHONE_H_DP * 0.2);
  const reservedTotal = bottomArea + topArea + sideArea;
  const totalPhone = PHONE_W_DP * PHONE_H_DP;
  const pct = ((reservedTotal / totalPhone) * 100).toFixed(1);

  return (
    <section className="mb-16">
      <h2 className="text-title mb-6">Navigation reservation</h2>

      <div className="flex flex-col gap-2 font-mono text-caption mb-6">
        {NAV_CONTRACT_ROWS.map(([k, v]) => (
          <div key={k} className="flex gap-6">
            <span className="w-56 text-muted-foreground">{k}</span>
            <span>{v}</span>
          </div>
        ))}
        <div className="flex gap-6 mt-2">
          <span className="w-56 text-muted-foreground">Reserved area</span>
          <span>
            {reservedTotal.toLocaleString()} dp² ({pct}% of {PHONE_W_DP}×{PHONE_H_DP})
          </span>
        </div>
        <div className="flex gap-6">
          <span className="w-56 text-muted-foreground">bottom rect</span>
          <span>{PHONE_W_DP} × {NAV_ZONE_HEIGHT_DP} dp</span>
        </div>
        <div className="flex gap-6">
          <span className="w-56 text-muted-foreground">top rect</span>
          <span>{PHONE_W_DP} × {TOP_ZONE_HEIGHT_DP} dp</span>
        </div>
        <div className="flex gap-6">
          <span className="w-56 text-muted-foreground">side rect</span>
          <span>{SIDE_ZONE_WIDTH_DP} × {Math.round(PHONE_H_DP * 0.2)} dp</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={toggleDebug}
          className="tap-target px-4 border border-border text-caption"
          style={{ background: debug ? "hsl(var(--primary) / 0.2)" : "transparent" }}
        >
          {debug ? "hide" : "show"} gesture overlay
        </button>
        <span className="text-caption text-muted-foreground">
          persists in localStorage · also enable via <span className="font-mono">?debug=gestures</span>
        </span>
      </div>
    </section>
  );
};

export default Spec;

