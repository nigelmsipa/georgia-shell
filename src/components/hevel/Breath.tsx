import React from "react";
import { motion, MotionValue, useTransform } from "framer-motion";
import {
  useBreathPhase,
  BREATH_OPACITY_MIN,
  BREATH_OPACITY_MAX,
  BREATH_WARM,
  BREATH_CORE,
} from "./breathRhythm";

interface Props {
  orientation: "horizontal" | "vertical";
  /** 0 = at rest, 1 = fully gathered under a touch. Spring this outside. */
  gather: MotionValue<number>;
  /** Base long-axis length in px. */
  length?: number;
  /** Base short-axis thickness in px. */
  thickness?: number;
}

export const Breath: React.FC<Props> = ({
  orientation,
  gather,
  length = 120,
  thickness = 18,
}) => {
  const phase = useBreathPhase();

  // Rest opacity oscillates gently; gather lifts opacity toward full presence.
  const restOpacity = useTransform(phase, [0, 1], [BREATH_OPACITY_MIN, BREATH_OPACITY_MAX]);
  const opacity = useTransform([restOpacity, gather] as any, ([r, g]: number[]) =>
    Math.min(1, r + g * (1 - r) * 0.95),
  );

  // Gather also swells the cloud outward (thickness/length grow ~35%).
  const swellL = useTransform(gather, [0, 1], [length, length * 1.15]);
  const swellT = useTransform(gather, [0, 1], [thickness, thickness * 2.2]);
  const blurPx = useTransform(gather, [0, 1], [10, 18]);
  const filter = useTransform(blurPx, (b) => `blur(${b}px)`);

  const width = orientation === "horizontal" ? swellL : swellT;
  const height = orientation === "horizontal" ? swellT : swellL;

  // A radial vapor cloud — no borders, no hard edges.
  const background =
    orientation === "horizontal"
      ? `radial-gradient(ellipse 50% 100% at 50% 50%, ${BREATH_CORE} 0%, ${BREATH_WARM} 45%, transparent 75%)`
      : `radial-gradient(ellipse 100% 50% at 50% 50%, ${BREATH_CORE} 0%, ${BREATH_WARM} 45%, transparent 75%)`;

  return (
    <motion.div
      className="absolute left-1/2 top-1/2 pointer-events-none"
      style={{
        width,
        height,
        x: "-50%",
        y: "-50%",
        opacity,
        filter,
        background,
        mixBlendMode: "screen",
      }}
    />
  );
};
