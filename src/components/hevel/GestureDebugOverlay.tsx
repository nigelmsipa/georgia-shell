import React, { useEffect, useState } from "react";
import { MAX_ZONE_DP, GESTURE_ZONES, type GestureZoneId } from "./nav-contract";

/** Refs registered by the actual gesture zone components at mount */
type ZoneRefMap = Partial<Record<GestureZoneId, HTMLElement | null>>;

const registry: ZoneRefMap = {};
const listeners = new Set<() => void>();

export const registerGestureZone = (id: GestureZoneId, el: HTMLElement | null) => {
  registry[id] = el;
  listeners.forEach((l) => l());
};

export const readGestureZoneRects = () => {
  return GESTURE_ZONES.map((z) => {
    const el = registry[z.id];
    const rect = el?.getBoundingClientRect();
    return {
      ...z,
      measured: rect ? { w: rect.width, h: rect.height, x: rect.left, y: rect.top } : null,
    };
  });
};

export const GestureDebugOverlay: React.FC = () => {
  const [, force] = useState(0);

  useEffect(() => {
    const bump = () => force((n) => n + 1);
    listeners.add(bump);
    // remeasure on resize
    window.addEventListener("resize", bump);
    // Kick after mount so refs have landed
    const id = window.setTimeout(bump, 50);
    return () => {
      listeners.delete(bump);
      window.removeEventListener("resize", bump);
      window.clearTimeout(id);
    };
  }, []);

  const zones = readGestureZoneRects();

  return (
    <div className="absolute inset-0 z-[9999] pointer-events-none">
      {zones.map((z) => {
        if (!z.measured) return null;
        const overSize = z.measured.w > MAX_ZONE_DP || z.measured.h > MAX_ZONE_DP;
        // Overlay is a sibling of the phone contents (which are all absolutely
        // positioned inside the same relative frame), so we can use the phone-
        // frame-relative box we measure against ourselves.
        const style: React.CSSProperties = {
          position: "absolute",
          left: 0,
          right: z.edge === "left" ? "auto" : 0,
          top: z.edge === "top" ? 0 : z.edge === "left" ? "40%" : "auto",
          bottom: z.edge === "bottom" ? 0 : "auto",
          width: z.edge === "left" ? z.measured.w : "100%",
          height: z.edge === "left" ? z.measured.h : z.measured.h,
          background: overSize
            ? "hsl(var(--destructive) / 0.25)"
            : `hsl(${z.hue.replace("var(", "").replace(")", "")} / 0.18)`,
          border: `1px dashed hsl(${overSize ? "var(--destructive)" : z.hue.replace("var(", "").replace(")", "")})`,
          borderRadius: 0,
        };
        const w = Math.round(z.measured.w);
        const h = Math.round(z.measured.h);
        return (
          <div key={z.id} style={style}>
            <div
              className="text-[10px] font-mono px-1.5 py-0.5"
              style={{
                position: "absolute",
                top: z.edge === "bottom" ? -18 : 2,
                left: 4,
                background: "hsl(var(--background) / 0.85)",
                color: overSize ? "hsl(var(--destructive))" : "hsl(var(--foreground))",
                whiteSpace: "nowrap",
              }}
            >
              {overSize ? "⚠ oversized (>200dp) " : ""}
              {z.label} {w}×{h} dp
            </div>
          </div>
        );
      })}
    </div>
  );
};
