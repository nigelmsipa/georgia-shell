import React, { useRef, useState } from "react";
import { motion, MotionValue, animate, PanInfo, useTransform } from "framer-motion";

interface Props {
  /** Where the screen currently wants to be (0 = closed, OPEN_DISTANCE = fully revealed). */
  dragTarget: MotionValue<number>;
  openDistance: number;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  /** Tap (no meaningful drag) — starts dictation. */
  onTap: () => void;
}

const TAP_SLOP = 6; // px — below this, treat gesture as tap
const NOTCH_W = 22;
const NOTCH_H = 120;
const BASE_DEPTH = 18;

export const SidePill: React.FC<Props> = ({
  dragTarget,
  openDistance,
  isOpen,
  onOpen,
  onClose,
  onTap,
}) => {
  const startRef = useRef(0);
  const movedRef = useRef(0);
  const [dragging, setDragging] = useState(false);

  // Drag-linked notch depth: bulges inward a hair as the screen is pulled.
  const depth = useTransform(dragTarget, [0, openDistance], [BASE_DEPTH, BASE_DEPTH + 6], {
    clamp: true,
  });
  const [depthVal, setDepthVal] = useState(BASE_DEPTH);
  React.useEffect(() => depth.on("change", setDepthVal), [depth]);

  const handlePanStart = () => {
    startRef.current = dragTarget.get();
    movedRef.current = 0;
    setDragging(true);
  };

  const handlePan = (_: unknown, info: PanInfo) => {
    movedRef.current = Math.max(
      movedRef.current,
      Math.abs(info.offset.x) + Math.abs(info.offset.y),
    );
    if (movedRef.current < TAP_SLOP) return;
    const next = Math.max(
      0,
      Math.min(openDistance * 1.15, startRef.current + info.offset.x),
    );
    dragTarget.set(next);
  };

  const handlePanEnd = (_: unknown, info: PanInfo) => {
    setDragging(false);
    if (movedRef.current < TAP_SLOP) return;
    const current = dragTarget.get();
    const shouldOpen = current > openDistance / 2 || info.velocity.x > 450;
    const target = shouldOpen ? openDistance : 0;
    animate(dragTarget, target, { type: "spring", stiffness: 220, damping: 30 });
    if (shouldOpen && !isOpen) onOpen();
    else if (!shouldOpen && isOpen) onClose();
  };

  // Build the notch path: straight top, smooth concave bulge into the screen, straight bottom.
  // Coordinate space: 0..NOTCH_W wide, 0..NOTCH_H tall. The right edge (x=NOTCH_W) is the
  // screen-facing side; we carve into it.
  const midY = NOTCH_H / 2;
  const arcHalf = 45; // half-height of the bulge
  const d = [
    `M 0 0`,
    `L ${NOTCH_W} 0`,
    `L ${NOTCH_W} ${midY - arcHalf}`,
    // concave curve inward: control point pulled left by depthVal
    `Q ${NOTCH_W - depthVal} ${midY} ${NOTCH_W} ${midY + arcHalf}`,
    `L ${NOTCH_W} ${NOTCH_H}`,
    `L 0 ${NOTCH_H}`,
    `Z`,
  ].join(" ");

  return (
    <motion.div
      className="absolute left-0 top-1/2 z-[95] touch-none cursor-pointer"
      style={{ width: NOTCH_W, height: NOTCH_H, y: "-50%" }}
      onPanStart={handlePanStart}
      onPan={handlePan}
      onPanEnd={handlePanEnd}
      onTap={() => {
        if (movedRef.current < TAP_SLOP) onTap();
      }}
    >
      {/* The notch — fill matches the void behind the screen so it reads as carved. */}
      <svg
        width={NOTCH_W}
        height={NOTCH_H}
        viewBox={`0 0 ${NOTCH_W} ${NOTCH_H}`}
        className="absolute inset-0 pointer-events-none"
        style={{
          filter: "drop-shadow(1px 0 1px hsl(var(--foreground) / 0.10))",
        }}
      >
        <path d={d} fill="hsl(var(--background))" />
        {/* faint highlight along the curved edge for depth */}
        <path
          d={d}
          fill="none"
          stroke="hsl(var(--foreground) / 0.08)"
          strokeWidth={0.5}
        />
      </svg>

      {/* Breathing tab inside the notch */}
      <motion.div
        className="absolute pointer-events-none rounded-full"
        style={{
          left: NOTCH_W - depthVal + 3,
          top: "50%",
          width: 3,
          height: 56,
          background: "hsl(var(--muted-foreground) / 0.5)",
          boxShadow: "0 0 10px hsl(var(--foreground) / 0.18)",
          y: "-50%",
        }}
        animate={
          dragging
            ? { opacity: 1, scaleY: 1.06 }
            : { opacity: [0.75, 1, 0.75], scaleY: [1, 1.04, 1] }
        }
        transition={
          dragging
            ? { duration: 0.2 }
            : { duration: 3.2, repeat: Infinity, ease: "easeInOut" }
        }
      />
    </motion.div>
  );
};
