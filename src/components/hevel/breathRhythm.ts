import { useEffect, useState } from "react";
import { motionValue, MotionValue, useTransform } from "framer-motion";

// ── Shared tunables ────────────────────────────────────────────────
export const BREATH_PERIOD_MS = 3800;
export const BREATH_OPACITY_MIN = 0.18;
export const BREATH_OPACITY_MAX = 0.44;
export const BREATH_GATHER_MAX = 1;
export const BREATH_GATHER_SPRING = { stiffness: 280, damping: 26 } as const;
export const BREATH_WARM = "var(--glow-gold)";
export const BREATH_CORE = "hsl(var(--foreground))";

// ── One shared clock — a MotionValue in [0,1] rising/falling on cosine ──
// Module-level so every breath + the lock caret stay in lockstep.
const phase: MotionValue<number> = motionValue(0);

let started = false;
function startClock() {
  if (started || typeof window === "undefined") return;
  started = true;
  const t0 = performance.now();
  const tick = (t: number) => {
    const dt = t - t0;
    const v = (1 - Math.cos((2 * Math.PI * dt) / BREATH_PERIOD_MS)) / 2;
    phase.set(v);
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

export function useBreathPhase(): MotionValue<number> {
  useEffect(() => {
    startClock();
  }, []);
  return phase;
}

/** Opacity MotionValue for text/glyph "caret" style breathing. */
export function useBreathOpacity(
  min = BREATH_OPACITY_MIN * 1.6,
  max = BREATH_OPACITY_MAX * 1.6,
): MotionValue<number> {
  const p = useBreathPhase();
  return useTransform(p, [0, 1], [min, max]);
}

/** Plain-number breathing opacity (re-renders each frame). Use only where a MotionValue
 * isn't practical (e.g. plain <span> without motion). */
export function useBreathOpacityNumber(min = BREATH_OPACITY_MIN * 1.6, max = BREATH_OPACITY_MAX * 1.6): number {
  const [v, setV] = useState(min);
  useEffect(() => {
    startClock();
    const unsub = phase.on("change", (p) => setV(min + (max - min) * p));
    return () => unsub();
  }, [min, max]);
  return v;
}
