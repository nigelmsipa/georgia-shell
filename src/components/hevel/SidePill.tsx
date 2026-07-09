import React, { useRef } from "react";
import { motion, MotionValue, animate, useMotionValue, PanInfo } from "framer-motion";
import { Breath } from "./Breath";
import { BREATH_GATHER_SPRING } from "./breathRhythm";

interface Props {
  dragTarget: MotionValue<number>;
  openDistance: number;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onTap: () => void;
}

const TAP_SLOP = 6;

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
  const gather = useMotionValue(0);

  const setGather = (v: number) =>
    animate(gather, v, { type: "spring", ...BREATH_GATHER_SPRING });

  const handlePanStart = () => {
    startRef.current = dragTarget.get();
    movedRef.current = 0;
    setGather(1);
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
    if (movedRef.current < TAP_SLOP) {
      setGather(0);
      return;
    }
    const current = dragTarget.get();
    const shouldOpen = current > openDistance / 2 || info.velocity.x > 450;
    const target = shouldOpen ? openDistance : 0;
    animate(dragTarget, target, { type: "spring", stiffness: 280, damping: 26 });
    if (shouldOpen && !isOpen) onOpen();
    else if (!shouldOpen && isOpen) onClose();
    setGather(0);
  };

  return (
    <motion.div
      className="absolute left-0 top-1/2 z-[95] touch-none cursor-pointer flex items-center justify-center"
      style={{ width: 28, height: 120, y: "-50%" }}
      onPanStart={handlePanStart}
      onPan={handlePan}
      onPanEnd={handlePanEnd}
      onPointerEnter={() => setGather(1)}
      onPointerLeave={() => setGather(0)}
      onPointerDown={() => setGather(1)}
      onPointerUp={() => setGather(0)}
      onTap={() => {
        if (movedRef.current < TAP_SLOP) onTap();
      }}
    >
      <Breath orientation="vertical" gather={gather} length={96} thickness={14} />
    </motion.div>
  );
};
