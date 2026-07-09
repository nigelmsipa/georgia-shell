import React, { useRef } from "react";
import { motion, MotionValue, animate, PanInfo } from "framer-motion";

interface Props {
  /** Where the screen currently wants to be (0 = closed, OPEN_DISTANCE = fully revealed). */
  dragTarget: MotionValue<number>;
  openDistance: number;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

/**
 * A slim handle on the left edge of the screen. Dragging it inward pushes
 * the entire screen aside, revealing the void behind. The pill lives INSIDE
 * the sliding screen layer, so it travels with the surface it belongs to —
 * you're literally grabbing the edge of the screen.
 */
export const SidePill: React.FC<Props> = ({
  dragTarget,
  openDistance,
  isOpen,
  onOpen,
  onClose,
}) => {
  const startRef = useRef(0);

  const handlePanStart = () => {
    startRef.current = dragTarget.get();
  };

  const handlePan = (_: unknown, info: PanInfo) => {
    // 1:1 tracking, clamped with a bit of overtravel for elastic feel.
    const next = Math.max(
      0,
      Math.min(openDistance * 1.15, startRef.current + info.offset.x),
    );
    dragTarget.set(next);
  };

  const handlePanEnd = (_: unknown, info: PanInfo) => {
    const current = dragTarget.get();
    const shouldOpen =
      current > openDistance / 2 || info.velocity.x > 450;
    const target = shouldOpen ? openDistance : 0;
    animate(dragTarget, target, {
      type: "spring",
      stiffness: 280,
      damping: 26,
    });
    if (shouldOpen && !isOpen) onOpen();
    else if (!shouldOpen && isOpen) onClose();
  };

  return (
    <motion.div
      className="absolute left-0 top-1/2 z-[95] touch-none"
      style={{ width: 22, height: 96, y: "-50%" }}
      onPanStart={handlePanStart}
      onPan={handlePan}
      onPanEnd={handlePanEnd}
    >
      <div
        className="absolute left-0 top-1/2 rounded-r-md"
        style={{
          width: 4,
          height: 64,
          transform: "translateY(-50%)",
          background: "hsl(var(--muted-foreground) / 0.4)",
          boxShadow: "0 0 8px hsl(var(--foreground) / 0.15)",
        }}
      />
    </motion.div>
  );
};
